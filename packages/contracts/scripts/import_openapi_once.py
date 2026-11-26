"""One-off importer (M0): turns the agreed api/openapi.v1.yaml into the Zod source in
packages/contracts/src. Kept for traceability only. After the import, the Zod files are the
source of truth and this script must not be run again (it would overwrite hand edits).

Usage: python3 -I scripts/import_openapi_once.py <openapi.yaml> <packages/contracts/src>
Needs: pyyaml.
"""
import json
import os
import re
import sys

import yaml

MONEY = {"type": "integer", "format": "int64", "minimum": 0, "description": "Amount in kobo (₦1 = 100 kobo)."}
IDENT = re.compile(r"^[A-Za-z_$][A-Za-z0-9_$]*$")


def ts_key(key):
    return key if IDENT.match(key) else json.dumps(key, ensure_ascii=False)


def ts_str(value):
    return json.dumps(value, ensure_ascii=False)


def meta(schema, skip=()):
    m = {}
    for key in ("description", "examples", "contentEncoding"):
        if key in schema and key not in skip:
            m[key] = schema[key]
    return m


def with_meta(code, m):
    if not m:
        return code
    parts = ", ".join(f"{ts_key(k)}: {json.dumps(v, ensure_ascii=False)}" for k, v in m.items())
    return f"{code}.meta({{ {parts} }})"


def zod(s, indent):
    pad = "  " * indent
    if "$ref" in s:
        assert len(s) == 1, s
        return s["$ref"].split("/")[-1] + "Schema"
    if "oneOf" in s:
        assert set(s) == {"oneOf"} and len(s["oneOf"]) == 2 and s["oneOf"][1] == {"type": "null"}, s
        return zod(s["oneOf"][0], indent) + ".nullable()"
    if s == MONEY:
        return "kobo"
    t = s.get("type")
    if t == "string":
        known = {"type", "format", "enum", "pattern", "minLength", "maxLength", "description", "examples", "contentEncoding"}
        assert set(s) <= known, s
        if "enum" in s:
            code = "z.enum([" + ", ".join(ts_str(v) for v in s["enum"]) + "])"
        else:
            code = {
                None: "z.string()",
                "uuid": "z.uuid()",
                "date-time": "z.iso.datetime()",
                "date": "z.iso.date()",
                "email": "z.email()",
            }[s.get("format")]
        if "pattern" in s:
            code += f".regex(new RegExp({ts_str(s['pattern'])}))"
        if "minLength" in s:
            code += f".min({s['minLength']})"
        if "maxLength" in s:
            code += f".max({s['maxLength']})"
        return with_meta(code, meta(s))
    if t == "integer":
        assert set(s) <= {"type", "format", "minimum", "maximum", "enum", "description"}, s
        if "enum" in s:
            return with_meta("z.literal([" + ", ".join(str(v) for v in s["enum"]) + "])", meta(s))
        code = "z.int()"
        if "minimum" in s:
            code += f".min({s['minimum']})"
        if "maximum" in s:
            code += f".max({s['maximum']})"
        m = meta(s)
        if "format" in s:
            m = {"format": s["format"], **m}
        return with_meta(code, m)
    if t == "number":
        assert set(s) <= {"type", "minimum", "maximum", "description"}, s
        code = "z.number()"
        if "minimum" in s:
            code += f".min({s['minimum']})"
        if "maximum" in s:
            code += f".max({s['maximum']})"
        return with_meta(code, meta(s))
    if t == "boolean":
        assert set(s) <= {"type", "description"}, s
        return with_meta("z.boolean()", meta(s))
    if t == "null":
        return "z.null()"
    if t == "array":
        assert set(s) <= {"type", "items", "maxItems", "minItems", "description"}, s
        code = f"z.array({zod(s['items'], indent)})"
        if "minItems" in s:
            code += f".min({s['minItems']})"
        if "maxItems" in s:
            code += f".max({s['maxItems']})"
        return with_meta(code, meta(s))
    if t == "object":
        assert set(s) <= {"type", "properties", "required", "additionalProperties", "description"}, s
        props = s.get("properties", {})
        required = s.get("required", [])
        assert required == [k for k in props if k in required], ("required order differs", s)
        if s.get("additionalProperties") is False:
            fn = "z.strictObject"
        else:
            assert "additionalProperties" not in s, s
            fn = "z.looseObject"
        if not props:
            return with_meta(f"{fn}({{}})", meta(s))
        lines = []
        for key, value in props.items():
            code = zod(value, indent + 1)
            if key not in required:
                code += ".optional()"
            lines.append(f"{pad}  {ts_key(key)}: {code},")
        return with_meta(f"{fn}({{\n" + "\n".join(lines) + f"\n{pad}}})", meta(s))
    raise AssertionError(f"unsupported schema: {s}")


def literal(value, indent, key=None):
    """TypeScript literal for a plain value; values under `schema`-like keys become Zod."""
    pad = "  " * indent
    if key in ("schema", "x-event-schema") and isinstance(value, dict):
        return zod(value, indent)
    if isinstance(value, dict):
        if not value:
            return "{}"
        items = [f"{pad}  {ts_key(k)}: {literal(v, indent + 1, k)}," for k, v in value.items()]
        return "{\n" + "\n".join(items) + f"\n{pad}}}"
    if isinstance(value, list):
        if not value:
            return "[]"
        if all(not isinstance(v, (dict, list)) for v in value):
            return "[" + ", ".join(literal(v, indent) for v in value) + "]"
        items = [f"{pad}  {literal(v, indent + 1)}," for v in value]
        return "[\n" + "\n".join(items) + f"\n{pad}]"
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, (int, float)):
        return str(value)
    return ts_str(value)


def refs_in(s, acc):
    if isinstance(s, dict):
        if "$ref" in s and s["$ref"].startswith("#/components/schemas/"):
            acc.add(s["$ref"].split("/")[-1])
        for v in s.values():
            refs_in(v, acc)
    elif isinstance(s, list):
        for v in s:
            refs_in(v, acc)
    return acc


def topo(schemas):
    order, done, active = [], set(), set()

    def visit(name):
        if name in done:
            return
        assert name not in active, f"cyclic schema reference at {name}"
        active.add(name)
        for dep in sorted(refs_in(schemas[name], set())):
            visit(dep)
        active.discard(name)
        done.add(name)
        order.append(name)

    for name in schemas:
        visit(name)
    return order


HEADER = "// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled\n// contract-change, approved by the frontend agent; breaking changes also need the lead.\n"


def slug(tag):
    return re.sub(r"[^a-z0-9]+", "-", tag.lower()).strip("-")


def camel(tag):
    words = re.findall(r"[A-Za-z0-9]+", tag)
    return words[0].lower() + "".join(w.capitalize() for w in words[1:])


def main(yaml_path, src):
    doc = yaml.safe_load(open(yaml_path, encoding="utf-8"))
    schemas = doc["components"]["schemas"]

    out = [HEADER, "import { z } from 'zod';\n", "import { named } from '../openapi/registry.ts';", "import { kobo } from './primitives.ts';\n"]
    for name in topo(schemas):
        out.append(f"export const {name}Schema = named('{name}', {zod(schemas[name], 0)});\n")
    os.makedirs(f"{src}/schemas", exist_ok=True)
    open(f"{src}/schemas/components.ts", "w", encoding="utf-8").write("\n".join(out))

    by_tag = {}
    for path, item in doc["paths"].items():
        for method, op in item.items():
            tag = op["tags"][0]
            by_tag.setdefault(tag, []).append((path, method, op))
    os.makedirs(f"{src}/operations", exist_ok=True)
    index = [HEADER, "import type { Operation } from '../openapi/operation.ts';"]
    exports = []
    for tag, ops in by_tag.items():
        used = sorted(refs_in([o for _, _, o in ops], set()))
        needs_z = "z." in "".join(literal(o, 1) for _, _, o in ops)
        lines = [HEADER]
        if needs_z:
            lines.append("import { z } from 'zod';\n")
        lines.append("import { defineOperation } from '../openapi/operation.ts';")
        if used:
            lines.append("import {\n" + "".join(f"  {u}Schema,\n" for u in used) + "} from '../schemas/components.ts';")
        if "kobo" in "".join(literal(o, 1) for _, _, o in ops):
            lines.append("import { kobo } from '../schemas/primitives.ts';")
        var = camel(tag) + "Operations"
        lines.append(f"\nexport const {var} = [")
        for path, method, op in ops:
            lines.append(f"  defineOperation({ts_str(method)}, {ts_str(path)}, {literal(op, 1)}),")
        lines.append("];\n")
        open(f"{src}/operations/{slug(tag)}.ts", "w", encoding="utf-8").write("\n".join(lines))
        index.append(f"import {{ {var} }} from './{slug(tag)}.ts';")
        exports.append(var)
    index.append("\n/** Every operation in the contract, grouped by tag. */")
    index.append("export const operations: readonly Operation[] = [\n" + "".join(f"  ...{e},\n" for e in exports) + "];\n")
    open(f"{src}/operations/index.ts", "w", encoding="utf-8").write("\n".join(index))

    comps = {k: v for k, v in doc["components"].items() if k != "schemas"}
    base = {k: v for k, v in doc.items() if k not in ("paths", "components")}
    used = sorted(refs_in(comps, set()))
    lines = [
        HEADER,
        "import { z } from 'zod';\n\nimport { ErrorSchema } from '../schemas/components.ts';\n" if used == ["Error"] else f"// refs: {used}\n",
        f"export const documentBase = {literal(base, 0)} as const;\n",
        f"export const sharedComponents = {literal(comps, 0)};\n",
    ]
    open(f"{src}/openapi/base.ts", "w", encoding="utf-8").write("\n".join(lines))
    print(f"schemas={len(schemas)} tags={len(by_tag)} operations={sum(len(v) for v in by_tag.values())}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

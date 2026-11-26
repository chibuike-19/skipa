"""Semantic diff of two OpenAPI YAML files (key order and formatting ignored; list order kept).

Usage: python3 -I scripts/contract_diff.py <base.yaml> <head.yaml>
Exit 0 when they mean the same, 1 when they differ (differences are printed), 2 on bad input.
Used by CI: a difference against main needs the `contract-change` label (brief §5).
Needs: pyyaml.
"""
import sys

import yaml


def diff(a, b, path, out):
    if type(a) is not type(b) and not (isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool)):
        out.append(f"{path}: {a!r} -> {b!r}")
    elif isinstance(a, dict):
        for key in a.keys() | b.keys():
            if key not in b:
                out.append(f"{path}/{key}: removed")
            elif key not in a:
                out.append(f"{path}/{key}: added")
            else:
                diff(a[key], b[key], f"{path}/{key}", out)
    elif isinstance(a, list):
        if len(a) != len(b):
            out.append(f"{path}: list length {len(a)} -> {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            diff(x, y, f"{path}[{i}]", out)
    elif a != b:
        out.append(f"{path}: {a!r} -> {b!r}")


def main(base, head):
    try:
        a = yaml.safe_load(open(base, encoding="utf-8"))
        b = yaml.safe_load(open(head, encoding="utf-8"))
    except (OSError, yaml.YAMLError) as error:
        print(f"cannot read: {error}", file=sys.stderr)
        return 2
    out = []
    diff(a, b, "", out)
    for line in sorted(out):
        print(line)
    print(f"{len(out)} difference(s)" if out else "no semantic differences")
    return 1 if out else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))

// Zod → JSON Schema for the OpenAPI 3.1 contract. Deliberately covers only the constructs the
// contract uses, and fails loudly on anything else, so the generated file stays exactly what the
// Zod source says (Zod's own toJSONSchema adds patterns and integer bounds the contract does not have).
import { z } from 'zod';

import { nameOf } from './registry.ts';

export type JsonSchema = Record<string, unknown>;

interface Def {
  type: string;
  format?: string;
  checks?: { _zod: { def: Record<string, unknown> } }[];
  values?: unknown[];
  entries?: Record<string, string | number>;
  shape?: Record<string, z.ZodType>;
  catchall?: z.ZodType;
  element?: z.ZodType;
  innerType?: z.ZodType;
}

const defOf = (schema: z.ZodType) => (schema as unknown as { _zod: { def: Def } })._zod.def;

const STRING_FORMATS: Record<string, string> = {
  uuid: 'uuid',
  datetime: 'date-time',
  date: 'date',
  email: 'email',
};

/** Emit a schema; named schemas become $refs unless `inline` (used for the component itself). */
export function emitSchema(schema: z.ZodType, inline = false): JsonSchema {
  const name = nameOf(schema);
  if (name !== undefined && !inline) return { $ref: `#/components/schemas/${name}` };

  const def = defOf(schema);
  const meta = (z.globalRegistry.get(schema) ?? {}) as Record<string, unknown>;
  const out: JsonSchema = {};

  switch (def.type) {
    case 'optional':
      if (!def.innerType) throw new Error('optional without inner type');
      return emitSchema(def.innerType);
    case 'nullable':
      if (!def.innerType) throw new Error('nullable without inner type');
      return withMeta({ oneOf: [emitSchema(def.innerType), { type: 'null' }] }, meta);
    case 'string': {
      out.type = 'string';
      if (def.format !== undefined) {
        const format = STRING_FORMATS[def.format];
        if (format === undefined) throw new Error(`unsupported string format: ${def.format}`);
        out.format = format;
      }
      for (const check of def.checks ?? []) {
        const c = check._zod.def;
        if (c.check === 'string_format' && c.format === 'regex')
          out.pattern = (c.pattern as RegExp).source;
        else if (c.check === 'min_length') out.minLength = c.minimum;
        else if (c.check === 'max_length') out.maxLength = c.maximum;
        else throw new Error(`unsupported string check: ${String(c.check)}`);
      }
      break;
    }
    case 'number': {
      out.type = def.format === 'safeint' ? 'integer' : 'number';
      for (const check of def.checks ?? []) {
        const c = check._zod.def;
        if (c.check === 'greater_than' && c.inclusive === true) out.minimum = c.value;
        else if (c.check === 'less_than' && c.inclusive === true) out.maximum = c.value;
        else throw new Error(`unsupported number check: ${String(c.check)}`);
      }
      break;
    }
    case 'boolean':
      out.type = 'boolean';
      break;
    case 'null':
      out.type = 'null';
      break;
    case 'enum':
      out.type = 'string';
      out.enum = Object.values(def.entries ?? {});
      break;
    case 'literal': {
      const values = def.values ?? [];
      if (values.every((v) => Number.isInteger(v))) out.type = 'integer';
      else if (values.every((v) => typeof v === 'string')) out.type = 'string';
      else throw new Error('literal values must be all integers or all strings');
      out.enum = values;
      break;
    }
    case 'array': {
      if (!def.element) throw new Error('array without element');
      out.type = 'array';
      out.items = emitSchema(def.element);
      for (const check of def.checks ?? []) {
        const c = check._zod.def;
        if (c.check === 'max_length') out.maxItems = c.maximum;
        else if (c.check === 'min_length') out.minItems = c.minimum;
        else throw new Error(`unsupported array check: ${String(c.check)}`);
      }
      break;
    }
    case 'object': {
      out.type = 'object';
      const catchall = def.catchall ? defOf(def.catchall).type : undefined;
      if (catchall === 'never') out.additionalProperties = false;
      else if (catchall !== 'unknown')
        throw new Error('objects must be z.strictObject or z.looseObject');
      const shape = def.shape ?? {};
      const keys = Object.keys(shape);
      if (keys.length > 0) {
        const properties: Record<string, JsonSchema> = {};
        const required: string[] = [];
        for (const key of keys) {
          const property = shape[key] as z.ZodType;
          properties[key] = emitSchema(property);
          if (defOf(property).type !== 'optional') required.push(key);
        }
        out.properties = properties;
        if (required.length > 0) out.required = required;
      }
      break;
    }
    default:
      throw new Error(`unsupported zod type in contract: ${def.type}`);
  }
  return withMeta(out, meta);
}

function withMeta(out: JsonSchema, meta: Record<string, unknown>): JsonSchema {
  for (const key of ['format', 'description', 'examples', 'contentEncoding'] as const) {
    if (meta[key] !== undefined) out[key] = meta[key];
  }
  return out;
}

/** Replace every Zod schema found anywhere in a plain object tree with its JSON Schema. */
export function emitTree(value: unknown): unknown {
  if (value instanceof z.ZodType) return emitSchema(value);
  if (Array.isArray(value)) return value.map(emitTree);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, emitTree(v)]));
  }
  return value;
}

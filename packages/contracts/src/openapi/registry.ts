// Named schemas become `#/components/schemas/<Name>` in the generated contract.
import type { z } from 'zod';

const names = new WeakMap<z.ZodType, string>();
const ordered: { name: string; schema: z.ZodType }[] = [];

export function named<T extends z.ZodType>(name: string, schema: T): T {
  if (ordered.some((s) => s.name === name)) throw new Error(`schema name used twice: ${name}`);
  names.set(schema, name);
  ordered.push({ name, schema });
  return schema;
}

export function nameOf(schema: z.ZodType): string | undefined {
  return names.get(schema);
}

/** Every named schema, in declaration order. */
export function namedSchemas(): readonly { name: string; schema: z.ZodType }[] {
  return ordered;
}

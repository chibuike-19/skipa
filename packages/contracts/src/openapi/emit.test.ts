import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { kobo } from '../schemas/primitives.ts';
import { emitSchema } from './emit.ts';
import { named } from './registry.ts';

describe('emitSchema()', () => {
  it('emits the contract subset exactly, with no extra keywords', () => {
    expect(emitSchema(z.uuid())).toEqual({ type: 'string', format: 'uuid' });
    expect(emitSchema(z.iso.datetime())).toEqual({ type: 'string', format: 'date-time' });
    expect(emitSchema(z.int())).toEqual({ type: 'integer' });
    expect(emitSchema(z.int().min(1).max(5))).toEqual({ type: 'integer', minimum: 1, maximum: 5 });
    expect(emitSchema(kobo)).toEqual({
      type: 'integer',
      format: 'int64',
      minimum: 0,
      description: 'Amount in kobo (₦1 = 100 kobo).',
    });
    expect(
      emitSchema(
        z
          .string()
          .regex(/^QR-[A-Z]+$/)
          .max(9),
      ),
    ).toEqual({ type: 'string', pattern: '^QR-[A-Z]+$', maxLength: 9 });
    expect(emitSchema(z.literal([1, 2, 5]))).toEqual({ type: 'integer', enum: [1, 2, 5] });
    expect(emitSchema(z.enum(['a', 'b']))).toEqual({ type: 'string', enum: ['a', 'b'] });
    expect(emitSchema(z.array(z.boolean()).max(3))).toEqual({
      type: 'array',
      items: { type: 'boolean' },
      maxItems: 3,
    });
  });

  it('nullable → oneOf [X, null]; optional → not required', () => {
    expect(emitSchema(z.strictObject({ a: z.string().nullable(), b: z.int().optional() }))).toEqual(
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          a: { oneOf: [{ type: 'string' }, { type: 'null' }] },
          b: { type: 'integer' },
        },
        required: ['a'],
      },
    );
  });

  it('strict objects forbid extra properties; loose objects are free-form', () => {
    expect(emitSchema(z.strictObject({}))).toEqual({ type: 'object', additionalProperties: false });
    expect(emitSchema(z.looseObject({}))).toEqual({ type: 'object' });
  });

  it('named schemas become $refs everywhere except their own definition', () => {
    const Thing = named('EmitTestThing', z.strictObject({ id: z.uuid() }));
    expect(emitSchema(z.array(Thing))).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/EmitTestThing' },
    });
    expect(emitSchema(Thing.nullable())).toEqual({
      oneOf: [{ $ref: '#/components/schemas/EmitTestThing' }, { type: 'null' }],
    });
    expect(emitSchema(Thing, true)).toMatchObject({ type: 'object' });
    expect(() => named('EmitTestThing', z.string())).toThrow(/used twice/);
  });

  it('fails loudly on anything the contract subset does not cover', () => {
    expect(() => emitSchema(z.object({}))).toThrow(/strictObject or z.looseObject/);
    expect(() => emitSchema(z.url())).toThrow(/unsupported string format/);
    expect(() => emitSchema(z.record(z.string(), z.string()))).toThrow(/unsupported zod type/);
    expect(() => emitSchema(z.int().positive())).toThrow(/unsupported number check/);
  });
});

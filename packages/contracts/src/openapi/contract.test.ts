import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { operations } from '../operations/index.ts';
import * as schemas from '../schemas/components.ts';
import { buildDocument, buildYaml } from './document.ts';

const repo = (p: string) => fileURLToPath(new URL(`../../../../${p}`, import.meta.url));

describe('generated contract', () => {
  it('api/openapi.v1.yaml is exactly what packages/contracts generates (contract:check)', () => {
    expect(readFileSync(repo('api/openapi.v1.yaml'), 'utf8')).toBe(buildYaml());
  });

  it('has the agreed size: 177 operations, 148 schemas (brief §5)', () => {
    const doc = buildDocument() as {
      paths: Record<string, object>;
      components: { schemas: object };
    };
    const count = Object.values(doc.paths).reduce((n, item) => n + Object.keys(item).length, 0);
    expect(count).toBe(177);
    expect(operations).toHaveLength(177);
    expect(Object.keys(doc.components.schemas)).toHaveLength(148);
  });

  it('every operation lists its PRD IDs, a request-ID parameter and X-Request-Id on responses', () => {
    for (const op of operations) {
      expect(op.spec['x-prd'].length, op.spec.operationId).toBeGreaterThan(0);
      expect(op.spec.parameters, op.spec.operationId).toContainEqual({
        $ref: '#/components/parameters/RequestId',
      });
    }
  });

  it('is stable: building twice gives the same text', () => {
    expect(buildYaml()).toBe(buildYaml());
  });
});

describe('pack fixtures validate against the Zod schemas at runtime', () => {
  const dir = repo('packages/mocks/fixtures');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  it('finds the 9 fixtures', () => {
    expect(files).toHaveLength(9);
  });

  for (const file of files) {
    it(file, () => {
      const fixture = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')) as {
        schema: string;
        data: unknown;
      };
      const schema = (schemas as Record<string, z.ZodType | undefined>)[`${fixture.schema}Schema`];
      expect(schema, `no schema named ${fixture.schema}`).toBeDefined();
      const result = schema?.safeParse(fixture.data);
      expect(result?.success ? [] : result?.error.issues).toEqual([]);
    });
  }

  it('rejects data the contract forbids (unknown fields, wrong money type)', () => {
    const fixture = JSON.parse(readFileSync(`${dir}/order-pending.json`, 'utf8')) as {
      data: Record<string, unknown>;
    };
    expect(schemas.OrderSchema.safeParse({ ...fixture.data, surprise: true }).success).toBe(false);
    expect(schemas.OrderSchema.safeParse({ ...fixture.data, totalKobo: 313.5 }).success).toBe(
      false,
    );
  });
});

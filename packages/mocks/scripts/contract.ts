// Node-only helpers over api/openapi.v1.yaml: load it, list its operations, and validate payloads
// against its schemas with Ajv (JSON Schema 2020-12, as OpenAPI 3.1 uses). Never imported by the
// browser bundle; the browser only sees src/generated/operations.ts.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@readme/openapi-parser';
import { Ajv2020, type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';

export const CONTRACT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'api',
  'openapi.v1.yaml',
);

const CONTRACT_ID = 'https://contract.skipa.invalid/openapi.v1.json';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
export type Method = (typeof METHODS)[number];

interface MediaType {
  schema?: unknown;
}
interface ResponseObject {
  $ref?: string;
  content?: Record<string, MediaType>;
}
interface OperationObject {
  operationId: string;
  tags?: string[];
  parameters?: { $ref?: string; name?: string; in?: string; required?: boolean }[];
  requestBody?: { content?: Record<string, MediaType> };
  responses: Record<string, ResponseObject>;
}
export interface Spec {
  paths: Record<string, Partial<Record<Method, OperationObject>>>;
  components: {
    schemas: Record<string, unknown>;
    responses: Record<string, ResponseObject>;
    parameters: Record<string, { name: string; in: string; required?: boolean }>;
  };
}

export interface OperationInfo {
  operationId: string;
  method: Method;
  path: string;
  tag: string;
  /** Response status codes the contract documents, as strings ("200", "304", …). */
  statuses: string[];
  requiresIdempotencyKey: boolean;
}

export async function loadSpec(path = CONTRACT_PATH): Promise<Spec> {
  // parse() reads YAML and resolves nothing, so $refs stay local and Ajv resolves them.
  return (await parse(path)) as unknown as Spec;
}

export function listOperations(spec: Spec): OperationInfo[] {
  const out: OperationInfo[] = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of METHODS) {
      const op = item[method];
      if (op === undefined) continue;
      const params = (op.parameters ?? []).map((p) =>
        p.$ref === undefined ? p : spec.components.parameters[p.$ref.split('/').pop() ?? ''],
      );
      out.push({
        operationId: op.operationId,
        method,
        path,
        tag: op.tags?.[0] ?? 'Untagged',
        statuses: Object.keys(op.responses).sort(),
        requiresIdempotencyKey: params.some(
          (p) => p?.name === 'Idempotency-Key' && p.required === true,
        ),
      });
    }
  }
  return out.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

export interface ContractValidator {
  operations: OperationInfo[];
  /** Validate a JSON response body; returns error strings (empty = valid). */
  response(operationId: string, status: number, body: unknown): string[];
  /** Validate a JSON request body against the operation's requestBody schema. */
  request(operationId: string, body: unknown): string[];
  /** Validate a value against a named components schema. */
  schema(name: string, value: unknown): string[];
  /** The response content types the contract documents for a status ([] = no body). */
  responseContentTypes(operationId: string, status: number): string[];
}

const fmt = (errors: ErrorObject[] | null | undefined): string[] =>
  (errors ?? []).slice(0, 8).map((e) => `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim());

export async function createValidator(spec?: Spec): Promise<ContractValidator> {
  const doc = spec ?? (await loadSpec());
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  // ajv-formats ships CommonJS; its default export is the plugin function.
  const addFormats = addFormatsModule as unknown as (a: Ajv2020) => void;
  addFormats(ajv);
  ajv.addFormat('int32', {
    type: 'number',
    validate: (n: number) => Number.isInteger(n) && Math.abs(n) <= 2 ** 31,
  });
  ajv.addFormat('int64', { type: 'number', validate: (n: number) => Number.isSafeInteger(n) });
  ajv.addSchema({ ...doc, $id: CONTRACT_ID });

  const byId = new Map<string, { op: OperationObject; info: OperationInfo }>();
  const operations = listOperations(doc);
  for (const info of operations) {
    const op = doc.paths[info.path]?.[info.method];
    if (op !== undefined) byId.set(info.operationId, { op, info });
  }
  const cache = new Map<string, ValidateFunction>();
  const compile = (pointer: string): ValidateFunction => {
    let fn = cache.get(pointer);
    if (fn === undefined) {
      fn = ajv.compile({ $ref: `${CONTRACT_ID}#${pointer}` });
      cache.set(pointer, fn);
    }
    return fn;
  };
  const esc = (s: string) => s.replace(/~/g, '~0').replace(/\//g, '~1');
  const responseObject = (
    operationId: string,
    status: number,
  ): { pointer: string; obj: ResponseObject } | undefined => {
    const entry = byId.get(operationId);
    const obj = entry?.op.responses[String(status)];
    if (entry === undefined || obj === undefined) return undefined;
    if (obj.$ref !== undefined) {
      const name = obj.$ref.split('/').pop() ?? '';
      const resolved = doc.components.responses[name];
      return resolved === undefined
        ? undefined
        : { pointer: `/components/responses/${esc(name)}`, obj: resolved };
    }
    return {
      pointer: `/paths/${esc(entry.info.path)}/${entry.info.method}/responses/${status}`,
      obj,
    };
  };

  return {
    operations,
    responseContentTypes(operationId, status) {
      return Object.keys(responseObject(operationId, status)?.obj.content ?? {});
    },
    response(operationId, status, body) {
      const entry = byId.get(operationId);
      if (entry === undefined) return [`unknown operation ${operationId}`];
      const found = responseObject(operationId, status);
      if (found === undefined)
        return [
          `status ${status} is not documented for ${operationId} (${entry.info.statuses.join(', ')})`,
        ];
      if (found.obj.content?.['application/json'] === undefined) {
        return body === undefined
          ? []
          : [`status ${status} of ${operationId} has no JSON body in the contract`];
      }
      const fn = compile(`${found.pointer}/content/application~1json/schema`);
      return fn(body) ? [] : fmt(fn.errors);
    },
    request(operationId, body) {
      const entry = byId.get(operationId);
      if (entry === undefined) return [`unknown operation ${operationId}`];
      if (entry.op.requestBody?.content?.['application/json'] === undefined) {
        return body === undefined ? [] : [`${operationId} takes no JSON body`];
      }
      const fn = compile(
        `/paths/${esc(entry.info.path)}/${entry.info.method}/requestBody/content/application~1json/schema`,
      );
      return fn(body) ? [] : fmt(fn.errors);
    },
    schema(name, value) {
      if (!(name in doc.components.schemas)) return [`unknown schema ${name}`];
      const fn = compile(`/components/schemas/${esc(name)}`);
      return fn(value) ? [] : fmt(fn.errors);
    },
  };
}

/** The TypeScript source of src/generated/operations.ts for the given operations. */
export function renderOperationsModule(operations: OperationInfo[]): string {
  const rows = operations
    .map(
      (o) =>
        `  ${o.operationId}: { method: '${o.method}', path: '${o.path}', tag: '${o.tag}', statuses: [${o.statuses
          .map((s) => `'${s}'`)
          .join(', ')}], idempotent: ${String(o.requiresIdempotencyKey)} },`,
    )
    .join('\n');
  const tags = [...new Set(operations.map((o) => o.tag))].sort();
  return `// Generated from api/openapi.v1.yaml by \`pnpm --filter @skipa/mocks mocks:gen\`. Do not edit.
// A test fails when this file and the contract disagree.

export const OPERATIONS = {
${rows}
} as const;

export type OperationId = keyof typeof OPERATIONS;

export const TAGS = [
${tags.map((t) => `  '${t}',`).join('\n')}
] as const;

export type Tag = (typeof TAGS)[number];
`;
}

// One API operation: method, path and its OpenAPI operation object, with Zod schemas wherever the
// contract has a schema. Routes in apps/api import these, so validation and the contract are the
// same objects.
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface OperationSpec {
  operationId: string;
  tags: readonly string[];
  summary: string;
  description: string;
  'x-prd': readonly string[];
  security: readonly Record<string, readonly string[]>[];
  parameters: readonly unknown[];
  requestBody?: unknown;
  responses: Record<string, unknown>;
}

export interface Operation {
  method: HttpMethod;
  path: string;
  spec: OperationSpec;
}

export function defineOperation(method: HttpMethod, path: string, spec: OperationSpec): Operation {
  return { method, path, spec };
}

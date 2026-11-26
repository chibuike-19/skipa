// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  DataRequestSchema,
  ExportSchema,
  ExportCreateSchema,
  PageAdminAccessEntrySchema,
  PageAuditEntrySchema,
} from '../schemas/components.ts';

export const storeDataOperations = [
  defineOperation('post', '/v1/store/exports', {
    operationId: 'createExport',
    tags: ['Store · Data'],
    summary: 'CSV/Excel export (async, logged)',
    description: 'PRD: SD-05. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-05'],
    security: [
      {
        bearer: [],
      },
      {
        cookie: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: ExportCreateSchema,
        },
      },
    },
    responses: {
      '202': {
        description: 'Accepted',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
        },
        content: {
          'application/json': {
            schema: ExportSchema,
          },
        },
      },
      '400': {
        $ref: '#/components/responses/E400',
      },
      '401': {
        $ref: '#/components/responses/E401',
      },
      '403': {
        $ref: '#/components/responses/E403',
      },
      '409': {
        $ref: '#/components/responses/E409',
      },
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
  defineOperation('get', '/v1/store/exports/{exportId}', {
    operationId: 'getExport',
    tags: ['Store · Data'],
    summary: 'Export status and download link',
    description: 'PRD: SD-05. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-05'],
    security: [
      {
        bearer: [],
      },
      {
        cookie: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'exportId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    responses: {
      '200': {
        description: 'OK',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
        },
        content: {
          'application/json': {
            schema: ExportSchema,
          },
        },
      },
      '401': {
        $ref: '#/components/responses/E401',
      },
      '403': {
        $ref: '#/components/responses/E403',
      },
      '404': {
        $ref: '#/components/responses/E404',
      },
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
  defineOperation('get', '/v1/store/audit-log', {
    operationId: 'getStoreAuditLog',
    tags: ['Store · Data'],
    summary: 'Read-only store audit log (head office)',
    description: 'PRD: RB-07, SD-20. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['RB-07', 'SD-20'],
    security: [
      {
        bearer: [],
      },
      {
        cookie: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'action',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: z.string(),
      },
    ],
    responses: {
      '200': {
        description: 'OK',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
        },
        content: {
          'application/json': {
            schema: PageAuditEntrySchema,
          },
        },
      },
      '400': {
        $ref: '#/components/responses/E400',
      },
      '401': {
        $ref: '#/components/responses/E401',
      },
      '403': {
        $ref: '#/components/responses/E403',
      },
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
  defineOperation('get', '/v1/store/admin-access-log', {
    operationId: 'getAdminAccessLog',
    tags: ['Store · Data'],
    summary: 'Super admin views of this store’s personal data',
    description: 'PRD: RB-05, RB-07. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['RB-05', 'RB-07'],
    security: [
      {
        bearer: [],
      },
      {
        cookie: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: z.string(),
      },
    ],
    responses: {
      '200': {
        description: 'OK',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
        },
        content: {
          'application/json': {
            schema: PageAdminAccessEntrySchema,
          },
        },
      },
      '400': {
        $ref: '#/components/responses/E400',
      },
      '401': {
        $ref: '#/components/responses/E401',
      },
      '403': {
        $ref: '#/components/responses/E403',
      },
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
  defineOperation('get', '/v1/store/data-requests', {
    operationId: 'listStoreDataRequests',
    tags: ['Store · Data'],
    summary: 'Shopper data requests for this store',
    description: 'PRD: NF-16. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['NF-16'],
    security: [
      {
        bearer: [],
      },
      {
        cookie: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
    ],
    responses: {
      '200': {
        description: 'OK',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
        },
        content: {
          'application/json': {
            schema: z.array(DataRequestSchema),
          },
        },
      },
      '401': {
        $ref: '#/components/responses/E401',
      },
      '403': {
        $ref: '#/components/responses/E403',
      },
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
];

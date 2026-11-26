// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  PageReconItemSchema,
  PayoutReportSchema,
  PosFileSchema,
  PosHealthSchema,
  ReconDaySchema,
  ReconItemSchema,
  ReconResolveSchema,
  ShiftCloseSchema,
} from '../schemas/components.ts';

export const storeReconciliationOperations = [
  defineOperation('get', '/v1/store/reconciliation/days', {
    operationId: 'listReconDays',
    tags: ['Store · Reconciliation'],
    summary: 'Daily three-way match',
    description: 'PRD: PO-07. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-07'],
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
        name: 'branchId',
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
            schema: z.array(ReconDaySchema),
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
  defineOperation('get', '/v1/store/reconciliation/items', {
    operationId: 'listReconItems',
    tags: ['Store · Reconciliation'],
    summary: 'Unmatched items with cause',
    description: 'PRD: PO-07. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-07'],
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
        name: 'date',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'status',
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
            schema: PageReconItemSchema,
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
  defineOperation('post', '/v1/store/reconciliation/items/{itemId}/resolve', {
    operationId: 'resolveReconItem',
    tags: ['Store · Reconciliation'],
    summary: 'Resolve manually with a reason (logged)',
    description: 'PRD: 12.4, RB-04. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['12.4', 'RB-04'],
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
        name: 'itemId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: ReconResolveSchema,
        },
      },
    },
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
            schema: ReconItemSchema,
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
      '404': {
        $ref: '#/components/responses/E404',
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
  defineOperation('post', '/v1/store/reconciliation/items/{itemId}/retry', {
    operationId: 'retryPosting',
    tags: ['Store · Reconciliation'],
    summary: 'Retry a failed POS posting now',
    description: 'PRD: PO-05. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-05'],
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
        name: 'itemId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    responses: {
      '202': {
        description: 'Accepted',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
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
  defineOperation('get', '/v1/store/payouts/{date}', {
    operationId: 'getPayoutReport',
    tags: ['Store · Reconciliation'],
    summary: 'Payout report: sales, Paystack fees, Skipa fee, chargebacks, payout',
    description: 'PRD: PO-08, PY-13. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-08', 'PY-13'],
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
        name: 'date',
        in: 'path',
        required: true,
        schema: z.iso.date(),
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
            schema: PayoutReportSchema,
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
  defineOperation('get', '/v1/store/shift-close/{date}', {
    operationId: 'getShiftClose',
    tags: ['Store · Reconciliation'],
    summary: 'Skipa till shift-close report',
    description: 'PRD: PO-06. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-06'],
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
        name: 'date',
        in: 'path',
        required: true,
        schema: z.iso.date(),
      },
      {
        name: 'branchId',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'required',
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
            schema: ShiftCloseSchema,
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
  defineOperation('get', '/v1/store/pos/health', {
    operationId: 'getPosHealth',
    tags: ['Store · Reconciliation'],
    summary: 'POS integration health',
    description: 'PRD: PO-09. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-09'],
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
            schema: PosHealthSchema,
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
  defineOperation('get', '/v1/store/pos/files', {
    operationId: 'listPosFiles',
    tags: ['Store · Reconciliation'],
    summary: 'File-mode files to download/upload',
    description: 'PRD: 12.1. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['12.1'],
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
            schema: z.array(PosFileSchema),
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
  defineOperation('post', '/v1/store/pos/files', {
    operationId: 'uploadPosFile',
    tags: ['Store · Reconciliation'],
    summary: 'Upload a product file (file mode)',
    description: 'PRD: 12.1, PO-02. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['12.1', 'PO-02'],
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
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: z.strictObject({
            file: z.string().meta({ contentEncoding: 'binary' }),
            kind: z.string().optional(),
          }),
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
            schema: PosFileSchema,
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
  defineOperation('post', '/v1/store/pos/files/{fileId}/confirm', {
    operationId: 'confirmPosFile',
    tags: ['Store · Reconciliation'],
    summary: 'Confirm a sales file was imported into the POS',
    description: 'PRD: PO-03. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PO-03'],
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
        name: 'fileId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    responses: {
      '204': {
        description: 'No content',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
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
];

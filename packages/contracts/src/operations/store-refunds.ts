// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  PageDisputeSchema,
  PageRefundSchema,
  RefundSchema,
  RefundDecisionSchema,
  RefundDeclineSchema,
  RefundPaymentRecordSchema,
  StoreRefundCreateSchema,
} from '../schemas/components.ts';

export const storeRefundsOperations = [
  defineOperation('get', '/v1/store/refunds', {
    operationId: 'listRefunds',
    tags: ['Store · Refunds'],
    summary: 'Refunds to decide, record, or waiting for head office',
    description: 'PRD: PY-07, PY-08. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PY-07', 'PY-08'],
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
        name: 'status',
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
            schema: PageRefundSchema,
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
  defineOperation('post', '/v1/store/refunds', {
    operationId: 'createStoreRefund',
    tags: ['Store · Refunds'],
    summary: 'Store-initiated whole-order refund (e.g. from a ticket)',
    description: 'PRD: PY-07, HP-11. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PY-07', 'HP-11'],
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
          schema: StoreRefundCreateSchema,
        },
      },
    },
    responses: {
      '201': {
        description: 'Created',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
        },
        content: {
          'application/json': {
            schema: RefundSchema,
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
  defineOperation('post', '/v1/store/refunds/{refundId}/approve', {
    operationId: 'approveRefund',
    tags: ['Store · Refunds'],
    summary: 'Approve (head office required above threshold)',
    description:
      'PRD: PY-07, PY-08, RB-04. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PY-07', 'PY-08', 'RB-04'],
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
        name: 'refundId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: RefundDecisionSchema,
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
            schema: RefundSchema,
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
  defineOperation('post', '/v1/store/refunds/{refundId}/decline', {
    operationId: 'declineRefund',
    tags: ['Store · Refunds'],
    summary: 'Decline with a reason',
    description: 'PRD: PY-07, RB-04. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PY-07', 'RB-04'],
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
        name: 'refundId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: RefundDeclineSchema,
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
            schema: RefundSchema,
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
  defineOperation('post', '/v1/store/refunds/{refundId}/payment', {
    operationId: 'recordRefundPayment',
    tags: ['Store · Refunds'],
    summary: 'Record that the store paid the shopper outside Skipa (method, date, reference)',
    description:
      'PRD: PY-07, PY-10, ST-06, RB-04. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PY-07', 'PY-10', 'ST-06', 'RB-04'],
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
        name: 'refundId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: RefundPaymentRecordSchema,
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
            schema: RefundSchema,
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
  defineOperation('get', '/v1/store/disputes', {
    operationId: 'listStoreDisputes',
    tags: ['Store · Refunds'],
    summary: 'Chargebacks and their deadlines',
    description: 'PRD: PY-09. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['PY-09'],
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
            schema: PageDisputeSchema,
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
];

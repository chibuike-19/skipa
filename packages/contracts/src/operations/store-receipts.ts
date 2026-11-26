// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { PageReceiptListItemSchema, ReceiptTraceSchema } from '../schemas/components.ts';

export const storeReceiptsOperations = [
  defineOperation('get', '/v1/store/receipts', {
    operationId: 'listReceipts',
    tags: ['Store · Receipts'],
    summary: 'Receipts, searchable and filterable',
    description: 'PRD: SD-05, 10.1. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-05', '10.1'],
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
        name: 'branchId',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'date',
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'date',
      },
      {
        name: 'q',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Receipt number or last 4 of phone',
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'channel',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'minKobo',
        in: 'query',
        required: false,
        schema: z.int(),
      },
      {
        name: 'maxKobo',
        in: 'query',
        required: false,
        schema: z.int(),
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: z.int(),
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
            schema: PageReceiptListItemSchema,
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
  defineOperation('get', '/v1/store/receipts/{receiptId}', {
    operationId: 'getReceiptTrace',
    tags: ['Store · Receipts'],
    summary: 'Receipt detail: items, payment, exit check, refund/dispute, timeline',
    description: 'PRD: SD-02, CS-01. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-02', 'CS-01'],
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
        name: 'receiptId',
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
            schema: ReceiptTraceSchema,
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
];

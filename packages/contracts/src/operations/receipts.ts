// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  EmailReceiptSchema,
  PageReceiptListItemSchema,
  RatingSchema,
  ReceiptSchema,
} from '../schemas/components.ts';

export const receiptsOperations = [
  defineOperation('get', '/v1/receipts/{receiptId}', {
    operationId: 'getReceipt',
    tags: ['Receipts'],
    summary: 'Receipt with exit QR status',
    description: 'PRD: SH-20, SH-23, PY-06. Auth: guest device token or shopper session.',
    'x-prd': ['SH-20', 'SH-23', 'PY-06'],
    security: [
      {
        deviceToken: [],
      },
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
            schema: ReceiptSchema,
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
  defineOperation('get', '/v1/me/receipts', {
    operationId: 'listMyReceipts',
    tags: ['Receipts'],
    summary: 'Receipts across stores (registered) or on this device (guest)',
    description: 'PRD: SH-21, SH-30. Auth: guest device token or shopper session.',
    'x-prd': ['SH-21', 'SH-30'],
    security: [
      {
        deviceToken: [],
      },
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
        name: 'organisationId',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Filter by store',
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
  defineOperation('post', '/v1/receipts/{receiptId}/email', {
    operationId: 'emailReceipt',
    tags: ['Receipts'],
    summary: 'Email this receipt (app + email; no SMS)',
    description: 'PRD: SH-21, NT-06. Auth: guest device token or shopper session.',
    'x-prd': ['SH-21', 'NT-06'],
    security: [
      {
        deviceToken: [],
      },
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
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: EmailReceiptSchema,
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
  defineOperation('post', '/v1/receipts/{receiptId}/rating', {
    operationId: 'rateVisit',
    tags: ['Receipts'],
    summary: '1–5 rating after exit',
    description: 'PRD: SH-24. Auth: guest device token or shopper session.',
    'x-prd': ['SH-24'],
    security: [
      {
        deviceToken: [],
      },
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
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: RatingSchema,
        },
      },
    },
    responses: {
      '204': {
        description: 'No content',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
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
];

// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { RefundSchema, RefundRequestSchema } from '../schemas/components.ts';

export const refundsOperations = [
  defineOperation('post', '/v1/receipts/{receiptId}/refund-requests', {
    operationId: 'requestRefund',
    tags: ['Refunds'],
    summary: 'Request a whole-order refund (paid by the store outside Skipa)',
    description: 'PRD: SH-22, SH-32, PY-07, NT-02. Auth: guest device token or shopper session.',
    'x-prd': ['SH-22', 'SH-32', 'PY-07', 'NT-02'],
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
          schema: RefundRequestSchema,
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
  defineOperation('get', '/v1/me/refunds/{refundId}', {
    operationId: 'getMyRefund',
    tags: ['Refunds'],
    summary: 'Refund status',
    description: 'PRD: SH-32. Auth: guest device token or shopper session.',
    'x-prd': ['SH-32'],
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
        name: 'refundId',
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
            schema: RefundSchema,
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

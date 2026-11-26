// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  CreateOrderSchema,
  OrderSchema,
  PaymentAttemptSchema,
  StartPaymentSchema,
} from '../schemas/components.ts';

export const paymentsOperations = [
  defineOperation('post', '/v1/orders', {
    operationId: 'createOrder',
    tags: ['Payments'],
    summary: 'Create an order from the cart (prices re-checked; 409 PRICE_CHANGED)',
    description: 'PRD: PY-01, SH-16, CS-01, CS-03. Auth: guest device token or shopper session.',
    'x-prd': ['PY-01', 'SH-16', 'CS-01', 'CS-03'],
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
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: CreateOrderSchema,
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
            schema: OrderSchema,
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
  defineOperation('get', '/v1/orders/{orderId}', {
    operationId: 'getOrder',
    tags: ['Payments'],
    summary: 'Order with server-confirmed status (polling fallback for the pending screen)',
    description: 'PRD: SH-18, SH-19, HP-04. Auth: guest device token or shopper session.',
    'x-prd': ['SH-18', 'SH-19', 'HP-04'],
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
        name: 'orderId',
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
            schema: OrderSchema,
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
  defineOperation('post', '/v1/orders/{orderId}/payment-attempts', {
    operationId: 'startPayment',
    tags: ['Payments'],
    summary: 'Initialise a Paystack transaction on the store subaccount',
    description: 'PRD: SH-17, PY-01, PY-12. Auth: guest device token or shopper session.',
    'x-prd': ['SH-17', 'PY-01', 'PY-12'],
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
        name: 'orderId',
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
          schema: StartPaymentSchema,
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
            schema: PaymentAttemptSchema,
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
  defineOperation('post', '/v1/orders/{orderId}/verify', {
    operationId: 'nudgeVerify',
    tags: ['Payments'],
    summary:
      'Ask the server to verify now (after the popup closes). Never trusted as success on its own',
    description:
      'PRD: PY-02, PY-03. Auth: guest device token or shopper session. Rate limit: 1 per 5 s per order.',
    'x-prd': ['PY-02', 'PY-03'],
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
        name: 'orderId',
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
        content: {
          'application/json': {
            schema: OrderSchema,
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
  defineOperation('get', '/v1/payments/return', {
    operationId: 'paymentReturn',
    tags: ['Payments'],
    summary: 'Redirect target after Paystack redirect checkout; redirects to the pending screen',
    description: 'PRD: SH-17, Q09.',
    'x-prd': ['SH-17', 'Q09'],
    security: [],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'reference',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Paystack reference',
      },
      {
        name: 'trxref',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Paystack reference',
      },
    ],
    responses: {
      '302': {
        description: 'Redirect',
        headers: {
          'X-Request-Id': {
            $ref: '#/components/headers/RequestId',
          },
          Location: {
            schema: z.string(),
          },
        },
      },
      '400': {
        $ref: '#/components/responses/E400',
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

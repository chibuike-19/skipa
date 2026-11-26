// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';

export const webhooksOperations = [
  defineOperation('post', '/v1/webhooks/paystack', {
    operationId: 'paystackWebhook',
    tags: ['Webhooks'],
    summary: 'Paystack events (x-paystack-signature HMAC-SHA512)',
    description: 'PRD: PY-02, PY-04, PY-09, NF-09.',
    'x-prd': ['PY-02', 'PY-04', 'PY-09', 'NF-09'],
    security: [
      {
        paystackSignature: [],
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
  defineOperation('post', '/v1/webhooks/sms/{provider}', {
    operationId: 'smsDeliveryReport',
    tags: ['Webhooks'],
    summary: 'SMS delivery report (Africa’s Talking / Termii)',
    description: 'PRD: NT-05, NOTIF-002.',
    'x-prd': ['NT-05', 'NOTIF-002'],
    security: [
      {
        providerSignature: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'provider',
        in: 'path',
        required: true,
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
  defineOperation('post', '/v1/webhooks/resend', {
    operationId: 'emailEvents',
    tags: ['Webhooks'],
    summary: 'Resend delivery/bounce events (Svix signature)',
    description: 'PRD: NT-06.',
    'x-prd': ['NT-06'],
    security: [
      {
        providerSignature: [],
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
  defineOperation('post', '/v1/webhooks/pos/{connectorKey}/{organisationId}', {
    operationId: 'posPush',
    tags: ['Webhooks'],
    summary: 'POS price/stock push (connector-specific signature)',
    description: 'PRD: PO-02.',
    'x-prd': ['PO-02'],
    security: [
      {
        providerSignature: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'connectorKey',
        in: 'path',
        required: true,
        schema: z.string(),
      },
      {
        name: 'organisationId',
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
];

// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  CartQuoteSchema,
  CartSnapshotSchema,
  CatalogueSchema,
  CheckInRequestSchema,
  ShoppingSessionSchema,
  UnknownBarcodeBatchSchema,
} from '../schemas/components.ts';

export const shoppingOperations = [
  defineOperation('post', '/v1/check-ins', {
    operationId: 'checkIn',
    tags: ['Shopping'],
    summary: 'Scan an entrance QR: open a shopping session at that branch',
    description: 'PRD: SH-01, SH-02, NF-05. Auth: guest device token or shopper session.',
    'x-prd': ['SH-01', 'SH-02', 'NF-05'],
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
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: CheckInRequestSchema,
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
            schema: ShoppingSessionSchema,
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
  defineOperation('get', '/v1/branches/{branchId}/catalogue', {
    operationId: 'getCatalogue',
    tags: ['Shopping'],
    summary: 'Compact product list for offline scanning (ETag, gzip)',
    description: 'PRD: SH-10, SH-11, SH-12, PO-01. Auth: guest device token or shopper session.',
    'x-prd': ['SH-10', 'SH-11', 'SH-12', 'PO-01'],
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
        name: 'branchId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
      {
        name: 'sinceVersion',
        in: 'query',
        required: false,
        schema: z.int(),
        description: 'Return 304 if unchanged',
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
            schema: CatalogueSchema,
          },
        },
      },
      '304': {
        description: 'Not modified (ETag / sinceVersion)',
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
  defineOperation('put', '/v1/sessions/{sessionId}/cart', {
    operationId: 'syncCart',
    tags: ['Shopping'],
    summary: 'Cart snapshot from the phone; returns server prices and limits',
    description: 'PRD: SH-14, SH-15, SH-16, CART-004. Auth: guest device token or shopper session.',
    'x-prd': ['SH-14', 'SH-15', 'SH-16', 'CART-004'],
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
        name: 'sessionId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: CartSnapshotSchema,
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
            schema: CartQuoteSchema,
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
  defineOperation('post', '/v1/sessions/{sessionId}/unknown-barcodes', {
    operationId: 'reportUnknownBarcodes',
    tags: ['Shopping'],
    summary: 'Batch of not-found / not-included scans (offline outbox)',
    description: 'PRD: SH-12, SH-13. Auth: guest device token or shopper session.',
    'x-prd': ['SH-12', 'SH-13'],
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
        name: 'sessionId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: UnknownBarcodeBatchSchema,
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
  defineOperation('post', '/v1/sessions/{sessionId}/end', {
    operationId: 'endSession',
    tags: ['Shopping'],
    summary: 'Shopper leaves without paying',
    description: 'PRD: SH-03. Auth: guest device token or shopper session.',
    'x-prd': ['SH-03'],
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
        name: 'sessionId',
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

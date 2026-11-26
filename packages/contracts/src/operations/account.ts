// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  DataRequestSchema,
  ShopperPatchSchema,
  ShopperProfileSchema,
  StarsSchema,
  TourProgressSchema,
  VisitedStoreSchema,
} from '../schemas/components.ts';

export const accountOperations = [
  defineOperation('get', '/v1/me', {
    operationId: 'getMe',
    tags: ['Account'],
    summary: 'Shopper profile',
    description: 'PRD: SH-28, ST-08. Auth: registered shopper session.',
    'x-prd': ['SH-28', 'ST-08'],
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
            schema: ShopperProfileSchema,
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
  defineOperation('patch', '/v1/me', {
    operationId: 'updateMe',
    tags: ['Account'],
    summary: 'Update name, email, avatar, receipt email opt-in, marketing consent',
    description: 'PRD: SH-07, SH-29. Auth: registered shopper session.',
    'x-prd': ['SH-07', 'SH-29'],
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
        'application/json': {
          schema: ShopperPatchSchema,
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
            schema: ShopperProfileSchema,
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
  defineOperation('get', '/v1/me/stars', {
    operationId: 'getStars',
    tags: ['Account'],
    summary: 'Stars total, per store and history',
    description: 'PRD: ST-04, ST-08. Auth: registered shopper session.',
    'x-prd': ['ST-04', 'ST-08'],
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
            schema: StarsSchema,
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
  defineOperation('get', '/v1/me/visited-stores', {
    operationId: 'listVisitedStores',
    tags: ['Account'],
    summary: 'Store switcher list',
    description: 'PRD: SH-30, D-14. Auth: registered shopper session.',
    'x-prd': ['SH-30', 'D-14'],
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
            schema: z.array(VisitedStoreSchema),
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
  defineOperation('post', '/v1/me/data-requests', {
    operationId: 'createDataRequest',
    tags: ['Account'],
    summary: 'Export or delete my data',
    description: 'PRD: NF-16. Auth: registered shopper session.',
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
      {
        name: 'type',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'export | delete',
      },
    ],
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
            schema: DataRequestSchema,
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
  defineOperation('get', '/v1/me/data-requests', {
    operationId: 'listDataRequests',
    tags: ['Account'],
    summary: 'My data requests',
    description: 'PRD: NF-16. Auth: registered shopper session.',
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
  defineOperation('put', '/v1/tours/{tourKey}', {
    operationId: 'saveTourProgress',
    tags: ['Account'],
    summary: 'Tour seen/skipped/completed (device or staff user)',
    description: 'PRD: SH-31, SD-21, EX-12. Auth: device, shopper or staff.',
    'x-prd': ['SH-31', 'SD-21', 'EX-12'],
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
        name: 'tourKey',
        in: 'path',
        required: true,
        schema: z.string(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: TourProgressSchema,
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

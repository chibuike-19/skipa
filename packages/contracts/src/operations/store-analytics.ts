// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { PageShopperForStoreSchema, ReportSchema } from '../schemas/components.ts';

export const storeAnalyticsOperations = [
  defineOperation('get', '/v1/store/analytics/{report}', {
    operationId: 'getStoreReport',
    tags: ['Store · Analytics'],
    summary: 'Store analytics report from our database',
    description:
      'PRD: 13.3, AN-08, AN-09, AN-10. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['13.3', 'AN-08', 'AN-09', 'AN-10'],
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
        name: 'report',
        in: 'path',
        required: true,
        schema: z.enum([
          'traffic',
          'funnel',
          'sales',
          'products',
          'exit_loss',
          'payments',
          'shoppers',
          'support',
        ]),
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
      {
        name: 'granularity',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'hour|day|week',
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
            schema: ReportSchema,
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
  defineOperation('get', '/v1/store/loss-report', {
    operationId: 'getLossReport',
    tags: ['Store · Analytics'],
    summary: 'Weekly loss vs baseline (pilot plan only)',
    description: 'PRD: SD-07, D-21. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-07', 'D-21'],
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
        name: 'weekStart',
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
            schema: ReportSchema,
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
  defineOperation('get', '/v1/store/shoppers', {
    operationId: 'listStoreShoppers',
    tags: ['Store · Analytics'],
    summary: 'Consenting registered shoppers, visits and stars',
    description: 'PRD: ST-09, Q12. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['ST-09', 'Q12'],
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
      {
        name: 'starRange',
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
            schema: PageShopperForStoreSchema,
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

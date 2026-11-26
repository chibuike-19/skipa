// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { defineOperation } from '../openapi/operation.ts';
import { HealthSchema } from '../schemas/components.ts';

export const systemOperations = [
  defineOperation('get', '/health/live', {
    operationId: 'healthLive',
    tags: ['System'],
    summary: 'Process is up',
    description: 'PRD: NF-01.',
    'x-prd': ['NF-01'],
    security: [],
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
            schema: HealthSchema,
          },
        },
      },
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
  defineOperation('get', '/health/ready', {
    operationId: 'healthReady',
    tags: ['System'],
    summary: 'Database, queue and Paystack reachability',
    description: 'PRD: ER-09.',
    'x-prd': ['ER-09'],
    security: [],
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
            schema: HealthSchema,
          },
        },
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

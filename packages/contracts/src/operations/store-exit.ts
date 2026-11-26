// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { CheckerSignalSchema, PageExitCheckSchema } from '../schemas/components.ts';

export const storeExitOperations = [
  defineOperation('get', '/v1/store/exit-checks', {
    operationId: 'listExitChecks',
    tags: ['Store · Exit'],
    summary: 'Exit check log',
    description: 'PRD: EX-06, SD-05. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['EX-06', 'SD-05'],
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
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'result',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'checkerId',
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
            schema: PageExitCheckSchema,
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
  defineOperation('get', '/v1/store/exit-checks/signals', {
    operationId: 'listCheckerSignals',
    tags: ['Store · Exit'],
    summary: 'Unusual checker patterns (signals only)',
    description: 'PRD: EX-08. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['EX-08'],
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
            schema: z.array(CheckerSignalSchema),
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

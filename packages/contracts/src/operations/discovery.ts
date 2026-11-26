// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { BranchPublicSchema, StoreSearchResultSchema } from '../schemas/components.ts';

export const discoveryOperations = [
  defineOperation('get', '/v1/stores', {
    operationId: 'searchStores',
    tags: ['Discovery'],
    summary: 'Search stores by name or area; distance is computed on the phone',
    description: 'PRD: SH-26, D-11, NF-29. Auth: device token.',
    'x-prd': ['SH-26', 'D-11', 'NF-29'],
    security: [
      {
        deviceToken: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'q',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Name or area',
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: z.int(),
        description: 'Max 50',
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
            schema: z.array(StoreSearchResultSchema),
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
  defineOperation('get', '/v1/branches/{branchId}', {
    operationId: 'getBranchPublic',
    tags: ['Discovery'],
    summary: 'Store page and branding for one branch',
    description: 'PRD: SH-26, BR-01, BR-07. Auth: device token.',
    'x-prd': ['SH-26', 'BR-01', 'BR-07'],
    security: [
      {
        deviceToken: [],
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
            schema: BranchPublicSchema,
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

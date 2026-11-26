// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { LiveSnapshotSchema, PageAlertSchema } from '../schemas/components.ts';

export const storeLiveOperations = [
  defineOperation('get', '/v1/store/live', {
    operationId: 'getLive',
    tags: ['Store · Live'],
    summary: 'Live view snapshot (then SSE updates)',
    description: 'PRD: SD-01, SD-04. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-01', 'SD-04'],
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
        description: 'Omit for all branches (head office)',
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
            schema: LiveSnapshotSchema,
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
  defineOperation('get', '/v1/store/alerts', {
    operationId: 'listStoreAlerts',
    tags: ['Store · Live'],
    summary: 'Needs-action list and alert centre',
    description: 'PRD: SD-01, 9. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-01', '9'],
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
        name: 'status',
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
            schema: PageAlertSchema,
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
  defineOperation('post', '/v1/store/alerts/{alertId}/acknowledge', {
    operationId: 'ackStoreAlert',
    tags: ['Store · Live'],
    summary: 'Acknowledge an alert',
    description: 'PRD: 9. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['9'],
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
        name: 'alertId',
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

// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { RealtimeEventSchema } from '../schemas/components.ts';

export const realtimeOperations = [
  defineOperation('get', '/v1/stream', {
    operationId: 'stream',
    tags: ['Realtime'],
    summary: 'Server-sent events for the caller’s channels (order, ticket, branch, platform)',
    description: 'PRD: SD-01, EX-10, SA-02. Auth: device, shopper or staff.',
    'x-prd': ['SD-01', 'EX-10', 'SA-02'],
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
        name: 'channels',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Comma list, e.g. order:<id>,branch:<id>',
      },
      {
        name: 'lastEventId',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Resume',
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
          'text/event-stream': {
            schema: z.string(),
            'x-event-schema': RealtimeEventSchema,
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

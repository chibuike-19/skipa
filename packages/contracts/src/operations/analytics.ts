// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { defineOperation } from '../openapi/operation.ts';
import { EventBatchSchema } from '../schemas/components.ts';

export const analyticsOperations = [
  defineOperation('post', '/v1/events', {
    operationId: 'ingestEvents',
    tags: ['Analytics'],
    summary: 'Batch of client analytics events (standard properties added server-side)',
    description:
      'PRD: AN-01, AN-02, AN-03. Auth: device token. Rate limit: 60 batches/min per device.',
    'x-prd': ['AN-01', 'AN-02', 'AN-03'],
    security: [
      {
        deviceToken: [],
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
          schema: EventBatchSchema,
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

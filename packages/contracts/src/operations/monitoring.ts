// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { defineOperation } from '../openapi/operation.ts';

export const monitoringOperations = [
  defineOperation('post', '/v1/monitoring/tunnel', {
    operationId: 'sentryTunnel',
    tags: ['Monitoring'],
    summary: 'Sentry SDK envelope tunnel to GlitchTip (keeps request IDs, avoids blockers)',
    description: 'PRD: ER-01, ER-02.',
    'x-prd': ['ER-01', 'ER-02'],
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

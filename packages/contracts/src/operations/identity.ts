// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { defineOperation } from '../openapi/operation.ts';
import { DeviceSchema, DeviceRegistrationSchema } from '../schemas/components.ts';

export const identityOperations = [
  defineOperation('post', '/v1/devices', {
    operationId: 'registerDevice',
    tags: ['Identity'],
    summary: 'Register a device and receive a signed device token',
    description: 'PRD: IR-06, SH-05.',
    'x-prd': ['IR-06', 'SH-05'],
    security: [],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: DeviceRegistrationSchema,
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
            schema: DeviceSchema,
          },
        },
      },
      '400': {
        $ref: '#/components/responses/E400',
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

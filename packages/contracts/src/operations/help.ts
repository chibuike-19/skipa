// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import { FaqSchema, FaqMatchSchema, FaqMatchRequestSchema } from '../schemas/components.ts';

export const helpOperations = [
  defineOperation('get', '/v1/help/faqs', {
    operationId: 'listSuggestedFaqs',
    tags: ['Help'],
    summary: 'Suggested questions for this screen and order state',
    description: 'PRD: HP-01, HP-02, HP-03, HP-15. Auth: device token.',
    'x-prd': ['HP-01', 'HP-02', 'HP-03', 'HP-15'],
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
        name: 'screen',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'branchId',
        in: 'query',
        required: false,
        schema: z.string(),
        description: 'Omit for Skipa FAQs',
      },
      {
        name: 'orderId',
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
            schema: z.array(FaqSchema),
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
  defineOperation('post', '/v1/help/match', {
    operationId: 'matchFaq',
    tags: ['Help'],
    summary: 'Match a typed question to an FAQ; offers support when unsure',
    description: 'PRD: HP-01, HP-04, HP-05. Auth: device token.',
    'x-prd': ['HP-01', 'HP-04', 'HP-05'],
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
          schema: FaqMatchRequestSchema,
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
            schema: FaqMatchSchema,
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

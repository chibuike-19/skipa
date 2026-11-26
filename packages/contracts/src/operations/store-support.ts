// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  FaqSchema,
  FaqInputSchema,
  PageTicketSchema,
  TicketSchema,
  TicketPatchSchema,
} from '../schemas/components.ts';

export const storeSupportOperations = [
  defineOperation('get', '/v1/store/support/tickets', {
    operationId: 'listInbox',
    tags: ['Store · Support'],
    summary: 'Support inbox',
    description: 'PRD: HP-10, HP-12. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-10', 'HP-12'],
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
        name: 'status',
        in: 'query',
        required: false,
        schema: z.string(),
      },
      {
        name: 'late',
        in: 'query',
        required: false,
        schema: z.boolean(),
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
            schema: PageTicketSchema,
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
  defineOperation('get', '/v1/store/support/tickets/{ticketId}', {
    operationId: 'getInboxTicket',
    tags: ['Store · Support'],
    summary: 'Ticket with attached order and payment context',
    description: 'PRD: HP-08. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-08'],
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
        name: 'ticketId',
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
            schema: TicketSchema,
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
  defineOperation('patch', '/v1/store/support/tickets/{ticketId}', {
    operationId: 'updateTicket',
    tags: ['Store · Support'],
    summary: 'Change status',
    description: 'PRD: HP-11. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-11'],
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
        name: 'ticketId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: TicketPatchSchema,
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
            schema: TicketSchema,
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
  defineOperation('post', '/v1/store/support/tickets/{ticketId}/escalate', {
    operationId: 'escalateTicket',
    tags: ['Store · Support'],
    summary: 'Escalate a platform fault to Skipa',
    description: 'PRD: HP-13. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-13'],
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
        name: 'ticketId',
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
            schema: TicketSchema,
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
  defineOperation('get', '/v1/store/faqs', {
    operationId: 'listStoreFaqs',
    tags: ['Store · Support'],
    summary: 'Store FAQs used by the chatbot',
    description: 'PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-02'],
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
  defineOperation('post', '/v1/store/faqs', {
    operationId: 'createStoreFaq',
    tags: ['Store · Support'],
    summary: 'Add a store FAQ',
    description: 'PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-02'],
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
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: FaqInputSchema,
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
            schema: FaqSchema,
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
  defineOperation('put', '/v1/store/faqs/{faqId}', {
    operationId: 'updateStoreFaq',
    tags: ['Store · Support'],
    summary: 'Edit a store FAQ',
    description: 'PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-02'],
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
        name: 'faqId',
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: FaqInputSchema,
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
            schema: FaqSchema,
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
  defineOperation('delete', '/v1/store/faqs/{faqId}', {
    operationId: 'deleteStoreFaq',
    tags: ['Store · Support'],
    summary: 'Remove a store FAQ',
    description: 'PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['HP-02'],
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
        name: 'faqId',
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
      '429': {
        $ref: '#/components/responses/E429',
      },
      '500': {
        $ref: '#/components/responses/E500',
      },
    },
  }),
];

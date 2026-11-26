// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  InviteInfoSchema,
  OtpChallengeSchema,
  OtpRequestSchema,
  OtpVerifySchema,
  SessionSchema,
  SessionInfoSchema,
  ShopperRegistrationSchema,
  StaffMeSchema,
  TotpEnrollmentSchema,
  TotpVerifySchema,
} from '../schemas/components.ts';

export const authOperations = [
  defineOperation('post', '/v1/auth/otp', {
    operationId: 'requestOtp',
    tags: ['Auth'],
    summary: 'Send a one-time code (SMS to shoppers, email to staff)',
    description:
      'PRD: RB-02, SH-06, SH-08, NF-11. Auth: device token. Rate limit: 5/15min per destination, 20/h per IP.',
    'x-prd': ['RB-02', 'SH-06', 'SH-08', 'NF-11'],
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
          schema: OtpRequestSchema,
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
            schema: OtpChallengeSchema,
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
  defineOperation('post', '/v1/auth/otp/verify', {
    operationId: 'verifyOtp',
    tags: ['Auth'],
    summary:
      'Verify a code. Shopper sign-in and staff sign-in return a session; shopper registration returns a registration token',
    description:
      'PRD: RB-02, RB-06, SA-01, AUTH-003. Auth: device token. Rate limit: 5 attempts per challenge.',
    'x-prd': ['RB-02', 'RB-06', 'SA-01', 'AUTH-003'],
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
          schema: OtpVerifySchema,
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
            schema: SessionSchema,
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
  defineOperation('post', '/v1/auth/register', {
    operationId: 'registerShopper',
    tags: ['Auth'],
    summary: 'Complete shopper registration with consent',
    description: 'PRD: SH-06, SH-07, NF-15, ST-07. Auth: device token.',
    'x-prd': ['SH-06', 'SH-07', 'NF-15', 'ST-07'],
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
          schema: ShopperRegistrationSchema,
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
            schema: SessionSchema,
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
  defineOperation('post', '/v1/auth/second-step', {
    operationId: 'verifySecondStep',
    tags: ['Auth'],
    summary: 'TOTP second step for super admins (flag superadmin_second_step)',
    description: 'PRD: SA-01, D-23. Auth: super_admin (support_agent read-only where GET).',
    'x-prd': ['SA-01', 'D-23'],
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
          schema: TotpVerifySchema,
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
            schema: SessionSchema,
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
  defineOperation('post', '/v1/auth/second-step/enrol', {
    operationId: 'enrolSecondStep',
    tags: ['Auth'],
    summary: 'Start TOTP enrolment (flag on)',
    description: 'PRD: SA-01. Auth: super_admin (support_agent read-only where GET).',
    'x-prd': ['SA-01'],
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
            schema: TotpEnrollmentSchema,
          },
        },
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
  defineOperation('get', '/v1/auth/invites/{token}', {
    operationId: 'getInvite',
    tags: ['Auth'],
    summary: 'Read a staff invite before signing in',
    description: 'PRD: RB-03, NF-28.',
    'x-prd': ['RB-03', 'NF-28'],
    security: [],
    parameters: [
      {
        $ref: '#/components/parameters/RequestId',
      },
      {
        name: 'token',
        in: 'path',
        required: true,
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
            schema: InviteInfoSchema,
          },
        },
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
  defineOperation('get', '/v1/auth/session', {
    operationId: 'getSession',
    tags: ['Auth'],
    summary: 'Current session and identity',
    description: 'PRD: RB-01. Auth: device, shopper or staff.',
    'x-prd': ['RB-01'],
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
            schema: StaffMeSchema,
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
  defineOperation('post', '/v1/auth/sign-out', {
    operationId: 'signOut',
    tags: ['Auth'],
    summary: 'Revoke the current session',
    description: 'PRD: RB-06. Auth: device, shopper or staff.',
    'x-prd': ['RB-06'],
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
  defineOperation('post', '/v1/auth/hand-over', {
    operationId: 'handOver',
    tags: ['Auth'],
    summary: 'End this exit checker shift; next checker signs in',
    description: 'PRD: RB-06, EX-06. Auth: exit_checker session bound to a branch.',
    'x-prd': ['RB-06', 'EX-06'],
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
  defineOperation('get', '/v1/auth/sessions', {
    operationId: 'listMySessions',
    tags: ['Auth'],
    summary: 'Active sessions for the signed-in user',
    description: 'PRD: SD-22. Auth: any staff session.',
    'x-prd': ['SD-22'],
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
            schema: z.array(SessionInfoSchema),
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
  defineOperation('delete', '/v1/auth/sessions/{sessionId}', {
    operationId: 'revokeMySession',
    tags: ['Auth'],
    summary: 'Sign out another of my sessions',
    description: 'PRD: SD-22. Auth: any staff session.',
    'x-prd': ['SD-22'],
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
        name: 'sessionId',
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

// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { defineOperation } from '../openapi/operation.ts';
import {
  BranchPublicSchema,
  BranchSettingsSchema,
  NotificationPreferenceSchema,
  QrCodeSchema,
  QrCodeCreateSchema,
  SettingsPatchSchema,
  SwitchOffSchema,
} from '../schemas/components.ts';

export const storeSettingsOperations = [
  defineOperation('get', '/v1/store/branches/{branchId}/settings', {
    operationId: 'getBranchSettings',
    tags: ['Store · Settings'],
    summary: 'Flagging rules, random rate, limits, channels',
    description: 'PRD: CS-06, SD-23. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['CS-06', 'SD-23'],
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
            schema: BranchSettingsSchema,
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
  defineOperation('patch', '/v1/store/branches/{branchId}/settings', {
    operationId: 'updateBranchSettings',
    tags: ['Store · Settings'],
    summary: 'Change settings (logged with before/after and reason)',
    description:
      'PRD: EX-11, PY-11, RB-04. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['EX-11', 'PY-11', 'RB-04'],
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
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: SettingsPatchSchema,
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
            schema: BranchSettingsSchema,
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
  defineOperation('post', '/v1/store/branches/{branchId}/switch-off', {
    operationId: 'switchOffBranch',
    tags: ['Store · Settings'],
    summary: 'Switch Skipa off at a branch (press-and-hold + reason)',
    description: 'PRD: SD-03. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-03'],
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
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: SwitchOffSchema,
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
            schema: BranchPublicSchema,
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
  defineOperation('post', '/v1/store/branches/{branchId}/switch-on', {
    operationId: 'switchOnBranch',
    tags: ['Store · Settings'],
    summary: 'Switch Skipa back on',
    description: 'PRD: SD-03. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-03'],
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
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
      {
        $ref: '#/components/parameters/IdempotencyKey',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: SwitchOffSchema,
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
            schema: BranchPublicSchema,
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
  defineOperation('get', '/v1/store/branches/{branchId}/qr-codes', {
    operationId: 'listQrCodes',
    tags: ['Store · Settings'],
    summary: 'Entrance QR codes and scans',
    description: 'PRD: SD-08. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-08'],
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
            schema: z.array(QrCodeSchema),
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
  defineOperation('post', '/v1/store/branches/{branchId}/qr-codes', {
    operationId: 'createQrCode',
    tags: ['Store · Settings'],
    summary: 'Add a QR location',
    description: 'PRD: SD-08. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-08'],
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
        in: 'path',
        required: true,
        schema: z.uuid(),
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: QrCodeCreateSchema,
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
            schema: QrCodeSchema,
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
  defineOperation('get', '/v1/store/qr-codes/{qrCodeId}/sign.pdf', {
    operationId: 'qrSignPdf',
    tags: ['Store · Settings'],
    summary: 'Printable A4 sign (store branding, standard QR)',
    description: 'PRD: SD-08, BR-01. Auth: store_manager or head_office_admin (branch-scoped).',
    'x-prd': ['SD-08', 'BR-01'],
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
        name: 'qrCodeId',
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
          'application/pdf': {
            schema: z.string().meta({ contentEncoding: 'binary' }),
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
  defineOperation('get', '/v1/me/notification-preferences', {
    operationId: 'getNotificationPrefs',
    tags: ['Store · Settings'],
    summary: 'My alert channels (dashboard, email)',
    description: 'PRD: NT-04. Auth: any staff session.',
    'x-prd': ['NT-04'],
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
            schema: z.array(NotificationPreferenceSchema),
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
  defineOperation('put', '/v1/me/notification-preferences', {
    operationId: 'setNotificationPrefs',
    tags: ['Store · Settings'],
    summary: 'Set non-critical alert channels',
    description: 'PRD: NT-04. Auth: any staff session.',
    'x-prd': ['NT-04'],
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
          schema: z.array(NotificationPreferenceSchema),
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
            schema: z.array(NotificationPreferenceSchema),
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

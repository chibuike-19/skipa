// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { ErrorSchema } from '../schemas/components.ts';

export const documentBase = {
  openapi: '3.1.0',
  info: {
    title: 'Skipa API',
    version: '1.0.0',
    summary: 'Contract between the Skipa backend and its web and native clients.',
    description:
      'Source of truth for the frontend and backend agents. Generated from the Zod schemas in `packages/contracts` once the repo exists; until then this file is edited by hand and the Zod schemas are written to match it. Changing this file requires a PR labelled `contract-change` reviewed by both agents.\n\nConventions: JSON camelCase; money as integer kobo in fields ending `Kobo`; times ISO-8601 UTC (display in WAT); cursor pagination (`cursor`, `limit` ≤ 100, response `{data, nextCursor}`); errors `{error:{code,message,userMessage,requestId}}` with codes from the error catalogue (PRD 14.2); `Idempotency-Key` (UUID) required where listed — replays within 24 h return the first response; every response carries `X-Request-Id`. Versioning: breaking changes only under a new prefix (`/v2`); `/v1` supported ≥ 6 months after `/v2` ships (NF-25).',
    contact: {
      name: 'Skipa engineering',
    },
  },
  servers: [
    {
      url: 'https://api.skipa.ng',
      description: 'Production (domain to confirm)',
    },
    {
      url: 'https://api.staging.skipa.ng',
      description: 'Staging — Paystack test keys',
    },
    {
      url: 'http://localhost:4000',
      description: 'Local',
    },
  ],
  tags: [
    {
      name: 'System',
    },
    {
      name: 'Identity',
    },
    {
      name: 'Auth',
    },
    {
      name: 'Discovery',
    },
    {
      name: 'Shopping',
    },
    {
      name: 'Payments',
    },
    {
      name: 'Webhooks',
    },
    {
      name: 'Receipts',
    },
    {
      name: 'Refunds',
    },
    {
      name: 'Help',
    },
    {
      name: 'Support',
    },
    {
      name: 'Account',
    },
    {
      name: 'Analytics',
    },
    {
      name: 'Monitoring',
    },
    {
      name: 'Realtime',
    },
    {
      name: 'Exit',
    },
    {
      name: 'Store · Live',
    },
    {
      name: 'Store · Receipts',
    },
    {
      name: 'Store · Exit',
    },
    {
      name: 'Store · Refunds',
    },
    {
      name: 'Store · Support',
    },
    {
      name: 'Store · Catalogue',
    },
    {
      name: 'Store · Staff',
    },
    {
      name: 'Store · Settings',
    },
    {
      name: 'Store · Branding',
    },
    {
      name: 'Store · Reconciliation',
    },
    {
      name: 'Store · Analytics',
    },
    {
      name: 'Store · Data',
    },
    {
      name: 'Admin',
    },
  ],
} as const;

export const sharedComponents = {
  securitySchemes: {
    bearer: {
      type: 'http',
      scheme: 'bearer',
      description: 'Opaque session token (native apps; exit devices).',
    },
    cookie: {
      type: 'apiKey',
      in: 'cookie',
      name: '__Host-skipa_sid',
      description:
        'httpOnly session cookie for the web apps. Mutating requests must also send `X-Skipa-Client`.',
    },
    deviceToken: {
      type: 'apiKey',
      in: 'header',
      name: 'X-Skipa-Device',
      description: 'Signed device token from POST /v1/devices (guests).',
    },
    paystackSignature: {
      type: 'apiKey',
      in: 'header',
      name: 'x-paystack-signature',
      description: 'HMAC-SHA512 of the raw body with the Paystack secret key.',
    },
    providerSignature: {
      type: 'apiKey',
      in: 'header',
      name: 'X-Provider-Signature',
      description: 'Provider-specific signature or shared secret, verified per provider.',
    },
  },
  parameters: {
    RequestId: {
      name: 'X-Request-Id',
      in: 'header',
      required: false,
      schema: z.string().max(64),
      description: 'Optional client-generated ID; the edge generates one if absent (ER-03).',
    },
    IdempotencyKey: {
      name: 'Idempotency-Key',
      in: 'header',
      required: true,
      schema: z.uuid(),
      description:
        'Required. Same key + same body within 24 h returns the original response (CS-03, PY-01).',
    },
  },
  headers: {
    RequestId: {
      schema: z.string(),
      description: 'Request ID (also in logs, errors and Paystack metadata).',
    },
  },
  responses: {
    E400: {
      description: 'Validation failed',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'SYS-400',
              message: 'body/items/0/quantity must be >= 1',
              userMessage: "Something in that request wasn't right.",
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
    E401: {
      description: 'Not signed in or session expired',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'AUTH-001',
              message: 'session expired',
              userMessage: 'Please sign in again.',
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
    E403: {
      description: 'Not allowed for this role, branch or organisation',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'AUTH-005',
              message: 'branch not assigned',
              userMessage: "You don't have access to this branch.",
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
    E404: {
      description: 'Not found',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'SYS-404',
              message: 'not found',
              userMessage: "We couldn't find that.",
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
    E409: {
      description:
        'Conflict: state changed, price changed, or idempotency key reused with a different body',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'CART-006',
              message: 'prices changed',
              userMessage: 'Some prices changed. Check your cart before paying.',
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
    E429: {
      description: 'Rate limited',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'AUTH-004',
              message: 'too many attempts',
              userMessage: 'Too many tries. Wait 15 minutes and try again.',
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
    E500: {
      description: 'Unexpected error',
      headers: {
        'X-Request-Id': {
          $ref: '#/components/headers/RequestId',
        },
      },
      content: {
        'application/json': {
          schema: ErrorSchema,
          example: {
            error: {
              code: 'SYS-500',
              message: 'unexpected',
              userMessage: 'Something went wrong on our side.',
              requestId: '91c0-44ad',
            },
          },
        },
      },
    },
  },
};

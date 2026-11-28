// System, Identity, Auth, Account, Analytics, Monitoring: what the four app shells call (F0).
import { apiError, empty, json, mock, readJson, type MockDefinition } from '../http.ts';
import { SHOPPER, STAFF, type Surface } from '../seed.ts';
import { auth } from '../state.ts';

/** Which app is calling: the client sends `X-Skipa-Client: <app>/<version>` (brief §4). */
export function surfaceOf(request: Request): Surface | undefined {
  const app = request.headers.get('X-Skipa-Client')?.split('/')[0];
  return app === 'shopper' || app === 'exit' || app === 'store' || app === 'admin'
    ? app
    : undefined;
}

const minutesFromNow = (m: number): string => new Date(Date.now() + m * 60_000).toISOString();

function mask(destination: string): string {
  if (destination.includes('@')) {
    const [user = '', domain = ''] = destination.split('@');
    return `${user.slice(0, 1)}***@${domain}`;
  }
  return `${destination.slice(0, 4)} *** *** ${destination.slice(-4)}`;
}

const STAFF_SURFACE = { staff_sign_in: undefined, admin_sign_in: 'admin' } as const;

export const OTP = {
  /** Any other 6 digits sign in. */
  wrongCode: '000000',
  expiredCode: '111111',
} as const;

export const platformMocks: MockDefinition[] = [
  mock('healthLive', () => json({ status: 'ok', release: 'api@mock' })),

  mock(
    'registerDevice',
    () => json({ deviceId: crypto.randomUUID(), deviceToken: `mock.${crypto.randomUUID()}` }, 201),
    [{ body: { platform: 'web', appVersion: 'shopper@0.0.0', browser: 'Chrome 141' } }],
  ),

  mock(
    'requestOtp',
    async ({ request }) => {
      const body = await readJson<{
        destination?: string;
        purpose?: string;
        surface?: 'exit' | 'store' | 'admin';
      }>(request);
      if (body?.destination === undefined || body.purpose === undefined)
        return apiError('SYS-400', 'destination and purpose are required');
      const surface: Surface =
        body.purpose === 'shopper_register' || body.purpose === 'shopper_sign_in'
          ? 'shopper'
          : (STAFF_SURFACE[body.purpose as keyof typeof STAFF_SURFACE] ?? body.surface ?? 'store');
      const challengeId = auth.startChallenge(surface, body.destination);
      return json(
        {
          challengeId,
          destinationMasked: mask(body.destination),
          expiresAt: minutesFromNow(10),
          resendAfter: minutesFromNow(1),
        },
        201,
      );
    },
    [
      { body: { destination: '+2348030004471', purpose: 'shopper_sign_in' } },
      {
        body: {
          destination: 'chidi.o@adunnimart.example',
          purpose: 'staff_sign_in',
          surface: 'exit',
        },
      },
    ],
  ),

  mock(
    'verifyOtp',
    async ({ request }) => {
      const body = await readJson<{ challengeId?: string; code?: string }>(request);
      const challenge =
        body?.challengeId === undefined ? undefined : auth.challenge(body.challengeId);
      if (challenge === undefined) return apiError('AUTH-003', 'unknown or expired challenge');
      if (body?.code === OTP.wrongCode) return apiError('AUTH-002');
      if (body?.code === OTP.expiredCode) return apiError('AUTH-003');
      auth.signIn(challenge.surface);
      return json({
        token: `mock.${crypto.randomUUID()}`,
        expiresAt: minutesFromNow(12 * 60),
        surface: challenge.surface,
        secondStepRequired: false,
      });
    },
    // Unknown challenge in a fresh state: exercises the AUTH-003 path against the contract.
    [{ body: { challengeId: '0193a1f2-0000-7000-8000-0000000000ff', code: '123456' } }],
  ),

  mock(
    'getSession',
    ({ request }) => {
      const surface = surfaceOf(request);
      if (surface === undefined || surface === 'shopper' || !auth.isSignedIn(surface))
        return apiError('AUTH-001');
      return json({
        ...STAFF[surface],
        branchIds: [...STAFF[surface].branchIds],
        permissions: [...STAFF[surface].permissions],
      });
    },
    [{ headers: { 'X-Skipa-Client': 'store/0.0.0' } }],
  ),

  mock(
    'signOut',
    ({ request }) => {
      const surface = surfaceOf(request);
      if (surface !== undefined) auth.signOut(surface);
      return empty(204);
    },
    [{ headers: { 'X-Skipa-Client': 'store/0.0.0' } }],
  ),

  mock('getMe', () => (auth.isSignedIn('shopper') ? json({ ...SHOPPER }) : apiError('AUTH-001')), [
    { headers: { 'X-Skipa-Client': 'shopper/0.0.0' } },
  ]),

  mock(
    'ingestEvents',
    async ({ request }) => {
      const body = await readJson<{ events?: unknown[] }>(request);
      return Array.isArray(body?.events)
        ? empty(202)
        : apiError('SYS-400', 'events must be an array');
    },
    [
      {
        body: {
          events: [
            {
              clientEventId: '0193a1f2-0000-7000-8000-0000000000e1',
              name: 'skipa_home_viewed',
              occurredAt: '2026-11-26T10:00:00Z',
              screen: 'home',
              networkType: '4g',
              properties: { tab: 'home' },
            },
          ],
        },
      },
    ],
  ),

  // GlitchTip tunnel: the API forwards the envelope. The mock just accepts it.
  mock('sentryTunnel', () => empty(200), [{ body: undefined }]),
];

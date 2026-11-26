import { Writable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { runWithContext } from './context.ts';
import { createLogger } from './logger.ts';

function capture() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _enc, done) {
      lines.push(JSON.parse(chunk.toString()) as Record<string, unknown>);
      done();
    },
  });
  const logger = createLogger(
    { LOG_LEVEL: 'info', RELEASE: 'api@1.0.0+abc', APP_ENV: 'test' },
    'api',
    stream,
  );
  return { logger, lines };
}

describe('logger', () => {
  it('writes the AD §10.2 base fields and the request context on every line', async () => {
    const { logger, lines } = capture();
    runWithContext(
      { requestId: '0193a1f2-aaaa-7000-8000-91c044ad0000', organisationId: 'org-1', role: 'guest' },
      () => {
        logger.info({ event: 'payment.verify.requested' }, 'verify enqueued');
      },
    );
    await new Promise((r) => setImmediate(r));
    expect(lines[0]).toMatchObject({
      level: 'info',
      service: 'api',
      release: 'api@1.0.0+abc',
      env: 'test',
      request_id: '0193a1f2-aaaa-7000-8000-91c044ad0000',
      org_id: 'org-1',
      role: 'guest',
      event: 'payment.verify.requested',
      msg: 'verify enqueued',
    });
    expect(typeof lines[0]?.time).toBe('string');
  });

  it('never writes personal data or secrets, in fields or in the message (14.5 AC)', async () => {
    const { logger, lines } = capture();
    logger.info(
      {
        shopper: { phone: '+2348031234567', email: 'ada@example.com' },
        headers: { authorization: 'Bearer secret' },
        otp: '482913',
      },
      'code sent to ada@example.com on 08031234567',
    );
    await new Promise((r) => setImmediate(r));
    const text = JSON.stringify(lines[0]);
    for (const leaked of ['ada@example.com', '8031234567', 'Bearer secret', '482913'])
      expect(text).not.toContain(leaked);
    expect(lines[0]?.msg).toBe('code sent to [email] on [phone]');
  });
});

// Sign-in (AD-04, RB-02): work email, then a 6-digit emailed code. F0 builds the working flow on
// the shared components; F4 matches it to Exit-F01 (wrong code, session expired, invites).
import { unwrap, type Schema } from '@skipa/api-client';
import { Button, Feedback, OtpField, TextField, Wordmark } from '@skipa/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { api, APP } from '../api.ts';
import { describeError } from '../errors.tsx';
import { en } from '../i18n/en.ts';
import { sessionQuery } from '../session.ts';

/** Only same-app paths: `next` comes from the URL, so never follow it off-site. */
export function safeNext(next: unknown): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

function SignIn() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<Schema<'OtpChallenge'> | null>(null);
  const [secondStep, setSecondStep] = useState(false);

  const request = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/v1/auth/otp', {
          body: { destination: email.trim(), purpose: 'staff_sign_in', surface: APP },
        }),
      ),
    onSuccess: (c) => {
      setChallenge(c);
      setCode('');
    },
  });

  const verify = useMutation({
    mutationFn: (value: string) => {
      if (challenge === null) throw new Error('no challenge');
      return unwrap(
        api.POST('/v1/auth/otp/verify', {
          body: { challengeId: challenge.challengeId, code: value },
        }),
      );
    },
    onSuccess: async (session) => {
      if (session.secondStepRequired === true) {
        setSecondStep(true);
        return;
      }
      // Fetch now: the guard reads the cache, and nothing observes the session to refetch it.
      await queryClient.query({ ...sessionQuery, staleTime: 0 });
      await navigate({ to: safeNext(next) });
    },
  });

  const failure = request.error ?? verify.error;

  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-5 p-6">
      <Wordmark height={32} />
      <h1 className="t-h1 m-0">{challenge === null ? en.signIn.title : en.signIn.codeTitle}</h1>
      {failure !== null && (
        <Feedback kind="alert" tone="error" title={describeError(failure).body} />
      )}
      {secondStep && <Feedback kind="alert" tone="info" title={en.signIn.secondStep} />}
      {challenge === null ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            request.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <TextField
            label={en.signIn.emailLabel}
            hint={en.signIn.emailHint}
            kind="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <Button type="submit" full label={en.signIn.sendCode} loading={request.isPending} />
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) verify.mutate(code);
          }}
          className="flex flex-col gap-4"
        >
          <p className="t-body m-0 text-secondary">
            {en.signIn.codeBody(challenge.destinationMasked)}
          </p>
          <OtpField
            label={en.signIn.codeLabel}
            digitLabel={en.signIn.digit}
            value={code}
            onChange={setCode}
            onComplete={(value) => {
              verify.mutate(value);
            }}
            // The code step opens with the cursor in the first box (canvas EX-F01, SD-Signin).
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the only field on this step
            autoFocus
          />
          <Button type="submit" full label={en.signIn.verify} loading={verify.isPending} />
          <Button
            variant="link"
            label={en.signIn.changeEmail}
            onClick={() => {
              setChallenge(null);
              verify.reset();
            }}
          />
        </form>
      )}
    </main>
  );
}

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): { next?: string } =>
    typeof search.next === 'string' ? { next: search.next } : {},
  beforeLoad: async ({ context, search }) => {
    const staff = await context.queryClient.query(sessionQuery);
    if (staff !== null) throw redirect({ to: safeNext(search.next) });
  },
  component: SignIn,
});

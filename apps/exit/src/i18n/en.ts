// All exit-mode copy (brief §4, §16): plain English from the canvas content guide (F-Content).
export const en = {
  app: { name: 'Skipa exit' },
  common: {
    tryAgain: 'Try again',
    goHome: 'Back to scanning',
    reference: 'Reference',
    signOut: 'End shift',
  },
  // AD-04: exit checkers sign in with their work email and a 6-digit emailed code.
  signIn: {
    title: 'Start your shift',
    emailLabel: 'Work email',
    emailHint: 'We’ll email you a 6-digit code.',
    sendCode: 'Email me a code',
    codeTitle: 'Enter the code',
    codeBody: (to: string) => `We sent a 6-digit code to ${to}.`,
    codeLabel: 'Code',
    digit: (i: number) => `Digit ${i}`,
    verify: 'Start shift',
    changeEmail: 'Use a different email',
    secondStep: 'This account needs a second sign-in step. Ask your manager.',
  },
  // F0 shell: the scanner (Exit-F02) replaces it in F4.
  shell: {
    title: 'Ready to scan',
    body: 'This is the exit-mode shell. The receipt scanner and results are built in F4.',
    signedInAs: (name: string) => `Signed in as ${name}`,
  },
  notFound: {
    title: 'We can’t find that page',
    body: 'Go back to scanning.',
  },
  errors: {
    titles: {
      retry: 'That didn’t work',
      signIn: 'Please sign in again',
      offline: 'No connection · checks paused',
      server: 'Something went wrong on our side',
      notFound: 'We can’t find that',
      wait: 'Please wait',
      fixInput: 'Check and try again',
      forbidden: 'You can’t do that',
    },
    offline: 'Checks start again by themselves when the connection is back.',
    server: 'Try again. If it keeps happening, tell your manager this reference.',
  },
} as const;

// All shopper copy (brief §4, §16): plain English from the canvas content guide (F-Content).
// Sentence case, ₦ with commas, WAT times, "we" for Skipa and the store, no blame.
export const en = {
  app: { name: 'Skipa' },
  common: {
    tryAgain: 'Try again',
    goHome: 'Go to Skipa home',
    reference: 'Reference',
    needHelp: 'Need help?',
    back: 'Back',
  },
  // F0 shell: replaced by Skipa home (SH-F10) in F1.
  shell: {
    title: 'Skipa',
    body: 'This is the app shell. Skipa home, store check-in and scanning are built from F1.',
    guest: 'You are browsing as a guest on this phone.',
    registered: (name: string) => `Signed in as ${name}.`,
  },
  notFound: {
    title: 'We can’t find that page',
    body: 'The link may be old. Go back to Skipa home and try again.',
  },
  errors: {
    titles: {
      retry: 'That didn’t work',
      signIn: 'Please sign in again',
      payAtTill: 'Please pay at the till',
      offline: 'You’re offline',
      server: 'Something went wrong on our side',
      notFound: 'We can’t find that',
      wait: 'Please wait',
      fixInput: 'Check and try again',
    },
    offline: 'Check your data and try again. Scanning still works once a store is loaded.',
    // AD §10.3 SCAN-001, raised on the phone when the camera is unavailable or denied.
    scan001: 'Type the barcode number instead.',
    server: 'Try again. If it keeps happening, tell the store this reference.',
  },
} as const;

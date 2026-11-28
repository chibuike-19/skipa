# apps/shopper

**Owner:** frontend agent. The installable PWA "Skipa" at `shop.skipa.ng` (brief §6.1, §10).

```bash
pnpm --filter @skipa/shopper dev:mocks   # http://localhost:5173 against MSW
pnpm --filter @skipa/shopper build && pnpm --filter @skipa/shopper size && pnpm lhci
```

F0 is the shell: routing, device registration and the shopper session, error mapping, the
service worker (precached app shell), the manifest, the Opera Mini page (`/open-in-chrome.html`),
GlitchTip through the API tunnel, and the bundle and Lighthouse budgets. Screens arrive from F1.

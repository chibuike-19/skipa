// Shopper service worker (brief §10, AD §8.3). F0: the app shell is precached (versioned by
// Workbox) so Skipa opens offline to Skipa home (D-15); a new version applies on next launch.
// Catalogue caching (F2), brand assets and the outbox (F2/F3) are added with their features.
// Never intercepted: the API (incl. /v1/stream) and Paystack, which are other origins anyway.
/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (string | { url: string; revision: string | null })[];
};

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/open-in-chrome/, /^\/v1\//],
  }),
);

/*
  BetterU minimal service worker
  - Caches static assets (app shell) for basic offline support
  - Does NOT cache API responses
  - Does NOT intercept auth-sensitive routes
  - Read-only; no background sync, no notifications
*/

const CACHE_NAME = 'betteru-shell-v1';
const STATIC_ASSET_PATTERNS = [
  /^\/_next\/static\//,
  /\.css$/,
  /\.js$/,
  /^\/manifest\.json$/,
  /^\/favicon\.ico$/,
  /^\/icons\//,
  /^\/file\.svg$/,
  /^\/globe\.svg$/,
  /^\/vercel\.svg$/,
  /^\/next\.svg$/,
  /^\/window\.svg$/,
];

self.addEventListener('install', (event) => {
  // Skip waiting to allow immediate activation on first load
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if names don't match
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  // Take control of uncontrolled clients
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass non-same-origin requests entirely so the browser handles them
  // This prevents intercepting external scripts like Clerk/Stripe assets
  if (url.origin !== self.location.origin) {
    // Additionally bypass known Clerk domains explicitly
    const host = url.hostname;
    const isClerkHost =
      host === 'clerk.betteru.living' ||
      host === 'accounts.clerk.com' ||
      host === 'api.clerk.com' ||
      host.endsWith('.clerk.com') ||
      host.endsWith('.clerk.dev') ||
      host.endsWith('.clerk.accounts');
    if (isClerkHost) return;
    return;
  }

  // Avoid caching API and auth-sensitive routes
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')) {
    return; // let the network handle it
  }

  // Cache-first for static assets (app shell)
  const isStatic = STATIC_ASSET_PATTERNS.some((re) => re.test(url.pathname));
  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
            return response;
          })
          .catch(async () => {
            const cache = await caches.open(CACHE_NAME);
            const offline = await cache.match('/offline.html');
            return offline || Response.error();
          });
      })
    );
    return;
  }

  // Navigation requests: network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const offline = await cache.match('/offline.html');
        return offline || Response.error();
      })
    );
    return;
  }

  // For remaining same-origin GET requests, pass through to network explicitly
  event.respondWith(fetch(request));
});

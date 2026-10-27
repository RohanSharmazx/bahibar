/**
 * BahiBar Service Worker
 * Provides PWA installability, static shell asset caching, and a reliable offline fallback.
 * Strictly avoids caching write mutations or introducing unsafe offline writes.
 */

const CACHE_NAME = 'bahibar-shell-v1';

const STATIC_PRECACHE = [
  '/offline.html',
  '/manifest.json',
  '/brand/bahibar-icon.svg',
  '/brand/bahibar-logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Precache static shell assets during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle HTTP(S) GET requests; all mutations (POST, PUT, DELETE) pass directly to network
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Skip cross-origin requests, Supabase API calls, and Razorpay endpoints
  if (url.origin !== self.location.origin) {
    return;
  }

  // Next.js Server Actions or API routes must not be served stale
  if (url.pathname.startsWith('/api/') || request.headers.get('Next-Action')) {
    return;
  }

  // HTML page navigations: Network-first with offline.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await cache.match('/offline.html');
          return offlineFallback || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Next.js static chunks & public brand assets: Cache-first with network fallback
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/brand/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

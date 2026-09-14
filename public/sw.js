// Minimal service worker: caches the app shell for offline use.
// API calls (/api/*) and third-party CDN requests always go to the network -
// they're either dynamic (timezones, config, currency rates) or already
// browser-cached by their own CDN headers, so there's no reason to intercept them.
const CACHE_NAME = 'utility-tools-shell-v1';

const APP_SHELL = [
  '/',
  '/notes.html',
  '/calendar.html',
  '/profile.html',
  '/script.js',
  '/output.css',
  '/components/nav.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests, and never intercept the API.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline - fall back to cache if the network fails

      // Cache-first for instant loads; network still runs in the background to refresh the cache.
      return cached || network;
    })
  );
});

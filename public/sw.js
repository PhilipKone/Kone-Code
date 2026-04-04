const CACHE_NAME = 'kone-code-cache-v10';
const STATIC_ASSETS = [
  './logo-circle-blue.svg'
];

// Install: cache only truly static assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately, don't wait
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Take control of all pages immediately
  );
});

// Fetch: Network First for everything (offline fallback only)
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache static assets for offline use
        if (STATIC_ASSETS.some(a => event.request.url.includes(a.replace('./', '')))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // Fallback to cache if offline
  );
});

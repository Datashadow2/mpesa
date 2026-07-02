// sw.js - Service Worker for M-PESA Message Generator
// No external images needed - everything is self-contained

const CACHE_NAME = 'mpesa-cache-v1';
const REPO_PATH = '/mpesa';

// Files to pre-cache - only the essential files (no images)
const PRECACHE_URLS = [
  '/', // Root (GitHub Pages will serve index.html)
  `${REPO_PATH}/index.html`,
  `${REPO_PATH}/style.css`,
  `${REPO_PATH}/script.js`,
  `${REPO_PATH}/manifest.json`
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching offline assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Pre-cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Cache-First strategy with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Skip cross-origin requests (like Google Fonts)
  if (requestUrl.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-First Strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        console.log('[SW] Not in cache, fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Cache the network response for future offline use
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                })
                .catch(err => console.warn('[SW] Cache put failed:', err));
            }
            return networkResponse;
          })
          .catch(error => {
            console.warn('[SW] Network fetch failed:', error);
            // Return a simple offline response
            return new Response(
              'You are offline. Please connect to the internet and try again.',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
              }
            );
          });
      })
  );
});

// Version with timestamp for automatic cache invalidation
const CACHE_VERSION = 'medical-clinic-v1761955041817';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Critical assets to precache
const PRECACHE_URLS = [
  '/',
  '/login',
];

// Install event - precache critical assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('medical-clinic-v') &&
                                 cacheName !== STATIC_CACHE &&
                                 cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-first strategy for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests - always fetch from network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Determine caching strategy based on request type
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|ico)$/i.test(url.pathname);

  if (isStaticAsset) {
    // Cache-first for static assets (faster loading)
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Network-first for HTML and dynamic content (always fresh)
    event.respondWith(networkFirstStrategy(request));
  }
});

// Network-first strategy: Try network, fallback to cache, then offline page
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a navigation request and we have no cache, return home page
    if (request.mode === 'navigate') {
      const homeCache = await caches.match('/');
      if (homeCache) {
        return homeCache;
      }
    }

    // Nothing worked, throw error
    throw error;
  }
}

// Cache-first strategy: Try cache, fallback to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Only cache requests with supported schemes (http/https)
      const url = new URL(request.url);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        try {
          await cache.put(request, networkResponse.clone());
        } catch (cacheError) {
          // Ignore cache errors from unsupported schemes (chrome-extension, etc.)
          console.warn('Failed to cache request:', request.url, cacheError);
        }
      }
    }

    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Listen for messages from clients to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

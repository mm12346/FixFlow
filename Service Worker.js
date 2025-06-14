const CACHE_NAME = 'fixflow-cache-v1.3';

// A list of files to cache for the application shell
const urlsToCache = [
  '/',
  '/index.html' // Assumes the main file is named index.html
  // External assets like Google Fonts and TailwindCSS are typically handled
  // by the browser's cache and are tricky to cache here due to CORS.
  // The basic offline functionality will still work for the main app page.
];


self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the cached response
        if (response) {
          return response;
        }

        // Not in cache - fetch from the network
        return fetch(event.request);
      }
    )
  );
});


self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name is not in our whitelist, delete it
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

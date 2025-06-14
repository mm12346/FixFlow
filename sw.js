// Service Worker for FixFlow App (Vanilla Version)
console.log('Service Worker Loaded');

const CACHE_NAME = 'fixflow-cache-v1.5';
const urlsToCache = [
  '/',
  '/index.html',
  // คุณสามารถเพิ่มไฟล์ CSS หรือ JS อื่นๆ ที่นี่ได้
];

// Install event: cache application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});


// Push event: listen for incoming push messages
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  
  // Parse the data from the push event
  // เราคาดว่าข้อมูลจะมาในรูปแบบ JSON string
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'FixFlow Notification';
  const options = {
    body: data.body || 'You have a new update.',
    icon: './icon-192.png', // Path to an icon image
    badge: './icon-badge.png', // Path to a badge image (for Android)
    data: {
      url: data.url || '/' // URL to open when notification is clicked
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: handle user clicking on the notification
self.addEventListener('notificationclick', event => {
  event.notification.close(); // Close the notification

  // Open the URL specified in the push data, or the root URL
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});


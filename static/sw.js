const CACHE_NAME = 'streamium-v1';

// Install event (Prepares the app in the background)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Fetch event (Required by Chrome to enable PWA installation)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});


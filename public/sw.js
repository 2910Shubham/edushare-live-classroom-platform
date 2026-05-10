self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// A minimal fetch listener is required by PWA to trigger install prompts.
self.addEventListener('fetch', (event) => {
  // Just pass through all requests
});

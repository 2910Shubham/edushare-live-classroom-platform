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

// ─── Push Notification Handler ───────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      tag: data.data?.tag || 'edushare-notification',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'EduShare', options)
    );
  } catch (err) {
    console.error('Push event error:', err);
  }
});

// ─── Notification Click Handler ──────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise, open a new window
      return self.clients.openWindow(url);
    })
  );
});

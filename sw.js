self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Simple pass-through; customize cache behaviour here if desired
  event.respondWith(fetch(event.request));
});
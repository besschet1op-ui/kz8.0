// sw.js v4 — офлайн + пуши
var CACHE_NAME = 'km-engineer-v4';
var urlsToCache = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/apple-touch-icon.png'];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(urlsToCache); }).catch(function(){}));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    fetch(event.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); }).catch(function(){});
      return resp;
    }).catch(function () {
      return caches.match(event.request).then(function (c) { return c || caches.match('/index.html'); });
    })
  );
});

self.addEventListener('push', function (event) {
  if (!event.data) return;
  var payload;
  try { payload = event.data.json(); } catch (e) { payload = { title: 'КМ·Инженер', body: event.data.text() }; }
  var options = {
    body: payload.body || 'Новое событие',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: { url: payload.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(payload.title || 'КМ·Инженер', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) { if ('focus' in list[i]) return list[i].focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
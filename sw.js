// sw.js v5 — офлайн + умные пуши + открытие раздела по тапу
var CACHE_NAME = 'km-engineer-v5';
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
  var payload = {};
  if (event.data) { try { payload = event.data.json(); } catch (e) { payload = { body: event.data.text() }; } }
  var options = {
    body: payload.body || 'Новое событие',
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/icon.svg',
    tag: payload.tag || 'km',
    requireInteraction: !!payload.important,
    vibrate: [100, 50, 100],
    data: payload.data || {}
  };
  event.waitUntil(self.registration.showNotification(payload.title || 'КМ·Инженер', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var open = (event.notification.data && event.notification.data.open) || 'home';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) { list[i].focus(); return list[i].postMessage({ open: open }); }
      }
      if (self.clients.openWindow) return self.clients.openWindow('/?open=' + open);
    })
  );
});
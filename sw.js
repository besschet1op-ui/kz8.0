// sw.js — КМ·Инженер: офлайн + push-уведомления
var CACHE_NAME = 'km-engineer-v3';
var urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-touch-icon.png'
];

// Установка: кешируем оболочку приложения
self.addEventListener('install', function (event) {
  self.skipWaiting(); // активируем новый SW сразу, не ждём закрытия вкладок
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Активация: удаляем старые кеши
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim(); // берём управление над всеми вкладками сразу
});

// Стратегия: Network First для HTML/навигации, Cache First для остальных ресурсов
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);

  // Не кешируем запросы к Supabase и другим внешним API
  if (url.origin !== location.origin) return;

  // Для навигации (открытие приложения) — всегда сначала сеть, чтобы получать обновления
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (resp) {
          var copy = resp.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          return resp;
        })
        .catch(function () {
          return caches.match(event.request).then(function (c) {
            return c || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Для остальных ресурсов (иконки, шрифты, JS) — сначала кеш, потом сеть
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (resp) {
        if (resp && resp.status === 200) {
          var copy = resp.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        }
        return resp;
      }).catch(function () {
        return cached;
      });
    })
  );
});

// PUSH: показываем уведомление даже при закрытом приложении
self.addEventListener('push', function (event) {
  if (!event.data) return;

  var payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'КМ·Инженер', body: event.data.text() };
  }

  var options = {
    body: payload.body || 'Новое событие',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: { url: payload.url || '/' },
    tag: payload.tag || 'km-default' // группировка одинаковых пушей
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'КМ·Инженер', options)
  );
});

// Клик по уведомлению: открываем приложение или фокусируем существующее окно
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Если приложение уже открыто — фокусируем его
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf(targetUrl) !== -1 && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      // Иначе открываем новое окно
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Закрытие уведомления (опционально: можно логировать)
self.addEventListener('notificationclose', function (event) {
  // console.log('Уведомление закрыто:', event.notification.tag);
});
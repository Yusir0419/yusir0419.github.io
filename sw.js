/* 基础 Service Worker：缓存关键静态资源，提供离线兜底 */
const VERSION = 'v1-2025-09-30';
const CACHE_NAME = 'ting-cache-' + VERSION;
const URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/404.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/img/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('ting-cache-') && k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // 仅处理 GET

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((resp) => {
        // 成功则回写缓存（静态资源）
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => cached);

      // 优先使用缓存（cache-first），网络回源更新
      return cached || fetchPromise;
    }).catch(() => caches.match('/404.html'))
  );
});

// Smart Labo Works — Service Worker
// オフライン対応 & PWAインストール対応

const CACHE_NAME = 'slw-v2'; // Task7: CRM/案件/契約のサーバー永続化に伴いキャッシュを更新
const ASSETS = [
  '/app.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/services/aiService.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

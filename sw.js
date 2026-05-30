/**
 * Smart Labo - TOEIC英単語帳 Service Worker
 * キャッシュファーストで高速起動・オフライン対応
 */

const CACHE_NAME = 'smartlabo-toeic-v1';

// キャッシュ対象ファイル
const CACHE_FILES = [
  '/smartlabo-toeic/',
  '/smartlabo-toeic/index.html',
  '/smartlabo-toeic/manifest.json',
];

// ===== インストール: リソースをキャッシュ =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app files');
      return cache.addAll(CACHE_FILES);
    }).catch((err) => {
      // キャッシュ失敗しても続行
      console.warn('[SW] Cache failed:', err);
    })
  );
  self.skipWaiting();
});

// ===== アクティベート: 古いキャッシュを削除 =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ===== フェッチ: キャッシュファーストで応答 =====
self.addEventListener('fetch', (event) => {
  // POST等は無視
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // キャッシュがあれば即返す（バックグラウンドで更新）
        fetch(event.request)
          .then((fresh) => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, fresh.clone());
              });
            }
          })
          .catch(() => {});
        return cached;
      }
      // キャッシュなしはネットワーク
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      }).catch(() => {
        // オフライン時: index.htmlをフォールバック
        return caches.match('/smartlabo-toeic/index.html');
      });
    })
  );
});

/**
 * Dart AR Trainer – service-worker.js
 * PWA Offline-Unterstützung
 */

const CACHE_NAME = 'dart-ar-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// ── Installation: Assets cachen ───────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ── Aktivierung: Alte Caches löschen ─────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache-First für eigene Assets, Network für CDN ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CDN-Ressourcen (MindAR, A-Frame) immer vom Netz laden
  if (url.origin !== location.origin) {
    return; // Browser-Standard
  }

  // targets.mind nie cachen (kann sich ändern)
  if (url.pathname.endsWith('.mind')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

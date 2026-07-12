// WalkForLife - Service Worker
// Estrategia: responde desde caché si existe, y en paralelo va a la red
// para actualizar la caché de cara a la siguiente visita (cache-first
// con actualización en segundo plano). Permite uso offline tras la
// primera carga exitosa.

const CACHE_NAME = 'walkforlife-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(e.request);
      const networkFetch = fetch(e.request)
        .then((response) => {
          if (response && response.ok) cache.put(e.request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

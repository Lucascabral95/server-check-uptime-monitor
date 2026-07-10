// Esta app no usa service worker. Este archivo existe solo como "kill switch":
// si un navegador todavía tiene registrado un service worker viejo de una
// versión anterior del sitio (o de otro proyecto que corrió antes en el mismo
// puerto), lo desregistra y limpia sus caches en vez de dejarlo reintentando
// para siempre contra una URL que antes devolvía 404.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});

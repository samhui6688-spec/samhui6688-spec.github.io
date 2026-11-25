// Aevos moved to https://aevos-hk.github.io/ . This worker replaces the old one, clears its caches, unregisters itself and reloads open pages.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('aevos-')) await caches.delete(k);
  const pages = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  await self.registration.unregister();
  for (const c of pages) { const p = new URL(c.url).pathname; if (p.startsWith('/aevos/') && !p.startsWith('/aevos/blueprint')) c.navigate('https://aevos-hk.github.io/').catch(() => {}); }
})()));

// Aevos service worker. Caches same-origin static files only; never caches API responses or health data.
const V = '2cf32cc89399', SHELL = 'aevos-shell-' + V, ASSET = 'aevos-asset-v2';
const FILES = ["./","manifest.webmanifest","icons/icon-192.png","assets/index-DxURyzDo.js","assets/Assistant-DCmlcO69.js","assets/Bio-BodaI3hV.js","assets/Body-C1HmidwZ.js","assets/Chat-D7s9OUXI.js","assets/Hub-YzTy8kFG.js","assets/Reports-BPliwiUx.js","assets/Settings-6bjZ68qK.js","assets/kit-E6xKXmA2.js","assets/scale-DYd7RSji.js","assets/store-xgeHmHpp.js","assets/hanken-grotesk-latin-wght-normal-CaVRRdDk.woff2","assets/index-BCtWdanb.css"];
const BASE = new URL('./', self.location).pathname;
self.addEventListener('install', e => e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))));
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('aevos-') && k !== SHELL && k !== ASSET) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(BASE) || u.pathname.startsWith(BASE + 'blueprint')) return;
  const p = u.pathname.slice(BASE.length);
  if (r.mode === 'navigate') {
    // Network first so a new release shows immediately; cached shell only when offline.
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(x => x.ok ? x : Promise.reject()).catch(async () => (await caches.match(BASE, { cacheName: SHELL, ignoreVary: true })) || Response.error()));
  } else if (/^(models|structures|vendor|assets|icons)\//.test(p)) {
    e.respondWith((async () => {
      const hit = await caches.match(r, { ignoreVary: true }); if (hit) return hit;
      const x = await fetch(r);
      if (x.ok && x.status === 200 && /^(models|structures|vendor)\//.test(p)) { const c = x.clone(); e.waitUntil(caches.open(ASSET).then(k => k.put(r, c)).catch(() => {})); }
      return x;
    })());
  }
});

// Aevos service worker. Caches same-origin static files only; never caches API responses or health data.
const V = '7c8f39d025a0', SHELL = 'aevos-shell-' + V, ASSET = 'aevos-asset-v2';
const FILES = ["./","manifest.webmanifest","icons/icon-192.png","assets/index-DTbtNLFM.js","assets/Assistant-DiSDS7HG.js","assets/Bio-Co6chCSW.js","assets/Body-B4YTrqVY.js","assets/Chat-DiOQaxxs.js","assets/Hub-D7-jfogv.js","assets/Jarvis-BY0lYxT1.js","assets/JarvisProvider-lOcTqgD2.js","assets/Reports-DUaq5kDM.js","assets/Settings-CERoJA1M.js","assets/data-C5d-hbaN.js","assets/gateway-Bty5H4gH.js","assets/kit-CpRqe84H.js","assets/scale-DYd7RSji.js","assets/store-BOc52Tzz.js","assets/hanken-grotesk-latin-wght-normal-CaVRRdDk.woff2","assets/index-D4xMulJu.css"];
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
  } else if (/^(models|structures|vendor|assets|icons|images)\//.test(p)) {
    e.respondWith((async () => {
      const hit = await caches.match(r, { ignoreVary: true }); if (hit) return hit;
      const x = await fetch(r);
      if (x.ok && x.status === 200 && /^(models|structures|vendor)\//.test(p)) { const c = x.clone(); e.waitUntil(caches.open(ASSET).then(k => k.put(r, c)).catch(() => {})); }
      return x;
    })());
  }
});

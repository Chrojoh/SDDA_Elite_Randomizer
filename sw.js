const scope = self.registration.scope;
const cachePrefix = "sdda-elite:" + scope + ":";
const cacheName = cachePrefix + "10";
const app = new URL("SDDA-Elite.html", scope).href;
const assets = [
  "./", "./index.html", "./SDDA-Elite.html", "./manifest.webmanifest",
  "./icons/elite-192.png", "./icons/elite-512.png",
].map(path => new URL(path, scope).href);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);
  url.search = "";
  if (request.method !== "GET" || !assets.includes(url.href)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(url.href);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return fetch(request).catch(async () => (await cache.match(app)) || Response.error());
    }
    return fetch(request);
  })());
});

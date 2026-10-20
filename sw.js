/* FLAPPY SATS service worker — offline app shell. v16.2.3.
   Only same-origin GETs are cached; API calls, cross-origin requests
   and non-GETs always hit the network. Bump CACHE to ship updates. */
const CACHE = "popicoin-shell-v22";
const SHELL = ["./", "./index.html", "./qrcode.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./art/bg-far.webp", "./art/bg-mid.webp", "./art/bg-fg.webp",
  "./art/col-o-hang.png", "./art/col-o-stand.png", "./art/col-f-hang.png", "./art/col-f-stand.png",
  "./art/bird-green.png", "./art/bird-orange.png", "./art/bird-gold.png", "./art/bb-frame.png",
  "./art/frame-tex.webp", "./art/medallion.webp", "./art/zombies.webp", "./art/road.webp",
  "./audio/wilhelm.ogg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/.netlify/")) return;   // never cache the API
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});

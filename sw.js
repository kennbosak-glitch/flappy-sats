/* FLAPPY SATS service worker — offline app shell.
   Only same-origin GETs are cached; API calls, cross-origin requests
   and non-GETs always hit the network. Bump CACHE to ship updates. */
const CACHE = "popicoin-shell-v9";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png",
  "/art/bg-portrait.webp", "/art/bg-landscape.webp",
  "/art/pipe-o-hang-tl.png", "/art/pipe-o-hang-tr.png", "/art/pipe-o-stand-bl.png", "/art/pipe-o-stand-br.png",
  "/art/pipe-f-hang-tl.png", "/art/pipe-f-stand-bl.png", "/art/pipe-f-stand-br.png",
  "/art/bird-hq.png", "/art/tape-strip.png",
  "/art/frame-tex.webp", "/art/medallion.webp", "/art/zombies.webp", "/art/road.webp",
  "/audio/wilhelm.ogg"];

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

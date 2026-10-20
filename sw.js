/* FLAPPY SATS service worker — offline app shell. v16.4.1.
   Only same-origin GETs are cached; API calls, cross-origin requests
   and non-GETs always hit the network. Bump CACHE to ship updates.
   v16.4 — THE LIVE FEED: sponsors.json (the sponsor playlist) and
   version.json (the update signal) are NETWORK-ONLY — they are
   deliberately NOT in the SHELL and the fetch handler bypasses the
   cache for them, so a playlist edit or a version bump is seen by
   every open copy on its next 60 s poll, never a stale copy from
   the shell cache. Offline, the last network-fetched copy (kept in
   the cache by the handler below) is the fallback. The handler also
   answers the update button's SKIP_WAITING message. */
const CACHE = "popicoin-shell-v25";
const SHELL = ["./", "./index.html", "./qrcode.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./art/bg-far.webp", "./art/bg-mid.webp", "./art/bg-fg.webp",
  "./art/col-o-hang.png", "./art/col-o-stand.png", "./art/col-f-hang.png", "./art/col-f-stand.png",
  "./art/bird-green.png", "./art/bird-orange.png", "./art/bird-gold.png", "./art/bb-frame.png",
  "./art/sponsor-001.png",
  "./art/frame-tex.webp", "./art/medallion.webp", "./art/zombies.webp", "./art/road.webp",
  "./audio/wilhelm.ogg"];

/* Paths that must never be served stale from the cache (v16.4). */
const LIVE_JSON = ["/sponsors.json", "/version.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* v16.4: the update button's tap asks a waiting worker to take over
   NOW; the page then reloads once (its own sessionStorage guard
   prevents reload loops). */
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/.netlify/")) return;   // never cache the API
  if (LIVE_JSON.some(p => url.pathname.endsWith(p))) {
    /* v16.4: network-only for the playlist + version files. The
       page's cache-busting query is stripped — the canonical clean
       URL is what gets cached as the offline fallback copy. */
    const clean = url.origin + url.pathname;
    e.respondWith((async () => {
      try {
        const res = await fetch(clean, { cache: "no-store" });
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(clean, copy));
        return res;
      } catch (err) {
        const hit = await caches.match(clean);
        if (hit) return hit;
        throw err;
      }
    })());
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});

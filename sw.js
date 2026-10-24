/* FLAPPY SATS service worker — RETIRED (v16.6.14, Oct 23 Gate 3).
   The worker is the prime suspect in the installed-app image failure
   (every Image() load errors in the WebAPK while fetch/XHR succeed,
   surviving reinstall + URL versioning). If a stale registration
   fetches this file as an update, it purges every cache, unregisters
   itself, and reloads its windows uncontrolled. The page also
   unregisters + purges on load and registers nothing. */
self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    try {
      const ks = await caches.keys();
      await Promise.all(ks.map(k => caches.delete(k)));
      await self.registration.unregister();
      const cs = await self.clients.matchAll({ type: "window" });
      cs.forEach(c => { try { c.navigate(c.url); } catch (err) {} });
    } catch (err) {}
  })());
});

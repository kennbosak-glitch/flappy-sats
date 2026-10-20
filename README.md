# FLAPPY SATS — Escape Fiat Trash

**BETA / DEMO build.** A trash-world flappy game: fly the coin-bird through stacks of fiat trash, dodge the horde, stack sats.

## Play

Open the GitHub Pages link for this repo in any browser. Tap, click, or press spacebar to flap.

- 1 sat per pipe (DEMO accounting, on-device only in this build)
- Pipes start moving after pipe 20 — watch for the telegraph
- Installable: use your browser's "Add to Home Screen" / Install option and it runs full-screen like a native app, offline after first load

## Tech

One HTML page + service worker + manifest. No build step, no dependencies. Mechanics measured from the original 2014 Flappy Bird APK (fixed-step 60 Hz, gravity 0.3, flap −5.0, gap 96 units).

Art and audio are the project's own. Death scream: the Wilhelm scream (CC0, Sunset Editorial session via Freesound).

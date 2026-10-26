# Flappy Sats

A Flappy-style arcade game that pays in Bitcoin Cash sats — 1 sat per pipe —
with a sponsor billboard in the menu that anyone can rent on a public ladder
(slot *n* = $1.00 × *n*, paid in BCH).

**▶ Play it live: https://kennbosak-glitch.github.io/flappy-sats/**
(portrait — it's a phone game; it works in any modern browser, nothing to install)

## Features

- **Six world art sets in the engine** — Classic · Muse · Space Trash · Junkfall ·
  E-Waste · Haz-Scrap. The launch build plays **Junkfall**; every set ships in
  this repo and wires through the same world registry
- **Silhouette collision** — pipe colliders are generated from the art's own
  alpha channel, so what you see is exactly what you hit
- **Sats economy** — 1 sat per pipe · $0.10 daily cap · $1.00 claim threshold
- **Sponsor billboard** — rotating cards, sold publicly, verified on payment
- **Self-updating** — the game polls `version.json` and applies updates at safe
  moments (never mid-run)
- **Zero build step** — plain HTML/CSS/JS; view-source is the docs. (`sw.js` is a RETIRED stub kept only so stale registrations purge their caches and unregister themselves — updates ship via `version.json` polling, never a service worker.)

## Run it locally

```sh
# any static server works
python3 -m http.server 8080
# → http://localhost:8080
```

## Project layout

| File | What it is |
|---|---|
| `index.html` | The whole game shell: UI, economy, settings, billboard |
| `theme-system.js` | World registry + layer rendering (native-res, mirror-tiled) |
| `pipe-collision.js` | Alpha-silhouette collider builder |
| `sw.js` | Service worker (versioned shell cache) |
| `version.json` | The self-update poll target |
| `sponsors.json` | Billboard cards (image + buyer + paid sats) |
| `art/` | World layers and column art at native resolution |

## Make your own world

See **BUILD-YOUR-OWN.md** — art dimensions, the world-registry pattern, the
silhouette-collision rules, and how to wire a new world in an afternoon.

## The build story

How this was actually built — AI briefs, graded returns, playtest bug loops,
and a ship blocker fixed without drawing a single new pixel: [BUILD-STORY.md](BUILD-STORY.md)

## License

Code: **MIT** — see `LICENSE`. Art & audio: **© Kenn Bosak, all rights reserved** — see `ASSETS.md`.

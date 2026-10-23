

# Build Your Own Flappy Sats

Flappy Sats is deliberately boring technology: one HTML file, two JS modules,
a service worker, and PNGs. No framework, no bundler, no build step. If you can
open dev tools, you can rebuild this game. This outline is the map.

## 1. The shape of the thing

- `index.html` — game loop (canvas), menus, settings, economy, billboard.
  State lives in the page; accounts are local until you add a backend.
- `theme-system.js` — everything visual is a *world*: a registry entry with
  layer art, a column (pipe) set, and draw functions for far/mid/foreground.
- `pipe-collision.js` — builds a collider from a column image's alpha channel
  at world load, so collision always matches the art you shipped.
- `sw.js` + `version.json` — the self-update rail: the page polls
  `version.json`; on a mismatch it applies the new shell at a safe moment
  (menu / game-over — never mid-run), guarded so it reloads exactly once.

## 2. Anatomy of a world (the art spec)

| Layer | Size | Notes |
|---|---|---|
| Far (sky) | 2048×1024 | Mirror-tiled horizontally; keep the horizon calm |
| Mid | 2048×1024 | The silhouette band; audit it — transparent pockets read as black voids in-game |
| Foreground | 2048×512 | Sits on the ground anchor |
| Column (pipe) | 512×2048 single piece | One tall artwork, not cap+body splits; the engine places it standing and hanging |

Rules the hard way taught us:
- Layers ship at **100% native resolution** — never let the engine upscale.
- **Audit alpha coverage** of mid/fg before wiring (a quick histogram pass).
  Sparse art is the #1 visual bug class in this engine.
- Keep the key color OUT of the subject when generating art (house key:
  magenta `#FF00FF`) and fill interior holes before shipping the set.
- If a set's column art is oriented mouth-at-bottom, ship/point at its hang
  variant — check which end the strong cluster sits on before wiring.
- Mirror tiling means your left and right edges must agree — design for the wrap.

## 3. Wiring a new world (the pattern)

1. Drop the five files into `art/` with the world's prefix.
2. Add one entry to the world registry (`WSETS`): id, display name, layer
   paths, column path (+ fire variant if the set has one — if it doesn't,
   point fire at the regular column; don't invent art).
3. The registry entry automatically joins: the random roll (never-repeat —
   the roller excludes the previously played world), the Settings → WORLD
   button grid, and the silhouette-collision path.
4. Bump `version.json`, `BUILD_VERSION`, and the SW cache name together —
   all three, every time, or the self-update rail lies to somebody.

## 4. The sponsor billboard

- `sponsors.json` is a plain list: `{image, username, paidSats}` per card.
- The menu rotates cards on one global clock (3 s/card); the file is polled
  (60 s), so a new sponsor appears without a redeploy of the game code.
- Our ladder: slot *n* = $1.00 × *n*, counter ticks on **verified payment**,
  never on a button press. Steal the rule even if you change the prices.

## 5. Deploy

Any static host works (we use GitHub Pages for live, Netlify for test twins):
serve the folder, make sure `sw.js` is sent `Cache-Control: no-store`, and
never cache `version.json` hard — the update rail depends on it being fresh.

## 6. House rules worth stealing

- Portrait is the ship gate; test on a real phone, with a screen recording.
- Verify from the player's side: signed out, fresh fetch, live URL.
- The bird never changes. Skins are art, not mechanics.

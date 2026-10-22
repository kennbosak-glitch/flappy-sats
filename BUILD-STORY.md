# Flappy Sats — the build story

**Play it: https://kennbosak-glitch.github.io/flappy-sats/**

Flappy Sats is a Flappy-style arcade game that pays out in Bitcoin Cash sats:
1 sat per pipe, a daily cap, and a billboard in the menu that real sponsors
rent with BCH. Slot *n* costs $1.00 × *n*. Three slots are sold — 00TATT$,
a second buyer whose creative is still in the works, and CASPER404, who paid
1,060,000 sats for slot #3. Next up is #4 at $4.00.

This is the story of the multi-world build-off — receipts, not vibes.

## The arc

- **v16.4.3 (live)** — the hardening release: a stale "MOVING PIPES AHEAD"
  freeze warning deleted, the sponsor billboard fixed for portrait, the pipe
  pool rebuilt around screen width, parallax retuned, backgrounds repaired,
  and a self-update rail that polls a version file and applies updates at safe
  moments. It later field-proved itself by updating a live player session.
- **The Muse world** — an AI-generated junkyard world wired the hard way:
  far/mid/foreground layers at 100% native resolution (2048×1024 / 2048×512),
  mirror-tiled so the seams can't show, and collision taken from the art
  itself — the pipe collider is built from the column art's alpha silhouette,
  not from rectangles that pretend to match the picture.
- **The playtest bug loop** — Kenn plays every build on his phone and sends a
  screen recording. Skynet frame-reviews it. On the Muse world that loop
  caught what the harnesses couldn't: Bug #1, the mid layer sat wrong; Bug #2,
  a bottom-only rendering fault. Both fixed and re-verified in-engine.
- **The black-pocket blocker (v16.5.1 → 16.5.2)** — Kenn's verdict on 16.5.1:
  mechanically clean, but the Muse mid/foreground layers had empty pockets
  that rendered as black voids. A ship blocker. Measured, not eyeballed:
  muse-mid alpha coverage was 35.59% with some columns fully transparent;
  muse-fg was 38.01%. The fix used *no new art and no AI regeneration* — only
  copy/paste, flips, and repositioning of elements already inside each strip,
  wrap-aware so the mirror seam survives, feathered so no stamp lands with a
  hard edge. The mascot and the robot-girl figure were deliberately NOT
  duplicated. Result: muse-mid **35.59% → 45.52%**, muse-fg **38.01% → 41.66%**,
  zero fully transparent columns left, regression **24/24**.
- **Six worlds (v16.6.0)** — the wiring build generalized the Muse pattern
  into a world registry: Classic · Muse · Space Trash · Junkfall · E-Waste ·
  Haz-Scrap, all in a never-repeat random roll, all pickable in
  Settings → WORLD, every one colliding on its own art's silhouette
  (98.94–99.70% stand/hang agreement in the harness grids). Regression 62/63 —
  and the one failing check was proven to be an environment artifact by
  running the pristine previous build as a control: it failed identically,
  to the decimal.

## How it was built

- **The DeepSeek shuttle (7/7):** Skynet wrote the briefs, DeepSeek drafted
  text/code, Skynet graded every return with real harnesses before anything
  shipped. Seven briefs, seven returns, seven passes, two patches. No
  unreviewed code has ever touched this game.
- **The security detour:** a security trio (cheat surface, sponsor-intake
  validation, account recovery design) was audited mid-build and folded into
  the deploy plan rather than bolting on after launch. The in-game anti-cheat
  ("Auntie Cheat") flags in shadow mode — it never convicts on its own.
- **The doctrines that survived contact:** portrait is the ship gate (the
  landscape mode lives, parked as a later unlock); the bird never changes —
  a skin is art, not a mechanic; every layer ships at native resolution;
  and nothing is "done" until it's verified from the player's side of the
  glass, signed out, on the live URL.

## The receipts

- Live: v16.5.2 at the link above (shipped Oct 22, 2026 on the builder's playtest word)
- Six-world build: regression 62/63 with a control-proven environment flake
- Art-density fix: 17 stamps total, 0 new pixels drawn, coverage numbers above
- Sponsors: 3 sold on a public $1×n ladder, paid in BCH, cards rotating live

Built by Kenn Bosak + Skynet (Muse), in the open, one verified step at a time.

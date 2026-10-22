/**
 * theme-system.js
 * Multi-world theme manager for the game. Exposes window.ThemeSystem.
 */
(function (global) {
  'use strict';

  var ASSET_KEYS = ['sky', 'mid', 'fg', 'pipe', 'pipeFire'];
  var RANDOM = 'random';
  var FALLBACK_ID = 'classic';
  var DEFAULT_STORAGE_KEY = 'flappy.theme';
  var MAX_TILES = 4096;

  var imagePromises = new Map();
  var worldPromises = new Map();

  var state = {
    worlds: [],
    byId: Object.create(null),
    setting: RANDOM,
    active: null,
    storageKey: DEFAULT_STORAGE_KEY,
    pendingId: null,
    pendingPromise: null,
    bgStarted: false
  };

  function readStored(key) {
    try {
      return global.localStorage ? global.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      if (global.localStorage) global.localStorage.setItem(key, value);
    } catch (e) { /* private mode / quota: ignore */ }
  }

  function normalizeWorld(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.id !== 'string' || raw.id.length === 0) return null;

    var src = raw.assets;
    if (!src || typeof src !== 'object') return null;

    var assets = {};
    for (var i = 0; i < ASSET_KEYS.length; i++) {
      var key = ASSET_KEYS[i];
      var url = src[key];
      if (typeof url !== 'string' || url.length === 0) return null;
      assets[key] = url;
    }

    var world = {};
    for (var k in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, k)) world[k] = raw[k];
    }
    world.id = raw.id;
    world.name = (typeof raw.name === 'string' && raw.name.length) ? raw.name : raw.id;
    world.assets = assets;
    return world;
  }

  function validateSetting(value) {
    if (typeof value !== 'string') return null;
    if (value === RANDOM) return RANDOM;
    return state.byId[value] ? value : null;
  }

  function resolveActive(setting) {
    if (!state.worlds.length) return null;
    if (setting === RANDOM) {
      return state.worlds[Math.floor(Math.random() * state.worlds.length)];
    }
    return state.byId[setting] || state.worlds[0];
  }

  function loadImage(url) {
    if (typeof url !== 'string' || url.length === 0) return Promise.resolve(null);
    if (imagePromises.has(url)) return imagePromises.get(url);

    var p = new Promise(function (resolve) {
      var img;
      try {
        img = new global.Image();
      } catch (e) {
        resolve(null);
        return;
      }
      img.onload = function () {
        img.onload = img.onerror = null;
        resolve(img);
      };
      img.onerror = function () {
        img.onload = img.onerror = null;
        resolve(null);
      };
      try {
        img.src = url;
      } catch (e) {
        resolve(null);
      }
    });

    imagePromises.set(url, p);
    return p;
  }

  function preloadWorld(world) {
    if (!world || !world.assets) {
      return Promise.resolve({ ok: false, images: null });
    }
    var id = world.id;
    if (worldPromises.has(id)) return worldPromises.get(id);

    var jobs = ASSET_KEYS.map(function (key) {
      return loadImage(world.assets[key]);
    });

    var p = Promise.all(jobs).then(function (list) {
      var images = {};
      var ok = true;
      for (var i = 0; i < ASSET_KEYS.length; i++) {
        var img = list[i] || null;
        images[ASSET_KEYS[i]] = img;
        if (!img) ok = false;
      }
      return { ok: ok, images: images };
    }, function () {
      return { ok: false, images: null };
    });

    worldPromises.set(id, p);
    return p;
  }

  function startBackground(activeId) {
    if (state.bgStarted) return;
    state.bgStarted = true;

    var queue = state.worlds.filter(function (w) { return w.id !== activeId; });
    var i = 0;

    function next() {
      if (i >= queue.length) return;
      var w = queue[i++];
      preloadWorld(w).then(next, next);
    }

    next();
    next();
  }

  function init(manifest, options) {
    options = options || {};

    state.storageKey = (typeof options.storageKey === 'string' && options.storageKey.length)
      ? options.storageKey
      : DEFAULT_STORAGE_KEY;

    state.worlds = [];
    state.byId = Object.create(null);
    state.active = null;
    state.pendingId = null;
    state.pendingPromise = null;
    state.bgStarted = false;
    ThemeSystem.degraded = false;

    var list = Array.isArray(manifest) ? manifest : [];
    for (var i = 0; i < list.length; i++) {
      var world = null;
      try {
        world = normalizeWorld(list[i]);
      } catch (e) {
        world = null;
      }
      if (!world) continue;
      if (state.byId[world.id]) continue;
      state.byId[world.id] = world;
      state.worlds.push(world);
    }

    var stored = validateSetting(readStored(state.storageKey));
    state.setting = stored || RANDOM; // SKYNET PATCH 2026-10-22: fresh players default to Random (Kenn: 'random for the win'); DeepSeek's original defaulted to the first world fixed.
    state.active = resolveActive(state.setting);

    return ThemeSystem;
  }

  function setSetting(value) {
    var v = validateSetting(value);
    if (!v) return state.setting;

    state.setting = v;
    writeStored(state.storageKey, v);

    if (v !== RANDOM) {
      var world = state.byId[v];
      if (world) state.active = world;
    } else if (!state.active) {
      state.active = resolveActive(RANDOM);
    }
    return state.setting;
  }

  function getSetting() {
    return state.setting;
  }

  function current() {
    return state.active || null;
  }

  function rollAfterGameOver() {
    var worlds = state.worlds;
    if (!worlds.length) {
      state.active = null;
      return null;
    }

    if (state.setting === RANDOM) {
      if (worlds.length === 1) {
        state.active = worlds[0];
        return state.active;
      }
      var currentId = state.active ? state.active.id : null;
      var pool = worlds.filter(function (w) { return w.id !== currentId; });
      if (!pool.length) pool = worlds;
      state.active = pool[Math.floor(Math.random() * pool.length)];
      return state.active;
    }

    state.active = state.byId[state.setting] || worlds[0];
    return state.active;
  }

  function preload() {
    var active = state.active;
    if (!active && state.worlds.length) {
      active = resolveActive(state.setting);
      state.active = active;
    }
    if (!active) {
      ThemeSystem.degraded = true;
      return Promise.resolve(null);
    }

    if (state.pendingPromise && state.pendingId === active.id) {
      return state.pendingPromise;
    }

    var promise = preloadWorld(active).then(function (res) {
      if (res && res.ok) {
        startBackground(active.id);
        return res.images;
      }

      var fallback = state.byId[FALLBACK_ID];
      if (fallback && fallback.id !== active.id) {
        return preloadWorld(fallback).then(function (fres) {
          if (fres && fres.ok) {
            state.active = fallback;
            startBackground(fallback.id);
            return fres.images;
          }
          ThemeSystem.degraded = true;
          startBackground(active.id);
          return (fres && fres.images) || (res && res.images) || null;
        });
      }

      ThemeSystem.degraded = true;
      startBackground(active.id);
      return (res && res.images) || null;
    });

    state.pendingId = active.id;
    state.pendingPromise = promise;
    return promise;
  }

  function drawFar(ctx, img, x, width, height) {
    if (!ctx || !img) return;

    width = +width;
    height = +height;
    if (!(width > 0) || !(height > 0) || !isFinite(width) || !isFinite(height)) return;

    var iw = img.naturalWidth || img.width || 0;
    if (!iw) return;

    var off = (typeof x === 'number' && isFinite(x)) ? x : 0;
    var viewW = (ctx.canvas && ctx.canvas.width) ? ctx.canvas.width : width;

    var k0 = Math.floor(-off / width) - 1;
    var k1 = Math.ceil((viewW - off) / width) + 1;
    if (!isFinite(k0) || !isFinite(k1) || (k1 - k0) > MAX_TILES) return;

    try {
      for (var k = k0; k <= k1; k++) {
        var dx = off + k * width;
        var flipped = (((k % 2) + 2) % 2) === 1;

        if (!flipped) {
          ctx.drawImage(img, dx, 0, width, height);
        } else {
          ctx.save();
          ctx.translate(dx + width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, width, height);
          ctx.restore();
        }
      }
    } catch (e) {
      /* never break the game loop over a bad draw */
    }
  }

  var ThemeSystem = {
    degraded: false,
    init: init,
    setSetting: setSetting,
    getSetting: getSetting,
    current: current,
    rollAfterGameOver: rollAfterGameOver,
    preload: preload,
    drawFar: drawFar
  };

  global.ThemeSystem = ThemeSystem;
})(typeof window !== 'undefined' ? window : this);

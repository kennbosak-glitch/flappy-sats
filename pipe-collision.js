(function (global) {
  'use strict';

  var DEFAULT_THRESHOLD = 128;

  function toInt(v, fallback) {
    var n = Math.floor(+v);
    return isFinite(n) ? n : fallback;
  }

  function makeCollider(alpha, width, height, threshold) {
    var W = toInt(width, 0);
    var H = toInt(height, 0);
    if (W < 0) W = 0;
    if (H < 0) H = 0;

    var thr = (typeof threshold === 'number' && isFinite(threshold)) ? threshold : DEFAULT_THRESHOLD;

    var hasAlpha = !!alpha && typeof alpha.length === 'number';
    var len = hasAlpha ? alpha.length : 0;

    var spans = new Array(H);

    var minXAll = -1, minYAll = -1, maxXAll = -1, maxYAll = -1;
    var rowsWithContent = 0, widestRow = -1, widestSpan = 0;

    if (hasAlpha && W > 0 && H > 0) {
      for (var y = 0; y < H; y++) {
        var base = y * W;
        var lo = -1, hi = -1;
        for (var x = 0; x < W; x++) {
          var i = base + x;
          if (i < len && alpha[i] >= thr) {
            if (lo < 0) lo = x;
            hi = x;
          }
        }
        if (lo < 0) {
          spans[y] = null;
          continue;
        }
        spans[y] = [lo, hi];
        rowsWithContent++;
        if (minYAll < 0) minYAll = y;
        maxYAll = y;
        if (minXAll < 0 || lo < minXAll) minXAll = lo;
        if (hi > maxXAll) maxXAll = hi;
        var w = hi - lo + 1;
        if (w > widestSpan) { widestSpan = w; widestRow = y; }
      }
    } else {
      for (var y2 = 0; y2 < H; y2++) spans[y2] = null;
    }

    var bbox = rowsWithContent > 0
      ? { minX: minXAll, minY: minYAll, maxX: maxXAll, maxY: maxYAll }
      : null;

    function hitTest(bird, pipe) {
      if (!bbox || !bird || !pipe) return false;

      var bx = +bird.x, by = +bird.y, br = +bird.r;
      if (!isFinite(bx) || !isFinite(by) || !isFinite(br) || br <= 0) return false;

      var px = +pipe.x, py = +pipe.y, sc = +pipe.scale;
      if (!isFinite(px) || !isFinite(py) || !isFinite(sc) || sc <= 0) return false;

      var flip = !!pipe.flipY;

      var gx0 = px + bbox.minX * sc;
      var gx1 = px + (bbox.maxX + 1) * sc;
      var gy0 = flip ? py + (H - bbox.maxY - 1) * sc : py + bbox.minY * sc;
      var gy1 = flip ? py + (H - bbox.minY) * sc     : py + (bbox.maxY + 1) * sc;

      var nx = bx < gx0 ? gx0 : (bx > gx1 ? gx1 : bx);
      var ny = by < gy0 ? gy0 : (by > gy1 ? gy1 : by);
      var ddx = bx - nx, ddy = by - ny;
      if (ddx * ddx + ddy * ddy > br * br) return false;

      var inv = 1 / sc;
      var ix = (bx - px) * inv;
      var vTop = (by - py) * inv;
      var iy = flip ? (H - vTop) : vTop;
      var ir = br * inv;

      if (!isFinite(ix) || !isFinite(iy) || !isFinite(ir)) return false;

      var lo = Math.floor(iy - ir) - 1;
      var hi = Math.floor(iy + ir) + 1;
      if (lo < 0) lo = 0;
      if (hi > H - 1) hi = H - 1;
      if (lo > hi) return false;

      for (var y = lo; y <= hi; y++) {
        var sp = spans[y];
        if (sp === null) continue;

        var dy;
        if (y > iy) dy = y - iy;
        else if (y + 1 < iy) dy = iy - (y + 1);
        else dy = 0;
        if (dy > ir) continue;

        var hc2 = ir * ir - dy * dy;
        if (hc2 < 0) continue;
        var hc = Math.sqrt(hc2);

        if (ix + hc >= sp[0] && ix - hc <= sp[1] + 1) return true;
      }

      return false;
    }

    return {
      width: W,
      height: H,
      threshold: thr,
      spans: spans,
      bbox: bbox,
      hitTest: hitTest
    };
  }

  function spansSummary(collider) {
    var out = {
      rowsWithContent: 0,
      contentTop: -1,
      contentBottom: -1,
      widestRow: -1,
      widestSpan: 0
    };
    if (!collider || !collider.spans) return out;

    var spans = collider.spans;
    var n = spans.length;

    for (var y = 0; y < n; y++) {
      var s = spans[y];
      if (!s) continue;
      out.rowsWithContent++;
      if (out.contentTop < 0) out.contentTop = y;
      out.contentBottom = y;
      var w = s[1] - s[0] + 1;
      if (w > out.widestSpan) {
        out.widestSpan = w;
        out.widestRow = y;
      }
    }
    return out;
  }

  global.PipeCollision = {
    makeCollider: makeCollider,
    spansSummary: spansSummary
  };
})(typeof window !== 'undefined' ? window : this);

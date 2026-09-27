/* figs-gallery.js — Gallery hero: a FLIPR plate of Ca²⁺-dye traces (4 × 6 subset of a 96-well plate).
   F/F0 over 120 s at 1 Hz: 10 s baseline, addition at 10 s with a small dip artefact, rise τ ≈ 1.5 s, decay τ ≈ 30 s.
   Columns 1–4: half-log series, peak on a Hill curve (EC50 1 µM, nH 1.2, max F/F0 2.5). Column 5 buffer, column 6 positive control.
   Rows are replicates (±7%). Peaks are fitted with a Hill equation by least squares. Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__gal) return; TE.__gal = true;
  var CONC = [0.3, 1, 3, 10], ROWS = 4, COLS = 6, NT = 121, LOOP = 13;
  function hill(c, ec, nh, top) { return 1 + (top - 1) * Math.pow(c, nh) / (Math.pow(c, nh) + Math.pow(ec, nh)); }
  TE.define('gallery', function () {
    var r = TE.rng(8080), wells = [];
    for (var row = 0; row < ROWS; row++) for (var col = 0; col < COLS; col++) {
      var amp = col < 4 ? hill(CONC[col], 1, 1.2, 2.5) - 1 : col === 4 ? 0 : 1.5, rep = 1 + TE.gauss(r) * 0.07, tr = new Float32Array(NT), dip = 0.02 + r() * 0.03;
      var rise = 1.2 + r() * 0.8, dec = 22 + r() * 16, pk = 0, norm = 0;
      for (var s = 0; s < 200; s++) { var q = s / 10; norm = Math.max(norm, (1 - Math.exp(-q / rise)) * Math.exp(-q / dec)); }
      for (var k = 0; k < NT; k++) {
        var v = 1, d = k - 10;
        if (d >= 0) v += amp * rep * (1 - Math.exp(-d / rise)) * Math.exp(-d / dec) / norm - dip * Math.exp(-d / 1.2);
        tr[k] = v + TE.gauss(r) * 0.012; if (tr[k] > pk) pk = tr[k];
      }
      wells.push({ row: row, col: col, tr: tr, pk: pk });
    }
    var top = 0; wells.forEach(function (w) { if (w.col === 5) top += w.pk / ROWS; });
    var best = { e: 0, sse: Infinity };
    for (var le = -1.5; le <= 1.5; le += 0.01) for (var nh = 0.5; nh <= 2.5; nh += 0.02) {
      var sse = 0; wells.forEach(function (w) { if (w.col < 4) { var dd = w.pk - hill(CONC[w.col], Math.pow(10, le), nh, top); sse += dd * dd; } });
      if (sse < best.sse) best = { ec: Math.pow(10, le), nh: nh, sse: sse };
    }
    function draw(ctx, W, H, t) {
      var u = t % LOOP, fade = Math.max(0, Math.min(1, u / 0.4, (LOOP - u) / 0.5)), B = TE.heroBox(W, H, { y0: 0.14, y1: 0.84, maxW: 760 });
      ctx.save(); ctx.globalAlpha = B.a * fade;
      var nar = !B.wide, pw = nar ? B.w : B.w * 0.6, cw = (pw - 20) / COLS, rh = nar ? Math.min(cw * 0.62, B.h * 0.5 / ROWS) : Math.min(cw * 0.78, (B.h - 40) / ROWS), gx = B.x + 20, gy = B.y + 30;
      var labels = nar ? ['0.3', '1', '3', '10', 'buf', 'ctrl'] : ['0.3', '1', '3', '10 µM', 'buffer', '+ ctrl'];
      labels.forEach(function (s, c) { TE.text(ctx, s, gx + c * cw + cw / 2, gy - 10, { size: 10, align: 'center', color: c < 4 ? TE.C.mute : TE.C.lab }); });
      'ABCD'.split('').forEach(function (s, i) { TE.text(ctx, s, B.x + 6, gy + i * rh + rh / 2, { size: 10, align: 'center', base: 'middle' }); });
      var headX = 1.0 + (u - 1.0) / 2.0 * COLS; // pipettor head position in columns
      if (u > 0.8 && u < 3.4) { var hx = gx + TE.clamp(headX, 0, COLS) * cw; ctx.fillStyle = 'rgba(241,212,154,0.14)'; ctx.fillRect(hx - cw * 0.5, gy - 4, cw, ROWS * rh + 4); TE.line(ctx, hx, gy - 4, hx, gy + ROWS * rh, 'rgba(241,212,154,0.6)', 1); }
      TE.text(ctx, (nar ? 'µM · ' : '') + 'F/F₀ · 120 s per well', gx, gy + ROWS * rh + 16, { size: 10 });
      wells.forEach(function (w) {
        var x = gx + w.col * cw + 2, y = gy + w.row * rh + 2, ww = cw - 4, hh = rh - 4, ta = 1.0 + w.col / COLS * 2.0;
        ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, ww, hh, 6); else ctx.rect(x, y, ww, hh); ctx.fill(); ctx.stroke();
        var shown = u < ta ? 10 : Math.min(NT - 1, 10 + (u - ta) * 26);
        var Y = function (v) { return y + hh - 5 - (v - 0.92) / 1.78 * (hh - 10); }, X = function (k) { return x + 4 + k / (NT - 1) * (ww - 8); };
        ctx.beginPath(); for (var k = 0; k <= shown; k++) { if (k) ctx.lineTo(X(k), Y(w.tr[k])); else ctx.moveTo(X(k), Y(w.tr[k])); }
        ctx.strokeStyle = w.col === 4 ? 'rgba(232,236,243,0.7)' : TE.C.gold; ctx.lineWidth = 1.1; ctx.stroke();
      });
      // concentration–response
      var cx0 = nar ? B.x + 48 : B.x + pw + 36, cx1 = B.x + B.w - 4, cy0 = nar ? gy + ROWS * rh + 48 : gy, cy1 = nar ? B.y + B.h - 34 : gy + ROWS * rh - 4;
      var CX = function (lc) { return cx0 + (lc + 0.8) / 2 * (cx1 - cx0); }, CY = function (v) { return cy1 - (v - 1) / 1.7 * (cy1 - cy0); };
      TE.line(ctx, cx0, cy1 + 0.5, cx1, cy1 + 0.5, TE.C.axis, 1); TE.line(ctx, cx0 - 0.5, cy0, cx0 - 0.5, cy1, TE.C.axis, 1);
      [1, 2].forEach(function (v) { TE.text(ctx, v.toFixed(1), cx0 - 5, CY(v), { size: 10, align: 'right', base: 'middle' }); });
      [[-0.523, '0.3'], [0, '1'], [1, '10 µM']].forEach(function (q) { TE.text(ctx, q[1], CX(q[0]), cy1 + 14, { size: 10, align: 'center' }); });
      TE.text(ctx, 'peak F/F₀', cx0, cy0 - 10, { size: 10 });
      var fly = TE.clamp((u - 6.6) / 0.9, 0, 1);
      if (fly > 0) wells.forEach(function (w, i) {
        if (w.col > 3) return;
        var pk0x = gx + w.col * cw + cw / 2, pk0y = gy + w.row * rh + rh * 0.3, p = TE.ease(TE.clamp(fly * 1.3 - (i % COLS) * 0.05, 0, 1));
        var px = pk0x + (CX(Math.log10(CONC[w.col])) - pk0x) * p, py = pk0y + (CY(w.pk) - pk0y) * p;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 6.2832); ctx.fill();
      });
      var fs = TE.clamp((u - 7.8) / 1.0, 0, 1);
      if (fs > 0) {
        ctx.beginPath(); var lc1 = -0.8 + 2 * TE.ease(fs);
        for (var lc = -0.8; lc <= lc1 + 1e-9; lc += 0.02) { var yy = CY(hill(Math.pow(10, lc), best.ec, best.nh, top)); if (lc === -0.8) ctx.moveTo(CX(lc), yy); else ctx.lineTo(CX(lc), yy); }
        ctx.strokeStyle = TE.C.gold; ctx.lineWidth = 1.6; ctx.stroke();
        if (fs >= 1) TE.text(ctx, 'EC₅₀ ' + best.ec.toFixed(1) + ' µM · nH ' + best.nh.toFixed(1), cx1, cy1 + 30, { size: 10, color: TE.C.ink, align: 'right' });
      }
      ctx.restore();
    }
    return { still: 11, draw: draw };
  });
})();

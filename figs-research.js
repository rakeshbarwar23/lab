/* figs-research.js — Research hero: rate–equilibrium free-energy relationship (Φ analysis).
   For mutations at one position, log f vs log E is linear with slope Φ (0–1). Illustrative groups:
   Φ ≈ 0.9 near the transmitter-binding site, ≈ 0.6 at the ECD–TMD interface, ≈ 0.3 at the pore/gate,
   the direction reported for AChR gating (e.g. Purohit, Mitra & Auerbach, 2007). Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__research) return; TE.__research = true;
  var WT = { e: 1.4, f: 4.7 }, LOOP = 13;
  var G = [
    { phi: 0.9, name: 'binding site', col: '#fbe7bf', xs: [-1.0, -0.3, 0.4, 0.9, 2.1, 2.8] },
    { phi: 0.6, name: 'ECD–TMD interface', col: '#e6b667', xs: [-0.8, -0.1, 0.6, 1.9, 2.3, 2.6] },
    { phi: 0.3, name: 'pore / gate', col: '#c47f33', xs: [-1.2, -0.5, 0.2, 0.8, 1.8, 2.4] }
  ];
  TE.define('research', function () {
    var r = TE.rng(777);
    G.forEach(function (g) {
      g.pts = [{ e: WT.e + TE.gauss(r) * 0.04, f: WT.f + TE.gauss(r) * 0.04, wt: true, ee: 0.06, ef: 0.06 }];
      g.xs.forEach(function (x) { var e = x + TE.gauss(r) * 0.05; g.pts.push({ e: e, f: WT.f + g.phi * (e - WT.e) + TE.gauss(r) * 0.1, ee: 0.06 + r() * 0.08, ef: 0.06 + r() * 0.09 }); });
      g.pts.sort(function (a, b) { return a.e - b.e; });
      var n = g.pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
      g.pts.forEach(function (p) { sx += p.e; sy += p.f; sxx += p.e * p.e; sxy += p.e * p.f; });
      g.slope = (n * sxy - sx * sy) / (n * sxx - sx * sx); g.ic = (sy - g.slope * sx) / n;
      g.e0 = g.pts[0].e - 0.25; g.e1 = g.pts[n - 1].e + 0.25;
    });
    function draw(ctx, W, H, t) {
      var u = t % LOOP, B = TE.heroBox(W, H, { y0: 0.14, y1: 0.84, maxW: 640 }), fade = Math.max(0, Math.min(1, u / 0.4, (LOOP - u) / 0.5));
      ctx.save(); ctx.globalAlpha = B.a * fade;
      var L = B.x + 44, R = B.x + B.w - 64, T = B.y + 6, Bm = B.y + B.h - 36, ex0 = -1.6, ex1 = 3.2, fy0 = 2, fy1 = 6.6;
      var X = function (e) { return L + (e - ex0) / (ex1 - ex0) * (R - L); }, Y = function (f) { return Bm - (f - fy0) / (fy1 - fy0) * (Bm - T); };
      TE.line(ctx, L, Bm + 0.5, R, Bm + 0.5, TE.C.axis, 1); TE.line(ctx, L - 0.5, T, L - 0.5, Bm, TE.C.axis, 1);
      for (var e = -1; e <= 3; e++) { TE.line(ctx, X(e), Bm, X(e), Bm + 4, TE.C.axis, 1); TE.text(ctx, String(e).replace('-', '−'), X(e), Bm + 16, { size: 10, align: 'center' }); }
      for (var f = 2; f <= 6; f++) { TE.line(ctx, L - 4, Y(f), L, Y(f), TE.C.axis, 1); TE.text(ctx, String(f), L - 8, Y(f), { size: 10, align: 'right', base: 'middle' }); TE.line(ctx, L, Y(f) + 0.5, R, Y(f) + 0.5, TE.C.grid, 1); }
      TE.text(ctx, 'log₁₀ E  (gating equilibrium constant)', (L + R) / 2, Bm + 32, { size: 10, align: 'center' });
      ctx.save(); ctx.translate(B.x + 8, (T + Bm) / 2); ctx.rotate(-Math.PI / 2); TE.text(ctx, 'log₁₀ f  (opening rate, s⁻¹)', 0, 0, { size: 10, align: 'center', base: 'middle' }); ctx.restore();
      G.forEach(function (g, gi) {
        var g0 = 0.5 + gi * 2.8;
        g.pts.forEach(function (p, k) {
          var tp = u - (g0 + k * 0.28); if (tp < 0) return;
          var pulse = tp < 0.5 ? 1 + 1.6 * (1 - tp / 0.5) : 1, x = X(p.e), y = Y(p.f), sx = (X(p.e + p.ee) - x), sy = (y - Y(p.f + p.ef));
          ctx.globalAlpha = B.a * fade * Math.min(1, tp / 0.2);
          TE.line(ctx, x - sx, y, x + sx, y, g.col, 1); TE.line(ctx, x, y - sy, x, y + sy, g.col, 1);
          ctx.beginPath(); ctx.arc(x, y, 3.6 * pulse, 0, 6.2832);
          if (p.wt) { ctx.fillStyle = '#070c16'; ctx.fill(); ctx.strokeStyle = g.col; ctx.lineWidth = 1.4; ctx.stroke(); } else { ctx.fillStyle = g.col; ctx.fill(); }
        });
        var tl = u - (g0 + g.pts.length * 0.28 + 0.1);
        if (tl > 0) {
          var p = TE.ease(tl / 0.7), e1 = g.e0 + (g.e1 - g.e0) * p;
          ctx.globalAlpha = B.a * fade;
          TE.line(ctx, X(g.e0), Y(g.ic + g.slope * g.e0), X(e1), Y(g.ic + g.slope * e1), g.col, 1.6);
          if (tl > 0.5) {
            ctx.globalAlpha = B.a * fade * Math.min(1, (tl - 0.5) / 0.4);
            var lx = X(g.e1) + 6, ly = Y(g.ic + g.slope * g.e1);
            TE.text(ctx, 'Φ = ' + g.slope.toFixed(2), lx, ly, { size: 12, color: g.col, base: 'middle', weight: 600 });
          }
        }
      });
      // inset: receptor regions from binding site to gate, shaded in matching colours
      var ti = u - 9.2;
      if (ti > 0) {
        ctx.globalAlpha = B.a * fade * Math.min(1, ti / 0.6);
        var ix = Math.max(L + 16, R - 150), iy = Bm - 76;
        TE.text(ctx, 'receptor, top → bottom', ix, iy, { size: 10 });
        G.forEach(function (g, gi) {
          var yy = iy + 8 + gi * 18;
          ctx.fillStyle = g.col; ctx.globalAlpha = B.a * fade * Math.min(1, ti / 0.6) * 0.9;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(ix, yy + 2, 22, 12, 3) : ctx.rect(ix, yy + 2, 22, 12); ctx.fill();
          ctx.globalAlpha = B.a * fade * Math.min(1, ti / 0.6);
          TE.text(ctx, g.name, ix + 30, yy + 8, { size: 10, color: TE.C.ink, base: 'middle' });
        });
      }
      ctx.restore();
    }
    return { still: 11, draw: draw };
  });
})();

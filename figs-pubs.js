/* figs-pubs.js — Publications hero: an open-duration histogram building up (Sigworth & Sine, 1987 display).
   Log-binned duration (10 bins/decade) vs √count; each exponential component peaks at its time constant.
   Two components: τ1 = 0.3 ms (70%), τ2 = 3 ms (30%). Dead time 0.03 ms: shorter events are missed.
   The fit is maximum likelihood (EM on durations minus the dead time) and is recomputed as events arrive. Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__pubs) return; TE.__pubs = true;
  var TD = 0.03, NMAX = 10000, X0 = -2, X1 = 2, BPD = 10, NB = (X1 - X0) * BPD, LOOP = 13, FALL = 0.45;
  function uOf(k) { return 9 * Math.log10(Math.max(1, k)) / 4; }
  function nAt(u) { return u <= 0 ? 0 : Math.min(NMAX, Math.floor(Math.pow(10, 4 * u / 9))); }
  TE.define('publications', function () {
    var r = TE.rng(5150), ev = [];
    while (ev.length < NMAX) { var d = TE.expo(r, r() < 0.7 ? 0.3 : 3); if (d >= TD) ev.push({ d: d, jx: r(), jy: r() }); }
    var bins = new Float64Array(NB), landed = 0, fit = null, fitN = 0, ysm = 0;
    function binOf(d) { return Math.floor((Math.log10(d) - X0) * BPD); }
    function em(n) {
      var w = 0.5, t1 = 0.1, t2 = 5;
      for (var it = 0; it < 40; it++) {
        var s1 = 0, s2 = 0, n1 = 0, n2 = 0;
        for (var k = 0; k < n; k++) {
          var x = ev[k].d - TD, p1 = w / t1 * Math.exp(-x / t1), p2 = (1 - w) / t2 * Math.exp(-x / t2), q = p1 / (p1 + p2 || 1);
          n1 += q; s1 += q * x; n2 += 1 - q; s2 += (1 - q) * x;
        }
        w = n1 / n; t1 = Math.max(0.01, s1 / (n1 || 1)); t2 = Math.max(0.05, s2 / (n2 || 1));
        if (t1 > t2) { var tt = t1; t1 = t2; t2 = tt; w = 1 - w; }
      }
      return { w: [w, 1 - w], tau: [t1, t2], n: n };
    }
    function comp(f, j, xlog) { // expected count in a log bin centred at xlog
      var a = Math.max(TD, Math.pow(10, xlog - 0.5 / BPD)), b = Math.pow(10, xlog + 0.5 / BPD); if (b <= TD) return 0;
      return f.n * f.w[j] * (Math.exp(-(a - TD) / f.tau[j]) - Math.exp(-(b - TD) / f.tau[j]));
    }
    function draw(ctx, W, H, t) {
      var u = t % LOOP, fade = Math.max(0, Math.min(1, u / 0.4, (LOOP - u) / 0.5)), B = TE.heroBox(W, H, { y0: 0.16, y1: 0.8, maxW: 660 });
      var target = nAt(u - FALL);
      if (target < landed) { bins.fill(0); landed = 0; fit = null; fitN = 0; ysm = 0; }
      for (; landed < target; landed++) { var bi = binOf(ev[landed].d); if (bi >= 0 && bi < NB) bins[bi]++; }
      if (landed >= 10 && (!fit || landed > fitN * 1.25 || (landed === NMAX && fitN < NMAX))) { fit = em(landed); fitN = landed; }
      ctx.save(); ctx.globalAlpha = B.a * fade;
      var L = B.x + 40, R = B.x + B.w - 6, T = B.y + 22, Bm = B.y + B.h - 34;
      var X = function (xl) { return L + (xl - X0) / (X1 - X0) * (R - L); };
      var mx = 1; for (var b = 0; b < NB; b++) mx = Math.max(mx, bins[b]);
      var ytop = Math.sqrt(mx) * 1.18; ysm = ysm ? ysm + (ytop - ysm) * 0.12 : ytop; if (TE.reduce || Math.abs(ysm - ytop) / ytop > 0.6) ysm = ytop;
      var Y = function (c) { return Bm - Math.sqrt(Math.max(0, c)) / ysm * (Bm - T); };
      // dead-time shading
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(L, T, X(Math.log10(TD)) - L, Bm - T);
      TE.text(ctx, 'missed', L + 4, T + 12, { size: 10 }); TE.text(ctx, '< 30 µs', L + 4, T + 25, { size: 10 });
      TE.line(ctx, L, Bm + 0.5, R, Bm + 0.5, TE.C.axis, 1); TE.line(ctx, L - 0.5, T, L - 0.5, Bm, TE.C.axis, 1);
      ['0.01', '0.1', '1', '10', '100'].forEach(function (s, i) { var xx = X(X0 + i); TE.line(ctx, xx, Bm, xx, Bm + 4, TE.C.axis, 1); TE.text(ctx, s, xx, Bm + 16, { size: 10, align: i === 0 ? 'left' : i === 4 ? 'right' : 'center' }); });
      TE.text(ctx, 'open duration (ms, log scale)', (L + R) / 2, Bm + 31, { size: 10, align: 'center' });
      ctx.save(); ctx.translate(B.x + 10, (T + Bm) / 2); ctx.rotate(-Math.PI / 2); TE.text(ctx, '√ count', 0, 0, { size: 10, align: 'center', base: 'middle' }); ctx.restore();
      var bw = (R - L) / NB;
      ctx.fillStyle = 'rgba(241,212,154,0.22)'; ctx.strokeStyle = 'rgba(241,212,154,0.75)'; ctx.lineWidth = 1;
      for (b = 0; b < NB; b++) if (bins[b] > 0) { var yb = Y(bins[b]); ctx.fillRect(L + b * bw + 0.5, yb, bw - 1, Bm - yb); ctx.beginPath(); ctx.moveTo(L + b * bw + 0.5, yb + 0.5); ctx.lineTo(L + (b + 1) * bw - 0.5, yb + 0.5); ctx.stroke(); }
      // falling events
      var kLo = Math.max(landed, nAt(u - FALL)), kHi = nAt(u), step = Math.max(1, Math.floor((kHi - kLo) / 40));
      ctx.fillStyle = '#ffffff';
      for (var k = kLo; k < kHi; k += step) {
        var e = ev[k], p = TE.clamp((u - uOf(k + 1)) / FALL, 0, 1), bx = binOf(e.d);
        if (bx < 0 || bx >= NB) continue;
        var px = L + (bx + 0.2 + 0.6 * e.jx) * bw, py = T - 10 + (Y(bins[bx] + 1) - T + 10) * p * p;
        ctx.globalAlpha = B.a * fade * (0.5 + 0.5 * (1 - p)); ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = B.a * fade;
      if (fit) {
        var curve = function (fn) { ctx.beginPath(); for (var xl = Math.log10(TD); xl <= X1; xl += 0.02) { var yy = Y(fn(xl)); if (xl === Math.log10(TD)) ctx.moveTo(X(xl), yy); else ctx.lineTo(X(xl), yy); } ctx.stroke(); };
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8; curve(function (xl) { return comp(fit, 0, xl) + comp(fit, 1, xl); });
        var cu = TE.clamp((u - 9.4) / 0.6, 0, 1);
        if (cu > 0) {
          ctx.globalAlpha = B.a * fade * cu; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.strokeStyle = TE.C.gold;
          curve(function (xl) { return comp(fit, 0, xl); }); curve(function (xl) { return comp(fit, 1, xl); }); ctx.setLineDash([]);
          [0, 1].forEach(function (j) {
            var xl = Math.log10(fit.tau[j] + TD), yy = Y(comp(fit, 0, xl) + comp(fit, 1, xl));
            TE.text(ctx, 'τ' + (j ? '₂' : '₁') + ' = ' + fit.tau[j].toFixed(j ? 1 : 2) + ' ms · ' + Math.round(fit.w[j] * 100) + '%', X(xl) + (j ? 10 : -10), yy - (j ? 14 : 12), { size: 11, color: TE.C.ink, align: j ? 'left' : 'right' });
          });
          ctx.globalAlpha = B.a * fade;
        }
      }
      TE.text(ctx, 'n = ' + landed.toLocaleString('en-US') + ' events', R, B.y + 6, { size: 14, color: TE.C.gold, align: 'right', weight: 600 });
      ctx.restore();
    }
    return { still: 12, draw: draw };
  });
})();

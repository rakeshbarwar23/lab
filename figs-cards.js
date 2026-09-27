/* figs-cards.js — the seven Research-card traces. Needs trace-engine.js.
   Rate constants are illustrative (per ms); replace with the lab's published values where available. */
(function () {
  var TE = window.TE; if (!TE || TE.__cards) return; TE.__cards = true;
  function box(W, H) { return { x: 6, y: 17, w: W - 12, h: H - 36 }; }
  function scrollFig(tr, o) {
    return function () { var s = TE.scroller(tr(), o); return { still: 1.5, draw: function (ctx, W, H, t) { s.draw(ctx, box(W, H), t + 1.5); } }; };
  }
  var lazy = function (fn) { var v; return function () { return v || (v = fn()); }; };
  var CO = function (i) { return [{ v: 0, label: 'c' }, { v: i, label: 'o' }]; };

  // 01 Energetics — adult muscle AChR, cell-attached −100 mV, ~65 pS. Cluster Po rises with [ACh].
  var t01 = lazy(function () {
    return TE.channelTrace({ seed: 101, dt: 0.01, fc: 10, i: -6.5, rms: 0.4, openRms: 0.25, breakMs: 3, wrapBreak: true, segs: [
      { label: '1 µM ACh', dur: 46, model: { rates: { C: { O: 1 / 12 }, O: { C: 1.0, F: 0.43 }, F: { O: 50 } }, level: { O: 1 } } },
      { label: '30 µM · Po≈0.5', brk: true, dur: 32, model: { rates: { C: { O: 1 / 1.2 }, O: { C: 1 / 1.2 } }, level: { O: 1 } } },
      { label: '500 µM · Po≈0.95', brk: true, dur: 32, model: { rates: { C: { O: 10 }, O: { C: 0.5 } }, level: { O: 1 } } }
    ] });
  });
  TE.define('c01', scrollFig(t01, { windowMs: 40, rate: 9, range: [2.6, -8.4], levels: CO(-6.5), scale: { pA: 5, ms: 5 }, hold: '−100 mV', labelSize: 9 }));

  // 02 Allostery — same receptor; abrupt switch between a high-Po and a low-Po gating mode.
  var t02 = lazy(function () {
    return TE.channelTrace({ seed: 202, dt: 0.01, fc: 10, i: -6.5, rms: 0.4, openRms: 0.25, segs: [
      { label: 'high-Po mode', dur: 55, model: { rates: { C: { O: 3 }, O: { C: 1 / 3 } }, level: { O: 1 } } },
      { label: 'low-Po mode', dur: 55, model: { rates: { C: { O: 1 / 3.2 }, O: { C: 1 / 0.8 } }, level: { O: 1 } } }
    ] });
  });
  TE.define('c02', scrollFig(t02, { windowMs: 40, rate: 9, range: [2.6, -8.4], levels: CO(-6.5), scale: { pA: 5, ms: 5 }, hold: '−100 mV', labelSize: 9 }));

  // 03 Therapeutics — α7 nAChR, −100 mV, ~90 pS. Control: rare, very brief openings. + type II PAM: long bursts.
  var t03 = lazy(function () {
    return TE.channelTrace({ seed: 303, dt: 0.01, fc: 10, i: -9, rms: 0.45, openRms: 0.3, breakMs: 6, wrapBreak: true, segs: [
      { label: 'control', dur: 90, model: { rates: { C: { O: 1 / 11 }, O: { C: 1 / 0.15 } }, level: { O: 1 } } },
      { label: '+ PNU-120596', brk: true, dur: 330, start: 'L', model: { rates: { L: { O: 1 / 40 }, O: { S: 0.97 / 6, L: 0.03 / 6 }, S: { O: 1 / 0.3 } }, level: { O: 1 } } }
    ] });
  });
  TE.define('c03', scrollFig(t03, { windowMs: 110, rate: 26, range: [3.5, -11.5], levels: CO(-9), scale: { pA: 10, ms: 20 }, hold: '−100 mV', labelSize: 9 }));

  // 04 Pain — TRPV1 + capsaicin, −60 mV, ~35 pS inward. Sub-ms flickers mostly don't reach baseline at 5 kHz.
  var t04 = lazy(function () {
    return TE.channelTrace({ seed: 404, dt: 0.01, fc: 5, i: -2.1, rms: 0.28, openRms: 0.12, segs: [
      { dur: 130, start: 'L', model: { rates: { L: { O: 1 / 6 }, O: { F: 0.95 / 0.8, L: 0.05 / 0.8 }, F: { O: 1 / 0.06 } }, level: { O: 1 } } }
    ] });
  });
  TE.define('c04', scrollFig(t04, { windowMs: 40, rate: 9, range: [1.1, -3.1], levels: CO(-2.1), scale: { pA: 2, ms: 5 }, hold: '−60 mV · capsaicin', labelSize: 9 }));

  // 05 Development — fetal γ (~40 pS, longer) vs adult ε (~65 pS, briefer), both −100 mV, one shared scale.
  var t05 = lazy(function () {
    return [
      TE.channelTrace({ seed: 505, dt: 0.01, fc: 10, i: -4, rms: 0.4, openRms: 0.2, segs: [{ dur: 160, model: { rates: { C: { O: 1 / 16 }, O: { C: 1 / 4.5 } }, level: { O: 1 } } }] }),
      TE.channelTrace({ seed: 506, dt: 0.01, fc: 10, i: -6.5, rms: 0.4, openRms: 0.25, segs: [{ dur: 160, model: { rates: { C: { O: 1 / 7 }, O: { C: 1 / 0.9 } }, level: { O: 1 } } }] })
    ];
  });
  TE.define('c05', function () {
    var tr = t05(), o = { windowMs: 50, rate: 10, range: [1.2, -7.4], labelSize: 9 };
    var a = TE.scroller(tr[0], o), b = TE.scroller(tr[1], o);
    return { still: 2, draw: function (ctx, W, H, t) {
      var B = box(W, H), h = B.h / 2 + 4, x = B.x + 30, w = B.w - 30 - 34;
      TE.text(ctx, '−100 mV', B.x + B.w, B.y - 5, { size: 9, align: 'right' });
      TE.text(ctx, 'γ fetal', B.x, B.y + 6, { size: 9, color: TE.C.lab, base: 'middle' });
      TE.text(ctx, 'ε adult', B.x, B.y + h + 6, { size: 9, color: TE.C.lab, base: 'middle' });
      a.draw(ctx, { x: x, y: B.y - 2, w: w, h: h }, t + 2); b.draw(ctx, { x: x, y: B.y + h - 4, w: w, h: h }, t + 2);
      var mpp = o.windowMs / w, hp = 5 / (o.range[0] - o.range[1]) * h;
      TE.scaleBar(ctx, x + w + 5, B.y + B.h + 3, 10 / mpp, hp, '5 pA', '10 ms', { size: 9, right: true });
    } };
  });

  // 06 GPCRs — GIRK1/2 + Gi/o receptor, whole-cell −80 mV, high K⁺. Macroscopic current, drawn as a chart sweep.
  TE.define('c06', function () {
    var r = TE.rng(606), T = 40, dt = 0.02, N = Math.round(T / dt), y = new Float32Array(N), s18 = 0;
    for (var k = 0; k < N; k++) {
      var t = k * dt, act = 0;
      if (t >= 3 && t < 18) { act = (1 - Math.exp(-(t - 3) / 0.7)) * (0.68 + 0.32 * Math.exp(-(t - 3) / 5)); s18 = act; }
      else if (t >= 18) act = s18 * Math.exp(-(t - 18) / 2.5);
      var blk = 1;
      if (t >= 27 && t < 33) blk = 1 - 0.97 * (1 - Math.exp(-(t - 27) / 0.3));
      else if (t >= 33) blk = 1 - 0.97 * (1 - Math.exp(-6 / 0.3)) * Math.exp(-(t - 33) / 1.5);
      var I = (-45 - 1150 * act) * blk;
      y[k] = I + TE.gauss(r) * (4 + 0.006 * Math.abs(I));
    }
    var dur = 9, hold = 2.5;
    return { still: dur, draw: function (ctx, W, H, tt) {
      var B = box(W, H), u = tt % (dur + hold), frac = Math.min(1, u / dur), top = 120, bot = -1300;
      var Y = function (v) { return B.y + 6 + (top - v) / (top - bot) * (B.h - 6); }, X = function (ts) { return B.x + ts / T * B.w; };
      [[3, 18, 'agonist'], [27, 33, 'Ba²⁺ 1 mM']].forEach(function (a) {
        var x0 = X(a[0]), x1 = X(a[1]);
        ctx.fillStyle = 'rgba(241,212,154,0.55)'; ctx.fillRect(x0, B.y - 2, x1 - x0, 3);
        TE.text(ctx, a[2], x0, B.y - 5, { size: 9, color: TE.C.lab });
      });
      TE.text(ctx, '−80 mV', B.x + B.w, B.y - 5, { size: 9, align: 'right' });
      var n = Math.floor(frac * N), step = Math.max(1, Math.floor(N / B.w / 1.5));
      ctx.beginPath();
      for (var i = 0; i < n; i += step) { var xx = X(i * dt), yy = Y(y[i]); if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.strokeStyle = TE.C.gold; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
      var wp = 5 / T * B.w, hp = 500 / (top - bot) * (B.h - 6);
      TE.scaleBar(ctx, B.x + B.w - wp - 2, B.y + B.h, wp, hp, '500 pA', '5 s', { size: 9 });
    } };
  });

  // 07 Organelles — whole-endolysosome ramps, −100 → +100 mV, before/after cytosolic PI(3,5)P₂.
  // Bertl et al. (1992): V = V_cytosol − V_lumen; inward = cations lumen → cytosol (negative).
  TE.define('c07', function () {
    var r = TE.rng(707), NV = 201, curves = [0.3, 3.1].map(function (g) {
      var a = new Float32Array(NV);
      for (var k = 0; k < NV; k++) { var V = -100 + k; a[k] = g * (V - 12) * (V < 0 ? 1 + 0.18 * (-V / 100) : 1) + TE.gauss(r) * 2.2; }
      return a;
    });
    var ramp = 3, hold = 2.5, cyc = ramp * 2 + hold;
    return { still: cyc - 0.1, draw: function (ctx, W, H, t) {
      var B = box(W, H), u = t % cyc, top = 320, bot = -400;
      var X = function (V) { return B.x + 28 + (V + 100) / 200 * (B.w - 44); }, Y = function (I) { return B.y + (top - I) / (top - bot) * B.h; };
      TE.line(ctx, X(-100), Y(0) + 0.5, X(100), Y(0) + 0.5, TE.C.axis, 1);
      TE.line(ctx, X(0) + 0.5, B.y - 2, X(0) + 0.5, B.y + B.h, TE.C.axis, 1);
      TE.text(ctx, '−100', X(-100), Y(0) - 4, { size: 9, align: 'left' });
      TE.text(ctx, '+100 mV', X(100), Y(0) - 4, { size: 9, align: 'right' });
      TE.text(ctx, 'V = V_cyt − V_lumen · inward = lumen → cytosol', B.x, B.y - 5, { size: 9 });
      [[0, 'control', 'rgba(232,236,243,0.6)'], [1, '+ PI(3,5)P₂', TE.C.gold]].forEach(function (c) {
        var p = TE.clamp((u - c[0] * ramp) / ramp, 0, 1), n = Math.floor(p * (NV - 1)); if (n < 1) return;
        var a = curves[c[0]];
        ctx.beginPath(); for (var k = 0; k <= n; k++) { var xx = X(-100 + k), yy = Y(a[k]); if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
        ctx.strokeStyle = c[2]; ctx.lineWidth = 1.2; ctx.stroke();
        if (p >= 1) TE.text(ctx, c[1], X(100), Y(0) + 12 + c[0] * 11, { size: 9, color: c[2], align: 'right' });
      });
      var hp = 200 / (top - bot) * B.h, sx = B.x + B.w - 2;
      TE.line(ctx, sx, B.y + B.h, sx, B.y + B.h - hp, 'rgba(232,236,243,0.7)', 1.3);
      TE.text(ctx, '200 pA', sx, B.y + B.h + 11, { size: 9, color: 'rgba(232,236,243,0.7)', align: 'right' });
    } };
  });
})();

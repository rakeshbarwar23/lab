/* figs-people.js — People hero: three identical, independent channels in one patch.
   Each channel C ⇌ O, mean open 3 ms, mean closed 12 ms (Po = 0.2). −4 pA (~50 pS at −80 mV), 5 kHz, 0.4 pA RMS.
   Channels are simulated separately and summed; multi-level openings are never scripted.
   All-points histogram builds as the trace runs; binomial occupancy 51 / 38 / 10 / 1 %. Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__people) return; TE.__people = true;
  var I = -4, WIN = 160, RATE = 40, HB0 = -16, HB1 = 4, HBW = 0.2, NB = Math.round((HB1 - HB0) / HBW);
  TE.define('people', function () {
    var tr = TE.channelTrace({ seed: 3131, dt: 0.02, fc: 5, i: I, rms: 0.4, openRms: 0.15, segs: [
      { dur: 3000, n: 3, model: { rates: { C: { O: 1 / 12 }, O: { C: 1 / 3 } }, level: { O: 1 } } }
    ] });
    var N = tr.y.length, occ = [0, 0, 0, 0];
    for (var k = 0; k < N; k++) occ[Math.min(3, Math.max(0, Math.round(tr.ideal[k] / I)))]++;
    occ = occ.map(function (c) { return c / N; });
    var range = [3, -15], mk = function (win) { return TE.scroller(tr, { windowMs: win, rate: RATE, range: range, head: true, color: TE.C.gold, lw: 1.3,
      levels: [0, 1, 2, 3].map(function (j) { return { v: j * I, label: String(j) }; }), scale: { pA: 4, ms: 20 }, hold: '−80 mV · cell-attached', gutter: 40 }); }, scW = mk(WIN), scN = mk(60);
    var hist = new Float64Array(NB), done = 0;
    function fill(upto) {
      if (upto < done) { hist.fill(0); done = 0; }
      for (; done < upto; done++) { var v = tr.y[done % N]; if (v === v) { var b = Math.floor((v - HB0) / HBW); if (b >= 0 && b < NB) hist[b]++; } }
    }
    function draw(ctx, W, H, t) {
      var B = TE.heroBox(W, H, { y0: 0.2, y1: 0.8, maxW: 720 }), fade = Math.min(1, t / 0.5);
      ctx.save(); ctx.globalAlpha = B.a * fade;
      var hw = Math.max(90, B.w * 0.2), tb = { x: B.x, y: B.y, w: B.w - hw - 18, h: B.h };
      (B.wide ? scW : scN).draw(ctx, tb, t);
      fill(Math.floor((t * RATE) / tr.dt));
      var hx = B.x + B.w - hw, mx = 0; for (var b = 0; b < NB; b++) if (hist[b] > mx) mx = hist[b];
      var Y = function (v) { return tb.y + (range[0] - v) / (range[0] - range[1]) * tb.h; };
      TE.line(ctx, hx + 0.5, tb.y, hx + 0.5, tb.y + tb.h, TE.C.axis, 1);
      TE.text(ctx, B.wide ? 'all-points histogram' : 'all-points', hx, tb.y - 8, { size: 10 });
      if (mx > 0) {
        ctx.beginPath(); ctx.moveTo(hx, Y(HB0));
        for (b = 0; b < NB; b++) { var v0 = HB0 + b * HBW, xx = hx + hist[b] / mx * (hw - 44); ctx.lineTo(xx, Y(v0)); ctx.lineTo(xx, Y(v0 + HBW)); }
        ctx.lineTo(hx, Y(HB1)); ctx.closePath();
        ctx.fillStyle = 'rgba(241,212,154,0.28)'; ctx.fill(); ctx.strokeStyle = TE.C.gold; ctx.lineWidth = 1; ctx.stroke();
      }
      var shown = Math.min(1, done / 20000);
      ctx.globalAlpha = B.a * fade * shown;
      occ.forEach(function (p, j) { TE.text(ctx, (p * 100).toFixed(p < 0.02 ? 1 : 0) + '%', hx + hw, Y(j * I), { size: 10, color: TE.C.ink, align: 'right', base: 'middle' }); });
      ctx.globalAlpha = B.a * fade;
      TE.text(ctx, B.wide ? 'binomial: 51 · 38 · 10 · 1 %' : 'binomial', hx, tb.y + tb.h + 12, { size: 10 });
      ctx.restore();
    }
    return { still: 30, draw: draw };
  });
})();

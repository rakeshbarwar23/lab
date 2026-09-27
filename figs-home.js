/* figs-home.js — Home hero: single-channel bursts sum to a synaptic current (ensemble averaging).
   Adult muscle AChR after a brief ACh pulse at t = 0, −100 mV. Scheme: P (pre-opening latency) → A2O ⇌ A2C → AC (agonist leaves).
   b2 = 2000 s⁻¹, f2 = 50 000 s⁻¹, 2k− = 50 000 s⁻¹ → ~2 openings per burst, mean burst ≈ 1 ms. 30% failures.
   The decay τ of the average equals the mean burst duration (Anderson & Stevens, 1973). Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__home) return; TE.__home = true;
  var I = -6.5, DT = 0.005, TW = 5, NS = Math.round(TW / DT), NMAX = 1000, FAIL = 0.3, LOOP = 12, ROWS = 8;
  var model = { rates: { P: { O: 1 / 0.15 }, O: { C: 2 }, C: { O: 50, X: 50 } }, level: { O: 1 } };

  TE.define('home', function (canvas) {
    var bankR = TE.rng(9001), bankN = 24000, nb1 = TE.noise(bankN, 0.4, 10, DT, bankR), nb2 = TE.noise(bankN, 1, 10, DT, bankR);
    var r = TE.rng(4242), cache = [], sum = new Float64Array(NS), count = 0, lastU = -1, fit = null;
    function sweep(k) {
      if (cache[k]) return cache[k];
      var y = new Float32Array(NS), ideal = new Float64Array(NS), fail = r() < FAIL, o1 = Math.floor(r() * bankN), o2 = Math.floor(r() * bankN), f = null;
      if (!fail) { TE.rasterize(TE.gillespie(model, 'P', TW, r), model.level, DT, ideal, NS, I); f = TE.filter(ideal, 10, DT, false); }
      for (var i = 0; i < NS; i++) {
        var v = f ? f[i] : 0, frac = f ? Math.min(1.5, Math.abs(v / I)) : 0;
        y[i] = v + nb1[(o1 + i) % bankN] + 0.25 * frac * nb2[(o2 + i) % bankN];
      }
      return (cache[k] = y);
    }
    function nAt(u) {
      if (u < 3.5) return 1 + Math.floor(u / 0.39);
      return Math.min(NMAX, Math.floor(10 * Math.pow(100, Math.min(1, (u - 3.5) / 6))));
    }
    function fitAvg() { // weighted log-linear fit of the simulated average after the peak
      var avg = new Float64Array(NS), pk = 0, ip = 0, i;
      for (i = 0; i < NS; i++) { avg[i] = sum[i] / count; if (avg[i] < pk) { pk = avg[i]; ip = i; } }
      var i0 = ip + Math.round(0.4 / DT), sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
      for (i = i0; i < NS; i++) {
        if (avg[i] > -0.12) continue;
        var x = i * DT, yv = Math.log(-avg[i]), w = avg[i] * avg[i];
        sw += w; sx += w * x; sy += w * yv; sxx += w * x * x; sxy += w * x * yv;
      }
      var sl = (sw * sxy - sx * sy) / (sw * sxx - sx * sx), ic = (sy - sl * sx) / sw;
      return { tau: -1 / sl, A: -Math.exp(ic), t0: i0 * DT };
    }
    function anchorTop() {
      var sec = canvas.closest('section'), h = sec && sec.querySelector('h1');
      var a = h && h.parentNode && h.parentNode.firstElementChild;
      return a ? a.getBoundingClientRect().top - canvas.getBoundingClientRect().top : null;
    }
    function panelX(P) { var x0 = P.x + 30, w = P.w - 30 - 38; return function (tm) { return x0 + tm / TW * w; }; }

    function drawSweeps(ctx, P, u, target, alpha) {
      var X = panelX(P), top = 46, rowH = (P.h - top) / ROWS, pxPA = rowH * 0.95 / 6.5, w1 = X(1) - X(0);
      ctx.fillStyle = TE.C.gold; ctx.fillRect(X(0) - 1, P.y - 12, 3, 6);
      TE.text(ctx, 'ACh', X(0) + 7, P.y - 6, { size: 10, color: TE.C.lab });
      TE.line(ctx, X(0) + 0.5, P.y - 3, X(0) + 0.5, P.y + P.h, 'rgba(241,212,154,0.2)', 1, [2, 4]);
      TE.text(ctx, 'single sweeps', P.x, P.y + 10, { size: 10 });
      TE.text(ctx, '−100 mV', P.x + P.w, P.y - 6, { size: 10, align: 'right' });
      if (5 * pxPA > 20) { pxPA = 20 / 5; }
      var shift = target < 10 ? Math.max(0, 1 - ((u % 0.39) / 0.22)) * rowH : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y + top, P.w, P.h - top); ctx.clip();
      for (var k = 0; k < Math.min(ROWS, count); k++) {
        var sw = cache[count - 1 - k], base = P.y + P.h - (k + 1) * rowH + shift + rowH * 0.02;
        ctx.globalAlpha = alpha * (k === 0 ? 1 : 0.35 + 0.5 * (1 - k / ROWS));
        ctx.beginPath();
        for (var i = 0; i < NS; i++) { var xx = X(i * DT), yy = base - sw[i] * pxPA; if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
        ctx.strokeStyle = k === 0 ? '#ffffff' : TE.C.gold; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = alpha;
      TE.scaleBar(ctx, X(TW) + 4, P.y + 28, w1, 5 * pxPA, '5 pA', '1 ms', { right: true });
    }
    function drawAvg(ctx, P, u, alpha) {
      var X = panelX(P), w1 = X(1) - X(0), pxPA = (P.h - 24) / 7.2, y0 = P.y + 20;
      TE.text(ctx, 'ensemble average', P.x, P.y + 10, { size: 10 });
      TE.text(ctx, 'n = ' + count.toLocaleString('en-US'), P.x + P.w, P.y + 10, { size: 14, color: TE.C.gold, align: 'right', weight: 600 });
      TE.line(ctx, X(0), y0 + 0.5, X(TW), y0 + 0.5, 'rgba(241,212,154,0.18)', 1, [3, 4]);
      ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y + 15, P.w, P.h - 15); ctx.clip();
      ctx.beginPath();
      for (var i = 0; i < NS; i++) { var ya = y0 - (sum[i] / count) * pxPA; if (i) ctx.lineTo(X(i * DT), ya); else ctx.moveTo(X(i * DT), ya); }
      ctx.strokeStyle = TE.C.gold; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
      if (fit) {
        var fu = TE.clamp((u - 8.6) / 0.8, 0, 1), tEnd = fit.t0 + (TW - fit.t0) * fu;
        ctx.beginPath();
        for (var tm = fit.t0; tm <= tEnd + 1e-9; tm += 0.02) { var yf = y0 - fit.A * Math.exp(-tm / fit.tau) * pxPA; if (tm === fit.t0) ctx.moveTo(X(tm), yf); else ctx.lineTo(X(tm), yf); }
        ctx.setLineDash([5, 4]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.3; ctx.stroke(); ctx.setLineDash([]);
        if (fu > 0.3) {
          ctx.globalAlpha = alpha * TE.clamp((fu - 0.3) / 0.4, 0, 1);
          TE.text(ctx, 'τ_decay ≈ ' + fit.tau.toFixed(1) + ' ms', X(1.6), y0 + 3.2 * pxPA, { size: 12, color: TE.C.ink });
          TE.text(ctx, '= mean burst duration', X(1.6), y0 + 3.2 * pxPA + 16, { size: 11, color: TE.C.mute });
          ctx.globalAlpha = alpha;
        }
      }
      TE.scaleBar(ctx, X(TW) + 4, P.y + P.h - 14, w1, 2 * pxPA, '2 pA', '1 ms', { right: true });
    }
    function draw(ctx, W, H, t) {
      var u = t % LOOP;
      if (u < lastU) { r = TE.rng(4242); sum.fill(0); count = 0; fit = null; }
      lastU = u;
      var target = nAt(u);
      while (count < target) { var s = sweep(count); for (var i = 0; i < NS; i++) sum[i] += s[i]; count++; }
      if (count >= 500 && !fit) fit = fitAvg();
      var pad = Math.max(20, Math.min(40, W * 0.05)), left = Math.max(pad, (W - 1360) / 2 + pad), right = Math.min(W - pad, (W + 1360) / 2 - pad);
      var cap = canvas.closest('section'), capEl = cap && cap.querySelector('[data-fig-cap]'), cb = capEl ? capEl.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top : 40;
      var sec = canvas.closest('section'), h1 = sec && sec.querySelector('h1'), wrap = h1 && h1.parentNode;
      if (sec && wrap) { // make room above the headline so the figure never sits behind text (phones, short laptop windows)
        if (sec.__mh0 == null) sec.__mh0 = sec.style.minHeight;
        var need = Math.round(Math.max(78, cb + 34) + (right - left < 760 ? 320 : 280) + wrap.offsetHeight);
        var mh = sec.__mh0 ? 'max(' + need + 'px, ' + sec.__mh0 + ')' : need + 'px';
        if (sec.__mhs !== mh) { sec.__mhs = mh; sec.style.minHeight = mh; }
      }
      var at = anchorTop(), y0 = Math.max(78, cb + 34), lim = at != null ? at - 36 : H * 0.5, y1 = Math.max(y0 + 170, lim), side = right - left >= 760;
      var alpha = (y1 > lim + 8 ? 0.4 : 1) * Math.max(0, Math.min(1, u / 0.4, (LOOP - u) / 0.5));
      ctx.save(); ctx.globalAlpha = alpha;
      if (side) {
        var pw = Math.min(560, (right - left) * 0.44), gx = right - 2 * pw - 56;
        drawSweeps(ctx, { x: gx, y: y0, w: pw, h: y1 - y0 }, u, target, alpha);
        drawAvg(ctx, { x: right - pw, y: y0, w: pw, h: y1 - y0 }, u, alpha);
      } else {
        var mid = y0 + (y1 - y0) * 0.56;
        drawSweeps(ctx, { x: left, y: y0, w: right - left, h: mid - y0 }, u, target, alpha);
        drawAvg(ctx, { x: left, y: mid + 16, w: right - left, h: y1 - mid - 16 }, u, alpha);
      }
      ctx.restore();
    }
    return { still: 11, draw: draw };
  });
})();

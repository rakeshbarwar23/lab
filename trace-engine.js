/* trace-engine.js — one simulation + drawing engine for every Nayak Lab figure.
   Single channels: Markov schemes run with the Gillespie method (exponential dwells, next state
   chosen in proportion to exit rates), digital Gaussian low-pass filter (sigma = 0.1325/fc),
   filtered Gaussian noise, seeded RNG so each page always shows the same record.
   Units: time ms, current pA, rates per ms. Inward current is negative and plotted downward.
   Figures register with TE.define(name, factory) and mount on <canvas data-fig="name">. */
(function () {
  if (window.TE) return;
  var TE = window.TE = {};
  TE.reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  TE.C = { gold: '#f1d49a', gold2: '#e6b667', gold3: '#c98e3c', white: '#ffffff', ink: '#e8ecf3', mute: '#7d889c', axis: 'rgba(255,255,255,0.28)', grid: 'rgba(255,255,255,0.07)', lab: 'rgba(241,212,154,0.9)', blue: '#8fb4e8' };
  TE.MONO = '"Geist Mono", ui-monospace, monospace';

  /* ---------- random numbers ---------- */
  TE.rng = function (seed) {
    var a = (seed >>> 0) || 1;
    return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  };
  TE.gauss = function (r) { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(6.283185307 * r()); };
  TE.expo = function (r, mean) { return -Math.log(1 - r()) * mean; };

  /* ---------- Gillespie simulation of a Markov scheme ----------
     model = { rates: { S: { T: k (per ms) } }, level: { S: fraction of unitary current } } */
  TE.gillespie = function (model, start, tEnd, r) {
    var ev = [], t = 0, s = start;
    while (t < tEnd) {
      var out = model.rates[s], tot = 0, k;
      if (!out) { ev.push({ t: t, s: s, d: tEnd - t }); break; }
      for (k in out) tot += out[k];
      var d = TE.expo(r, 1 / tot);
      ev.push({ t: t, s: s, d: d });
      var u = r() * tot;
      for (k in out) { u -= out[k]; if (u <= 0) break; }
      t += d; s = k;
    }
    return ev;
  };
  // Adds each dwell's level into arr as exact bin averages (sample interval dt), up to sample nmax.
  TE.rasterize = function (ev, level, dt, arr, nmax, scale) {
    var n = Math.min(arr.length, nmax == null ? arr.length : nmax), sc = scale == null ? 1 : scale;
    for (var e = 0; e < ev.length; e++) {
      var L = (level[ev[e].s] || 0) * sc; if (!L) continue;
      var a = ev[e].t / dt, b = (ev[e].t + ev[e].d) / dt, i0 = Math.floor(a), i1 = Math.floor(b);
      if (i0 >= n) continue;
      if (i0 === i1) { arr[i0] += L * (b - a); continue; }
      arr[i0] += L * (i0 + 1 - a);
      for (var i = i0 + 1; i < i1 && i < n; i++) arr[i] += L;
      if (i1 < n) arr[i1] += L * (b - i1);
    }
    return arr;
  };

  /* ---------- Gaussian filter + noise ---------- */
  TE.kernel = function (fc, dt) {
    var sg = 0.1325 / fc / dt, m = Math.max(1, Math.ceil(4 * sg)), k = new Float64Array(2 * m + 1), s = 0;
    for (var i = -m; i <= m; i++) { var w = sg < 0.2 ? (i === 0 ? 1 : 0) : Math.exp(-i * i / (2 * sg * sg)); k[i + m] = w; s += w; }
    for (i = 0; i < k.length; i++) k[i] /= s;
    return k;
  };
  TE.filter = function (x, fc, dt, circ) {
    var k = TE.kernel(fc, dt), m = (k.length - 1) / 2, n = x.length, y = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      var acc = 0;
      for (var j = 0; j < k.length; j++) {
        var q = i + j - m;
        if (q < 0) q = circ ? q + n : 0; else if (q >= n) q = circ ? q - n : n - 1;
        acc += k[j] * x[q];
      }
      y[i] = acc;
    }
    return y;
  };
  // Band-limited noise with the requested RMS, periodic so loops join seamlessly.
  TE.noise = function (n, rms, fc, dt, r) {
    var w = new Float64Array(n);
    for (var i = 0; i < n; i++) w[i] = TE.gauss(r);
    var y = TE.filter(w, fc, dt, true), s = 0;
    for (i = 0; i < n; i++) s += y[i] * y[i];
    var g = rms / Math.sqrt(s / n || 1);
    for (i = 0; i < n; i++) y[i] *= g;
    return y;
  };

  /* ---------- single-channel record from segments ----------
     o = { seed, dt, fc, i (pA), rms, openRms, breakMs, wrapBreak,
           segs: [{ model, start, dur, n (channels), label, brk (break before), i }] }
     Each segment starts and ends closed, so segments and the loop join cleanly. */
  TE.channelTrace = function (o) {
    var r = TE.rng(o.seed || 1), dt = o.dt || 0.01, fc = o.fc || 10, parts = [], labels = [], breaks = [], t0 = 0, brk = o.breakMs || 2;
    function addBreak() { var nb = Math.round(brk / dt); parts.push({ nan: true, n: nb }); breaks.push(t0 + brk / 2); t0 += nb * dt; }
    o.segs.forEach(function (sg, k) {
      if (k > 0 && sg.brk) addBreak();
      var n = Math.round(sg.dur / dt), ideal = new Float64Array(n), tail = sg.tail != null ? sg.tail : 0.8, amp = sg.i != null ? sg.i : o.i;
      for (var c = 0; c < (sg.n || 1); c++) {
        var ev = TE.gillespie(sg.model, sg.start || 'C', sg.dur - tail, r);
        TE.rasterize(ev, sg.model.level, dt, ideal, n - Math.round(tail / dt), amp);
      }
      if (sg.label) labels.push({ t: t0, text: sg.label });
      parts.push({ ideal: ideal, n: n, amp: amp });
      t0 += n * dt;
    });
    if (o.wrapBreak) addBreak();
    var N = 0; parts.forEach(function (p) { N += p.n; });
    var y = new Float32Array(N), id = new Float32Array(N), nz = TE.noise(N, o.rms || 0.4, fc, dt, r), nz2 = TE.noise(N, 1, fc, dt, r), off = 0;
    parts.forEach(function (p) {
      if (p.nan) { for (var i = 0; i < p.n; i++) { y[off + i] = NaN; id[off + i] = NaN; } off += p.n; return; }
      var f = TE.filter(p.ideal, fc, dt, false), unit = Math.abs(p.amp) || 1;
      for (i = 0; i < p.n; i++) {
        var q = off + i, frac = Math.min(3, Math.abs(f[i]) / unit);
        y[q] = f[i] + nz[q] + nz2[q] * (o.openRms || 0) * frac; id[q] = p.ideal[i];
      }
      off += p.n;
    });
    return { y: y, ideal: id, dt: dt, dur: N * dt, labels: labels, breaks: breaks };
  };

  // Per-pixel-column min/max so brief events survive time compression, as on a real display.
  TE.envelope = function (y, dt, mpp) {
    var C = Math.max(1, Math.floor(y.length * dt / mpp)), lo = new Float32Array(C), hi = new Float32Array(C), spc = mpp / dt;
    for (var c = 0; c < C; c++) {
      var a = Math.floor(c * spc), b = Math.max(a + 1, Math.floor((c + 1) * spc)), mn = Infinity, mx = -Infinity, nan = false;
      for (var i = a; i < b && i < y.length; i++) { var v = y[i]; if (v !== v) { nan = true; break; } if (v < mn) mn = v; if (v > mx) mx = v; }
      lo[c] = nan ? NaN : mn; hi[c] = nan ? NaN : mx;
    }
    return { lo: lo, hi: hi, n: C };
  };

  /* ---------- drawing helpers ---------- */
  TE.font = function (ctx, px, w) { ctx.font = (w || 500) + ' ' + px + 'px ' + TE.MONO; };
  TE.text = function (ctx, s, x, y, o) {
    o = o || {}; TE.font(ctx, o.size || 10, o.weight);
    ctx.fillStyle = o.color || TE.C.mute; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
    ctx.fillText(s, x, y);
  };
  TE.line = function (ctx, x0, y0, x1, y1, col, lw, dash) {
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
  };
  // L-shaped scale bar; (x, y) is the corner, bars go up and right.
  TE.scaleBar = function (ctx, x, y, wpx, hpx, lv, lh, o) {
    o = o || {}; var col = o.color || 'rgba(232,236,243,0.7)', sz = o.size || 10;
    ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.setLineDash([]);
    if (o.right) { // corner at bottom-right: horizontal runs left, vertical label sits to the right
      ctx.beginPath(); ctx.moveTo(x - wpx, y); ctx.lineTo(x, y); ctx.lineTo(x, y - hpx); ctx.stroke();
      if (lv) TE.text(ctx, lv, x + 4, y - hpx / 2, { size: sz, color: col, base: 'middle' });
      if (lh) TE.text(ctx, lh, x - wpx / 2, y + 3, { size: sz, color: col, align: 'center', base: 'top' });
      return;
    }
    ctx.beginPath(); ctx.moveTo(x, y - hpx); ctx.lineTo(x, y); ctx.lineTo(x + wpx, y); ctx.stroke();
    if (lv) TE.text(ctx, lv, x - 5, y - hpx / 2, { size: sz, color: col, align: 'right', base: 'middle' });
    if (lh) TE.text(ctx, lh, x + wpx / 2, y + 4, { size: sz, color: col, align: 'center', base: 'top' });
  };
  TE.breakMark = function (ctx, x, y, col) {
    ctx.strokeStyle = col || 'rgba(232,236,243,0.75)'; ctx.lineWidth = 1.2;
    for (var k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.moveTo(x + k * 2.5 - 3, y + 5); ctx.lineTo(x + k * 2.5 + 3, y - 5); ctx.stroke(); }
  };
  TE.ease = function (u) { u = Math.max(0, Math.min(1, u)); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  TE.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---------- scrolling single-channel display ----------
     o = { windowMs, rate (trace ms per wall second), range: [top pA, bottom pA], levels: [{v, label}],
           scale: {pA, ms}, hold, color, lw, head, labelSize } */
  TE.scroller = function (tr, o) {
    var cache = { w: -1 };
    function draw(ctx, b0, t) {
      var gut = o.scale ? (o.gutter || 34) : 0, b = { x: b0.x, y: b0.y, w: b0.w - gut, h: b0.h };
      var mpp = o.windowMs / b.w, sz = o.labelSize || 10;
      if (cache.w !== Math.round(b.w)) { cache.env = TE.envelope(tr.y, tr.dt, mpp); cache.w = Math.round(b.w); }
      var env = cache.env, C = env.n, w = Math.floor(b.w), pos = ((t * o.rate) / mpp) % C, s0 = Math.floor(pos);
      var Y = function (v) { return b.y + (o.range[0] - v) / (o.range[0] - o.range[1]) * b.h; };
      (o.levels || []).forEach(function (L) {
        var yy = Math.round(Y(L.v)) + 0.5;
        TE.line(ctx, b.x + 12, yy, b.x + b.w, yy, 'rgba(241,212,154,0.22)', 1, [3, 4]);
        TE.text(ctx, L.label, b.x, yy, { size: sz, color: 'rgba(241,212,154,0.6)', base: 'middle' });
      });
      var x0 = b.x + 12, span = w - 12, open = false, lastY = 0;
      ctx.beginPath();
      for (var x = 0; x < span; x++) {
        var c = (s0 + x) % C, lo = env.lo[c], hi = env.hi[c], px = x0 + x;
        if (lo !== lo) { open = false; continue; }
        var ya = Y(hi), yb = Y(lo);
        if (!open) { ctx.moveTo(px, ya); open = true; lastY = ya; }
        if (Math.abs(lastY - ya) < Math.abs(lastY - yb)) { ctx.lineTo(px, ya); ctx.lineTo(px, yb); lastY = yb; } else { ctx.lineTo(px, yb); ctx.lineTo(px, ya); lastY = ya; }
      }
      ctx.strokeStyle = o.color || TE.C.gold; ctx.lineWidth = o.lw || 1.2; ctx.lineJoin = 'round'; ctx.stroke();
      if (o.head && open) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x0 + span - 1, lastY, 2.6, 0, 6.2832); ctx.fill(); }
      var yBase = Y(0);
      function colOf(tm) { var c = tm / mpp - s0; while (c < 0) c += C; return c; }
      tr.breaks.forEach(function (tm) { var cx = colOf(tm); if (cx < span) TE.breakMark(ctx, x0 + cx, yBase); });
      tr.labels.forEach(function (L) {
        var cx = colOf(L.t); if (cx >= span) return;
        TE.line(ctx, x0 + cx + 0.5, b.y - 2, x0 + cx + 0.5, b.y + b.h, 'rgba(255,255,255,0.12)', 1, [2, 4]);
        TE.text(ctx, L.text, x0 + cx + 5, b.y - 3, { size: sz, color: TE.C.lab });
      });
      if (o.hold) TE.text(ctx, o.hold, b.x + 12, b.y + b.h + 12, { size: sz, color: TE.C.mute });
      if (o.scale) {
        var wp = o.scale.ms / mpp, hp = o.scale.pA / (o.range[0] - o.range[1]) * b.h;
        TE.scaleBar(ctx, b.x + b.w + 5, b.y + b.h + 3, wp, hp, o.scale.pA + ' pA', o.scale.ms + ' ms', { size: sz, right: true });
      }
    }
    return { draw: draw, loopSec: tr.dur / o.rate };
  };

  /* Hero figure box: right-hand side of the hero on wide screens (aligned to the 1360px content
     column), a faint band at the top on narrow screens. */
  TE.heroBox = function (W, H, o) {
    o = o || {}; var pad = Math.max(20, Math.min(40, W * 0.05));
    if (W >= 1180 || TE.forceWide) {
      var cw = TE._cur, sw = cw && cw.closest('section'), hw = sw && sw.querySelector('h1'), ww = hw && hw.parentNode;
      if (ww && ww.__pt0 != null) { ww.style.paddingTop = ww.__pt0; ww.__pt0 = null; }
      if (cw && cw.__ov) { cw.__ov.style.display = ''; cw.__ov = null; }
      var right = Math.min(W - pad, (W + 1360) / 2 - pad), x = Math.max(W * (o.x0 || 0.56), right - (o.maxW || 720));
      return { x: x, y: H * (o.y0 != null ? o.y0 : 0.16), w: right - x, h: H * ((o.y1 || 0.82) - (o.y0 != null ? o.y0 : 0.16)), a: 1, wide: true };
    }
    var y0 = H * (o.my0 || 0.06), c = TE._cur, sec = c && c.closest('section'), h1 = sec && sec.querySelector('h1'), wrap = h1 && h1.parentNode;
    if (wrap && !o.noRoom) { // narrow screens: reserve a band above the headline, full opacity, never behind text
      var fh = Math.round(TE.clamp(W * 0.85, 280, 380)), ov = c.nextElementSibling;
      if (wrap.__pt0 == null) wrap.__pt0 = wrap.style.paddingTop;
      var want = (fh + 48) + 'px'; if (wrap.style.paddingTop !== want) wrap.style.paddingTop = want;
      if (ov && !ov.hasAttribute('data-fig-cap') && ov.style.display !== 'none') { c.__ov = ov; ov.style.display = 'none'; }
      return { x: pad, y: 40, w: W - 2 * pad, h: fh - 20, a: 1, wide: false };
    }
    return { x: pad, y: y0, w: W - 2 * pad, h: H * (o.my1 || 0.4) - y0, a: 0.3, wide: false };
  };

  /* ---------- mounting ---------- */
  var figs = TE._figs = {};
  TE.live = [];
  // Render every mounted figure at time t (seconds) — for static checks and hidden tabs.
  TE.seek = function (t) { TE.live = TE.live.filter(function (l) { return l.c.isConnected; }); TE.live.forEach(function (l) { l.seek(t); }); };
  TE.define = function (name, factory) { figs[name] = factory; schedule(); };
  function mount(c) {
    var name = c.getAttribute('data-fig');
    if (!name || name.indexOf('{{') >= 0 || !figs[name] || (c.__fig === name && c.__sized)) return;
    c.__fig = name; var gen = c.__gen = (c.__gen || 0) + 1;
    var st = { ctx: c.getContext('2d'), W: 0, H: 0, dpr: 1, t: 0, last: 0, vis: true, err: false }, f;
    try { f = figs[name](c); } catch (e) { (TE.errs = TE.errs || []).push(name + ': ' + (e && e.stack || e)); console.error('[TE] ' + name, e); return; }
    function paint() {
      var ctx = st.ctx; ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); ctx.clearRect(0, 0, st.W, st.H);
      try { TE._cur = c; f.draw(ctx, st.W, st.H, TE.reduce ? (f.still || 0) : st.t); } catch (e) { if (!st.err) { st.err = true; (TE.errs = TE.errs || []).push(name + ': ' + (e && e.stack || e)); console.error('[TE] ' + name, e); } }
    }
    function size() {
      var bb = c.getBoundingClientRect(); st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.W = Math.max(1, bb.width); st.H = Math.max(1, bb.height);
      c.width = Math.round(st.W * st.dpr); c.height = Math.round(st.H * st.dpr); c.__sized = true; paint();
    }
    function tick(now) {
      if (c.__gen !== gen || !c.isConnected) return;
      var dt = st.last ? Math.min(0.05, (now - st.last) / 1000) : 0; st.last = now;
      if (st.vis && st.W > 1) { st.t += dt; var bw = c.clientWidth, bh = c.clientHeight; if (Math.abs(bw - st.W) > 1 || Math.abs(bh - st.H) > 1) size(); else paint(); }
      requestAnimationFrame(tick);
    }
    if (window.ResizeObserver) new ResizeObserver(size).observe(c); else window.addEventListener('resize', size);
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { st.vis = es[es.length - 1].isIntersecting; }).observe(c);
    size();
    TE.live.push({ c: c, seek: function (t) { st.t = t; size(); } });
    if (!TE.reduce) requestAnimationFrame(tick);
  }
  function sweep() { document.querySelectorAll('canvas[data-fig]').forEach(mount); }
  TE.sweep = sweep;
  var pending = false;
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; sweep(); }); }
  if (window.MutationObserver) new MutationObserver(schedule).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-fig'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  window.addEventListener('load', sweep);
  setInterval(sweep, 500); // fallback: templates can swap canvases without a mutation we see
})();

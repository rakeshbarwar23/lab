/* Nayak Lab site effects: simulated patch-clamp traces, animated TKN logo, scroll reveals, image swap.
   Traces are illustrative simulations. Convention: inward current plotted downward. */
(function () {
  if (window.__labFx) return; window.__labFx = true;
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__chanBoost = window.__chanBoost || {};

  /* ---------- kinetic samplers ---------- */
  function makeSampler(mode, r, key) {
    function ex(m) { return -Math.log(r() + 1e-9) * m; }
    // telegraph channel; p() returns {open, shortC, longC, pShort}
    function chan(p, lv, r0) {
      var st = 0, rem = r0 != null ? r0 : ex(40), level = 1;
      return function () {
        if (rem <= 0) {
          var q = p();
          if (st === 0) { st = 1; rem = 1 + ex(q.open); level = lv ? lv() : 1; }
          else { st = 0; rem = r() < q.pShort ? 0.6 + ex(q.shortC) : 10 + ex(q.longC); }
        }
        rem--; return st ? level : 0;
      };
    }
    function fixed(o) { return function () { return o; }; }
    function segs(list, len) { // cycles parameter sets, emits labels at boundaries
      var i = 0, t = 0;
      return { p: function () { return list[i].p; }, tick: function () { var lab = null; if (t === 0) lab = list[i].label; if (++t >= len) { t = 0; i = (i + 1) % list.length; } return lab; }, amp: function () { return list[i].amp || 1; } };
    }
    var S;
    switch (mode) {
      case 'dose':
        S = segs([{ label: 'low [ACh]', p: { open: 4, shortC: 1.2, longC: 320, pShort: 0.3 } }, { label: 'mid [ACh]', p: { open: 5, shortC: 1.2, longC: 70, pShort: 0.6 } }, { label: 'high [ACh]', p: { open: 6, shortC: 1, longC: 12, pShort: 0.8 } }], 340);
        var c1 = chan(S.p); return function () { var l = S.tick(); return { i: c1(), label: l }; };
      case 'modal':
        S = segs([{ label: 'high-Po mode', p: { open: 9, shortC: 1.4, longC: 16, pShort: 0.65 } }, { label: 'low-Po mode', p: { open: 2, shortC: 3, longC: 110, pShort: 0.3 } }], 420);
        var c2 = chan(S.p); return function () { var l = S.tick(); return { i: c2(), label: l }; };
      case 'pam':
        S = segs([{ label: 'control', p: { open: 2.5, shortC: 1.2, longC: 60, pShort: 0.55 } }, { label: '+ PAM', p: { open: 13, shortC: 1.2, longC: 45, pShort: 0.7 } }], 400);
        var c3 = chan(S.p); return function () { var l = S.tick(); return { i: c3(), label: l }; };
      case 'fetal':
        S = segs([{ label: 'adult ε', amp: 1, p: { open: 3.5, shortC: 1, longC: 55, pShort: 0.6 } }, { label: 'fetal γ', amp: 0.62, p: { open: 13, shortC: 1, longC: 55, pShort: 0.6 } }], 400);
        var c4 = chan(S.p); return function () { var l = S.tick(); return { i: c4() * S.amp(), label: l }; };
      case 'trp':
        var c5 = chan(fixed({ open: 1.3, shortC: 0.7, longC: 45, pShort: 0.88 })); return function () { return { i: c5(), extraNoise: 0.03 }; };
      case 'lyso':
        var c6 = chan(fixed({ open: 14, shortC: 2, longC: 70, pShort: 0.4 }), function () { return r() < 0.45 ? 0.5 : 1; }); return function () { return { i: c6() }; };
      case 'multi':
        var cs = [0, 1, 2, 3].map(function () { return chan(fixed({ open: 9, shortC: 1.5, longC: 50, pShort: 0.5 })); });
        return function () { var s = 0; for (var k = 0; k < cs.length; k++) s += cs[k](); return { i: s }; };
      case 'girk':
        var t = 0, L = 560;
        return function () {
          var u = t % L, lab = u === 90 ? 'agonist' : null, I = 0;
          if (u >= 90 && u < 390) { var d = u - 90; I = 1.7 * (1 - Math.exp(-d / 38)) * (0.78 + 0.22 * Math.exp(-d / 160)); }
          else if (u >= 390) { var pk = 1.7 * (1 - Math.exp(-300 / 38)) * (0.78 + 0.22 * Math.exp(-300 / 160)); I = pk * Math.exp(-(u - 390) / 55); }
          t++; return { i: I, label: lab, extraNoise: 0.012 * I };
        };
      case 'step':
        var ts = 0, LS = 380;
        return function () {
          var u = ts % LS, on = u >= 70 && u < 260, I = 0, lab = u === 70 ? 'step' : null;
          if (u === 70) I = -1.6; else if (u === 260) I = 1.4;
          else if (on) { var d = u - 71; I = 1.5 * (1 - Math.exp(-d / 4)) * Math.exp(-d / 26) - 0.45 * (1 - Math.exp(-d / 45)); }
          else if (u > 260) { var e = u - 260; I = -0.45 * Math.exp(-e / 14); }
          ts++; return { i: I, v: on ? 1 : 0, label: lab };
        };
      case 'sparse':
        var c7 = chan(fixed({ open: 4, shortC: 1, longC: 420, pShort: 0.4 })); return function () { return { i: c7() }; };
      case 'join':
        var P8 = function () { return window.__chanBoost[key] ? { open: 12, shortC: 0.8, longC: 5, pShort: 0.8 } : { open: 3, shortC: 1, longC: 900, pShort: 0.2 }; };
        var c8 = chan(P8), b8 = false;
        return function () { var b = !!window.__chanBoost[key]; if (b !== b8) { b8 = b; c8 = chan(P8, null, b ? 2 : ex(40)); } return { i: c8() }; };
      default: // 'burst' — AChR-style clusters of openings
        var c9 = chan(fixed({ open: 5, shortC: 1.2, longC: 150, pShort: 0.72 })); return function () { return { i: c9() }; };
    }
  }

  window.mountChannelTrace = function (canvas, o) {
    if (!canvas || canvas.__trace) return;
    canvas.__trace = true;
    o = Object.assign({ color: '#fff', width: 1.3, speed: 70, amp: 0.34, noise: 0.028, seed: 7, base: 0.36, glow: 0, fade: true, grid: null, levels: null, mode: 'burst', label: 'rgba(241,212,154,0.75)', key: '' }, o || {});
    var ctx = canvas.getContext('2d'), r = rng(o.seed), W = 0, H = 0, dpr = 1, buf = [], labs = [], vbuf = [], filt = 0, acc = 0, last = 0, visible = true;
    var smp = makeSampler(o.mode, r, o.key), isStep = o.mode === 'step';
    function g() { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.2832 * r()); }
    function push() {
      var s = smp();
      filt += (s.i - filt) * (isStep ? 0.9 : 0.6);
      buf.push(filt + g() * (o.noise + (s.extraNoise || 0)));
      labs.push(s.label || null); vbuf.push(s.v || 0);
    }
    function trim() { var n = buf.length - W; if (n > 0) { buf.splice(0, n); labs.splice(0, n); vbuf.splice(0, n); } }
    function resize() {
      var b = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      while (buf.length < W) push();
      trim(); draw();
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (o.grid) {
        ctx.strokeStyle = o.grid; ctx.lineWidth = 1;
        for (var gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx + .5, 0); ctx.lineTo(gx + .5, H); ctx.stroke(); }
        for (var gy = 20; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy + .5); ctx.lineTo(W, gy + .5); ctx.stroke(); }
      }
      var y0 = H * o.base, a = H * o.amp, x;
      if (o.levels) {
        ctx.setLineDash([3, 5]); ctx.strokeStyle = o.levels; ctx.lineWidth = 1;
        [y0, y0 + a].forEach(function (y) { ctx.beginPath(); ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(W, Math.round(y) + .5); ctx.stroke(); });
        ctx.setLineDash([]);
      }
      ctx.font = '500 10px "Geist Mono", ui-monospace, monospace';
      for (x = 0; x < labs.length; x++) if (labs[x]) {
        ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(x + .5, 2); ctx.lineTo(x + .5, H - 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = o.label; ctx.fillText(labs[x], x + 6, 12);
      }
      if (isStep) {
        var vy = H * 0.1, vh = H * 0.1;
        ctx.beginPath();
        for (x = 0; x < vbuf.length; x++) { var yy = vy + vh - vbuf[x] * vh; if (x) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); }
        ctx.strokeStyle = 'rgba(170,179,195,0.55)'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.beginPath();
      for (x = 0; x < buf.length; x++) { var y = y0 + buf[x] * a; if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.lineJoin = 'round'; ctx.lineWidth = o.width; ctx.strokeStyle = o.color;
      if (o.glow) { ctx.shadowColor = o.color; ctx.shadowBlur = o.glow; }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (o.fade) {
        ctx.globalCompositeOperation = 'destination-out';
        var gr = ctx.createLinearGradient(0, 0, W * 0.15, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W * 0.15, H);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (o.head && buf.length) { var hy = y0 + buf[buf.length - 1] * a; ctx.fillStyle = o.head; ctx.beginPath(); ctx.arc(W - 3, hy, 3, 0, 6.2832); ctx.fill(); }
    }
    function tick(t) {
      if (!last) last = t;
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (visible && !reduce && W > 1) {
        acc += o.speed * dt;
        var n = Math.floor(acc);
        if (n > 0) { acc -= n; for (var i = 0; i < n; i++) push(); trim(); draw(); }
      }
      if (canvas.isConnected) requestAnimationFrame(tick);
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);
    resize(); requestAnimationFrame(tick);
  };

  window.mountChannels = function () {
    document.querySelectorAll('canvas[data-chan]').forEach(function (c) {
      if (c.__trace) return;
      var d = c.dataset;
      if (c.hasAttribute('data-mode') && (!d.mode || d.mode.indexOf('{{') >= 0)) return;
      try { window.mountChannelTrace(c, {
        mode: d.mode || 'burst', key: d.key || '', color: d.color || '#f1d49a', width: +d.lw || 1.6, speed: +d.speed || 90,
        amp: +d.amp || 0.3, base: +d.base || 0.3, seed: +d.seed || 5, glow: +d.glow || 0, grid: d.grid || null,
        head: d.head || null, fade: d.fade !== '0', levels: d.levels || null
      }); } catch (err) { c.__trace = false; (window.__chanErr = window.__chanErr || []).push(String(err && err.stack || err)); }
    });
  };

  /* ---------- animated TKN logo: ions flowing through the T pore ----------
     Geometry measured from tkn-logo-reversed.png (pore centre x=16.14%, dot r=4.0% of height, pitch=18.14%). */
  function mountLogo(c) {
    if (c.__logo) return; c.__logo = true;
    var ctx = c.getContext('2d', { alpha: true, desynchronized: true }), W = 0, H = 0, dpr = 1, phase = 0, last = 0, speed = 0.38, target = 0.38, born = performance.now();
    var host = c.closest('a') || c.parentNode;
    host.addEventListener('mouseenter', function () { target = 1.3; });
    host.addEventListener('mouseleave', function () { target = 0.38; });
    host.addEventListener('focus', function () { target = 1.3; }, true);
    host.addEventListener('blur', function () { target = 0.38; }, true);
    function size() { var b = c.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 3); W = b.width; H = b.height; c.width = Math.max(1, W * dpr); c.height = Math.max(1, H * dpr); }
    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var cx = W * 0.1614, rad = H * 0.040, pitch = H * 0.1814, y0 = H * 0.0517;
      var intro = reduce ? 1 : Math.min(1, (now - born) / 900);
      for (var k = -1; k < 7; k++) {
        var y = y0 + (k + phase) * pitch;
        if (y < -rad || y > H + rad) continue;
        var edge = Math.min(1, Math.min(y + rad, H + rad - y) / (rad * 2.2));
        var appear = Math.max(0, Math.min(1, intro * 7 - k));
        ctx.globalAlpha = Math.max(0, edge) * appear;
        ctx.fillStyle = '#e0a53a';
        ctx.beginPath(); ctx.arc(cx, y, rad * (0.6 + 0.4 * appear), 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function tick(t) {
      if (!last) last = t;
      var dt = Math.min(0.034, (t - last) / 1000); last = t;
      speed += (target - speed) * Math.min(1, dt * 4);
      if (!reduce) phase = (phase + speed * dt) % 1;
      draw(t);
      if (c.isConnected) requestAnimationFrame(tick);
    }
    if (window.ResizeObserver) new ResizeObserver(size).observe(c);
    size(); requestAnimationFrame(tick);
  }
  window.mountLogos = function () { document.querySelectorAll('canvas[data-tkn-ions]').forEach(mountLogo); };

  /* ---------- scroll reveals (only hides items below the fold; content stays visible without JS) ---------- */
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, d = +(el.getAttribute('data-reveal-delay') || 0);
      el.style.transition = 'opacity .9s cubic-bezier(.2,.7,0,1) ' + d + 'ms, transform .9s cubic-bezier(.2,.7,0,1) ' + d + 'ms';
      el.style.opacity = '1'; el.style.transform = 'none';
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  window.mountReveals = function () {
    if (!io || reduce) return;
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.__rv) return; el.__rv = true;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.94) return;
      el.style.opacity = '0'; el.style.transform = 'translateY(' + (el.getAttribute('data-reveal') || '22') + 'px)';
      io.observe(el);
    });
  };

  /* ---------- image swap: templates use a blank src + data-src so unresolved holes never hit the network ---------- */
  function swapImgs() {
    document.querySelectorAll('img[data-src]').forEach(function (img) {
      var s = img.getAttribute('data-src');
      if (s && s.indexOf('{{') < 0 && img.getAttribute('src') !== s) img.setAttribute('src', s);
    });
  }
  window.swapImgs = swapImgs;

  function sweep() { try { swapImgs(); window.mountChannels(); window.mountLogos(); window.mountReveals(); } catch (e) { } }
  var pending = false;
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; sweep(); }); }
  if (window.MutationObserver) new MutationObserver(schedule).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-src'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sweep); else sweep();
})();

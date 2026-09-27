/* figs-teaching.js — Teaching hero: Hodgkin–Huxley action potential, computed from the equations.
   Modern convention (rest ≈ −65 mV): gNa 120 m³h, gK 36 n⁴, gL 0.3 mS/cm²; ENa +50, EK −77, EL −54.4 mV; Cm 1 µF/cm².
   RK4, dt = 0.01 ms, from steady state at −65 mV. Four 1-ms pulses of increasing amplitude 25 ms apart, then a
   paired pulse ~5 ms after the last spike. The model alone decides which pulses fire. Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__teach) return; TE.__teach = true;
  var DT = 0.01, TEND = 115, AMPS = [3, 5, 7, 10], PP = 91;
  function simulate() {
    var gNa = 120, gK = 36, gL = 0.3, ENa = 50, EK = -77, EL = -54.4;
    function an(V) { return Math.abs(V + 55) < 1e-7 ? 0.1 : 0.01 * (V + 55) / (1 - Math.exp(-(V + 55) / 10)); }
    function bn(V) { return 0.125 * Math.exp(-(V + 65) / 80); }
    function am(V) { return Math.abs(V + 40) < 1e-7 ? 1 : 0.1 * (V + 40) / (1 - Math.exp(-(V + 40) / 10)); }
    function bm(V) { return 4 * Math.exp(-(V + 65) / 18); }
    function ah(V) { return 0.07 * Math.exp(-(V + 65) / 20); }
    function bh(V) { return 1 / (1 + Math.exp(-(V + 35) / 10)); }
    function f(s, I) {
      var V = s[0], m = s[1], h = s[2], n = s[3];
      return [I - gNa * m * m * m * h * (V - ENa) - gK * n * n * n * n * (V - EK) - gL * (V - EL),
        am(V) * (1 - m) - bm(V) * m, ah(V) * (1 - h) - bh(V) * h, an(V) * (1 - n) - bn(V) * n];
    }
    function add(s, k, c) { return [s[0] + c * k[0], s[1] + c * k[1], s[2] + c * k[2], s[3] + c * k[3]]; }
    var V0 = -65, s = [V0, am(V0) / (am(V0) + bm(V0)), ah(V0) / (ah(V0) + bh(V0)), an(V0) / (an(V0) + bn(V0))];
    for (var k = 0; k < 20000; k++) s = add(s, f(s, 0), DT); // settle to the exact steady state
    var pulses = AMPS.map(function (a, i) { return [10 + 25 * i, a]; }).concat([[PP, AMPS[3]]]);
    var N = Math.round(TEND / DT), out = { V: new Float32Array(N), gNa: new Float32Array(N), gK: new Float32Array(N), I: new Float32Array(N), pulses: pulses };
    for (k = 0; k < N; k++) {
      var t = k * DT, I = 0;
      for (var p = 0; p < pulses.length; p++) if (t >= pulses[p][0] && t < pulses[p][0] + 1) I = pulses[p][1];
      out.V[k] = s[0]; out.gNa[k] = gNa * s[1] * s[1] * s[1] * s[2]; out.gK[k] = gK * s[3] * s[3] * s[3] * s[3]; out.I[k] = I;
      var k1 = f(s, I), k2 = f(add(s, k1, DT / 2), I), k3 = f(add(s, k2, DT / 2), I), k4 = f(add(s, k3, DT), I);
      s = [0, 1, 2, 3].map(function (j) { return s[j] + DT / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]); });
    }
    return out;
  }
  TE.define('teaching', function () {
    var S = simulate(), N = S.V.length, SWEEP = 8, HOLD = 2.5, LOOP = SWEEP + HOLD;
    function draw(ctx, W, H, t) {
      var u = t % LOOP, fade = Math.max(0, Math.min(1, u / 0.3, (LOOP - u) / 0.4)), B = TE.heroBox(W, H, { y0: 0.12, y1: 0.8, maxW: 700 });
      ctx.save(); ctx.globalAlpha = B.a * fade;
      var L = B.x + 46, R = B.x + B.w - 70, n = Math.floor(TE.clamp(u / SWEEP, 0, 1) * (N - 1));
      var X = function (k) { return L + k / (N - 1) * (R - L); };
      var h1 = B.h * 0.5, h2 = B.h * 0.3, gap = B.h * 0.05, P1 = B.y, P2 = P1 + h1 + gap, P3 = P2 + h2 + gap, h3 = B.h - h1 - h2 - 2 * gap;
      var YV = function (v) { return P1 + (50 - v) / 130 * h1; }, YG = function (g) { return P2 + (40 - g) / 40 * h2; }, YI = function (i) { return P3 + h3 - i / 12 * h3; };
      function axis(y0, y1, ticks, fy, unit) {
        TE.line(ctx, L - 0.5, y0, L - 0.5, y1, TE.C.axis, 1);
        ticks.forEach(function (v) { TE.line(ctx, L - 4, fy(v), L, fy(v), TE.C.axis, 1); TE.text(ctx, String(v).replace('-', '−'), L - 7, fy(v), { size: 10, align: 'right', base: 'middle' }); });
        ctx.save(); ctx.translate(B.x + 6, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); TE.text(ctx, unit, 0, 0, { size: 10, align: 'center', base: 'middle' }); ctx.restore();
      }
      axis(P1, P1 + h1, [50, 0, -50], YV, 'Vm (mV)');
      axis(P2, P2 + h2, [0, 20, 40], YG, 'mS/cm²');
      axis(P3, P3 + h3, [0, 10], YI, 'µA/cm²');
      TE.line(ctx, L, YV(50) + 0.5, R, YV(50) + 0.5, 'rgba(241,212,154,0.3)', 1, [3, 4]); TE.text(ctx, 'E_Na +50', R + 6, YV(50), { size: 10, color: TE.C.lab, base: 'middle' });
      TE.line(ctx, L, YV(-77) + 0.5, R, YV(-77) + 0.5, 'rgba(143,180,232,0.35)', 1, [3, 4]); TE.text(ctx, 'E_K −77', R + 6, YV(-77), { size: 10, color: TE.C.blue, base: 'middle' });
      function trace(arr, fy, col, lw) {
        ctx.beginPath(); var st = Math.max(1, Math.floor(N / (R - L) / 2));
        for (var k = 0; k <= n; k += st) { if (k) ctx.lineTo(X(k), fy(arr[k])); else ctx.moveTo(X(k), fy(arr[k])); }
        ctx.lineTo(X(n), fy(arr[n])); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
      }
      trace(S.gK, YG, TE.C.blue, 1.4); trace(S.gNa, YG, TE.C.gold, 1.4); trace(S.I, YI, 'rgba(232,236,243,0.75)', 1.2); trace(S.V, YV, '#ffffff', 1.7);
      if (n > 0 && n < N - 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(n), YV(S.V[n]), 2.8, 0, 6.2832); ctx.fill(); }
      TE.text(ctx, 'g_Na', R + 6, P2 + 10, { size: 10, color: TE.C.gold }); TE.text(ctx, 'g_K', R + 6, P2 + 24, { size: 10, color: TE.C.blue });
      S.pulses.forEach(function (p, i) {
        var k = Math.round(p[0] / DT); if (k > n) return;
        if (i === 4) TE.text(ctx, 'paired', X(k) + 5, P3 + 6, { size: 10, color: TE.C.lab });
        else TE.text(ctx, String(p[1]), X(k), P3 + h3 + 13, { size: 10, align: 'center' });
      });
      var w10 = X(10 / DT) - X(0);
      TE.scaleBar(ctx, R + 6 + w10, P3 + h3, w10, 0, '', '10 ms', { right: true });
      ctx.restore();
    }
    return { still: SWEEP + 0.1, draw: draw };
  });
})();

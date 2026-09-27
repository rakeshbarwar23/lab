/* figs-join.js — Join us hero: your first gigaseal (seal test).
   10 mV, 10 ms pulses at 50 Hz. Pipette in bath: 10 mV / 5 MΩ = 2 nA square, no transients.
   Seal forms: steady current collapses, capacitive spikes remain at the edges; >1 GΩ. Hold −70 mV, C-fast compensated.
   Break-in: transients peak 10 mV / Rs = 1.25 nA, decay τ = Rs × Cm = 8 MΩ × 18 pF = 144 µs; steady ≈ 10 pA (Rm 1 GΩ).
   Needs trace-engine.js. */
(function () {
  var TE = window.TE; if (!TE || TE.__join) return; TE.__join = true;
  var SW = 20, ON = 5, OFF = 15, VP = 10, RS = 8, CM = 18, RM = 1000, LOOP = 13;
  var PH = [
    { t: 0, name: 'Pipette in bath' }, { t: 2.2, name: 'Touching the cell' }, { t: 3.6, name: 'Gentle suction · seal forming' },
    { t: 7.0, name: 'Hold −70 mV · C-fast compensated' }, { t: 9.0, name: 'Break-in · whole-cell' }
  ];
  function state(u) {
    if (u < 2.2) return { ph: 0, R: 5, cap: 0 };
    if (u < 3.6) return { ph: 1, R: 5 + 1.5 * TE.ease((u - 2.2) / 1.4), cap: 0.05 };
    if (u < 7.0) { var p = TE.ease(TE.clamp((u - 3.8) / 2.8, 0, 1)); return { ph: 2, R: 6.5 * Math.pow(2000 / 6.5, p), cap: 0.6 }; }
    if (u < 9.0) return { ph: 3, R: 1800, cap: 0.06, hold: -70 / 1800 };
    return { ph: 4, wc: true, hold: -70 / RM };
  }
  function current(s, t) { // nA at time t (ms) within the sweep
    var on = t >= ON && t < OFF, V = on ? VP : 0, dtOn = t - ON, dtOff = t - OFF, I = (s.hold || 0);
    if (s.wc) {
      var tau = RS * CM / 1000, pk = VP / RS, ss = VP / (RS + RM);
      if (on) I += ss + (pk - ss) * Math.exp(-dtOn / tau); else if (dtOff >= 0) I += -(pk - ss) * Math.exp(-dtOff / tau);
      return I;
    }
    I += V / s.R;
    if (s.cap) { if (on) I += s.cap * Math.exp(-dtOn / 0.03); else if (dtOff >= 0) I -= s.cap * Math.exp(-dtOff / 0.03); }
    return I;
  }
  function readout(s) {
    if (s.wc) return 'Whole-cell · C_m 18 pF · R_s 8 MΩ';
    if (s.R >= 1000) return s.ph === 3 ? '1.8 GΩ' : '> 1 GΩ';
    return (s.R < 10 ? s.R.toFixed(1) : Math.round(s.R)) + ' MΩ';
  }
  TE.define('join', function () {
    function draw(ctx, W, H, t) {
      var u = t % LOOP, fade = Math.max(0, Math.min(1, u / 0.3, (LOOP - u) / 0.4)), B = TE.heroBox(W, H, { y0: 0.14, y1: 0.8, maxW: 640 }), s = state(u);
      ctx.save(); ctx.globalAlpha = B.a * fade;
      var L = B.x + 8, R = B.x + B.w - 50, T = B.y + 104, Bm = B.y + B.h - 20, top = 2.4, bot = -1.5;
      var X = function (tm) { return L + tm / SW * (R - L); }, Y = function (i) { return T + (top - i) / (top - bot) * (Bm - T); };
      TE.text(ctx, (s.ph + 1) + ' / 5', B.x, B.y + 8, { size: 11, color: TE.C.lab, weight: 600 });
      TE.text(ctx, PH[s.ph].name, B.x + 44, B.y + 8, { size: 11, color: TE.C.ink });
      TE.text(ctx, readout(s), B.x, B.y + 48, { size: s.wc ? 14 : 20, color: TE.C.gold, weight: 600 });
      for (var p = 0; p < 5; p++) { ctx.fillStyle = p <= s.ph ? TE.C.gold : 'rgba(255,255,255,0.12)'; ctx.fillRect(B.x + p * 22, B.y + 18, 18, 2); }
      // command potential
      var cy = B.y + 84, ch = 12;
      ctx.beginPath(); ctx.moveTo(X(0), cy); ctx.lineTo(X(ON), cy); ctx.lineTo(X(ON), cy - ch); ctx.lineTo(X(OFF), cy - ch); ctx.lineTo(X(OFF), cy); ctx.lineTo(X(SW), cy);
      ctx.strokeStyle = 'rgba(232,236,243,0.55)'; ctx.lineWidth = 1; ctx.stroke();
      TE.text(ctx, '+10 mV', X(OFF) + 6, cy - ch + 4, { size: 10 });
      TE.line(ctx, L, Y(0) + 0.5, R, Y(0) + 0.5, 'rgba(241,212,154,0.18)', 1, [3, 4]);
      // current: per-pixel min/max of the exact response plus fresh noise each 20-ms sweep
      var r = TE.rng(1 + Math.floor(u * 50)), cols = Math.floor(R - L), sub = 8;
      ctx.beginPath();
      for (var c = 0; c < cols; c++) {
        var mn = Infinity, mx = -Infinity;
        for (var q = 0; q < sub; q++) { var v = current(s, (c + q / sub) / cols * SW) + TE.gauss(r) * 0.008; if (v < mn) mn = v; if (v > mx) mx = v; }
        if (c) ctx.lineTo(L + c, Y(mx)); else ctx.moveTo(L + c, Y(mx));
        ctx.lineTo(L + c, Y(mn));
      }
      ctx.strokeStyle = TE.C.gold; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
      var w5 = X(5) - X(0), h1 = Y(0) - Y(1);
      TE.scaleBar(ctx, R + 8, Bm, w5, h1, '1 nA', '5 ms', { right: true });
      ctx.restore();
    }
    return { still: 12, draw: draw };
  });
})();

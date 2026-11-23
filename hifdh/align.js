/* Lining a matn up with its recording, on the phone, without any network or AI.
   1. loudness every 10 ms -> the reader's pauses
   2. the text is cut where it has punctuation and at every line end ("breakpoints")
   3. a dynamic-programming search matches breakpoints to pauses so that the speech between them has
      the length the text predicts; pauses may stay unmatched (breaths) and so may breakpoints (no pause)
   4. a rough pass on the strong breakpoints first, then a fine pass close to it with the reader's local pace */
const AL = (() => {
  const HOP = 0.01;
  // ---------- audio ----------
  function env(x, sr) {                                   // dB loudness per 10 ms
    const hs = Math.max(1, Math.round(sr * HOP)), n = Math.floor(x.length / hs), d = new Float32Array(n);
    for (let i = 0, o = 0; i < n; i++, o += hs) { let q = 0; for (let k = 0; k < hs; k++) { const v = x[o + k]; q += v * v } d[i] = 10 * Math.log10(q / hs + 1e-12) }
    return d;
  }
  function pauses(db, t0) {                               // [[start,end],...] in seconds (t0 = time of db[0])
    t0 = t0 || 0; const n = db.length; if (!n) return [];
    const step = 500, win = 3000, nb = Math.ceil(n / step), th = new Float32Array(nb);
    for (let b = 0; b < nb; b++) {
      const c = b * step + (step >> 1), lo = Math.max(0, c - (win >> 1)), hi = Math.min(n, c + (win >> 1)), s = [];
      for (let i = lo; i < hi; i += 2) s.push(db[i]);
      s.sort((x, y) => x - y);
      const nz = s[Math.floor(s.length * .08)], sp = s[Math.floor(s.length * .9)];
      th[b] = nz + Math.max(7, .32 * (sp - nz));
    }
    const thr = i => { const f = i / step - .5, b = Math.max(0, Math.min(nb - 1, Math.floor(f))), b2 = Math.min(nb - 1, b + 1), w = Math.max(0, Math.min(1, f - b)); return th[b] * (1 - w) + th[b2] * w };
    // smooth a little so single noisy frames don't split a pause
    const sm = new Float32Array(n);
    for (let i = 0; i < n; i++) { let a = db[i]; if (i > 0) a = Math.max(a, (db[i - 1] + db[i]) / 2); if (i + 1 < n) a = Math.max(a, (db[i + 1] + db[i]) / 2); sm[i] = a }
    const raw = []; let st = -1;
    for (let i = 0; i < n; i++) {
      const q = sm[i] < thr(i);
      if (q && st < 0) st = i; else if (!q && st >= 0) { raw.push([st, i]); st = -1 }
    }
    if (st >= 0) raw.push([st, n]);
    const out = [];                                       // join silences split by a blip shorter than 60 ms
    for (const r of raw) { const l = out[out.length - 1]; if (l && r[0] - l[1] <= 6) l[1] = r[1]; else out.push(r.slice()) }
    return out.filter(r => r[1] - r[0] >= 12).map(r => [t0 + r[0] * HOP, t0 + r[1] * HOP]);
  }
  // ---------- text ----------
  const LETTER = /[ء-ي]/g, MARK = /[ً-ْ]/g, HASL = /[ء-ي]/;
  function weight(t, quran) {
    const L = (t.match(LETTER) || []).length, H = (t.match(MARK) || []).length, W = t.split(/\s+/).filter(x => HASL.test(x)).length;
    return (L + .2 * H + 1.3 * W) * (quran ? 1.3 : 1);
  }
  const lastMark = t => { const m = t.replace(/[\s»«"'()\[\]﴾﴿\-–—]+$/g, ''); return m.slice(-1) };
  // segments and breakpoints of a matn (D = {L:[[sec,portion,text|[h1,h2]]], secs:[...]})
  function units(D) {
    const seg = [], bp = [{ cw: 0, st: 2, line: 0, ls: true }], lineStart = [], lineEnd = [];
    let cw = 0, ps = -1, q = 0;
    const push = (t, line, kind) => {
      const qq = q > 0 || t.includes('﴿'); q += (t.match(/﴿/g) || []).length - (t.match(/﴾/g) || []).length; if (q < 0) q = 0;
      const w = weight(t, qq); cw += w; seg.push({ w, line, kind, t });
    };
    const mark = (st, line, ls) => bp.push({ cw, st, line, ls: !!ls });
    for (let i = 0; i < D.L.length; i++) {
      const si = D.L[i][0], x = D.L[i][2];
      if (si !== ps) { ps = si; const h = (D.secs && D.secs[si]) || ''; if (h && /[ء-ي]/.test(h)) { push(h, i, 'h'); mark(2, i, true) } }
      lineStart[i] = bp.length - 1;
      const parts = Array.isArray(x) ? [x[0] + ' …', x[1]] : x.split(/(?<=[،؛:.!؟?…])\s+/).filter(s => s.trim());
      parts.forEach((p, k) => {
        push(p, i, 't');
        if (k < parts.length - 1) { const m = lastMark(p); mark(/[.:!؟?]/.test(m) ? 1 : 0, i, false) }
      });
      const m = lastMark(parts[parts.length - 1] || ''), nextIsLine = i + 1 < D.L.length;
      mark(/[،؛,]/.test(m) && !Array.isArray(x) ? 1 : 2, i + 1, nextIsLine);   // a line ends a sentence unless it stops at a comma
      lineEnd[i] = bp.length - 1;
    }
    return { seg, bp, lineStart, lineEnd, W: cw };
  }
  // ---------- matching ----------
  function skipBp(st) { return st === 2 ? 2.6 : st === 1 ? 1.1 : .35 }
  function skipP(len) { return len >= .8 ? 3.2 : len >= .5 ? 1.9 : len >= .3 ? .9 : .3 }
  function matchCost(st, len) { return st === 2 ? (len < .25 ? .9 : len < .4 ? .3 : 0) : st === 0 ? (len > .9 ? .7 : len > .6 ? .3 : 0) : (len > 1.2 ? .3 : 0) }
  // K breakpoints (cw, st, rate), M pauses P[j]=[s,e] (P[0] = audio start, P[M-1] = audio end), band[k]=[jlo,jhi]
  function dp(B, P, band, opt) {
    const K = B.length, M = P.length, DK = opt.dk || 7, DJ = opt.dj || 9, INF = 1e18;
    const len = P.map(p => Math.max(0, p[1] - p[0])), SB = new Float64Array(K + 1);
    // real pauses (not the virtual ones at the audio's ends or a part's start) in time order; for every candidate:
    // rS = real pauses that end before it starts, rE = real pauses that end by its end -> pauses strictly between two candidates
    const R = P.filter(p => !p.v), RC = new Float64Array(R.length + 1), RSP = new Float64Array(R.length + 1);
    for (let i = 0; i < R.length; i++) { RC[i + 1] = RC[i] + (R[i][1] - R[i][0]); RSP[i + 1] = RSP[i] + skipP(R[i][1] - R[i][0]) }
    const cntEnd = t => { let lo = 0, hi = R.length; while (lo < hi) { const m = (lo + hi) >> 1; if (R[m][1] <= t + 1e-6) lo = m + 1; else hi = m } return lo };
    const rS = P.map(p => cntEnd(p[0])), rE = P.map(p => cntEnd(p[1]));
    for (let k = 0; k < K; k++) SB[k + 1] = SB[k] + skipBp(B[k].st);
    const cost = [], back = [];
    for (let k = 0; k < K; k++) {
      const [lo, hi] = band[k], w = Math.max(0, hi - lo + 1), c = new Float64Array(w).fill(INF), bk = new Int32Array(w).fill(-1);
      cost.push(c); back.push(bk);
      if (k === 0) { for (let j = lo; j <= hi; j++) if (P[j][1] <= opt.introMax) c[j - lo] = (opt.head ? opt.head(P[j][1]) : 0) + (opt.prior ? opt.prior(0, j) : 0); continue }
      for (let j = lo; j <= hi; j++) {
        const mc = matchCost(B[k].st, len[j]); let best = INF, bi = -1;
        for (let k2 = Math.max(0, k - DK); k2 < k; k2++) {
          const [lo2, hi2] = band[k2], c2 = cost[k2], E = (B[k].cw - B[k2].cw) * (opt.rate ? opt.rate(k2, k) : opt.r), wk = B[k].cw - B[k2].cw;
          const sig = .11 + .65 / Math.sqrt(Math.max(wk, 4)), sbk = SB[k] - SB[k2 + 1];
          for (let j2 = Math.max(lo2, j - DJ); j2 <= Math.min(hi2, j - 1); j2++) {
            const pv = c2[j2 - lo2]; if (pv >= INF) continue;
            const a0 = rE[j2], a1 = rS[j]; if (a1 < a0) continue;
            const A = P[j][0] - P[j2][1] - (RC[a1] - RC[a0]); if (A <= .05) continue;
            const z = Math.log(A / E) / sig, v = pv + .5 * z * z + sbk + (RSP[a1] - RSP[a0]) + mc;
            if (v < best) { best = v; bi = (k - k2) * 1e6 + j2 }
          }
        }
        c[j - lo] = best < INF && opt.prior ? best + opt.prior(k, j) : best; bk[j - lo] = bi;
      }
    }
    // the text ends at a pause; whatever follows is the reader's closing words or silence
    const [loE, hiE] = band[K - 1]; let e = -1, ev = INF;
    for (let j = loE; j <= hiE; j++) { const v = cost[K - 1][j - loE] + (opt.tail ? opt.tail(P[j][0]) : 0); if (v < ev) { ev = v; e = j } }
    const match = new Int32Array(K).fill(-1); if (e < 0) return null;
    let k = K - 1, j = e;
    while (k >= 0 && j >= 0) { match[k] = j; const b = back[k][j - band[k][0]]; if (b < 0) break; k = k - Math.floor(b / 1e6); j = b % 1e6 }
    return { match, cost: ev };
  }
  // speech-time position <-> real time, with the pauses taken out
  function speechMap(P, T) {
    const st = [], acc = [];               // st: speech interval starts; acc: speech time before them
    let t = 0, a = 0; const sp = [];
    for (const p of P) { if (p.v) continue; if (p[0] > t) sp.push([t, p[0]]); t = Math.max(t, p[1]) }
    if (T > t) sp.push([t, T]);
    for (const s of sp) { st.push(s); acc.push(a); a += s[1] - s[0] }
    return {
      total: a,
      toTime(x) { let lo = 0, hi = st.length - 1; if (hi < 0) return 0; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (acc[m] <= x) lo = m; else hi = m - 1 } return Math.min(st[lo][1], st[lo][0] + (x - acc[lo])) },
      toSpeech(t) { let lo = 0, hi = st.length - 1; if (hi < 0) return 0; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (st[m][0] <= t) lo = m; else hi = m - 1 } return acc[lo] + Math.max(0, Math.min(t, st[lo][1]) - st[lo][0]) }
    };
  }
  // main: U = units(D); pz = [[s,e],...] pauses; T = total audio length; files = [start times of each file] (multi-part sets)
  function align(U, pz, T, files, anc) {
    const P = [Object.assign([0, 0], { v: 1 })];
    const fs = (files || [0]).slice(1);
    for (const p of pz) P.push(p);
    for (const f of fs) {                                 // a later part may open with a few spoken words of its own
      P.push(Object.assign([f, f], { v: 1, fs: f }));
      let n = 0; for (const p of pz) if (p[1] > f && p[1] <= f + 45 && p[1] - p[0] >= .3 && n < 6) { P.push(Object.assign([f, p[1]], { v: 1, fs: f })); n++ }
    }
    P.push(Object.assign([T, T], { v: 1 }));
    P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const SM = speechMap(P, T), Wt = U.W, r0 = SM.total / Wt;
    const intro = Math.min(240, T * .25);
    const tail = t => .4 * Math.max(0, SM.total - SM.toSpeech(t) - 6);   // only a few closing words may follow the text
    const head = t => .3 * Math.max(0, SM.toSpeech(t) - 15);              // and only a short opening (title, author, basmala) may come before it
    const spAt = [];
    const bandAround = (Bs, Ps, center, half) => Bs.map((b, k) => {
      const c = center(b, k); let lo = 0, hi = Ps.length - 1;
      const tlo = c - half, thi = c + half;
      while (lo < Ps.length - 1 && Ps[lo][1] < tlo) lo++;
      while (hi > 0 && Ps[hi][0] > thi) hi--;
      if (hi < lo) { const m = Math.max(0, Math.min(Ps.length - 1, lo)); return [m, m] }
      return [lo, hi];
    });
    const heard = anc && anc.length >= 2;
    if (heard) {                                         // places already heard in the recording: [[cw, time], ...]
      for (const a of anc) spAt.push([a[0], SM.toSpeech(a[1])]);
      spAt.sort((x, y) => x[0] - y[0]);
    } else {
    // pass 1: strong breakpoints only, longer pauses only
    const idx1 = U.bp.map((b, k) => k).filter(k => k === 0 || k === U.bp.length - 1 || U.bp[k].st === 2);
    const P1 = P.filter(p => p.v || p[1] - p[0] >= .28);
    const B1 = idx1.map(k => U.bp[k]);
    const half1 = Math.max(60, Math.min(420, SM.total * .12)) + intro * .5;
    const band1 = bandAround(B1, P1, b => SM.toTime(b.cw / Wt * SM.total) + intro * .25, half1);
    band1[0] = [0, Math.max(0, P1.findIndex(p => p[1] > intro)) || P1.length - 1];
    // allow as many skipped pauses between two strong breakpoints as their distance needs
    let gapMax = 0; const dens = P1.length / Math.max(1, T);
    for (let k = 1; k < B1.length; k++) gapMax = Math.max(gapMax, (B1[k].cw - B1[k - 1].cw) * r0 * dens);
    let R1 = null;
    for (const dj of [Math.max(10, Math.min(80, Math.ceil(gapMax * 1.8) + 4)), 160]) { R1 = dp(B1, P1, band1, { r: r0, introMax: intro, dk: 6, dj, tail, head }); if (R1) break }
    if (!R1) return null;
    // the reader's local pace from pass 1 (smoothed), for pass 2
    const anchors = [];
    for (let k = 0; k < B1.length; k++) if (R1.match[k] >= 0) anchors.push([B1[k].cw, k === 0 ? P1[R1.match[k]][1] : P1[R1.match[k]][0], P1[R1.match[k]][1]]);
    for (const a of anchors) spAt.push([a[0], SM.toSpeech(a[2])]);
    }
    const rateAt = cw => {                               // local seconds-per-weight around cw, from anchors ±~300 weight
      let lo = 0; while (lo + 1 < spAt.length && spAt[lo + 1][0] < cw - 400) lo++;
      let hi = spAt.length - 1; while (hi - 1 > 0 && spAt[hi - 1][0] > cw + 400) hi--;
      if (hi <= lo) return r0;
      const r = (spAt[hi][1] - spAt[lo][1]) / Math.max(1, spAt[hi][0] - spAt[lo][0]);
      return r > 0 ? Math.max(r0 * .5, Math.min(r0 * 2, r)) : r0;
    };
    const L = spAt[spAt.length - 1], rg = L[0] > spAt[0][0] ? Math.max(r0 * .5, Math.min(r0 * 2, (L[1] - spAt[0][1]) / (L[0] - spAt[0][0]))) : r0;
    const expTime = cw => {                              // where pass 1 (or the anchors) say this weight is spoken
      if (cw <= spAt[0][0]) return SM.toTime(Math.max(0, spAt[0][1] + (cw - spAt[0][0]) * rg));
      if (cw >= L[0]) return SM.toTime(Math.max(0, L[1] + (cw - L[0]) * rg));
      let i = 0; while (i + 1 < spAt.length && spAt[i + 1][0] <= cw) i++;
      const a = spAt[i], b = spAt[Math.min(spAt.length - 1, i + 1)];
      const s = b[0] > a[0] ? a[1] + (cw - a[0]) / (b[0] - a[0]) * (b[1] - a[1]) : a[1] + (cw - a[0]) * r0;
      return SM.toTime(Math.max(0, s));
    };
    // pass 2: every breakpoint, every pause, near pass 1
    const B2 = U.bp, rate2 = (k2, k) => rateAt((B2[k2].cw + B2[k].cw) / 2);
    const band2 = bandAround(B2, P, b => expTime(b.cw), 14);
    band2[0] = [0, Math.max(band2[0][1], 0)];
    // with heard anchors: every breakpoint is drawn towards where the anchors say it is (more loosely far from any anchor)
    let prior = null;
    if (heard) {
      const at = anc.map(a => a[1]).sort((x, y) => x - y);
      const far = t => { let lo = 0, hi = at.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (at[m] < t) lo = m + 1; else hi = m } let d = Math.abs(at[lo] - t); if (lo > 0) d = Math.min(d, Math.abs(at[lo - 1] - t)); return d };
      const EK = B2.map(b => expTime(b.cw)), SK = EK.map(t => Math.min(8, 1.5 + .07 * far(t)));
      prior = (k, j) => { const z = ((k === 0 ? P[j][1] : P[j][0]) - EK[k]) / SK[k]; return .5 * z * z };
    }
    const R2 = dp(B2, P, band2, { rate: rate2, introMax: intro, dk: 7, dj: 9, tail, head: heard ? null : head, prior });
    if (!R2) return null;
    // times of every breakpoint: speech ends (a) and starts again (b)
    const K = B2.length, ta = new Float64Array(K), tb = new Float64Array(K), got = new Uint8Array(K);
    for (let k = 0; k < K; k++) { const j = R2.match[k]; if (j >= 0) { ta[k] = P[j][0]; tb[k] = P[j][1]; got[k] = 1 } }
    let prev = 0;
    for (let k = 1; k < K; k++) {
      if (!got[k]) continue;
      for (let g = prev + 1; g < k; g++) {               // breakpoints the reader didn't pause at: share the speech by weight
        const s0 = SM.toSpeech(tb[prev]), s1 = SM.toSpeech(ta[k]), f = (B2[g].cw - B2[prev].cw) / Math.max(1e-9, B2[k].cw - B2[prev].cw);
        let t = SM.toTime(s0 + f * (s1 - s0));
        // a short gap close by is probably where it falls
        let bj = -1, bd = .45; for (let j = band2[g][0]; j <= band2[g][1]; j++) { const m = (P[j][0] + P[j][1]) / 2, d = Math.abs(m - t); if (!P[j].v && d < bd && P[j][0] > tb[prev] && P[j][1] < ta[k]) { bd = d; bj = j } }
        if (bj >= 0) { ta[g] = P[bj][0]; tb[g] = P[bj][1] } else { ta[g] = tb[g] = t }
      }
      prev = k;
    }
    const n = U.lineStart.length, on = new Array(n), off = new Array(n);
    for (let i = 0; i < n; i++) { on[i] = +tb[U.lineStart[i]].toFixed(2); off[i] = +ta[U.lineEnd[i]].toFixed(2) }
    let hit = 0, strong = 0; for (let k = 0; k < K; k++) if (B2[k].st === 2) { strong++; if (got[k]) hit++ }
    const skip = {};                                     // where each later part's own text starts (after its spoken opening)
    for (let k = 0; k < K; k++) { const j = R2.match[k]; if (j >= 0 && P[j].fs != null) { const f = (files || [0]).indexOf(P[j].fs); if (f > 0) skip[f] = +(P[j][1] - P[j][0]).toFixed(2) } }
    return { on, off, q: strong ? hit / strong : 0, cost: R2.cost / K, skip };
  }
  // when the recording can't be matched (a very different reading): share the speech out by text length, ending lines at pauses nearby
  function estimate(U, pz, T) {
    const P = pz.slice().sort((a, b) => a[0] - b[0]), SM = speechMap(P, T), n = U.lineStart.length, on = new Array(n), off = new Array(n);
    const near = t => { let best = null, bd = .6; for (const p of P) { const d = Math.abs((p[0] + p[1]) / 2 - t); if (d < bd) { bd = d; best = p } } return best };
    for (let i = 0; i < n; i++) {
      const a = SM.toTime(U.bp[U.lineStart[i]].cw / U.W * SM.total), b = SM.toTime(U.bp[U.lineEnd[i]].cw / U.W * SM.total);
      const pa = near(a), pb = near(b); on[i] = +(pa ? pa[1] : a).toFixed(2); off[i] = +(pb ? pb[0] : b).toFixed(2);
    }
    for (let i = 1; i < n; i++) { if (on[i] < on[i - 1]) on[i] = on[i - 1]; if (off[i - 1] > on[i]) off[i - 1] = on[i] }
    return { on, off, q: 0, est: true, skip: {} };
  }
  return { env, pauses, units, align, estimate, weight, HOP };
})();
if (typeof module !== 'undefined') module.exports = AL;

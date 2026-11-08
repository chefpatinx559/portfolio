/**
 * MeltMark WebGL Engine (Liquid Melting Text)
 * Native vanilla JS implementation for Idriss dev portfolio
 */
function initMeltMark(canvas, options = {}) {
    if (!canvas) return;
    const text = options.text || "idriss.dev";
    const speed = options.speed || 1;
    const interactive = options.interactive !== false;
    const loop = options.loop !== false;
    const size = options.size || 0.86;
    const onReady = options.onReady;

    const wrap = canvas.parentElement;
    if (!wrap) return;

    const SLANT = 0.1848;
    const KIN = 27.207;
    const KSUB = 4;
    const KTOP = 0.1135;
    const KBOT = 45.19;
    const KY0 = -68.044;
    const KY1 = -23.872;
    const KFOOT = 24.915;
    const KPOOL = 20.42;
    const ASC = 186;
    const PI = Math.PI;

    const cap = (x0, y0, x1, y1, r0 = 15, r1 = r0, op = 0) => [0, op, x0, y0, x1, y1, r0, r1];
    const ell = (cx, cy, rx, ry, a = 0, op = 0) => [1, op, cx, cy, rx, ry, a];
    const bez = (ax, ay, bx, by, cx, cy, r0 = 15, r1 = r0, op = 0) => [2, op, ax, ay, bx, by, cx, cy, r0, r1];
    const arc = (cx, cy, R, r, ap, dir, sy = 1, op = 0) => [3, op, cx, cy, R, r, ap, dir, sy];
    const hole = (cx, cy, rx, ry, a = 0) => ell(cx, cy, rx, ry, a, 1);
    const foot = (cx, cy, rx, ry, a = 0) => ell(cx, cy, rx, ry, a, 2);
    const J = 3;

    const mirror = (ps, m) =>
        ps.map((p) => {
            const q = p.slice();
            if (p[0] === 0) { q[2] = m - p[2]; q[4] = m - p[4]; }
            if (p[0] === 1) { q[2] = m - p[2]; q[6] = -p[6]; }
            if (p[0] === 2) { q[2] = m - p[2]; q[4] = m - p[4]; q[6] = m - p[6]; }
            if (p[0] === 3) { q[2] = m - p[2]; q[7] = PI - p[7]; }
            return q;
        });

    const BOWL = [ell(81.804, -59.799, 62.018, 74.556, -0.077), hole(74.298, -59.391, 41.478, 52.517, -0.063)];

    const GLYPHS = {
        l: [43, [cap(18.868, -171.003, 16.012, -4.679, 14.016, 15.489), foot(22.985, -12.269, 23.639, 32.986, 0.341)]],
        a: [159, [
            cap(125.283, -86.257, 109.33, -41.95, 13.349, 28.749),
            bez(38.513, -105.663, 69.761, -137.432, 116.16, -111.659, 10.552, 14.327),
            ell(40.33, -106.422, 5.839, 13.502, 0.69),
            ell(60.719, -24.39, 57.907, 48.161, -0.2),
            hole(75.89, -30.696, 30.373, 19.254, -0.354),
            foot(47.983, -5.412, 27.677, 15.082, 0.688),
            foot(129.72, 0.342, 21.755, 13.199, 0.24),
        ]],
        b: [158, [cap(22.005, -170.717, 26.922, -31.208, 14.834, 19.124), ...BOWL, foot(16.252, -1.198, 16.434, 10.736, -0.292), foot(120.423, -13.625, 4.152, 1.171, -0.921)]],
    };

    const g = GLYPHS;
    g.d = [160, [...mirror([cap(22.005, -170.717, 26, -12, 14.834, 18.5), ...BOWL], 146), foot(129.8, -1.4, 16.7, 10.9, 0.29), foot(44, -6, 26, 12, 0.4)]];
    g.p = [158, [cap(21.5, -118, 23, 62, 15, 15.5), ...BOWL, foot(112, -10, 22, 9, -0.6), foot(52, -2, 26, 11, 0.1)]];
    g.q = [160, [...mirror([cap(21.5, -118, 23, 62, 15, 15.5), ...BOWL], 146), foot(36, -8, 22, 10, 0.5), foot(96, -2, 24, 11, -0.1)]];
    g.g = [160, [...mirror([cap(21.5, -118, 24, 42, 15, 15), bez(24, 42, 26, 92, 92, 80, 15, 12.5, J), ell(93, 79, 6, 12, 1.1), ...BOWL], 146), foot(36, -8, 22, 10, 0.5)]];
    g.o = [140, [ell(66, -59.809, 62, 74.561, -0.086), hole(66, -59.39, 38, 52.528, -0.072), foot(40, -6, 30, 14, 0.3), foot(104, -8, 22, 10, -0.3)]];
    g.c = [124, [arc(68, -62, 50, 15, 2.25, PI, 1.2), ell(102, -106, 6, 12.5, -0.6), foot(52, -4, 30, 13, 0.2)]];
    g.e = [132, [arc(68, -62, 50, 15, 2.55, PI + 0.5, 1.2), cap(26, -66, 112, -66, 12.5, 12.5, J), foot(56, -2, 34, 14, -0.1)]];
    const ARCH = (x0, x1, top = -120, r = 14.5, k = 10) => {
        const R = (x1 - x0) / 2, cy = -64;
        return [arc(x0 + R, cy, R, r, PI / 2 + 0.3, -PI / 2, (cy - top) / R, k), cap(x1, cy + 4, x1 + 2, -6, 15, 17, J)];
    };
    g.n = [138, [cap(17, -118, 17, -8, 15, 16), ...ARCH(19, 105), foot(20, -4, 22, 14, 0.3), foot(104, -6, 26, 12, -0.2)]];
    g.h = [138, [cap(17, -171, 17, -8, 14.5, 16), ...ARCH(19, 105), foot(24, -2, 24, 12, 0.3), foot(100, -8, 28, 12, -0.2)]];
    g.m = [186, [cap(17, -118, 17, -8, 15, 16), ...ARCH(19, 86, -120, 14), ...ARCH(88, 155, -120, 14), foot(22, -4, 22, 13, 0.3), foot(90, 0, 30, 12, 0.1), foot(156, -8, 22, 10, -0.3)]];
    g.r = [100, [cap(17, -118, 17, -8, 15, 16), arc(57, -78, 40, 14.5, 1.38, -1.95, 1.05, 10), ell(90, -101, 6, 12.5, 0.6), foot(26, -2, 26, 13, 0.2)]];
    g.u = [140, [cap(17, -118, 17, -50, 15, 15), arc(62, -54, 45, 15, PI / 2 + 0.25, PI / 2, 1.1, J), cap(107, -118, 108, -6, 15, 17, J), foot(40, 0, 30, 14, 0.1), foot(110, -6, 22, 11, -0.3)]];
    g.i = [50, [cap(17, -118, 17, -8, 15, 16), ell(18, -172, 16.5, 16.5), foot(20, -4, 22, 15, 0.3)]];
    g.j = [86, [cap(54, -118, 54, 40, 15, 15), bez(54, 40, 54, 86, 8, 74, 15, 12.5, J), ell(56, -172, 16.5, 16.5), foot(56, -6, 22, 10, 0)]];
    g.k = [150, [cap(17, -171, 17, -8, 14.5, 16), cap(30, -62, 92, -116, 14, 14, 10), cap(50, -74, 106, -6, 14, 16.5, 10), foot(24, -2, 22, 13, 0.3), foot(104, -4, 20, 12, -0.2)]];
    g.t = [90, [cap(34, -160, 34, -8, 14.5, 16), cap(6, -112, 76, -112, 12.5, 12.5), foot(40, -2, 28, 13, 0.2)]];
    g.f = [94, [cap(32, -138, 32, -8, 15, 16), bez(32, -138, 34, -188, 86, -172, 15, 12.5, J), ell(88, -171, 6, 12, 1.2), cap(6, -112, 74, -112, 12.5, 12.5), foot(36, -2, 26, 13, 0.2)]];
    g.s = [124, [
        bez(100, -104, 88, -122, 58, -121, 12, 13.5),
        bez(58, -121, 24, -120, 24, -94, 13.5, 14.5, J),
        bez(24, -94, 24, -70, 58, -64, 14.5, 15, J),
        bez(58, -64, 96, -58, 96, -34, 15, 15, J),
        bez(96, -34, 96, -4, 56, -3, 15, 15, J),
        bez(56, -3, 30, -2, 22, -14, 15, 14, J),
        ell(101, -102, 6, 13, -0.6),
        foot(56, 6, 30, 14, 0.15), foot(100, 0, 18, 11, -0.3),
    ]];
    g.v = [130, [cap(14, -118, 60, -10, 15, 15), cap(108, -118, 62, -10, 15, 15), foot(62, 0, 30, 14, 0)]];
    g.w = [176, [cap(12, -118, 46, -10, 15, 15), cap(46, -10, 84, -94, 15, 14), cap(84, -94, 122, -10, 14, 15, J), cap(122, -10, 158, -118, 15, 15), foot(46, 0, 26, 13, 0.1), foot(124, -2, 24, 12, -0.2)]];
    g.x = [126, [cap(14, -118, 106, -8, 15, 16), cap(106, -118, 14, -8, 15, 16), foot(20, -2, 22, 12, 0.3), foot(104, -2, 22, 12, -0.3)]];
    g.y = [130, [cap(14, -118, 62, -12, 15, 15), cap(110, -118, 44, 64, 15, 14), ell(44, 64, 13, 14, 0.4), foot(64, -4, 28, 12, 0)]];
    g.z = [122, [cap(18, -118, 100, -118, 14, 14), cap(100, -118, 18, -12, 15, 15, J), cap(18, -12, 104, -12, 15, 15, J), foot(60, -2, 32, 13, 0)]];
    g["0"] = [134, [ell(66, -86, 60, 98), hole(66, -86, 36, 72), foot(40, -4, 26, 13, 0.3), foot(100, -6, 24, 11, -0.3)]];
    g["1"] = [100, [cap(62, -171, 62, -8, 15, 16), cap(60, -168, 24, -138, 14, 14), foot(62, -4, 30, 13, 0)]];
    g["2"] = [132, [arc(64, -126, 42, 15, 2.0, -PI / 2 - 0.15, 1), cap(104, -114, 24, -12, 15, 15, J), cap(24, -12, 112, -12, 15, 15, J), foot(60, -2, 34, 13, 0)]];
    g["3"] = [128, [arc(58, -130, 34, 15, 2.2, 0.1, 1), arc(58, -50, 42, 15, 2.25, -0.05, 1, J), foot(56, -2, 32, 13, 0)]];
    g["4"] = [136, [cap(86, -171, 16, -56, 15, 15), cap(16, -56, 120, -56, 14, 14, J), cap(90, -128, 90, -6, 15, 16), foot(90, -2, 26, 12, -0.1)]];
    g["5"] = [132, [cap(42, -160, 106, -160, 14, 14), cap(42, -160, 34, -98, 15, 15, J), arc(62, -54, 44, 15, 2.3, 0, 1, J), foot(54, -2, 32, 13, 0)]];
    g["6"] = [136, [ell(68, -58, 58, 60), hole(68, -58, 34, 36), bez(14, -64, 18, -166, 100, -162, 15, 13), foot(46, -2, 28, 13, 0.2), foot(108, -8, 20, 10, -0.3)]];
    g["7"] = [126, [cap(16, -160, 108, -160, 14, 14), cap(108, -160, 44, -6, 15, 17, J), foot(46, -2, 26, 12, 0.1)]];
    g["8"] = [130, [ell(64, -130, 44, 42), hole(64, -130, 22, 20), ell(64, -52, 56, 52), hole(64, -52, 31, 29), foot(40, -2, 28, 13, 0.3), foot(98, -4, 24, 11, -0.3)]];
    g["9"] = [136, [ell(66, -116, 58, 60), hole(66, -116, 34, 36), bez(118, -110, 116, -10, 28, -10, 15, 14), foot(70, -2, 34, 13, 0)]];
    g["."] = [48, [ell(22, -16, 17, 17), foot(22, -2, 22, 12, 0)]];
    g[","] = [48, [ell(22, -16, 17, 17), cap(26, -16, 10, 26, 13, 8), foot(22, -2, 20, 11, 0)]];
    g["!"] = [50, [cap(24, -171, 22, -62, 15, 11), ell(22, -16, 16.5, 16.5), foot(22, -2, 22, 12, 0)]];
    g["?"] = [116, [arc(56, -130, 34, 15, 2.25, 0.25, 1), cap(62, -98, 58, -66, 14, 12, J), ell(58, -16, 16.5, 16.5), foot(58, -2, 24, 12, 0)]];
    g["-"] = [86, [cap(12, -64, 74, -64, 14, 14), foot(42, -2, 34, 11, 0)]];
    g["'"] = [42, [cap(22, -171, 20, -128, 13.5, 10)]];
    g[" "] = [54, [foot(27, -4, 48, 13, 0)]];

    const smin = (a, b, k) => {
        const h = Math.max(k - Math.abs(a - b), 0) / k;
        return Math.min(a, b) - h * h * k * 0.25;
    };
    const smax = (a, b, k) => -smin(-a, -b, k);
    const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
    const sstep = (a, b, x) => {
        const t = clamp((x - a) / (b - a));
        return t * t * (3 - 2 * t);
    };

    function bezPts(p) {
        const out = p.slice(2, 10);
        const mx = (out[0] + out[4]) / 2, my = (out[1] + out[5]) / 2;
        if (Math.abs(out[2] - mx) + Math.abs(out[3] - my) < 0.01) out[2] += 0.01;
        return out;
    }

    function sdPrim(p, x, y) {
        switch (p[0]) {
            case 0: {
                const bx = p[4] - p[2], by = p[5] - p[3], ax = x - p[2], ay = y - p[3];
                const t = clamp((ax * bx + ay * by) / Math.max(bx * bx + by * by, 1e-6));
                return Math.hypot(ax - bx * t, ay - by * t) - (p[6] + (p[7] - p[6]) * t);
            }
            case 1: {
                const c = Math.cos(p[6]), s = Math.sin(p[6]), dx = x - p[2], dy = y - p[3];
                const qx = dx * c + dy * s, qy = -dx * s + dy * c;
                const k0 = Math.hypot(qx / p[4], qy / p[5]);
                const k1 = Math.hypot(qx / (p[4] * p[4]), qy / (p[5] * p[5]));
                return (k0 * (k0 - 1)) / Math.max(k1, 1e-6);
            }
            case 2: {
                const [Ax, Ay, Bx, By, Cx, Cy, r0, r1] = bezPts(p);
                const ax = Bx - Ax, ay = By - Ay, bx = Ax - 2 * Bx + Cx, by = Ay - 2 * By + Cy;
                const cx = ax * 2, cy = ay * 2, dx = Ax - x, dy = Ay - y;
                const kk = 1 / (bx * bx + by * by);
                const kx = kk * (ax * bx + ay * by);
                const ky = (kk * (2 * (ax * ax + ay * ay) + (dx * bx + dy * by))) / 3;
                const kz = kk * (dx * ax + dy * ay);
                const pp = ky - kx * kx, q = kx * (2 * kx * kx - 3 * ky) + kz;
                const h = q * q + 4 * pp * pp * pp;
                const d2 = (t) => {
                    const ex = dx + (cx + bx * t) * t, ey = dy + (cy + by * t) * t;
                    return ex * ex + ey * ey;
                };
                let t;
                if (h >= 0) {
                    const hs = Math.sqrt(h);
                    t = clamp(Math.cbrt((hs - q) / 2) + Math.cbrt((-hs - q) / 2) - kx);
                } else {
                    const z = Math.sqrt(-pp);
                    const v = Math.acos(clamp(q / (pp * z * 2), -1, 1)) / 3;
                    const m = Math.cos(v), n = Math.sin(v) * 1.732050808;
                    const ta = clamp((m + m) * z - kx), tb = clamp((-n - m) * z - kx);
                    t = d2(ta) < d2(tb) ? ta : tb;
                }
                return Math.sqrt(d2(t)) - (r0 + (r1 - r0) * t);
            }
            default: {
                const [, , cx, cy, R, r, ap, dir, sy] = p;
                let qx = x - cx, qy = (y - cy) / sy;
                const f = PI / 2 - dir, c = Math.cos(f), s = Math.sin(f);
                const rx = Math.abs(qx * c - qy * s), ry = qx * s + qy * c;
                qx = rx; qy = ry;
                const sa = Math.sin(ap), ca = Math.cos(ap);
                return (ca * qx > sa * qy ? Math.hypot(qx - sa * R, qy - ca * R) : Math.abs(Math.hypot(qx, qy) - R)) - r;
            }
        }
    }

    function primBounds(p) {
        if (p[0] === 0) { const r = Math.max(p[6], p[7]); return [Math.min(p[2], p[4]) - r, Math.min(p[3], p[5]) - r, Math.max(p[2], p[4]) + r, Math.max(p[3], p[5]) + r]; }
        if (p[0] === 1) { const r = Math.max(p[4], p[5]); return [p[2] - r, p[3] - r, p[2] + r, p[3] + r]; }
        if (p[0] === 2) { const r = Math.max(p[8], p[9]); return [Math.min(p[2], p[4], p[6]) - r, Math.min(p[3], p[5], p[7]) - r, Math.max(p[2], p[4], p[6]) + r, Math.max(p[3], p[5], p[7]) + r]; }
        const e = p[4] * Math.max(1, p[8]) + p[5];
        return [p[2] - e, p[3] - e, p[2] + e, p[3] + e];
    }

    function restField(L, x, y) {
        const qx = x + y * SLANT;
        const ky = KTOP + (KBOT - KTOP) * Math.pow(clamp((y - KY0) / (KY1 - KY0)), 2);
        let word = 1e5, pool = 1e5;
        for (const G of L) {
            const lx = qx - G.x;
            const ex = Math.max(G.bmin[0] - lx, lx - G.bmax[0], 0), ey = Math.max(G.bmin[1] - y, y - G.bmax[1], 0);
            const bd = Math.hypot(ex, ey);
            let d = 1e5;
            if (G.bmax[0] > G.bmin[0]) {
                if (bd > 72) d = bd;
                else {
                    let first = true;
                    for (const p of G.prims) {
                        if (p[1] === 0 || p[1] >= J) {
                            const s = sdPrim(p, lx, y);
                            d = first ? s : p[1] === J ? Math.min(d, s) : smin(d, s, p[1] === 0 ? KIN : p[1]);
                            first = false;
                        }
                    }
                    for (const p of G.prims) if (p[1] === 1) d = smax(d, -sdPrim(p, lx, y), KSUB);
                }
            }
            word = smin(word, d, ky);
            for (const p of G.prims) if (p[1] === 2) pool = smin(pool, sdPrim(p, lx, y), KFOOT);
        }
        return smin(word, pool, KPOOL);
    }

    function layoutText(txt) {
        const chars = Array.from(txt.toLowerCase()).slice(0, 24);
        const glyphs = [];
        let x = 0;
        for (const ch of chars) {
            const gl = GLYPHS[ch] ?? GLYPHS[" "];
            const b = [1e9, 1e9, -1e9, -1e9];
            for (const p of gl[1]) {
                if (p[1] !== 0 && p[1] < J) continue;
                const pb = primBounds(p);
                b[0] = Math.min(b[0], pb[0]); b[1] = Math.min(b[1], pb[1]); b[2] = Math.max(b[2], pb[2]); b[3] = Math.max(b[3], pb[3]);
            }
            glyphs.push({ x, prims: gl[1], bmin: [b[0], b[1]], bmax: [b[2], b[3]], cx: b[2] > b[0] ? (b[0] + b[2]) / 2 : gl[0] / 2 });
            x += gl[0];
        }
        if (!glyphs.length) glyphs.push({ x: 0, prims: GLYPHS[" "][1], bmin: [0, 0], bmax: [0, 0], cx: 27 });
        const x0 = -80, x1 = x + 80, y0 = -260, y1 = 140, st = 1;
        const bb = [1e9, 1e9, -1e9, -1e9];
        const nx = Math.ceil((x1 - x0) / st);
        const bottom = new Float32Array(nx).fill(-1e9);
        for (let j = 0; j * st + y0 < y1; j++) {
            const y = y0 + j * st;
            for (let i = 0; i < nx; i++) {
                const xx = x0 + i * st;
                if (restField(glyphs, xx, y) < 0) {
                    if (xx < bb[0]) bb[0] = xx;
                    if (xx > bb[2]) bb[2] = xx;
                    if (y < bb[1]) bb[1] = y;
                    if (y > bb[3]) bb[3] = y;
                    if (y < 60) bottom[i] = Math.max(bottom[i], y);
                }
            }
        }
        if (bb[0] > bb[2]) { bb[0] = 0; bb[1] = -ASC; bb[2] = Math.max(x, 1); bb[3] = 0; }
        const cand = [];
        for (let i = 3; i < nx - 3; i++) {
            const v = bottom[i];
            if (v > -20 && v >= bottom[i - 3] && v >= bottom[i + 3]) cand.push([x0 + i * st, v]);
        }
        cand.sort((p, q) => q[1] - p[1]);
        const drips = [];
        for (const c of cand) {
            if (drips.length >= 3) break;
            if (drips.every((d) => Math.abs(d[0] - c[0]) > 40)) drips.push(c);
        }
        const ink = glyphs.filter((G) => G.bmax[0] > G.bmin[0]);
        const first = ink.length ? ink[0].x + ink[0].bmin[0] : 0;
        const lastG = ink[ink.length - 1];
        const last = lastG ? lastG.x + lastG.bmax[0] : x;
        const beads = [];
        for (const G of [ink[0], ink[ink.length - 1]]) {
            if (!G || beads.length >= 2 || (beads.length && G === ink[0])) continue;
            const stm = G.prims.find((p) => p[0] === 0 && p[1] === 0 && Math.abs(p[3] - p[5]) > 90);
            if (stm) {
                const top = stm[3] < stm[5] ? 0 : 1;
                const ax = stm[2 + top * 2], ay = stm[3 + top * 2], bx = stm[4 - top * 2], by = stm[5 - top * 2];
                const off = Math.max(stm[6], stm[7]) * 0.5;
                beads.push([G.x + ax + off, Math.max(ay, -150) + 30, G.x + bx + off, -8, by !== ay ? (bx - ax) / (by - ay) : 0]);
            }
        }
        return { glyphs, bbox: bb, drips, beads, first, last };
    }

    const f = (v) => {
        const s = (Math.round(v * 10000) / 10000).toString();
        return s.includes(".") || s.includes("e") ? s : s + ".0";
    };
    const v2 = (a, b) => `vec2(${f(a)},${f(b)})`;

    function glslPrim(p, P, scale = "") {
        switch (p[0]) {
            case 0: return `sCap(${P},${v2(p[2], p[3])},${v2(p[4], p[5])},${f(p[6])},${f(p[7])})`;
            case 1: return `sEll(${P},${v2(p[2], p[3])},${v2(p[4], p[5])}${scale},${v2(Math.cos(p[6]), Math.sin(p[6]))})`;
            case 2: { const b = bezPts(p); return `sBez(${P},${v2(b[0], b[1])},${v2(b[2], b[3])},${v2(b[4], b[5])},${f(b[6])},${f(b[7])})`; }
            default: return `sArc(${P},${v2(p[2], p[3])},${f(p[4])},${f(p[5])},${v2(Math.sin(p[6]), Math.cos(p[6]))},${v2(Math.cos(PI / 2 - p[7]), Math.sin(PI / 2 - p[7]))},${f(p[8])})`;
        }
    }

    function buildShader(L, maxDrips, deriv) {
        const n = L.glyphs.length;
        let fns = "";
        let body = "";
        L.glyphs.forEach((G, i) => {
            const adds = G.prims.filter((p) => p[1] === 0 || p[1] >= J);
            const subs = G.prims.filter((p) => p[1] === 1);
            const feet = G.prims.filter((p) => p[1] === 2);
            if (adds.length) {
                fns += `float G${i}(vec2 p,float kin){float d=${glslPrim(adds[0], "p")};\n`;
                for (const p of adds.slice(1)) {
                    fns += p[1] === J ? `d=min(d,${glslPrim(p, "p")});\n` : `d=smin(d,${glslPrim(p, "p")},${p[1] === 0 ? "kin" : f(p[1])});\n`;
                }
                for (const p of subs) fns += `d=smax(d,-${glslPrim(p, "p")},${f(KSUB)});\n`;
                fns += `return d;}\n`;
                body += `{vec2 lp=q-vec2(${f(G.x)},0.0);vec4 A=uA[${i}];vec4 B=uB[${i}];\n` +
                    `lp.y-=A.x;lp.x+=A.y*lp.y;float sx=inversesqrt(A.z);lp.x=(lp.x-${f(G.cx)})/sx+${f(G.cx)};lp.y/=A.z;\n` +
                    `vec2 e2=max(${v2(G.bmin[0], G.bmin[1])}-lp,lp-${v2(G.bmax[0], G.bmax[1])});float bd=length(max(e2,0.0));\n` +
                    `float d=bd>72.0?bd:G${i}(lp,uKin);d=d*min(sx,A.z)-A.w;\n` +
                    `if(B.x<900.0)d=smax(d,w.y-B.x,10.0);\n` +
                    `word=smin(word,d,ky);}\n`;
            }
            if (feet.length) {
                body += `{vec2 fp=fq-vec2(${f(G.x)},0.0);\n`;
                for (const p of feet) body += `pool=smin(pool,${glslPrim(p, "fp", "*uPool.z")},${f(KFOOT)});\n`;
                body += `}\n`;
            }
        });
        return `${deriv ? "#extension GL_OES_standard_derivatives : enable\n" : ""}precision highp float;
uniform vec2 uRes;uniform vec3 uMap;uniform vec3 uColor;uniform float uKin;
uniform vec4 uA[${n}];uniform vec4 uB[${n}];uniform vec4 uPool;uniform vec4 uBand;uniform vec4 uDrip[${maxDrips}];uniform vec4 uPtr;uniform vec4 uBox;
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.0)/k;return min(a,b)-h*h*k*0.25;}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float sCap(vec2 p,vec2 a,vec2 b,float r0,float r1){vec2 pa=p-a,ba=b-a;float t=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.0,1.0);return length(pa-ba*t)-mix(r0,r1,t);}
float sEll(vec2 p,vec2 c,vec2 r,vec2 cs){vec2 d=p-c;vec2 q=vec2(d.x*cs.x+d.y*cs.y,-d.x*cs.y+d.y*cs.x);float k0=length(q/r);float k1=length(q/(r*r));return k0*(k0-1.0)/max(k1,1e-6);}
float cbrt(float x){return sign(x)*pow(abs(x),1.0/3.0);}
float sBez(vec2 pos,vec2 A,vec2 B,vec2 C,float r0,float r1){
vec2 a=B-A,b=A-2.0*B+C,c=a*2.0,d=A-pos;
float kk=1.0/dot(b,b),kx=kk*dot(a,b),ky=kk*(2.0*dot(a,a)+dot(d,b))/3.0,kz=kk*dot(d,a);
float p=ky-kx*kx,q=kx*(2.0*kx*kx-3.0*ky)+kz,h=q*q+4.0*p*p*p;float t;
if(h>=0.0){h=sqrt(h);t=clamp(cbrt((h-q)*0.5)+cbrt((-h-q)*0.5)-kx,0.0,1.0);}
else{float z=sqrt(-p);float v=acos(clamp(q/(p*z*2.0),-1.0,1.0))/3.0;float m=cos(v),n=sin(v)*1.732050808;
float ta=clamp((m+m)*z-kx,0.0,1.0),tb=clamp((-n-m)*z-kx,0.0,1.0);
vec2 ea=d+(c+b*ta)*ta,eb=d+(c+b*tb)*tb;t=dot(ea,ea)<dot(eb,eb)?ta:tb;}
vec2 e=d+(c+b*t)*t;return length(e)-mix(r0,r1,t);}
float sArc(vec2 p,vec2 c,float R,float r,vec2 sc,vec2 rot,float sy){vec2 q=p-c;q.y/=sy;q=vec2(q.x*rot.x-q.y*rot.y,q.x*rot.y+q.y*rot.x);q.x=abs(q.x);
return (sc.y*q.x>sc.x*q.y?length(q-sc*R):abs(length(q)-R))-r;}
${fns}
float field(vec2 w){
vec2 q=vec2(w.x+w.y*${f(SLANT)},w.y);
float ky=${f(KTOP)}+${f(KBOT - KTOP)}*pow(clamp((w.y-(${f(KY0)}))/${f(KY1 - KY0)},0.0,1.0),2.0);
float word=1e5;float pool=1e5;
vec2 fq=q;fq.y-=uPool.x*sin(fq.x*0.045-uPool.y);
${body}
if(uBand.w>0.0)pool=smin(pool,sCap(fq,vec2(uBand.x,uBand.z),vec2(uBand.y,uBand.z),uBand.w,uBand.w),${f(KFOOT)});
for(int i=0;i<${maxDrips};i++){vec4 D=uDrip[i];if(D.z>0.0){vec2 dq=q-D.xy;dq.y*=D.w;pool=smin(pool,length(dq)-D.z,12.0);}}
return smin(word,pool,${f(KPOOL)});}
void main(){
vec2 px=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
vec2 w=(px-uMap.xy)*uMap.z;
bool inBox=!(w.x<uBox.x||w.x>uBox.z||w.y<uBox.y||w.y>uBox.w);
float infl=0.0;
if(uPtr.z>0.001){vec2 dp=w-uPtr.xy;float gg=uPtr.z*exp(-dot(dp,dp)/(uPtr.w*uPtr.w));w+=dp*gg*0.25;infl=gg*6.5;}
float d=inBox?field(w)-infl:1e4;
${deriv ? "float gr=clamp(length(vec2(dFdx(d),dFdy(d))),uMap.z*0.05,uMap.z*3.0);" : "float gr=uMap.z;"}
float a=clamp(0.5-d/gr/1.4,0.0,1.0);
float splitX = 605.0;
vec3 cWhite = vec3(0.921, 0.910, 0.886);
vec3 cAmber = vec3(0.894, 0.659, 0.325);
vec3 col = mix(cWhite, cAmber, clamp((w.x - splitX) * 0.1 + 0.5, 0.0, 1.0));
gl_FragColor=vec4(col*a,a);}`;
    }

    const PERIOD = 10;
    const MS = 0.6;
    const MD = 1.7;
    const RS = 2.85;
    const REST_T = 7.25;
    const DEPTH = 215;
    const INTRO_U = 2.3;
    const OFF = 1000;

    function spring(t, zeta, hz) {
        if (t <= 0) return 0;
        const w = 2 * PI * hz, wd = w * Math.sqrt(1 - zeta * zeta);
        return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
    }
    const env = (t, rise = 0.15, decay = 1.1) => (t <= 0 ? 0 : (1 - Math.exp(-t / rise)) * Math.exp(-t / decay));

    function frameAt(u, intro, clicks, clock, L, out, sunk = false) {
        const n = L.glyphs.length;
        const ink = L.glyphs.map((G) => G.bmax[0] > G.bmin[0]);
        const nInk = Math.max(1, ink.filter(Boolean).length);
        const stg = nInk > 1 ? Math.min(0.1, 0.35 / (nInk - 1)) : 0;
        let k = 0;
        let sub = 0;
        for (let i = 0; i < n; i++) {
            const s = ink[i] ? stg * k++ : 0;
            let oy = 0, sway = 0, st = 1, swell = 0, clip = OFF;
            const ph = i * 1.7;
            if (u >= MS && u < RS) {
                const m = sunk ? 1 : clamp((u - MS - s) / MD);
                if (m > 0) {
                    const e = Math.pow(sstep(0, 1, m), 1.6);
                    oy = DEPTH * e;
                    const b = Math.sin(PI * m);
                    swell = 1.5 * b;
                    sway = 0.07 * b * (i % 2 ? 1 : -1);
                    st = 1 - 0.07 * b;
                    clip = 40 - 44 * sstep(0, 0.12, m);
                }
            } else if (u >= RS) {
                const t = u - RS - s;
                const W = 1 - sstep(3.0, 3.9, t);
                if (t <= 0) { oy = DEPTH; clip = -4; } else {
                    oy = DEPTH * (1 - spring(t, 0.62, 1.05)) * W;
                    st = 1 + 0.1 * Math.exp(-t / 0.7) * Math.sin(2 * PI * 1.5 * t) * W;
                    sway = 0.05 * Math.exp(-t / 0.8) * Math.sin(2 * PI * 1.2 * t + ph) * W * sstep(0, 0.3, t);
                    swell = 4 * Math.exp(-t / 0.35) * W;
                    clip = t < 0.55 ? -4 : t < 1.15 ? -4 + 48 * sstep(0.55, 1.1, t) : OFF;
                }
            }
            for (const c of clicks) {
                const t = clock - c;
                if (t > 0 && t < 2.6) {
                    const W = 1 - sstep(1.8, 2.6, t);
                    sway += 0.045 * Math.exp(-t / 0.55) * Math.sin(2 * PI * 1.6 * t + ph) * W;
                    st += 0.06 * Math.exp(-t / 0.5) * Math.sin(2 * PI * 2.1 * t + 0.4 * i) * W;
                }
            }
            out.A[i * 4] = oy; out.A[i * 4 + 1] = sway; out.A[i * 4 + 2] = Math.max(0.2, st); out.A[i * 4 + 3] = swell;
            out.B[i * 4] = clip; out.B[i * 4 + 1] = 0;
            if (ink[i]) sub += clamp(oy / DEPTH);
        }
        const puddle = sub / nInk;
        const blob = sstep(MS, MS + 0.6, u) * (1 - sstep(RS + 0.3, RS + 1.6, u));
        out.kin = KIN + 3 * blob;
        let rip = 6 * env(u - MS - 0.5, 0.2, 1.6) + 6 * env(u - RS - 0.15);
        for (const c of clicks) rip += 4 * env(clock - c, 0.1, 0.6) * (1 - sstep(1.8, 2.6, clock - c));
        rip *= 1 - sstep(REST_T - 1.2, REST_T - 0.2, u);
        const ps = (1 + 0.14 * puddle) * (intro < 1 ? sstep(0, 1, intro) : 1);
        out.pool[0] = rip; out.pool[1] = u * 5.2; out.pool[2] = Math.max(0.01, ps); out.pool[3] = 0;
        const bandR = 17 * sstep(MS, MS + 0.5, u) * (1 - sstep(RS + 0.4, RS + 1.4, u)) * (intro < 1 ? sstep(0.2, 1, intro) : 1);
        out.band[0] = L.first + 18; out.band[1] = L.last - 18; out.band[2] = 2; out.band[3] = L.last - L.first > 48 ? bandR : 0;
        out.drip.fill(0);
        L.beads.forEach(([x0, y0, , y1, dxdy], j) => {
            const t = u - (RS + 0.5 + j * 0.32);
            if (t > 0 && t < 1.3) {
                const k = clamp(t / 0.95);
                const y = y0 + (y1 - y0) * k * k * (1.6 - 0.6 * k);
                const x = x0 + (y - y0) * dxdy;
                const r = 7.5 * sstep(0, 0.15, t) * (1 - sstep(0.95, 1.3, t));
                const o = (3 + j) * 4;
                out.drip[o] = x; out.drip[o + 1] = y; out.drip[o + 2] = r; out.drip[o + 3] = 0.8;
            }
        });
        L.drips.forEach(([x, bot], j) => {
            const t = u - (RS + 0.95 + j * 0.38);
            if (t > 0 && t < 2.4) {
                const grow = sstep(0, 0.6, t);
                const back = t > 0.75 ? spring(t - 0.75, 0.5, 1.4) : 0;
                const ext = 17 * grow * (1 - back);
                const r = 9 * (1 - sstep(2.0, 2.4, t));
                out.drip[j * 4] = x + bot * SLANT; out.drip[j * 4 + 1] = bot - r + 1 + ext; out.drip[j * 4 + 2] = r; out.drip[j * 4 + 3] = 1 - 0.18 * grow * (1 - back);
            }
        });
    }

    const L = layoutText(text);
    const n = L.glyphs.length;
    const MAXD = 5;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    let W = 1, H = 1, dpr = 1;
    const fr = { A: new Float32Array(n * 4), B: new Float32Array(n * 4), kin: KIN, pool: [0, 0, 1, 0], band: [0, 0, 0, 0], drip: new Float32Array(MAXD * 4) };

    const mapping = () => {
        const bb = L.bbox;
        const bw = bb[2] - bb[0], bh = bb[3] - bb[1];
        let s = (Math.max(0.02, size) * Math.min(W, H)) / ASC;
        s = Math.min(s, (0.94 * W) / Math.max(bw, 1), (0.94 * H) / Math.max(bh, 1));
        return { s, cx: (bb[0] + bb[2]) / 2, cy: (bb[1] + bb[3]) / 2 };
    };

    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true }) ||
               canvas.getContext("experimental-webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
    let prog = null;
    const U = {};
    if (gl) {
        const sh = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.warn(gl.getShaderInfoLog(s));
                return null;
            }
            return s;
        };
        const vs = sh(gl.VERTEX_SHADER, "attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}");
        const fs = sh(gl.FRAGMENT_SHADER, buildShader(L, MAXD, !!gl.getExtension("OES_standard_derivatives")));
        if (vs && fs) {
            prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
        }
        if (prog) {
            gl.useProgram(prog);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(prog, "aPos");
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            for (const k of ["uRes", "uMap", "uColor", "uKin", "uA", "uB", "uPool", "uBand", "uDrip", "uPtr", "uBox"]) {
                U[k] = gl.getUniformLocation(prog, k);
            }
        }
    }

    if (!prog) return;

    if (typeof onReady === 'function') onReady();

    const ptr = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0, seen: false };
    const clicks = [];

    const draw = (u, intro, clock) => {
        const m = mapping();
        frameAt(u, intro, clicks, clock, L, fr, uAbs < RS);
        const inv = 1 / (m.s * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform3f(U.uMap, canvas.width / 2 - m.cx / inv, canvas.height / 2 - m.cy / inv, inv);
        gl.uniform3f(U.uColor, 1.0, 1.0, 1.0);
        gl.uniform1f(U.uKin, fr.kin);
        gl.uniform4fv(U.uA, fr.A);
        gl.uniform4fv(U.uB, fr.B);
        gl.uniform4f(U.uPool, ...fr.pool);
        gl.uniform4f(U.uBand, ...fr.band);
        gl.uniform4fv(U.uDrip, fr.drip);
        const sig = 52;
        gl.uniform4f(U.uPtr, (ptr.x / m.s - W / 2 / m.s) + m.cx, (ptr.y / m.s - H / 2 / m.s) + m.cy, ptr.s, sig);
        const bb = L.bbox;
        gl.uniform4f(U.uBox, bb[0] - 90, bb[1] - 90, bb[2] + 90, bb[3] + 110);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const still = () => !!reduce?.matches || !prog;
    let clock = 0;
    let uAbs = still() ? REST_T : INTRO_U;
    let last = performance.now();
    let raf = 0;
    let visible = document.visibilityState !== "hidden";
    let onScreen = true;
    const uNow = () => (loop ? ((uAbs % PERIOD) + PERIOD) % PERIOD : Math.min(uAbs, PERIOD - 0.001));
    const introNow = () => clamp((uAbs - INTRO_U) / 0.8, 0, 1) + (uAbs - INTRO_U > 0.8 ? 1 : 0);

    const render = () => draw(uNow(), still() ? 2 : introNow(), clock);

    const idle = () => {
        const u = uNow();
        const restNow = !loop && u >= REST_T;
        const quiet = ptr.s < 0.002 && ptr.ts === 0 && (!clicks.length || clock - clicks[clicks.length - 1] > 2.6);
        return restNow && quiet;
    };

    const frame = (now) => {
        raf = 0;
        const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)) * Math.max(0, speed);
        last = now;
        clock += dt;
        uAbs += dt;
        const k = 1 - Math.exp(-dt * 8);
        ptr.x += (ptr.tx - ptr.x) * k;
        ptr.y += (ptr.ty - ptr.y) * k;
        ptr.s += ((interactive ? ptr.ts : 0) - ptr.s) * (1 - Math.exp(-dt * 5));
        while (clicks.length && clock - clicks[0] > 2.6) clicks.shift();
        render();
        if (!idle()) schedule();
    };

    const schedule = () => {
        if (raf || !visible || !onScreen) return;
        if (still()) { render(); return; }
        last = performance.now();
        raf = requestAnimationFrame(frame);
    };

    const resize = () => {
        const r = wrap.getBoundingClientRect();
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(W * dpr));
        canvas.height = Math.max(1, Math.round(H * dpr));
        render();
    };

    const onMove = (e) => {
        if (!interactive || still()) return;
        const r = wrap.getBoundingClientRect();
        ptr.tx = e.clientX - r.left;
        ptr.ty = e.clientY - r.top;
        if (!ptr.seen) { ptr.x = ptr.tx; ptr.y = ptr.ty; ptr.seen = true; }
        ptr.ts = e.pointerType === "touch" && e.type === "pointermove" ? ptr.ts : 1;
        schedule();
    };
    const onLeave = () => { ptr.ts = 0; ptr.seen = false; schedule(); };
    const onDown = (e) => {
        onMove(e);
        if (!interactive || still()) return;
        clicks.push(clock);
        if (clicks.length > 4) clicks.shift();
        schedule();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver((es) => {
        onScreen = es.some((e) => e.isIntersecting);
        if (onScreen) schedule();
    });
    io.observe(wrap);

    document.addEventListener("visibilitychange", () => {
        visible = document.visibilityState !== "hidden";
        if (visible) schedule();
    });

    window.addEventListener("load", resize);
    window.addEventListener("resize", resize);

    resize();
    schedule();
}

if (typeof window !== 'undefined') {
    window.initMeltMark = initMeltMark;
}

/**
 * INTEG-SOLVER.JS
 * Motor de INTEGRACIÓN NUMÉRICA:
 *  - Regla del Trapecio compuesta (simple si n = 1)
 *  - Regla de Simpson 1/3 compuesta (n par) y Simpson 3/8 compuesta (n múltiplo de 3)
 *  - Integración de Romberg (extrapolación de Richardson sobre trapecios)
 *  - Cuadratura Gaussiana (Gauss–Legendre de 2 a 6 puntos, con subintervalos opcionales)
 */

/* ---------- Nodos y pesos de Gauss–Legendre en [-1, 1] ---------- */
const GAUSS_HALF = {
  2: { t: [0.5773502691896257], w: [1.0], w0: null },
  3: { t: [0.7745966692414834], w: [0.5555555555555556], w0: 0.8888888888888888 },
  4: { t: [0.3399810435848563, 0.8611363115940526], w: [0.6521451548625461, 0.3478548451374538], w0: null },
  5: { t: [0.5384693101056831, 0.9061798459386640], w: [0.4786286704993665, 0.2369268850561891], w0: 0.5688888888888889 },
  6: { t: [0.2386191860831969, 0.6612093864662645, 0.9324695142031521], w: [0.4679139345726910, 0.3607615730481386, 0.1713244923791704], w0: null }
};

/** Lista completa [{t, w}] ordenada de menor a mayor para n puntos. */
function gaussLegendreTable(n) {
  const h = GAUSS_HALF[n];
  if (!h) throw new Error('Gauss–Legendre disponible solo de 2 a 6 puntos.');
  const neg = h.t.map((t, i) => ({ t: -t, w: h.w[i] })).reverse();
  const pos = h.t.map((t, i) => ({ t, w: h.w[i] }));
  const mid = h.w0 !== null ? [{ t: 0, w: h.w0 }] : [];
  return [...neg, ...mid, ...pos];
}

/* ---------- Reglas compuestas de Newton–Cotes ---------- */
const INTEG_RULES = {
  trap: {
    name: 'Regla del Trapecio compuesta', factorTex: '\\dfrac{h}{2}', factor: (h) => h / 2,
    coef: (i, n) => (i === 0 || i === n ? 1 : 2),
    check: (n) => (n >= 1 ? null : 'n debe ser al menos 1.'),
    orderTex: 'O(h^2)'
  },
  simpson13: {
    name: 'Regla de Simpson 1/3 compuesta', factorTex: '\\dfrac{h}{3}', factor: (h) => h / 3,
    coef: (i, n) => (i === 0 || i === n ? 1 : (i % 2 === 1 ? 4 : 2)),
    check: (n) => (n >= 2 && n % 2 === 0 ? null : 'Simpson 1/3 necesita un número PAR de subintervalos (n = 2, 4, 6, …).'),
    orderTex: 'O(h^4)'
  },
  simpson38: {
    name: 'Regla de Simpson 3/8 compuesta', factorTex: '\\dfrac{3h}{8}', factor: (h) => 3 * h / 8,
    coef: (i, n) => (i === 0 || i === n ? 1 : (i % 3 === 0 ? 2 : 3)),
    check: (n) => (n >= 3 && n % 3 === 0 ? null : 'Simpson 3/8 necesita n múltiplo de 3 (n = 3, 6, 9, …).'),
    orderTex: 'O(h^4)'
  }
};

/**
 * Regla compuesta sobre puntos igualmente espaciados.
 * @param {string} ruleId - 'trap' | 'simpson13' | 'simpson38'
 * @param {number[]} xs
 * @param {number[]} fs
 */
function integCompositeRule(ruleId, xs, fs) {
  const rule = INTEG_RULES[ruleId];
  const n = xs.length - 1;
  const msg = rule.check(n);
  if (msg) throw new Error(msg);
  const a = xs[0];
  const b = xs[n];
  const h = (b - a) / n;
  const rows = xs.map((x, i) => {
    const c = rule.coef(i, n);
    return { i, x, f: fs[i], c, cf: c * fs[i] };
  });
  const sum = rows.reduce((acc, r) => acc + r.cf, 0);
  const endpoints = rows[0].f + rows[n].f;
  const factor = rule.factor(h);
  return { ruleId, rule, a, b, n, h, rows, sum, endpoints, factor, integral: factor * sum };
}

/** Genera nodos igualmente espaciados de una función. */
function integSampleFunction(compiled, a, b, n) {
  const h = (b - a) / n;
  const xs = [];
  const fs = [];
  for (let i = 0; i <= n; i++) {
    const x = i === n ? b : a + i * h;
    xs.push(x);
    fs.push(nmEvalChecked(compiled, x));
  }
  return { xs, fs };
}

/* ---------- Romberg ---------- */
/**
 * @param {(x:number)=>number} fn - función ya validada (lanza error si no es finita)
 * @param {number} a
 * @param {number} b
 * @param {number} levels - número máximo de filas (2..10)
 * @param {number} tol - tolerancia opcional (0 = no detener antes)
 */
function integRomberg(fn, a, b, levels, tol) {
  const R = [];
  const rows = [];
  const fa = fn(a);
  const fb = fn(b);
  let h = b - a;
  R[1] = [null, (h / 2) * (fa + fb)];
  rows.push({
    k: 1, n: 1, h, newPts: [], sumNew: 0, trap: R[1][1], ext: [], fa, fb,
    endpointsFormula: true
  });

  let converged = false;
  let usedLevels = 1;
  for (let k = 2; k <= levels; k++) {
    const nk = Math.pow(2, k - 1);
    const hk = (b - a) / nk;
    const newPts = [];
    let sumNew = 0;
    for (let i = 1; i <= nk / 2; i++) {
      const x = a + (2 * i - 1) * hk;
      const fx = fn(x);
      newPts.push({ i, x, f: fx });
      sumNew += fx;
    }
    R[k] = [null, 0.5 * R[k - 1][1] + hk * sumNew];
    const ext = [];
    for (let j = 2; j <= k; j++) {
      const prevRow = R[k][j - 1];
      const prevUp = R[k - 1][j - 1];
      const denom = Math.pow(4, j - 1) - 1;
      const val = prevRow + (prevRow - prevUp) / denom;
      R[k][j] = val;
      ext.push({ j, denom, a: prevRow, b: prevUp, value: val });
    }
    const err = Math.abs(R[k][k] - R[k - 1][k - 1]);
    rows.push({ k, n: nk, h: hk, newPts, sumNew, trap: R[k][1], ext, err, prevTrap: R[k - 1][1] });
    usedLevels = k;
    if (tol > 0 && err < tol) { converged = true; break; }
  }
  const last = R[usedLevels][usedLevels];
  const prev = usedLevels > 1 ? R[usedLevels - 1][usedLevels - 1] : null;
  return {
    a, b, R, rows, levels: usedLevels, requested: levels, converged, tol,
    integral: last, finalError: prev !== null ? Math.abs(last - prev) : null,
    evaluations: Math.pow(2, usedLevels - 1) + 1
  };
}

/* ---------- Cuadratura Gaussiana ---------- */
/**
 * @param {(x:number)=>number} fn
 * @param {number} a
 * @param {number} b
 * @param {number} npts - 2..6
 * @param {number} m - subintervalos (≥ 1)
 */
function integGauss(fn, a, b, npts, m) {
  const table = gaussLegendreTable(npts);
  const H = (b - a) / m;
  const subs = [];
  let total = 0;
  for (let s = 0; s < m; s++) {
    const alpha = a + s * H;
    const beta = s === m - 1 ? b : a + (s + 1) * H;
    const half = (beta - alpha) / 2;
    const mid = (alpha + beta) / 2;
    const pts = table.map((p, i) => {
      const x = half * p.t + mid;
      const f = fn(x);
      return { i: i + 1, t: p.t, w: p.w, x, f, wf: p.w * f };
    });
    const sumWF = pts.reduce((acc, p) => acc + p.wf, 0);
    const value = half * sumWF;
    subs.push({ s: s + 1, alpha, beta, half, mid, pts, sumWF, value });
    total += value;
  }
  return { a, b, npts, m, table, subs, integral: total, evaluations: npts * m };
}

/** Valor de referencia de alta precisión (Gauss–Legendre 6 puntos × 64 subintervalos). */
function integReferenceValue(fn, a, b) {
  try {
    return integGauss(fn, a, b, 6, 64).integral;
  } catch (e) {
    return null;
  }
}

/**
 * Cálculo completo de integración.
 * params: { mode:'func'|'table', methodId, expr, tableText, a, b, n, levels, tol, gaussPts, gaussSubs, exactValue }
 */
function computeIntegration(params) {
  const result = { methodId: params.methodId, mode: params.mode };
  let compiled = null;
  let a = params.a;
  let b = params.b;
  let tablePts = null;

  if (params.mode === 'table') {
    if (!['trap', 'simpson13', 'simpson38'].includes(params.methodId)) {
      throw new Error('Con datos tabulados solo se pueden aplicar Trapecio y Simpson (necesitan puntos igualmente espaciados). Romberg y Gauss requieren la función.');
    }
    tablePts = NM.parseTable(params.tableText);
    NM.uniformSpacing(tablePts);
    a = tablePts[0].x;
    b = tablePts[tablePts.length - 1].x;
    result.tablePts = tablePts;
  } else {
    compiled = nmCompileFunction(params.expr);
    if (!(b > a)) throw new Error('El límite superior b debe ser mayor que el límite inferior a.');
  }
  result.a = a;
  result.b = b;
  result.compiled = compiled;
  const fn = compiled ? ((x) => nmEvalChecked(compiled, x)) : null;

  if (['trap', 'simpson13', 'simpson38'].includes(params.methodId)) {
    let xs, fs;
    if (tablePts) {
      xs = tablePts.map(p => p.x);
      fs = tablePts.map(p => p.f);
    } else {
      if (!Number.isInteger(params.n) || params.n < 1) throw new Error('n debe ser un entero positivo.');
      if (params.n > 5000) throw new Error('Usa n ≤ 5000 para mantener la tabla legible.');
      ({ xs, fs } = integSampleFunction(compiled, a, b, params.n));
    }
    result.composite = integCompositeRule(params.methodId, xs, fs);
    result.integral = result.composite.integral;
    result.evaluations = xs.length;
  } else if (params.methodId === 'romberg') {
    const levels = params.levels;
    if (!Number.isInteger(levels) || levels < 2 || levels > 10) throw new Error('Los niveles de Romberg deben ser un entero entre 2 y 10.');
    result.romberg = integRomberg(fn, a, b, levels, params.tol || 0);
    result.integral = result.romberg.integral;
    result.evaluations = result.romberg.evaluations;
  } else if (params.methodId === 'gauss') {
    const m = params.gaussSubs;
    if (!Number.isInteger(m) || m < 1 || m > 200) throw new Error('Los subintervalos de Gauss deben ser un entero entre 1 y 200.');
    result.gauss = integGauss(fn, a, b, params.gaussPts, m);
    result.integral = result.gauss.integral;
    result.evaluations = result.gauss.evaluations;
  } else {
    throw new Error('Método de integración desconocido.');
  }

  // Valor exacto / referencia
  result.exact = null;
  if (params.exactValue !== null && params.exactValue !== undefined && params.exactValue !== '') {
    result.exact = params.exactValue;
    result.exactKind = 'Valor exacto dado';
  } else if (fn) {
    const ref = integReferenceValue(fn, a, b);
    if (ref !== null && isFinite(ref)) {
      result.exact = ref;
      result.exactKind = 'Valor de referencia (Gauss–Legendre 6 pts × 64 subintervalos)';
    }
  }
  if (result.exact !== null) {
    result.absError = Math.abs(result.exact - result.integral);
    result.relError = result.exact !== 0 ? (result.absError / Math.abs(result.exact)) * 100 : null;
  }

  // Comparativa entre métodos (solo con función)
  result.comparison = [];
  if (fn) {
    const add = (label, evals, run) => {
      try {
        const v = run();
        result.comparison.push({
          label, evals, value: v,
          err: result.exact !== null ? Math.abs(result.exact - v) : null
        });
      } catch (e) {
        result.comparison.push({ label, evals, value: null, err: null, note: e.message });
      }
    };
    const n = params.n;
    const mk = (id) => () => {
      const s = integSampleFunction(compiled, a, b, n);
      return integCompositeRule(id, s.xs, s.fs).integral;
    };
    add(`Trapecio (n = ${n})`, n + 1, mk('trap'));
    add(`Simpson 1/3 (n = ${n})`, n + 1, mk('simpson13'));
    add(`Simpson 3/8 (n = ${n})`, n + 1, mk('simpson38'));
    const lv = Number.isInteger(params.levels) && params.levels >= 2 && params.levels <= 10 ? params.levels : 4;
    add(`Romberg (${lv} niveles)`, Math.pow(2, lv - 1) + 1, () => integRomberg(fn, a, b, lv, 0).integral);
    const gp = params.gaussPts;
    const gs = params.gaussSubs;
    add(`Gauss–Legendre (${gp} pts${gs > 1 ? ` × ${gs}` : ''})`, gp * gs, () => integGauss(fn, a, b, gp, gs).integral);
  }
  return result;
}

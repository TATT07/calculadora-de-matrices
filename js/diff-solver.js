/**
 * DIFF-SOLVER.JS
 * Motor de DIFERENCIACIÓN NUMÉRICA.
 *
 * Todas las fórmulas son de la forma
 *       f'(x0) ≈ (1 / (D·h)) · Σ c'_k · f(x0 + s·k·h)
 * con s = +1 (hacia adelante / punto medio) o s = −1 (hacia atrás),
 * y c'_k = s·c_k (coeficientes tal como se escriben en los libros).
 *
 * Fórmulas incluidas (Burden & Faires, Chapra):
 *  - Diferencia progresiva y regresiva (2 puntos)      error O(h)
 *  - Fórmulas de 3 puntos (punto medio y extremos)     error O(h²)
 *  - Fórmulas de 5 puntos (punto medio y extremos)     error O(h⁴)
 */

const DIFF_STENCILS = {
  forward: {
    family: 'diff2', variant: 'forward', s: 1, offsets: [0, 1], coefs: [-1, 1], den: 1, order: 1,
    name: 'Diferencia progresiva (hacia adelante)',
    formulaTex: "f'(x_0)\\approx \\dfrac{f(x_0+h)-f(x_0)}{h}",
    errorTex: "-\\dfrac{h}{2}\\,f''(\\xi)",
    derivNeeded: "f''", orderTex: 'O(h)', pointsTex: '2'
  },
  backward: {
    family: 'diff2', variant: 'backward', s: -1, offsets: [0, 1], coefs: [-1, 1], den: 1, order: 1,
    name: 'Diferencia regresiva (hacia atrás)',
    formulaTex: "f'(x_0)\\approx \\dfrac{f(x_0)-f(x_0-h)}{h}",
    errorTex: "+\\dfrac{h}{2}\\,f''(\\xi)",
    derivNeeded: "f''", orderTex: 'O(h)', pointsTex: '2'
  },
  'three-mid': {
    family: 'diff3', variant: 'mid', s: 1, offsets: [-1, 1], coefs: [-1, 1], den: 2, order: 2,
    name: 'Fórmula de 3 puntos — punto medio',
    formulaTex: "f'(x_0)\\approx \\dfrac{1}{2h}\\left[f(x_0+h)-f(x_0-h)\\right]",
    errorTex: "-\\dfrac{h^{2}}{6}\\,f'''(\\xi)",
    derivNeeded: "f'''", orderTex: 'O(h^2)', pointsTex: '3'
  },
  'three-end-fwd': {
    family: 'diff3', variant: 'end-fwd', s: 1, offsets: [0, 1, 2], coefs: [-3, 4, -1], den: 2, order: 2,
    name: 'Fórmula de 3 puntos — extremo (hacia adelante)',
    formulaTex: "f'(x_0)\\approx \\dfrac{1}{2h}\\left[-3f(x_0)+4f(x_0+h)-f(x_0+2h)\\right]",
    errorTex: "+\\dfrac{h^{2}}{3}\\,f'''(\\xi)",
    derivNeeded: "f'''", orderTex: 'O(h^2)', pointsTex: '3'
  },
  'three-end-bwd': {
    family: 'diff3', variant: 'end-bwd', s: -1, offsets: [0, 1, 2], coefs: [-3, 4, -1], den: 2, order: 2,
    name: 'Fórmula de 3 puntos — extremo (hacia atrás)',
    formulaTex: "f'(x_0)\\approx \\dfrac{1}{2h}\\left[3f(x_0)-4f(x_0-h)+f(x_0-2h)\\right]",
    errorTex: "+\\dfrac{h^{2}}{3}\\,f'''(\\xi)",
    derivNeeded: "f'''", orderTex: 'O(h^2)', pointsTex: '3'
  },
  'five-mid': {
    family: 'diff5', variant: 'mid', s: 1, offsets: [-2, -1, 1, 2], coefs: [1, -8, 8, -1], den: 12, order: 4,
    name: 'Fórmula de 5 puntos — punto medio',
    formulaTex: "f'(x_0)\\approx \\dfrac{1}{12h}\\left[f(x_0-2h)-8f(x_0-h)+8f(x_0+h)-f(x_0+2h)\\right]",
    errorTex: "+\\dfrac{h^{4}}{30}\\,f^{(5)}(\\xi)",
    derivNeeded: 'f^{(5)}', orderTex: 'O(h^4)', pointsTex: '5'
  },
  'five-end-fwd': {
    family: 'diff5', variant: 'end-fwd', s: 1, offsets: [0, 1, 2, 3, 4], coefs: [-25, 48, -36, 16, -3], den: 12, order: 4,
    name: 'Fórmula de 5 puntos — extremo (hacia adelante)',
    formulaTex: "f'(x_0)\\approx \\dfrac{1}{12h}\\left[-25f(x_0)+48f(x_0+h)-36f(x_0+2h)+16f(x_0+3h)-3f(x_0+4h)\\right]",
    errorTex: "+\\dfrac{h^{4}}{5}\\,f^{(5)}(\\xi)",
    derivNeeded: 'f^{(5)}', orderTex: 'O(h^4)', pointsTex: '5'
  },
  'five-end-bwd': {
    family: 'diff5', variant: 'end-bwd', s: -1, offsets: [0, 1, 2, 3, 4], coefs: [-25, 48, -36, 16, -3], den: 12, order: 4,
    name: 'Fórmula de 5 puntos — extremo (hacia atrás)',
    formulaTex: "f'(x_0)\\approx \\dfrac{1}{12h}\\left[25f(x_0)-48f(x_0-h)+36f(x_0-2h)-16f(x_0-3h)+3f(x_0-4h)\\right]",
    errorTex: "+\\dfrac{h^{4}}{5}\\,f^{(5)}(\\xi)",
    derivNeeded: 'f^{(5)}', orderTex: 'O(h^4)', pointsTex: '5'
  }
};

/** Pasa (familia, variante) al identificador de la fórmula. */
function diffStencilId(family, variant) {
  if (family === 'diff2') return variant === 'backward' ? 'backward' : 'forward';
  if (family === 'diff3') return variant === 'mid' ? 'three-mid' : (variant === 'end-bwd' ? 'three-end-bwd' : 'three-end-fwd');
  return variant === 'mid' ? 'five-mid' : (variant === 'end-bwd' ? 'five-end-bwd' : 'five-end-fwd');
}

/**
 * Aplica una fórmula de diferenciación con un muestreador de f.
 * @param {object} st - fórmula de DIFF_STENCILS
 * @param {number} x0
 * @param {number} h  - paso positivo
 * @param {(x:number)=>number} sample - devuelve f(x)
 */
function diffApplyStencil(st, x0, h, sample) {
  const nodes = st.offsets.map((k, idx) => {
    const x = x0 + st.s * k * h;
    const c = st.s * st.coefs[idx];
    const fv = sample(x);
    return { k, idx, x, c, f: fv, term: c * fv };
  });
  const numer = nodes.reduce((acc, n) => acc + n.term, 0);
  const divisor = st.den * h;
  return { nodes, numer, divisor, approx: numer / divisor };
}

/** Derivada de referencia (alta precisión) para medir el error. */
function diffReferenceValue(compiled, x0) {
  const hRef = 1e-3 * Math.max(1, Math.abs(x0));
  const st = DIFF_STENCILS['five-mid'];
  try {
    return diffApplyStencil(st, x0, hRef, x => compiled.f(x)).approx;
  } catch (e) {
    return null;
  }
}

/**
 * Calcula la derivada con una fórmula.
 * params: { mode:'func'|'table', expr, tableText, x0, h, stencilId, exactExpr }
 */
function computeDifferentiation(params) {
  const st = DIFF_STENCILS[params.stencilId];
  if (!st) throw new Error('Fórmula de diferenciación desconocida.');

  const result = { stencil: st, mode: params.mode, x0: params.x0 };
  let sample;
  let compiled = null;
  let h = params.h;

  if (params.mode === 'table') {
    const pts = NM.parseTable(params.tableText);
    h = NM.uniformSpacing(pts);
    result.table = pts;
    sample = (x) => {
      const p = pts.find(q => Math.abs(q.x - x) <= 1e-9 * Math.max(1, Math.abs(x)));
      if (!p) {
        throw new Error(`Para esta fórmula se necesita f(${NM.short(x)}), pero ese valor no está en la tabla (h = ${NM.short(h)}). Elige otro x₀ o una fórmula de otro tipo (punto medio / extremo).`);
      }
      return p.f;
    };
    if (!pts.find(q => Math.abs(q.x - params.x0) <= 1e-9 * Math.max(1, Math.abs(params.x0)))) {
      throw new Error(`x₀ = ${NM.short(params.x0)} no es un nodo de la tabla.`);
    }
  } else {
    compiled = nmCompileFunction(params.expr);
    if (!(h > 0)) throw new Error('El paso h debe ser un número positivo.');
    sample = (x) => nmEvalChecked(compiled, x);
  }

  result.h = h;
  result.compiled = compiled;
  const applied = diffApplyStencil(st, params.x0, h, sample);
  Object.assign(result, applied);

  // Valor exacto / de referencia
  result.exact = null;
  result.exactKind = null;
  if (params.exactExpr) {
    const ex = nmCompileFunction(params.exactExpr, "f'(x)");
    result.exact = nmEvalChecked(ex, params.x0);
    result.exactKind = 'Valor exacto f\'(x₀) dado';
    result.exactCompiled = ex;
  } else if (compiled) {
    const ref = diffReferenceValue(compiled, params.x0);
    if (ref !== null && isFinite(ref)) {
      result.exact = ref;
      result.exactKind = 'Valor de referencia (5 puntos, h = 10⁻³)';
    }
  }
  if (result.exact !== null) {
    result.absError = Math.abs(result.exact - result.approx);
    result.relError = result.exact !== 0 ? (result.absError / Math.abs(result.exact)) * 100 : null;
  }

  // Tabla de convergencia al reducir h (solo con función)
  result.convergence = [];
  if (compiled) {
    let prevErr = null;
    for (let j = 0; j < 5; j++) {
      const hj = h / Math.pow(2, j);
      let approx;
      try {
        approx = diffApplyStencil(st, params.x0, hj, sample).approx;
      } catch (e) { break; }
      const err = result.exact !== null ? Math.abs(result.exact - approx) : null;
      const ratio = (prevErr !== null && err !== null && err > 0) ? prevErr / err : null;
      result.convergence.push({ h: hj, approx, err, ratio });
      prevErr = err;
    }
  }
  return result;
}

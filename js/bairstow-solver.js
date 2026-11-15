/**
 * BAIRSTOW-SOLVER.JS
 * Algoritmo matemático del Método de Bairstow (Precisión Científica Estándar):
 * - Doble división sintética de segundo orden (vectores b y c)
 * - Matriz Jacobiana 2x2 y correcciones Newton-Raphson (Delta r, Delta s) con Regla de Cramer
 * - Parada natural automática al alcanzar la tolerancia (sin forzar mínimos artificiales)
 * - Extracción de raíces cuadráticas (reales y complejas conjugadas)
 * - Deflación sintética polinomial recursiva
 */

function solveBairstow() {
  const n = currentBairstowDegree;
  const a = [];
  for (let k = 0; k <= n; k++) {
    const el = document.getElementById(`b-a-${k}`);
    const val = el ? parseFloat(el.value) : 0;
    a[k] = isNaN(val) ? 0 : val;
  }

  const r0 = parseFloat(document.getElementById('b-r0').value) || 0;
  const s0 = parseFloat(document.getElementById('b-s0').value) || 0;
  const maxIterations = parseInt(document.getElementById('b-max-iterations').value) || 30;
  const tolerance = parseFloat(document.getElementById('b-tolerance').value) || 0.0001;
  const errorType = document.getElementById('b-error-type').value;
  const decimalsEl = document.getElementById('b-decimals-display');
  const decimals = decimalsEl ? parseInt(decimalsEl.value) : 6;
  const solveMode = document.getElementById('b-solve-mode').value;

  const banner = document.getElementById('b-validation-banner');
  banner.style.display = 'none';

  // Validación de coeficiente principal
  if (Math.abs(a[n]) < 1e-12) {
    banner.style.display = 'flex';
    banner.className = 'validation-banner banner-danger';
    banner.innerHTML = `<strong>Error Matemático:</strong> El coeficiente principal a<sub>${n}</sub> no puede ser 0. Modifica el coeficiente o reduce el grado del polinomio.`;
    return;
  }

  let r = r0;
  let s = s0;
  let converged = false;
  let finalIteration = 0;
  let iterationSteps = [];
  let tableRows = [];
  let lastB = [];

  for (let k = 1; k <= maxIterations; k++) {
    // 1ra División sintética: cálculo de coeficientes b
    let b = new Array(n + 1).fill(0);
    let bTermR = new Array(n + 1).fill(0);
    let bTermS = new Array(n + 1).fill(0);

    b[n] = a[n];
    bTermR[n - 1] = r * b[n];
    b[n - 1] = a[n - 1] + bTermR[n - 1];

    for (let j = n - 2; j >= 0; j--) {
      bTermR[j] = r * b[j + 1];
      bTermS[j] = s * b[j + 2];
      b[j] = a[j] + bTermR[j] + bTermS[j];
    }
    lastB = [...b];

    // 2da División sintética: derivadas parciales c
    let c = new Array(n + 1).fill(0);
    let cTermR = new Array(n + 1).fill(0);
    let cTermS = new Array(n + 1).fill(0);

    c[n] = b[n];
    cTermR[n - 1] = r * c[n];
    c[n - 1] = b[n - 1] + cTermR[n - 1];

    for (let j = n - 2; j >= 1; j--) {
      cTermR[j] = r * c[j + 1];
      cTermS[j] = s * c[j + 2];
      c[j] = b[j] + cTermR[j] + cTermS[j];
    }

    const c2 = c[2];
    const c3 = (n >= 3) ? c[3] : 0;
    const c1 = c[1];
    const b1 = b[1];
    const b0 = b[0];

    // Determinante del sistema Jacobiano 2x2
    const det = c2 * c2 - c1 * c3;

    if (Math.abs(det) < 1e-13) {
      banner.style.display = 'flex';
      banner.className = 'validation-banner banner-warning';
      banner.innerHTML = `<strong>Aviso Numérico en Iteración ${k}:</strong> El determinante del sistema de derivadas es nulo o singular (D = ${formatDec(det, decimals)}). Modifica los valores iniciales (r₀, s₀).`;
      break;
    }

    const numDr = -b1 * c2 + b0 * c3;
    const numDs = -b0 * c2 + b1 * c1;

    const deltaR = numDr / det;
    const deltaS = numDs / det;

    const newR = r + deltaR;
    const newS = s + deltaS;

    // Errores
    let errR = 0, errS = 0;
    let errRStr = '', errSStr = '';

    if (errorType === 'relative') {
      errR = Math.abs(newR) > 1e-12 ? (Math.abs(deltaR) / Math.abs(newR)) * 100 : Math.abs(deltaR);
      errS = Math.abs(newS) > 1e-12 ? (Math.abs(deltaS) / Math.abs(newS)) * 100 : Math.abs(deltaS);
      errRStr = `${formatDec(errR, Math.min(decimals, 4))}%`;
      errSStr = `${formatDec(errS, Math.min(decimals, 4))}%`;
    } else {
      errR = Math.abs(deltaR);
      errS = Math.abs(deltaS);
      errRStr = formatDec(errR, decimals);
      errSStr = formatDec(errS, decimals);
    }

    const maxErr = Math.max(errR, errS);

    iterationSteps.push({
      iteration: k,
      r_current: r,
      s_current: s,
      b: [...b],
      bTermR: [...bTermR],
      bTermS: [...bTermS],
      c: [...c],
      cTermR: [...cTermR],
      cTermS: [...cTermS],
      c1, c2, c3,
      b1, b0,
      det,
      numDr, numDs,
      deltaR, deltaS,
      newR, newS,
      errR, errS,
      errRStr, errSStr,
      maxErr
    });

    tableRows.push({
      k,
      r: formatDec(r, decimals),
      s: formatDec(s, decimals),
      b1: formatDec(b1, decimals),
      b0: formatDec(b0, decimals),
      deltaR: formatDec(deltaR, decimals),
      deltaS: formatDec(deltaS, decimals),
      errRStr,
      errSStr
    });

    r = newR;
    s = newS;
    finalIteration = k;

    // Parada natural automática al converger
    if (maxErr <= tolerance) {
      converged = true;
      break;
    }
  }

  // Raíces del factor cuadrático convergido: x^2 - rx - s = 0
  const factorRoots = calculateFactorRoots(r, s, decimals);

  // Polinomio cociente deflactado Q(x)
  let quotientCoeffs = [];
  for (let j = 2; j <= n; j++) {
    quotientCoeffs.push(lastB[j]);
  }

  let allPolynomialRoots = null;
  if (solveMode === 'full') {
    allPolynomialRoots = solveAllRootsComplete(a, r0, s0, maxIterations, tolerance, decimals);
  }

  renderBairstowResultsUI({
    n,
    a: [...a],
    finalIteration,
    converged,
    tolerance,
    decimals,
    solveMode,
    rFinal: r,
    sFinal: s,
    factorRoots,
    quotientCoeffs,
    allPolynomialRoots,
    iterationSteps,
    tableRows
  });
}

function calculateFactorRoots(r, s, decimals = 6) {
  const disc = r * r + 4 * s;

  if (disc >= 0) {
    const sqrtDisc = Math.sqrt(disc);
    const x1 = (r + sqrtDisc) / 2;
    const x2 = (r - sqrtDisc) / 2;
    return {
      type: 'real',
      disc,
      roots: [
        { label: 'x₁', valStr: formatDec(x1, decimals), isComplex: false },
        { label: 'x₂', valStr: formatDec(x2, decimals), isComplex: false }
      ]
    };
  } else {
    const realPart = r / 2;
    const imagPart = Math.sqrt(-disc) / 2;
    return {
      type: 'complex',
      disc,
      roots: [
        { label: 'x₁', valStr: `${formatDec(realPart, decimals)} + ${formatDec(imagPart, decimals)}i`, isComplex: true },
        { label: 'x₂', valStr: `${formatDec(realPart, decimals)} − ${formatDec(imagPart, decimals)}i`, isComplex: true }
      ]
    };
  }
}

// Extracción recursiva de todas las raíces por deflación sintética completa
function solveAllRootsComplete(polyCoeffs, r0, s0, maxIter = 50, tol = 1e-4, decimals = 6) {
  let allRoots = [];
  let currentCoeffs = [...polyCoeffs];

  while (currentCoeffs.length > 3) {
    let deg = currentCoeffs.length - 1;
    let r = r0, s = s0;
    let b = new Array(deg + 1).fill(0);
    let c = new Array(deg + 1).fill(0);

    for (let it = 1; it <= maxIter; it++) {
      b[deg] = currentCoeffs[deg];
      b[deg - 1] = currentCoeffs[deg - 1] + r * b[deg];
      for (let k = deg - 2; k >= 0; k--) {
        b[k] = currentCoeffs[k] + r * b[k + 1] + s * b[k + 2];
      }
      c[deg] = b[deg];
      c[deg - 1] = b[deg - 1] + r * c[deg];
      for (let k = deg - 2; k >= 1; k--) {
        c[k] = b[k] + r * c[k + 1] + s * c[k + 2];
      }

      let c2 = c[2], c3 = (deg >= 3 ? c[3] : 0), c1 = c[1];
      let det = c2 * c2 - c1 * c3;
      if (Math.abs(det) < 1e-13) break;
      let dr = (-b[1] * c2 + b[0] * c3) / det;
      let ds = (-b[0] * c2 + b[1] * c1) / det;
      r += dr;
      s += ds;
      let err = Math.max(Math.abs(dr / (r || 1)), Math.abs(ds / (s || 1)));
      if (err < tol) break;
    }

    const factorRes = calculateFactorRoots(r, s, decimals);
    allRoots.push(factorRes.roots[0]);
    allRoots.push(factorRes.roots[1]);

    // Deflación del polinomio cociente
    let nextCoeffs = [];
    for (let i = 2; i <= deg; i++) {
      nextCoeffs.push(b[i]);
    }
    currentCoeffs = nextCoeffs;
  }

  // Si queda grado 2 analítico: a2 x^2 + a1 x + a0 = 0
  if (currentCoeffs.length === 3) {
    let a0 = currentCoeffs[0], a1 = currentCoeffs[1], a2 = currentCoeffs[2];
    let disc = a1 * a1 - 4 * a2 * a0;
    if (disc >= 0) {
      let sq = Math.sqrt(disc);
      let x1 = (-a1 + sq) / (2 * a2);
      let x2 = (-a1 - sq) / (2 * a2);
      allRoots.push({ label: `x_${allRoots.length + 1}`, valStr: formatDec(x1, decimals), isComplex: false });
      allRoots.push({ label: `x_${allRoots.length + 1}`, valStr: formatDec(x2, decimals), isComplex: false });
    } else {
      let realPart = -a1 / (2 * a2);
      let imagPart = Math.sqrt(-disc) / (2 * a2);
      allRoots.push({ label: `x_${allRoots.length + 1}`, valStr: `${formatDec(realPart, decimals)} + ${formatDec(imagPart, decimals)}i`, isComplex: true });
      allRoots.push({ label: `x_${allRoots.length + 1}`, valStr: `${formatDec(realPart, decimals)} − ${formatDec(imagPart, decimals)}i`, isComplex: true });
    }
  } else if (currentCoeffs.length === 2) {
    let a0 = currentCoeffs[0], a1 = currentCoeffs[1];
    let x = -a0 / a1;
    allRoots.push({ label: `x_${allRoots.length + 1}`, valStr: formatDec(x, decimals), isComplex: false });
  }

  return allRoots;
}

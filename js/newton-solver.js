/**
 * NEWTON-SOLVER.JS
 * Algoritmo matemático del Método de Newton-Raphson para Sistemas de Ecuaciones No Lineales F(x, y) = 0:
 * - Parser matemático de expresiones en 2 variables (x, y)
 * - Evaluación de derivadas parciales analíticas o numéricas centradas O(h²)
 * - Construcción y resolución de la Matriz Jacobiana J(x, y)
 * - Determinante de la Jacobiana det(J) y solución del sistema de incrementos J·Δx = -F
 * - Control de convergencia cuadrática y reporte paso a paso
 */

function prepareMathExpression(rawExpr) {
  if (!rawExpr || typeof rawExpr !== 'string') return '0';
  let s = rawExpr.trim();

  // 1. Exponencial e^(...) o e^(-var) o e^var
  s = s.replace(/\be\s*\^\s*\(([^)]+)\)/gi, 'exp($1)');
  s = s.replace(/\be\s*\^\s*(-?[0-9a-zA-Z_.]+)/gi, 'exp($1)');
  s = s.replace(/\bln\s*\(/gi, 'log(');

  // Funciones soportadas protegidas con marcadores
  const fns = ['exp', 'log', 'sin', 'cos', 'tan', 'sqrt', 'abs', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh'];
  const fnPlaceholders = {};
  let count = 0;

  fns.forEach(fn => {
    const re = new RegExp('\\b' + fn + '(?=\\s*\\()', 'gi');
    s = s.replace(re, () => {
      const ph = `__F_${count++}__`;
      fnPlaceholders[ph] = 'Math.' + fn;
      return ph;
    });
  });

  // Multiplicación implícita:
  // número seguido de letra/paréntesis: ej. 2x -> 2*x, 3(x) -> 3*(x)
  s = s.replace(/(\d+)\s*([a-zA-Z(]|__F_)/g, '$1*$2');
  // paréntesis de cierre seguido de número/letra/paréntesis: ej. )x -> )*x
  s = s.replace(/\)\s*(\d+|[a-zA-Z(]|__F_)/g, ')*$1');

  // Multiplicación entre variables x e y: ej. xy -> x*y, yx -> y*x, x y -> x*y
  s = s.replace(/([xyz])\s*([xyz])/gi, '$1*$2');
  s = s.replace(/([xyz])\s*([xyz])/gi, '$1*$2');

  // Potencias: base^exponente -> Math.pow(base, exponente)
  while (s.includes('^')) {
    s = s.replace(/([a-zA-Z0-9_.]+|\([^\^()]+\))\s*\^\s*([a-zA-Z0-9_.]+|\([^\^()]+\))/g, 'Math.pow($1, $2)');
  }

  // Restaurar funciones estándar de Math
  Object.keys(fnPlaceholders).forEach(ph => {
    s = s.replace(new RegExp(ph, 'g'), fnPlaceholders[ph]);
  });

  // Constantes matemáticas universales
  s = s.replace(/\be\b(?!\.)/gi, 'Math.E');
  s = s.replace(/\bpi\b/gi, 'Math.PI');

  return s;
}

function evaluate2D(expr, xVal, yVal) {
  try {
    const jsCode = prepareMathExpression(expr);
    const fn = new Function('x', 'y', 'return ' + jsCode + ';');
    const res = fn(xVal, yVal);
    return isNaN(res) || !isFinite(res) ? null : res;
  } catch (err) {
    return null;
  }
}

function evaluatePartialDerivative(expr, varName, xVal, yVal, analyticExpr) {
  // 1. Si el usuario ingresó la derivada analítica
  if (analyticExpr && analyticExpr.trim().length > 0) {
    const analyticVal = evaluate2D(analyticExpr, xVal, yVal);
    if (analyticVal !== null) return analyticVal;
  }

  // 2. Diferenciación finita central O(h²) de alta precisión
  const h = 1e-6;
  if (varName === 'x') {
    const fPlus = evaluate2D(expr, xVal + h, yVal);
    const fMinus = evaluate2D(expr, xVal - h, yVal);
    if (fPlus !== null && fMinus !== null) return (fPlus - fMinus) / (2 * h);
  } else if (varName === 'y') {
    const fPlus = evaluate2D(expr, xVal, yVal + h);
    const fMinus = evaluate2D(expr, xVal, yVal - h);
    if (fPlus !== null && fMinus !== null) return (fPlus - fMinus) / (2 * h);
  }
  return null;
}

function solveNewtonSystem() {
  const f1Expr = document.getElementById('n-f1') ? document.getElementById('n-f1').value.trim() : '';
  const f2Expr = document.getElementById('n-f2') ? document.getElementById('n-f2').value.trim() : '';

  // Derivadas analíticas opcionales
  const df1dxExpr = document.getElementById('n-df1-dx') ? document.getElementById('n-df1-dx').value.trim() : '';
  const df1dyExpr = document.getElementById('n-df1-dy') ? document.getElementById('n-df1-dy').value.trim() : '';
  const df2dxExpr = document.getElementById('n-df2-dx') ? document.getElementById('n-df2-dx').value.trim() : '';
  const df2dyExpr = document.getElementById('n-df2-dy') ? document.getElementById('n-df2-dy').value.trim() : '';

  const x0 = parseFloat(document.getElementById('n-x0').value) || 0;
  const y0 = parseFloat(document.getElementById('n-y0').value) || 0;
  const maxIterations = parseInt(document.getElementById('n-max-iterations').value) || 30;
  const tolerance = parseFloat(document.getElementById('n-tolerance').value) || 0.0001;
  const errorType = document.getElementById('n-error-type') ? document.getElementById('n-error-type').value : 'relative';
  const decimalsEl = document.getElementById('n-decimals-display');
  const decimals = decimalsEl ? parseInt(decimalsEl.value) : 6;

  const banner = document.getElementById('n-validation-banner');
  banner.style.display = 'none';

  // Validaciones del sistema
  if (!f1Expr || !f2Expr) {
    banner.style.display = 'flex';
    banner.className = 'validation-banner banner-danger';
    banner.innerHTML = '<strong>Error de Entrada:</strong> Debes ingresar ambas funciones \\(f_1(x,y)\\) y \\(f_2(x,y)\\) del sistema.';
    return;
  }

  const testF1 = evaluate2D(f1Expr, x0, y0);
  const testF2 = evaluate2D(f2Expr, x0, y0);

  if (testF1 === null) {
    banner.style.display = 'flex';
    banner.className = 'validation-banner banner-danger';
    banner.innerHTML = `<strong>Error en \\(f_1(x,y)\\):</strong> No fue posible evaluarla en las semillas \\((x_0=${x0},\\, y_0=${y0})\\). Revisa la sintaxis.`;
    return;
  }

  if (testF2 === null) {
    banner.style.display = 'flex';
    banner.className = 'validation-banner banner-danger';
    banner.innerHTML = `<strong>Error en \\(f_2(x,y)\\):</strong> No fue posible evaluarla en las semillas \\((x_0=${x0},\\, y_0=${y0})\\). Revisa la sintaxis.`;
    return;
  }

  let x = x0;
  let y = y0;
  let converged = false;
  let finalIteration = 0;
  let iterationSteps = [];
  let tableRows = [];

  for (let k = 1; k <= maxIterations; k++) {
    const f1Val = evaluate2D(f1Expr, x, y);
    const f2Val = evaluate2D(f2Expr, x, y);

    const j11 = evaluatePartialDerivative(f1Expr, 'x', x, y, df1dxExpr);
    const j12 = evaluatePartialDerivative(f1Expr, 'y', x, y, df1dyExpr);
    const j21 = evaluatePartialDerivative(f2Expr, 'x', x, y, df2dxExpr);
    const j22 = evaluatePartialDerivative(f2Expr, 'y', x, y, df2dyExpr);

    if (f1Val === null || f2Val === null || j11 === null || j12 === null || j21 === null || j22 === null) {
      banner.style.display = 'flex';
      banner.className = 'validation-banner banner-danger';
      banner.innerHTML = `<strong>Error Numérico en Iteración ${k}:</strong> No fue posible evaluar las funciones o sus derivadas parciales en \\((x=${formatDec(x, decimals)},\\, y=${formatDec(y, decimals)})\\).`;
      break;
    }

    // Determinante de la matriz Jacobiana 2x2
    const detJ = (j11 * j22) - (j12 * j21);

    if (Math.abs(detJ) < 1e-13) {
      banner.style.display = 'flex';
      banner.className = 'validation-banner banner-warning';
      banner.innerHTML = `<strong>Aviso Numérico en Iteración ${k}:</strong> La matriz Jacobiana es singular o casi nula (\\(\\det(J) = ${formatDec(detJ, decimals)}\\)). El sistema no puede resolverse (división por cero). Intenta con otros valores iniciales \\((x_0, y_0)\\).`;
      break;
    }

    // Resolución del sistema J · [Δx, Δy]^T = [-f1, -f2]^T mediante Regla de Cramer
    // Δx = (-f1*j22 - (-f2)*j12) / detJ = (-f1*j22 + f2*j12) / detJ
    // Δy = (j11*(-f2) - j21*(-f1)) / detJ = (-f2*j11 + f1*j21) / detJ
    const deltaX = (-f1Val * j22 + f2Val * j12) / detJ;
    const deltaY = (-f2Val * j11 + f1Val * j21) / detJ;

    const xNext = x + deltaX;
    const yNext = y + deltaY;

    // Cálculo de errores de aproximación
    let errX = 0;
    let errY = 0;
    let maxErr = 0;
    let errStr = '';

    if (errorType === 'relative') {
      errX = Math.abs(xNext) > 1e-12 ? (Math.abs(deltaX) / Math.abs(xNext)) * 100 : Math.abs(deltaX);
      errY = Math.abs(yNext) > 1e-12 ? (Math.abs(deltaY) / Math.abs(yNext)) * 100 : Math.abs(deltaY);
      maxErr = Math.max(errX, errY);
      errStr = `${formatDec(maxErr, Math.min(decimals, 4))}%`;
    } else {
      errX = Math.abs(deltaX);
      errY = Math.abs(deltaY);
      maxErr = Math.max(errX, errY);
      errStr = formatDec(maxErr, decimals);
    }

    iterationSteps.push({
      iteration: k,
      x_current: x,
      y_current: y,
      f1Val,
      f2Val,
      j11,
      j12,
      j21,
      j22,
      detJ,
      deltaX,
      deltaY,
      x_next: xNext,
      y_next: yNext,
      errX,
      errY,
      maxErr,
      errStr
    });

    tableRows.push({
      k,
      x: formatDec(x, decimals),
      y: formatDec(y, decimals),
      f1: formatDec(f1Val, decimals),
      f2: formatDec(f2Val, decimals),
      detJ: formatDec(detJ, decimals),
      deltaX: formatDec(deltaX, decimals),
      deltaY: formatDec(deltaY, decimals),
      xNext: formatDec(xNext, decimals),
      yNext: formatDec(yNext, decimals),
      errStr
    });

    finalIteration = k;
    x = xNext;
    y = yNext;

    // Criterio de parada: error <= tolerancia o residuo Euclídeo ||F(x,y)|| <= tol
    const resF1 = evaluate2D(f1Expr, xNext, yNext) || 0;
    const resF2 = evaluate2D(f2Expr, xNext, yNext) || 0;
    const normF = Math.sqrt(resF1 * resF1 + resF2 * resF2);

    if (maxErr <= tolerance || normF <= tolerance * 0.1) {
      converged = true;
      break;
    }
  }

  const finalResF1 = evaluate2D(f1Expr, x, y) || 0;
  const finalResF2 = evaluate2D(f2Expr, x, y) || 0;

  renderNewtonSystemResultsUI({
    f1Expr,
    f2Expr,
    rootX: x,
    rootY: y,
    finalResF1,
    finalResF2,
    finalIteration,
    converged,
    tolerance,
    decimals,
    iterationSteps,
    tableRows
  });
}

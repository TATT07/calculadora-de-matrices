/**
 * LINEAR-SOLVER.JS
 * Algoritmos de solución para sistemas lineales: Jacobi y Gauss-Seidel,
 * análisis de dominancia diagonal y reordenamiento automático de filas.
 */

// Check Strict Diagonal Dominance of current matrix in DOM
function checkDominance() {
  const { n, A } = getMatrixData();
  const badge = document.getElementById('dominance-badge');
  let isStrictlyDominant = true;
  let hasZeroDiagonal = false;
  let rowsDominantCount = 0;

  for (let i = 0; i < n; i++) {
    const diag = Math.abs(A[i][i]);
    if (diag === 0) {
      hasZeroDiagonal = true;
    }
    let sumOthers = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        sumOthers += Math.abs(A[i][j]);
      }
    }
    if (diag > sumOthers) {
      rowsDominantCount++;
    } else {
      isStrictlyDominant = false;
    }
  }

  if (hasZeroDiagonal) {
    badge.className = 'badge danger';
    badge.textContent = 'Cero en Diagonal Principal';
  } else if (isStrictlyDominant) {
    badge.className = 'badge success';
    badge.textContent = 'Estrictamente Diagonal Dominante (Convergencia Garantizada)';
  } else {
    badge.className = 'badge warning';
    badge.textContent = `Dominancia parcial (${rowsDominantCount}/${n} filas)`;
  }

  return { isStrictlyDominant, hasZeroDiagonal, rowsDominantCount };
}

// Automatic Permutation to achieve Diagonal Dominance
function autoReorderForDominance() {
  const { n, A, b } = getMatrixData();

  // Generate all row permutations
  const indices = Array.from({ length: n }, (_, i) => i);
  const permutations = [];

  function permute(arr, m = []) {
    if (arr.length === 0) {
      permutations.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  }
  permute(indices);

  let bestPerm = null;
  let bestDominantCount = -1;

  for (const p of permutations) {
    let dominantCount = 0;
    let validDiagonal = true;

    for (let i = 0; i < n; i++) {
      const origRow = p[i];
      const diag = Math.abs(A[origRow][i]);
      if (diag === 0) validDiagonal = false;

      let sumOthers = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          sumOthers += Math.abs(A[origRow][j]);
        }
      }
      if (diag > sumOthers) dominantCount++;
    }

    if (validDiagonal && dominantCount > bestDominantCount) {
      bestDominantCount = dominantCount;
      bestPerm = p;
      if (dominantCount === n) break; // Found strictly dominant
    }
  }

  if (bestPerm) {
    const banner = document.getElementById('validation-banner');
    banner.style.display = 'flex';
    
    // Apply permutation to inputs
    const newA = [];
    const newB = [];
    for (let i = 0; i < n; i++) {
      newA[i] = [...A[bestPerm[i]]];
      newB[i] = b[bestPerm[i]];
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        document.getElementById(`a-${i}-${j}`).value = newA[i][j];
      }
      document.getElementById(`b-${i}`).value = newB[i];
    }

    if (bestDominantCount === n) {
      banner.className = 'validation-banner banner-success';
      banner.innerHTML = `<strong>Filas reordenadas con éxito:</strong> Se encontró una permutación con la cual el sistema ahora es <strong>Estrictamente Diagonal Dominante</strong>. La convergencia está matemáticamente garantizada.`;
    } else {
      banner.className = 'validation-banner banner-warning';
      banner.innerHTML = `<strong>Reordenamiento parcial:</strong> Se encontró la permutación más óptima con ${bestDominantCount} de ${n} filas dominantes.`;
    }

    checkDominance();
  }
}

// SOLVE SYSTEM ENGINE
function solveSystem() {
  const { n, A, b, x0 } = getMatrixData();
  const method = document.getElementById('method-select').value;
  const minIterations = parseInt(document.getElementById('min-iterations').value) || 6;
  const maxIterations = parseInt(document.getElementById('max-iterations').value) || 25;
  const tolerance = parseFloat(document.getElementById('tolerance').value) || 0.000001;
  const errorType = document.getElementById('error-type').value;
  const precisionMode = document.getElementById('precision-mode') ? document.getElementById('precision-mode').value : 'round';

  // Validation
  const banner = document.getElementById('validation-banner');
  banner.style.display = 'none';

  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) {
      banner.style.display = 'flex';
      banner.className = 'validation-banner banner-danger';
      banner.innerHTML = `<strong>Error Matemático:</strong> El elemento de la diagonal principal \\(a_{${i+1}${i+1}}\\) es 0. No es posible dividir por cero. Usa el botón <strong>"Ordenar Filas"</strong> para corregir la posición de las ecuaciones.`;
      return;
    }
  }

  // Iteration variables - enforce strictly 6 decimal figures
  let currentX = x0.map(v => process6(v, precisionMode));
  let iterationSteps = [];
  let tableRows = [];
  let converged = false;
  let finalIteration = 0;

  // Add initial state (Iteration 0)
  tableRows.push({
    k: 0,
    values: [...currentX],
    maxError: '-'
  });

  for (let k = 1; k <= maxIterations; k++) {
    let nextX = (method === 'jacobi') ? new Array(n) : [...currentX];
    let stepCalculations = [];
    let errors = [];

    for (let i = 0; i < n; i++) {
      let sumTerms = 0;
      let numericalParts = [];

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const rawValUsed = (method === 'seidel' && j < i) ? nextX[j] : currentX[j];
          const valUsed = process6(rawValUsed, precisionMode);
          
          const product = process6(A[i][j] * valUsed, precisionMode);
          sumTerms = process6(sumTerms + product, precisionMode);

          numericalParts.push(`(${A[i][j]}) \\cdot (${format6(valUsed, precisionMode)})`);
        }
      }

      const numerator = process6(b[i] - sumTerms, precisionMode);
      const rawDivision = numerator / A[i][i];
      const computedVal = process6(rawDivision, precisionMode);

      // Error calculation using the 6-decimal numbers
      const prevVal = process6(currentX[i], precisionMode);
      let errVal = 0;
      let errStr = '';

      if (errorType === 'relative') {
        if (Math.abs(computedVal) > 1e-12) {
          errVal = process6((Math.abs(computedVal - prevVal) / Math.abs(computedVal)) * 100, precisionMode);
          errStr = `${format6(errVal, precisionMode)}%`;
        } else {
          errVal = process6(Math.abs(computedVal - prevVal), precisionMode);
          errStr = `${format6(errVal, precisionMode)}`;
        }
      } else {
        errVal = process6(Math.abs(computedVal - prevVal), precisionMode);
        errStr = `${format6(errVal, precisionMode)}`;
      }

      errors.push(errVal);
      nextX[i] = computedVal;

      // Detailed step breakdown
      stepCalculations.push({
        varIndex: i + 1,
        a_ii: A[i][i],
        b_i: b[i],
        sumTerms: format6(sumTerms, precisionMode),
        numerator: format6(numerator, precisionMode),
        formula: `\\(x_{${i+1}}^{(${k})} = \\dfrac{1}{a_{${i+1}${i+1}}}\\left[ b_{${i+1}} - \\sum_{j \\neq ${i+1}} a_{${i+1}j}\\, x_{j} \\right]\\)`,
        substitution: `\\(x_{${i+1}}^{(${k})} = \\dfrac{1}{${A[i][i]}}\\left[ ${b[i]} - \\left( ${numericalParts.join(' + ')} \\right) \\right]\\)`,
        intermediate: `\\(= \\dfrac{1}{${A[i][i]}}\\left[ ${format6(numerator, precisionMode)} \\right]\\)`,
        result: format6(computedVal, precisionMode),
        error: errStr,
        isFreshUpdateNote: (method === 'seidel' && i > 0) ? `(Actualizado en tiempo real en la iteración ${k})` : ''
      });
    }

    const maxErr = Math.max(...errors);

    iterationSteps.push({
      iteration: k,
      calculations: stepCalculations,
      maxError: maxErr,
      maxErrorStr: errorType === 'relative' ? `${format6(maxErr, precisionMode)}%` : format6(maxErr, precisionMode),
      values: [...nextX]
    });

    tableRows.push({
      k: k,
      values: [...nextX],
      maxError: errorType === 'relative' ? `${format6(maxErr, precisionMode)}%` : format6(maxErr, precisionMode)
    });

    currentX = [...nextX];
    finalIteration = k;

    // Must satisfy BOTH: at least minIterations AND error <= tolerance
    if (k >= minIterations && maxErr <= tolerance) {
      converged = true;
      break;
    }
  }

  renderResultsUI({
    method,
    n,
    finalIteration,
    converged,
    tolerance,
    minIterations,
    maxIterations,
    precisionMode,
    finalValues: currentX,
    iterationSteps,
    tableRows
  });
}

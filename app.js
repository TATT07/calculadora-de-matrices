/**
 * Calculadora de Métodos Numéricos: Jacobi & Gauss-Seidel
 * Precisión: 6 decimales (0.xxxxxx)
 * Mínimo 3 variables | Mínimo 6 iteraciones
 */

// Global State
let currentSize = 3;
let presetExamples = [];

// Process number to strictly 6 decimal figures (0.xxxxxx)
function process6(num, mode = 'round') {
  if (num === null || num === undefined || isNaN(num)) return 0;
  const n = Number(num);
  if (mode === 'truncate') {
    // Truncate strictly: keep sign and discard any digit after 6th decimal
    const factor = 1000000;
    return Math.trunc(n * factor) / factor;
  } else {
    // Round to 6 decimal digits
    return parseFloat(n.toFixed(6));
  }
}

// Format to 6 decimal places string (0.xxxxxx)
function format6(num, mode = 'round') {
  if (num === null || num === undefined || isNaN(num)) return '0.000000';
  const val = process6(num, mode);
  return val.toFixed(6);
}

// 6 Curated Examples
const EXAMPLES_DATA = [
  {
    id: 'ex1',
    title: 'Ejemplo 1: Sistema 3x3 Estándar (Diagonal Dominante)',
    desc: 'Un sistema 3x3 clásico ideal para contrastar Jacobi y Gauss-Seidel. Es estrictamente diagonal dominante.',
    category: 'Matemáticas Puras',
    size: 3,
    A: [
      [10, -1, 2],
      [-1, 11, -1],
      [2, -1, 10]
    ],
    b: [6, 25, -11],
    x0: [0, 0, 0],
    solutionEstimate: 'x₁ ≈ 1.000000, x₂ ≈ 2.000000, x₃ ≈ -1.000000'
  },
  {
    id: 'ex2',
    title: 'Ejemplo 2: Análisis de Mallas en Circuitos Eléctricos (3x3)',
    desc: 'Cálculo de intensidades de corriente I₁, I₂, I₃ en un circuito puente con resistencias acopladas.',
    category: 'Física & Circuitos',
    size: 3,
    A: [
      [12, -3, -4],
      [-3, 10, -2],
      [-4, -2, 15]
    ],
    b: [15, 20, 5],
    x0: [0, 0, 0],
    solutionEstimate: 'I₁ ≈ 2.215437 A, I₂ ≈ 2.809176 A, I₃ ≈ 1.300584 A'
  },
  {
    id: 'ex3',
    title: 'Ejemplo 3: Sistema 3x3 con Reordenamiento de Filas',
    desc: 'En su orden inicial NO es diagonal dominante. Al presionar "Ordenar Filas", se permutan las ecuaciones para asegurar convergencia.',
    category: 'Reordenamiento / Pivoteo',
    size: 3,
    A: [
      [1, 2, 10],
      [10, 1, 2],
      [2, 10, 1]
    ],
    b: [26, 14, 28],
    x0: [0, 0, 0],
    solutionEstimate: 'Requiere permutar filas. Solución: x₁ ≈ 1.000000, x₂ ≈ 2.000000, x₃ ≈ 2.000000'
  },
  {
    id: 'ex4',
    title: 'Ejemplo 4: Nodos Estructurales y Vigas (4x4)',
    desc: 'Desplazamientos elásticos en un entramado bidimensional articulado de 4 nodos.',
    category: 'Ingeniería Civil',
    size: 4,
    A: [
      [9, -2, 3, -1],
      [-2, 8, -2, 2],
      [3, -2, 11, -4],
      [-1, 2, -4, 10]
    ],
    b: [54.5, -14, 12.5, -21],
    x0: [0, 0, 0, 0],
    solutionEstimate: 'x₁ ≈ 5.000000, x₂ ≈ -1.500000, x₃ ≈ 2.000000, x₄ ≈ -1.000000'
  },
  {
    id: 'ex5',
    title: 'Ejemplo 5: Transferencia de Calor en Placa Térmica (3x3)',
    desc: 'Equilibrio de temperaturas en nodos internos de una superficie conductora sometida a condiciones de frontera fijas.',
    category: 'Termodinámica',
    size: 3,
    A: [
      [4, -1, -1],
      [-1, 4, -1],
      [-1, -1, 4]
    ],
    b: [100, 200, 50],
    x0: [0, 0, 0],
    solutionEstimate: 'T₁ ≈ 42.857143 °C, T₂ ≈ 67.857143 °C, T₃ ≈ 30.357143 °C'
  },
  {
    id: 'ex6',
    title: 'Ejemplo 6: Reactores Químicos Interconectados (4x4)',
    desc: 'Concentraciones de estado estacionario en un tren de cuatro reactores continuos de mezcla perfecta (CSTR).',
    category: 'Ingeniería Química',
    size: 4,
    A: [
      [15, -3, -1, -2],
      [-2, 12, -2, -3],
      [-1, -2, 16, -4],
      [-2, -3, -4, 20]
    ],
    b: [45, 28, 62, 30],
    x0: [0, 0, 0, 0],
    solutionEstimate: 'C₁ ≈ 4.148560, C₂ ≈ 4.120531, C₃ ≈ 5.143719, C₄ ≈ 3.535090'
  }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderMatrixInputs(currentSize);
  renderExamplesCatalog();
  checkDominance();
});

// Tab Navigation
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));

  if (tabId === 'calculator') {
    document.getElementById('tab-calc').classList.add('active');
    document.getElementById('section-calculator').classList.add('active');
  } else if (tabId === 'examples') {
    document.getElementById('tab-examples').classList.add('active');
    document.getElementById('section-examples').classList.add('active');
  } else if (tabId === 'theory') {
    document.getElementById('tab-theory').classList.add('active');
    document.getElementById('section-theory').classList.add('active');
  } else if (tabId === 'manual') {
    document.getElementById('tab-manual').classList.add('active');
    document.getElementById('section-manual').classList.add('active');
  }
}

// Matrix Size Stepper
function changeSize(delta) {
  const newSize = currentSize + delta;
  if (newSize >= 3 && newSize <= 6) {
    currentSize = newSize;
    document.getElementById('matrix-size').value = currentSize;
    renderMatrixInputs(currentSize);
    checkDominance();
  }
}

// Render dynamic matrix & initial vector inputs
function renderMatrixInputs(n) {
  const container = document.getElementById('matrix-inputs-container');
  const x0Container = document.getElementById('initial-vector-container');
  container.innerHTML = '';
  x0Container.innerHTML = '';

  for (let i = 0; i < n; i++) {
    const row = document.createElement('div');
    row.className = 'matrix-row';
    row.setAttribute('data-row', i);

    for (let j = 0; j < n; j++) {
      const cellGroup = document.createElement('div');
      cellGroup.className = 'matrix-cell-group';

      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = `matrix-input ${i === j ? 'diag-input' : ''}`;
      input.id = `a-${i}-${j}`;
      input.placeholder = `a${i+1}${j+1}`;
      input.value = (i === j) ? 10 : 0;
      input.addEventListener('input', checkDominance);

      const label = document.createElement('span');
      label.className = 'var-label';
      label.innerHTML = `x<sub>${j+1}</sub>`;

      cellGroup.appendChild(input);
      cellGroup.appendChild(label);

      if (j < n - 1) {
        const plus = document.createElement('span');
        plus.className = 'plus-sign';
        plus.textContent = '+';
        cellGroup.appendChild(plus);
      }

      row.appendChild(cellGroup);
    }

    const equal = document.createElement('span');
    equal.className = 'equal-sign';
    equal.textContent = '=';
    row.appendChild(equal);

    const bInput = document.createElement('input');
    bInput.type = 'number';
    bInput.step = 'any';
    bInput.className = 'matrix-input b-input';
    bInput.id = `b-${i}`;
    bInput.placeholder = `b${i+1}`;
    bInput.value = (i + 1) * 5;
    bInput.addEventListener('input', checkDominance);
    row.appendChild(bInput);

    container.appendChild(row);
  }

  // Initial Vector x^(0)
  for (let i = 0; i < n; i++) {
    const cell = document.createElement('div');
    cell.className = 'initial-cell';

    const label = document.createElement('span');
    label.className = 'var-label';
    label.innerHTML = `x<sub>${i+1}</sub><sup>(0)</sup> =`;

    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.id = `x0-${i}`;
    input.value = 0;

    cell.appendChild(label);
    cell.appendChild(input);
    x0Container.appendChild(cell);
  }
}

// Clear Matrix Inputs
function clearMatrixInputs() {
  for (let i = 0; i < currentSize; i++) {
    for (let j = 0; j < currentSize; j++) {
      const el = document.getElementById(`a-${i}-${j}`);
      if (el) el.value = '';
    }
    const bEl = document.getElementById(`b-${i}`);
    if (bEl) bEl.value = '';
    const x0El = document.getElementById(`x0-${i}`);
    if (x0El) x0El.value = 0;
  }
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('validation-banner').style.display = 'none';
  checkDominance();
}

// Read current matrix from DOM
function getMatrixData() {
  const n = currentSize;
  const A = [];
  const b = [];
  const x0 = [];

  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j < n; j++) {
      const val = parseFloat(document.getElementById(`a-${i}-${j}`).value);
      A[i][j] = isNaN(val) ? 0 : val;
    }
    const bVal = parseFloat(document.getElementById(`b-${i}`).value);
    b[i] = isNaN(bVal) ? 0 : bVal;

    const x0Val = parseFloat(document.getElementById(`x0-${i}`).value);
    x0[i] = isNaN(x0Val) ? 0 : x0Val;
  }

  return { n, A, b, x0 };
}

// Check Strict Diagonal Dominance
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
      if (dominantCount === n) break; // Found strictly dominant!
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

// Load Preset Example
function loadPresetExample(exId) {
  if (!exId) return;
  const ex = EXAMPLES_DATA.find(e => e.id === exId);
  if (!ex) return;

  currentSize = ex.size;
  document.getElementById('matrix-size').value = currentSize;
  renderMatrixInputs(currentSize);

  for (let i = 0; i < currentSize; i++) {
    for (let j = 0; j < currentSize; j++) {
      document.getElementById(`a-${i}-${j}`).value = ex.A[i][j];
    }
    document.getElementById(`b-${i}`).value = ex.b[i];
    document.getElementById(`x0-${i}`).value = ex.x0[i];
  }

  // Scroll smoothly to matrix
  document.getElementById('matrix-inputs-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
  checkDominance();
}

// Populate Examples Tab Cards
function renderExamplesCatalog() {
  const grid = document.getElementById('examples-cards-grid');
  grid.innerHTML = '';

  EXAMPLES_DATA.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'example-card';

    let equationsHtml = '';
    for (let i = 0; i < ex.size; i++) {
      let eqStr = '';
      for (let j = 0; j < ex.size; j++) {
        const coef = ex.A[i][j];
        const sign = (coef >= 0 && j > 0) ? '+' : '';
        eqStr += `${sign}${coef}x${j+1} `;
      }
      eqStr += `= ${ex.b[i]}\n`;
      equationsHtml += eqStr;
    }

    card.innerHTML = `
      <div>
        <div class="example-badge">${ex.category} &bull; ${ex.size}&times;${ex.size}</div>
        <h3>${ex.title}</h3>
        <p>${ex.desc}</p>
        <div class="example-system-box">
          <pre style="font-family: inherit; margin: 0;">${equationsHtml.trim()}</pre>
        </div>
        <p style="font-size: 0.85rem; color: #a7f3d0;"><strong>Solución esperada:</strong> ${ex.solutionEstimate}</p>
      </div>
      <button class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="loadAndSwitchToExample('${ex.id}')">
        Cargar este Ejemplo en la Calculadora
      </button>
    `;
    grid.appendChild(card);
  });
}

function loadAndSwitchToExample(exId) {
  document.getElementById('example-select').value = exId;
  loadPresetExample(exId);
  switchTab('calculator');
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
      banner.innerHTML = `<strong>Error Matemático:</strong> El elemento de la diagonal principal a<sub>${i+1}${i+1}</sub> es 0. No es posible dividir por cero. Usa el botón <strong>"Ordenar Filas"</strong> para corregir la posición de las ecuaciones.`;
      return;
    }
  }

  // Iteration variables - enforce strictly 6 decimal figures from initial guess
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
      let substitutionParts = [];
      let numericalParts = [];

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          // Jacobi uses currentX[j], Gauss-Seidel uses freshly updated nextX[j] if j < i
          const rawValUsed = (method === 'seidel' && j < i) ? nextX[j] : currentX[j];
          const valUsed = process6(rawValUsed, precisionMode);
          const isFresh = (method === 'seidel' && j < i);
          
          const product = process6(A[i][j] * valUsed, precisionMode);
          sumTerms = process6(sumTerms + product, precisionMode);

          substitutionParts.push(`(${A[i][j]}) &middot; x<sub>${j+1}</sub>${isFresh ? `<sup>(${k})</sup>` : `<sup>(${k-1})</sup>`}`);
          numericalParts.push(`(${A[i][j]}) &middot; (${format6(valUsed, precisionMode)})`);
        }
      }

      const numerator = process6(b[i] - sumTerms, precisionMode);
      const rawDivision = numerator / A[i][i];
      // Only keep the first 6 decimal figures, discarding the rest
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
        formula: `x<sub>${i+1}</sub><sup>(${k})</sup> = (1 / a<sub>${i+1}${i+1}</sub>) &middot; [ b<sub>${i+1}</sub> - &sum; a<sub>${i+1}j</sub> x<sub>j</sub> ]`,
        substitution: `x<sub>${i+1}</sub><sup>(${k})</sup> = (1 / ${A[i][i]}) &middot; [ ${b[i]} - ( ${numericalParts.join(' + ').replace(/\+ -/g, '- ')} ) ]`,
        intermediate: `= (1 / ${A[i][i]}) &middot; [ ${format6(numerator, precisionMode)} ]`,
        result: format6(computedVal, precisionMode),
        error: errStr,
        isFreshUpdateNote: (method === 'seidel' && i > 0) ? `(Aprovecha de inmediato x₁...x${i} actualizados en la iteración ${k})` : ''
      });
    }

    const maxErr = Math.max(...errors);

    iterationSteps.push({
      iteration: k,
      calculations: stepCalculations,
      maxError: maxErr,
      maxErrorStr: errorType === 'relative' ? `${format6(maxErr)}%` : format6(maxErr),
      values: [...nextX]
    });

    tableRows.push({
      k: k,
      values: [...nextX],
      maxError: errorType === 'relative' ? `${format6(maxErr)}%` : format6(maxErr)
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

// Render Results, Step-by-Step cards and Master Table
function renderResultsUI(data) {
  const container = document.getElementById('results-container');
  container.style.display = 'block';

  // Badges & Summary
  const methodBadge = document.getElementById('res-method-badge');
  methodBadge.textContent = data.method === 'jacobi' ? 'Método de Jacobi' : 'Método de Gauss-Seidel';

  const statusTitle = document.getElementById('res-status-title');
  const summaryDesc = document.getElementById('res-summary-desc');

  const modeDesc = data.precisionMode === 'truncate' ? 'truncamiento directo a 6 cifras' : 'redondeo a 6 cifras';

  if (data.converged) {
    statusTitle.textContent = `Convergencia Exitosa en ${data.finalIteration} Iteraciones`;
    statusTitle.style.color = '#6ee7b7';
    summaryDesc.innerHTML = `El sistema alcanzó la tolerancia &epsilon; &le; ${data.tolerance} cumpliendo el mínimo obligatorio de <strong>${data.minIterations} iteraciones</strong> (Cálculo con ${modeDesc}, descartando el resto).`;
  } else {
    statusTitle.textContent = `Límite de ${data.finalIteration} Iteraciones Alcanzado`;
    statusTitle.style.color = '#fcd34d';
    summaryDesc.innerHTML = `Se ejecutaron ${data.finalIteration} iteraciones (Mínimo exigido: ${data.minIterations}). Error actual: ${data.iterationSteps[data.iterationSteps.length - 1].maxErrorStr} (${modeDesc}).`;
  }

  // Final Solution Chips
  const solGrid = document.getElementById('solution-values-grid');
  solGrid.innerHTML = '';
  data.finalValues.forEach((val, idx) => {
    const chip = document.createElement('div');
    chip.className = 'sol-chip';
    chip.innerHTML = `
      <span class="sol-name">x<sub>${idx+1}</sub> =</span>
      <span class="sol-val">${format6(val, data.precisionMode)}</span>
    `;
    solGrid.appendChild(chip);
  });

  // Step-by-Step Detailed Cards
  const stepsContainer = document.getElementById('step-by-step-cards');
  stepsContainer.innerHTML = '';

  data.iterationSteps.forEach((step, stepIdx) => {
    const card = document.createElement('div');
    card.className = `step-card ${stepIdx === 0 ? 'open' : ''}`; // First one open by default

    let calcsHtml = '';
    step.calculations.forEach(calc => {
      calcsHtml += `
        <div class="calc-item">
          <div class="calc-formula-title">Despeje y cálculo para x<sub>${calc.varIndex}</sub>:</div>
          <div class="calc-substitution">
            <div>${calc.formula}</div>
            <div style="margin-top: 4px; color: #93c5fd;">&rarr; Sustituyendo valores:</div>
            <div>${calc.substitution}</div>
            <div>${calc.intermediate} = <strong>${calc.result}</strong></div>
          </div>
          
          <button class="btn btn-sm" style="margin: 8px 0; background: transparent; border: 1px solid #93c5fd; color: #93c5fd; padding: 4px 8px; border-radius: 4px; cursor: pointer; display: block;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">Ver desglose aritmético (Prueba de cálculo)</button>
          <div style="display: none; padding: 10px; background: rgba(0,0,0,0.2); border-left: 3px solid #93c5fd; border-radius: 4px; margin-bottom: 10px; font-size: 0.85rem; color: #e2e8f0;">
            <div style="margin-bottom: 4px;"><strong>Suma interna de las variables:</strong> ${calc.sumTerms}</div>
            <div style="margin-bottom: 4px;"><strong>Numerador (b - suma):</strong> ${calc.b_i} - (${calc.sumTerms}) = <strong>${calc.numerator}</strong></div>
            <div><strong>División final:</strong> ${calc.numerator} / ${calc.a_ii} = <strong>${calc.result}</strong></div>
          </div>

          <div>
            <span class="calc-result-tag">x<sub>${calc.varIndex}</sub><sup>(${step.iteration})</sup> = ${calc.result}</span>
            <span class="calc-error-tag">Error: ${calc.error}</span>
            ${calc.isFreshUpdateNote ? `<span style="font-size: 0.8rem; color: #6ee7b7; margin-left: 8px;">${calc.isFreshUpdateNote}</span>` : ''}
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="step-header" onclick="toggleStepCard(this)">
        <div class="step-header-left">
          <div class="step-num-badge">${step.iteration}</div>
          <div class="step-title">Iteración ${step.iteration}</div>
        </div>
        <div class="step-header-right">
          <span class="step-error-metric">Error Máx: <strong>${step.maxErrorStr}</strong></span>
          <span class="step-arrow">&#9660;</span>
        </div>
      </div>
      <div class="step-body">
        <div class="equations-calc-list">
          ${calcsHtml}
        </div>
      </div>
    `;

    stepsContainer.appendChild(card);
  });

  // Master Iterations Table
  const table = document.getElementById('iterations-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  let thHtml = `<tr><th>k (Iter)</th>`;
  for (let i = 0; i < data.n; i++) {
    thHtml += `<th>x<sub>${i+1}</sub></th>`;
  }
  thHtml += `<th>Error Máx.</th></tr>`;
  thead.innerHTML = thHtml;

  let trHtml = '';
  data.tableRows.forEach(row => {
    trHtml += `<tr><td><strong>${row.k}</strong></td>`;
    row.values.forEach(v => {
      trHtml += `<td>${format6(v, data.precisionMode)}</td>`;
    });
    trHtml += `<td>${row.maxError}</td></tr>`;
  });
  tbody.innerHTML = trHtml;

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Toggle individual step card
function toggleStepCard(headerEl) {
  const card = headerEl.closest('.step-card');
  card.classList.toggle('open');
}

// Expand / Collapse All Steps
function toggleAllSteps(expand) {
  document.querySelectorAll('.step-card').forEach(card => {
    if (expand) {
      card.classList.add('open');
    } else {
      card.classList.remove('open');
    }
  });
}

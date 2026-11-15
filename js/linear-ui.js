/**
 * LINEAR-UI.JS
 * Renderizado de interfaz, inputs dinámicos, catálogo y tarjetas de resultados
 * para el módulo de Sistemas Lineales (Jacobi & Gauss-Seidel).
 */

let currentSize = 3;

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
  if (!container || !x0Container) return;

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
      label.innerHTML = `\\(x_{${j+1}}\\)`;

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
    label.innerHTML = `\\(x_{${i+1}}^{(0)} =\\)`;

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
      const el = document.getElementById(`a-${i}-${j}`);
      const val = el ? parseFloat(el.value) : 0;
      A[i][j] = isNaN(val) ? 0 : val;
    }
    const bEl = document.getElementById(`b-${i}`);
    const bVal = bEl ? parseFloat(bEl.value) : 0;
    b[i] = isNaN(bVal) ? 0 : bVal;

    const x0El = document.getElementById(`x0-${i}`);
    const x0Val = x0El ? parseFloat(x0El.value) : 0;
    x0[i] = isNaN(x0Val) ? 0 : x0Val;
  }

  return { n, A, b, x0 };
}

// Load Preset Example
function loadPresetExample(exId) {
  if (!exId) return;
  const ex = LINEAR_EXAMPLES_DATA.find(e => e.id === exId);
  if (!ex) return;

  currentSize = ex.size;
  document.getElementById('matrix-size').value = currentSize;
  renderMatrixInputs(currentSize);

  for (let i = 0; i < currentSize; i++) {
    for (let j = 0; j < currentSize; j++) {
      const el = document.getElementById(`a-${i}-${j}`);
      if (el) el.value = ex.A[i][j];
    }
    const bEl = document.getElementById(`b-${i}`);
    if (bEl) bEl.value = ex.b[i];
    const x0El = document.getElementById(`x0-${i}`);
    if (x0El) x0El.value = ex.x0[i];
  }

  const container = document.getElementById('matrix-inputs-container');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  checkDominance();
}

// Populate Examples Tab Cards
function renderExamplesCatalog() {
  const grid = document.getElementById('examples-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  LINEAR_EXAMPLES_DATA.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'example-card';

    let equationsHtml = '';
    for (let i = 0; i < ex.size; i++) {
      let eqStr = '';
      for (let j = 0; j < ex.size; j++) {
        const coef = ex.A[i][j];
        const sign = (coef >= 0 && j > 0) ? '+ ' : (coef < 0 ? '- ' : '');
        const abs = Math.abs(coef);
        eqStr += `${sign}${abs}\\,x_{${j+1}} `;
      }
      eqStr += `= ${ex.b[i]}`;
      equationsHtml += `\\(${eqStr.trim()}\\)<br>`;
    }

    card.innerHTML = `
      <div>
        <div class="example-badge">${ex.category} &bull; ${ex.size}&times;${ex.size}</div>
        <h3>${ex.title}</h3>
        <p>${ex.desc}</p>
        <div class="example-system-box">
          <pre style="font-family: inherit; margin: 0; white-space: pre-wrap;">${equationsHtml}</pre>
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
    summaryDesc.innerHTML = `El sistema alcanzó la tolerancia \\(\\varepsilon \\le ${data.tolerance}\\) cumpliendo el mínimo de <strong>${data.minIterations} iteraciones</strong> (${modeDesc}).`;
  } else {
    statusTitle.textContent = `Límite de ${data.finalIteration} Iteraciones Alcanzado`;
    statusTitle.style.color = '#fcd34d';
    summaryDesc.innerHTML = `Se ejecutaron ${data.finalIteration} iteraciones (${modeDesc}). Error actual: ${data.iterationSteps[data.iterationSteps.length - 1].maxErrorStr}.`;
  }

  // Final Solution Chips
  const solGrid = document.getElementById('solution-values-grid');
  solGrid.innerHTML = '';
  data.finalValues.forEach((val, idx) => {
    const chip = document.createElement('div');
    chip.className = 'sol-chip';
    chip.innerHTML = `
      <span class="sol-name">\\(x_{${idx+1}} =\\)</span>
      <span class="sol-val">${format6(val, data.precisionMode)}</span>
    `;
    solGrid.appendChild(chip);
  });

  // Step-by-Step Detailed Cards
  const stepsContainer = document.getElementById('step-by-step-cards');
  stepsContainer.innerHTML = '';

  data.iterationSteps.forEach((step, stepIdx) => {
    const card = document.createElement('div');
    card.className = `step-card ${stepIdx === 0 ? 'open' : ''}`;

    let calcsHtml = '';
    step.calculations.forEach(calc => {
      calcsHtml += `
        <div class="calc-item">
          <div class="calc-formula-title">Despeje y cálculo para \\(x_{${calc.varIndex}}\\):</div>
          <div class="calc-substitution">
            <div>${calc.formula}</div>
            <div style="margin-top: 4px; color: #34d399;">&rarr; Sustituyendo valores:</div>
            <div>${calc.substitution}</div>
            <div>${calc.intermediate} \\(= \\mathbf{${calc.result}}\\)</div>
          </div>
          
          <button class="btn btn-sm" style="margin: 8px 0; background: transparent; border: 1px solid #10b981; color: #34d399; padding: 4px 8px; border-radius: 4px; cursor: pointer; display: block;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">Ver desglose aritmético interno</button>
          <div style="display: none; padding: 10px; background: rgba(0,0,0,0.35); border-left: 3px solid #10b981; border-radius: 4px; margin-bottom: 10px; font-size: 0.85rem; color: #e2e8f0; font-family: 'JetBrains Mono', monospace;">
            <div style="margin-bottom: 4px;">&bull; Suma interna de términos: \\(\\sum = ${calc.sumTerms}\\)</div>
            <div style="margin-bottom: 4px;">&bull; Numerador: \\(b_{${calc.varIndex}} - \\sum = ${calc.b_i} - (${calc.sumTerms}) = \\mathbf{${calc.numerator}}\\)</div>
            <div>&bull; División final: \\(\\dfrac{${calc.numerator}}{${calc.a_ii}} = \\mathbf{${calc.result}}\\)</div>
          </div>

          <div>
            <span class="calc-result-tag">\\(x_{${calc.varIndex}}^{(${step.iteration})} = ${calc.result}\\)</span>
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

  let thHtml = `<tr><th>\\(k\\) (Iter)</th>`;
  for (let i = 0; i < data.n; i++) {
    thHtml += `<th>\\(x_{${i+1}}\\)</th>`;
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

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Toggle individual step card
function toggleStepCard(headerEl) {
  const card = headerEl.closest('.step-card');
  if (card) card.classList.toggle('open');
}

// Expand / Collapse All Steps
function toggleAllSteps(expand) {
  document.querySelectorAll('#module-linear .step-card').forEach(card => {
    if (expand) card.classList.add('open');
    else card.classList.remove('open');
  });
}

/**
 * BAIRSTOW-UI.JS
 * Interfaz de usuario para el Método de Bairstow:
 * - Generación interactiva de inputs para los coeficientes an ... a0
 * - Vista matemática en vivo de la ecuación polinomial P(x)
 * - Renderizado de tarjetas de factores cuadráticos y raíces reales/complejas
 * - Tablas visuales de división sintética para b_k y c_k
 * - Controles de expansión y resumen global
 */

let currentBairstowDegree = 5;

function changeBairstowDegree(delta) {
  const newDeg = currentBairstowDegree + delta;
  if (newDeg >= 3 && newDeg <= 8) {
    currentBairstowDegree = newDeg;
    document.getElementById('b-poly-degree').value = currentBairstowDegree;
    document.getElementById('b-poly-badge').textContent = `Polinomio de Grado ${currentBairstowDegree}`;
    renderBairstowPolyInputs(currentBairstowDegree);
    updateBairstowPolyPreview();
  }
}

function renderBairstowPolyInputs(n) {
  const container = document.getElementById('b-poly-inputs');
  if (!container) return;
  container.innerHTML = '';

  for (let k = n; k >= 0; k--) {
    const group = document.createElement('div');
    group.className = 'poly-input-group';

    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.className = 'poly-coef-input';
    input.id = `b-a-${k}`;
    input.placeholder = `a${k}`;
    input.value = (k === n) ? 1 : 0;
    input.addEventListener('input', updateBairstowPolyPreview);

    const label = document.createElement('span');
    label.className = 'poly-term-label';
    if (k > 1) {
      label.innerHTML = `x<sup>${k}</sup>`;
    } else if (k === 1) {
      label.innerHTML = `x`;
    } else {
      label.innerHTML = `(cte)`;
    }

    group.appendChild(input);
    group.appendChild(label);

    if (k > 0) {
      const plus = document.createElement('span');
      plus.className = 'plus-sign';
      plus.textContent = '+';
      group.appendChild(plus);
    }

    container.appendChild(group);
  }
  updateBairstowPolyPreview();
}

function updateBairstowPolyPreview() {
  const preview = document.getElementById('b-poly-preview');
  if (!preview) return;

  const n = currentBairstowDegree;
  let terms = [];

  for (let k = n; k >= 0; k--) {
    const el = document.getElementById(`b-a-${k}`);
    const val = el ? parseFloat(el.value) : 0;
    const num = isNaN(val) ? 0 : val;

    if (num === 0 && k < n && terms.length > 0) continue;

    const absVal = Math.abs(num);
    const sign = (num < 0) ? '-' : (terms.length > 0 ? '+' : '');
    const coefStr = (absVal !== 1 || k === 0) ? String(absVal) : '';

    if (k > 1) {
      terms.push(`${sign} ${coefStr}x^{${k}}`);
    } else if (k === 1) {
      terms.push(`${sign} ${coefStr}x`);
    } else {
      terms.push(`${sign} ${coefStr}`);
    }
  }

  if (terms.length === 0) {
    preview.innerHTML = '\\( P(x) = 0 \\)';
  } else {
    preview.innerHTML = `\\( P(x) = ${terms.join(' ').trim()} = 0 \\)`;
  }
}

function clearBairstowInputs() {
  for (let k = 0; k <= currentBairstowDegree; k++) {
    const el = document.getElementById(`b-a-${k}`);
    if (el) el.value = (k === currentBairstowDegree ? 1 : 0);
  }
  document.getElementById('b-results-container').style.display = 'none';
  document.getElementById('b-validation-banner').style.display = 'none';
  updateBairstowPolyPreview();
}

function resetBairstowInputs() {
  document.getElementById('b-r0').value = -1;
  document.getElementById('b-s0').value = -1;
  document.getElementById('b-max-iterations').value = 30;
  document.getElementById('b-tolerance').value = '0.0001';
  document.getElementById('b-error-type').value = 'relative';
  if (document.getElementById('b-decimals-display')) {
    document.getElementById('b-decimals-display').value = '6';
  }
  document.getElementById('b-solve-mode').value = 'single';
  loadPresetBairstowExample('bex1');
}

function loadPresetBairstowExample(exId) {
  if (!exId) return;
  const ex = BAIRSTOW_EXAMPLES_DATA.find(e => e.id === exId);
  if (!ex) return;

  currentBairstowDegree = ex.degree;
  document.getElementById('b-poly-degree').value = currentBairstowDegree;
  document.getElementById('b-poly-badge').textContent = `Polinomio de Grado ${currentBairstowDegree}`;
  renderBairstowPolyInputs(currentBairstowDegree);

  for (let k = 0; k <= currentBairstowDegree; k++) {
    const el = document.getElementById(`b-a-${k}`);
    if (el && ex.a[k] !== undefined) {
      el.value = ex.a[k];
    }
  }

  document.getElementById('b-r0').value = ex.r0;
  document.getElementById('b-s0').value = ex.s0;
  updateBairstowPolyPreview();
}

function renderBairstowExamplesCatalog() {
  const grid = document.getElementById('b-examples-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  BAIRSTOW_EXAMPLES_DATA.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'example-card';

    let polyStr = 'P(x) = ';
    for (let k = ex.degree; k >= 0; k--) {
      const coef = ex.a[k];
      const sign = (coef >= 0 && k < ex.degree) ? '+ ' : (coef < 0 ? '- ' : '');
      const abs = Math.abs(coef);
      let term = '';
      if (k > 1) term = `${abs === 1 ? '' : abs}x^${k}`;
      else if (k === 1) term = `${abs === 1 ? '' : abs}x`;
      else term = `${abs}`;
      polyStr += `${sign}${term} `;
    }

    card.innerHTML = `
      <div>
        <div class="example-badge">${ex.category} &bull; Grado ${ex.degree}</div>
        <h3>${ex.title}</h3>
        <p>${ex.desc}</p>
        <div class="example-system-box">
          <pre style="font-family: inherit; margin: 0; white-space: pre-wrap;">${polyStr.trim()}</pre>
          <div style="margin-top: 6px; font-size: 0.82rem; color: #94a3b8;">Semillas: r₀ = ${ex.r0}, s₀ = ${ex.s0}</div>
        </div>
        <p style="font-size: 0.85rem; color: #a7f3d0;"><strong>Factor esperado:</strong> ${ex.expectedFactor}</p>
        <p style="font-size: 0.85rem; color: #f59e0b;"><strong>Raíces esperadas:</strong> ${ex.expectedRoots}</p>
      </div>
      <button class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="loadAndSwitchToBairstowExample('${ex.id}')">
        Cargar este Ejemplo en la Calculadora
      </button>
    `;
    grid.appendChild(card);
  });
}

function loadAndSwitchToBairstowExample(exId) {
  document.getElementById('b-example-select').value = exId;
  loadPresetBairstowExample(exId);
  switchBairstowTab('calc');
}

function renderBairstowResultsUI(data) {
  const container = document.getElementById('b-results-container');
  container.style.display = 'block';

  const statusTitle = document.getElementById('b-res-status-title');
  const summaryDesc = document.getElementById('b-res-summary-desc');

  if (data.converged) {
    statusTitle.textContent = `Convergencia Exitosa en ${data.finalIteration} Iteraciones`;
    statusTitle.style.color = '#34d399';
    summaryDesc.innerHTML = `El factor cuadrático convergió cumpliendo la tolerancia &epsilon; &le; ${data.tolerance} (mostrando ${data.decimals} decimales).`;
  } else {
    statusTitle.textContent = `Límite de ${data.finalIteration} Iteraciones Alcanzado`;
    statusTitle.style.color = '#fbbf24';
    summaryDesc.innerHTML = `Se completaron las ${data.finalIteration} iteraciones configuradas. Puedes aumentar las iteraciones máximas o ajustar las semillas iniciales.`;
  }

  // Factor Equation
  const factorEq = document.getElementById('b-factor-equation');
  const rSign = (data.rFinal >= 0) ? '-' : '+';
  const sSign = (data.sFinal >= 0) ? '-' : '+';
  const rAbsFormatted = formatDec(Math.abs(data.rFinal), data.decimals);
  const sAbsFormatted = formatDec(Math.abs(data.sFinal), data.decimals);
  factorEq.innerHTML = `\\( x^2 ${rSign} ${rAbsFormatted}\\,x ${sSign} ${sAbsFormatted} = 0 \\)`;

  const discInfo = document.getElementById('b-discriminant-info');
  const rVal = formatDec(data.rFinal, data.decimals);
  const sVal = formatDec(data.sFinal, data.decimals);
  const discVal = formatDec(data.factorRoots.disc, data.decimals);
  const simplifiedFactorStr = `\\( x^2 ${rSign} ${rAbsFormatted}\\,x ${sSign} ${sAbsFormatted} = 0 \\)`;
  const sTermDisc = (data.sFinal >= 0)
    ? `+ 4(${sVal})`
    : `- 4(${sAbsFormatted})`;

  discInfo.innerHTML = `
    <div><strong>Factor cuadrático obtenido:</strong> ${simplifiedFactorStr} &nbsp;<span style="color: #94a3b8; font-size: 0.85rem;">(\\(r = ${rVal},\\; s = ${sVal}\\))</span></div>
    <div style="margin-top: 6px;"><strong>Fórmula General:</strong> \\( x = \\dfrac{r \\pm \\sqrt{r^2 + 4s}}{2} \\) &nbsp;&bull;&nbsp; <strong>Discriminante:</strong> \\( \\Delta = (${rVal})^2 ${sTermDisc} = \\mathbf{${discVal}} \\) (${data.factorRoots.type === 'real' ? 'Dos raíces reales distintas' : 'Dos raíces complejas conjugadas'})</div>
  `;

  // Roots Chips
  const rootsGrid = document.getElementById('b-roots-cards-grid');
  rootsGrid.innerHTML = '';
  data.factorRoots.roots.forEach(root => {
    const card = document.createElement('div');
    card.className = `root-card ${root.isComplex ? 'complex-root' : 'real-root'}`;
    card.innerHTML = `
      <div>
        <span class="root-label">${root.label} =</span>
        <span class="root-val">${root.valStr}</span>
      </div>
      <span class="root-type-badge">${root.isComplex ? 'Compleja' : 'Real'}</span>
    `;
    rootsGrid.appendChild(card);
  });

  // Deflated Polynomial Q(x)
  const deflatedDiv = document.getElementById('b-deflated-poly');
  let qTerms = [];
  const qDeg = data.n - 2;
  for (let i = qDeg; i >= 0; i--) {
    const coef = data.quotientCoeffs[i];
    const pwr = i;
    if (Math.abs(coef) < 1e-12 && i > 0 && qTerms.length > 0) continue;
    
    const isLeading = (qTerms.length === 0);
    const sign = isLeading ? (coef < 0 ? '- ' : '') : (coef >= 0 ? '+ ' : '- ');
    const abs = Math.abs(coef);
    let term = '';
    if (pwr > 1) term = `${(abs === 1) ? '' : formatDec(abs, data.decimals)}x<sup>${pwr}</sup>`;
    else if (pwr === 1) term = `${(abs === 1) ? '' : formatDec(abs, data.decimals)}x`;
    else term = `${formatDec(abs, data.decimals)}`;
    qTerms.push(`${sign}${term}`);
  }
  deflatedDiv.innerHTML = `Q(x) = ${qTerms.join(' ')}`;

  // Full Roots Panel if selected
  const allRootsBox = document.getElementById('b-all-roots-container');
  const allRootsGrid = document.getElementById('b-all-roots-grid');
  if (data.solveMode === 'full' && data.allPolynomialRoots) {
    allRootsBox.style.display = 'block';
    allRootsGrid.innerHTML = '';
    data.allPolynomialRoots.forEach((root, idx) => {
      const card = document.createElement('div');
      card.className = `root-card ${root.isComplex ? 'complex-root' : 'real-root'}`;
      card.innerHTML = `
        <div>
          <span class="root-label">x<sub>${idx + 1}</sub> =</span>
          <span class="root-val">${root.valStr}</span>
        </div>
        <span class="root-type-badge">${root.isComplex ? 'Compleja' : 'Real'}</span>
      `;
      allRootsGrid.appendChild(card);
    });
  } else {
    allRootsBox.style.display = 'none';
  }

  // Step-by-Step Cards (Formato Académico Universitario)
  const stepsContainer = document.getElementById('b-step-by-step-cards');
  stepsContainer.innerHTML = '';

  data.iterationSteps.forEach((step, stepIdx) => {
    const card = document.createElement('div');
    card.id = `b-step-card-${step.iteration}`;
    card.className = `academic-step-card step-card ${stepIdx === 0 ? 'open' : ''}`;

    // 1. Tabla Clásica de 1ra División Sintética (b)
    let bHeadCols = '<th class="header-label-col">Potencia de x &rarr;</th>';
    for (let j = data.n; j >= 0; j--) {
      bHeadCols += `<th>x<sup>${j}</sup></th>`;
    }

    // Fila 1: Coeficientes a
    let bRowA = '<tr><td class="label-col">Coeficientes a</td>';
    for (let j = data.n; j >= 0; j--) {
      const aVal = data.a && data.a[j] !== undefined ? data.a[j] : 0;
      bRowA += `<td>${formatDec(aVal, data.decimals)}</td>`;
    }
    bRowA += '</tr>';

    // Fila 2: Término + r · b
    let bRowR = `<tr><td class="label-col" title="Término r &middot; b_{j+1} con r = ${formatDec(step.r_current, data.decimals)}">+ <i>r</i> &middot; <i>b</i></td>`;
    for (let j = data.n; j >= 0; j--) {
      if (j === data.n) {
        bRowR += '<td>&mdash;</td>';
      } else {
        bRowR += `<td>${formatDec(step.bTermR[j], data.decimals)}</td>`;
      }
    }
    bRowR += '</tr>';

    // Fila 3: Término + s · b
    let bRowS = `<tr><td class="label-col" title="Término s &middot; b_{j+2} con s = ${formatDec(step.s_current, data.decimals)}">+ <i>s</i> &middot; <i>b</i></td>`;
    for (let j = data.n; j >= 0; j--) {
      if (j >= data.n - 1) {
        bRowS += '<td>&mdash;</td>';
      } else {
        bRowS += `<td>${formatDec(step.bTermS[j], data.decimals)}</td>`;
      }
    }
    bRowS += '</tr>';

    // Fila 4: Raya horizontal de suma y Resultado b
    let bRowRes = '<tr class="sum-divider-row"><td class="label-col">&Sigma; &nbsp; Resultado <i>b</i></td>';
    for (let j = data.n; j >= 0; j--) {
      const isRem = (j === 1 || j === 0);
      bRowRes += `<td class="${isRem ? 'highlight-residue' : ''}">${formatDec(step.b[j], data.decimals)}</td>`;
    }
    bRowRes += '</tr>';

    // Fila 5: Subíndices de b
    let bRowSub = '<tr class="subscript-row"><td class="label-col">Identificador</td>';
    for (let j = data.n; j >= 0; j--) {
      if (j === 1) {
        bRowSub += '<td class="rem-sub"><strong>b₁</strong> <span class="rem-tag">(Residuo)</span></td>';
      } else if (j === 0) {
        bRowSub += '<td class="rem-sub"><strong>b₀</strong> <span class="rem-tag">(Residuo)</span></td>';
      } else {
        bRowSub += `<td><strong>b<sub>${j}</sub></strong></td>`;
      }
    }
    bRowSub += '</tr>';

    // 2. Tabla Clásica de 2da División Sintética (c)
    let cHeadCols = '<th class="header-label-col">Potencia de x &rarr;</th>';
    for (let j = data.n; j >= 1; j--) {
      cHeadCols += `<th>x<sup>${j}</sup></th>`;
    }

    // Fila 1: Coeficientes b
    let cRowB = '<tr><td class="label-col">Coeficientes <i>b</i></td>';
    for (let j = data.n; j >= 1; j--) {
      cRowB += `<td>${formatDec(step.b[j], data.decimals)}</td>`;
    }
    cRowB += '</tr>';

    // Fila 2: Término + r · c
    let cRowR = `<tr><td class="label-col" title="Término r &middot; c_{j+1} con r = ${formatDec(step.r_current, data.decimals)}">+ <i>r</i> &middot; <i>c</i></td>`;
    for (let j = data.n; j >= 1; j--) {
      if (j === data.n) {
        cRowR += '<td>&mdash;</td>';
      } else {
        cRowR += `<td>${formatDec(step.cTermR[j], data.decimals)}</td>`;
      }
    }
    cRowR += '</tr>';

    // Fila 3: Término + s · c
    let cRowS = `<tr><td class="label-col" title="Término s &middot; c_{j+2} con s = ${formatDec(step.s_current, data.decimals)}">+ <i>s</i> &middot; <i>c</i></td>`;
    for (let j = data.n; j >= 1; j--) {
      if (j >= data.n - 1) {
        cRowS += '<td>&mdash;</td>';
      } else {
        cRowS += `<td>${formatDec(step.cTermS[j], data.decimals)}</td>`;
      }
    }
    cRowS += '</tr>';

    // Fila 4: Raya horizontal de suma y Resultado c
    let cRowRes = '<tr class="sum-divider-row"><td class="label-col">&Sigma; &nbsp; Resultado <i>c</i></td>';
    for (let j = data.n; j >= 1; j--) {
      const isJac = (j <= 3);
      cRowRes += `<td class="${isJac ? 'highlight-jacobian' : ''}">${formatDec(step.c[j], data.decimals)}</td>`;
    }
    cRowRes += '</tr>';

    // Fila 5: Subíndices de c (correspondencia biyectiva con columna j sin saltos ni desfases)
    let cRowSub = '<tr class="subscript-row"><td class="label-col">Identificador</td>';
    for (let j = data.n; j >= 1; j--) {
      if (j === 3) {
        cRowSub += '<td class="highlight-sub"><strong>c₃</strong> <span class="jac-tag">(J₁₂)</span></td>';
      } else if (j === 2) {
        cRowSub += '<td class="highlight-sub"><strong>c₂</strong> <span class="jac-tag">(J₁₁, J₂₂)</span></td>';
      } else if (j === 1) {
        cRowSub += '<td class="highlight-sub"><strong>c₁</strong> <span class="jac-tag">(J₂₁)</span></td>';
      } else {
        cRowSub += `<td><strong>c<sub>${j}</sub></strong></td>`;
      }
    }
    cRowSub += '</tr>';

    // Variables de Cramer y determinantes
    const c2 = step.c2;
    const c3 = step.c3;
    const c1 = step.c1;
    const b1 = step.b1;
    const b0 = step.b0;

    const crossDet1 = formatDec(c2 * c2, data.decimals);
    const crossDet2 = formatDec(c3 * c1, data.decimals);
    const crossDr1 = formatDec(-b1 * c2, data.decimals);
    const crossDr2 = formatDec(c3 * -b0, data.decimals);
    const crossDs1 = formatDec(c2 * -b0, data.decimals);
    const crossDs2 = formatDec(-b1 * c1, data.decimals);

    card.innerHTML = `
      <div class="academic-step-header" onclick="toggleBairstowStepCard(this)">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span class="step-badge-pill">Paso ${step.iteration}</span>
          <span class="academic-step-title">Iteración ${step.iteration} &bull; r = ${formatDec(step.r_current, data.decimals)}, &nbsp; s = ${formatDec(step.s_current, data.decimals)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span class="academic-step-metrics">&epsilon;<sub>r</sub> = <strong>${step.errRStr}</strong> &nbsp;|&nbsp; &epsilon;<sub>s</sub> = <strong>${step.errSStr}</strong></span>
          <span class="step-arrow">&#9660;</span>
        </div>
      </div>
      <div class="academic-step-body step-body">
        
        <!-- 1.1 PRIMERA DIVISIÓN SINTÉTICA (b) -->
        <div class="academic-section">
          <div class="academic-sub-header">
            <span class="academic-sub-num">1.1</span>
            <h4>Primera División Sintética (Secuencia <i>b</i>)</h4>
            <small>Valores actuales: <strong>r = ${formatDec(step.r_current, data.decimals)}</strong>, <strong>s = ${formatDec(step.s_current, data.decimals)}</strong> &bull; b<sub>j</sub> = a<sub>j</sub> + rb<sub>j+1</sub> + sb<sub>j+2</sub></small>
          </div>

          <div class="academic-synth-wrapper">
            <table class="academic-synth-table">
              <thead><tr>${bHeadCols}</tr></thead>
              <tbody>
                ${bRowA}
                ${bRowR}
                ${bRowS}
                ${bRowRes}
                ${bRowSub}
              </tbody>
            </table>
          </div>
          <div class="academic-note-strip residue-alert">
            &bull; Residuos a anular en esta iteración (columnas x¹, x⁰): <strong>b₁ = ${formatDec(step.b1, data.decimals)}</strong> &nbsp;|&nbsp; <strong>b₀ = ${formatDec(step.b0, data.decimals)}</strong>
          </div>
        </div>

        <!-- 1.2 SEGUNDA DIVISIÓN SINTÉTICA (c) -->
        <div class="academic-section">
          <div class="academic-sub-header">
            <span class="academic-sub-num" style="color: #f59e0b;">1.2</span>
            <h4>Segunda División Sintética (Secuencia <i>c</i> / Derivadas Parciales)</h4>
            <small>Valores actuales: <strong>r = ${formatDec(step.r_current, data.decimals)}</strong>, <strong>s = ${formatDec(step.s_current, data.decimals)}</strong> &bull; c<sub>j</sub> = b<sub>j</sub> + rc<sub>j+1</sub> + sc<sub>j+2</sub></small>
          </div>

          <div class="academic-synth-wrapper">
            <table class="academic-synth-table">
              <thead><tr>${cHeadCols}</tr></thead>
              <tbody>
                ${cRowB}
                ${cRowR}
                ${cRowS}
                ${cRowRes}
                ${cRowSub}
              </tbody>
            </table>
          </div>
          <div class="academic-note-strip jacobian-alert">
            &bull; Coeficientes clave del Jacobiano (columnas x³, x², x¹): <strong>c₃ = ${formatDec(step.c3, data.decimals)}</strong> &nbsp;|&nbsp; <strong>c₂ = ${formatDec(step.c2, data.decimals)}</strong> &nbsp;|&nbsp; <strong>c₁ = ${formatDec(step.c1, data.decimals)}</strong>
          </div>
        </div>

        <!-- 1.3 SISTEMA MATRICIAL 2x2 -->
        <div class="academic-section">
          <div class="academic-sub-header">
            <span class="academic-sub-num" style="color: #60a5fa;">1.3</span>
            <h4>Formar y resolver el sistema de ecuaciones para \\((\\Delta r,\\, \\Delta s)\\)</h4>
          </div>

          <div class="academic-system-box">
            <div style="font-size: 0.86rem; color: #94a3b8; margin-bottom: 8px;">
              El sistema lineal para calcular los incrementos está dado por la matriz Jacobiana \\(2\\times 2\\):
            </div>
            <div class="formula-callout" style="margin: 6px 0;">
              \\[
              \\begin{bmatrix} c_2 & c_3 \\\\[4pt] c_1 & c_2 \\end{bmatrix}
              \\begin{bmatrix} \\Delta r \\\\[4pt] \\Delta s \\end{bmatrix}
              =
              \\begin{bmatrix} -b_1 \\\\[4pt] -b_0 \\end{bmatrix}
              \\quad\\Longrightarrow\\quad
              \\begin{bmatrix} ${formatDec(c2, data.decimals)} & ${formatDec(c3, data.decimals)} \\\\[4pt] ${formatDec(c1, data.decimals)} & ${formatDec(c2, data.decimals)} \\end{bmatrix}
              \\begin{bmatrix} \\Delta r \\\\[4pt] \\Delta s \\end{bmatrix}
              =
              \\begin{bmatrix} ${formatDec(-b1, data.decimals)} \\\\[4pt] ${formatDec(-b0, data.decimals)} \\end{bmatrix}
              \\]
            </div>
          </div>
        </div>

        <!-- 1.4 DETERMINANTES (REGLA DE CRAMER CON NOTACIÓN DE LIBRO LATEX) -->
        <div class="academic-section">
          <div class="academic-sub-header">
            <span class="academic-sub-num" style="color: #34d399;">1.4</span>
            <h4>Resolver por el método de determinantes (Regla de Cramer)</h4>
          </div>

          <div class="academic-formulas-stack">
            <div class="math-frac-card det-main">
              <span class="math-label-title">1. Determinante Principal \\((\\Delta)\\):</span>
              <div>
                \\[
                \\Delta = \\begin{vmatrix} c_2 & c_3 \\\\ c_1 & c_2 \\end{vmatrix}
                = \\begin{vmatrix} ${formatDec(c2, data.decimals)} & ${formatDec(c3, data.decimals)} \\\\ ${formatDec(c1, data.decimals)} & ${formatDec(c2, data.decimals)} \\end{vmatrix}
                = (${formatDec(c2, data.decimals)})(${formatDec(c2, data.decimals)}) - (${formatDec(c3, data.decimals)})(${formatDec(c1, data.decimals)})
                = ${crossDet1} - (${crossDet2}) = \\boxed{\\mathbf{${formatDec(step.det, data.decimals)}}}
                \\]
              </div>
            </div>

            <div class="math-frac-card det-dr">
              <span class="math-label-title">2. Incremento \\(\\Delta r\\):</span>
              <div>
                \\[
                \\Delta r = \\frac{\\Delta_r}{\\Delta}
                = \\frac{\\begin{vmatrix} -b_1 & c_3 \\\\ -b_0 & c_2 \\end{vmatrix}}{\\Delta}
                = \\frac{\\begin{vmatrix} ${formatDec(-b1, data.decimals)} & ${formatDec(c3, data.decimals)} \\\\ ${formatDec(-b0, data.decimals)} & ${formatDec(c2, data.decimals)} \\end{vmatrix}}{${formatDec(step.det, data.decimals)}}
                = \\frac{(${formatDec(-b1, data.decimals)})(${formatDec(c2, data.decimals)}) - (${formatDec(c3, data.decimals)})(${formatDec(-b0, data.decimals)})}{${formatDec(step.det, data.decimals)}}
                = \\frac{${formatDec(step.numDr, data.decimals)}}{${formatDec(step.det, data.decimals)}}
                = \\boxed{\\mathbf{${formatDec(step.deltaR, data.decimals)}}}
                \\]
              </div>
            </div>

            <div class="math-frac-card det-ds">
              <span class="math-label-title">3. Incremento \\(\\Delta s\\):</span>
              <div>
                \\[
                \\Delta s = \\frac{\\Delta_s}{\\Delta}
                = \\frac{\\begin{vmatrix} c_2 & -b_1 \\\\ c_1 & -b_0 \\end{vmatrix}}{\\Delta}
                = \\frac{\\begin{vmatrix} ${formatDec(c2, data.decimals)} & ${formatDec(-b1, data.decimals)} \\\\ ${formatDec(c1, data.decimals)} & ${formatDec(-b0, data.decimals)} \\end{vmatrix}}{${formatDec(step.det, data.decimals)}}
                = \\frac{(${formatDec(c2, data.decimals)})(${formatDec(-b0, data.decimals)}) - (${formatDec(-b1, data.decimals)})(${formatDec(c1, data.decimals)})}{${formatDec(step.det, data.decimals)}}
                = \\frac{${formatDec(step.numDs, data.decimals)}}{${formatDec(step.det, data.decimals)}}
                = \\boxed{\\mathbf{${formatDec(step.deltaS, data.decimals)}}}
                \\]
              </div>
            </div>
          </div>
        </div>

        <!-- 1.5 ACTUALIZAR R Y S -->
        <div class="academic-section">
          <div class="academic-sub-header">
            <span class="academic-sub-num" style="color: #10b981;">1.5</span>
            <h4>Actualizar valores de \\(r\\) y \\(s\\)</h4>
          </div>

          <div class="academic-update-grid">
            <div class="academic-update-box r-box">
              <span class="update-box-tag">Actualización de Semilla \\(r\\)</span>
              <span class="update-box-math">\\( r_{\\text{nuevo}} = r + \\Delta r = ${formatDec(step.r_current, data.decimals)} + (${formatDec(step.deltaR, data.decimals)}) \\)</span>
              <span class="update-box-val">\\( r^{(${step.iteration})} = ${formatDec(step.newR, data.decimals)} \\)</span>
              <span style="font-size: 0.78rem; color: #94a3b8;">Error: <strong>\\(\\varepsilon_r = ${step.errRStr.replace('%', '\\%')}\\)</strong></span>
            </div>

            <div class="academic-update-box s-box">
              <span class="update-box-tag" style="color: #fbbf24;">Actualización de Semilla \\(s\\)</span>
              <span class="update-box-math">\\( s_{\\text{nuevo}} = s + \\Delta s = ${formatDec(step.s_current, data.decimals)} + (${formatDec(step.deltaS, data.decimals)}) \\)</span>
              <span class="update-box-val amber">\\( s^{(${step.iteration})} = ${formatDec(step.newS, data.decimals)} \\)</span>
              <span style="font-size: 0.78rem; color: #94a3b8;">Error: <strong>\\(\\varepsilon_s = ${step.errSStr.replace('%', '\\%')}\\)</strong></span>
            </div>
          </div>
        </div>

      </div>
    `;

    stepsContainer.appendChild(card);
  });

  // Table summary
  const table = document.getElementById('b-iterations-table');
  const tbody = table.querySelector('tbody');
  let trHtml = '';

  data.tableRows.forEach((row, rowIdx) => {
    const isFinal = (rowIdx === data.tableRows.length - 1);
    const isConverged = isFinal && data.converged;
    const trClass = isConverged ? 'row-converged' : '';
    
    trHtml += `
      <tr class="${trClass}" onclick="focusBairstowStep(${row.k})" title="Clic para inspeccionar el desglose detallado del Paso ${row.k}">
        <td class="col-iter-cell">
          <span class="iter-k-badge">${row.k}</span>
          ${isConverged ? '<span class="badge-converged-pill">&#10003; Convergido</span>' : ''}
        </td>
        <td>${row.r}</td>
        <td>${row.s}</td>
        <td style="color: ${Math.abs(parseFloat(row.b1)) < 1e-4 ? '#34d399' : '#f87171'};">${row.b1}</td>
        <td style="color: ${Math.abs(parseFloat(row.b0)) < 1e-4 ? '#34d399' : '#f87171'};">${row.b0}</td>
        <td>${row.deltaR}</td>
        <td>${row.deltaS}</td>
        <td>${row.errRStr}</td>
        <td>${row.errSStr}</td>
      </tr>
    `;
  });
  tbody.innerHTML = trHtml;

  // Actualizar insignia de precisión en el encabezado de la tabla
  const precBadge = document.getElementById('b-table-badge-precision');
  if (precBadge) {
    precBadge.textContent = `Precisión a ${data.decimals} decimales (0.${'x'.repeat(data.decimals)})`;
  }

  // 5. Renderizar Tarjeta de Conclusión y Resumen Global
  const conclusionContainer = document.getElementById('b-summary-conclusion');
  if (conclusionContainer) {
    conclusionContainer.style.display = 'flex';
    const rSign = (data.rFinal >= 0) ? '- ' : '+ ';
    const sSign = (data.sFinal >= 0) ? '- ' : '+ ';
    const statusBadge = data.converged
      ? '<span class="conclusion-badge">&#10003; Convergencia Exitosa</span>'
      : '<span class="conclusion-badge" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.12);">&#9888; Límite de Iteraciones</span>';
    const dotClass = data.converged ? 'success' : 'warning';

    conclusionContainer.innerHTML = `
      <div class="conclusion-header">
        <div class="conclusion-status">
          <span class="conclusion-dot ${dotClass}"></span>
          <h4>Conclusión y Resumen Global del Algoritmo</h4>
        </div>
        ${statusBadge}
      </div>

      <div class="conclusion-grid">
        <!-- Card 1: Factor Cuadrático Obtenido -->
        <div class="conclusion-item-card">
          <span class="item-card-label">Factor Cuadrático Obtenido</span>
          <span class="item-card-val factor-eq">x² ${rSign} ${formatDec(Math.abs(data.rFinal), data.decimals)}x ${sSign} ${formatDec(Math.abs(data.sFinal), data.decimals)} = 0</span>
          <span class="item-card-sub">Forma canónica reductora: x² &minus; rx &minus; s = 0</span>
        </div>

        <!-- Card 2: Parámetros Finales -->
        <div class="conclusion-item-card">
          <span class="item-card-label">Valores Finales Convergidos</span>
          <div class="item-card-params">
            <span><strong>r* =</strong> ${formatDec(data.rFinal, data.decimals)}</span>
            <span><strong>s* =</strong> ${formatDec(data.sFinal, data.decimals)}</span>
          </div>
          <span class="item-card-sub">Semillas finales con Jacobiano &asymp; 0</span>
        </div>

        <!-- Card 3: Criterio de Tolerancia -->
        <div class="conclusion-item-card">
          <span class="item-card-label">Tolerancia Alcanzada</span>
          <span class="item-card-val">&epsilon; &le; ${data.tolerance}</span>
          <span class="item-card-sub">${data.converged ? 'Criterio de parada satisfecho' : 'Aumentar iteraciones o cambiar semillas'}</span>
        </div>

        <!-- Card 4: Total de Iteraciones -->
        <div class="conclusion-item-card">
          <span class="item-card-label">Total de Iteraciones</span>
          <span class="item-card-val highlight-k">${data.finalIteration} ${data.finalIteration === 1 ? 'Paso ejecutado' : 'Pasos ejecutados'}</span>
          <span class="item-card-sub">Parada natural al cumplir tolerancia</span>
        </div>
      </div>
    `;
  }

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function focusBairstowStep(k) {
  const card = document.getElementById(`b-step-card-${k}`);
  if (card) {
    card.classList.add('open');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('step-card-highlighted');
    setTimeout(() => {
      card.classList.remove('step-card-highlighted');
    }, 2000);
  }
}

function toggleBairstowStepCard(headerEl) {
  const card = headerEl.closest('.step-card');
  if (card) card.classList.toggle('open');
}

function toggleAllBairstowSteps(expand) {
  document.querySelectorAll('#b-step-by-step-cards .step-card').forEach(card => {
    if (expand) card.classList.add('open');
    else card.classList.remove('open');
  });
}

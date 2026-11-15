/**
 * NEWTON-UI.JS
 * Interfaz de usuario para el Método de Newton para Sistemas de Ecuaciones No Lineales:
 * - Previsualización matemática interactiva del sistema F(x, y) = 0
 * - Carga interactiva de presets y catálogo de 6 sistemas no lineales
 * - Renderizado de tarjetas paso a paso con matrices Jacobianas y determinantes
 * - Tabla maestra de iteraciones vectoriales y control de precisión
 */

/**
 * Convierte una expresión escrita por el usuario (x^2 + y*sin(x), sqrt(x), e^(-x), pi...)
 * a LaTeX tipográfico para mostrarla con KaTeX.
 */
function newtonExprToTeX(expr) {
  if (!expr) return '';
  let s = String(expr).trim();
  const readGroup = (str, i) => {
    // Lee un grupo balanceado "(...)" o un token simple desde i; devuelve [contenido, siguienteIndice]
    if (str[i] === '(') {
      let depth = 0;
      for (let j = i; j < str.length; j++) {
        if (str[j] === '(') depth++;
        else if (str[j] === ')') { depth--; if (depth === 0) return [str.slice(i + 1, j), j + 1]; }
      }
      return [str.slice(i + 1), str.length];
    }
    const m = /^-?[A-Za-z0-9_.]+/.exec(str.slice(i));
    return m ? [m[0], i + m[0].length] : ['', i];
  };
  const convert = (str) => {
    let out = '';
    let i = 0;
    while (i < str.length) {
      const rest = str.slice(i);
      let m;
      if ((m = /^(sqrt)\s*\(/i.exec(rest))) {
        const [inner, next] = readGroup(str, i + m[0].length - 1);
        out += '\\sqrt{' + convert(inner) + '}';
        i = next;
      } else if ((m = /^(asin|acos|atan|sinh|cosh|tanh|sin|cos|tan|exp|abs|log|ln)\s*\(/i.exec(rest))) {
        const fn = m[1].toLowerCase();
        const [inner, next] = readGroup(str, i + m[0].length - 1);
        if (fn === 'abs') out += '\\left|' + convert(inner) + '\\right|';
        else if (fn === 'exp') out += 'e^{' + convert(inner) + '}';
        else {
          const name = { asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', log: '\\ln', ln: '\\ln' }[fn] || '\\' + fn;
          out += name + '\\left(' + convert(inner) + '\\right)';
        }
        i = next;
      } else if ((m = /^pi\b/i.exec(rest))) {
        out += '\\pi';
        i += m[0].length;
      } else if (str[i] === '^') {
        let j = i + 1;
        while (str[j] === ' ') j++;
        const [inner, next] = readGroup(str, j);
        out += '^{' + convert(inner) + '}';
        i = next;
      } else if (str[i] === '*') {
        out += ' \\cdot ';
        i++;
      } else if (str[i] === '(') {
        const [inner, next] = readGroup(str, i);
        out += '\\left(' + convert(inner) + '\\right)';
        i = next;
      } else {
        out += str[i];
        i++;
      }
    }
    return out;
  };
  return convert(s);
}

function updateNewtonFnPreview() {
  const f1Input = document.getElementById('n-f1');
  const f2Input = document.getElementById('n-f2');
  const preview = document.getElementById('n-fn-preview');
  if (!preview) return;

  const f1Str = f1Input ? f1Input.value.trim() : '';
  const f2Str = f2Input ? f2Input.value.trim() : '';

  let html = `
    <div class="newton-math-preview-row">
      <span class="preview-label" style="color: #22d3ee; font-weight: 700;">\\(f_1(x,y):\\)</span>
      <span class="preview-formula">${f1Str ? '\\(' + newtonExprToTeX(f1Str) + ' = 0\\)' : '<em>(ingresa \\(f_1(x,y)\\))</em>'}</span>
    </div>
    <div class="newton-math-preview-row" style="margin-top: 6px;">
      <span class="preview-label" style="color: #38bdf8; font-weight: 700;">\\(f_2(x,y):\\)</span>
      <span class="preview-formula">${f2Str ? '\\(' + newtonExprToTeX(f2Str) + ' = 0\\)' : '<em>(ingresa \\(f_2(x,y)\\))</em>'}</span>
    </div>
  `;

  preview.innerHTML = html;
}

function clearNewtonInputs() {
  const f1Input = document.getElementById('n-f1');
  const f2Input = document.getElementById('n-f2');
  const x0Input = document.getElementById('n-x0');
  const y0Input = document.getElementById('n-y0');

  const df1dx = document.getElementById('n-df1-dx');
  const df1dy = document.getElementById('n-df1-dy');
  const df2dx = document.getElementById('n-df2-dx');
  const df2dy = document.getElementById('n-df2-dy');

  if (f1Input) f1Input.value = '';
  if (f2Input) f2Input.value = '';
  if (x0Input) x0Input.value = '0';
  if (y0Input) y0Input.value = '0';

  if (df1dx) df1dx.value = '';
  if (df1dy) df1dy.value = '';
  if (df2dx) df2dx.value = '';
  if (df2dy) df2dy.value = '';

  const resCont = document.getElementById('n-results-container');
  if (resCont) resCont.style.display = 'none';

  const banner = document.getElementById('n-validation-banner');
  if (banner) banner.style.display = 'none';

  updateNewtonFnPreview();
}

function resetNewtonInputs() {
  loadPresetNewtonExample('nex1');
  const iterInput = document.getElementById('n-max-iterations');
  const tolInput = document.getElementById('n-tolerance');
  const errInput = document.getElementById('n-error-type');
  const decInput = document.getElementById('n-decimals-display');
  const exSel = document.getElementById('n-example-select');

  if (iterInput) iterInput.value = '30';
  if (tolInput) tolInput.value = '0.0001';
  if (errInput) errInput.value = 'relative';
  if (decInput) decInput.value = '6';
  if (exSel) exSel.value = 'nex1';
}

function loadPresetNewtonExample(exId) {
  if (!exId) return;
  const ex = NEWTON_EXAMPLES_DATA.find(e => e.id === exId);
  if (!ex) return;

  const f1Input = document.getElementById('n-f1');
  const f2Input = document.getElementById('n-f2');
  const x0Input = document.getElementById('n-x0');
  const y0Input = document.getElementById('n-y0');

  const df1dx = document.getElementById('n-df1-dx');
  const df1dy = document.getElementById('n-df1-dy');
  const df2dx = document.getElementById('n-df2-dx');
  const df2dy = document.getElementById('n-df2-dy');

  if (f1Input) f1Input.value = ex.f1Str;
  if (f2Input) f2Input.value = ex.f2Str;
  if (x0Input) x0Input.value = ex.x0;
  if (y0Input) y0Input.value = ex.y0;

  // Limpiar derivadas manuales al cargar preset para usar cálculo automático
  if (df1dx) df1dx.value = '';
  if (df1dy) df1dy.value = '';
  if (df2dx) df2dx.value = '';
  if (df2dy) df2dy.value = '';

  updateNewtonFnPreview();
}

function loadAndSwitchToNewtonExample(exId) {
  const sel = document.getElementById('n-example-select');
  if (sel) sel.value = exId;
  loadPresetNewtonExample(exId);
  switchNewtonTab('calc');
}

function renderNewtonExamplesCatalog() {
  const grid = document.getElementById('n-examples-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  NEWTON_EXAMPLES_DATA.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'example-card';

    card.innerHTML = `
      <div>
        <div class="example-badge" style="background: rgba(6, 182, 212, 0.16); color: #22d3ee; border-color: rgba(34, 211, 238, 0.35);">
          ${ex.category}
        </div>
        <h3 style="color: #f4f4f5; margin-top: 8px;">${ex.title}</h3>
        <p style="color: #a1a1aa; font-size: 0.88rem; margin: 8px 0 12px;">${ex.desc}</p>
        
        <div class="example-system-box" style="border-left-color: #06b6d4; padding: 12px 14px; background: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.93rem; color: #f8fafc;">
            <strong style="color: #22d3ee;">\\(f_1(x,y) =\\)</strong> \\(${newtonExprToTeX(ex.f1Str)} = 0\\)
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.93rem; color: #f8fafc; margin-top: 4px;">
            <strong style="color: #38bdf8;">\\(f_2(x,y) =\\)</strong> \\(${newtonExprToTeX(ex.f2Str)} = 0\\)
          </div>
          <div style="margin-top: 8px; font-size: 0.82rem; color: #94a3b8;">
            Semilla inicial: \\((x_0 = ${ex.x0},\\, y_0 = ${ex.y0})\\)
          </div>
        </div>

        <div style="margin-top: 10px; font-size: 0.85rem; color: #a7f3d0;">
          <strong>Solución esperada:</strong> ${ex.expectedRoot}
        </div>
        <div style="margin-top: 4px; font-size: 0.82rem; color: #cbd5e1;">
          <strong>Campo de aplicación:</strong> ${ex.applications}
        </div>
      </div>

      <button class="btn btn-primary btn-sm" style="margin-top: 16px; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); border-color: #06b6d4;" onclick="loadAndSwitchToNewtonExample('${ex.id}')">
        Cargar este Sistema en la Calculadora
      </button>
    `;
    grid.appendChild(card);
  });
}

function renderNewtonSystemResultsUI(data) {
  const container = document.getElementById('n-results-container');
  if (!container) return;
  container.style.display = 'block';

  const statusTitle = document.getElementById('n-res-status-title');
  const summaryDesc = document.getElementById('n-res-summary-desc');

  if (data.converged) {
    statusTitle.textContent = `Convergencia Exitosa en ${data.finalIteration} Iteraciones`;
    statusTitle.style.color = '#34d399';
    summaryDesc.innerHTML = `El vector solución cumplió el criterio de parada \\(\\varepsilon \\le ${data.tolerance}\\) con precisión visual de ${data.decimals} decimales.`;
  } else {
    statusTitle.textContent = `Límite de ${data.finalIteration} Iteraciones Alcanzado`;
    statusTitle.style.color = '#fbbf24';
    summaryDesc.innerHTML = `Se completaron las ${data.finalIteration} iteraciones fijadas sin alcanzar la tolerancia deseada. Puedes incrementar las iteraciones o elegir semillas \\((x_0, y_0)\\) más cercanas al punto de intersección.`;
  }

  // Highlight Box
  const rootXDisplay = document.getElementById('n-res-root-x');
  const rootYDisplay = document.getElementById('n-res-root-y');
  const f1Display = document.getElementById('n-res-f1-val');
  const f2Display = document.getElementById('n-res-f2-val');
  const iterDisplay = document.getElementById('n-res-iter-count');

  if (rootXDisplay) rootXDisplay.textContent = formatDec(data.rootX, data.decimals);
  if (rootYDisplay) rootYDisplay.textContent = formatDec(data.rootY, data.decimals);
  if (f1Display) f1Display.textContent = formatDec(data.finalResF1, data.decimals);
  if (f2Display) f2Display.textContent = formatDec(data.finalResF2, data.decimals);
  if (iterDisplay) iterDisplay.textContent = `${data.finalIteration} iteraciones`;

  // Step-by-step accordion cards
  const stepsContainer = document.getElementById('n-step-by-step-cards');
  if (stepsContainer) {
    stepsContainer.innerHTML = '';

    data.iterationSteps.forEach((step, idx) => {
      const card = document.createElement('div');
      card.className = `step-card ${idx === 0 ? 'open' : ''}`;

      const d = (v) => formatDec(v, data.decimals);
      const dE = (v) => formatDec(v, Math.min(data.decimals, 4));
      const km1 = step.iteration - 1;
      const k1 = step.iteration;
      const numDx = (-step.f1Val * step.j22) - (-step.f2Val * step.j12);
      const numDy = (step.j11 * -step.f2Val) - (step.j21 * -step.f1Val);
      const errPct = step.errStr;
      const errTex = errPct.replace('%', '\\%');

      card.innerHTML = `
        <div class="step-card-header" onclick="toggleNewtonStepCard(this)">
          <div class="step-header-left">
            <span class="step-num-badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border-color: rgba(34, 211, 238, 0.4);">
              Iteración ${step.iteration}
            </span>
            <div class="step-summary-text">
              \\((x_{${km1}},\\, y_{${km1}}) = \\mathbf{(${d(step.x_current)},\\, ${d(step.y_current)})}\\)
              &nbsp;\\(\\rightarrow\\)&nbsp;
              \\((x_{${k1}},\\, y_{${k1}}) = \\mathbf{(${d(step.x_next)},\\, ${d(step.y_next)})}\\)
            </div>
          </div>
          <div class="step-header-right">
            <span class="step-error-pill">\\(\\varepsilon_{\\max} = ${errTex}\\)</span>
            <span class="step-toggle-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </div>
        </div>

        <div class="step-card-body">
          <!-- 1. Evaluación de funciones -->
          <div class="calc-item" style="border-left-color: #06b6d4;">
            <div class="calc-formula-title" style="color: #22d3ee;">
              1. Evaluación de las funciones \\(F(x,y)\\) en el punto actual \\((x_{${km1}},\\, y_{${km1}})\\):
            </div>
            <div style="margin-top: 6px; color: #f1f5f9; display: flex; flex-direction: column; gap: 4px;">
              <div>\\(f_1(${d(step.x_current)},\\, ${d(step.y_current)}) = \\mathbf{${d(step.f1Val)}}\\)</div>
              <div>\\(f_2(${d(step.x_current)},\\, ${d(step.y_current)}) = \\mathbf{${d(step.f2Val)}}\\)</div>
              <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 4px;">
                Vector de residuos negativos:
                \\(-F = \\begin{bmatrix} -(${d(step.f1Val)}) \\\\ -(${d(step.f2Val)}) \\end{bmatrix} = \\begin{bmatrix} ${d(-step.f1Val)} \\\\ ${d(-step.f2Val)} \\end{bmatrix}\\)
              </div>
            </div>
          </div>

          <!-- 2. Matriz Jacobiana -->
          <div class="calc-item" style="margin-top: 14px; border-left-color: #0ea5e9;">
            <div class="calc-formula-title" style="color: #38bdf8;">
              2. Matriz Jacobiana \\(J(x,y)\\) y cálculo del determinante:
            </div>
            <div style="margin-top: 6px; color: #f1f5f9;">
              <div style="margin-bottom: 6px; font-size: 0.85rem; color: #94a3b8;">
                Fórmula: \\(J(x,y) = \\begin{bmatrix} \\dfrac{\\partial f_1}{\\partial x} & \\dfrac{\\partial f_1}{\\partial y} \\\\[6pt] \\dfrac{\\partial f_2}{\\partial x} & \\dfrac{\\partial f_2}{\\partial y} \\end{bmatrix}\\)
              </div>
              <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 6px;">
                <div style="padding: 10px 14px; background: rgba(0,0,0,0.4); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 6px;">
                  <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">Valores evaluados en \\((x_{${km1}},\\, y_{${km1}})\\):</div>
                  <div>\\[J = \\begin{bmatrix} ${d(step.j11)} & ${d(step.j12)} \\\\ ${d(step.j21)} & ${d(step.j22)} \\end{bmatrix}\\]</div>
                </div>

                <div style="padding: 10px 14px; background: rgba(0,0,0,0.4); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 6px;">
                  <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">Determinante: \\(\\det(J) = J_{11} J_{22} - J_{12} J_{21}\\)</div>
                  <div>\\(\\det(J) = \\begin{vmatrix} ${d(step.j11)} & ${d(step.j12)} \\\\ ${d(step.j21)} & ${d(step.j22)} \\end{vmatrix} = (${d(step.j11)})(${d(step.j22)}) - (${d(step.j12)})(${d(step.j21)})\\)</div>
                  <div style="color: #38bdf8; font-weight: 700; margin-top: 4px;">\\(\\det(J) = ${d(step.detJ)}\\) &nbsp;<span style="color: #34d399; font-size: 0.8rem;">(\\(\\neq 0\\), sistema compatible determinado)</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Solución del Sistema Lineal de Incrementos -->
          <div class="calc-item" style="margin-top: 14px; border-left-color: #6366f1;">
            <div class="calc-formula-title" style="color: #818cf8;">
              3. Sistema lineal matricial de Newton y regla de Cramer:
            </div>
            <div style="margin-top: 6px; color: #cbd5e1;">
              <div>Ecuación matricial: \\(J(x_k, y_k)\\begin{bmatrix} \\Delta x \\\\ \\Delta y \\end{bmatrix} = -F(x_k, y_k)\\)</div>
              <div style="margin-top: 6px; padding: 10px 14px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                \\[\\begin{bmatrix} ${d(step.j11)} & ${d(step.j12)} \\\\ ${d(step.j21)} & ${d(step.j22)} \\end{bmatrix} \\begin{bmatrix} \\Delta x \\\\ \\Delta y \\end{bmatrix} = \\begin{bmatrix} ${d(-step.f1Val)} \\\\ ${d(-step.f2Val)} \\end{bmatrix}\\]
              </div>

              <div style="margin-top: 8px; padding: 10px 14px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                <div>\\[\\Delta x = \\frac{\\begin{vmatrix} ${d(-step.f1Val)} & ${d(step.j12)} \\\\ ${d(-step.f2Val)} & ${d(step.j22)} \\end{vmatrix}}{\\det(J)} = \\frac{(${d(-step.f1Val)})(${d(step.j22)}) - (${d(step.j12)})(${d(-step.f2Val)})}{${d(step.detJ)}} = \\frac{${d(numDx)}}{${d(step.detJ)}} = \\mathbf{${d(step.deltaX)}}\\]</div>
                <div>\\[\\Delta y = \\frac{\\begin{vmatrix} ${d(step.j11)} & ${d(-step.f1Val)} \\\\ ${d(step.j21)} & ${d(-step.f2Val)} \\end{vmatrix}}{\\det(J)} = \\frac{(${d(step.j11)})(${d(-step.f2Val)}) - (${d(-step.f1Val)})(${d(step.j21)})}{${d(step.detJ)}} = \\frac{${d(numDy)}}{${d(step.detJ)}} = \\mathbf{${d(step.deltaY)}}\\]</div>
              </div>

              <!-- 4. Actualización del Vector Solución -->
              <div style="margin-top: 10px; color: #a7f3d0; padding: 8px 12px; background: rgba(16, 185, 129, 0.08); border-radius: 4px;">
                <div>\\(x_{${k1}} = x_{${km1}} + \\Delta x = ${d(step.x_current)} + (${d(step.deltaX)}) = \\mathbf{${d(step.x_next)}}\\)</div>
                <div>\\(y_{${k1}} = y_{${km1}} + \\Delta y = ${d(step.y_current)} + (${d(step.deltaY)}) = \\mathbf{${d(step.y_next)}}\\)</div>
              </div>

              <div style="margin-top: 10px;">
                <span class="calc-result-tag" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.4);">
                  Nuevo vector: \\((x_{${k1}},\\, y_{${k1}}) = (${d(step.x_next)},\\, ${d(step.y_next)})\\)
                </span>
                <span class="calc-error-tag" style="margin-left: 8px;">
                  \\(\\varepsilon_x = ${dE(step.errX)}\\%\\) | \\(\\varepsilon_y = ${dE(step.errY)}\\%\\) &bull; \\(\\varepsilon_{\\max} = ${errTex}\\)
                </span>
              </div>

              <!-- Botón interactivo de desglose aritmético completo -->
              <button class="btn btn-sm" style="margin: 10px 0 4px; background: transparent; border: 1px solid #06b6d4; color: #22d3ee; padding: 4px 8px; border-radius: 4px; cursor: pointer; display: block;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">Ver desglose aritmético y fórmulas internas</button>
              <div style="display: none; padding: 10px; background: rgba(0,0,0,0.35); border-left: 3px solid #06b6d4; border-radius: 4px; margin-top: 6px; font-size: 0.85rem; color: #e2e8f0;">
                <div>&bull; \\(-f_1 = -(${d(step.f1Val)}) = ${d(-step.f1Val)}\\)</div>
                <div>&bull; \\(-f_2 = -(${d(step.f2Val)}) = ${d(-step.f2Val)}\\)</div>
                <div>&bull; Numerador \\(\\Delta x\\): \\((${d(-step.f1Val)})(${d(step.j22)}) - (${d(-step.f2Val)})(${d(step.j12)}) = ${d(numDx)}\\)</div>
                <div>&bull; Numerador \\(\\Delta y\\): \\((${d(step.j11)})(${d(-step.f2Val)}) - (${d(step.j21)})(${d(-step.f1Val)}) = ${d(numDy)}\\)</div>
                <div>&bull; Cociente \\(\\Delta x\\): \\(\\dfrac{${d(numDx)}}{${d(step.detJ)}} = ${d(step.deltaX)}\\)</div>
                <div>&bull; Cociente \\(\\Delta y\\): \\(\\dfrac{${d(numDy)}}{${d(step.detJ)}} = ${d(step.deltaY)}\\)</div>
                <div>&bull; Error porcentual \\(x\\): \\(\\left|\\dfrac{${d(step.deltaX)}}{${d(step.x_next)}}\\right| \\times 100\\% = ${dE(step.errX)}\\%\\)</div>
                <div>&bull; Error porcentual \\(y\\): \\(\\left|\\dfrac{${d(step.deltaY)}}{${d(step.y_next)}}\\right| \\times 100\\% = ${dE(step.errY)}\\%\\)</div>
                <div>&bull; Criterio de parada: \\(\\varepsilon_{\\max} = ${errTex}\\) ${step.maxErr <= data.tolerance ? '(\\(\\le\\) tolerancia &bull; Convergió)' : '(\\(>\\) tolerancia &bull; Continúa siguiente iteración)'}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      stepsContainer.appendChild(card);
    });
  }

  // Master table summary
  const table = document.getElementById('n-iterations-table');
  if (table) {
    const tbody = table.querySelector('tbody');
    let trHtml = '';
    data.tableRows.forEach(row => {
      trHtml += `
        <tr>
          <td><strong>${row.k}</strong></td>
          <td>${row.x}</td>
          <td>${row.y}</td>
          <td>${row.f1}</td>
          <td>${row.f2}</td>
          <td>${row.detJ}</td>
          <td>${row.deltaX}</td>
          <td>${row.deltaY}</td>
          <td>${row.xNext}</td>
          <td>${row.yNext}</td>
          <td><span class="table-error-pill">${row.errStr}</span></td>
        </tr>
      `;
    });
    tbody.innerHTML = trHtml;
  }

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleNewtonStepCard(headerEl) {
  const card = headerEl.closest('.step-card');
  if (card) card.classList.toggle('open');
}

function toggleAllNewtonSteps(expand) {
  document.querySelectorAll('#n-step-by-step-cards .step-card').forEach(card => {
    if (expand) card.classList.add('open');
    else card.classList.remove('open');
  });
}

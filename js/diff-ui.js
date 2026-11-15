/**
 * DIFF-UI.JS
 * Interfaz interactiva y generación paso a paso con tipografía LaTeX (KaTeX)
 * para el Módulo 4: DIFERENCIACIÓN NUMÉRICA
 *   - Fórmula de diferencia (Progresiva y Regresiva)
 *   - Fórmula de 3 puntos (Punto medio y Extremos)
 *   - Fórmula de 5 puntos (Punto medio y Extremos)
 */

let currentDiffFamily = 'diff2';
let currentDiffMode = 'func';

function initDiffModule() {
  renderDiffStaticSections();
  selectDiffFamily('diff2', 'both');
  loadPresetDiffExample('dex1');
}

function switchDiffTab(tabKey) {
  NM.switchTabs('d', ['calc', 'what', 'when', 'steps', 'examples', 'guide'], tabKey);
}

function selectDiffFamily(familyId, presetVariant) {
  currentDiffFamily = familyId;
  ['diff2', 'diff3', 'diff5'].forEach(f => {
    const btn = document.getElementById(`d-sub-btn-${f}`);
    if (btn) btn.classList.toggle('active', f === familyId);
  });

  const fam = DIFF_FAMILIES[familyId] || DIFF_FAMILIES.diff2;
  const sel = document.getElementById('d-variant');
  if (sel) {
    sel.innerHTML = fam.variants.map(v => `<option value="${v.id}">${v.label}</option>`).join('');
    if (presetVariant && fam.variants.some(v => v.id === presetVariant)) {
      sel.value = presetVariant;
    }
  }
  updateDiffMonitorAndPreview();
}

function setDiffInputMode(mode) {
  currentDiffMode = mode === 'table' ? 'table' : 'func';
  const btnFunc = document.getElementById('d-mode-func');
  const btnTab = document.getElementById('d-mode-table');
  const boxFunc = document.getElementById('d-func-inputs');
  const boxTab = document.getElementById('d-table-inputs');
  const hWrap = document.getElementById('d-h-group');

  if (btnFunc) btnFunc.classList.toggle('active', currentDiffMode === 'func');
  if (btnTab) btnTab.classList.toggle('active', currentDiffMode === 'table');
  if (boxFunc) boxFunc.style.display = currentDiffMode === 'func' ? 'block' : 'none';
  if (boxTab) boxTab.style.display = currentDiffMode === 'table' ? 'block' : 'none';
  if (hWrap) hWrap.style.opacity = currentDiffMode === 'table' ? '0.55' : '1';
  updateDiffMonitorAndPreview();
}

function updateDiffMonitorAndPreview() {
  const variant = NM.val('d-variant') || 'forward';
  const stId = (currentDiffFamily === 'diff2' && variant === 'both')
    ? 'forward'
    : diffStencilId(currentDiffFamily, variant);
  const st = DIFF_STENCILS[stId] || DIFF_STENCILS.forward;

  const monCat = document.getElementById('d-monitor-cat');
  const monBadge = document.getElementById('d-monitor-badge');
  const monFormula = document.getElementById('d-monitor-formula');
  const monText = document.getElementById('d-monitor-text');
  const indOrder = document.getElementById('d-ind-order');
  const indPts = document.getElementById('d-ind-pts');
  const indErr = document.getElementById('d-ind-err');

  if (monCat) monCat.textContent = DIFF_FAMILIES[currentDiffFamily].title;
  if (monBadge) monBadge.innerHTML = `Orden \\(${st.orderTex}\\) &bull; ${st.pointsTex} puntos`;

  if (monFormula) {
    if (currentDiffFamily === 'diff2' && variant === 'both') {
      monFormula.innerHTML = TXD(
        String.raw`f'(x_0)\approx \frac{f(x_0+h)-f(x_0)}{h} \quad\text{(Progresiva)}\qquad\text{y}\qquad f'(x_0)\approx \frac{f(x_0)-f(x_0-h)}{h} \quad\text{(Regresiva)}`
      );
    } else {
      monFormula.innerHTML = TXD(`${st.formulaTex}, \\qquad E_T = ${st.errorTex}`);
    }
  }

  if (monText) {
    const methodInfo = DIFF_THEORY_METHODS.find(m =>
      (currentDiffFamily === 'diff2' && m.id === (variant === 'backward' ? 'backward' : 'forward')) ||
      (currentDiffFamily === 'diff3' && m.id === 'three') ||
      (currentDiffFamily === 'diff5' && m.id === 'five')
    );
    monText.innerHTML = methodInfo ? methodInfo.what : '';
  }
  if (indOrder) indOrder.innerHTML = TX(st.orderTex);
  if (indPts) indPts.innerHTML = `${st.pointsTex} nodos`;
  if (indErr) indErr.innerHTML = TX(st.errorTex);

  // Vista previa en vivo de f(x) y del planteamiento en x0
  const prevBox = document.getElementById('d-fn-preview');
  if (!prevBox) return;

  const x0Raw = NM.val('d-x0') || 'x_0';
  const hRaw = NM.val('d-h') || 'h';

  if (currentDiffMode === 'table') {
    prevBox.innerHTML = TXD(String.raw`\left.\frac{df}{dx}\right|_{x = ${x0Raw}} \quad\text{a partir de tabla discreta }(x_i,\,f(x_i))`);
    return;
  }

  const exprStr = NM.val('d-expr');
  const exactStr = NM.val('d-exact');
  const compiled = ExprParser.compile(exprStr);
  if (!compiled.ok) {
    prevBox.innerHTML = `<span style="color:#f87171;">${compiled.error}</span>`;
    return;
  }
  let exactLine = '';
  if (exactStr) {
    const exComp = ExprParser.compile(exactStr);
    if (exComp.ok) {
      exactLine = String.raw`\\[4pt] f'(x) = ${exComp.latex}`;
    }
  }
  prevBox.innerHTML = TXD(
    String.raw`f(x) = ${compiled.latex},\qquad \left.\frac{df}{dx}\right|_{x=${x0Raw}} \text{ con paso } h = ${hRaw}${exactLine}`
  );
}

function loadPresetDiffExample(exId) {
  const ex = DIFF_EXAMPLES.find(e => e.id === exId);
  if (!ex) return;
  const sel = document.getElementById('d-example-select');
  if (sel) sel.value = ex.id;

  selectDiffFamily(ex.family, ex.variant);
  setDiffInputMode(ex.mode);

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v !== undefined ? v : ''; };
  if (ex.mode === 'func') setVal('d-expr', ex.expr);
  if (ex.tableText) setVal('d-table-text', ex.tableText);
  setVal('d-exact', ex.exactExpr || '');
  setVal('d-x0', ex.x0);
  setVal('d-h', ex.h);

  updateDiffMonitorAndPreview();
  solveDifferentiation();
}

function loadAndSwitchToDiffExample(exId) {
  switchDiffTab('calc');
  loadPresetDiffExample(exId);
}

function resetDiffInputs() {
  loadPresetDiffExample('dex1');
}

function clearDiffInputs() {
  ['d-expr', 'd-exact', 'd-table-text'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const res = document.getElementById('d-results-container');
  if (res) res.style.display = 'none';
  NM.banner('d-validation-banner', 'info', '');
  updateDiffMonitorAndPreview();
}

/** Construye las tarjetas paso a paso en LaTeX para un resultado de diferenciación. */
function buildDiffStepCards(res, dec, prefixLabel = '') {
  const st = res.stencil;
  const x0Tex = NM.tex(res.x0, dec);
  const hTex = NM.short(res.h);
  const pfx = prefixLabel ? `${prefixLabel} — ` : '';

  // Paso 1: Planteamiento y nodos x_k = x_0 + k*h
  const nodesLines = res.nodes.map((nd, idx) => {
    const sk = st.s * nd.k;
    const shiftStr = sk === 0
      ? `x_0 = ${x0Tex}`
      : (sk > 0
        ? `x_0 + ${sk === 1 ? '' : sk}h = ${x0Tex} + ${sk === 1 ? '' : sk + '\\cdot '}${hTex} = ${NM.tex(nd.x, dec)}`
        : `x_0 - ${Math.abs(sk) === 1 ? '' : Math.abs(sk)}h = ${x0Tex} - ${Math.abs(sk) === 1 ? '' : Math.abs(sk) + '\\cdot '}${hTex} = ${NM.tex(nd.x, dec)}`);
    return `x_{${idx}} &= ${shiftStr}`;
  }).join(' \\\\[4pt] ');

  const step1Body = NM.block(
    'Fórmula general y término de error de truncamiento',
    TXD(`${st.formulaTex}, \\qquad E_T = ${st.errorTex}`)
  ) + NM.block(
    `Generación de los ${res.nodes.length} nodos equiespaciados alrededor de \\(x_0 = ${x0Tex}\\) con paso \\(h = ${hTex}\\)`,
    TXD(`\\begin{aligned} ${nodesLines} \\end{aligned}`)
  );

  // Paso 2: Evaluación de f(x) en cada nodo y producto por su coeficiente
  const evalLines = res.nodes.map(nd => {
    const xStr = NM.tex(nd.x, dec);
    const fStr = NM.tex(nd.f, dec);
    if (res.compiled) {
      return `f(${xStr}) &= ${res.compiled.latexAt(xStr)} = \\mathbf{${fStr}}`;
    }
    return `f(${xStr}) &= \\mathbf{${fStr}} \\quad\\text{(leído de la tabla)}`;
  }).join(' \\\\[6pt] ');

  const tblRows = res.nodes.map((nd, idx) => {
    const sk = st.s * nd.k;
    const label = sk === 0 ? 'x_0' : (sk > 0 ? `x_0+${sk === 1 ? '' : sk}h` : `x_0-${Math.abs(sk) === 1 ? '' : Math.abs(sk)}h`);
    return [
      TX(label),
      TX(NM.tex(nd.x, dec)),
      TX(NM.tex(nd.f, dec)),
      TX(String(nd.c)),
      `<strong>${TX(NM.tex(nd.term, dec))}</strong>`
    ];
  });

  const step2Body = NM.block(
    'Sustitución de cada abscisa en la función \\(f(x)\\)',
    TXD(`\\begin{aligned} ${evalLines} \\end{aligned}`)
  ) + NM.block(
    'Tabla de coeficientes de Lagrange y productos parciales \\(c_k\\,f(x_k)\\)',
    NM.table(['Nodo', '\\(x_k\\)', '\\(f(x_k)\\)', 'Coeficiente \\(c_k\\)', 'Producto \\(c_k\\,f(x_k)\\)'], tblRows)
  );

  // Paso 3: Sustitución completa en el cociente incremental
  const symbolicTerms = res.nodes.map(nd => {
    const c = nd.c;
    const sign = c >= 0 ? '+' : '-';
    const absC = Math.abs(c);
    const coefPart = absC === 1 ? '' : `${absC}\\,`;
    return `${sign} ${coefPart}f(${NM.tex(nd.x, dec)})`;
  }).join(' ').replace(/^\+\s*/, '');

  const numericTerms = res.nodes.map(nd => {
    const c = nd.c;
    const sign = c >= 0 ? '+' : '-';
    const absC = Math.abs(c);
    const coefPart = absC === 1 ? '' : `${absC}\\cdot `;
    return `${sign} ${coefPart}${NM.texP(nd.f, dec)}`;
  }).join(' ').replace(/^\+\s*/, '');

  const denSymbolic = st.den === 1 ? hTex : `${st.den}\\cdot ${hTex}`;
  const numerStr = NM.tex(res.numer, dec);
  const divStr = NM.tex(res.divisor, dec);
  const approxStr = NM.tex(res.approx, dec);

  const step3Body = NM.block(
    'Desarrollo algebraico y aritmético de la fórmula',
    TXD(String.raw`\begin{aligned}
f'(${x0Tex}) &\approx \frac{${symbolicTerms}}{${denSymbolic}} \\[8pt]
&= \frac{${numericTerms}}{${divStr}} \\[8pt]
&= \frac{${numerStr}}{${divStr}} = \boxed{\mathbf{${approxStr}}}
\end{aligned}`)
  );

  // Paso 4: Análisis de error
  let step4Body = '';
  if (res.exact !== null) {
    const exStr = NM.tex(res.exact, dec);
    const errAbsStr = NM.texErr(res.absError, dec);
    const errRelStr = res.relError !== null ? `${NM.fmt(res.relError, 4)}\\%` : '—';
    const exFormula = res.exactCompiled
      ? `f'(${x0Tex}) = ${res.exactCompiled.latexAt(x0Tex)} = ${exStr}`
      : `f'(${x0Tex})_{\\text{ref}} = ${exStr}`;
    step4Body = NM.block(
      `${res.exactKind} y cálculo de errores`,
      TXD(String.raw`\begin{aligned}
${exFormula} \\[6pt]
E_{\text{abs}} &= \left|f'_{\text{exacta}}(x_0) - f'_{\text{aprox}}(x_0)\right| = \left|${exStr} - ${approxStr}\right| = \mathbf{${errAbsStr}} \\[6pt]
\varepsilon_r &= \frac{E_{\text{abs}}}{\left|f'_{\text{exacta}}(x_0)\right|}\times 100\% = \mathbf{${errRelStr}}
\end{aligned}`)
    );
  }

  const cards = [
    NM.card({ badge: `${pfx}PASO 1`, title: `Fórmula de ${st.name} y nodos \\(x_k\\)`, metric: TX(`h = ${hTex}`), body: step1Body, open: true }),
    NM.card({ badge: `${pfx}PASO 2`, title: 'Evaluación de \\(f(x_k)\\) y productos por coeficientes', metric: `${res.nodes.length} evaluaciones`, body: step2Body, open: true }),
    NM.card({ badge: `${pfx}PASO 3`, title: 'Sustitución numérica en la fracción y resultado', metric: TX(`f'(${x0Tex}) \\approx ${approxStr}`), body: step3Body, open: true })
  ];
  if (step4Body) {
    cards.push(NM.card({ badge: `${pfx}PASO 4`, title: 'Comparación con el valor exacto y cota de error', metric: TX(`E_{\\text{abs}} = ${NM.texErr(res.absError, dec)}`), body: step4Body, open: true }));
  }
  return cards.join('');
}

function solveDifferentiation() {
  NM.banner('d-validation-banner', 'info', '');
  const dec = parseInt(NM.val('d-decimals') || '6', 10);
  const variant = NM.val('d-variant') || 'forward';

  try {
    const x0 = NM.num('d-x0', 'Punto x₀');
    const h = currentDiffMode === 'func' ? NM.num('d-h', 'Paso h') : 0.1;
    const expr = NM.val('d-expr');
    const tableText = NM.val('d-table-text');
    const exactExpr = NM.val('d-exact');

    const cont = document.getElementById('d-results-container');
    const stepsBox = document.getElementById('d-step-by-step-cards');
    const convPanel = document.getElementById('d-convergence-panel');
    const convBody = document.getElementById('d-convergence-tbody');

    if (currentDiffFamily === 'diff2' && variant === 'both') {
      // Calcula tanto progresiva como regresiva y las compara con la centrada de 3 puntos
      const resFwd = computeDifferentiation({ mode: currentDiffMode, expr, tableText, x0, h, stencilId: 'forward', exactExpr });
      const resBwd = computeDifferentiation({ mode: currentDiffMode, expr, tableText, x0, h, stencilId: 'backward', exactExpr });
      const avg = 0.5 * (resFwd.approx + resBwd.approx);

      if (cont) cont.style.display = 'block';
      document.getElementById('d-res-method-badge').textContent = 'Diferencia Progresiva y Regresiva (Comparativa)';
      document.getElementById('d-res-status-title').innerHTML = `Derivada aproximada en \\(x_0 = ${NM.tex(x0, dec)}\\) con \\(h = ${NM.short(resFwd.h)}\\)`;
      document.getElementById('d-res-summary-desc').innerHTML =
        `Progresiva: \\(${NM.tex(resFwd.approx, dec)}\\) &bull; Regresiva: \\(${NM.tex(resBwd.approx, dec)}\\) &bull; Promedio centrado \\(O(h^2)\\): \\(\\mathbf{${NM.tex(avg, dec)}}\\)`;

      document.getElementById('d-res-approx').innerHTML = TX(
        String.raw`\begin{aligned}
f'_{\text{prog}}(${NM.tex(x0, dec)}) &\approx ${NM.tex(resFwd.approx, dec)} \\
f'_{\text{reg}}(${NM.tex(x0, dec)}) &\approx ${NM.tex(resBwd.approx, dec)}
\end{aligned}`
      );
      document.getElementById('d-res-exact').innerHTML = resFwd.exact !== null
        ? TX(`f'(${NM.tex(x0, dec)}) = ${NM.tex(resFwd.exact, dec)}`)
        : '—';
      document.getElementById('d-res-error').innerHTML = resFwd.exact !== null
        ? TX(String.raw`E_{\text{prog}} = ${NM.texErr(resFwd.absError, dec)}, \quad E_{\text{reg}} = ${NM.texErr(resBwd.absError, dec)}`)
        : '—';

      const avgCard = NM.card({
        badge: 'RELACIÓN CON 3 PUNTOS',
        title: 'Promedio de diferencia progresiva y regresiva (fórmula centrada de 3 puntos)',
        metric: TX(`\\approx ${NM.tex(avg, dec)}`),
        open: true,
        body: NM.block(
          'Cancelación de los términos de primer orden \\(\\pm \\tfrac{h}{2}f\'\'(x_0)\\)',
          TXD(String.raw`\frac{f'_{\text{prog}}(x_0) + f'_{\text{reg}}(x_0)}{2} = \frac{1}{2}\left[\frac{f(x_0+h)-f(x_0)}{h} + \frac{f(x_0)-f(x_0-h)}{h}\right] = \frac{f(x_0+h)-f(x_0-h)}{2h} = \frac{${NM.tex(resFwd.approx, dec)} + ${NM.tex(resBwd.approx, dec)}}{2} = \boxed{\mathbf{${NM.tex(avg, dec)}}}`)
        )
      });

      if (stepsBox) {
        stepsBox.innerHTML =
          buildDiffStepCards(resFwd, dec, 'PROGRESIVA') +
          buildDiffStepCards(resBwd, dec, 'REGRESIVA') +
          avgCard;
      }
      renderDiffConvergenceTable(resFwd, dec, convPanel, convBody);
      return;
    }

    const stId = diffStencilId(currentDiffFamily, variant);
    const res = computeDifferentiation({ mode: currentDiffMode, expr, tableText, x0, h, stencilId: stId, exactExpr });

    if (cont) cont.style.display = 'block';
    document.getElementById('d-res-method-badge').textContent = res.stencil.name;
    document.getElementById('d-res-status-title').innerHTML = `Derivada aproximada en \\(x_0 = ${NM.tex(res.x0, dec)}\\) con paso \\(h = ${NM.short(res.h)}\\)`;
    document.getElementById('d-res-summary-desc').innerHTML =
      `Fórmula de orden \\(${res.stencil.orderTex}\\) evaluada en ${res.nodes.length} puntos equiespaciados.`;

    document.getElementById('d-res-approx').innerHTML = TX(`f'(${NM.tex(res.x0, dec)}) \\approx ${NM.tex(res.approx, dec)}`);
    document.getElementById('d-res-exact').innerHTML = res.exact !== null
      ? TX(`f'(${NM.tex(res.x0, dec)}) = ${NM.tex(res.exact, dec)}`)
      : '—';
    document.getElementById('d-res-error').innerHTML = res.exact !== null
      ? TX(`E_{\\text{abs}} = ${NM.texErr(res.absError, dec)} \\; (${NM.fmt(res.relError, 4)}\\%)`)
      : '—';

    if (stepsBox) stepsBox.innerHTML = buildDiffStepCards(res, dec);
    renderDiffConvergenceTable(res, dec, convPanel, convBody);
  } catch (err) {
    NM.banner('d-validation-banner', 'danger', `<strong>Error de validación:</strong>&nbsp; ${err.message}`);
  }
}

function renderDiffConvergenceTable(res, dec, panel, tbody) {
  if (!panel || !tbody) return;
  if (!res.convergence || res.convergence.length === 0) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = 'block';
  const expectedRatio = Math.pow(2, res.stencil.order);
  tbody.innerHTML = res.convergence.map((row, i) => `
    <tr>
      <td>\\(h/${Math.pow(2, i)} = ${NM.short(row.h)}\\)</td>
      <td><strong>\\(${NM.tex(row.approx, dec)}\\)</strong></td>
      <td>${row.err !== null ? TX(NM.texErr(row.err, dec)) : '—'}</td>
      <td>${row.ratio !== null ? `${TX(row.ratio.toFixed(2))}&nbsp;<span style="color:#a1a1aa;font-size:0.78rem;">(teórico \\(\\approx ${expectedRatio}\\))</span>` : '—'}</td>
    </tr>
  `).join('');
}

function renderDiffStaticSections() {
  // ¿Qué es?
  const whatBox = document.getElementById('d-theory-what-content');
  if (whatBox) {
    const methodsHtml = DIFF_THEORY_METHODS.map(m => `
      <div class="calc-item" style="border-left-color:${m.color}; margin-bottom:16px;">
        <div class="calc-formula-title" style="color:${m.color}; font-size:1rem;">${m.title}</div>
        <div class="formula-callout">${m.formula}</div>
        <p>${m.what}</p>
      </div>
    `).join('');
    whatBox.innerHTML = DIFF_THEORY_INTRO + methodsHtml;
  }

  // ¿Cuándo se usa?
  const whenBox = document.getElementById('d-theory-when-content');
  if (whenBox) {
    whenBox.innerHTML = `
      <h2>¿Cuándo se usa cada Fórmula de Diferenciación Numérica?</h2>
      <p>La elección entre fórmulas de 2, 3 o 5 puntos (y entre punto medio o extremo) depende de la <strong>posición de \\(x_0\\) dentro de la tabla de datos</strong> y del <strong>orden de precisión</strong> requerido:</p>
      <div class="restrictions-grid" style="margin-top:16px;">
        ${DIFF_THEORY_METHODS.map(m => `
          <div class="restriction-box">
            <h4 style="color:${m.color};">${m.title}</h4>
            <ul style="margin-left:18px; color:#cbd5e1; font-size:0.86rem; line-height:1.65;">
              ${m.when.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      <hr class="divider">
      <h3>Compromiso entre Error de Truncamiento y Error de Redondeo</h3>
      <p>Al aproximar con paso \\(h\\), el error total es la suma del <strong>error de truncamiento de Taylor</strong> \\(O(h^p)\\) y el <strong>error de cancelación por redondeo</strong> \\(O(\\varepsilon_{\\text{máq}}/h)\\):</p>
      <div class="formula-callout">\\[ E_{\\text{total}}(h) \\approx C\\,h^p + \\frac{2\\,\\varepsilon_{\\text{máq}}\\,|f(x_0)|}{h} \\]</div>
      <p>Por ello, las fórmulas de 3 puntos (\\(p=2\\)) y 5 puntos (\\(p=4\\)) alcanzan muchísima más exactitud con pasos moderados (\\(h = 0.1\\) o \\(0.01\\)) sin sufrir cancelación catastrófica.</p>
    `;
  }

  // Pasos del método
  const stepsBox = document.getElementById('d-theory-steps-content');
  if (stepsBox) {
    stepsBox.innerHTML = `
      <h2>Diferenciación Numérica &bull; Procedimiento Paso a Paso</h2>
      <p>Metodología general utilizada por la calculadora para resolver cualquier derivada numérica como en los libros de texto:</p>
      <hr class="divider">
      ${DIFF_STEPS_ALGORITHM.map((s, i) => `
        <div class="calc-item" style="border-left-color:#8b5cf6; margin-bottom:14px;">
          <div class="calc-formula-title" style="color:#a78bfa;">Paso ${i + 1}: ${s.t}</div>
          <p>${s.d}</p>
        </div>
      `).join('')}
    `;
  }

  // Catálogo de ejemplos
  const exGrid = document.getElementById('d-examples-cards-grid');
  if (exGrid) {
    exGrid.innerHTML = DIFF_EXAMPLES.map(ex => {
      const comp = ex.mode === 'func' ? ExprParser.compile(ex.expr) : null;
      const formulaPreview = comp && comp.ok
        ? TXD(`f(x) = ${comp.latex}, \\quad x_0 = ${ex.x0}, \\quad h = ${ex.h}`)
        : TXD(`\\text{Tabla discreta en } x_0 = ${ex.x0}, \\quad h = ${ex.h}`);
      return `
        <div class="example-card glass-card">
          <div class="example-badge">${ex.category}</div>
          <h3>${ex.title}</h3>
          <p>${ex.desc}</p>
          <div class="formula-callout" style="margin:10px 0;">${formulaPreview}</div>
          <button class="btn btn-primary btn-sm" onclick="loadAndSwitchToDiffExample('${ex.id}')">
            Cargar Ejemplo en la Calculadora
          </button>
        </div>
      `;
    }).join('');
  }

  // Guía
  const guideBox = document.getElementById('d-theory-guide-content');
  if (guideBox) guideBox.innerHTML = DIFF_GUIDE_HTML;
}


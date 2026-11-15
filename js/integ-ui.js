/**
 * INTEG-UI.JS
 * Interfaz interactiva y generación paso a paso con tipografía LaTeX (KaTeX)
 * para el Módulo 5: INTEGRACIÓN NUMÉRICA
 *   - Método del Trapecio (simple y compuesto)
 *   - Método de Simpson (1/3 y 3/8)
 *   - Integración de Romberg (extrapolación de Richardson)
 *   - Método de Cuadratura Gaussiana (Gauss–Legendre)
 */

let currentIntegSubtopic = 'trap'; // 'trap' | 'simpson' | 'romberg' | 'gauss'
let currentIntegMode = 'func';

function initIntegModule() {
  renderIntegStaticSections();
  selectIntegSubtopic('trap');
  loadPresetIntegExample('iex1');
}

function switchIntegTab(tabKey) {
  NM.switchTabs('i', ['calc', 'what', 'when', 'steps', 'examples', 'guide'], tabKey);
}

function selectIntegSubtopic(subId, simpsonVariant) {
  currentIntegSubtopic = subId;
  ['trap', 'simpson', 'romberg', 'gauss'].forEach(s => {
    const btn = document.getElementById(`i-sub-btn-${s}`);
    if (btn) btn.classList.toggle('active', s === subId);
  });

  const grpN = document.getElementById('i-group-n');
  const grpSimp = document.getElementById('i-group-simpson-rule');
  const grpRomb = document.getElementById('i-group-romberg');
  const grpGauss = document.getElementById('i-group-gauss');
  const modeSwitch = document.getElementById('i-mode-switcher');

  if (grpN) grpN.style.display = (subId === 'trap' || subId === 'simpson') ? 'flex' : 'none';
  if (grpSimp) grpSimp.style.display = subId === 'simpson' ? 'block' : 'none';
  if (grpRomb) grpRomb.style.display = subId === 'romberg' ? 'flex' : 'none';
  if (grpGauss) grpGauss.style.display = subId === 'gauss' ? 'flex' : 'none';

  if (simpsonVariant) {
    const sel = document.getElementById('i-simpson-type');
    if (sel) sel.value = simpsonVariant;
  }

  // Romberg y Gauss requieren función analítica
  if ((subId === 'romberg' || subId === 'gauss') && currentIntegMode === 'table') {
    setIntegInputMode('func');
  }
  if (modeSwitch) {
    modeSwitch.style.display = (subId === 'trap' || subId === 'simpson') ? 'flex' : 'none';
  }

  // Ajustar n si Simpson 1/3 o 3/8 requiere paridad/múltiplo de 3
  const nEl = document.getElementById('i-n');
  if (subId === 'simpson' && nEl) {
    const sType = NM.val('i-simpson-type') || 'simpson13';
    let nVal = parseInt(nEl.value, 10) || 4;
    if (sType === 'simpson13' && nVal % 2 !== 0) nEl.value = nVal + 1;
    if (sType === 'simpson38' && nVal % 3 !== 0) nEl.value = Math.max(3, Math.ceil(nVal / 3) * 3);
  }

  updateIntegMonitorAndPreview();
}

function getActiveIntegMethodId() {
  if (currentIntegSubtopic === 'simpson') {
    return NM.val('i-simpson-type') || 'simpson13';
  }
  return currentIntegSubtopic;
}

function setIntegInputMode(mode) {
  currentIntegMode = mode === 'table' ? 'table' : 'func';
  const btnFunc = document.getElementById('i-mode-func');
  const btnTab = document.getElementById('i-mode-table');
  const boxFunc = document.getElementById('i-func-inputs');
  const boxTab = document.getElementById('i-table-inputs');
  const abRow = document.getElementById('i-ab-row');
  const grpN = document.getElementById('i-group-n');

  if (btnFunc) btnFunc.classList.toggle('active', currentIntegMode === 'func');
  if (btnTab) btnTab.classList.toggle('active', currentIntegMode === 'table');
  if (boxFunc) boxFunc.style.display = currentIntegMode === 'func' ? 'block' : 'none';
  if (boxTab) boxTab.style.display = currentIntegMode === 'table' ? 'block' : 'none';
  if (abRow) abRow.style.opacity = currentIntegMode === 'table' ? '0.55' : '1';
  if (grpN) grpN.style.opacity = currentIntegMode === 'table' ? '0.55' : '1';
  updateIntegMonitorAndPreview();
}

function updateIntegMonitorAndPreview() {
  const mId = getActiveIntegMethodId();
  const metaKey = (mId === 'simpson38') ? 'simpson13' : mId;
  const meta = INTEG_SUBTOPICS[metaKey] || INTEG_SUBTOPICS.trap;

  const monCat = document.getElementById('i-monitor-cat');
  const monBadge = document.getElementById('i-monitor-badge');
  const monFormula = document.getElementById('i-monitor-formula');
  const monText = document.getElementById('i-monitor-text');
  const indOrder = document.getElementById('i-ind-order');
  const indPts = document.getElementById('i-ind-pts');

  if (monCat) monCat.textContent = meta.title;
  if (monBadge) monBadge.textContent = meta.badge;
  if (monFormula) {
    if (mId === 'simpson38') {
      monFormula.innerHTML = TXD(String.raw`\int_a^b f(x)\,dx \approx \frac{3h}{8}\left[\,f(x_0) + 3\sum_{3\nmid i} f(x_i) + 2\sum_{i=3,6,\dots}^{n-3} f(x_i) + f(x_n)\,\right], \qquad h=\frac{b-a}{n}`);
    } else {
      monFormula.innerHTML = TXD(meta.formulaTex);
    }
  }
  if (monText) monText.innerHTML = meta.descTex;
  if (indOrder) indOrder.innerHTML = TX(meta.orderTex);
  if (indPts) indPts.innerHTML = TX(meta.pointsTex);

  // Vista previa en vivo de la integral
  const prevBox = document.getElementById('i-fn-preview');
  if (!prevBox) return;

  const aRaw = NM.val('i-a') || 'a';
  const bRaw = NM.val('i-b') || 'b';

  if (currentIntegMode === 'table') {
    prevBox.innerHTML = TXD(String.raw`I = \int_{x_0}^{x_n} f(x)\,dx \quad\text{a partir de tabla discreta }(x_i,\,f(x_i))`);
    return;
  }

  const exprStr = NM.val('i-expr');
  const compiled = ExprParser.compile(exprStr);
  if (!compiled.ok) {
    prevBox.innerHTML = `<span style="color:#f87171;">${compiled.error}</span>`;
    return;
  }
  prevBox.innerHTML = TXD(String.raw`I = \int_{${aRaw}}^{${bRaw}} \left(${compiled.latex}\right)\,dx`);
}

function loadPresetIntegExample(exId) {
  const ex = INTEG_EXAMPLES.find(e => e.id === exId);
  if (!ex) return;
  const sel = document.getElementById('i-example-select');
  if (sel) sel.value = ex.id;

  const sub = (ex.methodId === 'simpson13' || ex.methodId === 'simpson38') ? 'simpson' : ex.methodId;
  selectIntegSubtopic(sub, ex.methodId === 'simpson38' ? 'simpson38' : 'simpson13');
  setIntegInputMode(ex.mode);

  const setVal = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; };
  setVal('i-expr', ex.expr);
  setVal('i-a', ex.a);
  setVal('i-b', ex.b);
  setVal('i-n', ex.n);
  setVal('i-levels', ex.levels);
  setVal('i-tol', ex.tol || 0.000001);
  setVal('i-gauss-pts', ex.gaussPts);
  setVal('i-gauss-subs', ex.gaussSubs);
  setVal('i-exact', ex.exact !== undefined ? ex.exact : '');

  updateIntegMonitorAndPreview();
  solveIntegration();
}

function loadAndSwitchToIntegExample(exId) {
  switchIntegTab('calc');
  loadPresetIntegExample(exId);
}

function resetIntegInputs() {
  loadPresetIntegExample('iex1');
}

function clearIntegInputs() {
  ['i-expr', 'i-exact', 'i-table-text'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const res = document.getElementById('i-results-container');
  if (res) res.style.display = 'none';
  NM.banner('i-validation-banner', 'info', '');
  updateIntegMonitorAndPreview();
}

/* ---------- Generadores de tarjetas paso a paso por método ---------- */
function buildCompositeStepsHtml(res, dec) {
  const comp = res.composite;
  const aStr = NM.tex(comp.a, dec);
  const bStr = NM.tex(comp.b, dec);
  const hStr = NM.tex(comp.h, dec);

  // Paso 1: Cálculo del tamaño de paso h y verificación de n
  let ruleFormulaTex = '';
  if (comp.ruleId === 'trap') {
    ruleFormulaTex = String.raw`\int_{${aStr}}^{${bStr}} f(x)\,dx \approx \frac{h}{2}\left[\,f(x_0) + 2\sum_{i=1}^{${comp.n - 1}} f(x_i) + f(x_{${comp.n}})\,\right]`;
  } else if (comp.ruleId === 'simpson13') {
    ruleFormulaTex = String.raw`\int_{${aStr}}^{${bStr}} f(x)\,dx \approx \frac{h}{3}\left[\,f(x_0) + 4\sum_{i\text{ impar}} f(x_i) + 2\sum_{i\text{ par}} f(x_i) + f(x_{${comp.n}})\,\right]`;
  } else {
    ruleFormulaTex = String.raw`\int_{${aStr}}^{${bStr}} f(x)\,dx \approx \frac{3h}{8}\left[\,f(x_0) + 3\sum_{3\nmid i} f(x_i) + 2\sum_{3\mid i} f(x_i) + f(x_{${comp.n}})\,\right]`;
  }

  const step1Body = NM.block(
    `Fórmula de ${comp.rule.name} y paso \\(h\\)`,
    TXD(String.raw`\begin{aligned}
h &= \frac{b-a}{n} = \frac{${bStr} - ${NM.texP(comp.a, dec)}}{${comp.n}} = \mathbf{${hStr}} \\[6pt]
${ruleFormulaTex}
\end{aligned}`)
  );

  // Paso 2: Evaluaciones de f(x_i) y tabla de pesos c_i
  const evalSampleLines = comp.rows.slice(0, Math.min(comp.rows.length, 10)).map(r => {
    const xT = NM.tex(r.x, dec);
    const fT = NM.tex(r.f, dec);
    if (res.compiled) {
      return `x_{${r.i}} = ${xT} &\\implies f(${xT}) = ${res.compiled.latexAt(xT)} = \\mathbf{${fT}}`;
    }
    return `x_{${r.i}} = ${xT} &\\implies f(${xT}) = \\mathbf{${fT}}`;
  }).join(' \\\\[4pt] ');

  const tblRows = comp.rows.map(r => [
    TX(`i = ${r.i}`),
    TX(NM.tex(r.x, dec)),
    TX(NM.tex(r.f, dec)),
    TX(String(r.c)),
    `<strong>${TX(NM.tex(r.cf, dec))}</strong>`
  ]);

  const step2Body = NM.block(
    `Evaluación explícita de \\(f(x_i)\\) en los nodos \\(x_i = a + i\\,h\\)${comp.rows.length > 10 ? ' (primeros 10 nodos mostrados)' : ''}`,
    TXD(`\\begin{aligned} ${evalSampleLines} \\end{aligned}`)
  ) + NM.block(
    'Tabla completa de nodos, evaluaciones, multiplicadores \\(c_i\\) y productos \\(c_i\\,f(x_i)\\)',
    NM.table(['Índice', 'Nodo \\(x_i\\)', '\\(f(x_i)\\)', 'Peso \\(c_i\\)', 'Producto \\(c_i\\,f(x_i)\\)'], tblRows)
  );

  // Paso 3: Suma ponderada y multiplicación por el factor exterior
  const sumStr = NM.tex(comp.sum, dec);
  const facStr = NM.tex(comp.factor, dec);
  const intStr = NM.tex(comp.integral, dec);

  const termsPreview = comp.rows.length <= 8
    ? comp.rows.map(r => `${r.c === 1 ? '' : r.c + '\\cdot '}${NM.texP(r.f, dec)}`).join(' + ')
    : `${NM.texP(comp.rows[0].f, dec)} + ${comp.rows[1].c}\\cdot ${NM.texP(comp.rows[1].f, dec)} + \\dots + ${NM.texP(comp.rows[comp.n].f, dec)}`;

  const facSymbolic = comp.ruleId === 'trap'
    ? `\\frac{${hStr}}{2}`
    : (comp.ruleId === 'simpson13' ? `\\frac{${hStr}}{3}` : `\\frac{3\\cdot ${hStr}}{8}`);

  const step3Body = NM.block(
    'Sustitución numérica en la regla compuesta y resultado final',
    TXD(String.raw`\begin{aligned}
\sum_{i=0}^{${comp.n}} c_i\,f(x_i) &= ${termsPreview} = \mathbf{${sumStr}} \\[8pt]
I &\approx ${facSymbolic}\left(${sumStr}\right) = ${facStr}\times ${sumStr} = \boxed{\mathbf{${intStr}}}
\end{aligned}`)
  );

  return [
    NM.card({ badge: 'PASO 1', title: `Cálculo del paso \\(h\\) y planteamiento (${comp.rule.name})`, metric: TX(`h = ${hStr},\\; n = ${comp.n}`), body: step1Body, open: true }),
    NM.card({ badge: 'PASO 2', title: `Evaluación en los ${comp.n + 1} nodos y tabla de pesos`, metric: `${comp.n + 1} puntos`, body: step2Body, open: true }),
    NM.card({ badge: 'PASO 3', title: 'Suma ponderada y multiplicación por el factor exterior', metric: TX(`I \\approx ${intStr}`), body: step3Body, open: true })
  ].join('');
}

function buildRombergStepsHtml(res, dec) {
  const rb = res.romberg;
  const aStr = NM.tex(rb.a, dec);
  const bStr = NM.tex(rb.b, dec);

  // Paso 1: Columna R_{k,1} (regla del trapecio recursiva)
  const trapLines = rb.rows.map(r => {
    if (r.k === 1) {
      return `R_{1,1} &= \\frac{b-a}{2}\\Big[f(${aStr})+f(${bStr})\\Big] = \\frac{${NM.tex(r.h, dec)}}{2}\\Big[${NM.tex(r.fa, dec)} + ${NM.texP(r.fb, dec)}\\Big] = \\mathbf{${NM.tex(r.trap, dec)}}`;
    }
    return `R_{${r.k},1} &= \\frac{1}{2}R_{${r.k - 1},1} + h_{${r.k}}\\sum_{i=1}^{${r.n / 2}} f(x_{\\text{nuevo}}) = \\frac{1}{2}(${NM.tex(r.prevTrap, dec)}) + ${NM.tex(r.h, dec)}\\cdot(${NM.tex(r.sumNew, dec)}) = \\mathbf{${NM.tex(r.trap, dec)}}`;
  }).join(' \\\\[6pt] ');

  const step1Body = NM.block(
    'Refinamiento sucesivo del Trapecio \\(R_{k,1}\\) con paso \\(h_k = (b-a)/2^{k-1}\\)',
    TXD(`\\begin{aligned} ${trapLines} \\end{aligned}`)
  );

  // Paso 2: Extrapolación de Richardson R_{k,j}
  const richLines = [];
  rb.rows.forEach(r => {
    r.ext.forEach(e => {
      richLines.push(
        `R_{${r.k},${e.j}} &= R_{${r.k},${e.j - 1}} + \\frac{R_{${r.k},${e.j - 1}} - R_{${r.k - 1},${e.j - 1}}}{4^{${e.j - 1}}-1} = ${NM.tex(e.a, dec)} + \\frac{${NM.tex(e.a, dec)} - (${NM.tex(e.b, dec)})}{${e.denom}} = \\mathbf{${NM.tex(e.value, dec)}}`
      );
    });
  });

  const step2Body = NM.block(
    'Fórmula recursiva de Extrapolación de Richardson',
    TXD(String.raw`R_{k,j} = R_{k,j-1} + \frac{R_{k,j-1} - R_{k-1,j-1}}{4^{\,j-1}-1}`)
  ) + NM.block(
    'Cálculo detallado de cada entrada extrapolada \\(R_{k,j}\\)',
    TXD(`\\begin{aligned} ${richLines.join(' \\\\[6pt] ')} \\end{aligned}`)
  );

  // Paso 3: Matriz triangular de Romberg
  const headers = ['Nivel \\(k\\)', '\\(n_k = 2^{k-1}\\)', 'Paso \\(h_k\\)'];
  for (let j = 1; j <= rb.levels; j++) {
    headers.push(`\\(R_{k,${j}}\\) — \\(O(h^{${2 * j}})\\)`);
  }
  const matrixRows = rb.rows.map(r => {
    const rowCells = [
      TX(`k = ${r.k}`),
      TX(String(r.n)),
      TX(NM.tex(r.h, dec))
    ];
    for (let j = 1; j <= rb.levels; j++) {
      if (j <= r.k) {
        const val = rb.R[r.k][j];
        const isFinal = (r.k === rb.levels && j === rb.levels);
        rowCells.push(isFinal ? `<strong style="color:#34d399;">${TX(`\\boxed{${NM.tex(val, dec)}}`)}</strong>` : TX(NM.tex(val, dec)));
      } else {
        rowCells.push('—');
      }
    }
    return rowCells;
  });

  const step3Body = NM.block(
    'Tabla Triangular de Romberg completa (la diagonal principal contiene las mejores aproximaciones)',
    NM.table(headers, matrixRows)
  );

  return [
    NM.card({ badge: 'PASO 1', title: 'Columna base del Trapecio \\(R_{k,1}\\) por bisección de \\([a,b]\\)', metric: `${rb.levels} niveles`, body: step1Body, open: true }),
    NM.card({ badge: 'PASO 2', title: 'Extrapolaciones de Richardson \\(R_{k,j}\\) paso a paso', metric: TX(`O(h^{${2 * rb.levels}})`), body: step2Body, open: true }),
    NM.card({ badge: 'PASO 3', title: 'Matriz Triangular de Romberg \\(R_{k,j}\\)', metric: TX(`R_{${rb.levels},${rb.levels}} = ${NM.tex(rb.integral, dec)}`), body: step3Body, open: true })
  ].join('');
}

function buildGaussStepsHtml(res, dec) {
  const gs = res.gauss;
  const sub = gs.subs[0];
  const aStr = NM.tex(gs.a, dec);
  const bStr = NM.tex(gs.b, dec);
  const halfStr = NM.tex(sub.half, dec);
  const midStr = NM.tex(sub.mid, dec);

  // Paso 1: Cambio lineal de intervalo [a,b] -> [-1,1]
  const step1Body = NM.block(
    `Transformación lineal del intervalo \\([${aStr},\\,${bStr}]\\) al dominio canónico \\([-1,1]\\)`,
    TXD(String.raw`\begin{aligned}
x &= \frac{b-a}{2}\,t + \frac{a+b}{2} = \frac{${bStr} - ${NM.texP(gs.a, dec)}}{2}\,t + \frac{${aStr} + ${NM.texP(gs.b, dec)}}{2} = ${halfStr}\,t + ${NM.texP(sub.mid, dec)} \\[6pt]
dx &= \frac{b-a}{2}\,dt = ${halfStr}\,dt
\end{aligned}`)
  );

  // Paso 2: Nodos de Legendre t_i, pesos w_i, abscisas transformadas x_i y f(x_i)
  const evalLines = sub.pts.map(p => {
    const tStr = NM.tex(p.t, dec);
    const xStr = NM.tex(p.x, dec);
    const fStr = NM.tex(p.f, dec);
    return `t_{${p.i}} = ${tStr} &\\implies x_{${p.i}} = ${halfStr}(${tStr}) + ${NM.texP(sub.mid, dec)} = ${xStr} \\implies f(${xStr}) = ${res.compiled.latexAt(xStr)} = \\mathbf{${fStr}}`;
  }).join(' \\\\[6pt] ');

  const tblRows = sub.pts.map(p => [
    TX(`i = ${p.i}`),
    TX(NM.tex(p.t, dec)),
    TX(NM.tex(p.w, dec)),
    TX(NM.tex(p.x, dec)),
    TX(NM.tex(p.f, dec)),
    `<strong>${TX(NM.tex(p.wf, dec))}</strong>`
  ]);

  const step2Body = NM.block(
    `Transformación de las ${gs.npts} raíces del polinomio de Legendre \\(P_{${gs.npts}}(t)\\) y evaluación de \\(f(x_i)\\)`,
    TXD(`\\begin{aligned} ${evalLines} \\end{aligned}`)
  ) + NM.block(
    'Tabla de nodos canónicos \\(t_i\\), pesos \\(w_i\\), nodos reales \\(x_i\\) y productos \\(w_i\\,f(x_i)\\)',
    NM.table(['Punto', 'Raíz \\(t_i \\in (-1,1)\\)', 'Peso \\(w_i\\)', 'Abscisa \\(x_i \\in [a,b]\\)', '\\(f(x_i)\\)', 'Producto \\(w_i\\,f(x_i)\\)'], tblRows)
  );

  // Paso 3: Suma ponderada y multiplicación por (b-a)/2
  const sumWFStr = NM.tex(sub.sumWF, dec);
  const intStr = NM.tex(gs.integral, dec);
  const termsWF = sub.pts.map(p => `${NM.tex(p.w, dec)}\\cdot ${NM.texP(p.f, dec)}`).join(' + ');

  let subIntervalsBlock = '';
  if (gs.m > 1) {
    const subRows = gs.subs.map(s => [
      TX(`s = ${s.s}`),
      TX(`[${NM.tex(s.alpha, dec)},\\, ${NM.tex(s.beta, dec)}]`),
      TX(NM.tex(s.half, dec)),
      TX(NM.tex(s.sumWF, dec)),
      `<strong>${TX(NM.tex(s.value, dec))}</strong>`
    ]);
    subIntervalsBlock = NM.block(
      `Desglose por los ${gs.m} subintervalos compuestos`,
      NM.table(['Subintervalo', 'Rango \\([\\alpha_s,\\beta_s]\\)', 'Factor \\((\\beta_s-\\alpha_s)/2\\)', '\\(\\sum w_i f(x_i)\\)', 'Aporte a la integral'], subRows)
    );
  }

  const step3Body = NM.block(
    'Combinación lineal de Gauss–Legendre y resultado',
    TXD(String.raw`\begin{aligned}
\sum_{i=1}^{${gs.npts}} w_i\,f(x_i) &= ${termsWF} = \mathbf{${sumWFStr}} \\[8pt]
I &\approx \frac{b-a}{2}\sum_{i=1}^{${gs.npts}} w_i\,f(x_i) = ${halfStr}\times\left(${sumWFStr}\right) = \boxed{\mathbf{${intStr}}}
\end{aligned}`)
  ) + subIntervalsBlock;

  return [
    NM.card({ badge: 'PASO 1', title: 'Cambio de variable lineal de \\([a,b]\\) a \\([-1,1]\\)', metric: TX(`dx = ${halfStr}\\,dt`), body: step1Body, open: true }),
    NM.card({ badge: 'PASO 2', title: `Raíces de Legendre \\(t_i\\), pesos \\(w_i\\) y evaluaciones (${gs.npts} puntos)`, metric: `Exacta en grado \\(\\le ${2 * gs.npts - 1}\\)`, body: step2Body, open: true }),
    NM.card({ badge: 'PASO 3', title: 'Suma ponderada y multiplicación por el Jacobiano \\((b-a)/2\\)', metric: TX(`I \\approx ${intStr}`), body: step3Body, open: true })
  ].join('');
}

function solveIntegration() {
  NM.banner('i-validation-banner', 'info', '');
  const dec = parseInt(NM.val('i-decimals') || '6', 10);
  const methodId = getActiveIntegMethodId();

  try {
    const expr = NM.val('i-expr');
    const tableText = NM.val('i-table-text');
    const a = currentIntegMode === 'func' ? NM.num('i-a', 'Límite inferior a') : 0;
    const b = currentIntegMode === 'func' ? NM.num('i-b', 'Límite superior b') : 1;
    const n = parseInt(NM.val('i-n') || '4', 10);
    const levels = parseInt(NM.val('i-levels') || '4', 10);
    const tol = parseFloat(NM.val('i-tol') || '0') || 0;
    const gaussPts = parseInt(NM.val('i-gauss-pts') || '3', 10);
    const gaussSubs = parseInt(NM.val('i-gauss-subs') || '1', 10);
    const exactRaw = NM.val('i-exact');
    const exactValue = exactRaw !== '' ? parseFloat(exactRaw.replace(',', '.')) : null;

    const res = computeIntegration({
      mode: currentIntegMode, methodId, expr, tableText, a, b, n, levels, tol, gaussPts, gaussSubs, exactValue
    });

    const cont = document.getElementById('i-results-container');
    if (cont) cont.style.display = 'block';

    const methodLabels = {
      trap: 'Método del Trapecio Compuesto',
      simpson13: 'Método de Simpson 1/3 Compuesto',
      simpson38: 'Método de Simpson 3/8 Compuesto',
      romberg: 'Integración de Romberg',
      gauss: `Cuadratura Gaussiana (${gaussPts} puntos de Legendre)`
    };

    document.getElementById('i-res-method-badge').textContent = methodLabels[methodId] || 'Integración Numérica';
    document.getElementById('i-res-status-title').innerHTML =
      `Integral aproximada en \\([${NM.tex(res.a, dec)},\\,${NM.tex(res.b, dec)}]\\)`;
    document.getElementById('i-res-summary-desc').innerHTML =
      `Calculada con <strong>${res.evaluations} evaluaciones</strong> de la función.`;

    document.getElementById('i-res-integral').innerHTML = TX(`I \\approx ${NM.tex(res.integral, dec)}`);
    document.getElementById('i-res-exact').innerHTML = res.exact !== null
      ? TX(`I_{\\text{exacta}} = ${NM.tex(res.exact, dec)}`)
      : '—';
    document.getElementById('i-res-error').innerHTML = res.exact !== null
      ? TX(`E_{\\text{abs}} = ${NM.texErr(res.absError, dec)} \\; (${NM.fmt(res.relError, 4)}\\%)`)
      : '—';

    // Tarjetas paso a paso
    const stepsBox = document.getElementById('i-step-by-step-cards');
    let htmlSteps = '';
    if (res.composite) htmlSteps = buildCompositeStepsHtml(res, dec);
    else if (res.romberg) htmlSteps = buildRombergStepsHtml(res, dec);
    else if (res.gauss) htmlSteps = buildGaussStepsHtml(res, dec);

    if (res.exact !== null) {
      const exStr = NM.tex(res.exact, dec);
      const intStr = NM.tex(res.integral, dec);
      const errAbsStr = NM.texErr(res.absError, dec);
      const errRelStr = res.relError !== null ? `${NM.fmt(res.relError, 4)}\\%` : '—';
      htmlSteps += NM.card({
        badge: 'PASO 4',
        title: `${res.exactKind} y análisis de error`,
        metric: TX(`E_{\\text{abs}} = ${errAbsStr}`),
        open: true,
        body: NM.block(
          'Cálculo del error absoluto y relativo porcentual',
          TXD(String.raw`\begin{aligned}
E_{\text{abs}} &= \left|I_{\text{exacta}} - I_{\text{aprox}}\right| = \left|${exStr} - ${intStr}\right| = \mathbf{${errAbsStr}} \\[6pt]
\varepsilon_r &= \frac{E_{\text{abs}}}{\left|I_{\text{exacta}}\right|}\times 100\% = \mathbf{${errRelStr}}
\end{aligned}`)
        )
      });
    }
    if (stepsBox) stepsBox.innerHTML = htmlSteps;

    // Tabla comparativa entre los 4 métodos
    const compPanel = document.getElementById('i-comparison-panel');
    const compBody = document.getElementById('i-comparison-tbody');
    if (compPanel && compBody) {
      if (res.comparison && res.comparison.length > 0) {
        compPanel.style.display = 'block';
        compBody.innerHTML = res.comparison.map(c => `
          <tr>
            <td><strong>${c.label}</strong></td>
            <td>${c.evals}</td>
            <td>${c.value !== null ? TX(NM.tex(c.value, dec)) : `<span style="color:#a1a1aa;font-size:0.8rem;">${c.note}</span>`}</td>
            <td>${c.err !== null ? TX(NM.texErr(c.err, dec)) : '—'}</td>
          </tr>
        `).join('');
      } else {
        compPanel.style.display = 'none';
      }
    }
  } catch (err) {
    NM.banner('i-validation-banner', 'danger', `<strong>Error de validación:</strong>&nbsp; ${err.message}`);
  }
}

function renderIntegStaticSections() {
  // ¿Qué es?
  const whatBox = document.getElementById('i-theory-what-content');
  if (whatBox) {
    const methodsHtml = INTEG_THEORY_METHODS.map(m => `
      <div class="calc-item" style="border-left-color:${m.color}; margin-bottom:16px;">
        <div class="calc-formula-title" style="color:${m.color}; font-size:1rem;">${m.title}</div>
        <div class="formula-callout">${m.formula}</div>
        <p>${m.what}</p>
      </div>
    `).join('');
    whatBox.innerHTML = INTEG_THEORY_INTRO + methodsHtml;
  }

  // ¿Cuándo se usa?
  const whenBox = document.getElementById('i-theory-when-content');
  if (whenBox) {
    whenBox.innerHTML = `
      <h2>¿Cuándo usar Trapecio, Simpson, Romberg o Cuadratura Gaussiana?</h2>
      <p>Criterios prácticos para elegir el método de integración más apropiado según el tipo de problema:</p>
      <div class="restrictions-grid" style="margin-top:16px;">
        ${INTEG_THEORY_METHODS.map(m => `
          <div class="restriction-box">
            <h4 style="color:${m.color};">${m.title}</h4>
            <ul style="margin-left:18px; color:#cbd5e1; font-size:0.86rem; line-height:1.65;">
              ${m.when.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      <hr class="divider">
      <h3>Comparación de Orden de Exactitud y Grado Polinomial</h3>
      <div class="formula-callout">
        \\[
        \\begin{array}{lccc}
        \\textbf{Método} & \\textbf{Restricción en } n & \\textbf{Error global} & \\textbf{Grado de exactitud} \\\\[4pt]
        \\hline
        \\text{Trapecio compuesto} & n \\ge 1 & O(h^2) & \\text{Grado } 1 \\\\
        \\text{Simpson 1/3 compuesto} & n \\text{ par} & O(h^4) & \\text{Grado } 3 \\\\
        \\text{Simpson 3/8 compuesto} & n \\text{ múltiplo de } 3 & O(h^4) & \\text{Grado } 3 \\\\
        \\text{Romberg (nivel } k\\text{)} & n = 2^{k-1} & O(h^{2k}) & \\text{Grado } 2k-1 \\\\
        \\text{Gauss–Legendre (} m \\text{ puntos)} & m \\in \\{2,\\dots,6\\} & O(h^{2m}) & \\text{Grado } 2m-1
        \\end{array}
        \\]
      </div>
    `;
  }

  // Pasos
  const stepsBox = document.getElementById('i-theory-steps-content');
  if (stepsBox) {
    stepsBox.innerHTML = `
      <h2>Integración Numérica &bull; Procedimiento Paso a Paso</h2>
      <p>Secuencia algorítmica detallada para resolver cualquier integral definida numéricamente:</p>
      <hr class="divider">
      ${INTEG_STEPS_ALGORITHM.map(s => `
        <div class="calc-item" style="border-left-color:#10b981; margin-bottom:14px;">
          <div class="calc-formula-title" style="color:#34d399;">${s.t}</div>
          <p>${s.d}</p>
        </div>
      `).join('')}
    `;
  }

  // Ejemplos
  const exGrid = document.getElementById('i-examples-cards-grid');
  if (exGrid) {
    exGrid.innerHTML = INTEG_EXAMPLES.map(ex => {
      const comp = ExprParser.compile(ex.expr);
      const preview = comp.ok
        ? TXD(`\\int_{${NM.short(ex.a)}}^{${NM.short(ex.b)}} \\left(${comp.latex}\\right)\\,dx`)
        : '';
      return `
        <div class="example-card glass-card">
          <div class="example-badge">${ex.category}</div>
          <h3>${ex.title}</h3>
          <p>${ex.desc}</p>
          <div class="formula-callout" style="margin:10px 0;">${preview}</div>
          <button class="btn btn-primary btn-sm" onclick="loadAndSwitchToIntegExample('${ex.id}')">
            Cargar Ejemplo en la Calculadora
          </button>
        </div>
      `;
    }).join('');
  }

  // Guía
  const guideBox = document.getElementById('i-theory-guide-content');
  if (guideBox) guideBox.innerHTML = INTEG_GUIDE_HTML;
}


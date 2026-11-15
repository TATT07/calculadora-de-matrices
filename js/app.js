/**
 * APP.JS (Main Coordinator)
 * Inicialización de la aplicación, conmutador de los 5 módulos principales y navegación por pestañas.
 */

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Módulo 1: Sistemas Lineales (Jacobi & Gauss-Seidel)
  if (typeof renderMatrixInputs === 'function') {
    renderMatrixInputs(currentSize);
  }
  if (typeof renderExamplesCatalog === 'function') {
    renderExamplesCatalog();
  }
  if (typeof checkDominance === 'function') {
    checkDominance();
  }

  // 2. Inicializar Módulo 2: Método de Bairstow (Polinomios)
  if (typeof renderBairstowPolyInputs === 'function') {
    renderBairstowPolyInputs(currentBairstowDegree);
  }
  if (typeof renderBairstowExamplesCatalog === 'function') {
    renderBairstowExamplesCatalog();
  }
  if (typeof loadPresetBairstowExample === 'function') {
    loadPresetBairstowExample('bex1');
  }

  // 3. Inicializar Módulo 3: Método de Newton para Sistemas (Sistemas No Lineales)
  if (typeof updateNewtonFnPreview === 'function') {
    updateNewtonFnPreview();
  }
  if (typeof renderNewtonExamplesCatalog === 'function') {
    renderNewtonExamplesCatalog();
  }
  if (typeof loadPresetNewtonExample === 'function') {
    loadPresetNewtonExample('nex1');
  }

  // 4. Inicializar Módulo 4: Diferenciación Numérica
  if (typeof initDiffModule === 'function') {
    initDiffModule();
  }

  // 5. Inicializar Módulo 5: Integración Numérica
  if (typeof initIntegModule === 'function') {
    initIntegModule();
  }
});

/**
 * Conmuta entre los 5 módulos principales:
 * 'linear' | 'bairstow' | 'newton' | 'diff' | 'integ'
 * @param {string} moduleId
 */
function switchMainModule(moduleId) {
  const modules = ['linear', 'bairstow', 'newton', 'diff', 'integ'];

  modules.forEach(m => {
    const btn = document.getElementById(`mod-btn-${m}`);
    const mod = document.getElementById(`module-${m}`);
    if (btn) btn.classList.toggle('active', m === moduleId);
    if (mod) mod.classList.toggle('active', m === moduleId);
  });

  if (typeof window.renderMath === 'function') {
    const activeMod = document.getElementById(`module-${moduleId}`);
    if (activeMod) window.renderMath(activeMod);
  }
}

/**
 * Navegación de pestañas para Sistemas Lineales
 * @param {string} tabId - 'calculator', 'examples', 'theory', 'manual'
 */
function switchTab(tabId) {
  document.querySelectorAll('#module-linear .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('#module-linear .tab-section').forEach(sec => sec.classList.remove('active'));

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

/**
 * Navegación de pestañas para Método de Bairstow
 * @param {string} tabKey - 'calc', 'what', 'when', 'steps', 'examples', 'guide'
 */
function switchBairstowTab(tabKey) {
  const tabs = ['calc', 'what', 'when', 'steps', 'examples', 'guide'];
  tabs.forEach(t => {
    const btn = document.getElementById(`b-tab-${t}`);
    const sec = document.getElementById(`b-section-${t}`);
    if (btn) btn.classList.remove('active');
    if (sec) sec.classList.remove('active');
  });

  const activeBtn = document.getElementById(`b-tab-${tabKey}`);
  const activeSec = document.getElementById(`b-section-${tabKey}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (activeSec) activeSec.classList.add('active');
}

/**
 * Navegación de pestañas para Método de Newton-Raphson
 * @param {string} tabKey - 'calc', 'what', 'when', 'steps', 'examples', 'guide'
 */
function switchNewtonTab(tabKey) {
  const tabs = ['calc', 'what', 'when', 'steps', 'examples', 'guide'];
  tabs.forEach(t => {
    const btn = document.getElementById(`n-tab-${t}`);
    const sec = document.getElementById(`n-section-${t}`);
    if (btn) btn.classList.remove('active');
    if (sec) sec.classList.remove('active');
  });

  const activeBtn = document.getElementById(`n-tab-${tabKey}`);
  const activeSec = document.getElementById(`n-section-${tabKey}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (activeSec) activeSec.classList.add('active');
}

/**
 * MATH-RENDER.JS
 * Renderizado tipográfico de fórmulas con KaTeX (LaTeX real) para TODA la aplicación.
 *
 * Uso en cualquier plantilla HTML (estática o generada por JS):
 *   - En línea:   \( x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)} \)      o   $ ... $
 *   - En bloque:  \[ \int_a^b f(x)\,dx \approx \frac{h}{2}\left[ \dots \right] \]   o   $$ ... $$
 *
 * Un MutationObserver vigila el documento: cualquier contenido que se inyecte
 * dinámicamente (pasos, tablas, tarjetas) se tipografía solo, sin llamadas extra.
 * Si se necesita forzarlo: renderMath(elemento)
 */

(function () {
  const KATEX_OPTIONS = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false,
    errorColor: '#f87171',
    strict: 'ignore',
    ignoredClasses: ['no-math']
  };

  let pending = null;

  /**
   * Tipografía las fórmulas LaTeX dentro de un elemento (por defecto, todo el documento).
   * @param {Element} [el]
   */
  function renderMath(el) {
    const target = el || document.body;
    if (typeof window.renderMathInElement !== 'function') return false;
    try {
      window.renderMathInElement(target, KATEX_OPTIONS);
    } catch (err) {
      console.warn('KaTeX: no se pudo renderizar una fórmula.', err);
    }
    return true;
  }

  function scheduleRender() {
    if (pending) return;
    pending = setTimeout(() => {
      pending = null;
      renderMath(document.body);
    }, 40);
  }

  function startObserver() {
    const observer = new MutationObserver(scheduleRender);
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleRender();
  }

  function waitForKatex(tries) {
    if (typeof window.renderMathInElement === 'function') {
      startObserver();
      return;
    }
    if (tries > 200) {
      console.warn('KaTeX no se cargó (¿sin conexión?). Las fórmulas se mostrarán como código LaTeX.');
      return;
    }
    setTimeout(() => waitForKatex(tries + 1), 50);
  }

  document.addEventListener('DOMContentLoaded', () => waitForKatex(0));

  window.renderMath = renderMath;
})();

/** Envuelve LaTeX en modo línea. */
function TX(latex) {
  return '\\(' + latex + '\\)';
}

/** Envuelve LaTeX en modo bloque (centrado). */
function TXD(latex) {
  return '\\[' + latex + '\\]';
}

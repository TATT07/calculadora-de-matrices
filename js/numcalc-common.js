/**
 * NUMCALC-COMMON.JS
 * Utilidades compartidas por los módulos de Diferenciación e Integración Numérica:
 *  - formato de números (texto y LaTeX)
 *  - lectura de tablas de datos (x, f(x))
 *  - acordeones de pasos, tablas HTML y avisos de validación
 */

const NM = {
  /** Número con N decimales (texto plano). */
  fmt(v, dec = 6) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    if (Math.abs(v) < 0.5 * Math.pow(10, -dec)) return (0).toFixed(dec);
    return Number(v).toFixed(dec);
  },

  /** Número listo para insertarse dentro de LaTeX (negativos con signo correcto). */
  tex(v, dec = 6) {
    return NM.fmt(v, dec).replace('-', '-');
  },

  /** Número entre paréntesis si es negativo (para sustituciones). */
  texP(v, dec = 6) {
    const s = NM.fmt(v, dec);
    return s.startsWith('-') ? `\\left(${s}\\right)` : s;
  },

  /** Error: notación científica en LaTeX cuando es muy pequeño. */
  texErr(v, dec = 6) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a < Math.pow(10, -dec) || a >= 1e6) {
      const [mant, ex] = a.toExponential(4).split('e');
      return `${mant}\\times 10^{${parseInt(ex, 10)}}`;
    }
    return a.toFixed(dec);
  },

  /** Entero o decimal compacto para etiquetas (h, x0...). */
  short(v) {
    if (!isFinite(v)) return '—';
    const r = Math.round(v * 1e10) / 1e10;
    return String(r);
  },

  /** Lee una tabla "x  f(x)" (una pareja por línea; separadores: espacio, coma, ; o tab). */
  parseTable(text) {
    const lines = String(text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const pts = [];
    for (const line of lines) {
      const parts = line.replace(/,(?=\d)/g, '.').split(/[\s;,\t]+/).filter(Boolean);
      if (parts.length < 2) throw new Error(`Línea de tabla inválida: "${line}". Usa el formato: x  f(x).`);
      const x = parseFloat(parts[0]);
      const f = parseFloat(parts[1]);
      if (isNaN(x) || isNaN(f)) throw new Error(`Valores no numéricos en la línea: "${line}".`);
      pts.push({ x, f });
    }
    if (pts.length < 2) throw new Error('La tabla necesita al menos 2 puntos (x, f(x)).');
    pts.sort((p, q) => p.x - q.x);
    for (let i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i].x - pts[i - 1].x) < 1e-12) throw new Error(`Hay un valor de x repetido: ${pts[i].x}.`);
    }
    return pts;
  },

  /** Verifica espaciamiento uniforme; devuelve h. */
  uniformSpacing(pts) {
    const h = pts[1].x - pts[0].x;
    for (let i = 1; i < pts.length; i++) {
      const hi = pts[i].x - pts[i - 1].x;
      if (Math.abs(hi - h) > 1e-8 * Math.max(1, Math.abs(h))) {
        throw new Error('Los datos de la tabla deben estar igualmente espaciados (h constante) para estas fórmulas.');
      }
    }
    return h;
  },

  /** Tabla HTML estándar. rows: arreglo de arreglos de celdas HTML. */
  table(headers, rows, extraClass = '') {
    const th = headers.map(h => `<th>${h}</th>`).join('');
    const tr = rows.map(r => {
      const cls = r.rowClass ? ` class="${r.rowClass}"` : '';
      return `<tr${cls}>${r.map(c => `<td>${c}</td>`).join('')}</tr>`;
    }).join('');
    return `<div class="table-responsive"><table class="modern-table nm-table ${extraClass}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  },

  /** Acordeón de paso. */
  card({ badge, title, metric = '', body, open = false }) {
    return `
      <div class="nm-card ${open ? 'open' : ''}">
        <div class="nm-card-header" onclick="NM.toggle(this)">
          <div class="nm-card-left">
            <span class="nm-card-badge">${badge}</span>
            <span class="nm-card-title">${title}</span>
          </div>
          <div class="nm-card-right">
            ${metric ? `<span class="nm-card-metric">${metric}</span>` : ''}
            <svg class="nm-card-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="nm-card-body">${body}</div>
      </div>`;
  },

  /** Subbloque dentro del cuerpo de un paso. */
  block(title, html, tone = '') {
    return `<div class="nm-block ${tone}"><div class="nm-block-title">${title}</div><div class="nm-block-content">${html}</div></div>`;
  },

  toggle(headerEl) {
    const card = headerEl.parentElement;
    card.classList.toggle('open');
  },

  toggleAll(containerId, open) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    cont.querySelectorAll('.nm-card').forEach(c => c.classList.toggle('open', open));
  },

  banner(id, type, html) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!html) { el.style.display = 'none'; el.innerHTML = ''; return; }
    el.style.display = 'flex';
    el.className = `validation-banner banner-${type}`;
    el.innerHTML = html;
  },

  /** Pestañas genéricas: prefix-tab-KEY / prefix-section-KEY dentro de un módulo. */
  switchTabs(prefix, keys, active) {
    keys.forEach(k => {
      const b = document.getElementById(`${prefix}-tab-${k}`);
      const s = document.getElementById(`${prefix}-section-${k}`);
      if (b) b.classList.toggle('active', k === active);
      if (s) s.classList.toggle('active', k === active);
    });
  },

  /** Lee un número de un input; lanza error legible si es inválido. */
  num(id, label) {
    const el = document.getElementById(id);
    const raw = el ? String(el.value).trim().replace(',', '.') : '';
    const v = Number(raw);
    if (raw === '' || isNaN(v) || !isFinite(v)) throw new Error(`El valor de "${label}" no es un número válido.`);
    return v;
  },

  /** Expresión opcional de un input (devuelve '' si está vacía). */
  val(id) {
    const el = document.getElementById(id);
    return el ? String(el.value).trim() : '';
  }
};

/** Compila f(x) y valida; lanza errores legibles. */
function nmCompileFunction(src, label = 'f(x)') {
  const c = ExprParser.compile(src);
  if (!c.ok) throw new Error(`${label}: ${c.error}`);
  return c;
}

/** Evalúa f en x con verificación de dominio. */
function nmEvalChecked(compiled, x) {
  const y = compiled.f(x);
  if (typeof y !== 'number' || !isFinite(y)) {
    throw new Error(`f(x) no está definida (o no es finita) en x = ${NM.short(x)}. Revisa el dominio o cambia los límites.`);
  }
  return y;
}

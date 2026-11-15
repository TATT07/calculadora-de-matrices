/**
 * UTILS.JS
 * Utilidades matemáticas y formateo con precisión estricta a 6 decimales.
 */

/**
 * Procesa un número ajustándolo a 6 cifras decimales según el modo seleccionado.
 * @param {number|string} num - Valor numérico a procesar.
 * @param {string} mode - 'round' (redondeo estándar a 6 decimales) o 'truncate' (corte directo).
 * @returns {number} Valor numérico procesado a 6 decimales.
 */
function process6(num, mode = 'round') {
  if (num === null || num === undefined || isNaN(num)) return 0;
  const n = Number(num);
  if (mode === 'truncate') {
    // Trunca estrictamente descartando cualquier dígito más allá del sexto decimal
    const factor = 1000000;
    return Math.trunc(n * factor) / factor;
  } else {
    // Redondeo estándar a 6 cifras
    return parseFloat(n.toFixed(6));
  }
}

/**
 * Formatea un número como cadena estricta con exactamente 6 cifras decimales (0.xxxxxx).
 * @param {number|string} num - Valor a formatear.
 * @param {string} mode - Modo de procesamiento ('round' o 'truncate').
 * @returns {string} Cadena en formato "0.000000".
 */
function format6(num, mode = 'round') {
  if (num === null || num === undefined || isNaN(num)) return '0.000000';
  const val = process6(num, mode);
  return val.toFixed(6);
}

/**
 * Convierte de manera segura un valor de input a número con valor por defecto.
 * @param {*} val - Valor a limpiar.
 * @param {number} fallback - Valor por defecto en caso de NaN.
 * @returns {number}
 */
function cleanNumber(val, fallback = 0) {
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

/**
 * Formatea un número flotante con N cifras decimales para visualización limpia.
 * @param {number|string} num
 * @param {number} decimals
 * @returns {string}
 */
function formatDec(num, decimals = 6) {
  if (num === null || num === undefined || isNaN(num)) return '0.' + '0'.repeat(decimals);
  const n = Number(num);
  if (Math.abs(n) < 1e-12) return (0).toFixed(decimals);
  return n.toFixed(decimals);
}

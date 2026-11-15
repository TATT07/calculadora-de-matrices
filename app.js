/**
 * CALCULADORA DE MÉTODOS NUMÉRICOS
 * -------------------------------------------------------------
 * Arquitectura modular desacoplada bajo el directorio /js:
 *
 * 1.  /js/utils.js           -> Utilidades de precisión a 6 decimales y redondeo/truncamiento.
 * 2.  /js/math-render.js     -> Motor global de tipografía matemática LaTeX (KaTeX) con MutationObserver.
 * 3.  /js/expr-parser.js     -> Compilador AST de funciones f(x) a evaluador numérico + LaTeX con sustitución.
 * 4.  /js/numcalc-common.js  -> Componentes compartidos (acordeones, tablas, parser de datos tabulados).
 * 5.  /js/linear-data.js     -> Catálogo curado de 6 ejemplos para Jacobi y Gauss-Seidel.
 * 6.  /js/linear-solver.js   -> Motor iterativo de Jacobi, Gauss-Seidel y dominancia diagonal.
 * 7.  /js/linear-ui.js       -> Interfaz matricial y desglose paso a paso en LaTeX.
 * 8.  /js/bairstow-data.js   -> Catálogo de 6 polinomios (raíces reales y complejas) para Bairstow.
 * 9.  /js/bairstow-solver.js -> Doble división sintética (b y c), sistema Jacobiano 2x2 y deflación.
 * 10. /js/bairstow-ui.js     -> Tablas sintéticas, determinantes de Cramer en LaTeX y raíces cuadráticas.
 * 11. /js/newton-data.js     -> Catálogo de 6 sistemas no lineales F(x,y)=0 para Newton multivariable.
 * 12. /js/newton-solver.js   -> Matriz Jacobiana 2x2, determinantes e incrementos vectoriales.
 * 13. /js/newton-ui.js       -> Vista en vivo LaTeX y pasos matriciales de Newton para Sistemas.
 * 14. /js/diff-data.js       -> Teoría, fórmulas y 6 ejemplos de Diferenciación Numérica (2, 3 y 5 puntos).
 * 15. /js/diff-solver.js     -> Motor de diferencias progresiva/regresiva, 3 puntos y 5 puntos + orden O(h^p).
 * 16. /js/diff-ui.js         -> Interfaz paso a paso en LaTeX para Diferenciación Numérica.
 * 17. /js/integ-data.js      -> Teoría, fórmulas y 6 ejemplos de Trapecio, Simpson, Romberg y Cuadratura Gaussiana.
 * 18. /js/integ-solver.js    -> Motores de Trapecio, Simpson 1/3 y 3/8, Romberg y Gauss–Legendre (2 a 6 puntos).
 * 19. /js/integ-ui.js        -> Interfaz paso a paso en LaTeX para Integración Numérica.
 * 20. /js/app.js             -> Coordinador principal y conmutador de los 5 módulos.
 * -------------------------------------------------------------
 */

console.log("Calculadora de Métodos Numéricos iniciada con 5 módulos y renderizado LaTeX (KaTeX).");

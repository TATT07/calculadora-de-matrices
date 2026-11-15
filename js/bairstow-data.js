/**
 * BAIRSTOW-DATA.JS
 * Catálogo curado de 6 ejemplos del Método de Bairstow para factorización
 * cuadrática y extracción de raíces reales y complejas en polinomios.
 */

const BAIRSTOW_EXAMPLES_DATA = [
  {
    id: 'bex-fesc',
    title: 'Ejemplo Guía FESC: x⁴ - x³ + 6x² - 3x + 4 = 0',
    desc: 'Ejercicio desarrollado en la libreta. Valores iniciales r₀ = 0 y s₀ = 0. Muestra la doble división sintética, el sistema 2x2 con determinantes de Cramer y la convergencia hacia el factor cuadrático.',
    category: 'Ejercicio de Libreta (FESC)',
    degree: 4,
    // P(x) = x^4 - x^3 + 6x^2 - 3x + 4
    a: [4, -3, 6, -1, 1],
    r0: 0,
    s0: 0,
    expectedFactor: 'x² - 0.530100x + 0.809500 = 0 (o x² - 0.5x + 1 redondeado didácticamente)',
    expectedRoots: 'Factor 1: r ≈ 0.5301, s ≈ -0.8095 (raíces complejas conjugadas)'
  },
  {
    id: 'bex1',
    title: 'Ejemplo 1: Polinomio de Chapra (Grado 5 - Raíces Reales y Complejas)',
    desc: 'El ejemplo canónico de Steven Chapra (Métodos Numéricos para Ingenieros). Presenta raíces complejas conjugadas y tres raíces reales.',
    category: 'Referencia Académica',
    degree: 5,
    // P(x) = x^5 - 3.5x^4 + 2.75x^3 + 2.125x^2 - 3.875x + 1.25
    a: [1.25, -3.875, 2.125, 2.75, -3.5, 1],
    r0: -1,
    s0: -1,
    expectedFactor: 'x² + 0.500000x - 0.500000 = 0 (r ≈ -0.500000, s ≈ 0.500000)',
    expectedRoots: 'x₁ = 0.500000, x₂ = -1.000000, x₃ = 2.000000, x₄,₅ = 1.000000 ± 0.500000i'
  },
  {
    id: 'bex2',
    title: 'Ejemplo 2: Raíces Complejas Puras e Imaginarias (Grado 4)',
    desc: 'Polinomio bicuadrático factorizable en dos pares complejos conjugados: uno imaginario puro y otro con amortiguamiento.',
    category: 'Álgebra & Números Complejos',
    degree: 4,
    // P(x) = (x^2 + 1)(x^2 - 2x + 5) = x^4 - 2x^3 + 6x^2 - 2x + 5
    a: [5, -2, 6, -2, 1],
    r0: 0.5,
    s0: -0.5,
    expectedFactor: 'x² + 0.000000x + 1.000000 = 0 (r ≈ 0.000000, s ≈ -1.000000)',
    expectedRoots: 'x₁,₂ = 0.000000 ± 1.000000i (±i), x₃,₄ = 1.000000 ± 2.000000i'
  },
  {
    id: 'bex3',
    title: 'Ejemplo 3: Ecuación Cúbica de Reacción Química (Grado 3)',
    desc: 'Modelo de balance molar y transferencia de masa con una raíz física real y dos modos oscilatorios amortiguados.',
    category: 'Ingeniería Química',
    degree: 3,
    // P(x) = (x - 2)(x^2 - 2x + 5) = x^3 - 4x^2 + 9x - 10
    a: [-10, 9, -4, 1],
    r0: 1,
    s0: -2,
    expectedFactor: 'x² - 2.000000x + 5.000000 = 0 (r ≈ 2.000000, s ≈ -5.000000)',
    expectedRoots: 'x₁ = 2.000000, x₂,₃ = 1.000000 ± 2.000000i'
  },
  {
    id: 'bex4',
    title: 'Ejemplo 4: Estabilidad y Control de Servomotores (Grado 4)',
    desc: 'Polinomio característico del lazo de posición de un servomotor sometido a control con dos pares oscilatorios conjugados.',
    category: 'Teoría de Control',
    degree: 4,
    // P(x) = (x^2 + x + 1)(x^2 + 2x + 4) = x^4 + 3x^3 + 7x^2 + 6x + 4
    a: [4, 6, 7, 3, 1],
    r0: -1,
    s0: -1,
    expectedFactor: 'x² + 1.000000x + 1.000000 = 0 (r ≈ -1.000000, s ≈ -1.000000)',
    expectedRoots: 'x₁,₂ = -0.500000 ± 0.866025i, x₃,₄ = -1.000000 ± 1.732051i'
  },
  {
    id: 'bex5',
    title: 'Ejemplo 5: Cuatro Raíces Reales Enteras (Grado 4)',
    desc: 'Polinomio de cuarto grado con raíces reales enteras x = 1, 2, 3, 4. Demuestra que Bairstow halla también factores cuadráticos con raíces reales.',
    category: 'Matemáticas Puras',
    degree: 4,
    // (x - 1)(x - 2)(x - 3)(x - 4) = x^4 - 10x^3 + 35x^2 - 50x + 24
    a: [24, -50, 35, -10, 1],
    r0: 2,
    s0: -1,
    expectedFactor: 'x² - 3.000000x + 2.000000 = 0 (r ≈ 3.000000, s ≈ -2.000000)',
    expectedRoots: 'x₁ = 1.000000, x₂ = 2.000000, x₃ = 3.000000, x₄ = 4.000000'
  },
  {
    id: 'bex6',
    title: 'Ejemplo 6: Dinámica y Resonancia Estructural (Grado 5)',
    desc: 'Ecuación modal de flexión en una estructura con tres modos armónicos reales y un par complejo conjugado de resonancia.',
    category: 'Ingeniería Mecánica',
    degree: 5,
    // (x^2 - x + 1)(x - 1)(x - 2)(x - 3) = x^5 - 7x^4 + 18x^3 - 23x^2 + 17x - 6
    a: [-6, 17, -23, 18, -7, 1],
    r0: 1,
    s0: -1,
    expectedFactor: 'x² - 1.000000x + 1.000000 = 0 (r ≈ 1.000000, s ≈ -1.000000)',
    expectedRoots: 'x₁,₂ = 0.500000 ± 0.866025i, x₃ = 1.000000, x₄ = 2.000000, x₅ = 3.000000'
  }
];

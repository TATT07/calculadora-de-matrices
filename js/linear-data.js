/**
 * LINEAR-DATA.JS
 * Catálogo curado de 6 ejemplos para sistemas de ecuaciones lineales (Jacobi y Gauss-Seidel).
 */

const LINEAR_EXAMPLES_DATA = [
  {
    id: 'ex1',
    title: 'Ejemplo 1: Sistema 3x3 Estándar (Diagonal Dominante)',
    desc: 'Un sistema 3x3 clásico ideal para contrastar Jacobi y Gauss-Seidel. Es estrictamente diagonal dominante.',
    category: 'Matemáticas Puras',
    size: 3,
    A: [
      [10, -1, 2],
      [-1, 11, -1],
      [2, -1, 10]
    ],
    b: [6, 25, -11],
    x0: [0, 0, 0],
    solutionEstimate: 'x₁ ≈ 1.000000, x₂ ≈ 2.000000, x₃ ≈ -1.000000'
  },
  {
    id: 'ex2',
    title: 'Ejemplo 2: Análisis de Mallas en Circuitos Eléctricos (3x3)',
    desc: 'Cálculo de intensidades de corriente I₁, I₂, I₃ en un circuito puente con resistencias acopladas.',
    category: 'Física & Circuitos',
    size: 3,
    A: [
      [12, -3, -4],
      [-3, 10, -2],
      [-4, -2, 15]
    ],
    b: [15, 20, 5],
    x0: [0, 0, 0],
    solutionEstimate: 'I₁ ≈ 2.215437 A, I₂ ≈ 2.809176 A, I₃ ≈ 1.300584 A'
  },
  {
    id: 'ex3',
    title: 'Ejemplo 3: Sistema 3x3 con Reordenamiento de Filas',
    desc: 'En su orden inicial NO es diagonal dominante. Al presionar "Ordenar Filas", se permutan las ecuaciones para asegurar convergencia.',
    category: 'Reordenamiento / Pivoteo',
    size: 3,
    A: [
      [1, 2, 10],
      [10, 1, 2],
      [2, 10, 1]
    ],
    b: [26, 14, 28],
    x0: [0, 0, 0],
    solutionEstimate: 'Requiere permutar filas. Solución: x₁ ≈ 1.000000, x₂ ≈ 2.000000, x₃ ≈ 2.000000'
  },
  {
    id: 'ex4',
    title: 'Ejemplo 4: Nodos Estructurales y Vigas (4x4)',
    desc: 'Desplazamientos elásticos en un entramado bidimensional articulado de 4 nodos.',
    category: 'Ingeniería Civil',
    size: 4,
    A: [
      [9, -2, 3, -1],
      [-2, 8, -2, 2],
      [3, -2, 11, -4],
      [-1, 2, -4, 10]
    ],
    b: [54.5, -14, 12.5, -21],
    x0: [0, 0, 0, 0],
    solutionEstimate: 'x₁ ≈ 5.000000, x₂ ≈ -1.500000, x₃ ≈ 2.000000, x₄ ≈ -1.000000'
  },
  {
    id: 'ex5',
    title: 'Ejemplo 5: Transferencia de Calor en Placa Térmica (3x3)',
    desc: 'Equilibrio de temperaturas en nodos internos de una superficie conductora sometida a condiciones de frontera fijas.',
    category: 'Termodinámica',
    size: 3,
    A: [
      [4, -1, -1],
      [-1, 4, -1],
      [-1, -1, 4]
    ],
    b: [100, 200, 50],
    x0: [0, 0, 0],
    solutionEstimate: 'T₁ ≈ 42.857143 °C, T₂ ≈ 67.857143 °C, T₃ ≈ 30.357143 °C'
  },
  {
    id: 'ex6',
    title: 'Ejemplo 6: Reactores Químicos Interconectados (4x4)',
    desc: 'Concentraciones de estado estacionario en un tren de cuatro reactores continuos de mezcla perfecta (CSTR).',
    category: 'Ingeniería Química',
    size: 4,
    A: [
      [15, -3, -1, -2],
      [-2, 12, -2, -3],
      [-1, -2, 16, -4],
      [-2, -3, -4, 20]
    ],
    b: [45, 28, 62, 30],
    x0: [0, 0, 0, 0],
    solutionEstimate: 'C₁ ≈ 4.148560, C₂ ≈ 4.120531, C₃ ≈ 5.143719, C₄ ≈ 3.535090'
  }
];

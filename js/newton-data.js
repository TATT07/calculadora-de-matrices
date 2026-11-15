/**
 * NEWTON-DATA.JS
 * Catálogo curado de 6 ejemplos para el Método de Newton-Raphson para Sistemas
 * de Ecuaciones No Lineales F(x, y) = 0 en ciencias e ingeniería.
 */

const NEWTON_EXAMPLES_DATA = [
  {
    id: 'nex1',
    title: 'Ejemplo 1: Sistema Acoplado de Chapra (Cinética Química)',
    desc: 'Problema fundamental de Steven Chapra (Métodos Numéricos para Ingenieros). Modela la interacción no lineal de concentraciones químicas y balances de materia.',
    category: 'Referencia Académica (Chapra)',
    f1Str: 'x^2 + x*y - 10',
    f2Str: 'y + 3*x*y^2 - 57',
    x0: 1.5,
    y0: 3.5,
    expectedRoot: 'x* = 2.000000, y* = 3.000000 (Raíz entera exacta)',
    applications: 'Reactores químicos de flujo continuo, balances molares no lineales y absorción.'
  },
  {
    id: 'nex2',
    title: 'Ejemplo 2: Intersección Geométrica Círculo y Parábola',
    desc: 'Intersección en el plano entre la circunferencia x² + y² = 4 y la parábola y = x² - 1. Ecuaciones con curvaturas cuadráticas contrastadas.',
    category: 'Geometría Computacional & CAD',
    f1Str: 'x^2 + y^2 - 4',
    f2Str: 'x^2 - y - 1',
    x0: 1.5,
    y0: 1.5,
    expectedRoot: 'x* ≈ 1.517490, y* ≈ 1.302776',
    applications: 'Detección de colisiones en CAD/CAM, trayectorias espaciales y diseño óptico.'
  },
  {
    id: 'nex3',
    title: 'Ejemplo 3: Sistema Clásico de Himmelblau / Burden & Faires',
    desc: 'Sistema bidimensional cuadrático clásico ampliamente documentado en optimización numérica con múltiples soluciones reales.',
    category: 'Optimización Numérica',
    f1Str: 'x^2 + y - 11',
    f2Str: 'x + y^2 - 7',
    x0: 3.5,
    y0: 2.5,
    expectedRoot: 'x* = 3.000000, y* = 2.000000 (Raíz exacta en primer cuadrante)',
    applications: 'Equilibrio de redes de distribución hidráulica y superficies de respuesta.'
  },
  {
    id: 'nex4',
    title: 'Ejemplo 4: Intersección Elipse y Exponencial Trascendente',
    desc: 'Contrasta una envolvente elíptica cerrada x² + 4y² = 16 contra una respuesta exponencial de decaimiento térmico e^x + 2y = 5.',
    category: 'Termodinámica & Calor',
    f1Str: 'x^2 + 4*y^2 - 16',
    f2Str: 'e^x + 2*y - 5',
    x0: 1.0,
    y0: 1.5,
    expectedRoot: 'x* = 0.000000, y* = 2.000000 (Solución exacta)',
    applications: 'Transferencia de calor convectiva en conductos con frontera elíptica.'
  },
  {
    id: 'nex5',
    title: 'Ejemplo 5: Cinemática Trascendente y Armónicos Trigonométricos',
    desc: 'Sistema trigonométrico no lineal que surge en la cinemática inversa de un eslabonamiento articulado robótico plano.',
    category: 'Robótica & Mecatrónica',
    f1Str: 'sin(x) + y^2 - 1',
    f2Str: 'x^2 + cos(y) - 2',
    x0: 1.2,
    y0: 0.6,
    expectedRoot: 'x* ≈ 1.034150, y* ≈ 0.374929',
    applications: 'Control de posición en manipuladores robóticos y acoplamiento armónico.'
  },
  {
    id: 'nex6',
    title: 'Ejemplo 6: Red Eléctrica con Diodos Semiconductores (Shockley)',
    desc: 'Ecuaciones nodales de Kirchhoff con dependencia exponencial de corriente-tensión característica de diodos de unión PN.',
    category: 'Circuitos Electrónicos',
    f1Str: '2*x - y - e^(-x)',
    f2Str: '-x + 2*y - e^(-y)',
    x0: 0.8,
    y0: 0.8,
    expectedRoot: 'x* ≈ 0.567143, y* ≈ 0.567143 (Punto Q de polarización simétrico)',
    applications: 'Simulación analógica de circuitos integrados no lineales y convertidores DC/DC.'
  }
];

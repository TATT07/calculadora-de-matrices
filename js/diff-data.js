/**
 * DIFF-DATA.JS
 * Contenido didáctico (teoría, fórmulas en LaTeX, pasos y guía) y catálogo de
 * ejemplos del módulo de DIFERENCIACIÓN NUMÉRICA.
 */

const DIFF_FAMILIES = {
  diff2: {
    id: 'diff2',
    short: 'Progresiva y Regresiva',
    title: 'Fórmula de diferencia (Progresiva y Regresiva)',
    desc: '2 puntos · error O(h)',
    variants: [
      { id: 'both', label: 'Ambas (progresiva y regresiva)' },
      { id: 'forward', label: 'Progresiva (hacia adelante)' },
      { id: 'backward', label: 'Regresiva (hacia atrás)' }
    ]
  },
  diff3: {
    id: 'diff3',
    short: 'Fórmula de 3 puntos',
    title: 'Fórmula de 3 puntos',
    desc: '3 puntos · error O(h²)',
    variants: [
      { id: 'mid', label: 'Punto medio (centrada)' },
      { id: 'end-fwd', label: 'Extremo izquierdo (hacia adelante)' },
      { id: 'end-bwd', label: 'Extremo derecho (hacia atrás)' }
    ]
  },
  diff5: {
    id: 'diff5',
    short: 'Fórmula de 5 puntos',
    title: 'Fórmula de 5 puntos',
    desc: '5 puntos · error O(h⁴)',
    variants: [
      { id: 'mid', label: 'Punto medio (centrada)' },
      { id: 'end-fwd', label: 'Extremo izquierdo (hacia adelante)' },
      { id: 'end-bwd', label: 'Extremo derecho (hacia atrás)' }
    ]
  }
};

const DIFF_THEORY_INTRO = String.raw`
<h2>¿Qué es la Diferenciación Numérica?</h2>
<p>La derivada de una función en un punto se define como un límite:</p>
<div class="formula-callout">\[ f'(x_0)=\lim_{h\to 0}\frac{f(x_0+h)-f(x_0)}{h} \]</div>
<p>La <strong>diferenciación numérica</strong> aproxima ese límite usando valores de \(f\) en puntos cercanos a \(x_0\) separados por un paso pequeño \(h\). Se emplea cuando <em>no se conoce la expresión de \(f\)</em> (solo una tabla de datos experimentales) o cuando derivar analíticamente es demasiado complicado.</p>

<hr class="divider">
<h3>¿De dónde salen las fórmulas?</h3>
<p>Todas se obtienen del <strong>polinomio de Taylor</strong> (o, equivalentemente, derivando el polinomio interpolante de Lagrange que pasa por los puntos). Para la diferencia progresiva:</p>
<div class="formula-callout">\[ f(x_0+h)=f(x_0)+h\,f'(x_0)+\frac{h^{2}}{2}\,f''(\xi) \quad\Longrightarrow\quad f'(x_0)=\frac{f(x_0+h)-f(x_0)}{h}-\frac{h}{2}\,f''(\xi) \]</div>
<p>El último sumando es el <strong>error de truncamiento</strong>: al usar más puntos y combinarlos con coeficientes adecuados se cancelan más términos de Taylor y el error baja de \(O(h)\) a \(O(h^2)\) y \(O(h^4)\).</p>

<hr class="divider">
<h3>Resumen de las fórmulas del curso</h3>
`;

const DIFF_THEORY_METHODS = [
  {
    id: 'forward',
    title: 'Diferencia progresiva (hacia adelante)',
    color: '#a78bfa',
    formula: String.raw`\[ f'(x_0)\approx \frac{f(x_0+h)-f(x_0)}{h}\qquad\qquad E=-\frac{h}{2}\,f''(\xi),\ \ \xi\in(x_0,x_0+h) \]`,
    what: String.raw`Usa el punto \(x_0\) y el punto de la derecha \(x_0+h\). Es la pendiente de la <em>recta secante</em> que une ambos puntos. Error \(O(h)\): si se divide \(h\) a la mitad, el error baja a la mitad.`,
    when: [
      'Cuando solo se dispone de datos a la derecha de \\(x_0\\) (inicio de la tabla).',
      'Como primera aproximación rápida cuando no se exige gran precisión.'
    ]
  },
  {
    id: 'backward',
    title: 'Diferencia regresiva (hacia atrás)',
    color: '#a78bfa',
    formula: String.raw`\[ f'(x_0)\approx \frac{f(x_0)-f(x_0-h)}{h}\qquad\qquad E=+\frac{h}{2}\,f''(\xi),\ \ \xi\in(x_0-h,x_0) \]`,
    what: String.raw`Es la misma fórmula progresiva pero con paso negativo \((h\to -h)\): usa \(x_0\) y el punto de la izquierda \(x_0-h\). También es \(O(h)\).`,
    when: [
      'Cuando solo se dispone de datos a la izquierda de \\(x_0\\) (final de la tabla).',
      'Al derivar en tiempo real usando únicamente mediciones pasadas.'
    ]
  },
  {
    id: 'three',
    title: 'Fórmula de 3 puntos (punto medio y extremos)',
    color: '#8b5cf6',
    formula: String.raw`\[
\begin{aligned}
\text{Punto medio:}\quad & f'(x_0)\approx \frac{1}{2h}\Big[f(x_0+h)-f(x_0-h)\Big], & E&=-\frac{h^{2}}{6}f'''(\xi)\\[6pt]
\text{Extremo (adelante):}\quad & f'(x_0)\approx \frac{1}{2h}\Big[-3f(x_0)+4f(x_0+h)-f(x_0+2h)\Big], & E&=+\frac{h^{2}}{3}f'''(\xi)\\[6pt]
\text{Extremo (atrás):}\quad & f'(x_0)\approx \frac{1}{2h}\Big[3f(x_0)-4f(x_0-h)+f(x_0-2h)\Big], & E&=+\frac{h^{2}}{3}f'''(\xi)
\end{aligned}
\]`,
    what: String.raw`Se obtiene derivando el polinomio de Lagrange de grado 2 por tres puntos igualmente espaciados. El <strong>punto medio</strong> es la mejor opción (su error es la mitad del de los extremos) y no necesita \(f(x_0)\). Las fórmulas de <strong>extremo</strong> se usan en los bordes de la tabla donde no hay datos a ambos lados. Error \(O(h^2)\).`,
    when: [
      'Datos con un nodo a cada lado de \\(x_0\\) → punto medio.',
      'Primer o último nodo de una tabla → extremo adelante / atrás.',
      'Se necesita más exactitud que la diferencia simple pero con pocos datos.'
    ]
  },
  {
    id: 'five',
    title: 'Fórmula de 5 puntos (punto medio y extremos)',
    color: '#7c3aed',
    formula: String.raw`\[
\begin{aligned}
\text{Punto medio:}\quad & f'(x_0)\approx \frac{1}{12h}\Big[f(x_0-2h)-8f(x_0-h)+8f(x_0+h)-f(x_0+2h)\Big], & E&=+\frac{h^{4}}{30}f^{(5)}(\xi)\\[6pt]
\text{Extremo (adelante):}\quad & f'(x_0)\approx \frac{1}{12h}\Big[-25f(x_0)+48f(x_0+h)-36f(x_0+2h)+16f(x_0+3h)-3f(x_0+4h)\Big], & E&=+\frac{h^{4}}{5}f^{(5)}(\xi)\\[6pt]
\text{Extremo (atrás):}\quad & f'(x_0)\approx \frac{1}{12h}\Big[25f(x_0)-48f(x_0-h)+36f(x_0-2h)-16f(x_0-3h)+3f(x_0-4h)\Big], & E&=+\frac{h^{4}}{5}f^{(5)}(\xi)
\end{aligned}
\]`,
    what: String.raw`Se obtiene derivando el polinomio de Lagrange de grado 4 por cinco puntos igualmente espaciados. Su error es \(O(h^4)\): al dividir \(h\) a la mitad, el error baja unas <strong>16 veces</strong>. Es la fórmula más precisa del curso, a costa de requerir más datos (y más sensibilidad al ruido de redondeo si \(h\) es muy pequeño).`,
    when: [
      'Alta precisión con funciones suficientemente suaves (\\(f^{(5)}\\) acotada).',
      'Tablas con al menos 2 nodos a cada lado de \\(x_0\\) → punto medio; en los bordes se usa el extremo.'
    ]
  }
];

const DIFF_STEPS_ALGORITHM = [
  { t: 'Identificar los datos', d: String.raw`Función \(f(x)\) (o tabla de valores), el punto \(x_0\) donde se desea la derivada y el paso \(h\) (en una tabla, \(h\) es el espaciamiento entre nodos).` },
  { t: 'Elegir la fórmula adecuada', d: String.raw`Si hay datos a ambos lados de \(x_0\) conviene el <em>punto medio</em>; en los bordes de la tabla se usa la fórmula de <em>extremo</em>. Más puntos → más precisión (\(O(h)\), \(O(h^2)\), \(O(h^4)\)).` },
  { t: 'Construir los nodos', d: String.raw`Calcular cada abscisa \(x_k=x_0+k\,h\) que exige la fórmula (con \(k\) negativo hacia atrás).` },
  { t: 'Evaluar f en cada nodo', d: String.raw`Sustituir cada \(x_k\) en \(f\) (o leer \(f(x_k)\) de la tabla).` },
  { t: 'Sustituir en la fórmula', d: String.raw`Multiplicar cada \(f(x_k)\) por su coeficiente, sumar todo el numerador y dividir entre el denominador (\(h\), \(2h\) o \(12h\)).` },
  { t: 'Estimar el error', d: String.raw`Comparar con el valor exacto (si se conoce) y verificar el orden: al dividir \(h\) entre 2, el error debe bajar \(2^{p}\) veces (\(p=1,2,4\)).` }
];

const DIFF_GUIDE_HTML = String.raw`
<h2>Guía de uso — Calculadora de Diferenciación Numérica</h2>
<h3>1. Escribir la función f(x)</h3>
<ul class="nm-guide-list">
  <li><strong>Potencias:</strong> <code>x^2</code>, <code>x^3</code>, <code>e^x</code> o <code>e^(-x^2)</code>.</li>
  <li><strong>Multiplicación implícita:</strong> <code>2x</code>, <code>3sin(x)</code>, <code>x(x+1)</code> o con asterisco <code>x*e^x</code>.</li>
  <li><strong>Funciones:</strong> <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>asin</code>, <code>atan</code>, <code>exp</code>, <code>ln</code> (natural), <code>log</code> (base 10), <code>sqrt</code>, <code>abs</code>. Constantes <code>pi</code> y <code>e</code>. <strong>Los ángulos van en radianes.</strong></li>
</ul>
<p>Mientras escribes verás la función tipografiada abajo del campo, tal como aparecería en un libro; así compruebas que la calculadora la entendió bien.</p>
<hr class="divider">
<h3>2. Elegir el subtema y la variante</h3>
<p>Selecciona <em>Progresiva y Regresiva</em>, <em>3 puntos</em> o <em>5 puntos</em> y luego la variante (punto medio o extremo). La opción "Ambas" calcula progresiva y regresiva y además su promedio, que coincide con la fórmula de 3 puntos de punto medio.</p>
<hr class="divider">
<h3>3. Datos tabulados</h3>
<p>Cambia a <strong>Tabla de datos</strong> y escribe un par <code>x  f(x)</code> por línea (espaciados igual). El paso \(h\) se toma de la tabla y \(x_0\) debe ser uno de sus nodos. Si la fórmula necesita un punto que no está en la tabla, la calculadora te lo indicará.</p>
<hr class="divider">
<h3>4. Valor exacto (opcional)</h3>
<p>Si conoces \(f'(x)\) escríbela para medir el error real. Si la dejas vacía, la calculadora usa un valor de referencia numérico de alta precisión (fórmula de 5 puntos con \(h=10^{-3}\)).</p>
<hr class="divider">
<h3>5. Cómo elegir h</h3>
<p>Un \(h\) más pequeño reduce el <em>error de truncamiento</em>, pero un \(h\) demasiado pequeño amplifica el <em>error de redondeo</em> (\(\approx \varepsilon/h\)). La tabla de convergencia del resultado muestra cómo cambia el error al dividir \(h\) entre 2.</p>
`;

const DIFF_EXAMPLES = [
  {
    id: 'dex1', title: 'Derivada de ln x con diferencia progresiva', category: 'Progresiva y Regresiva',
    desc: "Aproxima f'(1.8) para f(x)=ln x con h = 0.1 (ejemplo clásico de Burden).",
    mode: 'func', expr: 'ln(x)', exactExpr: '1/x', x0: 1.8, h: 0.1, family: 'diff2', variant: 'both'
  },
  {
    id: 'dex2', title: 'Crecimiento exponencial: progresiva vs. regresiva', category: 'Progresiva y Regresiva',
    desc: "Compara ambas diferencias para f(x)=e^x en x₀ = 1 con h = 0.1; el promedio mejora la estimación.",
    mode: 'func', expr: 'e^x', exactExpr: 'e^x', x0: 1, h: 0.1, family: 'diff2', variant: 'both'
  },
  {
    id: 'dex3', title: 'Seno con 3 puntos, punto medio', category: 'Fórmula de 3 puntos',
    desc: "f(x)=sen x en x₀ = 1 con h = 0.1. Error O(h²).",
    mode: 'func', expr: 'sin(x)', exactExpr: 'cos(x)', x0: 1, h: 0.1, family: 'diff3', variant: 'mid'
  },
  {
    id: 'dex4', title: 'x·eˣ con 3 puntos en el extremo', category: 'Fórmula de 3 puntos',
    desc: "Derivada en el borde izquierdo de los datos: f(x)=x·e^x, x₀ = 2, h = 0.1.",
    mode: 'func', expr: 'x*e^x', exactExpr: 'e^x*(x+1)', x0: 2, h: 0.1, family: 'diff3', variant: 'end-fwd'
  },
  {
    id: 'dex5', title: 'eˣ·sen x con 5 puntos, punto medio', category: 'Fórmula de 5 puntos',
    desc: "Alta precisión O(h⁴): f(x)=e^x sen x en x₀ = 1 con h = 0.1.",
    mode: 'func', expr: 'e^x*sin(x)', exactExpr: 'e^x*(sin(x)+cos(x))', x0: 1, h: 0.1, family: 'diff5', variant: 'mid'
  },
  {
    id: 'dex6', title: 'Tabla de datos x·eˣ (5 puntos)', category: 'Datos tabulados',
    desc: "Datos igualmente espaciados de f(x)=x·e^x; derivada en x₀ = 2.0 con la fórmula de 5 puntos (punto medio). Exacto: 22.167168.",
    mode: 'table', tableText: '1.8  10.889365\n1.9  12.703199\n2.0  14.778112\n2.1  17.148957\n2.2  19.855030',
    exactExpr: 'e^x*(x+1)', x0: 2.0, h: 0.1, family: 'diff5', variant: 'mid'
  }
];

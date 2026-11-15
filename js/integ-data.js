/**
 * INTEG-DATA.JS
 * Contenido didáctico (teoría, fórmulas en LaTeX, pasos y guía) y catálogo de
 * ejemplos del módulo de INTEGRACIÓN NUMÉRICA:
 *  - Método del Trapecio (simple y compuesto)
 *  - Método de Simpson (1/3 y 3/8, simples y compuestos)
 *  - Integración de Romberg (extrapolación de Richardson)
 *  - Método de Cuadratura Gaussiana (Gauss–Legendre)
 */

const INTEG_SUBTOPICS = {
  trap: {
    id: 'trap',
    short: 'Método del Trapecio',
    title: 'Método del Trapecio (Simple y Compuesto)',
    badge: 'Newton–Cotes cerrado (grado 1)',
    orderTex: 'O(h^2)',
    pointsTex: 'n+1 \\text{ nodos Igualmente Espaciados}',
    formulaTex: String.raw`\int_a^b f(x)\,dx \approx \frac{h}{2}\left[\,f(x_0) + 2\sum_{i=1}^{n-1} f(x_i) + f(x_n)\,\right], \qquad h=\frac{b-a}{n}`,
    descTex: String.raw`Aproxima el área bajo \(f(x)\) en cada subintervalo \([x_{i-1},x_i]\) mediante un <strong>trapecio lineal</strong> (polinomio de Lagrange de grado 1). El error global de truncamiento es \(E_T = -\dfrac{(b-a)\,h^2}{12}\,f''(\xi)\) con orden \(O(h^2)\).`
  },
  simpson13: {
    id: 'simpson13',
    short: 'Método de Simpson (1/3 y 3/8)',
    title: 'Método de Simpson 1/3 y 3/8 Compuesto',
    badge: 'Interpolación Parabólica y Cúbica',
    orderTex: 'O(h^4)',
    pointsTex: 'n \\text{ par (1/3) o múltiplo de 3 (3/8)}',
    formulaTex: String.raw`\int_a^b f(x)\,dx \approx \frac{h}{3}\left[\,f(x_0) + 4\sum_{i\text{ impar}}^{n-1}f(x_i) + 2\sum_{i\text{ par}}^{n-2}f(x_i) + f(x_n)\,\right]`,
    descTex: String.raw`<strong>Simpson 1/3</strong> ajusta parábolas (grado 2) cada 2 subintervalos con pesos \(1,4,2,4,\dots,4,1\) y error \(-\dfrac{(b-a)h^4}{180}f^{(4)}(\xi)\). <strong>Simpson 3/8</strong> ajusta cúbicas (grado 3) cada 3 subintervalos con pesos \(1,3,3,2,3,3,\dots,1\) y factor \(\dfrac{3h}{8}\). Ambos son exactos para polinomios de hasta grado 3 y tienen orden \(O(h^4)\).`
  },
  romberg: {
    id: 'romberg',
    short: 'Integración de Romberg',
    title: 'Integración de Romberg (Extrapolación de Richardson)',
    badge: 'Aceleración Sucesiva O(h²ʲ)',
    orderTex: 'O(h^{2k})',
    pointsTex: '2^{k-1}+1 \\text{ evaluaciones}',
    formulaTex: String.raw`R_{k,j} = R_{k,j-1} + \frac{R_{k,j-1} - R_{k-1,j-1}}{4^{\,j-1}-1}, \qquad k \ge j \ge 2`,
    descTex: String.raw`Combina la regla del trapecio sucesivamente refinada (\(h_k = (b-a)/2^{k-1}\)) con la <strong>extrapolación de Richardson</strong> para eliminar sistemáticamente los términos de error \(O(h^2), O(h^4), O(h^6),\dots\) de la expansión de Euler–Maclaurin.`
  },
  gauss: {
    id: 'gauss',
    short: 'Cuadratura Gaussiana',
    title: 'Método de Cuadratura Gaussiana (Gauss–Legendre)',
    badge: 'Nodos y Pesos Óptimos (Exactitud 2m−1)',
    orderTex: '\text{Exacta en } \mathbb{P}_{2m-1}',
    pointsTex: 'm \\text{ raíces de } P_m(t)',
    formulaTex: String.raw`\int_a^b f(x)\,dx = \frac{b-a}{2}\int_{-1}^{1} f\!\left(\frac{b-a}{2}\,t + \frac{a+b}{2}\right)dt \approx \frac{b-a}{2}\sum_{i=1}^{m} w_i\,f(x_i)`,
    descTex: String.raw`A diferencia de Newton–Cotes, elige libremente tanto los <strong>pesos \(w_i\)</strong> como las <strong>abscisas \(t_i\in(-1,1)\)</strong> (raíces del polinomio de Legendre \(P_m(t)\)) tras el cambio lineal de intervalo \([a,b]\to[-1,1]\). Con \(m\) puntos integra exactamente cualquier polinomio de grado \(\le 2m-1\).`
  }
};

const INTEG_THEORY_INTRO = String.raw`
<h2>¿Qué es la Integración Numérica (Cuadratura Numérica)?</h2>
<p>El Teorema Fundamental del Cálculo establece que \(\displaystyle \int_a^b f(x)\,dx = F(b)-F(a)\), donde \(F'(x)=f(x)\). Sin embargo, muchas funciones elementales como \(e^{-x^2}\), \(\dfrac{\sin x}{x}\) o \(\sqrt{1+x^3}\) <strong>no poseen antiderivada elemental</strong>, o bien solo se conocen mediante una tabla discreta de puntos experimentales \((x_i, f(x_i))\).</p>

<p>La <strong>integración numérica</strong> aproxima la integral definida mediante una suma ponderada finita de evaluaciones de la función en nodos seleccionados \(x_0, x_1, \dots, x_n\):</p>
<div class="formula-callout">\[ \int_a^b f(x)\,dx \approx \sum_{i=0}^{n} A_i\,f(x_i) \]</div>
<p>Según cómo se elijan los nodos \(x_i\) y los coeficientes \(A_i\), se obtienen las dos grandes familias vistas en clase: las <strong>fórmulas de Newton–Cotes</strong> (nodos igualmente espaciados: Trapecio, Simpson y su aceleración de Romberg) y la <strong>Cuadratura Gaussiana</strong> (nodos óptimos de Legendre).</p>
<hr class="divider">
<h3>Resumen de los 4 Métodos del Curso</h3>
`;

const INTEG_THEORY_METHODS = [
  {
    id: 'trap',
    title: '1. Método del Trapecio (Simple y Compuesto)',
    color: '#10b981',
    formula: String.raw`\[
\begin{aligned}
\text{Simple }(n=1):\quad & \int_a^b f(x)\,dx \approx \frac{b-a}{2}\Big[f(a)+f(b)\Big], & E_T &= -\frac{(b-a)^3}{12}\,f''(\xi)\\[6pt]
\text{Compuesto }(n\ge 1):\quad & \int_a^b f(x)\,dx \approx \frac{h}{2}\left[f(x_0) + 2\sum_{i=1}^{n-1} f(x_i) + f(x_n)\right], & E_T &= -\frac{(b-a)\,h^2}{12}\,f''(\xi)
\end{aligned}
\]`,
    what: String.raw`Sustituye \(f(x)\) en cada subintervalo \([x_{i-1},x_i]\) de ancho \(h=(b-a)/n\) por el segmento de recta que une \((x_{i-1},f(x_{i-1}))\) con \((x_i,f(x_i))\). Los nodos interiores se suman con peso \(2\) porque pertenecen a dos trapecios adyacentes, mientras los extremos \(x_0\) y \(x_n\) llevan peso \(1\).`,
    when: [
      'Funciona para cualquier número de subintervalos \\(n \\ge 1\\) (par o impar).',
      'Ideal para datos tabulados con cualquier cantidad de mediciones equiespaciadas.',
      'Sirve como columna base \\(R_{k,1}\\) para la Integración de Romberg.'
    ]
  },
  {
    id: 'simpson',
    title: '2. Método de Simpson (Reglas 1/3 y 3/8)',
    color: '#34d399',
    formula: String.raw`\[
\begin{aligned}
\text{Simpson 1/3 compuesto (}n\text{ par):}\quad & \int_a^b f(x)\,dx \approx \frac{h}{3}\left[f(x_0) + 4\sum_{i=1,3,5}^{n-1} f(x_i) + 2\sum_{i=2,4,6}^{n-2} f(x_i) + f(x_n)\right], & E_S &= -\frac{(b-a)h^4}{180}\,f^{(4)}(\xi)\\[8pt]
\text{Simpson 3/8 compuesto (}n\text{ múlt. de 3):}\quad & \int_a^b f(x)\,dx \approx \frac{3h}{8}\left[f(x_0) + 3\sum_{3\nmid i} f(x_i) + 2\sum_{i=3,6,\dots}^{n-3} f(x_i) + f(x_n)\right], & E_{3/8} &= -\frac{(b-a)h^4}{80}\,f^{(4)}(\xi)
\end{aligned}
\]`,
    what: String.raw`Integra polinomios interpolantes de Lagrange de grado superior: <strong>Simpson 1/3</strong> usa parábolas sobre pares de subintervalos (patrón de coeficientes \(1,4,2,4,\dots,2,4,1\)) y <strong>Simpson 3/8</strong> usa polinomios cúbicos sobre ternas de subintervalos (patrón \(1,3,3,2,3,3,\dots,1\)). Por simetría cancelan el término cúbico y alcanzan orden \(O(h^4)\).`,
    when: [
      'Simpson 1/3 se prefiere cuando \\(n\\) es par por su menor constante de error (\\(1/180\\) vs. \\(1/80\\)).',
      'Simpson 3/8 se aplica cuando el número de subintervalos es múltiplo de 3 (por ejemplo \\(n=3, 6, 9\\)).',
      'Alta exactitud con pocas evaluaciones para funciones suaves.'
    ]
  },
  {
    id: 'romberg',
    title: '3. Integración de Romberg',
    color: '#059669',
    formula: String.raw`\[
\begin{aligned}
R_{1,1} &= \frac{b-a}{2}\Big[f(a)+f(b)\Big], \qquad
R_{k,1} = \frac{1}{2}\left[\,R_{k-1,1} + h_{k-1}\sum_{i=1}^{2^{k-2}} f(a + (2i-1)h_k)\,\right] \\[6pt]
R_{k,j} &= R_{k,j-1} + \frac{R_{k,j-1} - R_{k-1,j-1}}{4^{\,j-1}-1} = \frac{4^{\,j-1}R_{k,j-1} - R_{k-1,j-1}}{4^{\,j-1}-1}, \qquad j=2,3,\dots,k
\end{aligned}
\]`,
    what: String.raw`Construye una tabla triangular inferior \(R_{k,j}\). La primera columna \(R_{k,1}\) contiene aproximaciones del trapecio duplicando subintervalos (\(n_k=2^{k-1}\)) sin recalcular puntos previos. Las columnas siguientes aplican la <strong>extrapolación de Richardson</strong>: \(R_{k,2}\) coincide con Simpson 1/3 (\(O(h^4)\)), \(R_{k,3}\) coincide con Boole (\(O(h^6)\)) y en general \(R_{k,j}\) tiene orden \(O(h^{2j})\).`,
    when: [
      'Cuando se conoce la expresión analítica de \\(f(x)\\) y se busca precisión de máquina.',
      'Permite controlar automáticamente el error comparando la diagonal \\(|R_{k,k}-R_{k-1,k-1}|\\).'
    ]
  },
  {
    id: 'gauss',
    title: '4. Método de Cuadratura Gaussiana (Gauss–Legendre)',
    color: '#047857',
    formula: String.raw`\[
x_i = \frac{b-a}{2}\,t_i + \frac{a+b}{2}, \qquad dx = \frac{b-a}{2}\,dt \quad\Longrightarrow\quad \int_a^b f(x)\,dx \approx \frac{b-a}{2}\sum_{i=1}^{m} w_i\,f\!\left(\frac{b-a}{2}\,t_i + \frac{a+b}{2}\right)
\]`,
    what: String.raw`Transforma cualquier intervalo \([a,b]\) al intervalo canónico \([-1,1]\) mediante cambio lineal de variable. En \([-1,1]\) evalúa la función en las raíces \(t_i\) del polinomio de Legendre \(P_m(t)\) con pesos \(w_i = \dfrac{2}{(1-t_i^2)[P'_m(t_i)]^2}\). Para \(m=2\): \(t_i = \pm\dfrac{1}{\sqrt{3}}\approx \pm 0.577350\), \(w_i=1\). Para \(m=3\): \(t_i \in \{-\sqrt{3/5}, 0, \sqrt{3/5}\}\), \(w_i \in \{5/9, 8/9, 5/9\}\).`,
    when: [
      'Proporciona la máxima exactitud posible por cada evaluación de \\(f(x)\\) (grado \\(2m-1\\)).',
      'Ideal cuando evaluar \\(f(x)\\) es computacionalmente costoso o tiene singularidades en los extremos \\(a,b\\) (pues los nodos de Gauss son interiores).'
    ]
  }
];

const INTEG_STEPS_ALGORITHM = [
  { t: '1. Definir la integral y el método', d: String.raw`Identificar el integrando \(f(x)\) (o tabla de datos) y los límites de integración \([a,b]\). Seleccionar el método según los datos y la precisión requerida.` },
  { t: '2. Calcular el tamaño de paso o cambio de variable', d: String.raw`En Trapecio y Simpson calcular \(h=\dfrac{b-a}{n}\) (verificando que \(n\) sea par para Simpson 1/3 o múltiplo de 3 para Simpson 3/8). En Cuadratura Gaussiana calcular los coeficientes de transformación \(\dfrac{b-a}{2}\) y \(\dfrac{a+b}{2}\).` },
  { t: '3. Generar los nodos y pesos', d: String.raw`Para Newton–Cotes: \(x_i = a + i\,h\) con sus multiplicadores (\(1,2,\dots,2,1\) o \(1,4,2,\dots,1\) o \(1,3,3,2,\dots,1\)). Para Gauss–Legendre: transformar cada nodo canónico \(t_i\in(-1,1)\) a \(x_i = \dfrac{b-a}{2}t_i + \dfrac{a+b}{2}\).` },
  { t: '4. Evaluar la función y acumular productos', d: String.raw`Evaluar \(f(x_i)\) en cada nodo, multiplicarlo por su peso correspondiente \(c_i\) o \(w_i\) y sumar todos los términos.` },
  { t: '5. Multiplicar por el factor global o extrapolar', d: String.raw`Multiplicar la suma acumulada por \(\dfrac{h}{2}\) (Trapecio), \(\dfrac{h}{3}\) (Simpson 1/3), \(\dfrac{3h}{8}\) (Simpson 3/8) o \(\dfrac{b-a}{2}\) (Gauss). En Romberg, aplicar recursivamente \(R_{k,j} = R_{k,j-1} + \dfrac{R_{k,j-1}-R_{k-1,j-1}}{4^{j-1}-1}\) hasta completar la diagonal.` },
  { t: '6. Analizar el error de aproximación', d: String.raw`Comparar el resultado con el valor exacto o de referencia para obtener el error absoluto \(|I - I_{\text{aprox}}|\) y el error relativo porcentual.` }
];

const INTEG_GUIDE_HTML = String.raw`
<h2>Guía de Uso — Calculadora de Integración Numérica</h2>
<h3>1. Selección del Subtema</h3>
<p>En la barra superior de la calculadora puedes conmutar directamente entre los 4 métodos de la pizarra:</p>
<ul class="nm-guide-list">
  <li><strong>Método del Trapecio:</strong> funciona para cualquier \(n \ge 1\). Si pones \(n=1\) obtienes la regla del trapecio simple; con \(n>1\) la regla compuesta.</li>
  <li><strong>Método de Simpson:</strong> permite elegir entre <strong>Simpson 1/3</strong> (\(n\) par: \(2,4,6,\dots\)) y <strong>Simpson 3/8</strong> (\(n\) múltiplo de 3: \(3,6,9,\dots\)).</li>
  <li><strong>Integración de Romberg:</strong> construye la matriz triangular \(R_{k,j}\) hasta el nivel \(k\) indicado (por ejemplo \(k=4\) usa hasta \(n=2^{3}=8\) trapecios y alcanza orden \(O(h^8)\)).</li>
  <li><strong>Cuadratura Gaussiana:</strong> permite elegir de \(m=2\) a \(m=6\) puntos de Gauss–Legendre en \([-1,1]\) y muestra explícitamente el cambio de variable lineal a \([a,b]\).</li>
</ul>
<hr class="divider">
<h3>2. Sintaxis de la Función y Límites</h3>
<ul class="nm-guide-list">
  <li>Escribe funciones en \(x\): <code>e^(-x^2)</code>, <code>sin(x)</code>, <code>1/(1+x^2)</code>, <code>x*ln(x)</code>, <code>sqrt(1+x^3)</code>.</li>
  <li>En los límites \(a\) y \(b\) puedes escribir números decimales; para múltiplos de \(\pi\) usa el valor numérico (ej. <code>3.14159265</code> para \(\pi\) o carga el ejemplo predefinido).</li>
</ul>
<hr class="divider">
<h3>3. Modo de Tabla de Datos</h3>
<p>Para Trapecio y Simpson puedes activar <strong>Tabla de datos \((x_i, f(x_i))\)</strong> e ingresar mediciones equiespaciadas. La calculadora detecta automáticamente \(a\), \(b\), \(n\) y el paso \(h\), y verifica si \(n\) cumple la condición de paridad o divisibilidad por 3.</p>
`;

const INTEG_EXAMPLES = [
  {
    id: 'iex1', title: 'Integral de ln(x) con Trapecio Compuesto', category: 'Método del Trapecio',
    desc: 'Aproxima ∫₁² ln(x) dx con n = 4 subintervalos (h = 0.25). Valor exacto: 2 ln 2 − 1 ≈ 0.38629436.',
    methodId: 'trap', mode: 'func', expr: 'ln(x)', a: 1, b: 2, n: 4, levels: 4, tol: 0, gaussPts: 3, gaussSubs: 1, exact: 0.3862943611198906
  },
  {
    id: 'iex2', title: 'Arcotangente: ∫₀¹ 4/(1+x²) dx = π con Simpson 1/3', category: 'Método de Simpson 1/3',
    desc: 'Clásico de libro para aproximar π = 3.14159265 con Simpson 1/3 compuesto usando n = 4 subintervalos.',
    methodId: 'simpson13', mode: 'func', expr: '4/(1+x^2)', a: 0, b: 1, n: 4, levels: 4, tol: 0, gaussPts: 3, gaussSubs: 1, exact: 3.141592653589793
  },
  {
    id: 'iex3', title: 'Polinomio de Chapra con Simpson 3/8 (n = 3)', category: 'Método de Simpson 3/8',
    desc: 'Integra f(x) = 0.2 + 25x − 200x² + 675x³ − 900x⁴ + 400x⁵ en [0, 0.8] con n = 3 (Exacto: 1.64053333).',
    methodId: 'simpson38', mode: 'func', expr: '0.2 + 25*x - 200*x^2 + 675*x^3 - 900*x^4 + 400*x^5', a: 0, b: 0.8, n: 3, levels: 4, tol: 0, gaussPts: 3, gaussSubs: 1, exact: 1.6405333333333333
  },
  {
    id: 'iex4', title: 'Campana de Gauss ∫₀¹ e^(−x²) dx con Romberg', category: 'Integración de Romberg',
    desc: 'Integral sin primitiva elemental resuelta mediante 4 niveles de extrapolación de Richardson (Exacto ≈ 0.74682413).',
    methodId: 'romberg', mode: 'func', expr: 'e^(-x^2)', a: 0, b: 1, n: 8, levels: 4, tol: 1e-7, gaussPts: 3, gaussSubs: 1, exact: 0.7468241328124271
  },
  {
    id: 'iex5', title: 'Integral trigonométrica ∫₀^π sen(x) dx con Romberg', category: 'Integración de Romberg',
    desc: 'Muestra cómo Romberg acelera rápidamente la regla del trapecio desde R₁,₁ = 0 hasta R₄,₄ ≈ 2.000000.',
    methodId: 'romberg', mode: 'func', expr: 'sin(x)', a: 0, b: 3.141592653589793, n: 6, levels: 4, tol: 1e-7, gaussPts: 3, gaussSubs: 1, exact: 2
  },
  {
    id: 'iex6', title: 'Cuadratura Gaussiana de 3 puntos en [1, 3]', category: 'Cuadratura Gaussiana',
    desc: 'Aproxima ∫₁³ (x³ + 2x² − x + 1) dx con m = 3 puntos de Gauss–Legendre (exactitud para grado ≤ 5; Exacto: 106/3 ≈ 35.333333).',
    methodId: 'gauss', mode: 'func', expr: 'x^3 + 2*x^2 - x + 1', a: 1, b: 3, n: 6, levels: 4, tol: 0, gaussPts: 3, gaussSubs: 1, exact: 35.333333333333336
  }
];

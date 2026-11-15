# Documentación Técnica y Matemática — Calculadora de Métodos Numéricos

> **Proyecto:** Laboratorio y Calculadora Didáctica de Métodos Numéricos  
> **Estándar Numérico:** Aritmética de punto flotante de doble precisión IEEE-754 con control de redondeo/truncamiento configurable ($4$, $6$ y $8$ cifras decimales)  
> **Tipografía Matemática:** Renderizado en tiempo real con **KaTeX (LaTeX)** mediante árbol sintáctico abstracto (AST) y `MutationObserver`  
> **Módulos Incluidos:**  
> 1. Sistemas de Ecuaciones Lineales (*Jacobi* y *Gauss–Seidel*)  
> 2. Raíces de Polinomios (*Método de Bairstow* — raíces reales y complejas conjugadas)  
> 3. Sistemas de Ecuaciones No Lineales (*Método de Newton–Raphson Multivariable* con Matriz Jacobiana)  
> 4. Diferenciación Numérica (*Diferencias Progresiva y Regresiva*, *Fórmulas de 3 Puntos* y *Fórmulas de 5 Puntos*)  
> 5. Integración Numérica (*Método del Trapecio*, *Método de Simpson 1/3 y 3/8*, *Integración de Romberg* y *Cuadratura Gaussiana*)

---

## Tabla de Contenidos

1. [Visión General y Objetivos del Sistema](#1-visión-general-y-objetivos-del-sistema)
2. [Arquitectura de Software y Estructura de Archivos](#2-arquitectura-de-software-y-estructura-de-archivos)
3. [Motor de Expresiones Matemáticas (AST) y Renderizado LaTeX](#3-motor-de-expresiones-matemáticas-ast-y-renderizado-latex)
4. [Módulo 1: Sistemas de Ecuaciones Lineales (Jacobi y Gauss–Seidel)](#4-módulo-1-sistemas-de-ecuaciones-lineales-jacobi-y-gaussseidel)
5. [Módulo 2: Raíces de Polinomios (Método de Bairstow)](#5-módulo-2-raíces-de-polinomios-método-de-bairstow)
6. [Módulo 3: Sistemas No Lineales (Método de Newton Multivariable)](#6-módulo-3-sistemas-no-lineales-método-de-newton-multivariable)
7. [Módulo 4: Diferenciación Numérica](#7-módulo-4-diferenciación-numérica)
8. [Módulo 5: Integración Numérica](#8-módulo-5-integración-numérica)
9. [Manejo de Errores, Validaciones y Criterios de Parada](#9-manejo-de-errores-validaciones-y-criterios-de-parada)
10. [Referencias Bibliográficas](#10-referencias-bibliográficas)

---

## 1. Visión General y Objetivos del Sistema

La **Calculadora de Métodos Numéricos** es una aplicación web interactiva diseñada con enfoque académico universitario. A diferencia de las calculadoras que únicamente entregan el resultado numérico final, este sistema **desglosa cada paso algebraico y aritmético** empleando la misma notación formal de los libros de texto clásicos (*Burden & Faires*, *Chapra & Canale*):

- **Notación de libro en LaTeX:** Todas las fórmulas estáticas, vistas previas de funciones y sustituciones numéricas paso a paso se tipografían mediante **KaTeX** (fracciones $\dfrac{a}{b}$, matrices $\begin{bmatrix}\cdot\end{bmatrix}$, determinantes $\begin{vmatrix}\cdot\end{vmatrix}$, radicales $\sqrt{\cdot}$, integrales definidas $\int_a^b$, sumatorias $\sum$ y derivadas parciales $\frac{\partial f_i}{\partial x_j}$).
- **Arquitectura desacoplada sin dependencias de servidor:** Funciona directamente en cualquier navegador moderno abriendo `index.html`, separando estrictamente los **datos curados (`*-data.js`)**, los **motores matemáticos (`*-solver.js`)** y la **capa de presentación (`*-ui.js`)**.
- **Catálogo de 30 problemas clásicos preconfigurados:** Cada uno de los 5 módulos incorpora 6 ejemplos representativos de ingeniería y ciencias listos para ejecutarse con un clic.

---

## 2. Arquitectura de Software y Estructura de Archivos

El proyecto sigue el patrón de separación de responsabilidades **Datos – Motor Matemático – Interfaz (Data / Solver / UI)**:

```text
Calculadora de metodos/
├── index.html                  # Estructura principal de los 5 módulos y carga de KaTeX
├── styles.css                  # Sistema de diseño oscuro de laboratorio, tarjetas y tablas
├── app.js                      # Manifiesto descriptivo de la arquitectura modular
├── DOCUMENTACION_TECNICA.md    # Documentación técnica, matemática y de arquitectura
├── MANUAL_DE_USUARIO.md        # Manual de usuario detallado paso a paso
└── js/
    ├── app.js                  # Coordinador global: inicialización y conmutación de módulos/pestañas
    ├── utils.js                # Redondeo y truncamiento estricto a 6 cifras (process6, format6, formatDec)
    ├── math-render.js          # Integración de KaTeX + MutationObserver automático (TX, TXD, renderMath)
    ├── expr-parser.js          # Analizador léxico/sintáctico (AST) de f(x) -> evaluación + LaTeX
    ├── numcalc-common.js       # Utilidades comunes: tablas (x, f(x)), acordeones NM y validadores
    │
    ├── linear-data.js          # 6 sistemas lineales curados (3x3 y 4x4) para Jacobi y Gauss-Seidel
    ├── linear-solver.js        # Algoritmo iterativo de Jacobi/Gauss-Seidel y dominancia diagonal
    ├── linear-ui.js            # Matriz interactiva, reordenamiento de filas y pasos en LaTeX
    │
    ├── bairstow-data.js        # 6 polinomios curados (grados 3 a 5, raíces reales y complejas)
    ├── bairstow-solver.js      # Doble división sintética (secuencias b y c), Cramer 2x2 y deflación
    ├── bairstow-ui.js          # Tablas sintéticas académicas, determinantes y tarjetas de raíces
    │
    ├── newton-data.js          # 6 sistemas no lineales 2x2 F(x, y) = 0
    ├── newton-solver.js        # Evaluador 2D, derivadas parciales O(h²) / analíticas y Jacobiano 2x2
    ├── newton-ui.js            # Previsualización en vivo LaTeX y desglose matricial por iteración
    │
    ├── diff-data.js            # Teoría, fórmulas y 6 ejemplos de Diferenciación Numérica
    ├── diff-solver.js          # Stencils de 2, 3 y 5 puntos (progresiva, regresiva, medio y extremos)
    ├── diff-ui.js              # Interfaz de subtemas, sustitución en LaTeX y tabla de orden O(h^p)
    │
    ├── integ-data.js           # Teoría, fórmulas y 6 ejemplos de Integración Numérica
    ├── integ-solver.js         # Trapecio, Simpson 1/3 y 3/8, Romberg y Gauss-Legendre (2 a 6 puntos)
    └── integ-ui.js             # Desarrollo paso a paso de integrales, matriz de Romberg y comparativa
```

### Flujo de Ejecución en cada Módulo

```mermaid
flowchart LR
    A["Entrada del Usuario o Ejemplo Predefinido (*-data.js)"] --> B["Validación y Parser AST (expr-parser.js / utils.js)"]
    B --> C["Motor Numérico (*-solver.js)"]
    C --> D["Generador de Pasos en LaTeX (*-ui.js)"]
    D --> E["MutationObserver + KaTeX (math-render.js)"]
    E --> F["Visualización Tipo Libro en el DOM"]
```

---

## 3. Motor de Expresiones Matemáticas (AST) y Renderizado LaTeX

### 3.1. Compilador de Funciones `ExprParser` (`js/expr-parser.js`)
Para evitar que las funciones ingresadas por el usuario se muestren como código de programación (`Math.pow(x,2)`, `e^(-x^2)`), `ExprParser` implementa un analizador descendente recursivo con las siguientes etapas:

1. **Normalización (`normalize`):** Unifica signos menos Unicode (`−`, `–`), puntos de multiplicación (`·`, `×`), exponentes superíndice (`²`, `³`), el símbolo `π` y comas decimales.
2. **Análisis Léxico (`tokenize`):** Clasifica la cadena en números en notación decimal o científica (`num`), identificadores de variables/funciones (`id`) y operadores (`op`).
3. **Construcción del Árbol Sintáctico Abstracto (`parse`):** Respeta la jerarquía estándar de operadores:
   - Nivel 1 (menor precedencia): suma `+` y resta `-`
   - Nivel 2: multiplicación explícita `*`, división `/` y **multiplicación implícita** (`2x`, `3sin(x)`, `x(x+1)`, `(x+1)(x-1)`)
   - Nivel 3: operadores unarios `-` y `+`
   - Nivel 4: potenciación asociativa por la derecha `^`
   - Nivel 5 (mayor precedencia): paréntesis, constantes (`pi`, `e`), variable `x` y llamadas a funciones elementales (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `exp`, `ln`, `log`, `sqrt`, `cbrt`, `abs`, incluyendo alias en español como `sen` y `raiz`).
4. **Doble Salida a partir del mismo AST:**
   - `compiled.f(x)`: Evalúa el árbol numéricamente en $x \in \mathbb{R}$.
   - `compiled.latex`: Genera el código LaTeX canónico (por ejemplo, `sin(x)^2 / sqrt(1+x^2)` se transforma en `\frac{\sin^{2}\left(x\right)}{\sqrt{1 + x^{2}}}`).
   - `compiled.latexAt(xStr)`: Sustituye cada aparición de la variable $x$ por el valor numérico `xStr` entre paréntesis, permitiendo mostrar exactamente cómo se evalúa $f(x_k)$ en cada nodo.

### 3.2. Renderizado Automático con KaTeX (`js/math-render.js`)
El módulo `math-render.js` configura `renderMathInElement` con delimitadores en línea `\(...\)` y `$...$`, y delimitadores en bloque `\[...\]` y `$$...$$`. Un `MutationObserver` observa `document.body` con planificación *debounced* ($40\text{ ms}$): cada vez que cualquier módulo inyecta tarjetas de pasos o actualiza la vista previa de una fórmula, KaTeX tipografía las expresiones automáticamente.

---

## 4. Módulo 1: Sistemas de Ecuaciones Lineales (Jacobi y Gauss–Seidel)

**Archivos:** `js/linear-data.js`, `js/linear-solver.js`, `js/linear-ui.js`

### 4.1. Fundamentación Matemática
Dado un sistema lineal cuadrado $A\mathbf{x} = \mathbf{b}$ de dimensión $n \times n$ ($n \in \{2, 3, 4, 5\}$) con diagonal principal no nula ($a_{ii} \neq 0$), se despeja la incógnita $x_i$ de la $i$-ésima ecuación:

$$x_i = \frac{1}{a_{ii}}\left[\,b_i - \sum_{\substack{j=1 \\ j\neq i}}^{n} a_{ij}\,x_j\,\right], \qquad i = 1, 2, \dots, n$$

- **Método de Jacobi (Desplazamientos Simultáneos):** Calcula todas las componentes de la iteración $(k)$ usando exclusivamente el vector de la iteración anterior $(k-1)$:
  $$x_i^{(k)} = \frac{1}{a_{ii}}\left[\,b_i - \sum_{\substack{j=1 \\ j\neq i}}^{n} a_{ij}\,x_j^{(k-1)}\,\right]$$
- **Método de Gauss–Seidel (Desplazamientos Sucesivos):** Utiliza de inmediato los valores $x_1^{(k)}, \dots, x_{i-1}^{(k)}$ recién calculados en la misma iteración:
  $$x_i^{(k)} = \frac{1}{a_{ii}}\left[\,b_i - \sum_{j=1}^{i-1} a_{ij}\,x_j^{(k)} - \sum_{j=i+1}^{n} a_{ij}\,x_j^{(k-1)}\,\right]$$

### 4.2. Dominancia Diagonal y Pivoteo de Filas
El módulo verifica automáticamente la condición suficiente de convergencia (**Matriz Estrictamente Diagonalmente Dominante por Filas**):

$$|a_{ii}| > \sum_{\substack{j=1 \\ j\neq i}}^{n} |a_{ij}|, \qquad \forall\, i = 1, 2, \dots, n$$

Si la matriz ingresada no cumple la condición, la función `autoReorderRows()` busca una permutación de filas que maximice los elementos diagonales y garantice la dominancia cuando sea posible.

### 4.3. Control de Precisión a 6 Decimales
A través de `process6(num, mode)` en `js/utils.js`, cada multiplicación parcial $a_{ij}x_j$, suma acumulada, numerador y cociente se ajusta estrictamente a 6 cifras decimales según el modo elegido:
- **Redondeo simétrico (`round`):** ` parseFloat(n.toFixed(6))`
- **Truncamiento directo (`truncate`):** `Math.trunc(n * 1e6) / 1e6`

---

## 5. Módulo 2: Raíces de Polinomios (Método de Bairstow)

**Archivos:** `js/bairstow-data.js`, `js/bairstow-solver.js`, `js/bairstow-ui.js`

### 5.1. Fundamentación Matemática
Dado un polinomio de grado $n \ge 3$:

$$P_n(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0 = 0$$

el Método de Bairstow divide $P_n(x)$ entre un factor cuadrático de prueba $x^2 - r x - s$:

$$P_n(x) = (x^2 - r x - s)\,Q_{n-2}(x) + b_1(x - r) + b_0$$

El objetivo es ajustar iterativamente $(r, s)$ mediante Newton–Raphson en dos variables hasta anular los residuos $b_1(r, s) = 0$ y $b_0(r, s) = 0$.

### 5.2. Doble División Sintética Recurrencia de $b_j$ y $c_j$
1. **Primera división sintética (coeficientes $b_j$):**
   $$b_n = a_n, \qquad b_{n-1} = a_{n-1} + r\,b_n, \qquad b_j = a_j + r\,b_{j+1} + s\,b_{j+2} \quad (j = n-2, \dots, 0)$$
2. **Segunda división sintética (derivadas parciales $c_j$):**
   $$c_n = b_n, \qquad c_{n-1} = b_{n-1} + r\,c_n, \qquad c_j = b_j + r\,c_{j+1} + s\,c_{j+2} \quad (j = n-2, \dots, 1)$$

### 5.3. Sistema Lineal $2\times 2$ de Incrementos y Regla de Cramer
Los incrementos $(\Delta r, \Delta s)$ satisfacen el sistema matricial:

$$\begin{bmatrix} c_2 & c_3 \\ c_1 & c_2 \end{bmatrix} \begin{bmatrix} \Delta r \\ \Delta s \end{bmatrix} = \begin{bmatrix} -b_1 \\ -b_0 \end{bmatrix}$$

Con determinante principal $\Delta = c_2^2 - c_1 c_3$, la Regla de Cramer entrega:

$$\Delta r = \frac{\begin{vmatrix} -b_1 & c_3 \\ -b_0 & c_2 \end{vmatrix}}{\Delta} = \frac{-b_1 c_2 + b_0 c_3}{c_2^2 - c_1 c_3}, \qquad \Delta s = \frac{\begin{vmatrix} c_2 & -b_1 \\ c_1 & -b_0 \end{vmatrix}}{\Delta} = \frac{-b_0 c_2 + b_1 c_1}{c_2^2 - c_1 c_3}$$

Una vez convergidos $(r^*, s^*)$, las dos raíces del factor cuadrático se extraen con la fórmula general:

$$x = \frac{r^* \pm \sqrt{(r^*)^2 + 4s^*}}{2}$$

obteniendo raíces reales si $(r^*)^2 + 4s^* \ge 0$ o un par complejo conjugado si $(r^*)^2 + 4s^* < 0$. En el modo de **Deflación Completa**, el algoritmo continúa sobre el cociente $Q_{n-2}(x)$ hasta extraer las $n$ raíces del polinomio.

---

## 6. Módulo 3: Sistemas No Lineales (Método de Newton Multivariable)

**Archivos:** `js/newton-data.js`, `js/newton-solver.js`, `js/newton-ui.js`

### 6.1. Fundamentación Matemática
Para resolver el sistema no lineal acoplado de dos ecuaciones con dos incógnitas:

$$\mathbf{F}(\mathbf{x}) = \mathbf{0} \iff \begin{cases} f_1(x, y) = 0 \\ f_2(x, y) = 0 \end{cases}$$

se expande cada función en serie de Taylor de primer orden alrededor de $(x_k, y_k)$, obteniendo el sistema lineal del paso $k$:

$$\underbrace{\begin{bmatrix} \dfrac{\partial f_1}{\partial x} & \dfrac{\partial f_1}{\partial y} \\[8pt] \dfrac{\partial f_2}{\partial x} & \dfrac{\partial f_2}{\partial y} \end{bmatrix}_{(x_k, y_k)}}_{J(x_k, y_k)} \begin{bmatrix} \Delta x \\ \Delta y \end{bmatrix} = -\begin{bmatrix} f_1(x_k, y_k) \\ f_2(x_k, y_k) \end{bmatrix}$$

### 6.2. Evaluación de Derivadas Parciales y Regla de Cramer
Si el usuario no ingresa las derivadas parciales analíticas, `evaluatePartialDerivative()` calcula automáticamente cada componente de la Matriz Jacobiana mediante **diferencias finitas centrales de orden $O(h^2)$** con $h = 10^{-6}$:

$$\frac{\partial f_i}{\partial x}(x, y) \approx \frac{f_i(x+h, y) - f_i(x-h, y)}{2h}, \qquad \frac{\partial f_i}{\partial y}(x, y) \approx \frac{f_i(x, y+h) - f_i(x, y-h)}{2h}$$

Verificando que $\det(J) = J_{11}J_{22} - J_{12}J_{21} \neq 0$, se resuelve por Cramer:

$$\Delta x = \frac{-f_1 J_{22} + f_2 J_{12}}{\det(J)}, \qquad \Delta y = \frac{-J_{11} f_2 + J_{21} f_1}{\det(J)}$$

y se actualiza el vector solución $(x_{k+1}, y_{k+1}) = (x_k + \Delta x,\, y_k + \Delta y)$ con convergencia cuadrática local $\|\mathbf{e}_{k+1}\| \le C\|\mathbf{e}_k\|^2$.

---

## 7. Módulo 4: Diferenciación Numérica

**Archivos:** `js/diff-data.js`, `js/diff-solver.js`, `js/diff-ui.js`

Todas las fórmulas implementadas en `DIFF_STENCILS` responden a la estructura general:

$$f'(x_0) \approx \frac{1}{D\cdot h}\sum_{k} c_k\,f(x_0 + s\cdot k\cdot h)$$

donde $s = +1$ (progresiva / centrada) o $s = -1$ (regresiva), y $D \in \{1, 2, 12\}$.

### 7.1. Subtema 1: Fórmulas de Diferencia Progresiva y Regresiva (2 puntos, orden $O(h)$)
- **Diferencia Progresiva (hacia adelante):**
  $$f'(x_0) = \frac{f(x_0+h) - f(x_0)}{h} - \frac{h}{2}\,f''(\xi)$$
- **Diferencia Regresiva (hacia atrás):**
  $$f'(x_0) = \frac{f(x_0) - f(x_0-h)}{h} + \frac{h}{2}\,f''(\xi)$$
- **Modo comparativo ("Ambas"):** Calcula ambas diferencias y muestra que su promedio aritmético cancela los términos $\pm\frac{h}{2}f''(x_0)$ produciendo la fórmula centrada de 3 puntos.

### 7.2. Subtema 2: Fórmulas de 3 Puntos (orden $O(h^2)$)
Obtenidas al derivar el polinomio interpolante de Lagrange de grado 2:
- **Punto medio (centrada):**
  $$f'(x_0) = \frac{1}{2h}\Big[\,f(x_0+h) - f(x_0-h)\,\Big] - \frac{h^2}{6}\,f'''(\xi)$$
- **Extremo progresivo (hacia adelante):**
  $$f'(x_0) = \frac{1}{2h}\Big[\,-3f(x_0) + 4f(x_0+h) - f(x_0+2h)\,\Big] + \frac{h^2}{3}\,f'''(\xi)$$
- **Extremo regresivo (hacia atrás):**
  $$f'(x_0) = \frac{1}{2h}\Big[\,3f(x_0) - 4f(x_0-h) + f(x_0-2h)\,\Big] + \frac{h^2}{3}\,f'''(\xi)$$

### 7.3. Subtema 3: Fórmulas de 5 Puntos (orden $O(h^4)$)
Obtenidas al derivar el polinomio interpolante de Lagrange de grado 4:
- **Punto medio (centrada):**
  $$f'(x_0) = \frac{1}{12h}\Big[\,f(x_0-2h) - 8f(x_0-h) + 8f(x_0+h) - f(x_0+2h)\,\Big] + \frac{h^4}{30}\,f^{(5)}(\xi)$$
- **Extremo progresivo (hacia adelante):**
  $$f'(x_0) = \frac{1}{12h}\Big[\,-25f(x_0) + 48f(x_0+h) - 36f(x_0+2h) + 16f(x_0+3h) - 3f(x_0+4h)\,\Big] + \frac{h^4}{5}\,f^{(5)}(\xi)$$
- **Extremo regresivo (hacia atrás):**
  $$f'(x_0) = \frac{1}{12h}\Big[\,25f(x_0) - 48f(x_0-h) + 36f(x_0-2h) - 16f(x_0-3h) + 3f(x_0-4h)\,\Big] + \frac{h^4}{5}\,f^{(5)}(\xi)$$

### 7.4. Verificación Empírica del Orden de Convergencia
Cuando se ingresa $f(x)$ en modo función, el motor evalúa la fórmula para $h_j = h/2^j$ ($j = 0, 1, 2, 3, 4$) y calcula el cociente de errores sucesivos:

$$\text{Razón}_j = \frac{|E(h_{j-1})|}{|E(h_j)|} \approx 2^p$$

confirmando experimentalmente una razón $\approx 2$ para $O(h)$, $\approx 4$ para $O(h^2)$ y $\approx 16$ para $O(h^4)$.

---

## 8. Módulo 5: Integración Numérica

**Archivos:** `js/integ-data.js`, `js/integ-solver.js`, `js/integ-ui.js`

Resuelve integrales definidas $\displaystyle I = \int_a^b f(x)\,dx$ mediante los 4 métodos del curso:

### 8.1. Subtema 1: Método del Trapecio (Simple y Compuesto)
Con $n \ge 1$ subintervalos de ancho $h = \dfrac{b-a}{n}$ y nodos $x_i = a + i\,h$:

$$\int_a^b f(x)\,dx = \frac{h}{2}\left[\,f(x_0) + 2\sum_{i=1}^{n-1} f(x_i) + f(x_n)\,\right] - \frac{(b-a)\,h^2}{12}\,f''(\xi)$$

(Si $n=1$, se reduce a la regla del trapecio simple).

### 8.2. Subtema 2: Método de Simpson (1/3 y 3/8 Compuestos)
- **Regla de Simpson 1/3 Compuesta ($n$ par, $n \ge 2$):**
  $$\int_a^b f(x)\,dx = \frac{h}{3}\left[\,f(x_0) + 4\sum_{i=1,3,5}^{n-1} f(x_i) + 2\sum_{i=2,4,6}^{n-2} f(x_i) + f(x_n)\,\right] - \frac{(b-a)\,h^4}{180}\,f^{(4)}(\xi)$$
- **Regla de Simpson 3/8 Compuesta ($n$ múltiplo de $3$, $n \ge 3$):**
  $$\int_a^b f(x)\,dx = \frac{3h}{8}\left[\,f(x_0) + 3\sum_{\substack{i=1 \\ 3\nmid i}}^{n-1} f(x_i) + 2\sum_{i=3,6,\dots}^{n-3} f(x_i) + f(x_n)\,\right] - \frac{(b-a)\,h^4}{80}\,f^{(4)}(\xi)$$

### 8.3. Subtema 3: Integración de Romberg
Construye una matriz triangular inferior $R_{k,j}$ ($1 \le j \le k \le K$):
1. **Primera columna ($j=1$, Trapecio recursivo con $n_k = 2^{k-1}$ y $h_k = (b-a)/n_k$):**
   $$R_{1,1} = \frac{b-a}{2}\big[f(a)+f(b)\big], \qquad R_{k,1} = \frac{1}{2}R_{k-1,1} + h_k \sum_{i=1}^{2^{k-2}} f\!\big(a + (2i-1)h_k\big)$$
2. **Columnas extrapoladas ($j = 2, \dots, k$, Extrapolación de Richardson de orden $O(h^{2j})$):**
   $$R_{k,j} = R_{k,j-1} + \frac{R_{k,j-1} - R_{k-1,j-1}}{4^{\,j-1} - 1}$$

### 8.4. Subtema 4: Método de Cuadratura Gaussiana (Gauss–Legendre)
Transforma el intervalo $[a, b]$ al intervalo canónico $[-1, 1]$ mediante el cambio lineal:

$$x = \frac{b-a}{2}\,t + \frac{a+b}{2}, \qquad dx = \frac{b-a}{2}\,dt$$

y aproxima la integral evaluando en las $m$ raíces $t_i \in (-1, 1)$ del polinomio de Legendre $P_m(t)$ ($m \in \{2, 3, 4, 5, 6\}$):

$$\int_a^b f(x)\,dx \approx \frac{b-a}{2}\sum_{i=1}^{m} w_i\,f\!\left(\frac{b-a}{2}\,t_i + \frac{a+b}{2}\right)$$

| Puntos $m$ | Grado de exactitud $2m-1$ | Nodos canónicos $t_i$ | Pesos $w_i$ |
| :---: | :---: | :--- | :--- |
| $2$ | Grado $\le 3$ | $\pm 0.5773502692$ ($\pm 1/\sqrt{3}$) | $1.0000000000$ |
| $3$ | Grado $\le 5$ | $0$, $\pm 0.7745966692$ ($\pm\sqrt{3/5}$) | $8/9 \approx 0.8888888889$, $5/9 \approx 0.5555555556$ |
| $4$ | Grado $\le 7$ | $\pm 0.3399810436$, $\pm 0.8611363116$ | $0.6521451549$, $0.3478548451$ |
| $5$ | Grado $\le 9$ | $0$, $\pm 0.5384693101$, $\pm 0.9061798459$ | $0.5688888889$, $0.4786286705$, $0.2369268851$ |
| $6$ | Grado $\le 11$ | $\pm 0.2386191861$, $\pm 0.6612093865$, $\pm 0.9324695142$ | $0.4679139346$, $0.3607615730$, $0.1713244924$ |

---

## 9. Manejo de Errores, Validaciones y Criterios de Parada

- **Error Relativo Porcentual Aproximado ($\varepsilon_a$):**
  $$\varepsilon_a = \left|\frac{x_{\text{nuevo}} - x_{\text{anterior}}}{x_{\text{nuevo}}}\right| \times 100\%$$
- **Error Absoluto y Relativo frente al Valor Exacto ($E_{\text{abs}}, \varepsilon_r$):**
  $$E_{\text{abs}} = \big|V_{\text{exacto}} - V_{\text{aprox}}\big|, \qquad \varepsilon_r = \frac{E_{\text{abs}}}{|V_{\text{exacto}}|} \times 100\%$$
- **Protecciones Numéricas Integradas:**
  - Detección de ceros en la diagonal principal ($a_{ii} = 0$) en sistemas lineales.
  - Detección de determinantes singulares ($|\det(J)| < 10^{-12}$) en Bairstow y Newton multivariable.
  - Verificación de dominio ($f(x)$ finita y real en cada nodo evaluado).
  - Verificación de espaciamiento uniforme $h$ constante y pertenencia de $x_0$ a la tabla en datos discretos.
  - Verificación de paridad ($n \bmod 2 = 0$) para Simpson 1/3 y divisibilidad por 3 ($n \bmod 3 = 0$) para Simpson 3/8.

---

## 10. Referencias Bibliográficas

1. **Burden, R. L., Faires, J. D., & Burden, A. M.** *Análisis Numérico* (10.ª ed.). Cengage Learning. (Capítulos 4: Diferenciación e Integración Numérica; Capítulo 7: Técnicas Iterativas en Álgebra Matricial; Capítulo 10: Sistemas de Ecuaciones No Lineales).
2. **Chapra, S. C., & Canale, R. P.** *Métodos Numéricos para Ingenieros* (7.ª ed.). McGraw-Hill Education. (Capítulo 7: Raíces de Polinomios — Método de Bairstow; Capítulos 21–23: Fórmulas de Integración de Newton–Cotes, Romberg, Cuadratura de Gauss y Diferenciación Numérica).

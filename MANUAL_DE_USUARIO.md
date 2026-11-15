# Manual de Usuario Completo — Calculadora de Métodos Numéricos

Bienvenido al **Manual de Usuario** de la Calculadora Didáctica de Métodos Numéricos. Esta guía explica paso a paso cómo utilizar cada uno de los **5 módulos principales**, cómo escribir funciones matemáticas para que se visualicen con formato de libro (LaTeX), cómo cargar tablas de datos y cómo interpretar cada resultado e iteración.

---

## Índice Rápido

1. [Cómo Iniciar y Navegar por la Aplicación](#1-cómo-iniciar-y-navegar-por-la-aplicación)
2. [Cómo Escribir Funciones Matemáticas y Verlas en Formato de Libro](#2-cómo-escribir-funciones-matemáticas-y-verlas-en-formato-de-libro)
3. [Guía del Módulo 1: Sistemas Lineales (Jacobi y Gauss–Seidel)](#3-guía-del-módulo-1-sistemas-lineales-jacobi-y-gaussseidel)
4. [Guía del Módulo 2: Método de Bairstow (Raíces de Polinomios)](#4-guía-del-módulo-2-método-de-bairstow-raíces-de-polinomios)
5. [Guía del Módulo 3: Método de Newton para Sistemas No Lineales](#5-guía-del-módulo-3-método-de-newton-para-sistemas-no-lineales)
6. [Guía del Módulo 4: Diferenciación Numérica](#6-guía-del-módulo-4-diferenciación-numérica)
7. [Guía del Módulo 5: Integración Numérica](#7-guía-del-módulo-5-integración-numérica)
8. [Exportación a PDF / Impresión de Reportes](#8-exportación-a-pdf--impresión-de-reportes)
9. [Solución de Problemas y Mensajes de Validación](#9-solución-de-problemas-y-mensajes-de-validación)

---

## 1. Cómo Iniciar y Navegar por la Aplicación

### 1.1. Apertura del Programa
1. Abre la carpeta del proyecto `Calculadora de metodos`.
2. Haz doble clic sobre el archivo **`index.html`** para abrirlo en cualquier navegador moderno (Google Chrome, Microsoft Edge, Firefox o Brave), o ábrelo con *Live Server* desde Visual Studio Code.
3. Mantén conexión a internet la primera vez para que se cargue la fuente matemática **KaTeX**, encargada de mostrar todas las fórmulas exactamente como en los libros de texto.

### 1.2. Barra Superior de los 5 Módulos
En la parte superior de la pantalla encontrarás el selector global con los **5 módulos**:
1. **Sistemas Lineales:** *Jacobi & Gauss–Seidel*
2. **Método de Bairstow:** *Raíces de Polinomios (Reales y Complejas)*
3. **Newton para Sistemas:** *Sistemas No Lineales $\mathbf{F}(x, y) = \mathbf{0}$*
4. **Diferenciación Numérica:** *Progresiva/Regresiva, 3 Puntos y 5 Puntos*
5. **Integración Numérica:** *Trapecio, Simpson, Romberg y Cuadratura Gaussiana*

### 1.3. Pestañas Internas de cada Módulo
Dentro de cada módulo dispones de pestañas didácticas:
- **Implementación (Calculadora):** Panel interactivo donde ingresas los datos y obtienes el desarrollo paso a paso.
- **¿Qué es? / Teoría:** Deducción formal de las fórmulas a partir de series de Taylor y polinomios de Lagrange.
- **¿Cuándo se usa?:** Criterios de convergencia, orden de error $O(h^p)$ y restricciones de cada método.
- **Pasos del Método:** Algoritmo numerado tal como se resuelve a mano en un examen.
- **6 Ejemplos Curados:** Catálogo de problemas de libros (*Burden*, *Chapra*) que se cargan con un solo clic.
- **Guía de Uso:** Resumen rápido de sintaxis y recomendaciones del módulo.

---

## 2. Cómo Escribir Funciones Matemáticas y Verlas en Formato de Libro

La calculadora cuenta con un **traductor matemático en vivo a LaTeX**. Mientras escribes una expresión en el cuadro de texto, debajo aparece el recuadro **"Visualización en Vivo en Formato de Libro (LaTeX)"** para que verifiques que la fórmula es exactamente la que deseas antes de calcular.

### Tabla de Sintaxis Admitida

| Operación o Función | Cómo escribirlo en el teclado | Cómo se muestra en pantalla (LaTeX) |
| :--- | :--- | :---: |
| Suma, resta y producto | `x + 2*y - 5` o `x + 2y - 5` | $x + 2y - 5$ |
| Multiplicación implícita | `2x`, `3sin(x)`, `x(x+1)` | $2x$, $3\sin(x)$, $x(x+1)$ |
| División (fracción de libro) | `(x^2 - 1)/(x^2 + 1)` | $\dfrac{x^2 - 1}{x^2 + 1}$ |
| Potencias y exponentes | `x^3`, `x^(1/2)`, `(x+1)^4` | $x^3$, $x^{1/2}$, $(x+1)^4$ |
| Exponencial natural | `e^x`, `e^(-x^2)` o `exp(-x^2)` | $e^x$, $e^{-x^2}$ |
| Logaritmo natural (base $e$) | `ln(x)` | $\ln(x)$ |
| Logaritmo decimal (base $10$) | `log(x)` | $\log_{10}(x)$ |
| Raíz cuadrada y cúbica | `sqrt(1 + x^2)`, `cbrt(x)` | $\sqrt{1 + x^2}$, $\sqrt[3]{x}$ |
| Valor absoluto | `abs(x - 2)` | $|x - 2|$ |
| Funciones trigonométricas (en **radianes**) | `sin(x)`, `cos(x)`, `tan(x)` (también `sen(x)`) | $\sin(x)$, $\cos(x)$, $\tan(x)$ |
| Potencias trigonométricas | `sin(x)^2` | $\sin^2(x)$ |
| Trigonométricas inversas | `asin(x)`, `acos(x)`, `atan(x)` | $\arcsin(x)$, $\arccos(x)$, $\arctan(x)$ |
| Hiperbólicas | `sinh(x)`, `cosh(x)`, `tanh(x)` | $\sinh(x)$, $\cosh(x)$, $\tanh(x)$ |
| Constantes $\pi$ y $e$ | `pi`, `e` | $\pi$, $e$ |

> **Importante:** Todas las funciones trigonométricas trabajan en **radianes**.

---

## 3. Guía del Módulo 1: Sistemas Lineales (Jacobi y Gauss–Seidel)

### Paso a paso para resolver un sistema $A\mathbf{x} = \mathbf{b}$:
1. **Selecciona el método iterativo:** Elige **Método de Jacobi** (simultáneo) o **Método de Gauss–Seidel** (sucesivo) en el panel izquierdo.
2. **Ajusta el tamaño del sistema ($n \times n$):** Usa los botones **`-`** y **`+`** para dimensionar la matriz desde $2\times 2$ hasta $5\times 5$.
3. **Configura los criterios de cálculo:**
   - **Modo de 6 Decimales:** *Redondeo Estándar* o *Truncamiento (Corte Directo)*.
   - **Iteraciones Mínimas y Máximas:** Número mínimo de pasos obligatorios y tope de seguridad.
   - **Tolerancia ($\varepsilon$) y Tipo de Error:** Error relativo porcentual o absoluto.
   - **Vector Inicial $\mathbf{x}^{(0)}$:** Por defecto $(0, 0, \dots, 0)$, editable para cualquier semilla.
4. **Ingresa la matriz aumentada $[A \mid \mathbf{b}]$:** Escribe los coeficientes $a_{ij}$ y los términos independientes $b_i$.
5. **Revisa el Indicador de Dominancia Diagonal:**
   - Si aparece en **verde**, la matriz es estrictamente diagonalmente dominante ($|a_{ii}| > \sum_{j\neq i}|a_{ij}|$) y la convergencia está garantizada.
   - Si aparece en **ámbar**, haz clic en el botón **"Ordenar Filas"** para que el programa intercambie ecuaciones automáticamente buscando lograr la dominancia diagonal.
6. **Haz clic en "Calcular Solución Paso a Paso":**
   - Verás las tarjetas del vector solución final $x_1, x_2, \dots, x_n$.
   - En cada tarjeta de **Iteración $k$** verás la fórmula despejada en LaTeX, la sustitución numérica con 6 decimales, el botón **"Ver desglose aritmético interno"** (suma interna, numerador y división final) y la tabla maestra de iteraciones.

---

## 4. Guía del Módulo 2: Método de Bairstow (Raíces de Polinomios)

### Paso a paso para hallar raíces reales y complejas de $P_n(x) = 0$:
1. **Selecciona el grado del polinomio ($n$):** Usa los botones **`-`** y **`+`** (grados $3$ a $8$).
2. **Ingresa los coeficientes $a_n, a_{n-1}, \dots, a_0$:** Verifica en la **Vista Previa del Polinomio** que la ecuación $P(x) = 0$ sea correcta.
3. **Define las semillas del factor cuadrático $(r_0, s_0)$:** Corresponden al divisor inicial de prueba $x^2 - r_0 x - s_0$.
4. **Elige el alcance del cálculo:**
   - *Hallar 1 factor cuadrático (2 raíces):* Detiene el proceso al converger el primer factor $x^2 - r^* x - s^*$ y muestra el polinomio deflacionado $Q_{n-2}(x)$.
   - *Hallar todas las raíces del polinomio (Deflación completa):* Aplica Bairstow sucesivamente hasta extraer las $n$ raíces.
5. **Haz clic en "Calcular Raíces con Bairstow Paso a Paso":**
   - Obtendrás el **factor cuadrático convergido** $x^2 - r^* x - s^* = 0$, el discriminante $\Delta = (r^*)^2 + 4s^*$, la fórmula general $x = \dfrac{r^* \pm \sqrt{(r^*)^2 + 4s^*}}{2}$ y las raíces clasificadas como **Reales** o **Complejas conjugadas**.
   - Cada tarjeta de **Paso $k$** incluye:
     - **Sección 1.1:** Tabla completa de la *Primera División Sintética* (secuencia $b_j$ y residuos $b_1, b_0$).
     - **Sección 1.2:** Tabla de la *Segunda División Sintética* (secuencia $c_j$: coeficientes $c_1, c_2, c_3$ del Jacobiano).
     - **Sección 1.3:** Sistema matricial $2\times 2$ en LaTeX simbólico y sustituido.
     - **Sección 1.4:** Regla de Cramer con determinantes $2\times 2$ en barras verticales $\begin{vmatrix}\cdot\end{vmatrix}$ para $\Delta$, $\Delta r$ y $\Delta s$.
     - **Sección 1.5:** Actualización $r^{(k)} = r^{(k-1)} + \Delta r$, $s^{(k)} = s^{(k-1)} + \Delta s$ y errores porcentuales $\varepsilon_r, \varepsilon_s$.

---

## 5. Guía del Módulo 3: Método de Newton para Sistemas No Lineales

### Paso a paso para resolver $\begin{cases} f_1(x, y) = 0 \\ f_2(x, y) = 0 \end{cases}$:
1. **Escribe las ecuaciones igualadas a cero:**
   - Si tu primera ecuación es $x^2 + xy = 10$, ingrésala como `x^2 + x*y - 10`.
   - Verifica ambas ecuaciones en el recuadro **"Visualización en Vivo del Sistema"**.
2. **Derivadas parciales de la Matriz Jacobiana (Opcionales):**
   - Puedes dejar los 4 campos de $\frac{\partial f_1}{\partial x}, \frac{\partial f_1}{\partial y}, \frac{\partial f_2}{\partial x}, \frac{\partial f_2}{\partial y}$ **en blanco**: la calculadora las evaluará automáticamente con diferencias finitas centradas $O(h^2)$.
   - Si deseas ingresar tus propias derivadas analíticas, despliega el panel *"Derivadas Parciales Analíticas del Jacobiano (Opcional)"*.
3. **Ingresa las semillas iniciales $(x_0, y_0)$, tolerancia y decimales.**
4. **Haz clic en "Calcular con Método de Newton para Sistemas Paso a Paso":**
   - Cada tarjeta de iteración muestra en LaTeX:
     1. Evaluación de $f_1(x_k, y_k)$, $f_2(x_k, y_k)$ y vector $-\mathbf{F}$.
     2. Matriz Jacobiana evaluada $J(x_k, y_k)$ y su determinante $\det(J)$.
     3. Sistema matricial $J\cdot [\Delta x, \Delta y]^T = -\mathbf{F}$ y solución por determinantes de Cramer para $\Delta x$ y $\Delta y$.
     4. Nuevo vector $(x_{k+1}, y_{k+1})$ y error máximo $\varepsilon_{\max} = \max(\varepsilon_x, \varepsilon_y)$.

---

## 6. Guía del Módulo 4: Diferenciación Numérica

Este módulo aproxima la primera derivada $f'(x_0)$ cubriendo los **3 subtemas de la pizarra**:

### 6.1. Selección del Subtema y Variante
En la barra superior **SUBTEMAS** elige uno de los tres botones:
1. **Fórmula de diferencia (Progresiva y Regresiva):**
   - *Ambas (progresiva y regresiva):* Calcula las dos fórmulas de 2 puntos y además demuestra cómo su promedio produce la fórmula centrada de 3 puntos.
   - *Progresiva (hacia adelante):* Usa $x_0$ y $x_0 + h$.
   - *Regresiva (hacia atrás):* Usa $x_0 - h$ y $x_0$.
2. **Fórmula de 3 puntos ($O(h^2)$):**
   - *Punto medio (centrada):* Usa $x_0 - h$ y $x_0 + h$ (la más precisa de 3 puntos).
   - *Extremo izquierdo (hacia adelante):* Usa $x_0, x_0+h, x_0+2h$ (para el primer nodo de una tabla).
   - *Extremo derecho (hacia atrás):* Usa $x_0, x_0-h, x_0-2h$ (para el último nodo de una tabla).
3. **Fórmula de 5 puntos ($O(h^4)$):**
   - *Punto medio (centrada):* Usa $x_0-2h, x_0-h, x_0+h, x_0+2h$.
   - *Extremo izquierdo / derecho:* Usa 5 nodos consecutivos desde el borde de la tabla.

### 6.2. Modo Función $f(x)$ vs. Modo Tabla $(x_i, f(x_i))$
- **Modo Función $f(x)$:** Escribe la expresión de $f(x)$, el punto $x_0$ y el paso $h > 0$. Opcionalmente puedes ingresar la derivada exacta $f'(x)$ para comparar el error exacto.
- **Modo Tabla $(x_i, f(x_i))$:** Haz clic en el botón **`Tabla (xᵢ, f(xᵢ))`** y escribe una pareja `x  f(x)` por línea separada por espacios, coma o tabulador:
  ```text
  1.8  10.889365
  1.9  12.703199
  2.0  14.778112
  2.1  17.148957
  2.2  19.855030
  ```
  La calculadora detecta automáticamente el paso uniforme $h$ y verifica que todos los nodos requeridos por la fórmula existan en la tabla.

### 6.3. Interpretación de los 4 Pasos y la Tabla de Convergencia
- **Paso 1:** Muestra la fórmula exacta del libro con su término de error $E_T$ y calcula cada nodo $x_k = x_0 + k\,h$.
- **Paso 2:** Sustituye numéricamente cada $x_k$ dentro de la expresión de $f(x)$ en LaTeX y presenta la tabla de coeficientes $c_k$ y productos $c_k f(x_k)$.
- **Paso 3:** Sustituye todos los términos dentro de la fracción general, suma el numerador y divide entre $h$, $2h$ o $12h$.
- **Paso 4:** Calcula el error absoluto $E_{\text{abs}}$ y relativo porcentual $\varepsilon_r$.
- **Tabla final de convergencia ($h \to h/2^k$):** Muestra cómo al dividir el paso $h$ a la mitad, el error se reduce a la mitad en diferencias simples ($2^1 = 2$), $4$ veces en 3 puntos ($2^2 = 4$) y $16$ veces en 5 puntos ($2^4 = 16$).

---

## 7. Guía del Módulo 5: Integración Numérica

Este módulo resuelve integrales definidas $\displaystyle \int_a^b f(x)\,dx$ cubriendo los **4 subtemas de la pizarra**:

### 7.1. Cómo usar cada uno de los 4 Subtemas
Selecciona el método en la barra **SUBTEMAS**:

1. **Método del Trapecio:**
   - Ingresa los límites $a$ y $b$, la función $f(x)$ (o una tabla de datos) y el número de subintervalos $n \ge 1$.
   - Si eliges $n = 1$, aplica la **Regla del Trapecio Simple**; si $n > 1$, aplica la **Regla del Trapecio Compuesta** con pesos $1, 2, 2, \dots, 2, 1$.
2. **Método de Simpson:**
   - Elige en el selector **"Regla de Simpson"**:
     - **Simpson 1/3 Compuesto:** Requiere que $n$ sea **par** ($n = 2, 4, 6, \dots$). Aplica pesos $1, 4, 2, 4, \dots, 4, 1$ y factor $\dfrac{h}{3}$.
     - **Simpson 3/8 Compuesto:** Requiere que $n$ sea **múltiplo de 3** ($n = 3, 6, 9, \dots$). Aplica pesos $1, 3, 3, 2, 3, 3, \dots, 1$ y factor $\dfrac{3h}{8}$.
3. **Integración de Romberg:**
   - Ingresa el número de **Niveles $k$** ($2 \le k \le 8$) y una tolerancia opcional.
   - El desarrollo muestra:
     - **Paso 1:** Cómo se calcula cada trapecio $R_{k,1}$ duplicando subintervalos ($n_k = 2^{k-1}$).
     - **Paso 2:** El desarrollo en LaTeX de cada extrapolación de Richardson $R_{k,j} = R_{k,j-1} + \dfrac{R_{k,j-1}-R_{k-1,j-1}}{4^{j-1}-1}$.
     - **Paso 3:** La **Matriz Triangular de Romberg completa**, resaltando el valor más preciso en la esquina diagonal $R_{k,k}$.
4. **Método de Cuadratura Gaussiana (Gauss–Legendre):**
   - Selecciona el número de **Puntos de Gauss–Legendre $m$** (de $2$ a $6$ puntos) y la cantidad de subintervalos (normalmente $1$ para todo el intervalo $[a, b]$).
   - El desarrollo muestra:
     - **Paso 1:** El cambio lineal de variable $x = \dfrac{b-a}{2}t + \dfrac{a+b}{2}$ y el diferencial $dx = \dfrac{b-a}{2}dt$ para pasar de $[a, b]$ a $[-1, 1]$.
     - **Paso 2:** Cada raíz canónica $t_i$ del polinomio de Legendre $P_m(t)$, su peso $w_i$, el nodo transformado $x_i$, la sustitución explícita en $f(x_i)$ y el producto $w_i f(x_i)$.
     - **Paso 3:** La suma ponderada multiplicada por el Jacobiano $\dfrac{b-a}{2}$.

### 7.2. Tabla Comparativa Automática entre los 4 Métodos
Al final de cualquier cálculo de integración con función, la calculadora presenta una **Tabla Comparativa Directa** que evalúa la misma integral con Trapecio, Simpson 1/3, Simpson 3/8, Romberg y Gauss–Legendre indicando cuántas evaluaciones de $f(x)$ utilizó cada método y cuál fue su error absoluto.

---

## 8. Exportación a PDF / Impresión de Reportes

En el encabezado de resultados de los 5 módulos encontrarás el botón **"Imprimir / Guardar PDF"**:
1. Si deseas que todos los pasos intermedios aparezcan abiertos en el PDF, haz clic primero en **"Expandir Todos"**.
2. Pulsa **"Imprimir / Guardar PDF"** (o `Ctrl + P`) y selecciona **"Guardar como PDF"**.
3. La hoja de estilos `@media print` oculta automáticamente las barras de navegación y controles de entrada, dejando únicamente el reporte limpio de resultados, fórmulas LaTeX y tablas para entregar o anexar a tus tareas.

---

## 9. Solución de Problemas y Mensajes de Validación

| Mensaje mostrado por la calculadora | Causa y cómo solucionarlo |
| :--- | :--- |
| **`Símbolo no reconocido: "..."`** | Se usó una variable distinta de `x` (en Diferenciación/Integración) o de `x, y` (en Newton). Usa siempre `x` como variable independiente. |
| **`f(x) no está definida en x = ...`** | El intervalo o nodo evalúa un logaritmo de número no positivo (`ln(0)`), una raíz negativa o una división por cero. Ajusta $x_0$, $h$ o el intervalo $[a, b]$. |
| **`Simpson 1/3 necesita un número PAR de subintervalos`** | Cambia $n$ a un número par ($2, 4, 6, 8, \dots$) o en modo tabla ingresa una cantidad **impar** de puntos (pues $n = \text{filas} - 1$). |
| **`Simpson 3/8 necesita n múltiplo de 3`** | Cambia $n$ a $3, 6, 9, 12, \dots$ |
| **`Para esta fórmula se necesita f(...), pero ese valor no está en la tabla`** | Estás intentando aplicar una fórmula centrada (punto medio) en el primer o último dato de la tabla. Cambia la **"Variante de la Fórmula"** a *Extremo izquierdo (hacia adelante)* o *Extremo derecho (hacia atrás)*. |
| **`Los datos de la tabla deben estar igualmente espaciados`** | Revisa que la diferencia $x_{i} - x_{i-1}$ entre filas consecutivas de tu tabla sea siempre constante. |
| **`Determinante Jacobiano nulo det(J) ≈ 0`** | En Bairstow o Newton multivariable las semillas iniciales cayeron sobre un punto crítico. Modifica ligeramente $(r_0, s_0)$ o $(x_0, y_0)$. |

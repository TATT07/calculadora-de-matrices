/**
 * EXPR-PARSER.JS
 * Analizador de expresiones f(x) de UNA variable para los módulos de
 * Diferenciación e Integración Numérica.
 *
 * Un solo análisis sintáctico produce un árbol (AST) que sirve para:
 *   1) EVALUAR f(x) con precisión de doble flotante, y
 *   2) ESCRIBIR f(x) en LaTeX (incluso con valores numéricos sustituidos),
 * de modo que cada paso se muestre como en los libros de texto.
 *
 * Sintaxis: + - * / ^  paréntesis, multiplicación implícita (2x, x(x+1), 3sin(x)),
 * constantes pi y e, y funciones: sin cos tan asin acos atan sinh cosh tanh
 * exp ln (natural) log (base 10) sqrt cbrt abs.
 */

const ExprParser = (function () {
  const FUNCTIONS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    exp: Math.exp, ln: Math.log, log: Math.log10,
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs
  };

  const ALIASES = {
    arcsin: 'asin', arccos: 'acos', arctan: 'atan', log10: 'log', raiz: 'sqrt', sen: 'sin', senh: 'sinh'
  };

  const LATEX_FN = {
    sin: '\\sin', cos: '\\cos', tan: '\\tan',
    asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan',
    sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh', ln: '\\ln'
  };

  function normalize(src) {
    return String(src)
      .replace(/[−–—]/g, '-')
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/(\d),(\d)/g, '$1.$2')
      .trim();
  }

  function tokenize(src) {
    const tokens = [];
    const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z_0-9]*)|(.))/gy;
    let m;
    re.lastIndex = 0;
    while (re.lastIndex < src.length && (m = re.exec(src)) !== null) {
      if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1]) });
      else if (m[2] !== undefined) tokens.push({ t: 'id', v: m[2].toLowerCase() });
      else if (m[3] !== undefined && m[3].trim() !== '') tokens.push({ t: 'op', v: m[3] });
    }
    return tokens;
  }

  function parse(srcRaw) {
    const src = normalize(srcRaw);
    if (!src) throw new Error('La función está vacía.');
    const tokens = tokenize(src);
    let pos = 0;

    const peek = () => tokens[pos];
    const isOp = (v) => tokens[pos] && tokens[pos].t === 'op' && tokens[pos].v === v;

    function expectOp(v) {
      if (!isOp(v)) throw new Error(`Se esperaba "${v}" en la expresión.`);
      pos++;
    }

    function parseExpr() {
      let left = parseTerm();
      while (isOp('+') || isOp('-')) {
        const op = tokens[pos++].v;
        const right = parseTerm();
        left = { k: 'bin', op, l: left, r: right };
      }
      return left;
    }

    function startsPrimary() {
      const tk = peek();
      if (!tk) return false;
      if (tk.t === 'id') return true;
      if (tk.t === 'num') return true;
      return tk.t === 'op' && tk.v === '(';
    }

    function parseTerm() {
      let left = parseUnary();
      for (;;) {
        if (isOp('*') || isOp('/')) {
          const op = tokens[pos++].v;
          const right = parseUnary();
          left = { k: 'bin', op, l: left, r: right };
        } else if (startsPrimary() && !(peek().t === 'num' && left.k === 'num')) {
          // Multiplicación implícita: 2x, x(x+1), 3sin(x), (x+1)(x-1)
          const right = parseUnary();
          left = { k: 'bin', op: '*', l: left, r: right, implicit: true };
        } else break;
      }
      return left;
    }

    function parseUnary() {
      if (isOp('-')) { pos++; return { k: 'neg', a: parseUnary() }; }
      if (isOp('+')) { pos++; return parseUnary(); }
      return parsePower();
    }

    function parsePower() {
      const base = parsePrimary();
      if (isOp('^')) {
        pos++;
        const exp = parseUnary();
        return { k: 'pow', b: base, e: exp };
      }
      return base;
    }

    function parsePrimary() {
      const tk = peek();
      if (!tk) throw new Error('La expresión terminó de forma inesperada.');
      if (tk.t === 'num') { pos++; return { k: 'num', v: tk.v }; }
      if (tk.t === 'id') {
        pos++;
        let name = ALIASES[tk.v] || tk.v;
        if (name === 'x') return { k: 'var' };
        if (name === 'pi') return { k: 'const', n: 'pi' };
        if (name === 'e') return { k: 'const', n: 'e' };
        if (FUNCTIONS[name]) {
          if (isOp('(')) {
            pos++;
            const arg = parseExpr();
            expectOp(')');
            return { k: 'call', f: name, a: arg };
          }
          // Argumento sin paréntesis (ej. "sin x"): toma el siguiente factor de potencia
          const arg = parsePower();
          return { k: 'call', f: name, a: arg };
        }
        throw new Error(`Símbolo no reconocido: "${tk.v}". Usa solo la variable x.`);
      }
      if (tk.t === 'op' && tk.v === '(') {
        pos++;
        const inner = parseExpr();
        expectOp(')');
        return inner;
      }
      throw new Error(`Carácter inesperado: "${tk.v}".`);
    }

    const ast = parseExpr();
    if (pos < tokens.length) throw new Error(`Sobran caracteres cerca de "${tokens[pos].v}".`);
    return ast;
  }

  function evalNode(n, x) {
    switch (n.k) {
      case 'num': return n.v;
      case 'var': return x;
      case 'const': return n.n === 'pi' ? Math.PI : Math.E;
      case 'neg': return -evalNode(n.a, x);
      case 'bin': {
        const a = evalNode(n.l, x), b = evalNode(n.r, x);
        if (n.op === '+') return a + b;
        if (n.op === '-') return a - b;
        if (n.op === '*') return a * b;
        return a / b;
      }
      case 'pow': return Math.pow(evalNode(n.b, x), evalNode(n.e, x));
      case 'call': return FUNCTIONS[n.f](evalNode(n.a, x));
      default: return NaN;
    }
  }

  // ---------- Conversión a LaTeX ----------
  const PREC = { add: 1, mul: 2, neg: 3, pow: 4, atom: 5 };

  function precOf(n) {
    if (n.k === 'bin') return (n.op === '+' || n.op === '-') ? PREC.add : PREC.mul;
    if (n.k === 'neg') return PREC.neg;
    if (n.k === 'pow') return PREC.pow;
    return PREC.atom;
  }

  function numLatex(v) {
    if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
    let s = String(v);
    if (/e/i.test(s)) {
      const [mant, ex] = s.toLowerCase().split('e');
      return `${mant} \\times 10^{${parseInt(ex, 10)}}`;
    }
    return s;
  }

  function wrap(latex) { return `\\left(${latex}\\right)`; }

  function toLatex(n, opts) {
    const o = opts || {};
    const rec = (node) => toLatex(node, o);
    const argWrap = (node) => (node.k === 'var' && o.xSub !== undefined ? rec(node) : wrap(rec(node)));
    const paren = (node, minPrec) => (precOf(node) < minPrec ? wrap(rec(node)) : rec(node));

    switch (n.k) {
      case 'num': return numLatex(n.v);
      case 'var': return o.xSub !== undefined ? wrap(o.xSub) : 'x';
      case 'const': return n.n === 'pi' ? '\\pi' : 'e';
      case 'neg': return '-' + paren(n.a, PREC.mul);
      case 'bin': {
        if (n.op === '/') return `\\frac{${rec(n.l)}}{${rec(n.r)}}`;
        if (n.op === '+') return `${rec(n.l)} + ${paren(n.r, PREC.add)}`;
        if (n.op === '-') return `${rec(n.l)} - ${paren(n.r, PREC.mul)}`;
        // multiplicación
        const l = paren(n.l, PREC.mul);
        const r = paren(n.r, PREC.mul + (n.r.k === 'bin' ? 1 : 0));
        if (n.implicit) {
          const rightStartsWithDigit = /^[0-9.]/.test(r);
          return rightStartsWithDigit ? `${l} \\cdot ${r}` : `${l}\\,${r}`;
        }
        return `${l} \\cdot ${r}`;
      }
      case 'pow': {
        if (n.b.k === 'call' && LATEX_FN[n.b.f]) {
          // Notación de libro: sen²(x) en lugar de (sen(x))²
          return `${LATEX_FN[n.b.f]}^{${rec(n.e)}}${argWrap(n.b.a)}`;
        }
        const base = (precOf(n.b) < PREC.atom || n.b.k === 'call') ? wrap(rec(n.b)) : rec(n.b);
        return `${base}^{${rec(n.e)}}`;
      }
      case 'call': {
        const arg = rec(n.a);
        if (n.f === 'sqrt') return `\\sqrt{${arg}}`;
        if (n.f === 'cbrt') return `\\sqrt[3]{${arg}}`;
        if (n.f === 'abs') return `\\left|${arg}\\right|`;
        if (n.f === 'exp') return `e^{${arg}}`;
        if (n.f === 'log') return `\\log_{10}${argWrap(n.a)}`;
        return `${LATEX_FN[n.f]}${argWrap(n.a)}`;
      }
      default: return '';
    }
  }

  /**
   * Compila una expresión f(x).
   * @returns {{ok:boolean, f?:Function, ast?:object, latex?:string, source?:string, error?:string}}
   */
  function compile(src) {
    try {
      const ast = parse(src);
      const f = (x) => evalNode(ast, x);
      return {
        ok: true,
        f,
        ast,
        source: String(src).trim(),
        latex: toLatex(ast),
        latexAt: (xStr) => toLatex(ast, { xSub: xStr })
      };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return { compile, parse, evalNode, toLatex };
})();

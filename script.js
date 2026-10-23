(() => {
  const currentEl = document.getElementById('current');
  const previewEl = document.getElementById('preview');
  const OPS = ['+', '-', '*', '/'];
  let expr = '';
  let justEvaluated = false;

  const pretty = s => s.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7').replace(/-/g, '\u2212');
  const format = n => String(parseFloat(n.toPrecision(12)));

  // ---- Parser: expression -> term -> factor (no eval) ----
  function evaluate(s) {
    const tokens = s.match(/\d+\.?\d*|\.\d+|[+\-*/]/g) || [];
    let i = 0;
    const peek = () => tokens[i];

    function factor() {
      const t = tokens[i++];
      if (t === undefined) throw new Error('syntax');
      if (t === '-') return -factor();
      if (t === '+') return factor();
      const n = parseFloat(t);
      if (isNaN(n)) throw new Error('syntax');
      return n;
    }
    function term() {
      let v = factor();
      while (peek() === '*' || peek() === '/') {
        const op = tokens[i++];
        const r = factor();
        if (op === '*') v *= r;
        else { if (r === 0) throw new Error('div0'); v /= r; }
      }
      return v;
    }
    function expression() {
      let v = term();
      while (peek() === '+' || peek() === '-') {
        const op = tokens[i++];
        const r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    const result = expression();
    if (i < tokens.length) throw new Error('syntax');
    if (!isFinite(result)) throw new Error('range');
    return result;
  }

  const stripTrailingOps = s => s.replace(/[+\-*/]+$/, '');
  const lastNumber = () => expr.match(/[\d.]*$/)[0];

  function update() {
    currentEl.textContent = expr === '' ? '0' : pretty(expr);
    previewEl.textContent = '';
    if (!justEvaluated && /[+\-*/]/.test(expr.slice(1))) {
      try { previewEl.textContent = '= ' + format(evaluate(stripTrailingOps(expr))); } catch (e) {}
    }
  }

  function startFresh() { if (justEvaluated) { expr = ''; justEvaluated = false; } }

  function inputDigit(d) { startFresh(); expr += d; update(); }

  function inputDot() {
    startFresh();
    const n = lastNumber();
    if (n.includes('.')) return;
    expr += n === '' ? '0.' : '.';
    update();
  }

  function inputOp(op) {
    justEvaluated = false;
    if (expr === '') { if (op === '-') expr = '-'; update(); return; }
    if (expr === '-') return;
    const last = expr.slice(-1);
    if (OPS.includes(last)) {
      if (op === '-' && (last === '*' || last === '/')) expr += op;
      else expr = stripTrailingOps(expr) + op;
    } else {
      expr += op;
    }
    update();
  }

  function equals() {
    const clean = stripTrailingOps(expr);
    if (clean === '' || justEvaluated) return;
    try {
      const value = format(evaluate(clean));
      update();
      expr = value;
      justEvaluated = true;
      currentEl.textContent = pretty(value);
      previewEl.textContent = pretty(clean) + ' =';
    } catch (e) {
      expr = '';
      justEvaluated = false;
      currentEl.textContent = 'Error';
      previewEl.textContent = e.message === 'div0' ? 'Division by zero' : 'Invalid expression';
    }
  }

  function backspace() {
    if (justEvaluated) { expr = ''; justEvaluated = false; }
    else expr = expr.slice(0, -1);
    update();
  }

  function clearAll() { expr = ''; justEvaluated = false; update(); }

  // ---- Mouse / touch ----
  document.getElementById('keys').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.digit !== undefined) inputDigit(b.dataset.digit);
    else if (b.dataset.op) inputOp(b.dataset.op);
    else if (b.dataset.action === 'dot') inputDot();
    else if (b.dataset.action === 'equals') equals();
    else if (b.dataset.action === 'backspace') backspace();
    else if (b.dataset.action === 'clear') clearAll();
    b.blur();
  });

  // ---- Keyboard ----
  function flash(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('pressed');
    setTimeout(() => el.classList.remove('pressed'), 100);
  }

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { inputDigit(k); flash('[data-digit="' + k + '"]'); }
    else if (k === '.' || k === ',') { inputDot(); flash('[data-action="dot"]'); }
    else if (OPS.includes(k)) { e.preventDefault(); inputOp(k); flash('[data-op="' + k + '"]'); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); flash('[data-action="equals"]'); }
    else if (k === 'Backspace') { backspace(); flash('[data-action="backspace"]'); }
    else if (k === 'Escape' || k === 'Delete') { clearAll(); flash('[data-action="clear"]'); }
  });

  update();
})();
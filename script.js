const display = document.getElementById('display');
let expression = '';
let lastResult = '';
let powMode = false;
let powBase = '';

// Button press animation
if (document.querySelectorAll) {
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mousedown', () => btn.classList.add('btn-press'));
    btn.addEventListener('mouseup', () => btn.classList.remove('btn-press'));
    btn.addEventListener('mouseleave', () => btn.classList.remove('btn-press'));
  });
}

function updateDisplay(val) {
  // Remove any leading single quote or unwanted characters
  if (typeof val === 'string') {
    val = val.replace(/^'+/, '');
  }
  display.innerText = val;
  // Use a small delay to ensure scroll works after DOM update
  setTimeout(() => {
    display.scrollLeft = display.scrollWidth;
  }, 0);
}

function safeEval(expr) {
  expr = expr.replace(/÷/g, '/').replace(/×/g, '*');
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  // Replace scientific functions with Math equivalents
  expr = expr.replace(/sin\(/g, 'Math.sin((Math.PI/180)*');
  expr = expr.replace(/cos\(/g, 'Math.cos((Math.PI/180)*');
  expr = expr.replace(/tan\(/g, 'Math.tan((Math.PI/180)*');
  expr = expr.replace(/log\(/g, 'Math.log10(');
  expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
  expr = expr.replace(/pow\(/g, 'Math.pow(');
  return Function('return ' + expr)();
}

function handleFunction(func) {
  if (["sin", "cos", "tan", "log", "sqrt"].includes(func)) {
    expression += func + '(';
    updateDisplay(expression);
    return;
  }
  if (func === 'pow') {
    expression += 'pow('; // Insert pow(
    updateDisplay(expression);
    powMode = true;
    return;
  }
  let val = null;
  let isWholeExpr = false;
  // Try to evaluate the whole expression if possible
  try {
    if (expression && !/[^0-9.\-+*/()%]/.test(expression)) {
      val = safeEval(expression);
      isWholeExpr = true;
    }
  } catch {}
  // If not, fallback to last number
  if (val === null || isNaN(val)) {
    val = getLastNumber();
    isWholeExpr = false;
  }
  if (val === null || isNaN(val)) {
    updateDisplay('Error');
    expression = '';
    return;
  }
  let result;
  if (func === 'percent') {
    result = parseFloat(val) / 100;
  }
  // Replace in expression
  if (isWholeExpr) {
    expression = '' + result;
  } else {
    replaceLastNumber(result);
    return;
  }
  updateDisplay(result);
}

function getLastNumber() {
  const match = expression.match(/([\d\.]+)(?!.*[\d\.])/);
  return match ? match[1] : null;
}

function replaceLastNumber(val) {
  expression = expression.replace(/([\d\.]+)(?!.*[\d\.])/, val);
  updateDisplay(expression);
}

function handleButton(action, value) {
  if (action === 'number' || (powMode && (value === ',' || value === ')'))) {
    expression += value;
    updateDisplay(expression);
    if (powMode && value === ')') powMode = false;
  } else if (action === 'operator') {
    expression += value;
    updateDisplay(expression);
  } else if (action === 'function') {
    handleFunction(value);
  } else if (action === 'clear') {
    expression = '';
    powMode = false;
    powBase = '';
    updateDisplay('0');
  } else if (action === 'delete') {
    if (expression.length > 0) {
      expression = expression.slice(0, -1);
      updateDisplay(expression || '0');
    }
  } else if (action === 'equals') {
    try {
      let evalExpr = expression;
      let result = safeEval(evalExpr);
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        updateDisplay(result);
        lastResult = result;
        expression = '' + result;
      } else {
        updateDisplay('Error');
        expression = '';
      }
    } catch {
      updateDisplay('Error');
      expression = '';
    }
  }
}

// Button click events
if (document.querySelectorAll) {
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const value = btn.getAttribute('data-value');
      handleButton(action, value);
    });
  });
}

// Keyboard support
if (document.addEventListener) {
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/\d/.test(key)) {
      handleButton('number', key);
    } else if (key === '.') {
      handleButton('number', '.');
    } else if (key === '+') {
      handleButton('operator', '+');
    } else if (key === '-') {
      handleButton('operator', '-');
    } else if (key === '*' || key === 'x') {
      handleButton('operator', '*');
    } else if (key === '/' || key === ':') {
      handleButton('operator', '/');
    } else if (key === 'Enter' || key === '=') {
      handleButton('equals');
    } else if (key === 'Backspace') {
      handleButton('delete');
    } else if (key === 'Delete') {
      handleButton('clear');
    } else if (key === '(') {
      handleButton('number', '(');
    } else if (key === ')') {
      handleButton('number', ')');
    } else if (key === '%') {
      handleButton('function', 'percent');
    }
    // Scientific functions via keyboard (s, c, t, l, r, p)
    else if (key === 's') {
      handleButton('function', 'sin');
    } else if (key === 'c') {
      handleButton('function', 'cos');
    } else if (key === 't') {
      handleButton('function', 'tan');
    } else if (key === 'l') {
      handleButton('function', 'log');
    } else if (key === 'r') {
      handleButton('function', 'sqrt');
    } else if (key === '^') {
      handleButton('function', 'pow');
    }
  });
} 
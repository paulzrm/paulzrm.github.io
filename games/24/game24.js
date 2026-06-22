(() => {
  const pool = document.querySelector('#number-pool');
  const status = document.querySelector('#game-status');
  const historyElement = document.querySelector('#history');
  const slots = [...document.querySelectorAll('.drop-slot')];
  let original = [];
  let cards = [];
  let history = [];
  let selection = { left: null, right: null, operator: null };
  let held = null;
  let nextId = 1;

  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  function fraction(numerator, denominator = 1) {
    if (denominator === 0) return null;
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }
    const divisor = gcd(numerator, denominator);
    return { n: numerator / divisor, d: denominator / divisor };
  }
  const equal = (a, b) => a.n === b.n && a.d === b.d;
  const format = value => value.d === 1 ? String(value.n) : `${value.n}/${value.d}`;
  const expression = card => card.expression || format(card.value);

  function calculate(left, right, operator) {
    if (operator === '+') return fraction(left.n * right.d + right.n * left.d, left.d * right.d);
    if (operator === '-') return fraction(left.n * right.d - right.n * left.d, left.d * right.d);
    if (operator === '*') return fraction(left.n * right.n, left.d * right.d);
    if (operator === '/') return right.n === 0 ? null : fraction(left.n * right.d, left.d * right.n);
    return null;
  }

  function hasSolution(values) {
    if (values.length === 1) return equal(values[0], fraction(24));
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values.length; j++) {
        if (i === j) continue;
        const rest = values.filter((_, index) => index !== i && index !== j);
        for (const operator of ['+', '-', '*', '/']) {
          if ((operator === '+' || operator === '*') && i > j) continue;
          const result = calculate(values[i], values[j], operator);
          if (result && hasSolution([...rest, result])) return true;
        }
      }
    }
    return false;
  }

  function randomPuzzle() {
    for (let attempts = 0; attempts < 500; attempts++) {
      const numbers = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 10));
      if (new Set(numbers).size === 1) continue;
      if (hasSolution(numbers.map(number => fraction(number)))) return numbers;
    }
    return [1, 3, 4, 6];
  }

  function makeCard(value, exp = null) {
    return { id: nextId++, value, expression: exp || format(value), used: false };
  }

  function renderCards() {
    pool.innerHTML = cards.filter(card => !card.used).map(card => `
      <div class="number-card" draggable="true" data-card-id="${card.id}" title="${card.expression}">
        ${format(card.value)}
      </div>`).join('');
    renderSlots();
    historyElement.innerHTML = history.map(item => `<div>${item}</div>`).join('');
    const active = cards.filter(card => !card.used);
    if (active.length === 1) {
      if (equal(active[0].value, fraction(24))) {
        status.textContent = `完成：${active[0].expression} = 24`;
        status.className = 'status victory';
      } else {
        status.textContent = `只剩 ${format(active[0].value)}，重新开始或换一道题再试。`;
        status.className = 'status';
      }
    }
  }

  function renderSlots() {
    slots.forEach(slot => {
      const type = slot.dataset.slot;
      const value = selection[type];
      if (type === 'operator') {
        slot.innerHTML = value ? `<div class="operator-card">${value === '*' ? '×' : value === '/' ? '÷' : value}</div>` : '运算符';
      } else {
        const card = cards.find(item => item.id === value);
        slot.innerHTML = card ? `<div class="number-card">${format(card.value)}</div>` : (type === 'left' ? '左侧数字' : '右侧数字');
      }
    });
  }

  function clearSelection() {
    selection = { left: null, right: null, operator: null };
    held = null;
    renderSlots();
  }

  function start(numbers = randomPuzzle()) {
    original = [...numbers];
    nextId = 1;
    cards = numbers.map(number => makeCard(fraction(number)));
    history = [];
    clearSelection();
    status.textContent = '把两个数字拖入左右区域，再把运算符拖到中间。';
    status.className = 'status';
    renderCards();
  }

  document.addEventListener('dragstart', event => {
    const number = event.target.closest('[data-card-id]');
    const operator = event.target.closest('[data-operator]');
    if (number) event.dataTransfer.setData('application/x-number-card', number.dataset.cardId);
    if (operator) event.dataTransfer.setData('application/x-operator', operator.dataset.operator);
  });

  document.addEventListener('click', event => {
    const number = event.target.closest('[data-card-id]');
    const operator = event.target.closest('[data-operator]');
    if (number) {
      held = { type: 'number', value: Number(number.dataset.cardId) };
      status.textContent = '已选中数块，请点击左侧或右侧区域。';
    }
    if (operator) {
      held = { type: 'operator', value: operator.dataset.operator };
      status.textContent = '已选中运算符，请点击中间区域。';
    }
  });

  slots.forEach(slot => {
    slot.addEventListener('dragover', event => {
      event.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', event => {
      event.preventDefault();
      slot.classList.remove('drag-over');
      const type = slot.dataset.slot;
      if (type === 'operator') {
        const operator = event.dataTransfer.getData('application/x-operator');
        if (operator) selection.operator = operator;
      } else {
        const id = Number(event.dataTransfer.getData('application/x-number-card'));
        const card = cards.find(item => item.id === id && !item.used);
        if (!card) return;
        const other = type === 'left' ? 'right' : 'left';
        if (selection[other] === id) selection[other] = null;
        selection[type] = id;
      }
      renderSlots();
    });
    slot.addEventListener('click', () => {
      const type = slot.dataset.slot;
      if (held?.type === 'operator' && type === 'operator') selection.operator = held.value;
      else if (held?.type === 'number' && type !== 'operator') {
        const card = cards.find(item => item.id === held.value && !item.used);
        if (card) {
          const other = type === 'left' ? 'right' : 'left';
          if (selection[other] === card.id) selection[other] = null;
          selection[type] = card.id;
        }
      } else selection[type] = null;
      held = null;
      renderSlots();
    });
  });

  document.querySelector('#combine').addEventListener('click', () => {
    const left = cards.find(card => card.id === selection.left && !card.used);
    const right = cards.find(card => card.id === selection.right && !card.used);
    const operator = selection.operator;
    if (!left || !right || !operator || left.id === right.id) {
      status.textContent = '操作区还缺少数字或运算符。';
      return;
    }
    const value = calculate(left.value, right.value, operator);
    if (!value) {
      status.textContent = '不能除以 0。';
      return;
    }
    const symbol = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
    const exp = `(${expression(left)} ${symbol} ${expression(right)})`;
    left.used = true;
    right.used = true;
    cards.push(makeCard(value, exp));
    history.push(`${exp} = ${format(value)}`);
    clearSelection();
    status.textContent = `得到新的数块：${format(value)}`;
    status.className = 'status';
    renderCards();
  });

  document.querySelector('#clear-slots').addEventListener('click', clearSelection);
  document.querySelector('#restart').addEventListener('click', () => start(original));
  document.querySelector('#new-puzzle').addEventListener('click', () => start());
  start();
})();

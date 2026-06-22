(() => {
  const dictionary = window.WORDLE_WORDS;
  const board = document.querySelector('#wordle-board');
  const keyboard = document.querySelector('#keyboard');
  const status = document.querySelector('#wordle-status');
  const lengthSelect = document.querySelector('#word-length');
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  let wordLength = 5;
  let answer = '';
  let guesses = [];
  let current = '';
  let over = false;

  const maxGuesses = () => wordLength + 1;

  function chooseAnswer() {
    wordLength = Number(lengthSelect.value);
    const candidates = dictionary.answers[wordLength];
    answer = candidates[Math.floor(Math.random() * candidates.length)];
    guesses = [];
    current = '';
    over = false;
    status.textContent = '';
    status.className = 'status';
    render();
  }

  function score(guess) {
    const result = Array(wordLength).fill('absent');
    const remaining = {};
    for (let i = 0; i < wordLength; i++) {
      if (guess[i] === answer[i]) result[i] = 'correct';
      else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < wordLength; i++) {
      if (result[i] === 'correct') continue;
      if (remaining[guess[i]]) {
        result[i] = 'present';
        remaining[guess[i]]--;
      }
    }
    return result;
  }

  function keyStates() {
    const states = {};
    const priority = { absent: 1, present: 2, correct: 3 };
    guesses.forEach(guess => score(guess).forEach((state, index) => {
      const letter = guess[index];
      if (!states[letter] || priority[state] > priority[states[letter]]) states[letter] = state;
    }));
    return states;
  }

  function render() {
    board.innerHTML = '';
    for (let row = 0; row < maxGuesses(); row++) {
      const rowElement = document.createElement('div');
      rowElement.className = 'wordle-row';
      rowElement.style.setProperty('--word-length', wordLength);
      const word = guesses[row] || (row === guesses.length ? current : '');
      const states = guesses[row] ? score(guesses[row]) : [];
      for (let column = 0; column < wordLength; column++) {
        const tile = document.createElement('div');
        tile.className = `letter-tile${word[column] ? ' filled' : ''}${states[column] ? ` ${states[column]}` : ''}`;
        tile.textContent = word[column] || '';
        rowElement.append(tile);
      }
      board.append(rowElement);
    }
    const states = keyStates();
    keyboard.innerHTML = rows.map((row, index) => `
      <div class="key-row">
        ${index === 2 ? '<button class="key wide" data-key="ENTER">Enter</button>' : ''}
        ${[...row].map(letter => `<button class="key ${states[letter] || ''}" data-key="${letter}">${letter}</button>`).join('')}
        ${index === 2 ? '<button class="key wide" data-key="BACKSPACE">⌫</button>' : ''}
      </div>`).join('');
  }

  function submit() {
    if (current.length !== wordLength) return message(`还需要输入 ${wordLength} 个字母。`);
    if (!dictionary.valid[wordLength].includes(current)) return message('词库中没有这个单词，换一个试试。');
    guesses.push(current);
    if (current === answer) {
      over = true;
      message(`答对了！答案是 ${answer}。`, true);
    } else if (guesses.length === maxGuesses()) {
      over = true;
      message(`本轮结束，答案是 ${answer}。`);
    } else {
      status.textContent = '';
    }
    current = '';
    render();
  }

  function message(text, victory = false) {
    status.textContent = text;
    status.classList.toggle('victory', victory);
  }

  function input(key) {
    if (over) return;
    if (key === 'ENTER') submit();
    else if (key === 'BACKSPACE') {
      current = current.slice(0, -1);
      status.textContent = '';
      render();
    } else if (/^[A-Z]$/.test(key) && current.length < wordLength) {
      current += key;
      status.textContent = '';
      render();
    }
  }

  keyboard.addEventListener('click', event => {
    const key = event.target.closest('[data-key]')?.dataset.key;
    if (key) input(key);
  });
  document.addEventListener('keydown', event => {
    const key = event.key === 'Enter' ? 'ENTER' : event.key === 'Backspace' ? 'BACKSPACE' : event.key.toUpperCase();
    if (key === 'BACKSPACE') event.preventDefault();
    input(key);
  });
  document.querySelector('#new-word').addEventListener('click', chooseAnswer);
  lengthSelect.addEventListener('change', chooseAnswer);
  chooseAnswer();
})();

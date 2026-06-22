(() => {
  const answers = [
    'ALERT', 'ALONE', 'ANGLE', 'APPLE', 'BEACH', 'BRAIN', 'BRAVE', 'BREAD',
    'CHAIR', 'CHARM', 'CLOUD', 'CODEX', 'CRANE', 'DREAM', 'EARTH', 'FLAME',
    'FOCUS', 'FRAME', 'GRACE', 'GRAPH', 'GREEN', 'HEART', 'HOUSE', 'LIGHT',
    'MAGIC', 'MAPLE', 'MUSIC', 'OCEAN', 'PAINT', 'PLANT', 'POINT', 'PRIDE',
    'QUEST', 'RIVER', 'ROBOT', 'SHARE', 'SHINE', 'SOLVE', 'SPACE', 'STONE',
    'STORY', 'TABLE', 'TIGER', 'TRAIN', 'VALUE', 'WATER', 'WORLD', 'WRITE'
  ];
  const valid = new Set(answers.concat([
    'ABOUT', 'ABOVE', 'ACTOR', 'ADORE', 'AFTER', 'AGAIN', 'AGENT', 'AGREE',
    'BLACK', 'BLOCK', 'BOARD', 'CARRY', 'CLEAR', 'CLOSE', 'COUNT', 'DAILY',
    'DANCE', 'DRIVE', 'ENJOY', 'FIELD', 'FINAL', 'FIRST', 'FRESH', 'FRUIT',
    'GAMES', 'GREAT', 'HAPPY', 'IDEAL', 'LEARN', 'LEVEL', 'LUCKY', 'MAJOR',
    'MATCH', 'MODEL', 'NIGHT', 'NORTH', 'NOVEL', 'OTHER', 'POWER', 'READY',
    'RIGHT', 'ROUND', 'SCORE', 'SHORT', 'SMART', 'SOUND', 'START', 'STYLE',
    'THINK', 'THREE', 'UNDER', 'VIDEO', 'VOICE', 'WHITE', 'WOMAN', 'YOUNG'
  ]));
  const board = document.querySelector('#wordle-board');
  const keyboard = document.querySelector('#keyboard');
  const status = document.querySelector('#wordle-status');
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  let answer, guesses, current, over;

  function chooseAnswer() {
    answer = answers[Math.floor(Math.random() * answers.length)];
    guesses = [];
    current = '';
    over = false;
    status.textContent = '';
    render();
  }

  function score(guess) {
    const result = Array(5).fill('absent');
    const remaining = {};
    for (let i = 0; i < 5; i++) {
      if (guess[i] === answer[i]) result[i] = 'correct';
      else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < 5; i++) {
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
    for (let row = 0; row < 6; row++) {
      const rowElement = document.createElement('div');
      rowElement.className = 'wordle-row';
      const word = guesses[row] || (row === guesses.length ? current : '');
      const states = guesses[row] ? score(guesses[row]) : [];
      for (let column = 0; column < 5; column++) {
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
    if (current.length !== 5) return message('还需要输入五个字母。');
    if (!valid.has(current)) return message('词库中没有这个单词，换一个试试。');
    guesses.push(current);
    if (current === answer) {
      over = true;
      message(`答对了！答案是 ${answer}。`, true);
    } else if (guesses.length === 6) {
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
    } else if (/^[A-Z]$/.test(key) && current.length < 5) {
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
  chooseAnswer();
})();

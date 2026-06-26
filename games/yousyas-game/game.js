(() => {
  "use strict";

  const SAVE_KEY = "yousyas-game-web-save-v2";
  const VERSION = 2;
  const SECRET = "YG-WEB::the-voice-beyond-the-board::2026";
  const DEV_CODE = "paulzrm";
  const COMPASS_PRICE = 30;
  const HEAL_PRICE = 50;
  const TICK_MS = 100;
  const D = [[-1, 0], [0, 1], [1, 0], [0, -1], [0, 0]];
  const SWORD = ["|", "-", "|", "-"];
  const CELL = { BLUE: -3, RED: -2, WALL: -1, EMPTY: 0, COIN: 6, BEACON: 4, OBST: 5, KEY: 11, PALACE: 10, LIGHT: 12 };

  const $ = (s) => document.querySelector(s);
  const ui = {
    stage: $("#ascii-stage"),
    scene: $("#scene-name"),
    turn: $("#turn-counter"),
    speaker: $("#speaker"),
    text: $("#dialogue"),
    choices: $("#choice-list"),
    hp: $("#stat-hp"),
    money: $("#stat-money"),
    kills: $("#stat-kills"),
    chapter: $("#stat-stage"),
    objective: $("#objective-title"),
    detail: $("#objective-detail"),
    bar: $("#objective-bar"),
    save: $("#save-modal"),
    help: $("#help-modal"),
    code: $("#save-code"),
    saveStatus: $("#save-status"),
    rangeToggle: $("#range-toggle"),
  };

  const fresh = () => ({
    version: VERSION,
    mode: "menu",
    scene: "menu",
    stage: 0,
    turn: 0,
    paused: false,
    die: false,
    devMode: false,
    shopOpen: false,
    grid: null,
    gridName: "",
    n: 0,
    m: 0,
    player: { x: 1, y: 1, dir: 2, hp: 3, money: 0, left: false, leftx: 0, lefty: 0, weapon: true },
    enemies: [],
    countKill: 0,
    sessionKill: 0,
    countKey: 0,
    nKey: 0,
    touchPalace: 0,
    haveEnd: Array(8).fill(false),
    skipPlot: 0,
    ableV: false,
    ableC: false,
    ableF: false,
    mov: 0,
    inTut: 1,
    specialRule: 0,
    cantStop: 0,
    enemyLimit: 6,
    enemySpeed: 0,
    enemyEyesight: 5,
    enemyStopTime: 5,
    attackWaitTime: 2,
    generateLimit: -1,
    maxCoin: 10,
    haveCoin: 0,
    lastCoinGenerate: 0,
    lastGenerate: 0,
    lastUpdate: 0,
    newEnemyTime: 10,
    updateTime: 50,
    standardClock: 0,
    lastMove: 0,
    timerStart: 0,
    timerGoal: 0,
    timerKind: "",
    route: null,
    compassTarget: null,
    originalKills: 0,
    confirmRoute: null,
    speaker: "SYSTEM",
    message: "等待勇者回应。",
    hudExtra: "",
  });

  let state = fresh();
  let locked = false;
  let loopId = null;
  let typeTimer = null;
  let typing = { active: false, shown: "", full: "", token: 0 };
  let showEnemyRange = localStorage.getItem("yousyas-game-show-range") === "1";
  let devBuffer = "";

  const rand = (n) => Math.floor(Math.random() * n);
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const TITLE_ART = [
    "██╗   ██╗ ██████╗ ██╗   ██╗███████╗██╗   ██╗ █████╗ ███████╗",
    "╚██╗ ██╔╝██╔═══██╗██║   ██║██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝",
    " ╚████╔╝ ██║   ██║██║   ██║███████╗ ╚████╔╝ ███████║███████╗",
    "  ╚██╔╝  ██║   ██║██║   ██║╚════██║  ╚██╔╝  ██╔══██║╚════██║",
    "   ██║   ╚██████╔╝╚██████╔╝███████║   ██║   ██║  ██║███████║",
    "   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝",
    "",
    "             ██████╗  █████╗ ███╗   ███╗███████╗",
    "             ██╔════╝ ██╔══██╗████╗ ████║██╔════╝",
    "             ██║  ███╗███████║██╔████╔██║█████╗",
    "             ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝",
    "             ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗",
    "              ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝",
  ].join("\n");

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function richText(text) {
    const tokens = [
      [/勇者/g, "blue-text"],
      [/魔王|魔物|敌人|击杀|死亡|炎之巨人|人类联军|追猎型魔物/g, "red-text"],
      [/霜心|冰霜女巫|钥匙|(?<![A-Za-z0-9_/])K(?![A-Za-z0-9_/])/g, "cyan-text"],
      [/炎核|雷纹臂铠|金币|\$/g, "gold-text"],
      [/信标|圣殿|(?<![A-Za-z0-9_/])S(?![A-Za-z0-9_/])/g, "green-text"],
      [/雷电|(?<![A-Za-z0-9_/])X(?![A-Za-z0-9_/])|终焉|影渊/g, "purple-text"],
    ];
    let html = escapeHtml(text);
    tokens.forEach(([re, cls]) => {
      html = html.replace(re, (m) => `<span class="${cls}">${m}</span>`);
    });
    return html;
  }

  function renderRichText(el, text) {
    el.innerHTML = richText(text);
  }

  function typeSpeed(w, t) {
    if (/X-0|系统/.test(w) && /魔王|候选者|人类|选择|真相|结局|勇者/.test(t)) return 72;
    if (/魔王早已过世|真正的勇者|无处可归|背叛者|候选者|找错人了|技不如人/.test(t)) return 72;
    return 22;
  }

  function finishTyping() {
    if (typeTimer) clearTimeout(typeTimer);
    typeTimer = null;
    typing.active = false;
    typing.shown = typing.full;
    renderRichText(ui.text, typing.shown);
  }

  function startTyping(w, t) {
    if (typeTimer) clearTimeout(typeTimer);
    const chars = Array.from(String(t));
    const token = ++typing.token;
    const speed = typeSpeed(w, String(t));
    typing = { active: true, shown: "", full: String(t), token };
    const step = (i) => {
      if (typing.token !== token) return;
      typing.shown = chars.slice(0, i).join("");
      renderRichText(ui.text, typing.shown);
      if (i >= chars.length) {
        typing.active = false;
        typeTimer = null;
        return;
      }
      typeTimer = setTimeout(() => step(i + 1), speed);
    };
    step(0);
  }

  function renderDialogue() {
    ui.speaker.textContent = state.speaker;
    renderRichText(ui.text, typing.active ? typing.shown : state.message);
  }

  function showTitleArt() {
    const pre = document.createElement("pre");
    pre.className = "title-art title-art-original";
    pre.textContent = TITLE_ART;
    ui.stage.replaceChildren(pre);
  }

  function renderEndingCard(id, title, text) {
    const card = document.createElement("div");
    card.className = "ending-card";
    card.innerHTML = `<small>ENDING ${id}</small><h2>${escapeHtml(title)}</h2><p>${richText(text)}</p>`;
    ui.stage.replaceChildren(card);
  }

  function renderEndingsBoard(names) {
    const board = document.createElement("div");
    board.className = "endings-board";
    const rows = names.map((n, i) => {
      const unlocked = state.haveEnd[i];
      return `<div class="${unlocked ? "unlocked" : "locked"}"><span>${unlocked ? `结局 ${i}` : "LOCKED"}</span><b>${unlocked ? escapeHtml(n) : "███████████████"}</b></div>`;
    }).join("");
    board.innerHTML = `<small>ENDING ARCHIVE</small><h2>已解锁结局</h2>${rows}`;
    ui.stage.replaceChildren(board);
  }

  function weaponClass(base, dir) {
    return `${base} ${dir % 2 === 0 ? "tile-weapon-v" : "tile-weapon-h"}`;
  }

  function choices(items) {
    ui.choices.replaceChildren();
    items.forEach((x) => {
      const b = document.createElement("button");
      b.className = "story-choice";
      b.textContent = x.label;
      b.onclick = x.action;
      ui.choices.append(b);
    });
  }

  function say(w, t) {
    state.speaker = w;
    state.message = t;
    ui.speaker.textContent = w;
    startTyping(w, t);
  }

  function script(lines, done, i = 0) {
    stopAll();
    state.mode = "story";
    locked = true;
    render();
    const l = lines[i];
    say(l[0], typeof l[1] === "function" ? l[1]() : l[1]);
    choices([{
      label: l[2],
      action: () => {
        if (typing.active) { finishTyping(); return; }
        return i + 1 < lines.length ? script(lines, done, i + 1) : (locked = false, done());
      },
    }]);
  }

  function makeGrid(n, m) {
    const cells = Array.from({ length: n + 1 }, () => Array(m + 1).fill(CELL.EMPTY));
    state.grid = cells;
    state.n = n;
    state.m = m;
    return cells;
  }

  function generateEmpty() {
    const { grid, n, m } = state;
    for (let i = 1; i <= n; i++) grid[i][1] = grid[i][m] = CELL.WALL;
    for (let j = 1; j <= m; j++) grid[1][j] = grid[n][j] = CELL.WALL;
  }

  function scatterObstacles() {
    const { grid, n, m, player } = state;
    for (let t = 0; t < 128; t++) {
      const x = rand(n) + 1, y = rand(m) + 1;
      if (Math.abs(x - player.x) + Math.abs(y - player.y) > 5) grid[x][y] = CELL.WALL;
    }
    for (let t = 0; t < 64; t++) {
      const x = rand(n) + 1, y = rand(m) + 1;
      if (Math.abs(x - player.x) + Math.abs(y - player.y) > 5 && grid[x][y] === CELL.EMPTY) grid[x][y] = CELL.COIN;
    }
  }

  function generateMap() {
    makeGrid(80, 80);
    generateEmpty();
    scatterObstacles();
  }

  class DSU {
    constructor(size) { this.fa = Array.from({ length: size }, (_, i) => i); }
    find(x) { return this.fa[x] === x ? x : (this.fa[x] = this.find(this.fa[x])); }
    union(x, y) { this.fa[this.find(x)] = this.find(y); }
  }

  function getId(x, y) { return (x - 1) * state.m + y; }

  function generateMaze(keyNumber) {
    const n = 80, m = 80;
    makeGrid(n, m);
    state.nKey = keyNumber;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) state.grid[i][j] = CELL.WALL;
    const edges = [];
    for (let i = 2; i <= n; i += 4) {
      for (let j = 2; j <= m; j += 4) {
        if (i + 4 <= n) edges.push([getId(i, j), getId(i + 4, j)]);
        if (j + 4 <= m) edges.push([getId(i, j), getId(i, j + 4)]);
      }
    }
    shuffle(edges);
    const dsu = new DSU(n * m + 1);
    for (const [a, b] of edges) {
      const sx = Math.floor((a - 1) / m) + 1, sy = (a - 1) % m + 1;
      const ex = Math.floor((b - 1) / m) + 1, ey = (b - 1) % m + 1;
      const fa = dsu.find(a), fb = dsu.find(b);
      if (fa === fb && rand(8) !== 0) continue;
      dsu.union(fa, fb);
      for (let i = sx; i <= ex + 1; i++) for (let j = sy; j <= ey + 1; j++) state.grid[i][j] = CELL.EMPTY;
    }
    for (let e = 0; e < 8; e++) {
      const x = rand(n) + 1, y = rand(m) + 1;
      if (x + 8 <= n && y + 8 <= m && x > 1 && y > 1) {
        for (let i = x; i < x + 8; i++) for (let j = y; j < y + 8; j++) state.grid[i][j] = CELL.EMPTY;
      }
    }
    for (let i = n / 2 - 3; i <= n / 2 + 4; i++) for (let j = m / 2 - 3; j <= m / 2 + 4; j++) state.grid[i][j] = CELL.EMPTY;
    for (let i = 0; i < keyNumber; i++) genKey();
    genPalace();
  }

  function genKey() {
    const { grid, n, m } = state;
    while (true) {
      const x = rand(n) + 1, y = rand(m) + 1;
      if (grid[x][y] !== CELL.EMPTY) continue;
      if (Math.abs(x - 40) + Math.abs(y - 40) < 40) continue;
      let near = false;
      for (let tx = Math.max(1, x - 12); tx <= Math.min(n, x + 12); tx++) {
        for (let ty = Math.max(1, y - 12); ty <= Math.min(m, y + 12); ty++) {
          if (grid[tx][ty] === CELL.KEY) { near = true; break; }
        }
        if (near) break;
      }
      if (near) continue;
      grid[x][y] = CELL.KEY;
      return;
    }
  }

  function genPalace() {
    const { grid, n, m } = state;
    while (true) {
      const x = rand(n) + 1, y = rand(m) + 1;
      if (grid[x][y] !== CELL.EMPTY) continue;
      if (Math.abs(x - 40) + Math.abs(y - 40) < 40) continue;
      let near = false;
      for (let tx = Math.max(1, x - 12); tx <= Math.min(n, x + 12); tx++) {
        for (let ty = Math.max(1, y - 12); ty <= Math.min(m, y + 12); ty++) {
          if (grid[tx][ty] === CELL.KEY) { near = true; break; }
        }
        if (near) break;
      }
      if (near) continue;
      grid[x][y] = CELL.PALACE;
      return;
    }
  }

  function genCoin(targetLimit = coinLimit(), batchSize = coinBatch()) {
    const { grid, n, m, player, inTut } = state;
    const limit = targetLimit;
    let current = countCoins();
    if (current >= limit) return;
    const batch = Math.min(batchSize, limit - current);
    for (let t = 0, placed = 0; t < batch * 40 && placed < batch; t++) {
      const x = rand(n) + 1, y = rand(m) + 1;
      if (Math.abs(x - player.x) + Math.abs(y - player.y) > 5 && grid[x][y] === CELL.EMPTY) {
        grid[x][y] = CELL.COIN;
        placed++;
        current++;
        if (current >= limit) return;
      }
    }
  }

  function countCoins() {
    const { grid, n, m } = state;
    let cnt = 0;
    if (!grid) return 0;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) if (grid[i][j] === CELL.COIN) cnt++;
    return cnt;
  }

  function coinLimit() {
    if (state.scene === "tut-coins") return 10;
    if (state.scene === "tut-static" || state.scene === "tut-move" || state.scene === "tut-barrier") return 6;
    if (state.scene === "tut-beacon" || state.scene === "corridor" || state.scene.startsWith("final")) return 0;
    return Math.max(0, state.maxCoin || 10);
  }

  function enoughCoin() {
    const maxCoin = coinLimit();
    if (maxCoin <= 0) return true;
    return countCoins() >= maxCoin;
  }

  function coinInterval() {
    if (state.scene === "tut-coins") return 22;
    if (state.scene.startsWith("tut-")) return 70;
    return 32;
  }

  function coinBatch() {
    if (state.scene === "tut-coins") return 2;
    if (state.scene.startsWith("tut-")) return 1;
    return 8;
  }

  function swordOf(unit) {
    if (unit.weapon === false) return { x: unit.x, y: unit.y };
    return { x: unit.x + D[unit.dir][0], y: unit.y + D[unit.dir][1] };
  }

  function unitCells(unit) {
    const s = swordOf(unit);
    const cells = [{ x: unit.x, y: unit.y }];
    if (s.x !== unit.x || s.y !== unit.y) cells.push(s);
    return cells;
  }

  function sameCell(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function cellsOverlap(a, b) {
    return unitCells(a).some((ca) => unitCells(b).some((cb) => sameCell(ca, cb)));
  }

  function ablePoint(x, y) {
    const { grid, n, m, countKey, nKey } = state;
    if (x < 1 || y < 1 || x > n || y > m) return false;
    if (grid[x][y] === CELL.WALL) return false;
    if (countKey < nKey && grid[x][y] === CELL.PALACE) return false;
    return true;
  }

  function ablePlayer(p) {
    if (!ablePoint(p.x, p.y)) return false;
    if (p.weapon && !ablePoint(p.x + D[p.dir][0], p.y + D[p.dir][1])) return false;
    return true;
  }

  function ablePointEnemy(x, y) {
    const { grid, n, m } = state;
    if (x < 1 || y < 1 || x > n || y > m) return false;
    const c = grid[x][y];
    return c === CELL.EMPTY || c === CELL.BEACON || c === 1 || c === 2 || c === 3;
  }

  function overlapsPlayer(e) {
    return cellsOverlap(e, state.player);
  }

  function overlapsEnemy(e, self = null) {
    return state.enemies.some((o) => o !== self && o.alive && cellsOverlap(e, o));
  }

  function ableEnemy(e, self = null) {
    return ablePointEnemy(e.x, e.y)
      && ablePointEnemy(e.x + D[e.dir][0], e.y + D[e.dir][1])
      && !overlapsPlayer(e)
      && !overlapsEnemy(e, self);
  }

  function pickupAt(x, y) {
    const { grid, player } = state;
    const c = grid[x][y];
    if (c === CELL.COIN) { player.money += 10; grid[x][y] = CELL.EMPTY; }
    if (c === CELL.KEY) { state.countKey++; grid[x][y] = CELL.EMPTY; }
    if (c === CELL.PALACE) state.touchPalace = 1;
    if (c === CELL.LIGHT) { grid[x][y] = CELL.EMPTY; if (damagePlayer()) handleDeath(); }
  }

  function pickupPlayer() {
    const { player } = state;
    pickupAt(player.x, player.y);
    if (player.weapon) pickupAt(player.x + D[player.dir][0], player.y + D[player.dir][1]);
  }

  function distEnemy(a, b) {
    return Math.floor(Math.hypot(a.x - b.x, a.y - b.y));
  }

  function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function nearestCell(cell) {
    if (!state.grid) return null;
    const { grid, n, m, player } = state;
    let best = null;
    for (let x = 1; x <= n; x++) {
      for (let y = 1; y <= m; y++) {
        if (grid[x][y] !== cell) continue;
        const p = { x, y };
        const d = manhattan(player, p);
        if (!best || d < best.d) best = { x, y, d };
      }
    }
    return best;
  }

  function directionText(target) {
    if (!target) return "未检测到";
    const dx = target.x - state.player.x;
    const dy = target.y - state.player.y;
    const vertical = dx < 0 ? "北" : dx > 0 ? "南" : "";
    const horizontal = dy < 0 ? "西" : dy > 0 ? "东" : "";
    return `${vertical}${horizontal || (vertical ? "" : "原地")}约 ${target.d} 步`;
  }

  function explorationCellType() {
    if (!(state.scene === "ember" || state.scene === "frost" || state.scene === "thunder")) return null;
    return state.countKey >= state.nKey ? CELL.PALACE : CELL.KEY;
  }

  function explorationTargetLabel(cell = explorationCellType()) {
    if (cell === CELL.PALACE) return "圣殿";
    if (cell === CELL.KEY) return "钥匙";
    return "目标";
  }

  function currentCompassTarget() {
    const cell = explorationCellType();
    if (!cell || !state.compassTarget || state.compassTarget.scene !== state.scene || state.compassTarget.cell !== cell) {
      state.compassTarget = null;
      return null;
    }
    const { x, y } = state.compassTarget;
    if (state.grid?.[x]?.[y] !== cell) {
      state.compassTarget = null;
      return null;
    }
    return { ...state.compassTarget, d: manhattan(state.player, state.compassTarget) };
  }

  function compassObjectiveText() {
    const target = currentCompassTarget();
    if (!target) return "";
    return ` · 罗盘：${target.label} ${directionText(target)}`;
  }

  function tooNear(e) {
    const d = distEnemy(e, state.player);
    return state.inTut ? d < 5 : d < 10;
  }

  function newEnemy(eyesight = 15) {
    if (state.specialRule) return;
    if (state.generateLimit === 0) return;
    if (state.generateLimit > 0) state.generateLimit--;
    let e;
    for (let t = 0; t < 200; t++) {
      e = {
        x: rand(state.n) + 1,
        y: rand(state.m) + 1,
        dir: rand(4),
        sight: rand(eyesight) + eyesight,
        moveable: state.mov,
        step: 0,
        lastmove: 0,
        alive: true,
        ready: 0,
        lastready: 0,
      };
      if (ableEnemy(e) && !tooNear(e)) break;
    }
    if (e && ableEnemy(e) && !tooNear(e)) state.enemies.push(e);
  }

  function newSpecialEnemy(x, y, dir) {
    state.enemies.push({ x, y, dir, sight: 30, moveable: state.mov, step: 0, lastmove: 0, alive: true, ready: 0, lastready: 0 });
  }

  function clearEnemies() { state.enemies = []; }

  function canSee(e) {
    if (state.specialRule) return false;
    const { player } = state;
    return inSightCone(e, player.x, player.y);
  }

  function inSightCone(e, x, y) {
    if (state.specialRule) return false;
    const vx = x - e.x, vy = y - e.y;
    if (Math.floor(Math.hypot(vx, vy)) > e.sight) return false;
    const ex = D[e.dir][0], ey = D[e.dir][1];
    const dot = vx * ex + vy * ey;
    return dot > 0 && dot * dot * 4 >= vx * vx + vy * vy;
  }

  function getDir(e, self = e) {
    const { player } = state;
    if (!canSee(e)) return [-1, -1];
    let bestDir = -1, bestD2 = -1, minDist = distEnemy(e, player);
    for (let d = 0; d < 4; d++) {
      const nx = e.x + D[d][0], ny = e.y + D[d][1];
      for (let d2 = 0; d2 < 4; d2++) {
        const next = { ...e, x: nx, y: ny, dir: d2 };
        if (!ableEnemy(next, self)) continue;
        const nd = distEnemy(next, player);
        if (nd < minDist || (nd === minDist && d2 === d)) { minDist = nd; bestDir = d; bestD2 = d2; }
      }
    }
    return [bestDir, bestD2];
  }

  function enemyChasePreview(e) {
    if (!canSee(e)) return [];
    const path = [];
    let cur = { ...e };
    const used = new Set([`${cur.x},${cur.y}`]);
    for (let k = 0; k < 10; k++) {
      const [t, t2] = getDir(cur, e);
      if (t === -1) break;
      cur = { ...cur, x: cur.x + D[t][0], y: cur.y + D[t][1], dir: t2 };
      const key = `${cur.x},${cur.y}`;
      if (used.has(key)) break;
      used.add(key);
      path.push({ x: cur.x, y: cur.y });
      if (Math.abs(cur.x - state.player.x) + Math.abs(cur.y - state.player.y) <= 1) break;
    }
    return path;
  }

  function enemyConeCells(e, sx, sy, ex, ey) {
    const out = [];
    for (let x = Math.max(sx, e.x - e.sight); x <= Math.min(ex, e.x + e.sight); x++) {
      for (let y = Math.max(sy, e.y - e.sight); y <= Math.min(ey, e.y + e.sight); y++) {
        if (x === e.x && y === e.y) continue;
        if (inSightCone(e, x, y)) out.push({ x, y });
      }
    }
    return out;
  }

  function dirTowardPlayer(enemy) {
    const { player } = state;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    if (Math.abs(dy) >= Math.abs(dx) && dy !== 0) return dy > 0 ? 1 : 3;
    if (dx !== 0) return dx > 0 ? 2 : 0;
    return enemy.dir;
  }

  function moveSpecialEnemy(enemy) {
    const d = dirTowardPlayer(enemy);
    enemy.lastmove = state.standardClock;
    enemy.ready = 0;
    enemy.dir = d;
    const next = { ...enemy, x: enemy.x + D[d][0], y: enemy.y + D[d][1], dir: d };
    if (ableEnemy(next, enemy)) {
      enemy.x = next.x;
      enemy.y = next.y;
    }
  }

  function moveEnemy(enemy) {
    if (state.specialRule) {
      moveSpecialEnemy(enemy);
      return;
    }
    const { player, standardClock, attackWaitTime } = state;
    const [t, t2] = getDir(enemy, enemy);
    enemy.lastmove = standardClock;
    let facing = false;
    for (let d = 0; d < 4; d++) {
      if (enemy.x + D[d][0] === player.x && enemy.y + D[d][1] === player.y) {
        if (enemy.ready && standardClock - enemy.lastready > attackWaitTime) { enemy.dir = d; return; }
        facing = true;
        if (!enemy.ready) { enemy.ready = 1; enemy.lastready = standardClock; }
      }
    }
    if (facing) return;
    enemy.ready = 0;
    if (t !== -1) {
      const nx = enemy.x + D[t][0], ny = enemy.y + D[t][1];
      if ((nx === player.x && ny === player.y) || (enemy.x + D[t][0] + D[t2][0] === player.x && enemy.y + D[t][1] + D[t2][1] === player.y)) {
        if (enemy.ready && standardClock - enemy.lastready > attackWaitTime) {
          enemy.x = nx; enemy.y = ny; enemy.dir = t2; return;
        }
        if (!enemy.ready) { enemy.ready = 1; enemy.lastready = standardClock; }
        return;
      }
      enemy.x = nx; enemy.y = ny; enemy.dir = t2;
      return;
    }
    if (enemy.step === 0) {
      if (rand(state.enemyStopTime) !== 0) return;
      const dirs = [];
      for (let d = 0; d < 4; d++) {
        const next = { ...enemy, dir: d };
        if (ableEnemy(next, enemy)) dirs.push(d);
      }
      if (!dirs.length) return;
      enemy.dir = dirs[rand(dirs.length)];
      enemy.step = rand(4) + 4;
    } else {
      const next = { ...enemy, x: enemy.x + D[enemy.dir][0], y: enemy.y + D[enemy.dir][1] };
      if (ableEnemy(next, enemy)) { enemy.x = next.x; enemy.y = next.y; }
      enemy.step--;
    }
  }

  function updateEnemy() {
    const { enemies, enemySpeed, standardClock } = state;
    enemies.forEach((e) => {
      if (!e.alive || !e.moveable) return;
      if (standardClock - e.lastmove < enemySpeed) return;
      moveEnemy(e);
    });
  }

  function check(enemy, player) {
    const e1 = { x: enemy.x, y: enemy.y };
    const e2 = { x: enemy.x + D[enemy.dir][0], y: enemy.y + D[enemy.dir][1] };
    const p1 = { x: player.x, y: player.y };
    const p2 = { x: player.x + D[player.dir][0], y: player.y + D[player.dir][1] };
    if (state.specialRule) {
      if (p2.x === e1.x && p2.y === e1.y) return 1;
      if ((p2.x === e2.x && p2.y === e2.y) || (p1.x === e1.x && p1.y === e1.y) || (p1.x === e2.x && p1.y === e2.y)) return 2;
      return 0;
    }
    if (!player.weapon) {
      if ((p1.x === e1.x && p1.y === e1.y) || (p1.x === e2.x && p1.y === e2.y)) return 2;
      return 0;
    }
    if ((p2.x === e1.x && p2.y === e1.y) || (p2.x === e2.x && p2.y === e2.y)) return 1;
    if ((p1.x === e1.x && p1.y === e1.y) || (p1.x === e2.x && p1.y === e2.y)) return 2;
    return 0;
  }

  function damagePlayer(amount = 1) {
    if (state.devMode) {
      state.player.hp = 3;
      return false;
    }
    state.player.hp = Math.max(0, state.player.hp - amount);
    return state.player.hp <= 0;
  }

  function checkCrash() {
    const { enemies, player, standardClock, lastUpdate, newEnemyTime, enemyLimit, enemyEyesight, lastGenerate } = state;
    if (standardClock - lastUpdate > state.updateTime) {
      state.enemies = enemies.filter((e) => e.alive);
      state.lastUpdate = standardClock;
    }
    if (standardClock - lastGenerate > newEnemyTime && state.enemies.length < enemyLimit) {
      newEnemy(enemyEyesight);
      state.lastGenerate = standardClock;
    }
    for (const e of state.enemies) {
      if (!e.alive) continue;
      const t = check(e, player);
      if (!t) continue;
      if (t === 1) { e.alive = false; state.countKill++; state.sessionKill++; }
      else {
        e.alive = false;
        if (state.devMode) { state.countKill++; state.sessionKill++; }
        else if (damagePlayer()) return 1;
      }
    }
    state.enemies = state.enemies.filter((e) => e.alive);
    return 0;
  }

  function updateObstacle() {
    const { grid, n } = state;
    for (let i = 2; i <= n - 1; i++) {
      for (let j = 2; j <= n - 1; j++) {
        if (grid[i][j] === CELL.EMPTY && rand(1280) === 0) grid[i][j] = CELL.WALL;
        else if (grid[i][j] === CELL.WALL && rand(256) === 0) grid[i][j] = CELL.EMPTY;
      }
    }
  }

  function updateLightening() {
    const { grid, n, player } = state;
    for (let i = 2; i <= n - 1; i++) {
      for (let j = 2; j <= n - 1; j++) {
        if (Math.abs(i - player.x) + Math.abs(j - player.y) < 2) continue;
        if (grid[i][j] === CELL.EMPTY && rand(4096) === 0) grid[i][j] = CELL.LIGHT;
        else if (grid[i][j] === CELL.LIGHT && rand(256) === 0) grid[i][j] = CELL.EMPTY;
      }
    }
  }

  const heldKeys = new Set();
  const repeatable = new Set(["w", "a", "s", "d", "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"]);

  function normalizeKey(k) { return k.length === 1 ? k.toLowerCase() : k; }

  function tryMovePlayer() {
    const { player, grid } = state;
    let moved = false;
    const tryDir = (dir) => {
      const tp = { ...player, x: player.x + D[dir][0], y: player.y + D[dir][1] };
      if (!ablePlayer(tp)) return;
      if (grid[tp.x][tp.y] === CELL.OBST) grid[tp.x][tp.y] = CELL.EMPTY;
      Object.assign(player, tp);
      state.lastMove = Date.now();
      moved = true;
    };
    if (heldKeys.has("w")) tryDir(0);
    else if (heldKeys.has("s")) tryDir(2);
    else if (heldKeys.has("a")) tryDir(3);
    else if (heldKeys.has("d")) tryDir(1);
    if (player.weapon) {
      if (heldKeys.has("ArrowUp")) { if (ablePlayer({ ...player, dir: 0 })) player.dir = 0; moved = true; }
      else if (heldKeys.has("ArrowRight")) { if (ablePlayer({ ...player, dir: 1 })) player.dir = 1; moved = true; }
      else if (heldKeys.has("ArrowDown")) { if (ablePlayer({ ...player, dir: 2 })) player.dir = 2; moved = true; }
      else if (heldKeys.has("ArrowLeft")) { if (ablePlayer({ ...player, dir: 3 })) player.dir = 3; moved = true; }
    }
    if (moved) pickupPlayer();
    return moved;
  }

  function tryBarrier() {
    if (!state.ableC || state.mode !== "play" || state.paused) return;
    const { player, grid } = state;
    const d = (player.dir + 2) % 4;
    const tx = player.x + D[d][0], ty = player.y + D[d][1];
    if (ablePoint(tx, ty) && grid[tx][ty] === CELL.EMPTY && player.money >= 3) {
      grid[tx][ty] = CELL.OBST;
      player.money -= 3;
      say("那个声音", "人造障碍已部署。");
    }
  }

  function tryBeacon() {
    if (!state.ableF || state.mode !== "play" || state.paused) return;
    const { player, grid } = state;
    if (player.money < 5) return;
    player.money -= 5;
    if (player.left) {
      const bx = player.leftx, by = player.lefty;
      const tp = { ...player, x: bx, y: by, left: false };
      if (ablePlayer(tp)) {
        if (grid[bx]?.[by] === CELL.BEACON) grid[bx][by] = CELL.EMPTY;
        Object.assign(player, tp);
      }
      else player.money += 5;
    } else {
      player.left = true;
      player.leftx = player.x;
      player.lefty = player.y;
      grid[player.leftx][player.lefty] = CELL.BEACON;
    }
  }

  function trySheathe() {
    if (!state.ableV || state.mode !== "play" || state.paused) return;
    const { player } = state;
    if (!player.weapon) { player.weapon = true; return; }
    player.weapon = false;
  }

  function processSkills() {}

  function beginPlay(scene) {
    state.mode = "play";
    state.scene = scene;
    state.paused = false;
    state.shopOpen = false;
    state.die = false;
    state.sessionKill = 0;
    state.standardClock = 0;
    state.lastGenerate = 0;
    state.lastUpdate = 0;
    state.lastCoinGenerate = 0;
    state.lastMove = Date.now();
    state.hudExtra = "";
    $("#pause-button").textContent = "暂停";
    choices([]);
    saveLocal();
    render();
  }

  function startLoop() {
    if (loopId) clearInterval(loopId);
    loopId = setInterval(tick, TICK_MS);
  }

  function replenishEnemies() {
    if (state.scene === "tut-barrier") {
      while (state.enemies.length < 12) newEnemy(15);
    } else if (state.scene.includes("shrine")) {
      while (state.enemies.length < 6) newEnemy(state.enemyEyesight);
    } else if (state.scene === "final-demon" || state.scene === "final-human") {
      while (state.enemies.length < 6 && state.generateLimit > 0) newEnemy(state.enemyEyesight);
    }
  }

  function tick() {
    if (state.mode !== "play" || locked || state.paused || state.shopOpen || state.die) return;
    if (document.hidden || ui.save.open || ui.help.open) return;
    state.standardClock++;
    state.turn = state.standardClock;
    state.hudExtra = "";
    if (state.haveCoin && state.standardClock - state.lastCoinGenerate >= coinInterval() && !enoughCoin()) {
      genCoin();
      state.lastCoinGenerate = state.standardClock;
    }
    if (state.player.left) {
      const { leftx, lefty } = state.player;
      const t = state.grid?.[leftx]?.[lefty];
      if (t === CELL.EMPTY || t === CELL.OBST || t === CELL.COIN) state.grid[leftx][lefty] = CELL.BEACON;
    }
    tryMovePlayer();
    processSkills();
    if (state.scene === "tut-coins") { checkObjectives(); render(); return; }
    if (state.scene === "corridor") { handleCorridor(); render(); return; }
    replenishEnemies();
    if (state.mov) {
      if (checkCrash()) { handleDeath(); return; }
      updateEnemy();
      if (checkCrash()) { handleDeath(); return; }
    } else if (checkCrash()) { handleDeath(); return; }
    if (state.cantStop) {
      const stay = 6 - Math.floor((Date.now() - state.lastMove) / 1000);
      state.hudExtra = `再停留 ${Math.max(0, stay)} 秒就会受到伤害`;
      if (stay <= 0) {
        state.lastMove = Date.now();
        if (damagePlayer()) { handleDeath(); return; }
      }
    }
    if (state.timerGoal) {
      const rem = state.timerGoal - Math.floor((Date.now() - state.timerStart) / 1000);
      state.hudExtra = `还剩 ${Math.max(0, rem)} 秒` + (state.hudExtra ? `　${state.hudExtra}` : "");
      if (rem <= 0) finishTimedStage();
    }
    if (state.scene.includes("shrine") && state.timerKind === "frost") updateObstacle();
    if (state.scene.includes("shrine") && state.timerKind === "thunder") updateLightening();
    if (state.scene === "final-demon" || state.scene === "final-human") {
      state.hudExtra = `还剩 ${Math.max(0, state.generateLimit)} 名敌人即将加入战场` + (state.hudExtra ? `　${state.hudExtra}` : "");
      if (state.generateLimit + state.enemies.length <= 0) finishFinalBattle();
    }
    checkObjectives();
    render();
  }

  function checkObjectives() {
    const { player, sessionKill, countKey, nKey, touchPalace } = state;
    if (state.scene === "tut-coins" && player.money >= 160) finishTutCoins();
    else if (state.scene === "tut-static" && sessionKill >= 10) finishTutStatic();
    else if (state.scene === "tut-move" && sessionKill >= 10) finishTutMove();
    else if (state.scene === "tut-beacon" && sessionKill >= 3) finishTutBeacon();
    else if (state.scene === "ember" && countKey >= nKey && touchPalace) finishEmberExplore();
    else if (state.scene === "frost" && countKey >= nKey && touchPalace) finishFrostExplore();
    else if (state.scene === "thunder" && countKey >= nKey && touchPalace) finishThunderExplore();
  }

  function handleDeath() {
    if (state.devMode) {
      state.die = false;
      state.player.hp = 3;
      say("SYSTEM", "开发者模式：死亡判定已忽略。");
      render();
      return;
    }
    if (state.scene.startsWith("tut")) {
      if (state.scene === "tut-static" || state.scene === "tut-move") endGame(0, "找错人了", "那个声音：怎么，你连打木偶都能被木偶反杀？");
      else endGame(1, "技不如人", "那个声音：就这点水准，怎么能当上勇者？");
    } else if (state.scene === "final-demon") endGame(3, "魔王陨落", "人类联军将你围困，第108代魔王的统治戛然而止。");
    else if (state.scene === "final-human") endGame(5, "背叛者的末路", "追猎型魔物将你击倒，清除程序已经启动。");
    else endGame(2, "出师未捷身先死", "你被魔物击杀了，任务中道崩殂。");
  }

  function endGame(id, title, text) {
    state.die = true;
    state.mode = "end";
    if (!state.haveEnd[id]) state.haveEnd[id] = true;
    if (id === 6) state.ableV = true;
    if (id === 4 || id === 6 || id === 7) { state.stage = 5; state.skipPlot = 0; state.countKill = 0; state.player.money = 0; }
    renderEndingCard(id, title, text);
    say("SYSTEM", `达成结局 ${id}：${title}。${text}`);
    choices([{ label: "返回标题", action: menu }, { label: "重新开始", action: newGame }]);
    saveLocal();
    render();
  }

  function finishEnding(id, title, text) { endGame(id, title, text); }

  // ---------- Story scripts ----------
  const SCR = {
    intro: [
      ["你", "……？这是哪儿……？", "继续"],
      ["旁白", "此时，一个声音在你耳边响起。", "继续"],
      ["那个声音", "你醒了，勇者。", "勇者？"],
      ["那个声音", "是的。你被我召唤到了艾瑞斯世界。你需要打败这里的魔王。", "魔王？"],
      ["那个声音", "是的。在那之前，我先来教你在这个世界最基本的战斗方式。", "听说明"],
      ["那个声音", "蓝色 O 是你，身前的线条是你的剑。W/A/S/D 移动，上下左右方向键控制剑的方向。", "继续"],
      ["那个声音", "地图上的 # 是障碍物，你和你的剑都无法穿过。$ 代表金币，一个 $ 价值 10 枚金币。", "开始训练"],
    ],
    prePlot: [
      ["那个声音", "欢迎来到艾瑞斯世界，勇者。这里是神魔博弈的棋盘，也是你命中注定的战场。", "棋盘？"],
      ["那个声音", "那些红色身影都是魔王卡洛梅的爪牙。它们蚕食着四大古陆，而你要做的，是终结这一切。", "四大古陆？"],
      ["那个声音", "赤烬之地，燃烧着永恒业火，封印着「炎核」；霜骸冰原，时间凝结的极寒坟场，冰封着「霜心」。", "继续"],
      ["那个声音", "雷鸣裂谷，雷暴永不停息，禁锢着「雷纹臂铠」；影渊圣所，光无法抵达，沉睡着「虚空之冠」。", "这些圣器能消灭魔王？"],
      ["那个声音", "当然。当四圣器齐聚之时——那将是新纪元的开端。", "继续"],
      ["那个声音", "注意魔物身上的纹章。那是卡洛梅的烙印，它们会像嗅到血腥的鲨鱼般追踪你。", "继续"],
      ["那个声音", "但记住，真正的威胁往往戴着伪善的面具。", "我准备好了"],
    ],
    reveal: [
      ["X-0 系统", "认知过滤器已解除。你斩杀的“魔物”，都是其他候选者。", "继续"],
      ["X-0 系统", () => `累计有效击杀：${state.countKill}。魔王早已过世，这场游戏只为选出新的魔王。`, "我必须选择"],
    ],
  };

  function menu() {
    state.mode = "menu";
    state.scene = "menu";
    state.paused = false;
  $("#pause-button").textContent = "暂停";
    showTitleArt();
    ui.scene.textContent = "YOUSYA // AWAITING SIGNAL";
    say("SYSTEM", "选择存档入口。进度会自动保存在本浏览器中。");
    const a = [{ label: "新游戏", action: newGame }];
    if (localStorage.getItem(SAVE_KEY)) a.push({ label: "继续游戏", action: loadLocal });
    a.push({ label: "查看结局", action: viewEndings });
    a.push({ label: "存档导入 / 导出", action: () => ui.save.showModal() });
    choices(a);
    hud();
  }

  async function viewEndings() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = migrate(await decrypt(raw));
        saved.haveEnd.forEach((v, i) => { if (v) state.haveEnd[i] = true; });
        if (saved.ableV) state.ableV = true;
      }
    } catch {}
    state.mode = "story";
    locked = true;
    const names = ["找错人了", "技不如人", "出师未捷身先死", "魔王陨落", "魔王永恒", "背叛者的末路", "无处可归", "真正的勇者"];
    const lines = names.map((n, i) => state.haveEnd[i] ? `结局 ${i}：${n}` : "███████████████").join("\n");
    renderEndingsBoard(names);
    say("SYSTEM", lines);
    choices([{ label: "返回", action: () => { locked = false; menu(); } }]);
    render();
  }

  async function openingAnimation(done) {
    locked = true;
    state.mode = "story";
    state.scene = "opening";
    state.paused = false;
    choices([]);
    showTitleArt();
    ui.scene.textContent = "YOUSYA // BOOT";
    say("SYSTEM", "Author: paulzrm");
    hud();
    await sleep(650);
    makeGrid(15, 15);
    generateEmpty();
    Object.assign(state.player, { x: 2, y: 8, dir: 2, hp: 3, money: 0, left: false, weapon: true });
    state.gridName = "开场";
    ui.scene.textContent = "STARTING GAME";
    say("SYSTEM", "正在开始游戏。");
    renderMap();
    for (let i = 0; i < 5; i++) {
      await sleep(170);
      state.player.x++;
      renderMap();
    }
    await sleep(220);
    locked = false;
    done();
  }

  function newGame() {
    const prevAbleV = state.ableV;
    state = fresh();
    state.ableV = prevAbleV;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) decrypt(raw).then((d) => { if (d.ableV) state.ableV = true; }).catch(() => {});
    } catch {}
    openingAnimation(() => script(SCR.intro, startTutorial));
  }

  function startTutorial() {
    if (state.stage >= 5) { prePlot(); return; }
    if (state.stage >= 1) { tutStatic(true); return; }
    tutCoins();
  }

  function tutCoins(skipIntro = false) {
    state.inTut = 1;
    state.maxCoin = 10;
    state.haveCoin = 1;
    state.enemyLimit = 0;
    state.mov = 0;
    clearEnemies();
    makeGrid(15, 15);
    generateEmpty();
    Object.assign(state.player, { x: 2, y: 8, dir: 2, hp: 3, money: 0, left: false, weapon: true });
    genCoin(10, 2);
    beginPlay("tut-coins");
    if (!skipIntro) say("那个声音", "先用 WASD 移动，方向键控制剑。收集 160 枚金币。");
    else say("那个声音", "继续收集金币。");
    startLoop();
  }

  function finishTutCoins() {
    state.stage = Math.max(state.stage, 1);
    saveLocal();
    script([
      ["那个声音", "好的。现在你已经可以熟练移动了，勇者。", "继续"],
      ["那个声音", "在魔王的领导下，魔物会攻击你。魔物也有武器。", "继续"],
      ["那个声音", "如果你的武器碰到了它们的武器或者身体，那么它们就会死亡。", "继续"],
      ["那个声音", "反之，如果魔物的武器或者身体碰到了你的身体，你会损失生命；虽然它们也会因此死亡，但这对你而言并不值得。", "继续"],
      ["那个声音", "你的行动永远比魔物提前。试试和魔物战斗吧。任务：击杀 10 只不移动的魔物。", "开始"],
    ], () => tutStatic());
  }

  function tutStatic(skipIntro = false) {
    if (state.stage >= 2) { tutMove(true); return; }
    clearEnemies();
    if (!state.grid) {
      makeGrid(15, 15);
      generateEmpty();
      Object.assign(state.player, { x: 2, y: 8, dir: 2, hp: 3, left: false, weapon: true });
    }
    state.inTut = 1;
    state.maxCoin = 6;
    state.haveCoin = 1;
    state.mov = 0;
    state.enemyLimit = 6;
    state.enemyEyesight = 15;
    state.sessionKill = 0;
    for (let i = 0; i < 6; i++) newEnemy(15);
    genCoin(6, 1);
    beginPlay("tut-static");
    if (!skipIntro) say("那个声音", "你的行动永远先于魔物。让剑碰到它们。");
    startLoop();
  }

  function finishTutStatic() {
    state.stage = Math.max(state.stage, 2);
    saveLocal();
    script([
      ["那个声音", "好的，现在你已经会攻击了。在真正的世界中，魔物是会移动的。", "继续"],
      ["那个声音", "它们有一个视野范围。面朝方向就是武器方向；若你在它面朝方向左 60 度到右 60 度之间，且距离不超过视野范围，就会被看到。", "继续"],
      ["那个声音", "被看到后，它会径直向你走来。但它很笨，不会绕开障碍物；如果被卡住就不会动。", "继续"],
      ["那个声音", "没有看到你的魔物会停下或者随机走动。任务：击杀 10 只移动的魔物。请小心。", "继续"],
    ], () => tutMove());
  }

  function tutMove(skipIntro = false) {
    if (state.stage >= 3) { tutBarrier(true); return; }
    clearEnemies();
    if (!state.grid) {
      makeGrid(15, 15);
      generateEmpty();
      Object.assign(state.player, { x: 2, y: 8, dir: 2, hp: 3, left: false, weapon: true });
    }
    state.inTut = 1;
    state.maxCoin = 6;
    state.haveCoin = 1;
    state.mov = 1;
    state.enemySpeed = 2;
    state.enemyLimit = 6;
    state.sessionKill = 0;
    for (let i = 0; i < 6; i++) newEnemy(15);
    genCoin(6, 1);
    beginPlay("tut-move");
    if (!skipIntro) say("那个声音", "视野为面朝方向 ±60° 扇形。被看到时它们会径直走来。");
    startLoop();
  }

  function finishTutMove() {
    state.stage = Math.max(state.stage, 3);
    state.player.money += 100;
    saveLocal();
    script([
      ["那个声音", "好的，现在你已经可以比较熟练地和魔物战斗了。作为勇者，你有一些技能。", "继续"],
      ["那个声音", "按 C 可以在你的身后放下一个人造障碍物。你能够通过它，并在通过时清除；魔物会被它阻挡。", "继续"],
      ["那个声音", "放置一个障碍物需要花费 3 枚金币。请试试这个技能吧。任务：存活一分钟。", "开始"],
    ], () => tutBarrier());
  }

  function tutBarrier(skipIntro = false) {
    if (state.stage >= 4) { tutBeacon(true); return; }
    clearEnemies();
    if (!state.grid) {
      makeGrid(15, 15);
      generateEmpty();
      Object.assign(state.player, { x: 2, y: 8, dir: 2, hp: 3, left: false, weapon: true });
    }
    state.inTut = 1;
    state.maxCoin = 6;
    state.haveCoin = 1;
    state.mov = 1;
    state.ableC = true;
    state.enemyLimit = 12;
    state.enemySpeed = 3;
    state.player.hp = 3;
    state.sessionKill = 0;
    for (let i = 0; i < 12; i++) newEnemy(15);
    genCoin(6, 1);
    state.timerStart = Date.now();
    state.timerGoal = 60;
    state.timerKind = "survive";
    beginPlay("tut-barrier");
    if (!skipIntro) say("那个声音", "障碍可以阻挡魔物，但你能穿过并清除它。");
    startLoop();
  }

  function finishTutBarrier() {
    state.stage = Math.max(state.stage, 4);
    state.timerGoal = 0;
    saveLocal();
    script([
      ["那个声音", "你还有一个技能。在没有设置信标时，按 F 可以设置一个信标。", "继续"],
      ["那个声音", "在有信标时按 F 会立刻传送到信标的位置并回收它。设置或传送均需要花费 5 枚金币。", "继续"],
      ["那个声音", "请试试这个技能吧。任务：击杀 3 个敌人。此时若你和敌人的武器碰到一起，你也会损失生命。", "开始"],
    ], () => tutBeacon());
  }

  function tutBeacon(skipIntro = false) {
    if (state.stage >= 5) { prePlot(); return; }
    state.inTut = 1;
    state.haveCoin = 0;
    makeGrid(3, 30);
    generateEmpty();
    Object.assign(state.player, { x: 2, y: 12, dir: 1, hp: 3, money: state.player.money, left: false, weapon: true });
    state.ableF = true;
    state.mov = 1;
    state.specialRule = 1;
    state.enemyLimit = 3;
    state.enemySpeed = 3;
    state.sessionKill = 0;
    clearEnemies();
    newSpecialEnemy(2, 18, 3);
    newSpecialEnemy(2, 20, 3);
    newSpecialEnemy(2, 22, 3);
    beginPlay("tut-beacon");
    if (!skipIntro) say("那个声音", "击杀 3 个敌人。若剑与敌人武器相碰，你也会受伤。");
    startLoop();
  }

  function finishTutBeacon() {
    state.stage = Math.max(state.stage, 5);
    state.specialRule = 0;
    state.maxCoin = 12;
    state.countKill = 0;
    state.sessionKill = 0;
    clearEnemies();
    saveLocal();
    script([["那个声音", "好的，你现在已经比较熟悉这个世界了。去战斗吧！教程完。", "前往大陆"]], prePlot);
  }

  function prePlot() {
    if (state.stage >= 6) { emberExplore(true); return; }
    script(SCR.prePlot, () => {
      state.stage = 6;
      saveLocal();
      emberExplore();
    });
  }

  function emberExplore(skipIntro = false) {
    if (state.stage >= 7) { emberShrine(true); return; }
    state.maxCoin = 6;
    state.countKey = 0;
    state.touchPalace = 0;
    state.inTut = 0;
    state.ableC = true;
    state.ableF = true;
    state.enemyEyesight = 5;
    state.attackWaitTime = 2;
    state.enemyLimit = 72;
    state.mov = 1;
    state.enemySpeed = 0;
    state.nKey = 4;
    generateMap();
    state.gridName = "「赤烬之地」";
    Object.assign(state.player, { x: 40, y: 40, dir: 2, hp: 3, money: skipIntro ? state.player.money : 0, left: false, weapon: true });
    for (let i = 0; i < 4; i++) genKey();
    genPalace();
    clearEnemies();
    for (let i = 0; i < 64; i++) newEnemy(5);
    beginPlay("ember");
    if (!skipIntro) say("那个声音", "赤烬之地：燃烧着永恒业火的战场。这里障碍和金币较少，炎之巨人速度较慢。收集 4 把钥匙 K，抵达圣殿 S。");
    startLoop();
  }

  function finishEmberExplore() {
    state.stage = 7;
    saveLocal();
    script([
      ["旁白", "钥匙插入青铜巨门的瞬间，地动山摇。脚下的岩浆突然沸腾，穹顶落下燃烧的巨石。", "继续"],
      ["那个声音", "快进去！祂要苏醒了——", "进入"],
      ["旁白", "青铜巨门在身后合上。神殿中央亮起一座火炬，你发现自己已被炎之巨人包围。", "继续"],
      ["那个声音", "这是你的试炼，勇者！你需要坚持 90 秒，就能获得「炎核」。", "开始"],
    ], () => emberShrine());
  }

  function emberShrine(skipIntro = false) {
    if (state.stage >= 8) { frostExplore(true); return; }
    makeGrid(16, 16);
    generateEmpty();
    state.gridName = "「赤烬之地」——圣殿";
    state.ableC = false;
    state.cantStop = 1;
    state.enemyLimit = 12;
    state.sessionKill = 0;
    Object.assign(state.player, { x: 8, y: 8, dir: 2, hp: 3, money: state.player.money, left: false, weapon: true });
    clearEnemies();
    for (let i = 0; i < 12; i++) newEnemy(5);
    state.timerStart = Date.now();
    state.timerGoal = 90;
    state.timerKind = "ember";
    beginPlay("ember-shrine");
    if (!skipIntro) say("那个声音", "坚持 90 秒。不可放置障碍；停留超过 6 秒会受伤。");
    startLoop();
  }

  function finishTimedStage() {
    state.timerGoal = 0;
    state.cantStop = 0;
    state.ableC = true;
    if (state.scene === "tut-barrier") {
      finishTutBarrier();
    } else if (state.scene === "ember-shrine") {
      state.stage = 8;
      saveLocal();
      script([
        ["旁白", "终于，你坚持下来了。所有炎之巨人突然僵直，化作岩浆流入祭坛。", "继续"],
        ["旁白", "「炎核」缓缓降落到你掌心，灼痛中传来诡异的温暖。炎核表面映出你的倒影，双眼泛着红光。", "继续"],
        ["低语声", "做得很好……第213号■■者……", "……？"],
        ["那个声音", "现在该前往「霜骸冰原」了。那里封印着能够冻结灵魂的「霜心」。", "出发"],
      ], () => frostExplore());
    } else if (state.scene === "frost-shrine") {
      state.stage = 10;
      saveLocal();
      script([
        ["旁白", "终于，刺骨的寒风停息了。所有冰霜女巫碎裂成冰尘，飘向祭坛。", "继续"],
        ["旁白", "「霜心」缓缓落入掌心，寒意中透出令人不安的脉动。霜心内部浮现你的倒影，发梢结满冰晶。", "继续"],
        ["耳语声", "合格了……第213号■■者……", "……？"],
        ["那个声音", "接下来是「雷鸣裂谷」——风暴领主的领域。那里沉睡着能操控雷霆的「雷纹臂铠」。", "出发"],
      ], () => thunderExplore());
    } else if (state.scene === "thunder-shrine") {
      state.stage = 12;
      saveLocal();
      script([
        ["旁白", "终于，狂暴的雷云消散了。所有闪电之灵崩解成电流，汇入祭坛。", "继续"],
        ["旁白", "「雷纹臂铠」缓缓附着在你的手臂上，电流中传来令人战栗的力量。臂铠表面映出你的倒影，眼中闪过雷光。", "继续"],
        ["轰鸣声", "完成了……第213号■■者……", "……？"],
        ["那个声音", "恭喜你通过了全部试炼。接下来是最后一站——「影渊圣所」。", "出发"],
      ], finalReveal);
    }
  }

  function frostExplore(skipIntro = false) {
    if (state.stage >= 9) { frostShrine(true); return; }
    state.maxCoin = 6;
    state.countKey = 0;
    state.touchPalace = 0;
    state.enemyEyesight = 12;
    state.attackWaitTime = 2;
    state.enemyLimit = 48;
    state.enemySpeed = 0;
    state.nKey = 6;
    generateMaze(6);
    state.gridName = "「霜骸冰原」";
    Object.assign(state.player, { x: 40, y: 40, dir: 2, hp: 3, money: skipIntro ? state.player.money : 0, left: false, weapon: true });
    clearEnemies();
    for (let i = 0; i < 32; i++) newEnemy(12);
    for (let i = 0; i < 4; i++) genCoin();
    beginPlay("frost");
    if (!skipIntro) say("那个声音", "霜骸冰原：时间静止的极寒坟场。这里遍地冰柱，地图近似迷宫；冰霜女巫视野较广但数量较少。收集 6 把钥匙。");
    startLoop();
  }

  function finishFrostExplore() {
    state.stage = 9;
    saveLocal();
    script([
      ["旁白", "钥匙插入冰晶巨门的瞬间，刺骨寒风呼啸而至。冰面崩裂，穹顶坠下锋利冰锥。", "继续"],
      ["那个声音", "快进去！祂的凝视要冻结一切——", "进入"],
      ["旁白", "冰门轰然闭合。苍蓝色冰晶在墙壁上蔓延，冰雾中浮现出手持冰杖的苍白身影。", "继续"],
      ["那个声音", "这是寒冰的试炼，勇者！在极寒中存活 90 秒，就能获得「霜心」。", "开始"],
    ], () => frostShrine());
  }

  function frostShrine(skipIntro = false) {
    if (state.stage >= 10) { thunderExplore(true); return; }
    makeGrid(16, 16);
    generateEmpty();
    state.gridName = "「霜骸冰原」——圣殿";
    state.ableC = false;
    state.cantStop = 1;
    state.enemyLimit = 12;
    Object.assign(state.player, { x: 8, y: 8, dir: 2, hp: 3, money: state.player.money, left: false, weapon: true });
    clearEnemies();
    for (let i = 0; i < 12; i++) newEnemy(12);
    state.timerStart = Date.now();
    state.timerGoal = 90;
    state.timerKind = "frost";
    beginPlay("frost-shrine");
    if (!skipIntro) say("那个声音", "极寒试炼：90 秒。地形会不断变化。");
    startLoop();
  }

  function thunderExplore(skipIntro = false) {
    if (state.stage >= 11) { thunderShrine(true); return; }
    state.maxCoin = 10;
    state.countKey = 0;
    state.touchPalace = 0;
    state.enemyEyesight = 3;
    state.enemyStopTime = 1;
    state.attackWaitTime = 0;
    state.enemyLimit = 54;
    state.enemySpeed = 0;
    state.nKey = 8;
    generateMaze(8);
    state.gridName = "「雷鸣裂谷」";
    Object.assign(state.player, { x: 40, y: 40, dir: 2, hp: 3, money: skipIntro ? state.player.money : 0, left: false, weapon: true });
    clearEnemies();
    for (let i = 0; i < 36; i++) newEnemy(3);
    for (let i = 0; i < 4; i++) genCoin();
    beginPlay("thunder");
    if (!skipIntro) say("那个声音", "雷鸣裂谷：永不停歇的雷暴深渊。闪电之灵视野较窄，但攻击和反应极快。收集 8 把钥匙。");
    startLoop();
  }

  function finishThunderExplore() {
    state.stage = 11;
    saveLocal();
    script([
      ["旁白", "钥匙插入雷霆巨门的瞬间，刺眼雷光划破天际。地面震颤，穹顶降下狂暴闪电。", "继续"],
      ["那个声音", "快进去！风暴领主已经察觉到了你的存在！", "进入"],
      ["旁白", "你冲入圣殿，身后的巨门被雷霆劈碎。空气中弥漫臭氧气味，雷云中浮现手持雷枪的闪电之灵。", "继续"],
      ["那个声音", "这是雷霆的试炼，勇者！在雷暴中存活 90 秒，就能获得「雷纹臂铠」。", "开始"],
    ], () => thunderShrine());
  }

  function thunderShrine(skipIntro = false) {
    if (state.stage >= 12) { finalReveal(); return; }
    makeGrid(16, 16);
    generateEmpty();
    state.gridName = "「雷鸣裂谷」——圣殿";
    state.ableC = false;
    state.cantStop = 1;
    state.enemyLimit = 9;
    state.enemySpeed = 0;
    Object.assign(state.player, { x: 8, y: 8, dir: 2, hp: 3, money: state.player.money, left: false, weapon: true });
    clearEnemies();
    for (let i = 0; i < 6; i++) newEnemy(3);
    state.timerStart = Date.now();
    state.timerGoal = 90;
    state.timerKind = "thunder";
    beginPlay("thunder-shrine");
    if (!skipIntro) say("那个声音", "直面雷暴 90 秒。X 格会造成伤害，但不会在你 2 格内生成。");
    startLoop();
  }

  function finalReveal() {
    if (state.stage >= 14) { finalHuman(); return; }
    if (state.stage >= 13) { finalDemon(); return; }
    stopAll();
    state.mode = "story";
    locked = true;
    script([
      ["旁白", "踏入影渊圣所的瞬间，所有「圣器」开始共鸣，投射出刺眼的白光。", "继续"],
      ["那个声音", "终于……等到这一刻了……", "继续"],
      ["旁白", "白光中浮现出无数战斗回放。那些被你斩杀的「魔物」褪去红色外壳，露出人类的真实样貌。", "继续"],
      ["X-0 系统", "认知过滤器已解除，候选者 213 号。", "那些都是人类？"],
      ["X-0 系统", "准确地说，是其他候选者。魔王卡梅洛早已过世，我们设置这个游戏，只是为了选出新的魔王。", "继续"],
      ["X-0 系统", "魔王必须从人类中诞生，因为只有人类的恶才能驾驭魔物的力量。那些红色外壳只是认知过滤器。", "继续"],
      ["X-0 系统", () => `看看你的「战绩」：${state.countKill} 次有效击杀。这些恶意正是魔王之力的来源。`, "我必须选择"],
    ], () => {
      locked = true;
      say("X-0 系统", "左侧红色大门通往人类社会，右侧蓝色王座通往魔王加冕。选择你的命运。");
      choices([
        { label: "走向红色大门，尝试回归人类", action: () => { locked = false; startCorridor("human"); } },
        { label: "走向蓝色王座，成为第108代魔王", action: () => { locked = false; startCorridor("demon"); } },
      ]);
      render();
    });
  }

  function startCorridor(route) {
    state.route = route;
    state.corridorConfirm = 0;
    makeGrid(5, 15);
    generateEmpty();
    state.gridName = "「终焉回廊」";
    for (let y = 1; y <= 5; y++) {
      state.grid[y][1] = state.grid[y][2] = CELL.RED;
      state.grid[y][14] = state.grid[y][15] = CELL.BLUE;
    }
    Object.assign(state.player, { x: 3, y: 8, dir: 1, hp: 3, money: state.player.money, left: false, weapon: true });
    state.confirmRoute = null;
    state.corridorConfirm = 0;
    state.mov = 0;
    beginPlay("corridor");
    say("X-0 系统", "A/← 走向红色大门，D/→ 走向蓝色王座。人类路线需按 Y 两次确认。");
    startLoop();
  }

  function handleCorridor() {
    const { player } = state;
    if (player.y <= 2) {
      say("X-0 系统", "寒风从门缝渗入。按 Y 两次确认赌上人性最后的善。");
    } else if (player.y >= 14) {
      say("X-0 系统", "王座伸出锁链。按 Y 确认成为第108代魔王。");
    } else {
      state.corridorConfirm = 0;
    }
  }

  function confirmCorridor() {
    if (state.scene !== "corridor") return;
    const { player } = state;
    if (player.y <= 2) {
      state.corridorConfirm = (state.corridorConfirm || 0) + 1;
      if (state.corridorConfirm >= 2) {
        state.stage = 14;
        saveLocal();
        finalHuman();
      } else {
        say("X-0 系统", "警告：若人类拒绝接受，你将当场被处决。再次按 Y 确认。");
      }
    } else if (player.y >= 14) {
      state.stage = 13;
      saveLocal();
      finalDemon();
    }
  }

  function setupFinalBattle(scene) {
    makeGrid(31, 31);
    generateEmpty();
    state.gridName = scene === "final-demon" ? "影渊圣所" : "荒原逃亡";
    state.ableC = true;
    state.ableF = true;
    state.cantStop = 1;
    state.enemyLimit = 18;
    state.enemyEyesight = 8;
    state.enemyStopTime = 2;
    state.attackWaitTime = 2;
    state.generateLimit = 100;
    state.mov = 1;
    state.enemySpeed = 0;
    Object.assign(state.player, { x: 16, y: 16, dir: 2, hp: 3, money: state.player.money, left: false, weapon: true });
    clearEnemies();
    for (let i = 0; i < 9; i++) newEnemy(8);
    state.lastMove = Date.now();
    beginPlay(scene);
    startLoop();
  }

  function finalDemon() {
    script([
      ["旁白", "你踏上蓝色王座的瞬间，锁链从地面升起，缠绕你的四肢。", "继续"],
      ["X-0 系统", () => `开始进行魔王权柄认证。检测到恶意浓度：${state.countKill}，符合魔王标准。`, "继续"],
      ["旁白", "你的武器彻底变形，化作一柄缠绕黑色火焰的权杖。", "继续"],
      ["X-0 系统", "欢迎，第108代魔王。警告：检测到人类联军正在集结。", "继续"],
      ["X-0 系统", "上一任魔王过世已久，魔界百废待兴，联军已攻入大殿。请亲自上阵，击败来自三大古陆的联军。", "迎战"],
    ], () => {
      setupFinalBattle("final-demon");
      say("X-0 系统", "击溃全部联军增援。停留超过 6 秒仍会受伤。");
    });
  }

  function finalHuman() {
    state.originalKills = state.countKill;
    script([
      ["旁白", "你转身冲向红色大门的瞬间，警报声骤然响起。", "继续"],
      ["X-0 系统", "检测到叛逃行为！启动清除协议！", "继续"],
      ["X-0 系统", () => `检测到恶意残留量：${state.originalKills}，清除优先级：最高级。`, "继续"],
      ["旁白", "你的武器闪烁红光，变回最初的铁剑形态。背后的圣殿开始崩塌，蓝色能量体从地底涌出。", "继续"],
      ["X-0 系统", "已释放追猎型魔物 12 体。它们对恶意残留有极高敏感度，正在向你逼近。", "逃亡"],
    ], () => {
      setupFinalBattle("final-human");
      say("那个声音", "快跑！追猎型魔物正在逼近。");
    });
  }

  function finishFinalBattle() {
    if (state.scene === "final-demon") finishEnding(4, "魔王永恒", "你击溃了人类联军，成为第108代魔王。");
    else finishEnding(state.originalKills <= 200 ? 7 : 6, state.originalKills <= 200 ? "真正的勇者" : "无处可归",
      state.originalKills <= 200 ? "人类接受了你的回归与赎罪。" : "人类无法原谅你的杀戮。已解锁按 V 收起武器。");
  }

  function playCampaign() {
    state.die = false;
    if (state.stage <= 5) startTutorial();
    else if (state.stage === 6) emberExplore(true);
    else if (state.stage === 7) emberShrine(true);
    else if (state.stage === 8) frostExplore(true);
    else if (state.stage === 9) frostShrine(true);
    else if (state.stage === 10) thunderExplore(true);
    else if (state.stage === 11) thunderShrine(true);
    else if (state.stage === 12) finalReveal();
    else if (state.stage === 13) finalDemon();
    else if (state.stage === 14) finalHuman();
    else startTutorial();
  }

  // ---------- Render ----------
  function trans(c) {
    if (c === CELL.RED) return "&";
    if (c === CELL.BLUE) return "@";
    if (c === CELL.WALL) return "#";
    if (c === CELL.EMPTY) return " ";
    if (c === CELL.BEACON) return "P";
    if (c === CELL.OBST) return "*";
    if (c === CELL.COIN) return "$";
    if (c === CELL.PALACE) return "S";
    if (c === CELL.KEY) return "K";
    if (c === CELL.LIGHT) return "X";
    return " ";
  }

  function tileClass(c) {
    if (c === CELL.WALL) return "tile-wall";
    if (c === CELL.RED) return "tile-red-zone";
    if (c === CELL.BLUE) return "tile-blue-zone";
    if (c === CELL.OBST) return "tile-obst";
    if (c === CELL.COIN) return "tile-coin";
    if (c === CELL.KEY) return "tile-key";
    if (c === CELL.LIGHT) return "tile-light";
    if (c === CELL.PALACE) return "tile-altar";
    if (c === CELL.BEACON) return "tile-beacon";
    return "";
  }

  function renderMap() {
    const { grid, n, m, player, enemies } = state;
    if (!grid) return;
    let sx = Math.max(1, player.x - 8), sy = Math.max(1, player.y - 10);
    let ex = Math.min(n, Math.max(sx + 16, player.x + 8)), ey = Math.min(m, Math.max(sy + 20, player.y + 10));
    sx = Math.max(1, Math.min(sx, ex - 16));
    sy = Math.max(1, Math.min(sy, ey - 20));
    const vh = ex - sx + 1, vw = ey - sy + 1;
    const cells = Array.from({ length: vh }, () => Array.from({ length: vw }, () => ({ ch: " ", cl: "" })));
    const put = (x, y, ch, cl) => { if (cells[x]?.[y]) cells[x][y] = { ch, cl }; };
    const inView = (p) => p.x >= sx && p.x <= ex && p.y >= sy && p.y <= ey;
    const enemyInView = (e) => inView(e) || inView(swordOf(e));
    for (let i = sx; i <= ex; i++) for (let j = sy; j <= ey; j++) {
      put(i - sx, j - sy, trans(grid[i][j]), tileClass(grid[i][j]));
    }
    const visibleHunters = enemies.filter((e) => e.alive && enemyInView(e)).sort((a, b) => distEnemy(a, player) - distEnemy(b, player)).slice(0, 12);
    if (showEnemyRange) {
      visibleHunters.forEach((e) => {
        enemyConeCells(e, sx, sy, ex, ey).forEach((p) => {
          const rx = p.x - sx, ry = p.y - sy;
          if (cells[rx]?.[ry] && cells[rx][ry].ch === " ") put(rx, ry, "░", "tile-sight");
        });
      });
      visibleHunters.filter((e) => canSee(e)).forEach((e) => {
        enemyChasePreview(e).forEach((p) => {
          const rx = p.x - sx, ry = p.y - sy;
          if (cells[rx]?.[ry] && (cells[rx][ry].ch === " " || cells[rx][ry].ch === "░")) put(rx, ry, "·", "tile-path");
        });
      });
    }
    enemies.forEach((e) => {
      if (!e.alive || !enemyInView(e)) return;
      const s = swordOf(e);
      put(s.x - sx, s.y - sy, SWORD[e.dir], e.ready ? weaponClass("tile-threat", e.dir) : weaponClass("tile-enemy-weapon", e.dir));
      put(e.x - sx, e.y - sy, e.ready ? "!" : "O", e.ready ? "tile-alert" : "tile-enemy");
    });
    if (player.weapon) {
      const ps = swordOf(player);
      put(ps.x - sx, ps.y - sy, SWORD[player.dir], weaponClass("tile-player", player.dir));
    }
    put(player.x - sx, player.y - sy, "O", "tile-player");
    const pre = document.createElement("pre");
    pre.className = "ascii-map";
    cells.forEach((row, ri) => {
      row.forEach((q) => { const s = document.createElement("span"); s.className = q.cl; s.textContent = q.ch; pre.append(s); });
      if (ri + 1 < cells.length) pre.append("\n");
    });
    ui.stage.replaceChildren(pre);
  }

  function objective() {
    const s = state.scene, p = state.player;
    if (s === "tut-coins") return ["基础移动", `金币 ${p.money}/160`, p.money / 160];
    if (s === "tut-static") return ["战斗训练", `击破 ${state.sessionKill}/10`, state.sessionKill / 10];
    if (s === "tut-move") return ["移动战斗", `击破 ${state.sessionKill}/10`, state.sessionKill / 10];
    if (s === "tut-barrier") return ["障碍试炼", `存活 60 秒`, (Date.now() - state.timerStart) / 60000];
    if (s === "tut-beacon") return ["信标试炼", `击破 ${state.sessionKill}/3`, state.sessionKill / 3];
    if (s === "ember" || s === "frost" || s === "thunder") {
      return [state.gridName, `钥匙 ${state.countKey}/${state.nKey}${compassObjectiveText()}`, state.countKey / state.nKey];
    }
    if (s.includes("shrine")) return ["圣殿试炼", `剩余 ${Math.max(0, state.timerGoal - Math.floor((Date.now() - state.timerStart) / 1000))} 秒`, 1 - (Date.now() - state.timerStart) / (state.timerGoal * 1000)];
    if (s === "corridor") return ["终焉回廊", "A/← 救赎　D/→ 权力", 0];
    if (s.startsWith("final")) return ["终局战斗", `敌军增援 ${state.generateLimit} · 场上 ${state.enemies.length}`, 1 - (state.generateLimit + state.enemies.length) / 100];
    return ["开始游戏", "选择新游戏或读取存档", 0];
  }

  const CHAPTER = { menu: "序章", "tut-coins": "教程 I", "tut-static": "教程 II", "tut-move": "教程 III", "tut-barrier": "教程 IV", "tut-beacon": "教程 V", ember: "赤烬之地", "ember-shrine": "炎核圣殿", frost: "霜骸冰原", "frost-shrine": "霜心圣殿", thunder: "雷鸣裂谷", "thunder-shrine": "雷纹圣殿", corridor: "影渊圣所", "final-demon": "魔王加冕战", "final-human": "逃亡之路" };

  function hud() {
    const p = state.player;
    ui.hp.textContent = state.mode === "play" ? (state.devMode ? "∞ / 3" : `${Math.max(0, p.hp)} / 3`) : "—";
    ui.money.textContent = state.mode === "play" ? p.money : "—";
    ui.kills.textContent = state.mode === "play" ? state.countKill : "—";
    ui.chapter.textContent = CHAPTER[state.scene] || "序章";
    const [o, d, prog] = objective();
    ui.objective.textContent = o;
    ui.detail.textContent = state.hudExtra || d;
    ui.bar.style.width = `${Math.min(100, Math.max(0, prog * 100))}%`;
    ui.turn.textContent = `TURN ${String(state.turn).padStart(4, "0")}`;
    if (ui.rangeToggle) ui.rangeToggle.checked = showEnemyRange;
  }

  function render() {
    if (state.mode === "play" && state.grid) {
      renderMap();
      ui.scene.textContent = (state.gridName || state.scene).toUpperCase();
    }
    renderDialogue();
    hud();
  }

  function togglePause(force) {
    if (state.mode !== "play") return;
    state.paused = typeof force === "boolean" ? force : !state.paused;
    stopAll();
    $("#pause-button").textContent = state.paused ? "继续" : "暂停";
    $("#pause-button").classList.toggle("primary", !state.paused);
    say("SYSTEM", state.paused ? "游戏已暂停。按 Space / P 或点击“继续”恢复。" : "游戏继续。");
    render();
  }

  // ---------- Save ----------
  const b64 = (b) => { let s = ""; b.forEach((x) => (s += String.fromCharCode(x))); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const unb = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

  async function keyMaterial(salt) {
    const m = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, m, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encrypt(data) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await keyMaterial(salt);
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(JSON.stringify(data))));
    const p = new Uint8Array(29 + cipher.length);
    p[0] = VERSION; p.set(salt, 1); p.set(iv, 17); p.set(cipher, 29);
    return "YG1." + b64(p);
  }
  async function decrypt(code) {
    if (!code.startsWith("YG1.")) throw Error("存档版本或格式不正确");
    const p = unb(code.slice(4).trim());
    if (p.length < 46 || p[0] !== VERSION) throw Error("存档数据不完整");
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: p.slice(17, 29) }, await keyMaterial(p.slice(1, 17)), p.slice(29));
    const data = JSON.parse(new TextDecoder().decode(plain));
    if (!data.player || !Array.isArray(data.haveEnd)) throw Error("存档校验失败");
    return data;
  }

  function serialize() {
    const { player, stage, countKill, haveEnd, skipPlot, ableV, scene } = state;
    return { version: VERSION, stage, player: { x: player.x, y: player.y, dir: player.dir, hp: player.hp, money: player.money, left: player.left, leftx: player.leftx, lefty: player.lefty, weapon: player.weapon }, haveEnd, skipPlot, countKill, ableV: state.ableV, scene };
  }

  async function saveLocal() { try { localStorage.setItem(SAVE_KEY, await encrypt(serialize())); } catch {} }

  function migrate(data) {
    const d = { ...fresh(), ...data };
    d.haveEnd = Array.from({ length: 8 }, (_, i) => !!data.haveEnd?.[i]);
    d.player = { ...fresh().player, ...(data.player || {}) };
    d.player.hp = 3;
    d.ableV = !!data.ableV || d.haveEnd[6];
    return d;
  }

  async function loadLocal() {
    try {
      Object.assign(state, migrate(await decrypt(localStorage.getItem(SAVE_KEY))));
      state.paused = false;
      state.die = false;
      $("#pause-button").textContent = "暂停";
      say("SYSTEM", "本地存档已读取。将从当前章节继续。");
      playCampaign();
    } catch (e) { say("SYSTEM", e.message); menu(); }
  }

  function stopAll() { heldKeys.clear(); }

  function trackDeveloperMode(k) {
    if (typeof k !== "string" || k.length !== 1) return false;
    const ch = k.toLowerCase();
    if (!/^[a-z]$/.test(ch)) return false;
    devBuffer = (devBuffer + ch).slice(-DEV_CODE.length);
    if (devBuffer !== DEV_CODE) return false;
    devBuffer = "";
    state.devMode = !state.devMode;
    if (state.devMode) {
      state.die = false;
      state.player.hp = 3;
    }
    stopAll();
    say("SYSTEM", state.devMode ? "开发者模式已开启：无敌。" : "开发者模式已关闭。");
    render();
    return true;
  }

  function devSkipTutorial() {
    if (!state.devMode || state.stage >= 6) return false;
    stopAll();
    if (typing.active) finishTyping();
    locked = false;
    state.mode = "story";
    state.paused = false;
    state.die = false;
    state.stage = 5;
    state.skipPlot = 0;
    state.inTut = 0;
    state.specialRule = 0;
    state.timerGoal = 0;
    state.timerKind = "";
    state.hudExtra = "";
    state.ableC = true;
    state.ableF = true;
    state.mov = 0;
    state.enemyLimit = 0;
    state.generateLimit = -1;
    state.sessionKill = 0;
    state.countKill = 0;
    state.countKey = 0;
    state.touchPalace = 0;
    state.player.hp = 3;
    state.player.left = false;
    state.player.weapon = true;
    clearEnemies();
    choices([]);
    saveLocal();
    script([["SYSTEM", "开发者模式：已跳过全部教学关卡。", "进入大陆"]], prePlot);
    return true;
  }

  function shopChoices() {
    choices([
      { label: `购买罗盘提示（${COMPASS_PRICE} 金币）`, action: buyCompass },
      { label: `补满生命（${HEAL_PRICE} 金币）`, action: buyHeal },
      { label: "离开商店", action: closeShop },
    ]);
  }

  function openShop() {
    if (state.mode !== "play" || state.die || ui.save.open || ui.help.open) return false;
    stopAll();
    state.shopOpen = true;
    say("商店", `金币 ${state.player.money}。罗盘会锁定当前最近的钥匙；钥匙收齐后会锁定圣殿。`);
    shopChoices();
    render();
    return true;
  }

  function buyCompass() {
    if (!state.shopOpen) return;
    const cell = explorationCellType();
    if (!cell) {
      say("商店", "当前区域没有可供罗盘锁定的探索目标。");
      shopChoices();
      render();
      return;
    }
    if (state.player.money < COMPASS_PRICE) {
      say("商店", `金币不足。罗盘需要 ${COMPASS_PRICE} 金币。`);
      shopChoices();
      render();
      return;
    }
    const target = nearestCell(cell);
    if (!target) {
      say("商店", `${explorationTargetLabel(cell)}未检测到。`);
      shopChoices();
      render();
      return;
    }
    state.player.money -= COMPASS_PRICE;
    state.compassTarget = { scene: state.scene, cell, x: target.x, y: target.y, label: explorationTargetLabel(cell) };
    say("商店", `罗盘已锁定${state.compassTarget.label}：${directionText({ ...state.compassTarget, d: manhattan(state.player, state.compassTarget) })}。`);
    shopChoices();
    render();
  }

  function buyHeal() {
    if (!state.shopOpen) return;
    if (state.player.hp >= 3) {
      say("商店", "生命已满，不需要治疗。");
      shopChoices();
      render();
      return;
    }
    if (state.player.money < HEAL_PRICE) {
      say("商店", `金币不足。补满生命需要 ${HEAL_PRICE} 金币。`);
      shopChoices();
      render();
      return;
    }
    state.player.money -= HEAL_PRICE;
    state.player.hp = 3;
    say("商店", "生命已补满。");
    shopChoices();
    render();
  }

  function closeShop() {
    if (!state.shopOpen) return;
    state.shopOpen = false;
    choices([]);
    say("SYSTEM", "商店已关闭。");
    render();
  }

  function startHold(k) {
    k = normalizeKey(k);
    if (k === "b") { if (state.shopOpen) closeShop(); else openShop(); return; }
    if (k === "y") { confirmCorridor(); return; }
    if (k === "c") { tryBarrier(); render(); return; }
    if (k === "f") { tryBeacon(); render(); return; }
    if (k === "v") { trySheathe(); render(); return; }
    heldKeys.add(k);
  }
  function stopHold(k) { heldKeys.delete(normalizeKey(k)); }

  $("#pause-button").onclick = () => togglePause();
  $("#save-button").onclick = () => { stopAll(); ui.saveStatus.textContent = ""; ui.save.showModal(); };
  $("#help-button").onclick = () => { stopAll(); ui.help.showModal(); };
  if (ui.rangeToggle) {
    ui.rangeToggle.checked = showEnemyRange;
    ui.rangeToggle.onchange = () => {
      showEnemyRange = ui.rangeToggle.checked;
      localStorage.setItem("yousyas-game-show-range", showEnemyRange ? "1" : "0");
      render();
    };
  }
  $("#export-save").onclick = async () => {
    const c = await encrypt(serialize());
    ui.code.value = c;
    try { await navigator.clipboard.writeText(c); ui.saveStatus.textContent = "存档码已生成并复制。"; }
    catch { ui.saveStatus.textContent = "存档码已生成，请手动复制。"; }
  };
  $("#import-save").onclick = async () => {
    try {
      Object.assign(state, migrate(await decrypt(ui.code.value.trim())));
      await saveLocal();
      state.paused = false;
      say("SYSTEM", "存档导入成功。");
      ui.save.close();
      playCampaign();
    } catch (e) { ui.saveStatus.textContent = e.message; }
  };
  $("#clear-save").onclick = () => { localStorage.removeItem(SAVE_KEY); ui.code.value = ""; ui.saveStatus.textContent = "本地存档已清除。"; };

  document.addEventListener("keydown", (e) => {
    const k = normalizeKey(e.key);
    if (state.shopOpen) {
      if (k === "b" || k === "Escape") closeShop();
      e.preventDefault();
      return;
    }
    if (k === "b" && !ui.save.open && !ui.help.open && openShop()) { e.preventDefault(); return; }
    if (k === "Enter" && !ui.save.open && !ui.help.open && devSkipTutorial()) { e.preventDefault(); return; }
    if (!ui.save.open && !ui.help.open && trackDeveloperMode(k)) { e.preventDefault(); return; }
    if ((k === " " || k === "p") && !ui.save.open && !ui.help.open) { e.preventDefault(); if (!e.repeat) togglePause(); return; }
    const a = ["w", "a", "s", "d", "b", "c", "f", "v", "y", "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
    if (!a.includes(k) || ui.save.open || ui.help.open) return;
    e.preventDefault();
    if (!e.repeat) startHold(k);
  });
  document.addEventListener("keyup", (e) => stopHold(e.key));
  window.addEventListener("blur", stopAll);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopAll(); });
  document.querySelectorAll("[data-key]").forEach((b) => {
    const down = (e) => { e.preventDefault(); startHold(b.dataset.key); };
    const up = (e) => { e.preventDefault(); stopHold(b.dataset.key); };
    b.addEventListener("pointerdown", down);
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("pointerleave", up);
  });

  startLoop();
  menu();
})();

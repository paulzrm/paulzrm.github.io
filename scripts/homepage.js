'use strict';

const { escapeHTML, stripHTML } = require('hexo-util');

const formatDate = date => {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((result, item) => {
    result[item.type] = item.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const excerptOf = post => {
  const raw = post.excerpt || post.content || '';
  return stripHTML(raw)
    .replace(/\s+/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .trim()
    .slice(0, 140);
};

const classify = post => {
  const labels = [
    post.title,
    ...post.tags.toArray().map(tag => tag.name),
    ...post.categories.toArray().map(category => category.name)
  ].join(' ');
  if (/题解|solution/i.test(labels)) return 'solution';
  if (/游记|旅行|赛事记录/i.test(labels)) return 'travel';
  return 'misc';
};

const renderPostItem = post => `
  <a class="post-row" href="${post.path}">
    <span>
      <strong>${escapeHTML(post.title)}</strong>
      <small>${escapeHTML(post.excerpt || '点击阅读全文')}</small>
    </span>
    <time>${post.date}</time>
  </a>`;

hexo.extend.generator.register('custom-homepage', function(locals) {
  const posts = locals.posts
    .filter(post => post.published !== false)
    .sort('date', -1)
    .toArray()
    .map(post => ({
      title: post.title,
      path: this.config.root + post.path,
      date: formatDate(post.date.toDate()),
      year: post.date.year(),
      type: classify(post),
      excerpt: excerptOf(post)
    }));

  const groups = {
    solution: posts.filter(post => post.type === 'solution'),
    travel: posts.filter(post => post.type === 'travel'),
    misc: posts.filter(post => post.type === 'misc')
  };
  const years = [...new Set(posts.map(post => post.year))].sort((a, b) => b - a);
  const recent = posts.slice(0, 8);
  const data = JSON.stringify(posts).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHTML(this.config.description)}">
  <title>${escapeHTML(this.config.title)} - 首页</title>
  <link rel="icon" href="/images/favicon-32x32-next.png">
  <style>
    :root {
      --ink: #14213d;
      --muted: #64748b;
      --line: #dce5ea;
      --paper: #f7faf9;
      --card: rgba(255,255,255,.88);
      --green: #087f5b;
      --green-dark: #056044;
      --amber: #d97706;
      --blue: #2563eb;
      --shadow: 0 18px 55px rgba(25, 55, 48, .10);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--ink);
      background:
        radial-gradient(circle at 8% 2%, rgba(8,127,91,.13), transparent 26rem),
        radial-gradient(circle at 92% 17%, rgba(37,99,235,.09), transparent 24rem),
        var(--paper);
      font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
      line-height: 1.65;
    }
    a { color: inherit; text-decoration: none; }
    button, input { font: inherit; }
    .shell { width: min(1160px, calc(100% - 36px)); margin: auto; }
    .nav {
      display: flex; align-items: center; justify-content: space-between;
      min-height: 72px; gap: 22px;
    }
    .brand { font-size: 18px; font-weight: 800; letter-spacing: .02em; }
    .brand i {
      display: inline-block; width: 11px; height: 11px; margin-right: 9px;
      border-radius: 50%; background: var(--green); box-shadow: 0 0 0 6px rgba(8,127,91,.12);
    }
    .nav-links { display: flex; flex-wrap: wrap; gap: 22px; color: #475569; font-size: 14px; }
    .nav-links a:hover { color: var(--green); }
    .hero {
      display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(300px, .7fr);
      gap: 50px; align-items: center; padding: 76px 0 68px;
    }
    .eyebrow { color: var(--green); font-weight: 800; letter-spacing: .18em; font-size: 13px; }
    h1 { margin: 12px 0 20px; font-size: clamp(42px, 7vw, 78px); line-height: 1.08; letter-spacing: -.045em; }
    .lead { max-width: 690px; color: #526174; font-size: 18px; }
    .search-box {
      display: flex; align-items: center; gap: 10px; margin-top: 34px;
      padding: 9px 10px 9px 18px; background: white; border: 1px solid var(--line);
      border-radius: 17px; box-shadow: var(--shadow);
    }
    .search-box input { min-width: 0; flex: 1; border: 0; outline: 0; color: var(--ink); background: transparent; }
    .search-box button {
      border: 0; border-radius: 12px; padding: 11px 19px; cursor: pointer;
      color: white; background: var(--green); font-weight: 700;
    }
    .search-box button:hover { background: var(--green-dark); }
    .hero-panel {
      padding: 28px; border-radius: 28px; color: white;
      background: linear-gradient(145deg, #0d3b36, #087f5b);
      box-shadow: 0 24px 70px rgba(8, 89, 67, .23);
    }
    .hero-panel h2 { margin: 0 0 6px; font-size: 16px; color: rgba(255,255,255,.72); }
    .hero-number { font-size: 70px; line-height: 1.1; font-weight: 800; }
    .hero-panel p { margin: 4px 0 22px; color: rgba(255,255,255,.75); }
    .mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .mini-stats span { padding: 13px 7px; border-radius: 13px; text-align: center; background: rgba(255,255,255,.11); font-size: 12px; }
    .mini-stats b { display: block; color: white; font-size: 20px; }
    section { padding: 30px 0 58px; }
    .section-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 24px; }
    .section-head h2 { margin: 0; font-size: clamp(27px, 4vw, 39px); letter-spacing: -.025em; }
    .section-head p { margin: 0; color: var(--muted); }
    .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .category {
      position: relative; min-height: 232px; padding: 27px; overflow: hidden;
      border-radius: 24px; border: 1px solid var(--line); background: var(--card);
      box-shadow: 0 12px 38px rgba(31, 55, 48, .07); transition: .2s ease;
    }
    .category:hover { transform: translateY(-5px); box-shadow: var(--shadow); }
    .category:after {
      content: ""; position: absolute; width: 130px; height: 130px; border-radius: 50%;
      right: -48px; bottom: -50px; background: var(--tone); opacity: .12;
    }
    .category.solution { --tone: var(--green); }
    .category.travel { --tone: var(--amber); }
    .category.misc { --tone: var(--blue); }
    .category-icon {
      display: grid; place-items: center; width: 48px; height: 48px;
      border-radius: 15px; color: white; background: var(--tone); font-weight: 900; font-size: 18px;
    }
    .category h3 { margin: 23px 0 6px; font-size: 25px; }
    .category p { margin: 0; color: var(--muted); }
    .category footer { position: absolute; left: 27px; bottom: 24px; font-weight: 800; color: var(--tone); }
    .workspace {
      padding: 26px; border-radius: 26px; border: 1px solid var(--line);
      background: rgba(255,255,255,.74); box-shadow: var(--shadow);
    }
    .controls { display: flex; flex-wrap: wrap; gap: 9px; margin-bottom: 20px; }
    .chip {
      border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px;
      color: #526174; background: white; cursor: pointer;
    }
    .chip:hover, .chip.active { color: white; border-color: var(--green); background: var(--green); }
    .result-info { color: var(--muted); font-size: 14px; margin-bottom: 9px; }
    .post-list { display: grid; }
    .post-row {
      display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px;
      padding: 18px 4px; border-bottom: 1px solid var(--line);
    }
    .post-row:hover strong { color: var(--green); }
    .post-row span { min-width: 0; }
    .post-row strong { display: block; font-size: 16px; overflow-wrap: anywhere; transition: color .15s; }
    .post-row small { display: block; margin-top: 3px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .post-row time { color: #7c8a9c; font-size: 13px; }
    .empty { padding: 45px 10px; text-align: center; color: var(--muted); }
    .timeline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .year-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px; border-radius: 17px; border: 1px solid var(--line); background: white;
      cursor: pointer;
    }
    .year-card:hover { border-color: var(--green); color: var(--green); }
    .year-card b { font-size: 22px; }
    .year-card span { color: var(--muted); font-size: 13px; }
    .site-footer { margin-top: 30px; padding: 35px 0 45px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
    @media (max-width: 820px) {
      .hero { grid-template-columns: 1fr; padding-top: 45px; }
      .category-grid { grid-template-columns: 1fr; }
      .category { min-height: 210px; }
      .timeline { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .shell { width: min(100% - 24px, 1160px); }
      .nav { align-items: flex-start; padding: 17px 0; }
      .nav-links { justify-content: flex-end; gap: 12px; }
      .hero { padding: 32px 0 45px; gap: 30px; }
      h1 { font-size: 43px; }
      .lead { font-size: 16px; }
      .search-box { padding-left: 13px; }
      .search-box button { padding-inline: 13px; }
      .workspace { padding: 18px; }
      .post-row { grid-template-columns: 1fr; gap: 5px; }
      .post-row small { white-space: normal; }
    }
  </style>
</head>
<body>
  <header class="shell nav">
    <a class="brand" href="/"><i></i>${escapeHTML(this.config.title)}</a>
    <nav class="nav-links">
      <a href="/articles/">文章列表</a>
      <a href="#explore">内容检索</a>
      <a href="/tags/">标签</a>
      <a href="/archives/">归档</a>
      <a href="https://github.com/paulzrm">GitHub</a>
    </nav>
  </header>

  <main>
    <div class="shell hero">
      <div>
        <div class="eyebrow">ALGORITHM · CONTEST · NOTES</div>
        <h1>把思考留下，<br>让知识可检索。</h1>
        <p class="lead">这里收录算法竞赛题解、比赛游记和技术笔记。输入题号、题目名称或关键字，可以直接找到相关内容。</p>
        <form class="search-box" id="hero-search">
          <input id="hero-input" aria-label="检索文章" placeholder="例如：CF1408、动态规划、IOI 2009">
          <button type="submit">开始检索</button>
        </form>
      </div>
      <aside class="hero-panel">
        <h2>文章总数</h2>
        <div class="hero-number">${posts.length}</div>
        <p>从 ${Math.min(...years)} 到 ${Math.max(...years)}，持续整理中。</p>
        <div class="mini-stats">
          <span><b>${groups.solution.length}</b>题解</span>
          <span><b>${groups.travel.length}</b>游记</span>
          <span><b>${groups.misc.length}</b>杂项</span>
        </div>
      </aside>
    </div>

    <section class="shell">
      <div class="section-head">
        <div><h2>从哪里开始？</h2><p>按内容类型快速进入，或者继续向下检索。</p></div>
      </div>
      <div class="category-grid">
        <a class="category solution" href="#explore" data-type-link="solution">
          <div class="category-icon">&lt;/&gt;</div><h3>题解</h3>
          <p>算法思路、复杂度分析与实现细节。</p><footer>${groups.solution.length} 篇 →</footer>
        </a>
        <a class="category travel" href="#explore" data-type-link="travel">
          <div class="category-icon">旅</div><h3>游记</h3>
          <p>比赛现场、训练经历与阶段记录。</p><footer>${groups.travel.length} 篇 →</footer>
        </a>
        <a class="category misc" href="#explore" data-type-link="misc">
          <div class="category-icon">记</div><h3>杂项</h3>
          <p>模板、理论、工程和其他技术笔记。</p><footer>${groups.misc.length} 篇 →</footer>
        </a>
      </div>
    </section>

    <section class="shell" id="explore">
      <div class="section-head">
        <div><h2>检索全部内容</h2><p>支持题号、名称、摘要关键字与年份组合筛选。</p></div>
        <a href="/articles/">查看传统文章列表 →</a>
      </div>
      <div class="workspace">
        <form class="search-box" id="inline-search" style="margin:0 0 17px;box-shadow:none">
          <input id="inline-input" aria-label="关键词" placeholder="输入关键词">
          <button type="submit">搜索</button>
        </form>
        <div class="controls" id="type-controls">
          <button class="chip active" data-type="all">全部</button>
          <button class="chip" data-type="solution">题解</button>
          <button class="chip" data-type="travel">游记</button>
          <button class="chip" data-type="misc">杂项</button>
        </div>
        <div class="controls" id="year-controls">
          <button class="chip active" data-year="all">全部年份</button>
          ${years.map(year => `<button class="chip" data-year="${year}">${year}</button>`).join('')}
        </div>
        <div class="result-info" id="result-info"></div>
        <div class="post-list" id="results">${recent.map(renderPostItem).join('')}</div>
      </div>
    </section>

    <section class="shell">
      <div class="section-head">
        <div><h2>按时间浏览</h2><p>选择年份，查看当年写下的所有文章。</p></div>
      </div>
      <div class="timeline">
        ${years.map(year => {
          const count = posts.filter(post => post.year === year).length;
          return `<a class="year-card" href="#explore" data-year-link="${year}"><b>${year}</b><span>${count} 篇 →</span></a>`;
        }).join('')}
      </div>
    </section>
  </main>

  <footer class="site-footer"><div class="shell">© ${new Date().getFullYear()} paulzrm · Powered by Hexo · 让每一篇旧文章都能再次被找到。</div></footer>

  <script id="post-data" type="application/json">${data}</script>
  <script>
    (() => {
      const posts = JSON.parse(document.getElementById('post-data').textContent);
      const results = document.getElementById('results');
      const info = document.getElementById('result-info');
      const heroInput = document.getElementById('hero-input');
      const inlineInput = document.getElementById('inline-input');
      let type = 'all';
      let year = 'all';
      let keyword = '';

      const escape = value => value.replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
      const render = post => '<a class="post-row" href="' + post.path + '"><span><strong>' +
        escape(post.title) + '</strong><small>' + escape(post.excerpt || '点击阅读全文') +
        '</small></span><time>' + post.date + '</time></a>';

      function update() {
        const needle = keyword.trim().toLocaleLowerCase();
        const filtered = posts.filter(post =>
          (type === 'all' || post.type === type) &&
          (year === 'all' || String(post.year) === String(year)) &&
          (!needle || (post.title + ' ' + post.excerpt).toLocaleLowerCase().includes(needle))
        );
        info.textContent = '找到 ' + filtered.length + ' 篇文章' +
          (needle ? ' · 关键词：“' + keyword.trim() + '”' : '');
        results.innerHTML = filtered.length
          ? filtered.map(render).join('')
          : '<div class="empty">没有找到匹配内容，试试更短的题号或关键词。</div>';
      }

      function setActive(container, attr, value) {
        document.querySelectorAll(container + ' .chip').forEach(button => {
          button.classList.toggle('active', button.dataset[attr] === String(value));
        });
      }

      document.getElementById('type-controls').addEventListener('click', event => {
        if (!event.target.matches('[data-type]')) return;
        type = event.target.dataset.type;
        setActive('#type-controls', 'type', type);
        update();
      });
      document.getElementById('year-controls').addEventListener('click', event => {
        if (!event.target.matches('[data-year]')) return;
        year = event.target.dataset.year;
        setActive('#year-controls', 'year', year);
        update();
      });
      document.querySelectorAll('[data-type-link]').forEach(link => link.addEventListener('click', () => {
        type = link.dataset.typeLink;
        setActive('#type-controls', 'type', type);
        update();
      }));
      document.querySelectorAll('[data-year-link]').forEach(link => link.addEventListener('click', () => {
        year = link.dataset.yearLink;
        setActive('#year-controls', 'year', year);
        update();
      }));
      document.getElementById('hero-search').addEventListener('submit', event => {
        event.preventDefault();
        keyword = heroInput.value;
        inlineInput.value = keyword;
        update();
        document.getElementById('explore').scrollIntoView();
      });
      document.getElementById('inline-search').addEventListener('submit', event => {
        event.preventDefault();
        keyword = inlineInput.value;
        heroInput.value = keyword;
        update();
      });
      update();
    })();
  </script>
</body>
</html>`;

  return { path: 'index.html', data: html };
});

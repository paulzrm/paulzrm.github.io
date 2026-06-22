(() => {
  const searchInput = document.querySelector('#site-search');
  const results = document.querySelector('#search-results');
  if (!searchInput || !results || !window.SEARCH_INDEX) return;

  const escapeHTML = value => value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const render = items => {
    if (!items.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配内容。可以尝试题号、比赛名称或年份。</div>';
      return;
    }
    results.innerHTML = items.slice(0, 12).map(item => `
      <a class="search-result" href="${item.url}">
        <span class="result-type">${escapeHTML(item.type)}</span>
        <span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description || '')}</small></span>
        <small>打开 →</small>
      </a>`).join('');
  };

  const update = () => {
    const needle = searchInput.value.trim().toLocaleLowerCase();
    if (!needle) {
      render(window.SEARCH_INDEX.filter(item => item.featured));
      return;
    }
    const words = needle.split(/\s+/);
    render(window.SEARCH_INDEX.filter(item => {
      const haystack = `${item.title} ${item.description || ''} ${item.keywords || ''}`.toLocaleLowerCase();
      return words.every(word => haystack.includes(word));
    }));
  };

  searchInput.addEventListener('input', update);
  document.querySelector('#search-form')?.addEventListener('submit', event => {
    event.preventDefault();
    update();
  });
  update();
})();

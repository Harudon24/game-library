(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const elements = ['火', '水', '木', '光', '闇', '天', '冥'];
  const species = ['神', '英', '龍', '物', '獣', '霊', '魔', '妖'];
  const controls = ['search', 'element', 'species', 'rarity', 'evolution', 'sort'];
  const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s/g, '');
  const compareName = (a, b) => a.name.localeCompare(b.name, 'ja');
  let characters = [], page = 1;
  const pageSize = 50;
  function options(id, values, label = x => x) {
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value; option.textContent = label(value); $(id).append(option);
    });
  }
  options('element', elements); options('species', species); options('rarity', [1, 2, 3, 4, 5, 6], x => `★${x}`);
  function render() {
    const query = normalize($('search').value);
    const rows = characters.filter(c => (!query || normalize(c.name).includes(query) || normalize(c.letter).includes(query)) && (!$('element').value || c.element === $('element').value) && (!$('species').value || c.species === $('species').value) && (!$('rarity').value || String(c.rarity) === $('rarity').value) && (!$('evolution').value || c.unevolved === true));
    rows.sort((a, b) => {
      if ($('sort').value === 'element') return elements.indexOf(a.element) - elements.indexOf(b.element) || compareName(a, b);
      if ($('sort').value === 'rarity') return (b.rarity ?? 0) - (a.rarity ?? 0) || compareName(a, b);
      return compareName(a, b);
    });
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(page, pages);
    const start = (page - 1) * pageSize, displayed = rows.slice(start, start + pageSize);
    $('count').textContent = rows.length ? `${rows.length}種 / ${characters.length}種中 · ${start + 1}–${start + displayed.length}件を表示` : '条件に一致するキャラはありません';
    $('list').replaceChildren();
    for (const c of displayed) {
      const card = document.createElement('article'); card.className = 'character';
      const badge = document.createElement('span'); badge.className = 'element-tag'; badge.dataset.element = c.element; badge.textContent = c.element || '？';
      const body = document.createElement('div'), title = document.createElement('h2');
      let safeURL = false;
      try { safeURL = new URL(c.reference_url).protocol === 'https:'; } catch (_) { /* No external reference. */ }
      if (safeURL) { const a = document.createElement('a'); a.href = c.reference_url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = `${c.name} ↗`; title.append(a); }
      else title.textContent = c.name;
      const meta = document.createElement('div'); meta.className = 'character-meta';
      [c.species ? `${c.species}種族` : '種族未確認', c.rarity ? `★${c.rarity}` : '星未確認', c.letter ? `「${c.letter}」` : '文字未確認'].forEach(text => { const span = document.createElement('span'); span.textContent = text; meta.append(span); });
      if (c.unevolved === true) { const span = document.createElement('span'); span.className = 'unevolved'; span.textContent = '未進化'; meta.append(span); }
      body.append(title, meta); card.append(badge, body); $('list').append(card);
    }
    if (!rows.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = '名前の一部で検索するか、絞り込み条件を減らしてください。'; $('list').append(empty); }
    $('pagination').hidden = pages <= 1; $('page').textContent = `${page} / ${pages}ページ`;
    $('prev').disabled = page === 1; $('next').disabled = page === pages;
  }
  controls.forEach(id => $(id).addEventListener('input', () => { page = 1; render(); }));
  $('reset').addEventListener('click', () => { controls.forEach(id => $(id).value = id === 'sort' ? 'name' : ''); page = 1; render(); });
  for (const [id, step] of [['prev', -1], ['next', 1]]) $(id).addEventListener('click', () => { page += step; render(); $('count').scrollIntoView({block: 'start'}); });
  fetch('owned-characters.json', {cache: 'no-cache'})
    .then(response => { if (!response.ok) throw new Error('load'); return response.json(); })
    .then(data => {
      if (!Array.isArray(data.characters) || data.characters.some(c => !c.id || typeof c.name !== 'string') || new Set(data.characters.map(c => c.id)).size !== data.characters.length) throw new Error('data');
      characters = data.characters; $('total').textContent = characters.length.toLocaleString('ja'); $('updated').textContent = `更新 ${data.updated}`; render();
    })
    .catch(() => { $('count').textContent = ''; $('updated').textContent = '読み込み失敗'; $('error').hidden = false; $('error').textContent = '所持データを読み込めませんでした。通信状態を確認してページを再読み込みしてください。'; controls.forEach(id => $(id).disabled = true); $('reset').disabled = true; });
})();

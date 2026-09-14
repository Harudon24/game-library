(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const controls = ['search', 'difficulty', 'owned', 'full', 'sort'];
  const difficultyOrder = ['魔級・破滅級','破滅級','魔級','超級','上級','中級'];
  const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s/g, '').replace(/[（）]/g, m => m === '（' ? '(' : ')');
  const load = path => fetch(path, {cache:'no-cache'}).then(r => { if (!r.ok) throw new Error(path); return r.json(); });
  let descents = [], status = {}, ownedNames = new Set(), page = 1;
  const pageSize = 60;
  function stateOf(d) {
    const s = status[d.name] || {};
    const full = s.full === true || Number(s.fuku) >= Number(s.max_fuku || 99);
    const owned = full || ownedNames.has(normalize(d.name));
    return {owned, full, s};
  }
  function render() {
    const q = normalize($('search').value);
    let rows = descents.filter(d => {
      const st = stateOf(d);
      const fullUnknown = st.owned && !st.full && !Number.isFinite(Number(st.s.fuku));
      return (!q || normalize(d.name).includes(q))
        && (!$('difficulty').value || d.difficulty === $('difficulty').value)
        && (!$('owned').value || ($('owned').value === 'owned' ? st.owned : !st.owned))
        && (!$('full').value
          || ($('full').value === 'full' && st.full)
          || ($('full').value === 'notfull' && !st.full)
          || ($('full').value === 'unknown' && fullUnknown));
    });
    rows.sort((a,b) => {
      if ($('sort').value === 'name') return a.name.localeCompare(b.name,'ja');
      if ($('sort').value === 'status') {
        const A = stateOf(a), B = stateOf(b);
        const rank = x => x.full ? 2 : x.owned ? 1 : 0;
        return rank(B)-rank(A) || a.name.localeCompare(b.name,'ja');
      }
      return difficultyOrder.indexOf(a.difficulty)-difficultyOrder.indexOf(b.difficulty) || a.name.localeCompare(b.name,'ja');
    });
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(page, pages);
    const start = (page-1)*pageSize, shown = rows.slice(start,start+pageSize);
    $('count').textContent = rows.length ? `${rows.length}件 / ${descents.length}件中 · ${start+1}–${start+shown.length}件を表示` : '条件に一致する降臨はありません';
    $('list').replaceChildren();
    for (const d of shown) {
      const st = stateOf(d);
      const card = document.createElement('article'); card.className='character descent';
      const badge = document.createElement('span'); badge.className='difficulty-tag'; badge.textContent=d.difficulty.replace('・','/');
      const body = document.createElement('div'); const title = document.createElement('h2');
      const a = document.createElement('a'); a.href=d.reference_url; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent=`${d.name} ↗`; title.append(a);
      const meta = document.createElement('div'); meta.className='character-meta';
      const own = document.createElement('span'); own.className = st.owned ? 'owned-mark' : 'unowned-mark'; own.textContent = st.owned ? '所持' : '未所持'; meta.append(own);
      const fuku = document.createElement('span');
      if (st.full) { fuku.className='full-mark'; fuku.textContent='満福'; }
      else if (Number.isFinite(Number(st.s.fuku))) { fuku.className='fuku-mark'; fuku.textContent=`福 ${st.s.fuku}/${st.s.max_fuku || 99}`; }
      else { fuku.className='unknown-mark'; fuku.textContent=st.owned ? '満福 未確認' : '—'; }
      meta.append(fuku);
      if (st.s.note) { const note=document.createElement('span'); note.textContent=st.s.note; meta.append(note); }
      body.append(title,meta); card.append(badge,body); $('list').append(card);
    }
    if (!rows.length) { const empty=document.createElement('p'); empty.className='empty'; empty.textContent='検索条件を減らしてください。'; $('list').append(empty); }
    $('pagination').hidden = pages <= 1; $('page').textContent=`${page} / ${pages}ページ`; $('prev').disabled=page===1; $('next').disabled=page===pages;
  }
  controls.forEach(id => $(id).addEventListener('input', () => {page=1;render();}));
  $('reset').addEventListener('click', () => { controls.forEach(id => $(id).value = id==='sort'?'difficulty':''); page=1;render(); });
  $('prev').addEventListener('click', () => { page--; render(); $('count').scrollIntoView({block:'start'}); });
  $('next').addEventListener('click', () => { page++; render(); $('count').scrollIntoView({block:'start'}); });
  Promise.all([load('descents.json'),load('descent-status.json'),load('owned-characters.json'),load('owned-characters-manual.json')])
    .then(([d,s,o,m]) => {
      descents = (d.descents || []).map(row => ({name:row[0], difficulty:row[1], reference_url:d.source_url})); status = s.statuses || {};
      ownedNames = new Set([...(o.characters||[]),...(m.characters||[])].map(c => normalize(c.name)));
      difficultyOrder.forEach(v => { const op=document.createElement('option'); op.value=v; op.textContent=v; $('difficulty').append(op); });
      const states = descents.map(stateOf);
      $('total').textContent=descents.length.toLocaleString('ja');
      $('ownedTotal').textContent=states.filter(x=>x.owned).length.toLocaleString('ja');
      $('fullTotal').textContent=states.filter(x=>x.full).length.toLocaleString('ja');
      $('updated').textContent=`更新 ${[d.updated,s.updated,o.updated,m.updated].filter(Boolean).sort().at(-1) || '不明'}`;
      render();
    })
    .catch(() => {
      $('count').textContent=''; $('updated').textContent='読み込み失敗'; $('error').hidden=false;
      $('error').textContent='降臨データを読み込めませんでした。ページを再読み込みしてください。';
      controls.forEach(id => $(id).disabled=true); $('reset').disabled=true;
    });
})();
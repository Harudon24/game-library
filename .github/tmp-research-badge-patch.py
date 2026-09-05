from pathlib import Path

path = Path('games/ark-survival-ascended/maps/habitats.html')
text = path.read_text(encoding='utf-8')

old_css = ".creature-card .mini-arrow{position:absolute;right:10px;top:9px;color:#555;font-size:13px}"
new_css = old_css + "\n    .research-badge{display:inline-block;margin-top:7px;padding:3px 7px;border:1px solid #5a4720;border-radius:999px;background:#151006;color:#d8b968;font-size:9px;font-weight:900;letter-spacing:.06em}"
if old_css not in text:
    raise SystemExit('CSS anchor not found')
text = text.replace(old_css, new_css, 1)

old_render = "grid.innerHTML=filtered.map(c=>`<a class=\"creature-card\" href=\"${detailUrl(c)}\"><span class=\"mini-arrow\">→</span><small>${escapeHtml(c.group)}</small><strong>${escapeHtml(c.name)}</strong></a>`).join('');"
new_render = "grid.innerHTML=filtered.map(c=>{const researching=slug==='astraeos' && String(c.status||'').includes('調査中');return `<a class=\"creature-card\" href=\"${detailUrl(c)}\"><span class=\"mini-arrow\">→</span><small>${escapeHtml(c.group)}</small><strong>${escapeHtml(c.name)}</strong>${researching?'<span class=\"research-badge\">調査中</span>':''}</a>`}).join('');"
if old_render not in text:
    raise SystemExit('render anchor not found')
text = text.replace(old_render, new_render, 1)

path.write_text(text, encoding='utf-8')
print('patched')

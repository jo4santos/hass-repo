/* casa-ementa-card v0.3.3 — dentro de um pop-up o título e a semana passam para o cabeçalho do pop-up; iniciais sobrepostas e linhas entre refeições; atualiza as tarefas da semana que já existem (nova, a atualizar, a remover); tarefas editáveis na pré-visualização (editar, remover, adicionar por dia) antes de confirmar; ementa semanal dentro do popup: escolher a semana, colar o texto, pré-visualização (script.ementa_interpretar), confirmar (script.ementa_gravar) e tabela da semana com iniciais (input_text.ementa_*) */
(() => {
if (customElements.get('casa-ementa-card')) return;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WD = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
const WK = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const PP = { Z: '#8bd5ca', J: '#f5a97f', L: '#c6a0f6', D: '#8aadf4' };
const p2 = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const dt = (s) => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); };
const add = (s, k) => { const d = dt(s); d.setDate(d.getDate() + k); return iso(d); };
const mon = (s) => add(s, -((dt(s).getDay() + 6) % 7));
const lab = (s, k) => { const d = dt(add(s, k)); return WD[(d.getDay() + 6) % 7] + ' ' + p2(d.getDate()) + '/' + p2(d.getMonth() + 1); };
const sh = (s, k) => { const d = dt(add(s, k)); return p2(d.getDate()) + '/' + p2(d.getMonth() + 1); };
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
const parseMeals = (s) => String(s || '').split('~').map((x) => x.trim()).filter(Boolean).map((x) => { const p = x.split('|'); return { r: (p[0] || '').trim(), i: (p[1] || '').trim(), p: p.slice(2).join('|').trim() }; });
const chips = (i) => { const t = String(i || '').trim(); const l = [...t].filter((c) => PP[c]); return l.length ? l.map((c) => `<span class="pp" style="background:${PP[c]}">${c}</span>`).join('') : '<span class="nb">ninguém</span>'; };
const mealsHtml = (s) => parseMeals(s).map((m) => `<div class="ml"><span class="mr">${esc(m.r)}</span><span class="cs">${chips(!m.p || m.p === '-' ? '' : m.i)}</span><span class="mp">${!m.p || m.p === '-' ? '<span class="nb">—</span>' : esc(m.p)}</span></div>`).join('');
const CHECK = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const CAL = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"/></svg>';
const CSS = `
:host{display:block;color:var(--primary-text-color);font-size:15px;line-height:1.35}
*{box-sizing:border-box}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:center;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,textarea:focus-visible,input:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.w{display:flex;flex-direction:column;gap:12px;padding:4px}
h3{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em}
.cap{font-size:13px;color:var(--secondary-text-color)}
textarea::placeholder,input::placeholder{color:var(--primary-text-color);opacity:.45}
.seg{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--secondary-background-color)}
.seg button,.calb{flex:1 1 0;min-width:0;min-height:44px;padding:4px 6px;border-radius:10px;font-size:14px;font-weight:500;line-height:1.15}
.seg .on{background:var(--primary-text-color);color:var(--ha-card-background,var(--card-background-color,#24273a));font-weight:600}
.calb{flex:0 0 44px;position:relative;display:grid;place-items:center;padding:0;cursor:pointer}
.calb input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
textarea{width:100%;min-height:96px;padding:12px;border:0;border-radius:12px;background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:16px;line-height:22px;resize:vertical;-webkit-appearance:none;appearance:none}
.foot{display:flex;gap:8px;justify-content:flex-end}
.btn{flex:0 1 auto;min-height:44px;padding:4px 16px;border-radius:12px;background:var(--secondary-background-color);font-size:14px;font-weight:500;line-height:1.15}
.btn.pri{background:var(--primary-color);color:#181926;font-weight:600}
.err{font-size:13px;color:var(--error-color,#ed8796);overflow-wrap:anywhere}
.inf{font-size:13px;color:var(--secondary-text-color)}
.day{display:flex;flex-direction:column;gap:0;padding:10px 14px 4px;border-radius:12px;background:var(--secondary-background-color)}
.dn{font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--secondary-text-color);padding-bottom:2px}
.ml{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;padding:8px 0}
.ml+.ml{border-top:1px solid color-mix(in srgb,var(--primary-text-color) 10%,transparent)}
.tbl{display:flex;flex-direction:column;gap:8px}
.mr{flex:0 0 96px;font-size:13px;color:var(--secondary-text-color)}
.cs{flex:none;display:inline-flex;align-items:center;gap:0;min-width:86px;padding-left:2px}
.pp{width:24px;height:24px;border-radius:50%;display:inline-grid;place-items:center;font-size:11px;font-weight:700;color:#181926;box-shadow:0 0 0 2px var(--secondary-background-color)}
.pp+.pp{margin-left:-4px}
.nb{font-size:12px;color:var(--secondary-text-color)}
.mp{flex:1 1 160px;min-width:0;overflow-wrap:anywhere}
.tk{margin:2px 0 8px;padding:8px 10px;border-radius:10px;background:var(--ha-card-background,var(--card-background-color,#24273a));box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.3))}
.tt{font-weight:600}
.td{font-size:13px;color:var(--secondary-text-color);overflow-wrap:anywhere}
.ta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.sm{min-height:36px;padding:2px 12px;border-radius:10px;background:var(--secondary-background-color);font-size:13px;font-weight:500}
.sm.pri{background:var(--primary-color);color:#181926;font-weight:600}
.sm.del{color:var(--error-color,#ed8796)}
.add{align-self:flex-start;margin:2px 0 8px;min-height:36px;padding:2px 12px;border-radius:10px;font-size:13px;font-weight:500;color:var(--primary-color);box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.3))}
.tk input,.tk textarea{display:block;width:100%;min-height:40px;margin-top:6px;padding:8px 10px;border:0;border-radius:8px;background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:16px;-webkit-appearance:none;appearance:none}
.tk textarea{min-height:72px;line-height:20px;resize:vertical}
.okb{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 0;text-align:center;font-size:20px;font-weight:600}
.okb i{width:72px;height:72px;border-radius:50%;background:var(--ok,#a6da95);color:#181926;display:grid;place-items:center}
.sec{display:flex;align-items:center;gap:10px;margin-top:4px}.sec b{font-size:13px;color:var(--secondary-text-color);white-space:nowrap}.sec i{flex:1;height:1px;background:var(--divider-color)}
.bd{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:8px;font-size:11px;font-weight:600;background:var(--secondary-background-color);color:var(--secondary-text-color);vertical-align:1px}
.bd.nv{background:var(--primary-color);color:#181926}
.bd.up{background:#eed49f;color:#181926}
.tk.rm .tt{text-decoration:line-through;opacity:.6}
`;
class CasaEmentaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="w"></div>`;
    this._root = this.shadowRoot.querySelector('.w');
    const hoje = iso(new Date()), dow = (new Date().getDay() + 6) % 7;
    this._s = { sem: dow <= 2 ? mon(hoje) : add(mon(hoje), 7), texto: '', phase: 'edit', prev: null, err: '', done: null };
    this._root.addEventListener('click', (e) => { const b = e.target.closest('button[data-a]'); if (b && !b.disabled) this._act(b.dataset.a, b.dataset.v); });
    this._root.addEventListener('input', (e) => {
      if (e.target.dataset && e.target.dataset.a === 'txt') { this._s.texto = e.target.value; const b = this._root.querySelector('[data-a="int"]'); if (b) b.disabled = !e.target.value.trim(); }
    });
    this._root.addEventListener('input', (e) => {
      const a = e.target.dataset && e.target.dataset.a, ed = this._s.edit;
      if (!ed || (a !== 'et' && a !== 'ed')) return;
      if (a === 'et') { ed.titulo = e.target.value; const b = this._root.querySelector('[data-a="sv"]'); if (b) b.disabled = !e.target.value.trim(); } else ed.descricao = e.target.value;
    });
    this._root.addEventListener('change', (e) => {
      if (e.target.dataset && e.target.dataset.a === 'date' && e.target.value) { this._s.sem = mon(e.target.value); this._render(); }
    });
    this._render();
  }
  setConfig(c) { this._c = c || {}; }
  set hass(h) { this._hass = h; const t = this._root.querySelector('.tbl'); if (t) t.innerHTML = this._tableHtml(); }
  getCardSize() { return 8; }
  getGridOptions() { return { columns: 'full' }; }
  /* dentro de um pop-up (bubble-card) escreve o título no cabeçalho do pop-up; devolve false se não houver, e o título fica no cartão */
  _title(t) {
    let n = this, pop = null;
    for (let k = 0; k < 14 && n && !pop; k++) { pop = n.closest ? n.closest('.bubble-pop-up') : null; const r = n.getRootNode ? n.getRootNode() : null; n = r && r.host; }
    const el = pop && (pop.querySelector('.bubble-header .bubble-name') || pop.querySelector('.bubble-name'));
    if (!el) return false;
    if (el.textContent !== t) el.textContent = t;
    return true;
  }
  connectedCallback() { this._render(); }
  _st(id) { const s = this._hass && this._hass.states[id]; return s && s.state !== 'unknown' && s.state !== 'unavailable' ? s.state : ''; }
  _tableHtml() {
    const dias = WK.map((k, i) => ({ i, m: this._st('input_text.ementa_' + k) }));
    const sem = this._st('input_datetime.ementa_semana');
    if (!dias.some((d) => d.m)) return '<div class="sec"><b>Tabela da semana</b><i></i></div><div class="cap">A tabela ainda não tem ementa.</div>';
    const ref = sem ? mon(sem) : '';
    return `<div class="sec"><b>Tabela da semana${ref ? ' de ' + sh(ref, 0) : ''}</b><i></i></div>` + dias.filter((d) => d.m).map((d) => `<div class="day"><div class="dn">${esc(ref ? lab(ref, d.i) : WK[d.i])}</div>${mealsHtml(d.m)}</div>`).join('');
  }
  _prevHtml() {
    const v = this._s.prev, novas = Array.isArray(v.novas) ? v.novas : [], dias = Array.isArray(v.dias) ? v.dias : [], rem = Array.isArray(v.remover) ? v.remover : [], by = {};
    dias.forEach((d) => { (by[d.dia] = by[d.dia] || { m: '', t: [] }).m = d.refeicoes; });
    novas.forEach((t, k) => { (by[t.dia] = by[t.dia] || { m: '', t: [] }).t.push({ t, k }); });
    rem.forEach((r, k) => { const b = (by[r.dia] = by[r.dia] || { m: '', t: [] }); (b.r = b.r || []).push({ r, k }); });
    let h = '';
    for (let i = 0; i < 7; i++) {
      const x = by[i] || (i < 5 ? { m: '', t: [] } : null); if (!x) continue;
      h += `<div class="day"><div class="dn">${esc(lab(v.semana, i))}</div>${mealsHtml(x.m)}${x.t.map((o) => this._tkHtml(o.t, o.k)).join('')}${(x.r || []).map((o) => this._rmHtml(o.r, o.k)).join('')}${this._s.edit && this._s.edit.k === -1 && this._s.edit.dia === i ? this._formHtml() : `<button class="add" data-a="add" data-v="${i}"${this._s.phase === 'saving' ? ' disabled' : ''}>+ Tarefa</button>`}</div>`;
    }
    return h;
  }
  _tkHtml(t, k) {
    const e = this._s.edit;
    if (e && e.k === k) return this._formHtml();
    const d = this._s.phase === 'saving' ? ' disabled' : '';
    return `<div class="tk"><div class="tt">${esc(t.titulo)}${this._bd(t)}</div><div class="td">${esc(t.descricao)}</div><div class="ta"><button class="sm" data-a="edt" data-v="${k}"${d}>Editar</button><button class="sm del" data-a="rm" data-v="${k}"${d}>Remover</button></div></div>`;
  }
  _bd(t) { return t.acao === 'nova' ? '<span class="bd nv">nova</span>' : t.acao === 'atualizar' ? '<span class="bd up">a atualizar</span>' : t.acao === 'igual' ? '<span class="bd">já existe</span>' : ''; }
  _rmHtml(r, k) {
    const d = this._s.phase === 'saving' ? ' disabled' : '';
    return `<div class="tk rm"><div class="tt">${esc(r.titulo)}<span class="bd">a remover</span></div><div class="ta"><button class="sm" data-a="keep" data-v="${k}"${d}>Manter</button></div></div>`;
  }
  _formHtml() {
    const e = this._s.edit;
    return `<div class="tk"><input type="text" data-a="et" placeholder="Tarefa" value="${esc(e.titulo)}"><textarea data-a="ed" placeholder="Descrição (2 ou 3 passos, opcional)">${esc(e.descricao)}</textarea><div class="ta"><button class="sm pri" data-a="sv"${e.titulo.trim() ? '' : ' disabled'}>Guardar</button><button class="sm" data-a="cx">Cancelar</button></div></div>`;
  }
  _edit(a, v) {
    const s = this._s;
    if (s.phase !== 'preview' || !s.prev) return;
    const nv = s.prev.novas = Array.isArray(s.prev.novas) ? s.prev.novas : [], rm0 = s.prev.remover = Array.isArray(s.prev.remover) ? s.prev.remover : [], k = Number(v);
    if (a === 'edt') { const t = nv[k]; if (t) s.edit = { k, titulo: String(t.titulo || ''), descricao: String(t.descricao || '') }; }
    else if (a === 'add') s.edit = { k: -1, dia: k, titulo: '', descricao: '' };
    else if (a === 'rm') { const t = nv[k]; if (t && t.uid) rm0.push({ uid: t.uid, titulo: t.titulo, descricao: t.descricao, due: t.due, dia: t.dia }); nv.splice(k, 1); s.edit = null; }
    else if (a === 'keep') { rm0.splice(k, 1); s.edit = null; }
    else if (a === 'cx') s.edit = null;
    else if (a === 'sv' && s.edit && s.edit.titulo.trim()) {
      const e = s.edit, ti = e.titulo.trim(), de = e.descricao.trim();
      if (e.k === -1) nv.push({ dia: e.dia, titulo: ti, descricao: de, due: add(s.prev.semana, e.dia), acao: 'nova', uid: '' });
      else if (nv[e.k]) { const o = nv[e.k]; if (o.uid && o.acao === 'igual' && (o.titulo !== ti || o.descricao !== de)) o.acao = 'atualizar'; o.titulo = ti; o.descricao = de; }
      s.edit = null;
    }
    s.err = '';
    this._render();
  }
  _render() {
    const s = this._s;
    let h = '';
    if (s.phase === 'edit' || s.phase === 'loading') {
      const busy = s.phase === 'loading', hoje = iso(new Date()), cur = mon(hoje), nxt = add(cur, 7), d = busy ? ' disabled' : '';
      if (!this._title('Ementa semanal · ' + sh(s.sem, 0) + ' a ' + sh(s.sem, 6))) h += `<div><h3>Ementa semanal</h3><div class="cap">Semana de ${sh(s.sem, 0)} a ${sh(s.sem, 6)}</div></div>`;
      h += `<div class="seg"><button data-a="wk" data-v="${cur}" class="${s.sem === cur ? 'on' : ''}"${d}>Esta semana</button><button data-a="wk" data-v="${nxt}" class="${s.sem === nxt ? 'on' : ''}"${d}>Próxima semana</button><label class="calb" aria-label="Escolher a data">${CAL}<input type="date" data-a="date" value="${s.sem}"${d}></label></div>`;
      h += `<textarea data-a="txt" placeholder="Cola aqui o texto da ementa"${d}>${esc(s.texto)}</textarea>`;
      if (busy) h += '<div class="inf">A interpretar a ementa… pode demorar até meio minuto.</div>';
      if (s.err) h += `<div class="err">${esc(s.err)}</div>`;
      h += `<div class="foot"><button class="btn pri" data-a="int"${busy || !s.texto.trim() ? ' disabled' : ''}>Interpretar</button></div>`;
      h += `<div class="tbl">${this._tableHtml()}</div>`;
    } else if (s.phase === 'preview' || s.phase === 'saving') {
      const v = s.prev, T = v.novas || [], cn = (a) => T.filter((t) => t.acao === a).length, nn = cn('nova'), nu = cn('atualizar'), nr = (v.remover || []).length, n = nn + nu + nr, ja = cn('igual') + (Number(v.ja_feitas) || 0), busy = s.phase === 'saving';
      h += `<div>${this._title('Pré-visualização · ' + sh(v.semana, 0) + ' a ' + sh(v.semana, 6)) ? '' : '<h3>Pré-visualização</h3>'}<div class="cap">Semana de ${sh(v.semana, 0)} a ${sh(v.semana, 6)} · ${[nn ? plural(nn, 'nova', 'novas') : '', nu ? plural(nu, 'a atualizar', 'a atualizar') : '', nr ? plural(nr, 'a remover', 'a remover') : ''].filter(Boolean).join(' · ') || 'sem alterações'}${ja ? ' · ' + plural(ja, 'já igual', 'já iguais') : ''}</div></div>`;
      h += this._prevHtml();
      if (busy) h += '<div class="inf">A gravar…</div>';
      if (s.err) h += `<div class="err">${esc(s.err)}</div>`;
      h += `<div class="foot"><button class="btn" data-a="back"${busy ? ' disabled' : ''}>Voltar</button><button class="btn pri" data-a="ok"${busy || s.edit ? ' disabled' : ''}>${n ? 'Confirmar ' + plural(n, 'alteração', 'alterações') : 'Gravar tabela'}</button></div>`;
    } else {
      const D = s.done || {}, pt = [[D.criadas, 'criada', 'criadas'], [D.atualizadas, 'atualizada', 'atualizadas'], [D.removidas, 'removida', 'removidas']].filter((x) => Number(x[0]) > 0).map((x) => plural(Number(x[0]), x[1], x[2]));
      h += `<div class="okb"><i>${CHECK}</i><div>Ementa gravada</div><div class="cap">${pt.length ? 'Tarefas: ' + pt.join(' · ') : 'Sem alterações às tarefas'} em Arrumação / Limpeza</div></div>`;
      h += '<div class="foot"><button class="btn" data-a="new">Nova ementa</button></div>';
      h += `<div class="tbl">${this._tableHtml()}</div>`;
    }
    this._root.innerHTML = h;
  }
  async _call(service, data) {
    const r = await this._hass.callWS({ type: 'call_service', domain: 'script', service, service_data: data, return_response: true });
    return r && r.response;
  }
  async _act(a, v) {
    const s = this._s;
    if (['edt', 'rm', 'add', 'sv', 'cx', 'keep'].indexOf(a) >= 0) { this._edit(a, v); return; }
    if (a === 'back' || a === 'new' || a === 'int') s.edit = null;
    if (a === 'wk') { s.sem = v; this._render(); }
    else if (a === 'back') { s.phase = 'edit'; s.err = ''; this._render(); }
    else if (a === 'new') { s.phase = 'edit'; s.texto = ''; s.prev = null; s.done = null; s.err = ''; this._render(); }
    else if (a === 'int') {
      s.phase = 'loading'; s.err = ''; this._render();
      try {
        const r = await this._call('ementa_interpretar', { semana: s.sem, texto: s.texto });
        if (r && r.ok) { s.prev = r; s.phase = 'preview'; }
        else { s.phase = 'edit'; s.err = 'Não consegui interpretar a ementa. Confirma o texto e tenta outra vez.'; }
      } catch (e) { s.phase = 'edit'; s.err = (e && e.message) || 'Falhou a interpretação.'; }
      this._render();
    } else if (a === 'ok') {
      s.phase = 'saving'; s.err = ''; this._render();
      try {
        const r = await this._call('ementa_gravar', { semana: s.prev.semana, dias: s.prev.dias, tarefas: s.prev.novas || [], remover: (s.prev.remover || []).map((r) => String(r.uid)) });
        if (r && r.ok) { s.done = r; s.phase = 'done'; }
        else { s.phase = 'preview'; s.err = 'Não consegui gravar. Tenta outra vez.'; }
      } catch (e) { s.phase = 'preview'; s.err = (e && e.message) || 'Falhou a gravação.'; }
      this._render();
    }
  }
}
customElements.define('casa-ementa-card', CasaEmentaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-ementa-card', name: 'Ementa semanal', description: 'Colar a ementa, pré-visualizar, confirmar e ver a tabela da semana' });
})();

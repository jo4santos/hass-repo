/* casa-familypage-card v0.3.0 — página Família: rotina da manhã (leave = contador até à hora de sair), tarefas, pagamentos do mês */
const escP = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CHK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const pad2 = (n) => String(n).padStart(2, '0');
const dayOf = (v) => {
  if (!v) return '';
  if (String(v).length <= 10) return String(v);
  const d = new Date(v); if (isNaN(d)) return String(v).slice(0, 10);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
};

/* —— contador até à hora de sair (bloco igual em casa-family-card e casa-familypage-card; alterar nos dois) ——
   leave: { time: '08:50', label: 'escola', warn: 20, hurry: 10, grace: 15, days: ['mon'..'fri'], from: '06:00', text: {ok, warn, hurry, go} }
   mostrador = relógio só com ponteiro dos minutos: a fatia vai do ponteiro (agora) até ao minuto da saída; no máximo 60 min */
const fpLeave = (() => {
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const hm = (t) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t == null ? '' : t).trim()); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : null; };
  const num = (v, d) => (v == null || v === '' || !isFinite(Number(v)) ? d : Number(v));
  const p2 = (n) => String(n).padStart(2, '0');
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2); };
  const state = (cfg, from, now) => {
    if (!cfg || typeof cfg !== 'object') return null;
    const dep = hm(cfg.time); if (dep == null) return null;
    const d = now || new Date(), days = Array.isArray(cfg.days) && cfg.days.length ? cfg.days : DAYS.slice(1, 6);
    if (!days.some((x) => x === d.getDay() || String(x).toLowerCase().slice(0, 3) === DAYS[d.getDay()])) return null;
    const cur = d.getHours() * 60 + d.getMinutes(), start = hm(cfg.from != null ? cfg.from : from) || 0;
    const warn = num(cfg.warn, 20), hurry = Math.min(warn, num(cfg.hurry, 10)), grace = Math.max(0, num(cfg.grace, 15));
    const mins = dep - cur;
    if (cur < start || mins <= -grace || (mins <= 0 && !grace)) return null;
    const tone = mins <= 0 ? 'go' : mins < hurry ? 'hurry' : mins <= warn ? 'warn' : 'ok';
    const left = Math.max(0, mins), sweep = Math.min(left, 60) * 6, a0 = (cur % 60) * 6;
    return { tone, mins: left, a0, a1: (a0 + sweep) % 360, sweep, at: p2(Math.floor(dep / 60)) + ':' + p2(dep % 60), label: cfg.label ? String(cfg.label) : '', text: cfg.text || {} };
  };
  const WORD = { ok: 'Há tempo', warn: 'Está quase', hurry: 'Toca a despachar!', go: 'Hora de sair!' };
  const html = (s) => {
    const R = 40, to = s.label ? ' para a ' + s.label : '';
    const wedge = s.sweep >= 360 ? `<circle class="lvf" cx="50" cy="50" r="${R}"/>` : s.sweep > 0 ? `<path class="lvf" d="M50 50L${pt(s.a0, R)}A${R} ${R} 0 ${s.sweep > 180 ? 1 : 0} 1 ${pt(s.a1, R)}Z"/>` : '';
    let ticks = '';
    for (let i = 0; i < 12; i++) ticks += `<path d="M${pt(i * 30, i % 3 ? 44.5 : 43)}L${pt(i * 30, 47.5)}" stroke-width="${i % 3 ? 1.6 : 3.2}" opacity="${i % 3 ? 0.55 : 0.9}"/>`;
    const hand = (deg, r, w) => `<path d="M50 50L${pt(deg, r)}" stroke="#181926" stroke-width="${w + 2.6}"/><path d="M50 50L${pt(deg, r)}" stroke-width="${w}"/>`;
    const h = Math.floor(s.mins / 60), m = s.mins % 60;
    const big = h ? `${h}<small>h</small>${p2(m)}` : `${s.mins}<small>min</small>`;
    const dur = h ? (h === 1 ? 'Falta 1 hora' : 'Faltam ' + h + ' horas') + (m ? ' e ' + m + (m === 1 ? ' minuto' : ' minutos') : '') : s.mins === 1 ? 'Falta 1 minuto' : 'Faltam ' + s.mins + ' minutos';
    const aria = s.tone === 'go' ? 'Hora de sair' + to + ' (' + s.at + ')' : dur + ' para sair' + to + ' às ' + s.at;
    return `<div class="lv" role="timer" aria-live="off" aria-label="${esc(aria)}" data-tone="${s.tone}" data-mins="${s.mins}" data-a0="${s.a0}" data-a1="${s.a1}" data-sweep="${s.sweep}">
      <svg class="lvd" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" fill="#181926"/>${wedge}<g fill="none" stroke="#fff" stroke-linecap="round">${ticks}<path class="lvg" d="M${pt(s.a1, 38)}L${pt(s.a1, 47.5)}" stroke-width="4"/>${hand(s.a0, 40, 3.6)}</g><circle cx="50" cy="50" r="4.2" fill="#fff"/></svg>
      <div class="lvt"><span class="lvn">${s.tone === 'go' ? esc(s.text.go || 'Sair!') : big}</span><span class="lvs">Saída às ${s.at}</span></div>
    </div>`;
  };
  const css = `
.lv{--lvk:var(--ok,#a6da95);display:flex;align-items:center;gap:14px;height:calc(var(--lvd,104px) + 24px);padding:12px;border-radius:12px;box-sizing:border-box;background:var(--lvk);color:#181926;min-width:0;overflow:hidden}
.lv[data-tone=warn]{--lvk:var(--todo,#eed49f)}.lv[data-tone=hurry],.lv[data-tone=go]{--lvk:var(--late,#ed8796)}
.lvd{flex:none;display:block;width:var(--lvd,104px);height:var(--lvd,104px)}.lvf{fill:var(--lvk)}
.lvt{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}
.lvt span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lvw{font-size:20px;line-height:24px;font-weight:700}
.lvn{font-size:var(--lvn,56px);line-height:1;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em;margin:1px 0 3px}
.lvn small{font-size:.36em;font-weight:600;letter-spacing:0;margin:0 .28em 0 .14em}
.lvs{font-size:15px;line-height:20px;font-weight:600}`;
  /* tique alinhado ao minuto + ao voltar a ficar visível; fn devolve false quando o cartão já não está na página */
  const arm = (o, fn) => {
    if (o._lvT || o._lvV) return;
    const next = () => { o._lvT = setTimeout(() => { o._lvT = 0; if (fn() === false) return stop(o); next(); }, 60000 - (Date.now() % 60000) + 40); };
    o._lvV = () => { if (document.hidden) return; clearTimeout(o._lvT); if (fn() === false) return stop(o); next(); };
    document.addEventListener('visibilitychange', o._lvV); next();
  };
  const stop = (o) => { clearTimeout(o._lvT); o._lvT = 0; if (o._lvV) document.removeEventListener('visibilitychange', o._lvV); o._lvV = null; };
  /* atualiza o bloco no sítio; devolve true se o bloco tem de aparecer/desaparecer (o cartão volta a desenhar) */
  const sync = (root, s) => {
    const el = root.querySelector('.lv');
    if (!el !== !s) return true;
    if (s && (el.dataset.tone !== s.tone || +el.dataset.mins !== s.mins || +el.dataset.a0 !== s.a0)) el.outerHTML = html(s);
    return false;
  };
  return { state, html, css, arm, stop, sync };
})();
class CasaFamilyPageCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sig = ''; this._tsig = ''; this._items = {}; this._err = {}; this._ann = false; this._busy = {};
  }
  setConfig(c) {
    if (!c || (!c.kids && !c.lists && !c.payments)) throw new Error('Defina "kids", "lists" ou "payments"');
    this._c = Object.assign({ kids: [], lists: [], payments: null, people: {} }, c);
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  _lvState() { const c = this._c; return c.leave && c.kids.length ? fpLeave.state(c.leave, '06:00') : null; }
  _lvTick() { if (!this.isConnected) return false; if (this._h && fpLeave.sync(this.shadowRoot, this._lvState())) this._render(); }
  connectedCallback() { if (this._c && this._c.leave && this._h) { fpLeave.arm(this, () => this._lvTick()); this._lvTick(); } }
  disconnectedCallback() { fpLeave.stop(this); clearTimeout(this._annT); clearTimeout(this._holdT); }
  _todoIds() { const c = this._c; return c.lists.map((l) => l.entity).concat(c.payments ? [c.payments.entity] : []).filter(Boolean); }
  set hass(h) {
    this._h = h;
    const c = this._c; if (!c) return;
    if (c.leave && c.kids.length) fpLeave.arm(this, () => this._lvTick());
    const tids = this._todoIds();
    const tsig = tids.map((i) => { const s = h.states[i]; return s ? s.state + '|' + s.last_updated : '-'; }).join(';');
    if (tsig !== this._tsig) { this._tsig = tsig; this._fetchAll(); }
    const ids = c.lists.reduce((a, l) => a.concat([l.announce, l.reminder]), []).filter(Boolean);
    const sig = c.kids.map((k) => { const s = h.states[k.entity]; return s ? s.state + '|' + (s.attributes.activities || []).map((a) => (a.completed ? 1 : 0)).join('') : '-'; }).join(';')
      + '#' + ids.map((i) => (h.states[i] ? h.states[i].state : '-')).join(';') + '#' + dayOf(new Date().toISOString());
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  _fetchAll() { this._todoIds().forEach((id) => this._fetch(id)); }
  _fetch(id) {
    const h = this._h; if (!h || !h.callWS) return;
    const s = h.states[id];
    if (!s || s.state === 'unavailable') { this._items[id] = null; this._err[id] = true; this._render(); return; }
    h.callWS({ type: 'todo/item/list', entity_id: id }).then((r) => { this._items[id] = (r && r.items) || []; this._err[id] = false; this._render(); })
      .catch(() => { this._items[id] = null; this._err[id] = true; this._render(); });
  }
  _today() { return dayOf(new Date().toISOString()); }
  _visible(id, mode) {
    const items = this._items[id]; if (!items) return null;
    const today = this._today(), month = today.slice(0, 7);
    const open = [], done = [], later = [];
    items.forEach((it) => {
      const due = dayOf(it.due);
      if (it.status === 'completed') {
        const when = dayOf(it.completed) || due;
        if (mode === 'month' ? (due || when).slice(0, 7) === month : when === today) done.push(it);
      } else if (mode === 'month' && due.slice(0, 7) > month) later.push(it);
      else if (mode === 'month' || !due || due <= today) open.push(it);
    });
    const byDue = (a, b) => (dayOf(a.due) || '9').localeCompare(dayOf(b.due) || '9') || String(a.summary).localeCompare(String(b.summary), 'pt');
    open.sort(byDue); done.sort(byDue); later.sort(byDue);
    return { open, done, later };
  }
  _dueText(it) {
    const due = dayOf(it.due); if (!due) return '';
    const today = this._today();
    if (due === today) return 'Hoje';
    const p = due.split('-'); const txt = Number(p[2]) + '/' + Number(p[1]);
    return due < today && it.status !== 'completed' ? 'Desde ' + txt : txt;
  }
  _amount(it) {
    const ppl = this._c.people || {};
    let sm = String(it.summary || ''), who = [];
    const pm = sm.match(/^([A-Za-z]{1,6})\s?-\s?(.+)$/);
    if (pm && pm[1].split('').every((k) => ppl[k])) { who = pm[1].split('').map((k) => Object.assign({ k }, ppl[k])); sm = pm[2]; }
    const m = sm.match(/(~\s?)?\d+(?:[.,]\d+)?\s?€/);
    if (!m) return { name: sm, amount: String(it.description || '').slice(0, 12), who };
    const name = sm.replace(m[0], '').replace(/[\s\-–—·:(]+$/, '').replace(/\(\s*\)/, '').trim();
    return { name: name || sm, amount: m[0].replace(/\s+/g, ' ').replace('.', ','), who };
  }
  _row(id, it, pay) {
    const done = it.status === 'completed';
    const a = pay ? this._amount(it) : { name: it.summary, amount: '', who: [] };
    const due = this._dueText(it);
    const busy = this._busy[it.uid];
    return `<button class="tile row${done ? ' done' : ''}" data-item="${escP(it.uid)}" data-list="${escP(id)}" data-st="${done ? 'needs_action' : 'completed'}" aria-pressed="${done}" ${busy ? 'disabled' : ''}>
      <span class="dotw"><span class="dot${done ? ' ok' : ''}">${done ? CHK : ''}</span></span>
      <span class="rtx"><span class="nm">${escP(a.name)}</span>${due ? `<span class="st">${escP(due)}</span>` : ''}</span>
      ${a.who.length ? `<span class="who">${a.who.map((w) => `<span class="wa" title="${escP(w.name)}" style="background:${escP(w.color)}">${escP(w.k)}</span>`).join('')}</span>` : ''}${a.amount ? `<span class="amt">${escP(a.amount)}</span>` : ''}</button>`;
  }
  _kid(k) {
    const s = this._h.states[k.entity];
    const acts = s && Array.isArray(s.attributes.activities) ? s.attributes.activities : [];
    const off = !s || s.state === 'unavailable' || s.state === 'unknown';
    const n = acts.filter((a) => a.completed).length, tot = acts.length, left = tot - n;
    const C = 163.36, color = escP(k.color || 'var(--primary-color)');
    const sum = off ? 'Sem ligação' : !tot ? 'Sem passos definidos' : left === 0 ? 'Pronto para sair' : left === 1 ? 'Falta 1 passo' : 'Faltam ' + left + ' passos';
    const steps = acts.map((a) => {
      const tag = a.camera_required ? 'foto' : a.nfc_required ? 'NFC' : '';
      return `<span class="chip sp${a.completed ? ' on' : ''}"><span class="dot${a.completed ? ' ok' : ''}" ${a.completed ? `style="background:${color};border-color:${color}"` : ''}>${a.completed ? CHK : ''}</span>${escP(a.name)}${tag ? `<span class="tag">${tag}</span>` : ''}<span class="sr">${a.completed ? ' — feito' : ' — por fazer'}</span></span>`;
    }).join('');
    return { n, tot, html: `<div class="panel"><div class="kh">
      <span class="av" style="background:${color}">${escP(String(k.name || '?').charAt(0))}</span>
      <span class="ktx"><span class="nm">${escP(k.name)}</span><span class="cap">${sum}</span></span>
      <span class="ring"><svg viewBox="0 0 60 60" width="52" height="52" aria-hidden="true"><circle cx="30" cy="30" r="26" fill="none" stroke="var(--divider-color,#363a4f)" stroke-width="5"/>${n ? `<circle cx="30" cy="30" r="26" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(C * n / (tot || 1)).toFixed(1)} ${C}"/>` : ''}</svg><span class="frac">${n}/${tot}</span></span>
      </div>${steps ? `<div class="steps">${steps}</div>` : ''}</div>` };
  }
  _list(l) {
    const h = this._h, v = this._visible(l.entity, 'day');
    let body, count;
    if (!v) { body = `<div class="tile"><span class="nm muted">${this._err[l.entity] ? 'Sem ligação' : 'A carregar…'}</span></div>`; count = ''; }
    else {
      const n = v.open.length;
      count = !n ? '' : l.count_one && n === 1 ? l.count_one : n + ' ' + (l.count_label || 'por fazer');
      body = v.open.concat(v.done).map((it) => this._row(l.entity, it, false)).join('');
      if (!n) body = `<div class="tile"><span class="ic">${CHK.replace(/14/g, '18').replace('2.6', '2')}</span><span class="nm">${escP(l.empty || 'Nada pendente')}</span></div>` + body;
    }
    let extra = '';
    if (l.announce && h.states[l.announce]) extra += `<button class="chip ann${this._ann ? ' on' : ''}" data-announce="${escP(l.announce)}"><ha-icon icon="mdi:bullhorn-outline"></ha-icon>${this._ann ? 'Anunciado nas colunas' : 'Anunciar agora'}</button>`;
    if (l.reminder && h.states[l.reminder]) {
      const st = h.states[l.reminder].state, on = st === 'on', na = st === 'unavailable';
      extra += `<button class="tile row sw" role="switch" aria-checked="${on}" data-switch="${escP(l.reminder)}" data-more="${escP(l.reminder)}" ${na ? 'disabled' : ''}>
        <span class="rtx"><span class="nm">${escP(l.reminder_name || 'Lembrete diário')}</span>${na ? '<span class="st">Sem ligação</span>' : ''}</span>
        <span class="tg${on ? ' on' : ''}"><span></span></span></button>`;
    }
    return `<div class="panel"><div class="ph"><span class="pt">${escP(l.name)}</span><span class="cap">${escP(count)}</span></div>${body}${extra}</div>`;
  }
  _pay() {
    const p = this._c.payments, v = this._visible(p.entity, 'month');
    const month = new Date().toLocaleDateString('pt-PT', { month: 'long' });
    const hd = (sum) => this._div(p.name || 'Pagamentos', month + (sum ? ' · ' + sum : ''));
    if (!v) return { n: null, html: hd('') + `<div class="panel"><div class="tile"><span class="nm muted">${this._err[p.entity] ? 'Sem ligação' : 'A carregar…'}</span></div></div>` };
    const n = v.open.length;
    const grp = (title, items, empty) => `<div class="grp"><span class="gt">${title}</span>${items.length ? items.map((it) => this._row(p.entity, it, true)).join('') : `<div class="tile"><span class="nm muted">${empty}</span></div>`}</div>`;
    return { n, html: hd(n ? n + ' por pagar' : 'tudo pago') + `<div class="panel"><div class="cols wide">${grp('Por pagar', v.open, 'Tudo pago este mês')}${grp('Pagos', v.done, 'Ainda nada pago')}${v.later.length ? grp('Próximos meses', v.later, '') : ''}</div></div>` };
  }
  _div(name, sum) { return `<div class="floor"><span class="fn">${escP(name)}</span><span class="fc">${escP(sum)}</span><span class="fl"></span></div>`; }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const todo = c.lists.reduce((a, l) => { const v = this._visible(l.entity, 'day'); return a + (v ? v.open.length : 0); }, 0);
    const kids = c.kids.map((k) => Object.assign({ name: k.name }, this._kid(k)));
    const pay = c.payments ? this._pay() : null, lv = this._lvState();
    const parts = [];
    if (kids.length) parts.push('Rotina da manhã: ' + kids.map((k) => `${k.name} ${k.n} de ${k.tot}`).join(' e '));
    if (pay && pay.n != null) parts.push(pay.n === 0 ? 'pagamentos em dia' : pay.n === 1 ? '1 pagamento por tratar' : pay.n + ' pagamentos por tratar');
    const sum = parts.join('; ') + (parts.length ? '.' : '');
    this.shadowRoot.innerHTML = `<style>${CasaFamilyPageCard.css}${c.leave ? fpLeave.css + '.lv{--lvd:112px;--lvn:60px}@media(min-width:700px){.lv{--lvd:144px;--lvn:84px;gap:24px;justify-content:center}.lvt{flex:0 0 300px}.lvw{font-size:24px;line-height:28px}.lvc{font-size:16px;line-height:20px}.lvs{font-size:14px;line-height:18px}}' : ''}</style><ha-card>
      <div class="top"><span class="sum">${escP(sum || 'Família')}</span>${kids.length && c.routine_path ? `<button class="chip" data-nav="${escP(c.routine_path)}">Abrir em ecrã completo<ha-icon icon="mdi:arrow-expand"></ha-icon></button>` : ''}</div>
      ${lv ? fpLeave.html(lv) : ''}
      ${kids.length ? `<div class="cols wide">${kids.map((k) => k.html).join('')}</div>${c.routine_note ? `<span class="cap">${escP(c.routine_note)}</span>` : ''}` : ''}
      ${c.lists.length ? this._div(c.lists_name || 'Tarefas', todo ? todo + (todo === 1 ? ' pendente' : ' pendentes') : 'nada pendente') + `<div class="cols">${c.lists.map((l) => this._list(l)).join('')}</div>` : ''}
      ${pay ? pay.html : ''}
    </ha-card>`;
    this._bind();
  }
  _bind() {
    const root = this.shadowRoot, h = this._h;
    root.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
      history.pushState(null, '', b.dataset.nav);
      window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true, detail: { replace: false } }));
    }));
    root.querySelectorAll('[data-item]').forEach((b) => b.addEventListener('click', () => {
      const uid = b.dataset.item, list = b.dataset.list;
      this._busy[uid] = true; b.disabled = true;
      const fin = () => { delete this._busy[uid]; this._fetch(list); };
      Promise.resolve(h.callService('todo', 'update_item', { item: uid, status: b.dataset.st }, { entity_id: list })).then(fin, fin);
    }));
    root.querySelectorAll('[data-announce]').forEach((b) => b.addEventListener('click', () => {
      if (this._ann) return;
      h.callService('automation', 'trigger', { skip_condition: true }, { entity_id: b.dataset.announce });
      this._ann = true; this._render();
      clearTimeout(this._annT); this._annT = setTimeout(() => { this._ann = false; this._render(); }, 3000);
    }));
    root.querySelectorAll('[data-switch]').forEach((b) => b.addEventListener('click', () => {
      if (this._held) { this._held = false; return; }
      const id = b.dataset.switch, on = h.states[id] && h.states[id].state === 'on';
      h.callService('automation', on ? 'turn_off' : 'turn_on', {}, { entity_id: id });
    }));
    root.querySelectorAll('[data-more]').forEach((b) => {
      const start = () => { this._held = false; clearTimeout(this._holdT); this._holdT = setTimeout(() => { this._held = true; this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: b.dataset.more } })); }, 550); };
      const stop = () => clearTimeout(this._holdT);
      b.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => b.addEventListener(e, stop));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }
}
CasaFamilyPageCard.css = `
:host{display:block}
:host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.sum{font-size:20px;font-weight:600;margin-right:auto}
.floor{display:flex;align-items:center;gap:12px;margin:10px 0 -4px}
.fn{font-size:17px;font-weight:600}
.fc{font-size:13px;color:var(--secondary-text-color)}
.fl{flex:1;height:1px;background:var(--divider-color,rgba(127,127,127,.3))}
.fn{white-space:nowrap}.fc{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fl{min-width:12px}
.panel{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
.cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;align-items:start}
.tile{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 10px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box}
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
.nm{font-size:14px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:12px;line-height:1.3;color:var(--secondary-text-color)}
.cap{font-size:13px;line-height:1.35;color:var(--secondary-text-color)}
.chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
.chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
/* específicos da página */
.cols.wide{grid-template-columns:repeat(auto-fit,minmax(340px,1fr))}
.hd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:8px}
.hd h3{margin:0}
.top .chip ha-icon{--mdc-icon-size:18px}
.kh{display:flex;align-items:center;gap:12px}
.av{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:18px;font-weight:600;color:#181926}
.ktx{display:flex;flex-direction:column;gap:2px;min-width:0;margin-right:auto}
.ktx .nm{font-size:15px}
.ring{position:relative;flex:none;width:52px;height:52px;display:grid;place-items:center}
.ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
.frac{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.steps{display:flex;flex-wrap:wrap;gap:8px}
.chip.sp{background:var(--card-background-color);padding:0 12px 0 8px;gap:8px;cursor:default}
.chip.sp.on{background:var(--primary-text-color)}
.dot{flex:none;width:24px;height:24px;border-radius:50%;box-sizing:border-box;display:grid;place-items:center;border:2px solid var(--secondary-text-color);color:#181926;opacity:.9}
.dot.ok{background:var(--primary-text-color);border-color:var(--primary-text-color);opacity:1}
.tag{height:20px;padding:0 7px;border-radius:999px;display:inline-flex;align-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color);font-size:12px;font-weight:500}
.chip.on .tag{background:rgba(24,25,38,.14);color:inherit}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.ph{display:flex;align-items:center;justify-content:space-between;gap:10px}
.pt{font-size:16px;font-weight:600;line-height:1.3}
.row{width:100%;box-sizing:border-box}
.row.done .nm{text-decoration:line-through;color:var(--secondary-text-color)}
.dotw{flex:none;width:36px;height:36px;display:grid;place-items:center}
.rtx{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.amt{flex:none;min-width:64px;text-align:right;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
.row.done .amt{color:var(--secondary-text-color)}
.muted{color:var(--secondary-text-color);padding:0 6px}
.ann{align-self:flex-start;background:var(--card-background-color)}
.ann ha-icon{--mdc-icon-size:20px}
.sw{padding-left:14px}
.tg{flex:none;width:36px;height:20px;border-radius:10px;padding:2px;box-sizing:border-box;background:rgba(127,127,127,.35);background:color-mix(in srgb,var(--primary-text-color) 22%,transparent);display:flex;justify-content:flex-start}
.tg span{width:16px;height:16px;border-radius:50%;background:var(--secondary-text-color)}
.tg.on{background:var(--primary-text-color);justify-content:flex-end}
.tg.on span{background:var(--card-background-color)}
.badge{display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:999px;background:var(--secondary-background-color);color:var(--secondary-text-color);font-size:13px;font-weight:500}
.badge.due{background:rgba(238,212,159,.16);color:#eed49f}
.who{display:flex;gap:4px;flex:none}
.wa{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;color:#181926;font-size:12px;font-weight:600}
.grp{display:flex;flex-direction:column;gap:8px;min-width:0}
.gt{font-size:13px;font-weight:600;color:var(--secondary-text-color);margin-left:4px}
`;
const prevFP = customElements.get('casa-familypage-card');
if (!prevFP) customElements.define('casa-familypage-card', CasaFamilyPageCard);
else Object.getOwnPropertyNames(CasaFamilyPageCard.prototype).forEach((k) => { if (k !== 'constructor') Object.defineProperty(prevFP.prototype, k, Object.getOwnPropertyDescriptor(CasaFamilyPageCard.prototype, k)); }); /* página já aberta: atualiza a classe existente */
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'casa-familypage-card')) window.customCards.push({ type: 'casa-familypage-card', name: 'Casa · Página Família', description: 'Rotina da manhã, tarefas e pagamentos do mês' });

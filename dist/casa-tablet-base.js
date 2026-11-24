// casa-tablet-base v0.8.0 — classe base dos cartões de tablet de parede: relógio, chips, luzes, aquecimento, navegação (nav[].users / not_users = nomes ou ids de utilizador que veem / não veem o item; nav[].group = só um item por grupo, ganha o do utilizador; o item atual é o que tem o path da página); announce = configuração do casa-announce-card (ação Anunciar na navegação, abre num pop-up)
(() => {
const T = (window.__casaTablet = window.__casaTablet || {});
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ic = (n, s) => `<ha-icon icon="${esc(n)}"${s ? ` style="--mdc-icon-size:${s}px"` : ''}></ha-icon>`;
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const deg = (v) => { const n = num(v); return n == null ? '–' : n.toFixed(1).replace('.', ',') + '°'; };
const deg0 = (v) => { const n = num(v); return n == null ? '–' : String(Math.round(n)).replace('-', '−') + '°'; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const PER_ICON = { dia: 'mdi:white-balance-sunny', deitar: 'mdi:weather-night', noite: 'mdi:sleep' };
class Base extends HTMLElement {
constructor() {
super(); this.attachShadow({ mode: 'open' }); this._sig = ''; this._ui = {}; this._tg = {}; this._tt = {}; this._arm = null; this._ids = []; this._mh = 0;
this._bind(this.shadowRoot);
}
_bind(R) {
R.addEventListener('click', (ev) => {
const el = ev.target.closest && ev.target.closest('[data-a]'); if (!el || el.disabled) return;
if (this._held) { this._held = false; return; }
this._act(el.dataset.a, el);
});
R.addEventListener('pointerdown', (ev) => {
const t = ev.target; if (t.matches && t.matches('input[type=range]')) { this._drag = true; return; }
const el = t.closest && t.closest('[data-mi]'); this._held = false; if (!el) return;
clearTimeout(this._ht); this._ht = setTimeout(() => { this._held = true; if (this._ov && R === this._ov.shadowRoot) this._act('close', el); this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: el.dataset.mi } })); }, 550);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => R.addEventListener(n, (ev) => { clearTimeout(this._ht); if (ev.target.matches && ev.target.matches('input[type=range]')) setTimeout(() => { this._drag = false; }, 400); }, true));
R.addEventListener('input', (ev) => { const el = ev.target; if (el.dataset.bri) { const st = el.parentElement.querySelector('.st'); if (st) st.textContent = 'Acesa · ' + el.value + '%'; } if (el.dataset.vol) { const b = R.querySelector('.vv b'); if (b) b.textContent = el.value + '%'; } if (el.dataset.rvol) { const b = el.parentElement.querySelector('.vv b'); if (b) b.textContent = el.value + '%'; } });
R.addEventListener('change', (ev) => {
const el = ev.target; this._drag = false;
if (el.dataset.bri) this._svc('light.turn_on', { brightness_pct: Number(el.value) }, el.dataset.bri);
if (el.dataset.vol) this._svc('input_number.set_value', { value: Number(el.value) }, el.dataset.vol);
if (el.dataset.rvol) this._svc('media_player.volume_set', { volume_level: Number(el.value) / 100 }, el.dataset.rvol);
});
}
setConfig(c) {
this._c = this._norm(c);
const ids = new Set();
const walk = (o) => { if (typeof o === 'string') { if (/^[a-z_]+\.[a-z0-9_]+$/.test(o)) ids.add(o); else o.split('@').slice(0, 1).forEach((p) => { if (/^[a-z_]+\.[a-z0-9_]+$/.test(p)) ids.add(p); }); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
walk(Object.assign({}, c, { announce: null, family: null, routine_card: null })); this._ids = [...ids]; this._sig = ''; if (this._h) this._render();
}
_norm(c) { return c; }
getCardSize() { return 20; }
getGridOptions() { return { columns: 'full', rows: 'auto' }; }
connectedCallback() {
this._ck = setInterval(() => this._clock(), 15000);
this._rs = () => this._fit(); window.addEventListener('resize', this._rs);
[0, 300, 800, 2000, 5000].forEach((t) => setTimeout(() => this._fit(), t));
if (this._start) this._start();
}
disconnectedCallback() { this._popClose(); this._ovClose(); this._ui.sheet = null; this._emb = null; clearInterval(this._ck); window.removeEventListener('resize', this._rs); }
set hass(h) {
this._h = h; if (!this._c) return;
if (this._emb) this._emb.hass = h;
if (this._fam) this._fam.hass = h;
const L = this._leader();
const sig = this._ids.concat(L ? [L] : []).map((i) => { const s = h.states[i]; if (!s) return '-'; const a = s.attributes; return [s.state, a.brightness, a.temperature, a.current_temperature, a.current_humidity, (a.rgb_color || []).join(','), a.volume_level, a.media_title, a.media_artist, a.media_content_id, a.current_position, a.finishes_at, (a.group_members || []).length].join('|'); }).join(';');
if (sig !== this._sig && !this._drag) { this._sig = sig; this._render(); }
}
_s(e) { return e && this._h ? this._h.states[e] : undefined; }
_on(e) { const s = this._s(e); return !!s && ['on', 'open', 'opening', 'playing', 'home', 'heat'].includes(s.state); }
_bad(e) { const s = this._s(e); return !s || s.state === 'unavailable' || s.state === 'unknown'; }
_svc(ds, data, ent) { const p = ds.split('.'); return this._h.callService(p[0], p[1], data || {}, ent ? { entity_id: ent } : undefined); }
_run(list) { (list || []).forEach((a) => { const p = a.service.split('.'); this._h.callService(p[0], p[1], a.data || {}, a.target); }); }
_go(path) { /* mantém ?kiosk ao mudar de página */ const q = location.search; if (q && /[?&](kiosk|hide_header|hide_sidebar)\b/.test(q) && String(path).charAt(0) === '/' && String(path).indexOf('?') < 0) { const h = String(path).indexOf('#'); path = h < 0 ? path + q : path.slice(0, h) + q + path.slice(h); } history.pushState(null, '', path); window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true })); }
_leader() { const c = this._c && this._c.sound; if (!c || !this._h) return null; const s = this._s(c.leader_sensor || 'sensor.grupo_ativo_leader'); return s && s.state.startsWith('media_player.') ? s.state : (c.speakers && c.speakers[0] ? c.speakers[0].entity : null); }
_perOn(name) { const c = this._c, p = c.period && !this._bad(c.period) ? this._s(c.period) : null; if (!p) return false; const n = String(name || '').toLowerCase(); return n === String(p.state).toLowerCase() || n === String((c.period_labels || {})[p.state] || '').toLowerCase(); }
_armed(k) { return this._arm === k; }
_twice(k, fn) {
if (this._arm !== k) { this._arm = k; clearTimeout(this._at); this._at = setTimeout(() => { this._arm = null; this._render(); }, 5000); return this._render(); }
clearTimeout(this._at); this._arm = null; fn(); this._flash(k);
}
_flash(k) { this._ui.flash = k; this._render(); clearTimeout(this._ft); this._ft = setTimeout(() => { this._ui.flash = null; this._render(); }, 2500); }
_fit() {
const card = this.shadowRoot.querySelector('ha-card'); if (!card) return;
const top = this.getBoundingClientRect().top + (window.scrollY || 0);
const h = Math.max(0, Math.round(window.innerHeight - top - (this._c.bottom_gap == null ? 20 : this._c.bottom_gap)));
if (h !== this._mh) { this._mh = h; card.style.minHeight = h + 'px'; }
this.style.setProperty('--casa-top', Math.max(0, Math.round(top)) + 'px');
const cr = card.getBoundingClientRect(); this.style.setProperty('--casa-l', Math.max(0, Math.round(cr.left)) + 'px'); this.style.setProperty('--casa-r', Math.max(0, Math.round(document.documentElement.clientWidth - cr.right)) + 'px');
}
_clock() {
const R = this.shadowRoot, d = new Date(), k = R.querySelector('.clk'), dt = R.querySelector('.date');
const t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
if (k && k.textContent !== t) { k.textContent = t; if (this._minute) this._minute(); }
if (dt) dt.textContent = this._date();
this._fit();
}
_date() { return cap(new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })); }
_time() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
_head(title) {
const c = this._c, p = this._s(c.period), lab = p ? ((c.period_labels || {})[p.state] || cap(p.state)) : '';
return `<header class="hd"><div class="dl"><span class="date">${esc(this._date())}</span>${p && !this._bad(c.period) ? `<span class="per">${ic(PER_ICON[p.state] || 'mdi:clock-outline')}${esc(lab)}</span>` : ''}</div><h1>${esc(title)}</h1><span class="clk">${this._time()}</span></header>`;
}
_chip(icon, label, value, tone, mi) { return `<div class="cp"${mi ? ` data-mi="${esc(mi)}"` : ''}><span class="ci${tone ? ' ' + tone : ''}">${ic(icon)}</span><span class="ct"><span class="l">${esc(label)}</span><span class="v">${esc(value)}</span></span></div>`; }
_chipWeather(w) {
const s = this._s(w.entity); const t = s ? s.attributes.temperature : null; const lo = this._s(w.min), hi = this._s(w.max);
const rng = lo && hi && !this._bad(w.min) && !this._bad(w.max) ? ' · ' + Math.round(num(lo.state)) + '–' + deg0(hi.state) : '';
return this._chip('mdi:weather-partly-cloudy', 'Lá fora', (t == null ? 'Sem ligação' : deg(t)) + rng, '', w.entity);
}
_win(list) { const open = list.filter((e) => this._on(e)).length, bad = list.filter((e) => this._bad(e)).length; return { n: list.length, open, bad }; }
_chipWindows(list, label) {
const w = this._win(list), many = w.n > 1;
const v = w.open ? w.open + (w.open === 1 ? ' aberta' : ' abertas') : w.bad ? w.bad + ' sem sinal' : many ? (w.n > 3 ? 'Todas fechadas' : 'Fechadas') : 'Fechada';
return this._chip('mdi:window-closed-variant', label || (many ? w.n + ' janelas' : 'Janela'), v, w.open ? 'r' : w.bad ? 'y' : '', list[0]);
}
_heatInfo(h) {
const s = this._s(h.entity), bad = this._bad(h.entity), a = s ? s.attributes : {};
const cur = num(a.current_temperature), real = num(a.temperature);
const tgt = this._tg[h.entity] != null ? this._tg[h.entity] : real;
const off = !bad && s.state === 'off';
const heating = !bad && !off && cur != null && tgt != null && cur < tgt;
return { s, bad, off, cur, tgt, heating, hum: num(a.current_humidity), min: h.min == null ? 18 : h.min, max: h.max == null ? 22 : h.max, step: h.step || 0.5 };
}
_heatStep(el) {
const h = this._heats()[Number(el.dataset.i)], i = this._heatInfo(h); if (i.tgt == null) return;
const nt = Math.min(i.max, Math.max(i.min, Math.round((i.tgt + Number(el.dataset.d) * i.step) / i.step) * i.step));
this._tg[h.entity] = nt; clearTimeout(this._tt[h.entity]);
this._tt[h.entity] = setTimeout(() => { this._svc('climate.set_temperature', { temperature: nt }, h.entity); setTimeout(() => { delete this._tg[h.entity]; this._render(); }, 5000); }, 700);
this._render();
}
_stepper(h, idx, small) {
const i = this._heatInfo(h), dis = i.bad || i.off || i.tgt == null;
return `<div class="stpr"><button class="stp" data-a="heat" data-i="${idx}" data-d="-1" ${dis || i.tgt <= i.min ? 'disabled' : ''} aria-label="Baixar temperatura">${ic('mdi:minus', 24)}</button>
<span class="tg"><span>Alvo</span><b>${dis && i.tgt == null ? '–' : deg(i.tgt)}</b>${small ? '' : `<span>limite ${deg0(i.max)}</span>`}</span>
<button class="stp" data-a="heat" data-i="${idx}" data-d="1" ${dis || i.tgt >= i.max ? 'disabled' : ''} aria-label="Subir temperatura">${ic('mdi:plus', 24)}</button></div>`;
}
_lc(e) {
const s = this._s(e), c = s && s.state === 'on' ? s.attributes.rgb_color : null; if (!Array.isArray(c) || c.length < 3) return '';
const r = Math.round(c[0]), g = Math.round(c[1]), b = Math.round(c[2]); if (![r, g, b].every((n) => n >= 0 && n <= 255)) return '';
return ` style="background:rgb(${r},${g},${b});color:${0.299 * r + 0.587 * g + 0.114 * b > 140 ? '#181926' : '#fff'}"`;
}
_lightTile(l, cls) {
const on = this._on(l.entity), bad = this._bad(l.entity), s = this._s(l.entity);
const dim = !!s && !bad && (s.attributes.supported_color_modes || []).some((m) => m !== 'onoff');
const pct = on && s.attributes.brightness != null ? Math.max(1, Math.round(s.attributes.brightness / 2.55)) : 0;
return `<div class="tile lt ${cls || ''}${on ? ' on' : ''}${bad ? ' bad' : ''}"><button class="tm" data-a="tog" data-e="${esc(l.entity)}" data-mi="${esc(l.entity)}" ${bad ? 'disabled' : ''} aria-pressed="${on}"><span class="ic"${this._lc(l.entity)}>${ic(l.icon || 'mdi:lightbulb-outline')}</span><span class="tx"><span class="nm">${esc(l.name)}</span><span class="st">${bad ? 'Sem ligação' : on ? 'Acesa' + (dim && pct ? ' · ' + pct + '%' : '') : 'Apagada'}</span></span></button>${dim ? `<input type="range" min="1" max="100" value="${pct || 1}" data-bri="${esc(l.entity)}" aria-label="Intensidade de ${esc(l.name)}">` : ''}</div>`;
}
_navItems(items) {
const u = this._h && this._h.user, me = u ? [u.name, u.id] : [];
const has = (l) => Array.isArray(l) && l.some((x) => me.includes(x));
const seen = {}, out = [];
(items || []).forEach((n) => { if ((n.users && !has(n.users)) || has(n.not_users)) return; if (n.group) { const k = seen[n.group]; if (k == null) { seen[n.group] = out.length; out.push(n); } else if (has(n.users) && !has(out[k].users)) out[k] = n; return; } out.push(n); });
const here = location.pathname.replace(/\/$/, '');
return out.map((n) => Object.assign({}, n, { current: n.path ? n.path === here : !!n.current }));
}
_nav(all) {
const items = this._navItems(all);
return `<nav class="nv" aria-label="Navegação">${items.map((n) => n.current ? `<span class="it on" aria-current="page">${ic(n.icon)}<span class="lb">${esc(n.name)}</span></span>` : `<button class="it" data-a="go" data-p="${esc(n.path)}">${ic(n.icon)}<span class="lb">${esc(n.name)}</span></button>`).join('')}${this._c.announce ? `${items.length ? '<i class="nvd" aria-hidden="true"></i>' : ''}<button class="it" data-a="ann" aria-haspopup="dialog">${ic('mdi:bullhorn-outline')}<span class="lb">Anunciar</span></button>` : ''}</nav>`;
}
_or() { return this._ov ? this._ov.shadowRoot : this.shadowRoot; }
_ovClose() { const ov = this._ov; if (!ov) return; this._ov = null; try { if (ov.hasAttribute('popover') && ov.hidePopover) ov.hidePopover(); } catch (e) { /* já fechado */ } if (ov.parentNode) ov.parentNode.removeChild(ov); }
_theme(ov) {
const chain = []; let n = this; while (n) { if (n.style && n.style.length) chain.push(n); n = n.parentNode || n.host; }
chain.reverse().forEach((el) => { for (let i = 0; i < el.style.length; i++) { const p = el.style[i]; if (p && p.indexOf('--') === 0) ov.style.setProperty(p, el.style.getPropertyValue(p)); } });
const cs = getComputedStyle(this);
['--card-background-color', '--secondary-background-color', '--primary-background-color', '--primary-text-color', '--secondary-text-color', '--primary-color', '--divider-color', '--error-color', '--disabled-text-color', '--ha-card-background', '--ha-card-border-radius', '--ha-card-border-color', '--ha-card-border-width', '--mdc-theme-primary', '--accent-color', '--state-icon-color', '--paper-item-icon-color'].forEach((v) => { const val = cs.getPropertyValue(v); if (val) ov.style.setProperty(v, val.trim()); });
ov.style.setProperty('font-family', cs.fontFamily);
}
/* pop-ups: num elemento próprio em document.body (camada de topo com popover quando existe), para nunca ficarem presos ao cartão nem a contentores do HA */
_over(html) {
if (!html || !this.isConnected || !document.body) return this._ovClose();
let ov = this._ov, fresh = false;
if (!ov || !ov.parentNode) {
ov = this._ov = document.createElement('div'); ov.setAttribute('data-casa-sheet', ''); fresh = true;
const sr = ov.attachShadow({ mode: 'open' }); this._bind(sr);
sr.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' || ev.key === 'Esc') { ev.stopPropagation(); this._act('close', ov); } });
this._theme(ov); document.body.appendChild(ov);
if (typeof ov.showPopover === 'function') { try { ov.setAttribute('popover', 'manual'); ov.showPopover(); } catch (e) { ov.removeAttribute('popover'); } }
}
if (!fresh && ov._html === html) { if (this._emb) this._emb.hass = this._h; return; }
ov._html = html;
const sr = ov.shadowRoot, sc = sr.querySelector('.sb'), top = sc ? sc.scrollTop : 0;
sr.innerHTML = `<style>${T.CSS || ''}${T.OV_CSS || ''}</style>${html}`;
const ns = sr.querySelector('.sb'); if (ns && top) ns.scrollTop = top;
const slot = sr.querySelector('.emb'); if (slot && this._emb) { slot.appendChild(this._emb); this._emb.hass = this._h; }
if (fresh) { const x = sr.querySelector('.x'); if (x && x.focus) { try { x.focus({ preventScroll: true }); } catch (e) { x.focus(); } } }
}
_paint(html, over) {
const R = this.shadowRoot, sc = R.querySelector('.sheet'), top = sc ? sc.scrollTop : 0;
R.innerHTML = `<style>${T.CSS || ''}</style><ha-card style="min-height:${this._mh}px">${html}</ha-card>${(this._c.nav && this._c.nav.length) || this._c.announce ? `<div class="nvw">${this._nav(this._c.nav || [])}</div>` : ''}`;
this._over(this._ui.pop ? this._popSheet() : over);
const ns = R.querySelector('.sheet'); if (ns && top) ns.scrollTop = top;
const slot = R.querySelector('.emb'); if (slot && this._emb) { slot.appendChild(this._emb); this._emb.hass = this._h; }
if (!this._fitted) { this._fitted = true; requestAnimationFrame(() => this._fit()); }
}
_act(a, el) {
const e = el.dataset.e;
if (a === 'go') return this._go(el.dataset.p);
if (a === 'tog') return this._svc('homeassistant.toggle', {}, e);
if (a === 'heat') return this._heatStep(el);
if (a === 'ann') return this._c.announce ? this._popOpen('ann', 'Anunciar', this._annCfg()) : undefined;
if (a === 'close' && this._ui.pop) { this._popClose(); return this._render(); }
return this._act2(a, el);
}
/* pop-up com um cartão embutido (anúncios, rotina): this._ui.pop = { k, title, hash }; o cartão é criado ao abrir e largado ao fechar */
_annCfg() { return Object.assign({ type: 'custom:casa-announce-card' }, JSON.parse(JSON.stringify(this._c.announce))); }
async _mk(cfg) { const helpers = await window.loadCardHelpers(); const el = helpers.createCardElement(JSON.parse(JSON.stringify(cfg))); el.hass = this._h; return el; }
_popSheet() {
const u = this._ui.pop;
return `<div class="scrim"><button class="bg" data-a="close" aria-label="Fechar" tabindex="-1"></button><section class="sheet big pp" role="dialog" aria-modal="true" aria-label="${esc(u.title)}"><div class="sh"><div><h2>${esc(u.title)}</h2><span class="sub">${esc(this._c.name || '')}</span></div><button class="x" data-a="close" aria-label="Fechar">${ic('mdi:close')}</button></div><div class="sb"><div class="emb"></div></div></section></div>`;
}
_popOpen(k, title, cfg, hash) {
if (!cfg || !this._h) return;
const u = (this._ui.pop = { k, title, hash }); this._ui.sheet = null; this._emb = null; this._render();
const put = (x) => { if (this._ui.pop !== u) return; const slot = this._or().querySelector('.emb'); if (!slot) return; if (typeof x === 'string') slot.textContent = x; else { this._emb = x; slot.appendChild(x); x.hass = this._h; } };
this._mk(cfg).then(put, () => put('Não foi possível abrir.'));
}
_popClose() {
const u = this._ui.pop; this._ui.pop = null; if (!u) return; this._emb = null;
if (u.hash && location.hash === u.hash) { try { history.replaceState(history.state, '', location.href.split('#')[0]); } catch (e) { /* sem histórico */ } }
}
_act2() {}
_heats() { return []; }
}
Object.assign(T, { Base, esc, ic, num, deg, deg0, cap });
})();
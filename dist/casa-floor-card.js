// casa-floor-card + casa-launcher-card v0.5.0 — piso e entrada dos tablets de parede (precisa de casa-tablet-style e casa-tablet-base); announce = anúncios de voz; no piso: family = configuração do casa-family-card (bloco Família) e routine_card = cartão da rotina aberto num pop-up
(() => {
const start = (T) => {
const { Base, esc, ic, num, deg, deg0, cap } = T;
const ROT = '#rotina-painel';
class CasaFloorCard extends Base {
_norm(c) { if (!c.name) throw new Error('Defina "name"'); return Object.assign({ rooms: [], scenes: [], windows: [], extra_lights: [], nav: [], speakers: [] }, c); }
_heats() { return this._c.hall && this._c.hall.heating ? [this._c.hall.heating] : []; }
_leader() { const s = this._s(this._c.leader_sensor || 'sensor.grupo_ativo_leader'); return s && s.state.startsWith('media_player.') ? s.state : null; }
/* bloco Família: o casa-family-card vive no DOM claro do cartão (slot), para não ser desligado quando o cartão volta a desenhar */
setConfig(c) { this._famDrop(); super.setConfig(c); }
_famDrop() { this._famK = (this._famK || 0) + 1; if (this._fam) { this._fam.remove(); this._fam = null; } }
_famSync() {
const c = this._c; if (!c.family) return this._fam ? this._famDrop() : undefined;
if (this._fam || this._famW === this._famK) return;
const k = (this._famW = this._famK = (this._famK || 0) + 1), cfg = Object.assign({ type: 'custom:casa-family-card' }, c.family);
if (c.routine_card) cfg.routine_path = ROT;
this._mk(cfg).then((el) => { if (k !== this._famK) return; el.slot = 'fam'; this._fam = el; this.appendChild(el); el.hass = this._h; }, () => {});
}
/* rotina: o casa-family-card navega para routine_path; com routine_card esse caminho é só um #, que aqui abre o cartão num pop-up (sem sair do painel) */
_start() { if (this._lc2) return; this._lc2 = () => this._hash(); ['location-changed', 'popstate', 'hashchange'].forEach((n) => window.addEventListener(n, this._lc2)); }
disconnectedCallback() { super.disconnectedCallback(); if (this._lc2) ['location-changed', 'popstate', 'hashchange'].forEach((n) => window.removeEventListener(n, this._lc2)); this._lc2 = null; }
_hash() {
const c = this._c, u = this._ui.pop, on = !!c && !!c.routine_card && location.hash === ROT;
if (on && !(u && u.k === 'rot')) return this._popOpen('rot', c.routine_title || 'Rotina da manhã', c.routine_card, ROT);
if (!on && u && u.k === 'rot') { this._popClose(); this._render(); }
}
_allLights() { const c = this._c; return [].concat(...c.rooms.map((r) => r.lights || []), c.wc ? c.wc.lights || [] : [], c.extra_lights); }
_render() {
const h = this._h, c = this._c; if (!h || !c) return;
const cnt = (n) => (n ? (n === 1 ? '1 luz acesa' : n + ' luzes acesas') : 'Luzes apagadas');
const all = this._allLights(), nOn = all.filter((e) => this._on(e)).length;
const heats = c.rooms.map((r) => r.heating).filter(Boolean).map((e) => this._heatInfo({ entity: e })), nHeat = heats.filter((i) => i.heating).length;
const chips = (c.weather ? this._chipWeather(c.weather) : '') + (c.windows.length ? this._chipWindows(c.windows) : '') + this._chip('mdi:thermometer', 'Aquecimento', nHeat ? nHeat + ' a aquecer' : 'Nada a aquecer', '');
const k3 = c.weather && c.windows.length ? ' k3' : '';
const scenes = c.scenes.map((s, i) => `<button class="sg${this._perOn(s.name) ? ' on' : ''}${this._ui.flash === 's' + i ? ' fl' : ''}" aria-pressed="${this._perOn(s.name)}" data-a="fscene" data-i="${i}" ${s.entities && s.entities.length ? '' : 'disabled'}>${esc(s.name)}</button>`).join('');
const offArm = this._armed('off');
const rooms = c.rooms.map((r) => {
const i = r.heating ? this._heatInfo({ entity: r.heating }) : null, n = (r.lights || []).filter((e) => this._on(e)).length, w = this._win(r.windows || []);
return `<button class="tile rm" data-a="go" data-p="${esc(r.path)}"><span class="rh">${esc(r.name)}${ic('mdi:chevron-right')}</span>
<span class="rc"><b>${i && !i.bad ? deg(i.cur) : '–'}</b><span>${!i ? '' : i.bad ? 'Sem ligação' : i.off ? 'Aquecimento desligado' : (i.heating ? 'A aquecer · alvo ' : 'Alvo ') + deg(i.tgt)}</span></span>
<span class="rf"><span><i class="dot${n ? ' y' : ''}"></i>${r.lights_text && !n ? esc(r.lights_text) : cnt(n)}</span>${w.n ? `<span>${ic('mdi:window-closed-variant')}${w.open ? w.open + (w.open === 1 ? ' aberta' : ' abertas') : w.bad ? w.bad + ' sem sinal' : w.n > 1 ? 'Fechadas' : 'Fechada'}</span>` : ''}</span></button>`;
}).join('');
let wc = '';
if (c.wc) {
const n = (c.wc.lights || []).filter((e) => this._on(e)).length;
wc = `<div class="tile rm"><span class="rh">${esc(c.wc.name)}</span><span class="wc">${c.wc.items.map((t) => { const on = this._on(t.entity), bad = this._bad(t.entity), fan = t.kind === 'fan'; return `<div class="tile in${on ? ' on' : ''}${bad ? ' bad' : ''}"><button class="tm" data-a="tog" data-e="${esc(t.entity)}" data-mi="${esc(t.entity)}" ${bad ? 'disabled' : ''} aria-pressed="${on}"><span class="ic${fan ? ' n' : ''}"${fan ? '' : this._lc(t.entity)}>${ic(fan ? 'mdi:fan' : 'mdi:lightbulb-outline')}</span><span class="tx"><span class="nm">${esc(t.name)}</span><span class="st">${bad ? 'Sem ligação' : on ? (fan ? 'Ligado' : 'Acesa') : (fan ? 'Desligado' : 'Apagada')}</span></span></button></div>`; }).join('')}</span><span class="rf"><span><i class="dot${n ? ' y' : ''}"></i>${cnt(n)}</span></span></div>`;
}
let hall = '';
if (c.hall) {
const hh = c.hall.heating, i = hh ? this._heatInfo(hh) : null;
hall = `<section class="sec" aria-label="${esc(c.hall.title || 'Hall e escadas')}"><h2>${esc(c.hall.title || 'Hall e escadas')}</h2><div class="hall">${(c.hall.lights || []).map((l) => this._lightTile(l, 'hl')).join('')}
${hh ? `<div class="heat sm" data-mi="${esc(hh.entity)}"><div class="hs"><span>${esc(hh.name || 'Hall')}</span><span class="cur">${i.bad ? '–' : deg(i.cur)}</span></div>${this._stepper(hh, 0, true)}</div>` : ''}</div></section>`;
}
const L = this._s(this._leader()), playing = !!L && L.state === 'playing';
const hear = c.speakers.filter((k) => !this._bad(k.entity) && num(this._s(k.entity).attributes.volume_level) > 0);
const act = playing && hear.length > 0;
const snd = c.speakers.length ? `<section class="fs" aria-label="Som do piso"><span class="art${act ? ' on' : ''}"><span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span></span>
<span class="tx"><span class="nm">${act ? 'A tocar no ' + esc(c.name) : hear.length ? 'Nada a tocar' : 'Colunas do ' + esc(c.name) + ' em silêncio'}</span><span class="st">${hear.length ? esc(hear.map((k) => k.name).join(', ')) + (act && L.attributes.media_title ? ' · ' + esc(L.attributes.media_title) : ' · com som ligado') : 'Ligue o som em cada divisão'}</span></span>
<button class="pill in" data-a="mute" ${hear.length ? '' : 'disabled'}>${ic('mdi:volume-off')}Silenciar piso</button></section>` : '';
const fam = c.family ? '<section class="fam" aria-label="Família"><div class="fi"><h2>Família</h2><div class="fb"><slot name="fam"></slot></div></div></section>' : '';
this._paint(`<div class="fx${fam ? ' has' : ''}"><div class="fmain">${this._head(c.name)}
<section class="chips${k3}" aria-label="Estado do piso">${chips}</section>
<section class="row fr" aria-label="Cenas do piso"><div class="seg" role="group" aria-label="Cena do piso" style="margin-right:auto">${scenes}</div>
<button class="pill${offArm ? ' warn' : ''}" data-a="off" ${nOn ? '' : 'disabled'}>${ic('mdi:lightbulb-off-outline')}${offArm ? 'Toque outra vez para apagar' : 'Apagar piso · ' + (nOn ? nOn + (nOn === 1 ? ' acesa' : ' acesas') : 'tudo apagado')}</button></section>
<section class="sec" aria-label="Divisões"><h2>Divisões</h2><div class="grid rg">${rooms}${wc}</div></section></div>${fam}
<div class="fbot">${hall}${snd}</div></div>`);
this._famSync();
}
_act2(a, el) {
const c = this._c, i = Number(el.dataset.i);
if (a === 'fscene') { this._svc('scene.turn_on', {}, c.scenes[i].entities); return this._flash('s' + i); }
if (a === 'off') return this._twice('off', () => this._svc('light.turn_off', {}, this._allLights().filter((e) => this._on(e))));
if (a === 'mute') return c.speakers.forEach((k) => { if (!this._bad(k.entity) && num(this._s(k.entity).attributes.volume_level) > 0) this._svc('media_player.volume_set', { volume_level: 0 }, k.entity); });
}
}
class CasaLauncherCard extends Base {
_norm(c) { if (!c.floors) throw new Error('Defina "floors"'); return Object.assign({ name: 'Casa', access: [], bells: [], openings: [], calendars: [], nav: [] }, c); }
_start() { this._load(); clearInterval(this._ag); this._ag = setInterval(() => this._load(), 300000); }
disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._ag); }
_minute() { this._render(); }
async _load() {
const c = this._c, h = this._h; if (!c || !h || !c.calendars.length || !h.callApi) { if (!this._lt) this._lt = setTimeout(() => { this._lt = null; this._load(); }, 3000); return; }
const a = new Date(); a.setHours(0, 0, 0, 0); const b = new Date(a.getTime() + 86400000);
try {
const res = await Promise.all(c.calendars.map((id) => h.callApi('GET', `calendars/${id}?start=${encodeURIComponent(a.toISOString())}&end=${encodeURIComponent(b.toISOString())}`).catch(() => [])));
const ev = []; res.forEach((l) => (l || []).forEach((e) => { const s = e.start.dateTime || e.start.date, f = e.end.dateTime || e.end.date; ev.push({ t: e.summary || 'Sem título', s: new Date(s.length <= 10 ? s + 'T00:00:00' : s), e: new Date(f.length <= 10 ? f + 'T00:00:00' : f), all: !e.start.dateTime }); }));
ev.sort((x, y) => (x.all === y.all ? x.s - y.s : x.all ? 1 : -1)); this._ev = ev; this._render();
} catch (e) { this._ev = this._ev || []; }
}
_agenda() {
const c = this._c; if (!c.calendars.length) return '';
const now = new Date(), hm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
const ppl = c.people || {};
const list = (this._ev || []).filter((e) => e.all || e.e > now).slice(0, 4);
const rows = list.map((e) => { const m = /^([A-Z]{1,2})\s+(.*)$/.exec(e.t), p = m && ppl[m[1]] ? ppl[m[1]] : null; const cur = !e.all && e.s <= now; return `<div class="ev"><span class="t">${e.all ? 'Todo o dia' : hm(e.s) + '–' + hm(e.e)}</span><i style="${p && p.color ? 'background:' + esc(p.color) : cur ? 'background:var(--primary-color)' : ''}"></i><span class="n">${esc(p ? m[2] + ' · ' + p.name : e.t)}</span></div>`; }).join('');
return `<section class="sec" aria-label="Agenda de hoje"><h2>Agenda de hoje</h2><div class="ag">${rows || `<div class="ev e">${this._ev ? 'Sem mais eventos hoje' : 'A carregar…'}</div>`}</div></section>`;
}
_render() {
const h = this._h, c = this._c; if (!h || !c) return;
const rooms = [].concat(...c.floors.map((f) => f.rooms));
const nL = rooms.reduce((n, r) => n + (r.lights || []).filter((e) => this._on(e)).length, 0) + (c.other_lights || []).filter((e) => this._on(e)).length;
const heats = rooms.map((r) => r.heating).filter(Boolean).map((e) => this._heatInfo({ entity: e })), nH = heats.filter((i) => i.heating).length;
const w = this._win(c.openings);
const chips = (c.weather ? this._chipWeather(c.weather) : '')
+ (c.openings.length ? this._chip('mdi:door-closed', 'Portas e janelas', w.open ? w.open + (w.open === 1 ? ' aberta' : ' abertas') : w.bad ? w.bad + ' sem sinal' : 'Tudo fechado', w.open ? 'r' : w.bad ? 'y' : '') : '')
+ this._chip('mdi:lightbulb-outline', 'Luzes', nL ? nL + (nL === 1 ? ' acesa' : ' acesas') : 'Apagadas', nL ? 'y' : '')
+ this._chip('mdi:thermometer', 'Aquecimento', nH ? nH + ' a aquecer' : 'Nada a aquecer', '');
const ring = c.bells.find((b) => this._on(b.entity));
const acc = (c.bells.length ? `<div class="cp${ring ? ' y' : ''}" role="status"><span class="ci">${ic(ring ? 'mdi:bell-ring' : 'mdi:bell-outline')}</span><span class="ct"><span class="l">${ring ? esc(ring.name) : 'Campainha'}</span><span class="v">${ring ? 'Alguém à porta' : 'Sem chamadas'}</span></span></div>` : '')
+ c.access.map((g) => { const s = this._s(g.entity), bad = this._bad(g.entity), lock = g.entity.startsWith('lock.'); const open = !bad && (lock ? s.state !== 'locked' : s.state !== 'closed'); const v = bad ? 'Sem ligação' : lock ? (s.state === 'locked' ? 'Trancada' : s.state === 'unlocked' ? 'Destrancada' : cap(s.state)) : s.state === 'closed' ? 'Fechado' : s.state === 'open' ? 'Aberto' : s.state === 'opening' ? 'A abrir' : s.state === 'closing' ? 'A fechar' : cap(s.state); return `<div class="cp${open && !lock ? ' r' : ''}" data-mi="${esc(g.entity)}"><span class="ci${open && lock ? ' y' : ''}">${ic(g.icon || (lock ? 'mdi:lock-outline' : 'mdi:gate'))}</span><span class="ct"><span class="l">${esc(g.name)}</span><span class="v">${v}</span></span></div>`; }).join('');
const floors = c.floors.map((f) => `<section class="sec" aria-label="${esc(f.name)}"><h2>${esc(f.name)}</h2><div class="grid lg">${f.rooms.map((r) => {
const n = (r.lights || []).filter((e) => this._on(e)).length, i = r.heating ? this._heatInfo({ entity: r.heating }) : null;
const st = r.overview ? [this._win(r.windows || []).open ? 'Janela aberta' : (r.windows || []).length ? 'Janelas fechadas' : '', i && !i.bad ? (r.heating_name || 'hall') + ' ' + deg(i.cur) : ''].filter(Boolean).join(' · ')
: [(r.lights || []).length ? (n ? (n === 1 ? '1 luz acesa' : n + ' luzes acesas') : 'Luzes apagadas') : '', i ? (i.bad ? 'sem ligação' : deg(i.cur) + (i.heating ? ' · a aquecer' : '')) : ''].filter(Boolean).join(' · ');
return `<button class="tile lk${r.wide ? ' w' : ''}" data-a="go" data-p="${esc(r.path)}"><span class="ic"${n ? ' style="background:var(--y);color:var(--ink)"' : ''}>${ic(r.icon || 'mdi:door')}</span><span class="tx"><span class="nm">${esc(r.name)}</span><span class="st">${esc(st)}</span></span>${ic('mdi:chevron-right', 20)}</button>`;
}).join('')}</div></section>`).join('');
this._paint(`${this._head(c.name)}
${acc ? `<section class="acc" aria-label="Campainha e portões">${acc}</section>` : ''}
<section class="chips" aria-label="Estado da casa">${chips}</section>
<div class="lbody"><div class="lfl">${floors}</div>${this._agenda()}</div>`);
}
}
window.customCards = window.customCards || [];
if (!customElements.get('casa-floor-card')) customElements.define('casa-floor-card', CasaFloorCard);
window.customCards.push({ type: 'casa-floor-card', name: 'Casa · Piso (tablet)', description: 'Visão geral de um piso para tablets de parede.' });
if (!customElements.get('casa-launcher-card')) customElements.define('casa-launcher-card', CasaLauncherCard);
window.customCards.push({ type: 'casa-launcher-card', name: 'Casa · Entrada (tablet)', description: 'Entrada dos tablets: divisões por piso, campainha e portões.' });
};
const wait = () => { const T = window.__casaTablet; if (T && T.Base && T.CSS) start(T); else setTimeout(wait, 40); };
wait();
})();
// casa-room-card v0.8.0 — fontes de som com `card` (ex.: Histórias) abrem dentro do bloco Som, por baixo dos botões, em vez de numa janela; controlador de divisão para tablets de parede, fluido de 360 a 1280 px (precisa de casa-tablet-style e casa-tablet-base); announce = anúncios de voz (destino inicial = coluna desta divisão; announce_room:false mantém o da configuração)
(() => {
const start = (T) => {
const { Base, esc, ic, num, deg, deg0, cap } = T;
class CasaRoomCard extends Base {
_norm(c) {
if (!c.name) throw new Error('Defina "name"');
return Object.assign({ lights: [], scenes: [], details: [], switches: [], chips: [], modules: [], nav: [] }, c);
}
_heats() { return this._c.heating ? [this._c.heating] : []; }
/* anúncios: o destino inicial passa a ser o que tem só a (primeira) coluna desta divisão, se existir */
_annCfg() {
const o = super._annCfg(), c = this._c, k = c.announce_room !== false && c.sound && c.sound.speakers && c.sound.speakers[0], ds = Array.isArray(o.destinations) ? o.destinations : [];
const i = k ? ds.findIndex((d) => d && Array.isArray(d.targets) && d.targets.length === 1 && d.targets[0] === k.entity) : -1;
if (i >= 0) o.destinations = ds.map((d, j) => Object.assign({}, d, { default: j === i }));
return o;
}
_minute() { if (this._c.modules.some((m) => m.timer)) this._render(); }
_vars(m) {
const out = {};
Object.entries(m.vars || {}).forEach(([k, v]) => {
const [e, at] = v.split('@'), s = this._s(e); let val;
if (!s || this._bad(e)) val = '–';
else if (at) val = s.attributes[at];
else if (m.map && m.map[k]) val = m.map[k][s.state] != null ? m.map[k][s.state] : s.state;
else val = /^\d\d:\d\d:\d\d$/.test(s.state) ? s.state.slice(0, 5) : s.state;
const n = num(val); if (n != null && (m.scale || {})[k]) val = Math.round(n * m.scale[k]);
else if (n != null && String(val).trim() !== '' && !isNaN(Number(val))) val = String(Math.round(n * 10) / 10).replace('.', ',').replace('-', '−');
out[k] = val;
});
return out;
}
_text(t, m) { const v = this._vars(m); return String(t || '').replace(/\{(\w+)\}/g, (x, k) => (v[k] != null ? v[k] : '–')); }
_remain(t) { const s = this._s(t); if (!s || s.state !== 'active' || !s.attributes.finishes_at) return ''; const m = Math.max(1, Math.round((new Date(s.attributes.finishes_at) - Date.now()) / 60000)); return ' · faltam ' + m + ' min'; }
_module(m, i) {
const bad = m.entity ? this._bad(m.entity) : false, on = m.entity ? this._on(m.entity) : false;
const icon = `<span class="ic${m.type === 'toggle' ? ' n' : ''}">${ic(m.icon || 'mdi:power-plug-outline')}</span>`;
if (m.type === 'toggle') {
const st = bad ? (m.bad_text || 'Sem ligação') : on ? this._text(m.on_text || 'Ligado', m) + (m.timer ? this._remain(m.timer) : '') : this._text(m.off_text || 'Desligado', m);
return `<div class="tile mod${bad ? ' bad' : ''}"><button class="tm" data-a="mod" data-i="${i}" data-mi="${esc(m.entity)}" ${bad ? 'disabled' : ''} role="switch" aria-checked="${on && !bad}">${icon}<span class="tx"><span class="nm">${esc(m.name)}</span><span class="st">${esc(st)}</span>${m.note ? `<span class="st">${esc(this._text(m.note, m))}</span>` : ''}</span><span class="sw${on && !bad ? ' on' : ''}" aria-hidden="true"><i></i></span></button></div>`;
}
if (m.type === 'cover') {
const s = this._s(m.entity), p = s ? num(s.attributes.current_position) : null;
const st = bad ? 'Sem ligação' : m.text ? this._text(m.text, m) : (p == null ? cap(this._h.formatEntityState ? this._h.formatEntityState(s) : s.state) : (p <= 0 ? 'Fechada' : p >= 100 ? 'Aberta' : 'Entreaberta') + ' · ' + Math.round(p) + '%');
return `<div class="tile mod${bad ? ' bad' : ''}"><span class="tm" data-mi="${esc(m.entity)}">${icon}<span class="tx"><span class="nm">${esc(m.name)}</span><span class="st">${esc(st)}</span></span></span><button class="sb" data-a="cov" data-i="${i}" data-d="-1" ${bad || (p != null && p <= 0) ? 'disabled' : ''} aria-label="${esc(m.down_label || 'Baixar')}">${ic('mdi:chevron-down', 26)}</button><button class="sb" data-a="cov" data-i="${i}" data-d="1" ${bad || (p != null && p >= 100) ? 'disabled' : ''} aria-label="${esc(m.up_label || 'Subir')}">${ic('mdi:chevron-up', 26)}</button></div>`;
}
if (m.type === 'confirm') {
const k = 'm' + i, arm = this._armed(k), done = this._ui.flash === k;
return `<div class="tile mod${arm ? ' warn' : ''}"><button class="tm" data-a="conf" data-i="${i}">${icon}<span class="tx"><span class="nm">${arm ? 'Toque outra vez para confirmar' : esc(m.name)}</span><span class="st">${arm ? 'Cancela em 5 s' : done ? 'Ativado agora' : esc(m.text || '')}</span></span></button></div>`;
}
if (m.type === 'routine') {
const s = this._s(m.entity), acts = s && Array.isArray(s.attributes.activities) ? s.attributes.activities : [], done = acts.filter((a) => a.completed).length;
const st = bad ? 'Sem ligação' : acts.length ? done + '/' + acts.length : Math.round(num(s.state) || 0) + '%';
return `<div class="tile mod${bad ? ' bad' : ''}"><button class="tm" data-a="go" data-p="${esc(m.path || '')}" ${m.path ? '' : 'disabled'}><span class="av" style="background:${esc(m.color || '#c6a0f6')}">${esc((m.person || '?').charAt(0))}</span><span class="tx"><span class="nm">${esc(m.name)}</span><span class="st">${esc(m.person || '')} · ${esc(st)}${acts.length ? `<span class="dots" aria-hidden="true">${acts.map((a) => `<i class="${a.completed ? 'd' : ''}"></i>`).join('')}</span>` : ''}</span></span>${ic('mdi:chevron-right', 20)}</button></div>`;
}
const al = m.alert && this._on(m.alert.entity);
const st = bad ? (m.bad_text || 'Sem ligação') : al ? m.alert.text : m.text ? this._text(m.text, m) : (m.entity && this._s(m.entity) ? cap(this._h.formatEntityState ? this._h.formatEntityState(this._s(m.entity)) : this._s(m.entity).state) : '');
return `<div class="tile mod${al ? ' warn' : ''}${bad ? ' bad' : ''}"><span class="tm"${m.entity ? ` data-mi="${esc(m.entity)}"` : ''}>${icon}<span class="tx"><span class="nm">${esc(m.name)}</span><span class="st">${esc(st)}</span></span></span></div>`;
}
/* fonte ativa: sensor ligado E o líder a tocar/em pausa E o conteúdo atual do tipo certo (rádio = '://radio/' sem ser aviso de voz; playlist = não rádio) */
_srcOn(s) {
if (!s.entity || s.card || !this._on(s.entity)) return false;
const L = this._s(this._leader()); if (!L || (L.state !== 'playing' && L.state !== 'paused')) return false;
const id = String(L.attributes.media_content_id || ''), radio = id.indexOf('://radio/') >= 0 && id.indexOf('/api/tts_proxy/') < 0;
return s.media_type === 'playlist' ? !radio : radio;
}
_sound() {
const c = this._c.sound, L = this._s(this._leader()) || { state: 'unavailable', attributes: {} }, a = L.attributes;
const playing = L.state === 'playing', paused = L.state === 'paused', dead = L.state === 'unavailable';
const title = dead ? 'Som sem ligação' : (playing || paused) && a.media_title ? a.media_title : 'Nada a tocar';
const here = c.speakers.filter((k) => !this._bad(k.entity) && num(this._s(k.entity).attributes.volume_level) > 0).length;
const sub = [playing ? 'A tocar' : paused ? 'Em pausa' : '', (playing || paused) && a.media_artist ? a.media_artist : '', (playing || paused) ? (here ? 'ouve-se aqui' : 'aqui em silêncio') : ''].filter(Boolean).join(' · ');
const vs = this._s(c.volume), v = vs ? Math.round(num(vs.state) || 0) : 0;
const spk = c.speakers.map((k, i) => {
const s = this._s(k.entity), bad = this._bad(k.entity), on = !bad && num(s.attributes.volume_level) > 0;
return `<span class="spk"><button class="pill in" data-a="spk" data-i="${i}" data-mi="${esc(k.entity)}" ${bad ? 'disabled' : ''} role="switch" aria-checked="${on}">${ic(on ? 'mdi:volume-high' : 'mdi:volume-off')}<span class="pn">${esc(k.name || 'Nesta divisão')}${bad ? ' · sem ligação' : ''}</span><span class="sw${on ? ' on' : ''}" aria-hidden="true"><i></i></span></button><button class="pill in more" data-a="spkopt" data-i="${i}" aria-haspopup="dialog" aria-label="Opções da coluna${c.speakers.length > 1 ? ' ' + esc(k.name || '') : ''}">${ic('mdi:dots-horizontal')}</button></span>`;
}).join('');
const src = (this._h.services && this._h.services.mass_queue ? `<button class="pill" data-a="queue" aria-haspopup="dialog">${ic('mdi:playlist-music')}Fila</button>` : '') + (c.sources || []).map((s, i) => `<button class="pill${this._srcOn(s) || (s.card && this._ui.src === i) ? ' on' : ''}" data-a="src" data-i="${i}"${s.card ? ` aria-expanded="${this._ui.src === i}"` : ''}>${s.icon ? ic(s.icon) : ''}${esc(s.name)}</button>`).join('');
return `<section class="snd" aria-label="Som">
<div class="row"><h2>Som</h2><div class="pills">${spk}</div></div>
<div class="np"><span class="art${playing ? ' on' : ''}"><span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span></span>
<span class="tx"><span class="nm">${esc(title)}</span><span class="st">${esc(sub || (dead ? '' : 'Escolha uma rádio para ouvir na casa'))}</span></span>
<div class="tr"><button class="ib" data-a="mp" data-s="media_previous_track" ${dead ? 'disabled' : ''} aria-label="Anterior">${ic('mdi:skip-previous')}</button>
<button class="ib pri" data-a="mp" data-s="media_play_pause" ${dead ? 'disabled' : ''} aria-label="${playing ? 'Pausar' : 'Reproduzir'}">${ic(playing ? 'mdi:pause' : 'mdi:play')}</button>
<button class="ib" data-a="mp" data-s="media_next_track" ${dead ? 'disabled' : ''} aria-label="Seguinte">${ic('mdi:skip-next')}</button></div></div>
<div class="vol">${ic('mdi:volume-medium')}<input type="range" min="0" max="100" step="1" value="${v}" data-vol="${esc(c.volume)}" ${vs ? '' : 'disabled'} aria-label="Volume da casa"><span class="vv"><b>${v}%</b><span>casa</span></span></div>
${src ? `<div class="src">${src}</div>` : ''}
${this._ui.src != null ? '<div class="inl" style="margin-top:8px;min-width:0"><slot name="emb"><span class="st">A carregar…</span></slot></div>' : ''}
</section>`;
}
_spkInfo(k) {
const s = this._s(k.entity), off = !s || s.state === 'unavailable', L = this._s(this._leader()), mem = (L && L.attributes.group_members) || [];
const run = (e) => !!e && !!this._s(e) && this._s(e).state === 'on';
return { off, apart: !off && mem.length > 0 && !mem.includes(k.entity), vol: s ? Math.round((num(s.attributes.volume_level) || 0) * 100) : 0,
btOk: !!k.bt && !this._bad(k.bt) && !!this._s(k.bt_on) && !!this._s(k.bt_off), btOn: !!k.bt && this._s(k.bt) && this._s(k.bt).state === 'on', busy: run(k.bt_on) ? 'A ligar…' : run(k.bt_off) ? 'A desligar…' : '',
piOk: !!k.pi && !this._bad(k.pi), piOn: !!k.pi && !!this._s(k.pi) && this._s(k.pi).state === 'on' };
}
_spkSheet(i) {
const k = this._c.sound.speakers[i], o = this._spkInfo(k);
const t = (key, icon, nm, st, f) => `<div class="tile mod in opt${f.warn ? ' warn' : f.on && !f.sw ? ' on' : ''}${f.bad ? ' bad' : ''}"><button class="tm" data-a="opt" data-k="${key}" data-i="${i}" ${f.bad || f.busy ? 'disabled' : ''}${f.sw ? ` role="switch" aria-checked="${!!f.on}"` : ''}><span class="ic n">${ic(icon)}</span><span class="tx"><span class="nm">${esc(nm)}</span><span class="st">${esc(st)}</span></span>${f.sw && !f.warn ? `<span class="sw${f.on ? ' on' : ''}" aria-hidden="true"><i></i></span>` : ''}</button></div>`;
const arm = ['Toque outra vez para desligar', 'Cancela em 5 s'];
let bt = '', pi = '';
if (k.bt) {
const a = this._armed('ob' + i) && o.btOk && o.btOn && !o.busy;
bt = !o.btOk ? t('bt', 'mdi:bluetooth-off', 'Bluetooth', 'Indisponível', { bad: true })
: o.busy ? t('bt', 'mdi:bluetooth-connect', 'Bluetooth', o.busy, { busy: true })
: a ? t('bt', 'mdi:bluetooth-off', arm[0], arm[1], { warn: true, sw: true, on: true })
: t('bt', o.btOn ? 'mdi:bluetooth' : 'mdi:bluetooth-off', 'Bluetooth', o.btOn ? 'Amplificador ligado' : 'Amplificador desligado', { on: o.btOn, sw: true });
}
if (k.pi) {
const a = this._armed('op' + i) && o.piOk && o.piOn;
pi = !o.piOk ? t('pi', 'mdi:power', 'Controlador', 'Indisponível', { bad: true })
: a ? t('pi', 'mdi:power', arm[0], arm[1], { warn: true })
: t('pi', 'mdi:power', o.piOn ? 'Desligar controlador' : 'Ligar controlador', o.piOn ? 'Controlador ligado' : 'Controlador desligado', {});
}
const solo = t('solo', 'mdi:target-variant', 'Só aqui', o.off ? 'Coluna sem ligação' : this._ui.flash === 'os' + i ? 'Feito' : 'Silencia as outras divisões', { bad: o.off });
const apart = t('apart', o.apart ? 'mdi:home-import-outline' : 'mdi:eject', o.apart ? 'Voltar à casa' : 'Tocar à parte', o.off ? 'Coluna sem ligação' : o.apart ? 'Esta coluna está à parte' : 'Separa esta coluna da casa', { bad: o.off, on: o.apart });
return `<div class="grid mg">${bt}${pi}${solo}${apart}</div>
<div class="vol${o.apart ? '' : ' off'}">${ic('mdi:volume-medium')}<input type="range" min="0" max="100" step="1" value="${o.vol}" data-rvol="${esc(k.entity)}" ${o.apart ? '' : 'disabled'} aria-label="Volume desta coluna (só quando toca à parte)"><span class="vv"><b>${o.vol}%</b><span>${o.apart ? 'aqui' : 'à parte'}</span></span></div>`;
}
/* fila de reprodução (mass_queue): lida ao abrir, quando a faixa muda (com atraso) e depois de ações; nunca mais de uma leitura automática por 10 s */
_qKey() { const e = this._leader(), L = this._s(e); return L ? [e, L.attributes.media_content_id, L.attributes.media_title].join('|') : ''; }
_qLoad(force) {
const u = this._ui.sheet; if (!u || !u.queue) return;
const ent = this._leader(), now = Date.now(), key = this._qKey();
if (!ent || !this._h) { this._q = { err: true, key }; return this._render(); }
if (!force && this._qT && now - this._qT < 10000) { if (!this._qD) this._qD = setTimeout(() => { this._qD = null; this._qLoad(); }, 10000 - (now - this._qT)); return; }
this._qT = now; const lim = u.more ? 100 : 20, h = this._h, data = { entity: ent, limit_before: 0, limit_after: lim };
let p; try { p = h.callWS ? h.callWS({ type: 'call_service', domain: 'mass_queue', service: 'get_queue_items', service_data: data, return_response: true }) : h.callService('mass_queue', 'get_queue_items', data, undefined, false, true); } catch (e) { p = Promise.reject(e); }
Promise.resolve(p).then((r) => { const resp = (r && r.response) || r || {}, list = resp[ent] || Object.values(resp)[0]; if (!Array.isArray(list)) throw new Error('sem lista'); this._q = { items: list, ent, key, lim }; }).catch(() => { this._q = { err: true, key }; }).then(() => { if (this._ui.sheet && this._ui.sheet.queue) this._render(); });
}
_queue() {
const q = this._q; if (!q) return { title: 'Fila', body: '<div class="qe">A carregar…</div>' };
if (q.err) return { title: 'Fila', body: '<div class="qe">Não foi possível ler a fila</div>' };
const n = q.items.length; if (!n) return { title: 'Fila', body: '<div class="qe">Fila vazia</div>' };
const L = this._s(q.ent), st = L ? L.state : '', hasCur = st === 'playing' || st === 'paused', more = n > q.lim && q.lim < 100;
const row = (it, cur) => {
const tts = /tts_proxy/.test(String(it.media_content_id || '')) || (!it.media_artist && /^[A-Za-z0-9_-]{18,}$/.test(String(it.media_title || '')));
const t = tts ? 'Aviso de voz' : (it.media_title || 'Sem título'), s2 = [cur ? (st === 'playing' ? 'A tocar' : 'Em pausa') : '', tts ? '' : it.media_artist, tts ? '' : it.media_album_name].filter(Boolean).join(' · ');
const img = /^(https?:)?\/\//.test(String(it.media_image || '')) || /^\//.test(String(it.media_image || '')) ? it.media_image : '';
return `<div class="qr${cur ? ' cur' : ''}"><button class="qm" data-a="qplay" data-q="${esc(it.queue_item_id)}" ${cur ? 'disabled' : ''} aria-label="${cur ? '' : 'Tocar '}${esc(t)}"><span class="qa">${ic(tts ? 'mdi:bullhorn-outline' : 'mdi:music-note')}${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</span><span class="tx"><span class="nm">${esc(t)}</span><span class="st">${esc(s2 || ' ')}</span></span></button>${cur ? '' : `<button class="qx" data-a="qrm" data-q="${esc(it.queue_item_id)}" aria-label="Remover ${esc(t)} da fila">${ic('mdi:close')}</button>`}</div>`;
};
const rest = q.items.slice(hasCur ? 1 : 0);
return { title: 'Fila · ' + n + (more ? '+' : '') + (n === 1 ? ' música' : ' músicas'), body: (hasCur ? row(q.items[0], true) : '') + (rest.length ? '<h3>A seguir</h3>' + rest.map((it) => row(it, false)).join('') : '') + (more ? '<button class="pill in qmore" data-a="qmore">Mostrar mais</button>' : '') };
}
_sheet() {
const c = this._c, u = this._ui.sheet; if (!u) return '';
let body = '', title = '', sub = c.name;
if (u.queue) { const o = this._queue(); title = o.title; body = o.body; } else
if (u.spk != null) { const k = c.sound.speakers[u.spk]; title = 'Opções da coluna'; if (c.sound.speakers.length > 1) sub = c.name + ' · ' + (k.name || ''); body = this._spkSheet(u.spk); } else
if (u === 'det') {
title = 'Luz · detalhes';
body = `${c.details.length ? `<div class="sec"><h3>Lâmpadas</h3><div class="grid">${c.details.map((l) => this._lightTile(l, 'in')).join('')}</div></div>` : ''}
${c.switches.length ? `<div class="sec"><h3>Interruptores de parede</h3><div class="grid">${c.switches.map((l) => this._lightTile(Object.assign({ icon: 'mdi:light-switch' }, l), 'in')).join('').replace(/Acesa/g, 'Ligado').replace(/Apagada/g, 'Desligado')}</div><span class="sub">Com o interruptor desligado, as lâmpadas ficam sem ligação.</span></div>` : ''}`;
} else { title = u.name; body = '<div class="emb"></div>'; }
return `<div class="scrim"><button class="bg" data-a="close" aria-label="Fechar" tabindex="-1"></button><section class="sheet${u !== 'det' && u.spk == null ? ' big' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sh"><div><h2>${esc(title)}</h2><span class="sub">${esc(sub)}</span></div><button class="x" data-a="close" aria-label="Fechar">${ic('mdi:close')}</button></div><div class="sb">${body}</div></section></div>`;
}
_render() {
const h = this._h, c = this._c; if (!h || !c) return;
if (this._ui.sheet && this._ui.sheet.queue && this._q && this._q.key !== this._qKey() && !this._qD) this._qD = setTimeout(() => { this._qD = null; this._qLoad(); }, 1500);
const chips = c.chips.map((k) => {
if (k.type === 'weather') return this._chipWeather(k);
if (k.type === 'windows') return this._chipWindows(k.entities, k.name);
if (k.type === 'motion') {
const any = k.entities.some((e) => this._on(e)), allBad = k.entities.every((e) => this._bad(e));
const low = (k.battery || []).map((e) => num((this._s(e) || {}).state)).filter((n) => n != null && n < (k.battery_low || 20)).sort((a, b) => a - b)[0];
return this._chip(low != null ? 'mdi:battery-alert-variant-outline' : 'mdi:motion-sensor', low != null ? 'Bateria ' + Math.round(low) + '%' : 'Movimento', allBad ? 'Sem ligação' : any ? 'Agora' : 'Nenhum', low != null ? 'y' : '', k.entities[0]);
}
if (k.type === 'heating' && c.heating) { const i = this._heatInfo(c.heating); return this._chip('mdi:thermometer', 'Aquecimento', i.bad ? 'Sem ligação' : i.off ? 'Desligado' : deg(i.cur) + ' → ' + deg(i.tgt), '', c.heating.entity); }
return '';
}).join('');
const scenes = c.scenes.map((s, i) => `<button class="sg${this._perOn(s.name) ? ' on' : ''}${this._ui.flash === 's' + i ? ' fl' : ''}" aria-pressed="${this._perOn(s.name)}" data-a="scene" data-i="${i}" ${s.entity && !this._bad(s.entity) ? `data-mi="${esc(s.entity)}"` : 'disabled'} title="${s.entity ? '' : 'Esta divisão não tem cena ' + esc(s.name)}">${esc(s.name)}</button>`).join('');
const hasDet = c.details.length || c.switches.length, big = c.lights.length <= 2;
let heat = '';
if (c.heating) {
const i = this._heatInfo(c.heating);
heat = `<section class="sec" aria-label="Aquecimento"><h2>Aquecimento</h2><div class="heat" data-mi="${esc(c.heating.entity)}"><span class="cur">${i.bad ? '–' : deg(i.cur)}</span><div class="hs"><b>${i.bad ? 'Sem ligação' : i.off ? 'Desligado' : i.heating ? 'A aquecer' : '&nbsp;'}</b>${i.hum != null ? `<span>${ic('mdi:water-outline')}Humidade ${Math.round(i.hum)}%</span>` : ''}</div>${this._stepper(c.heating, 0)}</div></section>`;
}
const mods = c.modules.length ? `<section class="grid mg${c.modules.length === 3 ? ' c3' : c.modules.length === 1 ? ' c1' : ''}" aria-label="Equipamentos">${c.modules.map((m, i) => this._module(m, i)).join('')}</section>` : '';
this._paint(`${this._head(c.name)}
${chips ? `<section class="chips" aria-label="Estado">${chips}</section>` : ''}
<section class="sec" aria-label="Luz"><div class="row lr${hasDet ? ' det' : ''}"><h2>${esc(c.lights_title || 'Luz')}</h2><div class="seg" role="group" aria-label="Cena">${scenes}</div>${hasDet ? `<button class="pill dt" data-a="sheet" data-k="det" aria-haspopup="dialog">Detalhes${ic('mdi:chevron-right')}</button>` : ''}</div>
${c.lights_note ? `<span class="note">${esc(c.lights_note)}</span>` : ''}
<div class="grid">${c.lights.map((l) => this._lightTile(l, big ? 'big' : '')).join('')}</div></section>
${heat}${mods}${c.sound ? this._sound() : ''}
`, this._sheet());
}
_act2(a, el) {
const c = this._c, i = Number(el.dataset.i);
if (a === 'scene') { this._svc('scene.turn_on', {}, c.scenes[i].entity); return this._flash('s' + i); }
if (a === 'sheet') { this._ui.sheet = el.dataset.k; return this._render(); }
if (a === 'queue') { this._ui.sheet = { queue: true }; this._q = null; this._render(); return this._qLoad(true); }
if (a === 'qmore') { this._ui.sheet.more = true; return this._qLoad(true); }
if (a === 'qplay' || a === 'qrm') { const ent = (this._q && this._q.ent) || this._leader(); this._svc(a === 'qplay' ? 'mass_queue.play_queue_item' : 'mass_queue.remove_queue_item', { entity: ent, queue_item_id: el.dataset.q }); clearTimeout(this._qA); this._qA = setTimeout(() => this._qLoad(true), 900); return; }
if (a === 'close') { clearTimeout(this._qD); clearTimeout(this._qA); this._qD = null; this._q = null; if (/^o[bp]/.test(this._arm || '')) { clearTimeout(this._at); this._arm = null; } this._ui.sheet = null; this._emb = null; return this._render(); }
if (a === 'spkopt') { this._ui.sheet = { spk: i }; return this._render(); }
if (a === 'opt') {
const k = c.sound.speakers[i], o = this._spkInfo(k), w = el.dataset.k;
if (w === 'solo') { this._svc(c.sound.solo_script || 'script.coluna_solo', { coluna: k.entity }); return this._flash('os' + i); }
if (w === 'apart') return this._svc(c.sound.apart_script || 'script.coluna_a_parte', { coluna: k.entity });
if (w === 'pi') { const go = () => this._svc(o.piOn ? 'switch.turn_off' : 'switch.turn_on', {}, k.pi); return o.piOn ? this._twice('op' + i, go) : go(); }
if (w === 'bt') { if (o.busy) return; const go = () => this._svc(o.btOn ? k.bt_off : k.bt_on); return o.btOn ? this._twice('ob' + i, go) : go(); }
return;
}
if (a === 'mod') { const m = c.modules[i], on = this._on(m.entity); const list = on ? m.off_action : m.on_action; return list ? this._run(list) : this._svc('homeassistant.toggle', {}, m.entity); }
if (a === 'cov') { const m = c.modules[i], s = this._s(m.entity), p = num(s.attributes.current_position), d = Number(el.dataset.d); if (p == null) return this._svc(d > 0 ? 'cover.open_cover' : 'cover.close_cover', {}, m.entity); return this._svc('cover.set_cover_position', { position: Math.min(100, Math.max(0, Math.round(p + d * (m.step || 25)))) }, m.entity); }
if (a === 'conf') { const m = c.modules[i]; return this._twice('m' + i, () => this._run(m.action)); }
if (a === 'mp') return this._svc('media_player.' + el.dataset.s, {}, this._leader());
if (a === 'spk') { const k = c.sound.speakers[i], on = num(this._s(k.entity).attributes.volume_level) > 0; return on ? this._svc('media_player.volume_set', { volume_level: 0 }, k.entity) : this._svc(c.sound.join_script || 'script.coluna_juntar', { coluna: k.entity }); }
if (a === 'src') {
const s = c.sound.sources[i];
if (s.card) { if (this._ui.src === i) return this._inlDrop(true); this._inlDrop(); this._ui.src = i; this._render(); return this._inline(s.card, s, i); }
return this._svc(c.sound.play_script || 'script.tocar_no_grupo', { media_content_id: s.id, media_content_type: s.media_type || 'radio' });
}
}
/* cartão embutido numa folha: `card` é a base; por omissão o cartão de podcasts deixa de ter altura própria (rola a folha) e usa 2 colunas em ecrãs com menos de 420 px;
   opcionais por fonte: `card_narrow` (viewport < 900 px) e `card_wide` (>= 900 px), fundidos por cima */
async _embed(cfg, src) {
try {
const conf = JSON.parse(JSON.stringify(cfg).replace(/\{leader\}/g, this._leader() || ''));
const vw = window.innerWidth || document.documentElement.clientWidth || 0, wide = vw >= 900;
if (/podcast-card$/.test(String(conf.type || ''))) { conf.max_height = 100000; if (vw < 420 && !(Number(conf.columns) < 3)) conf.columns = 2; }
Object.assign(conf, JSON.parse(JSON.stringify((src && (wide ? src.card_wide : src.card_narrow)) || {}).replace(/\{leader\}/g, this._leader() || '')));
const helpers = await window.loadCardHelpers(); const el = helpers.createCardElement(conf); el.hass = this._h; this._emb = el;
const slot = this._or().querySelector('.emb'); if (slot) slot.appendChild(el);
} catch (e) { const slot = this._or().querySelector('.emb'); if (slot) slot.textContent = 'Não foi possível abrir.'; }
}
/* fonte com `card` aberta dentro do bloco Som: o cartão é filho direto deste elemento (slot "emb"), por isso não é recriado quando o cartão se redesenha */
async _inline(cfg, src, i) {
try {
const conf = JSON.parse(JSON.stringify(cfg).replace(/\{leader\}/g, this._leader() || ''));
const vw = window.innerWidth || document.documentElement.clientWidth || 0, wide = vw >= 900;
if (/podcast-card$/.test(String(conf.type || ''))) { conf.max_height = 100000; if (vw < 420 && !(Number(conf.columns) < 3)) conf.columns = 2; }
Object.assign(conf, JSON.parse(JSON.stringify((src && (wide ? src.card_wide : src.card_narrow)) || {}).replace(/\{leader\}/g, this._leader() || '')));
const helpers = await window.loadCardHelpers(); if (this._ui.src !== i || !this.isConnected) return;
const el = helpers.createCardElement(conf); el.slot = 'emb'; el.style.display = 'block';
[['--ha-card-background', 'transparent'], ['--ha-card-border-width', '0'], ['--ha-card-box-shadow', 'none']].forEach((p) => el.style.setProperty(p[0], p[1]));
el.hass = this._h; this._inl = el; this.appendChild(el);
requestAnimationFrame(() => { const p = this.shadowRoot.querySelector('.inl'); if (p && p.scrollIntoView) p.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
} catch (e) { this._inlDrop(true); }
}
_inlDrop(draw) { if (this._inl && this._inl.parentNode === this) this.removeChild(this._inl); this._inl = null; this._ui.src = null; if (draw) this._render(); }
set hass(h) { super.hass = h; if (this._inl) this._inl.hass = h; }
disconnectedCallback() { this._inlDrop(); super.disconnectedCallback(); }
}
window.customCards = window.customCards || [];
if (!customElements.get('casa-room-card')) customElements.define('casa-room-card', CasaRoomCard);
window.customCards.push({ type: 'casa-room-card', name: 'Casa · Divisão (tablet)', description: 'Controlador de divisão para tablets de parede.' });
};
const wait = () => { const T = window.__casaTablet; if (T && T.Base && T.CSS) start(T); else setTimeout(wait, 40); };
wait();
})();
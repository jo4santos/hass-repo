/* casa-access-card v0.5.1 — câmaras sem stream (portões, enquanto não tiverem stream no go2rtc) mostram uma fotografia de 2 em 2 s em vez de vídeo feito de fotografias; acessos: portões (dois toques), fechadura, campainhas e câmaras (seletor segmentado); bare:true = só os mosaicos dos portões (para pop-ups); only:'cameras' = só o visor de câmaras com seletor (um stream de cada vez) */
const escA = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const agoA = (iso) => {
  const t = iso ? new Date(iso).getTime() : NaN; if (isNaN(t)) return '';
  const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
  return m < 1 ? 'agora' : m < 60 ? `há ${m} min` : m < 1440 ? `há ${Math.floor(m / 60)} h` : `há ${Math.floor(m / 1440)} d`;
};
const icA = (i, s = 22) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px"></ha-icon>`;
const COVER_PT = { open: 'Aberto', closed: 'Fechado', opening: 'A abrir', closing: 'A fechar' };

class CasaAccessCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sig = ''; this._arm = null; this._open = null; this._cam = null; this._sent = {}; this._imgs = new Map(); this._ts = Date.now();
  }
  setConfig(c) {
    const solo = c.only === 'cameras';
    if (solo && !(c.cameras || []).length) throw new Error('Defina "cameras"');
    if (!solo && !c.main && !c.others) throw new Error('Defina "main" e/ou "others"');
    this._c = Object.assign({ main: [], others: [], bells: [], cameras: [], refresh: 5 }, c);
    this._solo = solo; this._pkLive = c.cameras_live != null ? !!c.cameras_live : solo;
    if (c.remember !== false) { try { this._cam = window.localStorage.getItem('casa-cam') || this._cam; } catch (e) { /* sem armazenamento */ } }
  }
  getCardSize() { return this._solo ? 5 : 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { if (this._pkLive && this._h && this._c && !this._pl) this._render(); clearInterval(this._iv); this._iv = setInterval(() => this._tick(), this._fastOn ? 2000 : Math.max(2, Number(this._c && this._c.refresh) || 5) * 1000); }
  disconnectedCallback() { clearInterval(this._iv); clearTimeout(this._armT); this._plStop(); }
  /* visor com seletor: um único stream; o anterior é parado ao trocar de câmara */
  _plStop() {
    const p = this._pl; this._pl = null; this._plWant = null; if (!p) return;
    try { p.el.remove(); p.el.background = false; if (typeof p.el.ondisconnect === 'function') p.el.ondisconnect(); } catch (e) { /* já parado */ }
  }
  /* a câmara tem stream a sério? (supported_features: 2 = STREAM); sem ele o HA faria «vídeo» com duas fotografias por segundo */
  _stream(id) { const s = this._st(id); return !!s && ((Number(s.attributes.supported_features) || 0) & 2) !== 0; }
  _fast() { if (this._fastOn) return; this._fastOn = true; if (this.isConnected) { clearInterval(this._iv); this._iv = setInterval(() => this._tick(), 2000); } }
  _plShow(id, slot) {
    if (this._pl && this._pl.id !== id) this._plStop();
    const s0 = this._st(id);
    if (!s0 || s0.state === 'unavailable' || this._ovOpen) { this._plStop(); if (s0 && s0.state !== 'unavailable') slot.appendChild(this._img(id)); return; }
    if (!this._stream(id)) { this._plStop(); slot.appendChild(this._img(id)); this._fast(); return; }
    if (this._pl) { slot.appendChild(this._pl.el); return; }
    slot.appendChild(this._img(id));
    if (this._plWant === id) return;
    this._plWant = id;
    const cfg = { type: 'custom:webrtc-camera', entity: id, muted: true, ui: false };
    const put = (el) => {
      if (this._plWant !== id || this._pl) { try { if (typeof el.ondisconnect === 'function') el.ondisconnect(); } catch (e) { /* nada */ } return; }
      el.hass = this._h; el.style.cssText = 'display:block;position:absolute;inset:0;pointer-events:none';
      this._pl = { id, el };
      const s = this.shadowRoot.querySelector('.pk [data-cam="' + id + '"]');
      if (s) { s.innerHTML = ''; s.appendChild(el); }
    };
    try {
      if (customElements.get('webrtc-camera')) { const el = document.createElement('webrtc-camera'); el.setConfig(cfg); return put(el); }
    } catch (e) { /* tenta pelos card helpers */ }
    if (!window.loadCardHelpers) { this._plWant = null; return; }
    window.loadCardHelpers().then((hp) => put(hp.createCardElement(cfg))).catch(() => { if (this._plWant === id) this._plWant = null; });
  }
  _ids() {
    const c = this._c, g = c.main.concat(c.others), l = c.lock || {};
    return [c.camera, c.dnd, l.entity, l.door, l.battery].concat(g.map((x) => x.entity), g.map((x) => x.alert), g.map((x) => x.alert_delay), c.bells.map((b) => b.calling), c.bells.map((b) => b.camera), c.cameras.map((x) => x.entity)).filter(Boolean);
  }
  set hass(h) {
    this._h = h;
    if (this._lives) this._lives.forEach((e) => { e.hass = h; });
    if (this._pl) this._pl.el.hass = h;
    const sig = this._ids().map((i) => { const s = h.states[i]; return s ? s.state + '|' + (s.attributes.last_triggered || '') : '-'; }).join(';') + (this._solo ? '' : '#' + Math.floor(Date.now() / 60000));
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  _st(id) { return id ? this._h.states[id] : null; }
  _ok(id) { const s = this._st(id); return !!s && s.state !== 'unavailable' && s.state !== 'unknown'; }
  _camUrl(id) {
    const s = this._st(id), p = s && s.attributes.entity_picture;
    if (!p || s.state === 'unavailable') return '';
    return p + (p.includes('?') ? '&' : '?') + 't=' + this._ts;
  }
  _img(id) {
    let img = this._imgs.get(id);
    if (!img) {
      img = document.createElement('img'); img.alt = ''; img.hidden = true;
      img.addEventListener('load', () => { img.hidden = false; });
      img.addEventListener('error', () => { img.hidden = true; });
      this._imgs.set(id, img);
      const u = this._camUrl(id); if (u) img.src = u;
    }
    return img;
  }
  _live(id, slot) {
    if (!this._stream(id)) { slot.appendChild(this._img(id)); this._fast(); return; }
    this._lives = this._lives || new Map();
    const have = this._lives.get(id);
    if (have) { slot.appendChild(have); return; }
    slot.appendChild(this._img(id));
    if (this._liveBusy && this._liveBusy[id]) return;
    this._liveBusy = this._liveBusy || {}; this._liveBusy[id] = true;
    if (!window.loadCardHelpers) return;
    window.loadCardHelpers().then((hp) => {
      const card = hp.createCardElement({ type: 'custom:webrtc-camera', entity: id, muted: true, ui: false, background: true });
      card.hass = this._h; card.style.cssText = 'display:block;position:absolute;inset:0;pointer-events:none';
      this._lives.set(id, card);
      const s = this.shadowRoot.querySelector('[data-cam="' + id + '"]');
      if (s) { s.innerHTML = ''; s.appendChild(card); }
    }).catch(() => { this._liveBusy[id] = false; });
  }
  _tick() {
    if (!this._h || (typeof document !== 'undefined' && document.hidden)) return;
    this._ts = Date.now();
    this._imgs.forEach((img, id) => {
      if (!img.isConnected) return;
      const u = this._camUrl(id); if (!u) { img.hidden = true; return; }
      const pre = new Image(); pre.onload = () => { img.src = u; }; pre.src = u;
    });
  }
  _armMs(k) { return k === 'lock' ? 5000 : Math.max(3, Number(this._c.confirm_seconds) || 10) * 1000; }
  _armUi() {
    const T = this._armMs(this._arm), el = (Date.now() - this._armAt) / 1000;
    return `<button class="act cancel" data-cancel="1">Cancelar · <span data-left>${Math.max(0, Math.ceil(T / 1000 - el))}</span> s</button>`;
  }
  _cdVars() {
    const T = this._armMs(this._arm), el = (Date.now() - this._armAt) / 1000;
    return `--cd:${T / 1000}s;--cdd:-${el.toFixed(2)}s`;
  }
  _armSet(k) {
    clearTimeout(this._armT); clearInterval(this._armIv); this._arm = k; this._armAt = Date.now();
    const T = this._armMs(k);
    if (k) {
      this._armT = setTimeout(() => { clearInterval(this._armIv); this._arm = null; this._render(); }, T);
      this._armIv = setInterval(() => { const el = this.shadowRoot.querySelector('[data-left]'); if (el) el.textContent = Math.max(0, Math.ceil((this._armAt + T - Date.now()) / 1000)); }, 250);
    }
    this._render();
  }
  _gate(g) {
    const s = this._st(g.entity), isScript = g.entity.startsWith('script.');
    const ok = !!s && s.state !== 'unavailable' && (isScript || s.state !== 'unknown');
    const open = ok && !isScript && s.state !== 'closed';
    const sent = isScript && this._sent[g.entity] && Date.now() - this._sent[g.entity] < 60000;
    let state;
    if (!ok) state = 'Sem ligação';
    else if (isScript) state = sent ? 'Sem sensor · comando enviado agora' : 'Sem sensor' + (s.attributes.last_triggered ? ' · aberto ' + agoA(s.attributes.last_triggered) : '');
    else state = (COVER_PT[s.state] || s.state) + ' · ' + agoA(s.last_changed);
    const al = this._st(g.alert);
    return { ok, open, isScript, state, hasAlert: !!al, alertOn: !!al && al.state === 'on' };
  }
  _gateHtml(g, inner) {
    const v = this._gate(g), k = 'g:' + g.entity, armed = this._arm === k, verb = v.open ? 'fechar' : 'abrir';
    const ds = this._ok(g.alert_delay) ? this._st(g.alert_delay) : null, dv = ds ? Math.round(Number(ds.state)) : NaN;
    const am = isNaN(dv) ? g.alert_minutes : dv, da = ds ? ds.attributes : {}, dst = Number(da.step) || 1;
    return `<div class="gate${inner ? ' in' : ' panel'}${armed ? ' armed' : ''}" data-g="${escA(g.entity)}" data-ok="${v.ok ? 1 : 0}">
      <div class="row" data-info="${escA(g.entity)}">
        <span class="ic big${v.open ? ' bad' : ''}">${icA(g.icon || 'mdi:gate')}</span>
        <span class="tx"><span class="gn">${escA(g.name)}</span><span class="st${v.open ? ' bad' : ''}">${escA(v.state)}</span></span>
        ${v.hasAlert ? `<button class="step" data-more="${escA(g.entity)}" aria-label="Aviso de portão aberto ${v.alertOn ? 'ligado' + (am ? ', ' + am + ' min' : '') : 'desligado'}: definições de ${escA(g.name)}" aria-expanded="${this._open === g.entity}">${icA(v.alertOn ? 'mdi:bell-outline' : 'mdi:bell-off-outline', 20)}</button>` : ''}
      </div>
      <div class="actrow" style="${armed ? this._cdVars() : ''}"><button class="act${armed ? ' warn' : v.open ? ' on' : ''}" ${v.ok ? '' : 'disabled'}>${armed ? `Confirmar: ${verb}` : icA(v.open ? 'mdi:chevron-down' : 'mdi:chevron-up', 20) + (v.open ? 'Fechar' : 'Abrir')}</button>${armed ? this._armUi() : ''}</div>
      ${this._open === g.entity && v.hasAlert ? `<div class="set">
        <button class="sw" role="switch" aria-checked="${v.alertOn}" data-alert="${escA(g.alert)}"><span class="tx"><span class="nm">Avisar se ficar aberto</span><span class="st">${v.alertOn ? 'Ligado' + (am ? ` · ao fim de ${am} min` : '') : 'Desligado'}</span></span><span class="knob${v.alertOn ? ' on' : ''}"><i></i></span></button>
        ${ds && !isNaN(dv) ? `<div class="sw dly"><span class="tx"><span class="nm">Avisar ao fim de</span><span class="st">${escA(Math.round(da.min))} a ${escA(Math.round(da.max))} min</span></span><button class="step" data-dly="${escA(g.alert_delay)}" data-d="${-dst}" ${dv - dst < da.min ? 'disabled' : ''} aria-label="Avisar mais cedo">${icA('mdi:minus', 18)}</button><b class="dv">${dv} min</b><button class="step" data-dly="${escA(g.alert_delay)}" data-d="${dst}" ${dv + dst > da.max ? 'disabled' : ''} aria-label="Avisar mais tarde">${icA('mdi:plus', 18)}</button></div>` : ''}
        <div class="kv"><span>Último movimento</span><b>${escA(v.state)}</b></div>
      </div>` : ''}
    </div>`;
  }
  _camSlot(id, name, attrs, cls) {
    const ok = this._ok(id) || (this._st(id) && this._st(id).state !== 'unavailable');
    return `<button class="cam ${cls || ''}" ${attrs} aria-label="${escA(name)}"><span class="ph">${icA(ok ? 'mdi:video-outline' : 'mdi:video-off-outline', 28)}${ok ? 'A carregar imagem' : 'Sem ligação'}</span><span class="slot" data-cam="${escA(id)}"></span><span class="lbl"><i class="${ok ? 'ok' : ''}"></i>${escA(name)}</span></button>`;
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const all = c.main.concat(c.others), gv = all.map((g) => this._gate(g));
    const openN = gv.filter((v) => v.open).length;
    const alerts = gv.filter((v) => v.hasAlert), alertsOn = alerts.filter((v) => v.alertOn).length;
    const L = c.lock, ls = L ? this._st(L.entity) : null, lockOk = L && this._ok(L.entity), locked = lockOk && ls.state === 'locked';
    const dnd = this._st(c.dnd), dndOn = !!dnd && dnd.state === 'on';
    const ringing = c.bells.filter((b) => this._st(b.calling) && this._st(b.calling).state === 'on');
    const parts = ringing.map((b) => b.name + ' a tocar').concat([
      openN ? (openN === 1 ? '1 portão aberto' : openN + ' portões abertos') : 'portões todos fechados'
    ], L ? [lockOk ? (locked ? 'porta traseira trancada' : 'porta traseira destrancada') : 'fechadura sem ligação'] : []);
    const sum = parts.join(' · '), summary = sum.charAt(0).toUpperCase() + sum.slice(1);

    const mv = c.main.map((g) => this._gate(g)), mOk = c.main.filter((g, i) => mv[i].ok);
    const bothOpen = mv.length > 1 && mv.every((v) => v.open), bothArmed = this._arm === 'both';
    const both = c.main.length > 1 && c.main.every((g) => g.entity.startsWith('cover.')) ? `<button class="act pri${bothArmed ? ' warn' : ''}" data-both="${bothOpen ? 'close' : 'open'}" ${mOk.length ? '' : 'disabled'}>${bothArmed ? `Toque outra vez para ${bothOpen ? 'fechar' : 'abrir'} os dois` : (bothOpen ? 'Fechar os dois' : 'Abrir os dois')}</button>` : '';

    let lockHtml = '';
    if (L) {
      const door = this._st(L.door), bat = this._st(L.battery), la = this._arm === 'lock';
      const LS = { locked: 'Trancada', unlocked: 'Destrancada', locking: 'A trancar', unlocking: 'A destrancar', jammed: 'Encravada', open: 'Aberta', opening: 'A abrir' };
      const doorOpen = door && door.state === 'on';
      lockHtml = `<div class="panel lock${la ? ' armed' : ''}">
        <div class="row" data-info="${escA(L.entity)}">
          <span class="ic big ${lockOk ? (locked ? 'good' : 'bad') : ''}">${icA(locked ? 'mdi:lock' : 'mdi:lock-open-variant', 24)}</span>
          <span class="tx"><span class="gn">${escA(L.name || 'Porta')}</span><span class="st ${lockOk ? (locked && !doorOpen ? 'goodt' : 'bad') : ''}">${lockOk ? escA((LS[ls.state] || ls.state) + (door ? ' · ' + (door.state === 'unavailable' ? 'sensor da porta sem ligação' : doorOpen ? 'porta aberta' : 'porta fechada') : ' · ' + agoA(ls.last_changed))) : 'Sem ligação'}</span></span>
          ${bat && !isNaN(Number(bat.state)) ? `<span class="cap bat${Number(bat.state) < 20 ? ' low' : ''}" title="Bateria da fechadura">${icA(Number(bat.state) < 20 ? 'mdi:battery-alert-variant-outline' : 'mdi:battery-70', 16)}${Math.round(Number(bat.state))}%</span>` : ''}
        </div>
        <div class="two">
          <button class="act${lockOk && !locked ? ' on' : ''}" data-lock="lock" ${lockOk ? '' : 'disabled'} aria-pressed="${!!locked}">${icA('mdi:lock', 20)}Trancar</button>
          <button class="act${la ? ' warn' : ''}" data-lock="unlock" ${lockOk && locked ? '' : 'disabled'}>${la ? 'Confirmar: destrancar' : icA('mdi:lock-open-variant', 20) + 'Destrancar'}</button>
        </div>
      </div>`;
    }
    const cams = c.cameras;
    if (cams.length && !cams.some((x) => x.entity === this._cam)) this._cam = (cams.find((x) => this._ok(x.entity)) || cams[0]).entity;
    const cur = cams.find((x) => x.entity === this._cam);
    const camUp = (x) => !!this._st(x.entity) && this._st(x.entity).state !== 'unavailable';
    const real = cams.filter((x) => !x.composite), camOn = real.filter(camUp).length;
    const viewer = cur ? `${this._camSlot(cur.entity, cur.name, `data-info-tap="${escA(cur.entity)}"`, 'pk')}
          <div class="seg" role="group" aria-label="Câmara">${cams.map((x) => `<button class="${x.entity === cur.entity ? 'on' : ''}${camUp(x) ? '' : ' na'}" data-pick="${escA(x.entity)}" aria-pressed="${x.entity === cur.entity}"${camUp(x) ? '' : ` title="Sem ligação" aria-label="${escA(x.name)}, sem ligação"`}>${escA(x.name)}</button>`).join('')}</div>` : '';

    this.shadowRoot.innerHTML = `<style>
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
      .ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
      .nm{font-size:14px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .st{font-size:12px;line-height:1.3;color:var(--secondary-text-color)}
      .cap{font-size:13px;color:var(--secondary-text-color)}
      .seg{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--card-background-color);overflow-x:auto;scrollbar-width:none;scroll-snap-type:x proximity;overscroll-behavior-x:contain}
      .seg::-webkit-scrollbar{display:none}
      .seg button{flex:1 0 auto;min-width:88px;min-height:44px;padding:0 12px;border-radius:10px;font-size:14px;font-weight:500;text-align:center;white-space:nowrap;scroll-snap-align:center}
      .seg button.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .seg button.na:not(.on){color:var(--secondary-text-color)}
      .tgl{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 10px 0 14px;border-radius:12px;background:var(--secondary-background-color);font-size:14px;font-weight:500;white-space:nowrap;box-sizing:border-box}
      .tgl ha-icon{flex:none;color:var(--secondary-text-color)}
      .tgl .knob{margin-left:4px}
      .step{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
      .info{color:var(--secondary-text-color);font-weight:400}
      .main{flex-direction:row;flex-wrap:wrap;gap:16px;align-items:stretch}
      .main>.cam{flex:1.7 1 480px;align-self:flex-start;order:2}
      .side{flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:8px}
      .gate.in{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:var(--card-background-color)}
      .gate,.lock{border:1px solid transparent}
      .armed{border-color:#ed8796}
      .gate.in .ic,.gate.in .step,.gate.in .act:not(.on):not(.warn),.gate.in .tag,.gate.in .sw{background:var(--secondary-background-color)}
      .gate.panel .ic,.lock .ic,.bell .ic{background:var(--card-background-color)}
      .row{display:flex;align-items:center;gap:12px;min-width:0}
      .ic.big{width:44px;height:44px}
      .ic.bad{background:#ed8796!important;color:#181926}.ic.good{background:#a6da95!important;color:#181926}.ic.sel{background:var(--primary-color)!important;color:#181926}
      .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
      .gn{font-size:16px;font-weight:600;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .row .st{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .bat{flex:none;display:inline-flex;align-items:center;gap:4px}.bat.low{color:#ed8796;font-weight:600}
      .st.bad,.badt{color:#ed8796}.st.goodt{color:#a6da95}.st.sel{color:var(--primary-color);font-weight:600}.st:empty{display:none}
      .act{display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:6px 10px;border-radius:12px;background:var(--card-background-color);font-size:15px;font-weight:600;line-height:1.2;text-align:center}
      .act.on{background:var(--primary-text-color);color:var(--card-background-color)}
      .act.pri{background:var(--primary-color);color:#181926}
      .act.warn{background:var(--error-color,#ed8796);color:#181926}
      .gate[data-ok="1"]{cursor:pointer}
      .cd{display:block;height:6px;border-radius:999px;background:rgba(127,127,127,.25);overflow:hidden}
      .cd i{display:block;height:100%;width:100%;background:var(--error-color,#ed8796);transform-origin:left;animation:cd linear forwards}
      @keyframes cd{from{transform:scaleX(1)}to{transform:scaleX(0)}}
      .actrow{display:flex;gap:8px}
      .actrow>.act{flex:1;min-width:0;white-space:nowrap}
      .actrow>.act.warn{position:relative;overflow:hidden}
      .actrow>.act.warn::after{content:'';position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(0,0,0,.35);transform-origin:left;animation:cd var(--cd,10s) linear forwards;animation-delay:var(--cdd,0s)}
      .actrow>.cancel{flex:0 0 auto;padding:0 16px}
      .tag{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 12px 0 10px;border-radius:999px;background:var(--card-background-color);font-size:12px;font-weight:600}
      .tag.mute{color:var(--secondary-text-color)}
      .set{display:flex;flex-direction:column;gap:8px}
      .sw{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:8px 14px;border-radius:12px;background:var(--card-background-color);width:100%;box-sizing:border-box}
      .sw.dly{gap:8px;padding:6px 8px 6px 14px}.dly .tx{flex:1}.dv{flex:none;min-width:56px;text-align:center;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
      .gate.in .dly .step{background:var(--card-background-color)}.gate.panel .dly .step{background:var(--secondary-background-color)}
      .sw.dnd{background:var(--secondary-background-color);border-radius:16px;padding:10px 14px}
      .knob{flex:none;width:36px;height:20px;border-radius:10px;padding:2px;box-sizing:border-box;background:rgba(127,127,127,.35);background:color-mix(in srgb,var(--primary-text-color) 22%,transparent);display:flex}
      .knob i{width:16px;height:16px;border-radius:50%;background:var(--secondary-text-color)}
      .knob.on{background:var(--primary-text-color);justify-content:flex-end}.knob.on i{background:var(--card-background-color)}
      .kv{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:var(--secondary-text-color);padding:0 4px}.kv b{color:var(--primary-text-color);font-weight:600;text-align:right}
      .cam{position:relative;display:block;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#11111b;min-width:0}
      .cam .slot,.cam img{position:absolute;inset:0;width:100%;height:100%}
      .cam img{object-fit:cover;display:block}.cam img[hidden]{display:none}
      .cam .ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#b8c0e0;font-size:13px}
      .cam .lbl{position:absolute;left:10px;top:10px;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);color:#cad3f5;font-size:12px;font-weight:600}
      .cam .lbl i{width:7px;height:7px;border-radius:50%;background:#6e738d}.cam .lbl i.ok{background:#ed8796}
      .meta{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .bells{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;align-items:start}
      .last{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch}
      .last>.lock{flex:1 1 320px;justify-content:space-between}
      .last>.others{flex:2 1 480px;padding:0;overflow:hidden;gap:0}
      .others .cam{border-radius:0}
      .others .seg,.solo .seg{margin:12px}
      ha-card.solo{gap:0;overflow:hidden;background:var(--ha-card-background,var(--casa-a));border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,#e0e0e0));border-radius:var(--ha-card-border-radius,12px)}
      .solo .cam{border-radius:0}
      ha-card.bare{height:100%;gap:8px}.bare>.gate{flex:1;justify-content:space-between}
    </style>
    <ha-card class="${this._solo ? 'solo' : c.bare ? 'bare' : ''}">${this._solo ? viewer : c.bare ? all.map((g) => this._gateHtml(g, false)).join('') : `
      <div class="top"><div class="sum">${escA(summary)}</div>${alerts.length && alertsOn < alerts.length ? `<span class="cap">Aviso de portão aberto desligado em ${alerts.length - alertsOn} de ${alerts.length}</span>` : ''}</div>
      <div class="panel main">
        ${c.camera ? this._camSlot(c.camera, c.camera_name || 'Câmara', `data-info-tap="${escA(c.camera)}"`) : ''}
        <div class="side">
          <div class="actrow" style="${bothArmed ? this._cdVars() : ''}">${both}${bothArmed ? this._armUi() : ''}</div>
          ${c.main.map((g) => this._gateHtml(g, true)).join('')}
        </div>
      </div>
      ${c.others.length || L ? `<div class="cols">${c.others.map((g) => this._gateHtml(g, false)).join('')}${lockHtml}</div>` : ''}
      ${c.bells.length ? `<div class="floor"><span class="fn">Campainhas</span><span class="fc">${ringing.length ? ringing.length + ' a tocar' : 'sem chamadas'}</span><span class="fl"></span>${dnd ? `<button class="tgl" role="switch" aria-checked="${dndOn}" data-dnd="1" ${this._ok(c.dnd) ? '' : 'disabled title="Sem ligação"'}>${icA(dndOn ? 'mdi:bell-off-outline' : 'mdi:bell-outline', 20)}<span>Não incomodar</span><span class="knob${dndOn ? ' on' : ''}"><i></i></span></button>` : ''}</div>
      <div class="bells">${c.bells.map((b, i) => {
        const ring = this._st(b.calling) && this._st(b.calling).state === 'on';
        return `<div class="panel bell">
          <div class="row"><span class="ic big${ring ? ' sel' : ''}">${icA('mdi:bell-outline')}</span>
            <span class="tx"><span class="gn">${escA(b.name)}</span><span class="st sel" role="status">${ring ? 'A tocar agora' : ''}</span></span></div>
          ${b.camera ? this._camSlot(b.camera, b.name, `data-nav="${i}"`) : ''}
          <button class="act${ring ? ' pri' : ''}" data-nav="${i}">${icA('mdi:phone-outline', 20)}${ring ? 'Atender' : 'Abrir vídeo e atender'}</button>
        </div>`; }).join('')}</div>` : ''}
      ${cams.length ? `<div class="floor"><span class="fn">Câmaras</span><span class="fc">${camOn === real.length ? (camOn === 1 ? '1 ligada' : camOn + ' ligadas') : camOn + ' de ' + real.length + ' ligadas'}</span><span class="fl"></span></div>
      <div class="last">
        ${cur ? `<div class="panel others">${viewer}</div>` : ''}
      </div>` : ''}`}
    </ha-card>`;
    this._bind();
  }
  _liveOpen(id, name) {
    const info = () => this._info(id);
    if (!window.loadCardHelpers) return info();
    const solo1 = this._pkLive && !!this._pl; let big = null;
    if (solo1) { this._ovOpen = true; this._plStop(); this._render(); }
    const ov = document.createElement('div');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', name);
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(17,17,27,.85);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:var(--ha-font-family-body,Roboto,sans-serif)';
    const box = document.createElement('div');
    box.style.cssText = 'width:min(1100px,100%);max-height:100%;background:var(--card-background-color,#1e2030);color:var(--primary-text-color,#cad3f5);border-radius:16px;overflow:hidden;display:flex;flex-direction:column';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 8px 8px 16px;font-size:18px;font-weight:600';
    const ttl = document.createElement('span'); ttl.textContent = name; ttl.style.cssText = 'flex:1;min-width:0';
    const mk = (txt) => { const b = document.createElement('button'); b.textContent = txt; b.style.cssText = 'min-height:44px;padding:0 16px;border:0;border-radius:999px;background:var(--secondary-background-color,#24273a);color:inherit;font:inherit;font-size:14px;font-weight:500;cursor:pointer'; return b; };
    const more = mk('Detalhes'), close = mk('Fechar');
    const body = document.createElement('div'); body.style.cssText = 'min-height:200px;background:#11111b';
    const end = () => {
      document.removeEventListener('keydown', key); ov.remove();
      if (solo1) { try { if (big && typeof big.ondisconnect === 'function') big.ondisconnect(); } catch (e) { /* nada */ } if (this._ovOpen) { this._ovOpen = false; this._render(); } }
    };
    const key = (e) => { if (e.key === 'Escape') end(); };
    close.addEventListener('click', end); more.addEventListener('click', () => { end(); info(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) end(); });
    document.addEventListener('keydown', key);
    head.append(ttl, more, close); box.append(head, body); ov.append(box); document.body.append(ov);
    close.focus();
    window.loadCardHelpers().then((hp) => { const card = hp.createCardElement({ type: 'custom:webrtc-camera', entity: id, muted: true }); card.hass = this._h; big = card; if (ov.isConnected) body.append(card); }).catch(() => { end(); info(); });
  }
  _info(id) { this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } })); }
  _bind() {
    const R = this.shadowRoot, c = this._c, h = this._h;
    const on = (sel, fn) => R.querySelectorAll(sel).forEach((el) => el.addEventListener('click', (e) => fn(el, e)));
    R.querySelectorAll('[data-cam]').forEach((el) => { const id = el.dataset.cam; if (el.closest('.pk')) { if (this._pkLive) this._plShow(id, el); else el.appendChild(this._img(id)); } else if ((c.live || []).includes(id)) this._live(id, el); else el.appendChild(this._img(id)); });
    const seg = R.querySelector('.seg');
    if (seg) {
      const sel = seg.querySelector('.on');
      if (this._segX != null) seg.scrollLeft = this._segX;
      else if (sel && seg.scrollWidth > seg.clientWidth) seg.scrollLeft = Math.max(0, sel.offsetLeft - seg.offsetLeft - (seg.clientWidth - sel.offsetWidth) / 2);
      seg.addEventListener('scroll', () => { this._segX = seg.scrollLeft; }, { passive: true });
    }
    R.querySelectorAll('[data-info]').forEach((el) => {
      let t; const stop = () => clearTimeout(t);
      el.addEventListener('pointerdown', () => { stop(); t = setTimeout(() => this._info(el.dataset.info), 550); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, stop));
    });
    on('[data-info-tap]', (el) => this._liveOpen(el.dataset.infoTap, el.getAttribute('aria-label') || 'Câmara'));
    on('[data-more]', (el, e) => { e.stopPropagation(); this._open = this._open === el.dataset.more ? null : el.dataset.more; this._render(); });
    on('[data-cancel]', (el, e) => { e.stopPropagation(); this._armSet(null); });
    on('[data-g]', (el, e) => {
      if (e.target.closest('[data-more],.set,[data-cancel],[data-alert]') || el.dataset.ok !== '1') return;
      const id = el.dataset.g, k = 'g:' + id;
      if (this._arm !== k) return this._armSet(k);
      if (id.startsWith('script.')) { this._sent[id] = Date.now(); h.callService('script', 'turn_on', {}, { entity_id: id }); }
      else h.callService('cover', 'toggle', {}, { entity_id: id });
      this._armSet(null);
    });
    on('[data-both]', (el) => {
      if (this._arm !== 'both') return this._armSet('both');
      const open = el.dataset.both === 'open';
      const ids = c.main.filter((g) => { const s = this._st(g.entity); return s && s.state !== 'unavailable' && (open ? s.state === 'closed' : s.state !== 'closed'); }).map((g) => g.entity);
      ids.forEach((id) => h.callService('cover', open ? 'open_cover' : 'close_cover', {}, { entity_id: id }));
      this._armSet(null);
    });
    on('[data-dly]', (el, e) => {
      e.stopPropagation(); const s = this._st(el.dataset.dly); if (!s || isNaN(Number(s.state))) return;
      const a = s.attributes, v = Math.max(Number(a.min), Math.min(Number(a.max), Number(s.state) + Number(el.dataset.d)));
      h.callService('input_number', 'set_value', { value: v }, { entity_id: el.dataset.dly });
    });
    on('[data-alert]', (el) => { const s = this._st(el.dataset.alert); h.callService('automation', s && s.state === 'on' ? 'turn_off' : 'turn_on', {}, { entity_id: el.dataset.alert }); });
    on('[data-lock]', (el) => {
      const a = el.dataset.lock;
      if (a === 'unlock' && this._arm !== 'lock') return this._armSet('lock');
      h.callService('lock', a, {}, { entity_id: c.lock.entity });
      this._armSet(null);
    });
    on('[data-dnd]', () => h.callService('input_boolean', 'toggle', {}, { entity_id: c.dnd }));
    on('[data-nav]', (el) => { const p = c.bells[el.dataset.nav].path; if (!p) return; history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed')); });
    on('[data-pick]', (el) => {
      if (this._cam === el.dataset.pick) return;
      this._cam = el.dataset.pick;
      if (c.remember !== false) { try { window.localStorage.setItem('casa-cam', this._cam); } catch (e) { /* sem armazenamento */ } }
      const seg = el.parentElement, r = el.getBoundingClientRect(), sr = seg.getBoundingClientRect();
      if (r.left < sr.left + 4 || r.right > sr.right - 4) this._segX = null;
      this._render();
    });
  }
}
const prevA = customElements.get('casa-access-card');
if (!prevA) customElements.define('casa-access-card', CasaAccessCard);
else if (prevA !== CasaAccessCard) Object.getOwnPropertyNames(CasaAccessCard.prototype).forEach((k) => { if (k !== 'constructor') Object.defineProperty(prevA.prototype, k, Object.getOwnPropertyDescriptor(CasaAccessCard.prototype, k)); });
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-access-card', name: 'Casa · Acessos', description: 'Portões com confirmação em dois toques, fechadura, campainhas e câmaras.' });

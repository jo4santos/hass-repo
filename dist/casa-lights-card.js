/* casa-lights-card v0.8.0 — luzes por divisão: cenas, mosaicos iguais; período em bloco segmentado e automatismos como interruptores */
const escL = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BULB = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>';
class CasaLightsCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._sig = ''; this._exp = {}; this._det = {}; this._arm = false; }
  setConfig(c) {
    if (!c.floors || !c.floors.length) throw new Error('Defina "floors"');
    this._c = Object.assign({ toggles: [], period_labels: {} }, c);
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  _all() { const out = []; this._c.floors.forEach((f) => f.rooms.forEach((r) => (r.lights || []).concat(r.details || []).forEach((l) => out.push(l.entity)))); return out; }
  set hass(h) {
    this._h = h;
    const c = this._c, ids = this._all().concat([c.period, c.all_off], c.toggles.map((t) => t.entity)).filter(Boolean);
    const sig = ids.map((i) => (h.states[i] ? h.states[i].state + ':' + (h.states[i].attributes.brightness ?? '') + ':' + (h.states[i].attributes.rgb_color || '') : '-')).join(';');
    if (sig !== this._sig && !this._drag) { this._sig = sig; this._render(); }
  }
  _on(e) { const s = this._h.states[e]; return !!s && s.state === 'on'; }
  _bad(e) { const s = this._h.states[e]; return !s || s.state === 'unavailable' || s.state === 'unknown'; }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const per = c.period && h.states[c.period];
    const opts = per ? per.attributes.options || [] : [];
    const tile = (l) => {
      const on = this._on(l.entity), bad = this._bad(l.entity), s = h.states[l.entity];
      const dim = !!s && !bad && (s.attributes.supported_color_modes || []).some((m) => m !== 'onoff');
      const pct = on && s.attributes.brightness != null ? Math.max(1, Math.round(s.attributes.brightness / 2.55)) : 0;
      const rgb = on && Array.isArray(s.attributes.rgb_color) ? s.attributes.rgb_color : null;
      const lum = rgb ? 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] : 0;
      const icSt = rgb ? ` style="background:rgb(${rgb.join(',')});color:${lum > 140 ? '#181926' : '#fff'}"` : '';
      return `<div class="tile${on ? ' on' : ''}${bad ? ' bad' : ''}${dim && on ? ' sl' : ''}"><button class="tm" data-light="${escL(l.entity)}" ${bad ? 'disabled' : ''} aria-pressed="${on}"><span class="ic"${icSt}>${BULB}</span><span class="tx"><span class="nm">${escL(l.name)}</span>${bad || on ? `<span class="st">${bad ? 'Sem ligação' : dim && pct ? pct + '%' : 'Acesa'}</span>` : ''}</span></button>${dim && on ? `<input type="range" min="1" max="100" value="${pct || 1}" data-bri="${escL(l.entity)}" aria-label="Intensidade de ${escL(l.name)}">` : ''}</div>`;
    };
    let total = 0;
    const floors = c.floors.map((f, fi) => {
      let fOn = 0;
      const rooms = f.rooms.map((r, ri) => {
        const key = fi + '-' + ri, all = (r.lights || []).concat(r.details || []);
        const n = (r.lights || []).filter((l) => this._on(l.entity)).length;
        const nAll = all.filter((l) => this._on(l.entity)).length;
        total += n; fOn += n;
        const open = true;
        const extra = nAll - n;
        if (!open) return `<button class="room closed" data-exp="${key}"><span class="rn">${escL(r.name)}</span><span class="rs">${n ? n + (n === 1 ? ' acesa' : ' acesas') : 'Tudo apagado · ' + (r.lights || []).length + ((r.lights || []).length === 1 ? ' luz' : ' luzes')}</span><span class="go">Abrir ›</span></button>`;
        return `<section class="room"><header><span class="rn">${escL(r.name)}</span><span class="rs">${n ? n + (n === 1 ? ' acesa' : ' acesas') : ''}</span>${(r.scenes || []).length ? `<span class="chips">${r.scenes.map((s) => `<button class="chip" data-scene="${escL(s.entity)}">${escL(s.name)}</button>`).join('')}</span>` : ''}</header>
          <div class="grid">${(r.lights || []).map(tile).join('')}</div>
          ${(r.details || []).length ? `<button class="link" data-det="${key}" aria-expanded="${!!this._det[key]}">${this._det[key] ? 'Fechar detalhes' : 'Detalhes' + (extra > 0 ? ' · ' + extra + (extra === 1 ? ' ligado' : ' ligados') : '') + ' ›'}</button>${this._det[key] ? `<div class="grid det">${r.details.map(tile).join('')}</div>` : ''}` : ''}
        </section>`;
      }).join('');
      const fa = this._armF === fi;
      return `<div class="floor"><span class="fn">${escL(f.name)}</span><span class="fc">${fOn ? fOn + (fOn === 1 ? ' acesa' : ' acesas') : 'tudo apagado'}</span><span class="fl"></span><button class="chip fo${fa ? ' warn' : ''}" data-flooroff="${fi}" ${fOn ? '' : 'disabled'}>${fa ? 'Confirmar' : 'Apagar piso'}</button></div><div class="rooms">${rooms}</div>`;
    }).join('');
    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      :host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
      button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
      button:disabled{opacity:.45;cursor:default}
      button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
      .sum{font-size:20px;font-weight:600;margin-right:auto}
      .seg{display:inline-flex;gap:4px;padding:4px;border-radius:14px;background:var(--secondary-background-color)}
      .seg button{flex:1 1 auto;min-width:64px;min-height:44px;padding:0 12px;border-radius:10px;font-size:14px;font-weight:500;text-align:center;white-space:nowrap}
      .tgl{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 10px 0 14px;border-radius:12px;background:var(--secondary-background-color);font-size:14px;font-weight:500;white-space:nowrap;box-sizing:border-box}
      .tgl ha-icon{--mdc-icon-size:20px;flex:none;color:var(--secondary-text-color)}
      .trk{flex:none;position:relative;width:36px;height:20px;border-radius:10px;margin-left:4px;background:rgba(127,127,127,.35);background:color-mix(in srgb,var(--primary-text-color) 22%,transparent)}
      .trk::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--secondary-text-color)}
      [aria-checked="true"]>.trk{background:var(--primary-text-color)}
      [aria-checked="true"]>.trk::after{left:18px;background:var(--card-background-color)}
      .seg button.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center}
      .chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .chip.warn{background:var(--error-color);color:#181926;font-weight:600}
      .chips{display:flex;flex-wrap:wrap;gap:8px}
      .floor{display:flex;align-items:center;gap:12px;margin:10px 0 -4px}
      .fn{font-size:17px;font-weight:600}
      .fc{font-size:13px;color:var(--secondary-text-color)}
      .fl{flex:1;height:1px;background:var(--divider-color,rgba(127,127,127,.3))}
      .fo{min-width:112px;justify-content:center}
      .rooms{columns:300px 3;column-gap:12px}
      .room{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box;break-inside:avoid;margin-bottom:12px}
      .room.closed{flex-direction:row;align-items:center;min-height:56px;padding:0 14px;gap:10px}
      .room header{display:flex;align-items:center;gap:10px;min-height:28px}
      .room header .chips{flex-wrap:nowrap;gap:6px}
      .room header .chip{padding:0 12px}
      .rn{font-size:16px;font-weight:600}.rs{font-size:13px;color:var(--secondary-text-color);flex:1}
      .go,.link{font-size:14px;font-weight:500;color:var(--primary-color);min-height:44px;display:inline-flex;align-items:center}
      .room.closed .go{min-height:0}
      .link{align-self:flex-start}
      .room .chip{background:var(--card-background-color)}
      .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .tile{position:relative;display:flex;flex-direction:column;justify-content:center;height:56px;padding:0 10px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box}
      .tile.bad{opacity:.45}
      .tm{display:flex;align-items:center;gap:10px;height:100%;min-width:0;width:100%}
      .tile .tx{flex:1;gap:1px}
      .tile.sl .tx{flex-direction:row;align-items:baseline;justify-content:space-between;gap:8px;padding-bottom:20px}
      .tile.sl .st{flex:none}
      .tile input[type=range]{position:absolute;left:56px;right:10px;bottom:7px;width:auto;height:16px;margin:0;accent-color:#eed49f}
      .tile.on input[type=range]{accent-color:#181926}
      .tile.on{background:var(--primary-text-color);color:var(--card-background-color)}
      .ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
      .tile.on .ic{background:#eed49f;color:#181926}
      .tx{display:flex;flex-direction:column;gap:2px;min-width:0}
      .nm{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .st{font-size:12px;color:var(--secondary-text-color)}.tile.on .st{color:inherit;opacity:.75}
    </style>
    <ha-card>
      <div class="top">
        <span class="sum">${total ? total + (total === 1 ? ' luz acesa' : ' luzes acesas') : 'Tudo apagado'}</span>
        ${opts.length ? `<span class="seg" role="group" aria-label="Período">${opts.map((o) => `<button class="${per.state === o ? 'on' : ''}" data-per="${escL(o)}" aria-pressed="${per.state === o}">${escL(c.period_labels[o] || o)}</button>`).join('')}</span>` : ''}
        ${c.toggles.map((t, i) => `<button class="tgl" role="switch" aria-checked="${this._on(t.entity)}" data-tog="${i}" ${this._bad(t.entity) ? 'disabled title="Sem ligação"' : ''}>${t.icon ? `<ha-icon icon="${escL(t.icon)}"></ha-icon>` : ''}<span>${escL(t.name)}</span><span class="trk"></span></button>`).join('')}
        ${c.all_off ? `<button class="chip${this._arm ? ' warn' : ''}" data-off="1" ${total ? '' : 'disabled'}>${this._arm ? 'Toque outra vez para desligar' : 'Desligar todas'}</button>` : ''}
      </div>
      ${floors}
    </ha-card>`;
    const R = this.shadowRoot, on = (sel, fn) => R.querySelectorAll(sel).forEach((el) => el.addEventListener('click', () => fn(el)));
    on('[data-exp]', (el) => { this._exp[el.dataset.exp] = !this._exp[el.dataset.exp]; this._render(); });
    on('[data-det]', (el) => { this._det[el.dataset.det] = !this._det[el.dataset.det]; this._render(); });
    on('[data-scene]', (el) => h.callService('scene', 'turn_on', {}, { entity_id: el.dataset.scene }));
    on('[data-per]', (el) => h.callService('input_select', 'select_option', { option: el.dataset.per }, { entity_id: c.period }));
    on('[data-tog]', (el) => h.callService('homeassistant', 'toggle', {}, { entity_id: c.toggles[el.dataset.tog].entity }));
    on('[data-flooroff]', (el) => {
      const fi = Number(el.dataset.flooroff);
      if (this._armF !== fi) { this._armF = fi; clearTimeout(this._tf); this._tf = setTimeout(() => { this._armF = null; this._render(); }, 5000); return this._render(); }
      clearTimeout(this._tf); this._armF = null;
      const ids = [];
      c.floors[fi].rooms.forEach((r) => (r.lights || []).concat(r.details || []).forEach((l) => { if (this._on(l.entity)) ids.push(l.entity); }));
      if (ids.length) h.callService('light', 'turn_off', {}, { entity_id: ids });
      this._render();
    });
    on('[data-off]', () => {
      if (!this._arm) { this._arm = true; this._t = setTimeout(() => { this._arm = false; this._render(); }, 5000); return this._render(); }
      clearTimeout(this._t); this._arm = false; const p = c.all_off.split('.'); h.callService(p[0], p[1] === undefined ? 'turn_on' : p[1]); this._render();
    });
    R.querySelectorAll('[data-bri]').forEach((el) => {
      el.addEventListener('pointerdown', () => { this._drag = true; });
      ['pointerup', 'pointercancel', 'blur'].forEach((ev) => el.addEventListener(ev, () => setTimeout(() => { this._drag = false; }, 300)));
      el.addEventListener('input', () => { const st = el.parentElement.querySelector('.st'); if (st) st.textContent = el.value + '%'; });
      el.addEventListener('change', () => { this._drag = false; h.callService('light', 'turn_on', { brightness_pct: Number(el.value) }, { entity_id: el.dataset.bri }); });
    });
    R.querySelectorAll('[data-light]').forEach((el) => {
      let t = null, held = false;
      el.addEventListener('pointerdown', () => { held = false; t = setTimeout(() => { held = true; this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: el.dataset.light } })); }, 550); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => clearTimeout(t)));
      el.addEventListener('click', () => { if (!held) h.callService('light', 'toggle', {}, { entity_id: el.dataset.light }); });
    });
  }
}
if (!customElements.get('casa-lights-card')) customElements.define('casa-lights-card', CasaLightsCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-lights-card', name: 'Casa · Luzes', description: 'Luzes por piso e divisão, com cenas e detalhes.' });

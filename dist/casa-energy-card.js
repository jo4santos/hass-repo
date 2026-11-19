/* casa-energy-card v0.3.1 — três números com contexto e barras por equipamento medido */
(() => {
const CSS = `
:host{display:block}
:host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
#main{display:contents}
[hidden]{display:none!important}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.sum{font-size:20px;font-weight:600;margin-right:auto}
h3{margin:8px 0 -4px;font-size:13px;font-weight:500;color:var(--secondary-text-color)}
.panel{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.ic.solar{background:rgba(238,212,159,.16);color:#eed49f}
.nm{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.val{font-size:28px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
.cap{font-size:13px;color:var(--secondary-text-color)}
.big{font-size:16px;font-weight:600}
ha-icon{--mdc-icon-size:22px}
.seg{display:inline-flex;gap:4px;padding:4px;border-radius:14px;background:var(--secondary-background-color)}
.seg button{flex:1 1 auto;min-height:44px;min-width:64px;padding:0 12px;border-radius:10px;font-size:14px;font-weight:500;text-align:center;white-space:nowrap}
.seg button.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
.heads{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.heads .panel{width:100%}
.lb{display:flex;align-items:center;gap:10px}
.fhd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.rows{display:flex;flex-direction:column}
.row{display:grid;grid-template-columns:minmax(120px,220px) minmax(0,1fr) 84px;align-items:center;gap:14px;min-height:44px;width:100%;border-radius:8px}
.row .n{display:flex;align-items:center;gap:10px;min-width:0}
.dot{flex:none;width:10px;height:10px;border-radius:3px;background:var(--secondary-text-color)}
.bar{position:relative;height:10px;border-radius:5px;background:var(--card-background-color);overflow:hidden}
.bar i{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:var(--secondary-text-color)}
.row .v{text-align:right;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
.row.top .dot,.row.top .bar i{background:#f5a97f}
.row.rest .dot,.row.rest .bar i{background:var(--disabled-text-color,#6e738d)}
.row.zero .nm,.row.zero .v{color:var(--secondary-text-color);font-weight:400}.row.zero .v{font-size:13px;white-space:nowrap}.zl{display:flex;align-items:center;gap:10px;min-height:44px;width:100%;font-size:13px;color:var(--secondary-text-color)}.zt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zt b{font-weight:600}.zl ha-icon{flex:none;--mdc-icon-size:18px}
#embed{border-radius:16px;overflow:hidden}
`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BAD = (s) => !s || s.state === 'unavailable' || s.state === 'unknown';
const dec = (n, d) => n.toFixed(d).replace('.', ',');
const fmtW = (w) => Math.abs(w) >= 1000 ? dec(w / 1000, 2) + ' kW' : Math.round(w) + ' W';
const fmtKW = (w) => Math.abs(w) < 5 ? '0 kW' : dec(w / 1000, 2) + ' kW';
const fmtKWh = (k) => k == null ? '–' : (k >= 100 ? Math.round(k) : dec(k, 1)) + ' kWh';

class CasaEnergyCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._period = 'agora'; this._sig = ''; }
  setConfig(c) {
    if (!c || !Array.isArray(c.devices)) throw new Error('casa-energy-card: falta "devices"');
    this._c = c; this._sig = '';
  }
  getCardSize() { return 10; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() {
    if (this._bound) return; this._bound = true;
    this.shadowRoot.addEventListener('click', (ev) => {
      const b = ev.target.closest && ev.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'info') this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: b.dataset.e } }));
      else if (b.dataset.a === 'period') { this._period = b.dataset.p; this._render(); }
      else if (b.dataset.a === 'zeros') { this._zeros = !this._zeros; this._render(); }
    });
  }
  set hass(h) {
    this._hass = h; if (!this._c) return;
    if (this._card) this._card.hass = h;
    const c = this._c, ids = [c.solar_power, c.grid_power, c.house_power, c.solar_today, c.house_today, c.sun];
    c.devices.forEach((d) => { ids.push(d.entity); ids.push(d.today); ids.push(d.month); });
    const sig = ids.filter(Boolean).map((e) => { const s = h.states[e]; return s ? s.state : '-'; }).join(';');
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  /* potência em W, seja qual for a unidade do sensor */
  _w(e) { const s = e && this._hass.states[e]; if (BAD(s)) return null; const n = parseFloat(s.state); if (!isFinite(n)) return null; const u = s.attributes.unit_of_measurement; return u === 'kW' ? n * 1000 : u === 'MW' ? n * 1e6 : n; }
  _kwh(e) { const s = e && this._hass.states[e]; if (BAD(s)) return null; const n = parseFloat(s.state); if (!isFinite(n)) return null; const u = s.attributes.unit_of_measurement; return u === 'Wh' ? n / 1000 : u === 'MWh' ? n * 1000 : n; }
  _data() {
    const c = this._c, solar = this._w(c.solar_power), grid = this._w(c.grid_power);
    let house = this._w(c.house_power);
    if (house == null && grid != null) house = Math.max(0, grid + (solar || 0));
    const now = c.devices.filter((d) => this._hass.states[d.entity]).map((d) => ({ name: d.name, entity: d.entity, bad: BAD(this._hass.states[d.entity]), v: Math.max(0, this._w(d.entity) || 0) })).sort((a, b) => b.v - a.v);
    const day = c.devices.filter((d) => d.today && this._hass.states[d.today]).map((d) => ({ name: d.name, entity: d.today, bad: BAD(this._hass.states[d.today]), v: Math.max(0, this._kwh(d.today) || 0) })).sort((a, b) => b.v - a.v);
    const mon = c.devices.filter((d) => d.month && this._hass.states[d.month]).map((d) => ({ name: d.name, entity: d.month, bad: this._hass.states[d.month].state === 'unavailable', v: Math.max(0, this._kwh(d.month) || 0) })).sort((a, b) => b.v - a.v);
    return { mon, sumMon: mon.reduce((a, d) => a + d.v, 0), solar, grid, house, now, day, solarToday: this._kwh(c.solar_today), houseToday: this._kwh(c.house_today), sumNow: now.reduce((a, d) => a + d.v, 0), sumDay: day.reduce((a, d) => a + d.v, 0) };
  }
  _rows(list, rest, fmt, total) {
    const zero = list.filter((d) => !(d.v > 0)), all = list.filter((d) => d.v > 0), open = !!this._zeros;
    if (rest != null && rest > 0) all.push({ name: 'Resto da casa (não medido)', v: rest, rest: true });
    const max = all.reduce((m, d) => Math.max(m, d.v), 0) || 1;
    const row = (d, i) => {
      const cls = 'row' + (i === 0 && !d.rest && d.v > 0 ? ' top' : '') + (d.rest ? ' rest' : '') + (d.v > 0 ? '' : ' zero');
      const inner = `<span class="n"><span class="dot"></span><span class="nm">${esc(d.name)}</span></span><span class="bar"><i style="width:${(d.v > 0 ? Math.max(1, d.v / max * 100) : 0).toFixed(1)}%"></i></span><span class="v">${d.bad ? 'Sem ligação' : fmt(d.v)}</span>`;
      return d.rest ? `<div class="${cls}">${inner}</div>` : `<button class="${cls}" data-a="info" data-e="${esc(d.entity)}">${inner}</button>`;
    };
    return all.map(row).join('') + (zero.length ? `<button class="zl" data-a="zeros" aria-expanded="${open}"><span class="zt"><b>${zero.length} sem consumo${zero.some((d) => d.bad) ? ' ou sem leitura' : ''}</b>${open ? '' : ': ' + esc(zero.map((d) => d.name).join(', '))}</span><ha-icon icon="mdi:chevron-${open ? 'up' : 'down'}"></ha-icon></button>` + (open ? zero.map((d) => row(d, -1)).join('') : '') : '');
  }
  _html() {
    const c = this._c, D = this._data(), h = this._hass;
    const night = c.sun && h.states[c.sun] && h.states[c.sun].state === 'below_horizon';
    let sum;
    if (D.grid == null) sum = 'Sem leitura do contador.';
    else {
      sum = D.grid >= 50 ? `A casa puxa ${fmtKW(D.grid)} da rede.` : D.grid <= -50 ? `A casa injeta ${fmtKW(-D.grid)} na rede.` : 'A casa quase não puxa da rede.';
      const t = D.now[0];
      if (t && t.v > 0 && D.house > 0) sum += ` Maior consumo agora: ${t.name} (${Math.min(100, Math.round(t.v / D.house * 100))}%).`;
    }
    const periods = [['agora', 'Agora']].concat(D.day.length ? [['hoje', 'Hoje']] : [], D.mon.length ? [['mes', 'Este mês']] : []);
    const seg = periods.length > 1 ? `<div class="seg" role="group" aria-label="Período">${periods.map((p) => `<button data-a="period" data-p="${p[0]}" class="${this._period === p[0] ? 'on' : ''}" aria-pressed="${this._period === p[0]}">${p[1]}</button>`).join('')}</div>` : '';
    const heads = [];
    if (c.solar_power && h.states[c.solar_power]) heads.push([c.solar_power, 'mdi:white-balance-sunny', 'solar', 'Produção solar', D.solar == null ? 'Sem ligação' : fmtKW(D.solar), (night ? 'É noite · hoje produziu ' : 'Hoje produziu ') + fmtKWh(D.solarToday)]);
    if (c.grid_power && h.states[c.grid_power]) {
      const exp = D.grid != null && D.grid <= -50;
      heads.push([c.grid_power, 'mdi:transmission-tower', '', exp ? 'A injetar na rede' : 'Consumo da rede', D.grid == null ? 'Sem ligação' : fmtKW(Math.abs(D.grid)), `Casa a gastar ${D.house == null ? '–' : fmtKW(D.house)} · ${fmtW(D.sumNow)} em equipamentos medidos`]);
    }
    if (c.house_today && h.states[c.house_today]) {
      const cov = D.solarToday != null && D.houseToday > 0 ? Math.min(100, Math.round(D.solarToday / D.houseToday * 100)) + '% solar' : null;
      heads.push([c.house_today, 'mdi:home-lightning-bolt-outline', '', 'Consumo da casa hoje', fmtKWh(D.houseToday), cov ? `${fmtKWh(D.solarToday)} produzidos · equivale a ${cov} (aprox.)` : 'desde a meia-noite']);
    }
    const hd = heads.map((x) => `<button class="panel" data-a="info" data-e="${esc(x[0])}"><span class="lb"><span class="ic ${x[2]}"><ha-icon icon="${x[1]}"></ha-icon></span><span class="nm">${x[3]}</span></span><span class="val">${x[4]}</span><span class="cap">${x[5]}</span></button>`).join('');
    let body;
    if (this._period === 'mes' && D.mon.length) {
      const miss = D.now.length - D.mon.length;
      body = `<div class="panel"><div class="fhd"><span class="big">Quem gastou mais este mês</span><span class="cap">${fmtKWh(D.sumMon)} medidos${miss > 0 ? ` · ${miss === 1 ? '1 equipamento' : miss + ' equipamentos'} sem contador mensal` : ''}${c.month_note ? ' · ' + esc(c.month_note) : ''}</span></div><div class="rows">${this._rows(D.mon, null, fmtKWh)}</div></div>`;
    } else if (this._period === 'hoje' && D.day.length) {
      const rest = D.houseToday != null ? D.houseToday - D.sumDay : null, miss = D.now.length - D.day.length;
      body = `<div class="panel"><div class="fhd"><span class="big">Quem gastou mais hoje</span><span class="cap">${fmtKWh(D.sumDay)} medidos${D.houseToday != null ? ' de ' + fmtKWh(D.houseToday) : ''}${miss > 0 ? ` · ${miss === 1 ? '1 equipamento' : miss + ' equipamentos'} sem contador diário` : ''}</span></div><div class="rows">${this._rows(D.day, rest, fmtKWh)}</div></div>`;
    } else {
      const rest = D.house != null ? D.house - D.sumNow : null;
      body = `<div class="panel"><div class="fhd"><span class="big">Quem está a gastar agora</span><span class="cap">${fmtW(D.sumNow)} medidos${D.house != null ? ' de ' + fmtKW(D.house) : ''}${c.note ? ' · ' + esc(c.note) : ''}</span></div><div class="rows">${this._rows(D.now, rest, fmtW)}</div></div>`;
    }
    return `<div class="top"><span class="sum">${esc(sum)}</span>${seg}</div><div class="heads">${hd}</div>${body}`;
  }
  async _embed() {
    if (this._card || this._loading || !this._c.today_card || !window.loadCardHelpers) return;
    this._loading = true;
    try {
      const helpers = await window.loadCardHelpers();
      this._card = helpers.createCardElement(this._c.today_card);
      this._card.hass = this._hass;
      const box = this.shadowRoot.querySelector('#embed'); if (box) box.appendChild(this._card);
    } catch (e) { this._card = null; }
    this._loading = false;
  }
  _render() {
    if (!this._hass || !this._c) return;
    let main = this.shadowRoot.querySelector('#main');
    if (!main) {
      this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div id="main"></div><div id="embed" hidden></div></ha-card>`;
      main = this.shadowRoot.querySelector('#main');
    }
    main.innerHTML = this._html();
    const show = this._period === 'hoje' && !!this._c.today_card;
    const eh = this.shadowRoot.querySelector('#eh'), em = this.shadowRoot.querySelector('#embed');
    if (eh) eh.hidden = !show; if (em) em.hidden = !show;
    if (show) this._embed();
  }
}
const prev = customElements.get('casa-energy-card');
if (!prev) customElements.define('casa-energy-card', CasaEnergyCard);
else if (prev !== CasaEnergyCard) Object.getOwnPropertyNames(CasaEnergyCard.prototype).forEach((k) => { if (k !== 'constructor') Object.defineProperty(prev.prototype, k, Object.getOwnPropertyDescriptor(CasaEnergyCard.prototype, k)); });
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'casa-energy-card')) window.customCards.push({ type: 'casa-energy-card', name: 'Casa · Energia', description: 'Solar, rede e consumo por equipamento' });
})();

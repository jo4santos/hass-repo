/* casa-climate-card v0.2.0 — termóstatos por piso, piscina (atalho), exterior e previsão horária */
(() => {
const CSS = `
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
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.nm{font-size:14px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:12px;line-height:1.3;color:var(--secondary-text-color)}
.val{font-size:28px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
.cap{font-size:13px;line-height:1.35;color:var(--secondary-text-color)}
.chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--card-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
.step{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
ha-icon{--mdc-icon-size:22px}
.rooms{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.hd{display:flex;align-items:center;gap:10px;min-height:44px;min-width:0;width:100%}
.hd .tx{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.heat .ic{background:#f5a97f;color:#181926}
.heat .hd .st{color:#f5a97f}
.hum{flex:none;display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 8px;border-radius:999px;background:var(--card-background-color);color:var(--secondary-text-color);font-size:12px;font-weight:500}
.hum ha-icon{--mdc-icon-size:13px}
.now{display:flex;align-items:baseline;gap:10px;min-width:0}
.now .cap{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now .hum{margin-left:auto;align-self:center}
.stepper{margin-top:auto;display:flex;align-items:center;justify-content:space-between;padding:4px;border-radius:999px;background:var(--primary-background-color)}
.stepper.dim .tg{opacity:.45}
.tg{display:flex;flex-direction:column;align-items:center;gap:1px}
.tg b{font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
.row2{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch}
.pool{flex:1 1 320px}.ext{flex:2 1 480px;flex-direction:row;flex-wrap:wrap;align-items:center;gap:20px}
.phd{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.phd .hd{width:auto;flex:1 1 180px}
.big{font-size:16px;font-weight:600}
.warn{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:rgba(237,135,150,.12);color:#ed8796;font-size:14px}
.onow{display:flex;align-items:center;gap:14px;flex:1 1 200px;min-height:44px}
.onow ha-icon{--mdc-icon-size:40px;color:var(--secondary-text-color)}
.onow .tx{display:flex;flex-direction:column;gap:3px}
.stats{flex:2 1 300px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.stat{padding:10px 12px;border-radius:12px;background:var(--card-background-color);display:flex;flex-direction:column;gap:3px;min-width:0}
.stat b{font-size:15px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fhd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.scroll{overflow-x:auto}
.fcs{min-width:1040px;display:flex;flex-direction:column;gap:4px}
.g{display:grid}
.g .t{text-align:center;font-size:13px;font-weight:500;font-variant-numeric:tabular-nums}
.fcs svg{width:100%;height:110px;display:block}
.g.b{padding-top:8px;border-top:1px solid var(--divider-color)}
.hr{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums}
.hr ha-icon{--mdc-icon-size:18px}
.sun{color:#eed49f}.rain{color:#8aadf4}
`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const deg = (n) => n == null ? '–' : n.toFixed(1).replace('.', ',') + '°';
const BAD = (s) => !s || s.state === 'unavailable' || s.state === 'unknown';
const WIC = { 'sunny': 'mdi:weather-sunny', 'clear-night': 'mdi:weather-night', 'partlycloudy': 'mdi:weather-partly-cloudy', 'cloudy': 'mdi:weather-cloudy', 'fog': 'mdi:weather-fog', 'rainy': 'mdi:weather-rainy', 'pouring': 'mdi:weather-pouring', 'lightning': 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy', 'snowy': 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', 'hail': 'mdi:weather-hail', 'windy': 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant', 'exceptional': 'mdi:alert-circle-outline' };
const RAIN = ['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'hail'];
const CARD = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

class CasaClimateCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._pend = {}; this._fc = null; this._fcv = 0; this._sig = ''; }
  setConfig(c) {
    if (!c || !Array.isArray(c.floors)) throw new Error('casa-climate-card: falta "floors"');
    this._c = c; this._sig = '';
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { this._bind(); this._sub(); }
  disconnectedCallback() { if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; } }
  set hass(h) {
    this._hass = h; if (!this._c) return; this._sub();
    const ids = [];
    this._c.floors.forEach((f) => (f.rooms || []).forEach((r) => ids.push(r.entity)));
    const p = this._c.pool || {};
    [p.entity, p.pump, this._c.weather, this._c.sun].forEach((e) => e && ids.push(e));
    const sig = ids.map((e) => { const s = h.states[e]; return s ? s.state + '|' + s.last_updated : '-'; }).join(';') + '#' + this._fcv + '#' + JSON.stringify(Object.keys(this._pend).map((k) => this._pend[k].v));
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  _sub() {
    const h = this._hass, w = this._c && this._c.weather;
    if (this._unsub || !h || !w || !h.connection || !this.isConnected) return;
    try {
      this._unsub = h.connection.subscribeMessage((m) => { this._fc = (m && m.forecast) || []; this._fcv++; this._sig = ''; if (this._hass) this.hass = this._hass; },
        { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: w });
      this._unsub.catch(() => { this._unsub = null; });
    } catch (e) { this._unsub = null; }
  }
  _bind() {
    if (this._bound) return; this._bound = true;
    this.shadowRoot.addEventListener('click', (ev) => {
      const b = ev.target.closest && ev.target.closest('[data-a]'); if (!b || b.disabled) return;
      const a = b.dataset.a, e = b.dataset.e;
      if (a === 'info') this._info(e);
      else if (a === 'nav') this._nav(b.dataset.p);
      else if (a === 'dec' || a === 'inc') this._step(e, a === 'inc' ? 1 : -1, parseFloat(b.dataset.s) || 0.5);
    });
  }
  _info(e) { this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } })); }
  _nav(p) { history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true, detail: { replace: false } })); }
  _target(e) { const p = this._pend[e]; if (p) return p.v; const s = this._hass.states[e]; return s ? num(s.attributes.temperature) : null; }
  _step(e, dir, step) {
    const s = this._hass.states[e]; if (BAD(s)) return;
    const cur = this._target(e); if (cur == null) return;
    const lo = num(s.attributes.min_temp), hi = num(s.attributes.max_temp);
    let v = Math.round((cur + dir * step) / step) * step; v = Math.round(v * 10) / 10;
    if (lo != null) v = Math.max(lo, v); if (hi != null) v = Math.min(hi, v);
    const old = this._pend[e]; if (old) { clearTimeout(old.t); clearTimeout(old.x); }
    const p = { v };
    p.t = setTimeout(() => {
      this._hass.callService('climate', 'set_temperature', { entity_id: e, temperature: v });
      p.x = setTimeout(() => { if (this._pend[e] === p) { delete this._pend[e]; this._sig = ''; this.hass = this._hass; } }, 5000);
    }, 700);
    this._pend[e] = p; this._sig = ''; this.hass = this._hass;
  }
  _time(d) { try { return new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: this._hass.config && this._hass.config.time_zone }); } catch (e) { return new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); } }
  _day(d) { try { return new Date(d).toLocaleDateString('en-CA', { timeZone: this._hass.config && this._hass.config.time_zone }); } catch (e) { return new Date(d).toISOString().slice(0, 10); } }
  _room(r) {
    const s = this._hass.states[r.entity];
    if (!s) return '';
    const bad = BAD(s), off = s.state === 'off';
    const cur = num(s.attributes.current_temperature), tgt = this._target(r.entity);
    const act = s.attributes.hvac_action;
    const heating = !bad && !off && cur != null && tgt != null && cur < tgt;
    const status = bad ? 'Sem ligação' : off ? 'Desligado' : heating ? 'A aquecer' : '';
    let ctx = '';
    if (bad || off) ctx = '';
    else if (cur != null && tgt != null) { const d = Math.round((tgt - cur) * 10) / 10; ctx = d > 0 ? deg(d) + ' abaixo' : d < 0 ? deg(-d) + ' acima' : 'no alvo'; }
    const hum = num(s.attributes.current_humidity);
    const step = r.step || 0.5, dis = bad || off ? ' disabled' : '';
    const e = esc(r.entity);
    return `<div class="panel${heating ? ' heat' : ''}">
<button class="hd" data-a="info" data-e="${e}" aria-label="${esc(r.name)}: detalhes"><span class="ic"><ha-icon icon="${off || bad ? 'mdi:power' : 'mdi:fire'}"></ha-icon></span><span class="tx"><span class="nm">${esc(r.name)}</span>${status ? `<span class="st">${status}</span>` : ''}</span></button>
<div class="now"><span class="val">${deg(cur)}</span><span class="cap">${ctx}</span>${hum != null ? `<span class="hum" title="Humidade"><ha-icon icon="mdi:water-outline"></ha-icon>${Math.round(hum)}%</span>` : ''}</div>
<div class="stepper${off || bad ? ' dim' : ''}">
<button class="step" data-a="dec" data-e="${e}" data-s="${step}" aria-label="Baixar temperatura"${dis}><ha-icon icon="mdi:minus"></ha-icon></button>
<span class="tg"><span class="st">Alvo</span><b>${deg(tgt)}</b></span>
<button class="step" data-a="inc" data-e="${e}" data-s="${step}" aria-label="Subir temperatura"${dis}><ha-icon icon="mdi:plus"></ha-icon></button>
</div></div>`;
  }
  _ago(iso) {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 60) return m <= 1 ? '1 minuto' : m + ' minutos';
    const h = Math.round(m / 60); if (h < 48) return h === 1 ? '1 hora' : h + ' horas';
    return Math.round(h / 24) + ' dias';
  }
  _pool() {
    const p = this._c.pool; if (!p || !p.entity) return '';
    const s = this._hass.states[p.entity]; if (!s) return '';
    const bad = BAD(s), off = s.state === 'off', act = s.attributes.hvac_action;
    const parts = [bad ? 'Sem ligação' : off ? 'Desligado' : act === 'heating' ? 'A aquecer' : 'Em espera'];
    const cur = num(s.attributes.current_temperature), tgt = num(s.attributes.temperature);
    if (cur != null) parts.push('água ' + deg(cur)); if (tgt != null) parts.push('alvo ' + deg(tgt));
    const pump = p.pump && this._hass.states[p.pump];
    const warn = pump && BAD(pump) ? `<div class="warn"><ha-icon icon="mdi:alert-outline"></ha-icon><span>${esc(p.pump_name || 'Bomba de calor')} indisponível há ${this._ago(pump.last_changed)}</span></div>` : '';
    return `<div class="panel pool"><div class="phd">
<button class="hd" data-a="info" data-e="${esc(p.entity)}"><span class="ic"><ha-icon icon="mdi:pool"></ha-icon></span><span class="tx"><span class="big">${esc(p.name || 'Piscina')}</span><span class="cap">${parts.join(' · ')}</span></span></button>
${p.path ? `<button class="chip" data-a="nav" data-p="${esc(p.path)}">${esc(p.link || 'Abrir em Equipamentos')}<ha-icon icon="mdi:chevron-right" style="--mdc-icon-size:18px"></ha-icon></button>` : ''}
</div>${warn}</div>`;
  }
  _hours() {
    const n = (this._c.hours || 20) + 1, now = Date.now() - 3600000;
    return (this._fc || []).filter((f) => new Date(f.datetime).getTime() >= now && num(f.temperature) != null).slice(0, n);
  }
  _night(d) {
    const sun = this._c.sun && this._hass.states[this._c.sun]; if (!sun || !sun.attributes.next_rising) return false;
    const hm = (x) => { const t = this._time(x).split(':'); return (+t[0]) * 60 + (+t[1]); };
    const m = hm(d), r = hm(sun.attributes.next_rising), s = hm(sun.attributes.next_setting);
    return m < r || m >= s;
  }
  _wicon(cond, d) {
    if (cond === 'partlycloudy' && this._night(d)) return 'mdi:weather-night-partly-cloudy';
    if (cond === 'sunny' && this._night(d)) return 'mdi:weather-night';
    return WIC[cond] || 'mdi:weather-cloudy';
  }
  _ext(hs) {
    const w = this._c.weather && this._hass.states[this._c.weather]; if (!w) return '';
    const a = w.attributes, bad = BAD(w), t = num(a.temperature);
    const temps = hs.map((f) => num(f.temperature));
    const cond = bad ? 'Sem ligação' : (this._hass.formatEntityState ? this._hass.formatEntityState(w) : w.state);
    const st = [];
    if (num(a.humidity) != null) st.push(['Humidade', Math.round(a.humidity) + '%']);
    if (num(a.pressure) != null) st.push(['Pressão', Math.round(a.pressure) + ' ' + (a.pressure_unit || 'hPa')]);
    if (num(a.wind_speed) != null) st.push(['Vento', (num(a.wind_bearing) != null ? CARD[Math.round(a.wind_bearing / 45) % 8] + ' ' : '') + Math.round(a.wind_speed) + ' ' + (a.wind_speed_unit || 'km/h')]);
    const tom = this._day(Date.now() + 86400000), fr = (this._fc || []).filter((f) => this._day(f.datetime) === tom);
    if (fr.length >= 12) st.push(['Chuva amanhã', (Math.round(fr.reduce((x, f) => x + (num(f.precipitation) || 0), 0) * 10) / 10).toString().replace('.', ',') + ' ' + (a.precipitation_unit || 'mm')]);
    const sun = this._c.sun && this._hass.states[this._c.sun];
    if (sun && sun.attributes.next_rising) { st.push(['Nascer do sol', this._time(sun.attributes.next_rising)]); st.push(['Pôr do sol', this._time(sun.attributes.next_setting)]); }
    return `<div class="panel ext">
<button class="onow" data-a="info" data-e="${esc(this._c.weather)}"><ha-icon icon="${this._wicon(w.state, Date.now())}"></ha-icon><span class="tx"><span class="val">${deg(t)}</span><span class="nm">${esc(cond)}</span></span></button>
<div class="stats">${st.map((x) => `<div class="stat"><span class="st">${x[0]}</span><b>${esc(x[1])}</b></div>`).join('')}</div></div>`;
  }
  _forecast(hs) {
    if (hs.length < 3) return '';
    const n = hs.length, temps = hs.map((f) => num(f.temperature));
    const lo = Math.min(...temps), hi = Math.max(...temps), span = Math.max(1, hi - lo);
    const pts = temps.map((v, i) => [((i + 0.5) * 1000 / n).toFixed(1), (100 - (v - lo) / span * 85).toFixed(1)]);
    const line = 'M' + pts.map((p) => p.join(' ')).join(' L');
    const area = line + ' L' + pts[n - 1][0] + ' 110 L' + pts[0][0] + ' 110 Z';
    const iLo = temps.indexOf(lo), iHi = temps.indexOf(hi), rain = hs.find((f) => RAIN.includes(f.condition));
    const sub = `Mín. ${deg(lo)} às ${this._time(hs[iLo].datetime)} · máx. ${deg(hi)} às ${this._time(hs[iHi].datetime)} · ${rain ? 'chuva a partir das ' + this._time(rain.datetime) : 'sem chuva prevista'}`;
    const cols = `grid-template-columns:repeat(${n},minmax(0,1fr))`;
    return `<div class="panel"><div class="fhd"><span class="big">Próximas ${n - 1} horas</span><span class="cap">${sub}</span></div>
<div class="scroll"><div class="fcs">
<div class="g" style="${cols}">${temps.map((v) => `<span class="t">${deg(v)}</span>`).join('')}</div>
<svg viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><path d="${area}" fill="rgba(238,212,159,.10)"/><path d="${line}" fill="none" stroke="#eed49f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
<div class="g b" style="${cols}">${hs.map((f) => { const ic = this._wicon(f.condition, f.datetime); const cl = RAIN.includes(f.condition) ? 'rain' : ic === 'mdi:weather-sunny' || ic === 'mdi:weather-partly-cloudy' ? 'sun' : ''; return `<div class="hr"><span>${this._time(f.datetime)}</span><ha-icon class="${cl}" icon="${ic}"></ha-icon><span>${num(f.wind_speed) != null ? Math.round(f.wind_speed) + ' km/h' : ''}</span></div>`; }).join('')}</div>
</div></div></div>`;
  }
  _summary() {
    let heat = 0; const curs = [];
    this._c.floors.forEach((f) => (f.rooms || []).forEach((r) => {
      const s = this._hass.states[r.entity]; if (BAD(s)) return;
      const cur = num(s.attributes.current_temperature), tgt = this._target(r.entity), act = s.attributes.hvac_action;
      if (s.state !== 'off') { if (cur != null) curs.push(cur); if (cur != null && tgt != null && cur < tgt) heat++; }
    }));
    const w = this._c.weather && this._hass.states[this._c.weather], out = w ? num(w.attributes.temperature) : null;
    let t = heat === 0 ? 'Nenhuma divisão a aquecer' : heat === 1 ? '1 divisão a aquecer' : heat + ' divisões a aquecer';
    if (curs.length) t += ` · ${this._span(curs)} em casa`;
    if (out != null) t += ` · ${deg(out)} lá fora`;
    return t;
  }
  _span(a) { const lo = Math.min(...a), hi = Math.max(...a); return lo === hi ? deg(lo) : deg(lo).replace('°', '') + '–' + deg(hi); }
  _div(name, sum) { return `<div class="floor"><span class="fn">${esc(name)}</span><span class="fc">${esc(sum)}</span><span class="fl"></span></div>`; }
  _floorSum(f) {
    let heat = 0; const curs = [];
    (f.rooms || []).forEach((r) => {
      const s = this._hass.states[r.entity]; if (BAD(s) || s.state === 'off') return;
      const cur = num(s.attributes.current_temperature), tgt = this._target(r.entity);
      if (cur != null) curs.push(cur); if (cur != null && tgt != null && cur < tgt) heat++;
    });
    return [heat ? heat + ' a aquecer' : 'nada a aquecer', curs.length ? this._span(curs) : ''].filter(Boolean).join(' · ');
  }
  _html() {
    const hs = this._hours();
    const floors = this._c.floors.map((f) => { const rooms = (f.rooms || []).map((r) => this._room(r)).join(''); return rooms ? this._div(f.name, this._floorSum(f)) + `<div class="rooms">${rooms}</div>` : ''; }).join('');
    const ps = this._c.pool && this._hass.states[this._c.pool.entity], pw = ps ? num(ps.attributes.current_temperature) : null;
    const ws = this._c.weather && this._hass.states[this._c.weather], wt = ws ? num(ws.attributes.temperature) : null;
    const outSum = [pw != null ? 'água ' + deg(pw) : '', wt != null ? deg(wt) + ' lá fora' : ''].filter(Boolean).join(' · ');
    const pool = this._pool(), ext = this._ext(hs);
    return `<style>${CSS}</style><ha-card><div class="top"><span class="sum">${esc(this._summary())}</span></div>${floors}${pool || ext ? this._div(pool && ext ? 'Piscina e exterior' : pool ? 'Piscina' : 'Exterior', outSum) + `<div class="row2">${pool}${ext}</div>` : ''}${this._forecast(hs)}</ha-card>`;
  }
  _render() {
    if (!this._hass || !this._c) return;
    const sc = this.shadowRoot.querySelector('.scroll'), x = sc ? sc.scrollLeft : 0;
    this.shadowRoot.innerHTML = this._html();
    if (x) { const n = this.shadowRoot.querySelector('.scroll'); if (n) n.scrollLeft = x; }
  }
}
const prev = customElements.get('casa-climate-card');
if (!prev) customElements.define('casa-climate-card', CasaClimateCard);
else if (prev !== CasaClimateCard) Object.getOwnPropertyNames(CasaClimateCard.prototype).forEach((k) => { if (k !== 'constructor') Object.defineProperty(prev.prototype, k, Object.getOwnPropertyDescriptor(CasaClimateCard.prototype, k)); });
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'casa-climate-card')) window.customCards.push({ type: 'casa-climate-card', name: 'Casa · Clima', description: 'Termóstatos por piso, piscina, exterior e previsão horária' });
})();

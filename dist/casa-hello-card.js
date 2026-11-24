/* casa-hello-card v0.2.0 — cabeçalho do painel das crianças: saudação que muda ao longo do dia, data, relógio grande e o tempo em desenho
   (sol com raios, lua e estrelas, nuvens a passar, chuva a cair) com as próximas horas.
   Configuração: weather (weather.*), min / max (sensores da mínima e máxima de hoje, opcionais), names (texto antes da data, opcional), hours (próximas horas a mostrar, 4; 0 = nenhuma). */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WX = { 'clear-night': 'mdi:weather-night', cloudy: 'mdi:weather-cloudy', fog: 'mdi:weather-fog', hail: 'mdi:weather-hail', lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy', partlycloudy: 'mdi:weather-partly-cloudy', pouring: 'mdi:weather-pouring', rainy: 'mdi:weather-rainy', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', sunny: 'mdi:weather-sunny', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant' };
const RAIN = ['rainy', 'pouring', 'lightning-rainy', 'hail', 'snowy-rainy', 'lightning'], CLOUD = ['cloudy', 'fog', 'partlycloudy', 'windy', 'windy-variant'], SNOW = ['snowy'];
const PER = [{ from: 6, k: 'm', hi: 'Bom dia!' }, { from: 12, k: 'd', hi: 'Boa tarde!' }, { from: 19, k: 'e', hi: 'Boa noite!' }, { from: 22, k: 'n', hi: 'Boa noite!' }];
const CLOUD_P = 'M28 70a16 16 0 0 1 2-32 22 22 0 0 1 42-4 17 17 0 0 1 2 36z';
const art = (night, kind, part) => {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="50" y1="8" x2="50" y2="18" transform="rotate(${a} 50 50)"/>`).join('');
  const sun = `<g class="rays" stroke="#fff" stroke-width="5" stroke-linecap="round">${rays}</g><circle cx="50" cy="50" r="21" fill="#fff"/>`;
  const moon = `<path d="M62 20a32 32 0 1 0 20 46 26 26 0 0 1-20-46z" fill="#fff"/><g fill="#fff"><circle class="tw" cx="80" cy="24" r="3"/><circle class="tw t2" cx="90" cy="46" r="2"/><circle class="tw t3" cx="70" cy="40" r="2"/></g>`;
  const body = night ? moon : sun;
  const cloud = `<path class="cl" d="${CLOUD_P}" fill="#fff"/>`;
  const drops = `<g stroke="#fff" stroke-width="5" stroke-linecap="round"><line class="dr" x1="34" y1="78" x2="30" y2="90"/><line class="dr d2" x1="52" y1="78" x2="48" y2="90"/><line class="dr d3" x1="70" y1="78" x2="66" y2="90"/></g>`;
  const flakes = `<g fill="#fff"><circle class="dr" cx="32" cy="82" r="3.5"/><circle class="dr d2" cx="50" cy="82" r="3.5"/><circle class="dr d3" cx="68" cy="82" r="3.5"/></g>`;
  let inner = body;
  if (kind === 'rain') inner = `<g transform="translate(0 -10)">${cloud}</g>${drops}`;
  else if (kind === 'snow') inner = `<g transform="translate(0 -10)">${cloud}</g>${flakes}`;
  else if (kind === 'cloud') inner = part ? `<g transform="translate(14 -12) scale(.72)">${body}</g><g transform="translate(-4 8) scale(.92)">${cloud}</g>` : cloud;
  return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
};
class CasaHelloCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._fc = []; }
  setConfig(c) { this._c = Object.assign({ hours: 4 }, c || {}); this._sig = ''; if (this._h) this._render(); }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  set hass(h) { this._h = h; this._sub(); this._render(); }
  connectedCallback() { if (!this._t) this._t = setInterval(() => this._render(), 10000); this._sub(); this._render(); }
  disconnectedCallback() { clearInterval(this._t); this._t = null; if (this._unsub) { const p = this._unsub; this._unsub = null; Promise.resolve(p).then((u) => { if (typeof u === 'function') u(); }).catch(() => {}); } }
  _sub() {
    const h = this._h, c = this._c; if (!h || !c || !c.weather || !Number(c.hours) || this._unsub || !h.connection || !this.isConnected) return;
    this._unsub = h.connection.subscribeMessage((m) => { this._fc = (m && m.forecast) || []; this._fv = (this._fv || 0) + 1; this._render(); }, { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: c.weather });
    Promise.resolve(this._unsub).catch(() => { this._unsub = null; });
  }
  _num(id) { const s = id && this._h.states[id]; const n = s ? Number(s.state) : NaN; return isNaN(n) ? null : Math.round(n); }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const d = new Date(), hr = d.getHours();
    let p = PER[3]; if (hr >= 6) for (const x of PER) if (hr >= x.from) p = x;
    const clock = String(hr).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const date = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    const w = c.weather && h.states[c.weather], ok = !!w && w.state !== 'unavailable' && w.state !== 'unknown';
    const sun = h.states['sun.sun'], night = sun ? sun.state === 'below_horizon' : (hr < 7 || hr >= 20);
    const st = ok ? w.state : (night ? 'clear-night' : 'sunny');
    const kind = RAIN.indexOf(st) >= 0 ? 'rain' : SNOW.indexOf(st) >= 0 ? 'snow' : CLOUD.indexOf(st) >= 0 ? 'cloud' : 'clear';
    const t = ok && w.attributes.temperature != null ? Math.round(Number(w.attributes.temperature)) + '°' : '';
    const cond = ok ? (h.formatEntityState ? h.formatEntityState(w) : w.state) : '';
    const lo = this._num(c.min), hi = this._num(c.max);
    const hrs = []; for (const f of this._fc) { if (hrs.length >= Number(c.hours)) break; const fd = new Date(f.datetime); if (fd <= d) continue; hrs.push({ t: String(fd.getHours()).padStart(2, '0') + 'h', i: WX[f.condition] || 'mdi:weather-cloudy', v: f.temperature == null ? '' : Math.round(Number(f.temperature)) + '°' }); }
    const sig = [p.k, clock, date, st, night ? 1 : 0, t, cond, lo, hi, this._fv || 0].join('|'); if (sig === this._sig) return; this._sig = sig;
    const sky = (kind === 'cloud' || kind === 'rain' || kind === 'snow' ? '<i class="c c1"></i><i class="c c2"></i><i class="c c3"></i>' : '')
      + (kind === 'rain' ? Array.from({ length: 14 }, (x, i) => `<i class="d" style="left:${4 + i * 7}%;animation-delay:-${(i * 0.37) % 1.6}s"></i>`).join('') : '')
      + (p.k === 'n' ? Array.from({ length: 16 }, (x, i) => `<i class="s" style="left:${(i * 53) % 97}%;top:${(i * 37) % 80 + 6}%;animation-delay:-${(i * 0.7) % 3}s"></i>`).join('') : '');
    this.shadowRoot.innerHTML = `<style>
:host{display:block}
.b{position:relative;overflow:hidden;display:flex;align-items:center;gap:22px;padding:18px 28px;border-radius:28px;color:#181926;container-type:inline-size;min-height:132px;box-sizing:border-box}
.b>*{position:relative;z-index:1}
.b.m{background:linear-gradient(120deg,#f5a97f,#eed49f)}
.b.d{background:linear-gradient(120deg,#8aadf4,#91d7e3)}
.b.e{background:linear-gradient(120deg,#c6a0f6,#f5bde6)}
.b.n{background:linear-gradient(120deg,#363a4f,#5b6078);color:#cad3f5}
.sky{position:absolute;inset:0;z-index:0;pointer-events:none}
.c{position:absolute;width:220px;height:70px;border-radius:999px;background:rgba(255,255,255,.28);filter:blur(2px);animation:drift 60s linear infinite}
.c::before{content:"";position:absolute;left:44px;top:-34px;width:110px;height:90px;border-radius:50%;background:inherit}
.n .c{background:rgba(255,255,255,.1)}
.c1{top:14%;left:-20%}.c2{top:52%;left:-20%;animation-duration:85s;animation-delay:-30s;transform:scale(.7)}.c3{top:26%;left:-20%;animation-duration:110s;animation-delay:-70s;transform:scale(1.2)}
.d{position:absolute;top:-12%;width:3px;height:18px;border-radius:3px;background:rgba(255,255,255,.55);animation:fall 1.6s linear infinite}
.s{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;animation:tw 3s ease-in-out infinite}
.art{flex:none;width:104px;height:104px;overflow:visible;filter:drop-shadow(0 4px 10px rgba(24,25,38,.18))}
.rays{transform-origin:50px 50px;animation:spin 24s linear infinite}
.cl{animation:bob 5s ease-in-out infinite}
.dr{animation:drip 1.2s linear infinite}.d2{animation-delay:-.4s}.d3{animation-delay:-.8s}
.tw{animation:tw 2.4s ease-in-out infinite}.t2{animation-delay:-.8s}.t3{animation-delay:-1.6s}
.tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hi{font-size:42px;line-height:1.05;font-weight:800;letter-spacing:-.02em}
.dt{font-size:18px;font-weight:600;opacity:.8}
.dt::first-letter{text-transform:uppercase}
.wx{flex:none;display:flex;align-items:center;gap:18px;padding:10px 20px;border-radius:24px;background:rgba(255,255,255,.35)}
.n .wx{background:rgba(255,255,255,.12)}
.now{display:flex;flex-direction:column;line-height:1.1}
.now b{font-size:38px;font-weight:800;letter-spacing:-.02em}
.now span{font-size:14px;font-weight:700;opacity:.8;white-space:nowrap}
.hs{display:flex;gap:14px;padding-left:18px;border-left:2px solid rgba(24,25,38,.14)}
.n .hs{border-color:rgba(255,255,255,.18)}
.h{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:14px;font-weight:700}
.h ha-icon{--mdc-icon-size:26px}
.h b{font-size:16px}
.ck{flex:none;font-size:104px;line-height:.9;font-weight:800;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bob{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
@keyframes drip{0%{transform:translateY(-6px);opacity:0}30%{opacity:1}100%{transform:translateY(10px);opacity:0}}
@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes drift{to{transform:translateX(160cqi)}}
@keyframes fall{to{transform:translate(-30px,200px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
@container (max-width:1100px){.hs{display:none}}
@container (max-width:820px){.wx{display:none}.ck{font-size:80px}}
@container (max-width:520px){.art{display:none}.hi{font-size:28px}.dt{font-size:15px}.ck{font-size:60px}.b{padding:16px 18px;gap:12px;min-height:0}}
</style><div class="b ${p.k}"><div class="sky">${sky}</div>${art(night, kind, st === 'partlycloudy')}<div class="tx"><span class="hi">${esc(p.hi)}</span><span class="dt">${esc(c.names ? c.names + ' · ' + date : date)}</span></div>${ok ? `<div class="wx"><div class="now"><b>${esc(t)}</b><span>${esc(lo != null && hi != null ? lo + '° – ' + hi + '°' : cond)}</span></div>${hrs.length ? `<div class="hs">${hrs.map((x) => `<div class="h"><span>${x.t}</span><ha-icon icon="${x.i}"></ha-icon><b>${esc(x.v)}</b></div>`).join('')}</div>` : ''}</div>` : ''}<span class="ck">${clock}</span></div>`;
  }
}
if (!customElements.get('casa-hello-card')) customElements.define('casa-hello-card', CasaHelloCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-hello-card', name: 'Casa · Olá', description: 'Cabeçalho do painel das crianças: saudação, data, tempo em desenho e relógio grande.' });
})();

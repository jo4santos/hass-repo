/* casa-hello-card v0.1.0 — cabeçalho do painel das crianças: saudação que muda ao longo do dia, data, tempo agora e relógio grande.
   Configuração: weather (weather.*), min / max (sensores da mínima e máxima de hoje, opcionais), names (texto por baixo da saudação, opcional). */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WX = { 'clear-night': 'mdi:weather-night', cloudy: 'mdi:weather-cloudy', fog: 'mdi:weather-fog', hail: 'mdi:weather-hail', lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy', partlycloudy: 'mdi:weather-partly-cloudy', pouring: 'mdi:weather-pouring', rainy: 'mdi:weather-rainy', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', sunny: 'mdi:weather-sunny', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant' };
const PER = [
  { from: 6, k: 'm', hi: 'Bom dia!', icon: 'mdi:weather-sunset-up' },
  { from: 12, k: 'd', hi: 'Boa tarde!', icon: 'mdi:white-balance-sunny' },
  { from: 19, k: 'e', hi: 'Boa noite!', icon: 'mdi:weather-sunset-down' },
  { from: 22, k: 'n', hi: 'Boa noite!', icon: 'mdi:weather-night' },
];
class CasaHelloCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(c) { this._c = c || {}; this._sig = ''; if (this._h) this._render(); }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  set hass(h) { this._h = h; this._render(); }
  connectedCallback() { if (!this._t) this._t = setInterval(() => this._render(), 10000); this._render(); }
  disconnectedCallback() { clearInterval(this._t); this._t = null; }
  _num(id) { const s = id && this._h.states[id]; const n = s ? Number(s.state) : NaN; return isNaN(n) ? null : Math.round(n); }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const d = new Date(), hr = d.getHours();
    let p = PER[3]; for (const x of PER) if (hr >= x.from) p = x; if (hr < 6) p = PER[3];
    const clock = String(hr).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const date = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    const w = c.weather && h.states[c.weather], ok = w && w.state !== 'unavailable' && w.state !== 'unknown';
    const t = ok && w.attributes.temperature != null ? Math.round(Number(w.attributes.temperature)) + '°' : '';
    const cond = ok ? (h.formatEntityState ? h.formatEntityState(w) : w.state) : '';
    const lo = this._num(c.min), hi = this._num(c.max);
    const sig = [p.k, clock, date, t, cond, lo, hi].join('|'); if (sig === this._sig) return; this._sig = sig;
    this.shadowRoot.innerHTML = `<style>
:host{display:block}
.b{display:flex;align-items:center;gap:20px;padding:20px 28px;border-radius:28px;color:#181926;container-type:inline-size;min-height:120px;box-sizing:border-box}
.b.m{background:linear-gradient(120deg,#f5a97f,#eed49f)}
.b.d{background:linear-gradient(120deg,#8aadf4,#91d7e3)}
.b.e{background:linear-gradient(120deg,#c6a0f6,#f5bde6)}
.b.n{background:linear-gradient(120deg,#363a4f,#5b6078);color:#cad3f5}
.sun{flex:none;width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.35)}
.n .sun{background:rgba(255,255,255,.12)}
.sun ha-icon{--mdc-icon-size:44px}
.tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hi{font-size:40px;line-height:1.05;font-weight:800;letter-spacing:-.02em}
.dt{font-size:18px;font-weight:600;opacity:.8}
.dt::first-letter{text-transform:uppercase}
.wx{flex:none;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 12px;border-radius:999px;background:rgba(255,255,255,.35)}
.n .wx{background:rgba(255,255,255,.12)}
.wx ha-icon{--mdc-icon-size:36px}
.wt{display:flex;flex-direction:column;line-height:1.15}
.wt b{font-size:26px;font-weight:800}
.wt span{font-size:14px;font-weight:600;opacity:.8}
.ck{flex:none;font-size:104px;line-height:.9;font-weight:800;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
@container (max-width:820px){.wx{display:none}.ck{font-size:80px}}
@container (max-width:520px){.sun{display:none}.hi{font-size:28px}.dt{font-size:15px}.ck{font-size:60px}.b{padding:16px 18px;gap:12px}}
</style><div class="b ${p.k}"><span class="sun"><ha-icon icon="${p.icon}"></ha-icon></span><div class="tx"><span class="hi">${esc(p.hi)}</span><span class="dt">${esc(c.names ? c.names + ' · ' + date : date)}</span></div>${ok ? `<div class="wx"><ha-icon icon="${WX[w.state] || 'mdi:weather-cloudy'}"></ha-icon><div class="wt"><b>${esc(t)}</b><span>${esc(lo != null && hi != null ? lo + '° – ' + hi + '°' : cond)}</span></div></div>` : ''}<span class="ck">${clock}</span></div>`;
  }
}
if (!customElements.get('casa-hello-card')) customElements.define('casa-hello-card', CasaHelloCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-hello-card', name: 'Casa · Olá', description: 'Cabeçalho do painel das crianças: saudação, data, tempo e relógio grande.' });
})();

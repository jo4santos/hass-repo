/* casa-hello-card v0.3.1 — cabeçalho do painel das crianças, feito para quem ainda não lê números: saudação, data e relógio grande, e o tempo em desenhos:
   «vai chover?» (guarda-chuva), «frio ou calor?» (o que vestir) e o dia em três partes (manhã, tarde, noite). Depois das 19h fala de amanhã.
   Configuração: weather (weather.*); names (texto antes da data); link = { icon, name, path } botão para outra página (opcional);
   cold / cool / hot = limites em °C da máxima (12 / 18 / 25). */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const RAIN = ['rainy', 'pouring', 'lightning-rainy', 'hail', 'snowy-rainy', 'lightning'], CLOUD = ['cloudy', 'fog', 'partlycloudy', 'windy', 'windy-variant'];
const RANK = { pouring: 9, 'lightning-rainy': 9, lightning: 8, hail: 8, rainy: 7, 'snowy-rainy': 7, snowy: 6, fog: 4, cloudy: 3, windy: 3, 'windy-variant': 3, partlycloudy: 2, sunny: 1, 'clear-night': 1 };
const EMO = { pouring: '🌧️', 'lightning-rainy': '⛈️', lightning: '⛈️', hail: '🌧️', rainy: '🌧️', 'snowy-rainy': '🌧️', snowy: '❄️', fog: '🌫️', cloudy: '☁️', windy: '💨', 'windy-variant': '💨', partlycloudy: '⛅', sunny: '☀️', 'clear-night': '🌙' };
const PER = [{ from: 6, k: 'm', hi: 'Bom dia!' }, { from: 12, k: 'd', hi: 'Boa tarde!' }, { from: 19, k: 'e', hi: 'Boa noite!' }, { from: 22, k: 'n', hi: 'Boa noite!' }];
const PARTS = [{ n: 'Manhã', a: 7, b: 13 }, { n: 'Tarde', a: 13, b: 19 }, { n: 'Noite', a: 19, b: 24, night: true }];
class CasaHelloCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._fc = { hourly: [], daily: [] }; this._unsub = {}; }
  setConfig(c) { this._c = Object.assign({ cold: 12, cool: 18, hot: 25 }, c || {}); this._sig = ''; if (this._h) this._render(); }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  set hass(h) { this._h = h; this._sub(); this._render(); }
  connectedCallback() { if (!this._t) this._t = setInterval(() => this._render(), 10000); this._sub(); this._render(); }
  disconnectedCallback() { clearInterval(this._t); this._t = null; for (const k of Object.keys(this._unsub)) { const p = this._unsub[k]; delete this._unsub[k]; Promise.resolve(p).then((u) => { if (typeof u === 'function') u(); }).catch(() => {}); } }
  _sub() {
    const h = this._h, c = this._c; if (!h || !c || !c.weather || !h.connection || !this.isConnected) return;
    for (const t of ['hourly', 'daily']) {
      if (this._unsub[t]) continue;
      this._unsub[t] = h.connection.subscribeMessage((m) => { this._fc[t] = (m && m.forecast) || []; this._fv = (this._fv || 0) + 1; this._render(); }, { type: 'weather/subscribe_forecast', forecast_type: t, entity_id: c.weather });
      Promise.resolve(this._unsub[t]).catch(() => { delete this._unsub[t]; });
    }
  }
  _go(path) { history.pushState(null, '', path); window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true })); }
  _wet(f) { return RAIN.indexOf(f.condition) >= 0 || Number(f.precipitation_probability) >= 50 || Number(f.precipitation) >= 0.5; }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const d = new Date(), hr = d.getHours();
    let p = PER[3]; if (hr >= 6) for (const x of PER) if (hr >= x.from) p = x;
    const clock = String(hr).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const date = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    const w = c.weather && h.states[c.weather], ok = !!w && w.state !== 'unavailable' && w.state !== 'unknown';
    const st = ok ? w.state : '';
    const kind = RAIN.indexOf(st) >= 0 ? 'rain' : CLOUD.indexOf(st) >= 0 ? 'cloud' : 'clear';
    /* o dia de que se fala: hoje até às 19h, amanhã a partir daí */
    const tom = hr >= 19, day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (tom ? 1 : 0));
    const same = (x) => x.getFullYear() === day.getFullYear() && x.getMonth() === day.getMonth() && x.getDate() === day.getDate();
    const hs = this._fc.hourly.map((f) => ({ f, t: new Date(f.datetime) })).filter((x) => same(x.t) && x.t.getTime() > d.getTime() - 3600000);
    const parts = [];
    for (const P of PARTS) {
      const xs = hs.filter((x) => x.t.getHours() >= P.a && x.t.getHours() < P.b); if (!xs.length) continue;
      let worst = xs[0].f.condition, sum = 0, n = 0, wet = false;
      for (const x of xs) { if ((RANK[x.f.condition] || 0) > (RANK[worst] || 0)) worst = x.f.condition; if (x.f.temperature != null) { sum += Number(x.f.temperature); n++; } if (this._wet(x.f)) wet = true; }
      if (wet && (RANK[worst] || 0) < 7) worst = 'rainy';
      if (P.night && worst === 'sunny') worst = 'clear-night';
      if (!P.night && worst === 'clear-night') worst = 'sunny';
      parts.push({ n: P.n, e: EMO[worst] || '☁️', t: n ? Math.round(sum / n) + '°' : '', wet });
    }
    const dayf = this._fc.daily.find((f) => same(new Date(f.datetime)));
    const win = hs.filter((x) => x.t.getHours() >= 7 && x.t.getHours() < 21);
    let rain = null, max = null;
    if (win.length) { rain = win.some((x) => this._wet(x.f)); max = Math.max.apply(null, win.map((x) => Number(x.f.temperature)).filter((v) => !isNaN(v))); if (!isFinite(max)) max = null; }
    else if (dayf) { rain = this._wet(dayf); max = dayf.temperature == null ? null : Number(dayf.temperature); }
    if (max == null && ok && !tom && w.attributes.temperature != null) max = Number(w.attributes.temperature);
    const fut = tom ? 'Vai' : (hr < 12 ? 'Vai' : 'Ainda vai');
    const rt = rain == null ? null : rain ? { e: '☔', a: fut + ' chover', b: 'Leva guarda-chuva', c: 'wet' } : { e: '🌂', a: 'Não chove', b: 'Sem guarda-chuva', c: '' };
    const tt = max == null ? null : max < c.cold ? { e: '🧣', a: 'Frio', b: 'Casaco quente' } : max < c.cool ? { e: '🧥', a: 'Fresco', b: 'Leva casaco' } : max < c.hot ? { e: '👕', a: 'Bom', b: 'Sem casaco' } : { e: '🩳', a: 'Calor', b: 'Roupa fresca' };
    const L = c.link && c.link.path ? c.link : null;
    const sig = [p.k, clock, date, st, this._fv || 0, tom ? 1 : 0, JSON.stringify(parts), rt && rt.a, tt && tt.a, max].join('|'); if (sig === this._sig) return; this._sig = sig;
    const sky = (kind !== 'clear' ? '<i class="c c1"></i><i class="c c2"></i><i class="c c3"></i>' : '')
      + (kind === 'rain' ? Array.from({ length: 14 }, (x, i) => `<i class="d" style="left:${4 + i * 7}%;animation-delay:-${(i * 0.37) % 1.6}s"></i>`).join('') : '')
      + (p.k === 'n' ? Array.from({ length: 16 }, (x, i) => `<i class="s" style="left:${(i * 53) % 97}%;top:${(i * 37) % 80 + 6}%;animation-delay:-${(i * 0.7) % 3}s"></i>`).join('') : '');
    const tile = (x, cls) => `<div class="tl ${cls || ''}"><span class="em">${x.e}</span><span class="ta"><b>${esc(x.a)}</b><span>${esc(x.b)}</span></span></div>`;
    const wx = rt || tt || parts.length ? `<div class="wx"><span class="cap">${tom ? 'Amanhã' : 'Hoje'}</span><div class="row">${rt ? tile(rt, rt.c) : ''}${tt ? tile(tt, '') : ''}${parts.length ? `<div class="ps">${parts.map((x) => `<div class="pt"><span>${x.n}</span><span class="pe">${x.e}</span><b>${esc(x.t)}</b></div>`).join('')}</div>` : ''}</div></div>` : '';
    this.shadowRoot.innerHTML = `<style>
:host{display:block}
.b{position:relative;overflow:hidden;display:flex;align-items:center;gap:20px;padding:14px 24px;border-radius:28px;color:#181926;container-type:inline-size;min-height:132px;box-sizing:border-box}
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
.tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hi{font-size:38px;line-height:1.05;font-weight:800;letter-spacing:-.02em;white-space:nowrap}
.dt{font-size:17px;font-weight:600;opacity:.8}
.dt::first-letter{text-transform:uppercase}
.wx{flex:none;display:flex;flex-direction:column;gap:4px}
.cap{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.7;padding-left:6px}
.row{display:flex;align-items:stretch;gap:10px}
.tl{display:flex;align-items:center;gap:10px;padding:8px 16px 8px 12px;border-radius:22px;background:rgba(255,255,255,.4)}
.n .tl,.n .ps{background:rgba(255,255,255,.12)}
.tl.wet{background:#fff;color:#181926;box-shadow:0 4px 14px rgba(24,25,38,.18)}
.em{font-size:46px;line-height:1;font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif}
.tl.wet .em{animation:bob 1.6s ease-in-out infinite}
.ta{display:flex;flex-direction:column;line-height:1.15;white-space:nowrap}
.ta b{font-size:22px;font-weight:800}
.ta span{font-size:14px;font-weight:700;opacity:.75}
.ps{display:flex;gap:16px;padding:8px 18px;border-radius:22px;background:rgba(255,255,255,.4)}
.pt{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:13px;font-weight:800;line-height:1.15}
.pe{font-size:28px;line-height:1.35;font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif}
.pt b{font-size:15px}
.lk{flex:none;width:64px;height:64px;border:0;border-radius:50%;background:rgba(255,255,255,.4);color:inherit;display:grid;place-items:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
.n .lk{background:rgba(255,255,255,.12)}
.lk ha-icon{--mdc-icon-size:30px}
.ck{flex:none;font-size:92px;line-height:.9;font-weight:800;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
@keyframes bob{0%,100%{transform:translateY(-2px) rotate(-6deg)}50%{transform:translateY(2px) rotate(6deg)}}
@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes drift{to{transform:translateX(160cqi)}}
@keyframes fall{to{transform:translate(-30px,200px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
@container (max-width:1240px){.ta span{display:none}.hi{font-size:32px}}
@container (max-width:1040px){.ps{display:none}}
@container (max-width:820px){.wx{display:none}.ck{font-size:76px}}
@container (max-width:520px){.hi{font-size:26px}.dt{font-size:15px}.ck{font-size:56px}.b{padding:14px 16px;gap:12px;min-height:0}.lk{width:52px;height:52px}}
</style><div class="b ${p.k}"><div class="sky">${sky}</div><div class="tx"><span class="hi">${esc(p.hi)}</span><span class="dt">${esc(c.names ? c.names + ' · ' + date : date)}</span></div>${wx}${L ? `<button class="lk" type="button" aria-label="${esc(L.name || 'Abrir')}"><ha-icon icon="${esc(L.icon || 'mdi:home-outline')}"></ha-icon></button>` : ''}<span class="ck">${clock}</span></div>`;
    const b = this.shadowRoot.querySelector('.lk'); if (b) b.addEventListener('click', () => this._go(L.path));
  }
}
if (!customElements.get('casa-hello-card')) customElements.define('casa-hello-card', CasaHelloCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-hello-card', name: 'Casa · Olá', description: 'Cabeçalho do painel das crianças: saudação, relógio grande e o tempo em desenhos (chuva, frio ou calor, manhã/tarde/noite).' });
})();

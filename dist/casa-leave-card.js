/* casa-leave-card v0.2.2 — o relógio «falta quanto para sair» do cartão Família, sozinho e baixo (mesmo bloco: usa o do casa-family-card).
   Configuração: leave = { time: '08:50', label: 'escola', warn, hurry, grace, days, from } (igual ao casa-family-card);
   button = { name, icon, service: 'dominio.servico', data } botão na mesma linha (opcional). Fora da janela mostra só a hora de saída. */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
class CasaLeaveCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(c) { if (!c || !c.leave || !c.leave.time) throw new Error('casa-leave-card: falta "leave.time"'); this._c = c; this._boot(); }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 'full', rows: 'auto', min_columns: 6 }; }
  set hass(h) { this._h = h; if (!this._done) this._boot(); }
  connectedCallback() { this._boot(); }
  disconnectedCallback() { if (this._L) this._L.stop(this); clearTimeout(this._bt); }
  _boot() {
    if (!this._c || !this.isConnected) return;
    if (!this._L) { if (!this._w) this._w = customElements.whenDefined('casa-family-card').then(() => { this._L = window.__casaLeave || null; this._boot(); }); return; }
    this._L.arm(this, () => this._tick()); this._render(); this._done = true;
  }
  _state() { return this._L.state(this._c.leave, this._c.leave.from); }
  _tick() { if (!this.isConnected) return false; if (this._L.sync(this.shadowRoot, this._state())) this._render(); }
  _press(btn) {
    const b = this._c.button, sv = String((b && b.service) || '').split('.'); if (!this._h || sv.length !== 2 || btn.disabled) return;
    btn.disabled = true; btn.classList.add('busy');
    const done = () => { this._bt = setTimeout(() => { btn.disabled = false; btn.classList.remove('busy'); }, 4000); };
    this._h.callService(sv[0], sv[1], b.data || {}).then(done, done);
  }
  _render() {
    const L = this._L, s = this._state(), b = this._c.button;
    this.shadowRoot.innerHTML = `<style>:host{display:block}${L.css}
.w{display:flex;align-items:stretch;gap:var(--ha-section-grid-column-gap,8px)}
.lv{--lvd:60px;--lvn:38px;flex:1;height:auto;min-height:84px;border-radius:var(--ha-card-border-radius,12px);padding:10px 18px;gap:16px}
.lvt{flex-direction:row;align-items:baseline;justify-content:flex-start;gap:14px}
.lvs{font-size:17px}
.off{flex:1;display:flex;align-items:center;gap:12px;min-height:84px;box-sizing:border-box;padding:10px 18px;border-radius:var(--ha-card-border-radius,12px);border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,rgba(128,128,128,.2)));background:var(--card-background-color,#24273a);color:var(--secondary-text-color);font-size:18px;font-weight:700}
.off ha-icon{--mdc-icon-size:32px}
.bt{flex:none;display:inline-flex;align-items:center;gap:10px;min-height:84px;padding:0 26px;border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,rgba(128,128,128,.2)));border-radius:var(--ha-card-border-radius,12px);box-sizing:border-box;background:var(--card-background-color,#24273a);color:var(--primary-text-color);font:inherit;font-size:18px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent}
.bt ha-icon{--mdc-icon-size:28px}
.bt.busy{opacity:.5}
@container (max-width:1px){.bt span{display:none}}</style><div class="w">${s ? L.html(s) : `<div class="off"><ha-icon icon="mdi:clock-outline"></ha-icon><span>Saída às ${esc(this._c.leave.time)}</span></div>`}${b && b.service ? `<button class="bt" type="button"><ha-icon icon="${esc(b.icon || 'mdi:bullhorn-outline')}"></ha-icon><span>${esc(b.name || 'Anunciar')}</span></button>` : ''}</div>`;
    const bt = this.shadowRoot.querySelector('.bt'); if (bt) bt.addEventListener('click', () => this._press(bt));
  }
}
if (!customElements.get('casa-leave-card')) customElements.define('casa-leave-card', CasaLeaveCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-leave-card', name: 'Casa · Hora de sair', description: 'Relógio com o tempo que falta para sair (o mesmo do cartão Família), com um botão opcional.' });
})();

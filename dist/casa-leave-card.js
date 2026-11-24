/* casa-leave-card v0.1.0 — o relógio «falta quanto para sair» do cartão Família, sozinho (mesmo bloco: usa o do casa-family-card).
   Configuração: leave = { time: '08:50', label: 'escola', warn, hurry, grace, days, from } (igual ao casa-family-card). Fora da janela mostra só a hora de saída. */
(() => {
class CasaLeaveCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(c) { if (!c || !c.leave || !c.leave.time) throw new Error('casa-leave-card: falta "leave.time"'); this._c = c; this._boot(); }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 6, rows: 'auto', min_columns: 4 }; }
  set hass(h) { this._h = h; if (!this._done) this._boot(); }
  connectedCallback() { this._boot(); }
  disconnectedCallback() { if (this._L) this._L.stop(this); }
  _boot() {
    if (!this._c || !this.isConnected) return;
    if (!this._L) { if (!this._w) this._w = customElements.whenDefined('casa-family-card').then(() => { this._L = window.__casaLeave || null; this._boot(); }); return; }
    this._L.arm(this, () => this._tick()); this._render(); this._done = true;
  }
  _state() { return this._L.state(this._c.leave, this._c.leave.from); }
  _tick() { if (!this.isConnected) return false; if (this._L.sync(this.shadowRoot, this._state())) this._render(); }
  _render() {
    const L = this._L, s = this._state();
    this.shadowRoot.innerHTML = `<style>:host{display:block;height:100%}${L.css}
.lv{height:100%;min-height:128px;border-radius:24px;padding:12px 16px}
.off{display:flex;align-items:center;gap:12px;min-height:128px;height:100%;box-sizing:border-box;padding:12px 18px;border-radius:24px;background:var(--card-background-color,#24273a);color:var(--secondary-text-color);font-size:18px;font-weight:700}
.off ha-icon{--mdc-icon-size:36px}</style>${s ? L.html(s) : `<div class="off"><ha-icon icon="mdi:clock-outline"></ha-icon><span>Saída às ${String(this._c.leave.time).replace(/[<>&"]/g, '')}</span></div>`}`;
  }
}
if (!customElements.get('casa-leave-card')) customElements.define('casa-leave-card', CasaLeaveCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-leave-card', name: 'Casa · Hora de sair', description: 'Relógio com o tempo que falta para sair (o mesmo do cartão Família).' });
})();

/* casa-ring-card v0.1.0 — quando uma campainha toca, mostra o vídeo numa janela por cima do painel. Só para ver: sem microfone, sem atender, sem portões.
   O vídeo é um webrtc-camera sem som sobre a entidade da câmara (o mesmo que o casa-access-card usa); se não houver, fica a imagem parada a atualizar.
   Configuração: bells = [{ name, ring (entidade «a tocar»), camera (camera.*) }]; seconds = fecha sozinho ao fim de N segundos (60); o cartão não ocupa espaço no painel. */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `.casa-ring{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(17,17,27,.82);font-family:var(--ha-font-family-body,Roboto,sans-serif)}
.casa-ring .bx{width:min(92vw,150vh,1100px);display:flex;flex-direction:column;gap:14px;padding:18px;border-radius:28px;background:#24273a;color:#cad3f5;box-sizing:border-box;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.casa-ring .hd{display:flex;align-items:center;gap:14px}
.casa-ring .ic{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:#eed49f;color:#181926;animation:casa-ring-b 1s ease-in-out infinite}
.casa-ring .ic ha-icon{--mdc-icon-size:32px}
.casa-ring .tt{flex:1;min-width:0;display:flex;flex-direction:column}
.casa-ring .tt b{font-size:26px;line-height:1.15;font-weight:800}
.casa-ring .tt span{font-size:16px;color:#a5adcb}
.casa-ring .x{flex:none;height:56px;padding:0 24px;border:0;border-radius:999px;background:#363a4f;color:#cad3f5;font:inherit;font-size:18px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.casa-ring .vd{position:relative;width:100%;aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#11111b}
.casa-ring .vd>*{position:absolute;inset:0;width:100%;height:100%}
.casa-ring .vd img{object-fit:contain}
@keyframes casa-ring-b{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}75%{transform:rotate(14deg)}}`;
class CasaRingCard extends HTMLElement {
  setConfig(c) {
    const bells = (c && Array.isArray(c.bells) ? c.bells : []).filter((b) => b && b.ring && b.camera);
    if (!bells.length) throw new Error('casa-ring-card: defina "bells" (ring + camera)');
    this._c = Object.assign({ seconds: 60 }, c, { bells }); this._was = {};
  }
  getCardSize() { return 0; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { this.style.display = 'block'; this.style.height = '0'; this.style.overflow = 'hidden'; this._on = true; }
  disconnectedCallback() { this._on = false; this._close(); }
  set hass(h) {
    this._h = h; if (!this._c) return;
    if (this._vid) this._vid.hass = h;
    for (const b of this._c.bells) {
      const s = h.states[b.ring], on = !!s && s.state === 'on', was = this._was[b.ring];
      this._was[b.ring] = on;
      /* só a passagem para «a tocar» abre: quem fechou não volta a ver a mesma chamada, e abrir o painel a meio não abre nada antigo */
      if (on && was === false && this._on) this._open(b);
      else if (!on && was && this._cur === b) { clearTimeout(this._offT); this._offT = setTimeout(() => { if (this._cur === b) this._close(); }, 8000); }
    }
  }
  _open(b) {
    this._close(); this._cur = b;
    const ov = document.createElement('div'); ov.className = 'casa-ring';
    ov.innerHTML = `<style>${CSS}</style><div class="bx"><div class="hd"><span class="ic"><ha-icon icon="mdi:bell-ring-outline"></ha-icon></span><div class="tt"><b>Estão a tocar à campainha!</b><span>${esc(b.name || '')}</span></div><button class="x" type="button"><ha-icon icon="mdi:close"></ha-icon>Fechar</button></div><div class="vd"></div></div>`;
    ov.querySelector('.x').addEventListener('click', () => this._close());
    ov.addEventListener('click', (e) => { if (e.target === ov) this._close(); });
    document.body.appendChild(ov); this._ov = ov;
    const slot = ov.querySelector('.vd'), h = this._h, st = h.states[b.camera];
    const still = () => {
      const img = document.createElement('img'); img.alt = '';
      const upd = () => { const s = this._h.states[b.camera]; if (s && s.attributes.entity_picture) img.src = s.attributes.entity_picture + '&t=' + Date.now(); };
      upd(); this._imgT = setInterval(upd, 2000); slot.textContent = ''; slot.appendChild(img);
    };
    const live = st && ((Number(st.attributes.supported_features) || 0) & 2) !== 0;
    if (!live || typeof window.loadCardHelpers !== 'function') { still(); }
    else {
      Promise.resolve(window.loadCardHelpers()).then((hp) => {
        if (this._ov !== ov) return;
        const card = hp.createCardElement({ type: 'custom:webrtc-camera', entity: b.camera, muted: true, ui: false });
        if (!card || card.localName === 'hui-error-card') { still(); return; }
        card.hass = this._h; this._vid = card; slot.appendChild(card);
      }).catch(still);
    }
    this._maxT = setTimeout(() => this._close(), Math.max(10, Number(this._c.seconds) || 60) * 1000);
  }
  _close() {
    clearTimeout(this._maxT); clearTimeout(this._offT); clearInterval(this._imgT);
    if (this._ov) { this._ov.remove(); this._ov = null; }
    this._vid = null; this._cur = null;
  }
}
if (!customElements.get('casa-ring-card')) customElements.define('casa-ring-card', CasaRingCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-ring-card', name: 'Casa · Campainha (só ver)', description: 'Janela com o vídeo da campainha quando toca; sem atender nem abrir portões.' });
})();

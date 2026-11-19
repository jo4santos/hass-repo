/* casa-tools-card v0.2.0 — volume{entity} = mosaico com − e + (input_number, passos de 10); página «Mais» dos painéis de parede: cabeçalho com voltar (title, back{name,icon,path}) e/ou
   mosaicos de recurso (tools: ['sidebar','reload']). sidebar = recarrega a página com ?disable_km (kiosk-mode desligado: barra
   lateral e cabeçalho do Home Assistant visíveis) e volta a esconder; reload = limpa a cache do browser e recarrega. */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ic = (i) => `<ha-icon icon="${esc(i)}"></ha-icon>`;
const CSS = `
:host{display:block;color:var(--primary-text-color)}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
ha-icon{--mdc-icon-size:22px;flex:none;display:inline-flex}
.hd{display:flex;align-items:center;gap:12px;min-height:44px;min-width:0}
.bk{flex:none;height:44px;padding:0 14px 0 11px;border-radius:12px;background:var(--card-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ttl{font-size:20px;font-weight:600;line-height:26px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}
.hd+.tiles{margin-top:12px}
.tile{display:flex;align-items:center;gap:12px;height:72px;padding:0 14px 0 12px;border-radius:16px;background:var(--card-background-color);width:100%;box-sizing:border-box;min-width:0}
.tile.on{background:var(--primary-text-color);color:var(--card-background-color)}
.ic{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
.tile.on .ic{background:var(--card-background-color);color:var(--primary-text-color)}
.tx{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.nm{font-size:20px;font-weight:600;line-height:26px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cap{font-size:14px;line-height:18px;height:18px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.on .cap{color:inherit;opacity:.8}
.vol{grid-column:1/-1}
.sb{flex:none;width:56px;height:44px;border-radius:12px;background:var(--secondary-background-color);display:grid;place-items:center}
.sb:disabled{opacity:.4}
`;
const KM = 'disable_km';
class CasaToolsCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._busy = false; }
  setConfig(c) {
    if (!c) throw new Error('casa-tools-card: sem configuração');
    this._c = c; this._render();
  }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  set hass(h) { this._hass = h; this._undock(); const v = this._vol(); if (v !== this._lv) { this._lv = v; if (this._c) this._render(); } }
  _volId() { const v = this._c && this._c.volume; return v ? String(typeof v === 'string' ? v : v.entity || '') : ''; }
  _vol() { const id = this._volId(), s = id && this._hass ? this._hass.states[id] : null, n = s ? parseFloat(s.state) : NaN; return isFinite(n) ? Math.round(n) : null; }
  connectedCallback() { this._undock(); if (this._c) this._render(); }
  _shown() { return new URLSearchParams(location.search).has(KM); }
  /* com a barra pedida, garante que a preferência «esconder sempre» do utilizador não a tapa */
  _undock() {
    if (window.__casaToolsUndock || !this._hass || !this.isConnected || !this._shown() || this._hass.dockedSidebar !== 'always_hidden') return;
    window.__casaToolsUndock = true;
    this.dispatchEvent(new CustomEvent('hass-dock-sidebar', { detail: { dock: 'auto' }, bubbles: true, composed: true }));
  }
  _render() {
    const c = this._c, tools = Array.isArray(c.tools) ? c.tools : [], shown = this._shown(), b = c.back;
    const T = {
      sidebar: shown ? ['mdi:menu-close', 'Esconder barra lateral', 'Volta ao ecrã inteiro'] : ['mdi:menu', 'Barra lateral', 'Para abrir outras páginas'],
      reload: ['mdi:reload', 'Recarregar', this._busy ? 'A recarregar…' : 'Limpa a cache'],
    };
    const hd = c.title || b ? `<div class="hd">${b ? `<button class="bk" id="bk">${ic(b.icon || 'mdi:arrow-left')}${esc(b.name || 'Voltar')}</button>` : ''}${c.title ? `<span class="ttl">${esc(c.title)}</span>` : ''}</div>` : '';
    const tiles = tools.filter((t) => T[t]).map((t) => `<button class="tile${t === 'sidebar' && shown ? ' on' : ''}" data-t="${t}"><span class="ic">${ic(T[t][0])}</span><span class="tx"><span class="nm">${T[t][1]}</span><span class="cap">${T[t][2]}</span></span></button>`).join('');
    const vid = this._volId(), vv = this._vol();
    const vol = vid ? `<div class="tile vol"><span class="ic">${ic(vv === 0 ? 'mdi:volume-off' : 'mdi:volume-medium')}</span><span class="tx"><span class="nm">${esc((c.volume && c.volume.name) || 'Volume')}</span><span class="cap">${vv == null ? 'Sem ligação' : vv + '%'}</span></span><button class="sb" data-v="-10" aria-label="Baixar o volume"${vv == null || vv <= 0 ? ' disabled' : ''}>${ic('mdi:minus')}</button><button class="sb" data-v="10" aria-label="Subir o volume"${vv == null || vv >= 100 ? ' disabled' : ''}>${ic('mdi:plus')}</button></div>` : '';
    this.shadowRoot.innerHTML = `<style>${CSS}</style>${hd}${tiles || vol ? `<div class="tiles">${vol}${tiles}</div>` : ''}`;
    this.shadowRoot.querySelectorAll('[data-v]').forEach((el) => el.addEventListener('click', () => { const cur = this._vol(); if (cur == null || !this._hass) return; const nv = Math.max(0, Math.min(100, cur + Number(el.dataset.v))); this._hass.callService('input_number', 'set_value', { value: nv }, { entity_id: vid }); }));
    const bk = this.shadowRoot.getElementById('bk');
    if (bk) bk.addEventListener('click', () => { history.pushState(null, '', b.path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); });
    this.shadowRoot.querySelectorAll('[data-t]').forEach((el) => el.addEventListener('click', () => this._tap(el.dataset.t)));
  }
  async _tap(t) {
    if (this._busy) return;
    if (t === 'sidebar') { location.assign(location.pathname + (this._shown() ? '' : '?' + KM)); return; }
    if (t !== 'reload') return;
    this._busy = true; this._render();
    const soon = (p) => Promise.race([p, new Promise((r) => setTimeout(r, 3000))]);
    try { if (window.caches) await soon(caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k))))); } catch (e) { /* sem cache */ }
    try { if (navigator.serviceWorker) await soon(navigator.serviceWorker.getRegistrations().then((rs) => Promise.all(rs.map((r) => r.unregister())))); } catch (e) { /* sem service worker */ }
    location.reload();
  }
}
if (!customElements.get('casa-tools-card')) customElements.define('casa-tools-card', CasaToolsCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'casa-tools-card')) window.customCards.push({ type: 'casa-tools-card', name: 'Casa · Mais (painéis)', description: 'Cabeçalho com voltar e mosaicos de recurso: barra lateral e recarregar com limpeza de cache.' });
})();

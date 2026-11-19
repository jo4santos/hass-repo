/* casa-tabs-card v0.5.0 — separadores com cartões criados só quando o separador abre; controlo fixo ao lado (ex.: Não incomodar);
   opcional por separador: layout em grelha (estreito/largo) e, por cartão, casa:{ratio, still} = área reservada + imagem parada imediata de uma câmara */
(() => {
const escT = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `
:host{display:block}
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.root{display:flex;flex-direction:column;gap:12px;color:var(--primary-text-color);container-type:inline-size}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-right:auto}
.chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;white-space:nowrap}
.chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
.chip ha-icon{--mdc-icon-size:20px;flex:none}
.dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--primary-color)}
.sw{flex:none;width:34px;height:20px;border-radius:999px;background:var(--divider-color,rgba(127,127,127,.4));position:relative;margin-left:4px}
.sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--primary-text-color)}
.chip.on .sw{background:var(--primary-color)}
.chip.on .sw::after{left:16px;background:#181926}
.aside-card{flex:1 1 220px;min-width:0}
.tabs{flex-wrap:nowrap;gap:4px;padding:4px;border-radius:14px;background:rgba(202,211,245,.08);background:color-mix(in srgb,var(--primary-text-color) 9%,transparent);min-width:0}
.tabs .chip{flex:1 1 0;min-width:96px;padding:0 12px;border-radius:10px;background:none;justify-content:center;overflow:hidden;text-overflow:ellipsis}
.tabs .chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
.top>.chip{border-radius:12px;background:rgba(202,211,245,.08);background:color-mix(in srgb,var(--primary-text-color) 9%,transparent)}
.top>.chip.on{color:inherit;font-weight:500}
.sw{width:36px}
.chip.on .sw{background:var(--primary-text-color)}
.chip.on .sw::after{left:18px;background:#181926}
.panel{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch}
.panel[hidden]{display:none}
.panel.g:not([hidden]){display:grid}
:host([same]) .stack{display:grid;grid-template-columns:minmax(0,1fr)}
:host([same]) .panel{grid-area:1/1;min-width:0}
:host([same]) .panel[hidden]{display:flex;visibility:hidden;pointer-events:none}
:host([same]) .panel.g[hidden]{display:grid}
:host([same]) .panel.fit{height:0;min-height:100%;overflow-y:auto;align-content:flex-start}
.cell.r{position:relative;align-self:start}
.still{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:var(--card-background-color,#1e2030);pointer-events:none;z-index:2}
.still[hidden]{display:none}
.cell{min-width:0;box-sizing:border-box;flex:1 1 100%}
.cell>*{display:block;height:100%}
.err{font-size:13px;color:var(--secondary-text-color)}
`;
// há imagem/vídeo já visível dentro do cartão (percorre shadow DOM)? usado para retirar a imagem parada inicial
const hasMedia = (root) => {
  const stack = [root];
  let n = 0;
  while (stack.length && n++ < 4000) {
    const el = stack.pop();
    if (!el) continue;
    const tag = el.tagName;
    if (tag === 'VIDEO' && el.readyState >= 2 && el.videoWidth > 0 && !el.paused) return true;
    if (tag === 'IMG' && el.complete && el.naturalWidth >= 64) return true;
    if (el.shadowRoot) stack.push(el.shadowRoot);
    const ch = el.children;
    if (ch) for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
  }
  return false;
};
// casa.menu_css: só visual e à prova de falhas — acrescenta UM <style id="casa-menu-style"> ao shadow root do menu do
// advanced-camera-card (botões do menu com caixa de 12px de raio, 12px de margem ao canto e 8px entre si).
// Não toca em configuração nem em eventos; se o cartão mudar e nada corresponder, fica tudo como o cartão desenha.
const MENU_CSS = ':host{box-sizing:border-box;padding:12px 8px 0}ha-icon-button{border-radius:12px!important;margin:0 4px!important;--wa-border-radius-pill:12px;--ha-border-radius-pill:12px}'
  + 'ha-icon-button[data-casa-on]{background:var(--primary-text-color,#cad3f5)!important;color:#181926!important}'
  + 'ha-icon-button[data-casa-on] advanced-camera-card-icon{color:#181926!important;animation:none!important}';
// dentro do ha-button (shadow do ha-icon-button): a camada de hover/foco é o <button part="base">, redondo por omissão
const BTN_CSS = '[part~="base"],button{border-radius:12px!important}';
// dentro do advanced-camera-card-icon: o ícone segue a cor do botão quando está "ligado" (sem pulsar)
const ICON_CSS = ':host-context(ha-icon-button[data-casa-on]) ha-icon{color:#181926!important;animation:none!important}';
const ON_ICONS = ['mdi:volume-high', 'mdi:microphone'];
const addStyle = (sr, id, css) => {
  if (!sr || sr.getElementById(id)) return;
  const st = document.createElement('style');
  st.id = id;
  st.textContent = css;
  sr.appendChild(st);
};
const findMenu = (root) => {
  const stack = [root];
  let n = 0;
  while (stack.length && n++ < 6000) {
    const el = stack.pop();
    if (!el) continue;
    if (el.tagName === 'ADVANCED-CAMERA-CARD-MENU' && el.shadowRoot) return el;
    if (el.shadowRoot) stack.push(el.shadowRoot);
    const ch = el.children;
    if (ch) for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
  }
  return null;
};
// cell._menu guarda o menu encontrado; cada passagem só olha para os (poucos) botões do menu
const menuCss = (cell, css) => {
  try {
    let menu = cell._menu;
    if (!menu || !menu.isConnected || !menu.shadowRoot) menu = cell._menu = findMenu(cell.firstElementChild);
    if (!menu) return;
    addStyle(menu.shadowRoot, 'casa-menu-style', css);
    const on = cell._menuOn || ON_ICONS;
    menu.shadowRoot.querySelectorAll('ha-icon-button').forEach((b) => {
      try {
        const hb = b.shadowRoot && b.shadowRoot.querySelector('ha-button');
        if (hb && hb.shadowRoot) addStyle(hb.shadowRoot, 'casa-menu-style', BTN_CSS);
        const ic = b.querySelector('advanced-camera-card-icon');
        if (ic && ic.shadowRoot) addStyle(ic.shadowRoot, 'casa-menu-style', ICON_CSS);
        const name = ic && ic.icon && typeof ic.icon === 'object' ? ic.icon.icon : (ic && ic.shadowRoot && ic.shadowRoot.querySelector('ha-icon') ? ic.shadowRoot.querySelector('ha-icon').getAttribute('icon') : '');
        const isOn = !!name && on.includes(name);
        if (isOn !== b.hasAttribute('data-casa-on')) b.toggleAttribute('data-casa-on', isOn);
      } catch (e) { /* ignora este botão */ }
    });
  } catch (e) { /* desiste em silêncio */ }
};
// casa.debug: sonda só de leitura — lista a estrutura real dos botões do menu (tags, atributos, parts, raio calculado)
const menuProbe = (root) => {
  const out = [];
  try {
    const stack = [root];
    let n = 0, menu = null;
    while (stack.length && n++ < 6000 && !menu) {
      const el = stack.pop();
      if (!el) continue;
      if (el.tagName === 'ADVANCED-CAMERA-CARD-MENU') { menu = el; break; }
      if (el.shadowRoot) stack.push(el.shadowRoot);
      const ch = el.children;
      if (ch) for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
    }
    if (!menu || !menu.shadowRoot) return 'menu não encontrado';
    const cs = (e) => { const c = getComputedStyle(e); return `r=${c.borderRadius} bg=${c.backgroundColor} col=${c.color} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)} ov=${c.overflow}${c.animationName !== 'none' ? ' anim=' + c.animationName : ''}`; };
    const at = (e) => [...e.attributes].map((a) => a.name + '=' + String(a.value).slice(0, 70)).join(' ');
    const walk = (e, d) => {
      if (d > 5 || out.length > 70) return;
      out.push('  '.repeat(d) + '<' + e.tagName.toLowerCase() + ' ' + at(e) + '> ' + cs(e));
      if (e.shadowRoot) { out.push('  '.repeat(d + 1) + '#shadow'); for (const c of e.shadowRoot.children) if (c.tagName !== 'STYLE') walk(c, d + 2); }
      for (const c of e.children) walk(c, d + 1);
    };
    out.push('menu attrs: ' + at(menu));
    menu.shadowRoot.querySelectorAll('ha-icon-button').forEach((b) => {
      const c = getComputedStyle(b);
      out.push('--- vars: ' + ['--ha-icon-button-size', '--mdc-icon-button-size', '--mdc-icon-size', '--md-icon-button-state-layer-shape', '--wa-border-radius-pill', '--ha-border-radius-pill', '--ha-border-radius-circle', '--advanced-camera-card-menu-button-active-color', '--advanced-camera-card-menu-button-critical-color', '--advanced-camera-card-button-border-radius'].map((v) => v.replace('--advanced-camera-card-', '--acc-') + '=' + (c.getPropertyValue(v).trim() || '∅')).join(' '));
      out.push('icon prop: ' + (() => { try { const i = b.querySelector('advanced-camera-card-icon'); return i ? JSON.stringify(i.icon) : '-'; } catch (e) { return '?'; } })());
      walk(b, 0);
    });
  } catch (e) { out.push('ERR ' + e.message); }
  return out.join('\n');
};
let helpersP = null;
const getHelpers = () => {
  if (!helpersP) helpersP = window.loadCardHelpers ? window.loadCardHelpers() : Promise.reject(new Error('loadCardHelpers'));
  return helpersP;
};

class CasaTabsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._active = 0;
    this._cells = [];      // por separador: lista de células (ou null se ainda não criado)
    this._asideCell = null;
    this._sig = '';
    this._built = false;
    this._userPicked = false;
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.tabs) || !config.tabs.length) throw new Error('casa-tabs-card: indique "tabs" (lista com name e cards)');
    config.tabs.forEach((t) => { if (!t || !t.name || !Array.isArray(t.cards)) throw new Error('casa-tabs-card: cada separador precisa de "name" e "cards"'); });
    const j = JSON.stringify(config);
    if (j === this._cfgJson) return;
    this._cfgJson = j;
    this._config = config;
    this._built = false;
    this._cells = config.tabs.map(() => null);
    this._asideCell = null;
    this._active = this._defaultTab();
    this._build();
  }

  connectedCallback() {
    // ao reabrir o pop-up volta ao separador por omissão (o vídeo em direto, no caso das campainhas)
    if (!this._config) return;
    this._userPicked = false;
    const d = this._defaultTab();
    if (d !== this._active) this._show(d); else this._ensure(d);
    if (this._cells[this._active] && this._cells[this._active].length) this._stills(this._active);
    this._menuWatch();
  }

  disconnectedCallback() {
    if (this._menuIv) { clearInterval(this._menuIv); this._menuIv = null; }
    for (const cells of this._cells) if (cells) for (const c of cells) this._clearStill(c);
  }

  // grelha por separador, só com CSS (container queries; nada é medido em JS):
  // layout:{names:[área por cartão], areas, columns, rows, breaks:[{min, areas, columns, rows}]}
  _layout() {
    if (!this._built) return;
    const sr = this.shadowRoot, cl = (v) => String(v == null ? '' : v).replace(/[{}<>;@]/g, '');
    const rule = (k, S) => `#p${k}.g{grid-template-areas:${cl(S.areas) || 'none'};grid-template-columns:${cl(S.columns) || 'none'};grid-template-rows:${cl(S.rows) || 'none'}}`;
    let css = '';
    this._config.tabs.forEach((t, k) => {
      const L = t.layout, p = sr.getElementById('p' + k);
      if (!L || !p) return;
      p.classList.add('g');
      css += rule(k, L);
      [...(Array.isArray(L.breaks) ? L.breaks : []), ...(L.wide ? [L.wide] : [])].filter(Boolean).map((b) => [Number(b.min) || 860, b]).sort((x, y) => x[0] - y[0])
        .forEach(([min, b]) => { css += `@container (min-width:${min}px){${rule(k, b)}}`; });
    });
    let st = sr.getElementById('lay');
    if (!st) { st = document.createElement('style'); st.id = 'lay'; sr.appendChild(st); }
    st.textContent = css;
  }

  // reaplica o estilo do menu enquanto o cartão está ligado (o menu aparece tarde e pode ser recriado)
  _menuWatch() {
    if (this._menuIv) { clearInterval(this._menuIv); this._menuIv = null; }
    const run = () => { for (const cells of this._cells) if (cells) for (const c of cells) { if (c._menuCss && c.firstElementChild) menuCss(c, c._menuCss); if (c._debug && c.firstElementChild) { let p = c.querySelector(':scope > pre.dbg'); if (!p) { p = document.createElement('pre'); p.className = 'dbg'; p.style.cssText = 'position:absolute;left:0;top:100%;z-index:5;margin:0;padding:6px;font:10px/1.25 monospace;white-space:pre-wrap;word-break:break-all;background:#11111b;color:#cad3f5;width:100%;box-sizing:border-box;height:auto'; c.appendChild(p); } p.textContent = menuProbe(c.firstElementChild); } } };
    let k = 0;
    this._menuIv = setInterval(() => { k++; if (!this.isConnected) { clearInterval(this._menuIv); this._menuIv = null; return; } run(); }, 500);
    run();
  }

  _clearStill(cell) {
    if (cell._stillTimer) { clearInterval(cell._stillTimer); cell._stillTimer = null; }
    const s = cell.querySelector(':scope > img.still');
    if (s) s.remove();
  }

  // imagem parada da câmara por cima do cartão até este mostrar imagem/vídeo (ou passar o tempo máximo)
  _stills(i) {
    const cells = this._cells[i], h = this._hass;
    if (!cells || !h) return;
    for (const cell of cells) {
      const ent = cell.dataset.still;
      if (!ent) continue;
      this._clearStill(cell);
      const so = h.states[ent], pic = so && so.attributes && so.attributes.entity_picture;
      if (!pic) continue;
      const img = document.createElement('img'), t0 = Date.now(), max = (Number(cell.dataset.stillMax) || 8) * 1000;
      img.className = 'still';
      img.alt = '';
      img.hidden = true;
      img.onload = () => { img.hidden = false; };
      img.onerror = () => this._clearStill(cell);
      img.src = h.hassUrl ? h.hassUrl(pic) : pic;
      cell.appendChild(img);
      cell._stillTimer = setInterval(() => {
        if (!img.isConnected || Date.now() - t0 > max || hasMedia(cell.firstElementChild)) this._clearStill(cell);
      }, 200);
    }
  }

  _defaultTab() {
    const c = this._config, h = this._hass;
    if (h) {
      const i = c.tabs.findIndex((t) => t.entity && h.states[t.entity] && h.states[t.entity].state === 'on');
      if (i >= 0) return i;
    }
    const d = Number(c.default_tab);
    return d >= 0 && d < c.tabs.length ? d : 0;
  }

  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (!this._config) return;
    if (first && !this._userPicked) {
      const d = this._defaultTab();
      if (d !== this._active) this._show(d); else this._ensure(d);
    }
    for (const cells of this._cells) if (cells) for (const c of cells) if (c.firstElementChild) c.firstElementChild.hass = h;
    if (this._asideCell && this._asideCell.firstElementChild) this._asideCell.firstElementChild.hass = h;
    this._sync();
  }

  _build() {
    const c = this._config, sr = this.shadowRoot, a = c.aside;
    const tabs = c.tabs.map((t, i) => `<button class="chip" role="tab" data-tab="${i}" id="t${i}" aria-controls="p${i}">${t.icon ? `<ha-icon icon="${escT(t.icon)}"></ha-icon>` : ''}<span>${escT(t.name)}</span><span class="dot" hidden></span></button>`).join('');
    let aside = '';
    if (a && a.card) aside = '<div class="aside-card" id="aside"></div>';
    else if (a && a.entity) aside = `<button class="chip" id="aside" role="switch" aria-checked="false"><ha-icon></ha-icon><span>${escT(a.name || '')}</span><span class="sw"></span></button>`;
    // atalhos (ex.: trocar para o outro pop-up): links:[{name, icon, hash}]
    const links = (Array.isArray(c.links) ? c.links : []).map((l, i) => `<button class="chip" data-link="${i}">${l.icon ? `<ha-icon icon="${escT(l.icon)}"></ha-icon>` : ''}<span>${escT(l.name || '')}</span></button>`).join('');
    const panels = c.tabs.map((t, i) => `<div class="panel${i > 0 ? ' fit' : ''}" role="tabpanel" id="p${i}" aria-labelledby="t${i}" hidden></div>`).join('');
    sr.innerHTML = `<style>${CSS}</style><div class="root"><div class="top"><div class="tabs" role="tablist">${tabs}</div>${aside}${links}</div><div class="stack">${panels}</div></div>`;
    sr.querySelectorAll('[data-link]').forEach((b) => b.addEventListener('click', () => {
      const l = c.links[Number(b.dataset.link)];
      if (!l || !l.hash) return;
      history.replaceState(history.state, '', location.pathname + location.search + l.hash);
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: true } }));
    }));
    sr.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { this._userPicked = true; this._show(Number(b.dataset.tab)); }));
    if (a && !a.card && a.entity) this._bindToggle(sr.getElementById('aside'), a.entity);
    if (a && a.card) this._makeAside(a.card);
    this.toggleAttribute('pills', !!c.pills);
    this.toggleAttribute('same', !!c.same_height);
    this._built = true;
    this._sig = '';
    this._layout();
    this._show(this._active);
  }

  _bindToggle(btn, entity) {
    let timer = null, held = false;
    const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
    btn.addEventListener('pointerdown', () => {
      held = false; clear();
      timer = setTimeout(() => { held = true; this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: entity } })); }, 550);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => btn.addEventListener(e, clear));
    btn.addEventListener('click', () => {
      if (held) { held = false; return; }
      if (this._hass) this._hass.callService('homeassistant', 'toggle', { entity_id: entity });
    });
  }

  async _makeAside(cfg) {
    const json = this._cfgJson;
    try {
      const helpers = await getHelpers();
      if (json !== this._cfgJson) return;
      const host = this.shadowRoot.getElementById('aside');
      const cell = document.createElement('div');
      host.appendChild(cell);
      this._mount(cell, cfg, helpers);
      this._asideCell = cell;
    } catch (e) { /* sem controlo lateral */ }
  }

  _mount(cell, cfg, helpers) {
    const el = helpers.createCardElement(cfg);
    el.addEventListener('ll-rebuild', (ev) => { ev.stopPropagation(); this._mount(cell, cfg, helpers); }, { once: true });
    if (this._hass) el.hass = this._hass;
    if (cell.firstElementChild) cell.replaceChild(el, cell.firstElementChild); else cell.appendChild(el);
  }

  _show(i) {
    this._active = i;
    if (!this._built) return;
    const sr = this.shadowRoot;   // same_height: os separadores partilham a mesma célula (CSS); nenhuma altura é medida
    this._config.tabs.forEach((t, k) => {
      const on = k === i, b = sr.getElementById('t' + k), p = sr.getElementById('p' + k);
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      p.hidden = !on;
    });
    this._ensure(i);
  }

  async _ensure(i) {
    if (!this._built || !this._hass || this._cells[i]) return;   // só cria depois de haver hass (para escolher o separador certo)
    const json = this._cfgJson, tab = this._config.tabs[i], panel = this.shadowRoot.getElementById('p' + i);
    const cells = this._cells[i] = [];
    try {
      const helpers = await getHelpers();
      if (json !== this._cfgJson) return;
      const names = tab.layout && Array.isArray(tab.layout.names) ? tab.layout.names : [];
      for (const [k, raw] of tab.cards.entries()) {
        const { casa, ...cfg } = raw || {};
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (names[k]) cell.style.gridArea = String(names[k]);
        if (casa && casa.vars) for (const [vk, vv] of Object.entries(casa.vars)) if (String(vk).startsWith('--')) cell.style.setProperty(vk, String(vv));
        if (casa && casa.debug) { cell._debug = true; cell.classList.add('r'); }
        if (casa && Array.isArray(casa.menu_on_icons)) cell._menuOn = casa.menu_on_icons.map(String);
        if (casa && casa.menu_css) cell._menuCss = typeof casa.menu_css === 'string' ? casa.menu_css : MENU_CSS;
        if (casa && casa.max_width) { cell.style.width = '100%'; cell.style.justifySelf = 'center'; cell.style.maxWidth = String(casa.max_width).replace(/dvh/g, 'vh'); cell.style.maxWidth = String(casa.max_width); }
        if (casa && casa.ratio) { cell.classList.add('r'); cell.style.aspectRatio = String(casa.ratio); }
        if (casa && casa.still) { cell.classList.add('r'); cell.dataset.still = String(casa.still); if (casa.still_seconds) cell.dataset.stillMax = String(casa.still_seconds); }
        const g = cfg && cfg.grid_options && Number(cfg.grid_options.columns);
        // cartões com largura parcial (em 12 colunas) partilham a linha e esticam para a preencher
        if (g > 0 && g < 12) cell.style.flex = `${g} 1 calc(${(g / 12 * 100).toFixed(3)}% - 8px)`;
        this._mount(cell, cfg, helpers);
        panel.appendChild(cell);
        cells.push(cell);
      }
      if (this.isConnected) { this._stills(i); this._menuWatch(); }
    } catch (e) {
      if (json !== this._cfgJson) return;
      this._cells[i] = null;
      panel.innerHTML = '<div class="err">Não foi possível carregar este separador.</div>';
    }
  }

  _sync() {
    if (!this._built || !this._hass) return;
    const c = this._config, st = this._hass.states, a = c.aside;
    const as = a && !a.card && a.entity ? (st[a.entity] ? st[a.entity].state : 'unavailable') : '';
    const sig = as + '|' + c.tabs.map((t) => (t.entity && st[t.entity] ? st[t.entity].state : '')).join(',');
    if (sig === this._sig) return;
    this._sig = sig;
    const sr = this.shadowRoot;
    c.tabs.forEach((t, k) => { sr.getElementById('t' + k).querySelector('.dot').hidden = !(t.entity && st[t.entity] && st[t.entity].state === 'on'); });
    if (as) {
      const b = sr.getElementById('aside'), on = as === 'on', off = as === 'unavailable' || as === 'unknown';
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.disabled = off;
      b.style.opacity = off ? '.45' : '';
      b.title = off ? 'Sem ligação' : '';
      b.querySelector('ha-icon').setAttribute('icon', (on ? a.icon_on : a.icon_off) || a.icon || 'mdi:toggle-switch');
    }
  }

  getCardSize() { return 6; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
}
if (!customElements.get('casa-tabs-card')) customElements.define('casa-tabs-card', CasaTabsCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'casa-tabs-card')) window.customCards.push({ type: 'casa-tabs-card', name: 'Casa · Separadores', description: 'Separadores com cartões carregados só quando abrem e um controlo sempre visível ao lado.' });
})();

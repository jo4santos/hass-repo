/* casa-nav-card v0.7.1 — navegação da casa (ações numa secção à parte depois de "Mais", com divisor vertical: actions[].assist = abre o Assist do HA): barra segmentada (bloco 16 px, itens 12 px, selecionado invertido) centrada no topo (ecrãs largos) ou barra fixa em baixo (telemóvel), com "Mais"; esconde o cabeçalho nativo do HA (hide_header) */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `
:host{display:block}
.wrap{display:flex;justify-content:center;padding:6px 0;box-sizing:border-box}
.wrap.stuck{position:fixed;z-index:3;padding:6px 0;background:var(--lovelace-background,var(--primary-background-color))}
:host(.bottom){height:0}
:host(.bottom) .wrap{padding:0}
:host(.bottom.static){height:auto}
a,button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;text-decoration:none;-webkit-tap-highlight-color:transparent;box-sizing:border-box}
a:focus-visible,button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
ha-icon{--mdc-icon-size:20px;flex:none;display:inline-flex}
.bar{flex:none;display:inline-flex;align-items:center;gap:4px;padding:4px;box-sizing:border-box;position:relative;background:var(--card-background-color);border:0;border-radius:16px;color:var(--primary-text-color)}
.it{display:flex;align-items:center;gap:8px;height:44px;padding:0 14px;border-radius:12px;color:var(--primary-text-color);font-size:14px;font-weight:500;line-height:1;white-space:nowrap}
.it ha-icon{color:var(--secondary-text-color)}
.it.on ha-icon{color:inherit}
.it:hover{color:var(--primary-text-color);background:var(--secondary-background-color)}
.it.on,.it.on:hover{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
.more{display:flex}
.sep{flex:none;width:1px;height:24px;margin:0 6px;background:var(--divider-color)}
.it.ico{width:44px;padding:0;justify-content:center}
.it.ico span{display:none}
.bar.bottom{position:fixed;left:0;right:0;bottom:0;z-index:3;display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));gap:2px;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px));border:0;border-top:1px solid var(--divider-color);border-radius:0}
.bar.bottom.static{position:relative;z-index:auto;border:1px solid var(--divider-color);border-radius:16px;padding-bottom:6px}
.bar.bottom .it{flex-direction:column;justify-content:center;gap:4px;height:52px;padding:0;border-radius:12px;font-size:12px;letter-spacing:-.1px;min-width:0;width:100%}
.bar.bottom .it span{max-width:100%;overflow:hidden;text-overflow:ellipsis}
.bar.bottom .sep{display:none}
.bar.bottom .act.first{position:relative}
.bar.bottom .act.first::before{content:'';position:absolute;left:-2px;top:14px;bottom:14px;width:1px;background:var(--divider-color)}
`;
const MENU_CSS = `
:host{all:initial;position:fixed;inset:0;z-index:2147483000;display:block;width:auto;height:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;-webkit-font-smoothing:antialiased}
a,button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;text-decoration:none;-webkit-tap-highlight-color:transparent;box-sizing:border-box}
a:focus-visible,button:focus-visible{outline:2px solid var(--primary-color);outline-offset:-2px}
ha-icon{--mdc-icon-size:20px;flex:none;display:inline-flex}
.scrim{position:fixed;inset:0;background:transparent}
.scrim.dim{background:rgba(0,0,0,.5)}
.menu{position:fixed;min-width:230px;max-height:calc(100vh - 16px);overflow:auto;padding:4px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;font-size:14px}
.menu.sheet{min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}
.row{display:flex;align-items:center;gap:12px;min-height:44px;padding:0 12px;border-radius:12px;font-size:14px;font-weight:500;color:var(--primary-text-color);white-space:nowrap;width:100%;overflow:hidden}
.row ha-icon{color:var(--secondary-text-color)}
.row:hover{background:var(--secondary-background-color)}
.row.on,.row.on:hover{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
.row.on ha-icon{color:inherit}
.sep{height:1px;margin:4px 6px;background:var(--divider-color)}
.menu.sheet .sep{grid-column:1/-1}
`;
const MENU_VARS = ['--card-background-color', '--divider-color', '--primary-text-color', '--secondary-text-color', '--secondary-background-color', '--primary-color'];
/* cabeçalho nativo (título + separadores): escondido enquanto houver uma barra casa-nav ligada, exceto em modo de edição ou com ?disable_km / ?edit=1 */
const LIVE = new Set();
const HIDE_ID = 'casa-nav-hide-header';
const shown = (el) => { if (!el) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0; };
const syncHeader = (root) => {
  if (!root || !root.shadowRoot || typeof getComputedStyle !== 'function') return;
  const sr = root.shadowRoot, q = (window.location && window.location.search) || '';
  let st = sr.querySelector('#' + HIDE_ID);
  const editing = !!(root.lovelace && root.lovelace.editMode) || /[?&]edit=1/.test(q);
  /* navigator.webdriver: o motor de capturas já corta o cabeçalho por conta própria; esconder duas vezes cortaria o topo da página */
  const auto = typeof navigator !== 'undefined' && navigator.webdriver === true;
  const want = !auto && !editing && !/[?&]disable_km/.test(q) && [...LIVE].some((c) => c._root === root && c._c && c._c.hide_header && !c._edit);
  if (want && !st) {
    const header = sr.querySelector('.header');
    if (!shown(header)) return;
    const h = header.offsetHeight;
    st = document.createElement('style'); st.id = HIDE_ID;
    st.textContent = '.header{display:none !important}:host{--header-height:0px !important}';
    sr.appendChild(st);
    const view = sr.querySelector('#view');
    if (view && h > 0) {
      const cs = getComputedStyle(view); let extra = '';
      if (parseFloat(cs.paddingTop) >= h - 1) extra += 'padding-top:env(safe-area-inset-top,0px) !important;';
      if (parseFloat(cs.marginTop) >= h - 1) extra += 'margin-top:env(safe-area-inset-top,0px) !important;';
      if (extra) st.textContent += '#view{' + extra + '}';
    }
  } else if (!want && st) st.remove();
};
const BOTTOM_SPACE = 'calc(76px + env(safe-area-inset-bottom, 0px))';

class CasaNavCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false; this._edit = false; this._admin = false; this._n = null; this._styled = [];
    this._onLoc = () => { this._close(); this._render(); this._layout(); };
    this._onKey = (e) => { if (e.key === 'Escape' && this._open) { this._close(); const b = this.shadowRoot.querySelector('[data-more]'); if (b && b.focus) b.focus(); } };
    this._onResize = () => { this._close(); this._n = null; this._compact = false; this._render(); this._layout(); };
    this._onScroll = (e) => { if (this._open && !(e && e.target === this._ov)) this._close(); this._stick(); };
    this.shadowRoot.addEventListener('click', (e) => this._click(e));
  }

  setConfig(c) {
    if (!c || !Array.isArray(c.items) || !c.items.length) throw new Error('casa-nav-card: indique "items" (name, icon, path)');
    const all = c.items.concat(Array.isArray(c.actions) ? c.actions.map((a) => Object.assign({}, a, { path: '' })) : []).filter((i) => i && i.name && (i.path || i.assist)).map((i) => (i.path
      ? { name: String(i.name), short: i.short ? String(i.short) : '', icon: i.icon || 'mdi:circle-small', path: String(i.path).replace(/(.)\/+$/, '$1') }
      : { name: String(i.name), short: i.short ? String(i.short) : '', icon: i.icon || 'mdi:microphone-outline', path: '', assist: i.assist === true ? {} : i.assist, label: String(i.label || 'Falar com o assistente') }));
    const items = all.filter((i) => i.path), actions = all.filter((i) => !i.path);
    if (!items.length) throw new Error('casa-nav-card: cada item precisa de "name" e "path"');
    const primary = Math.max(1, Number(c.primary) || 5);
    this._c = {
      items, actions, primary,
      primary_mobile: Math.max(1, Number(c.primary_mobile) || Math.max(1, primary - 1 - actions.length)),
      breakpoint: Number(c.breakpoint) || 900,
      show_menu: c.show_menu !== false,
      show_edit: c.show_edit !== false,
      hide_header: c.hide_header !== false,
    };
    this._n = null;
    this._render();
  }

  set hass(h) {
    this._hass = h;
    const adm = !!(h && h.user && h.user.is_admin);
    if (adm !== this._admin) { this._admin = adm; this._render(); }
    if (this._root && this._c && this._c.hide_header) syncHeader(this._root);
  }
  set editMode(v) { this._setEdit(v); }
  set preview(v) { this._setEdit(v); }
  _setEdit(v) { v = !!v; if (v === this._edit) return; this._edit = v; this._close(); this._render(); this._layout(); }

  getCardSize() { return 1; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  static getStubConfig() { return { primary: 5, items: [{ name: 'Início', icon: 'mdi:home-outline', path: '/lovelace/0' }] }; }

  connectedCallback() {
    LIVE.add(this);
    window.addEventListener('location-changed', this._onLoc);
    window.addEventListener('popstate', this._onLoc);
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onScroll, { passive: true, capture: true });
    this._render();
    this._layout();
    this._timers = [setTimeout(() => this._onResize(), 400), setTimeout(() => this._onResize(), 2500)];
  }

  disconnectedCallback() {
    window.removeEventListener('location-changed', this._onLoc);
    window.removeEventListener('popstate', this._onLoc);
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScroll, { capture: true });
    (this._timers || []).forEach(clearTimeout);
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    this._close();
    this._unstyle();
    LIVE.delete(this);
    const root = this._root; if (root) setTimeout(() => syncHeader(root), 300);
  }

  _wide() { return (window.innerWidth || 1280) >= this._c.breakpoint; }

  _current() {
    const p = (window.location && window.location.pathname || '').replace(/(.)\/+$/, '$1');
    const items = this._c.items;
    let i = items.findIndex((x) => x.path && x.path === p);
    if (i < 0) i = items.findIndex((x) => x.path && p.startsWith(x.path + '/'));
    if (i < 0) { const f = items.findIndex((x) => x.path), base = items[f].path.replace(/\/[^/]*$/, ''); if (p === base || p === base + '/0') i = f; }
    return i;
  }

  _render() {
    if (!this._c) return;
    const c = this._c, wide = this._wide(), cur = this._current();
    const max = wide ? c.primary : c.primary_mobile;
    let n = Math.min(this._n == null ? max : this._n, c.items.length);
    if (c.items.length - n === 1 && this._n == null) n = c.items.length;
    const shown = c.items.map((it, i) => ({ it, i })).filter((x) => x.i < n);
    const rest = c.items.map((it, i) => ({ it, i })).filter((x) => x.i >= n);
    const curHidden = rest.some((x) => x.i === cur);
    const act = (a, i) => `${i ? '' : '<span class="sep" aria-hidden="true"></span>'}<button type="button" class="it act${i ? '' : ' first'}${wide && this._compact ? ' ico' : ''}" data-assist="${i}" aria-haspopup="dialog" aria-label="${esc(a.label)}" title="${esc(a.label)}"><ha-icon icon="${esc(a.icon)}"></ha-icon><span>${esc(wide ? a.name : a.short || a.name)}</span></button>`;
    const pill = (x) => `<a class="it${x.i === cur ? ' on' : ''}" href="${esc(x.it.path)}" data-go="${x.i}"${x.i === cur ? ' aria-current="page"' : ''}><ha-icon icon="${esc(x.it.icon)}"></ha-icon><span>${esc(wide ? x.it.name : x.it.short || x.it.name)}</span></a>`;
    const hasMore = rest.length > 0 || c.show_menu || (c.show_edit && this._admin);
    this._rest = rest; this._cur = cur;
    const extraPill = wide && curHidden ? pill(rest.find((x) => x.i === cur)) : '';
    const moreOn = !wide && curHidden;
    const more = hasMore ? `<div class="more"><button type="button" class="it${moreOn ? ' on' : ''}" data-more aria-haspopup="menu" aria-expanded="${this._open ? 'true' : 'false'}"><ha-icon icon="mdi:dots-horizontal"></ha-icon><span>Mais</span></button></div>` : '';
    const count = shown.length + (hasMore ? 1 : 0) + c.actions.length;
    this.classList.toggle('bottom', !wide);
    this.classList.toggle('static', this._edit);
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="wrap"><nav class="bar${wide ? '' : ' bottom'}${this._edit ? ' static' : ''}" aria-label="Secções" style="--n:${count}">${shown.map(pill).join('')}${extraPill}${more}${c.actions.map(act).join('')}</nav></div>`;
    if (!wide && this._left) this.shadowRoot.querySelector('nav').style.left = this._left;
    if (this._fit(wide, n)) return;
    this._stick();
  }

  /* se a barra não couber na largura disponível, passa mais um destino para "Mais" */
  _fit(wide, n) {
    if (!wide) return false;
    /* no cabeçalho da vista o cartão fica numa coluna estreita (500 px) e a barra transborda centrada: a largura útil é a da vista */
    const v = this._view || this._chain().find((x) => x.localName === 'hui-sections-view' || x.localName === 'hui-view');
    const vw = v && v.getBoundingClientRect ? v.getBoundingClientRect().width - 32 : 0, avail = Math.max(this.clientWidth || 0, vw);
    const nav = this.shadowRoot.querySelector('nav'), over = !!nav && avail > 0 && nav.offsetWidth > avail + 1;
    if (over && n > 2) { this._n = n - 1; this._render(); return true; }
    if (over && this._c.actions.length && !this._compact) { this._compact = true; this._render(); return true; }
    return false;
  }

  /* ecrãs largos: a barra fica presa ao topo quando a página rola (equivalente a sticky, sem depender dos contentores do HA) */
  _stick() {
    const w = this.shadowRoot.querySelector('.wrap');
    if (!w || !this.getBoundingClientRect) return;
    const on = this.isConnected && !this._edit && this._c && this._wide();
    const r = on ? this.getBoundingClientRect() : null;
    const top = this._top || 0;
    if (r && r.width && r.top < top) {
      if (!w.classList.contains('stuck')) { this.style.minHeight = w.offsetHeight + 'px'; w.classList.add('stuck'); }
      w.style.top = top ? top + 'px' : 'env(safe-area-inset-top, 0px)';
      const vr = this._view && this._view.getBoundingClientRect ? this._view.getBoundingClientRect() : null, b = vr && vr.width >= r.width ? vr : r;
      w.style.left = b.left + 'px'; w.style.width = b.width + 'px';
    } else if (w.classList.contains('stuck') || this.style.minHeight) {
      w.classList.remove('stuck'); w.style.top = ''; w.style.left = ''; w.style.width = ''; this.style.minHeight = '';
    }
  }

  _click(e) {
    const path = e.composedPath ? e.composedPath() : [e.target];
    const el = path.find((x) => x && x.dataset && (x.dataset.go != null || x.dataset.more != null || x.dataset.act || x.dataset.close != null || x.dataset.assist != null));
    if (!el) return;
    if (el.dataset.assist != null) { e.preventDefault(); this._close(); this._assist(this._c.actions[Number(el.dataset.assist)]); return; }
    if (el.dataset.go != null) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      this._go(this._c.items[Number(el.dataset.go)].path);
    } else if (el.dataset.more != null) {
      if (this._open) this._close(); else this._openMenu();
    } else if (el.dataset.close != null) {
      this._close();
    } else if (el.dataset.act === 'menu') {
      this._close();
      this.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true }));
    } else if (el.dataset.act === 'edit') {
      this._close();
      const lv = this._root && this._root.lovelace;
      if (lv && typeof lv.setEditMode === 'function') { lv.setEditMode(true); [0, 60, 500].forEach((t) => setTimeout(() => this._layout(), t)); }
      else window.location.assign(window.location.pathname + '?edit=1');
    }
  }

  /* menu "Mais": vive em document.body (camada de topo quando o browser suporta popover), para nunca ficar atrás de outros cartões */
  _openMenu() {
    this._close();
    const btn = this.shadowRoot.querySelector('[data-more]'), nav = this.shadowRoot.querySelector('nav');
    if (!btn || typeof document === 'undefined' || !document.body) return;
    const c = this._c, wide = this._wide(), cur = this._cur;
    const row = (x) => `<a class="row${x.i === cur ? ' on' : ''}" role="menuitem" href="${esc(x.it.path)}" data-go="${x.i}"${x.i === cur ? ' aria-current="page"' : ''}><ha-icon icon="${esc(x.it.icon)}"></ha-icon><span>${esc(x.it.name)}</span></a>`;
    const extras = [];
    if (c.show_menu) extras.push('<button type="button" class="row" role="menuitem" data-act="menu"><ha-icon icon="mdi:menu"></ha-icon><span>Menu lateral</span></button>');
    if (c.show_edit && this._admin) extras.push('<button type="button" class="row" role="menuitem" data-act="edit"><ha-icon icon="mdi:pencil-outline"></ha-icon><span>Editar painel</span></button>');
    const rest = this._rest || [];
    const ov = document.createElement('div');
    ov.setAttribute('data-casa-nav-menu', '');
    const cs = getComputedStyle(this);
    MENU_VARS.forEach((v) => { const val = cs.getPropertyValue(v); if (val) ov.style.setProperty(v, val.trim()); });
    const sr = ov.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${MENU_CSS}</style><div class="scrim${wide ? '' : ' dim'}" data-close></div><div class="menu${wide ? '' : ' sheet'}" role="menu" aria-label="Mais destinos" style="font-family:${esc(cs.fontFamily || 'inherit')};color:${esc(cs.color || 'inherit')}">${rest.map(row).join('')}${rest.length && extras.length ? '<div class="sep"></div>' : ''}${extras.join('')}</div>`;
    sr.addEventListener('click', (e) => this._click(e));
    const menu = sr.querySelector('.menu'), b = btn.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    if (wide) {
      const below = H - b.bottom - 18, above = b.top - 18;
      menu.style.right = Math.max(8, Math.round(W - b.right)) + 'px';
      if (below >= 260 || below >= above) { menu.style.top = Math.round(b.bottom + 10) + 'px'; menu.style.maxHeight = Math.max(120, below) + 'px'; }
      else { menu.style.bottom = Math.round(H - b.top + 10) + 'px'; menu.style.maxHeight = Math.max(120, above) + 'px'; }
    } else {
      const n = (nav || btn).getBoundingClientRect();
      menu.style.left = Math.round(n.left + 8) + 'px'; menu.style.right = Math.round(Math.max(0, W - n.right) + 8) + 'px';
      menu.style.bottom = Math.round(H - n.top + 8) + 'px'; menu.style.maxHeight = Math.max(120, n.top - 16) + 'px';
    }
    document.body.appendChild(ov);
    if (typeof ov.showPopover === 'function') { try { ov.setAttribute('popover', 'manual'); ov.showPopover(); } catch (err) { ov.removeAttribute('popover'); } }
    this._ov = ov; this._open = true;
    btn.setAttribute('aria-expanded', 'true');
    const f = sr.querySelector('.row.on') || sr.querySelector('.row'); if (f && f.focus) f.focus({ preventScroll: true });
  }

  /* abre o diálogo Assist do HA pelo código do próprio frontend: 1) evento hass-action (ação 'assist'); 2) cartão nativo escondido com a mesma tap_action;
     repete sem start_listening; considera-se aberto quando o frontend dispara show-dialog do ha-voice-command-dialog (ou o diálogo existe) */
  async _assist(it) {
    if (this._busy || !it || !it.assist) return;
    this._busy = true;
    const a = it.assist, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let seen = false;
    const onDlg = (e) => { if (e && e.detail && e.detail.dialogTag === 'ha-voice-command-dialog') seen = true; };
    const dom = () => { try { const ha = document.querySelector('home-assistant'); return !!(ha && ha.shadowRoot && ha.shadowRoot.querySelector('ha-voice-command-dialog')); } catch (e) { return false; } };
    const had = dom(), isOpen = () => seen || (!had && dom());
    const act = (listen) => { const t = { action: 'assist' }; if (a.pipeline_id) t.pipeline_id = String(a.pipeline_id); if (listen) t.start_listening = true; return t; };
    const viaEvent = async (t) => { this.dispatchEvent(new CustomEvent('hass-action', { bubbles: true, composed: true, detail: { config: { tap_action: t }, action: 'tap' } })); };
    const viaCard = async (t) => {
      if (!window.loadCardHelpers) return;
      const hp = await window.loadCardHelpers(), card = hp.createCardElement({ type: 'button', name: 'Assist', icon: 'mdi:microphone-outline', tap_action: t });
      card.hass = this._hass; card.style.display = 'none'; card.setAttribute('aria-hidden', 'true');
      this.appendChild(card);
      try {
        if (card.updateComplete) await card.updateComplete;
        const inner = card.shadowRoot && card.shadowRoot.querySelector('ha-card');
        if (inner) inner.dispatchEvent(new CustomEvent('action', { detail: { action: 'tap' } }));
        await wait(400);
      } finally { card.remove(); }
    };
    const listen = a.start_listening !== false;
    const steps = []; let how = '';
    (listen ? [true, false] : [false]).forEach((l) => { if (a.via !== 'card') steps.push(['event' + (l ? '+listen' : ''), () => viaEvent(act(l))]); if (a.via !== 'event') steps.push(['card' + (l ? '+listen' : ''), () => viaCard(act(l))]); });
    window.addEventListener('show-dialog', onDlg, true);
    try {
      for (const step of steps) {
        if (isOpen()) break;
        try { await step[1](); } catch (err) { /* tenta o seguinte */ }
        for (let k = 0; k < 6 && !isOpen(); k++) await wait(150);
        if (isOpen()) how = step[0];
      }
      if (!isOpen()) console.warn('casa-nav-card: não foi possível abrir o assistente (Assist)');
    } finally { window.removeEventListener('show-dialog', onDlg, true); this._busy = false; }
    return how;
  }

  _close() {
    this._open = false;
    if (this._ov) { const ov = this._ov; this._ov = null; if (ov.parentNode) ov.parentNode.removeChild(ov); }
    const btn = this.shadowRoot.querySelector('[data-more]'); if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  _go(path) {
    this._close();
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
    }
    this._render();
  }

  /* ---- integração com a página: topo fixo ao rolar (largo) e espaço para a barra de baixo (telemóvel) ---- */
  _chain() {
    const out = []; let el = this;
    for (let i = 0; i < 60 && el; i++) { out.push(el); const r = el.getRootNode ? el.getRootNode() : null; el = el.parentElement || (r && r.host) || null; }
    return out;
  }
  _set(el, prop, val) { if (!el || !el.style) return; this._styled.push([el, prop, el.style.getPropertyValue(prop)]); el.style.setProperty(prop, val); }
  _unstyle() { this._styled.reverse().forEach(([el, p, v]) => { if (v) el.style.setProperty(p, v); else el.style.removeProperty(p); }); this._styled = []; }

  _layout() {
    if (!this._c || !this.isConnected || typeof getComputedStyle !== 'function') return;
    this._unstyle();
    const chain = this._chain();
    const by = (n) => chain.find((x) => x.localName === n);
    const root = by('hui-root'), view = by('hui-sections-view') || by('hui-view');
    this._root = root || null; this._view = view || null;
    syncHeader(this._root);
    const header = root && root.shadowRoot ? root.shadowRoot.querySelector('.header') : null;
    if (header && !this._ro && typeof ResizeObserver === 'function') { this._ro = new ResizeObserver(() => this._layout()); this._ro.observe(header); }
    const hs = header ? getComputedStyle(header) : null, hr = hs && hs.display !== 'none' && hs.visibility !== 'hidden' && header.getBoundingClientRect ? header.getBoundingClientRect() : null;
    this._top = hr && hr.height > 0 && hr.top <= 0 ? Math.max(0, Math.round(hr.bottom)) : 0;
    this._left = '';
    const card = by('hui-card');
    if (card && !this._edit) { this._set(card, 'position', 'relative'); this._set(card, 'z-index', '3'); }
    const nav = this.shadowRoot.querySelector('nav');
    if (!this._edit && !this._wide()) {
      if (view) this._set(view, 'padding-bottom', BOTTOM_SPACE);
      const hd = card && card.parentElement;
      if (hd && hd.classList && hd.classList.contains('heading')) { this._set(hd, 'min-height', '0'); this._set(hd, 'margin-bottom', '-16px'); }
      if (root && root.getBoundingClientRect) this._left = Math.max(0, Math.round(root.getBoundingClientRect().left)) + 'px';
    }
    if (nav) nav.style.left = this._left;
    this._stick();
  }
}
if (!customElements.get('casa-nav-card')) customElements.define('casa-nav-card', CasaNavCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'casa-nav-card')) window.customCards.push({ type: 'casa-nav-card', name: 'Casa · Navegação', description: 'Barra de navegação entre as páginas da casa (topo em ecrãs largos, em baixo no telemóvel).' });
})();

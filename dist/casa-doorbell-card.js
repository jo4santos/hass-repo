/* casa-doorbell-card v0.3.0 — campainha com vídeo e botões da casa (dnd = Não incomodar; links = trocar de campainha;
   history = cartão do separador Histórico, criado só ao abrir; launcher:false = sem mosaico, só a janela). O vídeo é um advanced-camera-card real
   (criado pelos card helpers com a configuração em camera_card, menu próprio escondido por menu.style: none); os botões
   deste cartão mandam-lhe as ações dele (evento ll-custom no próprio elemento, formato fire-dom-event + advanced_camera_card_action).
   mode: 'inline' | 'popup' (janela própria que abre com hash); preload = vídeo ligado antes de abrir;
   mic_mode: 'always' (por omissão: microfone ligado em silêncio enquanto a janela está aberta; falar e desligar só tiram/põem o silêncio,
   sem renegociar o vídeo) | 'open' (liga o microfone em silêncio ao abrir) | 'answer' (liga só ao atender, como o pop-up atual);
   com preload o modo 'always' passa a 'open' para o microfone nunca ficar captado com a janela fechada.
   ring_entity = entidade «a tocar» (só leitura); dismiss_actions = ações ao atender/rejeitar; open_on_ring = abre sozinho ao tocar;
   gates + gates_enabled (false = mosaicos desativados); vigia do vídeo: recupera sozinho se o vídeo parar (máx. 3 por abertura);
   debug = linha de tempos e interruptores de comparação. Não altera nem substitui nenhum cartão existente. */
(() => {
const VER = '0.3.1';
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ACC = 'advanced-camera-card', SIG = 'casa_doorbell';
const MODES = ['always', 'open', 'answer'], MODE_PT = { always: 'sempre ligado', open: 'ligar ao abrir', answer: 'ligar ao atender' };
const now = () => performance.now();
const fmt = (ms) => ms == null ? '—' : ms < 995 ? Math.round(ms) + ' ms' : (ms / 1000).toFixed(1).replace('.', ',') + ' s';
const clone = (o) => JSON.parse(JSON.stringify(o == null ? {} : o));
const CSS = `
:host{display:block;container-type:inline-size;--db-p:var(--card-background-color);--db-t:var(--secondary-background-color);--vmax:10000px}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled,button[aria-disabled="true"]{opacity:.45;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
ha-icon{--mdc-icon-size:22px;flex:none;display:inline-flex}
[hidden]{display:none!important}
.launch{display:flex;align-items:center;gap:12px;height:72px;padding:0 14px 0 12px;border-radius:16px;background:var(--db-p);width:100%;box-sizing:border-box;color:var(--primary-text-color)}
.launch.ring{background:var(--primary-color);color:#181926}
.launch.ring .ic{background:#181926;color:var(--primary-color)}
.launch.ring .cap{color:inherit}
dialog{border:0;padding:16px;margin:12px auto auto;box-sizing:border-box;width:min(1180px,calc(100vw - 24px));max-width:none;max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow:auto;border-radius:20px;background:var(--primary-background-color,#181926);color:var(--primary-text-color);container-type:inline-size;--vmax:calc(100vh - 170px)}
dialog:focus{outline:none}
dialog::backdrop{background:rgba(17,17,27,.82)}
/* fechada com o vídeo ligado antes de abrir: fica com tamanho real mas invisível; sem isso não existe */
dialog:not([open]){display:block;position:fixed;left:0;top:0;margin:0;width:480px;max-height:420px;overflow:hidden;visibility:hidden;pointer-events:none;z-index:-1}
:host([cold]) dialog:not([open]){display:none}
.root{display:flex;flex-direction:column;gap:12px;color:var(--primary-text-color);min-width:0}
.hd{display:flex;align-items:center;gap:12px;min-height:44px;min-width:0}
.ic{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--db-t);color:var(--secondary-text-color)}
.ic.sel{background:var(--primary-color);color:#181926}.ic.live{background:#a6da95;color:#181926}
.tx{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.ttl{font-size:20px;font-weight:600;line-height:26px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cap{font-size:14px;line-height:18px;height:18px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cap.sel{color:var(--primary-color);font-weight:600}.cap.red{color:#ed8796}.cap.good{color:#a6da95}
.hb{flex:none;height:44px;min-width:44px;padding:0 11px;border-radius:12px;background:var(--db-p);font-size:14px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;box-sizing:border-box}
.hb.on{background:var(--primary-color);color:#181926}
.hb .l{display:none}
.seg{flex:none;display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--db-p)}
.seg button{flex:1 1 0;min-width:0;min-height:44px;padding:4px 6px;border-radius:10px;font-size:14px;font-weight:500;text-align:center}
.seg .on{background:var(--primary-text-color);color:var(--card-background-color,#24273a);font-weight:600}
.hist{min-width:0;min-height:240px}
.hist>*{display:block}
:host([bare]){height:0;overflow:visible}
.grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start;min-width:0}
.vid{position:relative;justify-self:center;width:min(100%,calc(var(--vmax) * 16 / 9));aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#11111b;min-width:0}
.cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#b8c0e0;font-size:14px;--mdc-icon-size:32px}
.slot{position:absolute;inset:0;--ha-card-border-width:0px;--ha-card-border-radius:12px;--ha-card-box-shadow:none}
.slot>*{display:block;width:100%;height:100%}
.re{position:absolute;right:8px;bottom:8px;z-index:3;height:44px;min-width:44px;padding:0 11px;border-radius:12px;background:rgba(24,25,38,.72);color:#cad3f5;font-size:14px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap}
.re span{display:none}
.re.bad{background:#ed8796;color:#181926;padding:0 14px 0 11px}.re.bad span{display:inline}
.side{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:16px;background:var(--db-p);min-width:0;box-sizing:border-box}
.btns{display:flex;gap:12px;height:96px}
.big{flex:1 1 0;min-width:0;height:96px;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:22px;font-weight:600;color:#181926;--mdc-icon-size:32px;white-space:nowrap;transition:transform .08s}
.big:not(:disabled):active{transform:scale(.98)}
.big.ok{background:#a6da95}.big.no{background:#ed8796}
.tgs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.tg{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;height:96px;padding:12px 14px;border-radius:12px;background:var(--db-t);min-width:0;box-sizing:border-box;--mdc-icon-size:28px}
.tg.on{background:var(--primary-text-color);color:var(--card-background-color)}
.tg .nm{font-size:16px;font-weight:600;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.tg .st{font-size:13px;line-height:16px;color:var(--secondary-text-color);font-weight:400}
.tg.on .st{color:inherit;opacity:.8}
.tg .lb{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:100%}
.gates{display:flex;flex-direction:column;gap:8px;min-width:0}
.gcam{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#11111b}
.gcam img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.gate{position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;height:72px;padding:0 14px 0 12px;border-radius:12px;background:var(--db-t);width:100%;box-sizing:border-box;min-width:0}
.gate .ic{background:var(--db-p)}
.gate .nm{font-size:16px;font-weight:600;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gate .st{font-size:13px;line-height:16px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gate.warn{background:var(--error-color,#ed8796);color:#181926}
.gate.warn .ic{background:#181926;color:var(--error-color,#ed8796)}
.gate.warn .st{color:inherit;opacity:.85}
.gate.warn::after{content:'';position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(0,0,0,.35);transform-origin:left;animation:cd var(--cd,9s) linear forwards}
@keyframes cd{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.dbg{display:flex;flex-direction:column;gap:6px;min-width:0}
.dbg pre,.ldbg{margin:0;font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;color:var(--secondary-text-color);white-space:pre-wrap;word-break:break-word}
.ldbg{margin:8px 4px 0}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{height:32px;padding:0 12px;border-radius:999px;background:var(--db-p);font-size:12px;font-weight:500;display:inline-flex;align-items:center;white-space:nowrap}
.chip.on{background:var(--primary-text-color);color:var(--card-background-color)}
@container (min-width:760px){
  .hb .l{display:inline}
  .hb{padding:0 14px 0 11px}
  .grid{grid-template-columns:minmax(0,1fr) minmax(300px,340px);align-items:stretch}
  .vid{align-self:start}
}
@container (max-width:420px){
  .big{font-size:19px;gap:8px;--mdc-icon-size:26px}
  .ttl{font-size:18px}
}
`;

class CasaDoorbellCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false; this._cam = null; this._camBusy = false; this._built = false;
    this._mic = { connected: false, muted: true }; this._talking = false; this._sound = false; this._pending = null; this._msg = null;
    this._sigOk = false; this._arm = null; this._T = {}; this._n = { loads: 0, reloads: 0, reTalk: 0, sent: 0 };
    this._wd = { count: 0, stage: 0, bad: null, gave: false };
    this._onLoc = () => this._loc();
  }

  setConfig(c) {
    if (!c || !c.camera_card || !Array.isArray(c.camera_card.cameras)) throw new Error('casa-doorbell-card: indique "camera_card" (configuração do advanced-camera-card, com "cameras")');
    if (c.mode === 'popup' && !/^#[\w-]+$/.test(String(c.hash || ''))) throw new Error('casa-doorbell-card: em mode: popup indique "hash" (ex.: "#campainha-proto")');
    const j = JSON.stringify(c);
    if (j === this._cfgJson) return;
    this._cfgJson = j; this._c = c; this._popup = c.mode === 'popup';
    this._kill();
    this._build();
    if (this.isConnected) this._start();
  }
  getCardSize() { return this._popup ? 2 : 8; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  /* preferências de comparação (só com debug; ficam neste aparelho) */
  _ovKey() { return 'casa-doorbell:v2:' + (this._c.hash || this._c.name || 'x'); }
  _ov() { if (!this._c.debug) return {}; try { return JSON.parse(window.localStorage.getItem(this._ovKey()) || '{}') || {}; } catch (e) { return {}; } }
  _ovSet(k, v) { const o = this._ov(); o[k] = v; try { window.localStorage.setItem(this._ovKey(), JSON.stringify(o)); } catch (e) { /* sem armazenamento */ } }
  /* modo do microfone e vídeo antes de abrir; com o vídeo ligado antes de abrir nunca se usa «sempre ligado» (o microfone ficaria captado com a janela fechada) */
  _pref() {
    const o = this._ov(), c = this._c;
    const asked = MODES.includes(o.mode) ? o.mode : MODES.includes(c.mic_mode) ? c.mic_mode : 'always';
    const pre = this._popup && (o.pre != null ? !!o.pre : !!c.preload);
    return { asked, pre, mode: pre && asked === 'always' ? 'open' : asked };
  }
  _keep() { return this._open || this._pref().pre; }

  connectedCallback() { if (this._c) this._start(); }
  disconnectedCallback() {
    ['location-changed', 'popstate', 'hashchange'].forEach((e) => window.removeEventListener(e, this._onLoc));
    clearInterval(this._iv); this._iv = null; clearTimeout(this._armT); this._arm = null; clearTimeout(this._pendT); this._pending = null; clearTimeout(this._killT); this._killT = null;
    // ao sair da página o microfone é largado; o elemento do vídeo é deitado fora e criado de novo quando se voltar
    if (this._cam) { this._send('microphone_mute'); this._send('mute'); this._send('microphone_disconnect'); }
    this._kill();
    const d = this._dlg;
    if (d && d.open) { try { d.close(); } catch (e) { /* já fechada */ } }
    this._open = false;
  }
  _start() {
    this._T.conn = now();
    if (this._popup) {
      ['location-changed', 'popstate', 'hashchange'].forEach((e) => { window.removeEventListener(e, this._onLoc); window.addEventListener(e, this._onLoc); });
      this._loc();
    } else { this._open = true; this._T.open = now(); this._T.openVideo = null; this._wdReset(); }
    if (this._popup && !this._open && this._hass && this._ringing()) this._rang();   // página carregada já com a campainha a tocar
    this.toggleAttribute('cold', this._popup && !this._pref().pre);
    if (this._keep()) this._mkCam();
    clearInterval(this._iv);
    this._iv = setInterval(() => this._tick(), 400);
    this._sync();
  }

  set hass(h) {
    const prev = this._hass; this._hass = h;
    if (!this._c) return;
    if (this._cam) this._cam.hass = h;   // o mesmo elemento recebe o hass novo; nunca é recriado por causa disto
    else if (this.isConnected && this._keep()) this._mkCam();
    if (this._histEl) this._histEl.hass = h;
    const dn = this._dndId();
    if (dn && prev && (prev.states[dn] || {}).state !== (h.states[dn] || {}).state) this._sync();
    const re = this._c.ring_entity;
    if (re) {
      const a = prev && prev.states[re] ? prev.states[re].state : null, b = h.states[re] ? h.states[re].state : null;
      if (a !== b) {
        if (a !== 'on' && b === 'on') this._rang();
        this._sync();
      }
    }
    if (!prev) this._sync();
  }
  _ringing() { const re = this._c.ring_entity, s = re && this._hass ? this._hass.states[re] : null; return !!s && s.state === 'on'; }
  _rang() {
    this._T.ring = now(); this._log('a tocar');
    if (this._tab === 'hist') this._setTab('live');
    if (this._c.open_on_ring === false || !this.isConnected) return;
    if (this._popup) { if (!this._open) this._reqOpen(); }
    else if (this._c.open_hash && location.hash !== this._c.open_hash) this._nav(this._c.open_hash, true);
  }

  /* ---------- abrir / fechar (mode: popup) ---------- */
  _nav(hash, push) {
    const url = location.pathname + location.search + (hash || '');
    if (push) history.pushState(null, '', url); else history.replaceState(history.state, '', url);
    window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: !push } }));
  }
  _reqOpen() { this._pushed = true; this._nav(this._c.hash, true); }
  _reqClose() {
    if (location.hash !== this._c.hash) return this._hide();
    if (this._pushed) { this._pushed = false; history.back(); } else this._nav('', false);
  }
  _loc() {
    if (!this._popup || !this._built) return;
    const want = location.hash === this._c.hash;
    if (want && !this._open) this._show(); else if (!want && this._open) this._hide();
  }
  _show() {
    if (this._killT) { clearTimeout(this._killT); this._killT = null; this._kill(); }   // reabriu antes de o anterior ser deitado fora: começa limpo
    this._open = true; this._T.open = now(); this._T.openVideo = this._playing() ? 0 : null; this._wdReset();
    try { if (!this._dlg.open) this._dlg.showModal(); } catch (e) { this._dlg.setAttribute('open', ''); }
    try { this._dlg.focus({ preventScroll: true }); } catch (e) { /* nada */ }
    this._mkCam(); this._openMic(); this._gcams(true); this._sync();
    this._log('aberto', this._T.openVideo === 0 ? 'vídeo já pronto' : 'vídeo por carregar');
  }
  _hide() {
    this._open = false; this._pushed = false;
    // nunca fica microfone nem som ligados numa janela fechada
    if (this._cam) {
      const m = this._pref().mode;
      this._run(m === 'answer' ? (this._talking || this._pending || this._mic.connected ? ['microphone_disconnect', 'mute'] : ['mute']) : ['microphone_mute', 'mute', 'microphone_disconnect']);
    }
    this._pending = null; clearTimeout(this._pendT); this._talking = false; this._micReq = false; this._mic = { connected: false, muted: true }; this._armSet(null);
    try { if (this._dlg.open) this._dlg.close(); } catch (e) { /* já fechada */ }
    this._histDrop();
    // sem vídeo antes de abrir: o elemento é deitado fora (depois de largar o microfone) e a próxima abertura cria um novo
    if (!this._pref().pre) { clearTimeout(this._killT); this._killT = setTimeout(() => { this._killT = null; if (!this._open) this._kill(); }, 400); }
    this._sync();
  }
  /* modo «ligar ao abrir»: pede o microfone (em silêncio) logo que a janela abre e o cartão está pronto, para a renegociação acontecer antes de atender */
  _openMic() {
    if (!this._open || !this._cam || this._micReq || this._pref().mode !== 'open') return;
    const T = this._T;
    if (!(this._sigOk || T.video != null || (T.el != null && now() - T.el > 3000))) return;
    this._micReq = true; this._actAt = Date.now();
    this._send('microphone_connect');
  }

  /* ---------- o advanced-camera-card ---------- */
  _variants() {
    const base = clone(this._c.camera_card), m = this._pref().mode;
    base.type = 'custom:' + ACC;
    base.menu = Object.assign({}, base.menu, { style: 'none' });   // os botões são os nossos; o menu do cartão fica escondido pela opção dele
    base.live = Object.assign({}, base.live);
    const mic = Object.assign({}, base.live.microphone);
    mic.always_connected = m === 'always';
    if (m !== 'answer') mic.disconnect_seconds = 0;   // nada desliga o microfone a meio nem depois da conversa (só o fecho da janela)
    base.live.microphone = mic;
    if (this._c.sync === false) return [['sem sinais', base]];
    const fire = (o) => Object.assign({ action: 'fire-dom-event' }, o);
    const sig = [
      { conditions: [{ condition: 'microphone', connected: true }], actions: [fire({ [SIG]: 'mic', connected: true })], actions_not: [fire({ [SIG]: 'mic', connected: false })] },
      { conditions: [{ condition: 'microphone', muted: false }], actions: [fire({ [SIG]: 'mic', muted: false })], actions_not: [fire({ [SIG]: 'mic', muted: true })] },
    ];
    const own = Array.isArray(base.automations) ? base.automations : [];
    return [
      ['microfone + arranque', Object.assign({}, base, { automations: own.concat(sig, [{ conditions: [{ condition: 'initialized' }], actions: [fire({ [SIG]: 'init' })] }]) })],
      ['microfone', Object.assign({}, base, { automations: own.concat(sig) })],
      ['sem sinais', base],
    ];
  }
  async _mkCam() {
    if (this._cam || this._camBusy || !this._hass || !this._built) return;
    this._camBusy = true;
    const json = this._cfgJson, T = this._T;
    T.created = now(); T.el = T.img = T.video = null; this._n.loads = 0; this._sigOk = false; this._variant = null; this._self = null;
    try {
      if (!window.loadCardHelpers) throw new Error('loadCardHelpers');
      const hp = await window.loadCardHelpers();
      if (!customElements.get(ACC)) await Promise.race([customElements.whenDefined(ACC), new Promise((r) => setTimeout(r, 4000))]);
      if (json !== this._cfgJson || this._cam || !this.isConnected || !this._keep()) return;
      let el = null, tag = '';
      const vs = customElements.get(ACC) ? this._variants() : this._variants().slice(-1);
      for (const [name, cfg] of vs) {
        try { el = hp.createCardElement(cfg); } catch (e) { el = null; }
        tag = name;
        if (el && el.localName === ACC) break;   // configuração aceite pelo cartão instalado
      }
      if (!el) throw new Error('createCardElement');
      this._variant = el.localName === ACC ? tag : 'erro';
      el.addEventListener('ll-rebuild', (ev) => { ev.stopPropagation(); if (this._cam === el) { this._kill(); this._mkCam(); } }, { once: true });
      el.hass = this._hass;
      this._cam = el;
      this._slot.appendChild(el);
      T.el = now();
      this._cover.hidden = true;
      this._log('cartão criado', fmt(T.el - T.created), 'configuração: ' + this._variant, 'microfone: ' + this._pref().mode);
      if (this._c.debug) setTimeout(() => this._selfTest(), 1500);
    } catch (e) {
      this._cover.hidden = false;
      this._cover.querySelector('span').textContent = 'Não foi possível carregar o vídeo.';
    } finally { this._camBusy = false; this._sync(); }
  }
  _kill() {
    if (this._cam) { try { this._cam.remove(); } catch (e) { /* nada */ } }
    this._cam = null; this._video = null; this._so = null; this._hadVideo = false; this._alive = false; this._micReq = false;
    this._talking = false; this._pending = null; clearTimeout(this._pendT); this._mic = { connected: false, muted: true }; this._sound = false;
    this._wd.stage = 0; this._wd.bad = null;
    if (this._cover) { this._cover.hidden = false; this._cover.querySelector('span').textContent = 'A carregar o vídeo…'; }
  }
  /* envia uma ação ao advanced-camera-card: o mesmo evento que os elementos dele usam (ll-custom), disparado no próprio elemento */
  _send(name, extra) {
    if (!this._cam) return false;
    const detail = Object.assign({ action: this._c.action_form || 'fire-dom-event', advanced_camera_card_action: name }, extra);
    this._cam.dispatchEvent(new CustomEvent('ll-custom', { detail, bubbles: false, composed: false }));
    this._n.sent++; this._log('ação →', name);
    return true;
  }
  /* lista de ações no formato do próprio cartão: 'nome' | {action: custom:advanced-camera-card-action, advanced_camera_card_action} | {action: perform-action, perform_action, data, target} */
  _run(list) {
    for (const a of list || []) {
      if (typeof a === 'string') { this._send(a); continue; }
      if (!a || typeof a !== 'object') continue;
      if (a.action === 'perform-action' || a.action === 'call-service') {
        const [d, s] = String(a.perform_action || a.service || '').split('.');
        if (d && s && this._hass) this._hass.callService(d, s, a.data || a.service_data || {}, a.target);
      } else if (a.advanced_camera_card_action) {
        const { action, advanced_camera_card_action, ...rest } = a;
        this._send(advanced_camera_card_action, rest);
      }
    }
  }
  _signal(d) {
    this._sigOk = true;
    if (d[SIG] === 'init') { this._log('sinal ← arranque'); this._openMic(); return; }
    if (d[SIG] !== 'mic') return;
    if ('connected' in d) {
      this._mic.connected = !!d.connected;
      if (!d.connected) { this._mic.muted = true; this._talking = false; }
    }
    if ('muted' in d) {
      this._mic.muted = !!d.muted;
      if (!d.muted && this._pending) { this._T.mic = now(); this._pending = null; clearTimeout(this._pendT); this._talking = true; this._assumed = false; }
    }
    this._log('sinal ← microfone', JSON.stringify(this._mic));
    this._sync();
  }
  /* Falar / Atender: em todos os modos é só «tirar o silêncio»; nos modos sempre ligado / ligar ao abrir o microfone já está negociado */
  _talk(ring) {
    if (!this._cam) return;
    this._T.answer = now(); this._T.mic = null; this._msg = null; this._actAt = Date.now(); this._n.reTalk = 0; this._lastWhy = '';
    this._pending = { t: now() };
    clearTimeout(this._pendT);
    if (ring) this._run(this._c.dismiss_actions);
    this._send('microphone_unmute');
    this._pendT = setTimeout(() => {
      if (!this._pending) return;
      this._pending = null;
      if (this._sigOk) { this._msg = { t: 'O microfone não ligou. Veja a permissão do microfone.', until: Date.now() + 8000 }; this._talking = false; this._send('microphone_mute'); }
      else { this._talking = true; this._assumed = true; this._mic = { connected: true, muted: false }; }   // sem sinais do cartão: assume-se que ligou
      this._sync();
    }, 7000);
    this._sync();
  }
  /* Desligar: sem renegociar nada (silêncio no microfone e no som); só o modo «ligar ao atender» desliga mesmo o microfone, como hoje */
  _hang() {
    this._actAt = Date.now();
    this._run(this._pref().mode === 'answer' ? ['microphone_disconnect', 'mute'] : ['microphone_mute', 'mute']);
    this._pending = null; clearTimeout(this._pendT);
    this._talking = false; this._mic.muted = true; this._sound = false; this._sndAt = Date.now();
    this._sync();
  }
  /* auto-teste sem efeitos: pede ao cartão a ação «log» e confirma que a mensagem aparece na consola */
  _selfTest() {
    if (!this._cam || this._self) return;
    const nonce = 'casa-doorbell-selftest-' + Math.random().toString(36).slice(2, 8), t0 = now(), orig = {}, st = this._self = { state: 'à espera' };
    const done = (ok) => { if (st.done) return; st.done = true; Object.keys(orig).forEach((k) => { console[k] = orig[k]; }); st.state = ok ? 'aceites (' + fmt(now() - t0) + ')' : 'sem resposta'; this._dbgUi(); };
    ['log', 'info', 'debug', 'warn'].forEach((k) => {
      orig[k] = console[k];
      console[k] = function (...a) { try { if (a.some((x) => String(x).includes(nonce))) done(true); } catch (e) { /* nada */ } return orig[k].apply(console, a); };
    });
    this._send('log', { message: nonce, level: 'info' });
    setTimeout(() => done(false), 2500);
  }

  /* ---------- vídeo: primeira imagem, recargas, estado do som (lido do próprio <video>) e vigia ---------- */
  _findVideo() {
    const stack = [this._cam]; let n = 0;
    while (stack.length && n++ < 5000) {
      const el = stack.pop();
      if (!el) continue;
      if (el.tagName === 'VIDEO') return el;
      if (el.shadowRoot) stack.push(el.shadowRoot);
      const ch = el.children;
      if (ch) for (let i = 0; i < ch.length; i++) stack.push(ch[i]);
    }
    return null;
  }
  _playing() { const v = this._video; return !!v && v.isConnected && v.readyState >= 2 && v.videoWidth > 0 && !v.paused; }
  /* a correr de verdade: a tocar, com pista de vídeo viva e o relógio do vídeo a andar */
  _aliveNow() {
    if (!this._playing()) return false;
    const v = this._video, so = v.srcObject;
    if (so && typeof so.getVideoTracks === 'function') { const t = so.getVideoTracks()[0]; if (!t || t.readyState !== 'live' || t.muted) return false; }
    if (v.currentTime !== this._ct) { this._ct = v.currentTime; this._ctAt = Date.now(); }
    return Date.now() - (this._ctAt || 0) < 4000;
  }
  /* o que se vê como «recarregar»: o <video> foi trocado, mudou de origem ou recomeçou a carregar */
  _reload(why) {
    if (this._reAt && Date.now() - this._reAt < 1500) return;
    this._reAt = Date.now(); this._n.reloads++; this._lastWhy = why;
    if (this._actAt && Date.now() - this._actAt < 8000) this._n.reTalk++;
    this._log('vídeo recarregou (' + why + ')');
  }
  _track() {
    let v = this._video;
    if (!v || !v.isConnected) v = this._findVideo();
    if (v !== this._video) {
      if (v && this._hadVideo) this._reload('elemento trocado');
      this._video = v;
      if (v) {
        this._hadVideo = true; this._so = v.srcObject; this._ct = null; this._ctAt = Date.now();
        v.addEventListener('loadstart', () => { if (this._video === v && v._casaPlayed) this._reload('recomeçou a carregar'); });
      }
    } else if (v && v.srcObject !== this._so) { if (this._so) this._reload('origem trocada'); this._so = v.srcObject; }
  }
  _wdReset() { this._wd = { count: 0, stage: 0, bad: null, gave: false }; }
  _recreate(manual) {
    this._log(manual ? 'recarregar vídeo (manual)' : 'vigia: novo elemento');
    if (this._cam) { this._send('microphone_mute'); this._send('microphone_disconnect'); }
    this._kill();
    if (manual) this._wdReset();
    if (this._keep()) this._mkCam();
    this._sync();
  }
  /* vigia: vídeo parado há mais de 4 s (10 s no primeiro arranque) → 1.º ações do cartão (mute, play, live); se em 4 s não voltar → elemento novo; máx. 3 por abertura */
  _watch(alive) {
    const w = this._wd, t = Date.now();
    if (!this._cam || !this._keep() || document.hidden) { w.bad = null; w.stage = 0; return; }
    if (alive) { w.bad = null; w.stage = 0; if (w.gave) { w.gave = false; this._sync(); } return; }
    if (w.bad == null) w.bad = t;
    if (w.stage === 0) {
      if (t - w.bad < (this._T.video == null ? 10000 : this._actAt && t - this._actAt < 10000 ? 8000 : 4000)) return;
      if (w.count >= 3) { if (!w.gave) { w.gave = true; this._sync(); } return; }
      w.count++; w.stage = 1; w.softAt = t;
      this._log('vigia: vídeo parado, a tentar pelo cartão (' + w.count + '/3)');
      if (!this._talking && !this._pending) this._send('mute');   // em silêncio o vídeo pode sempre recomeçar sozinho
      this._send('play'); this._send('live');
      this._sync();
    } else if (t - w.softAt > 4000) { w.stage = 0; w.bad = null; this._recreate(false); }
  }
  _tick() {
    if (!this.isConnected) return;
    if (this._cam) {
      this._track();
      const p = this._playing(), T = this._T;
      if (p) {
        this._video._casaPlayed = true;
        if (T.video == null) { T.video = now(); this._log('vídeo a correr', fmt(T.video - T.created)); }
        if (this._open && T.openVideo == null) T.openVideo = now() - T.open;
      }
      const s = p && !this._video.muted;
      if (s !== this._sound && (p || !this._video) && !(this._sndAt && Date.now() - this._sndAt < 1500)) { this._sound = s; this._sync(); }
      const alive = this._aliveNow();
      if (alive !== this._alive) { this._alive = alive; this._sync(); }
      this._watch(alive);
      this._openMic();
    }
    if (this._msg && Date.now() > this._msg.until) { this._msg = null; this._sync(); }
    if (this._open && (!this._gT || Date.now() - this._gT > (Number(this._c.refresh) || 2) * 1000)) this._gcams(false);
    this._dbgUi();
  }
  _gcams(force) {
    this._gT = Date.now();
    if (!this._hass || (!force && document.hidden)) return;
    this.shadowRoot.querySelectorAll('.gcam img').forEach((img) => {
      const s = this._hass.states[img.dataset.cam], p = s && s.state !== 'unavailable' && s.attributes.entity_picture;
      if (!p) { img.hidden = true; return; }
      const u = p + (p.includes('?') ? '&' : '?') + 't=' + this._gT, pre = new Image();
      pre.onload = () => { img.src = u; img.hidden = false; }; pre.src = u;
    });
  }

  /* ---------- portões (dois toques) ---------- */
  _armSet(i) {
    clearTimeout(this._armT); this._arm = i;
    if (i != null) this._armT = setTimeout(() => { this._arm = null; this._sync(); }, Math.max(3, Number(this._c.confirm_seconds) || 9) * 1000);
    this._sync();
  }
  _gateTap(i) {
    const c = this._c, g = (c.gates || [])[i];
    if (!g || c.gates_enabled !== true || !this._hass) return;   // protótipo: desativado por omissão
    if (this._arm !== i) return this._armSet(i);
    const id = String(g.entity || '');
    if (g.service) { const [d, s] = String(g.service).split('.'); this._hass.callService(d, s, g.data || {}, g.target || (id ? { entity_id: id } : undefined)); }
    else if (id.startsWith('script.')) this._hass.callService('script', 'turn_on', {}, { entity_id: id });
    else if (id.startsWith('cover.')) this._hass.callService('cover', 'toggle', {}, { entity_id: id });
    this._sentAt = Date.now(); this._armSet(null);
  }

  /* ---------- desenho (uma vez) e atualização (sem recriar nada) ---------- */
  _build() {
    const c = this._c, sr = this.shadowRoot, ic = (i) => `<ha-icon icon="${esc(i)}"></ha-icon>`;
    const dndId = this._dndId(), dndName = (c.dnd && c.dnd.name) || 'Não incomodar', links = Array.isArray(c.links) ? c.links : [];
    const launch = c.launcher !== false;
    this.toggleAttribute('bare', this._popup && !launch);
    this._tab = 'live'; this._histEl = null;
    const gates = (c.gates || []).map((g, i) => `${g.camera ? `<div class="gcam"><img alt="" hidden data-cam="${esc(g.camera)}"></div>` : ''}<button class="gate" data-gate="${i}"><span class="ic">${ic(g.icon || 'mdi:gate')}</span><span class="tx"><span class="nm">${esc(g.name || g.entity)}</span><span class="st"></span></span></button>`).join('');
    const body = `<div class="root">
      <div class="hd"><span class="ic" id="hic">${ic(c.icon || 'mdi:doorbell-video')}</span><span class="tx"><span class="ttl">${esc(c.name || 'Campainha')}</span><span class="cap" id="cap" role="status"></span></span>${dndId ? `<button class="hb" id="dnd" aria-pressed="false" aria-label="${esc(dndName)}" title="${esc(dndName)}">${ic('mdi:bell-outline')}<span class="l">${esc(dndName)}</span></button>` : ''}${links.map((l, i) => `<button class="hb" data-link="${i}" aria-label="${esc(l.name || '')}" title="${esc(l.name || '')}">${ic(l.icon || 'mdi:swap-horizontal')}<span class="l">${esc(l.name || '')}</span></button>`).join('')}${this._popup ? `<button class="hb" id="x" aria-label="Fechar" title="Fechar">${ic('mdi:close')}</button>` : ''}</div>
      ${c.history ? `<div class="seg" role="tablist"><button role="tab" data-tab="live" class="on" aria-selected="true">Em direto</button><button role="tab" data-tab="hist" aria-selected="false">Histórico</button></div>` : ''}
      <div class="grid" id="grid">
        <div class="vid"><div class="cover" id="cover">${ic('mdi:video-outline')}<span>A carregar o vídeo…</span></div><div class="slot" id="slot"></div><button class="re" id="re" aria-label="Recarregar vídeo" title="Recarregar vídeo">${ic('mdi:reload')}<span>Recarregar vídeo</span></button></div>
        <div class="side">
          <div class="btns">
            <button class="big ok" id="ans">${ic('mdi:phone')}<span>Atender</span></button>
            <button class="big no" id="rej">${ic('mdi:phone-remove')}<span>Rejeitar</span></button>
            <button class="big no" id="hang" hidden>${ic('mdi:phone-hangup')}<span>Desligar</span></button>
          </div>
          <div class="tgs">
            <button class="tg" id="mic" role="switch" aria-checked="false">${ic('mdi:microphone-off')}<span class="lb"><span class="nm">Microfone</span><span class="st"></span></span></button>
            <button class="tg" id="snd" role="switch" aria-checked="false">${ic('mdi:volume-off')}<span class="lb"><span class="nm">Som</span><span class="st"></span></span></button>
          </div>
          ${gates ? `<div class="gates">${gates}</div>` : ''}
        </div>
      </div>
      ${c.history ? '<div class="hist" id="hist" hidden></div>' : ''}
      ${c.debug ? `<div class="dbg"><div class="chips"><button class="chip" id="cmic"></button><button class="chip" id="cpre"></button><button class="chip" id="ctest">Testar ligação ao cartão</button></div><pre id="dbg"></pre></div>` : ''}
    </div>`;
    sr.innerHTML = `<style>${CSS}</style>` + (this._popup
      ? `<button class="launch" id="launch"${launch ? '' : ' hidden'}><span class="ic">${ic(c.icon || 'mdi:doorbell-video')}</span><span class="tx"><span class="ttl">${esc(c.name || 'Campainha')}</span><span class="cap" id="lcap"></span></span>${ic('mdi:chevron-right')}</button>${c.debug ? '<pre class="ldbg" id="dbg2"></pre>' : ''}<dialog id="dlg" tabindex="-1" aria-label="${esc(c.name || 'Campainha')}">${body}</dialog>`
      : body);
    const $ = (id) => sr.getElementById(id);
    this._dlg = $('dlg'); this._slot = $('slot'); this._cover = $('cover');
    // sinais do cartão (automations → fire-dom-event) sobem a partir do elemento dele; ficam por aqui
    this._slot.addEventListener('ll-custom', (ev) => { const d = ev.detail; if (d && typeof d === 'object' && SIG in d) { ev.stopPropagation(); this._signal(d); } });
    this._slot.addEventListener(ACC + ':media:loaded', (ev) => {
      this._n.loads++;
      const d = ev.detail || {};
      if (Array.isArray(d.technology) && d.technology.length) this._tech = d.technology.join('+');
      if (this._T.img == null) this._T.img = now();
      this._tick();
    });
    $('ans').addEventListener('click', () => this._talk(this._ringing()));
    $('rej').addEventListener('click', () => { this._run(this._c.dismiss_actions); if (this._popup && this._c.close_on_reject !== false) this._reqClose(); else this._hang(); });
    $('hang').addEventListener('click', () => this._hang());
    $('re').addEventListener('click', () => this._recreate(true));
    $('mic').addEventListener('click', () => {
      if (!this._talking) return;
      const on = this._mic.muted; this._send(on ? 'microphone_unmute' : 'microphone_mute'); this._mic.muted = !on; this._sync();
    });
    $('snd').addEventListener('click', () => { if (!this._cam) return; const on = !this._sound; this._send(on ? 'unmute' : 'mute'); this._sound = on; this._sndAt = Date.now(); this._sync(); });
    sr.querySelectorAll('[data-gate]').forEach((b) => b.addEventListener('click', () => this._gateTap(Number(b.dataset.gate))));
    if (dndId) $('dnd').addEventListener('click', () => { if (this._hass) this._hass.callService('homeassistant', 'toggle', {}, { entity_id: dndId }); });
    sr.querySelectorAll('[data-link]').forEach((b) => b.addEventListener('click', () => {
      const l = links[Number(b.dataset.link)] || {};
      if (l.hash) this._nav(l.hash, false);
      else if (l.path) { history.pushState(null, '', l.path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); }
    }));
    sr.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this._setTab(b.dataset.tab)));
    if (this._popup) {
      $('launch').addEventListener('click', () => this._reqOpen());
      $('x').addEventListener('click', () => this._reqClose());
      this._dlg.addEventListener('cancel', (e) => { e.preventDefault(); this._reqClose(); });
      this._dlg.addEventListener('click', (e) => {
        if (e.target !== this._dlg) return;
        const r = this._dlg.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) this._reqClose();
      });
    }
    if (c.debug) {
      const redo = () => { this._recreate(true); this.toggleAttribute('cold', this._popup && !this._pref().pre); this._sync(); };
      $('cmic').addEventListener('click', () => { this._ovSet('mode', MODES[(MODES.indexOf(this._pref().asked) + 1) % MODES.length]); redo(); });
      $('cpre').addEventListener('click', () => { this._ovSet('pre', !this._pref().pre); redo(); });
      $('ctest').addEventListener('click', () => { this._self = null; this._selfTest(); });
      if (!this._popup) $('cpre').hidden = true;
    }
    this._built = true; this._sig2 = '';
  }
  _dndId() { const d = this._c && this._c.dnd; return d ? String(typeof d === 'string' ? d : d.entity || '') : ''; }
  /* separadores Em direto / Histórico: o cartão do histórico só é criado quando o separador abre e é deitado fora ao fechar a janela */
  async _setTab(t) {
    const sr = this.shadowRoot, hist = sr.getElementById('hist');
    if (!hist || !this._built) return;
    t = t === 'hist' ? 'hist' : 'live';
    this._tab = t;
    sr.querySelectorAll('[data-tab]').forEach((b) => { const on = b.dataset.tab === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    sr.getElementById('grid').hidden = t !== 'live'; hist.hidden = t !== 'hist';
    if (t !== 'hist' || this._histEl || this._histBusy) return;
    this._histBusy = true;
    try {
      const hp = await window.loadCardHelpers();
      const el = hp.createCardElement(clone(this._c.history));
      if (this._tab === 'hist' && this._built) { if (this._hass) el.hass = this._hass; hist.innerHTML = ''; hist.appendChild(el); this._histEl = el; }
    } catch (e) { hist.textContent = 'Não foi possível abrir o histórico.'; }
    this._histBusy = false;
  }
  _histDrop() { const h = this.shadowRoot.getElementById('hist'); if (h) h.innerHTML = ''; this._histEl = null; if (this._tab === 'hist') this._setTab('live'); }
  _sync() {
    if (!this._built) return;
    const c = this._c, sr = this.shadowRoot, $ = (id) => sr.getElementById(id);
    const ring = this._ringing(), m = this._mic, pend = !!this._pending, talk = this._talking, w = this._wd;
    const phase = talk ? 'talking' : pend ? 'connecting' : ring ? 'ringing' : 'idle';
    const msg = this._msg ? this._msg.t : w.gave ? 'O vídeo parou. Toque em «Recarregar vídeo».' : w.stage === 1 ? 'A recuperar o vídeo…' : '';
    const dndS = this._dndId() && this._hass && this._hass.states[this._dndId()] ? this._hass.states[this._dndId()].state : '';
    const sig = [dndS, phase, m.muted, this._sound, msg, this._arm, !!this._cam, this._open, c.gates_enabled === true, this._sentAt && Date.now() - this._sentAt < 60000, w.gave, this._pref().mode].join('|');
    if (sig === this._sig2) return;
    this._sig2 = sig; this._phase = phase;
    const db = $('dnd');
    if (db) { const on = dndS === 'on'; db.classList.toggle('on', on); db.setAttribute('aria-pressed', on ? 'true' : 'false'); db.querySelector('ha-icon').setAttribute('icon', on ? 'mdi:bell-off' : 'mdi:bell-outline'); }
    const cap = $('cap'), txt = msg || { ringing: 'A tocar agora', connecting: 'A ligar o microfone…', talking: m.muted ? 'Em conversa · microfone em silêncio' : 'Em conversa', idle: 'Em direto' }[phase];
    cap.textContent = txt; cap.className = 'cap' + (msg ? ' red' : phase === 'ringing' ? ' sel' : phase === 'talking' ? ' good' : '');
    $('hic').className = 'ic' + (phase === 'ringing' ? ' sel' : phase === 'talking' ? ' live' : '');
    const ans = $('ans'), rej = $('rej'), hang = $('hang'), busy = talk || pend;
    ans.hidden = busy; rej.hidden = busy || !ring; hang.hidden = !busy;
    ans.disabled = !this._cam;
    ans.querySelector('span').textContent = ring ? 'Atender' : 'Falar';
    ans.querySelector('ha-icon').setAttribute('icon', ring ? 'mdi:phone' : 'mdi:phone-outgoing');
    $('re').classList.toggle('bad', w.gave);
    const tg = (el, on, off, iOn, iOff, tOn, tOff, tNa) => {
      el.classList.toggle('on', on && !off); el.setAttribute('aria-checked', on && !off ? 'true' : 'false'); el.setAttribute('aria-disabled', off ? 'true' : 'false');
      el.querySelector('ha-icon').setAttribute('icon', on && !off ? iOn : iOff); el.querySelector('.st').textContent = off ? tNa : on ? tOn : tOff;
    };
    tg($('mic'), talk && !m.muted, !talk, 'mdi:microphone', 'mdi:microphone-off', 'Ligado', 'Em silêncio', pend ? 'A ligar…' : 'Só em conversa');
    tg($('snd'), this._sound, !this._cam, 'mdi:volume-high', 'mdi:volume-off', 'Ligado', 'Desligado', 'Sem vídeo');
    sr.querySelectorAll('[data-gate]').forEach((b) => {
      const i = Number(b.dataset.gate), on = c.gates_enabled === true, armed = on && this._arm === i;
      b.classList.toggle('warn', armed); b.setAttribute('aria-disabled', on ? 'false' : 'true');
      b.style.setProperty('--cd', Math.max(3, Number(c.confirm_seconds) || 9) + 's');
      b.querySelector('.st').textContent = !on ? 'Desativado' : armed ? 'Toque outra vez para abrir' : this._sentAt && Date.now() - this._sentAt < 60000 ? 'Comando enviado' : 'Dois toques para abrir';
      b.title = on ? '' : 'Desativado (gates_enabled: false)';
    });
    if (this._popup) {
      const l = $('launch'); l.classList.toggle('ring', ring);
      $('lcap').textContent = ring ? 'A tocar agora · toque para atender' : this._open ? 'Aberta' : this._cam ? 'Toque para abrir · vídeo já ligado' : 'Toque para abrir o vídeo e atender';
    }
    this._dbgUi();
  }
  _log(...a) { if (this._c && this._c.debug) console.debug('[casa-doorbell]', ...a); }
  _dbgUi() {
    if (!this._c || !this._c.debug || !this._built) return;
    const sr = this.shadowRoot, T = this._T, $ = (id) => sr.getElementById(id), d = (a, b) => a != null && b != null ? fmt(a - b) : '—';
    const P = this._pref(), w = this._wd;
    const cp = $('cpre'), cm = $('cmic');
    cm.textContent = 'Microfone: ' + MODE_PT[P.asked]; cm.classList.toggle('on', P.asked === 'always');
    cp.textContent = 'Vídeo ligado antes de abrir: ' + (P.pre ? 'sim' : 'não'); cp.classList.toggle('on', P.pre);
    const L = [];
    L.push(`modo: microfone ${MODE_PT[P.mode]}${P.mode !== P.asked ? ' (em vez de «sempre ligado», porque o vídeo fica ligado antes de abrir)' : ''} · vídeo antes de abrir ${P.pre ? 'sim' : 'não'}`);
    L.push(`vídeo: cartão ${d(T.el, T.created)} · 1.ª imagem ${d(T.img, T.created)} · vídeo a correr ${d(T.video, T.created)}${this._tech ? ' (' + this._tech + ')' : ''} · abrir → vídeo visível ${T.open == null ? '—' : T.openVideo == null ? 'à espera…' : T.openVideo === 0 ? '0 ms (já estava ligado)' : fmt(T.openVideo)}`);
    L.push(`falar/atender → microfone ligado ${T.answer == null ? '—' : T.mic != null ? fmt(T.mic - T.answer) : this._pending ? 'à espera…' : this._assumed && this._talking ? 'sem confirmação' : '—'} · recargas ao falar/desligar: ${this._n.reTalk}${this._n.reTalk && this._lastWhy ? ' (' + this._lastWhy + ')' : ''}`);
    L.push(`recargas do vídeo (total) ${this._n.reloads} · recuperações ${w.count}/3${w.gave ? ' (desistiu)' : ''} · vídeo ${this._alive ? 'a correr' : 'parado'} · estado ${this._phase || '—'} · microfone ${this._mic.connected ? (this._mic.muted ? 'ligado, em silêncio' : 'ligado, a falar') : 'desligado'}`);
    L.push(`sinais do cartão ${this._sigOk ? 'sim' : 'ainda não'} (${this._variant || '—'}) · ações ${this._self ? this._self.state : '—'} · página carregada há ${Math.round(now() / 1000)} s · v${VER}`);
    const t = L.join('\n'), p = $('dbg');
    if (p.textContent !== t) p.textContent = t;
    const p2 = $('dbg2');
    if (p2 && p2.textContent !== t) p2.textContent = t;
  }
}
if (!customElements.get('casa-doorbell-card')) customElements.define('casa-doorbell-card', CasaDoorbellCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'casa-doorbell-card')) window.customCards.push({ type: 'casa-doorbell-card', name: 'Casa · Campainha', description: 'Vídeo da campainha (advanced-camera-card) com botões da casa: atender, rejeitar, microfone, som e portões em dois toques.' });
})();

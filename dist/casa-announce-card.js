/* casa-announce-card v0.3.0 — Gravar: grava a voz no telemóvel e anuncia a gravação (record:false desliga; só administradores, em HTTPS; o ficheiro vai para a pasta de media do HA e é apagado depois);
   anúncios de voz: destino (um de cada vez), anúncios rápidos (dois toques) e mensagem livre; envia para um script configurável; compact:true = versão para pop-up */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `
:host{display:block;container-type:inline-size}
:host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled,button[aria-disabled="true"]{opacity:.45;cursor:default}
button:focus-visible,textarea:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.top{display:flex;flex-direction:column;gap:2px;min-width:0}
.sum{font-size:20px;font-weight:600;line-height:28px;min-height:28px;overflow-wrap:anywhere}
.sum .cap{font-size:13px;font-weight:400;color:var(--secondary-text-color);margin-left:8px;white-space:nowrap}
.status{font-size:13px;line-height:20px;height:40px;color:var(--secondary-text-color);overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.status.err{color:#ed8796}
.status.ok{color:#a6da95}
.panel{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
.rn{font-size:16px;font-weight:600;min-height:28px;display:flex;align-items:center}
.cols{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.tile{display:flex;align-items:center;gap:10px;height:56px;padding:0 10px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box;width:100%}
.tile.on{background:var(--primary-text-color);color:var(--card-background-color)}
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color);--mdc-icon-size:20px}
.tile.on .ic{background:var(--primary-color);color:#181926}
.tx{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.nm{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:12px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st:empty{display:none}
.pre .nm{white-space:normal;line-height:1.2;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow-wrap:anywhere}
.pre .st{line-height:1.2}
.tile.on .st{color:inherit;opacity:.75}
textarea{display:block;width:100%;box-sizing:border-box;height:120px;resize:none;margin:0;padding:12px;border:0;border-radius:12px;background:var(--card-background-color);color:var(--primary-text-color);font:inherit;font-size:16px;line-height:1.4}
textarea::placeholder{color:var(--secondary-text-color);opacity:.8}
.row{display:flex;align-items:center;gap:12px;min-height:44px}
.cnt{font-size:12px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums;margin-right:auto}
.send{min-height:44px;min-width:132px;padding:0 20px;border-radius:999px;background:var(--primary-color);color:#181926;font-size:14px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:8px;--mdc-icon-size:20px}
.recb{min-height:44px;padding:0 16px;border-radius:999px;background:var(--card-background-color);font-size:14px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:8px;--mdc-icon-size:20px}
.row[hidden],.recb[hidden]{display:none}
.dot{flex:none;width:10px;height:10px;border-radius:50%;background:#ed8796;animation:rp 1s ease-in-out infinite}
.rt{font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;margin-right:auto}
@keyframes rp{50%{opacity:.25}}
.foot{font-size:13px;line-height:1.4;color:var(--secondary-text-color);margin:0}
@container (min-width:520px){.grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}}
@container (min-width:520px){.grid.pre{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}}
@container (min-width:520px){.status{height:20px;-webkit-line-clamp:1}}
@container (min-width:900px){.cols{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}}
.c{gap:10px}
.c .top{flex-direction:row;align-items:center;gap:10px;height:24px}
.c .sum{font-size:15px;line-height:24px;min-height:0;flex:none;white-space:nowrap}
.c .status{flex:1;min-width:0;height:24px;line-height:24px;display:block;white-space:nowrap;text-overflow:ellipsis;text-align:right}
.c .panel{padding:10px;gap:8px}
.c .rn{font-size:13px;font-weight:500;color:var(--secondary-text-color);min-height:0}
.c .cols{gap:10px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{min-height:44px;padding:0 14px;border-radius:12px;background:var(--card-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center}
.chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
.chip .st{display:none}
.c .tile{height:48px;gap:8px}
.c .ic{width:24px;height:24px;background:none}
.c .tile.on .ic{background:none;color:inherit}
.c .pre .tile.on .nm{-webkit-line-clamp:1}
.c textarea{height:76px}
.c .foot{font-size:12px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;
class CasaAnnounceCard extends HTMLElement {
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._sel = 0; this._arm = -1; this._busy = null; this._lock = false; this._status = null; this._sig = null; this._built = false;
  }
  setConfig(c) {
    if (!c || !c.script) throw new Error('Defina "script" (ex.: script.notificar_audio)');
    if (!Array.isArray(c.destinations) || !c.destinations.length) throw new Error('Defina "destinations"');
    this._c = Object.assign({ presets: [], confirm: true, message_field: 'message', target_field: 'target', media_field: 'media_content_id', record: true, record_seconds: 30, record_dir: 'media-source://media_source/local', max_length: 200, arm_seconds: 5, lock_seconds: 3, timeout_seconds: 20 }, c);
    this._c.destinations = c.destinations.map((d) => Object.assign({}, d, { targets: Array.isArray(d.targets) ? d.targets : [] }));
    const all = [];
    this._c.destinations.forEach((d) => d.targets.forEach((t) => { if (all.indexOf(t) < 0) all.push(t); }));
    this._all = all;
    this._sel = Math.max(0, this._c.destinations.findIndex((d) => d.default));
    this._built = false; this._sig = null;
    if (this._h) this._update();
  }
  getCardSize() { return 10; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { clearInterval(this._tick); this._tick = setInterval(() => { if (this._h) this._update(); }, 20000); }
  disconnectedCallback() { clearInterval(this._tick); clearTimeout(this._ta); this._arm = -1; this._recStop(false); }
  set hass(h) { this._h = h; this._update(); }
  _hhmm() {
    const d = new Date();
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: this._h.config.time_zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(d); }
    catch (e) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  }
  _night() {
    const n = this._c.night; if (!n || !n.after || !n.before) return false;
    const t = this._hhmm();
    return n.after > n.before ? (t >= n.after || t < n.before) : (t >= n.after && t < n.before);
  }
  _bad(e) { const s = this._h.states[e]; return !s || s.state === 'unavailable' || s.state === 'unknown'; }
  _scope(d) {
    if (d.targets.length) return d.targets;
    const n = this._c.night;
    return this._night() && n && Array.isArray(n.targets) && n.targets.length ? n.targets : this._all;
  }
  _dead(d) { const s = this._scope(d); return s.length > 0 && s.every((e) => this._bad(e)); }
  _update() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const sig = [this._night() ? 'n' : 'd', h.states[c.script] ? '1' : '0'].concat(this._all.map((e) => (this._bad(e) ? 'x' : 'o'))).join('');
    if (!this._built) { this._build(); this._sig = null; }
    if (sig !== this._sig) { this._sig = sig; this._sync(); }
  }
  _build() {
    const c = this._c;
    const chip = (i, o) => `<button class="chip" data-dest="${i}" aria-pressed="false"><span class="nm">${esc(o.name)}</span><span class="st"></span></button>`;
    const tile = (kind, i, o) => `<button class="tile" data-${kind}="${i}"${kind === 'dest' ? ' aria-pressed="false"' : ''}><span class="ic"><ha-icon icon="${esc(o.icon || (kind === 'dest' ? 'mdi:speaker' : 'mdi:bullhorn-outline'))}"></ha-icon></span><span class="tx"><span class="nm">${esc(o.name)}</span><span class="st"></span></span></button>`;
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
    <ha-card class="${c.compact ? 'c' : ''}">
      <div class="top"><span class="sum"></span><div class="status" role="status" aria-live="polite"></div></div>
      <section class="panel" aria-label="Para onde"><div class="rn">Para onde</div><div class="${c.compact ? 'chips' : 'grid'}" role="group" aria-label="Destino do anúncio">${c.destinations.map((d, i) => (c.compact ? chip(i, d) : tile('dest', i, d))).join('')}</div></section>
      <div class="cols">
        ${c.presets.length ? `<section class="panel" aria-label="Anúncios rápidos"><div class="rn">Anúncios rápidos</div><div class="grid pre">${c.presets.map((p, i) => tile('pre', i, p)).join('')}</div></section>` : ''}
        <section class="panel" aria-label="Mensagem"><div class="rn">Mensagem</div>
          <textarea maxlength="${Number(c.max_length)}" placeholder="Escreva o que quer anunciar" aria-label="Mensagem a anunciar" enterkeyhint="enter"></textarea>
          <div class="row norm"><span class="cnt"></span><button class="recb" data-rec="start" hidden><ha-icon icon="mdi:microphone"></ha-icon>Gravar</button><button class="send" data-send="1"><ha-icon icon="mdi:bullhorn-outline"></ha-icon><span class="sl">Anunciar</span></button></div>
          <div class="row recrow" hidden><span class="dot"></span><span class="rt" role="timer"></span><button class="recb" data-rec="cancel">Cancelar</button><button class="send" data-rec="send"><ha-icon icon="mdi:bullhorn-outline"></ha-icon>Anunciar</button></div>
        </section>
      </div>
      <p class="foot">${c.compact ? '' : 'Um destino de cada vez. '}${c.presets.length ? (c.confirm ? 'Os anúncios rápidos pedem dois toques: o primeiro prepara, o segundo anuncia. ' : 'Os anúncios rápidos são enviados logo ao primeiro toque. ') : ''}A mensagem escrita só é enviada com o botão Anunciar.</p>
    </ha-card>`;
    const R = this.shadowRoot;
    this._ta_el = R.querySelector('textarea');
    R.addEventListener('click', (ev) => {
      const b = ev.target.closest && ev.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.dest != null) return this._pick(Number(b.dataset.dest));
      if (b.getAttribute('aria-disabled') === 'true') return;
      if (b.dataset.pre != null) return this._preset(Number(b.dataset.pre));
      if (b.dataset.send) return this._sendText();
      if (b.dataset.rec === 'start') return this._recStart();
      if (b.dataset.rec === 'cancel') return this._recStop(false);
      if (b.dataset.rec === 'send') return this._recStop(true);
    });
    this._ta_el.addEventListener('input', () => this._sync());
    this._ta_el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); this._sendText(); } });
    this._built = true;
  }
  _dest() { return this._c.destinations[this._sel]; }
  _disarm() { clearTimeout(this._ta); this._arm = -1; }
  _pick(i) {
    if (this._dead(this._c.destinations[i]) || this._lock) return;
    if (i !== this._sel && this._status && this._c.compact) this._status = null;
    this._sel = i; this._disarm(); this._sync();
  }
  _preset(i) {
    if (this._lock || this._blocked()) return;
    const p = this._c.presets[i];
    if (this._c.confirm && this._arm !== i) {
      this._disarm(); this._arm = i;
      this._ta = setTimeout(() => { this._arm = -1; this._sync(); }, this._c.arm_seconds * 1000);
      return this._sync();
    }
    this._disarm(); this._send(p.message, 'p' + i);
  }
  _text() { return this._ta_el.value.replace(/\s+/g, ' ').trim(); }
  _sendText() {
    const m = this._text(); if (!m || this._lock || this._blocked()) return;
    this._disarm(); this._send(m, 'text');
  }
  _blocked() { return !this._h.states[this._c.script] || this._dead(this._dest()); }
  /* ── gravação de voz: MediaRecorder → pasta de media do HA → o mesmo script, com media_content_id ── */
  _canRec() { return this._c.record !== false && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) && !!(this._h.user && this._h.user.is_admin); }
  async _recStart() {
    if (this._rec || this._lock || this._blocked()) return;
    this._disarm();
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { this._status = { k: 'err', t: 'Sem acesso ao microfone' }; return this._sync(); }
    const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
    let mr;
    try { mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
    catch (e) { stream.getTracks().forEach((t) => t.stop()); this._status = { k: 'err', t: 'Este aparelho não consegue gravar' }; return this._sync(); }
    const r = (this._rec = { mr, stream, chunks: [], t0: Date.now(), send: false });
    mr.ondataavailable = (e) => { if (e.data && e.data.size) r.chunks.push(e.data); };
    mr.onstop = () => this._recDone(r);
    mr.start();
    r.iv = setInterval(() => { if (Date.now() - r.t0 >= this._c.record_seconds * 1000) this._recStop(true); else this._sync(); }, 250);
    this._status = null; this._sync();
  }
  _recStop(send) {
    const r = this._rec; if (!r || r.stopping) return;
    r.stopping = true; r.send = send; clearInterval(r.iv);
    try { r.mr.stop(); } catch (e) { this._recDone(r); }
  }
  _recDone(r) {
    if (this._rec !== r) return;
    this._rec = null; r.stream.getTracks().forEach((t) => t.stop());
    if (!r.send) return this._sync();
    const type = (r.mr.mimeType || 'audio/webm').split(';')[0];
    const blob = new Blob(r.chunks, { type });
    if (blob.size < 1200 || Date.now() - r.t0 < 700) { this._status = { k: 'err', t: 'Gravação demasiado curta' }; return this._sync(); }
    this._upload(blob, 'anuncio-' + Date.now() + (type.indexOf('mp4') >= 0 ? '.m4a' : type.indexOf('ogg') >= 0 ? '.ogg' : '.webm'));
  }
  async _upload(blob, name) {
    const c = this._c, d = this._dest();
    this._lock = true; this._busy = 'rec'; this._status = { k: '', t: 'A enviar a gravação…' }; this._sync();
    let id;
    try {
      const post = (dir) => { const fd = new FormData(); fd.append('media_content_id', dir); fd.append('file', new File([blob], name, { type: blob.type })); return this._h.fetchWithAuth('/api/media_source/local_source/upload', { method: 'POST', body: fd }); };
      let res = await post(c.record_dir);
      if (res.status === 400 || res.status === 404) res = await post(c.record_dir + '/.');
      if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'só contas de administrador podem enviar gravações' : 'erro ' + res.status);
      id = String((await res.json()).media_content_id || '').replace('/./', '/');
      if (!id) throw new Error('resposta sem ficheiro');
    } catch (e) {
      this._lock = false; this._busy = null;
      this._status = { k: 'err', t: 'Não foi possível enviar a gravação: ' + ((e && e.message) || 'erro desconhecido') };
      return this._sync();
    }
    this._sendData({ [c.media_field]: id }, 'rec', d);
    setTimeout(() => this._sweep(id), 120000);
  }
  /* apaga a gravação enviada e as antigas que tenham ficado para trás */
  async _sweep(id) {
    const rm = (m) => this._h.callWS({ type: 'media_source/local_source/remove', media_content_id: m }).catch(() => {});
    await rm(id);
    try {
      const b = await this._h.callWS({ type: 'media_source/browse_media', media_content_id: this._c.record_dir });
      (b.children || []).forEach((ch) => { const m = /^anuncio-(\d{13})\./.exec(ch.title || ''); if (m && ch.media_content_id !== id && Date.now() - Number(m[1]) > 600000) rm(ch.media_content_id); });
    } catch (e) { /* sem acesso à pasta: fica por limpar */ }
  }
  _send(message, src) { this._sendData({ [this._c.message_field]: message }, src, this._dest(), message); }
  _sendData(data, src, d, message) {
    const c = this._c, parts = c.script.split('.');
    if (d.targets.length) data[c.target_field] = d.targets.slice();
    const id = (this._seq = (this._seq || 0) + 1);
    let settled = false, minDone = false;
    const release = () => { if (this._seq === id && settled && minDone) { this._lock = false; this._busy = null; this._sync(); } };
    this._lock = true; this._busy = src; this._status = { k: '', t: c.compact ? 'A anunciar…' : 'A anunciar em ' + d.name + '…' }; this._sync();
    setTimeout(() => { minDone = true; release(); }, c.lock_seconds * 1000);
    const to = setTimeout(() => {
      if (settled || this._seq !== id) return;
      settled = true; this._status = { k: '', t: c.compact ? 'Enviado · sem confirmação ainda' : 'Pedido enviado para ' + d.name + ' · ainda sem confirmação do Home Assistant' }; release(); this._sync();
    }, c.timeout_seconds * 1000);
    let pr;
    try { pr = Promise.resolve(this._h.callService(parts[0], parts[1], data)); } catch (e) { pr = Promise.reject(e); }
    pr.then(() => {
      clearTimeout(to);
      if (this._seq === id) this._status = { k: 'ok', t: (c.compact ? 'Anunciado · ' : 'Anunciado em ' + d.name + ' · ') + this._hhmm() };
      if (src === 'text' && this._text() === message) this._ta_el.value = '';
      settled = true; release(); this._sync();
    }, (e) => {
      clearTimeout(to);
      if (this._seq === id) this._status = { k: 'err', t: (c.compact ? 'Falhou: ' : 'Não foi possível anunciar em ' + d.name + ': ') + ((e && (e.message || e.code)) || 'erro desconhecido') };
      settled = true; release(); this._sync();
    });
  }
  _sync() {
    if (!this._built) return;
    const c = this._c, R = this.shadowRoot, night = this._night(), d = this._dest(), noScript = !this._h.states[c.script];
    const dead = this._dead(d), blocked = noScript || dead;
    const restricted = night && !d.targets.length && c.night && c.night.caption;
    R.querySelector('.sum').innerHTML = 'Anunciar em: ' + esc(d.name) + (c.compact ? '' : dead ? '<span class="cap">sem ligação</span>' : restricted ? `<span class="cap">${esc(c.night.caption)}</span>` : '');
    R.querySelectorAll('[data-dest]').forEach((b) => {
      const i = Number(b.dataset.dest), o = c.destinations[i], x = this._dead(o), on = i === this._sel;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.disabled = x;
      if (this._lock && !x && !on) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      b.querySelector('.st').textContent = x ? 'Sem ligação' : (night && !o.targets.length && c.night && c.night.short) ? c.night.short : '';
      b.title = x ? 'Sem ligação' : '';
    });
    R.querySelectorAll('[data-pre]').forEach((b) => {
      const i = Number(b.dataset.pre), p = c.presets[i], armed = this._arm === i, busy = this._busy === 'p' + i;
      b.classList.toggle('on', armed || busy); b.disabled = blocked;
      if (this._lock && !blocked) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      b.querySelector('.st').textContent = busy ? 'A anunciar…' : armed ? 'Tocar outra vez' : '';
      b.setAttribute('aria-label', armed ? `${p.name}. Tocar outra vez para anunciar em ${d.name}` : p.name);
      b.title = p.message || '';
    });
    const rec = this._rec, rb = R.querySelector('[data-rec="start"]');
    R.querySelector('.norm').hidden = !!rec; R.querySelector('.recrow').hidden = !rec;
    rb.hidden = !this._canRec(); rb.disabled = blocked;
    if (this._lock && !blocked) rb.setAttribute('aria-disabled', 'true'); else rb.removeAttribute('aria-disabled');
    if (rec) { const sec = Math.floor((Date.now() - rec.t0) / 1000), left = Math.max(0, c.record_seconds - sec); R.querySelector('.rt').textContent = '0:' + String(sec).padStart(2, '0') + (left <= 5 ? ' · faltam ' + left + ' s' : ''); }
    const n = this._ta_el.value.length, empty = !this._text(), sb = R.querySelector('.send');
    R.querySelector('.cnt').textContent = n + '/' + c.max_length;
    sb.disabled = blocked || empty;
    if (this._lock && !sb.disabled) sb.setAttribute('aria-disabled', 'true'); else sb.removeAttribute('aria-disabled');
    R.querySelector('.sl').textContent = this._busy === 'text' ? 'A anunciar…' : 'Anunciar';
    const st = R.querySelector('.status');
    let s = this._status;
    if (noScript) s = { k: 'err', t: 'Script ' + c.script + ' não encontrado' };
    else if (rec) s = { k: '', t: c.compact ? 'A gravar…' : 'A gravar para ' + d.name + '…' };
    else if (this._arm >= 0) s = { k: '', t: c.compact ? 'Tocar outra vez para anunciar' : `Tocar outra vez para anunciar em ${d.name}` };
    else if (dead && (c.compact || !s)) s = { k: c.compact ? 'err' : '', t: c.compact ? 'Sem ligação' : 'As colunas deste destino estão sem ligação' };
    else if (!s) s = { k: '', t: c.compact ? (restricted ? c.night.caption : '') : 'Escolha o destino e depois o anúncio' };
    st.className = 'status' + (s.k ? ' ' + s.k : ''); st.textContent = s.t; st.title = s.t;
  }
}
if (!customElements.get('casa-announce-card')) customElements.define('casa-announce-card', CasaAnnounceCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-announce-card', name: 'Casa · Anúncios', description: 'Anúncios de voz por destino, com anúncios rápidos e mensagem livre.' });
})();

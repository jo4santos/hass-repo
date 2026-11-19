/* casa-music-card v0.9.2 — abrir um artista mostra os álbuns (o Spotify não devolve músicas soltas do artista) e cada álbum abre a partir daí; corrige a janela (linhas e mosaicos esmagados com listas longas), Para ti em português e resumido, altura fixa em ecrãs largos; janela em leitor completo: capa, favorito, progresso, controlos e volume, com separadores A seguir, Para ti, Parecidas, Biblioteca, Pesquisar e DJ (pedido por texto, DJ automático, locutor); locutor entre músicas (AI Radio DJ do Music Assistant) escolhido na janela Gerir fila; janela Gerir fila com separador Pesquisar (mesma pesquisa do cartão); volume com escala não linear (metade da barra = 0–20%) e botões − e + de 1%; separador Fila mostra a lista (tocar numa música toca-a) e o botão Gerir abre a janela: tocar, tocar a seguir, remover, ordenar, baralhar/repetir, continuar com parecidas, transição suave, saltar segundos e músicas parecidas (mass_queue 0.11); cartão de música da casa (grupo permanente, Music Assistant); shortcuts[].card = cartão aberto dentro deste, como um separador ({leader} = coluna líder), em vez de navegar; progresso e durações, separador Fila e abrir álbuns/playlists/artistas na pesquisa (mass_queue) */
const IC = {
  play: 'M8 5v14l11-7z', pause: 'M6 5h4v14H6zM14 5h4v14h-4z', prev: 'M6 6h2v12H6zM9.5 12 18 6v12z', next: 'M16 6h2v12h-2zM6 6l8.5 6L6 18z',
  stop: 'M6 6h12v12H6z', vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z',
  dots: 'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  note: 'M12 3v10.6A4 4 0 1 0 14 17V7h4V3h-6z', search: 'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', chev: 'M9 6l6 6-6 6-1.4-1.4L12.2 12 7.6 7.4z', back: 'M15 6l-6 6 6 6 1.4-1.4L11.8 12l4.6-4.6z', x: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z', up: 'M7.4 15.4 12 10.8l4.6 4.6L18 14l-6-6-6 6z', down: 'M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z', top: 'M5 4h14v2H5zM12 8l6 6h-4v6h-4v-6H6z', shuf: 'M14.83 13.41 13.42 14.82 16.55 17.95 14.5 20H20V14.5L17.96 16.54 14.83 13.41M14.5 4 16.54 6.04 4 18.59 5.41 20 17.96 7.46 20 9.5V4M10.59 9.17 5.41 4 4 5.41 9.17 10.58 10.59 9.17Z', rep: 'M17 17H7V14L3 18L7 22V19H19V13H17M7 7H17V10L21 6L17 2V5H5V11H7V7Z', rep1: 'M13 15V9H12L10 10V11H11.5V15M17 17H7V14L3 18L7 22V19H19V13H17M7 7H17V10L21 6L17 2V5H5V11H7V7Z', heart: 'M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.08 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5 22 12.27 18.6 15.36 13.45 20.03L12 21.35Z', heartO: 'M12.1 18.55 12 18.65 11.89 18.55C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5 9.04 5 10.54 6 11.07 7.36H12.93C13.46 6 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5 20 11.39 16.86 14.24 12.1 18.55M16.5 3C14.76 3 13.09 3.81 12 5.08 10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.41 2 8.5 2 12.27 5.4 15.36 10.55 20.03L12 21.35 13.45 20.03C18.6 15.36 22 12.27 22 8.5 22 5.41 19.58 3 16.5 3Z', check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z', bt: 'M17.7 7.7 12 2h-1v7.6L6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l4.6-4.6V22h1l5.7-5.7-4.3-4.3 4.3-4.3zM13 5.8l1.9 1.9L13 9.6V5.8zm1.9 10.5L13 18.2v-3.8l1.9 1.9z'
};
const svg = (p, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="${p}"/></svg>`;
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const TAB_IC = { queue: 'mdi:playlist-play', rooms: 'mdi:speaker', radios: 'mdi:radio', playlists: 'mdi:playlist-music', search: 'mdi:magnify' };
const SRC = { spotify: 'Spotify', library: 'Biblioteca', tunein: 'TuneIn', radiobrowser: 'Radio Browser', ytmusic: 'YouTube Music', builtin: 'Local', apple_music: 'Apple Music', deezer: 'Deezer', tidal: 'Tidal', qobuz: 'Qobuz', filesystem_local: 'Ficheiros', filesystem_smb: 'Ficheiros', plex: 'Plex', jellyfin: 'Jellyfin', soundcloud: 'SoundCloud' };
const srcOf = (uri) => { const k = String(uri || '').split('://')[0].split('--')[0]; return SRC[k] || (k && k.length < 20 ? k.charAt(0).toUpperCase() + k.slice(1) : ''); };
const imgOf = (it) => { const v = (it && (it.image || (it.album && it.album.image))) || ''; const u = typeof v === 'string' ? v : (v && (v.url || v.path)) || ''; return /^(https?:)?\/\//.test(u) || u.charAt(0) === '/' ? u : ''; };
const qInfo = (it) => { const id = String(it.media_content_id || ''), t = String(it.media_title || ''), tts = id.indexOf('/api/tts_proxy/') >= 0, odd = !t || t.indexOf('://') >= 0; return { title: tts ? 'Aviso de voz' : odd ? (id.indexOf('://radio/') >= 0 ? 'Rádio' : 'Sem título') : t, sub: tts ? '' : [it.media_artist, it.media_album_name].filter(Boolean).join(' · '), src: tts ? '' : srcOf(id) }; };
const fmt = (s) => { s = Math.max(0, Math.floor(Number(s) || 0)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, '0'); return h ? h + ':' + String(m).padStart(2, '0') + ':' + x : m + ':' + x; };
/* volume: posição da barra (0–1000) <-> percentagem; a primeira metade da barra cobre 0–20% */
const VK = 2.32, V2P = (v) => Math.round(1000 * Math.pow(Math.max(0, Math.min(100, Number(v) || 0)) / 100, 1 / VK)), P2V = (p) => Math.round(100 * Math.pow(Math.max(0, Math.min(1000, Number(p) || 0)) / 1000, VK));
/* Para ti: secções do Music Assistant por ordem de interesse, com nome em português; as primeiras REC_TOP aparecem logo, as outras atrás de «Mais sugestões» */
const REC = [['recently_played', 'Tocadas recentemente'], ['favorite_playlists', 'As tuas playlists'], ['favorite_radio', 'As tuas rádios'], ['most_played_tracks', 'As mais tocadas'], ['recent_artists', 'Artistas recentes'], ['forgotten_tracks', 'Há muito que não ouves'], ['recent_favorite_tracks', 'Favoritas recentes'], ['never_played_tracks', 'Ainda por ouvir'], ['recently_added_albums', 'Álbuns novos na biblioteca'], ['recently_added_tracks', 'Músicas novas na biblioteca'], ['forgotten_albums', 'Álbuns esquecidos'], ['forgotten_artists', 'Artistas esquecidos'], ['random_albums', 'Álbuns ao acaso'], ['random_artists', 'Artistas ao acaso'], ['trending', 'Rádios em alta']], REC_TOP = 6, REC_SKIP = ['recent_tracks'];
const fmtTot = (s) => { const m = Math.max(1, Math.round(s / 60)), h = Math.floor(m / 60); return h ? h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min'; };
class CasaMusicCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<div id="m" style="display:contents"></div><dialog id="d" aria-label="Gerir fila"></dialog>';
    this._main = this.shadowRoot.getElementById('m'); this._dlg = this.shadowRoot.getElementById('d');
    this._dOpen = false; this._dView = 'next'; this._dEdit = false; this._qi = null; this._dj = null; this._sim = { st: 'idle', key: '', tracks: [], added: {} };
    this._dlg.addEventListener('close', () => this._dlgClosed());
    this._dlg.addEventListener('click', (e) => { if (e.target === this._dlg) this._dlg.close(); });
    this._tab = null; this._open = null; this._q = ''; this._res = null; this._busy = false; this._drag = false; this._sig = '';
    this._qu = { st: 'idle', items: [] }; this._qN = 20; this._qOpen = null; this._qArm = false; this._qKey = ''; this._qSeq = 0;
  }
  setConfig(c) {
    if (!c.rooms || !c.rooms.length) throw new Error('Defina "rooms"');
    this._c = Object.assign({ mode: 'compact', leader_sensor: 'sensor.grupo_ativo_leader', volume: 'input_number.volume_grupo_ativo', presets: [], radios: [], playlists: [], shortcuts: [] }, c);
    this._tab = null;
  }
  getCardSize() { return 6; }
  connectedCallback() { if (!this._vis) { this._vis = () => this._pgSync(); document.addEventListener('visibilitychange', this._vis); } this._pgSync(); if (this._h && this._c) { this._qSync(); if (!this._dOpen && this._tab !== 'queue' && this._qu.st !== 'ok') this._qLoad(); } }
  disconnectedCallback() { if (this._dlg.open) this._dlg.close(); this._embDrop(); this._qSync(); if (this._vis) { document.removeEventListener('visibilitychange', this._vis); this._vis = null; } this._pgSync(); }
  _pos(L) {
    const a = L.attributes, d = Number(a.media_duration) || 0, k = a.media_position_updated_at || '', lo = this._pgLocal;
    let p = Number(a.media_position) || 0;
    if (lo && lo.k === k && lo.id === a.media_content_id) { p = lo.p + (L.state === 'playing' ? (Date.now() - lo.at) / 1000 : 0); }
    else { this._pgLocal = null; if (L.state === 'playing' && k) p += (Date.now() - Date.parse(k)) / 1000; }
    return Math.max(0, d ? Math.min(d, p) : p);
  }
  _pgSet(p, d, keepInput) {
    const R = this.shadowRoot, pc = (d ? (p / d) * 100 : 0).toFixed(2) + '%', t = fmt(p), fl = R.querySelector('.fl'), kn = R.querySelector('.kn'), pe = R.querySelector('[data-pe]'), inp = R.querySelector('[data-seek]');
    if (fl && fl.style.width !== pc) fl.style.width = pc;
    if (kn && kn.style.left !== pc) kn.style.left = pc;
    if (pe) { if (!pe.firstChild) pe.appendChild(document.createTextNode(t)); else if (pe.firstChild.nodeValue !== t) pe.firstChild.nodeValue = t; }
    if (inp) { if (!keepInput) inp.value = String(Math.round(p)); inp.setAttribute('aria-valuetext', t + ' de ' + fmt(d)); }
  }
  _pgUpd() {
    const L = this._h && this._c && this._h.states[this._leader()]; if (L) this._dpg(L); if (!L || this._seeking) return;
    const d = Number(L.attributes.media_duration) || 0;
    if (d && (L.state === 'playing' || L.state === 'paused') && this.shadowRoot.querySelector('.fl')) this._pgSet(this._pos(L), d);
  }
  _pgSync() {
    const L = this._h && this._c && this._h.states[this._leader()];
    const run = this.isConnected && document.visibilityState === 'visible' && !!L && L.state === 'playing' && Number(L.attributes.media_duration) > 0;
    if (run && !this._pgT) this._pgT = setInterval(() => this._pgUpd(), 1000);
    else if (!run && this._pgT) { clearInterval(this._pgT); this._pgT = null; }
    this._pgUpd();
  }
  _qSync(keep) {
    clearInterval(this._qPoll); this._qPoll = null;
    if (!this.isConnected) { clearTimeout(this._qDeb); clearTimeout(this._qAft); }
    if ((this._dOpen || this._tab === 'queue') && this.isConnected) { if (!(this._qu.st === 'ok' && (keep || Date.now() - (this._qAt || 0) < 10000))) this._qLoad(); this._qPoll = setInterval(() => this._qLoad(), 30000); }
    else { this._qOpen = null; this._qArm = false; clearTimeout(this._qArmT); this._qN = 20; if (this._qu.st !== 'ok') this._qu = { st: 'idle', items: [] }; }
  }
  _qOk() { const h = this._h; return this._c.queue !== false && !!(h && h.services && h.services.mass_queue && h.services.mass_queue.get_queue_items); }
  _qWant() { const L = this._h && this._h.states[this._leader()]; return this.isConnected && this._qOk() && (this._dOpen || this._tab === 'queue' || (!!L && (L.state === 'playing' || L.state === 'paused'))); }
  _qHint() {
    if (this._tab !== 'queue') { this._tab = 'queue'; this._open = null; this._qSync(true); this._render(); }
    const p = this._main.querySelector('.qp') || this._main.querySelector('.tabs');
    if (p && p.scrollIntoView) p.scrollIntoView({ block: 'nearest', behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  _qPanel() {
    const q = this._qu;
    if (q.st === 'error') return '<div class="empty">Não foi possível ler a fila</div>';
    if (!q.items.length) return `<div class="empty">${q.st === 'ok' ? 'Fila vazia' : 'A carregar…'}</div>`;
    const cur = this._qCur(q.items), all = q.items.slice(cur + 1), next = all.slice(0, this._qN), n = 1 + all.length, plus = all.length >= 100;
    const row = (it, isCur) => {
      const f = qInfo(it), img = imgOf({ image: it.media_image });
      const txt = `<span class="rn">${esc(f.title)}</span><span class="rs">${esc(isCur ? ['A tocar', f.sub].filter(Boolean).join(' · ') : f.sub)}</span>`;
      return `<div class="res q${isCur ? ' cur' : ''}"${isCur ? ' aria-current="true"' : ''}>${img ? `<img class="th" loading="lazy" alt="" src="${esc(img)}">` : `<span class="th">${svg(IC.note, 18)}</span>`}${isCur ? `<div class="rmain">${txt}</div>` : `<button class="rmain" title="Tocar agora" data-qplay="${esc(it.queue_item_id)}">${txt}</button>`}${Number(it.duration || it.media_duration) > 0 ? `<span class="du">${fmt(it.duration || it.media_duration)}</span>` : ''}${f.src ? `<span class="src">${esc(f.src)}</span>` : ''}</div>`;
    };
    return `<div class="qp"><div class="qh"><span class="qt">Fila · ${n}${plus ? '+' : ''} ${n === 1 ? 'música' : 'músicas'}</span><button class="chip" data-qmanage="1" aria-haspopup="dialog">Gerir</button></div>${row(q.items[cur], true)}${next.length ? '<div class="gh">A seguir</div>' + next.map((it) => row(it, false)).join('') : ''}${all.length > this._qN ? '<button class="chip more" data-qmoreitems="1">Mostrar mais</button>' : ''}</div>`;
  }
  _qDraw() { if (this._drag) this._sig = ''; else this._render(); }
  async _qLoad() {
    if (!this._h || !this._qWant()) return;
    const seq = ++this._qSeq, leader = this._leader();
    if (this._qu.st !== 'ok') { this._qu = { st: 'loading', items: [] }; this._qDraw(); }
    const before = JSON.stringify(this._qu);
    try {
      const r = await this._h.callService('mass_queue', 'get_queue_items', { entity: leader, limit_before: 2, limit_after: 100 }, undefined, true, true);
      if (seq !== this._qSeq) return;
      const items = r && r.response && r.response[leader];
      this._qu = { st: 'ok', items: Array.isArray(items) ? items : [] }; this._qAt = Date.now();
    } catch (e) { if (seq !== this._qSeq) return; this._qu = { st: 'error', items: [] }; }
    if (JSON.stringify(this._qu) !== before) this._qDraw();
  }
  _qCur(items, strict) {
    const L = this._h.states[this._leader()], a = (L && L.attributes) || {}, exp = Math.min(2, items.length - 1);
    const find = (k) => (a[k] ? items.map((it, i) => (it[k] === a[k] ? i : -1)).filter((i) => i >= 0) : []);
    let m = find('media_content_id'); if (!m.length) m = find('media_title');
    return m.length ? m.reduce((b, i) => (Math.abs(i - exp) < Math.abs(b - exp) ? i : b), m[0]) : strict ? -1 : exp;
  }
  _qAct(svc, data) {
    Promise.resolve(this._svc('mass_queue', svc, Object.assign({ entity: this._leader() }, data))).catch(() => {});
    this._qOpen = null;
    this._qLoad(); clearTimeout(this._qAft); this._qAft = setTimeout(() => this._qLoad(), 1500);
    this._render();
  }
  _dlgOpen() {
    if (!this._qOk() || !this._h) return;
    this._dOpen = true; this._dView = 'next'; this._dEdit = false; this._qArm = false;
    this._qSync(true); this._qInfo(); this._djLoad(); this._dlgRender();
    if (!this._dlg.open) { try { this._dlg.showModal(); } catch (e) { this._dlg.setAttribute('open', ''); } }
  }
  _dlgClosed() { this._dOpen = false; this._dEdit = false; this._dlg.removeAttribute('open'); this._dlg.innerHTML = ''; this._qSync(); }
  async _qInfo() {
    const mq = (this._h.services && this._h.services.mass_queue) || {};
    if (!mq.set_autoplay && !mq.set_crossfade) { this._qi = null; return; }
    const seq = this._qiSeq = (this._qiSeq || 0) + 1;
    let r = null;
    try { r = await this._h.callWS({ type: 'mass_queue/get_queue_info', entity_id: this._leader() }); } catch (e) { r = null; }
    if (seq !== this._qiSeq) return;
    this._qi = r && typeof r === 'object' ? r : null;
    if (this._dOpen) this._dlgRender();
  }
  /* locutor (AI Radio DJ): comandos do Music Assistant enviados por mass_queue.send_command */
  async _djCmd(command, data) {
    const r = await Promise.race([this._h.callService('mass_queue', 'send_command', { config_entry_id: await this._drEntry(), command, data: data || {} }, undefined, true, true), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))]);
    return r && r.response ? r.response.response : undefined;
  }
  _djQueue() { const L = this._h.states[this._leader()]; return (L && L.attributes.active_queue) || ''; }
  _djSet(st) { const v = st && typeof st === 'object' ? st[this._djQueue()] : null; this._dj.cur = v ? (typeof v === 'string' ? v : v.host_id || '') : ''; }
  async _djLoad() {
    const mq = (this._h.services && this._h.services.mass_queue) || {};
    if (!mq.send_command || this._c.dj === false) { this._dj = { st: 'none', hosts: [], cur: '' }; return; }
    const seq = this._djSeq = (this._djSeq || 0) + 1, d = this._dj = Object.assign({ st: 'loading', hosts: [], cur: '' }, this._dj && this._dj.st === 'ok' ? this._dj : {});
    try {
      if (!d.hosts.length || Date.now() - (d.at || 0) > 300000) { const hs = await this._djCmd('ai_radio/hosts/list'); if (seq !== this._djSeq) return; d.hosts = (Array.isArray(hs) ? hs : []).filter((x) => x && x.id).map((x) => ({ id: String(x.id), name: String(x.name || x.id) })); d.at = Date.now(); }
      const stt = await this._djCmd('ai_radio/queue_dj/status'); if (seq !== this._djSeq) return;
      this._djSet(stt); d.st = d.hosts.length ? 'ok' : 'none';
    } catch (e) { if (seq !== this._djSeq) return; d.st = 'none'; }
    if (this._dOpen) this._dlgRender();
  }
  async _djPick(id) {
    const d = this._dj, q = this._djQueue(); if (!d || !q || d.busy) return;
    const prev = d.cur; d.cur = id; d.busy = true; d.err = false; this._djSeq = (this._djSeq || 0) + 1; this._dlgRender();
    try { this._djSet(await this._djCmd('ai_radio/queue_dj/set', { queue_id: q, host_id: id || null })); } catch (e) { d.cur = prev; d.err = true; }
    d.busy = false; if (this._dOpen) this._dlgRender();
  }
  async _simLoad() {
    const L = this._h.states[this._leader()], uri = String((L && L.attributes.media_content_id) || '');
    if (this._sim.key === uri && this._sim.st !== 'error' && this._sim.st !== 'idle') return;
    const sm = this._sim = { st: 'loading', key: uri, tracks: [], added: {} };
    if (this._dOpen) this._dlgRender();
    try {
      const entry = await this._drEntry();
      const r = await Promise.race([this._h.callService('mass_queue', 'get_similar_tracks', { config_entry_id: entry, uri }, undefined, true, true), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 30000))]);
      if (this._sim !== sm) return;
      const t = r && r.response && r.response.tracks, seen = {};
      sm.tracks = (Array.isArray(t) ? t : []).filter((x) => x && x.media_content_id && x.media_content_id !== uri && !seen[x.media_content_id] && (seen[x.media_content_id] = 1)).slice(0, 30); sm.st = 'ok';
    } catch (e) { if (this._sim !== sm) return; sm.st = 'error'; }
    if (this._dOpen) this._dlgRender();
  }
  _dlgRender() {
    if (!this._dOpen || !this._h || !this._c) return;
    const h = this._h, lead = this._leader(), L = h.states[lead] || { state: 'unavailable', attributes: {} }, a = L.attributes, mq = (h.services && h.services.mass_queue) || {}, q = this._qu, D = this._dlg;
    const old = D.querySelector('.dsc'), keepTop = old ? old.scrollTop : 0, oldB = D.querySelector('.dbd'), keepB = oldB ? oldB.scrollTop : 0, hadFocus = this.shadowRoot.activeElement && D.contains(this.shadowRoot.activeElement) ? this.shadowRoot.activeElement.getAttribute('data-fk') : null;
    const hasMedia = L.state === 'playing' || L.state === 'paused', dur = hasMedia ? Number(a.media_duration) || 0 : 0, cid = String(a.media_content_id || '');
    const th = (img) => (img ? `<img class="th" loading="lazy" alt="" src="${esc(img)}">` : `<span class="th">${svg(IC.note, 18)}</span>`);
    const items = q.items || [], cur = items.length ? this._qCur(items) : -1, curIt = cur >= 0 ? items[cur] : null, all = cur >= 0 ? items.slice(cur + 1) : [], next = all.slice(0, this._qN), n = all.length, plus = n >= 100;
    const simOk = !!mq.get_similar_tracks && hasMedia && /:\/\/track\//.test(cid);
    if (this._dView === 'sim' && !simOk) this._dView = 'next';
    if (this._dView === 'sim' && this._sim.key !== cid) this._simLoad();
    if (n < 2) this._dEdit = false;
    const edit = this._dEdit, f0 = curIt ? qInfo(curIt) : { title: hasMedia && a.media_title ? a.media_title : 'Nada a tocar', sub: hasMedia ? [a.media_artist, a.media_album_name].filter(Boolean).join(' · ') : '' };
    const skip = !!mq.skip && dur >= 480 ? `<button class="ib tx" data-dskip="-15" data-fk="sk-15" aria-label="Recuar 15 segundos">−15</button><button class="ib tx" data-dskip="30" data-fk="sk30" aria-label="Avançar 30 segundos">+30</button>` : '';
    const srOk = !!this._c.ma_entry;
    if (this._dView === 'search' && !srOk) this._dView = 'next';
    const views = [['next', 'A seguir' + (n ? ' · ' + n + (plus ? '+' : '') : '')]].concat(mq.get_recommendations ? [['rec', 'Para ti']] : [], simOk ? [['sim', 'Parecidas']] : [], srOk ? [['lib', 'Biblioteca'], ['search', 'Pesquisar']] : [], [['dj', 'DJ']]), multi = views.length > 1;
    const seg = multi ? `<div class="seg" role="group" aria-label="O que ver">${views.map((v) => `<button class="${this._dView === v[0] ? 'on' : ''}" data-dview="${v[0]}" data-fk="v${v[0]}" aria-pressed="${this._dView === v[0]}">${esc(v[1])}</button>`).join('')}</div>` : '';
    let body = '';
    if (this._dView === 'sim') {
      const sm = this._sim;
      if (sm.st === 'loading' || sm.st === 'idle') body = '<div class="empty">A procurar músicas parecidas…</div>';
      else if (sm.st === 'error') body = '<div class="empty">Não foi possível obter sugestões</div><button class="chip more" data-dsretry="1" data-fk="sretry">Tentar outra vez</button>';
      else if (!sm.tracks.length) body = '<div class="empty">Sem sugestões para esta música</div>';
      else body = `<div class="qh"><span class="qt">Parecidas com ${esc(f0.title)}</span><button class="chip" data-dsall="1" data-fk="sall" ${sm.all ? 'disabled' : ''}>${sm.all ? 'Adicionadas à fila' : 'Juntar todas à fila'}</button></div>` + sm.tracks.map((t, i) => { const f = qInfo(t), u = esc(t.media_content_id), ad = !!sm.added[t.media_content_id] || !!sm.all; return `<div class="res q">${th(imgOf({ image: t.media_image }))}<button class="rmain" title="Tocar agora" data-dsplay="${u}" data-fk="sp${i}"><span class="rn">${esc(f.title)}</span><span class="rs">${esc(f.sub)}</span></button>${Number(t.duration) > 0 ? `<span class="du">${fmt(t.duration)}</span>` : ''}<button class="ib" data-dsnext="${u}" data-fk="sn${i}" ${ad ? 'disabled' : ''} aria-label="${ad ? 'Na fila' : 'Tocar a seguir'}: ${esc(f.title)}" title="${ad ? 'Na fila' : 'Tocar a seguir'}">${svg(ad ? IC.check : IC.plus, 20)}</button></div>`; }).join('');
    } else if (this._dView === 'search') {
      body = this._sPanel();
    } else if (this._dView === 'rec') {
      body = this._recPanel();
    } else if (this._dView === 'lib') {
      body = this._libPanel();
    } else if (this._dView === 'dj') {
      body = this._djPanel();
    } else {
      const row = (it, i) => {
        const f = qInfo(it), id = esc(it.queue_item_id), nm = esc(f.title);
        const mv = edit
          ? `<button class="ib" data-dact="move_queue_item_up" data-id="${id}" data-fk="u${id}" ${i === 0 ? 'disabled' : ''} aria-label="Subir ${nm}" title="Subir">${svg(IC.up, 22)}</button><button class="ib" data-dact="move_queue_item_down" data-id="${id}" data-fk="d${id}" ${i === n - 1 ? 'disabled' : ''} aria-label="Descer ${nm}" title="Descer">${svg(IC.down, 22)}</button>`
          : `<button class="ib" data-dact="move_queue_item_next" data-id="${id}" data-fk="t${id}" ${i === 0 ? 'disabled' : ''} aria-label="Tocar a seguir: ${nm}" title="Tocar a seguir">${svg(IC.top, 20)}</button>`;
        return `<div class="res q">${th(imgOf({ image: it.media_image }))}<button class="rmain" title="Tocar agora" data-dplay="${id}" data-fk="p${id}"><span class="rn">${nm}</span><span class="rs">${esc(f.sub)}</span></button>${Number(it.duration || it.media_duration) > 0 ? `<span class="du">${fmt(it.duration || it.media_duration)}</span>` : ''}${mv}<button class="ib" data-dact="remove_queue_item" data-id="${id}" data-fk="r${id}" aria-label="Remover ${nm}" title="Remover">${svg(IC.x, 18)}</button></div>`;
      };
      if (q.st === 'error') body = '<div class="empty">Não foi possível ler a fila</div>';
      else if (q.st !== 'ok' && !items.length) body = '<div class="empty">A carregar…</div>';
      else body = (n ? `<div class="qh"><span class="qt">${multi ? (edit ? 'Ordenar a fila' : 'Toque numa música para a tocar já') : `A seguir · ${n}${plus ? '+' : ''}`}</span>${n > 1 ? `<button class="chip${edit ? ' on' : ''}" data-dedit="1" data-fk="edit" aria-pressed="${edit}">${edit ? 'Concluir' : 'Ordenar'}</button>` : ''}</div>` + next.map(row).join('') + (all.length > this._qN ? '<button class="chip more" data-dmore="1" data-fk="more">Mostrar mais</button>' : '') : '<div class="empty">Nada a seguir</div>');
      const rp = String(a.repeat || 'off'), qi = this._qi || {}, opt = [];
      if (mq.set_autoplay) opt.push(`<button class="chip${qi.autoplay_enabled ? ' on' : ''}" data-dopt="autoplay" data-fk="oauto" aria-pressed="${!!qi.autoplay_enabled}">Continuar com parecidas</button>`);
      if (mq.set_crossfade) opt.push(`<button class="chip${qi.crossfade_enabled ? ' on' : ''}" data-dopt="crossfade" data-fk="ofade" aria-pressed="${!!qi.crossfade_enabled}">Transição suave</button>`);
      if (n && mq.clear_queue_from_here) opt.push(`<button class="chip${this._qArm ? ' warn' : ''}" data-dclear="1" data-fk="oclear" aria-label="${this._qArm ? 'Toque outra vez para limpar o que vem a seguir' : 'Limpar a seguir'}">${this._qArm ? 'Toque outra vez' : 'Limpar a seguir'}</button>`);
      if (opt.length) body += `<div class="gh">Opções da fila</div><div class="chips">${opt.join('')}</div>`;
    }
    D.innerHTML = `<div class="dw"><div class="dhd"><span class="dt">A tocar</span><button class="ib" data-dclose="1" data-fk="close" aria-label="Fechar">${svg(IC.x, 20)}</button></div><div class="dbd">${this._dPlayer(L, f0, curIt, skip)}<div class="dsc">${seg}${body}</div></div></div>`;
    const sc = D.querySelector('.dsc'); if (sc && keepTop) sc.scrollTop = keepTop; const sb = D.querySelector('.dbd'); if (sb && keepB) sb.scrollTop = keepB;
    if (hadFocus) { const fe = D.querySelector('[data-fk="' + hadFocus.replace(/"/g, '') + '"]'); if (fe && !fe.disabled) { fe.focus({ preventScroll: true }); if (fe.type === 'search') fe.setSelectionRange(fe.value.length, fe.value.length); } }
    const on = (sel, ev, fn) => D.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, (e) => fn(el, e)));
    const play = (uri, enqueue) => this._svc('music_assistant', 'play_media', { media_id: uri, media_type: 'track', enqueue }, { entity_id: lead });
    const later = () => { clearTimeout(this._qAft); this._qAft = setTimeout(() => this._qLoad(), 1500); };
    on('[data-dclose]', 'click', () => D.close());
    on('[data-dmp]', 'click', (el) => this._svc('media_player', el.dataset.dmp, {}, { entity_id: lead }));
    on('[data-dfav]', 'click', (el) => { if (el.dataset.dfav === '1') Promise.resolve(this._svc('mass_queue', 'unfavorite_current_item', { entity: lead })).catch(() => {}); else { const fb = this._favBtn(); if (fb) this._svc('button', 'press', {}, { entity_id: fb }); } el.disabled = true; later(); });
    on('[data-dseek]', 'pointerdown', () => { this._dsk = true; this._drag = true; });
    on('[data-dseek]', 'input', (el) => { this._dsk = true; const pe = D.querySelector('[data-dpe]'), f = D.querySelector('.dfl'); if (pe) pe.textContent = fmt(el.value); if (f) f.style.width = ((Number(el.value) / (Number(el.max) || 1)) * 100).toFixed(2) + '%'; });
    on('[data-dseek]', 'change', (el) => { const p = Number(el.value); this._pgLocal = { p, at: Date.now(), k: a.media_position_updated_at || '', id: a.media_content_id }; this._svc('media_player', 'media_seek', { seek_position: p }, { entity_id: lead }); this._dsk = false; this._drag = false; });
    on('[data-dgvol]', 'pointerdown', () => { this._drag = true; });
    on('[data-dgvol]', 'input', (el) => { const v = P2V(el.value) + '%'; el.closest('.vrow').querySelector('.vl').textContent = v; el.setAttribute('aria-valuetext', v); el.style.setProperty('--p', Number(el.value) / 10 + '%'); });
    on('[data-dgvol]', 'change', (el) => { this._drag = false; this._svc('input_number', 'set_value', { value: P2V(el.value) }, { entity_id: this._c.volume }); });
    on('[data-dvstep]', 'click', (el) => { const row = el.closest('.vrow'), inp = row.querySelector('input'), lab = row.querySelector('.vl'), v = Math.max(0, Math.min(100, (parseInt(lab.textContent, 10) || 0) + Number(el.dataset.dvstep))); lab.textContent = v + '%'; inp.value = String(V2P(v)); inp.style.setProperty('--p', V2P(v) / 10 + '%'); clearTimeout(this._vsT); this._drag = true; this._vsT = setTimeout(() => { this._drag = false; this._svc('input_number', 'set_value', { value: v }, { entity_id: this._c.volume }); }, 350); });
    on('[data-turi]', 'click', (el) => { const d = { media_id: el.dataset.turi }; if (el.dataset.tmt) d.media_type = el.dataset.tmt; this._svc('music_assistant', 'play_media', d, { entity_id: lead }); this._wait('t' + el.dataset.turi, el.dataset.nm || 'música'); });
    on('[data-dradio]', 'click', (el) => { const p = this._c.radios[el.dataset.dradio]; this._svc('script', 'tocar_no_grupo', { media_content_id: p.id, media_content_type: 'radio' }); this._wait('radio' + el.dataset.dradio, p.name); });
    on('[data-djq]', 'click', (el) => this._djAsk(el.dataset.djq));
    on('[data-recall]', 'click', () => { this._recAll = true; this._dlgRender(); });
    on('[data-djauto]', 'click', () => this._svc('input_boolean', 'toggle', {}, { entity_id: 'input_boolean.dj_automatico' }));
    const djf = D.querySelector('.djf');
    if (djf) { djf.querySelector('input').addEventListener('input', (e) => { this._djQ = e.target.value; }); djf.addEventListener('submit', (e) => { e.preventDefault(); const t = (this._djQ || '').trim(); if (t) this._djAsk(t); }); }
    on('[data-dview]', 'click', (el) => { this._dView = el.dataset.dview; this._dEdit = false; if (this._dView === 'sim') this._simLoad(); if (this._dView === 'rec') this._recLoad(); if (this._dView === 'lib') this._libLoad(); this._dlgRender(); if (this._dView === 'search') { const si = D.querySelector('input[type=search]'); if (si) si.focus(); } });
    on('[data-dedit]', 'click', () => { this._dEdit = !this._dEdit; this._dlgRender(); });
    on('[data-dmore]', 'click', () => { this._qN += 20; this._dlgRender(); });
    on('[data-dplay]', 'click', (el) => { const name = (el.querySelector('.rn') || {}).textContent || 'música'; this._qAct('play_queue_item', { queue_item_id: el.dataset.dplay }); this._wait('q' + el.dataset.dplay, name); });
    on('[data-dact]', 'click', (el) => this._qAct(el.dataset.dact, { queue_item_id: el.dataset.id }));
    on('[data-dskip]', 'click', (el) => { Promise.resolve(this._svc('mass_queue', 'skip', { entity: lead, skip_seconds: Number(el.dataset.dskip) })).catch(() => {}); this._pgLocal = null; });
    on('[data-dopt]', 'click', (el) => {
      const k = el.dataset.dopt;
      if (k === 'shuffle') this._svc('media_player', 'shuffle_set', { shuffle: !a.shuffle }, { entity_id: lead });
      else if (k === 'repeat') this._svc('media_player', 'repeat_set', { repeat: { off: 'all', all: 'one', one: 'off' }[String(a.repeat || 'off')] || 'off' }, { entity_id: lead });
      else { const key = k + '_enabled', v = !((this._qi || {})[key]); Promise.resolve(this._svc('mass_queue', 'set_' + k, { entity: lead, enabled: v })).catch(() => {}); this._qi = Object.assign({}, this._qi, { [key]: v }); this._qiSeq = (this._qiSeq || 0) + 1; clearTimeout(this._qiT); this._qiT = setTimeout(() => this._qInfo(), 1500); this._dlgRender(); }
    });
    on('[data-dj]', 'click', (el) => { if (el.dataset.dj !== (this._dj.cur || '')) this._djPick(el.dataset.dj); });
    on('[data-dclear]', 'click', () => { clearTimeout(this._qArmT); if (!this._qArm) { this._qArm = true; this._qArmT = setTimeout(() => { this._qArm = false; this._dlgRender(); }, 5000); this._dlgRender(); return; } this._qArm = false; this._qAct('clear_queue_from_here', {}); });
    on('[data-dsretry]', 'click', () => { this._sim = { st: 'idle', key: '', tracks: [], added: {} }; this._simLoad(); });
    on('[data-dsplay]', 'click', (el) => { play(el.dataset.dsplay, 'play'); this._wait('s' + el.dataset.dsplay, (el.querySelector('.rn') || {}).textContent || 'música'); });
    on('[data-dsnext]', 'click', (el) => { play(el.dataset.dsnext, 'next'); this._sim.added[el.dataset.dsnext] = 1; later(); this._dlgRender(); });
    on('[data-dsall]', 'click', () => { const u = this._sim.tracks.map((t) => t.media_content_id).filter((x) => !this._sim.added[x]); if (u.length) play(u, 'add'); this._sim.all = true; later(); this._dlgRender(); });
    this._sBind(D);
  }
  _dpg(L) {
    if (!this._dOpen || this._dsk) return;
    const d = Number(L.attributes.media_duration) || 0, f = this._dlg.querySelector('.dfl'); if (!f || !d) return;
    const p = this._pos(L), t = fmt(p), pe = this._dlg.querySelector('[data-dpe]'), sk = this._dlg.querySelector('[data-dseek]');
    f.style.width = ((p / d) * 100).toFixed(2) + '%'; if (pe && pe.textContent !== t) pe.textContent = t; if (sk) sk.value = String(Math.round(p));
  }
  _favBtn() { const h = this._h, en = h.entities || {}, e = en[this._leader()], dev = e && e.device_id; return dev ? Object.keys(en).find((k) => k.indexOf('button.') === 0 && en[k].device_id === dev && /favorit/.test(k + ' ' + (en[k].translation_key || ''))) || '' : ''; }
  _dPlayer(L, f0, curIt, skip) {
    const a = L.attributes, c = this._c, hasMedia = L.state === 'playing' || L.state === 'paused', playing = L.state === 'playing', dur = hasMedia ? Number(a.media_duration) || 0 : 0, canSeek = dur > 0 && (Number(a.supported_features) & 2) === 2, pos = dur ? this._pos(L) : 0, pct = (dur ? (pos / dur) * 100 : 0).toFixed(2);
    const img = hasMedia && a.entity_picture ? a.entity_picture : curIt ? imgOf({ image: curIt.media_image }) : '', volS = this._h.states[c.volume], vol = volS ? Math.round(Number(volS.state) || 0) : 0, rp = String(a.repeat || 'off'), fav = !!(curIt && curIt.favorite), favOk = hasMedia && (fav || !!this._favBtn());
    return `<div class="dpl"><div class="dtop"><div class="dart" ${img ? `style="background-image:url('${esc(img)}')"` : ''}>${img ? '' : svg(IC.note, 44)}</div><div class="dti"><div class="dmeta"><div class="t">${esc(f0.title)}</div><div class="s">${esc(f0.sub)}</div></div>${favOk ? `<button class="ib${fav ? ' fav' : ''}" data-dfav="${fav ? 1 : 0}" data-fk="fav" aria-pressed="${fav}" aria-label="${fav ? 'Tirar dos favoritos' : 'Juntar aos favoritos'}">${svg(fav ? IC.heart : IC.heartO, 22)}</button>` : ''}</div></div>
      ${dur ? '' : `<div class="s live">${hasMedia ? 'Em direto' : ''}</div>`}<div class="pg" ${dur ? '' : 'hidden'}><span class="pt" data-dpe="1">${dur ? fmt(pos) : ''}</span><div class="pb"><div class="tr"><div class="dfl" style="width:${pct}%"></div></div>${canSeek ? `<input type="range" min="0" max="${Math.round(dur)}" step="${dur > 300 ? 5 : 1}" value="${Math.round(pos)}" data-dseek="1" data-fk="seek" aria-label="Posição">` : ''}</div><span class="pt r">${dur ? fmt(dur) : ''}</span></div>
      <div class="dctl">${a.shuffle !== undefined ? `<button class="ib${a.shuffle ? ' on' : ''}" data-dopt="shuffle" data-fk="oshuf" aria-pressed="${!!a.shuffle}" aria-label="Baralhar">${svg(IC.shuf, 20)}</button>` : ''}<button class="ib" data-dmp="media_previous_track" data-fk="prev" aria-label="Anterior">${svg(IC.prev)}</button><button class="ib big pri" data-dmp="media_play_pause" data-fk="pp" aria-label="${playing ? 'Pausa' : 'Tocar'}">${svg(playing ? IC.pause : IC.play, 26)}</button><button class="ib" data-dmp="media_next_track" data-fk="next" aria-label="Seguinte">${svg(IC.next)}</button>${a.repeat !== undefined ? `<button class="ib${rp !== 'off' ? ' on' : ''}" data-dopt="repeat" data-fk="orep" aria-label="Repetir: ${rp === 'one' ? 'só esta música' : rp === 'all' ? 'a fila toda' : 'desligado'}">${svg(rp === 'one' ? IC.rep1 : IC.rep, 20)}</button>` : ''}</div>
      ${skip ? `<div class="dctl">${skip}</div>` : ''}
      <div class="vrow"><button class="ib" data-dvstep="-1" data-fk="vm" aria-label="Baixar o volume 1%">−</button><input type="range" min="0" max="1000" value="${V2P(vol)}" style="--p:${V2P(vol) / 10}%" data-dgvol="1" data-fk="vol" aria-label="Volume geral" aria-valuetext="${vol}%"><button class="ib" data-dvstep="1" data-fk="vp" aria-label="Subir o volume 1%">+</button><span class="vl">${vol}%</span></div></div>`;
  }
  _tiles(items, wrap) { return `<div class="hs${wrap ? ' wrap' : ''}">${items.map((it, i) => { const img = imgOf(it); return `<button class="tl${it.media_type === 'artist' ? ' rnd' : ''}" data-turi="${esc(it.uri)}" data-tmt="${esc(it.media_type || '')}" data-nm="${esc(it.name)}" data-fk="tl${esc(it.uri)}" title="Tocar ${esc(it.name)}">${img ? `<img class="ti" loading="lazy" alt="" src="${esc(img)}">` : `<span class="ti">${svg(IC.note, 28)}</span>`}<span class="tn">${esc(it.name)}</span></button>`; }).join('')}</div>`; }
  async _load(key, fn) {
    const cur = this[key];
    if (cur && (cur.st === 'loading' || (cur.st === 'ok' && Date.now() - cur.at < 600000))) return;
    const r = this[key] = { st: 'loading', items: [] }; if (this._dOpen) this._dlgRender();
    try { const x = await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 30000))]); if (this[key] !== r) return; r.items = Array.isArray(x) ? x : []; r.st = 'ok'; r.at = Date.now(); } catch (e) { if (this[key] !== r) return; r.st = 'error'; }
    if (this._dOpen) this._dlgRender();
  }
  _recLoad() { return this._load('_rec', async () => { const x = await this._h.callService('mass_queue', 'get_recommendations', { entity: this._leader() }, undefined, true, true); return ((x && x.response && x.response.response) || []).filter((y) => y && Array.isArray(y.items) && y.items.length); }); }
  _libLoad() { return this._load('_lib', async () => { const x = await this._h.callService('music_assistant', 'get_library', { config_entry_id: this._c.ma_entry, media_type: 'playlist', limit: 80, order_by: 'name' }, undefined, true, true); return ((x && x.response && x.response.items) || []).filter((y) => y && y.uri); }); }
  _recPanel() {
    const r = this._rec || {};
    if (r.st !== 'ok') return r.st === 'error' ? '<div class="empty">Não foi possível obter sugestões</div>' : '<div class="empty">A carregar sugestões…</div>';
    const known = REC.map((k) => k[0]), secs = r.items.filter((x) => REC_SKIP.indexOf(x.item_id) < 0).map((x) => { const i = known.indexOf(x.item_id); return { ord: i < 0 ? 99 : i, name: i < 0 ? x.name : REC[i][1], items: x.items.filter((y) => y && y.uri).slice(0, 20) }; }).filter((x) => x.items.length).sort((p, q) => p.ord - q.ord);
    if (!secs.length) return '<div class="empty">Sem sugestões neste momento</div>';
    const show = this._recAll ? secs : secs.slice(0, REC_TOP);
    return show.map((sec) => `<div class="gh">${esc(sec.name)}</div>` + this._tiles(sec.items)).join('') + (secs.length > show.length ? '<button class="chip more" data-recall="1" data-fk="recall">Mais sugestões</button>' : '');
  }
  _libPanel() {
    const l = this._lib || {}, c = this._c;
    return (l.st === 'ok' ? (l.items.length ? '<div class="gh">Playlists</div>' + this._tiles(l.items, true) : '<div class="empty">Sem playlists na biblioteca</div>') : l.st === 'error' ? '<div class="empty">Não foi possível ler a biblioteca</div>' : '<div class="empty">A carregar a biblioteca…</div>') + (c.radios.length ? `<div class="gh">Rádios</div><div class="chips">${c.radios.map((p, i) => `<button class="chip" data-dradio="${i}" data-fk="rd${i}">${esc(p.name)}</button>`).join('')}</div>` : '');
  }
  _djPanel() {
    const h = this._h, dj = this._dj, rq = this._djReq || {}, auto = h.states['input_boolean.dj_automatico'], can = !!(h.services && h.services.script && h.services.script.dj_escolher), dis = rq.busy ? 'disabled' : '';
    let o = '';
    if (can) o += `<div class="gh">Pedir música ao DJ</div><form class="djf"><input type="text" data-fk="djq" placeholder="Jantar calmo, mais animado, anos 90…" value="${esc(this._djQ || '')}" aria-label="Pedido ao DJ" ${dis}><button class="ib pri" type="submit" aria-label="Pedir" ${dis}>${svg(IC.plus, 22)}</button></form><div class="chips">${['Surpreende-me', 'Mais animado', 'Mais calmo', 'Música portuguesa', 'Para os miúdos'].map((t, i) => `<button class="chip" data-djq="${t}" data-fk="dq${i}" ${dis}>${t}</button>`).join('')}</div>${rq.msg ? `<div class="empty" role="status">${esc(rq.msg)}</div>` : ''}`;
    if (can && auto) o += `<div class="gh">Quando a fila está a acabar</div><div class="chips"><button class="chip${auto.state === 'on' ? ' on' : ''}" data-djauto="1" data-fk="djauto" aria-pressed="${auto.state === 'on'}">DJ automático</button></div>`;
    if (dj && dj.st === 'ok' && this._djQueue()) o += `<div class="gh">Locutor entre músicas${dj.err ? ' · não foi possível mudar' : ''}</div><div class="chips">${[{ id: '', name: 'Sem locutor' }].concat(dj.hosts).map((x, i) => `<button class="chip${dj.cur === x.id ? ' on' : ''}" data-dj="${esc(x.id)}" data-fk="dj${i}" aria-pressed="${dj.cur === x.id}" ${dj.busy ? 'disabled' : ''}>${esc(x.name)}</button>`).join('')}</div>`;
    return o || '<div class="empty">O DJ não está disponível</div>';
  }
  async _djAsk(text) {
    if (this._djReq && this._djReq.busy) return;
    const p = text === 'Surpreende-me' ? '' : String(text || '').slice(0, 200), rq = this._djReq = { busy: true, msg: 'O DJ está a escolher. Pode demorar meio minuto.' };
    this._djQ = ''; this._dlgRender();
    try {
      if (this._h.states['input_text.dj_pedido']) this._svc('input_text', 'set_value', { value: p }, { entity_id: 'input_text.dj_pedido' });
      const r = await this._h.callService('script', 'dj_escolher', { pedido: p, modo: 'add', quantidade: 10 }, undefined, true, true), n = ((r && r.response && r.response.encontradas) || []).length;
      rq.msg = n ? `Juntei ${n} ${n === 1 ? 'música' : 'músicas'} à fila` : 'Não encontrei músicas para esse pedido';
    } catch (e) { rq.msg = 'O DJ não respondeu. Tenta outra vez.'; }
    rq.busy = false; this._qLoad(); if (this._dOpen) this._dlgRender();
  }
  _sPanel() {
    const h = this._h;
    const mq = (h.services && h.services.mass_queue) || {}, drill = (k) => (k === 'albums' || k === 'artists' || k === 'playlists') && !!mq['get_' + k.slice(0, -1) + '_tracks'];
    const groups = [['tracks', 'Músicas'], ['artists', 'Artistas'], ['albums', 'Álbuns'], ['playlists', 'Playlists'], ['radio', 'Rádios']];
    const res = this._res ? groups.map(([k, label]) => (this._res[k] || []).length ? `<div class="gh">${label}</div>` + this._res[k].slice(0, 6).map((it, i) => `<div class="res">${imgOf(it) ? `<img class="th" loading="lazy" alt="" src="${esc(imgOf(it))}">` : `<span class="th">${svg(IC.note, 18)}</span>`}<button class="rmain" title="${drill(k) ? 'Abrir' : 'Tocar agora'}" ${drill(k) ? `data-open="${k}:${i}"` : `data-uri="${esc(it.uri)}" data-mt="${esc(it.media_type)}"`}><span class="rn">${esc(it.name)}${it.version ? ' (' + esc(it.version) + ')' : ''}</span><span class="rs">${esc([(it.artists || []).map((x) => x.name).join(', '), k === 'tracks' && it.album ? it.album.name : ''].filter(Boolean).join(' · '))}</span></button>${srcOf(it.uri) ? `<span class="src">${esc(srcOf(it.uri))}</span>` : ''}${drill(k) ? `<span class="chev">${svg(IC.chev, 18)}</span>` : ''}<button class="ib" data-uri="${esc(it.uri)}" data-mt="${esc(it.media_type)}" data-next="1" aria-label="Tocar a seguir" title="Tocar a seguir">${svg(IC.plus, 20)}</button></div>`).join('') : '').join('') || '<div class="empty">Sem resultados</div>' : '';
    return this._dr ? this._drPanel() : `<div class="qp"><form class="sform"><input type="search" data-fk="sq" placeholder="Música, artista, álbum…" value="${esc(this._q)}" aria-label="Pesquisar música"><button class="ib pri" type="submit" aria-label="Pesquisar"><ha-icon icon="mdi:magnify"></ha-icon></button></form>${this._busy ? '<div class="empty">A pesquisar…</div>' : res}</div>`;
  }
  getGridOptions() { return { columns: 'full', rows: 'auto', min_columns: 6 }; }
  set hass(h) {
    this._h = h;
    if (this._emb) this._emb.hass = h;
    const c = this._c, ids = [c.leader_sensor, c.volume, this._leader()].concat(c.rooms.map((r) => r.entity), c.rooms.flatMap((r) => [r.bt, r.pi, r.bt_on, r.bt_off]).filter(Boolean), c.presets.map((p) => p.entity), c.radios.map((p) => p.entity), c.playlists.map((p) => p.entity)).filter(Boolean);
    const sig = ids.map((i) => { const s = h.states[i]; return s ? s.state + '|' + (s.attributes.volume_level ?? '') + '|' + (s.attributes.media_title ?? '') + '|' + (s.attributes.entity_picture ?? '') + '|' + (s.attributes.group_members || []).length : '-'; }).join(';');
    const lead = this._leader(), LS = h.states[lead], qk = LS ? lead + '|' + LS.state + '|' + (LS.attributes.media_content_id ?? '') + '|' + (LS.attributes.media_title ?? '') : '-';
    if (qk !== this._qKey) { const first = !this._qKey; this._qKey = qk; if (this._qWant()) { clearTimeout(this._qDeb); this._qDeb = setTimeout(() => this._qLoad(), first ? 0 : 600); } }
    const sg = sig + '#' + qk + '#' + (LS ? (LS.attributes.media_duration ?? '') + '|' + ((Number(LS.attributes.supported_features) & 2) || 0) + '|' + (LS.attributes.shuffle ?? '') + '|' + (LS.attributes.repeat ?? '') : '') + '|' + ((h.states['input_boolean.dj_automatico'] || {}).state || '') + '|' + ((h.states[c.volume] || {}).state || '');
    if (sg !== this._sig && !this._drag) { this._sig = sg; this._render(); }
    this._pgSync();
  }
  _leader() { const s = this._h && this._h.states[this._c.leader_sensor]; return s && s.state.startsWith('media_player.') ? s.state : this._c.rooms[0].entity; }
  _svc(d, s, data, target) { return this._h.callService(d, s, data || {}, target); }
  _room(r) {
    const s = this._h.states[r.entity], L = this._h.states[this._leader()];
    const members = (L && L.attributes.group_members) || [];
    const off = !s || s.state === 'unavailable';
    const apart = !off && members.length > 0 && !members.includes(r.entity);
    const vol = s ? Number(s.attributes.volume_level || 0) : 0;
    const on = !off && !apart && vol > 0;
    const bt = r.bt ? this._h.states[r.bt] : null, pi = r.pi ? this._h.states[r.pi] : null;
    const run = (e) => !!e && !!this._h.states[e] && this._h.states[e].state === 'on';
    const btBusy = run(r.bt_on) ? 'A ligar Bluetooth…' : run(r.bt_off) ? 'A desligar Bluetooth…' : '';
    return { off, apart, on, vol, btOk: !!bt && bt.state !== 'unavailable', btOn: !!bt && bt.state === 'on', btBusy, piOk: !!pi && pi.state !== 'unavailable', piOn: !!pi && pi.state === 'on', label: off ? 'Sem ligação' : apart ? 'À parte' : on ? 'A tocar' : '' };
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const L = h.states[this._leader()] || { state: 'unavailable', attributes: {} };
    const playing = L.state === 'playing';
    const a = L.attributes, hasMedia = playing || L.state === 'paused';
    if (playing && this._pend && Date.now() - this._pend.at > 1500) this._pend = null;
    const pend = this._pend;
    const title = pend ? 'A iniciar ' + pend.name + '…' : hasMedia && a.media_title ? a.media_title : 'Nada a tocar';
    const sub = pend ? 'Pode demorar alguns segundos' : hasMedia ? [a.media_artist, a.media_album_name].filter(Boolean).join(' · ') : '';
    const volS = h.states[c.volume], vol = volS ? Math.round(Number(volS.state) || 0) : 0;
    const rooms = c.rooms.map((r) => Object.assign({}, r, this._room(r)));
    const onRooms = rooms.filter((r) => r.on);
    const where = onRooms.length === rooms.length ? 'Casa toda' : onRooms.length ? onRooms.map((r) => r.name).join(', ') : 'Nenhuma divisão';
    const dur = hasMedia ? Number(a.media_duration) || 0 : 0, cid0 = String(a.media_content_id || ''), onAir = hasMedia && !dur && cid0.indexOf('://radio/') >= 0 && cid0.indexOf('/api/tts_proxy/') < 0;
    const canSeek = dur > 0 && (Number(a.supported_features) & 2) === 2, pos = dur ? this._pos(L) : 0, pct = (dur ? (pos / dur) * 100 : 0).toFixed(2);
    const pg = `<div class="pg${dur ? '' : onAir ? ' live' : ' off'}"><span class="pt" data-pe="1">${dur ? fmt(pos) : ''}</span><div class="pb"${dur && !canSeek ? ` role="progressbar" aria-label="Posição" aria-valuemin="0" aria-valuemax="${Math.round(dur)}" aria-valuenow="${Math.round(pos)}"` : ''}><div class="tr"><div class="fl" style="width:${pct}%"></div></div>${canSeek ? `<span class="kn" style="left:${pct}%"></span><input type="range" min="0" max="${Math.round(dur)}" step="${dur > 300 ? 5 : 1}" value="${Math.round(pos)}" data-seek="1" aria-label="Posição" aria-valuetext="${fmt(pos)} de ${fmt(dur)}">` : ''}</div><span class="pt r">${dur ? fmt(dur) : onAir ? 'Em direto' : ''}</span></div>`;
    const qOk = this._qOk();
    let hint = '';
    if (qOk && hasMedia && this._qu.st === 'ok') {
      const qi = this._qu.items, ci = this._qCur(qi, true), raw = ci < 0 ? [] : qi.slice(ci + 1), fol = raw.filter((it) => String(it.media_content_id || '').indexOf('/api/tts_proxy/') < 0);
      if (fol.length) {
        const nt = qInfo(fol[0]).title, cap = raw.length >= 100, nn = cap ? '99+' : String(fol.length - 1), tot = cap ? '99+' : String(fol.length);
        hint = `<button class="nx" data-qhint="1" aria-label="A seguir: ${esc(nt)}${fol.length > 1 ? ', mais ' + nn + ' na fila' : ''}. Abrir a fila"><span class="nl">A seguir: <b>${esc(nt)}</b></span>${fol.length > 1 ? `<span class="nn">&nbsp;· +${nn}</span>` : ''}<span class="ns">+${tot} na fila</span></button>`;
      }
    }
    if (this._tab === 'queue' && !qOk) { this._tab = null; this._qSync(); }
    if (this._dOpen && !qOk) this._dlg.close();
    const tabs = [['queue', 'Fila'], ['rooms', 'Colunas'], ['radios', 'Rádios'], ['playlists', 'Playlists'], ['search', 'Pesquisar']].filter((t) => t[0] === 'queue' ? qOk : t[0] === 'rooms' ? !c.presets.length : t[0] === 'search' ? !!c.ma_entry : c[t[0]].length);
    const chip = (on, label, attrs) => `<button class="chip${on ? ' on' : ''}" ${attrs}>${esc(label)}</button>`;
    const st = (e) => !!e && !!h.states[e] && h.states[e].state === 'on';
    let panel = '';
    if (this._tab === 'rooms') {
      panel = rooms.map((r, i) => `<div class="room${r.on ? ' on' : ''}">
        <button class="rmain" data-toggle="${i}" ${r.off ? 'disabled' : ''} aria-pressed="${r.on}"><span class="rn">${esc(r.name)}</span><span class="rs">${[r.label, r.btOn ? 'Bluetooth' : ''].filter(Boolean).join(' · ')}</span></button>
        <button class="ib" data-more="${i}" aria-label="Opções de ${esc(r.name)}" aria-expanded="${this._open === i}">${svg(IC.dots, 20)}</button>
        ${this._open === i ? `<div class="opts">
          ${r.pi ? `<button class="chip${this._arm === 'pi' + i ? ' warn' : ''}" data-act="pi" data-i="${i}" ${r.piOk ? '' : 'disabled'}>${svg(IC.stop, 14)}${!r.piOk ? 'Controlador indisponível' : this._arm === 'pi' + i ? 'Toque outra vez para desligar' : r.piOn ? 'Desligar controlador' : 'Ligar controlador'}</button>` : ''}
          ${r.bt ? `<button class="chip${r.btOn && !r.btBusy ? ' on' : ''}${this._arm === 'bt' + i ? ' warn' : ''}" data-act="bt" data-i="${i}" ${r.btOk && !r.btBusy ? '' : 'disabled'}>${svg(IC.bt, 16)}${!r.btOk ? 'Amplificador Bluetooth indisponível' : r.btBusy ? r.btBusy : this._arm === 'bt' + i ? 'Toque outra vez para desligar' : r.btOn ? 'Amplificador Bluetooth ligado' : 'Ligar amplificador Bluetooth'}</button>` : ''}
          <button class="chip" data-act="solo" data-i="${i}" ${r.off ? 'disabled' : ''}>Só aqui</button>
          <button class="chip${r.apart ? ' on' : ''}" data-act="apart" data-i="${i}" ${r.off ? 'disabled' : ''}>${r.apart ? 'Voltar à casa' : 'Tocar à parte'}</button>
          ${r.apart ? `<label class="vrow small">${svg(IC.vol, 18)}<input type="range" min="0" max="1000" value="${V2P(r.vol * 100)}" style="--p:${V2P(r.vol * 100) / 10}%" data-rvol="${i}" aria-label="Volume de ${esc(r.name)}" aria-valuetext="${Math.round(r.vol * 100)}%"><span class="vl">${Math.round(r.vol * 100)}%</span></label>` : ''}
        </div>` : ''}</div>`).join('');
    } else if (this._tab === 'radios' || this._tab === 'playlists') {
      const type = this._tab === 'radios' ? 'radio' : 'playlist', cid = String(a.media_content_id || ''), isRadio = cid.indexOf('://radio/') >= 0 && cid.indexOf('/api/tts_proxy/') < 0, live = hasMedia && (type === 'radio' ? isRadio : !isRadio);
      panel = `<div class="grid">${c[this._tab].map((p, i) => `<button class="tile${(live && st(p.entity)) || (pend && pend.key === type + i) ? ' on' : ''}" data-play="${type}" data-i="${i}">${svg(IC.note, 18)}<span>${esc(p.name)}</span></button>`).join('')}</div>`;
    } else if (this._tab === 'queue') {
      panel = this._qPanel();
    } else if (this._tab === 'search') {
      panel = this._sPanel();
    }
    const si = /^s\d+$/.test(this._tab || '') ? Number(this._tab.slice(1)) : -1, sc = si >= 0 ? c.shortcuts[si] : null;
    if (sc && sc.card) { panel = '<slot name="emb"><div class="empty">A carregar…</div></slot>'; this._embEnsure(si); } else this._embDrop(true);
    const focused = this.shadowRoot.activeElement && this._main.contains(this.shadowRoot.activeElement) && this.shadowRoot.activeElement.matches('input[type=search]');
    this._main.innerHTML = `<style>
      :host{display:block}
      ::slotted(*){display:block;--ha-card-background:transparent;--ha-card-border-width:0;--ha-card-box-shadow:none}
      ha-card{padding:16px;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
      button{font:inherit;color:inherit;border:0;cursor:pointer;background:none;padding:0;-webkit-tap-highlight-color:transparent}
      button:disabled{opacity:.4;cursor:default}
      button:focus-visible,input:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .np{display:flex;gap:14px;align-items:center;min-width:0}
      .art{flex:none;width:72px;height:72px;border-radius:12px;background:var(--secondary-background-color) center/cover;display:grid;place-items:center;color:var(--secondary-text-color);position:relative;overflow:hidden}
      .meta{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}
      .t{font-size:18px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .s,.w{font-size:13px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .w{display:flex;align-items:center;gap:8px;overflow:visible}.meta{container-type:inline-size}.wh{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}.wh:not(:last-child){flex-shrink:0;max-width:calc(100% - 152px)}
      .nx{position:relative;flex:0 1000 auto;min-width:110px;max-width:60%;display:flex;align-items:baseline;white-space:nowrap;line-height:1.3;color:var(--secondary-text-color)}.nx::before{content:'·';flex:none;margin-right:8px}.nx::after{content:'';position:absolute;inset:-14px -6px}
      .nl{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}.nl b{font-weight:500;color:var(--primary-text-color)}.nn{flex:none}.ns{display:none;flex:none;color:var(--primary-text-color)}
      @container (max-width:230px){.nl,.nn{display:none}.ns{display:inline}.nx{max-width:none;min-width:0;flex:none}.wh:not(:last-child){max-width:calc(100% - 120px)}}
      .panel{scroll-margin:72px 0 16px}
      .bars{display:inline-flex;align-items:flex-end;gap:2px;height:14px}
      .bars i{width:3px;background:var(--primary-color);border-radius:1px;height:30%}
      .play .bars i{animation:b 1s ease-in-out infinite}.bars i:nth-child(2){animation-delay:.2s}.bars i:nth-child(3){animation-delay:.4s}.bars i:nth-child(4){animation-delay:.1s}
      @keyframes b{0%,100%{height:25%}50%{height:100%}}
      @media (prefers-reduced-motion:reduce){.play .bars i{animation:none;height:70%}}
      .pg{display:flex;align-items:center;gap:10px;height:20px;font-size:12px;line-height:1;color:var(--secondary-text-color);font-variant-numeric:tabular-nums;white-space:nowrap}.pt{flex:none;min-width:30px}.pt.r{text-align:right}
      .pb{position:relative;flex:1;min-width:0;height:20px;display:flex;align-items:center}.tr{flex:1;height:4px;border-radius:2px;background:color-mix(in srgb,var(--primary-text-color) 22%,transparent);overflow:hidden}.fl{height:100%;border-radius:2px;background:var(--primary-color)}
      .kn{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--primary-color);opacity:0;pointer-events:none}.pb input{position:absolute;left:-8px;top:-12px;width:calc(100% + 16px);height:44px;margin:0;padding:0;opacity:0;cursor:pointer}
      .pb.drag .kn,.pb:has(input:focus-visible) .kn{opacity:1}.pb:has(input:focus-visible) .tr{outline:2px solid var(--primary-color);outline-offset:4px}@media (hover:hover){.pb:hover .kn{opacity:1}}
      .pg.live .fl{width:100% !important;opacity:.45}.pg.off .tr{opacity:.5}.du{flex:none;font-size:12px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums}.res.cur .du{color:inherit;opacity:.75}
      .ctl{display:flex;align-items:center;gap:8px}
      .ib{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color)}
      .ib.pri{background:var(--primary-color);color:#181926}.ib ha-icon{--mdc-icon-size:22px;display:flex}.res{padding-left:6px}.th{flex:none;width:44px;height:44px;border-radius:8px;object-fit:cover;background:var(--card-background-color);display:grid;place-items:center;color:var(--secondary-text-color)}.src{flex:none;font-size:12px;color:var(--secondary-text-color);white-space:nowrap}
      .ib.big{width:56px;height:56px}
      .sp{flex:1}
      .vrow{display:flex;align-items:center;gap:10px;color:var(--secondary-text-color);font-size:13px;font-variant-numeric:tabular-nums}
      .vrow input{flex:1;height:44px;min-width:0;margin:0;padding:0;background:none;-webkit-appearance:none;appearance:none;cursor:pointer;--p:0%}
      .vrow input::-webkit-slider-runnable-track{height:12px;border-radius:6px;background:linear-gradient(to right,var(--primary-color) var(--p),color-mix(in srgb,var(--primary-text-color) 22%,transparent) var(--p))}
      .vrow input::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:30px;height:30px;margin-top:-9px;border-radius:50%;background:var(--primary-color);border:3px solid var(--card-background-color);box-sizing:border-box}
      .vrow input::-moz-range-track{height:12px;border-radius:6px;background:color-mix(in srgb,var(--primary-text-color) 22%,transparent)}
      .vrow input::-moz-range-progress{height:12px;border-radius:6px;background:var(--primary-color)}
      .vrow input::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:var(--primary-color);border:3px solid var(--card-background-color);box-sizing:border-box}
      .room.on .vrow input::-webkit-slider-thumb,.room.on .vrow input::-moz-range-thumb{border-color:var(--primary-text-color)}
      .vrow span{width:38px;text-align:right}.vrow .ib{width:44px;height:44px;font-size:24px;line-height:1;font-weight:500;color:var(--primary-text-color)}.vrow{gap:8px}
      .vrow.small{flex:1 1 100%}
      .chips{display:flex;flex-wrap:wrap;gap:8px}
      .chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
      .chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .chip.warn,.room.on .opts .chip.warn{background:var(--error-color);color:#181926;font-weight:600}
      .tabs{display:flex;gap:4px;padding:4px;border-radius:16px;background:var(--secondary-background-color)}.seg{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--secondary-background-color)}.seg button{flex:1 1 0;min-width:0;min-height:44px;padding:0 8px;border-radius:10px;font-size:14px;font-weight:500;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.seg button.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}.seg button.ico{flex:0 0 48px;padding:0;display:grid;place-items:center;color:var(--secondary-text-color)}.seg button.on2{background:var(--card-background-color);color:var(--primary-text-color)}.seg ha-icon{--mdc-icon-size:20px;display:flex}
      .tab{flex:1 1 0;min-width:0;height:56px;padding:0 2px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:12px;font-weight:500;color:var(--secondary-text-color)}.tab.ico{flex:0 0 52px}.tab ha-icon{--mdc-icon-size:20px;display:flex}.tab span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .tab.on{background:var(--card-background-color);color:var(--primary-text-color);font-weight:600}
      .panel{display:flex;flex-direction:column;gap:8px}
      .room,.res{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 6px 6px 14px;border-radius:12px;background:var(--secondary-background-color)}
      .room.on{background:var(--primary-text-color);color:var(--card-background-color)}
      .room.on .rs{color:inherit;opacity:.75}.room.on .ib{background:rgba(0,0,0,.12)}
      .rmain{flex:1;min-width:0;min-height:44px;display:flex;flex-direction:column;justify-content:center;gap:2px;text-align:left}
      .rs:empty,.s:empty{display:none}ha-card.full{border:0;border-radius:16px}.rn,.rs,.t,.s,.w{line-height:1.3}.rn{font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rs{font-size:13px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .res .ib,.room .ib{width:44px;height:44px;background:var(--card-background-color)}.room.on .ib,.res.cur .ib{background:rgba(0,0,0,.12)}.res button.rmain{border-radius:8px}
      .res .ib:focus-visible,.room .ib:focus-visible{background:var(--primary-text-color);color:var(--card-background-color)}.room.on .ib:focus-visible{background:var(--card-background-color);color:var(--primary-text-color)}
      @media (hover:hover){.res button.rmain:hover{background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary-text-color) 8%,transparent)}.res .ib:hover,.room .ib:hover{background:var(--primary-text-color);color:var(--card-background-color)}.room.on .ib:hover{background:var(--card-background-color);color:var(--primary-text-color)}}
      .opts{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:8px;padding:4px 0 6px}
      .room.on .opts .chip{background:rgba(0,0,0,.12);color:inherit}.room.on .opts .chip.on{background:var(--card-background-color);color:var(--primary-text-color)}
      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
      .tile{min-height:56px;padding:0 14px;border-radius:12px;background:var(--secondary-background-color);display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500;text-align:left}
      .tile.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .sform{display:flex;gap:8px}.sform input{flex:1;min-width:0;height:48px;padding:0 16px;border-radius:999px;border:0;background:var(--secondary-background-color);color:inherit;font:inherit;font-size:15px}
      .tabs{container-type:inline-size;gap:2px}@container (max-width:420px){.tab{flex:1 1 auto;min-width:44px}.tab.ico{flex:0 0 44px}}@container (max-width:281px){.tab{min-width:0}}
      .qp{display:flex;flex-direction:column;gap:8px;container-type:inline-size}.qh{display:flex;align-items:center;gap:8px;min-height:44px;padding-left:4px}.qt{flex:1;min-width:0;font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qh .chip{flex:none}
      .res.cur{background:var(--primary-text-color);color:var(--card-background-color)}.res.cur .rs,.res.cur .src{color:inherit;opacity:.75}.res.cur .src,#m .qp .res .src{padding-right:10px}#m .qp .res .du:last-child{padding-right:10px}.q .opts .chip{background:var(--card-background-color)}.chip.more{align-self:center}
      @container (max-width:340px){.qp .src,.qp .du{display:none}}
      .chip.pri{background:var(--primary-color);color:#181926;font-weight:600}.chip.back{padding:0 16px 0 10px}.chev{flex:none;display:grid;color:var(--secondary-text-color)}.dh{display:flex;align-items:center;gap:12px;min-width:0;padding:0 4px}.dh .th{width:56px;height:56px;background:var(--secondary-background-color)}
      dialog{position:fixed;inset:0;margin:max(12px,env(safe-area-inset-top,0px)) auto auto;width:min(560px,calc(100vw - 24px));max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px));padding:0;border:0;border-radius:20px;box-sizing:border-box;overflow:hidden;background:var(--card-background-color,var(--ha-card-background,#1f2430));color:var(--primary-text-color);font-family:var(--ha-font-family-body,inherit)}
      dialog[open]{display:flex}dialog::backdrop{background:rgba(0,0,0,.6)}
      .dw{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column}.dhd{flex:none;display:flex;align-items:center;gap:8px;padding:12px 12px 8px 20px}.dt{flex:1;min-width:0;font-size:18px;font-weight:600;line-height:1.3}
      .dsc{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 14px 16px;display:flex;flex-direction:column;gap:8px;container-type:inline-size}.dsc .seg{margin:4px 0}.dsc .ib.tx{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
      .dsc .res{flex-wrap:nowrap}.dsc .res.cur .ib{color:inherit}.dsc .chips{padding-bottom:4px}
      @container (max-width:380px){.dsc .du{display:none}}
      dialog{width:min(940px,calc(100vw - 24px))}
      .dbd{flex:1;min-height:0;display:flex;flex-direction:column;overflow-y:auto;overscroll-behavior:contain}.dbd>.dsc{flex:none;overflow:visible}
      .dpl{flex:none;display:flex;flex-direction:column;gap:12px;padding:4px 16px 12px;min-width:0}.dtop{display:flex;align-items:center;gap:14px;min-width:0}
      .dart{flex:none;width:88px;aspect-ratio:1;border-radius:14px;background:var(--secondary-background-color) center/cover;display:grid;place-items:center;color:var(--secondary-text-color)}
      .dti{flex:1;min-width:0;display:flex;align-items:center;gap:10px}.dmeta{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.dfl{height:100%;border-radius:2px;background:var(--primary-color)}
      .dctl{display:flex;align-items:center;justify-content:center;gap:10px}.dctl .ib.on{color:var(--primary-color)}.ib.fav{color:var(--error-color)}
      .hs{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}.hs.wrap{flex-wrap:wrap;overflow:visible}.tl{flex:none;width:116px;display:flex;flex-direction:column;gap:6px;text-align:left;border-radius:12px}
      .ti{width:116px;height:116px;border-radius:12px;object-fit:cover;background:var(--secondary-background-color);display:grid;place-items:center;color:var(--secondary-text-color)}.tn{font-size:13px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .dsc>*,.dpl>*{flex:none}.dsc .seg{overflow-x:auto;scrollbar-width:none}.dsc .seg::-webkit-scrollbar{display:none}.dsc .seg button{flex:1 0 auto;padding:0 14px}
      .hs{scroll-snap-type:x proximity;scrollbar-width:thin}.tl{scroll-snap-align:start}.tl.rnd .ti{border-radius:50%}.tl.rnd .tn{text-align:center}.pg[hidden]{display:none}.s.live{text-align:center;min-height:20px}
      .djf{display:flex;gap:8px}.djf input{flex:1;min-width:0;height:48px;padding:0 16px;border-radius:999px;border:0;background:var(--secondary-background-color);color:inherit;font:inherit;font-size:15px}
      @media (min-width:760px){dialog{height:min(760px,calc(100dvh - 24px - env(safe-area-inset-top,0px)))}.dbd{flex-direction:row;overflow:hidden}.dpl{width:300px;overflow-y:auto;padding-bottom:16px}.dtop{flex-direction:column;align-items:stretch}.dart{width:100%;border-radius:18px}.dbd>.dsc{flex:1;overflow-y:auto}}
      .gh{font-size:13px;color:var(--secondary-text-color);padding:8px 4px 0}.empty{font-size:14px;color:var(--secondary-text-color);padding:12px 4px}
    </style>
    <ha-card class="${c.mode === 'full' ? 'full' : ''}">
      <div class="np${playing ? ' play' : ''}">
        <div class="art" data-info="1" role="button" tabindex="0" aria-label="Mais informações da coluna que está a tocar" style="cursor:pointer;${hasMedia && a.entity_picture ? `background-image:url('${esc(a.entity_picture)}')` : ''}">${hasMedia && a.entity_picture ? '' : svg(IC.note, 28)}</div>
        <div class="meta"><div class="t">${esc(title)}</div><div class="s">${esc(sub)}</div><div class="w">${playing ? '<span class="bars"><i></i><i></i><i></i><i></i></span>' : ''}<span class="wh">${esc(where)}</span>${hint}</div></div>
      </div>
      ${pg}
      <div class="ctl">
        <button class="ib" data-mp="media_previous_track" aria-label="Anterior">${svg(IC.prev)}</button>
        <button class="ib big pri" data-mp="media_play_pause" aria-label="${playing ? 'Pausa' : 'Tocar'}">${svg(playing ? IC.pause : IC.play, 26)}</button>
        <button class="ib" data-mp="media_next_track" aria-label="Seguinte">${svg(IC.next)}</button>
        <span class="sp"></span>
        ${c.stop_script ? `<button class="ib" data-stop="1" aria-label="Parar">${svg(IC.stop, 20)}</button>` : ''}
      </div>
      <div class="vrow"><button class="ib" data-vstep="-1" aria-label="Baixar o volume 1%" ${vol <= 0 ? 'disabled' : ''}>−</button><input type="range" min="0" max="1000" value="${V2P(vol)}" style="--p:${V2P(vol) / 10}%" data-gvol="1" aria-label="Volume geral" aria-valuetext="${vol}%"><button class="ib" data-vstep="1" aria-label="Subir o volume 1%" ${vol >= 100 ? 'disabled' : ''}>+</button><span class="vl">${vol}%</span></div>
      
      ${c.presets.length ? `<div class="seg" role="group" aria-label="Grupo de colunas">${c.presets.map((p, i) => `<button class="${st(p.entity) ? 'on' : ''}" data-preset="${i}" aria-pressed="${st(p.entity)}">${esc(p.name)}</button>`).join('')}<button class="ico${this._tab === 'rooms' ? ' on2' : ''}" data-tab="rooms" aria-label="Colunas por divisão" aria-expanded="${this._tab === 'rooms'}"><ha-icon icon="mdi:speaker-multiple"></ha-icon></button></div>` : ''}
      ${this._tab === 'rooms' && c.presets.length ? `<div class="panel">${panel}</div>` : ''}
      <div class="tabs" role="tablist">${tabs.filter((t) => t[0] !== 'search').map((t) => `<button class="tab${this._tab === t[0] ? ' on' : ''}" role="tab" aria-selected="${this._tab === t[0]}" data-tab="${t[0]}" aria-label="${t[1]}"><ha-icon icon="${TAB_IC[t[0]]}"></ha-icon>${t[0] === 'search' ? '' : `<span>${t[1]}</span>`}</button>`).join('')}${c.shortcuts.map((p, i) => p.icon_only ? '' : `<button class="tab${p.card && this._tab === 's' + i ? ' on' : ''}" ${p.card ? `role="tab" aria-selected="${this._tab === 's' + i}" data-tab="s${i}"` : `data-short="${i}"`} aria-label="${esc(p.name)}"><ha-icon icon="${esc(p.icon || 'mdi:open-in-new')}"></ha-icon><span>${esc(p.name)}</span></button>`).join('')}${c.ma_entry ? `<button class="tab ico${this._tab === 'search' ? ' on' : ''}" role="tab" aria-selected="${this._tab === 'search'}" data-tab="search" aria-label="Pesquisar"><ha-icon icon="mdi:magnify"></ha-icon></button>` : ''}${c.shortcuts.map((p, i) => p.icon_only ? `<button class="tab ico" data-short="${i}" aria-label="${esc(p.name)}"><ha-icon icon="${esc(p.icon || 'mdi:open-in-new')}"></ha-icon></button>` : '').join('')}</div>
      
      ${this._tab && !(this._tab === 'rooms' && c.presets.length) ? `<div class="panel">${panel}</div>` : ''}
    </ha-card>`;
    this._bind(rooms);
    this._dlgRender();
    if (focused) { const inp = this._main.querySelector('input[type=search]'); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }
  }
  _bind(rooms) {
    const R = this._main, c = this._c, on = (sel, ev, fn) => R.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, (e) => fn(el, e)));
    on('[data-mp]', 'click', (el) => this._svc('media_player', el.dataset.mp, {}, { entity_id: this._leader() }));
    on('[data-stop]', 'click', () => { const [d, s] = c.stop_script.split('.'); this._svc(d, s); });
    on('[data-tab]', 'click', (el) => { this._tab = this._tab === el.dataset.tab ? null : el.dataset.tab; this._open = null; this._qSync(); this._render(); });
    on('[data-preset]', 'click', (el) => { const [d, s] = c.presets[el.dataset.preset].script.split('.'); this._svc(d, s); });
    on('[data-short]', 'click', (el) => { const p = c.shortcuts[el.dataset.short].navigate; history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed')); });
    on('[data-toggle]', 'click', (el) => { const r = rooms[el.dataset.toggle]; if (r.on) this._svc('media_player', 'volume_set', { volume_level: 0 }, { entity_id: r.entity }); else this._svc('script', 'coluna_juntar', { coluna: r.entity }); });
    on('[data-more]', 'click', (el) => { const i = Number(el.dataset.more); this._open = this._open === i ? null : i; this._render(); });
    on('[data-act]', 'click', (el) => {
      const r = rooms[el.dataset.i], act = el.dataset.act;
      const armed = (k) => { if (this._arm === k) { clearTimeout(this._armT); this._arm = null; return true; } clearTimeout(this._armT); this._arm = k; this._armT = setTimeout(() => { this._arm = null; this._render(); }, 5000); this._render(); return false; };
      if (act === 'solo') this._svc('script', 'coluna_solo', { coluna: r.entity });
      if (act === 'apart') this._svc('script', 'coluna_a_parte', { coluna: r.entity });
      if (act === 'pi') { if (r.piOn && !armed('pi' + el.dataset.i)) return; this._svc('switch', r.piOn ? 'turn_off' : 'turn_on', {}, { entity_id: r.pi }); this._render(); }
      if (act === 'bt') { if (r.btOn && !armed('bt' + el.dataset.i)) return; const [d, s] = (r.btOn ? r.bt_off : r.bt_on).split('.'); this._svc(d, s); this._render(); }
    });
    on('[data-play]', 'click', (el) => { const p = c[el.dataset.play === 'radio' ? 'radios' : 'playlists'][el.dataset.i]; this._svc('script', 'tocar_no_grupo', { media_content_id: p.id, media_content_type: el.dataset.play }); this._wait(el.dataset.play + el.dataset.i, p.name); });
    const slide = (sel, commit) => {
      on(sel, 'pointerdown', () => { this._drag = true; });
      on(sel, 'input', (el) => { const v = P2V(el.value) + '%'; el.closest('.vrow').querySelector('.vl').textContent = v; el.setAttribute('aria-valuetext', v); el.style.setProperty('--p', Number(el.value) / 10 + '%'); });
      on(sel, 'change', (el) => { this._drag = false; commit(el); });
    };
    slide('[data-gvol]', (el) => this._svc('input_number', 'set_value', { value: P2V(el.value) }, { entity_id: c.volume }));
    on('[data-vstep]', 'click', (el) => {
      const row = el.closest('.vrow'), inp = row.querySelector('input'), lab = row.querySelector('.vl'), v = Math.max(0, Math.min(100, (parseInt(lab.textContent, 10) || 0) + Number(el.dataset.vstep)));
      lab.textContent = v + '%'; inp.value = String(V2P(v)); inp.setAttribute('aria-valuetext', v + '%'); inp.style.setProperty('--p', V2P(v) / 10 + '%');
      row.querySelector('[data-vstep="-1"]').disabled = v <= 0; row.querySelector('[data-vstep="1"]').disabled = v >= 100;
      clearTimeout(this._vsT); this._drag = true; this._vsT = setTimeout(() => { this._drag = false; this._svc('input_number', 'set_value', { value: v }, { entity_id: c.volume }); }, 350);
    });
    slide('[data-rvol]', (el) => this._svc('media_player', 'volume_set', { volume_level: P2V(el.value) / 100 }, { entity_id: rooms[el.dataset.rvol].entity }));
    this._sBind(R);
  }
  /* ligações partilhadas pelo cartão e pela janela: pesquisa, resultados, abrir álbuns e a fila em linha */
  _sBind(R) {
    const on = (sel, ev, fn) => R.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, (e) => fn(el, e)));
    const form = R.querySelector('.sform');
    if (form) {
      form.querySelector('input').addEventListener('input', (e) => { this._q = e.target.value; });
      form.addEventListener('submit', (e) => { e.preventDefault(); this._search(); });
    }
    on('[data-qhint]', 'click', () => this._qHint());
    on('[data-qmanage]', 'click', () => this._dlgOpen());
    on('[data-qplay]', 'click', (el) => { const name = (el.querySelector('.rn') || {}).textContent || 'música'; this._qAct('play_queue_item', { queue_item_id: el.dataset.qplay }); this._wait('q' + el.dataset.qplay, name); });
    on('[data-qmoreitems]', 'click', () => { this._qN += 20; this._render(); });
    const info = () => this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this._leader() } }));
    on('[data-info]', 'click', info);
    on('[data-info]', 'keydown', (el, e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); info(); } });
    const sk = R.querySelector('[data-seek]');
    if (sk) {
      const end = () => setTimeout(() => { this._seeking = false; this._drag = false; const b = this.shadowRoot.querySelector('.pb'); if (b) b.classList.remove('drag'); this._pgUpd(); }, 0);
      sk.addEventListener('pointerdown', () => { this._seeking = true; this._drag = true; sk.parentNode.classList.add('drag'); });
      sk.addEventListener('input', () => { this._seeking = true; this._pgSet(Number(sk.value), Number(sk.max), true); });
      sk.addEventListener('change', () => { const p = Number(sk.value), L = this._h.states[this._leader()], la = (L && L.attributes) || {}; this._pgLocal = { p, at: Date.now(), k: la.media_position_updated_at || '', id: la.media_content_id }; this._svc('media_player', 'media_seek', { seek_position: p }, { entity_id: this._leader() }); end(); });
      ['pointerup', 'pointercancel', 'blur'].forEach((ev) => sk.addEventListener(ev, end));
    }
    on('img.th', 'error', (el) => { const s = document.createElement('span'); s.className = 'th'; s.innerHTML = svg(IC.note, 18); el.replaceWith(s); });
    on('[data-uri]', 'click', (el) => { this._svc('music_assistant', 'play_media', { media_id: el.dataset.uri, media_type: el.dataset.mt, enqueue: el.dataset.next ? 'next' : 'play' }, { entity_id: this._leader() }); if (el.dataset.next) { clearTimeout(this._qAft); this._qAft = setTimeout(() => this._qLoad(), 1500); } if (!el.dataset.next) this._wait('s' + el.dataset.uri, el.dataset.nm || (el.querySelector('.rn') || {}).textContent || 'música'); });
    on('[data-open]', 'click', (el) => { const [k, i] = el.dataset.open.split(':'), it = (this._res[k] || [])[i]; if (it) this._drOpen({ uri: it.uri, media_type: it.media_type, name: it.name + (it.version ? ' (' + it.version + ')' : ''), image: imgOf(it), by: (it.artists || []).map((x) => x.name).join(', ') }); });
    on('[data-drback]', 'click', () => { this._drSeq = (this._drSeq || 0) + 1; this._dr = (this._dr && this._dr.parent) || null; this._render(); });
    on('[data-dralb]', 'click', (el) => { const d = this._dr, x = d && d.albums[el.dataset.dralb]; if (x) this._drOpen(x, d); });
    on('[data-drmore]', 'click', () => this._drMore());
  }
  _drDraw() { if (this._drag) this._sig = ''; else this._render(); }
  async _drEntry() {
    if (this._c.queue_entry) return this._c.queue_entry;
    if (!this._qEntry) { const l = (await this._h.callWS({ type: 'config_entries/get', domain: 'mass_queue' })) || []; const en = l.find((x) => x.state === 'loaded') || l[0]; this._qEntry = en && en.entry_id; }
    if (!this._qEntry) throw new Error('mass_queue');
    return this._qEntry;
  }
  async _drFetch(it, page) {
    const data = { config_entry_id: await this._drEntry(), uri: it.uri }; if (page != null) data.page = page;
    const r = await Promise.race([this._h.callService('mass_queue', 'get_' + it.media_type + '_tracks', data, undefined, true, true), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 30000))]);
    const t = r && r.response && r.response.tracks;
    return Array.isArray(t) ? t : [];
  }
  _drAdd(d, tr) { let n = 0; tr.forEach((t) => { const k = t.media_content_id + '|' + (t.position ?? ''); if (!d.keys[k]) { d.keys[k] = 1; d.tracks.push(t); n++; } }); d.more = n >= 20; return n; }
  async _artAlbums(it) {
    const al = await this._djCmd('music/artists/artist_albums', { item_id: String(it.uri).split('/').pop(), provider_instance_id_or_domain: String(it.uri).split('://')[0] }), seen = {};
    return (Array.isArray(al) ? al : []).filter((x) => x && x.uri && !seen[x.uri] && (seen[x.uri] = 1)).map((x) => ({ uri: x.uri, media_type: 'album', name: x.name + (x.version ? ' (' + x.version + ')' : ''), image: (x.image && (x.image.path || x.image)) || ((x.metadata && x.metadata.images && x.metadata.images[0]) || {}).path || '', by: (x.artists || []).map((y) => y.name).join(', '), year: Number(x.year) || 0, kind: x.album_type || '' })).sort((p, q) => q.year - p.year);
  }
  async _drOpen(it, parent) {
    const seq = this._drSeq = (this._drSeq || 0) + 1, d = this._dr = { it, parent: parent || null, st: 'loading', tracks: [], albums: [], keys: {}, more: false, busy: false, page: 0 }, isArt = it.media_type === 'artist' && !!((this._h.services && this._h.services.mass_queue) || {}).send_command;
    this._render();
    const alb = isArt ? this._artAlbums(it).catch(() => []) : Promise.resolve([]);
    try { const tr = await this._drFetch(it); if (seq !== this._drSeq) return; this._drAdd(d, tr); d.st = 'ok'; } catch (e) { if (seq !== this._drSeq) return; d.st = isArt ? 'ok' : 'error'; }
    d.albums = await alb; if (seq !== this._drSeq) return;
    this._drDraw();
  }
  async _drMore() {
    const d = this._dr, seq = this._drSeq; if (!d || d.busy) return;
    d.busy = true; this._drDraw();
    try { for (let k = 0; k < 2; k++) { d.page++; const tr = await this._drFetch(d.it, d.page); if (seq !== this._drSeq) return; if (this._drAdd(d, tr) || d.page >= 2) break; } } catch (e) { if (seq !== this._drSeq) return; d.more = false; }
    d.busy = false; this._drDraw();
  }
  _drPanel() {
    const d = this._dr, it = d.it, n = d.tracks.length, u0 = esc(it.uri), m0 = esc(it.media_type);
    const sub = [{ album: 'Álbum', playlist: 'Playlist', artist: 'Artista' }[it.media_type], it.media_type === 'album' ? it.by : '', n ? `${n}${d.more ? '+' : ''} ${n === 1 ? 'música' : 'músicas'}` : '', n && !d.more && d.tracks.every((t) => Number(t.duration) > 0) ? fmtTot(d.tracks.reduce((x, t) => x + Number(t.duration), 0)) : ''].filter(Boolean).join(' · ');
    const th = (img) => (img ? `<img class="th" loading="lazy" alt="" src="${esc(img)}">` : `<span class="th">${svg(IC.note, 18)}</span>`);
    const body = d.st === 'loading' ? '<div class="empty">A carregar…</div>' : d.st === 'error' ? '<div class="empty">Não foi possível abrir</div>' : !n ? (d.albums.length ? '' : `<div class="empty">${it.media_type === 'artist' ? 'Sem músicas nem álbuns' : 'Sem músicas'}</div>`) : (d.albums.length ? '<div class="gh">Músicas</div>' : '') + d.tracks.map((t) => { const f = qInfo(t), u = esc(t.media_content_id); return `<div class="res q">${th(imgOf({ image: t.media_image }))}<button class="rmain" title="Tocar agora" data-uri="${u}" data-mt="track"><span class="rn">${esc(f.title)}</span><span class="rs">${esc(it.media_type === 'album' ? t.media_artist || '' : f.sub)}</span></button>${Number(t.duration) > 0 ? `<span class="du">${fmt(t.duration)}</span>` : ''}${f.src ? `<span class="src">${esc(f.src)}</span>` : ''}<button class="ib" data-uri="${u}" data-mt="track" data-next="1" aria-label="Tocar a seguir" title="Tocar a seguir">${svg(IC.plus, 20)}</button></div>`; }).join('') + (d.more ? `<button class="chip more" data-drmore="1" ${d.busy ? 'disabled' : ''}>${d.busy ? 'A carregar…' : 'Mostrar mais'}</button>` : '');
    const alb = d.st === 'ok' && d.albums.length ? '<div class="gh">Álbuns</div>' + d.albums.map((x, i) => `<div class="res">${th(x.image)}<button class="rmain" title="Abrir" data-dralb="${i}"><span class="rn">${esc(x.name)}</span><span class="rs">${esc([x.year || '', { album: 'Álbum', single: 'Single', ep: 'EP', compilation: 'Compilação' }[x.kind] || ''].filter(Boolean).join(' · '))}</span></button><span class="chev">${svg(IC.chev, 18)}</span><button class="ib" data-uri="${esc(x.uri)}" data-mt="album" data-next="1" aria-label="Tocar a seguir: ${esc(x.name)}" title="Tocar a seguir">${svg(IC.plus, 20)}</button></div>`).join('') : '';
    return `<div class="qp"><div class="qh"><button class="chip back" data-drback="1">${svg(IC.back, 18)}${d.parent ? esc(d.parent.it.name) : 'Resultados'}</button></div><div class="dh">${th(it.image)}<div class="rmain"><span class="rn">${esc(it.name)}</span><span class="rs">${esc(sub)}</span></div></div><div class="chips"><button class="chip pri" data-uri="${u0}" data-mt="${m0}" data-nm="${esc(it.name)}">${svg(IC.play, 16)}Tocar</button><button class="chip" data-uri="${u0}" data-mt="${m0}" data-next="1">${svg(IC.plus, 16)}Tocar a seguir</button></div>${body}${alb}</div>`;
  }
  /* atalho com `card`: o cartão é filho direto deste elemento (slot "emb"), por isso não é recriado nem perde a posição quando o cartão de música se redesenha */
  _embEnsure(i) {
    const key = i + '|' + this._leader();
    if (this._embKey === key) return;
    this._embDrop(true); this._embKey = key;
    Promise.resolve(window.loadCardHelpers()).then((hp) => {
      if (this._embKey !== key || !this.isConnected) return;
      const el = hp.createCardElement(JSON.parse(JSON.stringify(this._c.shortcuts[i].card).split('{leader}').join(this._leader())));
      el.slot = 'emb'; el.hass = this._h; this._emb = el; this.appendChild(el);
    }).catch(() => { if (this._embKey === key) this._embKey = null; });
  }
  _embDrop(keepTab) {
    if (this._emb && this._emb.parentNode === this) this.removeChild(this._emb);
    this._emb = null; this._embKey = null;
    if (!keepTab && /^s\d+$/.test(this._tab || '')) { this._tab = null; this._sig = ''; }
  }
  _wait(key, name) {
    clearTimeout(this._pendT);
    this._pend = { key, name, at: Date.now() };
    this._pendT = setTimeout(() => { this._pend = null; this._render(); }, 15000);
    this._render();
  }
  async _search() {
    if (!this._q.trim()) return;
    this._busy = true; this._dr = null; this._drSeq = (this._drSeq || 0) + 1; this._render();
    try {
      const r = await this._h.callService('music_assistant', 'search', { config_entry_id: this._c.ma_entry, name: this._q.trim(), limit: 6 }, undefined, true, true);
      this._res = (r && r.response) || {};
    } catch (e) { this._res = {}; }
    this._busy = false; this._render();
  }
}
if (!customElements.get('casa-music-card')) customElements.define('casa-music-card', CasaMusicCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-music-card', name: 'Casa · Música', description: 'Som da casa: a tocar, volume geral, fila, divisões, rádios, playlists e pesquisa.' });

/* casa-security-card v0.4.0 — segurança: alarme, presença, câmaras, baterias, portas/janelas e movimento (só leitura, exceto alarme) */
const escS = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const minsS = (iso) => { const t = iso ? new Date(iso).getTime() : NaN; return isNaN(t) ? null : Math.max(0, Math.floor((Date.now() - t) / 60000)); };
const agoS = (iso, pre) => { const m = minsS(iso); if (m == null) return ''; const p = pre ? 'há ' : ''; return m < 1 ? 'agora' : m < 60 ? `${p}${m} min` : m < 1440 ? `${p}${Math.floor(m / 60)} h` : `${p}${Math.floor(m / 1440)} d`; };
const icS = (i, s = 22) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px"></ha-icon>`;
const ALARM_PT = { disarmed: 'Desarmado', armed_away: 'Armado · ausente', armed_home: 'Armado · em casa', armed_night: 'Armado · noite', armed_vacation: 'Armado · férias', armed_custom_bypass: 'Armado · personalizado', arming: 'A armar', pending: 'Entrada detetada', triggered: 'Disparado', disarming: 'A desarmar' };
const gone = (s) => !s || s.state === 'unavailable' || s.state === 'unknown';

class CasaSecurityCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sig = ''; this._showClosed = false; this._imgs = new Map(); this._emb = {}; this._ts = Date.now();
  }
  setConfig(c) {
    this._c = Object.assign({ presence: [], cameras: [], openings: [], motion: [], refresh: 10 }, c);
    this._bre = c.battery && c.battery.match ? new RegExp(c.battery.match) : null;
    this._bex = c.battery && c.battery.exclude ? new RegExp(c.battery.exclude) : null;
    this._emb = {};
    this._mk('alarm', this._c.alarm_card); this._mk('events', this._c.events && this._c.events.card);
  }
  async _mk(key, cfg) {
    if (!cfg || typeof window === 'undefined' || !window.loadCardHelpers) return;
    try {
      const el = (await window.loadCardHelpers()).createCardElement(cfg);
      if (this._h) el.hass = this._h;
      this._emb[key] = el; this._attach();
    } catch (e) { /* cartão embutido indisponível: o bloco fica sem ele */ }
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  _liveOpen(id, name) {
    const info = () => this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } }));
    if (!window.loadCardHelpers) return info();
    const ov = document.createElement('div');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', name);
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(17,17,27,.85);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:var(--ha-font-family-body,Roboto,sans-serif)';
    const box = document.createElement('div');
    box.style.cssText = 'width:min(1100px,100%);max-height:100%;background:var(--card-background-color,#1e2030);color:var(--primary-text-color,#cad3f5);border-radius:16px;overflow:hidden;display:flex;flex-direction:column';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 8px 8px 16px;font-size:18px;font-weight:600';
    const ttl = document.createElement('span'); ttl.textContent = name; ttl.style.cssText = 'flex:1;min-width:0';
    const mk = (txt) => { const b = document.createElement('button'); b.textContent = txt; b.style.cssText = 'min-height:44px;padding:0 16px;border:0;border-radius:999px;background:var(--secondary-background-color,#24273a);color:inherit;font:inherit;font-size:14px;font-weight:500;cursor:pointer'; return b; };
    const more = mk('Detalhes'), close = mk('Fechar');
    const body = document.createElement('div'); body.style.cssText = 'min-height:200px;background:#11111b';
    const end = () => { document.removeEventListener('keydown', key); ov.remove(); };
    const key = (e) => { if (e.key === 'Escape') end(); };
    close.addEventListener('click', end); more.addEventListener('click', () => { end(); info(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) end(); });
    document.addEventListener('keydown', key);
    head.append(ttl, more, close); box.append(head, body); ov.append(box); document.body.append(ov);
    close.focus();
    window.loadCardHelpers().then((hp) => { const card = hp.createCardElement({ type: 'custom:webrtc-camera', entity: id, muted: true }); card.hass = this._h; body.append(card); }).catch(() => { end(); info(); });
  }
  connectedCallback() { clearInterval(this._iv); this._iv = setInterval(() => this._tick(), Math.max(3, Number(this._c && this._c.refresh) || 10) * 1000); }
  disconnectedCallback() { clearInterval(this._iv); }
  _bats() {
    const h = this._h, c = this._c.battery; if (!c || !this._bre) return [];
    const out = [];
    for (const id in h.states) {
      if (!id.startsWith('sensor.')) continue;
      const s = h.states[id];
      if (s.attributes.device_class !== 'battery' || !this._bre.test(id) || (this._bex && this._bex.test(id))) continue;
      const v = Number(s.state), dead = gone(s) || isNaN(v);
      out.push({ id, name: String(s.attributes.friendly_name || id).replace(/[\s:-]*(Bateria|Battery)(\s*level)?\s*$/i, '').replace(/\s+-\s+/g, ' · '), dead, v, low: !dead && v < (c.low || 35), when: s.last_changed });
    }
    return out;
  }
  set hass(h) { try { this._upd(h); } catch (e) { this.shadowRoot.innerHTML = '<ha-card style="padding:16px">Erro no cartão: ' + escS(e && e.message) + '</ha-card>'; } }
  _upd(h) {
    this._h = h;
    Object.values(this._emb).forEach((el) => { try { el.hass = h; } catch (e) { /* cartão embutido */ } });
    const c = this._c, ids = [c.alarm].concat(c.presence.map((x) => x.entity), c.cameras.map((x) => x.entity), c.openings.map((x) => x.entity), c.motion.map((x) => x.entity)).filter(Boolean);
    const sig = ids.map((i) => (h.states[i] ? h.states[i].state : '-')).join(';') + '#' + this._bats().map((b) => (b.dead ? 'x' : b.low ? Math.round(b.v) : '')).join(',') + '#' + Math.floor(Date.now() / 60000);
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  _camUrl(id) {
    const s = this._h.states[id], p = s && s.attributes.entity_picture;
    if (!p || s.state === 'unavailable') return '';
    return p + (p.includes('?') ? '&' : '?') + 't=' + this._ts;
  }
  _img(id) {
    let img = this._imgs.get(id);
    if (!img) {
      img = document.createElement('img'); img.alt = ''; img.hidden = true;
      img.addEventListener('load', () => { img.hidden = false; });
      img.addEventListener('error', () => { img.hidden = true; });
      this._imgs.set(id, img);
      const u = this._camUrl(id); if (u) img.src = u;
    }
    return img;
  }
  _tick() {
    if (!this._h || (typeof document !== 'undefined' && document.hidden)) return;
    this._ts = Date.now();
    this._imgs.forEach((img, id) => {
      if (!img.isConnected) return;
      const u = this._camUrl(id); if (!u) { img.hidden = true; return; }
      const pre = new Image(); pre.onload = () => { img.src = u; }; pre.src = u;
    });
  }
  _attach() {
    this.shadowRoot.querySelectorAll('[data-emb]').forEach((el) => { const x = this._emb[el.dataset.emb]; if (!x) return; if (x.parentNode !== el) el.appendChild(x); el.parentNode.classList.add('has-emb'); });
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const A = c.alarm ? h.states[c.alarm] : null, aGone = gone(A), aState = aGone ? '' : A.state;
    const armed = aState.startsWith('armed'), trig = aState === 'triggered' || aState === 'pending';
    const aLabel = aGone ? 'Sem ligação' : (ALARM_PT[aState] || h.formatEntityState(A));

    const pres = c.presence.map((p) => { const s = h.states[p.entity]; return { name: p.name, icon: p.icon, home: !!s && s.state === 'home', label: gone(s) ? 'Sem ligação' : s.state === 'home' ? 'Em casa' : s.state === 'not_home' ? 'Fora' : h.formatEntityState(s) }; });
    const homeN = pres.filter((p) => p.home).length;

    const ops = c.openings.map((o) => { const s = h.states[o.entity]; return { name: o.name, dead: gone(s), open: !!s && s.state === 'on', when: s && s.last_changed }; });
    const opOpen = ops.filter((o) => o.open), opDead = ops.filter((o) => o.dead), opClosed = ops.filter((o) => !o.open && !o.dead);

    const mot = c.motion.map((m) => { const s = h.states[m.entity]; return { name: m.name, dead: gone(s), on: !!s && s.state === 'on', when: s && s.last_changed, age: s ? minsS(s.last_changed) : null }; })
      .sort((a, b) => (b.on - a.on) || (a.dead - b.dead) || ((a.age == null ? 1e9 : a.age) - (b.age == null ? 1e9 : b.age)));
    const motN = mot.filter((m) => m.on).length, motDead = mot.filter((m) => m.dead).length;
    const motBase = mot.filter((m) => m.on).concat(mot.filter((m) => !m.on && !m.dead).slice(0, 3)), motShow = this._showMot ? mot : motBase;

    const bats = this._bats(), bLow = bats.filter((b) => b.low).sort((a, b) => a.v - b.v), bDead = bats.filter((b) => b.dead), bOk = bats.length - bLow.length - bDead.length;
    const pl = (n, one, many) => n + ' ' + (n === 1 ? one : many);
    const bChip = [bDead.length ? pl(bDead.length, 'bateria sem sinal', 'baterias sem sinal') : '', bLow.length ? pl(bLow.length, 'bateria fraca', 'baterias fracas') : ''].filter(Boolean).join(' · ');
    const oChip = opOpen.length ? pl(opOpen.length, 'porta ou janela aberta', 'portas e janelas abertas') : pl(opClosed.length, 'porta ou janela fechada', 'portas e janelas fechadas');
    const summary = (c.alarm ? 'Alarme ' + (aGone ? 'sem ligação' : armed ? 'armado' : trig ? aLabel.toLowerCase() : aLabel.toLowerCase()) : '') + (pres.length ? (c.alarm ? ' · ' : '') + (homeN ? homeN + ' em casa' : 'ninguém em casa') : '');
    const bRow = (b, cls) => `<div class="brow"><span class="nm">${escS(b.name)}</span><span class="bv ${cls}">${b.dead ? escS(agoS(b.when, true)) : Math.round(b.v) + '%'}</span></div>`;
    const bMore = this._bMore || {};
    const bGrp = (key, label, note, list, cls) => !list.length ? '' : `<div class="list"><span class="sub2"><i class="${cls}"></i>${label}<span class="n">${list.length}${note ? ' · ' + note : ''}</span></span>${(bMore[key] ? list : list.slice(0, 5)).map((b) => bRow(b, cls)).join('')}${list.length > 5 ? `<button class="link" data-bmore="${key}" aria-expanded="${!!bMore[key]}">${bMore[key] ? 'Mostrar menos' : 'Mostrar mais (' + (list.length - 5) + ')'}</button>` : ''}</div>`;

    const camOff = c.cameras.filter((x) => { const s = h.states[x.entity]; return !s || s.state === 'unavailable'; }).length;
    const gA = !!(c.alarm || pres.length), gB = !!(c.cameras.length || c.events), gC = !!(mot.length || this._bre || ops.length), gN = gA + gB + gC;
    const sA = [c.alarm ? aLabel.toLowerCase() : '', pres.length ? (homeN ? homeN + ' em casa' : 'ninguém em casa') : ''].filter(Boolean).join(' · ');
    const sB = camOff ? camOff + ' sem ligação' : c.cameras.length ? pl(c.cameras.length, 'câmara', 'câmaras') : '';
    const sC = [bLow.length + bDead.length ? (bLow.length + bDead.length) + ' a tratar' : '', opOpen.length ? pl(opOpen.length, 'aberta', 'abertas') : '', motN ? motN + ' com movimento' : ''].filter(Boolean).join(' · ') || 'tudo em ordem';
    /* divisor de grupo (igual ao das Luzes): só quando há dois ou mais grupos */
    const fl = (name, sum, show) => show && gN > 1 ? `<div class="floor"><span class="fn">${name}</span><span class="fc">${escS(sum)}</span><span class="fl"></span></div>` : '';
    let motH = ''; /* o painel Movimento é montado aqui e colocado no grupo Sensores */
    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      :host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
      button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
      button:disabled{opacity:.45;cursor:default}
      button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
      .sum{font-size:20px;font-weight:600;margin-right:auto}
      h3{margin:0;font-size:13px;font-weight:500;color:var(--secondary-text-color)}
      .panel{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
      .ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
      .nm{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .st{font-size:12px;color:var(--secondary-text-color)}
      .val{font-size:28px;font-weight:600;line-height:1.1}
      .cap{font-size:13px;color:var(--secondary-text-color)}
      .chip{min-height:44px;padding:0 16px 0 8px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:8px}
      .chip .ic{width:28px;height:28px}
      .link{font-size:14px;font-weight:500;color:var(--primary-color);min-height:44px;display:inline-flex;align-items:center}
      .wrap{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch}
      .colL{flex:1 1 340px;min-width:0;display:flex;flex-direction:column;gap:12px}
      .colR{flex:2 1 560px;min-width:0;display:flex;flex-direction:column;gap:12px}
      .hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
      .hd h3{font-size:15px;font-weight:600;color:var(--primary-text-color)}
      .alarm{border:1px solid transparent}.alarm.armed{border-color:rgba(166,218,149,.5)}.alarm.trig{border-color:#ed8796}
      .ahead{display:flex;align-items:center;gap:14px}
      .ic.xl{width:56px;height:56px}
      .ic.good{background:#a6da95;color:#181926}.ic.bad{background:#ed8796;color:#181926}
      .ic.lowc{background:rgba(238,212,159,.16);color:#eed49f}.ic.deadc{background:rgba(237,135,150,.14);color:#ed8796}.ic.okc{background:rgba(166,218,149,.16);color:#a6da95}
      .ic.sm{width:32px;height:32px}
      .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
      .emb{--ha-card-background:transparent;--ha-card-border-width:0;--ha-card-box-shadow:none;margin:0 -8px}
      .emb:empty{display:none}
      .alarm.has-emb>.ahead{display:none}
      .people{display:grid;grid-template-columns:repeat(auto-fit,minmax(76px,1fr));gap:8px}
      .person{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;border-radius:12px;background:var(--card-background-color);min-width:0;text-align:center}
      .person .ic{width:40px;height:40px;background:var(--secondary-background-color);font-size:15px;font-weight:600;color:var(--primary-text-color)}
      .person.away .ic{opacity:.5}.person.away .nm{font-weight:400;color:var(--secondary-text-color)}
      .pills{display:flex;flex-wrap:wrap;gap:8px}
      .pill{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border-radius:999px;background:var(--card-background-color);font-size:13px;font-weight:500}
      .pill i{width:7px;height:7px;border-radius:50%;background:#494d64;flex:none}
      .pill .sub{color:var(--secondary-text-color);font-weight:400}
      .pill.act{background:var(--primary-text-color);color:#181926;font-weight:600}.pill.act i{background:#181926}
      .pill.open{background:#ed8796;color:#181926;font-weight:600}.pill.open .sub{color:inherit;opacity:.75}
      .pill.dead{color:var(--secondary-text-color)}.pill.dead i{background:#ed8796}
      button.pill{min-height:44px;color:var(--primary-color);font-weight:600}
      .cams{padding:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .cam{position:relative;display:block;width:100%;aspect-ratio:16/10;border-radius:12px;overflow:hidden;background:#11111b;min-width:0}
      .cam .slot,.cam img{position:absolute;inset:0;width:100%;height:100%}
      .cam img{object-fit:cover;display:block}.cam img[hidden]{display:none}
      .cam .ph{position:absolute;inset:0;display:grid;place-items:center;color:#b8c0e0;opacity:.6}
      .cam .lbl{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);color:#cad3f5;font-size:12px;font-weight:500}
      .cam .lbl i{width:6px;height:6px;border-radius:50%;background:#cad3f5}.cam .lbl i.off{background:#6e738d}
      .duo,.pg{display:contents}.wrap>.panel,.duo>.panel{flex:1 1 300px}.wrap>.cams{flex:2 1 560px}.floor{display:flex;align-items:center;gap:12px;margin:10px 0 -4px}.fn{font-size:17px;font-weight:600}.fc{font-size:13px;color:var(--secondary-text-color)}.fl{flex:1;height:1px;background:var(--divider-color,rgba(127,127,127,.3))}
      .sub2{display:flex;align-items:center;gap:8px;min-height:32px;font-size:13px;font-weight:600}.sub2 i{flex:none;width:8px;height:8px;border-radius:50%}.sub2 i.lowc{background:#eed49f}.sub2 i.deadc{background:#ed8796}.sub2 .n{font-weight:400;color:var(--secondary-text-color)}.list .link{align-self:flex-start}
      .brow{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:36px;border-top:1px solid var(--divider-color,rgba(202,211,245,.08))}
      .bv{flex:none;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}.bv.lowc{color:#eed49f}.bv.deadc{font-size:13px;font-weight:400;color:var(--secondary-text-color)}.brow .nm{font-weight:400}
      .list{display:flex;flex-direction:column}
      @media (max-width:600px){.cams{grid-template-columns:repeat(2,minmax(0,1fr))}}
    </style>
    <ha-card>
      <div class="top"><div class="sum">${escS(summary)}</div>
        ${bChip ? `<span class="chip"><span class="ic bad">${icS('mdi:battery-alert-variant-outline', 16)}</span>${escS(bChip)}</span>` : ''}
        ${ops.length ? `<span class="chip"><span class="ic ${opOpen.length ? 'bad' : 'okc'}">${icS(opOpen.length ? 'mdi:window-open-variant' : 'mdi:window-closed-variant', 16)}</span>${escS(oChip)}</span>` : ''}
      </div>
      <div class="pg">
        ${fl('Alarme e presença', sA, gA)}<div class="wrap">
          ${c.alarm ? `<section class="panel alarm${armed ? ' armed' : ''}${trig ? ' trig' : ''}" aria-label="Alarme">
            <div class="ahead"><span class="ic xl${trig ? ' bad' : armed ? ' good' : ''}">${icS(armed ? 'mdi:shield-lock' : trig ? 'mdi:shield-alert' : 'mdi:shield-outline', 28)}</span>
              <span class="tx"><span class="cap">${escS(c.alarm_name || 'Alarme')}</span><span class="val">${escS(aLabel)}</span></span></div>
            <div class="emb" data-emb="alarm"></div>
          </section>` : ''}
          ${pres.length ? `<section class="panel" aria-label="Quem está em casa"><div class="hd"><h3>Em casa</h3><span class="cap">${homeN} de ${pres.length}</span></div>
            <div class="people">${pres.map((p) => `<div class="person${p.home ? '' : ' away'}"><span class="ic">${p.icon ? icS(p.icon, 20) : escS(p.name.charAt(0))}</span><span class="nm">${escS(p.name)}</span><span class="st">${escS(p.label)}</span></div>`).join('')}</div>
          </section>` : ''}
          ${(motH = mot.length ? `<section class="panel" aria-label="Movimento"><div class="hd"><h3>Movimento</h3><span class="cap">${motN ? motN + ' com movimento' : 'Sem movimento agora'}${motDead ? ' · ' + motDead + ' sem sinal' : ''}</span></div>
            <div class="pills">${motShow.map((m) => `<span class="pill${m.on ? ' act' : ''}${m.dead ? ' dead' : ''}"><i></i>${escS(m.name)}${m.on ? '' : `<span class="sub">${m.dead ? 'sem sinal' : (m.age < 1 ? 'há instantes' : escS(agoS(m.when, true)))}</span>`}</span>`).join('')}${mot.length > motBase.length ? `<button class="pill" data-mot="1" aria-expanded="${!!this._showMot}">${this._showMot ? 'Mostrar menos' : 'Mostrar todos (' + mot.length + ')'}</button>` : ''}</div>
          </section>` : '', '')}
        </div>
        ${fl('Câmaras e eventos', sB, gB)}<div class="wrap">
          ${c.cameras.length ? `<section class="panel cams" aria-label="Câmaras">${c.cameras.map((x) => { const off = gone(h.states[x.entity]) && !(h.states[x.entity] && h.states[x.entity].state === 'unknown'); return `<button class="cam" data-info="${escS(x.entity)}" aria-label="${escS(x.name)}${off ? ' · sem ligação' : ''}"><span class="ph">${icS(off ? 'mdi:video-off-outline' : 'mdi:video-outline', 24)}</span><span class="slot" data-cam="${escS(x.entity)}"></span><span class="lbl"><i class="${off ? 'off' : ''}"></i>${escS(x.name)}${off ? ' · sem ligação' : ''}</span></button>`; }).join('')}</section>` : ''}
          
            ${c.events ? `<section class="panel" aria-label="Eventos"><div class="hd"><h3>${escS(c.events.title || 'Eventos')}</h3>${c.events.path ? `<button class="link" data-nav="${escS(c.events.path)}">Ver todos ›</button>` : ''}</div><div class="emb" data-emb="events"></div></section>` : ''}
            </div>${fl('Sensores', sC, gC)}<div class="wrap">${motH}<div class="duo">${this._bre ? `<section class="panel" aria-label="Baterias"><div class="hd"><h3>Baterias a tratar</h3><span class="cap">${bOk} de ${bats.length} OK</span></div>
              ${!bLow.length && !bDead.length ? '<span class="cap">Nenhuma bateria a tratar.</span>' : ''}
              ${bGrp('low', 'Fracas', 'abaixo de ' + (c.battery.low || 35) + '%', bLow, 'lowc')}
              ${bGrp('dead', 'Sem sinal', '', bDead, 'deadc')}
            </section>` : ''}
          </div>
          ${ops.length ? `<section class="panel" aria-label="Portas e janelas"><div class="hd"><h3>Portas e janelas</h3><span class="cap">${[opOpen.length ? pl(opOpen.length, 'aberta', 'abertas') : '', pl(opClosed.length, 'fechada', 'fechadas'), opDead.length ? opDead.length + ' sem sinal' : ''].filter(Boolean).join(' · ')}</span></div>
            <div class="pills">
              ${opOpen.map((o) => `<span class="pill open">${icS('mdi:window-open-variant', 16)}${escS(o.name)}<span class="sub">aberta ${escS(agoS(o.when, true))}</span></span>`).join('')}
              ${opDead.map((o) => `<span class="pill dead"><i></i>${escS(o.name)} · sem sinal</span>`).join('')}
              ${opClosed.length ? `<button class="pill" data-closed="1" aria-expanded="${this._showClosed}">${this._showClosed ? 'Esconder fechadas' : 'Mostrar ' + pl(opClosed.length, 'fechada', 'fechadas')}</button>` : ''}
              ${this._showClosed ? opClosed.map((o) => `<span class="pill"><i></i>${escS(o.name)}</span>`).join('') : ''}
            </div>
          </section>` : ''}
        </div>
      </div>
    </ha-card>`;
    const R = this.shadowRoot;
    R.querySelectorAll('[data-cam]').forEach((el) => el.appendChild(this._img(el.dataset.cam)));
    this._attach();
    R.querySelectorAll('[data-info]').forEach((el) => el.addEventListener('click', () => { if (el.dataset.info.startsWith('camera.')) return this._liveOpen(el.dataset.info, el.getAttribute('aria-label') || 'Câmara'); this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: el.dataset.info } })); }));
    R.querySelectorAll('[data-closed]').forEach((el) => el.addEventListener('click', () => { this._showClosed = !this._showClosed; this._render(); }));
    R.querySelectorAll('[data-mot]').forEach((el) => el.addEventListener('click', () => { this._showMot = !this._showMot; this._render(); }));
    R.querySelectorAll('[data-bmore]').forEach((el) => el.addEventListener('click', () => { const k = el.dataset.bmore; this._bMore = Object.assign({}, this._bMore, { [k]: !(this._bMore || {})[k] }); this._render(); }));
    R.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => { history.pushState(null, '', el.dataset.nav); window.dispatchEvent(new CustomEvent('location-changed')); }));
  }
}
const prevS = customElements.get('casa-security-card');
if (!prevS) customElements.define('casa-security-card', CasaSecurityCard);
else if (prevS !== CasaSecurityCard) Object.getOwnPropertyNames(CasaSecurityCard.prototype).forEach((k) => { if (k !== 'constructor') Object.defineProperty(prevS.prototype, k, Object.getOwnPropertyDescriptor(CasaSecurityCard.prototype, k)); });
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-security-card', name: 'Casa · Segurança', description: 'Alarme, presença, câmaras, baterias a tratar, portas e janelas e movimento.' });

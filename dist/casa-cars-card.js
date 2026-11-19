/* casa-cars-card v0.3.0 — carros: anéis de autonomia, diagrama do carro, mosaicos com ícone, controlos (dois toques) e restrito */
const escC = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nfC = (n, d = 0) => Number(n).toLocaleString('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d });
const icC = (i, s = 20) => `<ha-icon icon="${escC(i)}" style="--mdc-icon-size:${s}px"></ha-icon>`;
const agoC = (iso) => {
  const t = Date.parse(iso); if (!t) return '';
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 2) return 'agora mesmo';
  if (m < 60) return 'há ' + m + ' min';
  const h = Math.round(m / 60); if (h < 24) return 'há ' + h + ' h';
  const d = Math.round(h / 24); return 'há ' + d + (d === 1 ? ' dia' : ' dias');
};
const OCPP = { Available: 'Carro não ligado', Preparing: 'Pronto a carregar', Charging: 'A carregar', SuspendedEV: 'Em pausa pelo carro', SuspendedEVSE: 'Em pausa', Finishing: 'A terminar', Reserved: 'Reservado', Unavailable: 'Sem ligação', Faulted: 'Com falha' };
const arrC = (v) => [].concat(v == null ? [] : v).filter(Boolean);

class CasaCarsCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._sig = ''; this._arm = null; this._open = false; this._list = null; }
  setConfig(c) {
    if (!c.cars || !c.cars.length) throw new Error('Defina "cars"');
    this._c = Object.assign({ controls: null, charger: null, restricted: null }, c);
    this._idc = null;
  }
  getCardSize() { return 14; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { this._iv = setInterval(() => this._render(), 60000); }
  disconnectedCallback() { clearInterval(this._iv); clearTimeout(this._t); }
  _ids() {
    const out = [], c = this._c, add = (v) => { if (typeof v === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(v)) out.push(v); else if (Array.isArray(v)) v.forEach(add); else if (v && typeof v === 'object') Object.values(v).forEach(add); };
    add(c.cars); add(c.controls); add(c.charger); add(c.restricted);
    return out;
  }
  set hass(h) {
    this._h = h;
    if (!this._idc) this._idc = this._ids();
    const sig = this._idc.map((i) => (h.states[i] ? h.states[i].state + '|' + h.states[i].last_updated : '-')).join(';');
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  _s(e) { return e ? this._h.states[e] : null; }
  _bad(e) { const s = this._s(e); return !s || s.state === 'unavailable' || s.state === 'unknown'; }
  _num(e) { const s = this._s(e); const n = s ? Number(s.state) : NaN; return this._bad(e) || isNaN(n) ? null : n; }
  _fmt(e) { const s = this._s(e); return this._bad(e) ? 'Sem ligação' : this._h.formatEntityState ? this._h.formatEntityState(s) : s.state; }
  _isOpen(e) { const s = this._s(e); return !!s && !this._bad(e) && s.state !== 'off' && s.state !== 'closed'; }
  _locked(e) { const s = this._s(e); return !!s && ['locked', 'secured', 'selective_locked'].includes(String(s.state).toLowerCase()); }

  _car(k) {
    const km = this._num(k.range);
    let pct = this._num(k.level);
    const fuel = this._num(k.fuel);
    if (pct == null && fuel != null && k.fuel_capacity) pct = Math.min(100, (fuel / k.fuel_capacity) * 100);
    const crit = pct != null && pct < 10, low = pct != null && pct < 20;
    const cs = this._s(k.charging), power = this._num(k.charge_power);
    const charging = !!cs && cs.state === 'charging';
    const plugged = k.cable ? this._isOpen(k.cable) : (!!cs && !this._bad(k.charging) && cs.state !== 'disconnected');
    const home = !!this._s(k.tracker) && this._s(k.tracker).state === 'home';
    const where = k.tracker ? (this._bad(k.tracker) ? 'Local desconhecido' : home ? 'Em casa' : this._s(k.tracker).state === 'not_home' ? 'Fora de casa' : this._fmt(k.tracker)) : '';
    const locked = k.lock && !this._bad(k.lock) ? this._locked(k.lock) : null;
    const opens = (k.openings || []).map((o) => ({ o, open: (o.entities || []).some((e) => this._isOpen(e)) }));
    const anyOpen = opens.filter((x) => x.open);
    const limit = this._num(k.limit);
    return { k, km, pct, fuel, crit, low, charging, plugged, power, home, where, locked, opens, anyOpen, limit, lastSeen: !this._bad(k.last_seen) ? agoC(this._s(k.last_seen).state) : '' };
  }
  _tile(t) {
    const ids = t.entities || [t.entity], first = this._s(ids[0]), dom = ids[0].split('.')[0];
    const bad = ids.every((e) => this._bad(e)) && dom !== 'button';
    const missing = ids.every((e) => !this._s(e));
    let on = false, st = '', verb = t.verb || 'executar', svc = null, ok = false;
    if (dom === 'button') { st = ''; svc = ['button', 'press']; }
    else if (dom === 'climate') {
      on = !!first && first.state !== 'off' && !bad; const tg = first && first.attributes.temperature;
      st = on ? (t.on_text || 'Ligada') + (tg != null ? ' · ' + nfC(tg, tg % 1 ? 1 : 0) + '°' : '') : (t.off_text || 'Desligada');
      verb = on ? 'desligar' : 'ligar'; svc = ['climate', on ? 'turn_off' : 'turn_on'];
    } else if (dom === 'lock') {
      on = this._locked(ids[0]); ok = on; st = on ? (t.on_text || 'Trancadas') : (t.off_text || 'Destrancadas');
      verb = on ? 'destrancar' : 'trancar'; svc = ['lock', on ? 'unlock' : 'lock'];
    } else if (dom === 'cover') {
      on = this._isOpen(ids[0]); st = on ? (t.on_text || 'Aberta') : (t.off_text || 'Fechada');
      verb = on ? 'fechar' : 'abrir'; svc = ['cover', on ? 'close_cover' : 'open_cover'];
    } else {
      const n = ids.filter((e) => this._s(e) && this._s(e).state === 'on').length; on = n > 0;
      st = on ? (t.on_text || 'Ligado') + (n < ids.length ? ' · ' + n + ' de ' + ids.length : '') : (t.off_text || 'Desligado');
      verb = on ? 'desligar' : 'ligar'; svc = ['homeassistant', on ? 'turn_off' : 'turn_on'];
    }
    if (bad) st = 'Sem ligação';
    return { t, ids, on, st, verb, svc, ok, bad, missing };
  }
  /* botão de controlo: ícone por cima, rótulo curto, estado numa linha (altura constante) */
  _btn(key, o) {
    const armed = this._arm === key;
    return `<button class="tile k${armed ? ' warn' : o.on ? ' on' : ''}${o.ok && !armed ? ' ok' : ''}" data-act="${key}" data-info="${escC(o.info)}" ${o.bad ? 'disabled' : ''} aria-pressed="${!!o.on}" aria-label="${escC(o.name + (armed ? ': toque outra vez para ' + o.verb : o.st ? ': ' + o.st : ''))}">
      <span class="ic">${icC(o.icon || 'mdi:car', 22)}</span>
      <span class="tx"><span class="nm">${escC(o.name)}</span><span class="st">${armed ? 'Toque outra vez' : escC(o.st)}</span></span></button>`;
  }
  _tileHtml(t, key) {
    const i = this._tile(t); if (i.missing) return '';
    return this._btn(key, { name: t.name, icon: t.icon, info: i.ids[0], on: i.on, ok: i.ok, bad: i.bad, st: i.st, verb: i.verb });
  }
  /* mosaico de estado: ícone num círculo + valor curto + rótulo */
  _stat(icon, value, label, level, info) {
    return `<button class="tile s${level ? ' ' + level : ''}" ${info ? `data-info="${escC(info)}"` : 'disabled'}><span class="ic">${icC(icon, 20)}</span><span class="tx"><span class="nm">${escC(value)}</span><span class="st">${escC(label)}</span></span></button>`;
  }
  _ring(pct, col, limit) {
    const r = 44, C = 2 * Math.PI * r, p = pct == null ? 0 : Math.max(0, Math.min(100, pct));
    let tick = '';
    if (limit != null) {
      const a = (Math.max(0, Math.min(100, limit)) / 100) * 2 * Math.PI, sx = Math.sin(a), sy = -Math.cos(a), f = (n) => n.toFixed(1);
      const pts = `x1="${f(60 + sx * 34)}" y1="${f(60 + sy * 34)}" x2="${f(60 + sx * 54)}" y2="${f(60 + sy * 54)}"`;
      tick = `<line class="tkb" ${pts}/><line class="tk" ${pts}/>`;
    }
    return `<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="${r}"/>${p > 0 ? `<circle class="arc ${col}" cx="60" cy="60" r="${r}" stroke-dasharray="${(C * p / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/>` : ''}${tick}</svg>`;
  }
  /* diagrama visto de cima (silhueta genérica): portas, janelas, frente, traseira, pneus e fecho */
  _diagram(x) {
    const k = x.k, d = k.diagram || {};
    const have = (v) => arrC(v).filter((e) => this._s(e));
    const op = (v) => (have(v).some((e) => this._isOpen(e)) ? ' open' : '');
    const info = (v) => { const ids = have(v), o = ids.find((e) => this._isOpen(e)) || ids[0]; return o ? ` data-info="${escC(o)}"` : ''; };
    const dr = d.doors || [], wn = d.windows || [];
    const door = (i) => {
      const L = i % 2 === 0, x0 = L ? 84 : 176, y0 = i < 2 ? 98 : 144, len = 42, o = op(dr[i]);
      const x1 = o ? x0 + (L ? -27 : 27) : x0, y1 = o ? y0 + 32 : y0 + len, wx = L ? 91 : 169;
      return `<line class="w${op(wn[i])}" x1="${wx}" y1="${y0 + 7}" x2="${wx}" y2="${y0 + len - 7}"${info(wn[i])}/>
        <g${info(dr[i])}><line class="hit" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + len}"/><line class="d${o}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/></g>`;
    };
    const tyre = (t, i) => {
      if (!t || !this._s(t.entity)) return '';
      const s = this._s(t.entity), L = i % 2 === 0, y = i < 2 ? 64 : 184, tx = L ? 64 : 196;
      let v = this._num(t.entity); const u = s.attributes.unit_of_measurement;
      if (v != null && u === 'psi') v = v * 0.0689476; else if (v != null && u === 'kPa') v = v / 100;
      const w = (t.warning && this._s(t.warning) && this._s(t.warning).state === 'on') || (k.tyre_warning && this._s(k.tyre_warning) && this._s(k.tyre_warning).state === 'on')
        || (v != null && ((k.tyre_min && v < k.tyre_min) || (k.tyre_max && v > k.tyre_max)));
      return `<g class="ty${w ? ' warn' : ''}" data-info="${escC(t.entity)}"><title>${escC(s.attributes.friendly_name || t.name || '')}</title><rect class="hit" x="${L ? 8 : 190}" y="${y - 20}" width="62" height="44"/>
        <text x="${tx}" y="${y}" text-anchor="${L ? 'end' : 'start'}">${v == null ? '—' : nfC(v, 1)}</text><text class="u" x="${tx}" y="${y + 15}" text-anchor="${L ? 'end' : 'start'}">bar</text></g>`;
    };
    const lockBad = !k.lock || this._bad(k.lock);
    const parts = x.anyOpen.map((a) => a.o.open).join(', ');
    const label = k.name + ': ' + (x.locked == null ? '' : x.locked ? 'trancado; ' : 'destrancado; ') + (parts ? parts.toLowerCase() : 'tudo fechado');
    return `<div class="car"><svg viewBox="0 0 260 250" width="260" height="250" role="img" aria-label="${escC(label)}">
        <rect class="wh" x="74" y="50" width="14" height="34" rx="5"/><rect class="wh" x="172" y="50" width="14" height="34" rx="5"/>
        <rect class="wh" x="74" y="170" width="14" height="34" rx="5"/><rect class="wh" x="172" y="170" width="14" height="34" rx="5"/>
        <path class="mir" d="M85,97 L74,93 L74,87 L85,89 Z"/><path class="mir" d="M175,97 L186,93 L186,87 L175,89 Z"/>
        <path class="body" d="M84,62 Q84,18 130,18 Q176,18 176,62 L176,204 Q176,232 148,232 L112,232 Q84,232 84,204 Z"/>
        <path class="gl" d="M97,94 Q130,84 163,94 L157,116 Q130,110 103,116 Z"/>
        <path class="gl" d="M103,180 Q130,185 157,180 L161,196 Q130,203 99,196 Z"/>
        <rect class="roof" x="103" y="120" width="54" height="56" rx="8"/>
        <path class="p${op(d.front)}" d="M97,88 Q130,78 163,88 L165,52 Q130,30 95,52 Z"${info(d.front)}/>
        <path class="p${op(d.rear)}" d="M98,202 Q130,209 162,202 L163,213 Q130,227 97,213 Z"${info(d.rear)}/>
        ${[0, 1, 2, 3].map(door).join('')}
        ${(k.tyres || []).slice(0, 4).map(tyre).join('')}
      </svg>
      ${k.lock ? `<button class="lk${lockBad ? '' : x.locked ? ' ok' : ' red'}" data-info="${escC(k.lock)}" aria-label="${lockBad ? 'Fecho sem ligação' : x.locked ? 'Trancado' : 'Destrancado'}">${icC(lockBad ? 'mdi:lock-question' : x.locked ? 'mdi:lock' : 'mdi:lock-open-variant', 22)}</button>` : ''}
    </div>`;
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const cars = c.cars.map((k) => this._car(k));
    const allHome = cars.every((x) => x.home), allLocked = cars.every((x) => x.locked !== false);
    const both = cars.length === 2 ? 'Ambos' : 'Todos', unl = cars.filter((x) => x.locked === false).map((x) => x.k.short || x.k.name);
    const sum = allHome && allLocked ? both + ' em casa e trancados'
      : allHome ? both + ' em casa · ' + unl.join(' e ') + (unl.length === 1 ? ' destrancado' : ' destrancados')
      : cars.map((x) => (x.k.short || x.k.name) + (x.home ? ' em casa' : ' fora') + (x.locked === false ? ', destrancado' : '')).join(' · ');

    const range = cars.map((x) => {
      const k = x.k, col = x.crit ? 'crit' : x.low ? 'low' : '';
      const pct = x.pct == null ? null : Math.round(x.pct);
      const bits = [];
      if (k.fuel) bits.push(`<span>${icC('mdi:gas-station', 16)}${x.fuel != null ? nfC(x.fuel) + ' L' : '—'}</span>`);
      else if (k.charging || k.cable) bits.push(x.charging ? `<span class="chg">${icC('mdi:flash', 16)}${x.power ? nfC(x.power, 1) + ' kW' : 'A carregar'}</span>`
        : `<span>${icC(x.plugged ? 'mdi:power-plug' : 'mdi:power-plug-off', 16)}${x.plugged ? 'Ligado' : 'Desligado'}</span>`);
      if (x.limit != null) bits.push(`<span>${icC('mdi:ray-end', 16)}${nfC(x.limit)}%</span>`);
      return `<div class="rg ${col}">
        <button class="ring" data-info="${escC(k.level || k.fuel || k.range)}" aria-label="${escC(k.name)}: ${pct == null ? 'sem dados' : pct + '%'}">${this._ring(x.pct, col, x.limit)}<span class="pc">${pct == null ? '—' : pct}<small>%</small></span></button>
        <span class="rt"><span class="cap">${escC(k.name)}</span>
          <button class="rv" data-info="${escC(k.range)}">${x.low ? icC('mdi:alert-outline', 22) : ''}<span class="val big">${x.km == null ? '—' : nfC(x.km)}</span><span class="un">km</span></button>
          <span class="rf">${bits.join('')}</span></span>
      </div>`;
    }).join('');

    const panels = cars.map((x) => {
      const k = x.k, stats = [];
      if (k.lock) stats.push(this._stat(x.locked == null ? 'mdi:lock-question' : x.locked ? 'mdi:lock' : 'mdi:lock-open-variant', x.locked == null ? 'Sem ligação' : x.locked ? 'Trancado' : 'Destrancado', 'Portas', x.locked === false ? 'red' : '', k.lock));
      if (k.fuel) stats.push(this._stat('mdi:gas-station', x.fuel != null ? nfC(x.fuel) + ' L' : 'Sem dados', 'Combustível', x.crit ? 'red' : x.low ? 'yellow' : '', k.fuel));
      if (k.charging) stats.push(this._stat(x.charging ? 'mdi:flash' : 'mdi:ev-station', this._bad(k.charging) ? 'Sem ligação' : x.charging ? (x.power ? nfC(x.power, 1) + ' kW' : 'A carregar') : x.plugged ? 'Cabo ligado' : 'Desligado', 'Carga', x.charging ? 'act' : '', k.charging));
      if (k.update) { const u = this._s(k.update), on = !!u && u.state === 'on'; stats.push(this._stat('mdi:update', this._bad(k.update) ? 'Sem ligação' : on ? 'Disponível' : 'Atualizado', 'Software', on ? 'yellow' : '', k.update)); }
      if (k.check_control) { const n = this._num(k.check_control); stats.push(this._stat('mdi:car-info', n == null ? 'Sem ligação' : n ? n + (n === 1 ? ' aviso' : ' avisos') : 'Sem avisos', 'Check-Control', n ? 'yellow' : '', k.check_control)); }
      if (k.maintenance) {
        const m = this._s(k.maintenance), items = (m && m.attributes.items) || [], due = items.filter((it) => it.status && it.status !== 'OK').length;
        stats.push(this._stat('mdi:wrench-outline', this._bad(k.maintenance) ? 'Sem ligação' : due ? due + ' a tratar' : 'Em dia', 'Manutenção', due ? 'yellow' : '', k.maintenance));
      }
      if (k.sentry) { const on = !!this._s(k.sentry) && this._s(k.sentry).state === 'on'; stats.push(this._stat(on ? 'mdi:eye-outline' : 'mdi:eye-off-outline', this._bad(k.sentry) ? 'Sem ligação' : on ? 'A vigiar' : 'Desligada', 'Sentinela', '', k.sentry)); }
      const moving = k.moving && this._s(k.moving) && this._s(k.moving).state === 'on';
      const foot = [
        !this._bad(k.odometer) ? nfC(this._num(k.odometer)) + ' km' : '',
        !this._bad(k.month_distance) ? nfC(this._num(k.month_distance)) + ' km este mês' : '',
        !this._bad(k.temp_in) ? 'interior ' + nfC(this._num(k.temp_in)) + '°' : '',
        !this._bad(k.temp_out) ? 'exterior ' + nfC(this._num(k.temp_out)) + '°' : '',
        x.lastSeen ? 'atualizado ' + x.lastSeen : ''].filter(Boolean).join(' · ');
      return `<section class="panel" aria-label="${escC(k.name)} · estado">
        <div class="hd"><span class="ic sq">${icC(k.icon || 'mdi:car', 24)}</span><span class="tx grow"><span class="ttl">${escC(k.name)}</span>
          <span class="cap one">${escC(moving ? 'Em viagem' : x.where)}${x.anyOpen.length ? ` · <b class="red">${escC(x.anyOpen.map((a) => a.o.open).join(' · '))}</b>` : ''}</span></span></div>
        <div class="cb">${this._diagram(x)}<div class="sts">${stats.join('')}</div></div>
        <span class="cap one">${escC(foot) || '&nbsp;'}</span>
      </section>`;
    }).join('');

    let controls = '';
    if (c.controls) {
      const k = c.controls, ch = c.charger;
      let chHtml = '';
      if (ch && this._s(ch.switch)) {
        const on = this._s(ch.switch).state === 'on', bad = this._bad(ch.switch), p = this._num(ch.power), amps = this._num(ch.current);
        const raw = ch.status && this._s(ch.status) ? this._s(ch.status).state : '', stTxt = (ch.status_labels || {})[raw] || OCPP[raw] || raw;
        const charging = raw === 'Charging' || (p != null && p > 0.05);
        const min = ch.min != null ? ch.min : 6, max = ch.max != null ? ch.max : 16, armed = this._arm === 'charger';
        chHtml = `<div class="box row">
          <button class="ic lg${charging ? ' act' : ''}" data-info="${escC(ch.status || ch.switch)}" aria-label="Detalhes do carregador">${icC(charging ? 'mdi:flash' : 'mdi:ev-station', 22)}</button>
          <span class="tx grow"><span class="nm">${escC(ch.name || 'Carregador')}</span><span class="st one">${bad ? 'Sem ligação' : charging ? 'A carregar' + (p != null ? ' · ' + nfC(p, 1) + ' kW' : '') : escC(stTxt || (on ? 'Ligado' : 'Parado'))}</span></span>
          ${amps != null ? `<span class="stepper"><button class="step" data-amp="-1" ${amps <= min ? 'disabled' : ''} aria-label="Baixar corrente">${icC('mdi:minus', 20)}</button>
          <button class="amps" data-info="${escC(ch.current)}" aria-label="Corrente máxima ${nfC(amps)} amperes">${nfC(amps)}<small>A</small></button>
          <button class="step" data-amp="1" ${amps >= max ? 'disabled' : ''} aria-label="Subir corrente">${icC('mdi:plus', 20)}</button></span>` : ''}
          <button class="chip go2${armed ? ' warn' : on ? ' on' : ''}" data-act="charger" data-info="${escC(ch.switch)}" ${bad ? 'disabled' : ''} aria-pressed="${on}" aria-label="${armed ? 'Toque outra vez para ' + (on ? 'parar' : 'carregar') : on ? 'Parar carregamento' : 'Carregar'}">${armed ? 'Toque outra vez' : icC(on ? 'mdi:stop' : 'mdi:play', 18) + (on ? 'Parar' : 'Carregar')}</button>
        </div>`;
      }
      const wake = k.wake && this._s(k.wake) ? this._btn('wake', { name: 'Acordar', icon: 'mdi:white-balance-sunny', info: k.wake, st: '', verb: 'acordar' }) : '';
      controls = `<div class="floor"><span class="fn">Comandos</span><span class="fc">${escC(k.name || '')}</span><span class="fl"></span></div><section class="panel" aria-label="Comandos">
        <div class="btns">${wake}${(k.tiles || []).map((t, i) => this._tileHtml(t, 'c' + i)).join('')}</div>
        ${chHtml}
      </section>`;
    }
    let restr = '';
    if (c.restricted) {
      const r = c.restricted, lists = r.lists || [];
      restr = `<section class="panel restr" aria-label="Restrito">
        <button class="rhd" data-open="1" aria-expanded="${this._open}"><span class="ic lg">${icC('mdi:lock-outline', 22)}</span>
          <span class="tx grow"><span class="ttl sm">Restrito</span></span>
          <span class="go">${this._open ? 'Fechar' : 'Abrir ›'}</span></button>
        ${this._open ? `<div class="btns">${(r.tiles || []).map((t, i) => this._tileHtml(t, 'r' + i)).join('')}</div>
          <div class="pills">${lists.map((l, i) => `<button class="chip${this._list === i ? ' on' : ''}" data-list="${i}" aria-expanded="${this._list === i}">${escC(l.name)} ›</button>`).join('')}</div>
          ${this._list != null && lists[this._list] ? `<div class="list">${lists[this._list].entities.filter((e) => this._s(e)).map((e) => {
            const s = this._s(e), pre = lists[this._list].strip_prefix || '';
            let nm = s.attributes.friendly_name || e; if (pre && nm.startsWith(pre)) nm = nm.slice(pre.length);
            return `<button class="lrow" data-info="${escC(e)}"><span class="nm">${escC(nm)}</span><span class="st">${escC(e.startsWith('button.') ? 'Abrir ›' : this._fmt(e))}</span></button>`;
          }).join('')}</div>` : ''}` : ''}
      </section>`;
    }

    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      :host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
      button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
      button:disabled{opacity:.45;cursor:default}
      button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
      .sum{font-size:20px;font-weight:600;margin-right:auto}
      .panel{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
      .cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;align-items:start}
      .tile{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 10px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box}
      .tile.on{background:var(--primary-text-color);color:var(--card-background-color)}
      .ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
      .tile.on .ic{background:var(--primary-color);color:#181926}
      .nm{font-size:14px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .st{font-size:12px;line-height:1.3;color:var(--secondary-text-color)} .tile.on .st{color:inherit;opacity:.75}
      .val{font-size:28px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
      .cap{font-size:13px;color:var(--secondary-text-color)}
      .chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
      .chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .chip.warn,.tile.warn{background:var(--error-color);color:#181926;font-weight:600}
      .step{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
      .floor{display:flex;align-items:center;gap:12px;margin:10px 0 -4px}
      .fn{font-size:17px;font-weight:600}
      .fc{font-size:13px;color:var(--secondary-text-color)}
      .fl{flex:1;height:1px;background:var(--divider-color,rgba(127,127,127,.3))}
      .fn{white-space:nowrap}.fc{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fl{min-width:12px}
      /* específicos desta página */
      .cols.two{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
      .tx{display:flex;flex-direction:column;gap:2px;min-width:0}.grow{flex:1 1 120px}
      .one{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:18px}
      .ttl{font-size:18px;font-weight:600;line-height:1.3}.ttl.sm{font-size:16px}
      .hd{display:flex;align-items:center;gap:12px}
      .ic.sq{width:44px;height:44px;background:var(--card-background-color);color:var(--primary-text-color)}
      .ic.lg{width:44px;height:44px;background:var(--card-background-color);color:var(--primary-text-color)}
      .ic.act{background:var(--primary-color);color:#181926}
      .red{color:#ed8796;font-weight:600}
      /* autonomia: anel + km */
      .ranges{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px 32px}
      .rg{display:flex;align-items:center;gap:18px;min-width:0}
      .ring{position:relative;flex:none;width:120px;height:120px;display:block}
      .ring svg{display:block}
      .trk{fill:none;stroke:var(--card-background-color);stroke-width:10}
      .arc{fill:none;stroke:var(--primary-text-color);stroke-width:10;stroke-linecap:round}
      .arc.low{stroke:#eed49f}.arc.crit{stroke:#ed8796}
      .tkb{stroke:var(--secondary-background-color);stroke-width:8}
      .tk{stroke:var(--primary-text-color);stroke-width:3;stroke-linecap:round}
      .pc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:1px;font-size:28px;font-weight:600;font-variant-numeric:tabular-nums}
      .pc small{font-size:14px;font-weight:500;color:var(--secondary-text-color);margin-top:8px}
      .rt{display:flex;flex-direction:column;gap:4px;min-width:0}
      .rv{display:flex;align-items:baseline;gap:6px;min-height:44px}
      .rv ha-icon{align-self:center}
      .val.big{font-size:40px;letter-spacing:-.02em}
      .un{font-size:16px;font-weight:500;color:var(--secondary-text-color)}
      .rf{display:flex;flex-wrap:wrap;gap:4px 14px;min-height:20px;font-size:13px;color:var(--secondary-text-color)}
      .rf span{display:inline-flex;align-items:center;gap:4px}.rf .chg{color:var(--primary-color);font-weight:600}
      .rg.low .rv{color:#eed49f}.rg.crit .rv{color:#ed8796}
      /* estado: diagrama + mosaicos */
      .cb{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px}
      .car{position:relative;flex:none;width:260px;height:250px}
      .car svg{display:block}
      .car .wh,.car .mir{fill:var(--secondary-text-color);opacity:.55}
      .car .body{fill:var(--card-background-color);stroke:var(--secondary-text-color);stroke-width:2}
      .car .gl{fill:var(--secondary-background-color)}
      .car .roof{fill:none;stroke:var(--divider-color);stroke-width:1.5}
      .car .p{fill:transparent;stroke:var(--secondary-text-color);stroke-width:1.5;stroke-opacity:.6}
      .car .p.open{fill:rgba(237,135,150,.35);stroke:#ed8796;stroke-width:2.5;stroke-opacity:1}
      .car .d{stroke:var(--primary-text-color);stroke-width:4;stroke-linecap:round}
      .car .d.open{stroke:#ed8796;stroke-width:5}
      .car .w{stroke:var(--secondary-text-color);stroke-width:3;stroke-linecap:round;stroke-opacity:.55}
      .car .w.open{stroke:#ed8796;stroke-opacity:1}
      .car .hit{fill:transparent;stroke:transparent;stroke-width:16}
      .car text{font-size:15px;font-weight:600;fill:var(--primary-text-color);font-variant-numeric:tabular-nums}
      .car text.u{font-size:12px;font-weight:400;fill:var(--secondary-text-color)}
      .car .ty.warn text{fill:#eed49f}
      .car [data-info]{cursor:pointer}
      .lk{position:absolute;left:108px;top:126px;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
      .lk.ok{color:#a6da95}.lk.red{background:#ed8796;color:#181926}
      .sts{flex:1 1 155px;display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:8px;min-width:0}
      .tile.s,.tile.k{height:56px}
      .tile.s:disabled{opacity:1}
      .tile.s .nm{font-size:15px;font-weight:600}
      .tile.s.red .ic{background:#ed8796;color:#181926}
      .tile.s.yellow .ic{background:#eed49f;color:#181926}
      .tile.s.act .ic{background:var(--primary-color);color:#181926}
      /* controlos: ícone por cima do rótulo */
      .btns{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
      .tile.k .tx{flex:1}
      .tile.k .st{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tile.k .st:empty{display:none}
      .tile.ok .ic{background:#a6da95;color:#181926}
      .tile.warn .ic{background:rgba(24,25,38,.16);color:#181926}.tile.warn .st{color:#181926}
      .box{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:var(--card-background-color)}
      .box.row{flex-direction:row;align-items:center;flex-wrap:wrap;gap:10px 12px}
      .box .ic.lg{background:var(--secondary-background-color)}.box .ic.lg.act{background:var(--primary-color)}
      .stepper{display:inline-flex;align-items:center;gap:4px}.box .step{background:var(--secondary-background-color)}
      .amps{min-width:64px;min-height:44px;text-align:center;font-size:26px;font-weight:600;font-variant-numeric:tabular-nums}
      .amps small{font-size:14px;font-weight:500;color:var(--secondary-text-color);margin-left:3px}
      .box .chip{background:var(--secondary-background-color)}.box .chip.on{background:var(--primary-text-color)}.box .chip.warn{background:var(--error-color)}
      .chip.go2{flex:0 0 140px;justify-content:center;padding:0 8px;box-sizing:border-box}
      .restr .chip{background:var(--card-background-color)}.restr .chip.on{background:var(--primary-text-color)}
      .rhd{display:flex;align-items:center;gap:12px;min-height:44px;width:100%}
      .restr .tile.on{background:var(--primary-text-color)}.restr .tile.on .ic{background:var(--primary-color)}.restr .tile.ok .ic{background:#a6da95}
      .restr .tile.warn{background:var(--error-color)}
      .go{font-size:14px;font-weight:500;color:var(--primary-color)}
      .pills{display:flex;flex-wrap:wrap;gap:8px}
      .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0 16px}
      .lrow{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;border-bottom:1px solid var(--divider-color);min-width:0}
      .lrow .st{flex:none;max-width:55%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    </style>
    <ha-card>
      <div class="top"><span class="sum">${escC(sum)}</span></div>
      <section class="panel" aria-label="Autonomia"><span class="ttl sm">Autonomia</span><div class="ranges">${range}</div></section>
      <div class="cols two">${panels}</div>
      ${controls}
      ${restr}
    </ha-card>`;
    this._bind();
  }
  _fire(e) { this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } })); }
  _armed(key, run) {
    if (this._arm !== key) { clearTimeout(this._t); this._arm = key; this._t = setTimeout(() => { this._arm = null; this._render(); }, 5000); return this._render(); }
    clearTimeout(this._t); this._arm = null; run(); this._render();
  }
  _do(key) {
    const h = this._h, c = this._c;
    if (key === 'wake') return this._armed(key, () => h.callService('button', 'press', {}, { entity_id: c.controls.wake }));
    if (key === 'charger') { const on = this._s(c.charger.switch).state === 'on'; return this._armed(key, () => h.callService('switch', on ? 'turn_off' : 'turn_on', {}, { entity_id: c.charger.switch })); }
    const list = key[0] === 'c' ? c.controls.tiles : c.restricted.tiles, i = this._tile(list[Number(key.slice(1))]);
    if (i.bad || !i.svc) return;
    this._armed(key, () => h.callService(i.svc[0], i.svc[1], {}, { entity_id: i.ids }));
  }
  _bind() {
    const R = this.shadowRoot, h = this._h, c = this._c;
    R.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => { this._open = !this._open; if (!this._open) this._list = null; this._render(); }));
    R.querySelectorAll('[data-list]').forEach((el) => el.addEventListener('click', () => { const i = Number(el.dataset.list); this._list = this._list === i ? null : i; this._render(); }));
    R.querySelectorAll('[data-amp]').forEach((el) => el.addEventListener('click', () => {
      const ch = c.charger, cur = this._num(ch.current); if (cur == null) return;
      const min = ch.min != null ? ch.min : 6, max = ch.max != null ? ch.max : 16;
      h.callService('number', 'set_value', { value: Math.max(min, Math.min(max, cur + Number(el.dataset.amp))) }, { entity_id: ch.current });
    }));
    R.querySelectorAll('[data-info]').forEach((el) => {
      let t = null, held = false;
      el.addEventListener('pointerdown', () => { held = false; t = setTimeout(() => { held = true; this._fire(el.dataset.info); }, 550); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => clearTimeout(t)));
      el.addEventListener('click', () => { if (held) return; if (el.dataset.act) this._do(el.dataset.act); else this._fire(el.dataset.info); });
    });
  }
}
if (!customElements.get('casa-cars-card')) customElements.define('casa-cars-card', CasaCarsCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'casa-cars-card')) window.customCards.push({ type: 'casa-cars-card', name: 'Casa · Carros', description: 'Autonomia em anel, diagrama do carro, controlos com dois toques e secção restrita.' });

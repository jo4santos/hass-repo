/* casa-equipment-card v0.3.1 — equipamentos: piscina, exaustores, rega, escritório e outros */
const escE = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nfE = (n, d = 0) => Number(n).toLocaleString('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
const icE = (i, s = 20) => `<ha-icon icon="${escE(i)}" style="--mdc-icon-size:${s}px"></ha-icon>`;
const durE = (min) => { min = Math.max(1, Math.round(min)); if (min < 60) return min + ' min'; const h = Math.floor(min / 60), m = min % 60; return h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : ''); };
const agoE = (iso) => {
  const t = Date.parse(iso); if (!t) return '';
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 2) return 'agora mesmo';
  if (m < 60) return 'há ' + m + ' min';
  const h = Math.round(m / 60); if (h < 24) return 'há ' + h + ' h';
  const d = Math.round(h / 24); return 'há ' + d + (d === 1 ? ' dia' : ' dias');
};

class CasaEquipmentCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._sig = ''; this._set = {}; }
  setConfig(c) {
    if (!c.pool && !c.fans && !c.irrigation && !c.office && !(c.misc || []).length) throw new Error('Defina pelo menos um grupo');
    this._c = Object.assign({ misc: [] }, c);
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() { this._iv = setInterval(() => this._render(), 30000); }
  disconnectedCallback() { clearInterval(this._iv); }
  _ids() {
    const out = [], add = (v) => { if (typeof v === 'string') { const m = v.match(/^([a-z_]+\.[a-z0-9_]+)(@.*)?$/); if (m) out.push(m[1]); } else if (Array.isArray(v)) v.forEach(add); else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (k !== 'service') add(x); }); };
    add(this._c); return out;
  }
  set hass(h) {
    this._h = h;
    if (!this._idc) this._idc = this._ids();
    const sig = this._idc.map((i) => (h.states[i] ? h.states[i].state + '|' + h.states[i].last_updated : '-')).join(';');
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  _s(e) { return e ? this._h.states[e] : null; }
  _bad(e) { const s = this._s(e); return !s || s.state === 'unavailable' || s.state === 'unknown'; }
  _on(e) { const s = this._s(e); return !!s && !this._bad(e) && !['off', 'closed', 'idle', 'standby'].includes(s.state); }
  _num(e) { const s = this._s(e); const n = s ? Number(s.state) : NaN; return this._bad(e) || isNaN(n) ? null : n; }
  _left(timer) { const s = this._s(timer); if (!s || s.state !== 'active' || !s.attributes.finishes_at) return ''; return 'faltam ' + durE((Date.parse(s.attributes.finishes_at) - Date.now()) / 60000); }
  /* valor formatado de "entidade" ou "entidade@atributo" */
  _v(ref) {
    const [e, attr] = String(ref).split('@'), s = this._s(e);
    if (!s || this._bad(e)) return '—';
    if (attr) { const v = s.attributes[attr]; return v == null ? '—' : typeof v === 'number' ? nfE(v, v % 1 ? 1 : 0) + (/temp/.test(attr) ? '°' : '') : String(v); }
    const dom = e.split('.')[0], u = s.attributes.unit_of_measurement, n = Number(s.state);
    if (dom === 'input_datetime' && s.attributes.has_time && !s.attributes.has_date) return s.state.slice(0, 5);
    if (!isNaN(n) && u) { if (/^min/.test(u)) return durE(n); if (u === 'm' && Math.abs(n) < 10) return nfE(n * 100) + ' cm'; return nfE(n, n % 1 && Math.abs(n) < 10 ? 1 : 0) + ' ' + u; }
    return this._h.formatEntityState ? this._h.formatEntityState(s) : s.state;
  }
  _tpl(txt, vars) { return String(txt || '').replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] ? this._v(vars[k]) : m)); }
  _settings(key, list) {
    list = (list || []).filter((x) => this._s(x.entity)); if (!list.length) return '';
    if (list.length === 1) return `<button class="link" data-info="${escE(list[0].entity)}">Programação ›</button>`;
    const open = !!this._set[key];
    return `<button class="link" data-set="${escE(key)}" aria-expanded="${open}">${open ? 'Fechar programação' : 'Programação ›'}</button>${open ? `<div class="prog">${list.map((x) => `<button class="prow" data-info="${escE(x.entity)}"><span class="nm">${escE(x.name)}</span><span class="st">${escE(x.entity.startsWith('automation.') ? (this._on(x.entity) ? 'Ligado' : 'Desligado') : this._v(x.entity))} ›</span></button>`).join('')}</div>` : ''}`;
  }
  _switch(key, label, entity) {
    if (!this._s(entity)) return '';
    const on = this._on(entity);
    return `<button class="chip sw${on ? ' son' : ''}" data-tog="${escE(entity)}" data-info="${escE(entity)}" role="switch" aria-checked="${on}" ${this._bad(entity) ? 'disabled' : ''}>${escE(label)}<span class="track"><span class="knob"></span></span></button>`;
  }
  /* mosaico genérico: devolve {html,on} */
  _tile(t, key, cls) {
    if (!this._s(t.entity)) return { html: '', on: false, bad: false, missing: true };
    const bad = this._bad(t.entity) || (!!t.requires && this._bad(t.requires)), flag = this._on(t.entity), se = t.state_entities, on = se ? [].concat(se).some((e) => this._on(e)) : flag;
    const alert = t.alert && this._on(t.alert.entity);
    const left = on && t.timer ? this._left(t.timer) : '';
    let st = bad ? 'Sem ligação' : this._tpl(se ? (on ? (t.active_text || 'Ligado') : flag ? (t.on_text || 'Automático') : (t.off_text || 'Desligado')) : on ? (t.on_text || 'Ligado') : (t.off_text || 'Desligado'), t.vars);
    if (!bad && !on && t.since) st += ' · ' + agoE(this._s(t.entity).last_changed);
    if (left) st += ' · ' + left;
    const html = `<div class="cell ${cls || ''}${on ? ' on' : ''}"><button class="tile ${cls || ''}${on ? ' on' : ''}" data-tile="${escE(key)}" data-info="${escE(t.entity)}" ${bad ? 'disabled' : ''} aria-pressed="${se ? flag : on}">
      <span class="ic">${icE(t.icon || 'mdi:power-plug')}</span>
      <span class="tx"><span class="nm">${escE(t.name)}</span><span class="st${alert ? ' red' : ''}">${alert ? icE('mdi:alert-outline', 14) + escE(t.alert.text || 'Atenção') : escE(st)}</span></span></button>${this._settings(key, t.settings)}</div>`;
    return { html, on, bad };
  }
  _find(key) {
    const c = this._c, [g, i] = key.split(':');
    if (g === 'filter') return c.pool.filter; if (g === 'heat') return c.pool.heat;
    if (g === 'fan') return c.fans.items[i]; if (g === 'zone') return c.irrigation.zones[i];
    return c.misc[i];
  }
  _call(a) { const p = a.service.split('.'); return this._h.callService(p[0], p[1], a.data || {}, a.target || (a.entity_id ? { entity_id: a.entity_id } : undefined)); }
  _tap(key) {
    const t = this._find(key); if (!t || this._bad(t.entity) || (t.requires && this._bad(t.requires))) return;
    const on = this._on(t.entity), acts = on ? t.off_action : t.on_action;
    if (acts) return [].concat(acts).forEach((a) => this._call(a));
    const dom = t.entity.split('.')[0];
    if (dom === 'climate') return this._h.callService('climate', on ? 'turn_off' : 'turn_on', {}, { entity_id: t.entity });
    this._h.callService('homeassistant', on ? 'turn_off' : 'turn_on', {}, { entity_id: t.entity });
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    let running = 0; const warns = [], panels = [];
    const cnt = (r, t) => { if (r.on && t.count !== false) running++; };

    if (c.pool) {
      const p = c.pool, cl = this._s(p.climate), tg = cl ? cl.attributes.temperature : null, cur = cl ? cl.attributes.current_temperature : null;
      const heating = !!cl && cl.state !== 'off' && !this._bad(p.climate);
      const heatBad = p.heat_switch && this._bad(p.heat_switch);
      if (heatBad) warns.push('a piscina tem um aviso por resolver');
      const f = p.filter ? this._tile(Object.assign({ name: 'Filtro', icon: 'mdi:fan', on_text: 'A filtrar', off_text: 'Desligado', since: true }, p.filter), 'filter:0') : { html: '' };
      if (p.filter) cnt(f, p.filter);
      const ht = p.heat ? this._tile(Object.assign({ name: 'Aquecimento', icon: 'mdi:heat-wave', on_text: 'Ligado', off_text: 'Desligado' }, p.heat), 'heat:0') : { html: '' };
      if (p.heat) cnt(ht, p.heat);
      const step = p.step || 0.5, min = cl ? cl.attributes.min_temp : 0, max = cl ? cl.attributes.max_temp : 40;
      panels.push(`<section class="panel" aria-label="${escE(p.name || 'Piscina')}">
        <div class="hd"><button class="ic lg" data-info="${escE(p.climate)}" aria-label="Detalhes da piscina">${icE(p.icon || 'mdi:pool', 22)}</button><span class="tx grow"><span class="ttl">${escE(p.name || 'Piscina')}</span><span class="cap">Aquecimento ${heating ? 'ligado' : 'desligado'}${cur != null ? ' · água a ' + nfE(cur, 1) + '°' : ''}</span></span></div>
        ${heatBad ? `<button class="banner" data-info="${escE(p.heat_switch)}">${icE('mdi:alert-outline', 18)}<span>${escE(p.heat_warning || 'Interruptor da bomba de calor sem sinal')}</span></button>` : ''}
        <div class="box row"><button class="tx grow" data-info="${escE(p.climate)}"><span class="st">Alvo da água</span><span class="sv">${tg == null ? '—' : nfE(tg, 1) + '°'}</span></button>
          <button class="step" data-temp="${-step}" ${tg == null || tg - step < min ? 'disabled' : ''} aria-label="Baixar alvo">${icE('mdi:minus', 18)}</button>
          <button class="step" data-temp="${step}" ${tg == null || tg + step > max ? 'disabled' : ''} aria-label="Subir alvo">${icE('mdi:plus', 18)}</button></div>
        <div class="grid">${ht.html}${f.html}</div>
        ${this._settings('pool', p.settings)}
      </section>`);
    }
    const iF = panels.length, rF = running;
    if (c.fans) {
      const g = c.fans, tiles = (g.items || []).map((t, i) => {
        const last = t.last && !this._bad(t.last) ? this._s(t.last).state : '';
        const r = this._tile(Object.assign({ icon: 'mdi:fan', on_text: 'Ligado', off_text: last ? 'Último banho ' + last.charAt(0).toLowerCase() + last.slice(1) : 'Desligado' }, t), 'fan:' + i, 'v');
        cnt(r, t); return r.html;
      }).join('');
      panels.push(`<section class="panel" aria-label="${escE(g.name)}"><div class="hd"><span class="tx grow"><span class="ttl">${escE(g.name)}</span>${g.subtitle ? `<span class="cap">${escE(g.subtitle)}</span>` : ''}</span>${g.auto ? this._switch('fans', 'Automático', g.auto) : ''}</div>
        <div class="grid">${tiles}</div></section>`);
    }
    const iR = panels.length, rR = running;
    if (c.irrigation) {
      const g = c.irrigation, times = (g.times || []).filter((e) => !this._bad(e)).map((e) => this._v(e));
      const auto = g.auto && this._on(g.auto);
      const tiles = (g.zones || []).map((t, i) => {
        const r = this._tile(Object.assign({ icon: 'mdi:water-outline', on_text: 'A regar', off_text: 'Parada' }, t), 'zone:' + i);
        if (r.on && !this._left(t.timer)) r.html = r.html.replace('A regar', 'A regar · ' + agoE(this._s(t.entity).last_changed));
        else if (!r.on && !r.bad && !r.missing) r.html = r.html.replace('Parada', 'Parada · regou ' + agoE(this._s(t.entity).last_changed));
        cnt(r, t); return r.html;
      }).join('');
      panels.push(`<section class="panel" aria-label="${escE(g.name)}"><div class="hd"><span class="tx grow"><span class="ttl">${escE(g.name)}</span><span class="cap">${auto ? 'Programa automático' + (times.length ? ' · ' + times.join(' e ') : '') : 'Programa automático desligado'}</span></span>${g.auto ? this._switch('rega', 'Automática', g.auto) : ''}</div>
        <div class="grid">${tiles}</div>
        ${this._settings('rega', g.settings)}</section>`);
    }
    const iO = panels.length, rO = running;
    if (c.office) {
      const g = c.office, rows = (g.rows || []).filter((r) => this._s(r.entity)).map((r, i) => {
        const s = this._s(r.entity), bad = this._bad(r.entity), pos = s.attributes.current_position;
        const fem = r.fem !== false, label = bad ? 'Sem ligação' : r.extra && !this._bad(r.extra) ? this._v(r.extra) : pos === 100 || (pos == null && s.state === 'open') ? (fem ? 'Aberta' : 'Aberto') : pos === 0 || s.state === 'closed' ? (fem ? 'Fechada' : 'Fechado') : pos + '%';
        return `<div class="box row${bad ? ' off' : ''}"><button class="ic" data-info="${escE(r.entity)}" aria-label="Detalhes de ${escE(r.name)}">${icE(r.icon || 'mdi:blinds')}</button>
          <span class="tx grow"><span class="pl"><span class="nm">${escE(r.name)}</span><span class="nm num">${escE(label)}</span></span>${pos != null && !bad ? `<span class="track2"><span style="width:${pos}%"></span></span>` : ''}</span>
          ${r.step && !bad ? `<button class="step" data-pos="${i}:-1" ${pos === 0 ? 'disabled' : ''} aria-label="${escE(r.down_label || 'Fechar ' + r.name)}">${icE('mdi:chevron-down')}</button><button class="step" data-pos="${i}:1" ${pos === 100 ? 'disabled' : ''} aria-label="${escE(r.up_label || 'Abrir ' + r.name)}">${icE('mdi:chevron-up')}</button>`
          : !bad ? `<button class="link" data-info="${escE(r.entity)}">Ajustar ›</button>` : ''}</div>`;
      }).join('');
      panels.push(`<section class="panel" aria-label="${escE(g.name)}"><div class="hd"><span class="ttl">${escE(g.name)}</span></div>${rows}</section>`);
    }
    const rM = running; let nBad = 0;
    const misc = c.misc.map((t, i) => { const r = this._tile(t, 'misc:' + i, 'v'); cnt(r, t); if (r.bad) nBad++; return r.html; }).join('');
    const sum = (running ? running + (running === 1 ? ' equipamento ligado' : ' equipamentos ligados') : 'Nenhum equipamento ligado') + (warns.length ? '; ' + warns.join(', ') : '') + '.';

    /* grupos com divisor (igual ao das Luzes): só quando há dois ou mais grupos */
    const nOn = (n) => (n ? (n === 1 ? '1 ligado' : n + ' ligados') : 'tudo desligado');
    const groups = [
      ['Água e jardim', nOn(rF + rO - rR) + (warns.length ? ' · 1 aviso' : ''), panels.slice(0, iF).concat(panels.slice(iR, iO)).join(''), 'cols two'],
      ['Casa', nOn(rR - rF), panels.slice(iF, iR).concat(panels.slice(iO)).join(''), 'cols two'],
      ['Aparelhos', nOn(running - rM) + (nBad ? ' · ' + nBad + ' sem ligação' : ''), misc, 'misc'],
    ].filter((g) => g[2]);
    const body = groups.map((g) => (groups.length > 1 ? `<div class="floor"><span class="fn">${g[0]}</span><span class="fc">${escE(g[1])}</span><span class="fl"></span></div>` : '') + `<div class="${g[3]}">${g[2]}</div>`).join('');
    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      :host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
      button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
      button:disabled{opacity:.45;cursor:default}
      button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
      .sum{font-size:20px;font-weight:600;margin-right:auto}
      h3{margin:8px 0 -4px;font-size:13px;font-weight:500;color:var(--secondary-text-color)}
      .panel{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
      .cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;align-items:start}
      .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .tile{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 10px;border-radius:12px;background:var(--card-background-color);min-width:0}
      .tile.on{background:var(--primary-text-color);color:var(--card-background-color)}
      .ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
      .tile.on .ic{background:var(--primary-color);color:#181926}
      .nm{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .st{font-size:12px;color:var(--secondary-text-color)} .tile.on .st{color:inherit;opacity:.75}
      .val{font-size:28px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
      .cap{font-size:13px;color:var(--secondary-text-color)}
      .chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
      .chip.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
      .chip.warn,.tile.warn{background:var(--error-color);color:#fff;font-weight:600}
      .link{font-size:14px;font-weight:500;color:var(--primary-color);min-height:44px;display:inline-flex;align-items:center}
      .step{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
      /* específicos desta página */
      .cols.two{grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))}
      .tx{display:flex;flex-direction:column;gap:2px;min-width:0}.grow{flex:1 1 120px}
      .ttl{font-size:16px;font-weight:600}
      .hd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-height:44px}
      .ic.lg{width:44px;height:44px;background:var(--card-background-color)}
      .cell{display:flex;flex-direction:column;min-width:0}
      .cell .tile{width:100%;box-sizing:border-box;flex:1}
      .cell .link{align-self:flex-start;padding:0 4px}.cell.v{position:relative}.cell.v>.link{position:absolute;top:8px;right:6px;padding:0 6px}.cell.on>.link{color:inherit}.cell.on .prow .st{color:inherit;opacity:.75}
      .panel>.link{align-self:flex-start;margin:-6px 0}
      .tile.v{flex-direction:column;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px;min-height:104px}
      .tile.v .tx{width:100%}.tile .st{white-space:normal}.tile:disabled{opacity:1}.tile:disabled .ic{opacity:.45}.tile:disabled .nm{font-weight:400;color:var(--secondary-text-color)}
      .st.red{color:#ed8796;font-weight:600;display:inline-flex;align-items:center;gap:4px}.tile.on .st.red{color:inherit;opacity:1}
      .box{display:flex;flex-direction:column;gap:8px;padding:8px 10px;border-radius:12px;background:var(--card-background-color);min-height:56px;box-sizing:border-box}
      .box.row{flex-direction:row;align-items:center;gap:8px}
      .box.off{opacity:.55}
      .box .step,.box .ic{background:var(--secondary-background-color)}
      .box>.tx:first-child{padding-left:4px}
      .sv{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}
      .banner{display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 12px;border-radius:12px;background:rgba(237,135,150,.14);color:#ed8796;font-size:14px}
      .sw{padding:0 10px 0 14px;gap:12px;border-radius:12px;white-space:nowrap;background:var(--card-background-color)}
      .track{flex:none;width:36px;height:20px;border-radius:10px;padding:2px;box-sizing:border-box;background:rgba(127,127,127,.35);background:color-mix(in srgb,var(--primary-text-color) 22%,transparent);display:flex;justify-content:flex-start}
      .knob{width:16px;height:16px;border-radius:50%;background:var(--secondary-text-color)}
      .sw.son .track{background:var(--primary-text-color);justify-content:flex-end}.sw.son .knob{background:var(--card-background-color)}
      .pl{display:flex;justify-content:space-between;gap:8px}.num{font-variant-numeric:tabular-nums;flex:none}
      .track2{position:relative;height:6px;border-radius:3px;background:var(--secondary-background-color);margin-top:4px}
      .track2 span{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--primary-text-color)}
      .misc{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;align-items:start}
      .misc .cell{border-radius:12px;background:var(--secondary-background-color)}.misc .cell.on{background:var(--primary-text-color);color:var(--card-background-color)}.misc .tile,.misc .tile.on{background:none}.misc .prog{box-sizing:border-box;padding:0 8px 4px}
      .misc .tile .ic{background:var(--card-background-color)}.misc .tile.on .ic{background:var(--primary-color)}
      .prog{display:flex;flex-direction:column;width:100%}
      .prow{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;border-top:1px solid var(--divider-color);padding:0 4px}
      .prow .st{flex:none;font-size:13px}
      .floor{display:flex;align-items:center;gap:12px;margin:10px 0 -4px}.fn{font-size:17px;font-weight:600}.fc{font-size:13px;color:var(--secondary-text-color)}.fl{flex:1;height:1px;background:var(--divider-color,rgba(127,127,127,.3))}
    </style>
    <ha-card>
      <div class="top"><span class="sum">${escE(sum)}</span></div>
      ${body}
      
    </ha-card>`;
    this._bind();
  }
  _fire(e) { this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: e } })); }
  _bind() {
    const R = this.shadowRoot, h = this._h, c = this._c;
    R.querySelectorAll('[data-set]').forEach((el) => el.addEventListener('click', () => { this._set[el.dataset.set] = !this._set[el.dataset.set]; this._render(); }));
    R.querySelectorAll('[data-temp]').forEach((el) => el.addEventListener('click', () => {
      const cl = this._s(c.pool.climate), tg = cl && cl.attributes.temperature; if (tg == null) return;
      h.callService('climate', 'set_temperature', { temperature: Math.round((tg + Number(el.dataset.temp)) * 10) / 10 }, { entity_id: c.pool.climate });
    }));
    R.querySelectorAll('[data-pos]').forEach((el) => el.addEventListener('click', () => {
      const [i, d] = el.dataset.pos.split(':').map(Number), r = c.office.rows.filter((x) => this._s(x.entity))[i], s = this._s(r.entity), pos = s.attributes.current_position;
      if (pos == null) return h.callService('cover', d > 0 ? 'open_cover' : 'close_cover', {}, { entity_id: r.entity });
      h.callService('cover', 'set_cover_position', { position: Math.max(0, Math.min(100, pos + d * r.step)) }, { entity_id: r.entity });
    }));
    R.querySelectorAll('[data-info]').forEach((el) => {
      let t = null, held = false;
      el.addEventListener('pointerdown', () => { held = false; t = setTimeout(() => { held = true; this._fire(el.dataset.info); }, 550); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => clearTimeout(t)));
      el.addEventListener('click', () => {
        if (held) return;
        if (el.dataset.tile) this._tap(el.dataset.tile);
        else if (el.dataset.tog) h.callService('homeassistant', this._on(el.dataset.tog) ? 'turn_off' : 'turn_on', {}, { entity_id: el.dataset.tog });
        else this._fire(el.dataset.info);
      });
    });
  }
}
if (!customElements.get('casa-equipment-card')) customElements.define('casa-equipment-card', CasaEquipmentCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-equipment-card', name: 'Casa · Equipamentos', description: 'Piscina, exaustores, rega, escritório e outros equipamentos.' });

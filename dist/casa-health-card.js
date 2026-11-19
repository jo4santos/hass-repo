/* casa-health-card v0.3.0 — página Saúde: anéis do dia, sono, corpo, último treino (entities.workout_info = sensor com atributos start/end: data e hora do treino) e gráficos de 30 dias (recolhidos) */
const escH = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const numH = (v, d) => Number(v).toFixed(d == null ? 0 : d).replace('.', ',');
const hmH = (hrs) => { const m = Math.round(Number(hrs) * 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };

class CasaHealthCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._sig = ''; }
  setConfig(c) {
    if (!c || !c.entities) throw new Error('Defina "entities"');
    this._c = Object.assign({ rings: [], stages: [], vitals: [], workout: [], charts: [] }, c);
    this._main = null; this._cards = null; this._open = false; this._sig = '';
  }
  getCardSize() { return 10; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  disconnectedCallback() { clearTimeout(this._holdT); }
  _ids() {
    const c = this._c, out = Object.values(c.entities || {});
    [c.rings, c.stages, c.vitals, c.workout].forEach((l) => l.forEach((x) => { out.push(x.entity); if (x.context_entity) out.push(x.context_entity); }));
    return out.filter(Boolean);
  }
  set hass(h) {
    this._h = h; if (!this._c) return;
    if (this._open && this._cards) this._cards.forEach((el) => { el.hass = h; });
    const wi = h.states[this._c.entities.workout_info], sig = this._ids().map((i) => (h.states[i] ? h.states[i].state : '-')).join(';') + '|' + (wi && wi.attributes ? wi.attributes.start + '/' + wi.attributes.end : '') + '|' + new Date().toDateString();
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  /* valor numérico ou null se a entidade não existir / sem ligação */
  _n(id) {
    const s = id && this._h.states[id];
    if (!s || s.state === 'unavailable' || s.state === 'unknown' || s.state === '') return null;
    const v = Number(s.state); return isNaN(v) ? null : v;
  }
  _k(key) { return this._n(this._c.entities[key]); }
  _has(id) { return !!id && !!this._h.states[id]; }
  _fmt(v, x) { return v == null ? 'Sem ligação' : numH(v, x.decimals) + (x.unit ? (x.unit === '%' || x.unit === '°' ? '' : ' ') + x.unit : ''); }
  _band(x, v) {
    if (v == null || !x.bands) return null;
    return x.bands.find((b) => (b.min == null || v >= b.min) && (b.max == null || v < b.max)) || null;
  }
  _ringNote(r, v) {
    const k = (key) => this._k(key), p = [];
    if (r.note === 'recovery') { if (k('hrv') != null) p.push('HRV ' + numH(k('hrv')) + ' ms'); if (k('resting_hr') != null) p.push('FC repouso ' + numH(k('resting_hr'))); }
    else if (r.note === 'sleep') { const bed = k('in_bed'), aw = k('awake'); if (bed != null) return (aw != null ? hmH(bed - aw) + ' de ' : '') + hmH(bed) + ' na cama'; }
    else if (r.note === 'strain') { if (v != null) p.push(numH(v, r.decimals) + ' de ' + r.max); if (k('day_calories') != null) p.push(numH(k('day_calories')) + ' kcal hoje'); }
    else if (r.note === 'scale') { if (v != null) p.push(numH(v, r.decimals) + ' de ' + r.max); if (r.note_text) p.push(r.note_text); }
    else if (r.note_text) p.push(r.note_text);
    return p.join(' · ');
  }
  /* estrutura fixa: o conteúdo do dia é redesenhado em #main; os gráficos vivem fora para não serem destruídos */
  _skeleton() {
    const groups = (this._c.charts || []).filter((g) => g && Array.isArray(g.cards) && g.cards.length);
    this.shadowRoot.innerHTML = `<style>${CasaHealthCard.css}</style><ha-card><div id="main"></div>${groups.length ? `<button class="chip tg" id="tg" aria-expanded="false" aria-controls="charts">${escH(this._c.charts_label || '30 dias')}<ha-icon icon="mdi:chevron-right"></ha-icon></button><div id="charts" hidden></div>` : ''}</ha-card>`;
    this._main = this.shadowRoot.getElementById('main');
    const tg = this.shadowRoot.getElementById('tg');
    if (tg) tg.addEventListener('click', () => this._toggle(groups));
  }
  async _toggle(groups) {
    const tg = this.shadowRoot.getElementById('tg'), box = this.shadowRoot.getElementById('charts');
    if (!tg || !box) return;
    this._open = !this._open;
    tg.setAttribute('aria-expanded', String(this._open));
    box.hidden = !this._open;
    if (!this._open) return;
    if (this._cards) { this._cards.forEach((el) => { el.hass = this._h; }); return; }
    if (this._building) return;
    this._building = true;
    try {
      const helpers = await window.loadCardHelpers();
      const cards = [];
      box.innerHTML = '';
      groups.forEach((g) => {
        const p = document.createElement('div'); p.className = 'panel';
        if (g.title) { const ph = document.createElement('div'); ph.className = 'ph'; const t = document.createElement('span'); t.className = 'pt'; t.textContent = g.title; ph.appendChild(t); p.appendChild(ph); }
        const cg = document.createElement('div'); cg.className = 'cg';
        g.cards.forEach((cfg) => {
          const el = helpers.createCardElement(cfg);
          if ((cfg.grid_options && cfg.grid_options.columns === 'full') || /apexcharts/.test(cfg.type || '')) el.classList.add('wide');
          el.hass = this._h; cards.push(el); cg.appendChild(el);
        });
        p.appendChild(cg); box.appendChild(p);
      });
      this._cards = cards;
    } catch (e) {
      box.innerHTML = '<div class="panel"><span class="cap">Não foi possível carregar os gráficos.</span></div>';
    }
    this._building = false;
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const C = 238.76;
    const rings = c.rings.filter((r) => this._has(r.entity)).map((r) => {
      const v = this._n(r.entity), b = this._band(r, v);
      const frac = v == null ? 0 : Math.max(0, Math.min(1, v / (r.max || 100)));
      return { r, v, b, html: `<button class="panel ringp" data-more="${escH(r.entity)}">
        <span class="ring"><svg viewBox="0 0 88 88" width="88" height="88" aria-hidden="true"><circle cx="44" cy="44" r="38" fill="none" stroke="var(--divider-color,#363a4f)" stroke-width="8"/>${frac > 0 ? `<circle cx="44" cy="44" r="38" fill="none" stroke="${escH(r.color || 'var(--primary-color)')}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(C * frac).toFixed(1)} ${C}"/>` : ''}</svg>
        <span class="rv">${v == null ? '—' : escH(this._fmt(v, r))}</span></span>
        <span class="rtx"><span class="nm sec">${escH(r.name)}</span><span class="verdict">${v == null ? 'Sem ligação' : escH(b ? b.label : this._fmt(v, r))}</span><span class="cap">${escH(this._ringNote(r, v))}</span></span></button>` };
    });
    const sumParts = rings.filter((x) => x.b && x.b.sum).map((x) => x.b.sum);
    const sum = sumParts.length ? `${c.name ? c.name + ', hoje' : 'Hoje'}${c.source ? ' no ' + c.source : ''}: ${sumParts.length > 1 ? sumParts.slice(0, -1).join(', ') + ' e ' + sumParts[sumParts.length - 1] : sumParts[0]}.` : (c.name || 'Saúde');

    /* sono */
    const stages = c.stages.filter((s) => this._has(s.entity)).map((s) => Object.assign({ v: this._n(s.entity) }, s));
    const bed = this._k('in_bed'), cyc = this._k('cycles'), dis = this._k('disturbances');
    const sleepCap = [bed != null ? hmH(bed) + ' na cama' : '', cyc != null ? numH(cyc) + (cyc === 1 ? ' ciclo' : ' ciclos') : '', dis != null ? numH(dis) + (dis === 1 ? ' perturbação' : ' perturbações') : ''].filter(Boolean).join(' · ');
    const pair = [['efficiency', 'Eficiência'], ['consistency', 'Consistência']].filter((p) => this._has(c.entities[p[0]]));
    const sleep = stages.length || pair.length ? `<div class="panel grow3"><div class="ph"><span class="pt">Sono</span><span class="cap">${escH(sleepCap)}</span></div>
      ${stages.some((s) => s.v > 0) ? `<div class="bar" role="img" aria-label="Fases do sono">${stages.filter((s) => s.v > 0).map((s) => `<span style="background:${escH(s.color)};flex:${s.v}"></span>`).join('')}</div>` : ''}
      ${stages.length ? `<div class="stg">${stages.map((s) => `<button class="sg" data-more="${escH(s.entity)}"><span class="cap lg"><i style="background:${escH(s.color)}"></i>${escH(s.name)}</span><span class="v20">${s.v == null ? '—' : hmH(s.v)}</span></button>`).join('')}</div>` : ''}
      ${pair.length ? `<div class="grid">${pair.map((p) => { const v = this._k(p[0]); return `<button class="tile kv" data-more="${escH(c.entities[p[0]])}"><span class="cap">${p[1]}</span><span class="b">${v == null ? 'Sem ligação' : numH(v) + '%'}</span></button>`; }).join('')}</div>` : ''}</div>` : '';

    /* corpo */
    const stat = (x, extra) => { const v = this._n(x.entity); return `<button class="tile stat" data-more="${escH(x.entity)}"><span class="st">${escH(x.name)}</span><span class="v20">${escH(this._fmt(v, x))}</span>${extra != null ? `<span class="st">${escH(extra)}</span>` : ''}</button>`; };
    const vit = c.vitals.filter((x) => this._has(x.entity));
    const body = vit.length ? `<div class="panel grow2"><div class="ph"><span class="pt">Recuperação e corpo</span></div><div class="grid">${vit.map((x) => stat(x)).join('')}</div></div>` : '';

    /* último treino */
    const wk = c.workout.filter((x) => this._has(x.entity));
    const wo = h.states[c.entities.workout_info], wa = (wo && wo.attributes) || {}, ws = wa.start ? new Date(wa.start) : null, we = wa.end ? new Date(wa.end) : null;
    let when = '';
    if (ws && !isNaN(ws)) {
      const hm2 = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      const d0 = new Date(); d0.setHours(0, 0, 0, 0); const d1 = new Date(ws); d1.setHours(0, 0, 0, 0); const dd = Math.round((d0 - d1) / 864e5);
      const day = dd === 0 ? 'Hoje' : dd === 1 ? 'Ontem' : ws.toLocaleDateString('pt-PT', Object.assign({ weekday: 'short', day: 'numeric', month: 'short' }, ws.getFullYear() !== d0.getFullYear() ? { year: 'numeric' } : {})).replace(/\./g, '');
      const ok = we && !isNaN(we) && we > ws;
      when = day + ', ' + hm2(ws) + (ok ? '–' + hm2(we) + ' · ' + hmH((we - ws) / 36e5) : '');
    }
    const workout = wk.length ? `<div class="panel"><div class="ph left"><span class="ic"><ha-icon icon="mdi:dumbbell"></ha-icon></span><span class="pt">Último treino</span>${when ? `<span class="cap wn">${escH(when)}</span>` : ''}</div>
      <div class="grid g4">${wk.map((x) => { const cv = x.context_entity ? this._n(x.context_entity) : null; return stat(Object.assign({}, x, { unit: '' }), [x.caption, x.context && cv != null ? String(x.context).replace('{}', numH(cv)) : ''].filter(Boolean).join(' · ')); }).join('')}</div></div>` : '';

    if (!this._main) this._skeleton();
    this._main.innerHTML = `
      <div class="top"><span class="sum">${escH(sum)}</span></div>
      ${rings.length ? `<div class="rings">${rings.map((x) => x.html).join('')}</div>` : '<div class="panel"><span class="cap">Sem dados de saúde disponíveis.</span></div>'}
      ${sleep || body ? `<div class="two">${sleep}${body}</div>` : ''}
      ${workout}`;
    this._main.querySelectorAll('[data-more]').forEach((b) => {
      const fire = () => this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: b.dataset.more } }));
      let held = false;
      b.addEventListener('pointerdown', () => { held = false; clearTimeout(this._holdT); this._holdT = setTimeout(() => { held = true; fire(); }, 550); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => b.addEventListener(e, () => clearTimeout(this._holdT)));
      b.addEventListener('click', () => { if (held) { held = false; return; } fire(); });
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }
}
CasaHealthCard.css = `
:host{display:block}
:host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.sum{font-size:20px;font-weight:600;margin-right:auto}
.panel{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.tile{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 10px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box}
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.nm{font-size:14px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:12px;line-height:1.3;color:var(--secondary-text-color)}
.cap{font-size:13px;line-height:1.35;color:var(--secondary-text-color)}
/* específicos da página */
.rings{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.ringp{flex-direction:row;align-items:center;gap:14px;padding:12px}
.ring{position:relative;flex:none;width:88px;height:88px;display:grid;place-items:center}
.ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
.rv{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}
.rtx{display:flex;flex-direction:column;gap:2px;min-width:0}
.sec{color:var(--secondary-text-color)}
.verdict{font-size:20px;font-weight:600;line-height:1.25}
.two{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
.grow3{flex:3 1 480px}.grow2{flex:2 1 340px}
.ph{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.ph.left{justify-content:flex-start;align-items:center}.wn{margin-left:auto;font-size:14px;font-weight:500;color:var(--primary-text-color);font-variant-numeric:tabular-nums}
.pt{font-size:16px;font-weight:600;line-height:1.3}
.bar{display:flex;height:28px;border-radius:8px;overflow:hidden;gap:2px}
.bar span{height:100%;min-width:2px}
.stg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.sg{display:flex;flex-direction:column;gap:4px;min-height:44px;min-width:0}
.lg{display:flex;align-items:center;gap:6px}
.lg i{flex:none;width:9px;height:9px;border-radius:3px}
.v20{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.25;white-space:nowrap}
.kv{justify-content:space-between;padding:8px 14px;min-height:44px}
.kv .b{font-size:14px;font-weight:600}
.stat{flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:8px 12px}
.g4{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
#main{display:contents}
.chip{min-height:44px;padding:0 12px 0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:4px}
.tg{align-self:flex-start}
.tg ha-icon{--mdc-icon-size:20px;display:inline-flex;color:var(--secondary-text-color)}
.tg[aria-expanded="true"] ha-icon{transform:rotate(90deg)}
#charts{display:flex;flex-direction:column;gap:12px}
#charts[hidden]{display:none}
.cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;align-items:start;--ha-card-background:var(--card-background-color);--ha-card-border-radius:12px;--ha-card-border-width:0px;--ha-card-box-shadow:none}
.cg>*{min-width:0}
.cg>.wide{grid-column:1/-1}
@media(max-width:520px){.stg{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
if (!customElements.get('casa-health-card')) customElements.define('casa-health-card', CasaHealthCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'casa-health-card')) window.customCards.push({ type: 'casa-health-card', name: 'Casa · Saúde', description: 'Anéis do dia, sono, corpo, último treino e gráficos de 30 dias' });

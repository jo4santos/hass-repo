/* casa-kids-agenda-card v0.3.2 (days: 1 = só hoje) — agenda das crianças: uma coluna por criança, só com os eventos dela (hoje e amanhã), em grande e só para ver.
   Os eventos são de quem está no prefixo do título («L - Flauta», «LD: Taekwondo»); os outros não aparecem.
   Configuração: calendars = [calendar.*]; kids = [{ key: 'D', name, color }]; refresh_minutes (5). */
(() => {
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ICONS = [[/nata[cç][aã]o|piscina/i, 'mdi:swim'], [/flauta|m[uú]sica|piano|guitarra|coro|orquestra/i, 'mdi:music'], [/taekwondo|karat|judo/i, 'mdi:karate'], [/futebol|futsal/i, 'mdi:soccer'], [/padel|t[eé]nis/i, 'mdi:tennis'], [/dan[cç]a|ballet/i, 'mdi:dance-ballroom'], [/gin[aá]stica/i, 'mdi:gymnastics'], [/dentista/i, 'mdi:tooth-outline'], [/m[eé]dic|consulta|pediatra|vacina/i, 'mdi:stethoscope'], [/anivers[aá]rio|festa/i, 'mdi:cake-variant-outline'], [/teste|exame|ficha/i, 'mdi:pencil-outline'], [/escola|aula|visita de estudo/i, 'mdi:school-outline'], [/ingl[eê]s/i, 'mdi:translate'], [/catequese/i, 'mdi:book-cross'], [/educa[cç][aã]o f[ií]sica|desporto/i, 'mdi:run'], [/computador|inform[aá]tica|tic\b/i, 'mdi:laptop'], [/av[oó]s|av[oó]\b/i, 'mdi:heart-outline'], [/levar|trazer/i, 'mdi:bag-personal-outline']];
const icon = (t) => { for (const [re, i] of ICONS) if (re.test(t)) return i; return 'mdi:star-outline'; };
class CasaKidsAgendaCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._ev = null; }
  setConfig(c) {
    if (!c || !Array.isArray(c.calendars) || !c.calendars.length) throw new Error('casa-kids-agenda-card: falta "calendars"');
    if (!Array.isArray(c.kids) || !c.kids.length) throw new Error('casa-kids-agenda-card: falta "kids"');
    this._c = Object.assign({ refresh_minutes: 5 }, c);
    this._cals = c.calendars.map((x) => (typeof x === 'string' ? x : x && x.entity)).filter(Boolean);
    this._sig = '';
  }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  set hass(h) { const first = !this._h; this._h = h; if (first) this._start(); }
  connectedCallback() { this._start(); this._render(); }
  disconnectedCallback() { clearInterval(this._t); this._t = null; clearInterval(this._m); this._m = null; }
  _start() {
    if (!this._h || !this._c || !this.isConnected) return;
    if (!this._t) { this._fetch(); this._t = setInterval(() => this._fetch(), Math.max(1, Number(this._c.refresh_minutes) || 5) * 60000); }
    if (!this._m) this._m = setInterval(() => this._render(), 60000);
  }
  _day(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  _hm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  async _fetch() {
    const h = this._h; if (!h || !h.callApi) return;
    const a = new Date(); a.setHours(0, 0, 0, 0); const b = new Date(a.getTime() + 2 * 86400000);
    const q = '?start=' + encodeURIComponent(a.toISOString()) + '&end=' + encodeURIComponent(b.toISOString());
    const res = await Promise.all(this._cals.map((c) => h.callApi('GET', 'calendars/' + c + q).then((r) => ({ ok: true, r: r || [] }), () => ({ ok: false, r: [] }))));
    const seen = {}, out = [];
    res.forEach((x) => x.r.forEach((e) => {
      const s = e.start || {}, en = e.end || {}, allDay = !s.dateTime && !!s.date;
      const k = (e.summary || '') + '|' + (s.dateTime || s.date) + '|' + (en.dateTime || en.date); if (seen[k]) return; seen[k] = 1;
      const m = String(e.summary || '').match(/^([A-Za-z]{1,4})\s*[-–:]\s*(.+)$/); if (!m) return;
      out.push({ who: m[1].toUpperCase(), title: m[2].charAt(0).toUpperCase() + m[2].slice(1), allDay, s: allDay ? s.date : new Date(s.dateTime), e: allDay ? en.date : new Date(en.dateTime) });
    }));
    this._err = res.every((x) => !x.ok); if (!this._err || !this._ev) this._ev = out;
    this._v = (this._v || 0) + 1; this._render();
  }
  _rows(kid, dayKey, now, today) {
    const key = String(kid.key || '').toUpperCase(), out = [];
    for (const e of this._ev || []) {
      if (e.who.indexOf(key) < 0) continue;
      if (e.allDay) { if (!(e.s <= dayKey && dayKey < e.e)) continue; out.push({ ord: '0', time: 'Todo o dia', title: e.title, past: false, on: false }); }
      else { if (this._day(e.s) !== dayKey) continue; out.push({ ord: '1' + this._hm(e.s), time: this._hm(e.s), title: e.title, past: false, gone: today && e.e <= now, on: today && e.s <= now && e.e > now }); }
    }
    const left = out.filter((r) => !r.gone); left.done = out.length - left.length; return left.sort((a, b) => (a.ord < b.ord ? -1 : a.ord > b.ord ? 1 : 0));
  }
  _render() {
    const c = this._c; if (!c || !this._h) return;
    const now = new Date(), tk = this._day(now), mk = this._day(new Date(now.getTime() + 86400000));
    const sig = [this._v || 0, tk, this._hm(now), this._err ? 1 : 0].join('|'); if (sig === this._sig) return; this._sig = sig;
    const list = (rows, empty) => (rows.length ? rows.map((r) => `<div class="r${r.past ? ' past' : ''}${r.on ? ' on' : ''}"><span class="ic"><ha-icon icon="${icon(r.title)}"></ha-icon></span><span class="tt"><b>${esc(r.title)}</b><span>${r.on ? 'Agora · ' : ''}${esc(r.time)}</span></span>${r.past ? '<ha-icon class="ok" icon="mdi:check"></ha-icon>' : ''}</div>`).join('') : `<div class="free"><ha-icon icon="mdi:emoticon-happy-outline"></ha-icon>${empty}</div>`);
    const cols = c.kids.map((k) => {
      const col = esc(k.color || '#8aadf4');
      const day = (lb, html) => `<div class="day"><span class="lb">${lb}</span><div class="chips">${html}</div></div>`;
      const body = this._ev ? day('Hoje', ((rs) => list(rs, rs.done ? 'Por hoje já está!' : 'Dia livre!'))(this._rows(k, tk, now, true))) + (Number(c.days) === 1 ? '' : day('Amanhã', list(this._rows(k, mk, now, false), 'Nada marcado'))) : day('Hoje', '<div class="free">A carregar…</div>');
      return `<section style="--k:${col}" aria-label="${esc(k.name || k.key)}"><span class="av" title="${esc(k.name || k.key)}">${esc(String(k.name || k.key || '?').charAt(0))}</span><div class="days">${body}</div></section>`;
    }).join('');
    this.shadowRoot.innerHTML = `<style>
:host{display:block}
.g{display:flex;flex-direction:column;gap:12px;container-type:inline-size}
section{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:var(--ha-card-border-radius,12px);background:var(--card-background-color,#24273a);border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,rgba(128,128,128,.2)));box-sizing:border-box;color:var(--primary-text-color);min-width:0}
.av{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--k);color:#181926;font-size:28px;font-weight:800}
.days{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.day{display:flex;align-items:center;gap:10px;min-width:0}
.lb{flex:none;width:66px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--secondary-text-color)}
.chips{flex:1;min-width:0;display:flex;flex-wrap:wrap;gap:8px}
.r{display:inline-flex;align-items:center;gap:8px;min-height:46px;max-width:100%;box-sizing:border-box;padding:4px 14px 4px 6px;border-radius:999px;background:var(--secondary-background-color,#1e2030)}
.r.on{background:var(--k);color:#181926}
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--k) 22%,transparent);color:var(--k)}
.r.on .ic{background:rgba(255,255,255,.4);color:#181926}
.ic ha-icon{--mdc-icon-size:22px}
.tt{min-width:0;display:flex;flex-direction:column;line-height:1.15}
.tt b{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tt span{font-size:13px;font-weight:600;opacity:.75;font-variant-numeric:tabular-nums}
.ok{display:none}
.free{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 14px;border-radius:999px;font-size:15px;font-weight:600;color:var(--secondary-text-color);border:2px dashed color-mix(in srgb,var(--k) 40%,transparent);box-sizing:border-box}
.err{margin:8px 0 0;font-size:14px;color:var(--secondary-text-color)}
@container (max-width:520px){.day{flex-direction:column;align-items:flex-start;gap:4px}.lb{width:auto}}
</style><div class="g">${cols}</div>${this._err ? '<p class="err">Sem ligação à agenda.</p>' : ''}`;
  }
}
if (!customElements.get('casa-kids-agenda-card')) customElements.define('casa-kids-agenda-card', CasaKidsAgendaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-kids-agenda-card', name: 'Casa · Agenda das crianças', description: 'Uma coluna por criança com os eventos dela de hoje e amanhã; só para ver.' });
})();

/* casa-family-card v0.16.4 (janelas de adicionar maiores, lista de sugestões mais alta) (shopping.icon) (shopping.heading: true = título das compras em grande) — estado da família legível à distância; leave = contador até à hora de sair (mostrador de relógio + minutos, cor por urgência) no topo da rotina da manhã; ações com icon/icon_only (placement: header = botão na faixa das tarefas); footer_link; ação add_task = folha "Tarefas para <dia>" (dia, tarefa, descrição, sugestões do histórico, plano do dia); bloco shopping = compras com folha "Lista de compras" (sugestões do histórico; shopping.suggestions = sementes); editar/apagar tarefas e compras nas folhas (lápis), ou manter premido / botão direito / tecla E numa linha do cartão; shopping.history = lista to-do com o histórico partilhado das sugestões; as duas folhas usam as mesmas linhas, botões e disposição; add_task.recurring = tarefas criadas por um automatismo ([{name, weekdays: [mon..sun], time?, entity?}]): aparecem no plano do dia como linhas só de leitura ("recorrente") enquanto o item real não existe; "Ver lista" / "Ver mais (N)" = modo de compras (ecrã inteiro no telemóvel: lista completa, toque marca como comprado, grupo "No carrinho", ecrã sempre ligado) */
const escF = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CHECK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const FM_PLUS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>';
const FM_VARS = ['--card-background-color', '--ha-card-background', '--divider-color', '--primary-text-color', '--secondary-text-color', '--secondary-background-color', '--primary-color', '--error-color'];
const FM_X = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>';
const FM_PEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>';
const FM_SHEET_CSS = `
:host{all:initial;position:fixed;inset:0;z-index:2147483000;display:block;width:auto;height:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.55)}
.sheet{position:fixed;left:8px;right:8px;top:calc(16px + var(--vvt,0px));height:calc(var(--vvh,100vh) - 32px);max-height:calc(var(--vvh,100vh) - 32px);overflow:hidden;display:flex;flex-direction:column;gap:12px;padding:16px;background:var(--ha-card-background,var(--card-background-color,#24273a));color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:20px;font-size:15px;line-height:1.35;outline:none}
@media (min-width:600px){.sheet{height:auto;left:50%;right:auto;top:calc(var(--vvt,0px) + var(--vvh,100vh) / 2);transform:translate(-50%,-50%);width:440px;max-width:calc(100vw - 32px);max-height:calc(var(--vvh,100vh) - 48px);padding:20px}}
@media (min-width:760px){.sheet.wide{width:720px;max-height:min(86vh,calc(var(--vvh,100vh) - 48px))}}
.hd{flex:none;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.hd>div{min-width:0;display:flex;flex-direction:column;gap:2px;padding-top:2px}
h2{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em}
.cap{font-size:13px;color:var(--secondary-text-color);overflow-wrap:anywhere}
.cap.ed{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--primary-text-color)}
.x{flex:none;width:44px;height:44px;margin:-4px -4px 0 0;border-radius:12px;background:var(--secondary-background-color);display:grid;place-items:center}
.fld{flex:none;display:flex;flex-direction:column;gap:6px;min-width:0}
.lb{font-size:13px;font-weight:500;color:var(--secondary-text-color)}
input,textarea{width:100%;min-width:0;min-height:44px;margin:0;padding:0 12px;border:0;border-radius:12px;background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:16px;-webkit-appearance:none;appearance:none;text-align:left}
input:disabled{opacity:.45}
textarea{flex:none;display:block;height:44px;max-height:104px;padding:11px 12px;resize:none;line-height:22px}
.bd{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:12px;margin:-4px;padding:4px}
.col{flex:none;display:flex;flex-direction:column;gap:12px;min-width:0}.ls{flex:none;display:flex;flex-direction:column;gap:6px}.ls>.cb{align-self:flex-start}
@media (min-width:760px){.bd{flex:0 1 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:20px;height:562px;margin:0;padding:0;overflow:visible}.bd>.col{min-height:0;margin:-4px;padding:4px;overflow:auto;overscroll-behavior:contain}.sgl{height:152px}}
/* pouca altura visível (teclado aberto, .kb): folha mais perto das margens e campos mais juntos, para o campo focado, o botão e "Cancelar edição" ficarem à vista */
.kb .col{gap:8px}.kb .fld{gap:4px}
@media (min-width:600px){.sheet:not(.mode){width:560px}.sgl{height:204px}}
@media (min-width:760px){.sheet.wide:not(.mode){width:720px}.bd{height:614px}.bd .sgl{height:204px}}
@media (min-width:960px){.sheet.wide:not(.mode){width:880px}}
@media (max-width:599px){.sheet.kb{top:calc(8px + var(--vvt,0px));height:calc(var(--vvh,100vh) - 16px);max-height:calc(var(--vvh,100vh) - 16px)}}
.lr{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:32px}
.seg{flex:none;display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--secondary-background-color)}
.seg button,.calb{flex:1 1 0;min-width:0;min-height:44px;padding:4px 2px;border-radius:10px;font-size:14px;font-weight:500;text-align:center;line-height:1.15;overflow-wrap:anywhere}
.seg .on{background:var(--primary-text-color);color:var(--ha-card-background,var(--card-background-color,#24273a));font-weight:600}
.calb{flex:0 0 44px;position:relative;display:grid;place-items:center;padding:0}.calb svg{display:block;width:20px;height:20px}.calb input{position:absolute;inset:0;width:100%;height:100%;min-height:0;padding:0;opacity:0;cursor:pointer}.calb:focus-within{outline:2px solid var(--primary-color);outline-offset:2px}
.tr{display:flex;gap:8px}.tr input{flex:1 1 auto}.tr .btn{flex:none;min-width:104px}.tr .btn.two{width:104px;padding:4px 8px;white-space:normal}
.sh{flex:none;display:flex;align-items:center;gap:10px;height:20px;margin-top:4px}.st{flex:none;font-size:13px;font-weight:600;color:var(--secondary-text-color);white-space:nowrap}.ln{flex:1 1 auto;min-width:8px;height:1px;background:var(--divider-color)}.hn{flex:none;font-size:12px;color:var(--secondary-text-color)}
.sgl{flex:none;height:120px;-webkit-mask-image:linear-gradient(#000 calc(100% - 14px),transparent);mask-image:linear-gradient(#000 calc(100% - 14px),transparent);overflow:auto;overscroll-behavior:contain;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px}
.sgn{flex:0 0 100%;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:32px;font-size:13px;color:var(--secondary-text-color)}
.sc{flex:none;max-width:100%;height:32px;padding:0 10px 0 8px;border-radius:12px;background:var(--secondary-background-color);display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;white-space:nowrap;touch-action:manipulation;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}
.sc span{min-width:0;overflow:hidden;text-overflow:ellipsis}.sc svg{flex:none;display:block;width:14px;height:14px}.sc small{flex:none;font-size:12px;color:var(--secondary-text-color)}
.sc.in{opacity:.35}.sc.inl svg{color:var(--ok,#a6da95)}
.cb{flex:none;position:relative;max-width:100%;height:32px;padding:0 12px;border-radius:12px;background:var(--secondary-background-color);color:var(--primary-text-color);display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;white-space:nowrap}.cb::after{content:"";position:absolute;inset:-6px 0}
.cb[aria-pressed="true"]{background:var(--primary-text-color);color:var(--ha-card-background,var(--card-background-color,#24273a));font-weight:600}.cb svg{flex:none;display:block;width:16px;height:16px}.cb[aria-expanded="true"] svg{transform:rotate(180deg)}
.cb.del{color:var(--error-color,#ed8796)}.cb.warn{background:var(--primary-color);color:#181926;font-weight:600}.cb.dng{background:var(--error-color,#ed8796);color:#fff;font-weight:600}.cb.end{margin-left:auto}
.err{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;min-height:32px;margin:-6px 0;font-size:13px;color:var(--error-color,#ed8796);overflow-wrap:anywhere}
.err.ok{color:#a6da95}
.foot{flex:none;display:flex;align-items:center;gap:8px}
.link{flex:none;min-height:44px;margin-right:auto;padding:0 4px;display:inline-flex;align-items:center;font-size:14px;font-weight:500;color:var(--primary-color);white-space:nowrap}
.btn{flex:0 1 128px;min-width:0;min-height:44px;padding:4px 14px;border-radius:12px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;text-align:center;line-height:1.15;white-space:nowrap}
.btn.pri{background:var(--primary-color);color:#181926;font-weight:600}
.qs{flex:none;align-self:flex-start;display:inline-flex;align-items:center;gap:4px}
.qs button{width:44px;height:44px;border-radius:12px;background:var(--secondary-background-color);display:grid;place-items:center;font-size:22px;line-height:1}
.qs .qv{flex:none;width:72px;padding:0 4px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
.qp{flex:none;padding:2px 9px;border-radius:999px;background:var(--ha-card-background,var(--card-background-color,#24273a));color:var(--primary-text-color);font-size:13px;font-weight:600;line-height:18px;font-variant-numeric:tabular-nums}
.it{flex:none;display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:6px 12px;border-radius:12px;background:var(--secondary-background-color);font-size:15px;font-weight:500}
.box{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--todo,#eed49f);display:grid;place-items:center}
.it.done .box{border:0;background:var(--ok,#a6da95);color:#181926}.it.done .box svg{width:16px;height:16px}.it.done>:not(.box){opacity:.35}
.nm{flex:1;min-width:0;line-height:20px;overflow-wrap:anywhere}.ds{font-size:13px;line-height:16px;font-weight:400;color:var(--secondary-text-color);overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.none{flex:none;min-height:32px;padding:0 4px;display:flex;align-items:center;font-size:13px;color:var(--secondary-text-color)}
.it.rec{background:none;box-shadow:inset 0 0 0 1px var(--divider-color,rgba(127,127,127,.3));cursor:default}.it.rec .box{border:0;color:var(--secondary-text-color)}.it.rec .box svg{display:block;width:20px;height:20px}.it.rec .qp{background:var(--secondary-background-color)}
.rw{flex:none;display:flex;gap:6px}.rw .it{flex:1 1 auto;width:auto;min-width:0}
.pe{flex:none;align-self:center;width:48px;height:48px;border-radius:12px;background:var(--secondary-background-color);display:grid;place-items:center;color:var(--secondary-text-color)}.pe svg{display:block;width:18px;height:18px}.pe[aria-pressed="true"]{color:var(--primary-color)}
/* modo de compras (no supermercado): ecrã inteiro em ecrãs estreitos, diálogo centrado nos largos; só a lista, linhas grandes */
.sheet.mode{left:0;right:0;top:var(--vvt,0px);height:var(--vvh,100vh);height:100dvh;max-height:none;border:0;border-radius:0;font-size:16px;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}
@media (min-width:600px){.sheet.mode{left:50%;right:auto;top:calc(var(--vvt,0px) + var(--vvh,100vh) / 2);width:560px;max-width:calc(100vw - 32px);height:auto;max-height:min(86vh,calc(var(--vvh,100vh) - 48px));padding:20px;border:1px solid var(--divider-color);border-radius:20px}}
.mode h2{font-size:22px}.mode .cap{font-size:16px}
.ml{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:8px;margin:-4px;padding:4px}
.it.mi{min-height:56px;padding:8px 14px;gap:14px;font-size:17px;touch-action:manipulation;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}
.mi .box{width:28px;height:28px}.mi.done .box svg{width:18px;height:18px}.mi .nm{line-height:22px}.mi .ds{font-size:16px;line-height:20px}.mi .qp{font-size:16px;line-height:22px;padding:2px 10px}
.cb.mg{align-self:flex-start;height:44px;margin-top:8px;padding:0 14px;font-size:16px}.cb.mg::after{inset:0}.cb.mg svg{width:18px;height:18px}
.me{flex:1 0 auto;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font-size:22px;font-weight:600;text-align:center}
.me i{width:72px;height:72px;border-radius:50%;background:var(--ok,#a6da95);color:#181926;display:grid;place-items:center}.me i svg{width:40px;height:40px}.me.no{font-size:17px;font-weight:500;color:var(--secondary-text-color)}
.mf{flex:none;position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px}
.mf .btn{flex:0 1 auto;min-height:48px;padding:4px 16px;gap:6px;font-size:16px;white-space:normal}.mf .btn svg{flex:none;display:block}.mf [data-x="madd"]{flex:none;white-space:nowrap}
@media (max-width:359px){.mf .btn{padding:4px 12px}.mf .mx{display:none}}.mf .btn[aria-disabled="true"]{opacity:.45;cursor:default}.mf .btn.dng{background:var(--error-color,#ed8796);color:#fff;font-weight:600}
.mm{position:absolute;left:0;right:0;bottom:calc(100% + 8px);padding:12px 14px;border-radius:12px;background:var(--ha-card-background,var(--card-background-color,#24273a));box-shadow:inset 0 0 0 1px var(--error-color,#ed8796);color:var(--error-color,#ed8796);font-size:16px;overflow-wrap:anywhere}
[hidden]{display:none !important}
`;
const FM_WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], FM_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
/* quantidade nas compras: fica no nome do item, "Arroz ×2" (também lê " x2" e "(2)") */
const FM_QW = ['meia', 'meio', 'um', 'uma', 'duzia', 'meia duzia', 'uma duzia', 'duas duzias', 'um pouco', 'alguns', 'algumas', 'pouco', 'pouca'];
const fmQty = (s) => {
  const t = String(s == null ? '' : s).trim(), m = /^(.*?\S)\s*(?:×\s*(\d{1,3})|\s[xX]\s?(\d{1,3})|\((\d{1,3})\))$/.exec(t), q = m ? Number(m[2] || m[3] || m[4]) : 0;
  if (q >= 1) return { name: m[1], q, qt: '' };
  const p = /^(.*?\S)\s*\(([^()]{1,20})\)$/.exec(t), x = p ? p[2].trim() : '';
  return x && (/^\d/.test(x) || FM_QW.indexOf(fmNorm(x)) >= 0) ? { name: p[1], q: 1, qt: x } : { name: t, q: 1, qt: '' };
};
const fmQJoin = (name, q, qt) => name + (qt ? ' (' + qt + ')' : q > 1 ? ' ×' + q : '');
const fmNorm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const fmNm = (t, desc, pill) => `<span class="nm">${escF(t)}${desc ? `<span class="ds">${escF(desc)}</span>` : ''}</span>${pill ? `<span class="qp">${escF(pill)}</span>` : ''}`;
const fmRow = (n, desc) => { const p = fmQty(n); return fmNm(p.name, desc, p.qt || (p.q > 1 ? '×' + p.q : '')); };
/* histórico partilhado das compras: um item por nome; descrição = {"n":vezes,"a":"última vez adicionado","b":"última vez comprado"} (UTC, ao minuto) */
const fmHist = (s) => { let d = null; try { d = JSON.parse(s || '{}'); } catch (e) { /* descrição noutro formato */ } d = d && typeof d === 'object' ? d : {}; return { n: Math.max(1, Number(d.n) || 1), a: typeof d.a === 'string' ? d.a : '', b: typeof d.b === 'string' ? d.b : '' }; };
const fmHistL = (d) => Math.max(Date.parse(d.a + 'Z') || 0, Date.parse(d.b + 'Z') || 0);
const FM_CHEV = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>';
const fmDate = (d) => { const p = String(d).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); };
const fmAdd = (d, k) => { const x = fmDate(d); x.setDate(x.getDate() + k); return fmDay(x); };
/* título base de uma tarefa: "Saltear legumes - gastar os mais antigos" conta como "Saltear legumes" */
const fmBase = (t) => { const m = /^(.{5,}?)(?:\s+[-–—]\s+|:\s+|\s+\()/.exec(String(t || '').trim()); return m ? m[1] : String(t || '').trim(); };
const FM_WDP = ['Aos domingos', 'Às segundas', 'Às terças', 'Às quartas', 'Às quintas', 'Às sextas', 'Aos sábados'], FM_WDU = ['Último domingo', 'Última segunda', 'Última terça', 'Última quarta', 'Última quinta', 'Última sexta', 'Último sábado'];
const FM_REP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>', FM_WDK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
/* add_task.recurring normalizado: { name, k (nome normalizado), wd (0 = domingo), time 'HH:MM' ou '' } */
const fmRec = (l) => (Array.isArray(l) ? l : []).map((r) => { const m = /^(\d{1,2}):(\d\d)/.exec(String((r && r.time) || '')), name = String((r && r.name) || '').trim(); return { name, k: fmNorm(name), wd: [].concat((r && r.weekdays) || []).map((w) => (typeof w === 'number' ? w % 7 : FM_WDK.indexOf(String(w).slice(0, 3).toLowerCase()))).filter((w) => w >= 0), time: m ? m[1].padStart(2, '0') + ':' + m[2] : '' }; }).filter((r) => r.k && r.wd.length);
const FM_CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"/></svg>';
const fmDay = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
/* —— contador até à hora de sair (bloco igual em casa-family-card e casa-familypage-card; alterar nos dois) ——
   leave: { time: '08:50', label: 'escola', warn: 20, hurry: 10, grace: 15, days: ['mon'..'fri'], from: '06:00', text: {ok, warn, hurry, go} }
   mostrador = relógio só com ponteiro dos minutos: a fatia vai do ponteiro (agora) até ao minuto da saída; no máximo 60 min */
const fmLeave = (() => {
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const hm = (t) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t == null ? '' : t).trim()); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : null; };
  const num = (v, d) => (v == null || v === '' || !isFinite(Number(v)) ? d : Number(v));
  const p2 = (n) => String(n).padStart(2, '0');
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2); };
  const state = (cfg, from, now) => {
    if (!cfg || typeof cfg !== 'object') return null;
    const dep = hm(cfg.time); if (dep == null) return null;
    const d = now || new Date(), days = Array.isArray(cfg.days) && cfg.days.length ? cfg.days : DAYS.slice(1, 6);
    if (!days.some((x) => x === d.getDay() || String(x).toLowerCase().slice(0, 3) === DAYS[d.getDay()])) return null;
    const cur = d.getHours() * 60 + d.getMinutes(), start = hm(cfg.from != null ? cfg.from : from) || 0;
    const warn = num(cfg.warn, 20), hurry = Math.min(warn, num(cfg.hurry, 10)), grace = Math.max(0, num(cfg.grace, 15));
    const mins = dep - cur;
    if (cur < start || mins <= -grace || (mins <= 0 && !grace)) return null;
    const tone = mins <= 0 ? 'go' : mins < hurry ? 'hurry' : mins <= warn ? 'warn' : 'ok';
    const left = Math.max(0, mins), sweep = Math.min(left, 60) * 6, a0 = (cur % 60) * 6;
    return { tone, mins: left, a0, a1: (a0 + sweep) % 360, sweep, at: p2(Math.floor(dep / 60)) + ':' + p2(dep % 60), label: cfg.label ? String(cfg.label) : '', text: cfg.text || {} };
  };
  const WORD = { ok: 'Há tempo', warn: 'Está quase', hurry: 'Toca a despachar!', go: 'Hora de sair!' };
  const html = (s) => {
    const R = 40, to = s.label ? ' para a ' + s.label : '';
    const wedge = s.sweep >= 360 ? `<circle class="lvf" cx="50" cy="50" r="${R}"/>` : s.sweep > 0 ? `<path class="lvf" d="M50 50L${pt(s.a0, R)}A${R} ${R} 0 ${s.sweep > 180 ? 1 : 0} 1 ${pt(s.a1, R)}Z"/>` : '';
    let ticks = '';
    for (let i = 0; i < 12; i++) ticks += `<path d="M${pt(i * 30, i % 3 ? 44.5 : 43)}L${pt(i * 30, 47.5)}" stroke-width="${i % 3 ? 1.6 : 3.2}" opacity="${i % 3 ? 0.55 : 0.9}"/>`;
    const hand = (deg, r, w) => `<path d="M50 50L${pt(deg, r)}" stroke="#181926" stroke-width="${w + 2.6}"/><path d="M50 50L${pt(deg, r)}" stroke-width="${w}"/>`;
    const h = Math.floor(s.mins / 60), m = s.mins % 60;
    const big = h ? `${h}<small>h</small>${p2(m)}` : `${s.mins}<small>min</small>`;
    const dur = h ? (h === 1 ? 'Falta 1 hora' : 'Faltam ' + h + ' horas') + (m ? ' e ' + m + (m === 1 ? ' minuto' : ' minutos') : '') : s.mins === 1 ? 'Falta 1 minuto' : 'Faltam ' + s.mins + ' minutos';
    const aria = s.tone === 'go' ? 'Hora de sair' + to + ' (' + s.at + ')' : dur + ' para sair' + to + ' às ' + s.at;
    return `<div class="lv" role="timer" aria-live="off" aria-label="${esc(aria)}" data-tone="${s.tone}" data-mins="${s.mins}" data-a0="${s.a0}" data-a1="${s.a1}" data-sweep="${s.sweep}">
      <svg class="lvd" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" fill="#181926"/>${wedge}<g fill="none" stroke="#fff" stroke-linecap="round">${ticks}<path class="lvg" d="M${pt(s.a1, 38)}L${pt(s.a1, 47.5)}" stroke-width="4"/>${hand(s.a0, 40, 3.6)}</g><circle cx="50" cy="50" r="4.2" fill="#fff"/></svg>
      <div class="lvt"><span class="lvn">${s.tone === 'go' ? esc(s.text.go || 'Sair!') : big}</span><span class="lvs">Saída às ${s.at}</span></div>
    </div>`;
  };
  const css = `
.lv{--lvk:var(--ok,#a6da95);display:flex;align-items:center;gap:14px;height:calc(var(--lvd,104px) + 24px);padding:12px;border-radius:12px;box-sizing:border-box;background:var(--lvk);color:#181926;min-width:0;overflow:hidden}
.lv[data-tone=warn]{--lvk:var(--todo,#eed49f)}.lv[data-tone=hurry],.lv[data-tone=go]{--lvk:var(--late,#ed8796)}
.lvd{flex:none;display:block;width:var(--lvd,104px);height:var(--lvd,104px)}.lvf{fill:var(--lvk)}
.lvt{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}
.lvt span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lvw{font-size:20px;line-height:24px;font-weight:700}
.lvn{font-size:var(--lvn,56px);line-height:1;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em;margin:1px 0 3px}
.lvn small{font-size:.36em;font-weight:600;letter-spacing:0;margin:0 .28em 0 .14em}
.lvs{font-size:15px;line-height:20px;font-weight:600}`;
  /* tique alinhado ao minuto + ao voltar a ficar visível; fn devolve false quando o cartão já não está na página */
  const arm = (o, fn) => {
    if (o._lvT || o._lvV) return;
    const next = () => { o._lvT = setTimeout(() => { o._lvT = 0; if (fn() === false) return stop(o); next(); }, 60000 - (Date.now() % 60000) + 40); };
    o._lvV = () => { if (document.hidden) return; clearTimeout(o._lvT); if (fn() === false) return stop(o); next(); };
    document.addEventListener('visibilitychange', o._lvV); next();
  };
  const stop = (o) => { clearTimeout(o._lvT); o._lvT = 0; if (o._lvV) document.removeEventListener('visibilitychange', o._lvV); o._lvV = null; };
  /* atualiza o bloco no sítio; devolve true se o bloco tem de aparecer/desaparecer (o cartão volta a desenhar) */
  const sync = (root, s) => {
    const el = root.querySelector('.lv');
    if (!el !== !s) return true;
    if (s && (el.dataset.tone !== s.tone || +el.dataset.mins !== s.mins || +el.dataset.a0 !== s.a0)) el.outerHTML = html(s);
    return false;
  };
  return { state, html, css, arm, stop, sync };
})();
window.__casaLeave = fmLeave; /* usado pelo casa-leave-card */
class CasaFamilyCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._sig = ''; this._gest(); }
  setConfig(c) {
    if (!c.children || !c.children.length) throw new Error('Defina "children"');
    this._c = Object.assign({ title: 'Família', tasks: [], actions: [], window_start: '06:00', window_end: '09:30', weekdays: [1, 2, 3, 4, 5], routine_path: '#morning-routine' }, c);
  }
  getCardSize() { return 5; }
  getGridOptions() { return { columns: 'full', rows: 'auto', min_columns: 6 }; }
  set hass(h) {
    this._h = h;
    const c = this._c, ids = c.children.map((k) => k.entity).concat(c.tasks.map((t) => t.entity));
    if (c.shopping && c.shopping.entity) ids.push(c.shopping.entity);
    if (c.shopping && c.shopping.history) ids.push(c.shopping.history);
    const sig = ids.map((i) => (h.states[i] ? h.states[i].state : '-')).join(';') + '|' + this._inWindow();
    if (sig !== this._sig) { this._sig = sig; this._render(); this._load(); }
    if (!this._timer) this._timer = setInterval(() => { if (this._h) this.hass = this._h; }, 60000);
    if (c.leave) fmLeave.arm(this, () => this._lvTick());
  }
  async _load() {
    const h = this._h, day = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    const today = day(Date.now()), out = [], all = [];
    for (const t of this._c.tasks) {
      try {
        const r = await h.callWS({ type: 'todo/item/list', entity_id: t.entity });
        for (const it of (r && r.items) || []) {
          const done = it.status === 'completed';
          all.push({ uid: it.uid, entity: t.entity, desc: it.description || '', dt: String(it.due || '').length > 10, name: it.summary, done, due: it.due ? (String(it.due).length > 10 ? day(it.due) : String(it.due).slice(0, 10)) : '', cday: done && it.completed ? day(it.completed) : '' }); all[all.length - 1].hday = all[all.length - 1].due || all[all.length - 1].cday;
          if (done ? it.completed && day(it.completed) === today : !it.due || String(it.due).slice(0, 10) <= today) out.push({ entity: t.entity, uid: it.uid, name: it.summary, desc: it.description || '', done, at: done ? new Date(it.completed).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', hour12: false }) : '' });
        }
      } catch (e) { /* lista indisponível */ }
    }
    out.sort((a, b) => (a.done - b.done) || a.at.localeCompare(b.at));
    this._items = out; this._all = all;
    if (this._c.payments) {
      const ym = today.slice(0, 7), pays = [];
      try {
        const r = await h.callWS({ type: 'todo/item/list', entity_id: this._c.payments });
        for (const it of (r && r.items) || []) {
          const done = it.status === 'completed', m = /^([A-Z]{1,2})-(.+)$/.exec(it.summary || '');
          if (done ? it.completed && day(it.completed).slice(0, 7) === ym : it.due && String(it.due).slice(0, 7) <= ym) pays.push({ entity: this._c.payments, uid: it.uid, name: m ? m[2] : it.summary, who: m ? m[1] : '', amount: it.description || '', done, late: !done && String(it.due).slice(0, 10) < today });
        }
      } catch (e) { /* lista indisponível */ }
      pays.sort((a, b) => (a.done - b.done) || a.name.localeCompare(b.name));
      const seen = {};
      this._pays = pays.filter((p) => { const k = (p.done ? 'd:' : 'o:') + p.who + p.name; if (p.done && (seen[k] || seen['o:' + p.who + p.name])) return false; seen[k] = true; return true; });
    }
    const sh = this._c.shopping;
    if (sh && sh.entity) {
      try { const r = await h.callWS({ type: 'todo/item/list', entity_id: sh.entity }); this._shop = ((r && r.items) || []).map((it) => ({ uid: it.uid, name: it.summary, done: it.status === 'completed', cat: it.completed || '', desc: it.description || '', ext: !!(it.due || it.description) })); this._shopLearn(); } catch (e) { if (!this._shop) this._shop = []; }
      if (sh.history && !this._hbusy) { try { const r = await h.callWS({ type: 'todo/item/list', entity_id: sh.history }); this._histApply((r && r.items) || []); } catch (e) { console.debug('casa-family-card: histórico não lido', e); } }
    }
    this._render(); this._shopSync(); this._taskSync();
  }
  _lvState() { return this._inWindow() ? fmLeave.state(this._c.leave, this._c.window_start) : null; }
  _lvTick() { if (!this.isConnected) return false; if (this._h && fmLeave.sync(this.shadowRoot, this._lvState())) this._render(); }
  connectedCallback() { if (this._c && this._c.leave && this._h) { fmLeave.arm(this, () => this._lvTick()); this._lvTick(); } }
  disconnectedCallback() { fmLeave.stop(this); clearInterval(this._timer); this._timer = null; clearTimeout(this._again); clearTimeout(this._cpT); this._closeTask(false); }

  /* ---- folhas "Nova tarefa" / "Lista de compras": vivem em document.body (camada de topo quando o browser suporta popover), presas ao topo para o teclado não tapar os campos ---- */
  _quick() {
    const n = new Date(), at = (k) => fmDay(new Date(n.getFullYear(), n.getMonth(), n.getDate() + k, 12));
    return [['Hoje', at(0)], ['Amanhã', at(1)], ['Sábado', at(((6 - n.getDay() + 7) % 7) || 7)], ['Sem data', '']];
  }
  _sheet(label, cap, body, f) {
    this._closeTask(false);
    if (typeof document === 'undefined' || !document.body) return null;
    const h = this._h, c = this._c, ov = document.createElement('div'); ov.setAttribute('data-casa-family-sheet', '');
    const cs = getComputedStyle(this); FM_VARS.forEach((v) => { const val = cs.getPropertyValue(v); if (val) ov.style.setProperty(v, val.trim()); });
    ov.style.setProperty('--ok', c.color_ok || '#a6da95'); ov.style.setProperty('--todo', c.color_todo || '#eed49f');
    const dark = !(h && h.themes && h.themes.darkMode === false);
    const sr = ov.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${FM_SHEET_CSS}</style><div class="scrim" data-x="close"></div><div class="sheet${f.wide ? ' wide' : ''}${f.mode ? ' mode' : ''}" role="dialog" aria-modal="true" aria-label="${escF(label)}" tabindex="-1" style="font-family:${escF(cs.fontFamily || 'inherit')};color-scheme:${dark ? 'dark' : 'light'}">
      <div class="hd"><div><h2>${escF(label)}</h2><div class="cap">${escF(cap)}</div></div><button type="button" class="x" data-x="close" aria-label="Fechar" title="Fechar">${FM_X}</button></div>${body}
    </div>`;
    this._f = f; this._ov = ov; this._sr = sr;
    sr.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const sh = sr.querySelector('.sheet'), fo = [...sh.querySelectorAll('button,input,textarea')].filter((x) => !x.disabled && x.getClientRects().length), act = sr.activeElement;
        if (!fo.length) e.preventDefault();
        else if (e.shiftKey && (act === fo[0] || act === sh || !act)) { e.preventDefault(); fo[fo.length - 1].focus(); }
        else if (!e.shiftKey && (act === fo[fo.length - 1] || !act)) { e.preventDefault(); fo[0].focus(); }
      }
      if (e.key !== 'Escape') e.stopPropagation();
    });
    sr.addEventListener('focusin', () => this._vv());
    this._onKey = (e) => { if (e.key === 'Escape' && this._ov) { e.stopPropagation(); e.preventDefault(); const f = this._f; if (f && f.darm) { f.darm = false; f.shop ? this._shopSync() : this._taskSync(); } else if (f && f.edit) { f.shop ? this._shopEdit(null) : this._taskEdit(null); } else this._closeTask(); } };
    sr.addEventListener('focusout', (e) => { const f = this._f; if (f && f.darm && e.target && e.target.dataset && e.target.dataset.x === 'del') { f.darm = false; f.shop ? this._shopSync() : this._taskSync(); } });
    this._onVV = () => this._vv();
    document.body.appendChild(ov);
    if (typeof ov.showPopover === 'function') { try { ov.setAttribute('popover', 'manual'); ov.showPopover(); } catch (err) { ov.removeAttribute('popover'); } }
    window.addEventListener('keydown', this._onKey, true);
    window.addEventListener('resize', this._onVV);
    const vv = window.visualViewport; if (vv) { vv.addEventListener('resize', this._onVV); vv.addEventListener('scroll', this._onVV); }
    this._vv();
    return sr;
  }
  /* altura visível (teclado do telemóvel): a folha nunca passa da área visível e o campo focado fica à vista */
  _vv() {
    const vv = window.visualViewport, ov = this._ov; if (!ov) return;
    if (vv) { ov.style.setProperty('--vvh', Math.round(vv.height) + 'px'); ov.style.setProperty('--vvt', Math.round(vv.offsetTop) + 'px'); }
    const sh = this._sr && this._sr.querySelector('.sheet'); if (sh) sh.classList.toggle('kb', (vv ? vv.height : window.innerHeight) < 480);
    if (this._sr) this._reveal(this._sr.activeElement);
  }
  _reveal(el) { if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.type !== 'date' && el.scrollIntoView) { try { el.scrollIntoView({ block: 'center' }); } catch (e) { /* sem suporte */ } } }
  /* dias do seletor (hoje, amanhã e os dois dias seguintes em que costuma haver tarefas) e dia por omissão (o próximo dia habitual, a partir de amanhã) */
  _days() {
    const t = this._quick()[0][1], H = [...new Set((this._all || []).filter((x) => x.hday && x.hday <= t).map((x) => x.hday))], cnt = [0, 0, 0, 0, 0, 0, 0];
    H.forEach((d) => { cnt[fmDate(d).getDay()]++; });
    const share = (d) => (H.length >= 20 ? cnt[fmDate(d).getDay()] / H.length : 1), days = [t, fmAdd(t, 1)];
    for (let k = 2; days.length < 4 && k < 15; k++) if (share(fmAdd(t, k)) >= 0.05) days.push(fmAdd(t, k));
    let def = days[1]; for (let k = 1; k < 8; k++) if (share(fmAdd(t, k)) >= 0.1) { def = fmAdd(t, k); break; }
    return { days, def };
  }
  /* sugestões a partir do histórico: com = comuns (frequência com peso para as mais recentes), wd = comuns nesse dia da semana, last = lista da última vez nesse dia da semana */
  _sugg(kind, d) {
    const t = this._quick()[0][1], H = (this._all || []).filter((x) => x.hday && x.hday <= t), wd = d ? fmDate(d).getDay() : -1, f = this._f || {};
    const descOf = (title) => { const k = fmNorm(title), o = H.filter((x) => x.desc && fmNorm(x.name) === k).sort((a, b) => (a.hday < b.hday ? -1 : 1)).pop(); return o ? o.desc : ''; };
    if (kind === 'last') {
      const ds = [...new Set(H.filter((x) => fmDate(x.hday).getDay() === wd && x.hday < d).map((x) => x.hday))].sort(), ld = ds[ds.length - 1] || '', seen = {};
      return { day: ld, list: H.filter((x) => x.hday === ld && !seen[fmNorm(x.name)] && (seen[fmNorm(x.name)] = 1)).map((x) => ({ title: x.name, desc: x.desc })) };
    }
    const g = {}, now = fmDate(t).getTime();
    H.forEach((x) => { if (kind === 'wd' && fmDate(x.hday).getDay() !== wd) return; const b = fmBase(x.name), k = fmNorm(b), o = g[k] || (g[k] = { n: 0, s: 0, sp: {} }); o.n++; o.s += Math.pow(0.5, (now - fmDate(x.hday).getTime()) / 864e5 / 60); o.sp[b] = (o.sp[b] || 0) + 1; });
    const list = Object.keys(g).filter((k) => g[k].n >= 2).sort((a, b) => (g[b].s + g[b].n * 0.1) - (g[a].s + g[a].n * 0.1)).slice(0, 12).map((k) => { const title = Object.keys(g[k].sp).sort((a, b) => g[k].sp[b] - g[k].sp[a])[0]; return { title, desc: descOf(title), n: g[k].n }; });
    if (kind === 'com') (f.sugg || []).forEach((s2) => { if (s2 && !list.some((x) => fmNorm(x.title) === fmNorm(s2))) list.push({ title: String(s2), desc: '' }); });
    return { day: '', list };
  }
  _openTask(a, idx, ed, sel) {
    const t = a.add_task || {}; if (!t.entity) return;
    const dd = this._days(), q = this._quick(), st = this._h && this._h.states[t.entity];
    const dl = (d, i) => (i < 2 ? q[i][0] : (FM_WD[fmDate(d).getDay()] + ' ' + Number(d.slice(8))).replace(/^./, (c) => c.toUpperCase()));
    const sr = this._sheet('Tarefas', '', `<div class="bd"><div class="col">
      <div class="fld"><label class="lb" for="fm-t">Tarefa</label><div class="tr"><input id="fm-t" type="text" maxlength="120" autocomplete="off" enterkeyhint="send" required><button type="button" class="btn pri" data-x="save" disabled>Adicionar</button></div></div>
      <div class="fld"><div class="lr"><span class="lb">Para quando</span><button type="button" class="cb" data-x="nodate" aria-pressed="false">Sem data</button></div>
        <div class="seg" role="group" aria-label="Dia">${dd.days.map((d, i) => `<button type="button" data-x="day" data-d="${d}" aria-pressed="false">${dl(d, i)}</button>`).join('')}<div class="calb" title="Outro dia">${FM_CAL}<input id="fm-d" type="date" min="${q[0][1]}" aria-label="Outro dia"></div></div></div>
      <div class="fld"><label class="lb" for="fm-n">Descrição (opcional)</label><textarea id="fm-n" rows="1" maxlength="500"></textarea></div>
      <div class="err" role="alert"></div>
      <div class="sh"><span class="st">Sugestões</span><i class="ln"></i><span class="hn">toque adiciona · manter premido edita</span></div>
      <div class="seg" role="group" aria-label="Sugestões"><button type="button" data-x="tab" data-k="com">Comuns</button><button type="button" data-x="tab" data-k="wd"></button><button type="button" data-x="tab" data-k="last"></button></div>
      <div class="sgl"></div>
    </div><div class="col"><div class="sh"><span class="st pt">Plano do dia</span><i class="ln"></i></div><div class="ls"></div></div></div>`,
    { entity: t.entity, list: t.list_name || (st && st.attributes.friendly_name) || '', sugg: t.suggestions || [], days: dd.days, sel: sel || '[data-act="' + idx + '"]', wide: true, saving: false, err: '', ok: '', undo: '', edit: null, back: '', date: ed ? (ed.due >= q[0][1] ? ed.due : q[0][1]) : dd.def, tab: 'com', made: [], arm: false, cur: [], rec: fmRec(t.recurring) });
    if (!sr) return;
    sr.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'fm-d' && e.target.showPicker) { try { e.target.showPicker(); } catch (err) { /* sem seletor nativo */ } }
      const el = (e.composedPath ? e.composedPath() : [e.target]).find((x) => x && x.dataset && x.dataset.x), f = this._f; if (!el || el.disabled || !f) return;
      const x = el.dataset.x;
      if (f.darm && x !== 'del') f.darm = false;
      if (x === 'close') { if (!(this._lpHold && el.classList.contains('scrim'))) this._closeTask(); }
      else if (x === 'tog') this._planToggle(f.plan[el.dataset.i]);
      else if (x === 'grp') { f.grp = !f.grp; this._taskSync(); }
      else if (x === 'edit') this._taskEdit(f.plan[el.dataset.i]);
      else if (x === 'cancel') this._taskEdit(null);
      else if (x === 'del') this._del();
      else if (x === 'redo') this._redo();
      else if (x === 'day') this._setDate(el.dataset.d);
      else if (x === 'nodate') this._setDate('');
      else if (x === 'tab') { f.tab = el.dataset.k; f.arm = false; this._taskSync(); }
      else if (x === 'save') this._taskSave();
      else if (x === 'sug') { if (f.lp) { f.lp = false; return; } const s2 = f.cur[el.dataset.i]; if (s2 && (!el.classList.contains('in') || this._recHit(s2.title, f.date))) this._taskAdd(s2.title, s2.desc); }
      else if (x === 'all') this._taskAll();
      else if (x === 'undo') this._taskUndo(el.dataset.u);
    });
    /* manter premida uma sugestão = passa para o formulário, para editar antes de adicionar */
    sr.addEventListener('pointerdown', (e) => { const el = (e.composedPath ? e.composedPath() : [e.target]).find((x) => x && x.dataset && x.dataset.x === 'sug'), f = this._f; clearTimeout(this._lpT); if (!el || !f || f.edit) return; f.lp = false;
      this._lpT = setTimeout(() => { const s2 = f.cur[el.dataset.i]; if (this._f !== f || !s2) return; f.lp = true; const ti = sr.querySelector('#fm-t'), ta = sr.querySelector('#fm-n'); ti.value = s2.title; ta.value = s2.desc || ''; this._grow(ta); f.err = ''; f.ok = ''; this._taskSync(); ti.focus({ preventScroll: true }); }, 550); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => sr.addEventListener(n, () => clearTimeout(this._lpT)));
    sr.addEventListener('contextmenu', (e) => { if ((e.composedPath ? e.composedPath() : []).some((x) => x && x.dataset && x.dataset.x === 'sug')) e.preventDefault(); });
    sr.addEventListener('input', (e) => { const f = this._f; if (!f || (e.target && e.target.id === 'fm-d')) return; if (e.target && e.target.id === 'fm-n') this._grow(e.target); f.err = ''; f.ok = ''; f.undo = ''; this._taskSync(); });
    sr.addEventListener('change', (e) => { if (this._f && e.target && e.target.id === 'fm-d') this._setDate(e.target.value); });
    sr.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.id === 'fm-t') { e.preventDefault(); this._taskSave(); } });
    this._taskSync();
    sr.querySelector('.sheet').focus({ preventScroll: true });
    if (ed) this._taskEdit(ed);
  }
  _grow(ta) { ta.style.height = '44px'; ta.style.height = Math.min(104, Math.max(44, ta.scrollHeight)) + 'px'; }
  _closeTask(refocus) {
    clearTimeout(this._armT); clearTimeout(this._undoT); clearTimeout(this._lpT);
    if (!this._ov) return;
    const ov = this._ov, f = this._f; this._ov = null; this._sr = null; this._f = null;
    if (f && f.mode) this._modeOff(f);
    window.removeEventListener('keydown', this._onKey, true);
    window.removeEventListener('resize', this._onVV);
    const vv = window.visualViewport; if (vv && this._onVV) { vv.removeEventListener('resize', this._onVV); vv.removeEventListener('scroll', this._onVV); }
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    if (refocus !== false && f && f.sel) { const b = this.shadowRoot.querySelector(f.sel); if (b) b.focus({ preventScroll: true }); }
  }
  /* tarefas já existentes no dia escolhido (hoje = o mesmo critério do cartão: sem data ou em atraso contam para hoje) */
  _dayTasks(d) {
    const t = this._quick()[0][1];
    /* tarefas sem data por concluir aparecem em todos os dias, depois das tarefas com data, marcadas "sem data" */
    return (this._all || []).filter((x) => (!x.done && !x.due) || (d && (d === t ? (x.done ? x.cday === t : x.due <= t) : x.due === d)))
      .map((x) => (!x.done && !x.due ? Object.assign({}, x, { tag: 'sem data' }) : d === t && !x.done && x.due < t ? Object.assign({}, x, { tag: 'em atraso' }) : x))
      .sort((a, b) => (a.done ? 2 : a.due ? 0 : 1) - (b.done ? 2 : b.due ? 0 : 1));
  }
  /* tarefas recorrentes (criadas por um automatismo) ainda por criar no dia d: o dia da semana coincide, não há item real com o mesmo nome nesse dia (por fazer ou concluído) e, se for hoje, a hora ainda não passou */
  _recs(d) {
    const f = this._f, rs = (f && f.rec) || []; if (!d || !rs.length) return [];
    const wd = fmDate(d).getDay(), t = this._quick()[0][1], n = new Date(), hm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'), seen = {};
    return rs.filter((r) => { if (r.wd.indexOf(wd) < 0 || seen[r.k] || (d === t && r.time && hm >= r.time)) return false; seen[r.k] = 1;
      return !(this._all || []).some((x) => (x.due === d || (d === t && x.done && x.cday === t)) && fmNorm(x.name) === r.k); });
  }
  _recHit(title, d) { const k = fmNorm(title); return this._recs(d).find((r) => r.k === k) || null; }
  _recNote(d) { return 'Já é criada automaticamente ' + FM_WDP[fmDate(d).getDay()].toLowerCase(); }
  /* ---- compras: bloco no cartão + folha "Lista de compras" ---- */
  _shopItems() { const p = this._pend || {}; return (this._shop || []).map((x) => (x.uid in p ? Object.assign({}, x, { done: p[x.uid], pend: true }) : x)); }
  _shopToggle(uid) {
    const h = this._h, s = this._c.shopping, it = this._shopItems().find((x) => x.uid === uid); if (!it || it.pend || !h) return;
    const to = !it.done; this._pend = this._pend || {}; this._pend[uid] = to; this._shopErr = ''; if (this._f) this._f.err = ''; this._render(); this._shopSync();
    Promise.resolve().then(() => h.callService('todo', 'update_item', { item: uid, status: to ? 'completed' : 'needs_action' }, { entity_id: s.entity })).then(() => {
      const o = (this._shop || []).find((x) => x.uid === uid); if (o) o.done = to; delete this._pend[uid]; if (o && to) this._histRec(o.name, 'b'); this._load();
    }, (err) => { delete this._pend[uid]; this._shopErr = 'Não foi possível atualizar: ' + ((err && err.message) || String(err || 'erro')); this._render(); this._shopSync(); });
  }
  _openShop(trig, add, ed, sel) {
    const s = this._c.shopping; if (!s || !s.entity) return;
    const sr = this._sheet('Lista de compras', '', `<div class="bd"><div class="col"><div class="fld"><label class="lb" for="sh-t">Item</label><div class="tr"><input id="sh-t" type="text" maxlength="120" autocomplete="off" enterkeyhint="send"><button type="button" class="btn pri" data-x="add" disabled>Adicionar</button></div></div>
      <div class="fld"><span class="lb">Quantidade</span><div class="qs" role="group" aria-label="Quantidade"><button type="button" data-x="qm" aria-label="Menos um">−</button><input id="sh-q" class="qv" type="text" inputmode="text" maxlength="20" autocomplete="off" enterkeyhint="send" value="1" aria-label="Quantidade"><button type="button" data-x="qp" aria-label="Mais um">+</button></div></div>
      <div class="err" role="alert"></div>
      <div class="sh"><span class="st">Sugestões</span><i class="ln"></i><span class="hn">toque adiciona</span></div>
      <div class="seg" role="group" aria-label="Sugestões"><button type="button" data-x="tab" data-k="freq">Frequentes</button><button type="button" data-x="tab" data-k="rec">Recentes</button></div>
      <div class="sgl"></div>
    </div><div class="col"><div class="sh"><span class="st pt">Por comprar</span><i class="ln"></i></div><div class="ls"></div></div></div>`,
    { shop: true, sel: sel || '[data-shop="' + trig + '"]', wide: true, tab: 'freq', undo: null, edit: null, saving: false, err: '', grp: false, arm: false, clearing: false, all: trig === 'more', qty: '1', ok: '' });
    if (!sr) return;
    this._shopErr = '';
    sr.addEventListener('click', (e) => {
      const el = (e.composedPath ? e.composedPath() : [e.target]).find((x) => x && x.dataset && x.dataset.x); if (!el || el.disabled) return;
      const x = el.dataset.x, f = this._f;
      if (f.darm && x !== 'del') f.darm = false;
      if (x === 'close') { if (!(this._lpHold && el.classList.contains('scrim'))) this._closeTask(); }
      else if (x === 'add') this._shopAdd();
      else if (x === 'sug') { const s2 = (f.cur || []).find((y) => y.k === el.dataset.k); if (s2) this._shopAdd(s2.title); }
      else if (x === 'tab') { f.tab = el.dataset.k; this._shopSync(); }
      else if (x === 'edit') { const it = (this._srows || [])[el.dataset.i]; if (it) this._shopEdit(it.uid); }
      else if (x === 'cancel') this._shopEdit(null);
      else if (x === 'undo') this._shopUndo();
      else if (x === 'del') this._del();
      else if (x === 'redo') this._redo();
      else if (x === 'tog') { const it = (this._srows || [])[el.dataset.i]; if (it) this._shopToggle(it.uid); }
      else if (x === 'all') { f.all = !f.all; this._shopSync(); }
      else if (x === 'qm' || x === 'qp') { const m = /^(\d{1,3})(\D.*)?$/.exec(String(f.qty).trim() || '1'); if (m) { f.qty = Math.min(999, Math.max(1, Number(m[1]) + (x === 'qp' ? 1 : -1))) + (m[2] || ''); sr.querySelector('#sh-q').value = f.qty; this._shopSync(); } }
      else if (x === 'grp') { f.grp = !f.grp; f.arm = false; this._shopSync(); }
      else if (x === 'clear') this._shopClear();
    });
    sr.addEventListener('input', (e) => { if (this._f) { if (e.target && e.target.id === 'sh-q') this._f.qty = e.target.value; this._f.err = ''; this._f.ok = ''; this._f.undo = null; this._shopErr = ''; this._shopSync(); } });
    sr.addEventListener('focusin', (e) => { if (e.target && e.target.id === 'sh-q' && e.target.select) e.target.select(); });
    sr.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && (e.target.id === 'sh-t' || e.target.id === 'sh-q')) { e.preventDefault(); this._shopAdd(); } });
    this._shopSync();
    sr.querySelector(add ? '#sh-t' : '.sheet').focus({ preventScroll: true });
    if (ed != null) this._shopEdit(ed);
  }
  _shopSync() {
    const f = this._f, sr = this._sr; if (f && f.mode) { this._modeSync(); return; } if (!f || !f.shop || !sr) return;
    const all = this._shopItems(), open = all.filter((x) => !x.done), done = all.filter((x) => x.done), max = Math.max(1, Number(this._c.shopping.max) || 5), ti = sr.querySelector('#sh-t');
    if (f.edit && !open.some((x) => x.uid === f.edit.uid)) { f.edit = null; f.darm = false; ti.value = ''; f.qty = '1'; sr.querySelector('#sh-q').value = '1'; }
    if (f.edit && open.findIndex((x) => x.uid === f.edit.uid) >= max) f.all = true;
    const shown = open;
    const act = sr.activeElement, ax = act && act.dataset ? act.dataset.x : '', fu = ax === 'tog' || ax === 'edit' ? (this._srows || [])[act.dataset.i] : null, keep = ax === 'grp' || ax === 'clear' || ax === 'all';
    this._srows = shown.concat(done);
    const row = (it, i) => this._rowH(i, fmRow(it.name, it.desc), it.name, it.done, f.edit && f.edit.uid === it.uid);
    this._cap(this._c.shopping.name || 'Compras'); sr.querySelector('.pt').textContent = 'Por comprar' + (open.length ? ' · ' + open.length : '');
    sr.querySelector('.ls').innerHTML = (open.length ? shown.map(row).join('') : `<div class="none">${done.length ? 'Tudo comprado' : 'Nada para comprar'}</div>`)
      + (done.length ? `<button type="button" class="cb" data-x="grp" aria-expanded="${f.grp}">Comprados (${done.length})<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg></button>`
        + (f.grp ? done.map((it, i) => row(it, shown.length + i)).join('') + `<button type="button" class="cb${f.arm ? ' dng' : ''}" data-x="clear"${f.clearing ? ' disabled' : ''}>${f.clearing ? 'A limpar…' : f.arm ? 'Toque outra vez para limpar' : 'Limpar comprados'}</button>` : '') : '');
    const back = fu ? sr.querySelector('[data-x="' + ax + '"][data-i="' + this._srows.findIndex((x) => x.uid === fu.uid) + '"]') : keep ? (sr.querySelector('[data-x="' + ax + '"]') || sr.querySelector('[data-x="grp"]')) : null;
    if (back) back.focus({ preventScroll: true }); else if (fu || keep) sr.querySelector('.sheet').focus({ preventScroll: true });
    this._msg(f.err || this._shopErr || '', f.ok, f.undo ? '<button type="button" class="cb" data-x="undo">Anular</button>' : '');
    /* sugestões: enquanto se escreve, filtram pelo texto (sem acentos); itens já por comprar aparecem esbatidos com visto */
    const q = f.edit ? '' : fmNorm(fmQty(ti.value).name), sg = this._shopSugg(f.tab, q), onl = {}, sgl = sr.querySelector('.sgl'); open.forEach((x) => { onl[fmNorm(fmQty(x.name).name)] = 1; }); f.cur = sg;
    const sh = sg.length ? sg.map((x) => `<button type="button" class="sc${onl[x.k] ? ' inl' : ''}" data-x="sug" data-k="${escF(x.k)}" title="${escF(x.title)}${onl[x.k] ? ' — já na lista; toque soma 1' : ''}"${onl[x.k] ? ` aria-label="${escF(x.title)}, já na lista: mais um"` : ''}>${onl[x.k] ? CHECK : FM_PLUS}<span>${escF(x.title)}</span></button>`).join('') : `<div class="none">${q ? 'Sem sugestões para «' + escF(ti.value.trim()) + '»' : 'Ainda sem histórico de compras'}</div>`;
    if (sh !== f.sh) { f.sh = sh; sgl.innerHTML = sh; if (ax === 'sug') { const b = [...sgl.querySelectorAll('.sc')].find((y) => y.dataset.k === act.dataset.k); (b || sr.querySelector('.sheet')).focus({ preventScroll: true }); } }
    sgl.querySelectorAll('button').forEach((b) => { b.disabled = f.saving || !!f.edit; });
    sr.querySelectorAll('[data-x="tab"]').forEach((b) => { const on = b.dataset.k === f.tab; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.disabled = !!f.edit; });
    const qm = /^(\d{1,3})(\D.*)?$/.exec(String(f.qty).trim() || '1'); sr.querySelector('[data-x="qm"]').disabled = !qm || Number(qm[1]) <= 1; sr.querySelector('[data-x="qp"]').disabled = !qm || Number(qm[1]) >= 999;
    const b = sr.querySelector('[data-x="add"]'); b.disabled = f.saving || !ti.value.trim(); b.textContent = f.saving ? (f.edit ? 'A guardar…' : 'A adicionar…') : f.edit ? 'Guardar' : 'Adicionar';
  }
  /* ---- modo de compras: a lista completa em linhas grandes; toque = comprado (o mesmo _shopToggle do cartão). Uma linha tocada fica onde está
     até 1,5 s depois do último toque (e nunca muda com o dedo no ecrã); só então passa para "No carrinho" (ou volta à lista) ---- */
  _openMode() {
    const s = this._c.shopping; if (!s || !s.entity) return;
    const sr = this._sheet(s.name || 'Compras', '', `<div class="ml"></div><div class="mf"><div class="mm" role="alert" hidden></div><button type="button" class="btn" data-x="madd" aria-label="${escF(s.add_label || 'Adicionar item')}">${FM_PLUS}<span>${s.add_label ? escF(s.add_label) : 'Adicionar<span class="mx"> item</span>'}</span></button><button type="button" class="btn" data-x="clear" hidden></button></div>`,
      { mode: true, sel: '[data-shop="more"]', place: {}, hot: false, down: false, dirty: false, col: false, arm: false, clearing: false, err: '' });
    if (!sr) return;
    const f = this._f; this._shopErr = '';
    sr.addEventListener('click', (e) => {
      const el = (e.composedPath ? e.composedPath() : [e.target]).find((x) => x && x.dataset && x.dataset.x); if (!el || el.disabled || this._f !== f) return;
      const x = el.dataset.x;
      if (x !== 'clear' && f.arm) { f.arm = false; clearTimeout(this._armT); }
      if (x === 'close') this._closeTask();
      else if (x === 'mt') { f.err = ''; f.hot = true; clearTimeout(f.hotT); f.hotT = setTimeout(() => { f.hot = false; if (this._f === f) this._modeSync(); }, 1500); this._shopToggle(el.dataset.u); this._modeSync(); }
      else if (x === 'mg') { f.col = !f.col; this._modeSync(); }
      else if (x === 'madd') this._openShop('add', true);
      else if (x === 'clear') this._shopClear();
    });
    f.pd = () => { f.down = true; };
    f.pu = () => { if (!f.down) return; f.down = false; setTimeout(() => { if (this._f === f && f.dirty) this._modeSync(); }, 0); };
    sr.addEventListener('pointerdown', f.pd);
    window.addEventListener('pointerup', f.pu, true); window.addEventListener('pointercancel', f.pu, true);
    /* ecrã sempre ligado enquanto a vista está aberta (se o browser deixar); falhas ignoradas */
    f.wake = () => {
      if (this._f !== f || f.wl || f.wlp || document.visibilityState !== 'visible') return;
      try {
        const w = navigator.wakeLock; if (!w || typeof w.request !== 'function') return;
        f.wlp = true;
        Promise.resolve(w.request('screen')).then((l) => {
          f.wlp = false; if (!l) return;
          if (this._f !== f) { try { Promise.resolve(l.release()).catch(() => {}); } catch (e) { /* já libertado */ } return; }
          f.wl = l; if (l.addEventListener) l.addEventListener('release', () => { if (f.wl === l) f.wl = null; });
        }, () => { f.wlp = false; });
      } catch (e) { f.wlp = false; }
    };
    document.addEventListener('visibilitychange', f.wake); f.wake();
    this._modeSync();
    sr.querySelector('.sheet').focus({ preventScroll: true });
  }
  _modeOff(f) {
    clearTimeout(f.hotT); clearTimeout(f.msgT);
    window.removeEventListener('pointerup', f.pu, true); window.removeEventListener('pointercancel', f.pu, true);
    document.removeEventListener('visibilitychange', f.wake);
    const l = f.wl; f.wl = null; if (l) { try { Promise.resolve(l.release()).catch(() => {}); } catch (e) { /* já libertado */ } }
  }
  _modeSync() {
    const f = this._f, sr = this._sr; if (!f || !f.mode || !sr) return;
    if (f.down) { f.dirty = true; return; }
    f.dirty = false;
    const all = this._shopItems(), pl = f.place, seen = {};
    all.forEach((x) => { seen[x.uid] = 1; if (!f.hot || !(x.uid in pl)) pl[x.uid] = x.done ? 'c' : 'o'; });
    Object.keys(pl).forEach((k) => { if (!seen[k]) delete pl[k]; });
    const open = all.filter((x) => pl[x.uid] === 'o'), cart = all.filter((x) => pl[x.uid] === 'c'), n = all.filter((x) => !x.done).length, nd = all.length - n;
    const row = (it) => `<button type="button" class="it mi${it.done ? ' done' : ''}" data-x="mt" data-u="${escF(it.uid)}" aria-pressed="${it.done}"><span class="box">${it.done ? CHECK : ''}</span>${fmRow(it.name, it.desc)}</button>`;
    const html = (open.length ? open.map(row).join('') : this._shop ? (all.length ? `<div class="me"><i>${CHECK}</i><span>Tudo comprado</span></div>` : '<div class="me no"><span>Nada para comprar</span></div>') : '<div class="me no"><span>A carregar…</span></div>')
      + (cart.length ? `<button type="button" class="cb mg" data-x="mg" aria-expanded="${!f.col}">No carrinho (${cart.length})${FM_CHEV}</button>` + (f.col ? '' : cart.map(row).join('')) : '');
    sr.querySelector('.cap').textContent = n + ' por comprar';
    const ml = sr.querySelector('.ml'), sheet = sr.querySelector('.sheet'), act = sr.activeElement, ax = act && act.dataset ? act.dataset.x : '', au = ax === 'mt' ? act.dataset.u : '';
    if (html !== f.lh) {
      const top = ml.scrollTop; f.lh = html; ml.innerHTML = html; ml.scrollTop = top;
      if (ax === 'mt' || ax === 'mg') { const b = ax === 'mg' ? ml.querySelector('[data-x="mg"]') : [...ml.querySelectorAll('[data-x="mt"]')].find((y) => y.dataset.u === au); (b || sheet).focus({ preventScroll: true }); }
    }
    const cl = sr.querySelector('[data-x="clear"]'), lost = ax === 'clear' && !nd;
    cl.hidden = !nd; cl.setAttribute('aria-disabled', f.clearing ? 'true' : 'false'); cl.classList.toggle('dng', !!f.arm && !f.clearing);
    cl.textContent = f.clearing ? 'A limpar…' : f.arm ? 'Toque outra vez para limpar' : 'Limpar comprados';
    if (lost) sheet.focus({ preventScroll: true });
    const em = f.err || this._shopErr || '', mm = sr.querySelector('.mm');
    if (em !== f.em) { f.em = em; mm.textContent = em; mm.hidden = !em; clearTimeout(f.msgT); if (em) f.msgT = setTimeout(() => { if (this._f !== f) return; f.err = ''; this._shopErr = ''; this._modeSync(); }, 6000); }
  }
  /* memória das compras (neste browser): nomes vistos na lista, quantas vezes e quando; sobrevive a "Limpar comprados" */
  _shopMem() {
    if (!this._mem) { let m = null; try { m = JSON.parse(localStorage.getItem('casa-family-card:shop:' + this._c.shopping.entity)); } catch (e) { /* sem armazenamento */ } this._mem = m && m.n && Array.isArray(m.u) ? m : { n: {}, u: [] }; }
    return this._mem;
  }
  _memSave() { try { localStorage.setItem('casa-family-card:shop:' + this._c.shopping.entity, JSON.stringify(this._mem)); } catch (e) { /* sem armazenamento */ } }
  /* histórico: 'a' = adicionado (conta), 'b' = comprado, 'u' = anulado (desconta; se era novo, sai). Atualiza já a memória local e, com shopping.history, grava na lista partilhada em fila, relendo-a antes; falhas ficam só em console.debug */
  _histRec(name, kind, fresh) {
    const t = fmQty(name).name, k = fmNorm(t), m = this._shopMem(), now = Date.now(), ent = this._c.shopping.history; let o = m.n[k]; if (!k) return;
    if (kind === 'u') { if (o) { if (fresh || o.c < 2) delete m.n[k]; else o.c--; } }
    else if (kind === 'a') { o = o || (m.n[k] = { c: 0, l: 0, sp: {} }); o.c++; o.sp[t] = (o.sp[t] || 0) + 1; o.l = now; }
    else if (o) o.l = now;
    this._memSave(); if (ent && this._h) this._histQ(() => this._histWrite(k, t, kind, fresh));
  }
  _histQ(fn) { this._hbusy = (this._hbusy || 0) + 1; this._hq = (this._hq || Promise.resolve()).then(fn).catch((e) => { console.debug('casa-family-card: histórico não gravado', e); }).then(() => { this._hbusy--; }); }
  async _histWrite(k, t, kind, fresh) {
    const s = this._c.shopping, h = this._h, tg = { entity_id: s.history }, max = Math.max(1, Number(s.history_max) || 300);
    const r = await h.callWS({ type: 'todo/item/list', entity_id: s.history }), items = (r && r.items) || [], it = items.find((x) => fmNorm(fmQty(x.summary).name) === k), d = it ? fmHist(it.description) : { n: 0, a: '', b: '' };
    if (kind === 'u') { if (!it) return; if (fresh || d.n < 2) { await h.callService('todo', 'remove_item', { item: it.uid }, tg); return; } d.n--; }
    else { if (kind === 'a' || !it) d.n = Math.min(9999, d.n + 1); d[kind] = new Date().toISOString().slice(0, 16); }
    const desc = JSON.stringify({ n: d.n, a: d.a, b: d.b });
    if (it) { await h.callService('todo', 'update_item', { item: it.uid, description: desc }, tg); return; }
    await h.callService('todo', 'add_item', { item: t, description: desc }, tg);
    /* limite de nomes: saem os usados há mais tempo (só nesta lista de histórico) */
    const old = items.map((x) => ({ uid: x.uid, l: fmHistL(fmHist(x.description)) })).sort((a, b) => a.l - b.l).slice(0, Math.min(10, Math.max(0, items.length + 1 - max)));
    for (const x of old) await h.callService('todo', 'remove_item', { item: x.uid }, tg);
  }
  /* leitura da lista partilhada: passa a ser a fonte das sugestões (a memória local fica como cópia para o primeiro desenho); nomes repetidos são fundidos; lista vazia + memória local = migração, uma vez */
  _histApply(items) {
    const n = {}, m = this._shopMem(), s = this._c.shopping, tg = { entity_id: s.history }, h = this._h, key = 'casa-family-card:shop-mig:' + s.entity;
    items.forEach((it) => { const t = fmQty(it.summary).name, k = fmNorm(t), d = fmHist(it.description), l = fmHistL(d); if (!k) return;
      if (!n[k]) { n[k] = { c: d.n, l, sp: { [t]: 1 }, uid: it.uid, d }; return; }
      n[k].c = Math.max(n[k].c, d.n); n[k].l = Math.max(n[k].l, l); this._hdup = this._hdup || {};
      if (!this._hdup[it.uid]) { this._hdup[it.uid] = 1; const keep = n[k].uid, d0 = n[k].d; this._histQ(async () => {
        const m2 = { n: Math.min(9999, Math.max(d0.n, d.n)), a: d0.a > d.a ? d0.a : d.a, b: d0.b > d.b ? d0.b : d.b }; if (m2.n !== d0.n || m2.a !== d0.a || m2.b !== d0.b) { await h.callService('todo', 'update_item', { item: keep, description: JSON.stringify(m2) }, tg); n[k].d = m2; }
        await h.callService('todo', 'remove_item', { item: it.uid }, tg); }); } });
    const ks = Object.keys(m.n);
    if (!items.length && ks.length) {
      let was = ''; try { was = localStorage.getItem(key) || ''; } catch (e) { /* sem armazenamento */ }
      if (was !== s.history && !this._migd) {
        this._migd = true;
        const list = ks.sort((a, b) => m.n[b].l - m.n[a].l).slice(0, Math.max(1, Number(s.history_max) || 300)).map((k) => ({ item: Object.keys(m.n[k].sp || {}).sort((a, b) => m.n[k].sp[b] - m.n[k].sp[a])[0] || k, description: JSON.stringify({ n: Math.max(1, m.n[k].c || 1), a: m.n[k].l ? new Date(m.n[k].l).toISOString().slice(0, 16) : '', b: '' }) }));
        this._histQ(async () => { const r = await h.callWS({ type: 'todo/item/list', entity_id: s.history }); if (r && r.items && r.items.length) return; /* outro dispositivo migrou entretanto */
          for (const x of list) await h.callService('todo', 'add_item', x, tg); try { localStorage.setItem(key, s.history); } catch (e) { /* sem armazenamento */ } });
        return;
      }
    }
    Object.keys(n).forEach((k) => { delete n[k].uid; delete n[k].d; }); this._mem = { n, u: [] }; this._memSave();
  }
  _shopLearn() {
    if (this._c.shopping.history) return;
    const m = this._shopMem(), now = Date.now(); let ch = false;
    (this._shop || []).forEach((it) => {
      const b = fmQty(it.name).name, k = fmNorm(b), id = it.uid + '|' + k, ts = it.done && it.cat ? Date.parse(it.cat) || 0 : 0; if (!k) return;
      if (m.u.indexOf(id) < 0) { const o = m.n[k] || (m.n[k] = { c: 0, l: 0, sp: {} }); m.u.push(id); o.c++; o.sp[b] = (o.sp[b] || 0) + 1; o.l = Math.max(o.l, ts || now); ch = true; }
      else if (m.n[k] && ts > m.n[k].l) { m.n[k].l = ts; ch = true; }
    });
    if (!ch) return;
    if (m.u.length > 600) m.u = m.u.slice(-600);
    const ks = Object.keys(m.n); if (ks.length > 300) ks.sort((a, b) => m.n[a].l - m.n[b].l).slice(0, ks.length - 300).forEach((k) => { delete m.n[k]; });
    this._memSave();
  }
  /* sugestões de compras: freq = frequência com peso para as mais recentes, rec = últimas primeiro; q = texto escrito (prefixo primeiro, depois contém) */
  _shopSugg(tab, q) {
    const n = this._shopMem().n, now = Date.now();
    const list = Object.keys(n).map((k) => { const o = n[k]; return { k, title: Object.keys(o.sp).sort((a, b) => o.sp[b] - o.sp[a])[0] || k, l: o.l, s: o.c * (0.5 + 0.5 * Math.pow(0.5, Math.max(0, now - o.l) / 864e5 / 45)) }; })
      .sort((a, b) => (tab === 'rec' ? b.l - a.l || b.s - a.s : b.s - a.s || b.l - a.l) || a.k.localeCompare(b.k));
    (this._c.shopping.suggestions || []).forEach((s) => { const t = fmQty(s).name, k = fmNorm(t); if (k && !list.some((x) => x.k === k)) list.push({ k, title: t, l: 0, s: 0 }); });
    return (q ? list.filter((x) => x.k.indexOf(q) >= 0).sort((a, b) => (a.k.indexOf(q) ? 1 : 0) - (b.k.indexOf(q) ? 1 : 0)) : list).slice(0, 40);
  }
  /* "Anular" do último acrescento: remove o item criado nesta folha, ou repõe o nome anterior se só mudou a quantidade */
  _shopUndo() {
    const f = this._f, h = this._h, u = f && f.undo, ent = this._c.shopping.entity; if (!u || f.saving || !h) return;
    f.saving = true; f.undo = null; f.err = ''; f.ok = ''; clearTimeout(this._undoT); this._shopSync(); this._sr.querySelector('.sheet').focus({ preventScroll: true });
    Promise.resolve().then(() => (u.prev != null ? h.callService('todo', 'update_item', { item: u.uid, rename: u.prev }, { entity_id: ent }) : h.callService('todo', 'remove_item', { item: u.uid }, { entity_id: ent }))).then(() => {
      const o = (this._shop || []).find((x) => x.uid === u.uid), m = this._shopMem(), k = o ? fmNorm(fmQty(o.name).name) : '';
      if (u.prev != null) { if (o) o.name = u.prev; if (this._c.shopping.history) this._histRec(u.prev, 'u'); } else { this._shop = (this._shop || []).filter((x) => x.uid !== u.uid); if (k) this._histRec(k, 'u', u.fresh); }
      this._render(); return this._load();
    }).then(() => { f.saving = false; f.ok = 'Anulado'; if (this._f === f) this._shopSync(); }, (err) => { f.saving = false; if (this._f !== f) return; f.err = 'Não foi possível anular: ' + ((err && err.message) || String(err || 'erro')); this._shopSync(); });
  }
  /* edição de um item por comprar no formulário do topo (uid; null ou o mesmo = sair da edição) */
  _shopEdit(uid, msg) {
    const f = this._f, sr = this._sr; if (!f || !f.shop || f.saving) return;
    const ti = sr.querySelector('#sh-t'), qi = sr.querySelector('#sh-q'), was = f.edit, it = uid != null && !(was && was.uid === uid) ? this._shopItems().find((x) => x.uid === uid && !x.done && !x.pend) : null, p = it ? fmQty(it.name) : null;
    f.edit = it ? { uid: it.uid, name: it.name, ext: it.ext } : null;
    ti.value = p ? p.name : ''; f.qty = p ? p.qt || String(p.q) : '1'; qi.value = f.qty;
    f.err = ''; f.ok = msg || ''; f.undo = null; f.darm = false; this._shopErr = ''; this._shopSync();
    if (f.edit) { ti.focus({ preventScroll: true }); return; }
    const i = was ? (this._srows || []).findIndex((x) => x.uid === was.uid && !x.done) : -1;
    (sr.querySelector('.pe[data-i="' + i + '"]') || sr.querySelector('.sheet')).focus({ preventScroll: true });
  }
  _shopSave() {
    const f = this._f, sr = this._sr, h = this._h, e = f.edit, ent = this._c.shopping.entity, p = fmQty(sr.querySelector('#sh-t').value.trim().slice(0, 120)); if (!p.name || f.saving || !h) return;
    const qs = String(f.qty || '').trim().slice(0, 20), num = /^\d{1,3}$/.test(qs) || !qs, nq = p.qt || p.q > 1 ? p : { q: num ? Math.max(1, Number(qs) || 1) : 1, qt: num ? '' : qs }, nm = fmQJoin(p.name, nq.q, nq.qt);
    const dup = this._shopItems().find((x) => !x.done && x.uid !== e.uid && fmNorm(fmQty(x.name).name) === fmNorm(p.name));
    if (nm === e.name) { this._shopEdit(null, 'Sem alterações'); return; }
    if (nm.length > 120) { f.err = 'Nome demasiado longo (máximo 120 caracteres)'; this._shopSync(); return; }
    if (dup) { f.err = 'Já existe «' + fmQty(dup.name).name + '» na lista. Nada foi alterado.'; this._shopSync(); return; }
    f.saving = true; f.err = ''; f.ok = ''; f.darm = false; this._shopSync();
    Promise.resolve().then(() => h.callService('todo', 'update_item', { item: e.uid, rename: nm }, { entity_id: ent })).then(() => { const o = (this._shop || []).find((x) => x.uid === e.uid); if (o) o.name = nm; this._render(); return this._load(); }).then(() => {
      f.saving = false; if (this._f === f) this._shopEdit(null, 'Alterações guardadas');
      clearTimeout(this._again); this._again = setTimeout(() => this._load(), 1500);
    }, (err) => { f.saving = false; if (this._f !== f) return; f.err = 'Não foi possível guardar: ' + ((err && err.message) || String(err || 'erro')); this._shopSync(); });
  }
  _shopAdd(sug) {
    const f = this._f, sr = this._sr, h = this._h; if (!f || !f.shop || f.saving || !h) return;
    if (f.edit) { if (sug == null) this._shopSave(); return; }
    const ti = sr.querySelector('#sh-t'), qi = sr.querySelector('#sh-q'), p = fmQty(String(sug != null ? sug : ti.value).trim().slice(0, 120)); if (!p.name) return;
    const fresh = !this._shopMem().n[fmNorm(p.name)], before = {}; this._shopItems().forEach((x) => { before[x.uid] = '=' + x.name; });
    /* quantidade: a que vier escrita no nome ganha; senão o campo (número = "×N", texto = "(500 g)") */
    const qs = String(f.qty || '').trim().slice(0, 20), num = /^\d{1,3}$/.test(qs) || !qs, nq = p.qt || p.q > 1 ? p : { q: num ? Math.max(1, Number(qs) || 1) : 1, qt: num ? '' : qs };
    const ent = this._c.shopping.entity, ex = this._shopItems().find((x) => !x.done && !x.pend && fmNorm(fmQty(x.name).name) === fmNorm(p.name)), eq = ex ? fmQty(ex.name) : null;
    /* item já na lista (por comprar): números somam; se algum for texto, fica a quantidade nova; sem quantidade nova, fica como está */
    const nm = !ex ? fmQJoin(p.name, nq.q, nq.qt) : !eq.qt && !nq.qt ? fmQJoin(eq.name, Math.min(999, eq.q + nq.q), '') : nq.qt || nq.q > 1 ? fmQJoin(eq.name, nq.q, nq.qt) : sug != null && /^\d{1,3}(?![\d.,])/.test(eq.qt) ? fmQJoin(eq.name, 1, eq.qt.replace(/^\d{1,3}/, (n) => Math.min(999, Number(n) + 1))) : ex.name;
    const done = (msg, undo) => { f.saving = false; f.qty = '1'; f.ok = msg; f.undo = undo || null; clearTimeout(this._undoT); if (undo) this._undoT = setTimeout(() => { if (this._f === f && f.undo === undo) { f.undo = null; f.ok = ''; this._shopSync(); } }, 5000);
      if (this._f === f) { ti.value = ''; qi.value = '1'; this._shopSync(); if (sug == null) ti.focus({ preventScroll: true }); } };
    if (ex && nm === ex.name) { done('Já está na lista: ' + ex.name); return; }
    f.saving = true; f.err = ''; f.ok = ''; this._shopErr = ''; this._shopSync();
    Promise.resolve().then(() => (ex ? h.callService('todo', 'update_item', { item: ex.uid, rename: nm }, { entity_id: ent }) : h.callService('todo', 'add_item', { item: nm }, { entity_id: ent }))).then(() => {
      if (ex) { const o = (this._shop || []).find((x) => x.uid === ex.uid); if (o) o.name = nm; this._render(); }
      return this._load();
    }).then(() => {
      const nw = ex ? null : (this._shop || []).filter((x) => !before[x.uid] && !x.done && x.name === nm).pop();
      if (this._c.shopping.history) this._histRec(nm, 'a');
      done(ex ? 'Quantidade atualizada: ' + nm : 'Adicionado: ' + nm, ex ? { uid: ex.uid, prev: before[ex.uid].slice(1) } : nw ? { uid: nw.uid, fresh } : null);
      clearTimeout(this._again); this._again = setTimeout(() => this._load(), 1500);
    }, (err) => { f.saving = false; if (this._f !== f) return; f.err = 'Não foi possível adicionar: ' + ((err && err.message) || String(err || 'erro')); this._shopSync(); });
  }
  _shopClear() {
    const f = this._f, h = this._h; if (!f || !(f.shop || f.mode) || f.clearing || !h) return;
    if (!f.arm) { f.arm = true; this._shopSync(); clearTimeout(this._armT); this._armT = setTimeout(() => { if (this._f === f) { f.arm = false; this._shopSync(); } }, 5000); return; }
    clearTimeout(this._armT); f.arm = false; f.clearing = true; f.err = ''; this._shopSync();
    Promise.resolve().then(() => h.callService('todo', 'remove_completed_items', {}, { entity_id: this._c.shopping.entity })).then(() => {
      f.clearing = false; f.grp = false; this._shop = (this._shop || []).filter((x) => !x.done); this._render(); this._shopSync(); this._load();
    }, (err) => { f.clearing = false; if (this._f !== f) return; f.err = 'Não foi possível limpar: ' + ((err && err.message) || String(err || 'erro')); this._shopSync(); });
  }
  _setDate(d) { const f = this._f; if (!f || f.saving) return; const t = this._quick()[0][1]; f.date = /^\d{4}-\d\d-\d\d$/.test(d || '') ? (d < t ? t : d) : ''; f.err = ''; f.ok = ''; f.undo = ''; f.arm = false; this._taskSync(); }
  _dlabel(d, plain) {
    if (!d) return 'Sem data';
    const q = this._quick(), p = d.split('-').map(Number), x = new Date(p[0], p[1] - 1, p[2], 12);
    const s = FM_WD[x.getDay()] + ', ' + p[2] + ' ' + FM_MES[p[1] - 1] + (p[0] !== new Date().getFullYear() ? ' ' + p[0] : '');
    return plain ? s : d === q[0][1] ? 'Hoje · ' + s : d === q[1][1] ? 'Amanhã · ' + s : s;
  }
  _taskSync() {
    const f = this._f, sr = this._sr; if (!f || f.shop || f.mode || !sr) return;
    const d = f.date, q = this._quick(), wd = d ? fmDate(d).getDay() : -1, ti = sr.querySelector('#fm-t');
    sr.querySelector('h2').textContent = d ? 'Tarefas para ' + (d === q[0][1] ? 'hoje' : d === q[1][1] ? 'amanhã' : this._dlabel(d, true)) : 'Tarefas sem data';
    this._cap([d && (d === q[0][1] || d === q[1][1]) ? this._dlabel(d, true) : '', f.list].filter(Boolean).join(' · '));
    sr.querySelectorAll('[data-x="day"]').forEach((b) => { const on = b.dataset.d === d; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.disabled = f.saving; });
    const cb = sr.querySelector('.calb'), di = sr.querySelector('#fm-d'); cb.classList.toggle('on', !!d && f.days.indexOf(d) < 0); if (di.value !== d) di.value = d;
    sr.querySelector('[data-x="nodate"]').setAttribute('aria-pressed', d ? 'false' : 'true');
    const sv = sr.querySelector('[data-x="save"]'); sv.disabled = f.saving || !ti.value.trim(); sv.textContent = f.saving ? (f.edit ? 'A guardar…' : 'A adicionar…') : f.edit ? 'Guardar alterações' : 'Adicionar'; sv.classList.toggle('two', !!f.edit);
    this._msg(f.err, f.ok, f.undo ? `<button type="button" class="cb" data-x="undo" data-u="${escF(f.undo)}">Anular</button>` : '');
    /* plano do dia */
    const dt = this._dayTasks(d), plan = {}, pa = sr.activeElement, px = pa && pa.dataset ? pa.dataset.x : '', pu = px === 'tog' || px === 'edit' ? (f.plan || [])[pa.dataset.i] : null, po = dt.filter((x) => !x.done), pd = dt.filter((x) => x.done); f.plan = po.concat(pd); dt.forEach((x) => { if (!x.done) { plan[fmNorm(x.name)] = 1; plan[fmNorm(fmBase(x.name))] = 1; } });
    const rc = this._recs(d), nd = po.filter((x) => x.due).length, rk = {}; rc.forEach((r) => { rk[r.k] = 1; });
    const prow = (x, i) => this._rowH(i, fmNm(x.name, x.desc, x.tag), x.name, x.done, f.edit && f.edit.uid === x.uid && f.edit.entity === x.entity);
    const pr = po.map(prow); pr.splice(nd, 0, ...rc.map((r) => `<div class="it rec"><span class="box">${FM_REP}</span>${fmNm(r.name, r.time ? 'Criada automaticamente às ' + r.time : 'Criada automaticamente nesse dia', 'recorrente')}</div>`));
    const dh = (pr.length ? pr.join('') : `<div class="none">${pd.length ? 'Tudo feito' : d ? 'Ainda sem tarefas neste dia' : 'Sem tarefas sem data'}</div>`)
      + (pd.length ? `<button type="button" class="cb" data-x="grp" aria-expanded="${!!f.grp}">Concluídas (${pd.length})${FM_CHEV}</button>` + (f.grp ? pd.map((x, i) => prow(x, po.length + i)).join('') : '') : '');
    sr.querySelector('.pt').textContent = (d ? 'Plano de ' + (d === q[0][1] ? 'hoje' : d === q[1][1] ? 'amanhã' : this._dlabel(d, true)) : 'Sem data') + (pr.length ? ' · ' + pr.length : '');
    if (dh !== f.dh) { f.dh = dh; sr.querySelector('.ls').innerHTML = dh;
      if (pu || px === 'grp') { const i = pu ? f.plan.findIndex((y) => y.uid === pu.uid && y.entity === pu.entity) : -1; (sr.querySelector(pu ? '[data-x="' + px + '"][data-i="' + i + '"]' : '[data-x="grp"]') || sr.querySelector('[data-x="tog"][data-i="' + i + '"]') || sr.querySelector('.sheet')).focus({ preventScroll: true }); } }
    /* sugestões */
    if (!d && f.tab !== 'com') f.tab = 'com';
    sr.querySelectorAll('[data-x="tab"]').forEach((b) => { const k = b.dataset.k, on = k === f.tab; if (k === 'wd') b.textContent = d ? FM_WDP[wd] : 'Por dia'; if (k === 'last') b.textContent = d ? FM_WDU[wd] : 'Última vez'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.disabled = !!f.edit || (!d && k !== 'com'); });
    const sg = this._sugg(f.tab, d), inP = (x) => !!(plan[fmNorm(x.title)] || rk[fmNorm(x.title)]), miss = sg.list.filter((x) => !inP(x)); f.cur = sg.list;
    const chips = sg.list.map((x, i) => { const inp = inP(x); return `<button type="button" class="sc${inp ? ' in' : ''}" data-x="sug" data-i="${i}"${inp ? ' aria-disabled="true"' : ''} title="${escF(x.title + (x.desc ? ' — ' + x.desc : ''))}">${inp ? CHECK : FM_PLUS}<span>${escF(x.title)}</span>${x.desc ? '<small>+ nota</small>' : ''}</button>`; }).join('');
    const sh = f.tab === 'last'
      ? (sg.day ? `<div class="sgn"><span>${escF(this._dlabel(sg.day, true))} · ${sg.list.length} ${sg.list.length === 1 ? 'tarefa' : 'tarefas'}</span>${miss.length ? `<button type="button" class="cb${f.arm ? ' warn' : ''}" data-x="all">${f.arm ? 'Toque outra vez: adicionar ' + miss.length : 'Repetir tudo (' + miss.length + ')'}</button>` : '<span>Já está tudo no plano</span>'}</div>` + chips : '<div class="none">Sem histórico para este dia da semana</div>')
      : (chips || '<div class="none">Ainda sem histórico suficiente</div>');
    if (sh !== f.sh) { f.sh = sh; sr.querySelector('.sgl').innerHTML = sh; }
    sr.querySelectorAll('.sgl button').forEach((b) => { b.disabled = f.saving || !!f.edit; });
  }
  /* legenda do cabeçalho: em edição mostra "A editar: <nome>" e "Cancelar edição" (mesma altura) */
  _cap(text) {
    const f = this._f, cap = this._sr.querySelector('.cap'), ch = f.edit ? '\n' + f.edit.name : text; if (ch === f.ch) return;
    f.ch = ch; cap.classList.toggle('ed', !!f.edit);
    cap.textContent = f.edit ? 'A editar: ' + f.edit.name : text;
  }
  /* linha de mensagens: em edição começa por "Apagar" (dois toques); confirmações podem trazer "Anular" */
  _msg(em, ok, undo) {
    const f = this._f, er = this._sr.querySelector('.err'), cb = (x, t, c) => `<button type="button" class="cb${c}" data-x="${x}">${t}</button>`;
    const msg = (f.edit ? cb('del', 'Apagar', ' del') : '') + escF(em || ok || '') + (!em && ok ? undo + (f.redo && f.redo.msg === ok ? cb('redo', 'Anular', '') : '') : '') + (f.edit ? cb('cancel', 'Cancelar edição', ' end') : '');
    if (msg !== f.mh) { f.mh = msg; er.innerHTML = msg; } er.classList.toggle('ok', !em && !!ok);
    const del = er.querySelector('.del'); if (del) { del.textContent = f.darm ? 'Toque outra vez para apagar' : 'Apagar'; del.classList.toggle('dng', !!f.darm); del.disabled = f.saving; }
  }
  /* linha comum às duas folhas: mosaico com círculo (alterna feito/por fazer) e, nas linhas por fazer, lápis ao lado */
  _rowH(i, inner, name, done, on) {
    return done ? `<button type="button" class="it done" data-x="tog" data-i="${i}" aria-pressed="true"><span class="box">${CHECK}</span>${inner}</button>`
      : `<div class="rw"><button type="button" class="it" data-x="tog" data-i="${i}" aria-pressed="false"><span class="box"></span>${inner}</button><button type="button" class="pe" data-x="edit" data-i="${i}" aria-label="Editar ${escF(name)}" title="Editar" aria-pressed="${!!on}">${FM_PEN}</button></div>`;
  }
  /* concluir / reabrir uma tarefa no plano: otimista, na lista de origem; em caso de erro volta atrás */
  _planToggle(x) {
    const f = this._f, h = this._h, o = x ? (this._all || []).find((y) => y.uid === x.uid && y.entity === x.entity) : null; if (!o || !f || f.saving || o.pend || !h) return;
    const to = !o.done, was = o.cday; o.done = to; o.cday = to ? this._quick()[0][1] : ''; o.pend = true; f.err = ''; f.ok = '';
    if (f.edit && f.edit.uid === o.uid && f.edit.entity === o.entity) this._taskEdit(null); else this._taskSync();
    Promise.resolve().then(() => h.callService('todo', 'update_item', { item: o.uid, status: to ? 'completed' : 'needs_action' }, { entity_id: o.entity })).then(() => this._load(),
      (err) => { o.done = !to; o.cday = was; o.pend = false; if (this._f !== f) return; f.err = 'Não foi possível atualizar: ' + ((err && err.message) || String(err || 'erro')); this._taskSync(); });
  }
  /* apagar o item em edição (tarefa ou compra): dois toques em 5 s; "Anular" volta a criar o item (uid novo) quando o nome, a data e a descrição chegam para o repor igual */
  _del() {
    const f = this._f, h = this._h, e = f && f.edit; if (!e || f.saving || !h) return;
    const sync = () => { if (this._f === f) (f.shop ? this._shopSync() : this._taskSync()); };
    if (!f.darm) { f.darm = true; sync(); clearTimeout(this._delT); this._delT = setTimeout(() => { if (f.darm) { f.darm = false; sync(); } }, 5000); return; }
    clearTimeout(this._delT); f.darm = false; f.saving = true; f.err = ''; f.ok = ''; sync();
    const ent = f.shop ? this._c.shopping.entity : e.entity, msg = (f.shop ? 'Apagado: ' : 'Apagada: ') + e.name;
    Promise.resolve().then(() => h.callService('todo', 'remove_item', { item: e.uid }, { entity_id: ent })).then(() => { if (f.shop) { this._shop = (this._shop || []).filter((x) => x.uid !== e.uid); this._render(); } return this._load(); }).then(() => {
      f.saving = false; if (this._f !== f) return;
      const r = f.redo = e.ext || e.dt ? null : { ent, msg, data: Object.assign({ item: e.name }, e.due ? { due_date: e.due } : {}, e.desc ? { description: e.desc } : {}) };
      if (f.shop) this._shopEdit(null, msg); else this._taskEdit(null, msg);
      clearTimeout(this._undoT); this._undoT = setTimeout(() => { if (r && f.redo === r) { f.redo = null; sync(); } }, 5000);
    }, (err) => { f.saving = false; f.err = 'Não foi possível apagar: ' + ((err && err.message) || String(err || 'erro')); sync(); });
  }
  _redo() {
    const f = this._f, h = this._h, r = f && f.redo; if (!r || f.saving || !h) return;
    const sync = () => { if (this._f === f) (f.shop ? this._shopSync() : this._taskSync()); };
    f.redo = null; f.saving = true; f.err = ''; f.ok = ''; sync(); this._sr.querySelector('.sheet').focus({ preventScroll: true });
    Promise.resolve().then(() => h.callService('todo', 'add_item', r.data, { entity_id: r.ent })).then(() => this._load()).then(() => { f.saving = false; f.ok = (f.shop ? 'Reposto: ' : 'Reposta: ') + r.data.item; sync(); },
      (err) => { f.saving = false; f.err = 'Não foi possível repor: ' + ((err && err.message) || String(err || 'erro')); sync(); });
  }
  /* edição de uma tarefa existente no formulário (x = linha do plano; null ou a mesma = sair da edição) */
  _taskEdit(x, msg) {
    const f = this._f, sr = this._sr; if (!f || f.shop || f.saving) return;
    const ti = sr.querySelector('#fm-t'), ta = sr.querySelector('#fm-n'), was = f.edit;
    if (was) f.date = f.back;
    f.edit = x && !x.done && !(was && was.uid === x.uid && was.entity === x.entity) ? { uid: x.uid, entity: x.entity, name: x.name, desc: x.desc || '', due: x.due || '', dt: x.dt } : null;
    if (f.edit) { f.back = f.date; f.date = f.edit.due; }
    ti.value = f.edit ? f.edit.name : ''; ta.value = f.edit ? f.edit.desc : ''; this._grow(ta);
    f.err = ''; f.ok = msg || ''; f.undo = ''; f.arm = false; f.darm = false; this._taskSync();
    if (f.edit) { ti.focus({ preventScroll: true }); return; }
    const i = was ? (f.plan || []).findIndex((y) => y.uid === was.uid && y.entity === was.entity) : -1;
    (sr.querySelector('.pe[data-i="' + i + '"]') || sr.querySelector('.sheet')).focus({ preventScroll: true });
  }
  /* guarda só os campos alterados, na lista de origem da tarefa; data ou descrição vazias = null (limpar) */
  _taskUpdate() {
    const f = this._f, sr = this._sr, h = this._h, e = f && f.edit; if (!e || f.saving || !h) return;
    const title = sr.querySelector('#fm-t').value.trim().slice(0, 120), desc = sr.querySelector('#fm-n').value.trim().slice(0, 500), data = { item: e.uid }, date = f.date; if (!title) return;
    if (title !== e.name) data.rename = title;
    if (desc !== e.desc.trim()) data.description = desc || null;
    if (date !== e.due) data.due_date = date || null;
    if (Object.keys(data).length < 2) { this._taskEdit(null, 'Sem alterações'); return; }
    f.saving = true; f.err = ''; f.ok = ''; f.darm = false; this._taskSync();
    Promise.resolve().then(() => h.callService('todo', 'update_item', data, { entity_id: e.entity })).then(() => this._load()).then(() => {
      f.saving = false; if (this._f !== f) return;
      this._taskEdit(null, 'Alterações guardadas' + ('due_date' in data ? (date ? ' · agora em ' + this._dlabel(date, true) : ' · agora sem data') : ''));
      clearTimeout(this._again); this._again = setTimeout(() => this._load(), 1500);
    }, (err) => { f.saving = false; f.err = 'Não foi possível guardar: ' + ((err && err.message) || String(err || 'erro')); if (this._f === f) this._taskSync(); });
  }
  /* cria uma tarefa no dia escolhido; devolve true/false. Guarda o uid criado para permitir "Anular" (só itens criados nesta folha) */
  _taskAdd(title, desc, quiet) {
    const f = this._f, h = this._h; title = String(title || '').trim().slice(0, 120); desc = String(desc || '').trim().slice(0, 500);
    if (!f || f.saving || !h || !title) return Promise.resolve(false);
    /* tarefa recorrente desse dia: o automatismo cria-a; não se duplica (o texto fica no campo, para o alterar) */
    if (this._recHit(title, f.date)) { f.err = ''; f.ok = this._recNote(f.date); f.undo = ''; this._taskSync(); return Promise.resolve(false); }
    const data = { item: title }, ent = f.entity, date = f.date, before = {}; if (date) data.due_date = date; if (desc) data.description = desc;
    (this._all || []).forEach((x) => { before[x.uid] = 1; });
    f.saving = true; f.err = ''; f.ok = ''; f.undo = ''; this._taskSync();
    return Promise.resolve().then(() => h.callService('todo', 'add_item', data, { entity_id: ent })).then(() => this._load()).then(() => {
      const nw = (this._all || []).filter((x) => !before[x.uid] && x.entity === ent && x.name === title).pop();
      f.saving = false; if (nw) f.made.push(nw.uid);
      if (!quiet) { f.ok = 'Adicionada' + (date ? ' a ' + this._dlabel(date, true) : ' sem data') + ': ' + title; f.undo = nw ? nw.uid : ''; clearTimeout(this._undoT); this._undoT = setTimeout(() => { if (this._f === f && f.undo) { f.undo = ''; this._taskSync(); } }, 5000); }
      if (this._f === f) this._taskSync();
      clearTimeout(this._again); this._again = setTimeout(() => this._load(), 1500);
      return true;
    }, (err) => { f.saving = false; f.err = 'Não foi possível adicionar: ' + ((err && err.message) || String(err || 'erro')); if (this._f === f) this._taskSync(); return false; });
  }
  _taskSave() {
    const f = this._f, sr = this._sr; if (!f || f.shop || f.saving) return;
    const ti = sr.querySelector('#fm-t'), ta = sr.querySelector('#fm-n'); if (!ti.value.trim()) return;
    if (f.edit) { this._taskUpdate(); return; }
    this._taskAdd(ti.value, ta.value).then((ok) => { if (ok && this._f === f) { ti.value = ''; ta.value = ''; this._grow(ta); this._taskSync(); ti.focus({ preventScroll: true }); } });
  }
  /* "Repetir tudo": dois toques; adiciona, uma a uma, as tarefas da última vez que ainda não estão no plano */
  _taskAll() {
    const f = this._f; if (!f || f.saving) return;
    if (!f.arm) { f.arm = true; this._taskSync(); clearTimeout(this._armT); this._armT = setTimeout(() => { if (this._f === f) { f.arm = false; this._taskSync(); } }, 5000); return; }
    clearTimeout(this._armT); f.arm = false;
    const plan = {}; this._dayTasks(f.date).forEach((x) => { if (!x.done) plan[fmNorm(x.name)] = 1; }); this._recs(f.date).forEach((r) => { plan[r.k] = 1; });
    const todo = this._sugg('last', f.date).list.filter((x) => !plan[fmNorm(x.title)]), date = f.date; let n = 0;
    todo.reduce((p, x) => p.then((ok) => (ok === false || this._f !== f ? false : this._taskAdd(x.title, x.desc, true).then((r) => { if (r) n++; return r; }))), Promise.resolve(true)).then(() => {
      if (this._f !== f) return; if (!f.err) f.ok = n + (n === 1 ? ' tarefa adicionada' : ' tarefas adicionadas') + (date ? ' a ' + this._dlabel(date, true) : ''); this._taskSync();
    });
  }
  _taskUndo(uid) {
    const f = this._f, h = this._h; if (!f || f.saving || !h || f.made.indexOf(uid) < 0) return;
    f.saving = true; f.err = ''; f.ok = ''; f.undo = ''; this._taskSync();
    Promise.resolve().then(() => h.callService('todo', 'remove_item', { item: uid }, { entity_id: f.entity })).then(() => { f.made.splice(f.made.indexOf(uid), 1); return this._load(); }).then(() => { f.saving = false; f.ok = 'Tarefa anulada'; if (this._f === f) this._taskSync(); },
      (err) => { f.saving = false; f.err = 'Não foi possível anular: ' + ((err && err.message) || String(err || 'erro')); if (this._f === f) this._taskSync(); });
  }
  /* editar a partir do cartão, sem ícones nas linhas: manter premido (550 ms), botão direito ou tecla E numa tarefa / item de compras por fazer */
  _gest() {
    const sr = this.shadowRoot, row = (e) => { const el = (e.composedPath ? e.composedPath() : [e.target]).find((x) => x && x.dataset && (x.dataset.it != null || x.dataset.sh != null)); return el ? { it: el.dataset.it, sh: el.dataset.sh } : null; };
    sr.addEventListener('pointerdown', (e) => { clearTimeout(this._cpT); const r = row(e); if (!r || e.button > 0) return; this._cpXY = [e.clientX, e.clientY];
      this._cpT = setTimeout(() => { if (!this._cardEdit(r)) return; this._lpHold = true; const off = () => { window.removeEventListener('pointerup', off, true); window.removeEventListener('pointercancel', off, true); setTimeout(() => { this._lpHold = false; }, 80); }; window.addEventListener('pointerup', off, true); window.addEventListener('pointercancel', off, true); }, 550); });
    sr.addEventListener('pointermove', (e) => { const p = this._cpXY; if (p && Math.abs(e.clientX - p[0]) + Math.abs(e.clientY - p[1]) > 12) clearTimeout(this._cpT); });
    ['pointerup', 'pointercancel'].forEach((n) => sr.addEventListener(n, () => clearTimeout(this._cpT)));
    sr.addEventListener('contextmenu', (e) => { const r = row(e); if (!r) return; clearTimeout(this._cpT); if (this._cardEdit(r) || this._ov) e.preventDefault(); });
    sr.addEventListener('keydown', (e) => { const r = row(e); if (r && (e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.altKey && this._cardEdit(r)) e.preventDefault(); });
  }
  _cardEdit(r) {
    if (this._ov || !this._h) return false;
    if (r.it != null) {
      const it = (this._items || [])[r.it], x = it && !it.done ? (this._all || []).find((y) => y.uid === it.uid && y.entity === it.entity) : null, ai = this._c.actions.findIndex((a) => a.add_task && a.add_task.entity);
      if (!x || ai < 0) return false;
      this._openTask(this._c.actions[ai], ai, x, '[data-it="' + r.it + '"]'); return !!this._ov;
    }
    const it = (this._crow || [])[r.sh]; if (!it || it.done || it.pend) return false;
    this._openShop('head', false, it.uid, '[data-sh="' + r.sh + '"]'); return !!this._ov;
  }
  _inWindow() {
    const c = this._c, d = new Date(), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return c.weekdays.includes(d.getDay()) && hm >= c.window_start && hm < c.window_end;
  }
  _render() {
    const h = this._h, c = this._c; if (!h || !c) return;
    const win = this._inWindow(), lv = this._lvState();
    const kids = c.children.map((k) => {
      const s = h.states[k.entity], acts = (s && s.attributes.activities) || [];
      const done = acts.filter((a) => a.completed).length, left = acts.length - done;
      const pct = acts.length ? Math.round(done / acts.length * 100) : Number(s && s.state) || 0;
      const ok = acts.length > 0 && left === 0;
      const tone = ok ? 'ok' : !win ? 'idle' : done === 0 ? 'late' : 'todo';
      const big = ok ? CHECK : tone === 'idle' ? `<b>${pct}%</b>` : `<b>${left}</b>`;
      const label = ok ? 'Pronto' : tone === 'idle' ? 'feito hoje' : done === 0 ? 'Por começar' : 'por fazer';
      const next = !ok && win ? (acts.find((a) => !a.completed) || {}).name : '';
      return Object.assign({}, k, { pct, ok, tone, big, label, next, missing: !ok && win });
    });
    /* "por fazer" = as mesmas tarefas das linhas (sem data, de hoje ou em atraso); o estado da entidade conta também as de dias futuros e só serve antes da primeira leitura */
    const open = this._items ? this._items.filter((x) => !x.done).length : c.tasks.reduce((n, t) => n + (Number(h.states[t.entity] && h.states[t.entity].state) || 0), 0);
    const tTone = open ? 'todo' : 'ok';
    const missing = kids.filter((k) => k.missing).length + (open ? 1 : 0);
    const vTone = !missing ? 'ok' : kids.some((k) => k.tone === 'late') ? 'late' : 'todo';
    const fa = this.shadowRoot.activeElement, fd = (fa && fa.dataset) || {}, fsel = fd.act != null ? '[data-act="' + fd.act + '"]' : fd.shop ? '[data-shop="' + fd.shop + '"]' : fd.sh != null ? '[data-sh="' + fd.sh + '"]' : null;
    const hd = (a) => a.placement === 'header' && c.tasks.length > 0, chips = c.actions.some((a) => !hd(a));
    const shc = c.shopping && c.shopping.entity ? c.shopping : null; let shop = '';
    if (shc) {
      const all = this._shopItems(), n = all.filter((x) => !x.done).length, max = Math.max(1, Number(shc.max) || 5);
      this._crow = all.filter((x) => !x.done || x.pend).slice(0, max);
      shop = `<div class="sh${shc.heading ? ' big' : ''}" style="order:1"><span class="st" aria-label="${escF(shc.name || 'Compras')}${n ? ', ' + n + ' por comprar' : ''}">${shc.icon ? `<ha-icon icon="${escF(shc.icon)}"></ha-icon>` : ''}${escF(shc.name || 'Compras')}</span><i class="ln"></i></div>
      <div class="list" style="order:1">${this._crow.length ? this._crow.map((it, i) => `<button class="it${it.done ? ' done' : ''}" data-sh="${i}" aria-pressed="${it.done}"${it.done ? '' : ' title="Manter premido para editar" aria-keyshortcuts="E"'}><span class="box">${it.done ? CHECK : ''}</span>${fmRow(it.name, it.desc)}</button>`).join('') : `<div class="none">${this._shop ? 'Nada para comprar' : 'A carregar…'}</div>`}</div>
      <div class="acts" style="order:1"><button class="cb" data-shop="add" aria-haspopup="dialog">${FM_PLUS}<span>${escF(shc.add_label || 'Adicionar item')}</span></button>${n > 0 ? `<button class="cb nb" data-shop="more" aria-haspopup="dialog"><span>${n > max ? 'Ver mais (' + (n - max) + ')' : 'Ver lista'}</span></button>` : ''}</div>`;
    }
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;--ok:${c.color_ok || '#a6da95'};--todo:${c.color_todo || '#eed49f'};--late:${c.color_late || '#ed8796'};--ink:#181926}
      ha-card{padding:16px;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
      button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
      button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      h2{margin:0;font-size:20px;font-weight:600}
      .verdict{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 20px;border-radius:999px;font-size:22px;font-weight:600;color:var(--ink)}
      .ok{background:var(--ok)}.todo{background:var(--todo)}.late{background:var(--late)}
      .idle{background:var(--secondary-background-color);color:var(--primary-text-color)}
      .kids[hidden]{display:none}.kids{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
      .kid{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:12px;background:var(--secondary-background-color);min-width:0}
      .who{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600}
      .av{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:var(--ink);font-weight:700}
      .bar{height:12px;border-radius:999px;background:rgba(127,127,127,.25);overflow:hidden}.bar i{display:block;height:100%;border-radius:999px}
      .state{display:flex;align-items:center;gap:10px;min-height:64px;padding:8px 14px;border-radius:12px;box-sizing:border-box}
      .state:not(.idle){color:var(--ink)}
      .state b{font-size:32px;line-height:1;font-weight:600;font-variant-numeric:tabular-nums}
      .state.idle b{font-size:26px}.state span{display:flex;flex-direction:column;gap:2px;min-width:0;font-size:17px;font-weight:600;line-height:1.15}
      .state small{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lbl{font-size:13px;color:var(--secondary-text-color);margin:0 0 -6px 4px}
      .list{display:flex;flex-direction:column;gap:6px}
      .it{display:flex;align-items:center;gap:12px;min-height:48px;padding:6px 12px;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none;border-radius:12px;background:var(--secondary-background-color);font-size:15px;font-weight:500}
      .box{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--todo);box-sizing:border-box;display:grid;place-items:center}
      .it.done .box{border:0;background:var(--ok);color:var(--ink)}.it.done .box svg{width:16px;height:16px}
      .it.done>:not(.box){opacity:.35}.it.done .at{color:inherit}
      .nm{flex:1;min-width:0;line-height:20px}.ds{font-size:13px;line-height:16px;font-weight:400;color:var(--secondary-text-color);opacity:.6;margin-top:2px;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.at{flex:none;font-size:13px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums}
      .it.late .box{border-color:var(--late)}.nm small{display:block;font-size:12px;font-weight:500;color:var(--late)}
      .whos{flex:none;display:inline-flex}.who2+.who2{margin-left:-4px;outline:2px solid var(--secondary-background-color)}.who2{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;background:var(--card-background-color);color:var(--secondary-text-color)}
      .pl .at{min-width:56px;text-align:right;font-size:14px;font-weight:600;color:var(--primary-text-color)}.pl .it.done .at{font-weight:500}
      .lbl{margin-top:4px}
      .acts{display:flex;align-items:center;gap:8px;min-width:0;min-height:32px;margin-top:-6px}
      .cb{flex:none;position:relative;height:32px;padding:0 12px 0 8px;border-radius:12px;background:var(--secondary-background-color);display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;white-space:nowrap;max-width:100%;box-sizing:border-box}
      .cb.nb{padding:0 12px}.cb::after,.lk::after{content:"";position:absolute;inset:-6px 0}.cb svg{flex:none;display:block;width:16px;height:16px}.cb span{min-width:0;overflow:hidden;text-overflow:ellipsis}
      .lk{flex:0 1 auto;min-width:0;position:relative;height:32px;margin-left:auto;padding:0 4px;display:inline-flex;align-items:center;font-size:13px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lk~.lk{margin-left:0}
      .act{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;box-sizing:border-box}
      .act span{min-width:0;overflow:hidden;text-overflow:ellipsis}
      .hb{flex:none;width:44px;height:44px;margin:0 -4px 0 auto;border-radius:12px;display:grid;place-items:center;color:inherit;background:rgba(24,25,38,.16);background:color-mix(in srgb,currentColor 16%,transparent)}.hb+.hb{margin-left:6px}
      .hb:hover{background:color-mix(in srgb,currentColor 24%,transparent)}.hb:active{background:color-mix(in srgb,currentColor 32%,transparent)}.hb:focus-visible{outline-color:currentColor;outline-offset:-2px}
      .hb ha-icon{--mdc-icon-size:26px;display:inline-flex}
      .qp{flex:none;padding:2px 9px;border-radius:999px;background:var(--card-background-color);color:var(--primary-text-color);font-size:13px;font-weight:600;line-height:18px;font-variant-numeric:tabular-nums}
      .fl{order:3;align-self:flex-end;min-height:44px;margin:-8px 0 -10px;padding:0 4px;display:inline-flex;align-items:center;font-size:13px;color:var(--secondary-text-color)}
      .sh{display:flex;align-items:center;gap:10px;height:32px;margin:2px 0 -4px;min-width:0}
      .st{flex:none;position:relative;font-size:13px;font-weight:600;color:var(--secondary-text-color);white-space:nowrap}
      .ln{flex:1 1 auto;min-width:8px;height:1px;background:var(--divider-color)}
      .sh.big{height:28px;margin:0}.sh.big .st{font-size:18px;font-weight:600;line-height:28px;color:var(--primary-text-color)}.sh.big .ln{display:none}.st ha-icon{--mdc-icon-size:16px;margin-right:6px;vertical-align:-3px}.sh.big .st{display:flex;align-items:center;gap:10px}.sh.big .st ha-icon{flex:none;display:inline-flex;--mdc-icon-size:22px;margin:0;color:var(--secondary-text-color)}
      .none{min-height:32px;padding:0 4px;display:flex;align-items:center;font-size:13px;color:var(--secondary-text-color)}
      .act.ico{padding-left:12px}.act.only{flex:none;width:44px;padding:0;justify-content:center}.act.end{flex:none;margin-left:auto}.act svg{flex:none;display:block}.act ha-icon{--mdc-icon-size:20px;display:inline-flex}
      .tasks b{font-size:32px}.tasks span{font-size:24px}${c.leave ? fmLeave.css : ''}
    </style>
    <ha-card>
      ${lv ? fmLeave.html(lv) : ''}
      <div class="kids" ${win ? '' : 'hidden'}>${kids.map((k) => `<button class="kid" data-nav="1" aria-label="Rotina de ${escF(k.name)}">
        <span class="who"><span class="av" style="background:${escF(k.color)}">${escF(k.name.charAt(0))}</span>${escF(k.name)}</span>
        <span class="bar"><i style="width:${k.pct}%;background:${escF(k.color)}"></i></span>
        <span class="state ${k.tone}">${k.big}<span>${k.label}${k.next ? `<small>A seguir: ${escF(k.next)}</small>` : ''}</span></span>
      </button>`).join('')}</div>
      ${c.tasks.length ? `<div class="state tasks ${tTone}">${open ? `<b>${open}</b><span>por fazer</span>` : CHECK + '<span>Tudo feito</span>'}${c.actions.map((a, i) => (hd(a) ? `<button class="hb" data-act="${i}" aria-label="${escF(a.title || a.name)}" title="${escF(a.title || a.name)}"><ha-icon icon="${escF(a.icon || 'mdi:bullhorn-outline')}"></ha-icon></button>` : '')).join('')}</div>` : ''}
      ${(this._items || []).length ? `<div class="list">${this._items.map((it, i) => `<button class="it${it.done ? ' done' : ''}" data-it="${i}" aria-pressed="${it.done}"${it.done ? '' : ' title="Manter premido para editar" aria-keyshortcuts="E"'}><span class="box">${it.done ? CHECK : ''}</span><span class="nm">${escF(it.name)}${it.desc ? `<span class="ds">${escF(it.desc)}</span>` : ''}</span>${it.at ? `<span class="at">${it.at}</span>` : ''}</button>`).join('')}</div>` : ''}
      ${(this._pays || []).length ? `<div class="sh" style="order:2"><span class="st" aria-label="Pagamentos de ${new Date().toLocaleDateString('pt-PT', { month: 'long' })}, ${this._pays.filter((p) => !p.done).length ? this._pays.filter((p) => !p.done).length + ' por pagar' : 'tudo pago'}">Pagamentos de ${new Date().toLocaleDateString('pt-PT', { month: 'long' })}</span><i class="ln"></i></div><div class="list pl" style="order:2">${this._pays.map((p, i) => `<button class="it${p.done ? ' done' : ''}${p.late ? ' late' : ''}" data-pay="${i}" aria-pressed="${p.done}"><span class="box">${p.done ? CHECK : ''}</span><span class="nm">${escF(p.name)}${p.late ? '<small>em atraso</small>' : ''}</span>${p.who ? `<span class="whos">${p.who.split('').map((l) => { const col = (c.people || {})[l]; return `<span class="who2" style="${col ? 'background:' + escF(col) + ';color:#181926' : ''}">${escF(l)}</span>`; }).join('')}</span>` : ''}<span class="at">${escF(p.amount)}</span></button>`).join('')}</div>` : ''}
      ${chips ? `<div class="acts" style="order:1">${[1, 0].map((p) => c.actions.map((a, i) => { if (hd(a) || !a.add_task === !!p) return ''; if (a.add_task) return `<button class="cb" data-act="${i}" aria-haspopup="dialog">${FM_PLUS}<span>${escF(a.name)}</span></button>`; if (a.navigate && a.style !== 'chip') return `<button class="lk" data-act="${i}">${escF(a.name)} ›</button>`; const ic = a.icon || a.add_task, only = ic && a.icon_only; return `<button class="act${ic ? ' ico' : ''}${only ? ' only' : ''}${a.add_task && !only ? ' end' : ''}" data-act="${i}" title="${escF(a.title || a.name)}"${only || a.title ? ` aria-label="${escF(a.title || a.name)}"` : ''}${a.add_task ? ' aria-haspopup="dialog"' : ''}>${a.icon ? `<ha-icon icon="${escF(a.icon)}"></ha-icon>` : a.add_task ? FM_PLUS : ''}${only ? '' : `<span>${escF(a.name)}</span>`}</button>`; }).join('')).join('')}</div>` : ''}
      ${shop}
      ${c.footer_link && c.footer_link.path ? `<button class="fl" data-fl>${escF(c.footer_link.name || 'Abrir')} ›</button>` : ''}
    </ha-card>`;
    if (fsel && !this._ov) { const fb = this.shadowRoot.querySelector(fsel); if (fb) fb.focus({ preventScroll: true }); }
    this.shadowRoot.querySelectorAll('[data-sh]').forEach((el) => el.addEventListener('click', () => { const it = (this._crow || [])[el.dataset.sh]; if (it && !this._lpHold) this._shopToggle(it.uid); }));
    this.shadowRoot.querySelectorAll('[data-shop]').forEach((el) => el.addEventListener('click', () => (el.dataset.shop === 'more' ? this._openMode() : this._openShop(el.dataset.shop, el.dataset.shop === 'add'))));
    const go = (p) => { history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed')); };
    this.shadowRoot.querySelectorAll('[data-fl]').forEach((el) => el.addEventListener('click', () => go(c.footer_link.path)));
    this.shadowRoot.querySelectorAll('[data-it]').forEach((el) => el.addEventListener('click', () => { const it = this._items[el.dataset.it]; if (this._lpHold) return; h.callService('todo', 'update_item', { item: it.uid, status: it.done ? 'needs_action' : 'completed' }, { entity_id: it.entity }).then(() => this._load()); }));
    this.shadowRoot.querySelectorAll('[data-pay]').forEach((el) => el.addEventListener('click', () => { const it = this._pays[el.dataset.pay]; h.callService('todo', 'update_item', { item: it.uid, status: it.done ? 'needs_action' : 'completed' }, { entity_id: it.entity }).then(() => this._load()); }));
    this.shadowRoot.querySelectorAll('[data-act]').forEach((el) => el.addEventListener('click', () => { const a = c.actions[el.dataset.act]; if (a.add_task) return this._openTask(a, el.dataset.act); if (a.navigate) return go(a.navigate); const p = a.service.split('.'); h.callService(p[0], p[1], a.data || {}, a.target); }));
    this.shadowRoot.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => { history.pushState(null, '', c.routine_path); window.dispatchEvent(new CustomEvent('location-changed')); }));
  }
}
if (!customElements.get('casa-family-card')) customElements.define('casa-family-card', CasaFamilyCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-family-card', name: 'Casa · Família', description: 'Rotina da manhã e tarefas com estados grandes a cor.' });

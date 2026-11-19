/* casa-agenda-card v0.4.2 — agenda de hoje e amanha a partir de calendarios; marcador da hora atual e tempo que falta (countdown: 'next'|'all'|false); toque num evento = detalhe (com Apagar), botao "Novo evento" com prefixo automatico pelas pessoas */
const AG_MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const AG_ICON={'clear-night':'mdi:weather-night','cloudy':'mdi:weather-cloudy','fog':'mdi:weather-fog','hail':'mdi:weather-hail','lightning':'mdi:weather-lightning','lightning-rainy':'mdi:weather-lightning-rainy','partlycloudy':'mdi:weather-partly-cloudy','pouring':'mdi:weather-pouring','rainy':'mdi:weather-rainy','snowy':'mdi:weather-snowy','snowy-rainy':'mdi:weather-snowy-rainy','sunny':'mdi:weather-sunny','windy':'mdi:weather-windy','windy-variant':'mdi:weather-windy-variant'};
const agEsc=(s)=>String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const agAddDays=(key,n)=>{const p=String(key).split('-').map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]+n,12)).toISOString().slice(0,10);};
const agDur=(ms,r)=>{let m=Math.max(1,Math.round(ms/60000));if(m<60)return m+' min';if(r)m=m>=360?Math.round(m/60)*60:Math.round(m/5)*5;const h=Math.floor(m/60),x=m%60;return h+' h'+(x?' '+String(x).padStart(2,'0'):'');};
const AG_PLUS='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>';
const AG_VARS=['--card-background-color','--ha-card-background','--divider-color','--primary-text-color','--secondary-text-color','--secondary-background-color','--primary-color','--error-color'];
const AG_SHEET_CSS=`
:host{all:initial;position:fixed;inset:0;z-index:2147483000;display:block;width:auto;height:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.55)}
.sheet{position:fixed;left:0;right:0;bottom:0;max-height:92vh;max-height:92dvh;overflow:hidden;display:flex;flex-direction:column;gap:12px;padding:18px 16px calc(16px + env(safe-area-inset-bottom,0px));background:var(--ha-card-background,var(--card-background-color,#24273a));color:var(--primary-text-color);border:1px solid var(--divider-color);border-bottom:0;border-radius:20px 20px 0 0;font-size:15px;line-height:1.35;outline:none}
@media (min-width:600px){.sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);width:440px;max-width:calc(100vw - 32px);max-height:calc(100vh - 48px);padding:20px;border:1px solid var(--divider-color);border-radius:20px}}
.body{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:14px;margin:-4px;padding:4px}
h2{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em;overflow-wrap:anywhere}
.cap{font-size:13px;color:var(--secondary-text-color)}
.rel{font-size:14px;font-weight:500;color:var(--secondary-text-color);margin-top:-8px}
.rel b{font-weight:600;color:var(--primary-color)}
.who{display:flex;align-items:center;gap:10px;min-width:0}
.avs{display:flex;flex:none}
.av{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:var(--primary-text-color);background:color-mix(in srgb,var(--primary-text-color) 14%,transparent)}
.av+.av{margin-left:-4px;outline:2px solid var(--ha-card-background,var(--card-background-color,#24273a))}
.whon{font-size:14px;font-weight:500;color:var(--secondary-text-color);min-width:0;overflow-wrap:anywhere}
dl{margin:0;display:grid;grid-template-columns:88px minmax(0,1fr);gap:10px 12px;font-size:15px}
dt{font-size:13px;color:var(--secondary-text-color);padding-top:1px}
dd{margin:0;min-width:0;overflow-wrap:anywhere;white-space:pre-wrap}
dd.long{max-height:30vh;overflow:auto}
a{color:var(--primary-color)}
.foot{flex:none;display:flex;gap:8px}
.btn{flex:1 1 0;min-width:0;min-height:44px;padding:4px 14px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;text-align:center;line-height:1.15}
.btn.pri{background:var(--primary-color);color:#181926;font-weight:600}
.btn.warn{background:var(--error-color,#ed8796);color:#fff;font-weight:600}
.err{flex:none;min-height:18px;font-size:13px;color:var(--error-color,#ed8796);overflow-wrap:anywhere}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.lb{font-size:13px;font-weight:500;color:var(--secondary-text-color)}
input,textarea{width:100%;min-width:0;min-height:44px;margin:0;padding:0 12px;border:0;border-radius:12px;background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:16px;-webkit-appearance:none;appearance:none;text-align:left}
textarea{padding:10px 12px;min-height:72px;resize:vertical;line-height:1.35}
input:disabled{opacity:.45}
.people{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.pp{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:15px;font-weight:700;border:2px solid var(--pc,var(--secondary-text-color));color:var(--pc,var(--primary-text-color));background:transparent}
.pp.on{background:var(--pc,var(--primary-text-color));color:#181926}
.chip{min-height:44px;padding:0 16px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
.chip.on{background:var(--primary-text-color);color:var(--ha-card-background,var(--card-background-color,#24273a));font-weight:600}
.prev{font-size:13px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:18px}
.prev b{font-weight:600;color:var(--primary-text-color)}
.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:end}
.sw{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:0 12px;border-radius:12px;background:var(--secondary-background-color);font-size:15px;width:100%}
.sw i{flex:none;position:relative;width:36px;height:20px;border-radius:10px;background:rgba(127,127,127,.35);background:color-mix(in srgb,var(--primary-text-color) 22%,transparent)}
.sw i::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--secondary-text-color)}
.sw[aria-checked="true"] i{background:var(--primary-text-color)}
.sw[aria-checked="true"] i::after{left:18px;background:var(--ha-card-background,var(--card-background-color,#24273a))}
.seg{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--secondary-background-color)}
.seg button{flex:1 1 0;min-width:0;min-height:44px;padding:4px 8px;border-radius:10px;font-size:14px;font-weight:500;text-align:center;line-height:1.15;overflow-wrap:anywhere}
.seg button.on{background:var(--primary-text-color);color:var(--ha-card-background,var(--card-background-color,#24273a));font-weight:600}
.more{align-self:flex-start;min-height:44px;display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:500;color:var(--primary-color)}
.more svg{transition:none}.more[aria-expanded="true"] svg{transform:rotate(180deg)}
.extra{display:flex;flex-direction:column;gap:14px}
[hidden]{display:none !important}
`;
class CasaAgendaCard extends HTMLElement{
  constructor(){super();this.attachShadow({mode:'open'});this._ev=null;this._err=false;this._sig='';this._daily=[];this._list=[];
    this.shadowRoot.addEventListener('click',(e)=>this._click(e));
    this._onKey=(e)=>{if(e.key==='Escape'&&this._ov){e.stopPropagation();e.preventDefault();this._closeSheet();}};}
  setConfig(c){if(!c||!Array.isArray(c.calendars)||!c.calendars.length)throw new Error('casa-agenda-card: falta "calendars"');
    this._cfg=Object.assign({title:'Agenda',people:{},default_person:'',refresh_minutes:5},c);
    if(!this._cfg.people||typeof this._cfg.people!=='object')this._cfg.people={};
    this._cals=c.calendars.map((x)=>typeof x==='string'?{entity:x}:x).filter((x)=>x&&x.entity);
    this._keys=Object.keys(this._cfg.people).sort((a,b)=>b.length-a.length);
    this._sig='';}
  getCardSize(){return 6;}
  getGridOptions(){return{columns:'full',rows:'auto'};}
  set hass(h){const first=!this._hass;this._hass=h;if(first){this._start();}this._render();}
  connectedCallback(){this._start();this._render();}
  disconnectedCallback(){clearInterval(this._timer);this._timer=null;clearInterval(this._tick);this._tick=null;clearTimeout(this._again);this._closeSheet(false);if(this._unsub){const p=this._unsub;this._unsub=null;Promise.resolve(p).then((u)=>{if(typeof u==='function')u();}).catch(()=>{});}}
  _start(){const h=this._hass;if(!h||!this._cfg||this.isConnected===false)return;
    if(!this._timer){this._fetch();this._timer=setInterval(()=>this._fetch(),Math.max(1,Number(this._cfg.refresh_minutes)||5)*60000);}
    if(!this._tick)this._tick=setInterval(()=>this._render(),60000);
    if(this._cfg.weather&&!this._unsub&&h.connection){this._unsub=h.connection.subscribeMessage((m)=>{this._daily=(m&&m.forecast)||[];this._v=(this._v||0)+1;this._render();},{type:'weather/subscribe_forecast',forecast_type:'daily',entity_id:this._cfg.weather});Promise.resolve(this._unsub).catch(()=>{this._unsub=null;});}}
  async _fetch(){const h=this._hass;if(!h||!h.callApi)return;const now=Date.now();
    const q='?start='+encodeURIComponent(new Date(now-36*3600000).toISOString())+'&end='+encodeURIComponent(new Date(now+60*3600000).toISOString());
    const res=await Promise.all(this._cals.map((c)=>h.callApi('GET','calendars/'+c.entity+q).then((r)=>({ok:true,r:r||[],cal:c.entity}),()=>({ok:false,r:[],cal:c.entity}))));
    const seen={},out=[];
    res.forEach((x)=>x.r.forEach((e)=>{const s=e.start||{},en=e.end||{};const allDay=!s.dateTime&&!!s.date;const k=(e.summary||'')+'|'+(s.dateTime||s.date)+'|'+(en.dateTime||en.date);if(seen[k])return;seen[k]=1;
      out.push({title:e.summary||'(sem título)',allDay,s:allDay?s.date:new Date(s.dateTime),e:allDay?en.date:new Date(en.dateTime),cal:x.cal,uid:e.uid||'',rid:e.recurrence_id||'',rrule:e.rrule||'',desc:e.description||'',loc:e.location||''});}));
    this._err=res.every((x)=>!x.ok);if(!this._err||!this._ev)this._ev=out;this._v=(this._v||0)+1;this._render();}
  _refetch(){this._fetch();clearTimeout(this._again);this._again=setTimeout(()=>this._fetch(),3000);}
  _tz(){return(this._hass&&this._hass.config&&this._hass.config.time_zone)||undefined;}
  _key(d){try{return new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:this._tz()}).format(d);}catch(e){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}}
  _hm(d){try{return new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:this._tz()}).format(d);}catch(e){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}}
  _label(k){const p=k.split('-');return Number(p[2])+' '+AG_MES[Number(p[1])-1];}
  _wday(k){const p=k.split('-').map(Number);try{return new Intl.DateTimeFormat('pt-PT',{weekday:'long',timeZone:'UTC'}).format(new Date(Date.UTC(p[0],p[1]-1,p[2],12))).replace(/-feira$/,'');}catch(e){return'';}}
  _dlabel(k){const w=this._wday(k);return(w?w+', ':'')+this._label(k);}
  _who(title){for(const k of this._keys){const m=title.match(new RegExp('^'+k.replace(/[^A-Za-z0-9]/g,'')+'\\s*[-–:]\\s*(.+)$'));if(m)return{id:k,title:m[1].charAt(0).toUpperCase()+m[1].slice(1)};}return{id:this._cfg.default_person||'',title};}
  _avs(id){const P=this._cfg.people,p=P[id]||{},ch=String(id).split('');if(!p.color&&ch.length>1&&ch.every((k)=>P[k]&&P[k].color))return ch.map((k)=>({k,name:P[k].name||'',color:P[k].color}));return[{k:id,name:p.name||'',color:p.color||''}];}
  _avHtml(avs){return'<span class="avs">'+avs.map((a)=>'<span class="av"'+(a.color?' style="background:'+agEsc(a.color)+';color:#181926"':'')+(a.name?' title="'+agEsc(a.name)+'"':'')+'>'+agEsc(a.k)+'</span>').join('')+'</span>';}
  _day(key,now){const out=[];for(const e of(this._ev||[])){let time,past=false,ord;
      if(e.allDay){if(!(e.s<=key&&key<e.e))continue;time='Dia todo';ord='0';}
      else{const ks=this._key(e.s),ke=this._key(new Date(Math.max(e.s.getTime(),e.e.getTime()-1)));if(!(ks<=key&&key<=ke))continue;
        const a=ks<key?'':this._hm(e.s),b=ke>key?'':this._hm(e.e);time=(!a&&!b)?'Dia todo':(a&&b&&e.e>e.s?a+'–'+b:(a||'até '+b));past=e.e<=now;ord=(!a&&!b)?'0':'1'+(a||'00:00');}
      const w=this._who(e.title);const p=this._cfg.people[w.id]||{};out.push({time,past,ord,tm:ord!=='0',on:!e.allDay&&e.s<=now&&e.e>now,fut:!e.allDay&&e.s>now,who:w.id,name:p.name||'',color:p.color||'',avs:this._avs(w.id),title:w.title,ev:e});}
    return out.sort((x,y)=>x.ord<y.ord?-1:x.ord>y.ord?1:x.title.localeCompare(y.title));}
  _cd(e,now,next){const m=this._cfg.countdown;if(m===false||m==='false'||m==='off'||!e.tm)return'';
    if(e.on)return'<span class="cd"><b>a decorrer</b> · '+agDur(e.ev.e-now,1)+'</span>';
    if(e.fut&&(m==='all'||e===next))return'<span class="cd">em '+agDur(e.ev.s-now,1)+'</span>';return'';}
  _rows(list,now){if(!list.length)return'<div class="row none"><span class="cap">Sem eventos</span></div>';
    const next=now?list.find((e)=>e.tm&&e.fut):null;let mk=now?'<div class="now" aria-hidden="true"><span>'+agEsc(this._hm(now))+'</span><i></i></div>':'';
    return list.map((e)=>{const i=this._list.push(e)-1;const pre=mk&&e===next?mk:'';if(pre)mk='';return pre+'<button type="button" class="row'+(e.past?' past':'')+'" data-ev="'+i+'" aria-haspopup="dialog"><span class="tm">'+agEsc(e.time)+(now?this._cd(e,now,next):'')+'</span>'+this._avHtml(e.avs)+'<span class="tt">'+agEsc(e.title)+'</span></button>';}).join('')+mk;}
  _st(ent){return this._hass&&this._hass.states?this._hass.states[ent]:null;}
  _feat(ent,bit){const s=this._st(ent);return!!(s&&s.attributes&&(Number(s.attributes.supported_features)||0)&bit);}
  _calName(ent){const c=this._cals.find((x)=>x.entity===ent)||{},s=this._st(ent);return c.name||(s&&s.attributes&&s.attributes.friendly_name)||ent;}
  _creatable(){return this._cals.filter((c)=>this._feat(c.entity,1));}
  _render(){const h=this._hass,c=this._cfg;if(!h||!c)return;const now=new Date();const k0=this._key(now),k1=this._key(new Date(now.getTime()+24*3600000+ (this._key(new Date(now.getTime()+24*3600000))===k0?3600000:0)));
    const can=this._creatable().length>0;
    const sig=[k0,this._v||0,this._hm(now),this._err,can,c.countdown].join('|');if(sig===this._sig)return;this._sig=sig;
    let wx='';const f=this._daily.find((d)=>this._key(new Date(d.datetime))===k1);
    if(f){const t=h.localize?h.localize('component.weather.entity_component._.state.'+f.condition):'';const r=(v)=>Math.round(Number(v));wx='<span class="wx"><ha-icon icon="'+(AG_ICON[f.condition]||'mdi:weather-cloudy')+'"></ha-icon>'+(f.templow!=null?r(f.templow)+'–':'')+r(f.temperature)+'°'+(t?' · '+agEsc(t.toLowerCase()):'')+'</span>';}
    const act=this.shadowRoot.activeElement;const hadNew=!!(act&&act.dataset&&act.dataset.new!=null);const hadEv=act&&act.dataset&&act.dataset.ev!=null?this._list[Number(act.dataset.ev)]:null;
    this._list=[];
    const body=this._ev===null?(this._err?'<span class="cap">Sem ligação aos calendários</span>':'<span class="cap">A carregar…</span>')
      :'<div class="list">'+this._rows(this._day(k0,now),now)+'</div><div class="hd sub"><h3>Amanhã · '+this._label(k1)+'</h3>'+wx+'</div><div class="list">'+this._rows(this._day(k1,now))+'</div>'+(this._err?'<span class="cap">Sem ligação aos calendários</span>':'');
    const add=can?'<button type="button" class="chip add" data-new aria-haspopup="dialog" aria-label="Novo evento" title="Novo evento">'+AG_PLUS+'<span class="lbl">Novo evento</span></button>':'';
    this.shadowRoot.innerHTML='<style>:host{display:block;container-type:inline-size}ha-card{padding:16px;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.val{font-size:28px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}.cap{font-size:13px;color:var(--secondary-text-color)}'
      +'ha-card{gap:10px}.hd{display:flex;align-items:baseline;justify-content:space-between;gap:12px}.hd.top{align-items:center;justify-content:flex-start;min-height:44px}.hd.top h2{margin-right:auto}h2{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em}h3{margin:0;font-size:15px;font-weight:600;color:var(--secondary-text-color)}.sub{margin-top:6px}.list{display:flex;flex-direction:column}'
      +'.chip{flex:none;min-height:44px;padding:0 16px 0 12px;border-radius:999px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.chip svg{flex:none}@container (max-width:340px){.chip.add{width:44px;padding:0;justify-content:center}.chip.add .lbl{display:none}}'
      +'.row{display:grid;grid-template-columns:96px 52px minmax(0,1fr);align-items:center;gap:12px;padding:7px 0;border-top:1px solid var(--divider-color);min-height:45px;width:100%;box-sizing:border-box}button.row:focus-visible{outline-offset:-2px;border-radius:8px}.row.none{display:flex;align-items:center}.row.past>*{opacity:.35}.tm{display:flex;flex-direction:column;font-size:13px;line-height:16px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums;white-space:nowrap}.cd{font-size:12px;line-height:14px}.cd b{font-weight:500;color:var(--primary-color)}.now{display:grid;grid-template-columns:96px minmax(0,1fr);align-items:center;gap:12px;height:16px}.now span{font-size:12px;line-height:16px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--primary-color)}.now i{position:relative;height:1px;background:var(--primary-color)}.now i::before{content:"";position:absolute;left:0;top:-3px;width:7px;height:7px;border-radius:50%;background:var(--primary-color)}.now+.row{border-top-color:transparent}.avs{display:flex;min-width:0}.av+.av{margin-left:-4px;outline:2px solid var(--ha-card-background,var(--card-background-color,#24273a))}.av{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:var(--primary-text-color);background:color-mix(in srgb,var(--primary-text-color) 14%,transparent)}.tt{font-size:15px;font-weight:500;min-width:0;overflow-wrap:anywhere}.wx{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--secondary-text-color);white-space:nowrap}.wx ha-icon{--mdc-icon-size:15px;display:inline-flex}'
      +'</style><ha-card><div class="hd top"><h2>'+agEsc(c.title)+'</h2><span class="cap">Hoje · '+this._label(k0)+'</span>'+add+'</div>'+body+'</ha-card>';
    if(this._d&&this._sr){const r=this._sr.querySelector('.rel');if(r)r.innerHTML=this._rel(this._d.ev,now);}
    if(!this._ov){if(hadNew)this._focusTrigger({kind:'new'});else if(hadEv)this._focusTrigger({kind:'ev',ev:hadEv.ev});}
  }
  _click(e){const path=e.composedPath?e.composedPath():[e.target];const el=path.find((x)=>x&&x.dataset&&(x.dataset.ev!=null||x.dataset.new!=null));if(!el)return;
    if(el.dataset.new!=null)this._openForm();else{const it=this._list[Number(el.dataset.ev)];if(it)this._openDetail(it);}}

  /* ---- folha (detalhe / novo evento): vive em document.body, camada de topo quando o browser suporta popover ---- */
  _openSheet(html,label,trig){this._closeSheet(false);if(typeof document==='undefined'||!document.body)return null;
    const ov=document.createElement('div');ov.setAttribute('data-casa-agenda-sheet','');
    const cs=getComputedStyle(this);AG_VARS.forEach((v)=>{const val=cs.getPropertyValue(v);if(val)ov.style.setProperty(v,val.trim());});
    const dark=!(this._hass&&this._hass.themes&&this._hass.themes.darkMode===false);
    const sr=ov.attachShadow({mode:'open'});
    sr.innerHTML='<style>'+AG_SHEET_CSS+'</style><div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="'+agEsc(label)+'" tabindex="-1" style="font-family:'+agEsc(cs.fontFamily||'inherit')+';color-scheme:'+(dark?'dark':'light')+'"><div class="body">'+html.replace('<div class="err"','</div><div class="err"')+'</div>';
    sr.addEventListener('click',(e)=>this._sheetClick(e));
    sr.addEventListener('input',(e)=>this._sheetInput(e));
    sr.addEventListener('keydown',(e)=>{if(e.key==='Tab')this._trap(e);if(e.key!=='Escape')e.stopPropagation();});
    document.body.appendChild(ov);
    if(typeof ov.showPopover==='function'){try{ov.setAttribute('popover','manual');ov.showPopover();}catch(err){ov.removeAttribute('popover');}}
    this._ov=ov;this._sr=sr;this._trig=trig;
    window.addEventListener('keydown',this._onKey,true);
    const sh=sr.querySelector('.sheet');if(sh&&sh.focus)sh.focus({preventScroll:true});
    return sr;}
  _closeSheet(refocus){clearTimeout(this._armT);this._armT=null;this._armed=false;this._d=null;this._f=null;
    if(!this._ov)return;const ov=this._ov;this._ov=null;this._sr=null;window.removeEventListener('keydown',this._onKey,true);
    if(ov.parentNode)ov.parentNode.removeChild(ov);
    const t=this._trig;this._trig=null;if(refocus!==false&&t)this._focusTrigger(t);}
  _focusTrigger(t){let el=null;if(t.kind==='new')el=this.shadowRoot.querySelector('[data-new]');else{const i=this._list.findIndex((x)=>x.ev===t.ev);if(i>=0)el=this.shadowRoot.querySelector('[data-ev="'+i+'"]');}
    if(el&&el.focus)el.focus({preventScroll:true});}
  _trap(e){const sr=this._sr;if(!sr)return;const sh=sr.querySelector('.sheet');
    const f=[...sh.querySelectorAll('button,input,textarea,a[href]')].filter((x)=>!x.disabled&&x.getClientRects().length);if(!f.length){e.preventDefault();return;}
    const a=sr.activeElement,first=f[0],last=f[f.length-1];
    if(e.shiftKey&&(a===first||a===sh||!a)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(a===last||!a)){e.preventDefault();first.focus();}}
  _sheetClick(e){const path=e.composedPath?e.composedPath():[e.target];const el=path.find((x)=>x&&x.dataset&&x.dataset.act);if(!el||el.disabled)return;const a=el.dataset.act;
    if(a==='close')this._closeSheet();
    else if(a==='del')this._delete();
    else if(a==='p')this._togglePerson(el.dataset.k);
    else if(a==='fam'){this._f.sel=[];this._formSync();}
    else if(a==='allday'){this._f.allDay=!this._f.allDay;this._formSync();}
    else if(a==='cal'){this._f.cal=el.dataset.k;this._formSync();}
    else if(a==='more'){this._f.more=!this._f.more;this._formSync();}
    else if(a==='save')this._save();}

  /* ---- detalhe ---- */
  _when(e){if(e.allDay){const last=agAddDays(e.e,-1);return(last<=e.s?this._dlabel(e.s):this._label(e.s)+' – '+this._label(last))+' · Dia todo';}
    const ks=this._key(e.s),ke=this._key(new Date(Math.max(e.s.getTime(),e.e.getTime()-1)));
    if(ks===ke)return this._dlabel(ks)+' · '+this._hm(e.s)+(e.e>e.s?'–'+this._hm(e.e):'');
    return this._dlabel(ks)+' '+this._hm(e.s)+' – '+this._dlabel(ke)+' '+this._hm(e.e);}
  _rel(e,now){const k0=this._key(now),k1=agAddDays(k0,1);
    if(e.allDay){const last=agAddDays(e.e,-1);return k0<e.s?(e.s===k1?'Amanhã · dia todo':'Começa '+this._label(e.s)):k0>last?'Terminou':'<b>Hoje</b> · dia todo';}
    if(e.e<=now)return'Terminou há '+agDur(now-e.e,1);
    if(e.s<=now)return'<b>A decorrer</b> · termina em '+agDur(e.e-now,1);
    if(this._key(e.s)===k0)return'Começa em '+agDur(e.s-now,1);
    return(this._key(e.s)===k1?'Amanhã':'Começa '+this._label(this._key(e.s)))+(e.s-now<12*3600000?' · em '+agDur(e.s-now,1):'');}
  _span(e){let a,b,d;
    if(e.allDay){const last=agAddDays(e.e,-1),n=Math.round((Date.parse(e.e)-Date.parse(e.s))/86400000);a=this._dlabel(e.s);b=this._dlabel(last<e.s?e.s:last);d=n<=1?'Dia todo':n+' dias';}
    else{a=this._dlabel(this._key(e.s))+' · '+this._hm(e.s);b=this._dlabel(this._key(e.e))+' · '+this._hm(e.e);d=e.e>e.s?agDur(e.e-e.s):'';}
    return'<dt>Começa</dt><dd>'+agEsc(a)+'</dd><dt>Termina</dt><dd>'+agEsc(b)+'</dd>'+(d?'<dt>Duração</dt><dd>'+agEsc(d)+'</dd>':'');}
  _canDelete(e){return!!(e.uid&&this._feat(e.cal,2)&&(e.rid||!e.rrule));}
  _openDetail(it){const e=it.ev;const each=it.avs.map((a)=>a.name).filter(Boolean),names=it.name||each.join(' e ');
    const loc=String(e.loc).trim(),desc=String(e.desc).trim();
    const locH=/^https?:\/\/[^\s<>"']+$/i.test(loc)?'<a href="'+agEsc(loc)+'" target="_blank" rel="noopener noreferrer">'+agEsc(loc)+'</a>':agEsc(loc);
    const del=this._canDelete(e);
    const html='<div class="who">'+this._avHtml(it.avs)+'<span class="whon">'+agEsc(names)+'</span></div><h2>'+agEsc(it.title)+'</h2>'
      +'<div class="rel">'+this._rel(e,new Date())+'</div><dl>'+this._span(e)+'<dt>Calendário</dt><dd>'+agEsc(this._calName(e.cal))+'</dd>'
      +(it.avs.length>1&&names!==each.join(' e ')?'<dt>Pessoas</dt><dd>'+agEsc(each.join(', '))+'</dd>':'')+(e.rrule||e.rid?'<dt>Repetição</dt><dd>Repete-se</dd>':'')
      +(loc?'<dt>Local</dt><dd>'+locH+'</dd>':'')+(desc?'<dt>Notas</dt><dd class="long" tabindex="0">'+agEsc(desc)+'</dd>':'')+'</dl>'
      +'<div class="err" role="alert"></div>'
      +'<div class="foot">'+(del?'<button type="button" class="btn" data-act="del">Apagar</button>':'')+'<button type="button" class="btn" data-act="close">Fechar</button></div>';
    this._openSheet(html,'Evento: '+it.title,{kind:'ev',ev:e});this._d={ev:e};}
  _delete(){const d=this._d,sr=this._sr;if(!d||!sr||d.busy)return;const b=sr.querySelector('[data-act="del"]'),er=sr.querySelector('.err');
    if(!this._armed){this._armed=true;b.classList.add('warn');b.textContent='Toque outra vez para apagar';
      clearTimeout(this._armT);this._armT=setTimeout(()=>{this._armed=false;if(this._sr===sr&&b.isConnected){b.classList.remove('warn');b.textContent='Apagar';}},5000);return;}
    clearTimeout(this._armT);this._armed=false;d.busy=true;b.disabled=true;b.classList.remove('warn');b.textContent='A apagar…';er.textContent='';
    const e=d.ev;const msg={type:'calendar/event/delete',entity_id:e.cal,uid:e.uid};if(e.rid){msg.recurrence_id=e.rid;msg.recurrence_range='';}
    const h=this._hass;Promise.resolve().then(()=>h.callWS(msg)).then(()=>{if(this._d===d)this._closeSheet();this._refetch();},
      (err)=>{d.busy=false;if(this._d!==d)return;b.disabled=false;b.textContent='Apagar';er.textContent='Não foi possível apagar: '+((err&&err.message)||String(err||'erro'));});}

  /* ---- novo evento ---- */
  _singles(){const P=this._cfg.people,d=this._cfg.default_person;return Object.keys(P).filter((k)=>k.length===1&&k!==d);}
  _prefix(sel){const P=this._cfg.people,d=this._cfg.default_person||'',all=this._singles(),s=all.filter((k)=>sel.indexOf(k)>=0);
    if(!s.length||(s.length===all.length&&all.length>1&&d))return d;
    if(s.length===1)return s[0];
    const want=s.slice().sort().join('');const hit=Object.keys(P).find((k)=>k.length===s.length&&k.split('').sort().join('')===want);
    return hit||s.join('');}
  _summary(){const f=this._f,p=this._prefix(f.sel),t=f.title.trim();return(p?p+' - ':'')+t;}
  _valid(){const f=this._f;if(!f)return{ok:false,err:''};const t=f.title.trim();
    if(!/^\d{4}-\d\d-\d\d$/.test(f.date))return{ok:false,err:'Indique o dia'};
    if(!f.allDay){if(!/^\d\d:\d\d/.test(f.start)||!/^\d\d:\d\d/.test(f.end))return{ok:false,err:'Indique as horas de início e de fim'};
      if(f.end.slice(0,5)<=f.start.slice(0,5))return{ok:false,err:'A hora de fim tem de ser depois do início'};}
    if(!f.cal)return{ok:false,err:'Sem calendário disponível'};
    if(!t)return{ok:false,err:''};
    return{ok:true,err:''};}
  _openForm(){const cals=this._creatable();if(!cals.length)return;const c=this._cfg,now=new Date();
    let date=this._key(now),hh=Number(this._hm(now).slice(0,2))+1;if(hh>23){hh=0;date=agAddDays(date,1);}
    const p2=(n)=>String(n).padStart(2,'0');const start=p2(hh)+':00',end=hh>=23?'23:59':p2(hh+1)+':00';
    const def=cals.find((x)=>x.entity===c.default_calendar)||cals[0];
    this._f={sel:[],title:'',date,allDay:false,start,end,cal:def.entity,more:false,loc:'',notes:'',saving:false,err:''};
    const P=c.people,sing=this._singles(),d=c.default_person;
    const ppl=sing.map((k)=>'<button type="button" class="pp" data-act="p" data-k="'+agEsc(k)+'" aria-pressed="false" aria-label="'+agEsc(P[k].name||k)+'" title="'+agEsc(P[k].name||k)+'"'+(P[k].color?' style="--pc:'+agEsc(P[k].color)+'"':'')+'>'+agEsc(k)+'</button>').join('')
      +(d?'<button type="button" class="chip" data-act="fam" aria-pressed="true">'+agEsc((P[d]&&P[d].name)||d)+'</button>':'');
    const html='<h2>Novo evento</h2>'
      +(sing.length||d?'<div class="fld" role="group" aria-label="Para quem"><span class="lb">Para quem</span><div class="people">'+ppl+'</div></div>':'')
      +'<div class="fld"><label class="lb" for="ag-t">Título</label><input id="ag-t" type="text" data-f="title" maxlength="120" autocomplete="off" enterkeyhint="done" required><div class="prev" aria-live="polite"></div></div>'
      +'<div class="two"><div class="fld"><label class="lb" for="ag-d">Dia</label><input id="ag-d" type="date" data-f="date" value="'+agEsc(date)+'" required></div>'
      +'<button type="button" class="sw" role="switch" data-act="allday" aria-checked="false"><span>Dia todo</span><i></i></button></div>'
      +'<div class="two"><div class="fld"><label class="lb" for="ag-s">Início</label><input id="ag-s" type="time" data-f="start" value="'+start+'"></div>'
      +'<div class="fld"><label class="lb" for="ag-e">Fim</label><input id="ag-e" type="time" data-f="end" value="'+end+'"></div></div>'
      +(cals.length>1?'<div class="fld" role="group" aria-label="Calendário"><span class="lb">Calendário</span><div class="seg">'+cals.map((x)=>'<button type="button" data-act="cal" data-k="'+agEsc(x.entity)+'" aria-pressed="false">'+agEsc(this._calName(x.entity))+'</button>').join('')+'</div></div>'
        :'<div class="cap">Calendário: '+agEsc(this._calName(def.entity))+'</div>')
      +'<button type="button" class="more" data-act="more" aria-expanded="false">Mais detalhes<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg></button>'
      +'<div class="extra" hidden><div class="fld"><label class="lb" for="ag-l">Local</label><input id="ag-l" type="text" data-f="loc" maxlength="200" autocomplete="off"></div>'
      +'<div class="fld"><label class="lb" for="ag-n">Notas</label><textarea id="ag-n" data-f="notes" maxlength="2000" rows="3"></textarea></div></div>'
      +'<div class="err" role="alert"></div>'
      +'<div class="foot"><button type="button" class="btn" data-act="close">Cancelar</button><button type="button" class="btn pri" data-act="save" disabled>Guardar</button></div>';
    const f=this._f;this._openSheet(html,'Novo evento',{kind:'new'});this._f=f;this._formSync();}
  _togglePerson(k){const f=this._f;if(!f||f.saving)return;const i=f.sel.indexOf(k);if(i>=0)f.sel.splice(i,1);else f.sel.push(k);this._formSync();}
  _sheetInput(e){const f=this._f,el=e.target;if(!f||!el||!el.dataset||!el.dataset.f)return;f[el.dataset.f]=el.value;f.err='';this._formSync();}
  _formSync(){const f=this._f,sr=this._sr;if(!f||!sr)return;const all=this._singles();
    sr.querySelectorAll('[data-act="p"]').forEach((b)=>{const on=f.sel.indexOf(b.dataset.k)>=0;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.disabled=f.saving;});
    const fam=sr.querySelector('[data-act="fam"]');if(fam){const on=this._prefix(f.sel)===this._cfg.default_person;fam.classList.toggle('on',on);fam.setAttribute('aria-pressed',on?'true':'false');fam.disabled=f.saving;}
    const pv=sr.querySelector('.prev');if(pv){const p=this._prefix(f.sel),t=f.title.trim();pv.innerHTML='Fica como: <b>'+agEsc((p?p+' - ':'')+(t||'…'))+'</b>';}
    const sw=sr.querySelector('[data-act="allday"]');sw.setAttribute('aria-checked',f.allDay?'true':'false');sw.disabled=f.saving;
    sr.querySelectorAll('input,textarea').forEach((i)=>{const tm=i.dataset.f==='start'||i.dataset.f==='end';i.disabled=f.saving||(tm&&f.allDay);});
    sr.querySelectorAll('[data-act="cal"]').forEach((b)=>{const on=b.dataset.k===f.cal;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.disabled=f.saving;});
    const mo=sr.querySelector('[data-act="more"]');mo.setAttribute('aria-expanded',f.more?'true':'false');sr.querySelector('.extra').hidden=!f.more;
    const v=this._valid();sr.querySelector('.err').textContent=f.err||v.err;
    const sv=sr.querySelector('[data-act="save"]');sv.disabled=f.saving||!v.ok;sv.textContent=f.saving?'A guardar…':'Guardar';
    sr.querySelector('.foot [data-act="close"]').disabled=f.saving;}
  _payload(){const f=this._f;const d={summary:this._summary().slice(0,160)};
    if(f.allDay){d.start_date=f.date;d.end_date=agAddDays(f.date,1);}
    else{d.start_date_time=f.date+' '+f.start.slice(0,5)+':00';d.end_date_time=f.date+' '+f.end.slice(0,5)+':00';}
    const l=f.loc.trim(),n=f.notes.trim();if(l)d.location=l;if(n)d.description=n;return d;}
  _save(){const f=this._f;if(!f||f.saving||!this._valid().ok)return;const h=this._hass;if(!h||!h.callService)return;
    const data=this._payload(),cal=f.cal;f.saving=true;f.err='';this._formSync();
    Promise.resolve().then(()=>h.callService('calendar','create_event',data,{entity_id:cal})).then(()=>{if(this._f===f)this._closeSheet();this._refetch();},
      (err)=>{f.saving=false;if(this._f!==f)return;f.err='Não foi possível guardar: '+((err&&err.message)||String(err||'erro'));this._formSync();});}
}
if(!customElements.get('casa-agenda-card'))customElements.define('casa-agenda-card',CasaAgendaCard);
window.customCards=window.customCards||[];if(!window.customCards.some((c)=>c.type==='casa-agenda-card'))window.customCards.push({type:'casa-agenda-card',name:'Casa · Agenda',description:'Agenda de hoje e amanhã, com detalhe e novo evento'});

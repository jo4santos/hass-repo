/* casa-weather-card v0.1 — tempo agora + proximas horas + proximos dias */
const WX_ICON={'clear-night':'mdi:weather-night','cloudy':'mdi:weather-cloudy','exceptional':'mdi:alert-circle-outline','fog':'mdi:weather-fog','hail':'mdi:weather-hail','lightning':'mdi:weather-lightning','lightning-rainy':'mdi:weather-lightning-rainy','partlycloudy':'mdi:weather-partly-cloudy','pouring':'mdi:weather-pouring','rainy':'mdi:weather-rainy','snowy':'mdi:weather-snowy','snowy-rainy':'mdi:weather-snowy-rainy','sunny':'mdi:weather-sunny','windy':'mdi:weather-windy','windy-variant':'mdi:weather-windy-variant'};
const WX_DOW=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const wxEsc=(s)=>String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
class CasaWeatherCard extends HTMLElement{
  constructor(){super();this.attachShadow({mode:'open'});this._fc={hourly:[],daily:[]};this._unsub={};this._sig='';}
  setConfig(c){if(!c||!c.entity)throw new Error('casa-weather-card: falta "entity" (weather.*)');this._cfg=Object.assign({hours:8,days:5},c);}
  getCardSize(){return 6;}
  getGridOptions(){return{columns:'full',rows:'auto'};}
  set hass(h){this._hass=h;this._subscribe();this._render();}
  connectedCallback(){this._subscribe();if(!this._tick)this._tick=setInterval(()=>this._render(),20000);this._render();}
  disconnectedCallback(){clearInterval(this._tick);this._tick=null;for(const k of Object.keys(this._unsub)){const p=this._unsub[k];delete this._unsub[k];Promise.resolve(p).then((u)=>{if(typeof u==='function')u();}).catch(()=>{});}}
  _subscribe(){const h=this._hass;if(!h||!h.connection||!this._cfg||this.isConnected===false)return;
    for(const t of ['hourly','daily']){if(this._unsub[t])continue;
      this._unsub[t]=h.connection.subscribeMessage((m)=>{this._fc[t]=(m&&m.forecast)||[];this._fcv=(this._fcv||0)+1;this._render();},{type:'weather/subscribe_forecast',forecast_type:t,entity_id:this._cfg.entity});
      Promise.resolve(this._unsub[t]).catch(()=>{delete this._unsub[t];});}}
  _tz(){return(this._hass&&this._hass.config&&this._hass.config.time_zone)||undefined;}
  _hm(d){try{return new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:this._tz()}).format(d);}catch(e){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}}
  _dow(d){try{const k=new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:this._tz()}).format(d);const i=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(k);return WX_DOW[i<0?d.getDay():i];}catch(e){return WX_DOW[d.getDay()];}}
  _cond(c){const h=this._hass;const t=h&&h.localize?h.localize('component.weather.entity_component._.state.'+c):'';return t||c||'';}
  _deg(v){return(v==null||isNaN(Number(v)))?'–':Math.round(Number(v))+'°';}
  _render(){const h=this._hass,c=this._cfg;if(!h||!c)return;const so=h.states[c.entity];const now=new Date();const clock=this._hm(now);
    const sig=[clock,so?so.state:'x',so?so.attributes.temperature:'',this._fcv||0].join('|');if(sig===this._sig)return;this._sig=sig;
    const off=!so||so.state==='unavailable'||so.state==='unknown';
    const cond=off?'Sem ligação':(h.formatEntityState?h.formatEntityState(so):this._cond(so.state));
    const icon=off?'mdi:cloud-off-outline':(WX_ICON[so.state]||'mdi:weather-cloudy');
    const hrs=[];if(!off)hrs.push({t:'Agora',i:icon,v:this._deg(so.attributes.temperature)});
    for(const f of this._fc.hourly){if(hrs.length>=c.hours)break;const d=new Date(f.datetime);if(d<=now)continue;hrs.push({t:this._hm(d),i:WX_ICON[f.condition]||'mdi:weather-cloudy',v:this._deg(f.temperature)});}
    const days=this._fc.daily.slice(0,c.days).map((f,i)=>({d:i===0?'Hoje':this._dow(new Date(f.datetime)),i:WX_ICON[f.condition]||'mdi:weather-cloudy',desc:this._cond(f.condition),lo:f.templow,hi:f.temperature}));
    const los=days.map((d)=>Number(d.lo==null?d.hi:d.lo)).filter((n)=>!isNaN(n)),his=days.map((d)=>Number(d.hi)).filter((n)=>!isNaN(n));
    const mn=Math.min.apply(null,los.concat(his)),mx=Math.max.apply(null,los.concat(his)),span=Math.max(1,mx-mn);
    const bar=(d)=>{const lo=Number(d.lo==null?d.hi:d.lo),hi=Number(d.hi);if(isNaN(lo)||isNaN(hi))return'';const l=(lo-mn)/span*100,w=Math.max(6,(hi-lo)/span*100);return'left:'+Math.min(l,100-w).toFixed(1)+'%;width:'+w.toFixed(1)+'%';};
    this.shadowRoot.innerHTML='<style>:host{display:block}ha-card{padding:16px;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.val{font-size:28px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}.cap{font-size:13px;color:var(--secondary-text-color)}'
      +'ha-card{gap:16px}.head{display:flex;justify-content:space-between;align-items:center;gap:16px;width:100%;min-height:44px}.col{display:flex;flex-direction:column;gap:4px;min-width:0}.col.r{align-items:flex-end;text-align:right}.now{display:flex;align-items:center;gap:12px;min-width:0}.now ha-icon{--mdc-icon-size:36px;color:var(--secondary-text-color);flex:none}'
      +'.hours{display:grid;grid-template-columns:repeat(var(--n,8),minmax(0,1fr));gap:4px;padding:12px 0;border-top:1px solid var(--divider-color);border-bottom:1px solid var(--divider-color)}.hr{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}.hr .t{font-size:12px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums}.hr ha-icon{--mdc-icon-size:18px;color:var(--secondary-text-color)}.hr .v{font-size:15px;font-weight:500}'
      +'.days{display:flex;flex-direction:column;gap:10px}.day{display:grid;grid-template-columns:48px 22px 34px minmax(0,1fr) 34px;align-items:center;gap:10px;font-size:15px}.day .d{font-weight:500}.day ha-icon{--mdc-icon-size:18px;color:var(--secondary-text-color);display:grid;place-items:center}.day .lo{color:var(--secondary-text-color);text-align:right;font-variant-numeric:tabular-nums}.day .hi{font-weight:600;font-variant-numeric:tabular-nums}.track{position:relative;height:6px;border-radius:3px;background:color-mix(in srgb,var(--primary-text-color) 14%,transparent)}.track span{position:absolute;top:0;bottom:0;border-radius:3px;background:var(--secondary-text-color)}'
      +'</style><ha-card><button class="head" aria-label="Detalhes do tempo"><span class="col"><span class="val">'+wxEsc(clock)+'</span><span class="cap">Agora</span></span>'
      +'<span class="now"><span class="col r"><span class="val">'+(off?'–':this._deg(so.attributes.temperature))+'</span><span class="cap">'+wxEsc(cond)+'</span></span><ha-icon icon="'+icon+'"></ha-icon></span></button>'
      +(hrs.length?'<div class="hours" style="--n:'+hrs.length+'">'+hrs.map((x)=>'<div class="hr"><span class="t">'+wxEsc(x.t)+'</span><ha-icon icon="'+x.i+'"></ha-icon><span class="v">'+x.v+'</span></div>').join('')+'</div>':'')
      +(days.length?'<div class="days">'+days.map((d)=>'<div class="day"><span class="d">'+d.d+'</span><ha-icon icon="'+d.i+'" title="'+wxEsc(d.desc)+'"></ha-icon><span class="lo">'+this._deg(d.lo)+'</span><span class="track"><span style="'+bar(d)+'"></span></span><span class="hi">'+this._deg(d.hi)+'</span></div>').join('')+'</div>':(off?'':'<span class="cap">Previsão indisponível</span>'))
      +'</ha-card>';
    const b=this.shadowRoot.querySelector('.head');if(b)b.addEventListener('click',()=>this.dispatchEvent(new CustomEvent('hass-more-info',{bubbles:true,composed:true,detail:{entityId:c.entity}})));
  }
}
if(!customElements.get('casa-weather-card'))customElements.define('casa-weather-card',CasaWeatherCard);
window.customCards=window.customCards||[];window.customCards.push({type:'casa-weather-card',name:'Casa · Tempo',description:'Tempo agora, próximas horas e próximos dias'});

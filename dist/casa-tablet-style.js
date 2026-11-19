// casa-tablet-style v0.6.0 — CSS partilhado dos cartões de tablet de parede (casa-room-card, casa-floor-card, casa-launcher-card); ação Anunciar na navegação, bloco Família do piso
window.__casaTablet = window.__casaTablet || {};
window.__casaTablet.CSS = `
:host{display:block}
:host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color);--y:#eed49f;--r:#ed8796;--g:#a6da95;--ink:#181926}
ha-card{position:relative;background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:4px 8px 0;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;gap:14px;color:var(--primary-text-color);font-size:14px}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.4;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
button:active:not(:disabled){opacity:.8}
ha-icon{--mdc-icon-size:22px;flex:none;display:inline-flex}
h1,h2{margin:0}
h2{font-size:20px;line-height:24px;font-weight:600}
.sec{display:flex;flex-direction:column;gap:12px;min-width:0}
.hd{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;height:66px}
.hd h1{font-size:34px;line-height:38px;font-weight:700;letter-spacing:-.02em}
.dl{height:24px;display:flex;align-items:center;gap:10px;margin-bottom:4px}
.date{font-size:15px;font-weight:500;color:var(--secondary-text-color)}
.per{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px 0 8px;border-radius:999px;font-size:14px;font-weight:500;background:var(--secondary-background-color)}
.per ha-icon{--mdc-icon-size:14px;color:var(--secondary-text-color)}
.clk{font-size:64px;line-height:.9;font-weight:300;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.chips{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:12px}
.cp{height:52px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:0 10px 0 8px;border-radius:999px;background:var(--secondary-background-color);min-width:0}
.ci{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.ci ha-icon{--mdc-icon-size:18px}
.ci.y{background:var(--y);color:var(--ink)}.ci.r{background:var(--r);color:var(--ink)}
.ct{min-width:0;display:flex;flex-direction:column;gap:1px}
.ct span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px}
.ct .l{color:var(--secondary-text-color)}.ct .v{font-weight:600;font-variant-numeric:tabular-nums}
.row{display:flex;align-items:center;gap:10px;min-height:56px}
.row h2{margin-right:auto}
.pills{display:flex;gap:8px}
.pill{height:56px;min-width:56px;padding:0 16px;box-sizing:border-box;border-radius:999px;font-size:15px;font-weight:600;background:var(--secondary-background-color);display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.pill.on{background:var(--primary-color);color:var(--ink)}
.pill.warn{background:var(--r);color:var(--ink)}
.pill.in{background:var(--card-background-color)}
.pill ha-icon{--mdc-icon-size:18px}
.note{font-size:14px;color:var(--secondary-text-color);margin-top:-4px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.grid.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.c1{grid-template-columns:minmax(0,1fr)}
.c3 .sw{display:none}.c3 .mod{padding:0 10px 0 12px}.c3 .mod .tm{gap:10px}
.tile{display:flex;flex-direction:column;justify-content:center;gap:2px;min-height:76px;padding:0 16px 0 14px;border-radius:12px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
.tile.big{min-height:108px}
.tile.in{background:var(--card-background-color)}
.tile.on{background:var(--primary-text-color);color:var(--ink)}
.tile.bad{opacity:.45}
.tile.warn{background:var(--r);color:var(--ink)}
.tm{display:flex;align-items:center;gap:14px;min-height:56px;min-width:0;width:100%}
.ic{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.tile.in .ic{background:var(--secondary-background-color)}
.tile.big .ic{width:52px;height:52px}
.tile.on .ic{background:var(--y);color:var(--ink)}
.tile.on .ic.n{background:#24273a;color:#cad3f5}
.tile.warn .ic{background:var(--ink);color:var(--r)}
.tx{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}
.nm{font-size:16px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:14px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.on .st,.tile.warn .st{color:inherit;opacity:.8}
input[type=range]{width:100%;height:40px;margin:0;accent-color:var(--y);cursor:pointer}
.tile.on input[type=range]{accent-color:var(--ink)}
.sw{flex:none;width:44px;height:26px;box-sizing:border-box;padding:3px;border-radius:999px;display:flex;background:var(--card-background-color)}
.sw i{width:20px;height:20px;border-radius:50%;background:var(--secondary-text-color)}
.on>.tm .sw,.pill.act .sw{justify-content:flex-end;background:#24273a}.on>.tm .sw i,.pill.act .sw i{background:#cad3f5}
.pill.in .sw{background:var(--secondary-background-color)}.pill.in.act .sw{background:#24273a}
.pill.act{background:var(--primary-text-color);color:var(--ink)}
.heat{height:120px;box-sizing:border-box;display:flex;align-items:center;gap:20px;padding:0 20px 0 24px;border-radius:16px;background:var(--secondary-background-color)}
.heat.sm{height:96px;gap:14px;padding:0 16px 0 18px}
.cur{flex:none;font-size:64px;line-height:1;font-weight:300;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.heat.sm .cur{font-size:28px;font-weight:600;letter-spacing:0}
.hs{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.hs b{font-size:16px;font-weight:500}
.hs span{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--secondary-text-color)}
.hs ha-icon{--mdc-icon-size:16px}
.stp{flex:none;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
.heat.sm .stp{width:56px;height:56px}
.tg{flex:none;width:84px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:14px;color:var(--secondary-text-color)}
.heat.sm .tg{width:64px}
.tg b{font-size:24px;line-height:28px;font-weight:600;color:var(--primary-text-color);font-variant-numeric:tabular-nums}
.mod{height:84px;min-height:84px;flex-direction:row;align-items:center;gap:12px;padding:0 12px 0 14px}
.mod .tm{min-height:84px;gap:12px}
.mod .sb{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
.av{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:18px;font-weight:700;color:var(--ink)}
.dots{display:inline-flex;gap:4px;margin-left:6px}
.dots i{width:9px;height:9px;border-radius:50%;background:var(--card-background-color)}
.dots i.d{background:var(--primary-text-color)}
.snd{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:16px;background:var(--secondary-background-color)}
.np{display:flex;align-items:center;gap:14px;min-height:64px}
.art{flex:none;width:56px;height:56px;border-radius:14px;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.art.on{background:var(--primary-text-color);color:var(--ink)}
.eq{display:inline-flex;align-items:flex-end;gap:3px;height:20px}
.eq span{display:block;width:4px;height:100%;border-radius:2px;background:currentColor;transform-origin:bottom;transform:scaleY(.28)}
.art.on .eq span{animation:eq 1s ease-in-out infinite}
.art.on .eq span:nth-child(2){animation-duration:.8s;animation-delay:-.35s}
.art.on .eq span:nth-child(3){animation-duration:1.15s;animation-delay:-.6s}
.art.on .eq span:nth-child(4){animation-duration:.9s;animation-delay:-.15s}
@keyframes eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.art.on .eq span{animation:none;transform:scaleY(.6)}}
.ib{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
.ib.pri{width:64px;height:64px;background:var(--primary-color);color:var(--ink)}
.ib.pri ha-icon{--mdc-icon-size:28px}
.vol{display:flex;align-items:center;gap:12px;height:56px}
.vol input{flex:1;height:56px;accent-color:var(--primary-color)}
.vol ha-icon{color:var(--secondary-text-color)}
.vv{flex:none;width:64px;display:flex;flex-direction:column;align-items:flex-end;font-size:14px;color:var(--secondary-text-color)}
.vv b{font-size:16px;font-weight:600;color:var(--primary-text-color);font-variant-numeric:tabular-nums}
.src{display:flex;gap:8px;overflow:hidden}
.src .pill{flex:1;min-width:0;padding:0 10px;background:var(--card-background-color)}
.src .pill.on{background:var(--primary-color)}
.nav{align-self:center;display:flex;gap:4px;padding:4px;border-radius:999px;background:var(--secondary-background-color)}
.nav button,.nav span{display:flex;align-items:center;gap:8px;height:56px;padding:0 22px;border-radius:999px;font-size:15px;font-weight:600;white-space:nowrap}
.nav ha-icon{--mdc-icon-size:20px}
.nav span{background:var(--primary-color);color:var(--ink)}
.scrim{position:absolute;inset:-8px;z-index:5;background:rgba(24,25,38,.72);display:flex;flex-direction:column;justify-content:flex-end}
.scrim>button.bg{flex:1;min-height:40px}
.sheet{display:flex;flex-direction:column;gap:16px;padding:20px 24px 24px;border-radius:24px 24px 0 0;background:var(--secondary-background-color);max-height:86%;overflow:auto;box-sizing:border-box}
.sheet h3{margin:0;font-size:14px;font-weight:500;color:var(--secondary-text-color)}
.sheet .x{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
.sheet .sub{font-size:14px;color:var(--secondary-text-color)}
.emb{min-height:200px}
.lk{height:84px;flex-direction:row;align-items:center;gap:14px;padding:0 14px 0 16px;width:100%}
.lk.w{grid-column:span 2}
.lk .ic{background:var(--card-background-color);color:var(--primary-text-color)}
.lk>ha-icon{color:var(--secondary-text-color)}
.acc{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:12px}
.acc .cp{height:56px}
.cp.y{background:var(--y);color:var(--ink)}.cp.y .ci{background:var(--ink);color:var(--y)}.cp.y .l{color:inherit;opacity:.8}
.cp.r{background:var(--r);color:var(--ink)}.cp.r .ci{background:var(--ink);color:var(--r)}.cp.r .l{color:inherit;opacity:.8}
.ag{display:flex;flex-direction:column;border-radius:16px;background:var(--secondary-background-color);padding:4px 18px;height:176px;box-sizing:border-box;overflow:hidden}
.ev{display:flex;align-items:center;gap:12px;height:42px;font-size:15px;border-top:1px solid rgba(202,211,245,.08)}
.ev:first-child{border-top:0}
.ev .t{flex:none;width:112px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums;font-size:14px}
.ev i{flex:none;width:9px;height:9px;border-radius:50%;background:var(--card-background-color)}
.ev .n{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
.ev.e{color:var(--secondary-text-color)}
.rm{height:168px;justify-content:space-between;padding:16px 18px;border-radius:16px;gap:0;width:100%}
.rm .rh{display:flex;align-items:center;justify-content:space-between;height:28px;font-size:18px;font-weight:600}
.rm .rh ha-icon{--mdc-icon-size:18px;color:var(--secondary-text-color)}
.rm .rc{display:flex;align-items:baseline;gap:10px}
.rm .rc b{font-size:32px;line-height:1;font-weight:300;font-variant-numeric:tabular-nums}
.rm .rc span,.rm .rf span{font-size:14px;color:var(--secondary-text-color)}
.rm .rf{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rm .rf span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.rm .rf ha-icon{--mdc-icon-size:16px}
.dot{width:9px;height:9px;border-radius:50%;background:var(--card-background-color)}.dot.y{background:var(--y)}
.wc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.wc .tile{min-height:64px;padding:0 8px;border-radius:12px}
.wc .tm{gap:8px}.wc .ic{width:36px;height:36px}.wc .ic ha-icon{--mdc-icon-size:18px}.wc .nm{font-size:14px}
.hall{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:12px}
.hall .tile{min-height:96px}
.fs{display:flex;align-items:center;gap:14px;min-height:80px;padding:0 16px;border-radius:16px;background:var(--secondary-background-color)}
.spk{display:flex;gap:4px}
.pill.more{padding:0;width:56px}
.pill.more ha-icon{--mdc-icon-size:22px}
.opt button:disabled{opacity:1}
.tile.in:not(.on) .sw{background:var(--secondary-background-color)}
.sheet .vol.off{opacity:.45}
/* ===== v0.2.0 — fluido de 360 a 1280 px. Base = estreito (uma coluna); @container alarga. ===== */
ha-card,.scrim{container-type:inline-size;container-name:casa}
h2{min-width:0}
.nm{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-height:1.25}
.hd{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"dl dl" "h1 clk";align-items:end;gap:4px 12px;height:auto;min-height:66px}
.hd .dl{grid-area:dl;margin:0;min-width:0}
.hd h1{grid-area:h1;min-width:0;font-size:24px;font-size:clamp(20px,6.2cqi,34px);line-height:1.12;overflow-wrap:break-word}
.clk{grid-area:clk;font-size:44px;font-size:clamp(40px,12cqi,64px)}
.date{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.per{flex:none}
.chips,.acc{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.chips>.cp:first-child:nth-last-child(odd),.acc>.cp:first-child:nth-last-child(odd){grid-column:1/-1}
.cp{padding:0 6px 0 5px;gap:6px}
.ci{width:30px;height:30px}
.row{flex-wrap:wrap;row-gap:8px}
.lr.det>h2{flex:1 1 0;margin-right:0}
.lr.det>.pill{order:1}
.lr.det>.pills{order:2;flex:0 0 100%}
.lr.det>.pills>.pill,.fr>.pills>.pill{flex:1 1 0}
.fr>.pills,.fr>.pill{flex:0 0 100%}
.tile.lt{padding:0 8px}
.lt .tm{gap:10px}
.lt .ic{width:40px;height:40px}
.tile.lt.big .ic{width:40px;height:40px}
.grid.mg,.grid.rg,.grid.lg{grid-template-columns:minmax(0,1fr)}
.lk.w{grid-column:auto}
.lk .st{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.mg .sw{display:flex}
.mod{height:84px;min-height:84px;padding:0 10px;gap:8px}
.mod .tm{min-height:84px;gap:10px}
.mod .ic,.mod .av{width:40px;height:40px}
.heat{height:168px;flex-wrap:wrap;align-content:center;gap:12px 16px;padding:0 16px}
.heat.sm{height:152px;gap:10px 14px;padding:0 14px}
.cur{font-size:56px}
.hs{justify-content:center}
.hs b{display:block;height:20px;line-height:20px;white-space:nowrap}
.stpr{flex:0 0 100%;display:flex;align-items:center;justify-content:space-between;gap:12px}
.stpr .tg{flex:1 1 0;width:auto}
.heat.sm .stpr .tg{width:auto}
.hall{grid-template-columns:minmax(0,1fr)}
.hall .tile{min-height:76px}
.snd{padding:14px}
.snd .row>.pills{flex:1 1 250px;min-width:0;flex-wrap:wrap}
.spk{flex:1 1 220px;min-width:0}
.spk .pill:disabled .sw{display:none}
.spk>.pill:first-child{flex:1 1 0;min-width:0;justify-content:flex-start;padding:0 12px}
.spk .sw{margin-left:auto}
.pn{min-width:0;overflow:hidden;text-overflow:ellipsis}
.np{flex-wrap:wrap;row-gap:10px}
.np .tx{flex:1 1 calc(100% - 70px);height:80px;justify-content:center}
.np .st{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.tr{flex:0 0 100%;display:flex;align-items:center;justify-content:center;gap:24px}
.src{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.src .pill:last-child:nth-child(odd){grid-column:1/-1}
.nav{align-self:stretch}
.nav button,.nav span{flex:1 1 0;min-width:0;flex-direction:column;justify-content:center;gap:2px;padding:0 4px;font-size:14px;line-height:16px}
.scrim{position:fixed;inset:0;z-index:8}
.sheet{padding:16px 16px 20px}
.sheet>*{flex:none}
.fs{flex-wrap:wrap;align-content:center;height:164px;min-height:0;row-gap:12px;padding:0 14px;box-sizing:border-box}
.fs .tx{flex:1 1 calc(100% - 70px)}
.fs>.pill{flex:0 0 100%}
.fs .st{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.rm{height:auto;min-height:132px;gap:10px}
.rm .rc,.rm .rf{flex-wrap:wrap;row-gap:2px}
.wc .tile{padding:0 6px}
.wc .tm{gap:6px}
.lbody,.lfl,.fbot{display:contents}
.ev .t{width:92px}
.ev .n{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-height:18px}
@container casa (min-width:420px){
.tile.lt{padding:0 16px 0 14px}
.lt .tm{gap:14px}
.lt .ic{width:44px;height:44px}
.tile.lt.big .ic{width:52px;height:52px}
.cp{padding:0 10px 0 8px;gap:8px}
.ci{width:34px;height:34px}
}
@container casa (min-width:460px){
.nav{align-self:center}
.nav button,.nav span{flex:none;flex-direction:row;gap:8px;padding:0 22px;font-size:15px;line-height:inherit}
}
@container casa (min-width:520px){
.lr.det>h2{flex:none;margin-right:auto}
.lr.det>.pill,.lr.det>.pills{order:0}
.lr.det>.pills{flex:none}
.lr.det>.pills>.pill{flex:none}
}
@container casa (min-width:600px){
.chips.k3{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.chips.k3>.cp:first-child{grid-column:auto}
}
@container casa (min-width:640px){
.hd{grid-template-areas:"dl clk" "h1 clk";gap:4px 16px}
.fr>.pills,.fr>.pill{flex:none}
.fr>.pills>.pill{flex:none}
.grid.mg,.grid.rg,.grid.lg{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid.mg.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.mg.c1{grid-template-columns:minmax(0,1fr)}
.lk.w{grid-column:span 2}
.mg.c3 .sw{display:none}
.mod{height:84px;min-height:84px;padding:0 12px 0 14px;gap:12px}
.mod .tm{min-height:84px;gap:12px}
.mod .ic,.mod .av{width:44px;height:44px}
.mg.c3 .mod{padding:0 10px 0 12px}
.mg.c3 .mod .tm{gap:10px}
.heat{height:120px;flex-wrap:nowrap;gap:20px;padding:0 20px 0 24px}
.heat.sm{height:96px;gap:14px;padding:0 16px 0 18px}
.cur{font-size:64px}
.stpr{flex:none;gap:20px}
.heat.sm .stpr{gap:14px}
.stpr .tg{flex:none;width:84px}
.heat.sm .stpr .tg{width:64px}
.hall{grid-template-columns:minmax(0,1fr) minmax(0,1.5fr)}
.hall .tile{min-height:96px}
.snd{padding:14px 16px}
.snd .row>.pills,.spk{flex:none}
.spk>.pill:first-child{flex:none;padding:0 16px}
.np{flex-wrap:nowrap}
.np .tx{flex:1;height:auto}
.np .nm{display:block;white-space:nowrap}
.np .st{display:block;white-space:nowrap}
.tr{flex:none;gap:14px}
.src{display:flex}
.sheet{padding:20px 24px 24px}
.fs{flex-wrap:nowrap;height:auto;min-height:80px;padding:0 16px}
.fs .tx{flex:1}
.fs .st{display:block;white-space:nowrap}
.fs>.pill{flex:none}
.rm{height:168px;min-height:0;gap:0}
.ev .t{width:112px}
}
@container casa (min-width:720px){
.chips,.acc{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:12px}
.chips>.cp:first-child:nth-last-child(odd),.acc>.cp:first-child:nth-last-child(odd){grid-column:auto}
}
@container casa (min-width:1000px){
.grid.rg{grid-template-columns:repeat(4,minmax(0,1fr))}
.lbody{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:14px 20px}
.lfl{display:flex;flex-direction:column;gap:14px;min-width:0}
.lbody>.sec>.ag{flex:1;height:auto;min-height:176px}
.fbot{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px 20px;align-items:end}
.fbot .fs{height:96px}
.fbot .fs .st{white-space:normal;display:-webkit-box}
.lg .lk{height:76px}
.wc .tile{padding:0 4px}
.wc .ic{width:32px;height:32px}
.lfl{gap:10px}
}
/* v0.3.0 — navegação como o casa-nav-card: barra fixa em baixo (viewport < 900 px) ou pílulas flutuantes no topo (>= 900 px); fora do ha-card */
.nvw{position:fixed;z-index:3;box-sizing:border-box;left:0;right:0;bottom:0;padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px));background:var(--card-background-color);border-top:1px solid var(--divider-color);color:var(--primary-text-color)}
.nv{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:4px}
.it{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:56px;min-width:0;padding:0 2px;border-radius:14px;box-sizing:border-box;color:var(--secondary-text-color);font-size:13px;font-weight:500;line-height:1.2;white-space:nowrap}
.it ha-icon{--mdc-icon-size:20px}
.it .lb{max-width:100%;overflow:hidden;text-overflow:ellipsis}
.it.on{background:var(--primary-text-color);color:var(--card-background-color);font-weight:600}
ha-card{padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))}
@media (min-width:900px){
.nvw{top:var(--casa-top,0px);bottom:auto;left:var(--casa-l,0px);right:var(--casa-r,0px);display:flex;justify-content:center;padding:4px 0;border:0;background:var(--lovelace-background,var(--primary-background-color,#181926))}
.nv{display:inline-flex;align-items:center;gap:2px;padding:5px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:999px}
.it{flex-direction:row;gap:8px;padding:0 14px;border-radius:999px;font-size:14px}
ha-card{padding-top:76px;padding-bottom:0}
}
/* v0.5.0 — segmentos como no cartão do som: bloco arredondado, selecionado invertido, sem pílulas; interruptores uniformes */
.seg{display:flex;gap:4px;padding:4px;border-radius:16px;background:var(--secondary-background-color);box-sizing:border-box;min-width:0}
.sg{flex:1 0 auto;min-width:0;height:56px;padding:0 14px;box-sizing:border-box;border-radius:12px;font-size:15px;font-weight:500;display:block;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sg.on{background:var(--primary-text-color);color:var(--ink);font-weight:600}
.sg.fl{box-shadow:inset 0 0 0 2px var(--primary-color)}
.lr.det>.seg{order:2;flex:0 0 100%}
.fr>.seg{flex:0 0 100%}
.pill.dt,.fr>.pill,.fs>.pill,.spk>.pill,.qmore{border-radius:12px}
.sw{width:44px;height:24px;padding:2px}
.sw i{width:20px;height:20px}
.tile.in .sw.on,.pill.in .sw.on,.sw.on{justify-content:flex-end;background:var(--primary-text-color)}
.tile.in .sw.on i,.pill.in .sw.on i,.sw.on i{background:var(--ink)}
.it{border-radius:12px}
.hall .lt input[type=range]{height:28px}
@container casa (min-width:520px){
.lr.det>.seg{order:0;flex:none}
}
@container casa (min-width:640px){
.fr>.seg{flex:none}
}
@media (min-width:900px){
.nv{gap:4px;padding:4px;border:0;border-radius:16px}
.it{padding:0 16px;border-radius:12px;font-size:15px}
}
/* v0.6.0 — ação "Anunciar" na navegação (depois de um divisor nas pílulas de topo); bloco Família do piso: painel no fim da página ou, com largura, coluna à direita com rolagem própria */
.nvd{display:none}
@media (min-width:900px){
.nvd{display:block;flex:none;width:1px;height:28px;margin:0 4px;background:var(--divider-color)}
}
.fx,.fmain{display:contents}
.fam{order:1;min-width:0;border-radius:16px;background:var(--secondary-background-color)}
.fam .fi{display:flex;flex-direction:column;min-width:0}
.fam h2{padding:16px 16px 0}
.fam .fb{min-width:0;min-height:120px;--secondary-background-color:var(--casa-b);--card-background-color:var(--casa-a);--ha-card-background:var(--casa-a);--ha-card-border-width:0px;--ha-card-box-shadow:none;--ha-card-border-radius:16px}
@container casa (min-width:1190px){
.fx.has{display:grid;grid-template-columns:minmax(0,1fr) 352px;grid-template-rows:minmax(0,1fr) auto;gap:14px 20px;flex:1 1 auto;min-height:0}
.fx.has>.fmain{display:flex;flex-direction:column;justify-content:space-between;gap:14px;min-width:0;container-type:inline-size;container-name:casa fmain}
.fx.has>.fam{order:0;grid-column:2;grid-row:1;position:relative;min-height:0;overflow:hidden}
.fx.has>.fam>.fi{position:absolute;top:0;left:0;right:0;bottom:0}
.fx.has .fb{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fx.has .fb::-webkit-scrollbar{display:none}
.fx.has>.fbot{grid-column:1/-1}
}
@container casa (min-width:1400px){
.fx.has>.fam{grid-row:1/3}
.fx.has>.fbot{grid-column:1}
}
/* coluna principal entre 780 e 1000 px (painel de 1280 px com a coluna Família): as 4 divisões lado a lado, mais compactas */
@container fmain (min-width:780px) and (max-width:999.98px){
.grid.rg{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.rm{padding:14px 12px 14px 14px}
.rm .rh{font-size:17px;white-space:nowrap}
.rm .rc{gap:2px 8px}
.rm .rf{flex-direction:column;align-items:flex-start;flex-wrap:nowrap;gap:2px}
.wc{grid-template-columns:minmax(0,1fr);gap:6px}
.wc .tile{min-height:44px;padding:0 8px}
.wc .tm{min-height:44px;gap:8px}
.wc .ic{width:32px;height:32px}
.wc .tx{gap:0}
.wc .nm{display:block;white-space:nowrap;line-height:18px}
.wc .st{font-size:13px;line-height:16px}
}
`;
/* folha dos pop-ups: vive num elemento próprio em document.body (ver casa-tablet-base _over) */
window.__casaTablet.OV_CSS = `
:host{all:initial;position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;display:block;width:auto;height:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;color:var(--primary-text-color);font-size:14px;-webkit-font-smoothing:antialiased}
.scrim{position:fixed;top:0;left:0;right:0;bottom:0;z-index:auto;container-type:normal;box-sizing:border-box;padding:16px 0 0;padding-top:calc(16px + env(safe-area-inset-top,0px));background:rgba(24,25,38,.72);display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch}
.scrim>button.bg{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:0;flex:none}
.sheet{position:relative;flex:0 1 auto;min-height:0;width:100%;max-width:none;max-height:none;display:flex;flex-direction:column;gap:0;padding:0;overflow:hidden;border-radius:16px;background:var(--secondary-background-color);box-sizing:border-box}
.sheet.big{flex:1 1 auto;border-radius:16px 16px 0 0}
.emb{min-height:0}
.sh{flex:none;display:flex;align-items:center;min-height:56px;padding:16px 16px 12px;box-sizing:border-box}
.sh>div{flex:1 1 auto;min-width:0;margin-right:12px}
.sh .sub{display:block}
.sb{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:4px 16px 20px;padding-bottom:calc(20px + env(safe-area-inset-bottom,0px));box-sizing:border-box}
.sb>*{margin-top:16px}
.sb>*:first-child{margin-top:0}
.sb>.vol{margin-top:8px}
@media (min-width:900px){
.scrim{padding:24px;align-items:center}
.sheet{max-width:720px}
.sheet.big{flex:0 1 auto;max-width:920px;border-radius:16px}
.sh{padding:20px 24px 12px}
.sb{padding:4px 24px 24px}
.grid.mg{grid-template-columns:repeat(2,minmax(0,1fr))}
.tile.lt{padding:0 16px 0 14px}
.lt .tm{gap:14px}
.lt .ic{width:44px;height:44px}
}
.qr{display:flex;align-items:center;min-height:56px;border-radius:12px}
.sb>.qr{margin-top:4px}
.sb>h3{margin-top:16px}
.qm{flex:1 1 auto;min-width:0;display:flex;align-items:center;min-height:56px;padding:4px 8px 4px 4px;box-sizing:border-box;border-radius:12px}
.qa{position:relative;flex:none;width:48px;height:48px;margin-right:12px;border-radius:8px;overflow:hidden;display:grid;place-items:center;background:var(--card-background-color);color:var(--secondary-text-color)}
.qa img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
.qm .nm{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qx{flex:none;width:56px;height:56px;border-radius:50%;display:grid;place-items:center;color:var(--secondary-text-color)}
.qr.cur{background:var(--card-background-color)}
.qr.cur .qm:disabled{opacity:1}
.qr.cur .qa{background:var(--secondary-background-color)}
.qe{padding:24px 0;text-align:center;color:var(--secondary-text-color);font-size:15px}
.qmore{width:100%}
.sheet.pp{background:var(--card-background-color)}
.sheet.pp .x{background:var(--secondary-background-color)}
.sheet.pp .emb{min-height:240px}
`;
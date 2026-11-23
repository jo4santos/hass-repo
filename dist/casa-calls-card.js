/* casa-calls-card v0.9.1 — página Chamadas: o telefone (cartão voip-stack-card real, só emoldurado), Cozinha (Ligar num toque, Entrar em dois toques, Não incomodar); back = botões de voltar (tablets de parede); contacts = mosaicos grandes para chamar num toque; phone.state = faixa grande Atender/Rejeitar/Desligar; phone.dropin = entrada em curso (atende sozinho neste browser); phone.collapse = telefone original em «Mais opções»; phone.video = chamadas com vídeo (palco de vídeo durante a chamada, só os nossos botões); phone.camera = interruptor da câmara deste telefone; kitchen.volume = regulador do volume das chamadas; call_volume = nível mínimo do volume do tablet ao começar uma chamada (só com a interface JavaScript do Fully Kiosk; nunca baixa); ?atender=1 no endereço (vindo da notificação) = atende sozinho a chamada que estiver a tocar neste telefone e retira o parâmetro; video_quality = {width, height, fps, bitrate}: pede mais definição e débito à câmara deste telefone nas chamadas entre telefones da casa (só com o voip-stack v2026.11.0; noutra versão não faz nada); debug: true = linha pequena no palco com o tamanho e o ritmo da imagem recebida (↓) e enviada (↑); contacts[].group = título do grupo («Pessoas», «Divisões»): os mosaicos ficam agrupados, com um título pequeno por grupo, pela ordem em que os grupos aparecem (sem group fica a lista simples de sempre); com mais de 4 mosaicos passam a compactos (3 por linha em ecrãs estreitos, mais em ecrãs largos); contacts[].label = nome por extenso para as frases («quarto das crianças»); contacts[].peer = nome(s) do telefone tal como chega na chamada, quando é diferente de name e destination; primary = [contactos] = mosaicos grandes principais (destination pode ser um grupo de toque: «casa», «piso1», «rc»; caption = legenda quando há um só) e more = {label, title, contacts} = botão «Uma divisão…» que abre uma janela (em document.body, ancorada em cima, X, Esc ou toque fora fecham) com os restantes mosaicos: um toque liga e fecha; com primary/more a lista contacts é ignorada; ring_groups = {grupo: «para casa»} acrescenta o destino à frase de quem está a ligar, só quando o evento da chamada diz que o destino foi esse grupo */
(() => {
/* câmara da frente por omissão: em tablets com duas câmaras (Surface) o browser escolhe a de trás; aqui pede-se a da frente (ideal, nunca falha) sempre que o pedido não escolhe câmara */
try {
  const md = navigator.mediaDevices;
  if (md && typeof md.getUserMedia === 'function' && !md.__casaFront) {
    const gum = md.getUserMedia.bind(md); md.__casaFront = true;
    md.getUserMedia = (c) => {
      try {
        if (globalThis.__casaFrontOff !== true && c && c.video) {
          const v = c.video === true ? {} : c.video;
          if (typeof v === 'object' && v.facingMode == null && v.deviceId == null) c = Object.assign({}, c, { video: Object.assign({}, v, { facingMode: { ideal: 'user' } }) });
        }
      } catch (e) { /* fica o pedido original */ }
      return gum(c);
    };
  }
} catch (e) { /* nada */ }
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ST = { offline: 'Sem ligação', unavailable: 'Sem ligação', idle: 'Livre', ringing: 'A tocar', remote_ringing: 'A chamar', calling: 'A ligar', connecting: 'A ligar', in_call: 'Em chamada', held: 'Em espera', terminating: 'A terminar' };
const OUT = ['calling', 'remote_ringing', 'connecting'], TALK = ['in_call', 'held'];
const HUES = ['#8aadf4', '#f5bde6', '#a6da95', '#eed49f', '#c6a0f6', '#8bd5ca'];
const cap = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
const mmss = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(t / 60), s = t % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; };
const VS_VER = 'v2026.11.0';
/* só com o cartão voip-stack desta versão: durante o vídeo esconde a barra e os ícones dele, fica só a imagem */
const VS_CSS = `:host([data-casa-video]){height:100%}
:host([data-casa-video]) ha-card.card.video-active{min-height:0!important;border-radius:12px}
:host([data-casa-video]) ha-card.card.video-active>.button-container,:host([data-casa-video]) .card.video-active .runtime-controls,:host([data-casa-video]) .card.video-active>.header,:host([data-casa-video]) .card.video-active>.phone-activity,:host([data-casa-video]) .card.video-active>.video-shade{display:none!important}
:host([data-casa-video]) .card.video-active>canvas.video-canvas{object-fit:fill}`;
/* janela «Uma divisão…»: vive em document.body com raiz própria; as cores vêm do cartão por variáveis */
const MORE_VARS = ['--primary-text-color', '--secondary-text-color', '--card-background-color', '--secondary-background-color', '--primary-color', '--error-color'];
const MORE_CSS = `:host{position:fixed;inset:0;margin:0;padding:0;border:0;width:100%;height:100%;max-width:none;max-height:none;background:transparent;overflow:visible;z-index:9}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
button:disabled{opacity:.45;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
ha-icon{--mdc-icon-size:22px;flex:none;display:inline-flex}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.55)}
.dlg{position:fixed;top:16px;left:50%;transform:translateX(-50%);width:min(640px,calc(100% - 24px));max-height:calc(100% - 32px);overflow:auto;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:20px;background:var(--secondary-background-color);color:var(--primary-text-color);box-shadow:0 12px 40px rgba(0,0,0,.45)}
.dh{display:flex;align-items:center;gap:12px;min-height:48px}
.dt{flex:1;min-width:0;font-size:20px;font-weight:600;line-height:28px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.x{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:var(--card-background-color)}
.dq{font-size:14px;line-height:20px;color:var(--secondary-text-color)}
.dq[hidden]{display:none}
.cts{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.ct{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:96px;padding:8px 6px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box;text-align:center}
.ct:not(:disabled):active{transform:scale(.97)}
.av{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:var(--hue,#8aadf4);color:#181926;font-size:20px;font-weight:600;line-height:1;--mdc-icon-size:26px}
.av img{width:100%;height:100%;object-fit:cover;display:block}
.cn{font-size:16px;font-weight:600;line-height:22px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t .ct{min-height:104px}.t .x{width:56px;height:56px}
@media (max-width:520px){.cts{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.ct{padding:8px 4px}.cn{font-size:15px;line-height:20px}}
`;
const DOT = { idle: 'ok', ringing: 'act', remote_ringing: 'act', calling: 'act', connecting: 'act', in_call: 'act', held: 'act', terminating: 'act' };
const CSS = `
:host{display:block;container-type:inline-size}
:host{--casa-a:var(--card-background-color);--casa-b:var(--secondary-background-color)}ha-card{background:none;border:0;box-shadow:none;--secondary-background-color:var(--casa-a);--card-background-color:var(--casa-b);padding:0;display:flex;flex-direction:column;gap:14px;color:var(--primary-text-color)}
button{font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}
button:disabled,button[aria-disabled="true"]{opacity:.45;cursor:default}
button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
ha-icon{--mdc-icon-size:20px;flex:none;display:inline-flex}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:10px;min-height:44px}
.sum{font-size:20px;font-weight:600;line-height:28px;margin-right:auto}
.back{display:flex;gap:8px}
.bk{height:44px;padding:0 16px 0 12px;border-radius:12px;background:var(--secondary-background-color);font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.cols{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
.panel{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:16px;background:var(--secondary-background-color);min-width:0;box-sizing:border-box}
.hd{display:flex;align-items:center;gap:12px;height:44px}
.ic{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color)}
.ic.lg{width:44px;height:44px;background:var(--card-background-color);--mdc-icon-size:22px}
.tx{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.ttl{font-size:16px;font-weight:600;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cap{font-size:13px;line-height:18px;height:18px;color:var(--secondary-text-color);display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}
.dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--secondary-text-color);opacity:.6}
.dot.ok{background:#a6da95;opacity:1}.dot.act{background:#eed49f;opacity:1}
.list{display:flex;flex-direction:column;gap:8px}
.tile{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;height:64px;padding:0 12px 0 10px;border-radius:12px;background:var(--card-background-color);min-width:0;width:100%;box-sizing:border-box}
.tile.on{background:var(--primary-text-color);color:var(--card-background-color)}
.tile.on .ic{background:var(--primary-color);color:#181926}
.tile.warn{background:var(--error-color,#ed8796);color:#181926}
.tile.warn .ic{background:#181926;color:var(--error-color,#ed8796)}
.tile.warn::after{content:'';position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(0,0,0,.35);transform-origin:left;animation:cd var(--cd,5s) linear forwards}
@keyframes cd{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.nm{font-size:14px;font-weight:500;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:12px;line-height:16px;height:16px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.on .st,.tile.warn .st{color:inherit;opacity:.8}
.st.red{color:#ed8796}
.sw{display:flex;align-items:center;justify-content:space-between;gap:12px;height:44px;padding:0 10px 0 14px;border-radius:12px;background:var(--card-background-color);font-size:14px;font-weight:500;width:100%;box-sizing:border-box;white-space:nowrap}
.sw .lb{min-width:0;overflow:hidden;text-overflow:ellipsis}
.track{flex:none;width:36px;height:20px;border-radius:10px;padding:2px;box-sizing:border-box;background:rgba(127,127,127,.35);background:color-mix(in srgb,var(--primary-text-color) 22%,transparent);display:flex;justify-content:flex-start}
.knob{width:16px;height:16px;border-radius:50%;background:var(--secondary-text-color)}
.sw.son .track{background:var(--primary-text-color);justify-content:flex-end}.sw.son .knob{background:var(--card-background-color)}
/* o cartão do telefone é de terceiros: só se neutraliza a moldura do ha-card dele, por variáveis */
.phone{min-width:0;--ha-card-background:transparent;--ha-card-border-width:0px;--ha-card-border-color:transparent;--ha-card-box-shadow:none;--ha-card-border-radius:12px}
.phone>*{display:block;min-width:0}
.wait{font-size:13px;line-height:44px;color:var(--secondary-text-color);margin:0}
.wait.err{color:#ed8796}
/* palco: mosaicos de contactos e faixa da chamada ocupam a mesma célula, por isso a altura nunca muda */
.stage{display:grid;min-width:0}
.stage>*{grid-area:1/1;min-width:0}
.stage>.off{visibility:hidden;pointer-events:none}
.stage.solo>.off{display:none}
.pick{display:flex;flex-direction:column;gap:10px}
.q{font-size:18px;font-weight:600;line-height:28px;height:28px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.q.red{color:#ed8796}
.cts{flex:1;display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:12px}
.ct{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:148px;padding:12px;border-radius:12px;background:var(--card-background-color);min-width:0;box-sizing:border-box;text-align:center;transition:transform .08s}
.ct:not(:disabled):active{transform:scale(.97)}
.ct .tx{flex:none;align-items:center;max-width:100%}
.one .ct .tx{flex:1;align-items:flex-start}
.av{flex:none;width:84px;height:84px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:var(--hue,#8aadf4);color:#181926;font-size:32px;font-weight:600;line-height:1;--mdc-icon-size:44px}
.av img{width:100%;height:100%;object-fit:cover;display:block}
.cn{font-size:22px;font-weight:600;line-height:28px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch{font-size:14px;line-height:20px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.grps{flex:1;display:flex;flex-direction:column;gap:12px;min-width:0}
.grp{display:flex;flex-direction:column;gap:6px;min-width:0}
.grp .cts{flex:none}
.gt{font-size:13px;font-weight:600;line-height:18px;height:18px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mbtn{flex:none;display:flex;align-items:center;gap:10px;height:44px;padding:0 12px 0 14px;border-radius:12px;background:var(--card-background-color);font-size:14px;font-weight:500;width:100%;box-sizing:border-box;white-space:nowrap}
.mbtn span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.t .mbtn{height:56px;font-size:15px;font-weight:600}
.one .ct{flex-direction:row;justify-content:flex-start;text-align:left;gap:16px;padding:12px 20px;min-height:96px}
.one .av{width:64px;height:64px;font-size:26px;--mdc-icon-size:34px}
.live{display:flex;flex-direction:column;justify-content:space-between;gap:12px}
.who{display:flex;align-items:center;gap:14px;min-height:64px;min-width:0}
.who .av{width:64px;height:64px;font-size:26px;--mdc-icon-size:34px}
.wt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.w1{font-size:22px;font-weight:600;line-height:30px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.w2{font-size:16px;line-height:22px;height:22px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.w2.red{color:#ed8796}
.live.wrap .w1{white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.btns{display:flex;gap:12px}
.big{flex:1 1 0;min-width:0;height:96px;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:22px;font-weight:600;color:#181926;--mdc-icon-size:32px;white-space:nowrap;transition:transform .08s}
.big:not(:disabled):active{transform:scale(.98)}
.big.ok{background:#a6da95}.big.no{background:#ed8796}
.big[hidden]{display:none}
/* entrada em curso: faixa simples e pequena, sem destaque */
.live.calm{justify-content:flex-start}
.live.calm .who{min-height:44px;gap:12px}
.live.calm .who .av{width:44px;height:44px;font-size:18px;--mdc-icon-size:24px}
.live.calm .w1{font-size:18px;line-height:24px}
.live.calm .w2{font-size:14px;line-height:20px;height:20px}
.live.calm .cl small{font-size:12px}
.live.calm .btns .big{flex:none;height:64px;padding:0 28px;font-size:18px;gap:10px;--mdc-icon-size:24px}
.more{display:flex;align-items:center;justify-content:space-between;gap:12px;height:44px;padding:0 12px 0 14px;border-radius:12px;background:var(--card-background-color);font-size:14px;font-weight:500;width:100%;box-sizing:border-box;white-space:nowrap}
.more ha-icon{transition:transform .15s}
.more[aria-expanded="true"] ha-icon{transform:rotate(180deg)}
/* telefone original recolhido: continua no DOM e com layout (só fica cortado), para não suspender o áudio */
.clip{min-width:0}
.clip.shut{max-height:0;overflow:hidden}
.more[hidden]{display:none}
/* palco de vídeo: durante a chamada o telefone original ocupa uma caixa fixa 16:9; sem imagem fica tapado */
.vcover{display:none}
.clip.vid{position:relative;width:100%;aspect-ratio:16/9;max-height:var(--vmax,420px);overflow:hidden;border-radius:12px;background:#11111b}
.clip.vid .phone,.clip.vid .phone>*{height:100%}
.clip.vid .vcover{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#11111b;color:#b8c0e0;font-size:16px;--mdc-icon-size:40px}
.clip.vid.on .vcover{display:none}
/* imagem ajustada ao formato real do vídeo (caixa centrada); Rodar e Formato corrigem imagem deitada ou esticada */
.clip.vid.on .phone{position:absolute;transform-origin:center}
.vtools{display:none}
.clip.vid.on .vtools{position:absolute;top:8px;right:8px;z-index:3;display:flex;gap:8px}
.vt{height:44px;padding:0 14px 0 10px;border-radius:12px;background:rgba(17,17,27,.72);color:#cad3f5;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.vt.von{background:#cad3f5;color:#181926}
/* a tua imagem (como numa videochamada): canto do palco, espelhada; toca para mudar de canto */
.pipb{display:none}
.clip.vid .pipb:not([hidden]){display:block;position:absolute;z-index:4;width:28%;aspect-ratio:var(--ar,4/3);right:8px;bottom:8px;border-radius:12px;overflow:hidden;box-shadow:0 0 0 2px rgba(202,211,245,.55);background:#000;line-height:0}
.clip.vid .pipb.port:not([hidden]){width:auto;height:52%}
.clip.vid .pipb.c1{right:auto;left:8px}
.clip.vid .pipb.c2{right:auto;left:8px;bottom:auto;top:8px}
.pipb video{width:100%;height:100%;display:block;object-fit:cover;transform:scaleX(-1)}
/* debug: true — números da imagem (canto inferior esquerdo do palco) */
.vdbg{display:none}
.clip.vid .vdbg:not([hidden]){display:block;position:absolute;left:8px;bottom:8px;z-index:5;padding:3px 8px;border-radius:8px;background:rgba(17,17,27,.78);color:#cad3f5;font:600 12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre;pointer-events:none}
.big.cam{flex:0 1 40%;background:var(--card-background-color);color:var(--primary-text-color)}
.big.cam.con{background:var(--primary-text-color);color:var(--card-background-color)}
.cl{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15;min-width:0}
.cl small{font-size:13px;font-weight:500;opacity:.8}
.vol{display:flex;align-items:center;justify-content:space-between;gap:12px;height:44px;padding:0 6px 0 14px;border-radius:12px;background:var(--card-background-color);font-size:14px;font-weight:500;box-sizing:border-box;white-space:nowrap}
.vc{display:flex;align-items:center;gap:6px}
.vb{width:44px;height:36px;border-radius:8px;background:var(--secondary-background-color);display:grid;place-items:center}
.vv{min-width:52px;text-align:center;font-variant-numeric:tabular-nums}
@container (min-width:900px){.cols.two{grid-template-columns:minmax(0,3fr) minmax(0,2fr)}}
@container (max-width:520px){.cn{font-size:20px}.w1{font-size:18px;line-height:26px}.who .av{width:48px;height:48px;font-size:20px;--mdc-icon-size:26px}.who{gap:12px}.big{font-size:20px;gap:8px;--mdc-icon-size:26px}.big.cam{flex:1 1 0}.av{width:72px;height:72px}}
/* tablets de parede: alvos maiores */
.t .bk{height:56px;padding:0 20px 0 16px;font-size:15px;font-weight:600}
.t .tile{height:76px;padding:0 16px 0 14px;gap:14px}
.t .tile .ic{width:44px;height:44px}
.t .nm{font-size:16px;line-height:20px}.t .st{font-size:13px;line-height:18px;height:18px}
.t .sw{height:56px;font-size:15px}
.t .q{font-size:20px}
.t .ct{min-height:196px;gap:14px}
.t .ct .av{width:96px;height:96px;font-size:36px;--mdc-icon-size:50px}
.t .one .ct{min-height:104px}
.t .one .ct .av{width:64px;height:64px;font-size:26px;--mdc-icon-size:34px}
.t .big{height:116px;font-size:24px}
.t .more{height:56px;font-size:15px;font-weight:600}
.t .clip.vid{--vmax:312px}
.t .vt{height:52px;font-size:15px;padding:0 16px 0 12px}
.t .vol{height:56px;font-size:15px}
.t .vb{width:56px;height:44px}
/* estreito (painéis de parede em retrato, telemóveis): mosaicos mais compactos; mais de 3 contactos passam a 3 por linha */
@container (max-width:520px){.cts{gap:8px}.cts.many{grid-template-columns:repeat(3,minmax(0,1fr))}.ct,.t .ct{min-height:148px;padding:10px 6px;gap:10px}.ct .av,.t .ct .av{width:72px;height:72px;font-size:28px;--mdc-icon-size:38px}.cn{font-size:17px;line-height:24px}.one .cn{font-size:20px;line-height:28px}.one .ct,.t .one .ct{padding:12px 20px;min-height:96px}.one .ct .av,.t .one .ct .av{width:64px;height:64px}}
@container (max-width:760px){.cts.many .cn{font-size:19px}}
/* mais de 4 mosaicos: compactos, todos do mesmo tamanho; 3 por linha em ecrãs estreitos, os que couberem nos largos */
.pick.cmp .cts,.pick.cmp .cts.many{grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px}
.pick.cmp .ct{min-height:96px;padding:8px 6px;gap:6px}
.t .pick.cmp .ct{min-height:104px}
.pick.cmp .ct .av{width:48px;height:48px;font-size:20px;--mdc-icon-size:26px}
.pick.cmp .cts .cn{font-size:16px;line-height:22px}
@container (max-width:520px){.pick.cmp .cts,.pick.cmp .cts.many{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pick.cmp .ct{padding:8px 4px}.pick.cmp .cts .cn{font-size:15px;line-height:20px}}
/* quatro mosaicos principais em ecrãs estreitos: dois por linha */
@container (max-width:520px){.cts.many.n4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){.tile.warn::after{animation:none;transform:none}.ct,.big,.more ha-icon{transition:none}}
`;
class CasaCallsCard extends HTMLElement {
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._built = false; this._sig = null; this._arm = false; this._busy = null; this._err = null; this._phone = null; this._gen = 0;
    this._pend = null; this._act = null; this._cerr = null; this._open = false; this._auto = null; this._tick = null; this._vidOn = false; this._vobs = null; this._vro = null; this._vrot = 0; this._vswap = false; this._vcard = null; this._camPend = null;
  }
  setConfig(c) {
    if (!c || !c.phone || !c.phone.device_id) throw new Error('Defina "phone.device_id"');
    /* a mesma configuração outra vez não mexe em nada: o telefone criado fica onde está */
    const json = JSON.stringify(c);
    if (json === this._json) return;
    this._json = json;
    this._c = Object.assign({ title: 'Chamadas', arm_seconds: 5, lock_seconds: 3 }, c);
    this._k = c.kitchen || null;
    const okc = (l) => (Array.isArray(l) ? l : []).filter((x) => x && x.name && x.destination);
    this._moreClose();
    /* primary/more: os principais primeiro, os da janela a seguir (o índice de cada contacto é a posição nesta lista) */
    this._pm = Array.isArray(c.primary) || !!(c.more && Array.isArray(c.more.contacts));
    this._np = this._pm ? okc(c.primary).length : 0;
    this._cts = this._pm ? okc(c.primary).concat(okc(c.more && c.more.contacts)) : okc(c.contacts);
    this._nv = this._pm ? this._np : this._cts.length;
    this._rg = {}; if (c.ring_groups && typeof c.ring_groups === 'object') Object.keys(c.ring_groups).forEach((k) => { this._rg[String(k).trim().toLowerCase()] = String(c.ring_groups[k]); });
    /* grupos: pela ordem em que aparecem; contactos sem group ficam num grupo sem título, à frente */
    this._grps = null;
    if (!this._pm && this._cts.some((x) => x.group)) {
      const g = [];
      this._cts.forEach((x, i) => { const t = x.group ? String(x.group) : ''; let e = g.find((y) => y.title === t); if (!e) { e = { title: t, idx: [] }; if (t) g.push(e); else g.unshift(e); } e.idx.push(i); });
      this._grps = g;
    }
    this._disarm(); this._drop(); this._stopAuto(); this._vidOff(); this._camPend = null; this._pend = null; this._act = null; this._cerr = null; this._built = false; this._sig = null;
    if (this._h) this._update();
  }
  getCardSize() { return 8; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  connectedCallback() {
    if (!this._onLoc) this._onLoc = () => { this._moreClose(); this._linkCheck(); if (this._built && this._h) this._sync(); };
    window.addEventListener('location-changed', this._onLoc); window.addEventListener('popstate', this._onLoc);
    if (!this._onHide) this._onHide = (ev) => { if (ev.type === 'pagehide' || document.visibilityState === 'hidden') this._ownStop(); };
    window.addEventListener('pagehide', this._onHide); document.addEventListener('visibilitychange', this._onHide);
    this._linkCheck();
    if (this._h) this._update();
  }
  /* ligação da notificação: /casa-v2/chamadas?atender=1 (ou #atender=1) vale 10 s; depois o parâmetro sai do endereço */
  _linkHas() { try { return new URLSearchParams(location.search).get('atender') === '1' || /(^|[#&?])atender=1(&|$)/.test(location.hash || ''); } catch (e) { return false; } }
  _linkStrip() {
    try {
      const u = new URL(location.href); u.searchParams.delete('atender');
      u.hash = (u.hash || '').replace(/(^#|&)atender=1(?=&|$)/, (m, a) => (a === '#' ? '#' : '')).replace(/^#&?$/, '').replace(/^#&/, '#');
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) { /* nada */ }
  }
  _linkCheck() {
    if (this._link || !this._linkHas()) return;
    const l = (this._link = { t: 0 });
    l.t = setTimeout(() => { if (this._link === l) { this._link = null; this._linkStrip(); } }, 10000);
  }
  _linkDone() { if (this._link) { clearTimeout(this._link.t); this._link = null; } this._linkStrip(); }
  disconnectedCallback() { this._moreClose(); clearInterval(this._dbgT); this._dbgT = null; try { if (globalThis.__casaVq && globalThis.__casaVq.o === this) globalThis.__casaVq = null; } catch (e) { /* nada */ } clearInterval(this._vpoll); this._vpoll = null; this._vwatch = false; this._ownStop(); if (this._onHide) { window.removeEventListener('pagehide', this._onHide); document.removeEventListener('visibilitychange', this._onHide); } if (this._onLoc) { window.removeEventListener('location-changed', this._onLoc); window.removeEventListener('popstate', this._onLoc); } if (this._link) { clearTimeout(this._link.t); this._link = null; } this._disarm(); this._stopAuto(); clearInterval(this._tick); this._tick = null; if (this._vobs) { this._vobs.disconnect(); this._vobs = null; this._vcard = null; } if (this._vro) { this._vro.disconnect(); this._vro = null; } }
  set hass(h) {
    this._h = h;
    if (this._phone) this._phone.hass = h;
    this._update();
  }
  _s(e) { return e && this._h ? this._h.states[e] : null; }
  _bad(e) { const s = this._s(e); return !s || s.state === 'unavailable' || s.state === 'unknown'; }
  _update() {
    if (!this._h || !this._c) return;
    if (!this._built) this._build();
    this._mount();
    const k = this._k || {};
    const p = this._c.phone, ps = this._s(p.state), pe = this._s(p.event), pa = (ps && ps.attributes) || {}, ea = (pe && pe.attributes) || {};
    const sig = [k.state, k.dnd, k.call_script, k.dropin_script, k.volume, p.camera].map((e) => { const s = this._s(e); return s ? (e.startsWith('script.') ? '1' : s.state) : '-'; }).join(';')
      + '|' + [ps ? ps.state : '-', ps ? ps.last_changed : '', pa.direction, pa.peer_name, pa.call_id, ea.event_type, ea.direction, ea.peer_name, ea.call_id, ea.callee, ea.destination, (this._s(p.dropin) || {}).state].join(';')
      + '|' + this._cts.map((x) => this._pic(x) || '').join(';');
    if (sig !== this._sig) { this._sig = sig; this._sync(); }
  }
  _build() {
    const c = this._c, k = this._k, p = c.phone;
    const hasActs = !!(k && (k.call_script || k.dropin_script));
    const tile = (key, icon, name) => `<button class="tile" data-act="${key}"><span class="ic"><ha-icon icon="${icon}"></ha-icon></span><span class="tx"><span class="nm">${name}</span><span class="st"></span></span></button>`;
    const back = Array.isArray(c.back) ? c.back.filter((b) => b && b.path) : [];
    const cts = (idx, n) => `<div class="cts${this._nv > 3 ? ' many' : ''}${this._pm && this._nv === 4 ? ' n4' : ''}" style="--n:${n}">${idx.map((i) => { const x = this._cts[i]; return `<button class="ct" data-ct="${i}"><span class="av" style="--hue:${esc(x.color || HUES[i % HUES.length])}"></span><span class="tx"><span class="cn">${esc(x.name)}</span>${this._nv === 1 ? `<span class="ch">${esc(x.caption || 'Toca para ligar')}</span>` : ''}</span></button>`; }).join('')}</div>`;
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
    <ha-card class="${back.length || c.big ? 't' : ''}">
      <div class="top"><span class="sum">${esc(c.title)}</span>${back.length ? `<nav class="back" aria-label="Voltar">${back.map((b, i) => `<button class="bk" data-back="${i}"><ha-icon icon="${esc(b.icon || 'mdi:arrow-left')}"></ha-icon><span>${esc(b.name)}</span></button>`).join('')}</nav>` : ''}</div>
      <div class="cols${k ? ' two' : ''}">
        <section class="panel" aria-label="${esc(p.caption || 'O teu telefone')}">
          <div class="hd"><span class="ic lg"><ha-icon icon="${esc(p.icon || 'mdi:phone-outline')}"></ha-icon></span><span class="tx"><span class="ttl">${esc(p.name || 'Telefone')}</span><span class="cap">${esc(p.caption || 'O teu telefone')}</span></span></div>
          ${p.state ? `<div class="stage${this._cts.length ? '' : ' solo'}">
            ${this._cts.length ? `<div class="pick${this._nv === 1 ? ' one' : ''}${this._nv > 4 ? ' cmp' : ''}"><div class="q" role="status" aria-live="polite"></div>${this._pm ? `${this._np ? cts(this._cts.slice(0, this._np).map((x, i) => i), this._np) : ''}${this._cts.length > this._np ? `<button class="mbtn" data-mopen="1" aria-haspopup="dialog"><ha-icon icon="${esc((c.more && c.more.icon) || 'mdi:view-grid-outline')}"></ha-icon><span>${esc((c.more && c.more.label) || 'Uma divisão…')}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>` : ''}` : this._grps ? `<div class="grps">${this._grps.map((g) => `<div class="grp" role="group"${g.title ? ` aria-label="${esc(g.title)}"` : ''}>${g.title ? `<div class="gt">${esc(g.title)}</div>` : ''}${cts(g.idx, Math.max.apply(null, this._grps.map((y) => y.idx.length)))}</div>`).join('')}</div>` : cts(this._cts.map((x, i) => i), this._cts.length)}</div>` : ''}
            <div class="live off"><div class="who"><span class="av"></span><span class="wt" role="status" aria-live="assertive"><span class="w1"></span><span class="w2"></span></span></div>
              <div class="btns"><button class="big ok" data-call="answer"><ha-icon icon="mdi:phone"></ha-icon><span>Atender</span></button><button class="big no" data-call="decline"><ha-icon icon="mdi:phone-hangup"></ha-icon><span>Rejeitar</span></button><button class="big cam" data-call="camera" aria-pressed="false" hidden><ha-icon icon="mdi:video"></ha-icon><span class="cl"><span>Câmara</span><small></small></span></button><button class="big no" data-call="hangup" hidden><ha-icon icon="mdi:phone-hangup"></ha-icon><span>Desligar</span></button></div></div>
          </div>` : ''}
          ${p.collapse ? `<button class="more" data-more="1" aria-expanded="false"><span>Mais opções</span><ha-icon icon="mdi:chevron-down"></ha-icon></button>` : ''}
          <div class="clip${p.collapse ? ' shut' : ''}"><div class="phone"><p class="wait">A preparar o telefone…</p></div><div class="vcover"><ha-icon icon="mdi:video-off-outline"></ha-icon><span>Sem imagem</span></div><button class="pipb" data-pip="1" aria-label="A tua imagem. Toca para mudar de canto" hidden><video muted playsinline autoplay></video></button><div class="vtools"><button class="vt" data-vt="rot" aria-label="Rodar a imagem"><ha-icon icon="mdi:rotate-right"></ha-icon><span>Rodar</span></button><button class="vt" data-vt="fmt" aria-pressed="false" aria-label="Trocar o formato da imagem (corrige imagem esticada)"><ha-icon icon="mdi:aspect-ratio"></ha-icon><span>Formato</span></button></div><div class="vdbg" aria-hidden="true" hidden></div></div>
        </section>
        ${k ? `<section class="panel" aria-label="${esc(k.name || 'Cozinha')}">
          <div class="hd"><span class="ic lg"><ha-icon icon="${esc(k.icon || 'mdi:pot-steam-outline')}"></ha-icon></span><span class="tx"><span class="ttl">${esc(k.name || 'Cozinha')}</span><span class="cap" role="status" aria-live="polite">${k.state ? '<i class="dot"></i><span class="kst"></span>' : esc(k.caption || '')}</span></span></div>
          ${hasActs ? `<div class="list">${k.call_script ? tile('call', 'mdi:phone-outline', 'Ligar') : ''}${k.dropin_script ? tile('drop', 'mdi:account-voice', 'Entrar') : ''}</div>` : ''}
          ${k.dnd ? `<button class="sw" data-dnd="1" role="switch" aria-checked="false"><span class="lb">Não incomodar na cozinha</span><span class="track"><span class="knob"></span></span></button>` : ''}
          ${k.volume ? `<div class="vol"><span class="lb">Volume das chamadas</span><span class="vc"><button class="vb" data-vol="-1" aria-label="Baixar o volume das chamadas"><ha-icon icon="mdi:minus"></ha-icon></button><span class="vv" role="status"></span><button class="vb" data-vol="1" aria-label="Subir o volume das chamadas"><ha-icon icon="mdi:plus"></ha-icon></button></span></div>` : ''}
        </section>` : ''}
      </div>
    </ha-card>`;
    if (!this._wired) {
      this._wired = true;
      this.shadowRoot.addEventListener('click', (ev) => {
        const b = ev.target.closest && ev.target.closest('button[data-act],button[data-dnd],button[data-back],button[data-ct],button[data-call],button[data-more],button[data-vol],button[data-vt],button[data-pip],button[data-mopen]');
        if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
        if (b.dataset.mopen) return this._moreOpen();
        if (b.dataset.ct != null) return this._dial(Number(b.dataset.ct));
        if (b.dataset.call === 'camera') return this._cam();
        if (b.dataset.pip) { this._pipc = ((this._pipc || 0) + 1) % 3; b.classList.remove('c1', 'c2'); if (this._pipc) b.classList.add('c' + this._pipc); return; }
        if (b.dataset.vt === 'rot') { this._vrot = ((this._vrot || 0) + 1) % 4; return this._vfit(); }
        if (b.dataset.vt === 'fmt') { this._vswap = !this._vswap; return this._vfit(); }
        if (b.dataset.call) return this._ctl(b.dataset.call);
        if (b.dataset.vol) return this._vol(Number(b.dataset.vol));
        if (b.dataset.more) { this._open = !this._open; return this._sync(); }
        if (b.dataset.act === 'call') return this._call();
        if (b.dataset.act === 'drop') return this._dropin();
        if (b.dataset.dnd) return this._h.callService('input_boolean', 'toggle', {}, { entity_id: this._k.dnd });
        if (b.dataset.back != null) return this._go(this._c.back.filter((x) => x && x.path)[Number(b.dataset.back)].path);
      });
      /* se o cartão do telefone ainda não estava carregado, o HA pede para o recriar: fica tratado aqui */
      this.shadowRoot.addEventListener('ll-rebuild', (ev) => { ev.stopPropagation(); this._drop(); this._mount(); });
    }
    this._built = true;
  }
  /* telefone: criado uma única vez e mantido; nunca é recriado por atualizações de estado */
  _mount() {
    if (this._phone || this._mounting || !this._built || !this.isConnected) return;
    const gen = ++this._gen, cfg = { type: 'custom:voip-stack-card', mode: 'ha_softphone', device_id: this._c.phone.device_id };
    this._mounting = true;
    const fail = () => { if (gen !== this._gen) return; this._mounting = false; const w = this.shadowRoot.querySelector('.wait'); if (w) { w.textContent = 'O telefone não está disponível neste momento'; w.classList.add('err'); } };
    const make = (helpers) => {
      if (gen !== this._gen) return;
      if (helpers && helpers.createCardElement) return this._attach(helpers.createCardElement(cfg));
      return customElements.whenDefined('voip-stack-card').then(() => { if (gen !== this._gen) return; const el = document.createElement('voip-stack-card'); el.setConfig(cfg); this._attach(el); });
    };
    let pr;
    try { pr = typeof window.loadCardHelpers === 'function' ? Promise.resolve(window.loadCardHelpers()) : Promise.resolve(null); } catch (e) { pr = Promise.resolve(null); }
    pr.then(make, () => make(null)).catch(fail);
  }
  _attach(el) {
    this._mounting = false; this._phone = el;
    if (this._h) el.hass = this._h;
    const slot = this.shadowRoot.querySelector('.phone');
    slot.textContent = ''; slot.appendChild(el);
    this._sync();
  }
  _drop() { this._gen++; this._mounting = false; if (this._phone) { this._phone.remove(); this._phone = null; } }
  _go(path) { history.pushState(null, '', path); window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true })); }
  _disarm() { clearTimeout(this._armT); this._arm = false; }
  _dndOn() { const s = this._s(this._k && this._k.dnd); return !!s && s.state === 'on'; }
  _call() {
    if (this._busy || !this._s(this._k.call_script)) return;
    this._disarm(); this._run('call', this._k.call_script);
  }
  _dropin() {
    if (this._busy || !this._s(this._k.dropin_script) || this._dndOn()) return;
    if (!this._arm) {
      this._arm = true; this._err = null;
      this._armT = setTimeout(() => { this._arm = false; this._sync(); }, this._c.arm_seconds * 1000);
      return this._sync();
    }
    this._disarm(); this._run('drop', this._k.dropin_script);
  }
  _run(key, script) {
    const p = script.split('.'), id = (this._seq = (this._seq || 0) + 1);
    this._busy = key; this._err = null; this._sync();
    setTimeout(() => { if (this._seq === id) { this._busy = null; this._sync(); } }, this._c.lock_seconds * 1000);
    let pr;
    try { pr = Promise.resolve(this._h.callService(p[0], p[1], {})); } catch (e) { pr = Promise.reject(e); }
    pr.catch(() => {
      if (this._seq !== id) return;
      this._busy = null; this._err = key; this._sync();
      setTimeout(() => { if (this._seq === id && this._err === key) { this._err = null; this._sync(); } }, 5000);
    });
  }
  /* ---- chamada do telefone deste cartão ---- */
  _pic(x) { if (!x) return ''; if (x.picture) return x.picture; const s = this._s(x.picture_entity); return (s && s.attributes && s.attributes.entity_picture) || ''; }
  _avatar(el, x, hue) {
    const pic = this._pic(x), key = pic ? 'p' + pic : x && x.icon ? 'i' + x.icon : x ? 't' + x.name : 'i-';
    if (el.dataset.k === key) return;
    el.dataset.k = key; el.textContent = '';
    if (hue) el.style.setProperty('--hue', hue);
    if (pic) { const im = document.createElement('img'); im.alt = ''; im.src = pic; el.appendChild(im); }
    else if (!x || x.icon) { const ic = document.createElement('ha-icon'); ic.setAttribute('icon', x ? x.icon : 'mdi:account'); el.appendChild(ic); }
    else el.textContent = String(x.name).trim().charAt(0).toUpperCase();
  }
  _phase() {
    const p = this._c.phone, s = this._s(p.state), raw = s ? s.state : 'unavailable';
    const a = (s && s.attributes) || {}, ev = this._s(p.event), ea = ev && ev.attributes && ev.attributes.event_type !== 'ended' ? ev.attributes : {};
    const dir = a.direction || ea.direction || '', peer = a.peer_name || ea.peer_name || '';
    let ph = 'idle';
    if (raw === 'ringing') ph = dir === 'outgoing' ? 'out' : 'ring';
    else if (OUT.indexOf(raw) >= 0) ph = raw === 'connecting' && dir === 'incoming' ? 'answering' : 'out';
    else if (raw === 'answering') ph = 'answering';
    else if (TALK.indexOf(raw) >= 0) ph = 'talk';
    else if (raw === 'terminating') ph = 'ending';
    const drop = p.dropin && (this._s(p.dropin) || {}).state === 'on' && dir !== 'outgoing' && (ph === 'ring' || ph === 'answering' || ph === 'talk');
    /* destino de grupo: só com o evento desta mesma chamada (call_id igual ao do sensor) */
    const cal = a.call_id && ea.call_id && String(a.call_id) === String(ea.call_id) ? String(ea.callee || ea.destination || '').trim().toLowerCase() : '';
    return { raw, ph, dir, peer, to: (cal && this._rg && this._rg[cal]) || '', drop: !!drop, ready: raw === 'idle', since: s && s.last_changed ? Date.parse(s.last_changed) : NaN };
  }
  _who(peer) {
    const l = String(peer || '').trim().toLowerCase();
    const eq = (v) => String(v).trim().toLowerCase() === l;
    const x = l ? this._cts.find((y) => eq(y.destination) || eq(y.name) || (y.peer != null && [].concat(y.peer).some(eq))) : null;
    const n = x ? (x.label || x.name) : (peer || 'Alguém'), ar = x && x.article ? String(x.article) : '';
    return { x, i: x ? this._cts.indexOf(x) : -1, subj: ar ? cap(ar) + ' ' + n : n, obj: ar ? ar + ' ' + n : n };
  }
  _svc(service, data) { let pr; try { pr = Promise.resolve(this._h.callService('voip_stack', service, data)); } catch (e) { pr = Promise.reject(e); } return pr; }
  /* com vídeo: a chamada/atendimento já vai com vídeo; quem decide se a câmara envia é o interruptor do telefone */
  _vd(d) { if (this._c.phone.video) d.send_video = true; else if (this._c.phone.video === false) d.send_video = false; return d; }
  _camOn() { if (this._camPend) return this._camPend.val; const s = this._s(this._c.phone.camera); return !!s && s.state === 'on'; }
  _cam() {
    const p = this._c.phone; if (!p.camera || this._bad(p.camera)) return;
    const val = !this._camOn(), id = (this._cseq = (this._cseq || 0) + 1);
    this._camPend = { val, id }; this._sync();
    setTimeout(() => { if (this._camPend && this._camPend.id === id) { this._camPend = null; this._sync(); } }, 4000);
    this._svc('set_send_video', { device_id: p.device_id, send_video: val }).catch(() => { if (this._camPend && this._camPend.id === id) { this._camPend = null; this._sync(); } });
  }
  /* volume da conversa: só no Fully Kiosk (window.fully); lê os canais de chamada (0) e multimédia (3) e sobe-os se estiverem abaixo do nível; nunca baixa */
  _callVolume() {
    const cv = this._c.call_volume; if (cv == null || cv === false) return;
    let lvl = typeof cv === 'object' ? (cv.entity ? Number((this._s(cv.entity) || {}).state) : Number(cv.level)) : Number(cv);
    if (isNaN(lvl)) lvl = 80;
    lvl = Math.min(100, Math.max(0, Math.round(lvl)));
    const f = window.fully;
    if (!f || typeof f.getAudioVolume !== 'function' || typeof f.setAudioVolume !== 'function') return;
    [0, 3].forEach((stream) => { try { const cur = Number(f.getAudioVolume(stream)); if (!isNaN(cur) && cur < lvl) f.setAudioVolume(lvl, stream); } catch (e) { /* nada */ } });
  }
  _vol(dir) {
    const e = this._k && this._k.volume, s = this._s(e); if (!s || this._bad(e)) return;
    const a = s.attributes || {}, step = Number(a.step) || 5, min = a.min != null ? Number(a.min) : 0, max = a.max != null ? Number(a.max) : 100;
    const v = Math.min(max, Math.max(min, Number(s.state) + dir * step));
    if (v !== Number(s.state)) this._h.callService('input_number', 'set_value', { value: v }, { entity_id: e });
  }
  /* palco de vídeo: só mexe no cartão voip-stack se for a versão e a estrutura esperadas; senão mostra-o tal como é */
  _vsOk(el) {
    const sr = el && el.shadowRoot; if (!sr) return null;
    const card = sr.querySelector('ha-card.card'), ver = sr.querySelector('.version');
    if (!card || !ver || ver.textContent.trim() !== VS_VER || !card.querySelector(':scope > canvas.video-canvas') || !card.querySelector(':scope > .button-container')) return null;
    if (!sr.querySelector('style[data-casa]')) { const st = document.createElement('style'); st.setAttribute('data-casa', ''); st.textContent = VS_CSS; sr.appendChild(st); }
    return card;
  }
  _vidOff() {
    if (this._vobs) { this._vobs.disconnect(); this._vobs = null; }
    if (this._vro) { this._vro.disconnect(); this._vro = null; }
    clearInterval(this._vpoll); this._vpoll = null; this._vpk = null; this._vwatch = false; this._ownStop();
    clearInterval(this._dbgT); this._dbgT = null; this._dbgP = null; { const d = this.shadowRoot.querySelector('.vdbg'); if (d) { d.hidden = true; d.textContent = ''; } }
    this._vcard = null; this._vidOn = false; this._vrot = 0; this._vswap = false;
    if (this._phone) this._phone.removeAttribute('data-casa-video');
    const ph = this.shadowRoot.querySelector('.phone'); if (ph) { ph.removeAttribute('style'); ph.removeAttribute('inert'); }
  }
  /* caixa da imagem: formato real dos fotogramas (largura/altura do canvas do telefone), rodada em passos de 90° e, com Formato, com a proporção trocada */
  _vfit() {
    const R = this.shadowRoot, clip = R.querySelector('.clip'), ph = R.querySelector('.phone'); if (!clip || !ph) return;
    const fb = R.querySelector('[data-vt="fmt"]'); if (fb) { fb.classList.toggle('von', !!this._vswap); fb.setAttribute('aria-pressed', String(!!this._vswap)); }
    const cv = this._vcard && this._vcard.querySelector(':scope > canvas.video-canvas');
    if (!this._vidOn || !cv || !clip.classList.contains('vid') || !clip.classList.contains('on') || !(cv.width > 0) || !(cv.height > 0)) { ph.removeAttribute('style'); return; }
    const W = clip.clientWidth, H = clip.clientHeight; if (!W || !H) return;
    const rot = this._vrot || 0, odd = rot % 2 === 1, ar = this._vswap ? cv.height / cv.width : cv.width / cv.height, va = odd ? 1 / ar : ar;
    const vw = Math.min(W, H * va), vh = vw / va, ew = odd ? vh : vw, eh = odd ? vw : vh;
    ph.style.cssText = 'width:' + ew.toFixed(1) + 'px;height:' + eh.toFixed(1) + 'px;left:' + ((W - ew) / 2).toFixed(1) + 'px;top:' + ((H - eh) / 2).toFixed(1) + 'px;transform:rotate(' + rot * 90 + 'deg)';
  }
  /* imagem local: reutiliza a captura do próprio telefone (voip-stack v2026.11.0 guarda-a em __voipStackEngine._video._cameraStream); só se a versão não for a esperada, e fora do iOS, abre uma captura própria */
  _engineCam() {
    try { const e = globalThis.__voipStackEngine, st = e && e._video && e._video._cameraStream, t = st && typeof st.getVideoTracks === 'function' && st.getVideoTracks()[0]; return t && t.readyState === 'live' ? st : null; } catch (e) { return null; }
  }
  _isIos() { try { const n = navigator; return /iPad|iPhone|iPod/.test(n.userAgent || '') || (n.platform === 'MacIntel' && n.maxTouchPoints > 1); } catch (e) { return false; } }
  _ownStop() { this._ownGen = (this._ownGen || 0) + 1; if (this._own) { try { this._own.getTracks().forEach((t) => t.stop()); } catch (e) { /* nada */ } this._own = null; } }
  _pipSync(want, card) {
    const R = this.shadowRoot, b = R.querySelector('.pipb'), v = b && b.querySelector('video'); if (!b) return false;
    const pv = this._c.phone.preview, on = !!want && pv !== false && (this._c.phone.camera ? this._camOn() : true);
    let st = null;
    if (on && card) st = this._engineCam();
    else if (on && !card && (pv === 'force' || !this._isIos())) {
      st = this._own || null;
      if (!st && !this._ownBusy && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const gen = (this._ownGen = (this._ownGen || 0) + 1); this._ownBusy = true;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false }).then((ms) => {
          this._ownBusy = false;
          if (gen !== this._ownGen) { ms.getTracks().forEach((t) => t.stop()); return; }
          this._own = ms; this._sync();
        }, (e) => { this._ownBusy = false; console.debug('casa-calls-card: sem pré-visualização da câmara', e); });
      }
    }
    if (!on || card) { if (this._own || this._ownBusy) this._ownStop(); }
    const key = st ? st.id + ':' + (st.getVideoTracks()[0] || {}).id : '';
    if (v._k !== key) {
      v._k = key;
      try { v.srcObject = st ? new MediaStream(st.getVideoTracks()) : null; if (st) { const pl = v.play(); if (pl && pl.catch) pl.catch(() => {}); } } catch (e) { console.debug('casa-calls-card: pré-visualização', e); }
    }
    if (!v._ar) { v._ar = () => { const w = v.videoWidth, h = v.videoHeight; if (w > 0 && h > 0) { b.style.setProperty('--ar', w + '/' + h); b.classList.toggle('port', h > w); } }; v.addEventListener('loadedmetadata', v._ar); v.addEventListener('resize', v._ar); }
    v._ar();
    b.hidden = !st;
    return !!st;
  }
  _vidSync(clip, want) {
    if (!want || !this._phone) {
      if (this._vidOn || this._vwatch) this._vidOff();
      clip.classList.remove('vid', 'on', 'raw'); this._pipSync(false, null); return false;
    }
    const card = this._vsOk(this._phone);
    /* enquanto a chamada dura, vigia o cartão (imagem remota) e a câmara local, mesmo com o palco fechado */
    this._vwatch = true;
    if (card && this._vcard !== card) {
      if (this._vobs) this._vobs.disconnect();
      this._vcard = card;
      this._vobs = new MutationObserver(() => { if (this._built && this._h) this._sync(); });
      this._vobs.observe(card, { attributes: true, attributeFilter: ['class'] });
      const cv = card.querySelector(':scope > canvas.video-canvas');
      if (cv) this._vobs.observe(cv, { attributes: true, attributeFilter: ['width', 'height'] });
    }
    if (!card && this._vobs) { this._vobs.disconnect(); this._vobs = null; this._vcard = null; }
    if (!this._vpoll) this._vpoll = setInterval(() => { const k = (this._engineCam() ? '1' : '0') + (this._own ? '1' : '0'); if (k !== this._vpk) { this._vpk = k; if (this._built && this._h) this._sync(); } }, 500);
    const remote = !!card && card.classList.contains('video-active'), local = this._pipSync(true, card);
    /* o palco só abre quando há mesmo vídeo: imagem do outro lado ou a nossa câmara a enviar */
    const show = card ? (remote || local) : true;
    if (this._c.debug && card && !this._dbgT) { this._dbgP = null; this._dbgT = setInterval(() => this._dbg(), 1000); }
    if (!show) { this._vidOn = false; clip.classList.remove('vid', 'on', 'raw'); this._phone.removeAttribute('data-casa-video'); const ph = this.shadowRoot.querySelector('.phone'); if (ph) ph.removeAttribute('style'); return false; }
    this._vidOn = true;
    clip.classList.toggle('vid', !!card); clip.classList.toggle('raw', !card);
    if (!card) { this._phone.removeAttribute('data-casa-video'); clip.classList.remove('on'); return true; }
    this._phone.setAttribute('data-casa-video', '');
    if (!this._vro && typeof ResizeObserver === 'function') { this._vro = new ResizeObserver(() => this._vfit()); this._vro.observe(clip); }
    clip.classList.toggle('on', remote);
    this._vfit();
    if (this._dbgT && !this._dbgP) this._dbg();
    return true;
  }
  /* debug: true — o que chega (tamanho real dos fotogramas no canvas do telefone e fotogramas desenhados por segundo) e o que a câmara daqui envia; os contadores vêm de __voipStackEngine.stats (voip-stack v2026.11.0); sem eles fica só o tamanho */
  _dbg() {
    const el = this.shadowRoot.querySelector('.vdbg'); if (!el) return;
    let rx = '', tx = '';
    try {
      const card = this._vcard, cv = card && card.querySelector(':scope > canvas.video-canvas'), now = Date.now(), p = this._dbgP;
      const e = globalThis.__voipStackEngine, s = (e && e.stats && e.stats.video) || null, num = (v) => typeof v === 'number' && isFinite(v);
      const rate = (k) => (p && s && num(s[k]) && num(p[k]) && now - p.t >= 500 && s[k] >= p[k] ? Math.round((s[k] - p[k]) * 1000 / (now - p.t)) : null);
      if (card && card.classList.contains('video-active') && cv && cv.width > 0 && cv.height > 0) { const f = rate('rendered'); rx = '↓ ' + cv.width + '×' + cv.height + (f != null ? ' · ' + f + ' fps' : ''); }
      const st = this._engineCam(), t = st && st.getVideoTracks()[0], g = t && typeof t.getSettings === 'function' ? t.getSettings() : null;
      if (g && g.width > 0 && g.height > 0) { const f = rate('sent'); tx = '↑ ' + g.width + '×' + g.height + (f != null ? ' · ' + f + ' fps' : ''); }
      if (!p || now - p.t >= 500) this._dbgP = { t: now, rendered: s ? s.rendered : null, sent: s ? s.sent : null };
    } catch (e) { /* nada */ }
    const text = [rx, tx].filter(Boolean).join('\n');
    el.textContent = text; el.hidden = !text || !this._vidOn;
  }
  /* video_quality: o voip-stack v2026.11.0 pede sempre 640×360 a 15 fps e codifica VP8 a 600 kbit/s (valores fixos no código dele, sem opção). Aqui, só nessa versão e só nas chamadas entre telefones da casa (media_transport local_websocket), sobe-se o pedido à câmara (até ao máximo que ele próprio aceita: 1280×720, 20 fps) e o débito. Se a estrutura for outra, ou algo falhar, vale o comportamento original. */
  _vqCfg() {
    const q = this._c.video_quality; if (!q || typeof q !== 'object') return null;
    const n = (v, lo, hi) => { v = Number(v); return Number.isFinite(v) && v >= lo ? Math.min(hi, Math.round(v)) : 0; };
    const o = { w: n(q.width, 160, 1280), h: n(q.height, 90, 1280), f: n(q.fps, 5, 20), b: n(q.bitrate, 150000, 2500000) };
    if (!o.w || !o.h) o.w = o.h = 0;
    return o.w || o.f || o.b ? o : null;
  }
  _vq() {
    try {
      const G = globalThis, q = this._vqCfg();
      if (!q) { if (G.__casaVq && G.__casaVq.o === this) G.__casaVq = null; return; }
      if (!this._phone || !this._vsOk(this._phone)) return;
      const e = G.__voipStackEngine; if (!e || typeof e._loadVideo !== 'function') return;
      G.__casaVq = { o: this, q };
      const cur = (v) => { const s = G.__casaVq && G.__casaVq.q, n = v && v._negotiated; return s && n && n.media_transport === 'local_websocket' ? s : null; };
      const patch = (v) => {
        try {
          if (!v || v.__casaVq || typeof v._cameraCaptureContract !== 'function' || typeof v._supportedConfig !== 'function') return;
          const cc = v._cameraCaptureContract, sc = v._supportedConfig;
          v._cameraCaptureContract = function () {
            const r = cc.apply(this, arguments);
            try {
              const s = cur(this), k = r && r.constraints;
              if (s && k && k.width && k.height && k.frameRate && r.maxWidth > 0 && r.maxHeight > 0 && r.maxFr > 0) {
                const out = Object.assign({}, r, { constraints: Object.assign({}, k) });
                if (s.w) {
                  const w = Math.min(s.w, r.maxWidth), h = Math.min(s.h, r.maxHeight);
                  out.constraints.width = Object.assign({}, k.width, { ideal: w }); out.constraints.height = Object.assign({}, k.height, { ideal: h });
                  out.idealWidth = w; out.idealHeight = h;
                }
                if (s.f) out.constraints.frameRate = Object.assign({}, k.frameRate, { ideal: Math.min(s.f, r.maxFr) });
                return out;
              }
            } catch (err) { /* fica o original */ }
            return r;
          };
          v._supportedConfig = async function (cls, base) {
            try {
              const s = cur(this);
              if (s && s.b && base && typeof base.bitrate === 'number' && base.width > 0 && base.height > 0 && cls && typeof cls.isConfigSupported === 'function') {
                const a = Array.prototype.slice.call(arguments); a[1] = Object.assign({}, base, { bitrate: s.b });
                const r = await sc.apply(this, a), ok = r && await cls.isConfigSupported(r);
                if (ok && ok.supported) return r;
              }
            } catch (err) { /* fica o original */ }
            return sc.apply(this, arguments);
          };
          v.__casaVq = true;
        } catch (err) { /* nada */ }
      };
      if (e._video) patch(e._video);
      if (!e.__casaVq) {
        const lv = e._loadVideo;
        e._loadVideo = function () { const p = lv.apply(this, arguments); return p && typeof p.then === 'function' ? p.then((v) => { patch(v); return v; }) : p; };
        e.__casaVq = true;
      }
    } catch (err) { /* nada */ }
  }
  /* ---- janela «Uma divisão…» ---- */
  _moreOpen() {
    const c = this._c, m = c.more || {}, st = this._phase();
    if (this._mov || this._cts.length <= this._np || typeof document === 'undefined' || !document.body) return;
    if (st.ph !== 'idle' || !st.ready || this._pend || this._busy) return;
    const ov = document.createElement('div'); ov.setAttribute('data-casa-calls-more', '');
    const host = this.shadowRoot.querySelector('ha-card'), cs = getComputedStyle(host || this);
    MORE_VARS.forEach((v) => { const val = cs.getPropertyValue(v); if (val) ov.style.setProperty(v, val.trim()); });
    const sr = ov.attachShadow({ mode: 'open' }), title = m.title || 'Ligar a uma divisão';
    sr.innerHTML = `<style>${MORE_CSS}</style><div class="scrim" data-x="1"></div><div class="dlg${host && host.classList.contains('t') ? ' t' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}" style="font-family:${esc(cs.fontFamily || 'inherit')}"><div class="dh"><span class="dt">${esc(title)}</span><button class="x" data-x="1" aria-label="Fechar"><ha-icon icon="mdi:close"></ha-icon></button></div><div class="dq" role="status" hidden></div><div class="cts">${this._cts.map((x, i) => (i < this._np ? '' : `<button class="ct" data-ct="${i}"><span class="av" style="--hue:${esc(x.color || HUES[i % HUES.length])}"></span><span class="cn">${esc(x.name)}</span></button>`)).join('')}</div></div>`;
    sr.addEventListener('click', (ev) => {
      const b = ev.target.closest && ev.target.closest('[data-x],button[data-ct]'); if (!b || b.disabled) return;
      if (b.dataset.x) return this._moreClose(true);
      const i = Number(b.dataset.ct); this._moreClose(true); this._dial(i);
    });
    this._mkey = (ev) => {
      if (!this._mov) return;
      if (ev.key === 'Escape') { ev.preventDefault(); return this._moreClose(true); }
      if (ev.key !== 'Tab') return;
      const f = [...sr.querySelectorAll('button:not(:disabled)')]; if (!f.length) return;
      const cur = f.indexOf(sr.activeElement), nx = ev.shiftKey ? (cur <= 0 ? f.length - 1 : cur - 1) : (cur < 0 || cur === f.length - 1 ? 0 : cur + 1);
      ev.preventDefault(); f[nx].focus();
    };
    window.addEventListener('keydown', this._mkey, true);
    document.body.appendChild(ov);
    if (typeof ov.showPopover === 'function') { try { ov.setAttribute('popover', 'manual'); ov.showPopover(); } catch (e) { ov.removeAttribute('popover'); } }
    this._mov = ov;
    const mb = this.shadowRoot.querySelector('.mbtn'); if (mb) mb.setAttribute('aria-expanded', 'true');
    this._moreSync(st);
    const first = sr.querySelector('button.ct:not(:disabled)') || sr.querySelector('.x'); if (first && first.focus) first.focus({ preventScroll: true });
  }
  _moreSync(st) {
    const sr = this._mov && this._mov.shadowRoot; if (!sr) return;
    const off = !st.ready || !!this._busy, q = sr.querySelector('.dq');
    q.hidden = !off; q.textContent = off ? 'A preparar o telefone…' : '';
    sr.querySelectorAll('button.ct').forEach((b) => {
      const x = this._cts[Number(b.dataset.ct)];
      b.disabled = off; this._avatar(b.querySelector('.av'), x);
      b.setAttribute('aria-label', 'Ligar ' + (x.article ? (x.article === 'o' ? 'ao ' : x.article === 'a' ? 'à ' : x.article === 'os' ? 'aos ' : x.article === 'as' ? 'às ' : 'a ') : 'a ') + (x.label || x.name));
    });
  }
  _moreClose(refocus) {
    const ov = this._mov; if (!ov) return;
    this._mov = null;
    if (this._mkey) { window.removeEventListener('keydown', this._mkey, true); this._mkey = null; }
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    const mb = this.shadowRoot.querySelector('.mbtn'); if (mb) { mb.setAttribute('aria-expanded', 'false'); if (refocus && mb.focus) mb.focus({ preventScroll: true }); }
  }
  _dial(i) {
    const x = this._cts[i], st = this._phase();
    if (!x || this._pend || this._busy || st.ph !== 'idle' || !st.ready) return;
    const id = (this._cseq = (this._cseq || 0) + 1);
    this._pend = { i, id }; this._cerr = null; this._sync();
    setTimeout(() => { if (this._pend && this._pend.id === id) { this._pend = null; this._sync(); } }, 8000);
    this._svc('call', Object.assign(this._vd({ device_id: this._c.phone.device_id, destination: x.destination }), x.send_video != null ? { send_video: !!x.send_video } : {})).catch(() => {
      if (!this._pend || this._pend.id !== id) return;
      this._pend = null; this._cerr = id; this._sync();
      setTimeout(() => { if (this._cerr === id) { this._cerr = null; this._sync(); } }, 5000);
    });
  }
  _ctl(what) {
    if (this._act) return;
    const id = (this._cseq = (this._cseq || 0) + 1), st = this._phase();
    /* durante o toque de entrada «Desligar» recusa; a chamar/em chamada desliga */
    const service = what === 'hangup' && st.ph === 'ring' ? 'decline' : what;
    if (what !== 'answer') this._pend = null;
    this._act = { what, id, raw: st.raw }; this._cerr = null; this._sync();
    setTimeout(() => { if (this._act && this._act.id === id) { this._act = null; this._sync(); } }, 6000);
    this._svc(service, service === 'answer' ? this._vd({ device_id: this._c.phone.device_id }) : { device_id: this._c.phone.device_id }).catch(() => {
      if (!this._act || this._act.id !== id) return;
      this._act = null; this._cerr = id; this._sync();
      setTimeout(() => { if (this._cerr === id) { this._cerr = null; this._sync(); } }, 5000);
    });
  }
  /* entrada (drop-in): quem atende é este browser, com o utilizador deste tablet — só assim o áudio fica com ele */
  _stopAuto() { if (this._auto) { clearTimeout(this._auto.t); this._auto = null; } }
  async _mediaOk() {
    let stream = null, ctx = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return true;
      ctx = new AC();
      if (ctx.state !== 'running') await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 1200))]);
      return ctx.state === 'running';
    } catch (e) { return false; }
    finally { try { if (stream) stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* nada */ } try { if (ctx) ctx.close(); } catch (e) { /* nada */ } }
  }
  _autoAnswer(st) {
    const link = !!this._link && !st.drop;
    const want = (st.drop || link || (this._auto && this._auto.link)) && st.ph === 'ring' && !!this._phone && this.isConnected;
    if (!want) { if (this._auto && (st.ph !== 'ring' || !(st.drop || this._auto.link))) this._stopAuto(); return; }
    if (this._auto) return;
    const a = (this._auto = { n: 0, failed: false, t: 0, link });
    if (link) this._linkDone();
    const step = async () => {
      if (this._auto !== a) return;
      const now = this._phase();
      if (!((now.drop || a.link) && now.ph === 'ring')) return;
      if (!(await this._mediaOk())) { if (this._auto === a) { a.failed = true; this._sync(); } return; }
      if (this._auto !== a) return;
      const again = this._phase();
      if (!((again.drop || a.link) && again.ph === 'ring')) return;
      a.n++;
      this._svc('answer', this._vd({ device_id: this._c.phone.device_id })).catch(() => {});
      if (a.n < 6) a.t = setTimeout(step, 3000); else { a.failed = true; this._sync(); }
    };
    /* primeiro dá-se tempo ao atendimento automático do próprio telefone */
    a.t = setTimeout(step, link ? 300 : this._c.dropin_delay_ms != null ? Number(this._c.dropin_delay_ms) : 1500);
  }
  _syncCall(R) {
    const stage = R.querySelector('.stage'), clip = R.querySelector('.clip'), more = R.querySelector('.more');
    const st = stage ? this._phase() : null;
    const vid = this._vidSync(clip, !!(st && this._c.phone.video && st.ph === 'talk')), raw = clip.classList.contains('raw');
    if (more) { more.setAttribute('aria-expanded', String(this._open)); more.hidden = vid; }
    const shut = !!more && !this._open && !vid, phn = R.querySelector('.phone');
    clip.classList.toggle('shut', shut); if (shut) clip.setAttribute('inert', ''); else clip.removeAttribute('inert');
    if (phn) { if (vid && !raw) phn.setAttribute('inert', ''); else phn.removeAttribute('inert'); }
    if (!stage) return;
    if (st.ph !== 'idle') this._pend = null;
    if (this._mov) { if (st.ph !== 'idle' || this._pend) this._moreClose(); else this._moreSync(st); }
    if (this._act && st.raw !== this._act.raw) this._act = null;
    this._autoAnswer(st);
    const loud = st.ph === 'talk' || (st.drop && st.ph === 'ring');
    if (loud && !this._loud) { this._callVolume(); clearTimeout(this._loudT); this._loudT = setTimeout(() => { if (this._loud) this._callVolume(); }, 2500); }
    this._loud = loud;
    const pend = st.ph === 'idle' ? this._pend : null, active = st.ph !== 'idle' || !!pend;
    const pick = stage.querySelector('.pick'), live = stage.querySelector('.live');
    live.classList.toggle('off', !active); if (active) live.removeAttribute('inert'); else live.setAttribute('inert', '');
    if (pick) {
      pick.classList.toggle('off', active); if (active) pick.setAttribute('inert', ''); else pick.removeAttribute('inert');
      const q = pick.querySelector('.q'), err = this._cerr != null && !active;
      q.className = 'q' + (err ? ' red' : '');
      q.textContent = err ? 'Não foi possível ligar · tenta outra vez' : !st.ready ? 'A preparar o telefone…' : (this._c.contacts_title || 'Quem queres chamar?');
      const mb = pick.querySelector('.mbtn'); if (mb) mb.disabled = active || !st.ready || !!this._busy;
      pick.querySelectorAll('.ct').forEach((b) => {
        const x = this._cts[Number(b.dataset.ct)];
        b.disabled = active || !st.ready || !!this._busy;
        this._avatar(b.querySelector('.av'), x);
        b.setAttribute('aria-label', 'Ligar ' + (x.article ? (x.article === 'o' ? 'ao ' : x.article === 'a' ? 'à ' : x.article === 'os' ? 'aos ' : x.article === 'as' ? 'às ' : 'a ') : 'a ') + (x.label || x.name));
      });
    }
    clearInterval(this._tick); this._tick = null;
    if (!active) return;
    const w = pend ? { x: this._cts[pend.i], i: pend.i, subj: '', obj: (this._cts[pend.i].article ? this._cts[pend.i].article + ' ' : '') + (this._cts[pend.i].label || this._cts[pend.i].name) } : this._who(st.peer);
    const ph = pend ? 'out' : st.ph, drop = st.drop && !(this._auto && this._auto.failed && ph === 'ring');
    live.classList.toggle('calm', !!drop);
    /* nome por extenso (label): pode ocupar duas linhas em ecrãs estreitos */
    live.classList.toggle('wrap', !!((w.x && w.x.label) || (ph === 'ring' && st.to)));
    const w1 = live.querySelector('.w1'), w2 = live.querySelector('.w2');
    const act = this._act ? this._act.what : null, err = this._cerr != null;
    this._avatar(live.querySelector('.av'), w.x, w.x ? (w.x.color || HUES[w.i % HUES.length]) : HUES[0]);
    w1.textContent = drop ? w.subj + ' ' + (this._c.phone.dropin_text || 'entrou na cozinha')
      : ph === 'ring' ? w.subj + ' está a ligar' + (st.to ? ' ' + st.to : '')
      : ph === 'out' ? 'A chamar ' + w.obj + '…'
      : ph === 'answering' ? 'A atender ' + w.obj + '…'
      : ph === 'talk' ? 'Em chamada com ' + w.obj
      : 'A terminar…';
    const timer = () => { w2.textContent = isNaN(st.since) ? 'Em chamada' : mmss(Date.now() - st.since); };
    w2.className = 'w2' + (err ? ' red' : '');
    if (err) w2.textContent = 'Não foi possível · tenta outra vez';
    else if (act === 'answer') w2.textContent = 'A atender…';
    else if (act) w2.textContent = 'A desligar…';
    else if (ph === 'talk' && st.raw === 'held') w2.textContent = 'Em espera';
    else if (ph === 'talk' && !drop) { timer(); this._tick = setInterval(timer, 1000); }
    else w2.textContent = drop ? 'A ouvir e a falar por este tablet' : ph === 'ring' ? 'Toca em Atender para falar' : ph === 'out' ? 'À espera que atenda' : '';
    const ringUi = ph === 'ring' && !drop;
    const bA = live.querySelector('[data-call="answer"]'), bD = live.querySelector('[data-call="decline"]'), bH = live.querySelector('[data-call="hangup"]');
    bA.hidden = !ringUi; bD.hidden = !ringUi; bH.hidden = ringUi;
    bA.disabled = bD.disabled = bH.disabled = !!act || ph === 'ending';
    const bC = live.querySelector('[data-call="camera"]'), pc = this._c.phone.camera, camUi = !!pc && ph === 'talk' && !(w.x && w.x.send_video === false);
    bC.hidden = !camUi;
    if (camUi) {
      const on = this._camOn();
      bC.classList.toggle('con', on); bC.setAttribute('aria-pressed', String(on)); bC.disabled = this._bad(pc) || !!this._camPend;
      bC.querySelector('ha-icon').setAttribute('icon', on ? 'mdi:video' : 'mdi:video-off');
      bC.querySelector('small').textContent = on ? 'ligada' : 'desligada';
      bC.setAttribute('aria-label', on ? 'Câmara ligada. Toca para desligar' : 'Câmara desligada. Toca para ligar');
    }
  }
  _sync() {
    if (!this._built || !this._h) return;
    const R = this.shadowRoot, k = this._k;
    this._vq();
    this._syncCall(R);
    if (!k) return;
    const dnd = this._dndOn();
    if (dnd && this._arm) this._disarm();
    const kst = R.querySelector('.kst');
    if (kst) {
      const s = this._s(k.state), raw = s ? s.state : 'unavailable';
      kst.textContent = ST[raw] || raw;
      R.querySelector('.dot').className = 'dot' + (DOT[raw] ? ' ' + DOT[raw] : '');
    }
    const set = (key, script, idle, busyTxt, o) => {
      const b = R.querySelector(`[data-act="${key}"]`); if (!b) return;
      const missing = !this._s(script), busy = this._busy === key, err = this._err === key, armed = !!o.armed;
      b.disabled = missing || !!o.blocked;
      if (this._busy && !b.disabled) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      b.className = 'tile' + (armed ? ' warn' : busy ? ' on' : '');
      if (armed) b.style.setProperty('--cd', this._c.arm_seconds + 's'); else b.style.removeProperty('--cd');
      const st = b.querySelector('.st');
      st.className = 'st' + (err ? ' red' : '');
      st.textContent = missing ? 'Script não encontrado' : busy ? busyTxt : err ? 'Não foi possível · tente outra vez' : armed ? 'Toque outra vez para entrar' : o.blocked ? o.blockedTxt : idle;
      b.setAttribute('aria-label', b.querySelector('.nm').textContent + ' na cozinha. ' + st.textContent);
    };
    set('call', k.call_script, 'O tablet toca e alguém atende', 'A ligar…', {});
    set('drop', k.dropin_script, 'Abre sozinho, com aviso na cozinha', 'A entrar…', { armed: this._arm, blocked: dnd, blockedTxt: 'Cozinha em não incomodar' });
    const sw = R.querySelector('[data-dnd]');
    if (sw) { sw.classList.toggle('son', dnd); sw.setAttribute('aria-checked', String(dnd)); sw.disabled = this._bad(k.dnd); }
    const vv = R.querySelector('.vv');
    if (vv) {
      const s = this._s(k.volume), bad = this._bad(k.volume), a = (s && s.attributes) || {}, n = s ? Number(s.state) : NaN;
      vv.textContent = bad || isNaN(n) ? '—' : Math.round(n) + ' %';
      const bs = R.querySelectorAll('[data-vol]');
      bs[0].disabled = bad || n <= (a.min != null ? Number(a.min) : 0); bs[1].disabled = bad || n >= (a.max != null ? Number(a.max) : 100);
    }
  }
}
if (!customElements.get('casa-calls-card')) customElements.define('casa-calls-card', CasaCallsCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'casa-calls-card', name: 'Casa · Chamadas', description: 'Telefone da casa (voip-stack-card emoldurado), contactos grandes, faixa de chamada com vídeo, chamadas para a cozinha e não incomodar.' });
})();

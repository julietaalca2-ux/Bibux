(()=>{
const $=s=>document.querySelector(s),L=(k,d)=>{try{return JSON.parse(localStorage.getItem('bibux-'+k))??d}catch{return d}},S=(k,v)=>{try{localStorage.setItem('bibux-'+k,JSON.stringify(v))}catch{}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=['Música','Cine','Gaming','Anime','Deportes','Charlas','Aprender'];
let me={banner:1,status:'on',mood:'😎',fav:[],link:'',avc:'',inv:'all',act:true,...L('me',{name:'Invitado'+Math.floor(Math.random()*900+100),bio:'Mirando cosas buenas.',av:1})};
let cfg=L('cfg',{hue:262,blur:true,motion:true});
let rooms=L('rooms',[]);
// Datos de ejemplo (marcados como tal en la interfaz): sirven para ver el diseño sin backend.
const SAMPLE=[],FRIENDS=[],NOTIFS=[];
const filt=()=>{const q=(V.q||'').toLowerCase(),c=V.c||'';return allRooms().filter(r=>!r.priv&&(!c||r.cat==c)&&r.name.toLowerCase().includes(q)).sort((a,b)=>V.s=='Nombre'?a.name.localeCompare(b.name):(b.viewers||0)-(a.viewers||0))};
const allRooms=()=>[...rooms,...SAMPLE];
const getRoom=c=>allRooms().find(r=>r.code===c);
const toast=t=>{const st=$('#st');if(st)st.textContent=t;const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)};
const ytId=u=>(u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/)||[])[1]||(/^[\w-]{11}$/.test(u.trim())?u.trim():null);
const NAV=[['home','Inicio'],['explore','Explorar'],['rooms','Salas'],['friends','Amigos'],['messages','Mensajes','chat'],['notifications','Avisos','bell'],['profile','Perfil','user'],['settings','Ajustes','gear']];
const MOB=['home','explore','rooms','friends','profile'];
const nav=(r,list)=>list.map(n=>`<a class="nv ${r==n[0]?'on':''}" href="#/${n[0]}" ><i style="-webkit-mask-image:url(assets/icons/${n[2]||n[0]}.svg);mask-image:url(assets/icons/${n[2]||n[0]}.svg)"></i>${n[1]}</a>`).join('');
const card=r=>`<a class="rc" href="#/watch/${r.code}" style="background-image:url(assets/covers/cover${r.cover||1}.png)"><span class="tag">${r.priv?'Privada':'Pública'}${r.sample?' · ejemplo':''}</span><div><b>${esc(r.name)}</b><br><small>${r.cat} · ${r.viewers||1} viendo</small></div></a>`;
const rail=a=>`<div class="rail">${a.map(card).join('')||'<p class="sub">Aún no hay salas.</p>'}</div>`;
const apply=()=>{document.body.style.fontSize=(cfg.fs||15)+'px';document.documentElement.style.setProperty('--h',cfg.hue);document.body.classList.toggle('noblur',!cfg.blur);document.body.classList.toggle('nored',!cfg.motion)};
let room=null,PENDING=null;
const pad=i=>String(i).padStart(2,'0'),WPN=[...Array(16)].map((_,i)=>i+1),myAv=()=>me.avc||'assets/avatars/av'+me.av+'.png',wpT=i=>'assets/wallpapers/t/wp'+pad(i||1)+'.jpg';
const isFav=id=>L('favs',[]).some(f=>f.id==id);
const wpGrid=(a,sel)=>WPN.map(i=>`<img ${a}="${i}" src="${wpT(i)}" loading="lazy" alt="" style="width:96px;height:54px;object-fit:cover;border-radius:10px;cursor:pointer;${sel==i?'outline:2px solid var(--p)':''}">`).join('');
const setBg=i=>{$('.bgfx').style.backgroundImage=i?`url(assets/wallpapers/wp${pad(i)}.png)`:''};
const KEY=BIBUX_CONFIG.YT_API_KEY;let META=L('meta',{});
const dec=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value};
async function yt(path,params){const u=new URL('https://www.googleapis.com/youtube/v3/'+path);Object.entries({...params,key:KEY}).forEach(([k,v])=>u.searchParams.set(k,v));const r=await fetch(u),j=await r.json();if(!r.ok)throw new Error(j.error?.message||'Error de YouTube');return j}
async function metaFor(ids){const need=ids.filter(i=>!META[i]);if(!need.length)return;try{const j=await yt('videos',{part:'snippet',id:need.join(',')});j.items.forEach(v=>META[v.id]={t:v.snippet.title,c:v.snippet.channelTitle});S('meta',META);pane()}catch{}}
async function doSearch(q){if(!q.trim())return;room.sq=q;room.res=null;pane();try{const j=await yt('search',{part:'snippet',type:'video',maxResults:12,videoEmbeddable:'true',q});room.res=j.items.map(i=>({id:i.id.videoId,t:dec(i.snippet.title),c:dec(i.snippet.channelTitle)}));room.res.forEach(x=>META[x.id]={t:x.t,c:x.c});S('meta',META)}catch(e){room.res=[];toast(e.message.slice(0,90))}pane()}
const vrow=(id,extra)=>`<div class="li"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" style="width:96px;border-radius:10px"><div><b>${esc((META[id]||{}).t||id)}</b><br><small class="sub">${esc((META[id]||{}).c||'')}</small></div>${extra}</div>`;
function addQ(id){room.queue.push(id);room.sync.send({k:'queue',q:room.queue});S('q-'+room.r.code,room.queue);toast('Añadido a la cola');pane()}
function cleanup(){if(room){room.sync&&room.sync.close();room=null}}
const V={
home:()=>{const rec=L('recent',[]).map(getRoom).filter(Boolean);return`<section class="hero"><h1>Mira juntos.<br>Sin distancias.</h1><p class="sub">Salas con YouTube, chat y reacciones en un solo lugar.</p><div class="row"><a class="btn pri" href="#/rooms">Crear sala</a><a class="btn" href="#/watch/new">Pegar un enlace</a><a class="btn" href="#/explore">Explorar</a></div></section>
<h2>Continuar viendo</h2>${rail(rec)}${L('favs',[]).length?`<h2>Tus favoritos</h2><div class="rail">${L('favs',[]).map(x=>`<div class="card"><img src="https://i.ytimg.com/vi/${x.id}/mqdefault.jpg" alt="" style="width:100%;border-radius:12px"><p style="margin:6px 0"><b>${esc(x.t.slice(0,50))}</b></p><button class="pri" data-w="${x.id}">Ver juntos</button></div>`).join('')}</div>`:''}<h2>Tus salas</h2>${rail(rooms)}
<h2>Amigos</h2><div class="panel"><p class="sub">Aún no tienes amigos en Bibux. Invita a alguien con el enlace.</p><div class="row"><button class="pri" id="inv">Copiar enlace de Bibux</button></div></div>`},
explore:()=>{const q=(V.q||'').toLowerCase(),c=V.c||'';const l=allRooms().filter(r=>!r.priv&&(!c||r.cat==c)&&r.name.toLowerCase().includes(q));
const vr=V.vres===null?'<p class="sub">Buscando…</p>':V.vres&&V.vres.length?`<h2>Videos de YouTube</h2><div class="grid">${V.vres.map(x=>`<div class="card"><img src="https://i.ytimg.com/vi/${x.id}/hqdefault.jpg" alt="" style="width:100%;border-radius:12px;aspect-ratio:16/9;object-fit:cover"><p style="margin:8px 0"><b>${esc(x.t)}</b></p><small class="sub">${esc(x.c)}</small><div class="row"><button class="pri" data-w="${x.id}">Ver juntos</button><button data-f="${x.id}">${isFav(x.id)?'♥':'♡'}</button></div></div>`).join('')}</div>`:V.vres?'<p class="sub">Sin resultados.</p>':'';
return`<h1>Explorar</h1><div class="row"><input id="vq" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Buscar videos o música en YouTube" value="${esc(V.vq||'')}" style="flex:1"><button class="pri" id="vs">Buscar</button></div><p id="st" style="color:#7dd3fc"></p>${vr}<h2>Salas</h2><div class="row"><input id="q" placeholder="Buscar salas" value="${esc(V.q||'')}" style="flex:1"><select id="so"><option>Tendencias</option><option>Nombre</option></select></div><div class="row">${['',...CATS].map(x=>`<span class="chip ${c==x?'on':''}" data-c="${x}">${x||'Todas'}</span>`).join('')}</div><h2>${l.length} salas públicas</h2>${l.length?'':'<p class="sub">Aún no hay salas públicas. Crea una en Salas.</p>'}<div class="grid" id="rg">${filt().map(card).join('')}</div>`},
rooms:()=>`<h1>Salas</h1><div class="panel" style="margin-top:14px"><div class="row" style="margin:0"><input id="rn" placeholder="Nombre de la sala" style="flex:1"><select id="rc">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><select id="rp"><option value="0">Pública</option><option value="1">Privada</option></select><button class="pri" id="mk">Crear sala</button></div></div>
<div class="panel" style="margin-top:14px"><div class="row" style="margin:0"><input id="jc" placeholder="Código de invitación" style="flex:1"><button id="jn">Unirme</button></div></div><h2>Mis salas</h2><div class="grid">${rooms.map(card).join('')||'<p class="sub">Crea tu primera sala y comparte el código.</p>'}</div>`,
friends:()=>`<h1>Amigos</h1><div class="panel" style="margin-top:14px"><p class="sub">Aún no tienes amigos en Bibux. Podrás agregarlos al conectar Supabase; mientras tanto invita con el enlace.</p><div class="row"><button class="pri" id="inv">Copiar enlace de Bibux</button></div></div>`,
messages:()=>`<h1>Mensajes</h1><div class="panel" style="margin-top:14px"><p class="sub">No tienes conversaciones. Los mensajes privados se activan al conectar amigos.</p></div>`,
notifications:()=>`<h1>Notificaciones</h1><div class="panel" style="margin-top:14px"><p class="sub">No tienes notificaciones nuevas.</p></div>`,
profile:()=>{const P=me,rv=L('recent',[]).length,mc=L('stats',{}).msgs||0,fv=L('favs',[]).length;
const B=[['Anfitrión',rooms.length>=1],['Explorador',rv>=5],['Charlatán',mc>=10],['Curador',fv>=5],['Veterano',rooms.length>=5]];
return`<h1>Perfil</h1><div class="panel" style="padding:0;overflow:hidden;margin-top:14px"><div style="height:150px;background:url(${wpT(P.banner)}) center/cover"></div><div class="li" style="margin-top:-38px"><img class="av" style="width:84px;height:84px;border:3px solid #08061a" src="${myAv()}" alt=""><div><b style="font-size:20px">${esc(P.name)}</b> ${P.mood}<br><small class="sub">${{on:'En línea',busy:'Ocupado',off:'Invisible'}[P.status]}${P.link?' · '+esc(P.link):''}</small></div></div><p style="padding:6px 16px 16px">${esc(P.bio)}</p>${P.fav.length?`<div class="row" style="margin:0;padding:0 16px 16px">${P.fav.map(c=>`<span class="chip on">${c}</span>`).join('')}</div>`:''}</div>
<p class="sub" style="margin-top:10px">${rv} salas visitadas · ${rooms.length} creadas · ${mc} mensajes · ${fv} favoritos</p><div class="row">${B.map(b=>`<span class="chip ${b[1]?'on':''}">${b[1]?'✓ ':'🔒 '}${b[0]}</span>`).join('')}</div>
<h2>Cuenta de Google</h2><div class="panel">${P.google?`<div class="li"><img class="av" src="${esc(P.google.pic)}" referrerpolicy="no-referrer" alt=""><div><b>${esc(P.google.name)}</b><br><small class="sub">${esc(P.google.email)}</small></div></div><div class="row"><button id="gf">Usar mi foto</button><button id="gn">Usar mi nombre</button><button class="pri" id="gy">Conectar YouTube</button><button id="gu">Desvincular</button></div>${V.likes?`<h2 style="font-size:16px">Tus me gusta de YouTube</h2><div class="grid">${V.likes.map(x=>`<div class="card"><img src="https://i.ytimg.com/vi/${x.id}/mqdefault.jpg" alt="" style="width:100%;border-radius:12px"><p style="margin:6px 0"><b>${esc(x.t.slice(0,60))}</b></p><button class="pri" data-w="${x.id}">Ver juntos</button></div>`).join('')}</div>`:''}`:`<p class="sub">Vincula tu cuenta para usar tu nombre y foto de Google y traer tus videos con me gusta de YouTube.</p><div id="gbtn" style="margin-top:10px"></div>`}</div><h2>Editar perfil</h2><div class="panel"><b>Foto</b><div class="row">${[...Array(24)].map((_,i)=>`<img class="av s" data-a="${i+1}" src="assets/avatars/s/av${i+1}.png" alt="" style="cursor:pointer;${!P.avc&&P.av==i+1?'outline:2px solid var(--p)':''}">`).join('')}</div><div class="row"><label class="btn">Subir mi foto<input type="file" id="pf" accept="image/*" hidden></label>${P.avc?'<button id="pq">Quitar foto subida</button>':''}</div>
<h2 style="font-size:16px">Portada</h2><div class="row">${wpGrid('data-b',P.banner)}</div>
<h2 style="font-size:16px">Datos</h2><div class="row"><input id="pn" value="${esc(P.name)}" placeholder="Nombre de usuario" maxlength="24" style="flex:1"><select id="pm">${['😎','🔥','🎧','🎬','🎮','😴','🥳'].map(e=>`<option ${P.mood==e?'selected':''}>${e}</option>`).join('')}</select><select id="pst"><option value="on" ${P.status=='on'?'selected':''}>En línea</option><option value="busy" ${P.status=='busy'?'selected':''}>Ocupado</option><option value="off" ${P.status=='off'?'selected':''}>Invisible</option></select></div>
<div class="row"><textarea id="pb" rows="3" maxlength="160" style="width:100%" placeholder="Biografía (máx. 160)">${esc(P.bio)}</textarea></div><div class="row"><input id="pl" value="${esc(P.link)}" placeholder="Enlace o @usuario" style="flex:1"></div>
<h2 style="font-size:16px">Gustos</h2><div class="row">${CATS.map(c=>`<span class="chip ${P.fav.includes(c)?'on':''}" data-fc="${c}">${c}</span>`).join('')}</div>
<h2 style="font-size:16px">Privacidad</h2><div class="sw">Quién puede invitarme<select id="pi"><option value="all" ${P.inv=='all'?'selected':''}>Todos</option><option value="fr" ${P.inv=='fr'?'selected':''}>Solo amigos</option><option value="no" ${P.inv=='no'?'selected':''}>Nadie</option></select></div><div class="sw">Mostrar mi actividad<input type="checkbox" id="pa" ${P.act?'checked':''}></div>
<div class="row"><button class="pri" id="ps">Guardar perfil</button><button id="pe">Exportar</button><label class="btn">Importar<input type="file" id="pim" accept=".json" hidden></label><button id="pr">Restablecer</button></div></div>`},
settings:()=>`<h1>Ajustes</h1><div class="panel" style="margin-top:14px"><div class="sw">Color de acento<input type="range" id="sh" min="190" max="320" value="${cfg.hue}"></div><div class="sw">Tamaño de texto<input type="range" id="sf" min="13" max="19" value="${cfg.fs||15}"></div><div class="sw">Efecto cristal<input type="checkbox" id="sb" ${cfg.blur?'checked':''}></div><div class="sw">Animaciones<input type="checkbox" id="sm" ${cfg.motion?'checked':''}></div><div class="sw">Borrar datos locales<button id="sx">Borrar</button></div></div><h2>Fondo de la app</h2><div class="row"><span class="chip ${!cfg.wp?'on':''}" data-g="0">Por defecto</span></div><div class="row">${wpGrid('data-g',cfg.wp)}</div>`
};
function watch(code){
 let r=code=='new'?{code:'new',name:'Sala rápida',cat:'Charlas',cover:1,queue:[],host:me.name,viewers:1,priv:1}:getRoom(code);
 if(!r){return`<h1>Sala no encontrada</h1><p class="sub">Revisa el código o crea una sala.</p><a class="btn pri" href="#/rooms">Ir a Salas</a>`}
 if(r.sample&&!rooms.find(x=>x.code==code)){r={...r,queue:L('q-'+code,[]),host:me.name}}
 const rec=L('recent',[]).filter(c=>c!=code);rec.unshift(code);S('recent',rec.slice(0,8));
 room={r,cur:null,tab:'chat',chat:L('chat-'+code,[]),queue:r.queue||[],peers:{[me.name]:me.av}};
 return`<div class="wt"><div class="stage" id="stage"><div id="ph"><div class="empty"><div><h2>${esc(r.name)}</h2><p>Toca la lupa de arriba para buscar música o un video.</p></div></div></div></div>
<div class="row" style="margin:0;align-items:center"><select id="ql" title="Calidad del video"><option value="">Calidad: auto</option></select><span class="sub" style="font-size:12px">Código <b>${r.code}</b></span></div><p id="st" style="margin:0;color:#7dd3fc"></p><button id="iv" class="fab" aria-label="Invitar a la sala"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M18 16a3 3 0 00-2 .8l-7-4a3 3 0 000-1.6l7-4A3 3 0 1015 5l-7 4a3 3 0 100 6l7 4a3 3 0 103-3z"/></svg></button>
<div class="panel side"><div class="tabsr"><button data-t="chat" class="on">Chat</button><button data-t="ppl">Personas</button><button data-t="q">Cola</button></div><div class="pane" id="pane"></div><div class="cb" id="cb"><input id="ci" placeholder="Escribe un mensaje"><button class="pri" id="cs">Enviar</button></div></div></div>`}
function pane(){if(!room)return;const p=$('#pane');if(!p)return;$('#cb').style.display=room.tab=='chat'?'flex':'none';
 document.querySelectorAll('.tabsr button').forEach(b=>b.classList.toggle('on',b.dataset.t==room.tab));
 if(room.tab=='chat'){p.innerHTML=room.chat.map(m=>`<div class="msg ${m.u==me.name?'me':''}"><img class="av s" src="${m.u==me.name?myAv():'assets/avatars/av'+m.a+'.png'}"><div class="bub"><small class="sub">${esc(m.u)}</small><br>${esc(m.t)}</div></div>`).join('')||'<p class="sub">Nadie ha escrito todavía.</p>';p.scrollTop=1e9}
 else if(room.tab=='ppl')p.innerHTML=Object.entries(room.peers).map(([n,a])=>`<div class="li"><img class="av" src="${n==me.name?myAv():'assets/avatars/av'+a+'.png'}"><div><b>${esc(n)}</b>${n==room.r.host?' · anfitrión':''}</div><span class="dot on"></span></div>`).join('');
 else if(room.tab=='s'){const f=p.querySelector('#sq')===document.activeElement;p.innerHTML=`<div class="row" style="margin:0"><input id="sq" placeholder="Buscar en YouTube" value="${esc(room.sq||'')}" style="flex:1"><button class="pri" data-go="1">Buscar</button></div>`+(room.res===null?'<p class="sub">Buscando…</p>':(room.res||[]).map(x=>vrow(x.id,`<button data-p="${x.id}">▶</button><button data-add="${x.id}">＋</button>`)).join(''))}
 else{p.innerHTML=room.queue.map(id=>vrow(id,`<button data-p="${id}">▶</button>`)).join('')||'<p class="sub">La cola está vacía. Usa Buscar para añadir videos.</p>';metaFor(room.queue)}}
function loadYT(cb){if(window.YT&&YT.Player)return cb();const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);window.onYouTubeIframeAPIReady=cb}
function gis(cb){if(window.google&&google.accounts)return cb();if(gis.l)return;gis.l=1;const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';sc.onload=cb;sc.onerror=()=>{gis.l=0;toast('No se pudo cargar Google. Revisa tu conexión.')};document.head.appendChild(sc)}
function jwt(t){const b=t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(b))))}
function gbtn(){gis(()=>{const b=$('#gbtn');if(!b)return;google.accounts.id.initialize({client_id:BIBUX_CONFIG.GOOGLE_CLIENT_ID,callback:r=>{try{const j=jwt(r.credential);me.google={name:j.name,email:j.email,pic:j.picture,sub:j.sub};S('me',me);render();toast('Cuenta de Google vinculada')}catch{toast('No se pudo leer la cuenta de Google')}}});google.accounts.id.renderButton(b,{theme:'filled_black',size:'large',text:'continue_with',shape:'pill',locale:'es'})})}
let OVS=0;
function ovOpen(){$('#ov').hidden=false;$('#ovq').focus()}
async function ovSearch(){const q=$('#ovq').value.trim();if(!q)return;const lid=/youtu/.test(q)&&ytId(q);if(lid){play(lid);$('#ov').hidden=true;toast('Reproduciendo');return}$('#ovr').innerHTML='<p class="sub">Buscando…</p>';try{const j=await yt('search',{part:'snippet',type:'video',maxResults:15,videoEmbeddable:'true',q});const a=j.items.map(i=>({id:i.id.videoId,t:dec(i.snippet.title),c:dec(i.snippet.channelTitle)}));a.forEach(x=>META[x.id]={t:x.t,c:x.c});S('meta',META);$('#ovr').innerHTML=a.map(x=>vrow(x.id,`<button class="pri" data-op="${x.id}">▶</button>${room?`<button data-oq="${x.id}">＋</button>`:''}`)).join('')||'<p class="sub">Sin resultados.</p>'}catch(e){$('#ovr').innerHTML='<p style="color:#fca5a5">Error de YouTube: '+esc(e.message.slice(0,140))+'</p>'}}
function ytConnect(){gis(()=>{google.accounts.oauth2.initTokenClient({client_id:BIBUX_CONFIG.GOOGLE_CLIENT_ID,scope:'https://www.googleapis.com/auth/youtube.readonly',callback:async r=>{if(r.error)return toast('Permiso no concedido: '+r.error);try{const x=await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&myRating=like&maxResults=24',{headers:{Authorization:'Bearer '+r.access_token}}),j=await x.json();if(!x.ok)throw new Error(j.error?.message||'Error');V.likes=j.items.map(i=>({id:i.id,t:i.snippet.title,c:i.snippet.channelTitle}));render();toast(V.likes.length+' videos con me gusta cargados')}catch(e){toast('YouTube: '+e.message.slice(0,100))}}}).requestAccessToken()})}
const PL={cur:null,id:null,code:null,ready:false,next:null};
function play(id,emit=true){PL.id=id;if(room)PL.code=room.r.code;metaFor([id]);
 loadYT(()=>{if(PL.cur){if(PL.ready&&PL.cur.loadVideoById)PL.cur.loadVideoById(id);else PL.next=id;return}
  PL.cur=new YT.Player('ytp',{width:'100%',height:'100%',videoId:id,playerVars:{rel:0,playsinline:1,autoplay:1},events:{onReady:e=>{PL.ready=true;if(PL.next){e.target.loadVideoById(PL.next);PL.next=null}},onError:()=>toast('Este video no permite reproducción incrustada'),onStateChange:e=>{if(e.data==1)setTimeout(fillQ,500);if(room&&room.sync&&!room.lock){const t=PL.cur.getCurrentTime();if(e.data==1)room.sync.send({k:'play',t});if(e.data==2)room.sync.send({k:'pause',t})}}}})});
 if(emit&&room&&room.sync)room.sync.send({k:'load',id})}
function domc(d){const B={};for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx<45)continue;const sat=(mx-mn)/mx;let h=0;if(mx!=mn)h=mx==r?((g-b)/(mx-mn)+6)%6:mx==g?(b-r)/(mx-mn)+2:(r-g)/(mx-mn)+4;const k=Math.floor(h*2)%12,w=.2+sat*mx/255;(B[k]=B[k]||[0,0,0,0]);B[k][0]+=r*w;B[k][1]+=g*w;B[k][2]+=b*w;B[k][3]+=w}
 const bo=v=>{let[r,g,b]=[v[0]/v[3],v[1]/v[3],v[2]/v[3]];const f=210/(Math.max(r,g,b)||1);r*=f;g*=f;b*=f;const a=(r+g+b)/3,c=x=>Math.round(Math.min(255,Math.max(0,a+(x-a)*1.4)));return`rgb(${c(r)},${c(g)},${c(b)})`};
 const a=Object.values(B).sort((x,y)=>y[3]-x[3]).slice(0,2).map(bo);if(!a.length)return null;if(a.length<2)a.push(a[0]);return a}
const PAL={};
function loadPal(id){PAL[id]=[];[['mq',0],['1',1],['2',2],['3',3]].forEach(([n,i])=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{try{const c=document.createElement('canvas');c.width=16;c.height=9;const x=c.getContext('2d');x.drawImage(im,0,0,16,9);PAL[id][i]=domc(x.getImageData(0,0,16,9).data)}catch{}};im.src='https://i.ytimg.com/vi/'+id+'/'+(n=='mq'?'mqdefault':n)+'.jpg'})}
function amb(){if(!(PL.id&&$('#stage'))){document.body.classList.remove('amb');return}if(!PAL[PL.id])loadPal(PL.id);let f=0;try{if(PL.ready){const d=PL.cur.getDuration();f=d>0?PL.cur.getCurrentTime()/d:0}}catch{}let best=-1,bd=9;PAL[PL.id].forEach((p,i)=>{if(!p)return;const dd=Math.abs(f-[0,.25,.5,.75][i]);if(dd<bd){bd=dd;best=i}});if(best<0)return;const p=PAL[PL.id][best],r=document.documentElement.style;r.setProperty('--c1',p[0]);r.setProperty('--c2',p[1]);document.body.classList.add('amb')}
const QN={hd2160:'4K',hd1440:'1440p',hd1080:'1080p',hd720:'720p',large:'480p',medium:'360p',small:'240p',tiny:'144p'};
function fillQ(){const ql=$('#ql');if(!ql||!PL.cur||!PL.ready||!PL.cur.getAvailableQualityLevels)return;const a=PL.cur.getAvailableQualityLevels().filter(q=>QN[q]);if(!a.length)return;const c=ql.value;ql.innerHTML='<option value="">Calidad: auto</option>'+a.map(q=>`<option value="${q}">${QN[q]}</option>`).join('');ql.value=c}
function stopPlayer(){try{PL.cur&&PL.cur.destroy()}catch{}PL.cur=null;PL.id=null;PL.ready=false;PL.next=null;if(!$('#ytp'))$('#dock').insertAdjacentHTML('afterbegin','<div id="ytp"></div>')}
let lastR='';
function place(){const d=$('#dock');if(!PL.id){d.style.display='none';return}
 const st=$('#stage');
 if(st){const r=st.getBoundingClientRect(),k=[r.left,r.top,r.width,r.height].join();if(k!=lastR||!d.classList.contains('on')){lastR=k;d.className='on';d.style.cssText=`display:block;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`}}
 else if(!d.classList.contains('mini')){lastR='';d.className='mini';d.style.cssText='display:block'}}
function bind(){const v=$('#view');
 document.querySelectorAll('[data-c]').forEach(e=>e.onclick=()=>{V.c=e.dataset.c;render()});
 const q=$('#q');if(q)q.oninput=()=>{V.q=q.value;$('#rg').innerHTML=filt().map(card).join('')};
 const so=$('#so');if(so){so.value=V.s||'Tendencias';so.onchange=()=>{V.s=so.value;render()}}
 async function vsearch(){const q=($('#vq').value||'').trim();if(!q)return;V.vq=q;V.vres=null;render();let err='';try{const j=await yt('search',{part:'snippet',type:'video',maxResults:12,videoEmbeddable:'true',q});V.vres=j.items.map(i=>({id:i.id.videoId,t:dec(i.snippet.title),c:dec(i.snippet.channelTitle)}))}catch(e){V.vres=[];err=e.message}render();if(err)toast('Error de YouTube: '+err.slice(0,120))}
 const vs=$('#vs');if(vs){vs.onclick=vsearch;$('#vq').onkeydown=e=>{if(e.key=='Enter')vsearch()}}
 document.querySelectorAll('[data-w]').forEach(e=>e.onclick=()=>{const x=(V.vres||[]).concat(L('favs',[]),V.likes||[]).find(v=>v.id==e.dataset.w),code=Math.random().toString(36).slice(2,8).toUpperCase();rooms.unshift({code,name:x.t.slice(0,40),cat:'Música',priv:0,cover:1+rooms.length%6,host:me.name,viewers:1,queue:[]});S('rooms',rooms);PENDING=x.id;location.hash='#/watch/'+code});
 const on=(i,f)=>{const e=$(i);if(e)e.onclick=f};
 document.querySelectorAll('[data-f]').forEach(e=>e.onclick=()=>{let f=L('favs',[]);const id=e.dataset.f;f=f.some(x=>x.id==id)?f.filter(x=>x.id!=id):[...f,(V.vres||[]).find(x=>x.id==id)];S('favs',f);render()});
 
 on('#mk',()=>{const n=$('#rn').value.trim()||'Mi sala';const code=Math.random().toString(36).slice(2,8).toUpperCase();rooms.unshift({code,name:n,cat:$('#rc').value,priv:+$('#rp').value,cover:1+rooms.length%6,host:me.name,viewers:1,queue:[]});S('rooms',rooms);location.hash='#/watch/'+code});
 on('#jn',()=>{const c=$('#jc').value.trim().toUpperCase();if(getRoom(c))location.hash='#/watch/'+c;else toast('Código no encontrado en este dispositivo')});
 on('#inv',()=>copy(location.href.split('#')[0]));
 on('#ps',()=>{me.name=$('#pn').value.trim()||me.name;me.bio=$('#pb').value;S('me',me);toast('Perfil guardado')});
 document.querySelectorAll('[data-a]').forEach(e=>e.onclick=()=>{me.av=+e.dataset.a;me.avc='';S('me',me);render()});
 document.querySelectorAll('[data-b]').forEach(e=>e.onclick=()=>{me.banner=+e.dataset.b;S('me',me);render()});
 document.querySelectorAll('[data-g]').forEach(e=>e.onclick=()=>{cfg.wp=+e.dataset.g;S('cfg',cfg);render()});
 document.querySelectorAll('[data-fc]').forEach(e=>e.onclick=()=>{const c=e.dataset.fc;me.fav=me.fav.includes(c)?me.fav.filter(x=>x!=c):[...me.fav,c];S('me',me);render()});
 on('#ps',()=>{me.name=$('#pn').value.trim()||me.name;me.bio=$('#pb').value;me.link=$('#pl').value.trim();me.mood=$('#pm').value;me.status=$('#pst').value;me.inv=$('#pi').value;me.act=$('#pa').checked;S('me',me);render();toast('Perfil guardado')});
 on('#pq',()=>{me.avc='';S('me',me);render()});
 const pf=$('#pf');if(pf)pf.onchange=()=>{const f=pf.files[0];if(!f)return;const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=256;const m=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,256,256);me.avc=c.toDataURL('image/jpeg',.85);S('me',me);render();toast('Foto actualizada')};im.src=URL.createObjectURL(f)};
 on('#pe',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(me)],{type:'application/json'}));a.download='bibux-perfil.json';a.click()});
 const pim=$('#pim');if(pim)pim.onchange=async()=>{try{me={...me,...JSON.parse(await pim.files[0].text())};S('me',me);render();toast('Perfil importado')}catch{toast('Archivo no válido')}};
 on('#pr',()=>{if(confirm('¿Restablecer tu perfil?')){localStorage.removeItem('bibux-me');location.reload()}});
 if($('#gbtn'))gbtn();else if($('#gy'))gis(()=>{});
 on('#gu',()=>{me.google=null;S('me',me);try{google.accounts.id.disableAutoSelect()}catch{}V.likes=null;render();toast('Cuenta desvinculada')});
 on('#gf',()=>{me.avc=me.google.pic;S('me',me);render()});
 on('#gn',()=>{me.name=me.google.name.slice(0,24);S('me',me);render()});
 on('#gy',ytConnect);
 const sf=$('#sf');if(sf)sf.oninput=()=>{cfg.fs=+sf.value;S('cfg',cfg);apply()};
 document.querySelectorAll('[data-k]').forEach(e=>e.onclick=()=>{V.k=+e.dataset.k;render()});
 on('#dms',()=>{const t=$('#dmi').value.trim();if(!t)return;const m=L('dm',{}),k=V.k??0;(m[k]=m[k]||[]).push(t);S('dm',m);render()});
 const sh=$('#sh');if(sh){sh.oninput=()=>{cfg.hue=+sh.value;S('cfg',cfg);apply()};$('#sb').onchange=e=>{cfg.blur=e.target.checked;S('cfg',cfg);apply()};$('#sm').onchange=e=>{cfg.motion=e.target.checked;S('cfg',cfg);apply()};$('#sx').onclick=()=>{localStorage.clear();location.reload()}}
 if(!room)return;const r=room;
 r.sync=BibuxSync.open(r.r.code,m=>{if(m.k=='chat'){r.chat.push(m.m);if(r.tab=='chat')pane()}else if(m.k=='load')play(m.id,false);else if(m.k=='play'||m.k=='pause'){if(PL.cur&&PL.ready){r.lock=1;PL.cur.seekTo(m.t,true);m.k=='play'?PL.cur.playVideo():PL.cur.pauseVideo();setTimeout(()=>r.lock=0,800)}}else if(m.k=='queue'){r.queue=m.q;pane()}else if(m.k=='react')fly(m.e);else if(m.k=='hi'){r.peers[m.u]=m.a;r.sync.send({k:'hello',u:me.name,a:me.av});pane()}else if(m.k=='hello'){r.peers[m.u]=m.a;pane()}});
 r.sync.send({k:'hi',u:me.name,a:me.av});if(PENDING){const id=PENDING;PENDING=null;play(id)}
 const ql=$('#ql');if(ql){fillQ();ql.onchange=()=>{if(!PL.cur||!PL.ready||!PL.id)return toast('Primero pon un video con la lupa');const q=ql.value||'default',t=PL.cur.getCurrentTime();try{PL.cur.setPlaybackQuality(q)}catch{}PL.cur.loadVideoById({videoId:PL.id,startSeconds:t,suggestedQuality:q});toast('Calidad pedida: '+ql.selectedOptions[0].textContent+'. YouTube decide si la aplica.')}}
 on('#yl',()=>{const id=ytId($('#yu').value);id?play(id):toast('Enlace de YouTube no válido')});
 on('#yq',()=>{const id=ytId($('#yu').value);if(!id)return toast('Enlace de YouTube no válido');addQ(id)});
 on('#fs',()=>{const s=$('#dock');(s.requestFullscreen||s.webkitRequestFullscreen||(()=>toast('Pantalla completa no disponible')))?.call(s)});
 const fb=$('#iv');if(fb){let sx,sy,ox,oy,mv=0;fb.onpointerdown=e=>{sx=e.clientX;sy=e.clientY;const r=fb.getBoundingClientRect();ox=r.left;oy=r.top;mv=0;fb.setPointerCapture(e.pointerId)};fb.onpointermove=e=>{if(!fb.hasPointerCapture(e.pointerId))return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>8)mv=1;if(mv){fb.style.left=Math.min(innerWidth-64,Math.max(4,ox+dx))+'px';fb.style.top=Math.min(innerHeight-64,Math.max(4,oy+dy))+'px';fb.style.right='auto';fb.style.bottom='auto'}};fb.onpointerup=()=>{if(!mv)copy(location.href)}}
 on('#bgb',()=>{const w=$('#wpr');w.style.display=w.style.display=='none'?'flex':'none'});
 document.querySelectorAll('[data-bg]').forEach(e=>e.onclick=()=>{S('bg-'+r.r.code,+e.dataset.bg);setBg(+e.dataset.bg)});
 on('#cn',()=>document.querySelector('.wt').classList.toggle('cine'));
 on('#rn2',()=>{const n=prompt('Nuevo nombre de la sala',r.r.name);const x=rooms.find(y=>y.code==r.r.code);if(n&&x){x.name=n.slice(0,40);S('rooms',rooms);render()}});
 on('#dl',()=>{if(confirm('¿Borrar esta sala?')){rooms=rooms.filter(y=>y.code!=r.r.code);S('rooms',rooms);location.hash='#/rooms'}});
 on('#mic',async()=>{try{toast(await BibuxRTC.toggleMic()?'Micrófono activado':'Micrófono apagado')}catch{toast('Permiso de micrófono denegado')}});
 document.querySelectorAll('.rb').forEach(b=>b.onclick=()=>{fly(b.textContent);r.sync.send({k:'react',e:b.textContent})});
 document.querySelectorAll('.tabsr button').forEach(b=>b.onclick=()=>{r.tab=b.dataset.t;pane()});
 const send=()=>{const t=$('#ci').value.trim();if(!t)return;const m={u:me.name,a:me.av,t};r.chat.push(m);const st=L('stats',{});st.msgs=(st.msgs||0)+1;S('stats',st);S('chat-'+r.r.code,r.chat.slice(-100));r.sync.send({k:'chat',m});$('#ci').value='';pane()};
 on('#cs',send);$('#ci').onkeydown=e=>{if(e.key=='Enter')send()};
 $('#pane').onclick=e=>{const b=e.target.closest('[data-p],[data-add],[data-go]');if(!b)return;if(b.dataset.p)play(b.dataset.p);else if(b.dataset.add)addQ(b.dataset.add);else doSearch($('#sq').value)};
 $('#pane').onkeydown=e=>{if(e.key=='Enter'&&e.target.id=='sq')doSearch(e.target.value)};pane()}
function fly(e){const s=$('#dock');if(!s)return;const x=document.createElement('span');x.className='rx';x.textContent=e;x.style.left=(10+Math.random()*80)+'%';s.appendChild(x);setTimeout(()=>x.remove(),2400)}
function copy(t){(navigator.clipboard?.writeText(t)||Promise.reject()).then(()=>toast('Enlace copiado'),()=>prompt('Copia el enlace:',t))}
function render(){cleanup();const h=location.hash.replace('#/','').split('/'),r=h[0]||'home';
 $('#side').innerHTML=`<div class="logo"><img src="assets/icons/logo.svg" alt="">Bibux</div>`+nav(r,NAV);$('#tabs').innerHTML=nav(r,NAV.filter(n=>MOB.includes(n[0])));
 $('#view').innerHTML=r=='watch'?watch(h[1]||'new'):(V[r]||V.home)();{const v=$('#view');if(V.dir){v.classList.remove('sl','sr');void v.offsetWidth;v.classList.add(V.dir=='l'?'sl':'sr');V.dir=null}}bind();setBg(room?L('bg-'+room.r.code,0):cfg.wp||0);window.scrollTo(0,0)}
addEventListener('hashchange',()=>{V.q='';V.c='';render()});apply();render();S('recent',L('recent',[]).filter(c=>!/^DEMO/.test(c)));
$('#srch').onclick=ovOpen;$('#ovx').onclick=()=>$('#ov').hidden=true;$('#ovg').onclick=ovSearch;$('#ovq').onkeydown=e=>{if(e.key=='Enter')ovSearch()};
$('#ovr').onclick=e=>{const b=e.target.closest('[data-op],[data-oq]');if(!b)return;if(b.dataset.op){play(b.dataset.op);$('#ov').hidden=true;toast('Reproduciendo')}else addQ(b.dataset.oq)};
let tx=0,ty=0,tk=0;
addEventListener('touchstart',e=>{const t=e.touches[0];tx=t.clientX;ty=t.clientY;tk=e.target.closest('.rail,input,textarea,select,#dock,.panel.side,#ov,.stage,.chip')?1:0},{passive:true});
addEventListener('touchend',e=>{if(tk||!$('#ov').hidden)return;const t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.6)return;const r=location.hash.replace('#/','').split('/')[0]||'home',i=NAV.findIndex(n=>n[0]==r),j=i+(dx<0?1:-1);if(i<0||j<0||j>=NAV.length)return;V.dir=dx<0?'l':'r';location.hash='#/'+NAV[j][0]},{passive:true});
setInterval(amb,1500);place();setInterval(place,200);addEventListener('scroll',place,{passive:true,capture:true});addEventListener('resize',place);$('#mo').onclick=()=>{if(PL.code)location.hash='#/watch/'+PL.code};$('#mx').onclick=stopPlayer;
})();

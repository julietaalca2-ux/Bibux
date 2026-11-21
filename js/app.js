(()=>{
const $=s=>document.querySelector(s),L=(k,d)=>{try{return JSON.parse(localStorage.getItem('bibux-'+k))??d}catch{return d}},S=(k,v)=>{try{localStorage.setItem('bibux-'+k,JSON.stringify(v))}catch{}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=['Música','Cine','Gaming','Anime','Deportes','Charlas','Aprender'];
let me=L('me',{name:'Invitado'+Math.floor(Math.random()*900+100),bio:'Mirando cosas buenas.',av:1});
let cfg=L('cfg',{hue:262,blur:true,motion:true});
let rooms=L('rooms',[]);
// Datos de ejemplo (marcados como tal en la interfaz): sirven para ver el diseño sin backend.
const SAMPLE=[['Noche de synthwave','Música',1,128],['Maratón de cortos','Cine',2,86],['Speedruns en vivo','Gaming',3,203],['Opening club','Anime',4,64],['Tertulia futbolera','Deportes',5,150],['Café y ciencia','Aprender',6,41]].map((r,i)=>({code:'DEMO'+i,name:r[0],cat:r[1],cover:r[2],viewers:r[3],sample:1,queue:[],priv:0}));
const FRIENDS=[['Luna',1,1,'Viendo Noche de synthwave'],['Kai',2,1,'En línea'],['Nora',3,0,'Hace 2 h'],['Dante',4,1,'Viendo Opening club'],['Ivy',5,0,'Ayer'],['Zoe',6,1,'En línea']];
const NOTIFS=[['Luna te invitó a Noche de synthwave','Invitación','av1'],['Kai aceptó tu solicitud','Amigos','av2'],['Nuevo mensaje de Dante','Mensajes','av4'],['Café y ciencia empieza ahora','Actividad','av6']];
const allRooms=()=>[...rooms,...SAMPLE];
const getRoom=c=>allRooms().find(r=>r.code===c);
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)};
const ytId=u=>(u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/)||[])[1]||(/^[\w-]{11}$/.test(u.trim())?u.trim():null);
const NAV=[['home','Inicio'],['explore','Explorar'],['rooms','Salas'],['friends','Amigos'],['messages','Mensajes','chat'],['notifications','Avisos','bell'],['profile','Perfil','user'],['settings','Ajustes','gear']];
const MOB=['home','explore','rooms','friends','profile'];
const nav=(r,list)=>list.map(n=>`<a class="nv ${r==n[0]?'on':''}" href="#/${n[0]}" style="--ic:url(assets/icons/${n[2]||n[0]}.svg)"><i></i>${n[1]}</a>`).join('');
const card=r=>`<a class="rc" href="#/watch/${r.code}" style="background-image:url(assets/covers/cover${r.cover||1}.png)"><span class="tag">${r.priv?'Privada':'Pública'}${r.sample?' · ejemplo':''}</span><div><b>${esc(r.name)}</b><br><small>${r.cat} · ${r.viewers||1} viendo</small></div></a>`;
const rail=a=>`<div class="rail">${a.map(card).join('')||'<p class="sub">Aún no hay salas.</p>'}</div>`;
const apply=()=>{document.documentElement.style.setProperty('--h',cfg.hue);document.body.classList.toggle('noblur',!cfg.blur);document.body.classList.toggle('nored',!cfg.motion)};
let room=null;
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
<h2>Continuar viendo</h2>${rail(rec)}<h2>Recomendadas</h2>${rail(SAMPLE.slice(0,4))}<h2>Populares</h2>${rail([...SAMPLE].sort((a,b)=>b.viewers-a.viewers).slice(0,4))}
<h2>Actividad de amigos <small class="sub">(ejemplo)</small></h2><div class="panel">${FRIENDS.filter(f=>f[2]).map(f=>`<div class="li"><img class="av" src="assets/avatars/av${f[1]}.png"><div><b>${f[0]}</b><br><small class="sub">${f[3]}</small></div></div>`).join('')}</div>`},
explore:()=>{const q=(V.q||'').toLowerCase(),c=V.c||'';const l=allRooms().filter(r=>!r.priv&&(!c||r.cat==c)&&r.name.toLowerCase().includes(q));
return`<h1>Explorar</h1><div class="row"><input id="q" placeholder="Buscar salas" value="${esc(V.q||'')}" style="flex:1"><select id="so"><option>Tendencias</option><option>Nombre</option></select></div><div class="row">${['',...CATS].map(x=>`<span class="chip ${c==x?'on':''}" data-c="${x}">${x||'Todas'}</span>`).join('')}</div><h2>${l.length} salas públicas</h2><div class="grid">${l.sort((a,b)=>V.s=='Nombre'?a.name.localeCompare(b.name):(b.viewers||0)-(a.viewers||0)).map(card).join('')}</div>`},
rooms:()=>`<h1>Salas</h1><div class="panel" style="margin-top:14px"><div class="row" style="margin:0"><input id="rn" placeholder="Nombre de la sala" style="flex:1"><select id="rc">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><select id="rp"><option value="0">Pública</option><option value="1">Privada</option></select><button class="pri" id="mk">Crear sala</button></div></div>
<div class="panel" style="margin-top:14px"><div class="row" style="margin:0"><input id="jc" placeholder="Código de invitación" style="flex:1"><button id="jn">Unirme</button></div></div><h2>Mis salas</h2><div class="grid">${rooms.map(card).join('')||'<p class="sub">Crea tu primera sala y comparte el código.</p>'}</div>`,
friends:()=>`<h1>Amigos</h1><p class="sub">Lista de ejemplo: la cuenta real de amigos se activa al conectar Supabase.</p><div class="panel" style="margin-top:14px">${FRIENDS.map(f=>`<div class="li"><img class="av" src="assets/avatars/av${f[1]}.png"><div><b>${f[0]}</b> <span class="dot ${f[2]?'on':''}"></span><br><small class="sub">${f[3]}</small></div><a class="btn" href="#/messages">Mensaje</a></div>`).join('')}</div><h2>Invitar amigos</h2><button class="pri" id="inv">Copiar enlace de Bibux</button>`,
messages:()=>{const k=V.k??0,m=L('dm',{});return`<h1>Mensajes</h1><div class="wt" style="margin-top:14px"><div class="panel">${FRIENDS.map((f,i)=>`<div class="li" data-k="${i}" style="cursor:pointer"><img class="av" src="assets/avatars/av${f[1]}.png"><div><b>${f[0]}</b> <span class="dot ${f[2]?'on':''}"></span><br><small class="sub">${esc((m[i]||[]).slice(-1)[0]||'Sin mensajes')}</small></div></div>`).join('')}</div><div class="panel side"><div class="pane" id="dm">${(m[k]||[]).map(t=>`<div class="msg me"><div class="bub">${esc(t)}</div></div>`).join('')||'<p class="sub">Escribe el primer mensaje. Se guarda solo en este dispositivo.</p>'}</div><div class="cb"><input id="dmi" placeholder="Mensaje a ${FRIENDS[k][0]}"><button class="pri" id="dms">Enviar</button></div></div></div>`},
notifications:()=>`<h1>Notificaciones</h1><p class="sub">Ejemplos de diseño.</p><div class="panel" style="margin-top:14px">${NOTIFS.map(n=>`<div class="li"><img class="av" src="assets/avatars/${n[2].replace('av','av')}.png"><div><b>${n[0]}</b><br><small class="sub">${n[1]}</small></div></div>`).join('')}</div>`,
profile:()=>`<h1>Perfil</h1><div class="panel" style="margin-top:14px"><div class="row" style="margin:0">${[1,2,3,4,5,6,7,8].map(i=>`<img class="av ${me.av==i?'':'s'}" data-a="${i}" src="assets/avatars/av${i}.png" style="cursor:pointer">`).join('')}</div><div class="row"><input id="pn" value="${esc(me.name)}" placeholder="Nombre de usuario"></div><div class="row"><textarea id="pb" rows="3" style="width:100%">${esc(me.bio)}</textarea></div><div class="row"><button class="pri" id="ps">Guardar perfil</button></div></div><h2>Actividad</h2><p class="sub">${L('recent',[]).length} salas visitadas · ${rooms.length} salas creadas</p>`,
settings:()=>`<h1>Ajustes</h1><div class="panel" style="margin-top:14px"><div class="sw">Color de acento<input type="range" id="sh" min="190" max="320" value="${cfg.hue}"></div><div class="sw">Efecto cristal<input type="checkbox" id="sb" ${cfg.blur?'checked':''}></div><div class="sw">Animaciones<input type="checkbox" id="sm" ${cfg.motion?'checked':''}></div><div class="sw">Borrar datos locales<button id="sx">Borrar</button></div></div>`
};
function watch(code){
 let r=code=='new'?{code:'new',name:'Sala rápida',cat:'Charlas',cover:1,queue:[],host:me.name,viewers:1,priv:1}:getRoom(code);
 if(!r){return`<h1>Sala no encontrada</h1><p class="sub">Revisa el código o crea una sala.</p><a class="btn pri" href="#/rooms">Ir a Salas</a>`}
 if(r.sample&&!rooms.find(x=>x.code==code)){r={...r,queue:L('q-'+code,[]),host:me.name}}
 const rec=L('recent',[]).filter(c=>c!=code);rec.unshift(code);S('recent',rec.slice(0,8));
 room={r,cur:null,tab:'chat',chat:L('chat-'+code,[]),queue:r.queue||[],peers:{[me.name]:me.av}};
 return`<div class="wt"><div><div class="stage" id="stage"><div id="yt"><div class="empty"><div><h2>${esc(r.name)}</h2><p>Pega un enlace de YouTube abajo para empezar.</p></div></div></div></div>
<div class="row"><input id="yu" placeholder="Enlace de YouTube" style="flex:1"><button class="pri" id="yl">Reproducir</button><button id="yq">A la cola</button></div>
<div class="row"><button id="mic">🎙 Micrófono</button><button id="fs">⛶ Pantalla completa</button><button id="iv">Invitar</button>${['🔥','😂','❤️','👏','😮'].map(e=>`<button class="rb">${e}</button>`).join('')}</div><p class="sub" style="margin-top:10px">Código: <b>${r.code}</b> · Anfitrión: ${esc(r.host||'—')} · Sincronización activa entre pestañas de este navegador; entre dispositivos requiere Supabase.</p></div>
<div class="panel side"><div class="tabsr"><button data-t="chat" class="on">Chat</button><button data-t="ppl">Personas</button><button data-t="s">Buscar</button><button data-t="q">Cola</button></div><div class="pane" id="pane"></div><div class="cb" id="cb"><input id="ci" placeholder="Escribe un mensaje"><button class="pri" id="cs">Enviar</button></div></div></div>`}
function pane(){if(!room)return;const p=$('#pane');if(!p)return;$('#cb').style.display=room.tab=='chat'?'flex':'none';
 document.querySelectorAll('.tabsr button').forEach(b=>b.classList.toggle('on',b.dataset.t==room.tab));
 if(room.tab=='chat'){p.innerHTML=room.chat.map(m=>`<div class="msg ${m.u==me.name?'me':''}"><img class="av s" src="assets/avatars/av${m.a}.png"><div class="bub"><small class="sub">${esc(m.u)}</small><br>${esc(m.t)}</div></div>`).join('')||'<p class="sub">Nadie ha escrito todavía.</p>';p.scrollTop=1e9}
 else if(room.tab=='ppl')p.innerHTML=Object.entries(room.peers).map(([n,a])=>`<div class="li"><img class="av" src="assets/avatars/av${a}.png"><div><b>${esc(n)}</b>${n==room.r.host?' · anfitrión':''}</div><span class="dot on"></span></div>`).join('');
 else if(room.tab=='s'){const f=p.querySelector('#sq')===document.activeElement;p.innerHTML=`<div class="row" style="margin:0"><input id="sq" placeholder="Buscar en YouTube" value="${esc(room.sq||'')}" style="flex:1"><button class="pri" data-go="1">Buscar</button></div>`+(room.res===null?'<p class="sub">Buscando…</p>':(room.res||[]).map(x=>vrow(x.id,`<button data-p="${x.id}">▶</button><button data-add="${x.id}">＋</button>`)).join(''))}
 else{p.innerHTML=room.queue.map(id=>vrow(id,`<button data-p="${id}">▶</button>`)).join('')||'<p class="sub">La cola está vacía. Usa Buscar para añadir videos.</p>';metaFor(room.queue)}}
function loadYT(cb){if(window.YT&&YT.Player)return cb();const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);window.onYouTubeIframeAPIReady=cb}
function play(id,emit=true){if(!room)return;loadYT(()=>{if(!room)return;const mk=()=>{room.cur=new YT.Player('yt',{videoId:id,playerVars:{rel:0,playsinline:1,autoplay:1},events:{onStateChange:e=>{if(room.lock)return;const t=room.cur.getCurrentTime();if(e.data==1)room.sync.send({k:'play',t});if(e.data==2)room.sync.send({k:'pause',t})}}})};
 if(room.cur&&room.cur.loadVideoById)room.cur.loadVideoById(id);else mk()});if(emit)room.sync.send({k:'load',id})}
function bind(){const v=$('#view');
 document.querySelectorAll('[data-c]').forEach(e=>e.onclick=()=>{V.c=e.dataset.c;render()});
 const q=$('#q');if(q)q.oninput=()=>{V.q=q.value;clearTimeout(V.tm);V.tm=setTimeout(()=>{render();$('#q').focus();$('#q').setSelectionRange(99,99)},250)};
 const so=$('#so');if(so){so.value=V.s||'Tendencias';so.onchange=()=>{V.s=so.value;render()}}
 const on=(i,f)=>{const e=$(i);if(e)e.onclick=f};
 on('#mk',()=>{const n=$('#rn').value.trim()||'Mi sala';const code=Math.random().toString(36).slice(2,8).toUpperCase();rooms.unshift({code,name:n,cat:$('#rc').value,priv:+$('#rp').value,cover:1+rooms.length%6,host:me.name,viewers:1,queue:[]});S('rooms',rooms);location.hash='#/watch/'+code});
 on('#jn',()=>{const c=$('#jc').value.trim().toUpperCase();if(getRoom(c))location.hash='#/watch/'+c;else toast('Código no encontrado en este dispositivo')});
 on('#inv',()=>copy(location.href.split('#')[0]));
 on('#ps',()=>{me.name=$('#pn').value.trim()||me.name;me.bio=$('#pb').value;S('me',me);toast('Perfil guardado')});
 document.querySelectorAll('[data-a]').forEach(e=>e.onclick=()=>{me.av=+e.dataset.a;S('me',me);render()});
 document.querySelectorAll('[data-k]').forEach(e=>e.onclick=()=>{V.k=+e.dataset.k;render()});
 on('#dms',()=>{const t=$('#dmi').value.trim();if(!t)return;const m=L('dm',{}),k=V.k??0;(m[k]=m[k]||[]).push(t);S('dm',m);render()});
 const sh=$('#sh');if(sh){sh.oninput=()=>{cfg.hue=+sh.value;S('cfg',cfg);apply()};$('#sb').onchange=e=>{cfg.blur=e.target.checked;S('cfg',cfg);apply()};$('#sm').onchange=e=>{cfg.motion=e.target.checked;S('cfg',cfg);apply()};$('#sx').onclick=()=>{localStorage.clear();location.reload()}}
 if(!room)return;const r=room;
 r.sync=BibuxSync.open(r.r.code,m=>{if(m.k=='chat'){r.chat.push(m.m);if(r.tab=='chat')pane()}else if(m.k=='load')play(m.id,false);else if(m.k=='play'||m.k=='pause'){if(r.cur&&r.cur.seekTo){r.lock=1;r.cur.seekTo(m.t,true);m.k=='play'?r.cur.playVideo():r.cur.pauseVideo();setTimeout(()=>r.lock=0,800)}}else if(m.k=='queue'){r.queue=m.q;pane()}else if(m.k=='react')fly(m.e);else if(m.k=='hi'){r.peers[m.u]=m.a;r.sync.send({k:'hello',u:me.name,a:me.av});pane()}else if(m.k=='hello'){r.peers[m.u]=m.a;pane()}});
 r.sync.send({k:'hi',u:me.name,a:me.av});
 on('#yl',()=>{const id=ytId($('#yu').value);id?play(id):toast('Enlace de YouTube no válido')});
 on('#yq',()=>{const id=ytId($('#yu').value);if(!id)return toast('Enlace de YouTube no válido');addQ(id)});
 on('#fs',()=>{const s=$('#stage');(s.requestFullscreen||s.webkitRequestFullscreen||(()=>toast('Pantalla completa no disponible')))?.call(s)});
 on('#iv',()=>copy(location.href));
 on('#mic',async()=>{try{toast(await BibuxRTC.toggleMic()?'Micrófono activado':'Micrófono apagado')}catch{toast('Permiso de micrófono denegado')}});
 document.querySelectorAll('.rb').forEach(b=>b.onclick=()=>{fly(b.textContent);r.sync.send({k:'react',e:b.textContent})});
 document.querySelectorAll('.tabsr button').forEach(b=>b.onclick=()=>{r.tab=b.dataset.t;pane()});
 const send=()=>{const t=$('#ci').value.trim();if(!t)return;const m={u:me.name,a:me.av,t};r.chat.push(m);S('chat-'+r.r.code,r.chat.slice(-100));r.sync.send({k:'chat',m});$('#ci').value='';pane()};
 on('#cs',send);$('#ci').onkeydown=e=>e.key=='Enter'&&send();
 $('#pane').onclick=e=>{const b=e.target.closest('[data-p],[data-add],[data-go]');if(!b)return;if(b.dataset.p)play(b.dataset.p);else if(b.dataset.add)addQ(b.dataset.add);else doSearch($('#sq').value)};
 $('#pane').onkeydown=e=>{if(e.key=='Enter'&&e.target.id=='sq')doSearch(e.target.value)};pane()}
function fly(e){const s=$('#stage');if(!s)return;const x=document.createElement('span');x.className='rx';x.textContent=e;x.style.left=(10+Math.random()*80)+'%';s.appendChild(x);setTimeout(()=>x.remove(),2400)}
function copy(t){(navigator.clipboard?.writeText(t)||Promise.reject()).then(()=>toast('Enlace copiado'),()=>prompt('Copia el enlace:',t))}
function render(){cleanup();const h=location.hash.replace('#/','').split('/'),r=h[0]||'home';
 $('#side').innerHTML=`<div class="logo"><img src="assets/icons/logo.svg" alt="">Bibux</div>`+nav(r,NAV);$('#tabs').innerHTML=nav(r,NAV.filter(n=>MOB.includes(n[0])));
 $('#view').innerHTML=r=='watch'?watch(h[1]||'new'):(V[r]||V.home)();bind();window.scrollTo(0,0)}
addEventListener('hashchange',()=>{V.q='';V.c='';render()});apply();render();
})();

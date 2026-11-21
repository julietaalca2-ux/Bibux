// Sincronización de la sala. Con Supabase usa un canal Realtime ('room:'+código) que funciona entre celulares.
// Sin Supabase (o si falla el inicio de sesión) usa BroadcastChannel: solo pestañas del mismo navegador.
window.BibuxSync={open(code,onMsg){
 const D=window.BibuxDB;
 const local=()=>{const ch=new BroadcastChannel('bibux-'+code);ch.onmessage=e=>onMsg(e.data);return{send:m=>ch.postMessage(m),close:()=>ch.close()}};
 if(!(D&&D.client))return local();
 let ch=null,lc=null,ok=false,closed=false;const q=[];
 const raw=m=>ch.send({type:'broadcast',event:'m',payload:m});
 D.ready.then(a=>{
  if(closed)return;
  if(!a){lc=local();q.splice(0).forEach(m=>lc.send(m));return}
  ch=D.client.channel('room:'+code);
  ch.on('broadcast',{event:'m'},p=>onMsg(p.payload)).subscribe(s=>{if(s==='SUBSCRIBED'){ok=true;q.splice(0).forEach(raw)}});
 });
 return{send:m=>{if(lc)lc.send(m);else if(ok)raw(m);else q.push(m)},close:()=>{closed=true;try{if(lc)lc.close()}catch{}try{if(ch)D.client.removeChannel(ch)}catch{}}}
}};

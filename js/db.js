// Conexión a Supabase: sesión anónima automática, salas y perfil.
// Si falta la configuración o no carga la librería, Bibux sigue funcionando en modo local.
(function(){
var C=window.BIBUX_CONFIG||{},DB=window.BibuxDB={ok:false,client:null,uid:null,err:'',ready:Promise.resolve(false)};
if(!C.SUPABASE_URL||!C.SUPABASE_ANON_KEY||!window.supabase||!window.supabase.createClient)return;
try{DB.client=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY)}catch(e){DB.err=String(e.message||e);return}
DB.ready=(async function(){
 try{
  var g=await DB.client.auth.getSession(),s=g.data&&g.data.session;
  if(!s){var r=await DB.client.auth.signInAnonymously();if(r.error)throw r.error;s=r.data.session}
  DB.uid=s.user.id;DB.ok=true;return true
 }catch(e){DB.err=String(e.message||e);return false}
})();
function need(){if(!DB.ok)throw new Error(DB.err||'sin sesión')}
DB.createRoom=async function(r){need();
 var x=await DB.client.from('rooms').insert({code:r.code,name:r.name,cat:r.cat,priv:!!r.priv,cover:r.cover||1,host:DB.uid,host_name:r.host});
 if(x.error)throw x.error};
DB.getRoom=async function(code){need();
 var x=await DB.client.from('rooms').select('*').eq('code',code).maybeSingle();
 if(x.error)throw x.error;return x.data};
DB.listPublic=async function(){need();
 var x=await DB.client.from('rooms').select('*').eq('priv',false).order('created_at',{ascending:false}).limit(30);
 if(x.error)throw x.error;return x.data||[]};
DB.saveProfile=async function(m){need();
 var x=await DB.client.from('profiles').upsert({id:DB.uid,name:m.name,bio:m.bio||'',av:m.av||1,banner:m.banner||1,mood:m.mood||'😎',status:m.status||'on'});
 if(x.error)throw x.error};
})();

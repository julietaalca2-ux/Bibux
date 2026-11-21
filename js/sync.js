// Capa de sincronización. Hoy: BroadcastChannel (pestañas del mismo navegador).
// Para multiusuario real, reemplaza open() por un canal Realtime de Supabase con la misma interfaz.
window.BibuxSync={open(code,onMsg){const ch=new BroadcastChannel('bibux-'+code);ch.onmessage=e=>onMsg(e.data);return{send:m=>ch.postMessage(m),close:()=>ch.close()}}};

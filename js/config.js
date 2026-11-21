// Conexión a Supabase. La clave "publishable" es pública por diseño; la seguridad la dan las reglas (RLS) de las tablas.
// Tablas: profiles, rooms, room_members, messages, friendships, notifications
// Canal realtime de cada sala: 'room:'+código (eventos chat/play/pause/seek/queue/react), ver js/sync.js
window.BIBUX_CONFIG={YT_API_KEY:'AIzaSyBLAT5UwQNygwtCf4akGYBCGtnumdvvL7s',GOOGLE_CLIENT_ID:'135043424057-q16obvcm7lksd15jg534p224rehqu17k.apps.googleusercontent.com',SUPABASE_URL:'https://rfywytcsrllflvdgtwga.supabase.co',SUPABASE_ANON_KEY:'sb_publishable_em8uhJUJDjFDdzn9JhXeCg_BHOp3Iji',ICE_SERVERS:[{urls:'stun:stun.l.google.com:19302'}]};

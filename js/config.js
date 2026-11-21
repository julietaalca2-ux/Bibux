// Conexión futura a Supabase. Mientras SUPABASE_URL sea null, Bibux funciona en local.
// Tablas previstas: profiles, rooms, room_members, messages, friendships, notifications
// Canal realtime previsto: supabase.channel('room:'+code) con eventos chat/play/pause/seek/queue/react
window.BIBUX_CONFIG={SUPABASE_URL:null,SUPABASE_ANON_KEY:null,ICE_SERVERS:[{urls:'stun:stun.l.google.com:19302'}]};

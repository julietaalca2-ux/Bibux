# Bibux
Plataforma watch party: salas, YouTube incrustado, chat, cola, reacciones, amigos, mensajes, perfil y ajustes.
## Publicar desde el celular (GitHub Pages)
1. En GitHub crea un repositorio y sube el contenido del ZIP (descomprimido) con "Add file > Upload files".
2. Settings > Pages > Deploy from a branch > main / root.
3. Abre la URL que GitHub te da.
## Claves
La clave de YouTube Data API está en js/config.js. Debe estar restringida a tu dominio de GitHub Pages y a YouTube Data API v3 en Google Cloud.
## Google
El ID de cliente está en js/config.js. En Google Cloud, el cliente OAuth (tipo Aplicación web) debe tener como origen autorizado de JavaScript la URL de tu GitHub Pages (https://usuario.github.io).
## Novedades
Editor de perfil completo (foto propia, 24 avatares, portadas, estado, gustos, privacidad, exportar/importar), 16 fondos HD, favoritos, insignias, modo cine y controles de anfitrión.
## Qué funciona hoy
YouTube real (reproductor oficial), cola, chat y sincronización entre pestañas del mismo navegador, salas/códigos guardados en el dispositivo, micrófono (permiso real), pantalla completa, perfil y ajustes.
## Qué requiere backend (preparado en js/config.js, js/sync.js, js/rtc.js)
Salas y chat entre dispositivos distintos (Supabase Realtime), amigos/mensajes reales, voz WebRTC. Las listas de amigos, notificaciones y salas "ejemplo" son datos de muestra.

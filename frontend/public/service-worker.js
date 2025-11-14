// Service Worker para notificaciones push
// Versión: 1.0.0
const CACHE_VERSION = 'agromap-sw-v1';

// Evento de instalación
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Instalando versión', CACHE_VERSION);
  // Forzar activación inmediata
  self.skipWaiting();
});

// Evento de activación
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activando versión', CACHE_VERSION);
  // Tomar control inmediatamente
  event.waitUntil(self.clients.claim());
});

// Evento push
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push event recibido!', event);

  if (event.data) {
    console.log('[Service Worker] Push data:', event.data.text());

    try {
      const data = event.data.json();
      console.log('[Service Worker] Push data JSON:', data);

      const options = {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: data.badge || '/logo.png',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
          {
            action: 'view',
            title: 'Ver producto'
          },
          {
            action: 'close',
            title: 'Cerrar'
          }
        ]
      };

      console.log('[Service Worker] Mostrando notificación:', data.title, options);

      event.waitUntil(
        self.registration.showNotification(data.title, options)
          .then(() => {
            console.log('[Service Worker] Notificación mostrada exitosamente');
          })
          .catch(error => {
            console.error('[Service Worker] Error al mostrar notificación:', error);
          })
      );
    } catch (error) {
      console.error('[Service Worker] Error al procesar push data:', error);
    }
  } else {
    console.log('[Service Worker] Push event sin data');
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        // Si ya hay una ventana abierta, enfocarse en ella
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed');
  // Aqu� podr�as manejar cambios en la suscripci�n
});

// Service Worker para caché de tiles del mapa
const CACHE_NAME = 'agromap-tiles-v1';
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 días

// Tiles de OpenStreetMap
const TILE_URLS = [
  'https://tile.openstreetmap.org',
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  self.skipWaiting();
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Solo cachear tiles de OpenStreetMap
  if (url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Si existe en caché y no ha expirado, devolverlo
          if (cachedResponse) {
            // Verificar fecha de caché
            const cachedDate = cachedResponse.headers.get('sw-cached-date');
            if (cachedDate) {
              const age = Date.now() - parseInt(cachedDate);
              if (age < CACHE_EXPIRATION) {
                console.log('Service Worker: Sirviendo desde caché:', url);
                return cachedResponse;
              }
            }
          }

          // Si no está en caché o expiró, hacer fetch
          return fetch(event.request)
            .then((response) => {
              // Solo cachear respuestas exitosas
              if (response && response.status === 200) {
                // Clonar la respuesta
                const responseToCache = response.clone();

                // Agregar fecha de caché
                const headers = new Headers(responseToCache.headers);
                headers.append('sw-cached-date', Date.now().toString());

                // Crear nueva respuesta con headers modificados
                responseToCache.blob().then((blob) => {
                  const newResponse = new Response(blob, {
                    status: responseToCache.status,
                    statusText: responseToCache.statusText,
                    headers: headers,
                  });

                  // Guardar en caché
                  cache.put(event.request, newResponse);
                  console.log('Service Worker: Guardando en caché:', url);
                });
              }

              return response;
            })
            .catch(() => {
              // Si falla el fetch y tenemos caché (aunque esté expirado), usarlo
              if (cachedResponse) {
                console.log('Service Worker: Offline, usando caché expirado:', url);
                return cachedResponse;
              }

              // Si no hay caché, devolver tile vacío/placeholder
              console.log('Service Worker: Sin caché disponible para:', url);
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="16">Offline</text></svg>',
                {
                  headers: { 'Content-Type': 'image/svg+xml' },
                }
              );
            });
        });
      })
    );
  }
});

// Mensaje para precarga de tiles
self.addEventListener('message', (event) => {
  if (event.data.type === 'PRECACHE_TILES') {
    const { tiles } = event.data;
    console.log('Service Worker: Precargando', tiles.length, 'tiles...');

    caches.open(CACHE_NAME).then((cache) => {
      tiles.forEach((tileUrl) => {
        fetch(tileUrl)
          .then((response) => {
            if (response && response.status === 200) {
              const headers = new Headers(response.headers);
              headers.append('sw-cached-date', Date.now().toString());

              response.blob().then((blob) => {
                const newResponse = new Response(blob, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: headers,
                });
                cache.put(tileUrl, newResponse);
              });
            }
          })
          .catch((err) => {
            console.error('Error precargando tile:', tileUrl, err);
          });
      });
    });
  }
});

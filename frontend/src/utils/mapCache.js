// Utilidades para caché de mapas

// Función para generar URLs de tiles para una región específica
export function generateTileUrls(bounds, zoomLevels) {
  const tiles = [];
  const tileServer = 'https://tile.openstreetmap.org';

  zoomLevels.forEach((zoom) => {
    const { minX, maxX, minY, maxY } = latLngBoundsToTiles(bounds, zoom);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push(`${tileServer}/${zoom}/${x}/${y}.png`);
      }
    }
  });

  return tiles;
}

// Convertir coordenadas geográficas a tiles
function latLngBoundsToTiles(bounds, zoom) {
  const { north, south, east, west } = bounds;

  const minTile = latLngToTile(north, west, zoom);
  const maxTile = latLngToTile(south, east, zoom);

  return {
    minX: Math.min(minTile.x, maxTile.x),
    maxX: Math.max(minTile.x, maxTile.x),
    minY: Math.min(minTile.y, maxTile.y),
    maxY: Math.max(minTile.y, maxTile.y),
  };
}

// Convertir lat/lng a números de tile
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
  );

  return { x, y };
}

// Registrar Service Worker y precargar tiles de Villa Clara y Sancti Spíritus
export async function setupMapCache() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado:', registration);

      // Esperar a que el SW esté activo
      await navigator.serviceWorker.ready;

      // Definir bounds para Villa Clara y Sancti Spíritus
      const cubaCentralBounds = {
        north: 23.0,
        south: 21.8,
        east: -78.8,
        west: -80.2,
      };

      // Generar tiles para zoom 7-11 (área visible)
      const zoomLevels = [9, 10, 11, 12, 13, 14];
      const tiles = generateTileUrls(cubaCentralBounds, zoomLevels);

      console.log(`Precargando ${tiles.length} tiles para caché offline...`);

      // Enviar mensaje al Service Worker para precargar (de forma gradual)
      if (navigator.serviceWorker.controller) {
        // Dividir en chunks para no saturar
        const chunkSize = 50;
        for (let i = 0; i < tiles.length; i += chunkSize) {
          const chunk = tiles.slice(i, i + chunkSize);
          navigator.serviceWorker.controller.postMessage({
            type: 'PRECACHE_TILES',
            tiles: chunk,
          });
          // Esperar un poco entre chunks
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      return true;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return false;
    }
  } else {
    console.warn('Service Workers no soportados en este navegador');
    return false;
  }
}

// Verificar estado de caché
export async function getCacheStatus() {
  if ('caches' in window) {
    try {
      const cache = await caches.open('agromap-tiles-v1');
      const keys = await cache.keys();
      return {
        available: true,
        cachedTiles: keys.length,
      };
    } catch (error) {
      console.error('Error verificando caché:', error);
      return { available: false, cachedTiles: 0 };
    }
  }
  return { available: false, cachedTiles: 0 };
}

// Limpiar caché antiguo
export async function clearMapCache() {
  if ('caches' in window) {
    try {
      const deleted = await caches.delete('agromap-tiles-v1');
      console.log('Caché eliminado:', deleted);
      return deleted;
    } catch (error) {
      console.error('Error eliminando caché:', error);
      return false;
    }
  }
  return false;
}

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mercadoService } from '../services/api';
import { setupMapCache, getCacheStatus } from '../utils/mapCache';
import './Mercados.css';

// Icono personalizado para los marcadores
const redIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para controlar el zoom del mapa
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, {
        duration: 1.5
      });
    }
  }, [center, zoom, map]);

  return null;
}

function Mercados() {
  const [mercados, setMercados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMercado, setSelectedMercado] = useState(null);
  const [provinciaFiltro, setProvinciaFiltro] = useState('');
  const [provincias, setProvincias] = useState([]);
  const [mapCenter, setMapCenter] = useState([22.4, -79.6]);
  const [mapZoom, setMapZoom] = useState(9);
  const [cacheStatus, setCacheStatus] = useState({ available: false, cachedTiles: 0 });
  const markerRefs = useRef({});

  useEffect(() => {
    cargarDatos();
    initializeMapCache();
  }, []);

  const initializeMapCache = async () => {
    // Configurar caché de mapas
    const success = await setupMapCache();
    if (success) {
      // Verificar estado del caché después de un tiempo
      setTimeout(async () => {
        const status = await getCacheStatus();
        setCacheStatus(status);
        console.log('Caché de mapas:', status);
      }, 2000);
    }
  };

  const cargarDatos = async () => {
    try {
      const [mercadosRes, provinciasRes] = await Promise.all([
        mercadoService.obtenerTodos(),
        mercadoService.obtenerProvincias()
      ]);
      setMercados(mercadosRes.data);
      setProvincias(provinciasRes.data);
    } catch (error) {
      console.error('Error al cargar mercados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar mercados por búsqueda y provincia
  const mercadosFiltrados = mercados.filter(mercado => {
    const matchSearch = mercado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       mercado.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       mercado.municipio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchProvincia = !provinciaFiltro || mercado.provincia === provinciaFiltro;

    return matchSearch && matchProvincia;
  });

  // Manejar clic en mercado de la lista
  const handleMercadoClick = (mercado) => {
    setSelectedMercado(mercado);
    if (mercado.latitud && mercado.longitud) {
      setMapCenter([mercado.latitud, mercado.longitud]);
      setMapZoom(14);

      // Abrir popup del marcador
      setTimeout(() => {
        if (markerRefs.current[mercado.id]) {
          markerRefs.current[mercado.id].openPopup();
        }
      }, 1600);
    }
  };

  // Verificar si el mercado está abierto (por simplicidad, siempre abierto por ahora)
  const estaAbierto = (mercado) => {
    // Aquí podrías implementar lógica basada en horario
    return true;
  };

  if (loading) {
    return (
      <div className="mercados-map-container">
        <div className="loading">Cargando establecimientos...</div>
      </div>
    );
  }

  return (
    <div className="mercados-container">
      <div className="mercados-map-layout">
        {/* Panel izquierdo */}
        <div className="mercados-panel">
        <div className="panel-header">
          <h1>Establecimientos</h1>
          <p className="panel-subtitle">Encuentra mercados agrícolas en Cuba</p>
          {cacheStatus.cachedTiles > 0 && (
            <div className="cache-indicator" title={`${cacheStatus.cachedTiles} tiles guardados para uso offline`}>
              📦 Mapa disponible offline
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="search-section">
          <div className="search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar mercado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro de provincia */}
          <div className="filter-box">
            <select
              className="filter-select"
              value={provinciaFiltro}
              onChange={(e) => setProvinciaFiltro(e.target.value)}
            >
              <option value="">Todas las provincias</option>
              {provincias.map((provincia, index) => (
                <option key={index} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de mercados */}
        <div className="mercados-list">
          {mercadosFiltrados.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron establecimientos</p>
            </div>
          ) : (
            mercadosFiltrados.map((mercado) => (
              <div
                key={mercado.id}
                className={`mercado-item ${selectedMercado?.id === mercado.id ? 'active' : ''}`}
                onClick={() => handleMercadoClick(mercado)}
              >
                <div className="mercado-info">
                  <h3>{mercado.nombre}</h3>
                  <p className="mercado-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {mercado.municipio}, {mercado.provincia}
                  </p>
                  <span className={`mercado-status ${estaAbierto(mercado) ? 'open' : 'closed'}`}>
                    <span className="status-dot"></span>
                    {estaAbierto(mercado) ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                <svg className="mercado-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="mercados-map">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={mapZoom} />

          {mercadosFiltrados.map((mercado) => {
            if (mercado.latitud && mercado.longitud) {
              return (
                <Marker
                  key={mercado.id}
                  position={[mercado.latitud, mercado.longitud]}
                  icon={redIcon}
                  ref={(ref) => {
                    if (ref) {
                      markerRefs.current[mercado.id] = ref;
                    }
                  }}
                  eventHandlers={{
                    click: () => handleMercadoClick(mercado)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="popup-content">
                      {mercado.imagenes && mercado.imagenes.length > 0 ? (
                        <img
                          src={`http://localhost:5000${mercado.imagenes[0]}`}
                          alt={mercado.nombre}
                          className="popup-image"
                        />
                      ) : (
                        <div className="popup-image-placeholder">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="#9ca3af">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          </svg>
                        </div>
                      )}
                      <div className="popup-info">
                        <h3>{mercado.nombre}</h3>
                        <p className="popup-address">{mercado.direccion}</p>
                        <p className="popup-location">{mercado.municipio}, {mercado.provincia}</p>
                        <span className={`popup-status ${estaAbierto(mercado) ? 'open' : 'closed'}`}>
                          <span className="status-dot"></span>
                          {estaAbierto(mercado) ? 'Abierto ahora' : 'Cerrado'}
                        </span>
                        <Link to={`/mercados/${mercado.id}`} className="popup-button">
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
      </div>
    </div>
  );
}

export default Mercados;

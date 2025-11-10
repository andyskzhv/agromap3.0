import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapPicker.css';

// Fix para el icono del marcador en Leaflet con Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function MapPicker({ latitud, longitud, onChange }) {
  const cubaCenter = [21.5, -79.0]; // Centro aproximado de Cuba
  const [position, setPosition] = useState(null);

  // Inicializar posición si hay coordenadas previas
  useEffect(() => {
    if (latitud && longitud) {
      setPosition({ lat: parseFloat(latitud), lng: parseFloat(longitud) });
    }
  }, [latitud, longitud]);

  // Notificar cambios de posición al padre
  useEffect(() => {
    if (position && onChange) {
      onChange({
        latitud: position.lat.toFixed(6),
        longitud: position.lng.toFixed(6)
      });
    }
  }, [position, onChange]);

  return (
    <div className="map-picker-container">
      <div className="map-instructions">
        📍 Haz clic en el mapa para seleccionar la ubicación del mercado
      </div>
      <MapContainer
        center={position || cubaCenter}
        zoom={position ? 13 : 6}
        scrollWheelZoom={true}
        className="map-picker"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {position && (
        <div className="map-coordinates">
          <strong>Coordenadas seleccionadas:</strong>
          <span>Latitud: {position.lat.toFixed(6)}</span>
          <span>Longitud: {position.lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}

export default MapPicker;

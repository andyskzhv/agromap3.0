import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mercadoService } from '../services/api';
import './Mercados.css';

function Mercados() {
  const [mercados, setMercados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    provincia: '',
    municipio: ''
  });

  useEffect(() => {
    cargarMercados();
  }, []);

  const cargarMercados = async () => {
    try {
      const params = {};
      if (filtros.provincia) params.provincia = filtros.provincia;
      if (filtros.municipio) params.municipio = filtros.municipio;

      const response = await mercadoService.obtenerTodos(params);
      setMercados(response.data);
    } catch (error) {
      console.error('Error al cargar mercados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    setLoading(true);
    cargarMercados();
  };

  const limpiarFiltros = () => {
    setFiltros({ provincia: '', municipio: '' });
    setTimeout(() => cargarMercados(), 100);
  };

  if (loading) {
    return (
      <div className="mercados-container">
        <div className="loading">Cargando mercados...</div>
      </div>
    );
  }

  return (
    <div className="mercados-container">
      <header className="mercados-header">
        <h1>Mercados Disponibles</h1>
        <p>Explora los mercados de tu provincia</p>
      </header>

      <div className="filtros-section">
        <div className="filtro-group">
          <input
            type="text"
            placeholder="Filtrar por provincia"
            value={filtros.provincia}
            onChange={(e) => setFiltros({ ...filtros, provincia: e.target.value })}
          />
        </div>
        <div className="filtro-group">
          <input
            type="text"
            placeholder="Filtrar por municipio"
            value={filtros.municipio}
            onChange={(e) => setFiltros({ ...filtros, municipio: e.target.value })}
          />
        </div>
        <button onClick={handleFiltrar} className="btn-filtrar">
          Filtrar
        </button>
        <button onClick={limpiarFiltros} className="btn-limpiar">
          Limpiar
        </button>
      </div>

      {mercados.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron mercados</p>
        </div>
      ) : (
        <div className="mercados-grid">
          {mercados.map((mercado) => (
            <div key={mercado.id} className="mercado-card">
              <div className="mercado-header">
                <h3>{mercado.nombre}</h3>
                {mercado.perteneceSas && (
                  <span className="badge-sas">SAS</span>
                )}
              </div>
              
              <p className="mercado-descripcion">
                {mercado.descripcion || 'Sin descripción'}
              </p>

              <div className="mercado-info">
                <div className="info-item">
                  <strong>📍 Ubicación:</strong>
                  <span>{mercado.municipio}, {mercado.provincia}</span>
                </div>
                <div className="info-item">
                  <strong>📦 Productos:</strong>
                  <span>{mercado.productos.length} disponibles</span>
                </div>
                <div className="info-item">
                  <strong>👤 Gestor:</strong>
                  <span>{mercado.gestor.nombre}</span>
                </div>
              </div>

              <Link to={`/mercados/${mercado.id}`} className="btn-ver-mas">
                Ver detalles
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Mercados;
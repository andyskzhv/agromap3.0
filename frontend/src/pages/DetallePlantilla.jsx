import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { plantillaService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './DetallePlantilla.css';

function DetallePlantilla() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [plantilla, setPlantilla] = useState(null);
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mercados, setMercados] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageTitle(plantilla ? plantilla.nombre : 'Producto');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const response = await plantillaService.obtenerDetalle(id);
      setPlantilla(response.data.plantilla);
      setProductos(response.data.productos);
      setEstadisticas(response.data.estadisticas);
      setMercados(response.data.mercados);
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      toast.error('Error al cargar la información del producto');
    } finally {
      setLoading(false);
    }
  };

  const renderEstrellas = (puntuacion) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= puntuacion) {
        estrellas.push(<span key={i} className="estrella llena">⭐</span>);
      } else if (i - 0.5 <= puntuacion) {
        estrellas.push(<span key={i} className="estrella media">⭐</span>);
      } else {
        estrellas.push(<span key={i} className="estrella vacia">☆</span>);
      }
    }
    return estrellas;
  };

  if (loading) {
    return <div className="loading">Cargando información del producto...</div>;
  }

  if (!plantilla) {
    return <div className="error">Producto no encontrado</div>;
  }

  // Extraer todas las imágenes de los productos para la galería
  const todasLasImagenes = productos.flatMap(p => p.imagenes || []);

  return (
    <div className="detalle-plantilla-container">
      {/* Header con info de la plantilla */}
      <section className="plantilla-header">
        <div className="header-imagen">
          {plantilla.imagen ? (
            <img
              src={`http://localhost:5000${plantilla.imagen}`}
              alt={plantilla.nombre}
              className="plantilla-imagen-principal"
            />
          ) : (
            <div className="plantilla-sin-imagen">
              <span>📦</span>
            </div>
          )}
        </div>
        <div className="header-info">
          <h1>{plantilla.nombre}</h1>
          {plantilla.descripcion && (
            <p className="plantilla-descripcion">{plantilla.descripcion}</p>
          )}
          <div className="categoria-badge">{plantilla.categoria.nombre}</div>
        </div>
      </section>

      {/* Lista de mercados donde está disponible */}
      <section className="mercados-disponibles">
        <h2>Disponible en {mercados.length} {mercados.length === 1 ? 'mercado' : 'mercados'}</h2>
        <div className="mercados-grid">
          {productos.map(producto => (
            <div key={producto.id} className="mercado-card-detalle">
              <div className="mercado-card-header">
                <h3>{producto.mercado.nombre}</h3>
                <p className="mercado-ubicacion">{producto.mercado.municipio}, {producto.mercado.provincia}</p>
              </div>
              <div className="mercado-card-body">
                {producto.precio && (
                  <p className="producto-precio">
                    ${producto.precio.toFixed(2)} CUP / {producto.unidadPrecio.toLowerCase()}
                  </p>
                )}
                {producto.tipoProducto && (
                  <p className="producto-tipo">{producto.tipoProducto}</p>
                )}
                {producto.mercado.direccion && (
                  <p className="mercado-direccion">{producto.mercado.direccion}</p>
                )}
                {producto._count.valoraciones > 0 && (
                  <div className="valoracion-mercado-inline">
                    <span className="promedio">⭐ {producto.promedioValoracion}</span>
                    <span className="count">({producto._count.valoraciones} valoraciones)</span>
                  </div>
                )}
              </div>
              <Link to={`/productos/${producto.id}`} className="btn-ver-mercado-card">
                Ver detalles
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Galería de fotos de usuarios */}
      {todasLasImagenes.length > 0 && (
        <section className="galeria-fotos">
          <h2>Fotos de la comunidad</h2>
          <div className="fotos-grid">
            {todasLasImagenes.slice(0, 8).map((imagen, index) => (
              <div key={index} className="foto-item">
                <img
                  src={`http://localhost:5000${imagen}`}
                  alt={`${plantilla.nombre} - foto ${index + 1}`}
                />
              </div>
            ))}
          </div>
          {todasLasImagenes.length > 8 && (
            <p className="mas-fotos">+ {todasLasImagenes.length - 8} fotos más</p>
          )}
        </section>
      )}

      {/* Comentarios y valoraciones agrupados por mercado */}
      {estadisticas && estadisticas.totalComentarios > 0 && (
        <section className="comentarios-por-mercado">
          <h2>Opiniones de los consumidores</h2>

          {productos.filter(p => p.comentarios.length > 0).map(producto => (
            <div key={producto.id} className="mercado-comentarios">
              {/* Header del mercado */}
              <div className="mercado-header-comentarios">
                <div className="mercado-info-com">
                  <h3>🏪 {producto.mercado.nombre}</h3>
                  <p className="ubicacion">{producto.mercado.municipio}, {producto.mercado.provincia}</p>
                </div>
                <div className="mercado-actions">
                  {producto._count.valoraciones > 0 && (
                    <div className="valoracion-mercado">
                      <span className="promedio">⭐ {producto.promedioValoracion}</span>
                      <span className="count">({producto._count.valoraciones})</span>
                    </div>
                  )}
                  <Link to={`/mercados/${producto.mercado.id}`} className="btn-ver-mercado">
                    Ver mercado
                  </Link>
                </div>
              </div>

              {/* Comentarios de este producto */}
              <div className="comentarios-lista">
                {producto.comentarios.map(comentario => (
                  <div key={comentario.id} className="comentario-card">
                    <div className="comentario-header">
                      <div className="usuario-info">
                        {comentario.usuario.imagen ? (
                          <img
                            src={`http://localhost:5000${comentario.usuario.imagen}`}
                            alt={comentario.usuario.nombre}
                            className="usuario-avatar"
                          />
                        ) : (
                          <div className="usuario-avatar-placeholder">
                            {comentario.usuario.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="usuario-nombre">{comentario.usuario.nombre}</span>
                      </div>
                      {comentario.recomienda && (
                        <span className="badge-recomienda">✓ Recomienda</span>
                      )}
                    </div>
                    <p className="comentario-texto">{comentario.texto}</p>
                    <div className="comentario-footer">
                      <span className="likes">❤️ {comentario.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Botón para volver */}
      <div className="acciones-footer">
        <button onClick={() => navigate('/')} className="btn-volver">
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default DetallePlantilla;

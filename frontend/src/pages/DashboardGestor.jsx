import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './DashboardGestor.css';

function DashboardGestor() {
  usePageTitle('Dashboard del Gestor');
  const navigate = useNavigate();
  const toast = useToast();
  const [vista, setVista] = useState('estadisticas');
  const [estadisticas, setEstadisticas] = useState(null);
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.rol !== 'GESTOR' && usuario.rol !== 'ADMIN') {
      toast.error('No tienes permisos de gestor');
      navigate('/perfil');
      return;
    }
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, actividadRes] = await Promise.all([
        fetch('http://localhost:5000/api/gestor/estadisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/gestor/actividad', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const stats = await statsRes.json();
      const act = await actividadRes.json();

      setEstadisticas(stats);
      setActividad(act);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="gestor-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (!estadisticas || !estadisticas.mercado) {
    return (
      <div className="gestor-container">
        <div className="gestor-header">
          <h1>Dashboard del Gestor</h1>
          <button onClick={() => navigate('/perfil')} className="btn-volver">
            ← Volver al perfil
          </button>
        </div>
        <div className="sin-mercado">
          <h2>📍 No tienes un mercado registrado</h2>
          <p>Necesitas crear un mercado para acceder a las estadísticas</p>
          <button onClick={() => navigate('/mercado/crear')} className="btn-crear-mercado">
            Crear mi mercado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gestor-container">
      <div className="gestor-header">
        <h1>Dashboard del Gestor</h1>
        <button onClick={() => navigate('/perfil')} className="btn-volver">
          ← Volver al perfil
        </button>
      </div>

      <div className="gestor-tabs">
        <button
          className={`tab ${vista === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setVista('estadisticas')}
        >
          📊 Estadísticas
        </button>
        <button
          className={`tab ${vista === 'mercado' ? 'active' : ''}`}
          onClick={() => setVista('mercado')}
        >
          🏪 Mi Mercado
        </button>
        <button
          className={`tab ${vista === 'productos' ? 'active' : ''}`}
          onClick={() => setVista('productos')}
        >
          📦 Mis Productos
        </button>
        <button
          className={`tab ${vista === 'comentarios' ? 'active' : ''}`}
          onClick={() => setVista('comentarios')}
        >
          💬 Comentarios
        </button>
      </div>

      <div className="gestor-content">
        {vista === 'estadisticas' && (
          <>
            <div className="estadisticas-grid">
              {/* Card Mercado */}
              <div className="stat-card mercado-card">
                <div className="stat-icon">🏪</div>
                <div className="stat-info">
                  <h3>{estadisticas.mercado.nombre}</h3>
                  <p>Tu Mercado</p>
                  <div className="stat-detail">
                    📍 {estadisticas.mercado.provincia}, {estadisticas.mercado.municipio}
                  </div>
                  <div className="stat-detail">
                    📅 Desde {formatearFecha(estadisticas.mercado.creadoEn)}
                  </div>
                </div>
              </div>

              {/* Card Productos */}
              <div className="stat-card productos-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{estadisticas.productos.total}</h3>
                  <p>Productos totales</p>
                  <div className="stat-detail">
                    ✅ {estadisticas.productos.disponibles} disponibles
                  </div>
                  <div className="stat-detail">
                    ⛔ {estadisticas.productos.noDisponibles} no disponibles
                  </div>
                </div>
              </div>

              {/* Card Engagement */}
              <div className="stat-card engagement-card">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <h3>{estadisticas.engagement.totalComentarios}</h3>
                  <p>Comentarios</p>
                  <div className="stat-detail">
                    ⭐ {estadisticas.engagement.promedioValoracion} promedio
                  </div>
                  <div className="stat-detail">
                    👍 {estadisticas.engagement.totalLikes} likes
                  </div>
                  <div className="stat-detail">
                    📊 {estadisticas.engagement.totalValoraciones} valoraciones
                  </div>
                </div>
              </div>

              {/* Card Recomendaciones */}
              <div className="stat-card recomendaciones-card">
                <div className="stat-icon">👍</div>
                <div className="stat-info">
                  <h3>{estadisticas.recomendaciones.porcentaje}%</h3>
                  <p>Recomendaciones positivas</p>
                  <div className="stat-detail">
                    ✅ {estadisticas.recomendaciones.positivas} de {estadisticas.recomendaciones.total}
                  </div>
                </div>
              </div>
            </div>

            {/* Productos Populares */}
            {estadisticas.productosPopulares && estadisticas.productosPopulares.length > 0 && (
              <div className="seccion-populares">
                <h2>🏆 Productos más populares</h2>
                <div className="productos-populares-grid">
                  {estadisticas.productosPopulares.map(producto => (
                    <div key={producto.id} className="producto-popular-card" onClick={() => navigate(`/productos/${producto.id}`)}>
                      {producto.imagen && (
                        <img src={`http://localhost:5000${producto.imagen}`} alt={producto.nombre} />
                      )}
                      <div className="producto-popular-info">
                        <h4>{producto.nombre}</h4>
                        <div className="producto-stats">
                          <span>💬 {producto.comentarios}</span>
                          <span>⭐ {producto.valoracionPromedio}</span>
                        </div>
                        {producto.precio && (
                          <p className="producto-precio">
                            ${producto.precio} / {producto.unidadPrecio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Distribución por categorías */}
            {estadisticas.categorias && estadisticas.categorias.length > 0 && (
              <div className="seccion-categorias">
                <h2>📊 Productos por categoría</h2>
                <div className="categorias-list">
                  {estadisticas.categorias.map((cat, idx) => (
                    <div key={idx} className="categoria-item">
                      <span className="categoria-nombre">{cat.nombre}</span>
                      <div className="categoria-barra">
                        <div
                          className="categoria-relleno"
                          style={{ width: `${(cat.cantidad / estadisticas.productos.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="categoria-cantidad">{cat.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actividad Reciente */}
            {actividad && (
              <div className="actividad-reciente">
                <div className="actividad-section">
                  <h2>🆕 Productos recientes</h2>
                  {actividad.productosRecientes && actividad.productosRecientes.length > 0 ? (
                    <div className="lista-actividad">
                      {actividad.productosRecientes.map(producto => (
                        <div key={producto.id} className="actividad-item" onClick={() => navigate(`/productos/${producto.id}`)}>
                          {producto.imagenes && producto.imagenes[0] && (
                            <img src={`http://localhost:5000${producto.imagenes[0]}`} alt={producto.nombre} />
                          )}
                          <div className="actividad-info">
                            <h4>{producto.nombre}</h4>
                            <p>{producto.categoria?.nombre || 'Sin categoría'}</p>
                            <span className="fecha">{formatearFecha(producto.creadoEn)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="sin-datos">No hay productos recientes</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {vista === 'mercado' && estadisticas.mercado && (
          <div className="mercado-info-section">
            <div className="mercado-header-info">
              <h2>{estadisticas.mercado.nombre}</h2>
              <button onClick={() => navigate('/mercado/editar')} className="btn-editar">
                ✏️ Editar mercado
              </button>
            </div>
            <div className="mercado-detalles">
              <div className="detalle-item">
                <strong>📍 Ubicación:</strong>
                <span>{estadisticas.mercado.provincia}, {estadisticas.mercado.municipio}</span>
              </div>
              <div className="detalle-item">
                <strong>📅 Fecha de creación:</strong>
                <span>{formatearFecha(estadisticas.mercado.creadoEn)}</span>
              </div>
              <div className="detalle-item">
                <strong>📦 Total de productos:</strong>
                <span>{estadisticas.productos.total}</span>
              </div>
            </div>
            <div className="acciones-mercado">
              <button onClick={() => navigate('/gestion-productos')} className="btn-gestion">
                📦 Gestionar productos
              </button>
              <button onClick={() => navigate('/mercado/crear')} className="btn-gestion">
                🏪 Ver mi mercado
              </button>
            </div>
          </div>
        )}

        {vista === 'productos' && actividad && (
          <div className="productos-section">
            <div className="productos-header-section">
              <h2>📦 Mis Productos</h2>
              <button onClick={() => navigate('/gestion-productos')} className="btn-crear">
                + Gestionar productos
              </button>
            </div>
            {actividad.productosRecientes && actividad.productosRecientes.length > 0 ? (
              <div className="productos-grid">
                {actividad.productosRecientes.map(producto => (
                  <div key={producto.id} className="producto-card" onClick={() => navigate(`/productos/${producto.id}`)}>
                    {producto.imagenes && producto.imagenes[0] && (
                      <img src={`http://localhost:5000${producto.imagenes[0]}`} alt={producto.nombre} />
                    )}
                    <div className="producto-info">
                      <h3>{producto.nombre}</h3>
                      <p className="producto-categoria">{producto.categoria?.nombre || 'Sin categoría'}</p>
                      {producto.precio && (
                        <p className="producto-precio">${producto.precio} / {producto.unidadPrecio}</p>
                      )}
                      <span className={`badge ${producto.estado === 'DISPONIBLE' ? 'disponible' : 'no-disponible'}`}>
                        {producto.estado === 'DISPONIBLE' ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sin-productos">
                <p>No tienes productos aún</p>
                <button onClick={() => navigate('/gestion-productos')} className="btn-crear">
                  Crear mi primer producto
                </button>
              </div>
            )}
          </div>
        )}

        {vista === 'comentarios' && actividad && (
          <div className="comentarios-section">
            <h2>💬 Comentarios recientes en tus productos</h2>
            {actividad.comentariosRecientes && actividad.comentariosRecientes.length > 0 ? (
              <div className="comentarios-list">
                {actividad.comentariosRecientes.map(comentario => (
                  <div key={comentario.id} className="comentario-card">
                    <div className="comentario-header">
                      <div className="comentario-usuario">
                        {comentario.usuario.imagen && (
                          <img
                            src={`http://localhost:5000${comentario.usuario.imagen}`}
                            alt={comentario.usuario.nombre}
                            className="usuario-avatar"
                          />
                        )}
                        <div>
                          <h4>{comentario.usuario.nombre}</h4>
                          <span className="comentario-fecha">{formatearFecha(comentario.creadoEn)}</span>
                        </div>
                      </div>
                      <div className="comentario-producto">
                        {comentario.producto.imagenes && comentario.producto.imagenes[0] && (
                          <img
                            src={`http://localhost:5000${comentario.producto.imagenes[0]}`}
                            alt={comentario.producto.nombre}
                            className="producto-thumb"
                          />
                        )}
                        <span onClick={() => navigate(`/productos/${comentario.producto.id}`)}>
                          {comentario.producto.nombre}
                        </span>
                      </div>
                    </div>
                    <p className="comentario-texto">{comentario.texto}</p>
                    <div className="comentario-footer">
                      <span className={comentario.recomienda ? 'recomienda-si' : 'recomienda-no'}>
                        {comentario.recomienda ? '👍 Recomienda' : '👎 No recomienda'}
                      </span>
                      <span className="comentario-likes">❤️ {comentario.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sin-datos">No hay comentarios aún</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardGestor;

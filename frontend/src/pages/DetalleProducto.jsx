import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoService, comentarioService, valoracionService } from '../services/api';
import { useToast } from '../components/Toast';
import { FaArrowLeft, FaClock, FaFolder, FaTag, FaDollarSign, FaBox, FaStore, FaMapMarkerAlt, FaComments, FaThumbsUp, FaTrash, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import './DetalleProducto.css';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [producto, setProducto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState({
    texto: '',
    recomienda: true
  });
  const [imagenPrincipal, setImagenPrincipal] = useState(0);
  const [miValoracion, setMiValoracion] = useState(null);
  const [comentarioExistente, setComentarioExistente] = useState(null);

  // Utilidad para formatear fechas relativas
  const formatearTiempoRelativo = (fecha) => {
    const ahora = new Date();
    const fechaProducto = new Date(fecha);
    const diferenciaMs = ahora - fechaProducto;
    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (segundos < 60) return 'Hace unos segundos';
    if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (dias < 30) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    if (meses < 12) return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    return `Hace ${años} ${años === 1 ? 'año' : 'años'}`;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Verificar si hay usuario autenticado
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const requests = [
        productoService.obtenerPorId(id),
        comentarioService.obtenerPorProducto(id)
      ];

      // Si el usuario está autenticado, cargar su valoración
      if (usuario) {
        requests.push(
          valoracionService.obtenerMiValoracion(id).catch(() => ({ data: null }))
        );
      }

      const results = await Promise.all(requests);
      setProducto(results[0].data);
      setComentarios(results[1].data);

      // Verificar si el usuario ya comentó
      if (usuario) {
        const miComentario = results[1].data.find(c => c.usuarioId === usuario.id);
        setComentarioExistente(miComentario || null);

        // Cargar valoración del usuario
        if (results[2]) {
          setMiValoracion(results[2].data);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    
    if (!usuario) {
      toast.warning('Debes iniciar sesión para comentar');
      navigate('/login');
      return;
    }

    try {
      await comentarioService.crear({
        productoId: parseInt(id),
        ...nuevoComentario
      });
      setNuevoComentario({ texto: '', recomienda: true });
      toast.success('Comentario agregado exitosamente');
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al agregar comentario');
    }
  };

  const handleLike = async (comentario) => {
    if (!usuario) {
      toast.warning('Debes iniciar sesión para dar like');
      navigate('/login');
      return;
    }

    try {
      // Toggle: si ya dio like, quitarlo; si no, darlo
      if (comentario.usuarioActualDioLike) {
        await comentarioService.quitarLike(comentario.id);
        toast.success('Like removido');
      } else {
        await comentarioService.darLike(comentario.id);
        toast.success('Like agregado');
      }
      cargarDatos();
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        console.error('Error con like:', error);
      }
    }
  };

  const handleValorar = async (estrellas) => {
    if (!usuario) {
      toast.warning('Debes iniciar sesión para valorar');
      navigate('/login');
      return;
    }

    try {
      const response = await valoracionService.crearOActualizar({
        productoId: parseInt(id),
        estrellas
      });
      setMiValoracion(response.data);
      toast.success(miValoracion ? 'Valoración actualizada' : 'Valoración guardada');
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al valorar');
    }
  };

  const handleEliminarComentario = async (comentarioId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      await comentarioService.eliminar(comentarioId);
      toast.success('Comentario eliminado');
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  // Componente de estrellas
  const EstrellaRating = ({ valoracion, onChange, readOnly = false, size = 'medium' }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className={`estrellas-rating size-${size}`}>
        {[1, 2, 3, 4, 5].map((estrella) => (
          <button
            key={estrella}
            type="button"
            className={`estrella ${estrella <= (hover || valoracion) ? 'activa' : 'inactiva'}`}
            onClick={() => !readOnly && onChange && onChange(estrella)}
            onMouseEnter={() => !readOnly && setHover(estrella)}
            onMouseLeave={() => !readOnly && setHover(0)}
            disabled={readOnly}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  // Componente de distribución de valoraciones
  const DistribucionValoraciones = ({ distribucion, total }) => {
    if (!total || total === 0) return null;

    const calcularPorcentaje = (cantidad) => ((cantidad / total) * 100).toFixed(0);

    return (
      <div className="distribucion-valoraciones">
        {[5, 4, 3, 2, 1].map(estrellas => {
          const cantidad = distribucion?.[estrellas] || 0;
          const porcentaje = calcularPorcentaje(cantidad);

          return (
            <div key={estrellas} className="barra-valoracion">
              <span className="estrellas-label">{estrellas}<FaStar className="star-small" /></span>
              <div className="barra-contenedor">
                <div
                  className="barra-relleno"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <span className="porcentaje-label">{porcentaje}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="detalle-container"><div className="loading">Cargando...</div></div>;
  }

  if (!producto) {
    return <div className="detalle-container"><div className="error">Producto no encontrado</div></div>;
  }

  return (
    <div className="detalle-container">
      <button onClick={() => navigate('/productos')} className="btn-volver">
        <FaArrowLeft /> Volver a productos
      </button>

      <div className="producto-detalle">
        <div className="detalle-header">
          <div className="header-content">
            <h1>{producto.nombre}</h1>
            {producto.actualizadoEn && (
              <div className="timestamp-info">
                <FaClock className="timestamp-icon" />
                <span className="timestamp-text">
                  Actualizado {formatearTiempoRelativo(producto.actualizadoEn)}
                </span>
              </div>
            )}
          </div>
          <span className={`badge-estado ${producto.estado.toLowerCase()}`}>
            {producto.estado === 'DISPONIBLE' ? (
              <><FaCheckCircle /> Disponible</>
            ) : (
              <><FaTimesCircle /> No disponible</>
            )}
          </span>
        </div>

        {/* Galería de imágenes */}
        {producto.imagenes && producto.imagenes.length > 0 && (
          <div className="producto-imagenes">
            <div className="imagen-principal">
              <img 
                src={`http://localhost:5000${producto.imagenes[imagenPrincipal]}`} 
                alt={producto.nombre}
                className="imagen-producto"
              />
            </div>
            {producto.imagenes.length > 1 && (
              <div className="imagenes-miniatura">
                {producto.imagenes.map((url, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000${url}`}
                    alt={`${producto.nombre} ${index + 1}`}
                    className={`miniatura ${index === imagenPrincipal ? 'activa' : ''}`}
                    onClick={() => setImagenPrincipal(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="detalle-info">
          <div className="descripcion-section">
            <h3>Descripción</h3>
            <p className="descripcion">{producto.descripcion || 'Sin descripción'}</p>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <strong><FaFolder /> Categoría</strong>
              <span>{producto.categoria?.nombre || 'Sin categoría'}</span>
            </div>
            {producto.tipoProducto && (
              <div className="info-card">
                <strong><FaTag /> Tipo</strong>
                <span>{producto.tipoProducto}</span>
              </div>
            )}
            {producto.precio && (
              <div className="info-card precio-card">
                <strong><FaDollarSign /> Precio</strong>
                <span className="precio-destacado">${producto.precio.toFixed(2)}</span>
              </div>
            )}
            {producto.cantidad && (
              <div className="info-card">
                <strong><FaBox /> Cantidad</strong>
                <span>{producto.cantidad}</span>
              </div>
            )}
          </div>

          <div
            className="mercado-info clickeable"
            onClick={() => navigate(`/mercados/${producto.mercado.id}`)}
          >
            <h3><FaStore /> Mercado</h3>
            <p><strong>{producto.mercado.nombre}</strong></p>
            <p><FaMapMarkerAlt /> {producto.mercado.direccion}</p>
            <p>{producto.mercado.municipio}, {producto.mercado.provincia}</p>
          </div>
        </div>
      </div>

      {/* Panel de Valoraciones */}
      <div className="panel-valoracion">
        <h2><FaStar /> Valoración del Producto</h2>

        {/* Promedio General */}
        {producto.valoraciones && producto.valoraciones.total > 0 ? (
          <div className="valoracion-general">
            <div className="promedio-grande">
              <EstrellaRating
                valoracion={Math.round(producto.valoraciones.promedio)}
                readOnly={true}
                size="large"
              />
              <div className="promedio-numero">
                <span className="numero">{producto.valoraciones.promedio.toFixed(1)}</span>
                <span className="total-votos">({producto.valoraciones.total} {producto.valoraciones.total === 1 ? 'valoración' : 'valoraciones'})</span>
              </div>
            </div>

            {/* Distribución de valoraciones */}
            <DistribucionValoraciones
              distribucion={producto.valoraciones.distribucion}
              total={producto.valoraciones.total}
            />
          </div>
        ) : (
          <p className="sin-valoraciones">Este producto aún no tiene valoraciones. ¡Sé el primero en valorarlo!</p>
        )}

        {/* Tu Valoración */}
        {usuario ? (
          <div className="mi-valoracion-section">
            <h3>Tu valoración:</h3>
            <EstrellaRating
              valoracion={miValoracion?.estrellas || 0}
              onChange={handleValorar}
              size="large"
            />
            {miValoracion && (
              <p className="texto-valoracion">Has valorado este producto con {miValoracion.estrellas} {miValoracion.estrellas === 1 ? 'estrella' : 'estrellas'}</p>
            )}
          </div>
        ) : (
          <div className="login-prompt-valoracion">
            <p>
              <button onClick={() => navigate('/login')} className="link-btn">Inicia sesión</button>
              {' '}para valorar este producto
            </p>
          </div>
        )}
      </div>

      <div className="comentarios-section">
        <h2><FaComments /> Comentarios y Valoraciones</h2>

        {usuario ? (
          <form onSubmit={handleSubmitComentario} className="form-comentario">
            <textarea
              value={nuevoComentario.texto}
              onChange={(e) => setNuevoComentario({ ...nuevoComentario, texto: e.target.value })}
              placeholder="Escribe tu comentario..."
              required
              rows="4"
            />
            <div className="form-footer">
              <label className="recomienda-label">
                <input
                  type="checkbox"
                  checked={nuevoComentario.recomienda}
                  onChange={(e) => setNuevoComentario({ ...nuevoComentario, recomienda: e.target.checked })}
                />
                <span><FaCheckCircle /> Recomiendo este producto</span>
              </label>
              <button type="submit" className="btn-primary">Publicar</button>
            </div>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Debes <button onClick={() => navigate('/login')} className="link-btn">iniciar sesión</button> para comentar</p>
          </div>
        )}

        <div className="comentarios-lista">
          {comentarios.length === 0 ? (
            <p className="no-comentarios">No hay comentarios aún. ¡Sé el primero!</p>
          ) : (
            comentarios.map((comentario) => (
              <div key={comentario.id} className="comentario">
                <div className="comentario-header">
                  <div className="usuario-info">
                    <strong>{comentario.usuario.nombre}</strong>
                    {comentario.recomienda && <span className="recomienda"><FaCheckCircle /> Recomienda</span>}
                  </div>
                  <span className="fecha">{new Date(comentario.creadoEn).toLocaleDateString()}</span>
                </div>
                <p className="comentario-texto">{comentario.texto}</p>
                <div className="comentario-footer">
                  <button
                    onClick={() => handleLike(comentario)}
                    className={`btn-like ${comentario.usuarioActualDioLike ? 'active' : ''}`}
                  >
                    <FaThumbsUp /> {comentario.likes}
                  </button>
                  {usuario && usuario.id === comentario.usuario.id && (
                    <button onClick={() => handleEliminarComentario(comentario.id)} className="btn-eliminar-comentario">
                      <FaTrash /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;
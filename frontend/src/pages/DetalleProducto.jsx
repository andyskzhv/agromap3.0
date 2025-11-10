import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productoService, comentarioService } from '../services/api';
import { useToast } from '../components/Toast';
import { FaArrowLeft, FaClock, FaFolder, FaTag, FaDollarSign, FaBox, FaStore, FaMapMarkerAlt, FaComments, FaThumbsUp, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
      const [productoRes, comentariosRes] = await Promise.all([
        productoService.obtenerPorId(id),
        comentarioService.obtenerPorProducto(id)
      ]);
      setProducto(productoRes.data);
      setComentarios(comentariosRes.data);
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

  const handleLike = async (comentarioId) => {
    if (!usuario) {
      toast.warning('Debes iniciar sesión para dar like');
      navigate('/login');
      return;
    }

    try {
      await comentarioService.darLike(comentarioId);
      cargarDatos();
    } catch (error) {
      console.error('Error al dar like:', error);
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
                  <button onClick={() => handleLike(comentario.id)} className="btn-like">
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
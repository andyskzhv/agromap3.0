import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mercadoService, productoService, categoriaService } from '../services/api';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './DetalleMercado.css';

const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const diasNombres = {
  domingo: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado'
};

function DetalleMercado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [mercado, setMercado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagenActual, setImagenActual] = useState(0);
  const [modalImagen, setModalImagen] = useState(null);

  // Filtros de productos
  const [filtros, setFiltros] = useState({
    categoria: '',
    estado: ''
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 16;

  useEffect(() => {
    cargarDatos();
  }, [id]);

  useEffect(() => {
    cargarProductos();
  }, [id, filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mercadoRes, categoriasRes] = await Promise.all([
        mercadoService.obtenerPorId(id),
        categoriaService.obtenerTodas()
      ]);
      setMercado(mercadoRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar mercado:', error);
      toast.error('Error al cargar el mercado');
      navigate('/mercados');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const params = { mercadoId: id };
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.estado) params.estado = filtros.estado;

      const response = await productoService.obtenerTodos(params);
      setProductos(response.data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    }
  };

  const parseHorario = (horarioString) => {
    if (!horarioString) return null;
    try {
      const parsed = JSON.parse(horarioString);
      if (typeof parsed === 'object' && parsed.lunes) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const estaAbierto = (horario) => {
    if (!horario) return { abierto: false, mensaje: 'Horario no disponible' };

    const ahora = new Date();
    const diaActual = diasSemana[ahora.getDay()];
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    const horarioDia = horario[diaActual];
    if (!horarioDia) return { abierto: false, mensaje: 'Horario no disponible' };

    if (horarioDia.cerrado) {
      return { abierto: false, mensaje: 'Cerrado hoy' };
    }

    const [abreH, abreM] = horarioDia.abre.split(':').map(Number);
    const [cierraH, cierraM] = horarioDia.cierra.split(':').map(Number);

    const minutosAbre = abreH * 60 + abreM;
    const minutosCierra = cierraH * 60 + cierraM;

    if (horaActual >= minutosAbre && horaActual <= minutosCierra) {
      return { abierto: true, mensaje: `Abierto hasta las ${horarioDia.cierra}` };
    } else if (horaActual < minutosAbre) {
      return { abierto: false, mensaje: `Abre a las ${horarioDia.abre}` };
    } else {
      return { abierto: false, mensaje: 'Cerrado' };
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      estado: ''
    });
  };

  const abrirModal = (imagenUrl) => {
    setModalImagen(imagenUrl);
    document.body.style.overflow = 'hidden';
  };

  const cerrarModal = () => {
    setModalImagen(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) {
    return (
      <div className="detalle-mercado-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando mercado...</p>
        </div>
      </div>
    );
  }

  if (!mercado) {
    return (
      <div className="detalle-mercado-container">
        <div className="error-container">
          <h2>Mercado no encontrado</h2>
          <button onClick={() => navigate('/mercados')} className="btn-primary">
            Volver a Mercados
          </button>
        </div>
      </div>
    );
  }

  const horarioParsed = parseHorario(mercado.horario);
  const estadoAbierto = horarioParsed ? estaAbierto(horarioParsed) : null;

  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;
  const productosPaginados = productos.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  return (
    <div className="detalle-mercado-container">
      {/* Modal de Imagen */}
      {modalImagen && (
        <div className="modal-imagen" onClick={cerrarModal}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
            <img src={modalImagen} alt="Imagen ampliada" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mercado-header">
        <div className="header-title-section">
          <h1>{mercado.nombre}</h1>
          {estadoAbierto && (
            <div className="estado-container">
              <span className={`estado-badge ${estadoAbierto.abierto ? 'abierto' : 'cerrado'}`}>
                <span className="estado-icon">{estadoAbierto.abierto ? '●' : '●'}</span>
                {estadoAbierto.abierto ? 'Abierto' : 'Cerrado'}
              </span>
              <span className="estado-mensaje">{estadoAbierto.mensaje}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mercado-content">
        {/* Layout de dos columnas */}
        <div className="content-grid">
          {/* Columna Izquierda */}
          <div className="columna-principal">
            {/* Galería */}
            {mercado.imagenes && mercado.imagenes.length > 0 && (
              <section className="seccion-galeria">
                <div className="imagen-principal" onClick={() => abrirModal(`http://localhost:5000${mercado.imagenes[imagenActual]}`)}>
                  <img
                    src={`http://localhost:5000${mercado.imagenes[imagenActual]}`}
                    alt={`${mercado.nombre} - Imagen ${imagenActual + 1}`}
                  />
                  <div className="zoom-indicator">🔍 Click para ampliar</div>
                  {mercado.imagenes.length > 1 && (
                    <>
                      <button
                        className="nav-btn prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagenActual((prev) => (prev === 0 ? mercado.imagenes.length - 1 : prev - 1));
                        }}
                      >
                        ‹
                      </button>
                      <button
                        className="nav-btn next"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagenActual((prev) => (prev === mercado.imagenes.length - 1 ? 0 : prev + 1));
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
                {mercado.imagenes.length > 1 && (
                  <div className="thumbnails">
                    {mercado.imagenes.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${img}`}
                        alt={`Thumbnail ${index + 1}`}
                        className={imagenActual === index ? 'active' : ''}
                        onClick={() => setImagenActual(index)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Descripción */}
            {mercado.descripcion && (
              <section className="seccion-card">
                <h2>Sobre este mercado</h2>
                <p className="descripcion-texto">{mercado.descripcion}</p>
              </section>
            )}

            {/* SAS - Sección independiente */}
            {mercado.perteneceSas && (
              <section className="seccion-card seccion-sas">
                <div className="sas-content">
                  <div className="sas-info">
                    <h2>Programa SAS Cuba</h2>
                    <p>
                      El "Programa SAS Cuba" es una iniciativa de apoyo estratégico a la seguridad alimentaria sostenible en Cuba,
                      implementada entre 2019 y 2025 con financiamiento de la Unión Europea. Se enfoca en fortalecer los sistemas
                      alimentarios locales en seis municipios de las provincias de Villa Clara y Sancti Spíritus, promoviendo la
                      resiliencia y la producción de alimentos de calidad.
                    </p>
                    <p className="sas-proyectos">
                      El programa incluye tres proyectos principales: Fortalecimiento de políticas para la seguridad alimentaria
                      sostenible (POSAS), Autoabastecimiento local para una alimentación sostenible y sana (ALASS), y Fortalecimiento
                      del Sistema Integrado de Gestión del Conocimiento para la seguridad alimentaria sostenible (CONSAS).
                    </p>
                  </div>
                  <img src="/logo sas.jpg" alt="Programa SAS Cuba" className="sas-logo" />
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha */}
          <div className="columna-lateral">
            {/* Ubicación con Mapa integrado */}
            <section className="seccion-card">
              <h2>📍 Ubicación</h2>
              <div className="info-list">
                <div className="info-row">
                  <span className="label">Dirección:</span>
                  <span className="value">{mercado.direccion}</span>
                </div>
                <div className="info-row">
                  <span className="label">Municipio:</span>
                  <span className="value">{mercado.municipio}</span>
                </div>
                <div className="info-row">
                  <span className="label">Provincia:</span>
                  <span className="value">{mercado.provincia}</span>
                </div>
              </div>

              {/* Mapa dentro de ubicación */}
              {mercado.latitud && mercado.longitud && (
                <div className="mapa-wrapper">
                  <div className="mapa-container">
                    <MapContainer
                      center={[mercado.latitud, mercado.longitud]}
                      zoom={15}
                      scrollWheelZoom={false}
                      className="mapa-mercado"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[mercado.latitud, mercado.longitud]} />
                    </MapContainer>
                  </div>
                </div>
              )}
            </section>

            {/* Horario */}
            {horarioParsed ? (
              <section className="seccion-card">
                <h2>🕒 Horario de Atención</h2>
                <div className="horario-lista">
                  {diasSemana.map((dia) => {
                    const horarioDia = horarioParsed[dia];
                    const esHoy = diasSemana[new Date().getDay()] === dia;

                    return (
                      <div key={dia} className={`horario-item ${esHoy ? 'hoy' : ''}`}>
                        <span className="dia">{diasNombres[dia]}</span>
                        <span className="horario">
                          {horarioDia?.cerrado ? (
                            <span className="cerrado">Cerrado</span>
                          ) : horarioDia ? (
                            `${horarioDia.abre} - ${horarioDia.cierra}`
                          ) : (
                            'No disponible'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : mercado.horario ? (
              <section className="seccion-card">
                <h2>🕒 Horario de Atención</h2>
                <p>{mercado.horario}</p>
              </section>
            ) : null}

            {/* Beneficiario Legal */}
            {mercado.beneficiarioLegal && (
              <section className="seccion-card">
                <h2>👤 Beneficiario Legal</h2>
                <p className="beneficiario">{mercado.beneficiarioLegal}</p>
              </section>
            )}
          </div>
        </div>

        {/* Productos - Full width */}
        <section className="seccion-productos">
          <div className="productos-header">
            <h2>Productos Disponibles</h2>
            <span className="productos-count">{productos.length}</span>
          </div>

          {/* Filtros */}
          <div className="filtros-container">
            <div className="filtros-grid">
              <div className="filtro-grupo">
                <label>Categoría</label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-grupo">
                <label>Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="NO_DISPONIBLE">No Disponible</option>
                </select>
              </div>
            </div>

            {(filtros.categoria || filtros.estado) && (
              <button onClick={limpiarFiltros} className="btn-limpiar">
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {/* Grid de Productos */}
          {productosPaginados.length > 0 ? (
            <>
              <div className="productos-grid">
                {productosPaginados.map((producto) => (
                  <Link
                    key={producto.id}
                    to={`/productos/${producto.id}`}
                    className="producto-card-compact"
                  >
                    {producto.imagenes && producto.imagenes.length > 0 ? (
                      <img
                        src={`http://localhost:5000${producto.imagenes[0]}`}
                        alt={producto.nombre}
                        className="producto-imagen"
                      />
                    ) : (
                      <div className="producto-sin-imagen">
                        <span>📦</span>
                      </div>
                    )}
                    <div className="producto-info">
                      <h3>{producto.nombre}</h3>
                      <div className="producto-footer">
                        <span className="categoria">{producto.categoria?.nombre || producto.categoria}</span>
                        {producto.precio && (
                          <span className="precio">${producto.precio.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPaginas > 1 && (
                <Pagination
                  currentPage={paginaActual}
                  totalPages={totalPaginas}
                  onPageChange={setPaginaActual}
                />
              )}
            </>
          ) : (
            <div className="no-productos">
              <span className="icon">🔍</span>
              <p>No hay productos disponibles con los filtros seleccionados</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DetalleMercado;

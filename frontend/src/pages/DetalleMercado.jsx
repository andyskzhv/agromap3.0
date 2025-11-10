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

  // Filtros de productos
  const [filtros, setFiltros] = useState({
    categoria: '',
    estado: ''
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;

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
      setPaginaActual(1); // Reset a primera página al filtrar
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    }
  };

  const parseHorario = (horarioString) => {
    if (!horarioString) return null;
    try {
      const parsed = JSON.parse(horarioString);
      // Validar que sea un objeto con formato esperado
      if (typeof parsed === 'object' && parsed.lunes) {
        return parsed;
      }
      return null;
    } catch {
      // Si no es JSON, retornar null para mostrar como texto
      return null;
    }
  };

  const estaAbierto = (horario) => {
    if (!horario) return { abierto: false, mensaje: 'Horario no disponible' };

    const ahora = new Date();
    const diaActual = diasSemana[ahora.getDay()];
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // Minutos desde medianoche

    const horarioDia = horario[diaActual];
    if (!horarioDia) return { abierto: false, mensaje: 'Horario no disponible' };

    if (horarioDia.cerrado) {
      return { abierto: false, mensaje: 'Cerrado hoy' };
    }

    // Parsear hora de apertura y cierre
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

  // Paginación de productos
  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;
  const productosPaginados = productos.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  return (
    <div className="detalle-mercado-container">
      {/* Header */}
      <div className="mercado-header">
        <button onClick={() => navigate('/mercados')} className="btn-back">
          ← Volver a Mercados
        </button>
        <div className="header-title">
          <h1>{mercado.nombre}</h1>
          {mercado.perteneceSas && <span className="badge sas-badge">SAS</span>}
          {estadoAbierto && (
            <span className={`badge estado-badge ${estadoAbierto.abierto ? 'abierto' : 'cerrado'}`}>
              {estadoAbierto.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
            </span>
          )}
        </div>
        {estadoAbierto && <p className="estado-mensaje">{estadoAbierto.mensaje}</p>}
      </div>

      <div className="mercado-content">
        {/* Galería de Imágenes */}
        {mercado.imagenes && mercado.imagenes.length > 0 && (
          <section className="seccion-imagenes">
            <div className="imagen-principal">
              <img
                src={`http://localhost:5000${mercado.imagenes[imagenActual]}`}
                alt={`${mercado.nombre} - Imagen ${imagenActual + 1}`}
              />
              {mercado.imagenes.length > 1 && (
                <>
                  <button
                    className="nav-btn prev"
                    onClick={() => setImagenActual((prev) => (prev === 0 ? mercado.imagenes.length - 1 : prev - 1))}
                  >
                    ‹
                  </button>
                  <button
                    className="nav-btn next"
                    onClick={() => setImagenActual((prev) => (prev === mercado.imagenes.length - 1 ? 0 : prev + 1))}
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

        {/* Información del Mercado */}
        <section className="seccion-info">
          <div className="info-card">
            <h2>Información del Mercado</h2>

            {mercado.descripcion && (
              <div className="info-item">
                <h3>Descripción</h3>
                <p>{mercado.descripcion}</p>
              </div>
            )}

            <div className="info-item">
              <h3>📍 Ubicación</h3>
              <p><strong>Dirección:</strong> {mercado.direccion}</p>
              <p><strong>Municipio:</strong> {mercado.municipio}</p>
              <p><strong>Provincia:</strong> {mercado.provincia}</p>
            </div>

            {mercado.beneficiarioLegal && (
              <div className="info-item">
                <h3>👤 Beneficiario Legal</h3>
                <p>{mercado.beneficiarioLegal}</p>
              </div>
            )}

            <div className="info-item">
              <h3>🏪 Gestor</h3>
              <p><strong>{mercado.gestor.nombre}</strong></p>
              <p className="text-muted">@{mercado.gestor.nombreUsuario}</p>
            </div>

            {/* Horario */}
            {horarioParsed ? (
              <div className="info-item">
                <h3>🕒 Horario de Atención</h3>
                <div className="horario-tabla">
                  {diasSemana.map((dia) => {
                    const horarioDia = horarioParsed[dia];
                    const esHoy = diasSemana[new Date().getDay()] === dia;

                    return (
                      <div key={dia} className={`horario-fila ${esHoy ? 'hoy' : ''}`}>
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
              </div>
            ) : mercado.horario ? (
              <div className="info-item">
                <h3>🕒 Horario de Atención</h3>
                <p>{mercado.horario}</p>
              </div>
            ) : null}

            {/* Mapa */}
            {mercado.latitud && mercado.longitud && (
              <div className="info-item">
                <h3>📌 Ubicación en el Mapa</h3>
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
          </div>
        </section>

        {/* Productos del Mercado */}
        <section className="seccion-productos">
          <div className="productos-header">
            <h2>Productos Disponibles ({productos.length})</h2>
          </div>

          {/* Filtros */}
          <div className="filtros-productos">
            <div className="filtro-grupo">
              <label>Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              >
                <option value="">Todas las categorías</option>
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
                <option value="">Todos los estados</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="NO_DISPONIBLE">No Disponible</option>
              </select>
            </div>

            {(filtros.categoria || filtros.estado) && (
              <button onClick={limpiarFiltros} className="btn-limpiar">
                Limpiar filtros
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
                    className="producto-card"
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
                      <div className="producto-header-card">
                        <h3>{producto.nombre}</h3>
                        <span className={`badge ${producto.estado.toLowerCase()}`}>
                          {producto.estado === 'DISPONIBLE' ? 'Disponible' : 'No Disponible'}
                        </span>
                      </div>
                      {producto.descripcion && (
                        <p className="producto-descripcion">
                          {producto.descripcion.substring(0, 100)}
                          {producto.descripcion.length > 100 ? '...' : ''}
                        </p>
                      )}
                      <div className="producto-detalles">
                        <span className="categoria">
                          {producto.categoria?.nombre || producto.categoria}
                        </span>
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
              <p>No hay productos disponibles con los filtros seleccionados</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DetalleMercado;

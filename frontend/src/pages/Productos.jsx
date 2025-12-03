import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productoService, categoriaService, mercadoService } from '../services/api';
import Pagination from '../components/Pagination';
import { usePageTitle } from '../hooks/usePageTitle';
import './Productos.css';

function Productos() {
  usePageTitle('Productos');
  const [searchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    provincia: '',
    categoria: '',
    estado: '',
    valoracionMin: ''
  });
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('RECIENTES');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;

  // Leer parámetro de búsqueda de la URL al cargar
  useEffect(() => {
    const busquedaURL = searchParams.get('busqueda');
    if (busquedaURL) {
      setBusqueda(busquedaURL);
    }
  }, [searchParams]);

  useEffect(() => {
    cargarCategorias();
    cargarProvincias();
    cargarProductos();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await categoriaService.obtenerTodas({ activas: 'true' });
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarProvincias = async () => {
    try {
      const response = await mercadoService.obtenerProvincias();
      setProvincias(response.data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const params = {};
      if (filtros.provincia) params.provincia = filtros.provincia;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.estado) params.estado = filtros.estado;

      const response = await productoService.obtenerTodos(params);
      setProductos(response.data);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar productos cuando cambien los filtros
  useEffect(() => {
    if (!loading) {
      setLoading(true);
      cargarProductos();
    }
  }, [filtros.provincia, filtros.categoria, filtros.estado]);

  const limpiarFiltros = () => {
    setFiltros({ provincia: '', categoria: '', estado: '', valoracionMin: '' });
    setBusqueda('');
    setOrdenamiento('RECIENTES');
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setPaginaActual(1);
  };

  // Función para calcular valoración promedio
  const calcularValoracionPromedio = (valoraciones) => {
    if (!valoraciones || valoraciones.length === 0) return 0;
    const suma = valoraciones.reduce((acc, v) => acc + v.estrellas, 0);
    return suma / valoraciones.length;
  };

  // Filtrar y ordenar productos
  const productosFiltrados = productos.filter(producto => {
    // Filtro de valoración
    const valoracion = calcularValoracionPromedio(producto.valoraciones);
    const cumpleValoracion = !filtros.valoracionMin || valoracion >= parseFloat(filtros.valoracionMin);

    // Filtro de búsqueda
    const cumpleBusqueda = !busqueda ||
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.mercado?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.mercado?.provincia?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleValoracion && cumpleBusqueda;
  }).sort((a, b) => {
    switch (ordenamiento) {
      case 'RECIENTES':
        return new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion);
      case 'PRECIO_ASC':
        return (a.precio || 0) - (b.precio || 0);
      case 'PRECIO_DESC':
        return (b.precio || 0) - (a.precio || 0);
      case 'VALORACION':
        return calcularValoracionPromedio(b.valoraciones) - calcularValoracionPromedio(a.valoraciones);
      case 'ALFABETICO':
        return a.nombre.localeCompare(b.nombre);
      default:
        return 0;
    }
  });

  // Calcular productos para la página actual
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosActuales = productosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  if (loading) {
    return (
      <div className="productos-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="productos-container">
      <header className="productos-header">
        <h1>Productos Disponibles</h1>
        <p>Encuentra los productos frescos de tu región</p>
      </header>

      {/* Barra de búsqueda */}
      <div className="search-bar-section">
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar-input"
            placeholder="🔍 Buscar por nombre, descripción, mercado o provincia..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
          {busqueda && (
            <button
              className="search-clear-btn"
              onClick={limpiarBusqueda}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        {busqueda && (
          <p className="search-results-count">
            Se encontraron <strong>{productosFiltrados.length}</strong> resultados
          </p>
        )}
      </div>

      <div className="filtros-section">
        <div className="filtros-principales">
          <div className="filtro-group">
            <label>📍 Provincia</label>
            <select
              value={filtros.provincia}
              onChange={(e) => setFiltros({ ...filtros, provincia: e.target.value })}
            >
              <option value="">Todas las provincias</option>
              {provincias.map(provincia => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-group">
            <label>📂 Categoría</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="filtro-group">
            <label>📊 Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="">Todos los estados</option>
              <option value="DISPONIBLE">✓ Disponible</option>
              <option value="NO_DISPONIBLE">✗ No disponible</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>⭐ Valoración mínima</label>
            <select
              value={filtros.valoracionMin}
              onChange={(e) => setFiltros({ ...filtros, valoracionMin: e.target.value })}
            >
              <option value="">Todas las valoraciones</option>
              <option value="4">⭐⭐⭐⭐ 4+ estrellas</option>
              <option value="3">⭐⭐⭐ 3+ estrellas</option>
              <option value="2">⭐⭐ 2+ estrellas</option>
              <option value="1">⭐ 1+ estrella</option>
            </select>
          </div>
          <div className="filtro-group">
            <label>🔢 Ordenar por</label>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="select-ordenamiento"
            >
              <option value="RECIENTES">📅 Más recientes</option>
              <option value="VALORACION">⭐ Mejor valorados</option>
              <option value="PRECIO_ASC">💰 Precio: Menor a mayor</option>
              <option value="PRECIO_DESC">💰 Precio: Mayor a menor</option>
              <option value="ALFABETICO">🔤 Alfabético</option>
            </select>
          </div>
        </div>

        <div className="filtros-secundarios">
          <button onClick={limpiarFiltros} className="btn-limpiar">
            ✕ Limpiar filtros
          </button>
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="resultados-info">
            Mostrando {indicePrimero + 1}-{Math.min(indiceUltimo, productosFiltrados.length)} de {productosFiltrados.length} productos
          </div>

          <div className="productos-grid">
            {productosActuales.map((producto) => {
              const valoracion = calcularValoracionPromedio(producto.valoraciones);
              const totalValoraciones = producto.valoraciones?.length || 0;
              const totalComentarios = producto.comentarios?.length || 0;
              const imagenPrincipal = producto.imagenes && producto.imagenes.length > 0
                ? `http://localhost:5000${producto.imagenes[0]}`
                : producto.plantilla && producto.plantilla.imagen
                ? `http://localhost:5000${producto.plantilla.imagen}`
                : null;

              return (
                <div key={producto.id} className="producto-card">
                  {/* Imagen del producto */}
                  <div className="producto-imagen-container">
                    {imagenPrincipal ? (
                      <img
                        src={imagenPrincipal}
                        alt={producto.nombre}
                        className="producto-imagen"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="producto-sin-imagen" style={{ display: imagenPrincipal ? 'none' : 'flex' }}>
                      <span className="emoji-placeholder">🌾</span>
                    </div>
                    <span className={`badge-estado-imagen ${producto.estado.toLowerCase()}`}>
                      {producto.estado === 'DISPONIBLE' ? '✓ Disponible' : '✗ No disponible'}
                    </span>
                  </div>

                  {/* Contenido del producto */}
                  <div className="producto-contenido">
                    <div className="producto-header">
                      <h3>{producto.nombre}</h3>
                    </div>

                    {/* Valoración y comentarios */}
                    <div className="producto-valoracion">
                      <div className="estrellas">
                        {[1, 2, 3, 4, 5].map(estrella => (
                          <span
                            key={estrella}
                            className={estrella <= valoracion ? 'estrella-llena' : 'estrella-vacia'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="valoracion-numero">
                        {totalValoraciones > 0 ? valoracion.toFixed(1) : '0.0'} ({totalValoraciones} {totalValoraciones === 1 ? 'valoración' : 'valoraciones'})
                      </span>
                    </div>

                    <p className="producto-descripcion">
                      {producto.descripcion || 'Sin descripción'}
                    </p>

                    {/* Precio destacado */}
                    {producto.precio && (
                      <div className="producto-precio-destacado">
                        <span className="precio-valor">${producto.precio.toFixed(2)}</span>
                        <span className="precio-unidad">
                          CUP {producto.unidadPrecio === 'LB' ? '/ lb' : producto.unidadPrecio === 'UNIDAD' ? '/ unidad' : producto.unidadPrecio ? `/ ${producto.unidadPrecio.toLowerCase()}` : '/ lb'}
                        </span>
                      </div>
                    )}

                    <div className="producto-info">
                      <div className="info-item">
                        <strong>📂 Categoría:</strong>
                        <span>{producto.categoria?.nombre || 'Sin categoría'}</span>
                      </div>
                      {producto.cantidad && (
                        <div className="info-item">
                          <strong>📦 Disponible:</strong>
                          <span>
                            {producto.cantidad} kg
                          </span>
                        </div>
                      )}
                      <div className="info-item">
                        <strong>🏪 Mercado:</strong>
                        <span>{producto.mercado.nombre}</span>
                      </div>
                      <div className="info-item">
                        <strong>📍 Ubicación:</strong>
                        <span>{producto.mercado.municipio}, {producto.mercado.provincia}</span>
                      </div>
                    </div>

                    <Link to={`/productos/${producto.id}`} className="btn-ver-mas">
                      Ver detalles completos
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={paginaActual}
            totalPages={totalPaginas}
            onPageChange={setPaginaActual}
          />
        </>
      )}
    </div>
  );
}

export default Productos;
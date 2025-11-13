import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productoService, categoriaService } from '../services/api';
import Pagination from '../components/Pagination';
import { usePageTitle } from '../hooks/usePageTitle';
import './Productos.css';

function Productos() {
  usePageTitle('Productos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    provincia: '',
    categoria: '',
    estado: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;

  useEffect(() => {
    cargarCategorias();
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

  const handleFiltrar = () => {
    setLoading(true);
    cargarProductos();
  };

  const limpiarFiltros = () => {
    setFiltros({ provincia: '', categoria: '', estado: '' });
    setTimeout(() => cargarProductos(), 100);
  };

  // Calcular productos para la página actual
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosActuales = productos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

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
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="NO_DISPONIBLE">No disponible</option>
          </select>
        </div>
        <button onClick={handleFiltrar} className="btn-filtrar">
          Filtrar
        </button>
        <button onClick={limpiarFiltros} className="btn-limpiar">
          Limpiar
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="resultados-info">
            Mostrando {indicePrimero + 1}-{Math.min(indiceUltimo, productos.length)} de {productos.length} productos
          </div>
          
          <div className="productos-grid">
            {productosActuales.map((producto) => (
              <div key={producto.id} className="producto-card">
                <div className="producto-header">
                  <h3>{producto.nombre}</h3>
                  <span className={`badge-estado ${producto.estado.toLowerCase()}`}>
                    {producto.estado === 'DISPONIBLE' ? '✓ Disponible' : '✗ No disponible'}
                  </span>
                </div>
                
                <p className="producto-descripcion">
                  {producto.descripcion || 'Sin descripción'}
                </p>

                <div className="producto-info">
                  <div className="info-item">
                    <strong>📂 Categoría:</strong>
                    <span>{producto.categoria?.nombre || 'Sin categoría'}</span>
                  </div>
                  {producto.precio && (
                    <div className="info-item">
                      <strong>💰 Precio:</strong>
                      <span>
                        ${producto.precio.toFixed(2)} CUP
                        {producto.unidadPrecio && producto.unidadPrecio !== 'UNIDAD'
                          ? ` / ${producto.unidadPrecio.toLowerCase()}`
                          : ' / unidad'}
                      </span>
                    </div>
                  )}
                  {producto.cantidad && (
                    <div className="info-item">
                      <strong>📦 Cantidad:</strong>
                      <span>
                        {producto.cantidad} {producto.unidadMedida ? producto.unidadMedida.toLowerCase() : 'unidad(es)'}
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
                  Ver detalles
                </Link>
              </div>
            ))}
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
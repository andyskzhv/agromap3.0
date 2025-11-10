import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productoService, categoriaService } from '../services/api';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [categoriasRes, productosRes] = await Promise.all([
        categoriaService.obtenerTodas({ activas: 'true' }),
        productoService.obtenerTodos()
      ]);

      setCategorias(categoriasRes.data);

      // Agrupar productos por categoría
      const agrupados = {};
      productosRes.data.forEach(producto => {
        const categoriaNombre = producto.categoria?.nombre || 'Sin categoría';
        if (!agrupados[categoriaNombre]) {
          agrupados[categoriaNombre] = [];
        }
        if (agrupados[categoriaNombre].length < 4) { // Máximo 4 productos por categoría
          agrupados[categoriaNombre].push(producto);
        }
      });

      setProductosPorCategoria(agrupados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    navigate(`/productos?busqueda=${busqueda}`);
  };

  const verDetalleProducto = (id) => {
    navigate(`/productos/${id}`);
  };

  if (loading) {
    return <div className="loading-home">Cargando...</div>;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">AgroMap</h1>
            <p className="hero-description">
              En AgroMap conectamos a los consumidores con los productos agrícolas más
              frescos y saludables. Descubre la disponibilidad de alimentos en mercados
              cercanos, apoya sus beneficios nutricionales y planifica tu compra desde la
              comodidad de su hogar.
            </p>
            <button
              onClick={() => navigate('/mercados')}
              className="hero-button"
            >
              Sobre Nosotros
            </button>
          </div>
        </div>
      </section>

      {/* Barra de Búsqueda */}
      <section className="search-section">
        <form onSubmit={handleBuscar} className="search-form">
          <input
            type="text"
            placeholder="Buscar productos y mercados"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </section>

      {/* Productos Disponibles */}
      <section className="productos-section">
        <h2 className="section-title">Productos Disponibles</h2>

        {Object.entries(productosPorCategoria).map(([categoria, productos]) => (
          <div key={categoria} className="categoria-grupo">
            <div className="categoria-header">
              <h3 className="categoria-titulo">{categoria}</h3>
              <button
                onClick={() => navigate(`/productos?categoria=${categoria}`)}
                className="ver-todos-link"
              >
                Ver Todos
              </button>
            </div>

            <div className="productos-grid">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="producto-card"
                  onClick={() => verDetalleProducto(producto.id)}
                >
                  <div className="producto-imagen-container">
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
                  </div>

                  <div className="producto-info">
                    <h4 className="producto-nombre">{producto.nombre}</h4>

                    <div className="producto-estado">
                      {producto.estado === 'DISPONIBLE' ? (
                        <span className="estado-disponible">
                          ✓ Disponible en {producto._count?.mercados || 1} mercados
                        </span>
                      ) : (
                        <span className="estado-no-disponible">
                          ✗ No disponible
                        </span>
                      )}
                    </div>

                    <button className="producto-ver-detalles">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {productos.length === 0 && (
              <p className="no-productos">No hay productos disponibles en esta categoría</p>
            )}
          </div>
        ))}

        {Object.keys(productosPorCategoria).length === 0 && (
          <p className="no-productos">No hay productos disponibles en este momento</p>
        )}

        <div className="ver-mas-container">
          <button
            onClick={() => navigate('/productos')}
            className="ver-mas-button"
          >
            Ver más
          </button>
          <button
            onClick={() => navigate('/productos')}
            className="ver-todos-productos-button"
          >
            Ver Todos los Productos
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🌾</span>
              <span className="logo-text">AgroMap</span>
            </div>
            <p className="footer-description">
              Conectamos a los consumidores con los productos agrícolas más frescos y
              saludables. Descubre la disponibilidad de alimentos en mercados cercanos,
              apoya sus beneficios nutricionales y planifica tu compra desde la comodidad
              de tu hogar.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-titulo">Enlaces Rápidos</h4>
            <ul className="footer-links">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="/mercados">Mercados</a></li>
              <li><a href="/productos">Productos</a></li>
              <li><a href="#establecimientos">Establecimientos</a></li>
              <li><a href="/login">Iniciar Sesión</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-titulo">Contacto</h4>
            <ul className="footer-contacto">
              <li>📧 info@agromap.com</li>
              <li>📞 +53 78338068</li>
              <li>📍 INIFAT, Santiago de las Vegas, Boyeros</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-titulo">Colaboradores</h4>
            <div className="colaboradores-logos">
              {/* Aquí puedes agregar los logos de los colaboradores */}
              <div className="colaborador-placeholder">UCI</div>
              <div className="colaborador-placeholder">INIFAT</div>
              <div className="colaborador-placeholder">PNUD</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 AgroMap. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

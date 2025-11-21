import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantillaService, categoriaService } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import './Home.css';

function Home() {
  usePageTitle('Inicio');
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [plantillasPorCategoria, setPlantillasPorCategoria] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [scrollPositions, setScrollPositions] = useState({});
  const [mostrarTodasCategorias, setMostrarTodasCategorias] = useState(false);

  const CATEGORIAS_INICIALES = 4;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [categoriasRes, plantillasRes] = await Promise.all([
        categoriaService.obtenerTodas({ activas: 'true' }),
        plantillaService.obtenerDisponibles()
      ]);

      setCategorias(categoriasRes.data);

      // Agrupar plantillas por categoría
      const agrupados = {};
      plantillasRes.data.forEach(plantilla => {
        const categoriaNombre = plantilla.categoria?.nombre || 'Sin categoría';
        if (!agrupados[categoriaNombre]) {
          agrupados[categoriaNombre] = [];
        }
        agrupados[categoriaNombre].push(plantilla);
      });

      setPlantillasPorCategoria(agrupados);
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

  const verDetallePlantilla = (id) => {
    navigate(`/plantilla/${id}`);
  };

  const scroll = (categoria, direction) => {
    const container = document.getElementById(`scroll-${categoria}`);
    if (container) {
      const scrollAmount = 280; // Ancho de card + gap
      const newPosition = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="loading-home">Cargando...</div>;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: 'url(/hero.png)' }}>
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
              onClick={() => navigate('/sobre-nosotros')}
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

        {Object.entries(plantillasPorCategoria)
          .slice(0, mostrarTodasCategorias ? undefined : CATEGORIAS_INICIALES)
          .map(([categoria, plantillas]) => (
          <div key={categoria} className="categoria-grupo">
            <div className="categoria-header">
              <h3 className="categoria-titulo">{categoria}</h3>
            </div>

            <div className="productos-carousel-wrapper">
              {plantillas.length > 4 && (
                <button
                  className="carousel-btn carousel-btn-left"
                  onClick={() => scroll(categoria, 'left')}
                  aria-label="Anterior"
                >
                  ‹
                </button>
              )}

              <div className="productos-carousel" id={`scroll-${categoria}`}>
                {plantillas.map((plantilla) => (
                  <div
                    key={plantilla.id}
                    className={`producto-card-horizontal ${!plantilla.disponible ? 'no-disponible' : ''}`}
                    onClick={() => verDetallePlantilla(plantilla.id)}
                  >
                    <div className="producto-imagen-horizontal">
                      {plantilla.imagen ? (
                        <img
                          src={`http://localhost:5000${plantilla.imagen}`}
                          alt={plantilla.nombre}
                          className="producto-imagen"
                        />
                      ) : (
                        <div className="producto-sin-imagen">
                          <span>📦</span>
                        </div>
                      )}
                    </div>

                    <div className="producto-info-horizontal">
                      <h4 className="producto-nombre">{plantilla.nombre}</h4>
                      {plantilla.disponible ? (
                        <span className="estado-disponible">
                          ✓ Disponible en {plantilla._count?.mercadosUnicos || 0} mercados
                        </span>
                      ) : (
                        <span className="estado-no-disponible">
                          ✕ No disponible actualmente
                        </span>
                      )}
                      <button className="producto-ver-detalles-horizontal">
                        {plantilla.disponible ? 'Ver Disponibilidad' : 'Ver Detalles'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {plantillas.length > 4 && (
                <button
                  className="carousel-btn carousel-btn-right"
                  onClick={() => scroll(categoria, 'right')}
                  aria-label="Siguiente"
                >
                  ›
                </button>
              )}
            </div>

            {plantillas.length === 0 && (
              <p className="no-productos">No hay productos disponibles en esta categoría</p>
            )}
          </div>
        ))}

        {Object.keys(plantillasPorCategoria).length === 0 && (
          <p className="no-productos">No hay productos disponibles en este momento</p>
        )}

        <div className="ver-mas-container">
          {Object.keys(plantillasPorCategoria).length > CATEGORIAS_INICIALES && (
            <button
              onClick={() => setMostrarTodasCategorias(!mostrarTodasCategorias)}
              className="ver-mas-button"
            >
              {mostrarTodasCategorias ? 'Ver Menos' : 'Ver Más'}
            </button>
          )}
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

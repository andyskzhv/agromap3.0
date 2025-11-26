import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantillaService, categoriaService, mercadoService } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import './Home.css';

function Home() {
  usePageTitle('Inicio');
  const navigate = useNavigate();
  const toast = useToast();
  const [categorias, setCategorias] = useState([]);
  const [plantillasPorCategoria, setPlantillasPorCategoria] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [scrollPositions, setScrollPositions] = useState({});
  const [mostrarTodasCategorias, setMostrarTodasCategorias] = useState(false);

  // Estados para el filtro de provincia
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState(
    localStorage.getItem('provinciaPreferida') || ''
  );

  const CATEGORIAS_INICIALES = 4;

  useEffect(() => {
    cargarProvincias();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [provinciaSeleccionada]);

  const cargarProvincias = async () => {
    try {
      const response = await mercadoService.obtenerProvincias();
      setProvincias(response.data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      const params = {};
      if (provinciaSeleccionada) {
        params.provincia = provinciaSeleccionada;
      }

      const [categoriasRes, plantillasRes] = await Promise.all([
        categoriaService.obtenerTodas({ activas: 'true' }),
        plantillaService.obtenerDisponibles(params)
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

  const handleProvinciaChange = (e) => {
    const nuevaProvincia = e.target.value;
    setProvinciaSeleccionada(nuevaProvincia);
    localStorage.setItem('provinciaPreferida', nuevaProvincia);
    setLoading(true);
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    navigate(`/productos?busqueda=${busqueda}`);
  };

  const verDetallePlantilla = (plantilla) => {
    // Si el producto no está disponible, mostrar notificación
    if (!plantilla.disponible) {
      if (provinciaSeleccionada) {
        toast.warning(
          `"${plantilla.nombre}" no está disponible actualmente en ${provinciaSeleccionada}. Intenta seleccionar otra provincia o vuelve más tarde.`
        );
      } else {
        toast.info(
          `"${plantilla.nombre}" no está disponible en ningún mercado actualmente. Vuelve más tarde para ver disponibilidad.`
        );
      }
      return;
    }

    // Si está disponible, navegar a los detalles
    navigate(`/plantilla/${plantilla.id}`);
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

      {/* Barra de Búsqueda y Filtro de Provincia */}
      <section className="search-section">
        <div className="search-filters-container">
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

          <div className="province-filter">
            <label htmlFor="provincia-select" className="province-label">
              📍 Provincia:
            </label>
            <select
              id="provincia-select"
              value={provinciaSeleccionada}
              onChange={handleProvinciaChange}
              className="province-select"
            >
              <option value="">Todas las provincias</option>
              {provincias.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
          </div>
        </div>
        {provinciaSeleccionada && (
          <p className="province-info">
            Mostrando productos disponibles en <strong>{provinciaSeleccionada}</strong>
          </p>
        )}
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
                    onClick={() => verDetallePlantilla(plantilla)}
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
    </div>
  );
}

export default Home;

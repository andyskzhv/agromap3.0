import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import './AboutUs.css';

function AboutUs() {
  usePageTitle('Sobre Nosotros - Agromap');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    '/about-3.jpg',
    '/about-4.jpg',
    '/comercializacion.jpg',
    '/interaccion.jpg',
    '/venta.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const collaborators = [
    {
      name: 'EICMA',
      logo: '/eicma.png',
      url: 'https://www.facebook.com/dg.eicma.cu/', // URL por definir
    },
    {
      name: 'FAO',
      logo: '/logo fao.png',
      url: 'https://www.fao.org/home/en', // URL por definir
    },
    {
      name: 'INIFAT',
      logo: '/inifat.jpg',
      url: 'https://www.facebook.com/people/Inifat-Inifat/100013255211882/', // URL por definir
    },
    {
      name: 'MINAG',
      logo: '/minag.png',
      url: 'https://www.minag.gob.cu/', // URL por definir
    },
    {
      name: 'SAS',
      logo: '/logo sas.jpg',
      url: '#', // URL por definir
    },
    {
      name: 'UCI',
      logo: '/uci.png',
      url: 'https://www.uci.cu/', // URL por definir
    },
  ];

  return (
    <div className="aboutus-container">
      {/* Hero Section with Carousel */}
      <section className="aboutus-hero">
        <div className="aboutus-hero-carousel">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`aboutus-carousel-slide ${
                index === currentImageIndex ? 'active' : ''
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="aboutus-carousel-overlay" />
        </div>
        <div className="aboutus-hero-content">
          <h1>Sobre Nosotros</h1>
          <p className="aboutus-subtitle">
            Conectando el campo cubano con los consumidores
          </p>
        </div>
        <div className="aboutus-carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`aboutus-carousel-indicator ${
                index === currentImageIndex ? 'active' : ''
              }`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="aboutus-section">
        <div className="aboutus-content">
          <div className="aboutus-text-block">
            <h2>Nuestra Misión</h2>
            <p>
              Agromap es una plataforma digital que busca revolucionar el mercado
              agrícola en Cuba, facilitando la conexión directa entre productores
              y consumidores. Nuestra misión es promover la agricultura sostenible
              y garantizar el acceso a productos frescos y de calidad.
            </p>
            <p>
              Trabajamos para crear un ecosistema donde los agricultores puedan
              comercializar sus productos de manera eficiente y los consumidores
              tengan acceso transparente a la información sobre los alimentos que
              consumen.
            </p>
          </div>
          <div className="aboutus-image">
            <img src="/about-3.jpg" alt="Sobre Agromap" />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="aboutus-section aboutus-section-alt">
        <div className="aboutus-content aboutus-content-reverse">
          <div className="aboutus-image">
            <img src="/about-4.jpg" alt="Visión Agromap" />
          </div>
          <div className="aboutus-text-block">
            <h2>Nuestra Visión</h2>
            <p>
              Aspiramos a ser la plataforma líder en Cuba para la comercialización
              de productos agrícolas, contribuyendo al desarrollo sostenible del
              sector agrario y mejorando la calidad de vida tanto de productores
              como de consumidores.
            </p>
            <p>
              Visualizamos un futuro donde la tecnología y la agricultura trabajen
              en armonía, creando oportunidades económicas y fortaleciendo la
              seguridad alimentaria de nuestro país.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="aboutus-section">
        <div className="aboutus-content">
          <h2 className="aboutus-section-title">Nuestros Valores</h2>
          <div className="aboutus-values-grid">
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">🌱</div>
              <h3>Sostenibilidad</h3>
              <p>
                Promovemos prácticas agrícolas que respetan el medio ambiente
                y garantizan la producción a largo plazo.
              </p>
            </div>
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">🤝</div>
              <h3>Transparencia</h3>
              <p>
                Fomentamos la confianza mediante información clara y accesible
                sobre productos, precios y productores.
              </p>
            </div>
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">💡</div>
              <h3>Innovación</h3>
              <p>
                Utilizamos tecnología para mejorar continuamente la experiencia
                de usuarios y la eficiencia del mercado.
              </p>
            </div>
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">🌾</div>
              <h3>Calidad</h3>
              <p>
                Nos comprometemos con productos frescos y de la más alta calidad
                para satisfacer a nuestros consumidores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="aboutus-section aboutus-section-alt">
        <div className="aboutus-content">
          <h2 className="aboutus-section-title">¿Qué Ofrecemos?</h2>
          <div className="aboutus-services-grid">
            <div className="aboutus-service-card">
              <img src="/comercializacion.jpg" alt="Comercialización" />
              <div className="aboutus-service-content">
                <h3>Comercialización Directa</h3>
                <p>
                  Conectamos productores con consumidores, eliminando
                  intermediarios y garantizando mejores precios para ambos.
                </p>
              </div>
            </div>
            <div className="aboutus-service-card">
              <img src="/venta.jpg" alt="Venta de Productos" />
              <div className="aboutus-service-content">
                <h3>Mercado en Línea</h3>
                <p>
                  Plataforma digital intuitiva donde puedes encontrar productos
                  agrícolas frescos de toda Cuba.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaborators Section */}
      <section className="aboutus-section aboutus-collaborators">
        <div className="aboutus-content">
          <h2 className="aboutus-section-title">Nuestros Colaboradores</h2>
          <p className="aboutus-collaborators-subtitle">
            Trabajamos junto a instituciones comprometidas con el desarrollo
            agrícola y tecnológico de Cuba
          </p>
          <div className="aboutus-collaborators-grid">
            {collaborators.map((collaborator, index) => (
              <a
                key={index}
                href={collaborator.url}
                className="aboutus-collaborator-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="aboutus-collaborator-logo">
                  <img src={collaborator.logo} alt={collaborator.name} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;

import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import './AboutUs.css';

function AboutUs() {
  usePageTitle('Sobre Nosotros - Agromap');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    '/feria2.jpg',
    '/about-4.jpg',
    '/feriataguasco.jpeg',
    '/interaccion.jpg',
    '/veguita.jpg',
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
      name: 'MINAG',
      logo: '/minag.png',
      url: 'https://www.minag.gob.cu/', // URL por definir
    },
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
      name: 'Unión Europea',
      logo: '/europea.png',
      url: 'https://european-union.europa.eu/index_es', // URL por definir
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
            <h2>¿Qué es Agromap?</h2>
            <p>
              Es una plataforma digital diseñada para facilitar el acceso a la información sobre la disponibilidad de productos agropecuarios en la red de mercados locales.
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
            <img src="/capacitacion.jpg" alt="Visión Agromap" />
            <div className="aboutus-project-logos">
              <a href="#" className="aboutus-project-logo-link">
                <img src="/logo posas.png" alt="Logo POSAS" className="aboutus-project-logo" />
              </a>
              <a href="#" className="aboutus-project-logo-link">
                <img src="/logo sas.jpg" alt="Logo SAS" className="aboutus-project-logo" />
              </a>
            </div>
          </div>
          <div className="aboutus-text-block">
            <h2>¿Cómo surge?</h2>
            <p>
              Agromap es una iniciativa del proyecto de colaboración internacional "Fortalecimiento de políticas para la seguridad alimentaria sostenible en Cuba" (POSAS/SAS Cuba), implementado por el Ministerio de la Agricultura y la Organización de Naciones Unidas para la Alimentación y la Agricultura y financiado por la Unión Europea. Contribuye a la implementación del Decreto 35 de la comercialización de productos agropecuarios a nivel local.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="aboutus-section">
        <div className="aboutus-content">
          <h2 className="aboutus-section-title">Nuestros Objetivos</h2>
          <div className="aboutus-values-grid">
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">🌱</div>
              <h3>Facilitar</h3>
              <p>
                Hacer más sencillo el acceso a la información sobre los productos disponibles en los mercados locales. 
              </p>
            </div>
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">🤝</div>
              <h3>Organizar</h3>
              <p>
                Presentar los datos de manera clara y ordenada para que el usuario entienda todo de un vistazo.
              </p>
            </div>
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">💡</div>
              <h3>Orientar</h3>
              <p>
               Guiar a las personas para que encuentren rápidamente los productos y puntos de venta que necesitan.
              </p>
            </div>
            <div className="aboutus-value-card">
              <div className="aboutus-value-icon">🌾</div>
              <h3>Conectar</h3>
              <p>
                Acercar a los mercados y la comunidad mediante información actualizada y útil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="aboutus-section aboutus-section-alt">
        <div className="aboutus-content">
          <h2 className="aboutus-section-title">¿Qué permite?</h2>
          <div className="aboutus-services-grid">
            <div className="aboutus-service-card">
              <img src="/comercializacion.jpg" alt="Comercialización" />
              <div className="aboutus-service-content">
                <h3>Información al alcance</h3>
                <p>
                  Mostramos de manera clara qué productos están disponibles en los mercados locales, permitiendo a los usuarios encontrar lo que necesitan sin recorrer varios establecimientos.
                </p>
              </div>
            </div>
            <div className="aboutus-service-card">
              <img src="/venta.jpg" alt="Venta de Productos" />
              <div className="aboutus-service-content">
                <h3>Datos nutricionales</h3>
                <p>
                  Ofrecemos información básica sobre el valor nutricional de los productos presentes en la plataforma, ayudando a los usuarios a conocer mejor lo que consumen y a tomar decisiones más conscientes.
                </p>
              </div>
            </div>
            <div className="aboutus-service-card">
              <img src="/interaccion.jpg" alt="Mercados y ubicación" />
              <div className="aboutus-service-content">
                <h3>Mercados y ubicación</h3>
                <p>
                  Mostramos la ubicación y la información esencial de los mercados locales que integran la plataforma, permitiendo a los usuarios identificar rápidamente dónde encontrar los productos que necesitan.
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

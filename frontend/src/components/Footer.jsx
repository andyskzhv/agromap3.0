import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-logo-section">
          <Link to="/" className="footer-logo">
            <img src="/logo.png" alt="Agromap" className="footer-logo-image" />
          </Link>
        </div>

        <div className="footer-section footer-links-section">
          <h4 className="footer-titulo">Enlaces</h4>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
            <li><Link to="/productos">Productos</Link></li>
            <li><Link to="/mercados">Mercados</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-contact-section">
          <h4 className="footer-titulo">Contacto</h4>
          <a href="mailto:agromapweb@gmail.com" className="footer-email">
            agromapweb@gmail.com
          </a>
        </div>

        <div className="footer-section footer-copyright-section">
          <p>&copy; 2025 AgroMap</p>
          <p className="footer-rights">Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

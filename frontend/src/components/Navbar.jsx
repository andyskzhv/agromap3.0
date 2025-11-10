import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, [location]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🌾 Agromap
        </Link>

        <button 
          className="navbar-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${menuAbierto ? 'active' : ''}`}>
          <Link
            to="/mercados"
            className={`navbar-link ${isActive('/mercados')}`}
            onClick={() => setMenuAbierto(false)}
          >
            Sobre Nosotros
          </Link>

          <Link
            to="/productos"
            className={`navbar-link ${isActive('/productos')}`}
            onClick={() => setMenuAbierto(false)}
          >
            Productos
          </Link>

          <a
            href="#establecimientos"
            className="navbar-link"
            onClick={() => setMenuAbierto(false)}
          >
            Establecimientos
          </a>

          <a
            href="#contacto"
            className="navbar-link"
            onClick={() => setMenuAbierto(false)}
          >
            Contacto
          </a>

          {usuario ? (
            <>
              {usuario.rol === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={`navbar-link admin-link ${isActive('/admin')}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  🛡️ Admin
                </Link>
              )}

              {(usuario.rol === 'GESTOR' || usuario.rol === 'ADMIN') && (
                <>
                  <Link 
                    to="/mercado/crear" 
                    className={`navbar-link ${isActive('/mercado/crear')}`}
                    onClick={() => setMenuAbierto(false)}
                  >
                    🏪 Mi Mercado
                  </Link>
                  <Link 
                    to="/gestion-productos" 
                    className={`navbar-link ${isActive('/gestion-productos')}`}
                    onClick={() => setMenuAbierto(false)}
                  >
                    📋 Mis Productos
                  </Link>
                </>
              )}

              <div className="navbar-user">
                <Link 
                  to="/perfil" 
                  className={`navbar-link user-link ${isActive('/perfil')}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  👤 {usuario.nombre}
                </Link>
                <button 
                  onClick={cerrarSesion} 
                  className="navbar-logout"
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link 
                to="/login" 
                className="navbar-link"
                onClick={() => setMenuAbierto(false)}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/registro" 
                className="navbar-button"
                onClick={() => setMenuAbierto(false)}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
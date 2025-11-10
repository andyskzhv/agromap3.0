import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuPerfilAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setMenuPerfilAbierto(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/productos?busqueda=${busqueda}`);
      setBusqueda('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Agromap" className="logo-image" />
        </Link>

        {/* Botón móvil */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>

        {/* Links centrados */}
        <div className={`navbar-menu ${menuAbierto ? 'active' : ''}`}>
          <Link
            to="/productos"
            className={`navbar-link ${isActive('/productos')}`}
            onClick={() => setMenuAbierto(false)}
          >
            Productos
          </Link>

          <Link
            to="/mercados"
            className={`navbar-link ${isActive('/mercados')}`}
            onClick={() => setMenuAbierto(false)}
          >
            Establecimientos
          </Link>

          <a
            href="#contacto"
            className="navbar-link"
            onClick={() => setMenuAbierto(false)}
          >
            Contacto
          </a>
        </div>

        {/* Búsqueda y Perfil */}
        <div className="navbar-actions">
          {/* Barra de búsqueda */}
          <form onSubmit={handleBuscar} className="navbar-search">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>

          {/* Menú de perfil */}
          <div className="navbar-profile" ref={menuRef}>
            <button
              className="profile-button"
              onClick={() => setMenuPerfilAbierto(!menuPerfilAbierto)}
            >
              {usuario?.imagen ? (
                <img
                  src={`http://localhost:5000${usuario.imagen}`}
                  alt={usuario.nombre}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-icon">👤</div>
              )}
            </button>

            {/* Dropdown menu */}
            {menuPerfilAbierto && (
              <div className="profile-dropdown">
                {usuario ? (
                  <>
                    <div className="dropdown-header">
                      <div className="user-info">
                        <span className="user-name">{usuario.nombre}</span>
                        <span className="user-role">{usuario.rol}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/perfil"
                      className="dropdown-item"
                      onClick={() => setMenuPerfilAbierto(false)}
                    >
                      👤 Mi Perfil
                    </Link>
                    {(usuario.rol === 'GESTOR' || usuario.rol === 'ADMIN') && (
                      <>
                        <Link
                          to="/mercado/crear"
                          className="dropdown-item"
                          onClick={() => setMenuPerfilAbierto(false)}
                        >
                          🏪 Mi Mercado
                        </Link>
                        <Link
                          to="/gestion-productos"
                          className="dropdown-item"
                          onClick={() => setMenuPerfilAbierto(false)}
                        >
                          📋 Mis Productos
                        </Link>
                      </>
                    )}
                    {usuario.rol === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="dropdown-item admin-item"
                        onClick={() => setMenuPerfilAbierto(false)}
                      >
                        🛡️ Panel Admin
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={cerrarSesion}
                      className="dropdown-item logout-item"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="dropdown-item"
                      onClick={() => setMenuPerfilAbierto(false)}
                    >
                      🔐 Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="dropdown-item register-item"
                      onClick={() => setMenuPerfilAbierto(false)}
                    >
                      ✨ Registrarse
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

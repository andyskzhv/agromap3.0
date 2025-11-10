import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Mapeo de rutas a nombres legibles en español
  const routeNames = {
    'mercados': 'Mercados',
    'mercado': 'Mercado',
    'crear': 'Crear',
    'editar': 'Editar',
    'productos': 'Productos',
    'producto': 'Producto',
    'gestion-productos': 'Gestión de Productos',
    'login': 'Iniciar Sesión',
    'registro': 'Registro',
    'perfil': 'Mi Perfil',
    'editar-perfil': 'Editar Perfil',
    'admin': 'Panel de Administración'
  };

  // No mostrar breadcrumbs en la página de inicio
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <div className="breadcrumbs-container">
        <Link to="/" className="breadcrumb-item">
          🏠 Inicio
        </Link>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          // Si es un número (ID), mostrarlo como tal
          const displayName = !isNaN(name)
            ? `#${name}`
            : routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1);

          return isLast ? (
            <span key={name} className="breadcrumb-item active">
              {displayName}
            </span>
          ) : (
            <Link key={name} to={routeTo} className="breadcrumb-item">
              {displayName}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default Breadcrumbs;

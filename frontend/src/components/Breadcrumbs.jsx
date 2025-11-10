import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mercadoService, productoService } from '../services/api';
import './Breadcrumbs.css';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [entityNames, setEntityNames] = useState({});

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

  // Efecto para cargar nombres de entidades cuando hay IDs en la ruta
  useEffect(() => {
    const fetchEntityNames = async () => {
      const names = {};

      for (let i = 0; i < pathnames.length; i++) {
        const segment = pathnames[i];
        const prevSegment = i > 0 ? pathnames[i - 1] : null;

        // Si el segmento es un número (ID)
        if (!isNaN(segment)) {
          try {
            // Si el segmento anterior es 'mercados', obtener nombre del mercado
            if (prevSegment === 'mercados') {
              const response = await mercadoService.obtenerPorId(segment);
              names[segment] = response.data.nombre;
            }
            // Si el segmento anterior es 'productos', obtener nombre del producto
            else if (prevSegment === 'productos') {
              const response = await productoService.obtenerPorId(segment);
              names[segment] = response.data.nombre;
            }
          } catch (error) {
            console.error(`Error al cargar nombre para ID ${segment}:`, error);
            // Si falla, se mantendrá el formato #ID
          }
        }
      }

      setEntityNames(names);
    };

    fetchEntityNames();
  }, [location.pathname]);

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

          // Si es un número (ID), mostrar el nombre de la entidad si está disponible
          const displayName = !isNaN(name)
            ? (entityNames[name] || `#${name}`)
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

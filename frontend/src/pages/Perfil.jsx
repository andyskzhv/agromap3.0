import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await authService.obtenerPerfil();
      setUsuario(response.data);
    } catch (err) {
      setError('Error al cargar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Mi Perfil</h1>
        
        {usuario && (
          <div className="perfil-info">
            {usuario.imagen && (
              <div className="perfil-imagen-container">
                <img 
                  src={`http://localhost:5000${usuario.imagen}`} 
                  alt={usuario.nombre}
                  className="perfil-imagen"
                />
              </div>
            )}
            <div className="info-row">
              <strong>Nombre:</strong>
              <span>{usuario.nombre}</span>
            </div>
            <div className="info-row">
              <strong>Nombre de usuario:</strong>
              <span>{usuario.nombreUsuario}</span>
            </div>
            <div className="info-row">
              <strong>Rol:</strong>
              <span className={`badge badge-${usuario.rol.toLowerCase()}`}>
                {usuario.rol}
              </span>
            </div>
            {usuario.provincia && (
              <div className="info-row">
                <strong>Provincia:</strong>
                <span>{usuario.provincia}</span>
              </div>
            )}
            <div className="info-row">
              <strong>Miembro desde:</strong>
              <span>{new Date(usuario.creadoEn).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        <div className="button-group">
          <button 
            onClick={() => navigate('/editar-perfil')} 
            className="btn-primary"
          >
            ✏️ Editar Perfil
          </button>
          
          {usuario.rol === 'ADMIN' && (
            <button 
              onClick={() => navigate('/admin')} 
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' }}
            >
              🛡️ Panel de Administración
            </button>
          )}
          {(usuario.rol === 'GESTOR' || usuario.rol === 'ADMIN') && (
            <>
              <button 
                onClick={() => navigate('/mercado/crear')} 
                className="btn-primary"
              >
                {usuario.rol === 'GESTOR' ? 'Gestionar mi mercado' : 'Crear mercado'}
              </button>
              <button 
                onClick={() => navigate('/gestion-productos')} 
                className="btn-primary"
              >
                Gestionar productos
              </button>
            </>
          )}
          <button onClick={() => navigate('/mercados')} className="btn-primary">
            Ver mercados
          </button>
          <button onClick={() => navigate('/productos')} className="btn-primary">
            Ver productos
          </button>
          <button onClick={cerrarSesion} className="btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
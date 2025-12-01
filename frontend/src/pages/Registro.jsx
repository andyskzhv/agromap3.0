import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './Auth.css';

function Registro() {
  usePageTitle('Registro');
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    nombreUsuario: '',
    contrasena: ''
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede pesar más de 5MB');
        toast.error('La imagen no puede pesar más de 5MB');
        e.target.value = '';
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        toast.error('Solo se permiten archivos de imagen');
        e.target.value = '';
        return;
      }

      setImagenFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const eliminarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('nombreUsuario', formData.nombreUsuario);
      formDataToSend.append('contrasena', formData.contrasena);
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }

      const response = await authService.registro(formDataToSend);
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      toast.success('¡Registro exitoso!');
      navigate('/perfil');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
      toast.error(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: 'url(/hero.png)' }}>
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Agromap" />
        </div>
        <h1>Crear Cuenta</h1>
        <p className="subtitle">Únete a la comunidad de Agromap</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label>Nombre de usuario</label>
            <input
              type="text"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleChange}
              required
              placeholder="Elige un nombre de usuario"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="password-input-container">
              <input
                type={mostrarContrasena ? "text" : "password"}
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
                placeholder="Crea una contraseña segura"
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={toggleMostrarContrasena}
                aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarContrasena ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Foto de perfil (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="file-input"
            />
            <span className="helper-text">
              Formatos: JPG, PNG, GIF, WebP. Máximo 5MB
            </span>
            
            {imagenPreview && (
              <div className="imagen-preview">
                <img src={imagenPreview} alt="Preview" />
                <button
                  type="button"
                  onClick={eliminarImagen}
                  className="btn-eliminar-preview"
                  aria-label="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;

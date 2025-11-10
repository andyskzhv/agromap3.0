import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../components/Toast';
import './Auth.css';

function Registro() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    nombreUsuario: '',
    contrasena: '',
    provincia: ''
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('nombreUsuario', formData.nombreUsuario);
      formDataToSend.append('contrasena', formData.contrasena);
      if (formData.provincia) {
        formDataToSend.append('provincia', formData.provincia);
      }
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }

      const response = await authService.registro(formDataToSend);
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      toast.success('¡Registro exitoso! Bienvenido a Agromap');
      navigate('/perfil');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al registrarse';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const eliminarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    document.getElementById('imagen-input').value = '';
  };

  return (
    <div className="auth-container" style={{ backgroundImage: 'url(/hero.png)' }}>
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Agromap" />
        </div>
        <h1>Registro en Agromap</h1>
        <p className="subtitle">Crea tu cuenta para comenzar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Foto de perfil (opcional)</label>
            <input
              type="file"
              id="imagen-input"
              accept="image/*"
              onChange={handleImagenChange}
              className="file-input"
            />
            {imagenPreview && (
              <div className="imagen-preview">
                <img src={imagenPreview} alt="Preview" />
                <button 
                  type="button" 
                  onClick={eliminarImagen}
                  className="btn-eliminar-preview"
                >
                  ✕ Eliminar
                </button>
              </div>
            )}
            <small className="helper-text">Máximo 5MB - Formatos: JPG, PNG, GIF, WEBP</small>
          </div>

          <div className="form-group">
            <label>Nombre completo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="form-group">
            <label>Nombre de usuario *</label>
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
            <label>Contraseña *</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Provincia (opcional)</label>
            <input
              type="text"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              placeholder="Tu provincia"
            />
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
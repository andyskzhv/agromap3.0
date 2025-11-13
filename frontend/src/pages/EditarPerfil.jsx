import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, mercadoService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './Auth.css';

function EditarPerfil() {
  usePageTitle('Editar Perfil');
  const navigate = useNavigate();
  const toast = useToast();
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    provincia: '',
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasena: ''
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [provincias, setProvincias] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [perfilRes, provinciasRes] = await Promise.all([
        authService.obtenerPerfil(),
        mercadoService.obtenerProvincias()
      ]);

      setUsuario(perfilRes.data);
      setProvincias(provinciasRes.data);
      setFormData({
        nombre: perfilRes.data.nombre,
        provincia: perfilRes.data.provincia || '',
        contrasenaActual: '',
        contrasenaNueva: '',
        confirmarContrasena: ''
      });
      if (perfilRes.data.imagen) {
        setImagenPreview(`http://localhost:5000${perfilRes.data.imagen}`);
      }
    } catch (err) {
      setError('Error al cargar el perfil');
      toast.error('Error al cargar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const eliminarImagen = () => {
    setImagenFile(null);
    if (usuario?.imagen) {
      setImagenPreview(`http://localhost:5000${usuario.imagen}`);
    } else {
      setImagenPreview(null);
    }
    document.getElementById('imagen-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      // Validar contraseñas si se va a cambiar
      if (formData.contrasenaNueva) {
        if (!formData.contrasenaActual) {
          setError('Debes ingresar tu contraseña actual para cambiarla');
          toast.error('Debes ingresar tu contraseña actual para cambiarla');
          setGuardando(false);
          return;
        }
        if (formData.contrasenaNueva !== formData.confirmarContrasena) {
          setError('Las contraseñas nuevas no coinciden');
          toast.error('Las contraseñas nuevas no coinciden');
          setGuardando(false);
          return;
        }
        if (formData.contrasenaNueva.length < 6) {
          setError('La nueva contraseña debe tener al menos 6 caracteres');
          toast.error('La nueva contraseña debe tener al menos 6 caracteres');
          setGuardando(false);
          return;
        }
      }

      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('provincia', formData.provincia);
      
      if (formData.contrasenaNueva) {
        formDataToSend.append('contrasenaActual', formData.contrasenaActual);
        formDataToSend.append('contrasenaNueva', formData.contrasenaNueva);
      }
      
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }

      const response = await authService.actualizarPerfil(formDataToSend);
      
      // Actualizar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      toast.success('¡Perfil actualizado exitosamente!');
      navigate('/perfil');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar perfil';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Editar Mi Perfil</h1>
        <p className="subtitle">Actualiza tu información personal</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Foto de perfil</label>
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
                {imagenFile && (
                  <button 
                    type="button" 
                    onClick={eliminarImagen}
                    className="btn-eliminar-preview"
                  >
                    ✕
                  </button>
                )}
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
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label>Nombre de usuario</label>
            <input
              type="text"
              value={usuario?.nombreUsuario || ''}
              disabled
              className="input-disabled"
            />
            <small className="helper-text">El nombre de usuario no se puede cambiar</small>
          </div>

          <div className="form-group">
            <label>Provincia</label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
            >
              <option value="">Selecciona una provincia</option>
              {provincias.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
          </div>

          <div className="form-divider">
            <span>Cambiar Contraseña (opcional)</span>
          </div>

          <div className="form-group">
            <label>Contraseña actual</label>
            <input
              type="password"
              name="contrasenaActual"
              value={formData.contrasenaActual}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              name="contrasenaNueva"
              value={formData.contrasenaNueva}
              onChange={handleChange}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Confirma la nueva contraseña"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/perfil')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarPerfil;
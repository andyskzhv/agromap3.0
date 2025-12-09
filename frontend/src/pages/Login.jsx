import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { authService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './Auth.css';

function Login() {
  usePageTitle('Iniciar Sesión');
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = React.useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
    setError('');
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    setError('El captcha ha expirado. Por favor verifica nuevamente.');
    toast.error('El captcha ha expirado');
  };

  const handleCaptchaError = (err) => {
    setCaptchaToken(null);
    setError('Error al cargar el captcha. Por favor recarga la página.');
    toast.error('Error al cargar el captcha');
    console.error('hCaptcha error:', err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar captcha antes de enviar
    if (!captchaToken) {
      setError('Por favor completa la verificación de seguridad');
      toast.error('Por favor completa el captcha');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        ...formData,
        captchaToken
      });
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/perfil');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');

      // Resetear captcha en caso de error
      setCaptchaToken(null);
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
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
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">Accede a tu cuenta de Agromap</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre de usuario</label>
            <input
              type="text"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleChange}
              required
              placeholder="Tu nombre de usuario"
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
                placeholder="Tu contraseña"
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

          <div className="form-group captcha-container">
            <label>Verificación de seguridad</label>
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.REACT_APP_HCAPTCHA_SITE_KEY}
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              onError={handleCaptchaError}
              theme="light"
              size="normal"
            />
            {!captchaToken && (
              <span className="helper-text captcha-helper">
                Por favor verifica que no eres un robot
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

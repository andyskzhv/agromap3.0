import React, { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { contactoService } from '../services/api';
import './Contacto.css';

function Contacto() {
  usePageTitle('Contacto - Agromap');
  const toast = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El email no es válido');
      return false;
    }

    if (!formData.asunto.trim()) {
      setError('El asunto es requerido');
      return false;
    }

    if (!formData.mensaje.trim()) {
      setError('El mensaje es requerido');
      return false;
    }

    if (formData.mensaje.trim().length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await contactoService.enviar(formData);
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      const errorMsg = err.response?.data?.error || 'Error al enviar el mensaje. Intenta nuevamente.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacto-container">
      <div className="contacto-card">
        <h1>Contacto</h1>
        <p className="contacto-descripcion">
          ¿Tienes alguna pregunta o sugerencia? Envíanos un mensaje y te responderemos lo antes posible.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="contacto-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="asunto">Asunto</label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Asunto del mensaje"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Escribe tu mensaje aquí..."
              rows="6"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-enviar" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>

        <div className="contacto-info">
          <p>También puedes contactarnos directamente en:</p>
          <a href="mailto:agromapweb@gmail.com" className="email-link">
            agromapweb@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default Contacto;

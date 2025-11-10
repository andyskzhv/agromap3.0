import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mercadoService } from '../services/api';
import { useToast } from '../components/Toast';
import './FormularioMercado.css';

function FormularioMercado() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    provincia: '',
    municipio: '',
    latitud: '',
    longitud: '',
    beneficiarioLegal: '',
    horario: '',
    perteneceSas: false
  });
  const [mercadoExistente, setMercadoExistente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verificarMercadoExistente();
  }, []);

  const verificarMercadoExistente = async () => {
    try {
      const response = await mercadoService.obtenerMiMercado();
      setMercadoExistente(response.data);
      setFormData({
        nombre: response.data.nombre,
        descripcion: response.data.descripcion || '',
        direccion: response.data.direccion,
        provincia: response.data.provincia,
        municipio: response.data.municipio,
        latitud: response.data.latitud || '',
        longitud: response.data.longitud || '',
        beneficiarioLegal: response.data.beneficiarioLegal || '',
        horario: response.data.horario || '',
        perteneceSas: response.data.perteneceSas
      });
    } catch (err) {
      // No tiene mercado aún, puede crear uno nuevo
      console.log('No tiene mercado creado');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mercadoExistente) {
        // Actualizar mercado existente
        await mercadoService.actualizar(mercadoExistente.id, formData);
        toast.success('¡Mercado actualizado exitosamente!');
      } else {
        // Crear nuevo mercado
        await mercadoService.crear(formData);
        toast.success('¡Mercado creado exitosamente!');
      }
      navigate('/perfil');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al guardar el mercado';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-container">
      <div className="formulario-card">
        <h1>{mercadoExistente ? 'Editar Mi Mercado' : 'Crear Mi Mercado'}</h1>
        <p className="subtitle">
          {mercadoExistente 
            ? 'Actualiza la información de tu mercado' 
            : 'Completa los datos de tu mercado'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-mercado">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del mercado *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Mercado Central"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Describe tu mercado..."
            />
          </div>

          <div className="form-group">
            <label>Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              placeholder="Dirección completa"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Provincia *</label>
              <input
                type="text"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                required
                placeholder="Tu provincia"
              />
            </div>

            <div className="form-group">
              <label>Municipio *</label>
              <input
                type="text"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                required
                placeholder="Tu municipio"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitud</label>
              <input
                type="number"
                step="any"
                name="latitud"
                value={formData.latitud}
                onChange={handleChange}
                placeholder="Ej: 23.1136"
              />
            </div>

            <div className="form-group">
              <label>Longitud</label>
              <input
                type="number"
                step="any"
                name="longitud"
                value={formData.longitud}
                onChange={handleChange}
                placeholder="Ej: -82.3666"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Beneficiario Legal</label>
            <input
              type="text"
              name="beneficiarioLegal"
              value={formData.beneficiarioLegal}
              onChange={handleChange}
              placeholder="Nombre del beneficiario"
            />
          </div>

          <div className="form-group">
            <label>Horario</label>
            <textarea
              name="horario"
              value={formData.horario}
              onChange={handleChange}
              rows="3"
              placeholder="Ej: Lunes a Viernes: 8:00 AM - 5:00 PM"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="perteneceSas"
                checked={formData.perteneceSas}
                onChange={handleChange}
              />
              <span>¿Pertenece a SAS?</span>
            </label>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (mercadoExistente ? 'Actualizar Mercado' : 'Crear Mercado')}
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

export default FormularioMercado;
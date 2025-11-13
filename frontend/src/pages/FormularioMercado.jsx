import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mercadoService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import MapPicker from '../components/MapPicker';
import { provincias, getMunicipiosPorProvincia } from '../data/provincias-municipios';
import './FormularioMercado.css';

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

function FormularioMercado() {
  usePageTitle('Formulario de Establecimiento');
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
    perteneceSas: false
  });

  const [horario, setHorario] = useState({
    lunes: { abre: '08:00', cierra: '17:00', cerrado: false },
    martes: { abre: '08:00', cierra: '17:00', cerrado: false },
    miercoles: { abre: '08:00', cierra: '17:00', cerrado: false },
    jueves: { abre: '08:00', cierra: '17:00', cerrado: false },
    viernes: { abre: '08:00', cierra: '17:00', cerrado: false },
    sabado: { abre: '08:00', cierra: '17:00', cerrado: false },
    domingo: { abre: '08:00', cierra: '17:00', cerrado: true }
  });

  const [imagenes, setImagenes] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);
  const [mercadoExistente, setMercadoExistente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verificarMercadoExistente();
  }, []);

  useEffect(() => {
    if (formData.provincia) {
      const municipios = getMunicipiosPorProvincia(formData.provincia);
      setMunicipiosDisponibles(municipios);

      // Si el municipio actual no está en la lista, limpiarlo
      if (!municipios.includes(formData.municipio)) {
        setFormData(prev => ({ ...prev, municipio: '' }));
      }
    }
  }, [formData.provincia]);

  const verificarMercadoExistente = async () => {
    try {
      const response = await mercadoService.obtenerMiMercado();
      const mercado = response.data;
      setMercadoExistente(mercado);

      setFormData({
        nombre: mercado.nombre,
        descripcion: mercado.descripcion || '',
        direccion: mercado.direccion,
        provincia: mercado.provincia,
        municipio: mercado.municipio,
        latitud: mercado.latitud || '',
        longitud: mercado.longitud || '',
        beneficiarioLegal: mercado.beneficiarioLegal || '',
        perteneceSas: mercado.perteneceSas
      });

      // Parsear horario si existe
      if (mercado.horario) {
        try {
          const horarioParsed = JSON.parse(mercado.horario);
          setHorario(horarioParsed);
        } catch {
          // Si no es JSON, ignorar
        }
      }

      // Establecer imágenes existentes
      if (mercado.imagenes && mercado.imagenes.length > 0) {
        setImagenesExistentes(mercado.imagenes);
      }
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

  const handleMapChange = ({ latitud, longitud }) => {
    setFormData(prev => ({
      ...prev,
      latitud,
      longitud
    }));
  };

  const handleHorarioChange = (dia, campo, valor) => {
    setHorario(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);

    // Validar máximo 5 imágenes
    if (files.length > 5) {
      toast.error('Máximo 5 imágenes permitidas');
      return;
    }

    // Validar tamaño (5MB por imagen)
    const maxSize = 5 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`La imagen ${file.name} excede el tamaño máximo de 5MB`);
        return;
      }
    }

    setImagenes(files);
    // Si se suben nuevas imágenes, limpiar las existentes
    if (files.length > 0) {
      setImagenesExistentes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();

      // Agregar campos de texto
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('direccion', formData.direccion);
      formDataToSend.append('provincia', formData.provincia);
      formDataToSend.append('municipio', formData.municipio);
      formDataToSend.append('latitud', formData.latitud);
      formDataToSend.append('longitud', formData.longitud);
      formDataToSend.append('beneficiarioLegal', formData.beneficiarioLegal);
      formDataToSend.append('perteneceSas', formData.perteneceSas);

      // Serializar horario a JSON
      formDataToSend.append('horario', JSON.stringify(horario));

      // Agregar imágenes
      if (imagenes.length > 0) {
        for (const imagen of imagenes) {
          formDataToSend.append('imagenes', imagen);
        }
      }

      if (mercadoExistente) {
        // Actualizar mercado existente
        await mercadoService.actualizar(mercadoExistente.id, formDataToSend);
        toast.success('¡Mercado actualizado exitosamente!');
      } else {
        // Crear nuevo mercado
        await mercadoService.crear(formDataToSend);
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

  const aplicarHorarioATodos = (diaModelo) => {
    const horarioModelo = horario[diaModelo];
    const nuevoHorario = {};

    diasSemana.forEach(dia => {
      nuevoHorario[dia] = { ...horarioModelo };
    });

    setHorario(nuevoHorario);
    toast.success('Horario aplicado a todos los días');
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
          {/* Información Básica */}
          <section className="form-section">
            <h2>Información Básica</h2>

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
              <label>Beneficiario Legal</label>
              <input
                type="text"
                name="beneficiarioLegal"
                value={formData.beneficiarioLegal}
                onChange={handleChange}
                placeholder="Nombre del beneficiario"
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
          </section>

          {/* Imágenes */}
          <section className="form-section">
            <h2>Imágenes del Mercado</h2>
            <p className="section-description">
              Puedes subir hasta 5 imágenes (máximo 5MB por imagen)
            </p>

            {imagenesExistentes.length > 0 && (
              <div className="imagenes-existentes">
                <p><strong>Imágenes actuales:</strong></p>
                <div className="imagenes-grid">
                  {imagenesExistentes.map((img, index) => (
                    <div key={index} className="imagen-preview">
                      <img
                        src={`http://localhost:5000${img}`}
                        alt={`Imagen ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-muted">
                  Si subes nuevas imágenes, reemplazarán las actuales
                </p>
              </div>
            )}

            <div className="form-group">
              <label>Seleccionar imágenes</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagenesChange}
                className="file-input"
              />
              {imagenes.length > 0 && (
                <p className="text-success">
                  ✓ {imagenes.length} imagen{imagenes.length > 1 ? 'es' : ''} seleccionada{imagenes.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </section>

          {/* Ubicación */}
          <section className="form-section">
            <h2>Ubicación</h2>

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
                <select
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una provincia</option>
                  {provincias.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Municipio *</label>
                <select
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  required
                  disabled={!formData.provincia}
                >
                  <option value="">Selecciona un municipio</option>
                  {municipiosDisponibles.map(mun => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mapa */}
            <MapPicker
              latitud={formData.latitud}
              longitud={formData.longitud}
              onChange={handleMapChange}
            />

            {/* Inputs manuales para coordenadas */}
            <div className="form-row">
              <div className="form-group">
                <label>Latitud (manual)</label>
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
                <label>Longitud (manual)</label>
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
          </section>

          {/* Horario */}
          <section className="form-section">
            <h2>Horario de Atención</h2>
            <p className="section-description">
              Configura los horarios de apertura y cierre para cada día de la semana
            </p>

            <div className="horario-container">
              {diasSemana.map((dia) => (
                <div key={dia} className="horario-dia">
                  <div className="dia-header">
                    <label className="dia-nombre">
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </label>
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={horario[dia].cerrado}
                        onChange={(e) => handleHorarioChange(dia, 'cerrado', e.target.checked)}
                      />
                      <span>Cerrado</span>
                    </label>
                  </div>

                  {!horario[dia].cerrado && (
                    <div className="horario-inputs">
                      <div className="time-input-group">
                        <label>Abre</label>
                        <input
                          type="time"
                          value={horario[dia].abre}
                          onChange={(e) => handleHorarioChange(dia, 'abre', e.target.value)}
                        />
                      </div>
                      <span className="separator">-</span>
                      <div className="time-input-group">
                        <label>Cierra</label>
                        <input
                          type="time"
                          value={horario[dia].cierra}
                          onChange={(e) => handleHorarioChange(dia, 'cierra', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => aplicarHorarioATodos(dia)}
                        title="Aplicar este horario a todos los días"
                      >
                        📋 Copiar a todos
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Botones */}
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

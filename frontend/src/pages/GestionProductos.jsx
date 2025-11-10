import React, { useState, useEffect } from 'react';
import { productoService, mercadoService, plantillaService, categoriaService } from '../services/api';
import { useToast } from '../components/Toast';
import './GestionProductos.css';

function GestionProductos() {
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [mercado, setMercado] = useState(null);
  const [plantillas, setPlantillas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [busquedaPlantilla, setBusquedaPlantilla] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    categoriaId: '',
    tipoProducto: '',
    precio: '',
    estado: 'DISPONIBLE'
  });
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [mercadoRes, productosRes, plantillasRes, categoriasRes] = await Promise.all([
        mercadoService.obtenerMiMercado(),
        productoService.obtenerMisProductos(),
        plantillaService.obtenerTodas(),
        categoriaService.obtenerTodas({ activas: 'true' })
      ]);
      setMercado(mercadoRes.data);
      setProductos(productosRes.data);
      setPlantillas(plantillasRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error(error.response?.data?.error || 'No tienes un mercado creado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const abrirFormularioNuevo = () => {
    setProductoEditando(null);
    setPlantillaSeleccionada(null);
    setFormData({
      nombre: '',
      descripcion: '',
      cantidad: '',
      categoriaId: '',
      tipoProducto: '',
      precio: '',
      estado: 'DISPONIBLE'
    });
    setImagenesSeleccionadas([]);
    setImagenesExistentes([]);
    setMostrarFormulario(true);
  };

  const seleccionarPlantilla = (plantilla) => {
    setPlantillaSeleccionada(plantilla);
    setFormData({
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion || '',
      cantidad: '',
      categoriaId: plantilla.categoria?.id || plantilla.categoriaId || '',
      tipoProducto: '',
      precio: '',
      estado: 'DISPONIBLE'
    });
  };

  const abrirFormularioEditar = (producto) => {
    setProductoEditando(producto);
    setPlantillaSeleccionada({ manual: true });
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      cantidad: producto.cantidad || '',
      categoriaId: producto.categoria?.id || producto.categoriaId || '',
      tipoProducto: producto.tipoProducto || '',
      precio: producto.precio || '',
      estado: producto.estado
    });
    setImagenesSeleccionadas([]);
    setImagenesExistentes(producto.imagenes || []);
    setMostrarFormulario(true);
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenesSeleccionadas(files);
  };

  const eliminarImagenSeleccionada = (index) => {
    setImagenesSeleccionadas(imagenesSeleccionadas.filter((_, i) => i !== index));
  };

  const eliminarImagenExistente = (index) => {
    setImagenesExistentes(imagenesExistentes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datos = {
        ...formData,
        mercadoId: mercado.id
      };

      // Si hay imágenes seleccionadas, agregarlas
      if (imagenesSeleccionadas.length > 0) {
        datos.imagenes = imagenesSeleccionadas;
      }

      // Si estamos editando y hay imágenes existentes, mantenerlas
      if (productoEditando && imagenesExistentes.length > 0) {
        datos.imagenes = imagenesExistentes;
        // Si también hay nuevas imágenes, combinarlas
        if (imagenesSeleccionadas.length > 0) {
          datos.imagenes = [...imagenesExistentes, ...imagenesSeleccionadas];
        }
      }

      if (productoEditando) {
        await productoService.actualizar(productoEditando.id, datos);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productoService.crear(datos);
        toast.success('Producto creado exitosamente');
      }

      setMostrarFormulario(false);
      setPlantillaSeleccionada(null);
      setImagenesSeleccionadas([]);
      setImagenesExistentes([]);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    setConfirmarEliminacion(id);
  };

  const confirmarYEliminar = async () => {
    if (!confirmarEliminacion) return;

    try {
      await productoService.eliminar(confirmarEliminacion);
      toast.success('Producto eliminado exitosamente');
      setConfirmarEliminacion(null);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
      setConfirmarEliminacion(null);
    }
  };

  if (loading) {
    return <div className="gestion-container"><div className="loading">Cargando...</div></div>;
  }

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Gestión de Productos</h1>
        {mercado && <p>Mercado: {mercado.nombre}</p>}
        <button onClick={abrirFormularioNuevo} className="btn-primary">
          + Agregar Producto
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content modal-producto" onClick={(e) => e.stopPropagation()}>
            <h2>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            {!productoEditando && !plantillaSeleccionada && (
              <div className="plantillas-section">
                <h3>Selecciona una plantilla base (opcional)</h3>
                
                <div className="busqueda-plantilla">
                  <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o categoría..."
                    value={busquedaPlantilla}
                    onChange={(e) => setBusquedaPlantilla(e.target.value)}
                    className="input-busqueda"
                    autoFocus
                  />
                  {busquedaPlantilla && (
                    <small className="contador-resultados">
                      {plantillas.filter(p => {
                        const nombreCategoria = typeof p.categoria === 'object'
                          ? p.categoria?.nombre || ''
                          : p.categoria || '';
                        return p.nombre.toLowerCase().includes(busquedaPlantilla.toLowerCase()) ||
                          nombreCategoria.toLowerCase().includes(busquedaPlantilla.toLowerCase());
                      }).length} resultados encontrados
                    </small>
                  )}
                </div>

                <div className="plantillas-lista">
                  {plantillas
                    .filter(p => {
                      const nombreCategoria = typeof p.categoria === 'object'
                        ? p.categoria?.nombre || ''
                        : p.categoria || '';
                      return p.nombre.toLowerCase().includes(busquedaPlantilla.toLowerCase()) ||
                        nombreCategoria.toLowerCase().includes(busquedaPlantilla.toLowerCase());
                    })
                    .map((plantilla) => (
                      <div
                        key={plantilla.id}
                        className="plantilla-item"
                        onClick={() => {
                          seleccionarPlantilla(plantilla);
                          setBusquedaPlantilla('');
                        }}
                      >
                        <div className="plantilla-imagen-container">
                          {plantilla.imagen ? (
                            <img
                              src={`http://localhost:5000${plantilla.imagen}`}
                              alt={plantilla.nombre}
                              className="plantilla-imagen-lista"
                            />
                          ) : (
                            <div className="plantilla-sin-imagen-lista">
                              <span>📦</span>
                            </div>
                          )}
                        </div>
                        <div className="plantilla-detalles">
                          <div className="plantilla-nombre-categoria">
                            <strong>{plantilla.nombre}</strong>
                            <small>{typeof plantilla.categoria === 'object' ? plantilla.categoria?.nombre : plantilla.categoria}</small>
                          </div>
                          {plantilla.descripcion && (
                            <p className="plantilla-descripcion-lista">{plantilla.descripcion}</p>
                          )}
                        </div>
                        <div className="plantilla-accion">
                          <span className="icono-seleccionar">→</span>
                        </div>
                      </div>
                    ))}
                </div>

                {plantillas.filter(p => {
                  const nombreCategoria = typeof p.categoria === 'object'
                    ? p.categoria?.nombre || ''
                    : p.categoria || '';
                  return p.nombre.toLowerCase().includes(busquedaPlantilla.toLowerCase()) ||
                    nombreCategoria.toLowerCase().includes(busquedaPlantilla.toLowerCase());
                }).length === 0 && (
                  <p className="no-resultados">
                    No se encontraron plantillas para "{busquedaPlantilla}"
                  </p>
                )}
                
                <button 
                  onClick={() => {
                    setPlantillaSeleccionada({ manual: true });
                    setBusquedaPlantilla('');
                  }}
                  className="btn-manual"
                >
                  ✏️ Crear sin plantilla
                </button>
              </div>
            )}

            {(plantillaSeleccionada || productoEditando) && (
              <form onSubmit={handleSubmit} className="form-producto">
                {/* Preview de plantilla seleccionada */}
                {plantillaSeleccionada && !productoEditando && plantillaSeleccionada.id && (
                  <div className="plantilla-preview-seleccionada">
                    <div className="plantilla-preview-header">
                      <h4>📋 Plantilla seleccionada</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setPlantillaSeleccionada(null);
                          setFormData({
                            nombre: '',
                            descripcion: '',
                            cantidad: '',
                            categoriaId: '',
                            tipoProducto: '',
                            precio: '',
                            estado: 'DISPONIBLE'
                          });
                        }}
                        className="btn-cambiar-plantilla"
                      >
                        Cambiar plantilla
                      </button>
                    </div>
                    <div className="plantilla-preview-content">
                      {plantillaSeleccionada.imagen && (
                        <img 
                          src={`http://localhost:5000${plantillaSeleccionada.imagen}`} 
                          alt={plantillaSeleccionada.nombre}
                          className="plantilla-preview-imagen"
                        />
                      )}
                      <div className="plantilla-preview-info">
                        <strong>{plantillaSeleccionada.nombre}</strong>
                        <span className="categoria-badge">{plantillaSeleccionada.categoria?.nombre || plantillaSeleccionada.categoria}</span>
                        {plantillaSeleccionada.descripcion && (
                          <p className="plantilla-descripcion">{plantillaSeleccionada.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select
                      name="categoriaId"
                      value={formData.categoriaId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tipo</label>
                    <input
                      type="text"
                      name="tipoProducto"
                      value={formData.tipoProducto}
                      onChange={handleChange}
                      placeholder="Ej: Orgánico"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cantidad</label>
                    <input
                      type="text"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleChange}
                      placeholder="Ej: 10 kg"
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="NO_DISPONIBLE">No disponible</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Imágenes del producto</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenesChange}
                    className="input-imagenes"
                  />
                  <small className="form-help">Puedes seleccionar múltiples imágenes (máximo 10)</small>
                  
                  {/* Preview de imágenes seleccionadas */}
                  {imagenesSeleccionadas.length > 0 && (
                    <div className="imagenes-preview">
                      <h4>Nuevas imágenes:</h4>
                      <div className="imagenes-grid">
                        {imagenesSeleccionadas.map((file, index) => (
                          <div key={index} className="imagen-preview-item">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index + 1}`}
                              className="imagen-preview"
                            />
                            <button
                              type="button"
                              onClick={() => eliminarImagenSeleccionada(index)}
                              className="btn-eliminar-imagen"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Imágenes existentes (solo al editar) */}
                  {productoEditando && imagenesExistentes.length > 0 && (
                    <div className="imagenes-preview">
                      <h4>Imágenes actuales:</h4>
                      <div className="imagenes-grid">
                        {imagenesExistentes.map((url, index) => (
                          <div key={index} className="imagen-preview-item">
                            <img 
                              src={`http://localhost:5000${url}`} 
                              alt={`Imagen ${index + 1}`}
                              className="imagen-preview"
                            />
                            <button
                              type="button"
                              onClick={() => eliminarImagenExistente(index)}
                              className="btn-eliminar-imagen"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="button-group">
                  <button type="submit" className="btn-primary">
                    {productoEditando ? 'Actualizar' : 'Crear'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setPlantillaSeleccionada(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="productos-lista">
        {productos.length === 0 ? (
          <div className="no-results">No tienes productos aún</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td><strong>{producto.nombre}</strong></td>
                    <td>{producto.categoria?.nombre || producto.categoria}</td>
                    <td>{producto.precio ? `$${producto.precio.toFixed(2)}` : '-'}</td>
                    <td>
                      <span className={`badge ${producto.estado.toLowerCase()}`}>
                        {producto.estado}
                      </span>
                    </td>
                    <td>{new Date(producto.fechaActualizacion).toLocaleDateString()}</td>
                    <td>
                      <div className="acciones">
                        <button 
                          onClick={() => abrirFormularioEditar(producto)}
                          className="btn-editar"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleEliminar(producto.id)}
                          className="btn-eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {confirmarEliminacion && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminacion(null)}>
          <div className="modal-content modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Confirmar Eliminación</h2>
            <p>¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button 
                onClick={confirmarYEliminar}
                className="btn-danger"
              >
                Sí, eliminar
              </button>
              <button 
                onClick={() => setConfirmarEliminacion(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionProductos;
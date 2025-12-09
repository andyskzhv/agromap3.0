import React, { useState, useEffect } from 'react';
import { productoService, mercadoService, plantillaService, categoriaService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './GestionProductos.css';

function GestionProductos() {
  usePageTitle('Gestión de Productos');
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

  // Estados para filtrado y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [ordenamiento, setOrdenamiento] = useState('RECIENTES');
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 10;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    unidadMedida: 'KG',
    categoriaId: '',
    tipoProducto: '',
    precio: '',
    unidadPrecio: 'LB',
    estado: 'DISPONIBLE',
    calidad: ''
  });
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesPreviewUrls, setImagenesPreviewUrls] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Crear URLs de preview para las nuevas imágenes
  useEffect(() => {
    if (imagenesSeleccionadas.length === 0) {
      setImagenesPreviewUrls([]);
      return;
    }

    // Crear nuevas URLs solo si hay imágenes
    const nuevasUrls = imagenesSeleccionadas.map(file => URL.createObjectURL(file));
    setImagenesPreviewUrls(nuevasUrls);

    // Cleanup: revocar URLs cuando el componente se desmonte o las imágenes cambien
    return () => {
      nuevasUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignorar errores si la URL ya fue revocada
        }
      });
    };
  }, [imagenesSeleccionadas]);

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
      unidadMedida: 'UNIDAD',
      categoriaId: '',
      tipoProducto: '',
      precio: '',
      unidadPrecio: 'UNIDAD',
      estado: 'DISPONIBLE',
      calidad: ''
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
      unidadMedida: 'UNIDAD',
      categoriaId: plantilla.categoria?.id || plantilla.categoriaId || '',
      tipoProducto: '',
      precio: '',
      unidadPrecio: 'UNIDAD',
      estado: 'DISPONIBLE',
      calidad: ''
    });
  };

  const abrirFormularioEditar = (producto) => {
    setProductoEditando(producto);
    setPlantillaSeleccionada({ manual: true });
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      cantidad: producto.cantidad || '',
      unidadMedida: producto.unidadMedida || 'UNIDAD',
      categoriaId: producto.categoria?.id || producto.categoriaId || '',
      tipoProducto: producto.tipoProducto || '',
      precio: producto.precio || '',
      unidadPrecio: producto.unidadPrecio || 'UNIDAD',
      estado: producto.estado,
      calidad: producto.calidad || ''
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

      // Si se seleccionó una plantilla, agregar el plantillaId
      if (plantillaSeleccionada && plantillaSeleccionada.id) {
        datos.plantillaId = plantillaSeleccionada.id;
      }

      // Si hay imágenes seleccionadas, agregarlas
      if (imagenesSeleccionadas.length > 0) {
        datos.imagenes = imagenesSeleccionadas;
      }

      // Si estamos editando y hay imágenes existentes, mantenerlas
      if (productoEditando) {
        if (imagenesExistentes.length > 0) {
          datos.imagenes = imagenesExistentes;
          // Si también hay nuevas imágenes, combinarlas
          if (imagenesSeleccionadas.length > 0) {
            datos.imagenes = [...imagenesExistentes, ...imagenesSeleccionadas];
          }
        } else if (imagenesSeleccionadas.length > 0) {
          datos.imagenes = imagenesSeleccionadas;
        }
      }

      if (productoEditando) {
        await productoService.actualizar(productoEditando.id, datos);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productoService.crear(datos);
        toast.success('Producto creado exitosamente');
      }

      // Limpiar las URLs de preview antes de cerrar el formulario
      imagenesPreviewUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignorar errores
        }
      });
      setImagenesPreviewUrls([]);
      setImagenesSeleccionadas([]);
      setImagenesExistentes([]);
      setMostrarFormulario(false);
      setPlantillaSeleccionada(null);
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

  // Cambiar estado del producto (switch rápido)
  const cambiarEstadoProducto = async (producto) => {
    const nuevoEstado = producto.estado === 'DISPONIBLE' ? 'NO_DISPONIBLE' : 'DISPONIBLE';

    try {
      setCambiandoEstado(producto.id);

      // Actualizar solo el estado
      await productoService.actualizar(producto.id, {
        ...producto,
        estado: nuevoEstado,
        categoriaId: producto.categoria?.id || producto.categoriaId,
        mercadoId: producto.mercado?.id || producto.mercadoId
      });

      // Actualizar localmente
      setProductos(productos.map(p =>
        p.id === producto.id ? { ...p, estado: nuevoEstado } : p
      ));

      const mensaje = nuevoEstado === 'DISPONIBLE'
        ? '✅ Producto marcado como disponible. Se enviaron notificaciones a los suscriptores.'
        : '⚠️ Producto marcado como no disponible';

      toast.success(mensaje);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error(error.response?.data?.error || 'Error al cambiar estado');
    } finally {
      setCambiandoEstado(null);
    }
  };

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter(producto => {
      // Filtro por búsqueda
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (producto.categoria?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por estado
      const coincideEstado = filtroEstado === 'TODOS' || producto.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case 'RECIENTES':
          return new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion);
        case 'ANTIGUOS':
          return new Date(a.fechaActualizacion) - new Date(b.fechaActualizacion);
        case 'ALFABETICO':
          return a.nombre.localeCompare(b.nombre);
        case 'ALFABETICO_DESC':
          return b.nombre.localeCompare(a.nombre);
        default:
          return 0;
      }
    });

  // Calcular paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, ordenamiento]);

  // Funciones de paginación
  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    // Scroll suave al inicio de la tabla
    document.querySelector('.productos-lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      irAPagina(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      irAPagina(paginaActual + 1);
    }
  };

  // Generar números de página visibles
  const obtenerNumerosPaginas = () => {
    const numeros = [];
    const maxVisible = 5;

    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        numeros.push(1);
        numeros.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) numeros.push(i);
      } else {
        numeros.push(1);
        numeros.push('...');
        numeros.push(paginaActual - 1);
        numeros.push(paginaActual);
        numeros.push(paginaActual + 1);
        numeros.push('...');
        numeros.push(totalPaginas);
      }
    }

    return numeros;
  };

  if (loading) {
    return <div className="gestion-container"><div className="loading">Cargando...</div></div>;
  }

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <div className="header-top">
          <div className="header-info">
            <h1>Gestión de Productos</h1>
            {mercado && <p className="mercado-nombre">📍 {mercado.nombre}</p>}
          </div>
          <button onClick={abrirFormularioNuevo} className="btn-primary">
            + Agregar Producto
          </button>
        </div>

        {/* Barra de filtros y búsqueda */}
        <div className="filtros-container">
          <div className="busqueda-box">
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda-productos"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="btn-limpiar-busqueda"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filtros-box">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="select-filtro"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="DISPONIBLE">✓ Disponibles</option>
              <option value="NO_DISPONIBLE">✕ No disponibles</option>
            </select>

            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="select-filtro"
            >
              <option value="RECIENTES">Más recientes</option>
              <option value="ANTIGUOS">Más antiguos</option>
              <option value="ALFABETICO">A → Z</option>
              <option value="ALFABETICO_DESC">Z → A</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        {productosFiltrados.length > 0 && (
          <div className="resultados-info">
            {(busqueda || filtroEstado !== 'TODOS') ? (
              <>Mostrando {productosFiltrados.length} de {productos.length} productos</>
            ) : (
              <>Total: {productos.length} productos</>
            )}
            {totalPaginas > 1 && (
              <> • Página {paginaActual} de {totalPaginas}</>
            )}
          </div>
        )}
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
                      type="number"
                      step="0.01"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleChange}
                      placeholder="Ej: 10"
                    />
                  </div>

                  <div className="form-group">
                    <label>Unidad de Medida</label>
                    <select
                      name="unidadMedida"
                      value={formData.unidadMedida}
                      onChange={handleChange}
                    >
                      <option value="KG">Kilogramo (kg)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio (CUP)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio por</label>
                    <select
                      name="unidadPrecio"
                      value={formData.unidadPrecio}
                      onChange={handleChange}
                    >
                      <option value="LB">Libra (lb)</option>
                      <option value="UNIDAD">Unidad</option>
                    </select>
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
                  <label>Calidad (Opcional)</label>
                  <select name="calidad" value={formData.calidad} onChange={handleChange}>
                    <option value="">Sin calidad especificada</option>
                    <option value="1">🥇 Calidad 1</option>
                    <option value="2">🥈 Calidad 2</option>
                    <option value="3">🥉 Calidad 3</option>
                  </select>
                  <small className="form-help">
                    Indica la calidad del producto según tu clasificación
                  </small>
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
                  <small className="form-help">
                    {productoEditando
                      ? 'Puedes seleccionar múltiples imágenes (máximo 10)'
                      : plantillaSeleccionada && plantillaSeleccionada.id
                      ? 'Opcional. Si no subes imágenes, se usará la imagen de la plantilla seleccionada (máximo 10)'
                      : 'Opcional. Puedes seleccionar múltiples imágenes (máximo 10)'}
                  </small>
                  
                  {/* Preview de imágenes seleccionadas */}
                  {imagenesSeleccionadas.length > 0 && (
                    <div className="imagenes-preview">
                      <h4>Nuevas imágenes:</h4>
                      <div className="imagenes-grid">
                        {imagenesPreviewUrls.map((url, index) => (
                          <div key={index} className="imagen-preview-item">
                            <img
                              src={url}
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
          <div className="no-results">
            <p>📦 No tienes productos aún</p>
            <button onClick={abrirFormularioNuevo} className="btn-primary">
              Agregar tu primer producto
            </button>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="no-results">
            <p>🔍 No se encontraron productos</p>
            <p className="no-results-subtitle">Intenta cambiar los filtros o la búsqueda</p>
            <button
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('TODOS');
              }}
              className="btn-secondary"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Disponibilidad</th>
                  <th>Actualizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosPaginados.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <div className="producto-nombre-col">
                        {producto.imagenes && producto.imagenes.length > 0 ? (
                          <img
                            src={`http://localhost:5000${producto.imagenes[0]}`}
                            alt={producto.nombre}
                            className="producto-miniatura"
                          />
                        ) : producto.plantilla?.imagen ? (
                          <img
                            src={`http://localhost:5000${producto.plantilla.imagen}`}
                            alt={producto.nombre}
                            className="producto-miniatura"
                          />
                        ) : (
                          <div className="producto-miniatura-placeholder">📦</div>
                        )}
                        <div className="producto-info">
                          <strong>{producto.nombre}</strong>
                          {producto.tipoProducto && (
                            <small className="tipo-badge">{producto.tipoProducto}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{producto.categoria?.nombre || producto.categoria}</td>
                    <td>
                      {producto.precio ? (
                        <span className="precio-valor">
                          ${producto.precio.toFixed(2)}
                          {producto.unidadPrecio && producto.unidadPrecio !== 'UNIDAD' && (
                            <small>/{producto.unidadPrecio.toLowerCase()}</small>
                          )}
                        </span>
                      ) : (
                        <span className="precio-no-disponible">-</span>
                      )}
                    </td>
                    <td>
                      <div className="disponibilidad-toggle">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={producto.estado === 'DISPONIBLE'}
                            onChange={() => cambiarEstadoProducto(producto)}
                            disabled={cambiandoEstado === producto.id}
                          />
                          <span className="slider"></span>
                        </label>
                        <span className={`estado-texto ${producto.estado.toLowerCase()}`}>
                          {cambiandoEstado === producto.id ? (
                            '⏳'
                          ) : producto.estado === 'DISPONIBLE' ? (
                            '✓ Disponible'
                          ) : (
                            '✕ No disponible'
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="fecha-texto">
                        {new Date(producto.fechaActualizacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button
                          onClick={() => abrirFormularioEditar(producto)}
                          className="btn-editar"
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleEliminar(producto.id)}
                          className="btn-eliminar"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Controles de paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion-container">
                <button
                  onClick={paginaAnterior}
                  disabled={paginaActual === 1}
                  className="btn-paginacion"
                  title="Página anterior"
                >
                  ← Anterior
                </button>

                <div className="numeros-pagina">
                  {obtenerNumerosPaginas().map((numero, index) => (
                    numero === '...' ? (
                      <span key={`dots-${index}`} className="dots-paginacion">...</span>
                    ) : (
                      <button
                        key={numero}
                        onClick={() => irAPagina(numero)}
                        className={`btn-numero-pagina ${paginaActual === numero ? 'activo' : ''}`}
                      >
                        {numero}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                  className="btn-paginacion"
                  title="Página siguiente"
                >
                  Siguiente →
                </button>
              </div>
            )}
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
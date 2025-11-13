import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, mercadoService, productoService, comentarioService, plantillaService, categoriaService } from '../services/api';
import { useToast } from '../components/Toast';
import { usePageTitle } from '../hooks/usePageTitle';
import './DashboardAdmin.css';

function DashboardAdmin() {
  usePageTitle('Panel de Administración');
  const navigate = useNavigate();
  const toast = useToast();
  const [vista, setVista] = useState('estadisticas');
  const [estadisticas, setEstadisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [mercados, setMercados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalPlantilla, setMostrarModalPlantilla] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    nombreUsuario: '',
    contrasena: '',
    rol: 'USUARIO',
    provincia: ''
  });
  const [imagenUsuario, setImagenUsuario] = useState(null);
  const [provincias, setProvincias] = useState([]);
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    categoriaId: '',
    tipoProducto: '',
    precio: '',
    estado: 'DISPONIBLE',
    mercadoId: ''
  });
  const [formPlantilla, setFormPlantilla] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: ''
  });
  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    descripcion: '',
    activa: true
  });
  const [imagenPlantilla, setImagenPlantilla] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.rol !== 'ADMIN') {
      toast.error('No tienes permisos de administrador');
      navigate('/perfil');
      return;
    }
    cargarEstadisticas();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cargarDatosVista();
  }, [vista]);

  const cargarEstadisticas = async () => {
    try {
      const [statsRes, actividadRes, provinciasRes] = await Promise.all([
        adminService.obtenerEstadisticas(),
        adminService.obtenerActividad(),
        mercadoService.obtenerProvincias()
      ]);
      setEstadisticas(statsRes.data);
      setActividad(actividadRes.data);
      setProvincias(provinciasRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosVista = async () => {
    try {
      if (vista === 'usuarios') {
        const res = await adminService.obtenerUsuarios();
        setUsuarios(res.data);
      } else if (vista === 'mercados') {
        const res = await adminService.obtenerMercados();
        setMercados(res.data);
      } else if (vista === 'productos') {
        const res = await adminService.obtenerProductos();
        setProductos(res.data);
      } else if (vista === 'comentarios') {
        const res = await adminService.obtenerComentarios();
        setComentarios(res.data);
      } else if (vista === 'plantillas') {
        const res = await plantillaService.obtenerTodas();
        setPlantillas(res.data);
      } else if (vista === 'categorias') {
        const res = await categoriaService.obtenerTodas();
        setCategorias(res.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  // Cargar categorías cuando se necesiten para los formularios
  useEffect(() => {
    if (mostrarModalProducto || mostrarModalPlantilla) {
      categoriaService.obtenerTodas({ activas: 'true' }).then(res => {
        setCategorias(res.data);
      }).catch(err => console.error('Error al cargar categorías:', err));
    }
  }, [mostrarModalProducto, mostrarModalPlantilla]);

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    try {
      await adminService.cambiarRol(usuarioId, nuevoRol);
      toast.success('Rol actualizado exitosamente');
      cargarDatosVista();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar rol');
    }
  };

  const handleEliminarUsuario = async (id) => {
    setConfirmarEliminacion({ tipo: 'usuario', id, mensaje: '¿Eliminar este usuario? Se eliminarán todos sus datos.' });
  };

  const handleEliminarMercado = async (id) => {
    setConfirmarEliminacion({ tipo: 'mercado', id, mensaje: '¿Eliminar este mercado?' });
  };

  const handleEliminarProducto = async (id) => {
    setConfirmarEliminacion({ tipo: 'producto', id, mensaje: '¿Eliminar este producto?' });
  };

  const handleEliminarComentario = async (id) => {
    setConfirmarEliminacion({ tipo: 'comentario', id, mensaje: '¿Eliminar este comentario?' });
  };

  const confirmarYEliminar = async () => {
    if (!confirmarEliminacion) return;

    try {
      const { tipo, id } = confirmarEliminacion;
      
      switch (tipo) {
        case 'usuario':
          await adminService.eliminarUsuario(id);
          toast.success('Usuario eliminado');
          break;
        case 'mercado':
          await mercadoService.eliminar(id);
          toast.success('Mercado eliminado');
          break;
        case 'producto':
          await productoService.eliminar(id);
          toast.success('Producto eliminado');
          break;
        case 'comentario':
          await comentarioService.eliminar(id);
          toast.success('Comentario eliminado');
          break;
        case 'plantilla':
          await plantillaService.eliminar(id);
          toast.success('Plantilla eliminada');
          break;
        case 'categoria':
          await categoriaService.eliminar(id);
          toast.success('Categoría eliminada');
          break;
        default:
          break;
      }
      
      setConfirmarEliminacion(null);
      cargarDatosVista();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
      setConfirmarEliminacion(null);
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', formUsuario.nombre);
      formData.append('nombreUsuario', formUsuario.nombreUsuario);
      formData.append('contrasena', formUsuario.contrasena);
      formData.append('rol', formUsuario.rol);
      if (formUsuario.provincia) {
        formData.append('provincia', formUsuario.provincia);
      }
      if (imagenUsuario) {
        formData.append('imagen', imagenUsuario);
      }

      await adminService.crearUsuario(formData);
      toast.success('Usuario creado exitosamente');
      setMostrarModalUsuario(false);
      setFormUsuario({ nombre: '', nombreUsuario: '', contrasena: '', rol: 'USUARIO', provincia: '' });
      setImagenUsuario(null);
      cargarDatosVista();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    try {
      await productoService.crear(formProducto);
      toast.success('Producto creado exitosamente');
      setMostrarModalProducto(false);
      setFormProducto({
        nombre: '',
        descripcion: '',
        cantidad: '',
        categoriaId: '',
        tipoProducto: '',
        precio: '',
        estado: 'DISPONIBLE',
        mercadoId: ''
      });
      cargarDatosVista();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear producto');
    }
  };

  const abrirModalPlantilla = (plantilla = null) => {
    if (plantilla) {
      setPlantillaEditando(plantilla);
      setFormPlantilla({
        nombre: plantilla.nombre,
        descripcion: plantilla.descripcion || '',
        categoriaId: plantilla.categoria?.id || plantilla.categoriaId || ''
      });
    } else {
      setPlantillaEditando(null);
      setFormPlantilla({
        nombre: '',
        descripcion: '',
        categoriaId: ''
      });
      setImagenPlantilla(null);
    }
    setMostrarModalPlantilla(true);
  };

  const handleCrearOActualizarPlantilla = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', formPlantilla.nombre);
      formData.append('descripcion', formPlantilla.descripcion);
      formData.append('categoriaId', formPlantilla.categoriaId);
      if (imagenPlantilla) {
        formData.append('imagen', imagenPlantilla);
      }

      if (plantillaEditando) {
        await plantillaService.actualizar(plantillaEditando.id, formData);
        toast.success('Plantilla actualizada exitosamente');
      } else {
        await plantillaService.crear(formData);
        toast.success('Plantilla creada exitosamente');
      }

      setMostrarModalPlantilla(false);
      setPlantillaEditando(null);
      setFormPlantilla({ nombre: '', descripcion: '', categoriaId: '' });
      setImagenPlantilla(null);
      cargarDatosVista();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar plantilla');
    }
  };

  const handleEliminarPlantilla = async (id) => {
    setConfirmarEliminacion({ tipo: 'plantilla', id, mensaje: '¿Eliminar esta plantilla?' });
  };

  const abrirModalCategoria = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormCategoria({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        activa: categoria.activa
      });
    } else {
      setCategoriaEditando(null);
      setFormCategoria({
        nombre: '',
        descripcion: '',
        activa: true
      });
    }
    setMostrarModalCategoria(true);
  };

  const handleCrearOActualizarCategoria = async (e) => {
    e.preventDefault();
    try {
      if (categoriaEditando) {
        await categoriaService.actualizar(categoriaEditando.id, formCategoria);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await categoriaService.crear(formCategoria);
        toast.success('Categoría creada exitosamente');
      }

      setMostrarModalCategoria(false);
      setCategoriaEditando(null);
      setFormCategoria({ nombre: '', descripcion: '', activa: true });
      cargarDatosVista();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar categoría');
    }
  };

  const handleEliminarCategoria = async (id) => {
    setConfirmarEliminacion({ tipo: 'categoria', id, mensaje: '¿Eliminar esta categoría? Solo se puede eliminar si no tiene productos o plantillas asociadas.' });
  };

  if (loading) {
    return <div className="admin-container"><div className="loading">Cargando...</div></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛡️ Panel de Administración</h1>
        <button onClick={() => navigate('/perfil')} className="btn-secondary">
          Volver al perfil
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={vista === 'estadisticas' ? 'tab active' : 'tab'}
          onClick={() => setVista('estadisticas')}
        >
          📊 Estadísticas
        </button>
        <button 
          className={vista === 'usuarios' ? 'tab active' : 'tab'}
          onClick={() => setVista('usuarios')}
        >
          👥 Usuarios
        </button>
        <button 
          className={vista === 'mercados' ? 'tab active' : 'tab'}
          onClick={() => setVista('mercados')}
        >
          🏪 Mercados
        </button>
        <button 
          className={vista === 'productos' ? 'tab active' : 'tab'}
          onClick={() => setVista('productos')}
        >
          📦 Productos
        </button>
        <button 
          className={vista === 'plantillas' ? 'tab active' : 'tab'}
          onClick={() => setVista('plantillas')}
        >
          📋 Plantillas
        </button>
        <button 
          className={vista === 'categorias' ? 'tab active' : 'tab'}
          onClick={() => setVista('categorias')}
        >
          🏷️ Categorías
        </button>
        <button 
          className={vista === 'comentarios' ? 'tab active' : 'tab'}
          onClick={() => setVista('comentarios')}
        >
          💬 Comentarios
        </button>
      </div>

      <div className="admin-content">
        {vista === 'estadisticas' && estadisticas && (
          <div className="estadisticas-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{estadisticas.usuarios.total}</h3>
                <p>Usuarios totales</p>
                <div className="stat-detail">
                  <span>Admin: {estadisticas.usuarios.porRol.ADMIN || 0}</span>
                  <span>Gestores: {estadisticas.usuarios.porRol.GESTOR || 0}</span>
                  <span>Usuarios: {estadisticas.usuarios.porRol.USUARIO || 0}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-info">
                <h3>{estadisticas.mercados.total}</h3>
                <p>Mercados registrados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{estadisticas.productos.total}</h3>
                <p>Productos totales</p>
                <div className="stat-detail">
                  <span>Disponibles: {estadisticas.productos.disponibles}</span>
                  <span>No disponibles: {estadisticas.productos.noDisponibles}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <h3>{estadisticas.comentarios.total}</h3>
                <p>Comentarios publicados</p>
              </div>
            </div>

            {actividad && (
              <>
                <div className="actividad-section">
                  <h3>Mercados recientes</h3>
                  <ul>
                    {actividad.mercadosRecientes.map(m => (
                      <li key={m.id}>{m.nombre} - {m.gestor.nombre}</li>
                    ))}
                  </ul>
                </div>

                <div className="actividad-section">
                  <h3>Productos recientes</h3>
                  <ul>
                    {actividad.productosRecientes.map(p => (
                      <li key={p.id}>{p.nombre} - {p.mercado.nombre}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {vista === 'usuarios' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => setMostrarModalUsuario(true)}
                className="btn-crear"
              >
                + Crear Usuario
              </button>
            </div>
            <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Provincia</th>
                  <th>Mercados</th>
                  <th>Comentarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.nombreUsuario}</td>
                    <td>
                      <select 
                        value={u.rol} 
                        onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                        className="rol-select"
                      >
                        <option value="USUARIO">Usuario</option>
                        <option value="GESTOR">Gestor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>{u.provincia || '-'}</td>
                    <td>{u._count.mercados}</td>
                    <td>{u._count.comentarios}</td>
                    <td>
                      <button 
                        onClick={() => handleEliminarUsuario(u.id)}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {vista === 'mercados' && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Gestor</th>
                  <th>Provincia</th>
                  <th>Municipio</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mercados.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.nombre}</td>
                    <td>{m.gestor.nombre}</td>
                    <td>{m.provincia}</td>
                    <td>{m.municipio}</td>
                    <td>{m._count.productos}</td>
                    <td>
                      <button 
                        onClick={() => handleEliminarMercado(m.id)}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vista === 'productos' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => setMostrarModalProducto(true)}
                className="btn-crear"
              >
                + Crear Producto
              </button>
            </div>
            <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Mercado</th>
                  <th>Gestor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria?.nombre || 'Sin categoría'}</td>
                    <td>{p.precio ? `$${p.precio.toFixed(2)}` : '-'}</td>
                    <td>
                      <span className={`badge ${p.estado.toLowerCase()}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td>{p.mercado.nombre}</td>
                    <td>{p.mercado.gestor.nombre}</td>
                    <td>
                      <button 
                        onClick={() => handleEliminarProducto(p.id)}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {vista === 'plantillas' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => abrirModalPlantilla()}
                className="btn-crear"
              >
                + Crear Plantilla
              </button>
            </div>
            <div className="plantillas-admin-grid">
              {plantillas.map((plantilla) => (
                <div key={plantilla.id} className="plantilla-admin-card">
                  {plantilla.imagen && (
                    <img 
                      src={`http://localhost:5000${plantilla.imagen}`} 
                      alt={plantilla.nombre}
                      className="plantilla-admin-imagen"
                    />
                  )}
                  <div className="plantilla-admin-info">
                    <h4>{plantilla.nombre}</h4>
                    <p className="categoria-badge">{plantilla.categoria?.nombre || 'Sin categoría'}</p>
                    <p className="descripcion-corta">{plantilla.descripcion}</p>
                  </div>
                  <div className="plantilla-admin-acciones">
                    <button 
                      onClick={() => abrirModalPlantilla(plantilla)}
                      className="btn-editar"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleEliminarPlantilla(plantilla.id)}
                      className="btn-delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {vista === 'categorias' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => abrirModalCategoria()}
                className="btn-crear"
              >
                + Crear Categoría
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Productos</th>
                    <th>Plantillas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td><strong>{cat.nombre}</strong></td>
                      <td className="text-truncate">{cat.descripcion || '-'}</td>
                      <td>
                        <span className={`badge ${cat.activa ? 'disponible' : 'no-disponible'}`}>
                          {cat.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>{cat._count?.productos || 0}</td>
                      <td>{cat._count?.plantillas || 0}</td>
                      <td>
                        <button 
                          onClick={() => abrirModalCategoria(cat)}
                          className="btn-editar"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleEliminarCategoria(cat.id)}
                          className="btn-delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {vista === 'comentarios' && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Producto</th>
                  <th>Texto</th>
                  <th>Recomienda</th>
                  <th>Likes</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comentarios.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.usuario.nombre}</td>
                    <td>{c.producto.nombre}</td>
                    <td className="text-truncate">{c.texto}</td>
                    <td>{c.recomienda ? '✓' : '✗'}</td>
                    <td>{c.likes}</td>
                    <td>{new Date(c.creadoEn).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleEliminarComentario(c.id)}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Usuario */}
      {mostrarModalUsuario && (
        <div className="modal-overlay" onClick={() => setMostrarModalUsuario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nuevo Usuario</h2>
            <form onSubmit={handleCrearUsuario} className="form-admin">
              <div className="form-group">
                <label>Foto de perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenUsuario(e.target.files[0])}
                />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formUsuario.nombre}
                  onChange={(e) => setFormUsuario({...formUsuario, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre de usuario *</label>
                <input
                  type="text"
                  value={formUsuario.nombreUsuario}
                  onChange={(e) => setFormUsuario({...formUsuario, nombreUsuario: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={formUsuario.contrasena}
                  onChange={(e) => setFormUsuario({...formUsuario, contrasena: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={formUsuario.rol}
                  onChange={(e) => setFormUsuario({...formUsuario, rol: e.target.value})}
                  required
                >
                  <option value="USUARIO">Usuario</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Provincia</label>
                <select
                  value={formUsuario.provincia}
                  onChange={(e) => setFormUsuario({...formUsuario, provincia: e.target.value})}
                >
                  <option value="">Selecciona una provincia</option>
                  {provincias.map((provincia) => (
                    <option key={provincia} value={provincia}>
                      {provincia}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Crear</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setMostrarModalUsuario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Producto */}
      {mostrarModalProducto && (
        <div className="modal-overlay" onClick={() => setMostrarModalProducto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nuevo Producto</h2>
            <form onSubmit={handleCrearProducto} className="form-admin">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formProducto.descripcion}
                  onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Mercado *</label>
                <select
                  value={formProducto.mercadoId}
                  onChange={(e) => setFormProducto({...formProducto, mercadoId: e.target.value})}
                  required
                >
                  <option value="">Selecciona un mercado</option>
                  {mercados.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={formProducto.categoriaId}
                    onChange={(e) => setFormProducto({...formProducto, categoriaId: e.target.value})}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <input
                    type="text"
                    value={formProducto.tipoProducto}
                    onChange={(e) => setFormProducto({...formProducto, tipoProducto: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="text"
                    value={formProducto.cantidad}
                    onChange={(e) => setFormProducto({...formProducto, cantidad: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProducto.precio}
                    onChange={(e) => setFormProducto({...formProducto, precio: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Estado *</label>
                <select
                  value={formProducto.estado}
                  onChange={(e) => setFormProducto({...formProducto, estado: e.target.value})}
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="NO_DISPONIBLE">No disponible</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Crear</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setMostrarModalProducto(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Plantilla */}
      {mostrarModalPlantilla && (
        <div className="modal-overlay" onClick={() => setMostrarModalPlantilla(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{plantillaEditando ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}</h2>
            <form onSubmit={handleCrearOActualizarPlantilla} className="form-admin">
              <div className="form-group">
                <label>Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenPlantilla(e.target.files[0])}
                />
                {plantillaEditando?.imagen && !imagenPlantilla && (
                  <img 
                    src={`http://localhost:5000${plantillaEditando.imagen}`}
                    alt="Preview"
                    style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formPlantilla.nombre}
                  onChange={(e) => setFormPlantilla({...formPlantilla, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formPlantilla.descripcion}
                  onChange={(e) => setFormPlantilla({...formPlantilla, descripcion: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  value={formPlantilla.categoriaId}
                  onChange={(e) => setFormPlantilla({...formPlantilla, categoriaId: e.target.value})}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  {plantillaEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setMostrarModalPlantilla(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Categoría */}
      {mostrarModalCategoria && (
        <div className="modal-overlay" onClick={() => setMostrarModalCategoria(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{categoriaEditando ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h2>
            <form onSubmit={handleCrearOActualizarCategoria} className="form-admin">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria({...formCategoria, nombre: e.target.value})}
                  required
                  placeholder="Ej: Frutas, Verduras, Carnes"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formCategoria.descripcion}
                  onChange={(e) => setFormCategoria({...formCategoria, descripcion: e.target.value})}
                  rows="3"
                  placeholder="Descripción opcional de la categoría"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formCategoria.activa}
                    onChange={(e) => setFormCategoria({...formCategoria, activa: e.target.checked})}
                  />
                  <span style={{ marginLeft: '8px' }}>Categoría activa</span>
                </label>
                <small className="form-help">Las categorías inactivas no aparecerán en los selectores</small>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  {categoriaEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setMostrarModalCategoria(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {confirmarEliminacion && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminacion(null)}>
          <div className="modal-content modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Confirmar Eliminación</h2>
            <p>{confirmarEliminacion.mensaje}</p>
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

export default DashboardAdmin;
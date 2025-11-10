import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  registro: (datos) => {
    // Si es FormData, usar configuración especial
    if (datos instanceof FormData) {
      return api.post('/auth/registro', datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/auth/registro', datos);
  },
  login: (datos) => api.post('/auth/login', datos),
  obtenerPerfil: () => api.get('/auth/perfil'),
  actualizarPerfil: (datos) => {
    if (datos instanceof FormData) {
      return api.put('/auth/perfil', datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put('/auth/perfil', datos);
  }
};

// Servicios de mercados
export const mercadoService = {
  obtenerTodos: (params) => api.get('/mercados', { params }),
  obtenerPorId: (id) => api.get(`/mercados/${id}`),
  obtenerMiMercado: () => api.get('/mercados/mi/mercado'),
  crear: (datos) => {
    // Si datos es FormData, enviarlo directamente
    // Si no, enviarlo como JSON
    if (datos instanceof FormData) {
      return api.post('/mercados', datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/mercados', datos);
  },
  actualizar: (id, datos) => {
    // Si datos es FormData, enviarlo directamente
    // Si no, enviarlo como JSON
    if (datos instanceof FormData) {
      return api.put(`/mercados/${id}`, datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put(`/mercados/${id}`, datos);
  },
  eliminar: (id) => api.delete(`/mercados/${id}`)
};

// Servicios de productos
export const productoService = {
  obtenerTodos: (params) => api.get('/productos', { params }),
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  obtenerMisProductos: () => api.get('/productos/mis/productos'),
  crear: (datos) => {
    // Verificar si hay archivos (File objects) en el array de imágenes
    const tieneArchivos = datos.imagenes && Array.isArray(datos.imagenes) && 
      datos.imagenes.some(item => item instanceof File);
    
    // Si hay archivos, usar FormData
    if (tieneArchivos) {
      const formData = new FormData();
      const imagenesArchivos = [];
      
      // Separar solo los archivos
      if (Array.isArray(datos.imagenes)) {
        datos.imagenes.forEach(item => {
          if (item instanceof File) {
            imagenesArchivos.push(item);
          }
        });
      }
      
      // Agregar archivos al FormData
      imagenesArchivos.forEach(file => {
        formData.append('imagenes', file);
      });
      
      // Agregar el resto de los datos
      Object.keys(datos).forEach(key => {
        if (key !== 'imagenes' && datos[key] !== null && datos[key] !== undefined) {
          formData.append(key, datos[key]);
        }
      });
      
      return api.post('/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/productos', datos);
  },
  actualizar: (id, datos) => {
    // Verificar si hay archivos (nuevas imágenes) en el array de imágenes
    const tieneArchivos = datos.imagenes && Array.isArray(datos.imagenes) && 
      datos.imagenes.some(item => item instanceof File);
    
    // Si hay archivos, usar FormData
    if (tieneArchivos) {
      const formData = new FormData();
      const imagenesArchivos = [];
      const imagenesStrings = [];
      
      // Separar archivos de strings (URLs existentes)
      if (Array.isArray(datos.imagenes)) {
        datos.imagenes.forEach(item => {
          if (item instanceof File) {
            imagenesArchivos.push(item);
          } else if (typeof item === 'string') {
            imagenesStrings.push(item);
          }
        });
      }
      
      // Agregar archivos nuevos al FormData
      imagenesArchivos.forEach(file => {
        formData.append('imagenes', file);
      });
      
      // Agregar imágenes existentes en un campo separado
      if (imagenesStrings.length > 0) {
        formData.append('imagenesExistentes', JSON.stringify(imagenesStrings));
      }
      
      // Agregar el resto de los datos
      Object.keys(datos).forEach(key => {
        if (key !== 'imagenes' && datos[key] !== null && datos[key] !== undefined) {
          formData.append(key, datos[key]);
        }
      });
      
      return api.put(`/productos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    // Si no hay archivos pero hay imágenes (solo strings), enviar como JSON normal
    return api.put(`/productos/${id}`, datos);
  },
  eliminar: (id) => api.delete(`/productos/${id}`)
};

// Servicios de comentarios
export const comentarioService = {
  obtenerPorProducto: (productoId) => api.get(`/comentarios/producto/${productoId}`),
  crear: (datos) => api.post('/comentarios', datos),
  actualizar: (id, datos) => api.put(`/comentarios/${id}`, datos),
  eliminar: (id) => api.delete(`/comentarios/${id}`),
  darLike: (id) => api.post(`/comentarios/${id}/like`),
  quitarLike: (id) => api.post(`/comentarios/${id}/unlike`)
};

// Servicios de valoraciones
export const valoracionService = {
  crearOActualizar: (datos) => api.post('/valoraciones', datos),
  obtenerMiValoracion: (productoId) => api.get(`/valoraciones/producto/${productoId}`),
  obtenerEstadisticas: (productoId) => api.get(`/valoraciones/producto/${productoId}/estadisticas`),
  eliminar: (id) => api.delete(`/valoraciones/${id}`)
};

// Servicios de plantillas
export const plantillaService = {
  obtenerTodas: (params) => api.get('/plantillas', { params }),
  obtenerPorId: (id) => api.get(`/plantillas/${id}`),
  crear: (datos) => {
    if (datos instanceof FormData) {
      return api.post('/plantillas', datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/plantillas', datos);
  },
  actualizar: (id, datos) => {
    if (datos instanceof FormData) {
      return api.put(`/plantillas/${id}`, datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put(`/plantillas/${id}`, datos);
  },
  eliminar: (id) => api.delete(`/plantillas/${id}`)
};

// Servicios de categorías
export const categoriaService = {
  obtenerTodas: (params) => api.get('/categorias', { params }),
  obtenerPorId: (id) => api.get(`/categorias/${id}`),
  crear: (datos) => api.post('/categorias', datos),
  actualizar: (id, datos) => api.put(`/categorias/${id}`, datos),
  eliminar: (id) => api.delete(`/categorias/${id}`)
};

// Servicios de administrador
export const adminService = {
  obtenerEstadisticas: () => api.get('/admin/estadisticas'),
  obtenerActividad: () => api.get('/admin/actividad'),
  obtenerUsuarios: () => api.get('/admin/usuarios'),
  crearUsuario: (datos) => {
    if (datos instanceof FormData) {
      return api.post('/admin/usuarios', datos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/admin/usuarios', datos);
  },
  cambiarRol: (id, rol) => api.put(`/admin/usuarios/${id}/rol`, { rol }),
  eliminarUsuario: (id) => api.delete(`/admin/usuarios/${id}`),
  obtenerMercados: () => api.get('/admin/mercados'),
  obtenerProductos: () => api.get('/admin/productos'),
  obtenerComentarios: () => api.get('/admin/comentarios')
};

export default api;
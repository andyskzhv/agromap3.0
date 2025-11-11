const { PrismaClient } = require('@prisma/client');
const { eliminarArchivos, eliminarArchivosNoUsados } = require('../utils/fileUtils');
const prisma = new PrismaClient();

// Obtener todos los productos (público)
const obtenerProductos = async (req, res) => {
  try {
    const { provincia, categoria, tipo, estado, mercadoId } = req.query;
    
    const filtros = {};
    if (categoria) filtros.categoriaId = parseInt(categoria);
    if (tipo) filtros.tipoProducto = tipo;
    if (estado) filtros.estado = estado;
    if (mercadoId) filtros.mercadoId = parseInt(mercadoId);

    // Filtro por provincia (a través del mercado)
    const where = {
      ...filtros,
      ...(provincia && {
        mercado: {
          provincia: provincia
        }
      })
    };

    const productos = await prisma.producto.findMany({
      where,
      include: {
        mercado: {
          select: {
            id: true,
            nombre: true,
            provincia: true,
            municipio: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        fechaActualizacion: 'desc'
      }
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      details: error.message 
    });
  }
};

// Obtener un producto por ID (público)
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        mercado: {
          include: {
            gestor: {
              select: {
                id: true,
                nombre: true,
                nombreUsuario: true
              }
            }
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        comentarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                imagen: true
              }
            }
          },
          orderBy: {
            creadoEn: 'desc'
          }
        }
      }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Obtener estadísticas de valoraciones
    const statsValoracion = await prisma.valoracion.aggregate({
      where: { productoId: parseInt(id) },
      _avg: { estrellas: true },
      _count: { id: true }
    });

    // Obtener distribución de valoraciones
    const valoraciones = await prisma.valoracion.groupBy({
      by: ['estrellas'],
      where: { productoId: parseInt(id) },
      _count: { estrellas: true }
    });

    // Crear objeto de distribución
    const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    valoraciones.forEach(v => {
      distribucion[v.estrellas] = v._count.estrellas;
    });

    res.json({
      ...producto,
      valoraciones: {
        promedio: statsValoracion._avg.estrellas || 0,
        total: statsValoracion._count.id,
        distribucion
      }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      error: 'Error al obtener producto',
      details: error.message
    });
  }
};

// Crear producto (solo gestor/admin del mercado)
const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      cantidad,
      unidadMedida,
      imagenes,
      categoriaId,
      tipoProducto,
      precio,
      unidadPrecio,
      estado,
      mercadoId
    } = req.body;

    // Validaciones
    if (!nombre || !categoriaId || !mercadoId) {
      return res.status(400).json({
        error: 'Nombre, categoría y mercado son obligatorios'
      });
    }

    // Validar que se haya subido al menos una imagen
    const hayImagenesSubidas = req.files && req.files.length > 0;
    const hayImagenesEnviadas = imagenes && (Array.isArray(imagenes) ? imagenes.length > 0 : true);

    if (!hayImagenesSubidas && !hayImagenesEnviadas) {
      return res.status(400).json({
        error: 'Debe subir al menos una imagen del producto'
      });
    }

    // Verificar que la categoría existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoriaId) }
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    if (!categoria.activa) {
      return res.status(400).json({ error: 'La categoría seleccionada no está activa' });
    }

    // Verificar que el mercado existe
    const mercado = await prisma.mercado.findUnique({
      where: { id: parseInt(mercadoId) }
    });

    if (!mercado) {
      return res.status(404).json({ error: 'Mercado no encontrado' });
    }

    // Verificar permisos (solo el gestor dueño o admin)
    if (req.usuario.rol !== 'ADMIN' && mercado.gestorId !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tienes permisos para agregar productos a este mercado' 
      });
    }

    // Procesar imágenes subidas
    let imagenesUrls = [];
    if (req.files && req.files.length > 0) {
      imagenesUrls = req.files.map(file => `/uploads/productos/${file.filename}`);
    } else if (imagenes) {
      // Si se envía como JSON (array de strings), mantenerlo
      imagenesUrls = Array.isArray(imagenes) ? imagenes : [imagenes];
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        cantidad: cantidad ? parseFloat(cantidad) : null,
        unidadMedida: unidadMedida || 'UNIDAD',
        imagenes: imagenesUrls,
        categoriaId: parseInt(categoriaId),
        tipoProducto,
        precio: precio ? parseFloat(precio) : null,
        unidadPrecio: unidadPrecio || 'UNIDAD',
        moneda: 'CUP',
        estado: estado || 'DISPONIBLE',
        mercadoId: parseInt(mercadoId)
      },
      include: {
        mercado: {
          select: {
            id: true,
            nombre: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      error: 'Error al crear producto',
      details: error.message 
    });
  }
};

// Actualizar producto (solo gestor/admin del mercado)
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoId = parseInt(id);

    // Verificar que el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productoId },
      include: { mercado: true }
    });

    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol !== 'ADMIN' && 
        productoExistente.mercado.gestorId !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tienes permisos para editar este producto' 
      });
    }

    const {
      nombre,
      descripcion,
      cantidad,
      unidadMedida,
      imagenes,
      imagenesExistentes,
      categoriaId,
      tipoProducto,
      precio,
      unidadPrecio,
      estado
    } = req.body;

    // Si se está actualizando la categoría, verificar que existe y está activa
    if (categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: parseInt(categoriaId) }
      });

      if (!categoria) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      if (!categoria.activa) {
        return res.status(400).json({ error: 'La categoría seleccionada no está activa' });
      }
    }

    // Procesar imágenes subidas
    let imagenesUrls = productoExistente.imagenes || [];

    // Si hay archivos subidos (nuevas imágenes)
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => `/uploads/productos/${file.filename}`);

      // Procesar imágenes existentes del body
      let imagenesExistentesArray = [];
      if (imagenesExistentes) {
        try {
          imagenesExistentesArray = JSON.parse(imagenesExistentes);
        } catch (e) {
          // Si falla el parse, mantener las imágenes existentes del producto
          imagenesExistentesArray = imagenesUrls;
        }
      } else {
        // Si no se enviaron imágenes existentes, mantener las del producto
        imagenesExistentesArray = imagenesUrls;
      }

      // Combinar imágenes existentes con las nuevas
      imagenesUrls = [...imagenesExistentesArray, ...nuevasImagenes];
    } else if (imagenes !== undefined) {
      // Si no hay archivos pero se enviaron imágenes (puede ser para reemplazar)
      imagenesUrls = Array.isArray(imagenes) ? imagenes : [imagenes];
    }

    // Eliminar imágenes que ya no están en la nueva lista
    const imagenesAntiguasUrls = productoExistente.imagenes || [];
    eliminarArchivosNoUsados(imagenesAntiguasUrls, imagenesUrls);

    const productoActualizado = await prisma.producto.update({
      where: { id: productoId },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(cantidad !== undefined && { cantidad: cantidad ? parseFloat(cantidad) : null }),
        ...(unidadMedida && { unidadMedida }),
        imagenes: imagenesUrls, // Siempre actualizar las imágenes
        ...(categoriaId && { categoriaId: parseInt(categoriaId) }),
        ...(tipoProducto !== undefined && { tipoProducto }),
        ...(precio !== undefined && { precio: precio ? parseFloat(precio) : null }),
        ...(unidadPrecio && { unidadPrecio }),
        ...(estado && { estado }),
        fechaActualizacion: new Date()
      },
      include: {
        mercado: {
          select: {
            id: true,
            nombre: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.json({
      message: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      error: 'Error al actualizar producto',
      details: error.message 
    });
  }
};

// Eliminar producto (solo gestor/admin del mercado)
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoId = parseInt(id);

    // Verificar que el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productoId },
      include: { mercado: true }
    });

    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol !== 'ADMIN' &&
        productoExistente.mercado.gestorId !== req.usuario.id) {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este producto'
      });
    }

    // Eliminar el producto de la base de datos
    await prisma.producto.delete({
      where: { id: productoId }
    });

    // Eliminar las imágenes físicas del servidor
    if (productoExistente.imagenes && productoExistente.imagenes.length > 0) {
      eliminarArchivos(productoExistente.imagenes);
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      error: 'Error al eliminar producto',
      details: error.message 
    });
  }
};

// Obtener productos de mi mercado (gestor)
const obtenerMisProductos = async (req, res) => {
  try {
    // Buscar el mercado del gestor
    const mercado = await prisma.mercado.findFirst({
      where: { gestorId: req.usuario.id }
    });

    if (!mercado) {
      return res.status(404).json({ 
        error: 'No tienes un mercado creado' 
      });
    }

    const productos = await prisma.producto.findMany({
      where: { mercadoId: mercado.id },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        fechaActualizacion: 'desc'
      }
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener mis productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener mis productos',
      details: error.message 
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerMisProductos
};
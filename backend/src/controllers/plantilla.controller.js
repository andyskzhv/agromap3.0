const { PrismaClient } = require('@prisma/client');
const { eliminarArchivo } = require('../utils/fileUtils');
const prisma = new PrismaClient();

// Obtener todas las plantillas (público)
const obtenerPlantillas = async (req, res) => {
  try {
    const { categoria } = req.query;
    
    const filtros = {};
    if (categoria) filtros.categoriaId = parseInt(categoria);

    const plantillas = await prisma.plantillaProducto.findMany({
      where: filtros,
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(plantillas);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({ 
      error: 'Error al obtener plantillas',
      details: error.message 
    });
  }
};

// Obtener una plantilla por ID
const obtenerPlantillaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const plantilla = await prisma.plantillaProducto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    res.json(plantilla);
  } catch (error) {
    console.error('Error al obtener plantilla:', error);
    res.status(500).json({ 
      error: 'Error al obtener plantilla',
      details: error.message 
    });
  }
};

// Crear plantilla (solo admin)
const crearPlantilla = async (req, res) => {
  try {
    const { nombre, descripcion, categoriaId } = req.body;
    const imagen = req.file ? `/uploads/plantillas/${req.file.filename}` : null;

    if (!nombre || !categoriaId) {
      return res.status(400).json({ 
        error: 'Nombre y categoría son obligatorios' 
      });
    }

    // Verificar que la categoría existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoriaId) }
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const nuevaPlantilla = await prisma.plantillaProducto.create({
      data: {
        nombre,
        descripcion,
        imagen,
        categoriaId: parseInt(categoriaId)
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Plantilla creada exitosamente',
      plantilla: nuevaPlantilla
    });
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    res.status(500).json({ 
      error: 'Error al crear plantilla',
      details: error.message 
    });
  }
};

// Actualizar plantilla (solo admin)
const actualizarPlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoriaId } = req.body;
    const imagen = req.file ? `/uploads/plantillas/${req.file.filename}` : undefined;

    const plantillaExistente = await prisma.plantillaProducto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!plantillaExistente) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    // Si se está actualizando la categoría, verificar que existe
    if (categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: parseInt(categoriaId) }
      });

      if (!categoria) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
    }

    // Si hay una nueva imagen, eliminar la anterior
    if (imagen && plantillaExistente.imagen) {
      eliminarArchivo(plantillaExistente.imagen);
    }

    const plantillaActualizada = await prisma.plantillaProducto.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(categoriaId && { categoriaId: parseInt(categoriaId) }),
        ...(imagen && { imagen })
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    res.json({
      message: 'Plantilla actualizada exitosamente',
      plantilla: plantillaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar plantilla:', error);
    res.status(500).json({ 
      error: 'Error al actualizar plantilla',
      details: error.message 
    });
  }
};

// Eliminar plantilla (solo admin)
const eliminarPlantilla = async (req, res) => {
  try {
    const { id } = req.params;

    const plantillaExistente = await prisma.plantillaProducto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!plantillaExistente) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    // Eliminar la plantilla de la base de datos
    await prisma.plantillaProducto.delete({
      where: { id: parseInt(id) }
    });

    // Eliminar la imagen física de la plantilla
    if (plantillaExistente.imagen) {
      eliminarArchivo(plantillaExistente.imagen);
    }

    res.json({ message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar plantilla:', error);
    res.status(500).json({
      error: 'Error al eliminar plantilla',
      details: error.message
    });
  }
};

// Obtener plantillas con productos disponibles (público)
const obtenerPlantillasDisponibles = async (req, res) => {
  try {
    // Obtener TODAS las plantillas (con y sin productos)
    const plantillas = await prisma.plantillaProducto.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        _count: {
          select: {
            productos: {
              where: {
                estado: 'DISPONIBLE'
              }
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Enriquecer con count de mercados únicos y disponibilidad
    const plantillasEnriquecidas = await Promise.all(
      plantillas.map(async (plantilla) => {
        // Obtener mercados únicos donde hay productos disponibles de esta plantilla
        const productos = await prisma.producto.findMany({
          where: {
            plantillaId: plantilla.id,
            estado: 'DISPONIBLE'
          },
          select: {
            mercadoId: true
          },
          distinct: ['mercadoId']
        });

        const mercadosUnicos = productos.length;
        const tieneProductos = plantilla._count.productos > 0;

        return {
          ...plantilla,
          _count: {
            ...plantilla._count,
            mercadosUnicos
          },
          disponible: tieneProductos
        };
      })
    );

    // Ordenar: primero las que tienen productos, luego las que no
    const plantillasOrdenadas = plantillasEnriquecidas.sort((a, b) => {
      if (a.disponible && !b.disponible) return -1;
      if (!a.disponible && b.disponible) return 1;
      return 0;
    });

    res.json(plantillasOrdenadas);
  } catch (error) {
    console.error('Error al obtener plantillas disponibles:', error);
    res.status(500).json({
      error: 'Error al obtener plantillas disponibles',
      details: error.message
    });
  }
};

// Obtener detalle completo de plantilla con productos, comentarios y valoraciones (público)
const obtenerDetallePlantilla = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la plantilla
    const plantilla = await prisma.plantillaProducto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    // Obtener todos los productos DISPONIBLES de esta plantilla con sus relaciones
    const productos = await prisma.producto.findMany({
      where: {
        plantillaId: parseInt(id),
        estado: 'DISPONIBLE'
      },
      include: {
        mercado: {
          select: {
            id: true,
            nombre: true,
            provincia: true,
            municipio: true,
            direccion: true,
            latitud: true,
            longitud: true
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
        },
        valoraciones: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        _count: {
          select: {
            valoraciones: true
          }
        }
      }
    });

    // Calcular promedio de valoración por producto
    const productosConPromedio = productos.map(producto => {
      const sumaValoraciones = producto.valoraciones.reduce((sum, val) => sum + val.estrellas, 0);
      const promedioValoracion = producto.valoraciones.length > 0
        ? (sumaValoraciones / producto.valoraciones.length).toFixed(1)
        : 0;

      return {
        ...producto,
        promedioValoracion: parseFloat(promedioValoracion)
      };
    });

    // Calcular estadísticas agregadas
    const todasLasValoraciones = productos.flatMap(p => p.valoraciones);
    const todosLosComentarios = productos.flatMap(p => p.comentarios);

    const sumaTotal = todasLasValoraciones.reduce((sum, val) => sum + val.estrellas, 0);
    const promedioGeneral = todasLasValoraciones.length > 0
      ? (sumaTotal / todasLasValoraciones.length).toFixed(1)
      : 0;

    // Distribución de valoraciones (1-5 estrellas)
    const distribucionValoraciones = {
      1: todasLasValoraciones.filter(v => v.estrellas === 1).length,
      2: todasLasValoraciones.filter(v => v.estrellas === 2).length,
      3: todasLasValoraciones.filter(v => v.estrellas === 3).length,
      4: todasLasValoraciones.filter(v => v.estrellas === 4).length,
      5: todasLasValoraciones.filter(v => v.estrellas === 5).length
    };

    // Obtener mercados únicos con count de productos
    const mercadosMap = new Map();
    productos.forEach(producto => {
      const mercadoId = producto.mercado.id;
      if (mercadosMap.has(mercadoId)) {
        mercadosMap.get(mercadoId).cantidadProductos++;
      } else {
        mercadosMap.set(mercadoId, {
          id: producto.mercado.id,
          nombre: producto.mercado.nombre,
          provincia: producto.mercado.provincia,
          municipio: producto.mercado.municipio,
          direccion: producto.mercado.direccion,
          latitud: producto.mercado.latitud,
          longitud: producto.mercado.longitud,
          cantidadProductos: 1
        });
      }
    });

    const mercados = Array.from(mercadosMap.values());

    res.json({
      plantilla,
      productos: productosConPromedio,
      estadisticas: {
        totalComentarios: todosLosComentarios.length,
        totalValoraciones: todasLasValoraciones.length,
        promedioGeneral: parseFloat(promedioGeneral),
        distribucionValoraciones
      },
      mercados
    });
  } catch (error) {
    console.error('Error al obtener detalle de plantilla:', error);
    res.status(500).json({
      error: 'Error al obtener detalle de plantilla',
      details: error.message
    });
  }
};

module.exports = {
  obtenerPlantillas,
  obtenerPlantillaPorId,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
  obtenerPlantillasDisponibles,
  obtenerDetallePlantilla
};
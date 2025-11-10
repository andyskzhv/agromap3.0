const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear o actualizar valoración
const crearOActualizarValoracion = async (req, res) => {
  try {
    const { productoId, estrellas } = req.body;

    // Validar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(productoId) }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar rango de estrellas
    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({
        error: 'La valoración debe ser entre 1 y 5 estrellas'
      });
    }

    // Verificar si ya existe una valoración
    const valoracionExistente = await prisma.valoracion.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: parseInt(productoId)
        }
      }
    });

    let valoracion;

    if (valoracionExistente) {
      // Actualizar valoración existente
      valoracion = await prisma.valoracion.update({
        where: { id: valoracionExistente.id },
        data: { estrellas: parseInt(estrellas) },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              imagen: true
            }
          },
          producto: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });
    } else {
      // Crear nueva valoración
      valoracion = await prisma.valoracion.create({
        data: {
          usuarioId: req.usuario.id,
          productoId: parseInt(productoId),
          estrellas: parseInt(estrellas)
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              imagen: true
            }
          },
          producto: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });
    }

    res.json(valoracion);
  } catch (error) {
    console.error('Error al crear/actualizar valoración:', error);
    res.status(500).json({
      error: 'Error al procesar la valoración',
      details: error.message
    });
  }
};

// Obtener mi valoración de un producto
const obtenerMiValoracion = async (req, res) => {
  try {
    const { productoId } = req.params;

    const valoracion = await prisma.valoracion.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: parseInt(productoId)
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        },
        producto: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!valoracion) {
      return res.status(404).json({ error: 'No has valorado este producto' });
    }

    res.json(valoracion);
  } catch (error) {
    console.error('Error al obtener valoración:', error);
    res.status(500).json({
      error: 'Error al obtener valoración',
      details: error.message
    });
  }
};

// Obtener estadísticas de valoraciones de un producto
const obtenerEstadisticas = async (req, res) => {
  try {
    const { productoId } = req.params;

    // Obtener promedio y total
    const stats = await prisma.valoracion.aggregate({
      where: { productoId: parseInt(productoId) },
      _avg: { estrellas: true },
      _count: { id: true }
    });

    // Obtener distribución de valoraciones
    const valoraciones = await prisma.valoracion.groupBy({
      by: ['estrellas'],
      where: { productoId: parseInt(productoId) },
      _count: { estrellas: true }
    });

    // Crear objeto de distribución (1-5 estrellas)
    const distribucion = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    valoraciones.forEach(v => {
      distribucion[v.estrellas] = v._count.estrellas;
    });

    res.json({
      promedio: stats._avg.estrellas || 0,
      total: stats._count.id,
      distribucion
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      details: error.message
    });
  }
};

// Eliminar mi valoración
const eliminarValoracion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la valoración existe y pertenece al usuario
    const valoracion = await prisma.valoracion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!valoracion) {
      return res.status(404).json({ error: 'Valoración no encontrada' });
    }

    if (valoracion.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta valoración' });
    }

    await prisma.valoracion.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Valoración eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar valoración:', error);
    res.status(500).json({
      error: 'Error al eliminar valoración',
      details: error.message
    });
  }
};

module.exports = {
  crearOActualizarValoracion,
  obtenerMiValoracion,
  obtenerEstadisticas,
  eliminarValoracion
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener comentarios de un producto (público)
const obtenerComentariosProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuarioActualId = req.usuario?.id;

    const comentarios = await prisma.comentario.findMany({
      where: { productoId: parseInt(productoId) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        },
        usuariosLike: {
          select: {
            usuarioId: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });

    // Agregar info si el usuario actual dio like
    const comentariosConLikeInfo = comentarios.map(comentario => ({
      ...comentario,
      usuarioActualDioLike: usuarioActualId ?
        comentario.usuariosLike.some(like => like.usuarioId === usuarioActualId) :
        false,
      usuariosLike: undefined // No enviar lista completa al frontend
    }));

    res.json(comentariosConLikeInfo);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      error: 'Error al obtener comentarios',
      details: error.message
    });
  }
};

// Crear comentario (solo usuarios autenticados)
const crearComentario = async (req, res) => {
  try {
    const { productoId, texto, recomienda } = req.body;

    // Validaciones
    if (!productoId || !texto) {
      return res.status(400).json({
        error: 'Producto y texto son obligatorios'
      });
    }

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(productoId) }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si el usuario ya comentó este producto
    const comentarioExistente = await prisma.comentario.findUnique({
      where: {
        usuarioId_productoId: {
          usuarioId: req.usuario.id,
          productoId: parseInt(productoId)
        }
      }
    });

    if (comentarioExistente) {
      return res.status(400).json({
        error: 'Ya has comentado este producto. Puedes editar tu comentario existente.'
      });
    }

    const nuevoComentario = await prisma.comentario.create({
      data: {
        usuarioId: req.usuario.id,
        productoId: parseInt(productoId),
        texto,
        recomienda: recomienda !== undefined ? recomienda : true,
        likes: 0
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comentario creado exitosamente',
      comentario: nuevoComentario
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({
      error: 'Error al crear comentario',
      details: error.message
    });
  }
};

// Actualizar comentario (solo el autor)
const actualizarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, recomienda } = req.body;
    const comentarioId = parseInt(id);

    // Verificar que el comentario existe
    const comentarioExistente = await prisma.comentario.findUnique({
      where: { id: comentarioId }
    });

    if (!comentarioExistente) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Verificar que es el autor o admin
    if (req.usuario.rol !== 'ADMIN' && comentarioExistente.usuarioId !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tienes permisos para editar este comentario' 
      });
    }

    const comentarioActualizado = await prisma.comentario.update({
      where: { id: comentarioId },
      data: {
        ...(texto && { texto }),
        ...(recomienda !== undefined && { recomienda })
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        }
      }
    });

    res.json({
      message: 'Comentario actualizado exitosamente',
      comentario: comentarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar comentario',
      details: error.message 
    });
  }
};

// Eliminar comentario (solo el autor o admin)
const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const comentarioId = parseInt(id);

    // Verificar que el comentario existe
    const comentarioExistente = await prisma.comentario.findUnique({
      where: { id: comentarioId }
    });

    if (!comentarioExistente) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Verificar que es el autor o admin
    if (req.usuario.rol !== 'ADMIN' && comentarioExistente.usuarioId !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tienes permisos para eliminar este comentario' 
      });
    }

    await prisma.comentario.delete({
      where: { id: comentarioId }
    });

    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar comentario',
      details: error.message 
    });
  }
};

// Dar like a un comentario
const darLike = async (req, res) => {
  try {
    const { id } = req.params;
    const comentarioId = parseInt(id);

    const comentario = await prisma.comentario.findUnique({
      where: { id: comentarioId }
    });

    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Verificar si el usuario ya dio like
    const likeExistente = await prisma.usuarioLikeComentario.findUnique({
      where: {
        usuarioId_comentarioId: {
          usuarioId: req.usuario.id,
          comentarioId
        }
      }
    });

    if (likeExistente) {
      return res.status(400).json({
        error: 'Ya diste like a este comentario'
      });
    }

    // Crear registro de like e incrementar contador en una transacción
    await prisma.$transaction([
      prisma.usuarioLikeComentario.create({
        data: {
          usuarioId: req.usuario.id,
          comentarioId
        }
      }),
      prisma.comentario.update({
        where: { id: comentarioId },
        data: {
          likes: { increment: 1 }
        }
      })
    ]);

    const comentarioActualizado = await prisma.comentario.findUnique({
      where: { id: comentarioId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        }
      }
    });

    res.json({
      message: 'Like agregado',
      comentario: comentarioActualizado
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({
      error: 'Error al dar like',
      details: error.message
    });
  }
};

// Quitar like de un comentario
const quitarLike = async (req, res) => {
  try {
    const { id } = req.params;
    const comentarioId = parseInt(id);

    const comentario = await prisma.comentario.findUnique({
      where: { id: comentarioId }
    });

    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Verificar si el usuario dio like
    const likeExistente = await prisma.usuarioLikeComentario.findUnique({
      where: {
        usuarioId_comentarioId: {
          usuarioId: req.usuario.id,
          comentarioId
        }
      }
    });

    if (!likeExistente) {
      return res.status(400).json({
        error: 'No has dado like a este comentario'
      });
    }

    // Eliminar registro de like y decrementar contador en una transacción
    await prisma.$transaction([
      prisma.usuarioLikeComentario.delete({
        where: {
          id: likeExistente.id
        }
      }),
      prisma.comentario.update({
        where: { id: comentarioId },
        data: {
          likes: { decrement: 1 }
        }
      })
    ]);

    const comentarioActualizado = await prisma.comentario.findUnique({
      where: { id: comentarioId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        }
      }
    });

    res.json({
      message: 'Like removido',
      comentario: comentarioActualizado
    });
  } catch (error) {
    console.error('Error al quitar like:', error);
    res.status(500).json({
      error: 'Error al quitar like',
      details: error.message
    });
  }
};

module.exports = {
  obtenerComentariosProducto,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  darLike,
  quitarLike
};
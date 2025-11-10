const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener comentarios de un producto (público)
const obtenerComentariosProducto = async (req, res) => {
  try {
    const { productoId } = req.params;

    const comentarios = await prisma.comentario.findMany({
      where: { productoId: parseInt(productoId) },
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
    });

    res.json(comentarios);
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

    const comentarioActualizado = await prisma.comentario.update({
      where: { id: comentarioId },
      data: {
        likes: comentario.likes + 1
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

    const comentarioActualizado = await prisma.comentario.update({
      where: { id: comentarioId },
      data: {
        likes: Math.max(0, comentario.likes - 1) // No puede ser negativo
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
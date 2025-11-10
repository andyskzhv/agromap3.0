const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las categorías (público, solo activas)
const obtenerCategorias = async (req, res) => {
  try {
    const { activas } = req.query;
    
    const where = {};
    if (activas === 'true' || activas === undefined) {
      where.activa = true;
    }

    const categorias = await prisma.categoria.findMany({
      where,
      include: {
        _count: {
          select: {
            productos: true,
            plantillas: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      details: error.message 
    });
  }
};

// Obtener una categoría por ID (público)
const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            productos: true,
            plantillas: true
          }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ 
      error: 'Error al obtener categoría',
      details: error.message 
    });
  }
};

// Crear categoría (solo admin)
const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, activa } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre es obligatorio' 
      });
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { nombre: nombre.trim() }
    });

    if (categoriaExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una categoría con ese nombre' 
      });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
        activa: activa !== undefined ? activa : true
      }
    });

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      categoria: nuevaCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ 
      error: 'Error al crear categoría',
      details: error.message 
    });
  }
};

// Actualizar categoría (solo admin)
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activa } = req.body;
    const categoriaId = parseInt(id);

    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: categoriaId }
    });

    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
    if (nombre && nombre.trim() !== categoriaExistente.nombre) {
      const categoriaConMismoNombre = await prisma.categoria.findUnique({
        where: { nombre: nombre.trim() }
      });

      if (categoriaConMismoNombre) {
        return res.status(400).json({ 
          error: 'Ya existe otra categoría con ese nombre' 
        });
      }
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id: categoriaId },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(descripcion !== undefined && { descripcion: descripcion || null }),
        ...(activa !== undefined && { activa })
      }
    });

    res.json({
      message: 'Categoría actualizada exitosamente',
      categoria: categoriaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ 
      error: 'Error al actualizar categoría',
      details: error.message 
    });
  }
};

// Eliminar categoría (solo admin)
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaId = parseInt(id);

    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: categoriaId },
      include: {
        _count: {
          select: {
            productos: true,
            plantillas: true
          }
        }
      }
    });

    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si tiene productos o plantillas asociadas
    if (categoriaExistente._count.productos > 0 || categoriaExistente._count.plantillas > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene productos o plantillas asociadas. Desactívala en su lugar.' 
      });
    }

    await prisma.categoria.delete({
      where: { id: categoriaId }
    });

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ 
      error: 'Error al eliminar categoría',
      details: error.message 
    });
  }
};

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};


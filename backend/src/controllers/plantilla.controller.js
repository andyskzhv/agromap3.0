const { PrismaClient } = require('@prisma/client');
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

    await prisma.plantillaProducto.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar plantilla:', error);
    res.status(500).json({ 
      error: 'Error al eliminar plantilla',
      details: error.message 
    });
  }
};

module.exports = {
  obtenerPlantillas,
  obtenerPlantillaPorId,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla
};
const { PrismaClient } = require('@prisma/client');
const { eliminarArchivos, eliminarArchivosNoUsados } = require('../utils/fileUtils');
const prisma = new PrismaClient();

// Obtener todos los mercados (público)
const obtenerMercados = async (req, res) => {
  try {
    const { provincia, municipio } = req.query;
    
    const filtros = {};
    if (provincia) filtros.provincia = provincia;
    if (municipio) filtros.municipio = municipio;

    const mercados = await prisma.mercado.findMany({
      where: filtros,
      include: {
        gestor: {
          select: {
            id: true,
            nombre: true,
            nombreUsuario: true
          }
        },
        productos: {
          select: {
            id: true,
            nombre: true,
            estado: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });

    res.json(mercados);
  } catch (error) {
    console.error('Error al obtener mercados:', error);
    res.status(500).json({ 
      error: 'Error al obtener mercados',
      details: error.message 
    });
  }
};

// Obtener un mercado por ID (público)
const obtenerMercadoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const mercado = await prisma.mercado.findUnique({
      where: { id: parseInt(id) },
      include: {
        gestor: {
          select: {
            id: true,
            nombre: true,
            nombreUsuario: true
          }
        },
        productos: true
      }
    });

    if (!mercado) {
      return res.status(404).json({ error: 'Mercado no encontrado' });
    }

    res.json(mercado);
  } catch (error) {
    console.error('Error al obtener mercado:', error);
    res.status(500).json({ 
      error: 'Error al obtener mercado',
      details: error.message 
    });
  }
};

// Crear mercado (solo gestor o admin)
const crearMercado = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      direccion,
      provincia,
      municipio,
      latitud,
      longitud,
      beneficiarioLegal,
      horario,
      perteneceSas
    } = req.body;

    // Validaciones
    if (!nombre || !direccion || !provincia || !municipio) {
      return res.status(400).json({
        error: 'Nombre, dirección, provincia y municipio son obligatorios'
      });
    }

    // Verificar si el gestor ya tiene un mercado (solo si no es admin)
    if (req.usuario.rol === 'GESTOR') {
      const mercadoExistente = await prisma.mercado.findFirst({
        where: { gestorId: req.usuario.id }
      });

      if (mercadoExistente) {
        return res.status(400).json({
          error: 'Ya tienes un mercado creado. Solo puedes gestionar uno.'
        });
      }
    }

    // Procesar imágenes subidas
    const imagenesUrls = req.files ? req.files.map(file => `/uploads/mercados/${file.filename}`) : [];

    const nuevoMercado = await prisma.mercado.create({
      data: {
        nombre,
        descripcion,
        direccion,
        provincia,
        municipio,
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null,
        imagenes: imagenesUrls,
        beneficiarioLegal,
        horario,
        perteneceSas: perteneceSas === 'true' || perteneceSas === true,
        gestorId: req.usuario.id
      },
      include: {
        gestor: {
          select: {
            id: true,
            nombre: true,
            nombreUsuario: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Mercado creado exitosamente',
      mercado: nuevoMercado
    });
  } catch (error) {
    console.error('Error al crear mercado:', error);
    res.status(500).json({
      error: 'Error al crear mercado',
      details: error.message
    });
  }
};

// Actualizar mercado (solo el gestor dueño o admin)
const actualizarMercado = async (req, res) => {
  try {
    const { id } = req.params;
    const mercadoId = parseInt(id);

    // Verificar que el mercado existe
    const mercadoExistente = await prisma.mercado.findUnique({
      where: { id: mercadoId }
    });

    if (!mercadoExistente) {
      return res.status(404).json({ error: 'Mercado no encontrado' });
    }

    // Verificar permisos (solo el gestor dueño o admin puede editar)
    if (req.usuario.rol !== 'ADMIN' && mercadoExistente.gestorId !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tienes permisos para editar este mercado' 
      });
    }

    const {
      nombre,
      descripcion,
      direccion,
      provincia,
      municipio,
      latitud,
      longitud,
      beneficiarioLegal,
      horario,
      perteneceSas
    } = req.body;

    // Procesar nuevas imágenes subidas
    const nuevasImagenes = req.files ? req.files.map(file => `/uploads/mercados/${file.filename}`) : [];

    // Si hay nuevas imágenes, reemplazar las antiguas; si no, mantener las existentes
    const imagenesFinales = nuevasImagenes.length > 0 ? nuevasImagenes : mercadoExistente.imagenes;

    // Si se están reemplazando las imágenes, eliminar las antiguas
    if (nuevasImagenes.length > 0 && mercadoExistente.imagenes && mercadoExistente.imagenes.length > 0) {
      eliminarArchivos(mercadoExistente.imagenes);
    }

    const mercadoActualizado = await prisma.mercado.update({
      where: { id: mercadoId },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(direccion && { direccion }),
        ...(provincia && { provincia }),
        ...(municipio && { municipio }),
        ...(latitud && { latitud: parseFloat(latitud) }),
        ...(longitud && { longitud: parseFloat(longitud) }),
        imagenes: imagenesFinales,
        ...(beneficiarioLegal !== undefined && { beneficiarioLegal }),
        ...(horario !== undefined && { horario }),
        ...(perteneceSas !== undefined && { perteneceSas: perteneceSas === 'true' || perteneceSas === true })
      },
      include: {
        gestor: {
          select: {
            id: true,
            nombre: true,
            nombreUsuario: true
          }
        }
      }
    });

    res.json({
      message: 'Mercado actualizado exitosamente',
      mercado: mercadoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar mercado:', error);
    res.status(500).json({ 
      error: 'Error al actualizar mercado',
      details: error.message 
    });
  }
};

// Eliminar mercado (solo admin)
const eliminarMercado = async (req, res) => {
  try {
    const { id } = req.params;
    const mercadoId = parseInt(id);

    // Verificar que el mercado existe
    const mercadoExistente = await prisma.mercado.findUnique({
      where: { id: mercadoId }
    });

    if (!mercadoExistente) {
      return res.status(404).json({ error: 'Mercado no encontrado' });
    }

    // Solo admin puede eliminar
    if (req.usuario.rol !== 'ADMIN') {
      return res.status(403).json({
        error: 'Solo los administradores pueden eliminar mercados'
      });
    }

    // Obtener todos los productos del mercado para eliminar sus imágenes
    const productos = await prisma.producto.findMany({
      where: { mercadoId: mercadoId },
      select: { imagenes: true }
    });

    // Eliminar el mercado de la base de datos
    await prisma.mercado.delete({
      where: { id: mercadoId }
    });

    // Eliminar las imágenes del mercado
    if (mercadoExistente.imagenes && mercadoExistente.imagenes.length > 0) {
      eliminarArchivos(mercadoExistente.imagenes);
    }

    // Eliminar las imágenes de todos los productos del mercado
    productos.forEach(producto => {
      if (producto.imagenes && producto.imagenes.length > 0) {
        eliminarArchivos(producto.imagenes);
      }
    });

    res.json({ message: 'Mercado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mercado:', error);
    res.status(500).json({ 
      error: 'Error al eliminar mercado',
      details: error.message 
    });
  }
};

// Obtener mercado del gestor actual
const obtenerMiMercado = async (req, res) => {
  try {
    const mercado = await prisma.mercado.findFirst({
      where: { gestorId: req.usuario.id },
      include: {
        productos: true
      }
    });

    if (!mercado) {
      return res.status(404).json({
        error: 'No tienes ningún mercado creado aún'
      });
    }

    res.json(mercado);
  } catch (error) {
    console.error('Error al obtener mi mercado:', error);
    res.status(500).json({
      error: 'Error al obtener mi mercado',
      details: error.message
    });
  }
};

// Obtener provincias con mercados (público)
const obtenerProvinciasConMercados = async (req, res) => {
  try {
    // Provincias por defecto que siempre deben aparecer
    const provinciasDefecto = ['Villa Clara', 'Sancti Spiritus'];

    // Obtener provincias únicas de los mercados existentes
    const mercados = await prisma.mercado.findMany({
      select: {
        provincia: true
      },
      distinct: ['provincia']
    });

    // Extraer las provincias de los mercados
    const provinciasConMercados = mercados.map(m => m.provincia);

    // Combinar provincias por defecto con las que tienen mercados
    const todasLasProvincias = new Set([...provinciasDefecto, ...provinciasConMercados]);

    // Convertir a array y ordenar alfabéticamente
    const provinciasOrdenadas = Array.from(todasLasProvincias).sort();

    res.json(provinciasOrdenadas);
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    res.status(500).json({
      error: 'Error al obtener provincias',
      details: error.message
    });
  }
};

module.exports = {
  obtenerMercados,
  obtenerMercadoPorId,
  crearMercado,
  actualizarMercado,
  eliminarMercado,
  obtenerMiMercado,
  obtenerProvinciasConMercados
};
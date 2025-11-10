const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Obtener estadísticas generales
const obtenerEstadisticas = async (req, res) => {
  try {
    const [
      totalUsuarios,
      totalMercados,
      totalProductos,
      totalComentarios,
      productosDisponibles,
      usuariosPorRol
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.mercado.count(),
      prisma.producto.count(),
      prisma.comentario.count(),
      prisma.producto.count({ where: { estado: 'DISPONIBLE' } }),
      prisma.usuario.groupBy({
        by: ['rol'],
        _count: true
      })
    ]);

    const estadisticas = {
      usuarios: {
        total: totalUsuarios,
        porRol: usuariosPorRol.reduce((acc, item) => {
          acc[item.rol] = item._count;
          return acc;
        }, {})
      },
      mercados: {
        total: totalMercados
      },
      productos: {
        total: totalProductos,
        disponibles: productosDisponibles,
        noDisponibles: totalProductos - productosDisponibles
      },
      comentarios: {
        total: totalComentarios
      }
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    });
  }
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        nombreUsuario: true,
        rol: true,
        provincia: true,
        imagen: true,
        creadoEn: true,
        _count: {
          select: {
            mercados: true,
            comentarios: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error al obtener usuarios',
      details: error.message
    });
  }
};

// Crear usuario (Admin)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, nombreUsuario, contrasena, rol, provincia } = req.body;
    const imagen = req.file ? `/uploads/perfiles/${req.file.filename}` : null;

    // Validaciones
    if (!nombre || !nombreUsuario || !contrasena) {
      return res.status(400).json({
        error: 'Nombre, nombre de usuario y contraseña son obligatorios'
      });
    }

    if (!['USUARIO', 'GESTOR', 'ADMIN'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol inválido. Debe ser USUARIO, GESTOR o ADMIN'
      });
    }

    // Verificar que el nombre de usuario no exista
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { nombreUsuario }
    });

    if (usuarioExiste) {
      return res.status(400).json({
        error: 'Este nombre de usuario ya está registrado'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        nombreUsuario,
        contrasena: contrasenaHash,
        imagen,
        rol: rol || 'USUARIO',
        provincia: provincia || null
      },
      select: {
        id: true,
        nombre: true,
        nombreUsuario: true,
        imagen: true,
        rol: true,
        provincia: true,
        creadoEn: true
      }
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      error: 'Error al crear usuario',
      details: error.message
    });
  }
};

// Cambiar rol de usuario
const cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['USUARIO', 'GESTOR', 'ADMIN'].includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol inválido. Debe ser USUARIO, GESTOR o ADMIN' 
      });
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { rol },
      select: {
        id: true,
        nombre: true,
        nombreUsuario: true,
        rol: true
      }
    });

    res.json({
      message: 'Rol actualizado exitosamente',
      usuario
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ 
      error: 'Error al cambiar rol',
      details: error.message 
    });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = parseInt(id);

    // No permitir eliminar al propio admin
    if (usuarioId === req.usuario.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta' 
      });
    }

    await prisma.usuario.delete({
      where: { id: usuarioId }
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar usuario',
      details: error.message 
    });
  }
};

// Obtener actividad reciente
const obtenerActividadReciente = async (req, res) => {
  try {
    const [mercadosRecientes, productosRecientes, comentariosRecientes] = await Promise.all([
      prisma.mercado.findMany({
        take: 5,
        orderBy: { creadoEn: 'desc' },
        include: {
          gestor: {
            select: { nombre: true }
          }
        }
      }),
      prisma.producto.findMany({
        take: 5,
        orderBy: { creadoEn: 'desc' },
        include: {
          mercado: {
            select: { nombre: true }
          }
        }
      }),
      prisma.comentario.findMany({
        take: 5,
        orderBy: { creadoEn: 'desc' },
        include: {
          usuario: {
            select: { nombre: true }
          },
          producto: {
            select: { nombre: true }
          }
        }
      })
    ]);

    res.json({
      mercadosRecientes,
      productosRecientes,
      comentariosRecientes
    });
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({ 
      error: 'Error al obtener actividad reciente',
      details: error.message 
    });
  }
};

// Obtener todos los mercados (para admin)
const obtenerTodosMercados = async (req, res) => {
  try {
    const mercados = await prisma.mercado.findMany({
      include: {
        gestor: {
          select: {
            id: true,
            nombre: true,
            nombreUsuario: true
          }
        },
        _count: {
          select: {
            productos: true
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

// Obtener todos los productos (para admin)
const obtenerTodosProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        mercado: {
          select: {
            id: true,
            nombre: true,
            gestor: {
              select: {
                nombre: true
              }
            }
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

// Obtener todos los comentarios (para admin)
const obtenerTodosComentarios = async (req, res) => {
  try {
    const comentarios = await prisma.comentario.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true
          }
        },
        producto: {
          select: {
            id: true,
            nombre: true
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

module.exports = {
  obtenerEstadisticas,
  obtenerUsuarios,
  crearUsuario,
  cambiarRolUsuario,
  eliminarUsuario,
  obtenerActividadReciente,
  obtenerTodosMercados,
  obtenerTodosProductos,
  obtenerTodosComentarios
};
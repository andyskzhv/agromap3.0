const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener estadísticas del mercado del gestor
const obtenerEstadisticas = async (req, res) => {
  try {
    const gestorId = req.usuario.id;

    // Obtener el mercado del gestor
    const mercado = await prisma.mercado.findFirst({
      where: { gestorId },
      include: {
        _count: {
          select: {
            productos: true
          }
        }
      }
    });

    if (!mercado) {
      return res.json({
        mercado: null,
        productos: { total: 0, disponibles: 0, noDisponibles: 0 },
        engagement: { totalComentarios: 0, promedioValoracion: 0, totalLikes: 0 },
        recomendaciones: { total: 0, positivas: 0, porcentaje: 0 },
        categorias: [],
        productosPopulares: []
      });
    }

    // Obtener todos los productos del mercado
    const productos = await prisma.producto.findMany({
      where: { mercadoId: mercado.id },
      include: {
        categoria: {
          select: { nombre: true }
        },
        _count: {
          select: {
            comentarios: true,
            valoraciones: true
          }
        }
      }
    });

    const productosIds = productos.map(p => p.id);

    // Estadísticas de productos
    const totalProductos = productos.length;
    const productosDisponibles = productos.filter(p => p.estado === 'DISPONIBLE').length;
    const productosNoDisponibles = totalProductos - productosDisponibles;

    // Estadísticas de engagement
    const [
      totalComentarios,
      valoracionesStats,
      comentariosConLikes,
      comentariosStats
    ] = await Promise.all([
      // Total de comentarios
      prisma.comentario.count({
        where: { productoId: { in: productosIds } }
      }),
      // Promedio de valoraciones
      prisma.valoracion.aggregate({
        where: { productoId: { in: productosIds } },
        _avg: { estrellas: true },
        _count: true
      }),
      // Suma de likes en comentarios
      prisma.comentario.aggregate({
        where: { productoId: { in: productosIds } },
        _sum: { likes: true }
      }),
      // Estadísticas de recomendaciones
      prisma.comentario.groupBy({
        by: ['recomienda'],
        where: { productoId: { in: productosIds } },
        _count: true
      })
    ]);

    const totalLikes = comentariosConLikes._sum.likes || 0;
    const promedioValoracion = valoracionesStats._avg.estrellas
      ? parseFloat(valoracionesStats._avg.estrellas.toFixed(1))
      : 0;

    // Calcular recomendaciones
    const totalRecomendaciones = comentariosStats.reduce((acc, item) => acc + item._count, 0);
    const recomendacionesPositivas = comentariosStats.find(item => item.recomienda === true)?._count || 0;
    const porcentajeRecomendaciones = totalRecomendaciones > 0
      ? Math.round((recomendacionesPositivas / totalRecomendaciones) * 100)
      : 0;

    // Distribución por categorías
    const categorias = productos.reduce((acc, producto) => {
      const categoriaNombre = producto.categoria?.nombre || 'Sin categoría';
      if (!acc[categoriaNombre]) {
        acc[categoriaNombre] = 0;
      }
      acc[categoriaNombre]++;
      return acc;
    }, {});

    const categoriasArray = Object.entries(categorias).map(([nombre, cantidad]) => ({
      nombre,
      cantidad
    })).sort((a, b) => b.cantidad - a.cantidad);

    // Productos más populares (por comentarios y valoraciones)
    const productosConStats = await Promise.all(
      productos.map(async (producto) => {
        const [comentariosCount, valoracionPromedio] = await Promise.all([
          prisma.comentario.count({
            where: { productoId: producto.id }
          }),
          prisma.valoracion.aggregate({
            where: { productoId: producto.id },
            _avg: { estrellas: true }
          })
        ]);

        return {
          id: producto.id,
          nombre: producto.nombre,
          imagen: producto.imagenes?.[0] || null,
          comentarios: comentariosCount,
          valoracionPromedio: valoracionPromedio._avg.estrellas
            ? parseFloat(valoracionPromedio._avg.estrellas.toFixed(1))
            : 0,
          precio: producto.precio,
          unidadPrecio: producto.unidadPrecio
        };
      })
    );

    // Top 5 productos por comentarios
    const productosPopulares = productosConStats
      .sort((a, b) => b.comentarios - a.comentarios)
      .slice(0, 5);

    const estadisticas = {
      mercado: {
        id: mercado.id,
        nombre: mercado.nombre,
        provincia: mercado.provincia,
        municipio: mercado.municipio,
        creadoEn: mercado.creadoEn
      },
      productos: {
        total: totalProductos,
        disponibles: productosDisponibles,
        noDisponibles: productosNoDisponibles
      },
      engagement: {
        totalComentarios,
        promedioValoracion,
        totalLikes,
        totalValoraciones: valoracionesStats._count
      },
      recomendaciones: {
        total: totalRecomendaciones,
        positivas: recomendacionesPositivas,
        porcentaje: porcentajeRecomendaciones
      },
      categorias: categoriasArray,
      productosPopulares
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas del gestor:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      details: error.message
    });
  }
};

// Obtener actividad reciente del mercado del gestor
const obtenerActividad = async (req, res) => {
  try {
    const gestorId = req.usuario.id;

    // Obtener el mercado del gestor
    const mercado = await prisma.mercado.findFirst({
      where: { gestorId }
    });

    if (!mercado) {
      return res.json({
        productosRecientes: [],
        comentariosRecientes: []
      });
    }

    const [productosRecientes, comentariosRecientes] = await Promise.all([
      // Productos recientes del mercado
      prisma.producto.findMany({
        where: { mercadoId: mercado.id },
        take: 5,
        orderBy: { creadoEn: 'desc' },
        include: {
          categoria: {
            select: { nombre: true }
          }
        }
      }),
      // Comentarios recientes en productos del mercado
      prisma.comentario.findMany({
        where: {
          producto: {
            mercadoId: mercado.id
          }
        },
        take: 10,
        orderBy: { creadoEn: 'desc' },
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
              nombre: true,
              imagenes: true
            }
          }
        }
      })
    ]);

    res.json({
      productosRecientes,
      comentariosRecientes
    });
  } catch (error) {
    console.error('Error al obtener actividad del gestor:', error);
    res.status(500).json({
      error: 'Error al obtener actividad',
      details: error.message
    });
  }
};

module.exports = {
  obtenerEstadisticas,
  obtenerActividad
};

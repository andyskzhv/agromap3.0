const { PrismaClient } = require('@prisma/client');
const webpush = require('web-push');
const prisma = new PrismaClient();

// Configurar VAPID details
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Obtener clave pública VAPID (público)
const obtenerClavePublica = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// Suscribirse a notificaciones de un producto (protegido)
const suscribirse = async (req, res) => {
  try {
    const { productoId, subscription } = req.body;
    const usuarioId = req.usuario.id;

    if (!productoId || !subscription) {
      return res.status(400).json({
        error: 'Producto ID y subscription son requeridos'
      });
    }

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(productoId) }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Guardar o actualizar suscripción
    const suscripcion = await prisma.suscripcionProducto.upsert({
      where: {
        usuarioId_productoId_endpoint: {
          usuarioId,
          productoId: parseInt(productoId),
          endpoint: subscription.endpoint
        }
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      create: {
        usuarioId,
        productoId: parseInt(productoId),
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    res.json({
      message: 'Suscripción guardada exitosamente',
      suscripcion
    });
  } catch (error) {
    console.error('Error al suscribirse:', error);
    res.status(500).json({
      error: 'Error al crear suscripción',
      details: error.message
    });
  }
};

// Desuscribirse de un producto (protegido)
const desuscribirse = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { endpoint } = req.body;
    const usuarioId = req.usuario.id;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint es requerido' });
    }

    await prisma.suscripcionProducto.deleteMany({
      where: {
        usuarioId,
        productoId: parseInt(productoId),
        endpoint
      }
    });

    res.json({ message: 'Desuscripción exitosa' });
  } catch (error) {
    console.error('Error al desuscribirse:', error);
    res.status(500).json({
      error: 'Error al desuscribirse',
      details: error.message
    });
  }
};

// Verificar si el usuario está suscrito a un producto (protegido)
const verificarSuscripcion = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuarioId = req.usuario.id;

    const suscripcion = await prisma.suscripcionProducto.findFirst({
      where: {
        usuarioId,
        productoId: parseInt(productoId)
      }
    });

    res.json({
      suscrito: !!suscripcion,
      suscripcion
    });
  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    res.status(500).json({
      error: 'Error al verificar suscripción',
      details: error.message
    });
  }
};

// Obtener todas las suscripciones del usuario (protegido)
const obtenerMisSuscripciones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const suscripciones = await prisma.suscripcionProducto.findMany({
      where: { usuarioId },
      include: {
        producto: {
          include: {
            mercado: {
              select: {
                id: true,
                nombre: true,
                provincia: true,
                municipio: true
              }
            },
            plantilla: {
              select: {
                id: true,
                nombre: true,
                imagen: true
              }
            }
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });

    res.json(suscripciones);
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    res.status(500).json({
      error: 'Error al obtener suscripciones',
      details: error.message
    });
  }
};

// Enviar notificación push (función interna, no expuesta como endpoint)
const enviarNotificacionPush = async (suscripcion, payload) => {
  try {
    console.log(`📤 Enviando notificación a usuario ${suscripcion.usuarioId}...`);
    console.log(`   Endpoint: ${suscripcion.endpoint.substring(0, 50)}...`);

    const pushSubscription = {
      endpoint: suscripcion.endpoint,
      keys: {
        p256dh: suscripcion.p256dh,
        auth: suscripcion.auth
      }
    };

    console.log(`   Payload:`, JSON.stringify(payload).substring(0, 100));

    const result = await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log(`✅ Notificación enviada exitosamente al usuario ${suscripcion.usuarioId}`);
    console.log(`   Status: ${result.statusCode}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Error al enviar notificación push al usuario ${suscripcion.usuarioId}:`, error);
    console.error(`   Status Code: ${error.statusCode}`);
    console.error(`   Message: ${error.message}`);

    // Si el error es 410 (Gone), la suscripción expiró
    if (error.statusCode === 410) {
      console.log(`🗑️ Eliminando suscripción expirada del usuario ${suscripcion.usuarioId}`);
      await prisma.suscripcionProducto.delete({
        where: { id: suscripcion.id }
      });
    }

    return { success: false, error };
  }
};

// Notificar a suscriptores cuando un producto cambia a DISPONIBLE
const notificarDisponibilidad = async (productoId) => {
  try {
    console.log(`🔔 Iniciando notificación para producto ${productoId}`);

    // Obtener el producto con su información
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
      include: {
        mercado: {
          select: {
            nombre: true,
            provincia: true,
            municipio: true
          }
        },
        plantilla: {
          select: {
            nombre: true,
            imagen: true
          }
        }
      }
    });

    if (!producto || producto.estado !== 'DISPONIBLE') {
      console.log(`⚠️ Producto no encontrado o no disponible`);
      return;
    }

    // Obtener todas las suscripciones a este producto
    const suscripciones = await prisma.suscripcionProducto.findMany({
      where: { productoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    console.log(`📋 Encontradas ${suscripciones.length} suscripciones`);

    if (suscripciones.length === 0) {
      console.log(`⚠️ No hay suscriptores para este producto`);
      return;
    }

    const nombreProducto = producto.plantilla?.nombre || producto.nombre;
    const payload = {
      title: `¡${nombreProducto} ya está disponible!`,
      body: `${producto.mercado.nombre} en ${producto.mercado.municipio}, ${producto.mercado.provincia}`,
      icon: producto.plantilla?.imagen ? `http://localhost:5000${producto.plantilla.imagen}` : '/logo.png',
      badge: '/logo.png',
      data: {
        url: `/productos/${productoId}`,
        productoId
      }
    };

    console.log(`📤 Enviando notificaciones...`);

    // Enviar notificación a cada suscriptor
    const promesas = suscripciones.map(sub => enviarNotificacionPush(sub, payload));
    const resultados = await Promise.all(promesas);

    const exitosas = resultados.filter(r => r.success).length;
    const fallidas = resultados.filter(r => !r.success).length;
    console.log(`✅ Notificaciones exitosas: ${exitosas}`);
    console.log(`❌ Notificaciones fallidas: ${fallidas}`);

  } catch (error) {
    console.error('Error al notificar disponibilidad:', error);
  }
};

module.exports = {
  obtenerClavePublica,
  suscribirse,
  desuscribirse,
  verificarSuscripcion,
  obtenerMisSuscripciones,
  notificarDisponibilidad,
  enviarNotificacionPush
};

const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const {
  obtenerClavePublica,
  suscribirse,
  desuscribirse,
  verificarSuscripcion,
  obtenerMisSuscripciones
} = require('../controllers/suscripcion.controller');

// Obtener clave pública VAPID (público)
router.get('/public-key', obtenerClavePublica);

// Rutas protegidas (requieren autenticación)
router.post('/suscribirse', verificarToken, suscribirse);
router.post('/desuscribirse/:productoId', verificarToken, desuscribirse);
router.get('/verificar/:productoId', verificarToken, verificarSuscripcion);
router.get('/mis-suscripciones', verificarToken, obtenerMisSuscripciones);

module.exports = router;

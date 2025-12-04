const express = require('express');
const router = express.Router();
const {
  obtenerEstadisticas,
  obtenerActividad
} = require('../controllers/gestor.controller');
const { verificarToken, verificarGestorOAdmin } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y rol de GESTOR o ADMIN
router.use(verificarToken);
router.use(verificarGestorOAdmin);

// Estadísticas del gestor
router.get('/estadisticas', obtenerEstadisticas);
router.get('/actividad', obtenerActividad);

module.exports = router;

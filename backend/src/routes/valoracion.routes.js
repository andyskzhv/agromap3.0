const express = require('express');
const router = express.Router();
const {
  crearOActualizarValoracion,
  obtenerMiValoracion,
  obtenerEstadisticas,
  eliminarValoracion
} = require('../controllers/valoracion.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/producto/:productoId/estadisticas', obtenerEstadisticas);

// Rutas protegidas
router.post('/', verificarToken, crearOActualizarValoracion);
router.get('/producto/:productoId', verificarToken, obtenerMiValoracion);
router.delete('/:id', verificarToken, eliminarValoracion);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  obtenerMercados,
  obtenerMercadoPorId,
  crearMercado,
  actualizarMercado,
  eliminarMercado,
  obtenerMiMercado
} = require('../controllers/mercado.controller');
const { 
  verificarToken, 
  verificarGestorOAdmin,
  verificarAdmin 
} = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', obtenerMercados);
router.get('/:id', obtenerMercadoPorId);

// Rutas protegidas - Gestor o Admin
router.get('/mi/mercado', verificarToken, verificarGestorOAdmin, obtenerMiMercado);
router.post('/', verificarToken, verificarGestorOAdmin, crearMercado);
router.put('/:id', verificarToken, verificarGestorOAdmin, actualizarMercado);

// Rutas protegidas - Solo Admin
router.delete('/:id', verificarToken, verificarAdmin, eliminarMercado);

module.exports = router;
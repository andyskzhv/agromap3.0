const express = require('express');
const router = express.Router();
const {
  obtenerMercados,
  obtenerMercadoPorId,
  crearMercado,
  actualizarMercado,
  eliminarMercado,
  obtenerMiMercado,
  obtenerProvinciasConMercados
} = require('../controllers/mercado.controller');
const {
  verificarToken,
  verificarGestorOAdmin,
  verificarAdmin
} = require('../middleware/auth.middleware');
const { uploadMercados } = require('../middleware/upload.middleware');

// Rutas públicas
router.get('/', obtenerMercados);
router.get('/provincias/lista', obtenerProvinciasConMercados);
router.get('/:id', obtenerMercadoPorId);

// Rutas protegidas - Gestor o Admin
router.get('/mi/mercado', verificarToken, verificarGestorOAdmin, obtenerMiMercado);
router.post('/', verificarToken, verificarGestorOAdmin, uploadMercados.array('imagenes', 10), crearMercado);
router.put('/:id', verificarToken, verificarGestorOAdmin, uploadMercados.array('imagenes', 10), actualizarMercado);

// Rutas protegidas - Solo Admin
router.delete('/:id', verificarToken, verificarAdmin, eliminarMercado);

module.exports = router;
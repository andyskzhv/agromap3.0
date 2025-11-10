const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerMisProductos
} = require('../controllers/producto.controller');
const { 
  verificarToken, 
  verificarGestorOAdmin 
} = require('../middleware/auth.middleware');
const { uploadProductos } = require('../middleware/upload.middleware');

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas - Gestor o Admin
router.get('/mis/productos', verificarToken, verificarGestorOAdmin, obtenerMisProductos);
router.post('/', verificarToken, verificarGestorOAdmin, uploadProductos.array('imagenes', 10), crearProducto);
router.put('/:id', verificarToken, verificarGestorOAdmin, uploadProductos.array('imagenes', 10), actualizarProducto);
router.delete('/:id', verificarToken, verificarGestorOAdmin, eliminarProducto);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  obtenerComentariosProducto,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  darLike,
  quitarLike
} = require('../controllers/comentario.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/producto/:productoId', obtenerComentariosProducto);

// Rutas protegidas (requieren autenticación)
router.post('/', verificarToken, crearComentario);
router.put('/:id', verificarToken, actualizarComentario);
router.delete('/:id', verificarToken, eliminarComentario);
router.post('/:id/like', verificarToken, darLike);
router.post('/:id/unlike', verificarToken, quitarLike);

module.exports = router;
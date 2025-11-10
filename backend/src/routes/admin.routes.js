const express = require('express');
const router = express.Router();
const {
  obtenerEstadisticas,
  obtenerUsuarios,
  crearUsuario,
  cambiarRolUsuario,
  eliminarUsuario,
  obtenerActividadReciente,
  obtenerTodosMercados,
  obtenerTodosProductos,
  obtenerTodosComentarios
} = require('../controllers/admin.controller');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');
const { uploadPerfiles } = require('../middleware/upload.middleware');

// Todas las rutas requieren autenticación y rol de ADMIN
router.use(verificarToken);
router.use(verificarAdmin);

// Estadísticas
router.get('/estadisticas', obtenerEstadisticas);
router.get('/actividad', obtenerActividadReciente);

// Gestión de usuarios
router.get('/usuarios', obtenerUsuarios);
router.post('/usuarios', uploadPerfiles.single('imagen'), crearUsuario);
router.put('/usuarios/:id/rol', cambiarRolUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

// Gestión de mercados
router.get('/mercados', obtenerTodosMercados);

// Gestión de productos
router.get('/productos', obtenerTodosProductos);

// Gestión de comentarios
router.get('/comentarios', obtenerTodosComentarios);

module.exports = router;
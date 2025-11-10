const express = require('express');
const router = express.Router();
const { registro, login, obtenerPerfil, actualizarPerfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { uploadPerfiles } = require('../middleware/upload.middleware');

// Rutas públicas
router.post('/registro', uploadPerfiles.single('imagen'), registro);
router.post('/login', login);

// Rutas protegidas (requieren token)
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, uploadPerfiles.single('imagen'), actualizarPerfil);

module.exports = router;
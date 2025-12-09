const express = require('express');
const router = express.Router();
const { registro, login, obtenerPerfil, actualizarPerfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { uploadPerfiles } = require('../middleware/upload.middleware');
const { verificarCaptcha } = require('../middleware/captcha.middleware');

// Rutas públicas con captcha
// IMPORTANTE: Para registro, multer debe ir ANTES de verificarCaptcha para que parsee el FormData
router.post('/registro', uploadPerfiles.single('imagen'), verificarCaptcha, registro);
router.post('/login', verificarCaptcha, login);

// Rutas protegidas (requieren token)
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, uploadPerfiles.single('imagen'), actualizarPerfil);

module.exports = router;
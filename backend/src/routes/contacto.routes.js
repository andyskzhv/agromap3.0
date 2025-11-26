const express = require('express');
const router = express.Router();
const { enviarMensaje } = require('../controllers/contacto.controller');

// Ruta pública para enviar mensajes de contacto
router.post('/', enviarMensaje);

module.exports = router;

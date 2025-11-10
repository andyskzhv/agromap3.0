const express = require('express');
const router = express.Router();
const {
  obtenerPlantillas,
  obtenerPlantillaPorId,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla
} = require('../controllers/plantilla.controller');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');
const { uploadPlantillas } = require('../middleware/upload.middleware');

// Rutas públicas (accesibles por gestores y admin)
router.get('/', obtenerPlantillas);
router.get('/:id', obtenerPlantillaPorId);

// Rutas protegidas - Solo Admin
router.post('/', verificarToken, verificarAdmin, uploadPlantillas.single('imagen'), crearPlantilla);
router.put('/:id', verificarToken, verificarAdmin, uploadPlantillas.single('imagen'), actualizarPlantilla);
router.delete('/:id', verificarToken, verificarAdmin, eliminarPlantilla);

module.exports = router;
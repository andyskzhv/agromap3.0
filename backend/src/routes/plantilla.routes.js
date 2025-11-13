const express = require('express');
const router = express.Router();
const {
  obtenerPlantillas,
  obtenerPlantillaPorId,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
  obtenerPlantillasDisponibles,
  obtenerDetallePlantilla
} = require('../controllers/plantilla.controller');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');
const { uploadPlantillas } = require('../middleware/upload.middleware');

// Rutas públicas
router.get('/', obtenerPlantillas);
router.get('/disponibles', obtenerPlantillasDisponibles);
router.get('/:id', obtenerPlantillaPorId);
router.get('/:id/detalle', obtenerDetallePlantilla);

// Rutas protegidas - Solo Admin
router.post('/', verificarToken, verificarAdmin, uploadPlantillas.single('imagen'), crearPlantilla);
router.put('/:id', verificarToken, verificarAdmin, uploadPlantillas.single('imagen'), actualizarPlantilla);
router.delete('/:id', verificarToken, verificarAdmin, eliminarPlantilla);

module.exports = router;
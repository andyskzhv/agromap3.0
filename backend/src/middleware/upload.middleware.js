const multer = require('multer');
const path = require('path');

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
  }
};

// Configuración para perfiles
const storagePerfiles = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/perfiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración para plantillas
const storagePlantillas = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/plantillas/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plantilla-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración para productos
const storageProductos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'producto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Middlewares específicos
const uploadPerfiles = multer({
  storage: storagePerfiles,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

const uploadPlantillas = multer({
  storage: storagePlantillas,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

const uploadProductos = multer({
  storage: storageProductos,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Exportar todos los middlewares
module.exports = {
  single: uploadPerfiles.single.bind(uploadPerfiles),
  array: uploadProductos.array.bind(uploadProductos),
  // Para compatibilidad con código existente
  uploadPerfiles,
  uploadPlantillas,
  uploadProductos
};
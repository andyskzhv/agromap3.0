const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Bienvenido a Agromap API!',
    version: '1.0.0',
    status: 'online'
  });
});

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/mercados', require('./routes/mercado.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/comentarios', require('./routes/comentario.routes'));
app.use('/api/valoraciones', require('./routes/valoracion.routes'));
app.use('/api/plantillas', require('./routes/plantilla.routes'));
app.use('/api/categorias', require('./routes/categoria.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/suscripciones', require('./routes/suscripcion.routes'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Servidor accesible en http://172.21.8.76:${PORT}`);
  console.log(`📊 Base de datos conectada`);
});
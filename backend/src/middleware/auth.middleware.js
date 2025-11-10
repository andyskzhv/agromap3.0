const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. No se proporcionó token.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guardamos la info del usuario en la request
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado.' 
    });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado.' 
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción.' 
      });
    }

    next();
  };
};

// Middleware para verificar que es ADMIN
const verificarAdmin = verificarRol('ADMIN');

// Middleware para verificar que es GESTOR o ADMIN
const verificarGestorOAdmin = verificarRol('GESTOR', 'ADMIN');

module.exports = {
  verificarToken,
  verificarRol,
  verificarAdmin,
  verificarGestorOAdmin
};
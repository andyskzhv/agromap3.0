const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { eliminarArchivo } = require('../utils/fileUtils');

const prisma = new PrismaClient();

// Registrar nuevo usuario
const registro = async (req, res) => {
  try {
    const { nombre, nombreUsuario, contrasena, provincia } = req.body;
    const imagen = req.file ? `/uploads/perfiles/${req.file.filename}` : null;

    // Validaciones básicas
    if (!nombre || !nombreUsuario || !contrasena) {
      return res.status(400).json({
        error: 'Nombre, nombre de usuario y contraseña son obligatorios.'
      });
    }

    // Verificar si el nombre de usuario ya existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { nombreUsuario }
    });

    if (usuarioExiste) {
      return res.status(400).json({
        error: 'Este nombre de usuario ya está registrado.'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        nombreUsuario,
        contrasena: contrasenaHash,
        imagen,
        provincia: provincia || null,
        rol: 'USUARIO'
      },
      select: {
        id: true,
        nombre: true,
        nombreUsuario: true,
        imagen: true,
        rol: true,
        provincia: true,
        creadoEn: true
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      {
        id: nuevoUsuario.id,
        nombreUsuario: nuevoUsuario.nombreUsuario,
        rol: nuevoUsuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: nuevoUsuario
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      details: error.message
    });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { nombreUsuario, contrasena } = req.body;

    // Validaciones
    if (!nombreUsuario || !contrasena) {
      return res.status(400).json({
        error: 'Nombre de usuario y contraseña son obligatorios.'
      });
    }

    // Buscar usuario por nombre de usuario
    const usuario = await prisma.usuario.findUnique({
      where: { nombreUsuario }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Nombre de usuario o contraseña incorrectos.'
      });
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({
        error: 'Nombre de usuario o contraseña incorrectos.'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // No enviar la contraseña en la respuesta
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      details: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nombre: true,
        nombreUsuario: true,
        imagen: true,
        rol: true,
        provincia: true,
        creadoEn: true
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado.'
      });
    }

    res.json(usuario);

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
      details: error.message
    });
  }
};

// Actualizar perfil del usuario autenticado
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, provincia, contrasenaActual, contrasenaNueva } = req.body;
    const nuevaImagen = req.file ? `/uploads/perfiles/${req.file.filename}` : null;

    // Obtener usuario actual
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }
    });

    if (!usuarioActual) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Datos a actualizar
    const datosActualizar = {};

    if (nombre) datosActualizar.nombre = nombre;
    if (provincia !== undefined) datosActualizar.provincia = provincia || null;

    // Si hay una nueva imagen, eliminar la anterior y actualizar
    if (nuevaImagen) {
      if (usuarioActual.imagen) {
        eliminarArchivo(usuarioActual.imagen);
      }
      datosActualizar.imagen = nuevaImagen;
    }

    // Si quiere cambiar la contraseña
    if (contrasenaNueva) {
      if (!contrasenaActual) {
        return res.status(400).json({ 
          error: 'Debes proporcionar tu contraseña actual para cambiarla' 
        });
      }

      // Verificar contraseña actual
      const contrasenaValida = await bcrypt.compare(contrasenaActual, usuarioActual.contrasena);
      if (!contrasenaValida) {
        return res.status(401).json({ 
          error: 'La contraseña actual es incorrecta' 
        });
      }

      // Validar nueva contraseña
      if (contrasenaNueva.length < 6) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
      }

      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      datosActualizar.contrasena = await bcrypt.hash(contrasenaNueva, salt);
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: datosActualizar,
      select: {
        id: true,
        nombre: true,
        nombreUsuario: true,
        imagen: true,
        rol: true,
        provincia: true,
        creadoEn: true
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      error: 'Error al actualizar perfil',
      details: error.message 
    });
  }
};

module.exports = {
  registro,
  login,
  obtenerPerfil,
  actualizarPerfil
};
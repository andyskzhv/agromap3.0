const axios = require('axios');

/**
 * Middleware para verificar el token de hCaptcha
 * Debe ser usado en rutas públicas que requieren protección contra bots
 */
const verificarCaptcha = async (req, res, next) => {
  try {
    // Obtener el token del body de la petición
    const captchaToken = req.body?.captchaToken;

    // Validar que existe el token
    if (!captchaToken) {
      return res.status(400).json({
        error: 'Token de verificación requerido. Por favor completa el captcha.'
      });
    }

    // Validar que existe la clave secreta
    if (!process.env.HCAPTCHA_SECRET_KEY) {
      console.error('ERROR: HCAPTCHA_SECRET_KEY no está configurada en .env');
      return res.status(500).json({
        error: 'Error en la configuración del servidor. Contacte al administrador.'
      });
    }

    // Preparar datos para la verificación
    const verificationData = new URLSearchParams({
      secret: process.env.HCAPTCHA_SECRET_KEY,
      response: captchaToken,
      remoteip: req.ip || req.connection.remoteAddress // IP del cliente (opcional pero recomendado)
    });

    // Realizar petición a hCaptcha para verificar el token
    const verificationResponse = await axios.post(
      'https://hcaptcha.com/siteverify',
      verificationData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 segundos timeout
      }
    );

    const verificationResult = verificationResponse.data;

    // Verificar respuesta exitosa
    if (!verificationResult.success) {
      console.warn('Verificación de captcha fallida:', verificationResult['error-codes']);
      return res.status(400).json({
        error: 'Verificación de captcha fallida. Por favor intenta nuevamente.',
        details: process.env.NODE_ENV === 'development' ? verificationResult['error-codes'] : undefined
      });
    }

    // Verificación exitosa - continuar con la siguiente función
    next();

  } catch (error) {
    console.error('Error al verificar captcha:', error.message);

    // Distinguir entre errores de red y otros errores
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Error de conexión con el servicio de verificación. Por favor intenta más tarde.'
      });
    }

    return res.status(500).json({
      error: 'Error al verificar captcha. Por favor intenta nuevamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  verificarCaptcha
};

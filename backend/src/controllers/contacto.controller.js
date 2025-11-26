const nodemailer = require('nodemailer');

// Configurar el transportador de nodemailer
const crearTransportador = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Enviar mensaje de contacto
const enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validaciones
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El email no es válido' });
    }

    // Validar longitud del mensaje
    if (mensaje.length < 10) {
      return res.status(400).json({ error: 'El mensaje debe tener al menos 10 caracteres' });
    }

    // Configurar el correo
    const transportador = crearTransportador();

    const opcionesCorreo = {
      from: process.env.EMAIL_USER,
      to: 'agromapweb@gmail.com',
      subject: `[Contacto Agromap] ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00a650;">Nuevo mensaje de contacto</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>De:</strong> ${nombre}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Asunto:</strong> ${asunto}</p>
          </div>

          <div style="background-color: white; padding: 20px; border-left: 4px solid #00a650;">
            <h3 style="color: #333; margin-top: 0;">Mensaje:</h3>
            <p style="color: #666; line-height: 1.6;">${mensaje.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Para responder a este mensaje, envía un correo a:
              <a href="mailto:${email}" style="color: #00a650;">${email}</a>
            </p>
          </div>
        </div>
      `,
      text: `
Nuevo mensaje de contacto en Agromap

De: ${nombre}
Email: ${email}
Asunto: ${asunto}

Mensaje:
${mensaje}

---
Para responder, envía un correo a: ${email}
      `
    };

    // Enviar el correo
    await transportador.sendMail(opcionesCorreo);

    res.status(200).json({
      mensaje: 'Mensaje enviado correctamente',
      success: true
    });

  } catch (error) {
    console.error('Error al enviar mensaje de contacto:', error);

    // Errores específicos de nodemailer
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        error: 'Error de autenticación del servidor de correo. Contacta al administrador.'
      });
    }

    if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      return res.status(500).json({
        error: 'Error de conexión con el servidor de correo. Intenta más tarde.'
      });
    }

    res.status(500).json({
      error: 'Error al enviar el mensaje. Intenta nuevamente más tarde.'
    });
  }
};

module.exports = {
  enviarMensaje
};

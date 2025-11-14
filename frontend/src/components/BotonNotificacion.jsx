import React, { useState, useEffect } from 'react';
import { suscripcionService, pushNotificationUtils } from '../services/suscripcion.service';
import { useToast } from './Toast';
import './BotonNotificacion.css';

function BotonNotificacion({ productoId, estadoProducto }) {
  const [suscrito, setSuscrito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const toast = useToast();

  useEffect(() => {
    verificarSuscripcion();
  }, [productoId]);

  const verificarSuscripcion = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setVerificando(false);
        return;
      }

      const response = await suscripcionService.verificarSuscripcion(productoId);
      setSuscrito(response.data.suscrito);
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
    } finally {
      setVerificando(false);
    }
  };

  const handleToggleSuscripcion = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión para recibir notificaciones');
        return;
      }

      setLoading(true);

      if (suscrito) {
        // Desuscribirse
        await pushNotificationUtils.removePushNotifications(productoId);
        setSuscrito(false);
        toast.success('Ya no recibirás notificaciones de este producto');
      } else {
        // Suscribirse
        if (!pushNotificationUtils.isSupported()) {
          toast.error('Tu navegador no soporta notificaciones push');
          return;
        }

        await pushNotificationUtils.setupPushNotifications(productoId);
        setSuscrito(true);
        toast.success('¡Listo! Te notificaremos cuando este producto esté disponible');
      }
    } catch (error) {
      console.error('Error al gestionar suscripción:', error);

      if (error.message.includes('denegado')) {
        toast.error('Debes permitir las notificaciones en tu navegador');
      } else if (error.message.includes('no soporta')) {
        toast.error(error.message);
      } else {
        toast.error('Error al gestionar la notificación. Intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  // No mostrar el botón si el usuario no está autenticado
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  // No mostrar mientras verifica
  if (verificando) {
    return null;
  }

  // Si el producto está disponible y no está suscrito, no mostrar
  if (estadoProducto === 'DISPONIBLE' && !suscrito) {
    return null;
  }

  return (
    <button
      onClick={handleToggleSuscripcion}
      disabled={loading}
      className={`boton-notificacion ${suscrito ? 'suscrito' : ''} ${loading ? 'loading' : ''}`}
      title={suscrito ? 'Dejar de recibir notificaciones' : 'Recibir notificación cuando esté disponible'}
    >
      {loading ? (
        <>
          <span className="icono-notif">⏳</span>
          <span className="texto-notif">Procesando...</span>
        </>
      ) : suscrito ? (
        <>
          <span className="icono-notif">🔔</span>
          <span className="texto-notif">Notificaciones activadas</span>
        </>
      ) : (
        <>
          <span className="icono-notif">🔕</span>
          <span className="texto-notif">Notificarme cuando esté disponible</span>
        </>
      )}
    </button>
  );
}

export default BotonNotificacion;

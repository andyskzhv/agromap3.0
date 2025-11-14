import axios from 'axios';

const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return 'http://172.21.8.76:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const suscripcionService = {
  // Obtener clave pública VAPID
  obtenerClavePublica: () => api.get('/suscripciones/public-key'),

  // Suscribirse a notificaciones de un producto
  suscribirse: (productoId, subscription) =>
    api.post('/suscripciones/suscribirse', { productoId, subscription }),

  // Desuscribirse de un producto
  desuscribirse: (productoId, endpoint) =>
    api.post(`/suscripciones/desuscribirse/${productoId}`, { endpoint }),

  // Verificar si está suscrito
  verificarSuscripcion: (productoId) =>
    api.get(`/suscripciones/verificar/${productoId}`),

  // Obtener todas las suscripciones del usuario
  obtenerMisSuscripciones: () =>
    api.get('/suscripciones/mis-suscripciones')
};

// Utilidades para manejar Service Worker y Push Notifications
export const pushNotificationUtils = {
  // Verificar soporte de notificaciones
  isSupported: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Solicitar permiso de notificaciones
  requestPermission: async () => {
    if (!pushNotificationUtils.isSupported()) {
      throw new Error('Las notificaciones push no están soportadas en este navegador');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Registrar Service Worker
  registerServiceWorker: async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers no están soportados');
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      throw error;
    }
  },

  // Obtener suscripción push actual
  getPushSubscription: async (registration) => {
    return await registration.pushManager.getSubscription();
  },

  // Crear nueva suscripción push
  subscribeToPush: async (registration, publicKey) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: pushNotificationUtils.urlBase64ToUint8Array(publicKey)
      });
      return subscription;
    } catch (error) {
      console.error('Error al suscribirse a push:', error);
      throw error;
    }
  },

  // Desuscribirse de push
  unsubscribeFromPush: async (subscription) => {
    if (subscription) {
      await subscription.unsubscribe();
    }
  },

  // Convertir clave VAPID de base64 a Uint8Array
  urlBase64ToUint8Array: (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  // Flujo completo: registrar SW + suscribirse + guardar en backend
  setupPushNotifications: async (productoId) => {
    try {
      console.log('🔔 [Notificaciones] Iniciando configuración para producto:', productoId);

      // 1. Verificar soporte
      console.log('🔍 [Notificaciones] Verificando soporte del navegador...');
      if (!pushNotificationUtils.isSupported()) {
        throw new Error('Tu navegador no soporta notificaciones push');
      }
      console.log('✅ [Notificaciones] Navegador soporta notificaciones');

      // 2. Solicitar permiso
      console.log('🔍 [Notificaciones] Solicitando permiso...');
      const hasPermission = await pushNotificationUtils.requestPermission();
      if (!hasPermission) {
        throw new Error('Permiso de notificaciones denegado');
      }
      console.log('✅ [Notificaciones] Permiso concedido');

      // 3. Registrar Service Worker
      console.log('🔍 [Notificaciones] Verificando Service Worker...');
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('📝 [Notificaciones] Registrando Service Worker...');
        registration = await pushNotificationUtils.registerServiceWorker();
      } else {
        console.log('✅ [Notificaciones] Service Worker ya registrado');
      }

      // 4. Obtener clave pública del servidor
      console.log('🔍 [Notificaciones] Obteniendo clave VAPID del servidor...');
      const { data } = await suscripcionService.obtenerClavePublica();
      const publicKey = data.publicKey;
      console.log('✅ [Notificaciones] Clave VAPID obtenida:', publicKey.substring(0, 20) + '...');

      // 5. Suscribirse a push notifications
      console.log('🔍 [Notificaciones] Verificando suscripción push...');
      let subscription = await pushNotificationUtils.getPushSubscription(registration);
      if (!subscription) {
        console.log('📝 [Notificaciones] Creando nueva suscripción push...');
        subscription = await pushNotificationUtils.subscribeToPush(registration, publicKey);
        console.log('✅ [Notificaciones] Suscripción push creada');
      } else {
        console.log('✅ [Notificaciones] Suscripción push ya existe');
      }
      console.log('📋 [Notificaciones] Endpoint:', subscription.endpoint);

      // 6. Guardar suscripción en el backend
      console.log('📝 [Notificaciones] Guardando suscripción en el backend...');
      await suscripcionService.suscribirse(productoId, subscription);
      console.log('✅ [Notificaciones] Suscripción guardada exitosamente');

      return { success: true, subscription };
    } catch (error) {
      console.error('❌ [Notificaciones] Error al configurar notificaciones:', error);
      throw error;
    }
  },

  // Desuscribirse completamente
  removePushNotifications: async (productoId) => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await pushNotificationUtils.getPushSubscription(registration);
        if (subscription) {
          // Desuscribir del backend
          await suscripcionService.desuscribirse(productoId, subscription.endpoint);
          // Desuscribir localmente
          await pushNotificationUtils.unsubscribeFromPush(subscription);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Error al desuscribirse:', error);
      throw error;
    }
  }
};

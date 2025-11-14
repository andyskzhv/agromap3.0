# Diagnóstico de Notificaciones Push

## Pasos para diagnosticar problemas

### 1. Verificar Service Worker (Frontend)

Abre la consola del navegador (F12) en `http://localhost:3000` y ejecuta:

```javascript
// Verificar soporte de notificaciones
console.log('Service Worker soportado:', 'serviceWorker' in navigator);
console.log('Push Manager soportado:', 'PushManager' in window);
console.log('Notification API soportada:', 'Notification' in window);

// Verificar permiso de notificaciones
console.log('Permiso actual:', Notification.permission);

// Verificar Service Worker registrado
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker registrado:', !!reg);
  if (reg) {
    console.log('Service Worker activo:', !!reg.active);
    console.log('Service Worker esperando:', !!reg.waiting);
    console.log('Service Worker instalando:', !!reg.installing);
  }
});

// Verificar suscripción push
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.pushManager.getSubscription().then(sub => {
      console.log('Suscripción push activa:', !!sub);
      if (sub) {
        console.log('Endpoint:', sub.endpoint);
      }
    });
  }
});
```

### 2. Verificar en DevTools

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Application**
3. En el menú izquierdo, busca **Service Workers**
4. Deberías ver `/service-worker.js` registrado y en estado "activated"
5. Verifica que no haya errores en rojo

### 3. Verificar la suscripción en la base de datos

1. Ejecuta Prisma Studio:
```bash
cd backend
npx prisma studio
```

2. Abre la tabla `suscripciones_productos`
3. Verifica que exista una entrada con:
   - `usuarioId`: ID del usuario suscrito
   - `productoId`: ID del producto
   - `endpoint`: URL del endpoint de push (debe empezar con https://fcm.googleapis.com o similar)
   - `p256dh` y `auth`: Deben tener valores

### 4. Forzar una notificación de prueba (Consola del navegador)

```javascript
// Probar notificación local (esto SÍ debería funcionar)
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.showNotification('Prueba Local', {
      body: 'Si ves esto, las notificaciones funcionan',
      icon: '/logo.png',
      badge: '/logo.png'
    });
  }
});
```

Si esta notificación **SÍ aparece**, significa que:
- ✅ El navegador soporta notificaciones
- ✅ El permiso está concedido
- ✅ El Service Worker está activo

Si **NO aparece**, el problema está en:
- ❌ Permiso de notificaciones denegado
- ❌ Service Worker no registrado correctamente

### 5. Verificar logs del backend

Cuando el gestor cambie el producto a DISPONIBLE, deberías ver en la consola del backend:

```
🔔 Iniciando notificación para producto 123
📋 Encontradas 1 suscripciones
📤 Enviando notificaciones...
📤 Enviando notificación a usuario 5...
   Endpoint: https://fcm.googleapis.com/fcm/send/xxxxx...
   Payload: {"title":"¡Tomate ya está disponible!","body":"Mercad...
✅ Notificación enviada exitosamente al usuario 5
   Status: 201
✅ Notificaciones exitosas: 1
❌ Notificaciones fallidas: 0
```

### 6. Verificar logs del Service Worker

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Filtra por "Service Worker" en la consola
4. Cuando llegue la notificación push, deberías ver:

```
[Service Worker] Push event recibido! PushEvent {...}
[Service Worker] Push data: {"title":"...","body":"..."}
[Service Worker] Push data JSON: {title: "...", body: "..."}
[Service Worker] Mostrando notificación: ¡Tomate ya está disponible! {...}
[Service Worker] Notificación mostrada exitosamente
```

## Problemas comunes y soluciones

### Problema: "Tu navegador no soporta notificaciones push" en móvil

**Causa**: Estás accediendo desde una IP (http://172.21.8.76) en lugar de localhost.

**Solución**:
- En producción, necesitas HTTPS (las notificaciones push requieren conexión segura)
- Para desarrollo en móvil, puedes usar herramientas como ngrok para crear un túnel HTTPS

**Comando ngrok**:
```bash
npx ngrok http 3000
```

Esto te dará una URL HTTPS temporal como `https://abc123.ngrok.io`

### Problema: Notificaciones no llegan pero backend dice "enviadas"

**Posibles causas**:

1. **Service Worker no está escuchando**
   - Solución: Recargar la página y verificar en DevTools > Application > Service Workers

2. **Permiso denegado sin darse cuenta**
   - Solución: Ir a configuración del navegador y resetear permisos para localhost

3. **Suscripción expirada**
   - Solución: Desuscribirse y volver a suscribirse

4. **Clave VAPID incorrecta**
   - Solución: Verificar que `.env` tiene las claves correctas y que backend se reinició

### Problema: Imágenes no cargan en móvil

**Causa**: Las URLs de imágenes en las notificaciones y en el frontend usan `http://localhost:5000` que no es accesible desde móvil.

**Solución temporal para probar**:

1. **Frontend ya está configurado correctamente** - `frontend/src/services/api.js` detecta automáticamente:
   - Si accedes desde localhost → usa `http://localhost:5000`
   - Si accedes desde otra IP → usa `http://172.21.8.76:5000`

2. **Backend necesita ajuste** - El problema está en `suscripcion.controller.js` línea 252 donde las URLs de imágenes en notificaciones usan hardcoded `http://localhost:5000`

**Para acceder desde móvil**:
1. Asegúrate que tu PC y móvil están en la misma red WiFi
2. En tu móvil, abre Chrome y ve a `http://172.21.8.76:3000`
3. Las imágenes deberían cargar correctamente
4. Sin embargo, **las notificaciones push NO funcionarán** sin HTTPS

**Solución definitiva para notificaciones en móvil**:

Las notificaciones push requieren HTTPS (conexión segura). Para desarrollo en móvil:

**Opción 1: Usar ngrok (Recomendado)**
```bash
# Instalar ngrok
npm install -g ngrok

# Crear túnel HTTPS para el frontend
ngrok http 3000

# En otra terminal, crear túnel para el backend
ngrok http 5000
```

Ngrok te dará URLs HTTPS como:
- Frontend: `https://abc123.ngrok.io`
- Backend: `https://def456.ngrok.io`

Luego actualiza `frontend/src/services/api.js` para usar la URL de ngrok del backend.

**Opción 2: Certificado SSL autofirmado (Más complejo)**
1. Generar certificado SSL local
2. Configurar React y Express para usar HTTPS
3. Aceptar el certificado en el móvil

**Opción 3: Solo probar en Desktop por ahora**
Para desarrollo, es más simple probar las notificaciones en Chrome desktop (localhost funciona sin HTTPS) y solo probar el móvil cuando esté en producción con HTTPS real.

## Checklist de verificación

- [ ] Navegador soporta notificaciones (`'PushManager' in window`)
- [ ] Permiso de notificaciones concedido (`Notification.permission === 'granted'`)
- [ ] Service Worker registrado y activo
- [ ] Suscripción push existe en `navigator.serviceWorker`
- [ ] Suscripción guardada en base de datos
- [ ] Backend tiene claves VAPID configuradas
- [ ] Notificación de prueba local funciona
- [ ] Backend muestra logs de envío exitoso
- [ ] Service Worker muestra logs de recepción

## Si todo lo anterior está ✅ pero no funciona

Intenta estos pasos de reinicio:

1. **Desregistrar Service Worker**:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

2. **Recargar la página** (Ctrl+Shift+R para hard reload)

3. **Volver a suscribirse** al producto

4. **Verificar que se registró de nuevo** el Service Worker

5. **Probar de nuevo** cambiando el estado del producto

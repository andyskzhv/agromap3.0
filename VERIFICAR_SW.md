# Verificar Service Worker

## Ejecuta estos comandos en la consola del navegador (donde te suscribiste)

Abre Chrome DevTools (F12) en la ventana donde te suscribiste y ejecuta:

```javascript
// 1. Verificar que el Service Worker está activo
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('📋 Service Worker registrado:', !!reg);
  if (reg) {
    console.log('✅ Activo:', !!reg.active);
    console.log('⏳ Instalando:', !!reg.installing);
    console.log('⏸️ Esperando:', !!reg.waiting);
    if (reg.active) {
      console.log('📝 Script URL:', reg.active.scriptURL);
      console.log('📊 Estado:', reg.active.state);
    }
  }
});

// 2. Verificar la suscripción push
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.pushManager.getSubscription().then(sub => {
      console.log('🔔 Suscripción push:', !!sub);
      if (sub) {
        console.log('📍 Endpoint:', sub.endpoint);
      } else {
        console.log('❌ No hay suscripción push activa');
      }
    });
  }
});

// 3. Verificar permisos
console.log('🔐 Permiso de notificaciones:', Notification.permission);
```

## Si el Service Worker NO está activo o NO hay suscripción:

Esto significa que necesitamos recargar el Service Worker. Ejecuta:

```javascript
// Forzar actualización del Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.update().then(() => {
      console.log('✅ Service Worker actualizado');
      location.reload();
    });
  }
});
```

## Verificar en DevTools > Application

1. Abre DevTools (F12)
2. Ve a la pestaña **Application**
3. En el menú izquierdo, haz clic en **Service Workers**
4. Deberías ver algo como:

```
Source: service-worker.js
Status: activated and is running
Received: [timestamp]
```

5. Si dice **waiting** o **installing**, haz clic en "skipWaiting"

## Probar notificación local

```javascript
// Esto SÍ debería funcionar (notificación local, no push)
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.showNotification('Prueba Local', {
      body: 'Si ves esto, las notificaciones locales funcionan',
      icon: '/logo.png'
    });
  }
});
```

Si esta notificación **SÍ aparece**, significa que:
- ✅ Service Worker funciona
- ✅ Permisos correctos
- ❌ El problema está en recibir push events del servidor

## Actualizar Service Worker

Si el Service Worker está "cacheado" con una versión antigua, necesitas:

1. En DevTools > Application > Service Workers
2. Marca la casilla **"Update on reload"**
3. Recarga la página (Ctrl+Shift+R)
4. Desuscríbete y vuelve a suscribirte al producto
5. Prueba de nuevo

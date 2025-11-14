# Sistema de Notificaciones Push - Agromap

## 📱 ¿Qué es?

Un sistema de notificaciones web push que permite a los usuarios **suscribirse a productos específicos** y recibir notificaciones cuando esos productos cambien de estado a **DISPONIBLE**.

## ✨ Características

- ✅ Notificaciones push nativas del navegador
- ✅ Funciona incluso con el navegador cerrado
- ✅ Suscripción por producto específico de un mercado
- ✅ Botón inteligente que solo aparece cuando es relevante
- ✅ Compatible con Chrome, Firefox, Edge (desktop y móvil)

## 🎯 Flujo de Usuario

### Para Consumidores:

1. **Navegar a un producto**: El usuario entra a la página de detalle de un producto
2. **Ver botón de notificación**: Si el producto está NO DISPONIBLE, verá el botón "Notificarme cuando esté disponible"
3. **Suscribirse**: Al hacer clic, el navegador pedirá permiso para enviar notificaciones
4. **Recibir notificación**: Cuando el gestor del mercado marque el producto como DISPONIBLE, el usuario recibirá una notificación instantánea

### Para Gestores:

1. **Actualizar producto**: El gestor entra a "Gestión de Productos"
2. **Cambiar estado**: Cambia el estado del producto de "No disponible" a "Disponible"
3. **Notificación automática**: El sistema automáticamente envía notificaciones a todos los usuarios suscritos

## 🔧 Implementación Técnica

### Backend

**Base de datos**: Nueva tabla `suscripciones_productos`
```prisma
model SuscripcionProducto {
  id         Int
  usuarioId  Int
  productoId Int
  endpoint   String  // URL del endpoint de push
  p256dh     String  // Clave pública
  auth       String  // Clave de autenticación
  creadoEn   DateTime
}
```

**API Endpoints**:
- `GET /api/suscripciones/public-key` - Obtener clave pública VAPID
- `POST /api/suscripciones/suscribirse` - Suscribirse a un producto
- `POST /api/suscripciones/desuscribirse/:productoId` - Desuscribirse
- `GET /api/suscripciones/verificar/:productoId` - Verificar suscripción
- `GET /api/suscripciones/mis-suscripciones` - Listar suscripciones del usuario

**Librería**: `web-push` para enviar notificaciones

**Configuración** (`.env`):
```env
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="mailto:info@agromap.com"
```

### Frontend

**Service Worker**: `/public/service-worker.js`
- Escucha eventos `push` del navegador
- Muestra notificaciones visuales
- Maneja clics en notificaciones (navega al producto)

**Componente**: `BotonNotificacion.jsx`
- Verifica soporte del navegador
- Solicita permisos
- Gestiona suscripciones
- Estados visuales (suscrito/no suscrito/cargando)

**Servicio**: `suscripcion.service.js`
- Utilidades para manejar Push API
- Comunicación con backend
- Conversión de claves VAPID

## 🧪 Cómo Probar

### 1. Preparar el entorno

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm start
```

### 2. Como Usuario (Chrome recomendado)

1. Abrir http://localhost:3000
2. Iniciar sesión con un usuario normal
3. Buscar un producto que esté NO DISPONIBLE
4. Hacer clic en "Notificarme cuando esté disponible"
5. Aceptar el permiso de notificaciones
6. Verificar que el botón cambie a "Notificaciones activadas" 🔔

### 3. Como Gestor

1. En otra ventana/perfil, iniciar sesión como gestor
2. Ir a "Gestión de Productos"
3. Buscar el mismo producto
4. Cambiar estado a "Disponible"
5. Guardar cambios

### 4. Verificar Notificación

¡Deberías recibir una notificación instantánea! Incluso si tienes el navegador minimizado.

La notificación mostrará:
- **Título**: "¡[Producto] ya está disponible!"
- **Cuerpo**: "[Mercado] en [Municipio], [Provincia]"
- **Icono**: Imagen del producto
- **Acciones**: "Ver producto" o "Cerrar"

## 🔍 Casos de Uso

### Usuario suscrito, producto pasa a disponible
✅ Recibe notificación

### Usuario suscrito, producto ya disponible
✅ Puede desuscribirse
✅ Botón muestra "Notificaciones activadas"

### Usuario no autenticado
❌ No ve el botón de notificación

### Producto ya disponible, usuario no suscrito
❌ No ve el botón (no tiene sentido suscribirse si ya está disponible)

### Usuario cierra sesión
✅ Suscripciones se mantienen en el navegador
✅ Al volver a iniciar sesión, seguirán activas

## 🛠️ Solución de Problemas

### "No recibo notificaciones"

1. **Verificar permisos del navegador**:
   - Chrome: `chrome://settings/content/notifications`
   - Firefox: Configuración > Privacidad > Permisos > Notificaciones
   - Asegurarse que `localhost:3000` tenga permiso

2. **Verificar Service Worker**:
   - Abrir DevTools > Application > Service Workers
   - Debe aparecer registrado `/service-worker.js`

3. **Verificar suscripción en backend**:
   - Abrir http://localhost:5000 (backend)
   - Ir a Prisma Studio: `npx prisma studio`
   - Revisar tabla `suscripciones_productos`

### "El botón no aparece"

- ¿Estás autenticado?
- ¿El producto está NO DISPONIBLE?
- Si está disponible, solo verás el botón si ya estabas suscrito antes

### "Error al suscribirse"

- Verificar que las claves VAPID estén en `.env`
- Verificar que el backend esté corriendo
- Verificar consola del navegador para errores

## 📊 Métricas

El sistema permite obtener estadísticas:

```javascript
// Obtener todas las suscripciones de un usuario
GET /api/suscripciones/mis-suscripciones

// Respuesta:
[
  {
    "id": 1,
    "productoId": 5,
    "producto": {
      "nombre": "Tomate",
      "mercado": {
        "nombre": "Mercado Central",
        "provincia": "La Habana"
      }
    }
  }
]
```

## 🚀 Próximas Mejoras

- [ ] Notificaciones por cambio de precio
- [ ] Resumen semanal de productos favoritos
- [ ] Notificaciones de nuevos productos en mercados cercanos
- [ ] Gestión de suscripciones desde perfil de usuario
- [ ] Historial de notificaciones recibidas

## 📝 Notas Importantes

- **HTTPS en producción**: Las notificaciones push requieren HTTPS (excepto localhost)
- **Navegadores soportados**: Chrome 50+, Firefox 44+, Edge 17+, Safari 16+ (macOS/iOS)
- **Límites**: No hay límite de suscripciones por usuario
- **Privacidad**: Las suscripciones son anónimas para el backend (solo guarda el endpoint)
- **Expiración**: Las suscripciones pueden expirar (el sistema las elimina automáticamente)

## 🔐 Seguridad

- Claves VAPID únicas por aplicación
- Tokens de push encriptados
- Autenticación JWT requerida para suscribirse
- Validación de permisos antes de enviar notificaciones

## 📱 Compatibilidad Móvil

### Android (Chrome/Firefox)
✅ Funciona perfectamente
✅ Notificaciones incluso con app cerrada

### iOS (Safari 16.4+)
✅ Funciona desde iOS 16.4
⚠️ Requiere agregar app a pantalla de inicio primero
⚠️ Soporte limitado en versiones antiguas

## 🎓 Recursos

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Push API MDN](https://developer.mozilla.org/es/docs/Web/API/Push_API)
- [Service Worker MDN](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)

# 📱 Acceso desde Móvil - Agromap

## ✅ Configuración Completada

Ya he configurado tu aplicación para que sea accesible desde tu móvil en la misma red WiFi.

## 🌐 Tu IP Local

**IP WiFi:** `172.21.8.76`

## 🚀 Cómo Acceder desde tu Móvil

### Paso 1: Asegúrate de tener los servidores corriendo

En tu computadora, abre dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Paso 2: Conecta tu móvil al mismo WiFi

- Conecta tu móvil a la **misma red WiFi** que tu computadora
- Red actual de tu PC: Verifica que estés conectado a tu WiFi habitual

### Paso 3: Abre en tu móvil

En el navegador de tu móvil, ve a:

```
http://172.21.8.76:3000
```

## 🔧 Verificación del Firewall (Windows)

Si no puedes acceder, permite el tráfico en el firewall:

1. **Opción Rápida - Desactivar temporalmente:**
   - Panel de Control → Firewall de Windows Defender
   - "Activar o desactivar Firewall de Windows Defender"
   - Desactivar para red privada (solo para probar)

2. **Opción Recomendada - Crear reglas:**

   Abre PowerShell como Administrador y ejecuta:

   ```powershell
   # Permitir puerto 3000 (Frontend)
   New-NetFirewallRule -DisplayName "React Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

   # Permitir puerto 5000 (Backend)
   New-NetFirewallRule -DisplayName "Express API Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

## 🧪 Probar la Conexión

### Desde tu móvil, prueba:

**Backend:**
```
http://172.21.8.76:5000
```
Deberías ver: `{"message":"¡Bienvenido a Agromap API!","version":"1.0.0","status":"online"}`

**Frontend:**
```
http://172.21.8.76:3000
```
Deberías ver la página de Agromap

## 📍 Probar Geolocalización

1. Abre `http://172.21.8.76:3000/mercados` en tu móvil
2. Permite el permiso de ubicación cuando te lo pida
3. Toca el botón de ubicación (círculo con crosshair)
4. El mapa debería centrarse en tu ubicación actual
5. Activa "Ordenar por distancia" para ver los mercados más cercanos

## ⚠️ Notas Importantes

- **HTTPS no requerido:** La geolocalización funciona con HTTP en redes locales
- **Misma red WiFi:** Ambos dispositivos deben estar en la misma red
- **IP puede cambiar:** Si reinicias el router, tu IP podría cambiar
- **Solo en red local:** No es accesible desde internet (seguro)

## 🐛 Solución de Problemas

### "No se puede conectar al servidor"
- Verifica que ambos terminales estén corriendo
- Confirma que estás en la misma red WiFi
- Revisa el firewall de Windows

### "La geolocalización no funciona"
- Verifica que el navegador tenga permisos de ubicación
- Asegúrate de que el GPS esté activado en tu móvil
- Algunos navegadores requieren HTTPS (prueba con Chrome/Safari)

### "Las imágenes no se ven"
- Normal si no hay imágenes cargadas
- Las imágenes se sirven desde: `http://172.21.8.76:5000/uploads/`

## 📊 Otros Dispositivos

Puedes usar la misma IP para acceder desde:
- Tablets
- Otros móviles
- Otras computadoras en la misma red

---

## 🌍 Alternativas para Acceso Externo (Internet)

Si quieres acceder desde cualquier lugar (no solo WiFi local):

### Opción 1: Ngrok (Recomendado para testing)
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer frontend
ngrok http 3000

# En otra terminal, exponer backend
ngrok http 5000
```

### Opción 2: Deploy en Hosting
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Render, Railway, Heroku
- **Base de datos:** Supabase, Railway PostgreSQL

¿Necesitas ayuda con alguna de estas opciones? ¡Dímelo!

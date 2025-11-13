# Script de Seed - Base de Datos AgroMap

Este script puebla la base de datos con datos de prueba para facilitar el desarrollo y testing de la aplicación.

## 🚀 Uso

Para ejecutar el script de seed:

```bash
cd backend
npm run seed
```

O usando Prisma directamente:

```bash
cd backend
npx prisma db seed
```

## 📊 Datos Creados

El script crea los siguientes datos:

### 👥 Usuarios (14 total)

**1 Administrador:**
- Usuario: `admin`
- Contraseña: `123456`
- Rol: ADMIN

**5 Gestores de Mercado:**
- Usuario: `gestor1` a `gestor5`
- Contraseña: `123456`
- Rol: GESTOR
- Provincias: Villa Clara, Sancti Spíritus, Matanzas, Cienfuegos

**8 Usuarios Regulares:**
- Usuario: `usuario1` a `usuario8`
- Contraseña: `123456`
- Rol: USUARIO

### 📂 Categorías (5)

1. **Frutas** - Frutas frescas y de temporada
2. **Vegetales** - Vegetales y hortalizas frescas
3. **Viandas** - Tubérculos y raíces
4. **Granos** - Granos y legumbres
5. **Condimentos** - Condimentos y especias

### 📋 Plantillas de Productos (20)

Plantillas pre-configuradas para productos agrícolas cubanos:

**Frutas:**
- Mango, Guayaba, Piña, Aguacate, Plátano

**Vegetales:**
- Tomate, Lechuga, Pepino, Calabaza, Col

**Viandas:**
- Yuca, Boniato, Malanga, Papa

**Granos:**
- Frijoles Negros, Frijoles Colorados, Maíz

**Condimentos:**
- Ajo, Cebolla, Ají

### 🏪 Mercados (6)

1. **Mercado Agropecuario Santa Clara** (Villa Clara)
2. **Agromercado El Uvero** (Villa Clara - Placetas)
3. **Mercado La Plaza** (Sancti Spíritus)
4. **Agromercado Trinidad** (Sancti Spíritus - Trinidad)
5. **Mercado de Matanzas** (Matanzas)
6. **Agromercado Cienfuegos Centro** (Cienfuegos)

### 🥬 Productos (~64)

Cada mercado tiene entre 9 y 15 productos diferentes, todos basados en plantillas.
Los productos incluyen:
- Precios variables (10-60 CUP)
- Cantidades aleatorias
- Diferentes unidades de medida (KG, LB, UNIDAD)
- Tipos especiales (Orgánico, Premium, Cosecha local, etc.)

### ⭐ Valoraciones (~302)

- Cada producto tiene entre 2 y 8 valoraciones
- Calificaciones entre 3 y 5 estrellas
- Cada usuario solo puede valorar un producto una vez

### 💬 Comentarios (~175)

- Cada producto tiene entre 1 y 5 comentarios
- Comentarios variados con opiniones positivas
- Indicador de "recomienda" (70% de probabilidad)
- Likes aleatorios (0-15)
- Cada usuario solo puede comentar un producto una vez

## ⚠️ Importante

- **Este script ELIMINA todos los datos existentes** antes de crear los nuevos
- Solo debe usarse en entornos de desarrollo
- NO ejecutar en producción con datos reales

## 🔄 Resetear Base de Datos

Si necesitas resetear completamente la base de datos y ejecutar el seed:

```bash
cd backend
npx prisma migrate reset
```

Esto:
1. Elimina la base de datos
2. Crea una nueva base de datos
3. Aplica todas las migraciones
4. Ejecuta el seed automáticamente

## 📝 Notas

- Todos los usuarios tienen la misma contraseña: `123456`
- Los productos están distribuidos realísticamente entre mercados
- Las valoraciones y comentarios son generados aleatoriamente
- Cada plantilla aparece en múltiples mercados para demostrar la funcionalidad
- Los datos son representativos de productos agrícolas cubanos

## 🧪 Testing

Puedes usar estos datos para probar:

1. **Vista de usuario:**
   - Login: `usuario1` / `123456`
   - Explorar mercados y productos
   - Ver valoraciones y comentarios

2. **Vista de gestor:**
   - Login: `gestor1` / `123456`
   - Gestión de productos del mercado
   - Crear nuevos productos desde plantillas

3. **Vista de administrador:**
   - Login: `admin` / `123456`
   - Gestión completa del sistema
   - Ver estadísticas
   - Administrar categorías y plantillas

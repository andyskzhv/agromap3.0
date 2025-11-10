# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Running the Application

```bash
# Terminal 1: Start Backend (port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (port 3000)
cd frontend
npm start
```

### Prisma Commands

```bash
# Create and run a new migration
npx prisma migrate dev --name <migration_name>

# Push schema changes to database (development)
npx prisma db push

# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

## Architecture Overview

**Agromap** is a full-stack agricultural marketplace connecting farmers and consumers. It uses a traditional client-server architecture with JWT authentication.

### Backend (Express + Prisma + PostgreSQL)

**Structure**: MVC-style pattern with controllers, routes, and Prisma as the data layer.

```
backend/src/
├── index.js                    # Express app setup & route mounting
├── controllers/                # Business logic (7 controllers)
├── routes/                     # API endpoint definitions (7 route files)
├── middleware/
│   ├── auth.middleware.js      # JWT verification & RBAC
│   └── upload.middleware.js    # Multer file upload configs
```

**API Base URL**: `http://localhost:5000/api`

**Authentication Flow**:
1. User registers/logs in with `nombreUsuario` and `contrasena`
2. Password hashed with bcryptjs (salt rounds: 10)
3. JWT token issued (7-day expiration)
4. Token sent via `Authorization: Bearer <token>` header

**Role-Based Access Control**:
- `USUARIO` (default): Can create comments
- `GESTOR`: Can manage mercados and productos
- `ADMIN`: Full system access

**Middleware Chain**:
```javascript
verificarToken → verificarRol(...roles) → controller
// Shortcuts: verificarAdmin, verificarGestorOAdmin
```

### Frontend (React + React Router)

**Structure**: Component-based with centralized API service layer.

```
frontend/src/
├── App.js                      # Main router
├── components/                 # Navbar, Breadcrumbs, Toast, Pagination
├── pages/                      # 10 route components
├── services/api.js             # Axios instance + all API methods
```

**State Management**:
- localStorage: JWT token storage
- Context API: Toast notifications
- Component state: useState hooks

**API Service Pattern**: `services/api.js` exports service objects for each resource:
```javascript
authService.registro(formData)
mercadoService.obtenerTodos()
productoService.crear(data)
// etc.
```

## Database Schema (Prisma)

### Core Models

**Usuario** (Users)
- Authentication: `nombreUsuario` (unique), `contrasena` (hashed)
- Profile: `nombre`, `imagen`, `rol`, `provincia`
- Relations: owns `Mercado[]`, writes `Comentario[]`

**Mercado** (Markets)
- Location: `provincia`, `municipio`, `latitud`, `longitud`
- Manager: `gestorId` (FK to Usuario)
- Contains: `Producto[]`

**Producto** (Products)
- Details: `nombre`, `descripcion`, `imagenes[]`, `precio`
- Category: `categoriaId` (FK to Categoria)
- Status: `estado` (DISPONIBLE | NO_DISPONIBLE)
- Location: `mercadoId` (FK to Mercado)

**Categoria** (Categories)
- Fields: `nombre` (unique), `descripcion`, `activa`
- Relations: `Producto[]`, `PlantillaProducto[]`

**Comentario** (Comments)
- Content: `texto`, `recomienda` (boolean)
- Engagement: `likes` (integer)
- Relations: `usuarioId`, `productoId`

### Recent Database Changes

- **November 2024**: Migrated from `correo` to `nombreUsuario` for authentication
- **Category Refactoring**: Extracted `categoria` from string field to proper `Categoria` model

## API Endpoints

All endpoints use `/api` prefix. Authentication via `Authorization: Bearer <token>`.

### Auth (`/api/auth`)
- `POST /registro` - Register (multipart: imagen)
- `POST /login` - Login
- `GET /perfil` - Get profile (protected)
- `PUT /perfil` - Update profile (protected, multipart)

### Mercados (`/api/mercados`)
- `GET /` - List all
- `GET /:id` - Get details
- `GET /mi/mercado` - Get my market (GESTOR/ADMIN)
- `POST /` - Create (GESTOR/ADMIN, multipart)
- `PUT /:id` - Update (GESTOR/ADMIN, multipart)
- `DELETE /:id` - Delete (ADMIN)

### Productos (`/api/productos`)
- `GET /` - List with filters (provincia, categoria, tipo, estado, mercadoId)
- `GET /:id` - Get details
- `GET /mis/productos` - Get my products (GESTOR/ADMIN)
- `POST /` - Create (GESTOR/ADMIN, multipart: up to 10 images)
- `PUT /:id` - Update (GESTOR/ADMIN, multipart)
- `DELETE /:id` - Delete (GESTOR/ADMIN)

### Comentarios (`/api/comentarios`)
- `GET /producto/:productoId` - Get product comments
- `POST /` - Create (protected)
- `PUT /:id` - Update (protected)
- `DELETE /:id` - Delete (protected)
- `POST /:id/like` - Add like (protected)
- `POST /:id/unlike` - Remove like (protected)

### Categorias (`/api/categorias`)
- `GET /` - List all
- `GET /:id` - Get details
- `POST /` - Create (ADMIN)
- `PUT /:id` - Update (ADMIN)
- `DELETE /:id` - Delete (ADMIN)

### Plantillas (`/api/plantillas`)
- `GET /` - List all
- `GET /:id` - Get details
- `POST /` - Create (ADMIN, multipart: imagen)
- `PUT /:id` - Update (ADMIN, multipart)
- `DELETE /:id` - Delete (ADMIN)

### Admin (`/api/admin` - All require ADMIN)
- `GET /estadisticas` - System statistics
- `GET /actividad` - Recent activity
- `GET /usuarios` - List all users
- `POST /usuarios` - Create user (multipart)
- `PUT /usuarios/:id/rol` - Change role
- `DELETE /usuarios/:id` - Delete user
- `GET /mercados` - List all markets
- `GET /productos` - List all products
- `GET /comentarios` - List all comments

## File Upload System

**Multer Configuration** (`upload.middleware.js`):

| Type | Storage Path | Limit | Formats |
|------|--------------|-------|---------|
| uploadPerfiles | `/uploads/perfiles/` | 5MB | JPEG, JPG, PNG, GIF, WebP |
| uploadProductos | `/uploads/productos/` | 5MB | JPEG, JPG, PNG, GIF, WebP |
| uploadPlantillas | `/uploads/plantillas/` | 5MB | JPEG, JPG, PNG, GIF, WebP |

**Filename format**: `{type}-{timestamp}-{random}.{ext}`

**Frontend handling**:
```javascript
const formData = new FormData();
formData.append('imagen', file);           // Single file
formData.append('imagenes', file);         // Multiple files (productos)
await service.method(formData);            // API detects FormData
```

## Adding Features

### New API Endpoint

1. **Backend**:
   - Add controller function: `src/controllers/{resource}.controller.js`
   - Add route: `src/routes/{resource}.routes.js`
   - Mount route in `src/index.js`

2. **Frontend**:
   - Add service method: `src/services/api.js`
   - Use in component

### New Page

1. Create component: `frontend/src/pages/{PageName}.jsx`
2. Add route in `App.js`
3. Add navigation link in `Navbar.jsx` (if needed)

### Database Migration

```bash
cd backend
npx prisma migrate dev --name <descriptive_name>
# Example: npx prisma migrate dev --name add_user_status
```

## Configuration

**Backend `.env`**:
```
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/agromap?schema=public"
JWT_SECRET="agromap_secret_key_2024_secure"
PORT=5000
```

**Frontend API URL** (`services/api.js`):
```javascript
const API_URL = 'http://localhost:5000/api';
```

## Important Notes

- **Authentication**: Username-based (`nombreUsuario`), not email
- **Password Requirements**: Minimum 6 characters, bcrypt-hashed
- **File Uploads**: Max 5MB per file, 10 images max for productos
- **JWT Expiration**: 7 days
- **Database**: PostgreSQL on localhost:5432
- **Ports**: Backend (5000), Frontend (3000)

## Common Issues

**Database Connection**: Verify PostgreSQL is running and DATABASE_URL is correct
**JWT Errors**: Check JWT_SECRET matches, verify token format: `Bearer <token>`
**File Upload Errors**: Confirm file size < 5MB, check upload directory permissions
**CORS Issues**: CORS enabled by default, verify API URL matches backend

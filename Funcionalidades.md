## **Funcionalidades del Proyecto**

El proyecto **"Qualifica o seu professor"** es una plataforma para calificar y comentar profesores universitarios. Tiene 4 módulos principales:

### **1. Autenticación y Autorización (Auth)**
- JWT para proteger rutas
- Roles: `superadmin` y `user` (estudiante)
- Solo superadmin puede registrar nuevos usuarios

### **2. Gestión de Usuarios (Users)**
- CRUD completo (solo para superadmin)
- Perfil propio (cualquier usuario autenticado)
- Filtros de búsqueda y paginación

### **3. Gestión de Universidades (Universities)**
- CRUD completo (solo superadmin)
- Listado público

### **4. Gestión de Profesores (Professors)**
- CRUD completo (solo superadmin)
- Listado público con filtros por universidad y nombre
- Relación con universidades

### **5. Sistema de Comentarios (Comments)**
- Crear comentarios (requiere auth)
- Listado público con filtros
- Editar/eliminar: solo dueño o admin

---

##  **Endpoints para Migrar a NestJS**

### **AUTH (`/api/auth`)**

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Superadmin | Registrar nuevo usuario |
| POST | `/api/auth/login` | Público | Login (devuelve JWT) |
| GET | `/api/auth/me` | Autenticado | Obtener perfil propio |

**Body de registro:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 6)",
  "role": "superadmin | user"
}
```

**Body de login:**
```json
{
  "email": "string",
  "password": "string"
}
```

---

### **USERS (`/api/users`)**

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/users/me` | Autenticado | Mi perfil |
| GET | `/api/users` | Superadmin | Listar usuarios (con filtros y paginación) |
| GET | `/api/users/:id` | Superadmin | Obtener usuario por ID |
| PUT/PATCH | `/api/users/:id` | Superadmin | Actualizar usuario |
| DELETE | `/api/users/:id` | Superadmin | Eliminar usuario |

**Query params de listado:**
```
?q=nombre/email&role=superadmin|user&page=1&limit=20
```

**Body de actualización:**
```json
{
  "name": "string (opcional)",
  "email": "string (opcional)",
  "password": "string (opcional)",
  "role": "superadmin | user (opcional)"
}
```

---

### **UNIVERSITIES (`/api/universities`)**

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/universities` | Público | Listar universidades |
| GET | `/api/universities/:id` | Público | Obtener universidad por ID |
| POST | `/api/universities` | Superadmin | Crear universidad |
| PUT/PATCH | `/api/universities/:id` | Superadmin | Actualizar universidad |
| DELETE | `/api/universities/:id` | Superadmin | Eliminar universidad |

**Body de crear/actualizar:**
```json
{
  "name": "string (2-120 chars)",
  "country": "string (opcional)",
  "city": "string (opcional)"
}
```

---

### **PROFESSORS (`/api/professors`)**

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/professors` | Público | Listar profesores (con filtros) |
| GET | `/api/professors/:id` | Público | Obtener profesor por ID |
| POST | `/api/professors` | Superadmin | Crear profesor |
| PUT/PATCH | `/api/professors/:id` | Superadmin | Actualizar profesor |
| DELETE | `/api/professors/:id` | Superadmin | Eliminar profesor |

**Query params de listado:**
```
?university=ID&q=nombre
```

**Body de crear/actualizar:**
```json
{
  "name": "string",
  "university": "ObjectId (referencia a university)"
}
```

---

### **COMMENTS (`/api/comments`)**

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/comments` | Público | Listar comentarios (con filtros y paginación) |
| GET | `/api/comments/:id` | Público | Obtener comentario por ID |
| POST | `/api/comments` | Autenticado | Crear comentario |
| PUT/PATCH | `/api/comments/:id` | Dueño o Admin | Actualizar comentario |
| DELETE | `/api/comments/:id` | Dueño o Admin | Eliminar comentario |

**Query params de listado:**
```
?professor=ID&user=ID&q=texto&page=1&limit=20
```

**Body de crear:**
```json
{
  "professor": "ObjectId",
  "content": "string"
}
```

**Body de actualizar:**
```json
{
  "content": "string"
}
```

---

##  **Middlewares/Guards a Implementar en NestJS**

1. **`requireAuth`** → `JwtAuthGuard` (validar JWT)
2. **`requireRole('superadmin')`** → `RolesGuard` con decorador `@Roles()`
3. **`ownerOrAdmin`** → Guard personalizado para comments
4. **Validación Zod** → Usar `class-validator` + DTOs en NestJS

---

##  **Relaciones entre Modelos**

```
User (1) ──┬─> (N) Comments
           │
Professor (N) <─── (1) University
           │
           └─> (N) Comments
```

---

## ✅ **Checklist de Migración**

- [ ] Módulo Auth (JWT Strategy, Guards, DTOs)
- [ ] Módulo Users (CRUD + perfil)
- [ ] Módulo Universities (CRUD público/admin)
- [ ] Módulo Professors (CRUD + populate university)
- [ ] Módulo Comments (CRUD + lógica dueño/admin)
- [ ] Middlewares → Guards de NestJS
- [ ] Validación Zod → class-validator
- [ ] MongoDB + Mongoose (compatible con NestJS)
- [ ] Rate limiting (usar `@nestjs/throttler`)
- [ ] Testing (Jest ya está configurado)

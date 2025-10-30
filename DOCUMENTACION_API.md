# Documentación de la API - Qualifica o Seu Professor

## Información General

- **Base URL**: `/api`
- **Documentación Swagger**: `http://localhost:3000/api/docs`
- **Autenticación**: Bearer Token (JWT)

---

## Índice

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Universidades](#universidades)
4. [Profesores](#profesores)
5. [Comentarios](#comentarios)
6. [Seed](#seed)
7. [Health Check](#health-check)

---

## Autenticación

**Base Path**: `/api/auth`

### 1. Registrar Usuario

**POST** `/api/auth/register`

**Descripción**: Registra un nuevo usuario en el sistema. Los estudiantes pueden registrarse a sí mismos, pero solo los administradores pueden crear otros administradores.

**Acceso**: Público (pero con validación de roles si se está autenticado)

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student" // o "admin"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Errores**:
- `400`: Datos inválidos
- `409`: Email ya existe
- `403`: Solo administradores pueden crear otros administradores

---

### 2. Iniciar Sesión

**POST** `/api/auth/login`

**Descripción**: Autentica un usuario y devuelve un token de acceso JWT.

**Acceso**: Público

**Body**:
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Errores**:
- `400`: Datos inválidos
- `401`: Credenciales inválidas

---

### 3. Obtener Perfil Actual

**GET** `/api/auth/me`

**Descripción**: Obtiene la información del perfil del usuario autenticado.

**Acceso**: Requiere autenticación

**Headers**:
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `401`: No autorizado

---

## Usuarios

**Base Path**: `/api/users`

### 1. Crear Usuario

**POST** `/api/users`

**Descripción**: Crea un nuevo usuario. Solo administradores pueden crear usuarios.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "student"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `403`: Solo administradores pueden crear usuarios
- `409`: Email ya existe

---

### 2. Listar Todos los Usuarios

**GET** `/api/users`

**Descripción**: Obtiene una lista de todos los usuarios del sistema.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Errores**:
- `403`: Solo administradores pueden acceder

---

### 3. Obtener Perfil Propio

**GET** `/api/users/me`

**Descripción**: Obtiene el perfil del usuario autenticado.

**Acceso**: Requiere autenticación

**Headers**:
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `401`: No autorizado

---

### 4. Obtener Usuario por ID

**GET** `/api/users/:id`

**Descripción**: Obtiene un usuario específico por su ID.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del usuario

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `403`: Solo administradores pueden acceder
- `404`: Usuario no encontrado

---

### 5. Actualizar Usuario

**PATCH** `/api/users/:id`

**Descripción**: Actualiza la información de un usuario específico.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del usuario

**Body** (campos opcionales):
```json
{
  "email": "newemail@example.com",
  "name": "New Name",
  "role": "admin"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "email": "newemail@example.com",
  "name": "New Name",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `403`: Solo administradores pueden actualizar
- `404`: Usuario no encontrado

---

### 6. Eliminar Usuario

**DELETE** `/api/users/:id`

**Descripción**: Elimina un usuario del sistema.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del usuario

**Respuesta Exitosa (200)**:
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Errores**:
- `403`: Solo administradores pueden eliminar
- `404`: Usuario no encontrado

---

## Universidades

**Base Path**: `/api/universities`

### 1. Listar Todas las Universidades

**GET** `/api/universities`

**Descripción**: Obtiene una lista de todas las universidades.

**Acceso**: Público

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": "uuid",
    "name": "University of Example",
    "location": "Example City",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Obtener Universidad por ID

**GET** `/api/universities/:id`

**Descripción**: Obtiene una universidad específica por su ID.

**Acceso**: Público

**Parámetros URL**:
- `id`: UUID de la universidad

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "name": "University of Example",
  "location": "Example City",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `404`: Universidad no encontrada

---

### 3. Crear Universidad

**POST** `/api/universities`

**Descripción**: Crea una nueva universidad.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Body**:
```json
{
  "name": "New University",
  "location": "New City"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "id": "uuid",
  "name": "New University",
  "location": "New City",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `403`: Solo administradores pueden crear universidades

---

### 4. Actualizar Universidad

**PATCH** `/api/universities/:id`

**Descripción**: Actualiza la información de una universidad.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID de la universidad

**Body** (campos opcionales):
```json
{
  "name": "Updated University Name",
  "location": "Updated Location"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "name": "Updated University Name",
  "location": "Updated Location",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `403`: Solo administradores pueden actualizar
- `404`: Universidad no encontrada

---

### 5. Eliminar Universidad

**DELETE** `/api/universities/:id`

**Descripción**: Elimina una universidad del sistema.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID de la universidad

**Respuesta Exitosa (200)**:
```json
{
  "message": "University deleted successfully"
}
```

**Errores**:
- `403`: Solo administradores pueden eliminar
- `404`: Universidad no encontrada

---

## Profesores

**Base Path**: `/api/professors`

### 1. Listar Todos los Profesores

**GET** `/api/professors`

**Descripción**: Obtiene una lista de todos los profesores con opciones de filtrado.

**Acceso**: Público

**Query Parameters** (opcionales):
- `university`: Filtrar por ID de universidad
- `q`: Buscar por nombre del profesor o departamento

**Ejemplos**:
```
GET /api/professors
GET /api/professors?university=uuid
GET /api/professors?q=Computer Science
GET /api/professors?university=uuid&q=Smith
```

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Dr. John Smith",
    "department": "Computer Science",
    "university": {
      "id": "uuid",
      "name": "University of Example",
      "location": "Example City"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Obtener Profesor por ID

**GET** `/api/professors/:id`

**Descripción**: Obtiene un profesor específico por su ID.

**Acceso**: Público

**Parámetros URL**:
- `id`: UUID del profesor

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "name": "Dr. John Smith",
  "department": "Computer Science",
  "university": {
    "id": "uuid",
    "name": "University of Example",
    "location": "Example City"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `404`: Profesor no encontrado

---

### 3. Crear Profesor

**POST** `/api/professors`

**Descripción**: Crea un nuevo profesor.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Body**:
```json
{
  "name": "Dr. Jane Doe",
  "department": "Mathematics",
  "universityId": "uuid"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "id": "uuid",
  "name": "Dr. Jane Doe",
  "department": "Mathematics",
  "university": {
    "id": "uuid",
    "name": "University of Example",
    "location": "Example City"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `403`: Solo administradores pueden crear profesores
- `404`: Universidad no encontrada

---

### 4. Actualizar Profesor

**PATCH** `/api/professors/:id`

**Descripción**: Actualiza la información de un profesor.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del profesor

**Body** (campos opcionales):
```json
{
  "name": "Dr. Updated Name",
  "department": "Updated Department",
  "universityId": "new-uuid"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "name": "Dr. Updated Name",
  "department": "Updated Department",
  "university": {
    "id": "new-uuid",
    "name": "University Name",
    "location": "City"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `403`: Solo administradores pueden actualizar
- `404`: Profesor no encontrado

---

### 5. Eliminar Profesor

**DELETE** `/api/professors/:id`

**Descripción**: Elimina un profesor del sistema.

**Acceso**: Solo Administradores

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del profesor

**Respuesta Exitosa (200)**:
```json
{
  "message": "Professor deleted successfully"
}
```

**Errores**:
- `403`: Solo administradores pueden eliminar
- `404`: Profesor no encontrado

---

## Comentarios

**Base Path**: `/api/comments`

### 1. Listar Todos los Comentarios

**GET** `/api/comments`

**Descripción**: Obtiene una lista de comentarios con opciones de filtrado y paginación.

**Acceso**: Público

**Query Parameters** (opcionales):
- `professor`: Filtrar por ID de profesor
- `user`: Filtrar por ID de usuario
- `q`: Buscar en el contenido de los comentarios
- `page`: Número de página (por defecto: 1)
- `limit`: Elementos por página (por defecto: 20)

**Ejemplos**:
```
GET /api/comments
GET /api/comments?professor=uuid
GET /api/comments?professor=uuid&page=1&limit=10
GET /api/comments?q=great
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Great professor!",
      "rating": 5,
      "professor": {
        "id": "uuid",
        "name": "Dr. John Smith",
        "department": "Computer Science"
      },
      "student": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 100
}
```

---

### 2. Obtener Comentario por ID

**GET** `/api/comments/:id`

**Descripción**: Obtiene un comentario específico por su ID.

**Acceso**: Público

**Parámetros URL**:
- `id`: UUID del comentario

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "content": "Great professor!",
  "rating": 5,
  "professor": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "department": "Computer Science"
  },
  "student": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `404`: Comentario no encontrado

---

### 3. Crear Comentario

**POST** `/api/comments`

**Descripción**: Crea un nuevo comentario/calificación para un profesor. Los estudiantes solo pueden comentar una vez por profesor.

**Acceso**: Requiere autenticación (Estudiantes)

**Headers**:
```
Authorization: Bearer {token}
```

**Body**:
```json
{
  "content": "Great professor!",
  "rating": 5,
  "professorId": "uuid"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "id": "uuid",
  "content": "Great professor!",
  "rating": 5,
  "professor": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "department": "Computer Science"
  },
  "student": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `401`: No autorizado
- `409`: Ya has comentado y calificado a este profesor

---

### 4. Actualizar Comentario

**PATCH** `/api/comments/:id`

**Descripción**: Actualiza un comentario específico. Solo el dueño del comentario o los administradores pueden actualizarlo.

**Acceso**: Requiere autenticación (Dueño o Administrador)

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del comentario

**Body** (campos opcionales):
```json
{
  "content": "Updated comment",
  "rating": 4
}
```

**Respuesta Exitosa (200)**:
```json
{
  "id": "uuid",
  "content": "Updated comment",
  "rating": 4,
  "professor": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "department": "Computer Science"
  },
  "student": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos
- `401`: No autorizado
- `403`: Solo el dueño del comentario o administradores pueden actualizar
- `404`: Comentario no encontrado

---

### 5. Eliminar Comentario

**DELETE** `/api/comments/:id`

**Descripción**: Elimina un comentario del sistema. Solo el dueño del comentario o los administradores pueden eliminarlo.

**Acceso**: Requiere autenticación (Dueño o Administrador)

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros URL**:
- `id`: UUID del comentario

**Respuesta Exitosa (200)**:
```json
{
  "message": "Comment deleted successfully"
}
```

**Errores**:
- `401`: No autorizado
- `403`: Solo el dueño del comentario o administradores pueden eliminar
- `404`: Comentario no encontrado

---

### 6. Obtener Calificación Promedio del Profesor

**GET** `/api/comments/professor/:professorId/rating`

**Descripción**: Obtiene el promedio de calificación y el total de comentarios para un profesor específico.

**Acceso**: Público

**Parámetros URL**:
- `professorId`: UUID del profesor

**Respuesta Exitosa (200)**:
```json
{
  "averageRating": 4.5,
  "totalComments": 25
}
```

**Errores**:
- `404`: Profesor no encontrado o no hay calificaciones disponibles

---

## Seed

**Base Path**: `/api/seed`

### 1. Ejecutar Seed

**POST** `/api/seed`

**Descripción**: Ejecuta el seed de la base de datos, creando datos de prueba: 100 usuarios, 80 universidades, 150 profesores, 400 comentarios usando Faker.js.

**Acceso**: Público

**Respuesta Exitosa (201)**:
```json
{
  "message": "Seed ejecutado exitosamente",
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@example.com"
    },
    "universities": 80,
    "professors": 150,
    "students": 99,
    "comments": 400
  }
}
```

**Nota**: Si la base de datos ya contiene datos, retorna 200 con mensaje informativo.

---

### 2. Ejecutar Unseed

**DELETE** `/api/seed`

**Descripción**: Elimina todos los datos creados por el seed (comentarios, profesores, universidades y estudiantes). Mantiene el usuario administrador.

**Acceso**: Público

**Respuesta Exitosa (200)**:
```json
{
  "message": "Unseed ejecutado exitosamente"
}
```

---

## Health Check

**Base Path**: `/api`

### Health Check

**GET** `/api/health`

**Descripción**: Endpoint para verificar el estado de la API.

**Acceso**: Público

**Respuesta Exitosa (200)**:
```json
{
  "status": "ok",
  "message": "Controller working!"
}
```

---

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o malformados
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: No tiene permisos para realizar esta acción
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: email ya existe, ya comentó al profesor)
- **500 Internal Server Error**: Error interno del servidor

---

## Autenticación

La mayoría de los endpoints requieren autenticación usando JWT (JSON Web Tokens). Para autenticarte:

1. Haz login o registra un usuario usando `/api/auth/login` o `/api/auth/register`
2. Obtendrás un token JWT en la respuesta
3. Incluye este token en el header `Authorization` de las solicitudes subsecuentes:

```
Authorization: Bearer {tu_token_aqui}
```

---

## Roles y Permisos

### Roles Disponibles:
- **student**: Estudiante
- **admin**: Administrador

### Permisos por Rol:

**Estudiante (student)**:
- Ver universidades, profesores y comentarios (públicos)
- Crear comentarios/calificaciones
- Actualizar y eliminar sus propios comentarios
- Ver su propio perfil

**Administrador (admin)**:
- Todas las funcionalidades de estudiante
- Crear, actualizar y eliminar usuarios
- Crear, actualizar y eliminar universidades
- Crear, actualizar y eliminar profesores
- Crear otros administradores

---

## Notas Adicionales

1. **Paginación**: Los endpoints de comentarios soportan paginación usando los query parameters `page` y `limit`.

2. **Filtrado**: Varios endpoints soportan filtrado y búsqueda mediante query parameters.

3. **Validación**: Todos los endpoints validan los datos de entrada. Los campos requeridos deben ser proporcionados y seguir los formatos correctos.

4. **Swagger UI**: Puedes explorar la API interactivamente en `http://localhost:3000/api/docs` cuando el servidor esté corriendo.

5. **UUIDs**: Todos los IDs son UUIDs (Universally Unique Identifiers).

6. **Timestamps**: Todas las entidades incluyen `createdAt` y `updatedAt` con formato ISO 8601.



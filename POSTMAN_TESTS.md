# Pruebas de Postman - Actualizaciones

## Cambios Realizados en la Colección

### 1. **Autenticación (Auth)**
- ✅ Actualizado `loginSuperAdmin` - Ahora espera código 200 y guarda `token` (no `accessToken`)
- ✅ Actualizado `registerAsSuperAdmin` - Cambiado rol de `user` a `student`, valida `user.id`
- ✅ Actualizado `loginNormalUser` - Usa `user0@example.com` del seed
- ✅ Actualizado `registerAsNormalUser` - Espera código 400 al intentar crear admin sin permisos
- ✅ Actualizado `loginIncorrectPassword` - Espera código 401
- ✅ Actualizado `registerNoToken` - Espera código 400 y valida array de errores
- ✅ Actualizado `meValidToken` - Valida `id` en lugar de `sub`
- ✅ Actualizado `meWithoutToken` - Valida mensaje "Unauthorized"

### 2. **Universidades (Universities)**
- ✅ Actualizado `Create University` - Guarda `id` en lugar de `_id`
- ✅ Actualizado `Get All Universities` - Sin autenticación (endpoint público)
- ✅ Actualizado `Get University By ID` - Sin autenticación, usa `{{universityId}}` dinámico
- ✅ Actualizado `Update University` - Cambiado de PUT a PATCH

### 3. **Profesores (Professors)**
- ✅ Actualizado `Create Professor` - Guarda `id` en lugar de `_id`
- ✅ Actualizado `Get All Professors` - Sin autenticación (endpoint público)
- ✅ Actualizado `Get Professor By ID` - Sin autenticación, usa `{{professorId}}` dinámico
- ✅ Actualizado `Update Professor` - Cambiado de PUT a PATCH

### 4. **Usuarios (Users)**
- ✅ Actualizado `Get All Users (Superadmin)` - Espera array directo, guarda `id` del primer usuario
- ✅ Actualizado `Get User By ID` - Valida `id` en lugar de `_id`

### 5. **Calificaciones (Ratings)** - ⚠️ PENDIENTE DE IMPLEMENTAR
Se cambió de "Comments" a "Ratings" con los siguientes endpoints:

#### Create Rating
- **Método:** POST
- **URL:** `/api/ratings`
- **Auth:** Bearer Token (userToken)
- **Body:**
```json
{
    "professor": "{{professorId}}",
    "rating": 5,
    "comment": "Excelente profesor, muy claro en sus explicaciones"
}
```
- **Validación:** Espera código 201 y propiedad `id`

#### Get All Ratings
- **Método:** GET
- **URL:** `/api/ratings`
- **Auth:** Sin autenticación (público)
- **Validación:** Espera código 200 y array

#### Get Rating By ID
- **Método:** GET
- **URL:** `/api/ratings/{{ratingId}}`
- **Auth:** Sin autenticación (público)
- **Validación:** Propiedades `rating` y `comment`

#### Update Rating
- **Método:** PATCH
- **URL:** `/api/ratings/{{ratingId}}`
- **Auth:** Bearer Token (userToken)
- **Body:**
```json
{
    "rating": 4,
    "comment": "Comentario actualizado - Muy buen profesor"
}
```
- **Validación:** Espera código 200

## Variables Globales Utilizadas

- `tokenAdmin` - Token del superadministrador
- `userToken` - Token del usuario normal
- `universityId` - ID de la universidad creada
- `professorId` - ID del profesor creado
- `ratingId` - ID de la calificación creada
- `userId` - ID del usuario

## Variables de Entorno Requeridas

- `dominio` - URL base de la API (ej: `http://localhost:3000`)

## Credenciales de Prueba

**Administrador:**
- Email: `admin@example.com`
- Password: `admin123`

**Usuario Normal:**
- Email: `user0@example.com`
- Password: `password123`

## Cambios Importantes

### IDs
- ✅ Cambiado de MongoDB ObjectID (`_id`) a PostgreSQL UUID (`id`)
- ✅ Todos los IDs ahora se guardan y usan dinámicamente desde las variables globales

### Métodos HTTP
- ✅ PUT cambiado a PATCH para actualizaciones parciales

### Códigos de Respuesta
- Login: Ahora retorna 200 (antes esperaba 200 pero recibía 201)
- Errores de autenticación: 401 Unauthorized
- Errores de validación: 400 Bad Request
- Sin permisos: 403 Forbidden

### Estructura de Respuestas
- Token en login: `token` (no `accessToken`)
- Usuario en respuestas: `user.id` (no `_id`)
- Arrays directos sin paginación (por ahora)

## Endpoints Pendientes de Implementar

### RatingsController y RatingsService

Necesitas implementar:

1. **POST /api/ratings** - Crear calificación
   - Requiere autenticación
   - Valida que el rating sea entre 1-5
   - Asigna automáticamente el studentId del usuario autenticado

2. **GET /api/ratings** - Listar todas las calificaciones
   - Público (sin autenticación)
   - Retorna array de calificaciones

3. **GET /api/ratings/:id** - Obtener calificación por ID
   - Público (sin autenticación)
   - Incluye relaciones con student y professor

4. **PATCH /api/ratings/:id** - Actualizar calificación
   - Requiere autenticación
   - Solo el creador puede actualizar
   - Permite actualizar rating y comment

5. **DELETE /api/ratings/:id** (opcional)
   - Requiere autenticación
   - Solo el creador o admin puede eliminar

### DTOs Sugeridos

**CreateRatingDto:**
```typescript
{
  rating: number;      // 1-5, required
  comment?: string;    // opcional
  professor: string;   // UUID, required
}
```

**UpdateRatingDto:**
```typescript
{
  rating?: number;     // 1-5, opcional
  comment?: string;    // opcional
}
```

## Orden de Ejecución de las Pruebas

1. `loginSuperAdmin` - Obtiene token de admin
2. `loginNormalUser` - Obtiene token de usuario normal
3. `Create University` - Crea universidad y guarda ID
4. `Create Professor` - Crea profesor y guarda ID
5. `Create Rating` - Crea calificación con el profesor creado
6. Resto de pruebas...

## Notas Adicionales

- Las pruebas ahora usan IDs dinámicos, no hardcodeados
- Los endpoints públicos no requieren autenticación
- Los métodos de actualización usan PATCH en lugar de PUT
- La colección está lista para ejecutarse una vez implementes los endpoints de ratings

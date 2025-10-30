# Qualifica o Seu Professor

API para calificar y evaluar profesores universitarios.

## 🚀 Características

- Autenticación JWT con roles (Admin/Student)
- CRUD de Universidades, Profesores y Calificaciones
- Sistema de seed automático con datos de prueba
- Documentación Swagger/OpenAPI
- Tests unitarios con Jest

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd qualifica-o-seu-professor-2
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tu configuración de base de datos.

4. Iniciar la base de datos con Docker (opcional):
```bash
docker-compose up -d
```

## 🎯 Uso

### Modo Desarrollo
```bash
npm run start:dev
```

### Modo Producción
```bash
npm run build
npm start
```

La API estará disponible en: `http://localhost:3000`

## 🌱 Sistema de Seed

El sistema de seed se ejecuta **automáticamente** al iniciar la aplicación. Si la base de datos está vacía, se creará:

- 1 usuario administrador
- 100 usuarios estudiantes
- 80 universidades
- 150 profesores
- 400 calificaciones

### Credenciales de Acceso

**Administrador:**
- Email: `admin@example.com`
- Password: `admin123`

**Usuarios normales:**
- Email: `user0@example.com` hasta `user99@example.com`
- Password: `password123`

### Ejecutar Seed Manualmente

También puedes ejecutar el seed mediante el endpoint:
```bash
POST http://localhost:3000/api/seed
```

## 📚 Documentación API

Una vez iniciada la aplicación, visita:
- Swagger UI: `http://localhost:3000/api/docs`

## 🧪 Tests

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:cov
```

## 📁 Estructura del Proyecto

```
src/
├── auth/          # Autenticación y autorización
├── common/        # Guards, decorators, enums compartidos
├── professors/    # Módulo de profesores
├── ratings/       # Módulo de calificaciones
├── seed/          # Sistema de seed automático
├── universities/  # Módulo de universidades
└── users/         # Módulo de usuarios
```

## 🔒 Autenticación

La API utiliza JWT Bearer tokens. Para acceder a endpoints protegidos:

1. Login:
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

2. Usar el token en los headers:
```
Authorization: Bearer <tu-token-jwt>
```

## 🛡️ Roles y Permisos

- **ADMIN**: Acceso completo a todos los endpoints
- **STUDENT**: Puede crear calificaciones y ver profesores/universidades

## 🐳 Docker

Iniciar servicios con Docker Compose:
```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432

## 📝 Licencia

MIT
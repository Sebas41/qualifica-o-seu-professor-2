# Taller: Backend – NestJS

**Docente:** Gustavo González  
**Entrega:** Miércoles, 30 de octubre de 2025  

---

## 1. Agregar GitHub Actions
Configurar **GitHub Actions** para ejecutar las pruebas antes de realizar un push.

## 2. Agregar Swagger
Implementar **Swagger** en los endpoints del proyecto para documentar la API.

---

##  Objetivo
Desarrollar una aplicación **backend robusta con NestJS**, que utilice **PostgreSQL** para la persistencia de datos, e implemente **pruebas unitarias y de integración**.

---

##  Requisitos mínimos

###  Seed (5%)
- Alimentar la base de datos con registros iniciales (por ejemplo, un usuario `admin`).
- Incluir un **endpoint o script** que permita el cargue inicial de los datos.

---

###  Autenticación (5%)
- Implementar autenticación basada en **JWT (JSON Web Tokens)**.
- Los usuarios deben poder **iniciar sesión y cerrar sesión**.
- Incluir rutas protegidas que requieran autenticación.  
**Bonus:** Agregar autenticación de **doble factor (2FA)**.

---

###  Autorización (5%)
- Definir al menos **dos roles** distintos o más, según la aplicación.
- Establecer **permisos basados en roles** para restringir el acceso a rutas o funcionalidades.
- Los roles deben asignarse mediante un mecanismo de administración.

---

###  Pruebas (25%)
- Implementar pruebas **unitarias (Jest)** y/o de **integración (Supertest)**.  
  Se puede usar cualquier otra librería compatible con NestJS (por ejemplo, **Playwright**).
- Las pruebas deben cubrir al menos **el 80% del código fuente**.

---

###  Persistencia en base de datos (10%)
- Utilizar un **ORM** como **TypeORM** para interactuar con la base de datos relacional.
- Puede usarse **MySQL, PostgreSQL, etc.**

---

###  Funcionalidades (25%)
- Implementar las funcionalidades necesarias en el backend para la aplicación del grupo.
- Adjuntar el archivo **JSON de Postman** para ejecutar las pruebas manualmente.

---

###  Informe (10%)
- Preparar un informe detallado con:
  - Descripción de cada **endpoint**, sus parámetros y respuestas.
  - Explicación de la implementación de **autenticación**, **autorización** y **persistencia**.

---

### ☁️ Despliegue (15%)
- Desplegar la aplicación en un servicio en la nube.
- Implementar **pipelines** para ejecutar pruebas y despliegue automatizado.

---

##  Entrega
Los estudiantes deben entregar:
1. **Código fuente completo** del proyecto.
2. Un archivo **README** con:
   - Instrucciones para ejecutar la aplicación.
   - Pasos para probar cada funcionalidad.
3. Un **informe detallado** describiendo las funcionalidades y características de:
   - Autenticación  
   - Autorización  
   - Persistencia  
   - Pruebas implementadas
4. Se revisarán los **commits** para determinar el nivel de participación individual.

---

##  Resumen de Evaluación

| Criterio | Peso |
|-----------|------|
| Seed | 5% |
| Autenticación | 5% |
| Autorización | 5% |
| Pruebas | 25% |
| Persistencia en base de datos | 10% |
| Funcionalidades | 25% |
| Informe | 10% |
| Despliegue | 15% |

---

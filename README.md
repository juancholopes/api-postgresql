# API de Autenticación con Node.js y PostgreSQL

Una API REST para registro y autenticación de usuarios construida con Node.js, Express.js, Sequelize y PostgreSQL.

## 🚀 Características

- ✅ Registro de usuarios con validación
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Base de datos PostgreSQL con Sequelize ORM
- ✅ Migraciones de base de datos
- ✅ Arquitectura limpia (Clean Architecture)
- ✅ Separación de responsabilidades (Routes, Controllers, Models)
- ✅ Códigos de estado HTTP apropiados
- ✅ Validación de datos de entrada

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM para base de datos
- **bcrypt** - Encriptación de contraseñas
- **dotenv** - Variables de entorno

## 📁 Estructura del Proyecto

```
├── src/
│   ├── controllers/
│   │   └── auth.controller.js    # Lógica de negocio
│   ├── routes/
│   │   └── auth.routes.js        # Definición de rutas
│   ├── models/
│   │   └── user.model.js         # Modelo de usuario
│   ├── migrations/
│   │   └── create-users-table.js # Migración de tabla usuarios
│   ├── config/
│   │   └── config.json           # Configuración de base de datos
│   ├── db.js                     # Conexión a base de datos
│   └── index.js                  # Punto de entrada
├── .env                          # Variables de entorno
├── .sequelizerc                  # Configuración de Sequelize
└── package.json
```

## ⚡ Instalación y Uso

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL
- npm

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd api-auth
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=authdb
DB_PORT=5432
```

### 4. Configurar base de datos

```bash
# Crear base de datos
sudo -u postgres createdb authdb

# Ejecutar migraciones
npx sequelize-cli db:migrate
```

### 5. Ejecutar la aplicación

```bash
node src/index.js
```

El servidor estará disponible en `http://localhost:3001`

## 📡 API Endpoints

### Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "phone": "555-1234"
}
```

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "555-1234"
  }
}
```

## 🔒 Seguridad

- Las contraseñas se hashean con bcrypt (saltRounds: 10)
- Las contraseñas nunca se devuelven en las respuestas
- Validación de email único
- Validación de campos requeridos

## 🧠 Conceptos Aplicados

- **Clean Architecture**: Separación clara entre rutas, controladores y modelos
- **ORM**: Uso de Sequelize para abstracción de base de datos
- **Migraciones**: Control de versiones del esquema de base de datos
- **Hash de contraseñas**: Seguridad con bcrypt y salt
- **REST API**: Endpoints siguiendo convenciones REST
- **Códigos HTTP**: Uso apropiado de códigos de estado

## 📝 Próximas Funcionalidades

- [x] Login de usuarios ← COMPLETADO
- [ ] Middleware de autenticación
- [ ] Tokens JWT
- [ ] Logout
- [ ] Actualización de perfil
- [ ] Eliminación de cuenta

## 🤝 Contribuciones

Este es un proyecto de aprendizaje. ¡Las mejoras y sugerencias son bienvenidas!

---

**Desarrollado como proyecto de aprendizaje de desarrollo backend con Node.js**

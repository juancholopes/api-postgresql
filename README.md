# API de Autenticación con Node.js y PostgreSQL

## Descripción del Proyecto

API REST de autenticación que resuelve el problema de gestión segura de usuarios en aplicaciones web. Permite el registro, autenticación, actualización y eliminación de cuentas de usuario de forma segura y escalable.

### Problema que Resuelve

- Gestionar credenciales de usuarios de forma segura
- Controlar el acceso mediante tokens JWT
- Mantener la persistencia de datos de usuario
- Proveer una estructura escalable para futuras funcionalidades

---

## Tabla de Contenidos

- [Tecnologías y Decisiones Técnicas](#tecnologías-y-decisiones-técnicas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Endpoints de la API](#endpoints-de-la-api)
- [Estimaciones de Tiempo](#estimaciones-de-tiempo)
- [Reflexiones y Mejoras Futuras](#reflexiones-y-mejoras-futuras)
- [Seguridad](#seguridad)
- [Testing](#testing)

---

## Tecnologías y Decisiones Técnicas

| Tecnología       | Versión | Razón de Elección                                                                                             |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Node.js**      | v18+    | Runtime asíncrono ideal para operaciones I/O intensivas como consultas a base de datos                        |
| **Express.js**   | v5.1.0  | Framework minimalista que permite flexibilidad en la estructura sin imponer convenciones rígidas              |
| **PostgreSQL**   | v8+     | Base de datos relacional elegida por su robustez en integridad de datos y soporte ACID                        |
| **Sequelize**    | v6.37.7 | ORM que facilita migraciones y abstrae operaciones SQL, haciendo el código más mantenible                     |
| **bcrypt**       | v6.0.0  | Algoritmo de hashing específicamente diseñado para contraseñas, con protección contra ataques de fuerza bruta |
| **jsonwebtoken** | v9.0.2  | Estándar de industria para autenticación stateless en APIs REST                                               |

### ¿Por qué PostgreSQL y no MongoDB?

**Decisión:** Elegí PostgreSQL sobre MongoDB porque:

1. **Consistencia de datos**: Los datos de usuario requieren integridad referencial (emails únicos, relaciones futuras con roles/permisos)
2. **Transacciones ACID**: Operaciones críticas como registro y eliminación de cuentas necesitan garantías transaccionales
3. **Escalabilidad vertical**: Para un sistema de autenticación, la consistencia es más importante que la escalabilidad horizontal que ofrece MongoDB
4. **Tipado fuerte**: El esquema rígido previene inconsistencias en los datos de usuario

### ¿Por qué JWT y no Sessions?

**Decisión:** Implementé autenticación con JWT porque:

1. **Stateless**: No requiere almacenamiento de sesiones en el servidor, facilitando la escalabilidad horizontal
2. **Portabilidad**: El token puede ser usado en aplicaciones móviles, web y otros clientes sin cambios
3. **Microservicios**: Facilita la integración con otros servicios que puedan validar el token de forma independiente

**Trade-off conocido**: La revocación inmediata de tokens es más compleja que con sesiones. Actualmente el logout no invalida el token hasta su expiración.

---

## Arquitectura del Proyecto

El proyecto sigue el patrón **MVC (Model-View-Controller)** adaptado para APIs REST, con separación clara de responsabilidades:

```
src/
├── config/              # Configuración de Sequelize y base de datos
├── controllers/         # Lógica de negocio de cada endpoint
│   ├── register.controller.js    # Maneja registro de usuarios
│   ├── login.controller.js       # Genera JWT tras validar credenciales
│   ├── profile.controller.js     # Obtiene datos del usuario autenticado
│   ├── update.controller.js      # Actualiza información de usuario
│   ├── delete.controller.js      # Elimina cuenta de usuario
│   └── logout.controller.js      # Maneja cierre de sesión
├── middleware/
│   └── auth.js          # Verifica validez del JWT en rutas protegidas
├── models/
│   └── user.model.js    # Esquema de usuario con Sequelize
├── routes/
│   └── auth.routes.js   # Define endpoints y conecta con controladores
├── migrations/          # Control de versiones del esquema de base de datos
├── db.js                # Conexión a PostgreSQL con Sequelize
└── index.js             # Punto de entrada de la aplicación
```

### Flujo de Autenticación

```
[Cliente] ---> [Express Router] ---> [Middleware Auth] ---> [Controller] ---> [Model] ---> [PostgreSQL]
                                            |                      |               |
                                            |                      |               |
                                       Valida JWT          Lógica negocio    Operaciones DB
                                       en headers          + validaciones     + migraciones
```

**Beneficios de esta arquitectura:**

- **Separación de responsabilidades**: Cada capa tiene una función clara
- **Testeable**: Los controladores pueden ser probados independientemente
- **Escalable**: Fácil agregar nuevos endpoints o modelos sin modificar código existente
- **Mantenible**: Cambios en la base de datos solo afectan la capa de modelos

---

## Instalación y Configuración

### Opción 1: Con Docker (Recomendado) 🐳

Requisitos: [Docker](https://docs.docker.com/get-docker/) v20.10+

```bash
# Clonar el repositorio
git clone <repository-url>
cd api-postgresql

# Iniciar todos los servicios (API + PostgreSQL)
npm run docker:dev
```

La API estará disponible en `http://localhost:3001`. Las migraciones se ejecutan automáticamente.

Para más detalles sobre Docker, ver [DOCKER.md](DOCKER.md).

### Opción 2: Sin Docker (Manual)

#### Requisitos Previos

- **Node.js** v18 o superior
- **PostgreSQL** v12 o superior
- **npm** v8 o superior

### Tiempo estimado de instalación: 10-15 minutos

#### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd api-postgresql
```

#### 2. Instalar dependencias

```bash
npm install
```

**Tiempo estimado:** 2-3 minutos dependiendo de la conexión a internet.

#### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=tu_clave_secreta_aqui
```

**Nota importante:** Genera un `JWT_SECRET` seguro. Puedes usar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Configurar PostgreSQL

```bash
# Crear la base de datos
sudo -u postgres createdb authdb

# Ejecutar migraciones para crear tablas
npx sequelize-cli db:migrate
```

**Tiempo estimado:** 1-2 minutos.

**Posible problema:** Si PostgreSQL no está iniciado en Arch Linux, ejecutar:

```bash
sudo mkdir -p /run/postgresql && sudo chown postgres:postgres /run/postgresql
sudo -u postgres pg_ctl start -D /var/lib/postgres/data
```

#### 5. Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

**Verificación:** Deberías ver en consola:

```
✅ Conexión a PostgreSQL establecida correctamente
Servidor escuchando en http://localhost:3001
```

---

## Endpoints de la API

### Registro de Usuario

**Endpoint:** `POST /api/auth/register`

**Propósito:** Crear una nueva cuenta de usuario en el sistema.

**Request:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "123456",
    "phone": "555-1234"
  }'
```

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "555-1234"
  }
}
```

**Validaciones implementadas:**

- Email debe ser único en la base de datos
- Contraseña se hashea con bcrypt (10 salt rounds) antes de almacenar
- Campos requeridos: name, email, password

---

### Inicio de Sesión

**Endpoint:** `POST /api/auth/login`

**Propósito:** Autenticar usuario y obtener token JWT para acceder a rutas protegidas.

**Request:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "123456"
  }'
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "555-1234"
  }
}
```

**Nota:** El token JWT tiene una duración de 24 horas. Guardar este token para usarlo en las siguientes peticiones.

---

### Obtener Perfil (Ruta Protegida)

**Endpoint:** `GET /api/auth/profile`

**Propósito:** Obtener información del usuario autenticado.

**Request:**

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <TOKEN>"
```

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "555-1234",
  "createdAt": "2025-01-10T15:30:00.000Z",
  "updatedAt": "2025-01-10T15:30:00.000Z"
}
```

---

### Actualizar Perfil (Ruta Protegida)

**Endpoint:** `PUT /api/auth/account`

**Propósito:** Modificar información del usuario autenticado.

**Request:**

```bash
curl -X PUT http://localhost:3001/api/auth/account \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez Actualizado",
    "phone": "555-9999"
  }'
```

**Nota:** El email no puede ser actualizado por razones de seguridad.

---

### Eliminar Cuenta (Ruta Protegida)

**Endpoint:** `DELETE /api/auth/delete`

**Propósito:** Eliminar permanentemente la cuenta del usuario autenticado.

**Request:**

```bash
curl -X DELETE http://localhost:3001/api/auth/delete \
  -H "Authorization: Bearer <TOKEN>"
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Advertencia:** Esta operación es irreversible. Los datos del usuario se eliminan de la base de datos.

---

### Cerrar Sesión (Ruta Protegida)

**Endpoint:** `POST /api/auth/logout`

**Propósito:** Invalidar la sesión del usuario.

**Request:**

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

**Limitación conocida:** Actualmente el logout es simulado. El token JWT seguirá siendo válido hasta su expiración natural. Ver sección [Reflexiones y Mejoras Futuras](#reflexiones-y-mejoras-futuras).

---

## Estimaciones de Tiempo

### Tiempo de Desarrollo por Funcionalidad

| Funcionalidad                                    | Tiempo Estimado | Tiempo Real  | Dificultad Principal                               |
| ------------------------------------------------ | --------------- | ------------ | -------------------------------------------------- |
| Configuración inicial del proyecto               | 1 hora          | 1.5 horas    | Configuración de Sequelize con ES modules          |
| Modelo de usuario + migraciones                  | 2 horas         | 2 horas      | Definición del esquema y validaciones              |
| Endpoint de registro                             | 3 horas         | 4 horas      | Validación de email único y hashing de contraseñas |
| Endpoint de login + JWT                          | 4 horas         | 5 horas      | Generación y configuración de JWT                  |
| Middleware de autenticación                      | 2 horas         | 2.5 horas    | Manejo de errores y validación de token            |
| Endpoints de perfil, actualización y eliminación | 3 horas         | 3 horas      | Extracción del userId del token                    |
| Testing manual con cURL                          | 1 hora          | 1 hora       | Documentación de ejemplos                          |
| **Total**                                        | **16 horas**    | **19 horas** | -                                                  |

### Estimaciones de Nuevas Funcionalidades

#### Rate Limiting (Próxima Funcionalidad)

**Tiempo estimado:** 3-4 horas

**Pasos:**

1. Instalar `express-rate-limit` (15 min)
2. Configurar límites por endpoint (1 hora)
3. Implementar límites específicos para login/registro (1 hora)
4. Testing y ajustes (1-1.5 horas)

**Posible complicación:** Si se despliega con múltiples instancias, necesitaría implementar un store compartido (Redis), lo cual agregaría 4-6 horas adicionales.

#### Recuperación de Contraseña

**Tiempo estimado:** 8-10 horas

**Pasos:**

1. Crear tabla de tokens de recuperación (1 hora)
2. Endpoint para solicitar recuperación (2 horas)
3. Integración con servicio de email (3-4 horas)
4. Endpoint para validar token y resetear contraseña (2 horas)
5. Testing completo (1-2 horas)

**Complicación principal:** La integración con un servicio de email (SendGrid, AWS SES) puede tomar más tiempo si hay problemas con la configuración de SMTP o límites de envío.

#### Refresh Tokens

**Tiempo estimado:** 6-8 horas

**Pasos:**

1. Crear tabla de refresh tokens (1 hora)
2. Modificar login para generar refresh token (2 horas)
3. Endpoint para renovar access token (2 horas)
4. Implementar revocación de tokens en logout (1-2 horas)
5. Testing y manejo de casos edge (1-2 horas)

---

## Reflexiones y Mejoras Futuras

### ¿Qué Haría Diferente?

#### 1. Implementar Refresh Tokens desde el Inicio

**Problema actual:** Los tokens JWT tienen una duración de 24 horas y no pueden ser revocados inmediatamente. Si un token es comprometido, permanece válido hasta su expiración.

**Solución propuesta:** Implementar un sistema de access tokens (corta duración: 15 min) y refresh tokens (larga duración: 7 días) almacenados en base de datos. Esto permitiría:

- Revocar sesiones inmediatamente en logout
- Detectar uso de refresh tokens robados
- Mejor control de seguridad sin sacrificar la experiencia de usuario

**Por qué no lo hice:** Para mantener el alcance inicial simple y enfocado en lo básico de JWT. Agregarlo ahora tomaría ~6-8 horas.

---

#### 2. Usar una Capa de Validación Dedicada (Joi o Zod)

**Problema actual:** Las validaciones están dispersas en los controladores, lo que dificulta mantener consistencia.

**Solución propuesta:** Implementar Zod como middleware de validación antes de los controladores.

```javascript
// Ejemplo de lo que implementaría:
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});
```

**Beneficios:**

- Validaciones centralizadas y reutilizables
- Mensajes de error consistentes
- TypeScript-friendly (si migro a TS en el futuro)

**Tiempo estimado para implementar:** 2-3 horas

---

#### 3. Implementar Testing Automatizado

**Problema actual:** Solo cuento con testing manual usando cURL. Esto hace que la regresión sea difícil de detectar.

**Solución propuesta:** Implementar tests con Jest + Supertest.

```javascript
// Ejemplo de test que implementaría:
describe("POST /api/auth/register", () => {
  it("debería registrar un usuario con datos válidos", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
  });
});
```

**Cobertura objetivo:**

- Tests unitarios para controladores (8 horas)
- Tests de integración para endpoints (6 horas)
- Tests para middleware de autenticación (2 horas)

**Tiempo total estimado:** 16-20 horas

---

#### 4. Migrar a TypeScript

**Problema actual:** JavaScript sin tipado puede llevar a errores en tiempo de ejecución que serían detectables en tiempo de desarrollo con TypeScript.

**Beneficios de TypeScript:**

- Autocompletado mejorado en el IDE
- Detección temprana de errores de tipo
- Mejor documentación implícita del código
- Refactoring más seguro

**Por qué no lo hice:** Como proyecto de aprendizaje, quise dominar los fundamentos de Node.js antes de agregar la complejidad de TypeScript.

**Tiempo estimado para migrar:** 8-12 horas (incluyendo configuración de tsconfig, tipado de Sequelize, y ajustes)

---

#### 5. Dockerizar la Aplicación

**Problema actual:** La configuración de PostgreSQL es manual y depende del sistema operativo. Esto dificulta que otros desarrolladores ejecuten el proyecto.

**Solución propuesta:** Crear `Dockerfile` y `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: authdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  api:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - db
```

**Beneficios:**

- Entorno consistente entre desarrollo y producción
- Instalación simplificada: un solo comando `docker-compose up`
- Fácil de desplegar en servicios cloud

**Tiempo estimado:** 3-4 horas

---

### Próximas Funcionalidades Planificadas

- **Rate Limiting**: Prevenir ataques de fuerza bruta en login (Prioridad: Alta)
- **Refresh Tokens**: Mejorar seguridad de autenticación (Prioridad: Alta)
- **Email de Bienvenida**: Enviar email tras registro exitoso (Prioridad: Media)
- **Recuperación de Contraseña**: Flujo completo con tokens temporales (Prioridad: Media)
- **Roles y Permisos**: Sistema básico de autorización (Prioridad: Baja)
- **Logging con Winston**: Mejorar trazabilidad de errores (Prioridad: Baja)

---

## Seguridad

### Medidas Implementadas

| Medida | Implementación | Propósito |
|--------|---------------|-----------||
| **Hashing de contraseñas** | bcrypt con 10 salt rounds | Prevenir exposición de contraseñas en caso de filtración de DB |
| **Exclusión de contraseñas en respuestas** | `attributes: { exclude: ['password'] }` en Sequelize | Nunca exponer hashes al cliente |
| **Email único** | Constraint `UNIQUE` en base de datos | Prevenir duplicación de cuentas |
| **Validación de JWT** | Middleware que verifica firma y expiración | Proteger rutas sensibles |
| **Variables de entorno** | dotenv para secretos | No exponer credenciales en código fuente |
| **Códigos HTTP apropiados** | 401 para no autorizado, 403 para prohibido | Claridad en errores de autenticación |

### Limitaciones de Seguridad Conocidas

**1. No hay rate limiting**

Actualmente no hay protección contra ataques de fuerza bruta en el endpoint de login. Un atacante podría intentar miles de contraseñas sin restricción.

**Solución planificada:** Implementar `express-rate-limit` para limitar a 5 intentos de login por minuto por IP.

**2. Tokens JWT no pueden ser revocados**

Una vez generado, un token permanece válido hasta su expiración, incluso después de logout.

**Solución planificada:** Implementar refresh tokens con whitelist en base de datos.

**3. No hay verificación de email**

Cualquier usuario puede registrarse con un email sin confirmar que le pertenece.

**Solución planificada:** Enviar email de verificación tras registro con token temporal.

**4. HTTPS no configurado**

La aplicación corre en HTTP sin cifrado. En producción, los tokens podrían ser interceptados.

**Solución:** Desplegar detrás de un reverse proxy (Nginx) con certificado SSL/TLS.

---

## Testing

### Descripción General

El proyecto incluye una suite completa de tests automatizados implementada con **Jest** y **Supertest**. Los tests cubren todos los endpoints de la API y el middleware de autenticación, asegurando el correcto funcionamiento de las operaciones y la detección temprana de errores.

### Tecnologías de Testing

| Tecnología    | Versión | Propósito                                                       |
| ------------- | ------- | --------------------------------------------------------------- |
| **Jest**      | v30.2.0 | Framework de testing con aserciones y mocks                     |
| **Supertest** | v7.2.2  | Librería para testing de APIs HTTP                              |
| **cross-env** | v10.1.0 | Configuración de variables de entorno multiplataforma           |

### Estructura de Tests

```
tests/
├── setup/
│   ├── testDb.js          # Configuración de base de datos de prueba
│   ├── testSetup.js       # Configuración global de Jest (beforeAll, afterAll)
│   ├── testUtils.js       # Funciones auxiliares (createUser, getToken, etc.)
│   └── testApp.js         # Instancia de Express para testing
├── auth/
│   ├── register.test.js   # Tests del endpoint de registro
│   ├── login.test.js      # Tests del endpoint de login
│   ├── profile.test.js    # Tests del endpoint de perfil
│   ├── update.test.js     # Tests del endpoint de actualización
│   ├── delete.test.js     # Tests del endpoint de eliminación
│   └── logout.test.js     # Tests del endpoint de logout
└── middleware/
    └── auth.test.js       # Tests del middleware de autenticación
```

### Configuración de Base de Datos de Prueba

Los tests utilizan una base de datos PostgreSQL separada llamada `authdb_test` para evitar afectar los datos de desarrollo o producción.

**Archivo `.env.test`:**

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=authdb_test
DB_DIALECT=postgres
DB_PORT=5432
JWT_SECRET=testsecretkey123
NODE_ENV=test
```

**Crear base de datos de prueba:**

```bash
npm run test:db:create
```

**Eliminar base de datos de prueba:**

```bash
npm run test:db:drop
```

### Ejecutar Tests

#### Ejecutar todos los tests

```bash
npm test
```

#### Ejecutar tests en modo watch (re-ejecución automática)

```bash
npm run test:watch
```

#### Ejecutar tests con reporte de cobertura

```bash
npm run test:coverage
```

Este comando genera un reporte detallado de cobertura en:
- **Consola:** Resumen de cobertura por archivo
- **HTML:** `coverage/lcov-report/index.html` (reporte interactivo)
- **LCOV:** `coverage/lcov.info` (para integración con CI/CD)

#### Ejecutar tests con salida detallada

```bash
npm run test:verbose
```

### Cobertura de Tests

Los tests incluyen cobertura completa para cada endpoint:

#### Register (POST /api/auth/register)
- ✅ Registro exitoso con todos los campos
- ✅ Registro con campos mínimos requeridos
- ✅ Hashing de contraseña verificado
- ❌ Validación de campos faltantes (name, email, password)
- ❌ Detección de email duplicado
- ✅ Estructura de respuesta validada

#### Login (POST /api/auth/login)
- ✅ Login exitoso con credenciales válidas
- ✅ Token JWT válido generado
- ✅ Información del usuario retornada sin contraseña
- ❌ Usuario no existente
- ❌ Contraseña incorrecta
- ❌ Campos faltantes

#### Profile (GET /api/auth/profile)
- ✅ Obtención exitosa del perfil
- ✅ Datos correctos del usuario autenticado
- ❌ Token ausente o inválido
- ❌ Usuario no encontrado en BD

#### Update (PUT /api/auth/account)
- ✅ Actualización de nombre
- ✅ Actualización de teléfono
- ✅ Actualización de múltiples campos
- ✅ Actualización de contraseña con hashing
- ❌ Token ausente o inválido

#### Delete (DELETE /api/auth/delete)
- ✅ Eliminación exitosa de cuenta
- ✅ Usuario removido de la base de datos
- ❌ Token ausente o inválido

#### Logout (POST /api/auth/logout)
- ✅ Logout exitoso
- ❌ Token ausente o inválido
- ⚠️ Limitación conocida: Token sigue siendo válido (limitación JWT)

#### Auth Middleware
- ✅ Token válido permite acceso
- ✅ userId adjuntado al request
- ❌ Header Authorization ausente
- ❌ Token malformado
- ❌ Token expirado
- ❌ Token con firma incorrecta

### Utilidades de Testing

El archivo `tests/setup/testUtils.js` proporciona funciones auxiliares reutilizables:

```javascript
// Crear usuario de prueba
const testUser = await createTestUser({
  name: 'Usuario de Prueba',
  email: 'test@example.com',
  password: 'password123'
});

// Obtener token de autenticación
const token = getAuthToken(testUser.id);

// Generar token expirado (para tests negativos)
const expiredToken = generateExpiredToken(testUser.id);

// Generar token inválido
const invalidToken = generateInvalidToken();

// Limpiar base de datos
await clearDatabase();

// Crear múltiples usuarios
const users = await createMultipleUsers(5);
```

### Escribir Nuevos Tests

Para agregar tests para nuevas funcionalidades:

1. **Crear archivo de test:** `tests/nueva-funcionalidad.test.js`
2. **Importar dependencias:**

```javascript
import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, getAuthToken } from '../setup/testUtils.js';

const app = createTestApp();

describe('NUEVO ENDPOINT', () => {
  describe('Casos exitosos', () => {
    it('debería hacer algo exitosamente', async () => {
      const response = await request(app)
        .get('/api/nuevo-endpoint')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Casos de error', () => {
    it('debería retornar error en caso X', async () => {
      // Test de error
    });
  });
});
```

### Mejores Prácticas

1. **Aislamiento:** Cada test es independiente y limpia la BD después de ejecutarse
2. **Nomenclatura:** Usar español para descripciones de tests
3. **Organización:** Agrupar tests en "Casos exitosos" y "Casos de error"
4. **Cobertura:** Mantener mínimo 70% de cobertura de código
5. **Velocidad:** Los tests deben ejecutarse rápidamente (< 10 segundos total)
6. **Mantenibilidad:** Usar las utilidades de `testUtils.js` para evitar duplicación

### Integración con CI/CD

Los tests están diseñados para integrarse con pipelines de CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Reporte de Cobertura

**Cobertura objetivo:** 70% mínimo en todas las métricas

| Métrica      | Mínimo | Ideal |
| ------------ | ------ | ----- |
| Statements   | 70%    | 85%   |
| Branches     | 70%    | 80%   |
| Functions    | 70%    | 85%   |
| Lines        | 70%    | 85%   |

**Ver cobertura actual:**

```bash
npm run test:coverage
```

El reporte HTML muestra:
- Archivos con menor cobertura
- Líneas no cubiertas
- Branches no testeados
- Funciones sin tests

### Troubleshooting

#### Error: "Test database connection failed"

**Solución:** Verificar que PostgreSQL esté corriendo y la BD `authdb_test` exista:

```bash
psql -U postgres -l | grep authdb_test
```

Si no existe:

```bash
npm run test:db:create
```

#### Error: "JWT_SECRET is not defined"

**Solución:** Verificar que `.env.test` exista y contenga `JWT_SECRET`:

```bash
cat .env.test
```

#### Tests muy lentos

**Solución:** Los tests pueden tardar más si:
- La BD no está en localhost
- Hay muchas conexiones abiertas
- Los logs de Sequelize están activados

Verificar configuración en `tests/setup/testDb.js` (logging: false).

#### Tests fallan intermitentemente

**Posibles causas:**
- Datos no limpiados entre tests
- IDs o timestamps que colisionan
- Tests ejecutándose en paralelo que comparten datos

**Solución:** Asegurar que `afterEach` limpie la base de datos correctamente.

### Beneficios de esta Implementación

1. **Detección temprana de errores:** Los tests detectan bugs antes de llegar a producción
2. **Refactoring seguro:** Los tests garantizan que cambios no rompan funcionalidad existente
3. **Documentación viva:** Los tests documentan el comportamiento esperado de la API
4. **Confianza en deployments:** Saber que el código está probado reduce riesgos
5. **Escalabilidad:** La estructura permite agregar nuevos tests fácilmente
6. **Mantenibilidad:** Tests bien organizados son fáciles de mantener y actualizar

### Próximos Pasos en Testing

- [ ] Implementar tests de integración con base de datos real
- [ ] Agregar tests de performance con Artillery o k6
- [ ] Implementar mutation testing con Stryker
- [ ] Configurar SonarQube para análisis de código
- [ ] Agregar tests E2E con Cypress o Playwright
- [ ] Mocking de servicios externos (email, SMS, etc.)

---

## Comandos Útiles

### Gestión de PostgreSQL en Arch Linux

```bash
# Iniciar PostgreSQL
sudo -u postgres pg_ctl start -D /var/lib/postgres/data

# Verificar estado
sudo -u postgres pg_ctl status -D /var/lib/postgres/data

# Detener PostgreSQL
sudo -u postgres pg_ctl stop -D /var/lib/postgres/data

# Crear directorio necesario si no existe
sudo mkdir -p /run/postgresql && sudo chown postgres:postgres /run/postgresql
```

### Migraciones de Base de Datos

```bash
# Ejecutar todas las migraciones pendientes
npx sequelize-cli db:migrate

# Revertir la última migración
npx sequelize-cli db:migrate:undo

# Crear nueva migración
npx sequelize-cli migration:generate --name nombre-de-la-migracion
```

---

## Lecciones Aprendidas

### 1. La Importancia de las Migraciones

Inicialmente intenté usar `sequelize.sync()` para crear tablas automáticamente. Esto causó problemas cuando necesité modificar el esquema en desarrollo.

**Aprendizaje:** Las migraciones proporcionan control de versiones del esquema y son esenciales para trabajo en equipo.

### 2. ES Modules vs CommonJS

El proyecto usa ES modules (`import/export`). Esto requirió agregar `"type": "module"` en `package.json` y usar extensiones `.js` en imports.

**Aprendizaje:** ES modules son el futuro de Node.js, pero requieren ajustes en la configuración de Sequelize y otras herramientas legacy.

### 3. Separación de Responsabilidades

Al principio tenía toda la lógica en las rutas. Extraerla a controladores hizo el código mucho más testeable y mantenible.

**Aprendizaje:** Invertir tiempo en arquitectura al inicio ahorra tiempo de refactoring después.

---

## Contacto y Contribuciones

Este proyecto fue desarrollado como parte de mi aprendizaje de desarrollo backend con Node.js. Si encuentras errores o tienes sugerencias, son bienvenidas.

**Desarrollado por:** Juan Carlos López Moreno

**Portafolio:** <https://juancholopez.netlify.app/>

**Propósito:** Proyecto de aprendizaje y demostración de habilidades backend para aplicaciones a posiciones junior/semi-senior en desarrollo web.

# 🐳 Guía de Docker para API de Autenticación

## Descripción

Este proyecto utiliza Docker para contenerizar la API de autenticación junto con PostgreSQL y Nginx, proporcionando entornos consistentes para desarrollo, testing y producción.

## Requisitos Previos

- **Docker** v20.10 o superior
- **Docker Compose** v2.0 o superior (incluido con Docker Desktop)

Verificar instalación:

```bash
docker --version
docker compose version
```

---

## Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────┐ │
│  │  Nginx   │────▶│  API     │────▶│  PostgreSQL      │ │
│  │  :80/443 │     │  :3001   │     │  :5432           │ │
│  │ (prod)   │     │ (Node.js)│     │  (datos persist.)│ │
│  └──────────┘     └──────────┘     └──────────────────┘ │
│       ▲                                                  │
│       │                                                  │
└───────┼──────────────────────────────────────────────────┘
        │
   Puerto 80/443
   (acceso externo)
```

---

## Inicio Rápido

### Desarrollo Local

```bash
# Iniciar todos los servicios
npm run docker:dev

# O directamente con docker compose
docker compose up --build

# Detener servicios
npm run docker:dev:down
```

La API estará disponible en `http://localhost:3001`

### Ejecutar Tests

```bash
# Ejecutar tests en contenedor
npm run docker:test

# Limpiar contenedores de test
npm run docker:test:down
```

### Producción

```bash
# 1. Crear archivo de variables de entorno
cp .env.production.example .env.production

# 2. Editar con valores seguros
nano .env.production

# 3. Iniciar en modo producción
npm run docker:prod

# Ver logs
npm run docker:logs
```

La API estará disponible en `http://localhost:80` (a través de Nginx)

---

## Comandos Docker Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run docker:dev` | Inicia entorno de desarrollo |
| `npm run docker:dev:down` | Detiene entorno de desarrollo |
| `npm run docker:test` | Ejecuta tests en contenedor |
| `npm run docker:test:down` | Detiene y limpia contenedores de test |
| `npm run docker:prod` | Inicia entorno de producción |
| `npm run docker:prod:down` | Detiene entorno de producción |
| `npm run docker:logs` | Ver logs de todos los servicios |
| `npm run docker:clean` | Elimina contenedores, volúmenes e imágenes |
| `npm run docker:backup` | Crear backup de base de datos |
| `npm run docker:restore` | Restaurar backup de base de datos |

---

## Entornos

### Desarrollo (`docker-compose.yml`)

**Servicios:**
- `db` - PostgreSQL 15 con persistencia en volumen
- `api` - Node.js con hot-reload (volúmenes de código fuente)

**Características:**
- ✅ Código fuente montado como volumen (cambios en tiempo real)
- ✅ Puerto 5432 expuesto para herramientas de DB (pgAdmin, DBeaver)
- ✅ Migraciones automáticas al iniciar
- ✅ Health checks para PostgreSQL

### Testing (`docker-compose.test.yml`)

**Servicios:**
- `db-test` - PostgreSQL 15 con datos efímeros (tmpfs)
- `api-test` - Ejecuta `npm test` y sale

**Características:**
- ✅ Base de datos en memoria (rápida y desechable)
- ✅ Se ejecutan migraciones y tests automáticamente
- ✅ El contenedor se detiene al terminar los tests
- ✅ Código de salida refleja resultado de los tests

### Producción (`docker-compose.prod.yml`)

**Servicios:**
- `db` - PostgreSQL 15 con persistencia y límites de recursos
- `api` - Node.js optimizado (solo dependencias de producción)
- `nginx` - Reverse proxy con seguridad

**Características:**
- ✅ Imagen optimizada con multi-stage build
- ✅ Nginx con rate limiting y headers de seguridad
- ✅ Límites de CPU y memoria configurados
- ✅ Base de datos no accesible externamente
- ✅ Usuario no-root en contenedores
- ✅ Preparado para SSL/TLS

---

## Variables de Entorno

### Desarrollo (configuradas en docker-compose.yml)

| Variable | Valor Default | Descripción |
|----------|--------------|-------------|
| `NODE_ENV` | `development` | Entorno de ejecución |
| `DB_HOST` | `db` | Host de PostgreSQL (nombre del servicio) |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | `postgres_dev_password` | Contraseña de PostgreSQL |
| `DB_NAME` | `authdb` | Nombre de la base de datos |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `JWT_SECRET` | `dev_jwt_secret...` | Secreto para firmar JWT |

### Producción (archivo `.env.production`)

```bash
# Copiar template
cp .env.production.example .env.production

# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

⚠️ **Nunca subas `.env.production` al repositorio**

---

## Gestión de Datos

### Persistencia

Los datos de PostgreSQL se almacenan en un volumen Docker named:
- **Desarrollo:** `api-postgresql_pgdata-dev`
- **Producción:** `api-postgresql_pgdata-prod`

Los datos persisten incluso si el contenedor se reinicia o se elimina.

### Backups

```bash
# Crear backup
npm run docker:backup

# Los backups se guardan en ./backups/
ls -la backups/

# Restaurar backup
npm run docker:restore backups/backup_authdb_20240110_153000.dump
```

### Acceder a PostgreSQL directamente

```bash
# Desarrollo
docker exec -it authdb-dev psql -U postgres -d authdb

# Producción
docker exec -it authdb-prod psql -U postgres -d authdb
```

---

## Seguridad

### Medidas Implementadas en Docker

| Medida | Descripción |
|--------|-------------|
| **Usuario no-root** | Los contenedores de API no corren como root |
| **Red interna** | PostgreSQL no expone puertos en producción |
| **Rate limiting** | Nginx limita solicitudes por IP (5/min login, 30/s general) |
| **Headers de seguridad** | X-Frame-Options, X-Content-Type-Options, CSP |
| **Multi-stage build** | Imagen de producción sin devDependencies ni código innecesario |
| **Health checks** | Verificación automática de salud de servicios |
| **Secrets en .env** | Variables sensibles fuera del código fuente |
| **Recursos limitados** | CPU y memoria acotados por contenedor |

### Configurar SSL/TLS

1. Obtener certificado SSL (Let's Encrypt o similar)
2. Colocar archivos en `docker/nginx/ssl/`:
   - `cert.pem` - Certificado
   - `key.pem` - Clave privada
3. Descomentar líneas SSL en `docker/nginx/nginx.conf`
4. Reiniciar nginx: `docker compose -f docker-compose.prod.yml restart nginx`

---

## Nginx - Rate Limiting

La configuración de Nginx incluye rate limiting por defecto:

| Zona | Límite | Aplicado a |
|------|--------|-----------|
| `api_auth` | 5 req/min por IP | `/api/auth/login`, `/api/auth/register` |
| `api_general` | 30 req/s por IP | Resto de `/api/*` |

Si se excede el límite, se retorna un error 429:

```json
{
  "success": false,
  "message": "Demasiadas solicitudes. Intenta de nuevo más tarde."
}
```

---

## Troubleshooting

### Error: Puerto 5432 en uso

```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :5432

# Detener PostgreSQL local si está corriendo
sudo -u postgres pg_ctl stop -D /var/lib/postgres/data
```

### Error: Migraciones fallan al iniciar

```bash
# Ver logs del contenedor de API
docker compose logs api

# Ejecutar migraciones manualmente
docker exec -it authapi-dev npx sequelize-cli db:migrate
```

### Error: Contenedor no inicia (health check falla)

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs de un servicio específico
docker compose logs db
docker compose logs api
```

### Reconstruir imágenes desde cero

```bash
# Eliminar todo y reconstruir
npm run docker:clean
npm run docker:dev
```

### Ver tamaño de imágenes

```bash
docker images | grep auth
```

---

## Desarrollo sin Docker

El proyecto sigue siendo compatible con ejecución local sin Docker:

```bash
# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Iniciar PostgreSQL local
sudo -u postgres pg_ctl start -D /var/lib/postgres/data

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Iniciar servidor
npm start
```

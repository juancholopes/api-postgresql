# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS deps

WORKDIR /app

# Instalar dependencias del sistema necesarias para bcrypt
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

# Instalar todas las dependencias (producción + desarrollo)
RUN npm ci

# ============================================
# Stage 2: Production dependencies only
# ============================================
FROM node:18-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# ============================================
# Stage 3: Development image
# ============================================
FROM node:18-alpine AS development

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copiar dependencias completas desde stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY . .

# Copiar script de inicialización
COPY docker/scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Cambiar ownership de archivos
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

ENTRYPOINT ["entrypoint.sh"]
CMD ["node", "src/index.js"]

# ============================================
# Stage 4: Production image
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copiar solo dependencias de producción
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/
COPY .sequelizerc ./
COPY seed.js ./

# Copiar script de inicialización
COPY docker/scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Cambiar ownership de archivos
RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production

EXPOSE 3001

ENTRYPOINT ["entrypoint.sh"]
CMD ["node", "src/index.js"]

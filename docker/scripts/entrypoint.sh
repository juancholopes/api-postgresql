#!/bin/sh
set -e

echo "🔄 Esperando a que PostgreSQL esté disponible..."

# Esperar a que PostgreSQL acepte conexiones
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if node -e "
    const { Sequelize } = require('sequelize') || await import('sequelize');
  " 2>/dev/null; then
    break
  fi

  # Intentar conexión TCP básica al host de la DB
  if nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}" 2>/dev/null; then
    echo "✅ PostgreSQL está aceptando conexiones"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Intento $RETRY_COUNT/$MAX_RETRIES - PostgreSQL no disponible, reintentando en 2s..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ No se pudo conectar a PostgreSQL después de $MAX_RETRIES intentos"
  exit 1
fi

# Esperar un poco más para que PostgreSQL esté completamente listo
sleep 2

# Ejecutar migraciones automáticamente
echo "🔄 Ejecutando migraciones de base de datos..."
npx sequelize-cli db:migrate 2>&1 || {
  echo "⚠️  Las migraciones fallaron, pero continuando con el inicio..."
}

echo "🚀 Iniciando la aplicación..."

# Ejecutar el comando pasado como argumento
exec "$@"

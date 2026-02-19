#!/bin/sh
# Script de backup de base de datos PostgreSQL
# Uso: ./docker/scripts/backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="authdb-prod"
DB_NAME="${DB_NAME:-authdb}"
DB_USER="${DB_USER:-postgres}"

mkdir -p "$BACKUP_DIR"

echo "🔄 Creando backup de la base de datos '$DB_NAME'..."

docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom \
  > "$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.dump"

echo "✅ Backup creado: $BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.dump"

# Eliminar backups con más de 30 días
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete 2>/dev/null && \
  echo "🧹 Backups antiguos (>30 días) eliminados" || true

echo "📋 Backups disponibles:"
ls -lh "$BACKUP_DIR"/*.dump 2>/dev/null || echo "No hay backups disponibles"

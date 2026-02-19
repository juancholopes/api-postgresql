#!/bin/sh
# Script de restauración de base de datos PostgreSQL
# Uso: ./docker/scripts/restore.sh <archivo_backup.dump>

set -e

if [ -z "$1" ]; then
  echo "❌ Uso: $0 <archivo_backup.dump>"
  echo "📋 Backups disponibles:"
  ls -lh ./backups/*.dump 2>/dev/null || echo "No hay backups disponibles"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="authdb-prod"
DB_NAME="${DB_NAME:-authdb}"
DB_USER="${DB_USER:-postgres}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Archivo no encontrado: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  Esto restaurará la base de datos '$DB_NAME' desde: $BACKUP_FILE"
echo "   Los datos actuales serán reemplazados."
printf "   ¿Continuar? (y/N): "
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "❌ Restauración cancelada"
  exit 0
fi

echo "🔄 Restaurando base de datos..."

docker exec -i "$CONTAINER_NAME" pg_restore -U "$DB_USER" -d "$DB_NAME" \
  --clean --if-exists < "$BACKUP_FILE"

echo "✅ Base de datos restaurada exitosamente desde: $BACKUP_FILE"

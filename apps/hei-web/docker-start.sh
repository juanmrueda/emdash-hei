#!/bin/sh
# Arranque del contenedor (Azure App Service for Containers, o cualquier runtime Docker).
#
# Por qué existe este script en vez de un startup command en Azure:
#   - Azure ejecuta el startup command SIN shell, así que `a && b` no funciona.
#   - Las comillas se manglan al pasar por az/cmd (`sh -c '...'` termina roto).
#   - Los app settings no siempre propagan.
# Aquí, dentro del contenedor, tenemos un shell de verdad y la última palabra:
# lo que exportemos gana sobre las variables que inyecte la plataforma.

set -e

# El share persistente de App Service se monta sobre /home EN RUNTIME, tapando
# cualquier directorio creado en build-time. Por eso el mkdir va aquí, después
# del mount: better-sqlite3 crea el archivo de la BD, pero no el directorio.
# Si /home es escribible lo usamos (persiste entre reinicios); si no, caemos a
# /app/data (efímero, pero el seed se re-aplica en cada arranque y el sitio
# público queda completo igual).
DATA_DIR=/home/data
if ! (mkdir -p "$DATA_DIR" 2>/dev/null && touch "$DATA_DIR/.w" 2>/dev/null); then
	DATA_DIR=/app/data
	mkdir -p "$DATA_DIR"
	echo "[start] /home no escribible -> BD efimera en $DATA_DIR"
else
	rm -f "$DATA_DIR/.w"
	echo "[start] usando almacenamiento persistente en $DATA_DIR"
fi

# export gana sobre el app setting DATABASE_PATH que inyecte Azure.
export DATABASE_PATH="$DATA_DIR/emdash.db"
mkdir -p "$DATA_DIR/uploads"

echo "[start] DATABASE_PATH=$DATABASE_PATH"
exec node /app/dist/server/entry.mjs

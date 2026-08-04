#!/bin/sh
# Arranque del contenedor (Azure App Service for Containers, o cualquier runtime Docker).
#
# Azure ejecuta el startup command sin shell (los `&&` truenan) y las comillas se
# manglan al pasar por az/cmd, así que el arranque vive aquí, dentro de la imagen.
#
# La BD es Postgres gestionado: la cadena de conexión llega en DATABASE_URL como
# variable de entorno del contenedor y el adaptador la lee en runtime.

set -e

# Los archivos subidos desde el admin. El share persistente de App Service se monta
# sobre /home EN RUNTIME, tapando lo creado en build-time, por eso el mkdir va aquí.
if mkdir -p /home/uploads 2>/dev/null; then
	echo "[start] uploads en /home/uploads"
else
	mkdir -p /app/uploads
	echo "[start] /home no escribible -> uploads efimeros en /app/uploads"
fi

if [ -z "$DATABASE_URL" ]; then
	echo "[start] AVISO: DATABASE_URL vacia; el CMS no podra conectarse a Postgres."
fi

exec node /app/dist/server/entry.mjs

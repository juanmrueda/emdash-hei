#!/bin/bash
# Azure App Service (Linux) startup. /home persiste entre reinicios.
# SQLite necesita que exista la carpeta antes de abrir la BD.
mkdir -p /home/data /home/uploads
cd /home/site/wwwroot
node ./dist/server/entry.mjs

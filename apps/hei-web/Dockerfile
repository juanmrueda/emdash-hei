# Grupo HEI — sitio emdash (Astro + Node) empaquetado desde el monorepo pnpm.
#
# Construir en la nube (sin Docker local) con Azure Container Registry:
#   az acr build -r <ACR> -t hei-web:latest -f apps/hei-web/Dockerfile .
#
# Basado en el patrón oficial de emdash (ver Dockerfile de la raíz).

# ---- Build: instala el monorepo, compila packages + app, y empaqueta ----
FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate
WORKDIR /app

COPY . .
# La entrada de workspace de slidev no se necesita y rompe el install en slim.
RUN sed -i '/slidev/d' pnpm-workspace.yaml || true
RUN pnpm install --frozen-lockfile

RUN pnpm run build
RUN pnpm --filter @grupo-hei/web build

# pnpm deploy arma un node_modules autocontenido; el build (dist) y el seed
# se copian aparte porque deploy no incluye la salida de build.
RUN pnpm --filter @grupo-hei/web deploy /deploy --prod --legacy \
 && cp -r apps/hei-web/dist /deploy/dist \
 && cp -r apps/hei-web/seed /deploy/seed \
 && cp apps/hei-web/astro.config.mjs /deploy/astro.config.mjs

# ---- Runtime: imagen mínima que solo corre el server ----
FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=build /deploy ./

# /home persiste en Azure App Service; SQLite + uploads viven ahí.
RUN mkdir -p /home/data /home/uploads
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    DATABASE_PATH=/home/data/emdash.db

# En Azure App Service, el share persistente (WEBSITES_ENABLE_APP_SERVICE_STORAGE)
# se monta sobre /home EN RUNTIME, tapando el `mkdir -p /home/data` de build-time.
# better-sqlite3 crea el archivo de la BD pero NO el directorio, así que hay que
# crearlo DESPUÉS del mount. Este script lo hace justo antes de arrancar el server.
# Se ejecuta como un solo token (sin operadores de shell ni comillas), evitando los
# problemas al pasar startup commands por Azure/cmd.
RUN printf '#!/bin/sh\nset -e\nmkdir -p /home/data /home/uploads\nexec node /app/dist/server/entry.mjs\n' > /app/start.sh \
 && chmod +x /app/start.sh

EXPOSE 8080
CMD ["/app/start.sh"]

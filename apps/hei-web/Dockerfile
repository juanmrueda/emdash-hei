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

# El arranque vive en un script dentro de la imagen (ver docker-start.sh): crea el
# directorio de la BD DESPUÉS de que la plataforma monte sus volúmenes y fija
# DATABASE_PATH. Así el deploy no depende de startup commands ni app settings.
COPY apps/hei-web/docker-start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8080
CMD ["/app/start.sh"]

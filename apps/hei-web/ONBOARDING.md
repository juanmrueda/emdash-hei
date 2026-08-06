# ONBOARDING — para el siguiente agente

Trabajas en el **sitio de Grupo HEI** ubicado en `apps/hei-web/`. Este repo es, además, el
código fuente del CMS **emdash**; el sitio solo lo consume.

## ⚠️ Lee solo lo necesario (no leas todo el repo)

NO recorras todo el monorepo `emdash` (packages/_, demos/_, etc.). Para entender y trabajar el
sitio basta con, en este orden:

1. **`apps/hei-web/MAP.md`** — mapa del proyecto y dónde está cada cosa.
2. **Este archivo** — cómo correr y los gotchas que rompen el dev.
3. Solo el archivo concreto que vas a tocar (el componente de bloque, `seed/seed.json`, etc.).
   Las props de cada bloque están tipadas en el frontmatter de `src/components/blocks/<Bloque>.astro`.

Diseño de referencia (Figma export): `../../assets/hei-design/*.png` (Desktop y Mobile).
Solo entra al código de `packages/` si vas a depurar el CMS en sí (raro); en ese caso lee
`packages/.../*/src/...` puntual, no el árbol completo.

## Cómo correr (Windows / PowerShell)

`pnpm` NO está en el PATH global. Se instaló un shim vía corepack en `.corepack-bin/`
(ignorado por git). En **cada** invocación de shell antepón esa ruta:

```powershell
$env:Path = "C:\dev\emdash-hei\.corepack-bin;$env:Path"
```

Si `.corepack-bin\` no existe (máquina nueva), recréalo una vez:

```powershell
New-Item -ItemType Directory -Force C:\dev\emdash-hei\.corepack-bin | Out-Null
corepack enable --install-directory C:\dev\emdash-hei\.corepack-bin pnpm
```

Pasos:

```powershell
$env:Path = "C:\dev\emdash-hei\.corepack-bin;$env:Path"
cd C:\dev\emdash-hei
pnpm install            # raíz del monorepo
pnpm run build          # ★ construye los packages de emdash a dist/ (requerido antes de dev)
cd apps\hei-web
pnpm exec astro dev --port 4321
```

Sitio: http://localhost:4321 — Admin del CMS: http://localhost:4321/\_emdash/admin

### ★ Cargar el contenido demo (las 8 páginas)

En el primer arranque emdash auto-siembra **solo el esquema**, no el contenido. Si las páginas
salen vacías ("Configura el contenido…"), carga el seed con contenido una sola vez:

```
curl "http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"
```

(Endpoint solo-dev: corre migraciones, crea admin de desarrollo, aplica `seed/seed.json`
**con contenido** y marca el setup como completo.) La BD local es SQLite y persiste en
`apps/hei-web/.persistent-data/emdash.db`, así que solo se hace una vez por base de datos local.

Si editas `seed/seed.json` y quieres re-aplicarlo, borra `apps/hei-web/.persistent-data/` **y**
`node_modules/.vite` (Vite cachea el seed inlineado) y repite, o edita el contenido directamente
en el admin.

## Gotchas que rompen el build (no repetir)

- **NO usar `astro-iconset`.** Rompe el SSR bajo el runner de Cloudflare/workerd (error del
  optimizador de Vite "chunk does not exist" → el stream se trunca y la página queda a medias).
  Usa `src/components/Icon.astro` (SVG inline). Para un ícono nuevo, añade su path al record `ICONS`.
- Tras editar `package.json`, **corre `pnpm install`** o el dev falla con
  `ERR_PNPM_VERIFY_DEPS_BEFORE_RUN` (lockfile desfasado).
- `astro.config.mjs` cambia → **reinicia** el dev server (no hay HMR para la config).
- Páginas de CMS deben ser server-rendered (`output: "server"`); nada de `getStaticPaths()`.
- Bloques: Block Kit del editor solo admite subcampos escalares; las **viñetas** se escriben como
  texto multilínea y se parten por salto de línea al render. Los componentes ya aceptan tanto
  `string[]` (seed) como string (editor).

## Verificación rápida

```powershell
# todas deben dar HTTP 200 y traer </footer> (render completo, no truncado)
"", "quienes-somos","marcas","salutia","sostenibilidad","trabaja","contacto","denuncias" |
  ForEach-Object { $u="http://localhost:4321/$_"; "$u -> " + (Invoke-WebRequest $u -UseBasicParsing).StatusCode }
```

Para inspeccionar el contenido guardado en la BD local (Node 24 trae `node:sqlite`):
ver `apps/hei-web/.persistent-data/emdash.db`, tabla `ec_pages` (columnas tipadas:
`title`, `content`, `slug`, `status`, `locale`).

## Assets y revisión 1:1 contra Figma

- **Bajar assets de Figma**: `scripts/figma-export.mjs` usa la API REST (necesita
  `FIGMA_TOKEN` con scope `file_content:read` + el file key).
  - `--fills` → fotos originales (image fills) e incluso logos que viven como fill. **Confiable.**
  - `--marked` → nodos con "Export" en Figma. El endpoint `/images` de render se **rate-limitea
    muy fácil**; si se bloquea, espera bastante o usa otro token (el límite es por token).
  - Truco: **los image fills suelen SER los logos/íconos**, nombrados por su capa (p. ej.
    `marcas-...-team-collaboration.png` resultó ser el logo de cendis). Ábrelos antes de asumir.
  - Lo curado va a `public/logos/` y `public/img/`; el dump crudo a `figma-export/` (gitignored).
- **Revisión 1:1 sin la API** (cuando esté rate-limited): usa `sharp` (está en el monorepo) para
  recortar el export de alta resolución `assets/hei-design/<Pantalla> _ Desktop.png` en regiones y
  verlas en detalle / muestrear colores exactos:
  ```js
  const sharp = require("C:/dev/emdash-hei/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp");
  await sharp(src).extract({ left, top, width, height }).toFile(out); // recorte
  const px = await sharp(src).extract({ left: x, top: y, width: 8, height: 8 }).raw().toBuffer(); // color RGB
  ```
- **Color de marca**: verde oficial **#31D697** (en `theme.css` como `--color-primary`).

## Trabajo pendiente (ver también MAP.md → "Estado / avance")

1. **Pase 1:1 de 6 pantallas**: Home ✅ y Quiénes somos ✅ ya están afinados; faltan Marcas,
   Salutia, Sostenibilidad, Trabaja, Contacto y Denuncias.
2. **Formularios**: crear en el admin `formulario-de-contacto`, `formulario-salutia` y
   `trabaja-con-nosotros` (esos slugs exactos son los que referencian los bloques
   `hei.formSection`); notificaciones por email (faltan correos destino del cliente) +
   Turnstile (anti-spam).
3. **Datos de contacto reales** (dirección, teléfono, WhatsApp `wa.me/...`) en `Base.astro` y `seed.json`.
   (Logos y fotos reales **ya están** en `public/`.)
4. **Migración a la infraestructura del cliente** y conexión del dominio propio.

> **CI / GitHub Actions**: los workflows heredados de emdash fueron eliminados. Queda uno propio,
> `deploy-hei.yml`, que construye la imagen Docker y la publica en GHCR. No corre tests ni
> typecheck, y el reinicio de Azure todavía es manual.

> **Modelo de contenido en producción**: el `seed.json` solo siembra una BD vacía. En prod el
> contenido vive en Postgres y se edita por el admin; re-deployar NO lo sobrescribe (no se puede
> "borrar y re-sembrar" como en local sin perder datos/forms). El modelo vigente es **contenido
> por admin**.

> **Despliegue**: el sitio corre en **Azure App Service**, no en Cloudflare. Variables de entorno,
> flujo y trampas conocidas en [DEPLOYMENT.md](./DEPLOYMENT.md). Léelo antes de tocar producción.

## Convenciones

- Indentación con **tabs** (oxfmt). Texto de UI en **español**.
- Re-tematizar = editar `src/styles/theme.css` (tokens de color/espaciado/​radios).
- Para entender una API de emdash, hay un MCP de docs (`https://docs.emdashcms.com/mcp`,
  herramienta `search_docs`) y skills en `.agents/skills/` (empieza por `building-emdash-site`).

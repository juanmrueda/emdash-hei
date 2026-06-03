# ONBOARDING — para el siguiente agente

Trabajas en el **sitio de Grupo HEI** ubicado en `apps/hei-web/`. Este repo es, además, el
código fuente del CMS **emdash**; el sitio solo lo consume.

## ⚠️ Lee solo lo necesario (no leas todo el repo)

NO recorras todo el monorepo `emdash` (packages/*, demos/*, etc.). Para entender y trabajar el
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

Sitio: http://localhost:4321 — Admin del CMS: http://localhost:4321/_emdash/admin

### ★ Cargar el contenido demo (las 8 páginas)

En el primer arranque emdash auto-siembra **solo el esquema**, no el contenido. Si las páginas
salen vacías ("Configura el contenido…"), carga el seed con contenido una sola vez:

```
curl "http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"
```

(Endpoint solo-dev: corre migraciones, crea admin de desarrollo, aplica `seed/seed.json`
**con contenido** y marca el setup como completo.) El D1 local persiste en
`apps/hei-web/.wrangler/state`, así que solo se hace una vez por base de datos local.

Si editas `seed/seed.json` y quieres re-aplicarlo, borra `apps/hei-web/.wrangler/` y repite, o
edita el contenido directamente en el admin.

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

Para inspeccionar el contenido guardado en el D1 local (Node 24 trae `node:sqlite`):
ver `apps/hei-web/.wrangler/state/v3/d1/.../*.sqlite`, tabla `ec_pages` (columnas tipadas:
`title`, `content`, `slug`, `status`, `locale`).

## Trabajo pendiente (ver también MAP.md → "Estado / placeholders")

1. **Formularios**: crear en el admin los forms con slugs `contacto`, `salutia-operacion`,
   `trabaja-perfil`; configurar notificaciones por email (faltan correos destino del cliente) y
   Turnstile (anti-spam). Los bloques `hei.formSection` ya los referencian por slug.
2. **Assets reales**: logos (hei/cendis/meliora/Salutia), fotos (hoy `picsum.photos`), datos de
   contacto y número de WhatsApp (`wa.me/...` en `seed.json` y `Base.astro`).
3. **Deploy** a Cloudflare (D1 + R2; los plugins sandbox requieren cuenta de pago, o comentar
   `worker_loaders` en `wrangler.jsonc`).

## Convenciones

- Indentación con **tabs** (oxfmt). Texto de UI en **español**.
- Re-tematizar = editar `src/styles/theme.css` (tokens de color/espaciado/​radios).
- Para entender una API de emdash, hay un MCP de docs (`https://docs.emdashcms.com/mcp`,
  herramienta `search_docs`) y skills en `.agents/skills/` (empieza por `building-emdash-site`).

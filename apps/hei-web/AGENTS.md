# AGENTS — Sitio Grupo HEI (`apps/hei-web`)

Sitio corporativo de **Grupo HEI** (salud, Guatemala, español) construido sobre el CMS **emdash**
(Astro + Node). Este repo es además el código fuente de emdash; el sitio solo lo consume.

**Despliegue → Azure App Service + Postgres. Ver [DEPLOYMENT.md](./DEPLOYMENT.md).**

## 👉 Empieza aquí (no leas todo el monorepo)

1. **[MAP.md](./MAP.md)** — mapa del proyecto: qué hay y dónde.
2. **[ONBOARDING.md](./ONBOARDING.md)** — cómo correrlo (pnpm vía corepack, `pnpm run build`,
   sembrar contenido con `dev-bypass`), gotchas que rompen el build, y trabajo pendiente.
3. Luego solo el archivo que vayas a tocar.

No recorras `packages/*`, `demos/*`, ni `templates/*`. Para entender un bloque, su contrato está
en el frontmatter de `src/components/blocks/<Bloque>.astro`. Todo el contenido vive en
`seed/seed.json`.

## Reglas rápidas

- **No usar `astro-iconset`** (rompe SSR en workerd). Usa `src/components/Icon.astro` (SVG inline).
- Páginas server-rendered (`output: "server"`); sin `getStaticPaths()` para contenido del CMS.
- `Astro.cache.set(cacheHint)` en páginas que consultan contenido.
- Tras tocar `package.json` → `pnpm install`; tras tocar `astro.config.mjs` → reiniciar dev.
- Indentación con tabs (oxfmt); UI en español. Verde de marca: **#31D697** (`src/styles/theme.css`).
- **Otro agente trabaja este repo desde otra máquina → `git pull` ANTES de empezar.** Idealmente ramas + PR, no push directo a `main`.
- Stack local: **Node + SQLite** (adapter `@astrojs/node`); BD en `apps/hei-web/.persistent-data/emdash.db`. En producción, **Postgres** (el driver se fija en build con `DB_DRIVER`).
- Deploy: imagen Docker → GHCR → Azure App Service; arranca con `docker-start.sh`. **No es Cloudflare**; el `wrangler.jsonc` es residuo y nada lo referencia. Detalle y trampas en [DEPLOYMENT.md](./DEPLOYMENT.md).
- **Re-sembrar contenido**: borra `.persistent-data/emdash.db` **y** `node_modules/.vite` (Vite cachea el seed inlineado; si no lo borras, sigue sirviendo el seed viejo) → reinicia dev → pega `dev-bypass`. Las carpetas `.persistent-data/` y `uploads/` deben existir (`mkdir -p`).
- **`seed/seed.json` = UTF-8 SIN BOM.** No lo edites por PowerShell `Out-File`/`Set-Content` sin `-Encoding utf8`: mete BOM (→ cae al seed default vacío) o mojibake en los acentos (é→├®). Repara con round-trip iconv-lite cp850.
- **Imágenes**: `public/wp/*`, `public/img/*`, `public/logos/*` viajan con el repo. Las de la **biblioteca de medios** (`/_emdash/api/media/file/<id>`) viven en `uploads/` (gitignoreado) → **no viajan**; hay que commitearlas o usar `$media` en el seed.
- CI: los workflows de emdash fueron eliminados (fork solo del sitio). Queda uno propio, `deploy-hei.yml`, que construye y publica la imagen. **No corre tests ni typecheck.**

## Comandos

```powershell
$env:Path = "C:\dev\emdash-hei\.corepack-bin;$env:Path"   # pnpm no está en PATH
pnpm install && pnpm run build                            # desde la raíz del repo
cd apps\hei-web; pnpm exec astro dev --port 4321
```

Admin del CMS: `http://localhost:4321/_emdash/admin`. Para cargar el contenido demo la primera
vez: `curl "http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"`.

Docs del CMS por MCP: `https://docs.emdashcms.com/mcp` (`search_docs`). Skills en `.agents/skills/`.

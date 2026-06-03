# AGENTS — Sitio Grupo HEI (`apps/hei-web`)

Sitio corporativo de **Grupo HEI** (salud, Guatemala, español) construido sobre el CMS **emdash**
(Astro + Cloudflare). Este repo es además el código fuente de emdash; el sitio solo lo consume.

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
- Indentación con tabs (oxfmt); UI en español.
- Re-tematizar = `src/styles/theme.css`. Verde de marca: **#31D697**.
- Editar contenido/imágenes en `seed.json` requiere re-sembrar el D1 local
  (borra `apps/hei-web/.wrangler/` → reinicia dev → pega el `dev-bypass`).
- Assets reales en `public/logos` y `public/img`; bajarlos con `scripts/figma-export.mjs`
  (ver ONBOARDING). Logos/fotos del Home ya están; faltan datos de contacto y formularios.

## Comandos

```powershell
$env:Path = "C:\dev\emdash-hei\.corepack-bin;$env:Path"   # pnpm no está en PATH
pnpm install && pnpm run build                            # desde la raíz del repo
cd apps\hei-web; pnpm exec astro dev --port 4321
```

Admin del CMS: `http://localhost:4321/_emdash/admin`. Para cargar el contenido demo la primera
vez: `curl "http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin"`.

Docs del CMS por MCP: `https://docs.emdashcms.com/mcp` (`search_docs`). Skills en `.agents/skills/`.

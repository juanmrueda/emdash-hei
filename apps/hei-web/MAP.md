# MAP — Sitio Grupo HEI (`apps/hei-web`)

Mapa del proyecto para orientarte rápido. **No necesitas leer el resto del monorepo `emdash`**
(este repo es el código fuente del CMS emdash; este sitio solo lo *consume*). Lee únicamente
lo que aparece aquí y en [ONBOARDING.md](./ONBOARDING.md).

## Qué es

Sitio corporativo de **Grupo HEI** (sector salud, Guatemala, en español), construido **sobre
el CMS emdash** (Astro + Cloudflare D1/R2/Workers). El contenido se administra desde el panel
del CMS en `/_emdash/admin`. Diseño original en Figma: `../../assets/hei-design/*.png`.

## Arquitectura en una frase

Cada página es una entrada de la colección `pages` cuyo campo `content` es **Portable Text**
compuesto por **bloques HEI** (hero, cards, etc.). Un renderer mapea cada tipo de bloque a un
componente Astro. Todo el contenido inicial vive en `seed/seed.json`.

```
Petición → src/pages/<slug>.astro → getEmDashEntry("pages", slug)
        → <HeiBlocks value={content}/> → src/components/blocks/*.astro
```

## Árbol de archivos (lo que importa)

```
apps/hei-web/
├─ astro.config.mjs            # Integración emdash + plugins (hei-blocks, forms) + fuentes
├─ wrangler.jsonc             # Bindings Cloudflare: DB (D1), MEDIA (R2), LOADER
├─ package.json               # name @grupo-hei/web; script dev = astro dev; seed → seed/seed.json
├─ seed/seed.json             # ★ TODO el contenido: settings, menús y las 8 páginas en bloques
├─ src/
│  ├─ layouts/Base.astro      # Header (logo+nav+¡Hablemos!), footer, <slot/>, SEO, móvil
│  ├─ components/
│  │  ├─ Logo.astro           # Wordmark "hei" placeholder (puntitos). Reemplazar por SVG real.
│  │  ├─ Icon.astro           # ★ Iconos SVG inline (NO usar astro-iconset; ver ONBOARDING)
│  │  ├─ HeiBlocks.astro      # ★ Renderer: mapea "hei.*" → componente de bloque
│  │  └─ blocks/              # Un componente por tipo de bloque
│  │     ├─ Hero.astro        # hei.hero  (variant image|solid, palabra resaltada)
│  │     ├─ Stats.astro       # hei.stats (+55/+700/+70)
│  │     ├─ ImageText.astro   # hei.imageText (imagen + viñetas + stats + badge)
│  │     ├─ Cards.astro       # hei.cards (grid; color white|blue|green|navy)
│  │     ├─ Brands.astro      # hei.brands (filas de marca con logo)
│  │     ├─ LogoCloud.astro   # hei.logoCloud
│  │     ├─ CtaBand.astro     # hei.ctaBand (layout band|card; whatsapp)
│  │     ├─ Timeline.astro    # hei.timeline (Nuestra Historia)
│  │     ├─ Channels.astro    # hei.channels (Denuncias)
│  │     └─ FormSection.astro # hei.formSection (embebe un form por slug)
│  ├─ pages/                  # 8 páginas, todas iguales: cargan la entry y rinden HeiBlocks
│  │  ├─ index.astro (home) · quienes-somos · marcas · salutia
│  │  └─ sostenibilidad · trabaja · contacto · denuncias  (+ 404.astro)
│  ├─ plugins/hei-blocks/index.ts  # ★ Registra los tipos de bloque para el editor del admin
│  ├─ styles/theme.css        # ★ Paleta y tokens de marca HEI (lo único para re-tematizar)
│  └─ live.config.ts          # Boilerplate del loader de emdash (no tocar)
└─ .agents/skills/            # Skills de emdash (building-emdash-site, etc.) — opcional
```

★ = archivos donde se trabaja a diario.

## Modelo de contenido

- **Colección `pages`**: campos `title` (string) + `content` (portableText con bloques `hei.*`).
- **Menús**: `primary` (nav) y `footer_company` (columna "Sobre Grupo HEI").
- **Settings**: `title`, `tagline`.
- **Bloques `hei.*`**: definidos para el editor en `src/plugins/hei-blocks/index.ts` y
  renderizados por `src/components/blocks/*`. Las props de cada bloque están tipadas en el
  frontmatter de su componente — esa es la fuente de verdad de qué acepta cada bloque.

## Páginas y su composición (resumen)

| Ruta              | Bloques principales                                              |
| ----------------- | --------------------------------------------------------------- |
| `/`               | hero · imageText(1968) · stats · ctaBand(card) · logoCloud · ctaBand(band) |
| `/quienes-somos`  | hero · timeline · ctaBand(card) · cards(Pilares)                |
| `/marcas`         | hero · brands(cendis/meliora/Salutia)                          |
| `/salutia`        | hero(solid) · cards · formSection(`salutia-operacion`) · ctaBand |
| `/sostenibilidad` | hero · cards(Tres ejes) · ctaBand(card)                        |
| `/trabaja`        | hero · cards(Cultura/Valores) · cards(Oportunidades) · formSection(`trabaja-perfil`) |
| `/contacto`       | hero · formSection(`contacto`) · ctaBand(band, WhatsApp)       |
| `/denuncias`      | hero · channels · ctaBand(card, WhatsApp)                      |

## Estado / placeholders a reemplazar

- **Imágenes**: URLs `picsum.photos` en `seed/seed.json` (reemplazar por fotos reales).
- **Logos**: `Logo.astro` y `brands`/`logoCloud` usan texto; faltan SVGs de hei/cendis/meliora/Salutia.
- **Datos de contacto** (dirección, teléfono, WhatsApp `wa.me/...`): hardcodeados en `Base.astro` y `seed.json`.
- **Formularios**: los bloques `formSection` referencian slugs `contacto`, `salutia-operacion`,
  `trabaja-perfil` que **aún no existen** en el admin; mientras tanto el form se renderiza vacío
  (sin romper). Crearlos en `/_emdash/admin` (plugin de formularios) y definir correos destino.
- **Deploy** a Cloudflare pendiente (cuenta + dominio).

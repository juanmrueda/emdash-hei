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
├─ astro.config.mjs            # Integración emdash + plugins (hei-blocks, forms) + fuente Inter
├─ wrangler.jsonc             # Bindings Cloudflare: DB (D1), MEDIA (R2), LOADER
├─ package.json               # name @grupo-hei/web; script dev = astro dev; seed → seed/seed.json
├─ seed/seed.json             # ★ TODO el contenido: settings, menús y las 8 páginas en bloques
├─ public/
│  ├─ logos/                  # hei.png, hei-white.png, salutia.png, cendis.png, meliora.png (reales)
│  └─ img/                    # 17 fotos reales (por pantalla) + icons/ (íconos verdes de stats)
├─ scripts/figma-export.mjs   # Baja assets desde la API de Figma (ver ONBOARDING)
├─ src/
│  ├─ layouts/Base.astro      # Header (oscuro translúcido, logo blanco, nav + subrayado activo,
│  │                          #   ¡HABLEMOS!), footer (esquinas redondeadas), <slot/>, SEO, móvil
│  ├─ components/
│  │  ├─ Logo.astro           # <img> del logo real; variant dark|light (light = blanco)
│  │  ├─ Icon.astro           # ★ Iconos SVG inline (NO usar astro-iconset; ver ONBOARDING)
│  │  ├─ HeiBlocks.astro      # ★ Renderer: mapea "hei.*" → componente de bloque
│  │  └─ blocks/              # Un componente por tipo de bloque
│  │     ├─ Hero.astro        # hei.hero (image|solid, highlight, overlay off por defecto, full=alto sin radius)
│  │     ├─ Stats.astro       # hei.stats (íconos img o SVG; cifra dos tonos prefix/figure)
│  │     ├─ ImageText.astro   # hei.imageText (accent verde, viñetas circulares, statcard sobrepuesta)
│  │     ├─ Cards.astro       # hei.cards (grid cols-N | bento; color white|blue|green|navy; img/decoración)
│  │     ├─ Brands.astro      # hei.brands (filas de marca con logo)
│  │     ├─ LogoCloud.astro   # hei.logoCloud
│  │     ├─ CtaBand.astro     # hei.ctaBand (band|card; band admite foto+filtro verde; 2 CTAs; whatsapp)
│  │     ├─ Timeline.astro    # hei.timeline (Nuestra Historia)
│  │     ├─ Channels.astro    # hei.channels (Denuncias)
│  │     └─ FormSection.astro # hei.formSection (embebe un form por slug)
│  ├─ pages/                  # 8 páginas, todas iguales: cargan la entry y rinden HeiBlocks
│  │  ├─ index.astro (home) · quienes-somos · marcas · salutia
│  │  └─ sostenibilidad · trabaja · contacto · denuncias  (+ 404.astro)
│  ├─ plugins/hei-blocks/index.ts  # ★ Registra los tipos de bloque para el editor del admin
│  ├─ styles/theme.css        # ★ Tokens de marca (verde oficial #31D697; lo único para re-tematizar)
│  └─ live.config.ts          # Boilerplate del loader de emdash (no tocar)
├─ figma-export/              # (gitignored) dump crudo de Figma: _image-fills/, crops/
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

## Estado / avance (actualizado)

Base global lista: assets reales (logos hei/Salutia/cendis/meliora + 17 fotos en `public/`),
verde de marca **#31D697**, header oscuro translúcido (logo blanco, subrayado del activo,
¡HABLEMOS!), footer redondeado, heros **sin filtro** (banner + radius; Home con `full` = alto sin
radius). Los workflows de CI heredados de emdash fueron **eliminados** (este fork solo hospeda el
sitio); el deploy tendrá su propio workflow.

Pase 1:1 contra Figma, por pantalla:

| Pantalla | Estado |
| --- | --- |
| Home (`/`) | ✅ 1:1 afinado |
| Quiénes somos (`/quienes-somos`) | ✅ 1:1 afinado (Nuestra Historia con líneas + 1968 en círculo; Pilares en bento) |
| Marcas (`/marcas`) | ⬜ pendiente 1:1 |
| Salutia (`/salutia`) | ⬜ pendiente 1:1 |
| Ética y sostenibilidad (`/sostenibilidad`) | ⬜ pendiente 1:1 |
| Trabaja con nosotros (`/trabaja`) | ⬜ pendiente 1:1 |
| Contacto (`/contacto`) | ⬜ pendiente 1:1 |
| Denuncias (`/denuncias`) | ⬜ pendiente 1:1 |

Todas las páginas ya están **construidas y renderizando** con contenido; lo pendiente es el
afinado visual 1:1 de las 6 restantes.

Pendiente transversal:
- **Datos de contacto reales** (dirección, teléfono, WhatsApp `wa.me/...`): placeholders en
  `Base.astro` y `seed.json`.
- **Formularios**: los `formSection` referencian `contacto`, `salutia-operacion`, `trabaja-perfil`
  que **aún no existen** en el admin (el form se renderiza vacío sin romper). Crearlos en
  `/_emdash/admin` (plugin de formularios) + correos destino.
- **Deploy** a Cloudflare (cuenta + dominio + workflow propio o integración Git de Cloudflare).

> Cómo correr y revisar: ver [ONBOARDING.md](./ONBOARDING.md). El sitio en local: `localhost:4321`.
> El **método 1:1**: recortar el Figma de `assets/hei-design/<Pantalla> _ Desktop.png` con `sharp`
> y comparar (la API de Figma se rate-limitea); detalle en ONBOARDING.

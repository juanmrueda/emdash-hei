# MAP — Sitio Grupo HEI (`apps/hei-web`)

Mapa del proyecto para orientarte rápido. **No necesitas leer el resto del monorepo `emdash`**
(este repo es el código fuente del CMS emdash; este sitio solo lo _consume_). Lee únicamente
lo que aparece aquí y en [ONBOARDING.md](./ONBOARDING.md).

## Qué es

Sitio corporativo de **Grupo HEI** (sector salud, Guatemala, en español), construido **sobre
el CMS emdash** (Astro + Node, SQLite en local y Postgres en producción). El contenido se
administra desde el panel del CMS en `/_emdash/admin`. Diseño original en Figma:
`../../assets/hei-design/*.png`.

> **Despliegue**: Azure App Service, no Cloudflare. Ver [DEPLOYMENT.md](./DEPLOYMENT.md).

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
├─ Dockerfile                 # Imagen de producción (build multistage) → GHCR → Azure
├─ docker-start.sh            # Arranque del contenedor: prepara uploads y lanza el server
├─ wrangler.jsonc             # ⚠️ RESIDUO de la etapa Cloudflare. Nada lo referencia; borrable
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

| Ruta              | Bloques principales                                                                  |
| ----------------- | ------------------------------------------------------------------------------------ |
| `/`               | hero · imageText(1968) · stats · ctaBand(card) · logoCloud · ctaBand(band)           |
| `/quienes-somos`  | hero · timeline · ctaBand(card) · cards(Pilares)                                     |
| `/marcas`         | hero · brands(cendis/meliora/Salutia)                                                |
| `/salutia`        | hero(solid) · cards · formSection(`salutia-operacion`) · ctaBand                     |
| `/sostenibilidad` | hero · cards(Tres ejes) · ctaBand(card)                                              |
| `/trabaja`        | hero · cards(Cultura/Valores) · cards(Oportunidades) · formSection(`trabaja-perfil`) |
| `/contacto`       | hero · formSection(`contacto`) · ctaBand(band, WhatsApp)                             |
| `/denuncias`      | hero · channels · ctaBand(card, WhatsApp)                                            |

## Estado / avance (actualizado)

Base global lista: assets reales (logos hei/Salutia/cendis/meliora + fotos en `public/`),
verde de marca **#31D697**, header oscuro translúcido (logo blanco, subrayado del activo,
¡HABLEMOS!), footer redondeado, heros **sin filtro** (banner + radius; Home con `full` = alto sin
radius). Los workflows de CI heredados de emdash fueron **eliminados** (este fork solo hospeda el
sitio); queda `deploy-hei.yml`, que publica la imagen Docker.

El sitio está **en producción en Azure**: https://grupohei-web.azurewebsites.net — sin dominio
propio todavía. La migración a la infraestructura del cliente está pendiente.

Pase 1:1 contra Figma, por pantalla:

| Pantalla                                   | Estado                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Home (`/`)                                 | ✅ 1:1 afinado                                                                        |
| Quiénes somos (`/quienes-somos`)           | ✅ 1:1 afinado                                                                        |
| Marcas (`/marcas`)                         | ✅ 1:1 afinado (focal `center top` en hero)                                           |
| Salutia (`/salutia`)                       | ✅ 1:1 afinado (hero ctaBand card + `heroCard`, fotos salutia-b2b/cta)                |
| Ética y sostenibilidad (`/sostenibilidad`) | ✅ 1:1 afinado (ícono thumbs-up Transparencia; focal ctaBand)                         |
| Trabaja con nosotros (`/trabaja`)          | ✅ 1:1 afinado (foto Cultura `imageTop+rowSpan`; form `trabaja-perfil` creado)        |
| Contacto (`/contacto`)                     | ✅ 1:1 afinado (focal hero; ctaBand foto+filtro verde; form `contacto` creado)        |
| Denuncias (`/denuncias`)                   | ✅ 1:1 afinado (focal hero; foto channels `etica-foto.png`; fondo líneas en Channels) |

## Componentes extendidos (cambios respecto al scaffold inicial)

| Componente          | Extensiones añadidas                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Hero.astro`        | `focal` (object-position por bloque)                                                                                                            |
| `Cards.astro`       | `imageTop`, `imageOnly`, `rowSpan` (foto col izq spanning 2 filas); `titleColor`; `cards-compact` (sin items = solo heading); ícono `thumbs-up` |
| `CtaBand.astro`     | `heroCard` (margin-top hero + padding); `photoStyle` (foto sin filtro, texto izq); `focal` en card media                                        |
| `Channels.astro`    | Fondo de líneas diagonales (igual que Timeline)                                                                                                 |
| `FormSection.astro` | Estilos HEI: inputs pill, fondo gris, borde gris suave, botón verde; grid 2 col; `::file-selector-button` estilizado                            |
| `Icon.astro`        | `thumbs-up` SVG añadido                                                                                                                         |
| `Base.astro`        | `parentMap` para marcar Marcas activo cuando se está en `/salutia`                                                                              |

## Formularios

Los bloques `hei.formSection` del seed los referencian por slug. **El slug tiene que coincidir
exactamente**: si no, la página no da error — renderiza el área del formulario vacía.

| Slug esperado por el seed | Página      | Campos principales                                                                                  |
| ------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `trabaja-con-nosotros`    | `/trabaja`  | Nombre, Email, Teléfono, Área interés, LinkedIn, CV (file)                                          |
| `formulario-de-contacto`  | `/contacto` | Nombre, Empresa, Cargo, Email, Motivo (select), Teléfono, Mensaje                                   |
| `formulario-salutia`      | `/salutia`  | Lab/Farma, País, Tipo productos, Necesidad, Volumen, Nombre contacto, Cargo, Correo corp., Teléfono |

⚠️ **No viajan con el seed**: `seed.json` no exporta `_plugin_storage`, así que en un entorno
nuevo hay que recrearlos desde el admin. Ver [DEPLOYMENT.md](./DEPLOYMENT.md).

Pendiente transversal:

- **Datos de contacto reales** (dirección, teléfono, WhatsApp `wa.me/...`): placeholders en
  `Base.astro` y `seed.json`.
- **Correos destino** de los 3 formularios: configurar en el admin (Settings de cada form).
- **Dominio propio**: hoy el sitio vive en `grupohei-web.azurewebsites.net`. Al conectar el
  definitivo hay que actualizar `EMDASH_SITE_URL` **y** las dos opciones de URL en la BD, o los
  passkeys y las invitaciones dejan de funcionar (ver [DEPLOYMENT.md](./DEPLOYMENT.md)).
- **Migración a la infraestructura del cliente**: pendiente.

> Cómo correr y revisar: ver [ONBOARDING.md](./ONBOARDING.md). El sitio en local: `localhost:4322`.
> El **método 1:1**: recortar el Figma de `assets/hei-design/<Pantalla> _ Desktop.png` con `sharp`
> y comparar (la API de Figma se rate-limitea); detalle en ONBOARDING.
> **Acceso admin en dev**: `/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin`

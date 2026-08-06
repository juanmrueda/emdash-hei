# DEPLOYMENT — Sitio Grupo HEI

Cómo se despliega el sitio **hoy**, qué hay que configurar, y las trampas que ya se pagaron.

> **El sitio NO corre en Cloudflare.** Documentación previa (`MAP.md`, `ONBOARDING.md`) describía
> un despliegue en D1/R2/Workers que se abandonó. El `wrangler.jsonc` que queda en la carpeta es
> residuo de esa etapa: nada lo referencia — ni `astro.config.mjs`, ni el `Dockerfile`, ni el
> workflow.

## Arquitectura

| Pieza | Dónde |
| --- | --- |
| Servidor | Azure App Service for Containers — `grupohei-web`, resource group `hei-rg` |
| Base de datos | Supabase Postgres 17, vía **Session pooler** |
| Imagen Docker | `ghcr.io/juanmrueda/hei-web:latest` |
| Archivos subidos | `/home/uploads` dentro del contenedor (Azure Files) |
| URL | https://grupohei-web.azurewebsites.net |

El adaptador es `@astrojs/node` en modo standalone. El driver de BD se elige **en build** según
`DB_DRIVER` (el `Dockerfile` fija `postgres`); la cadena de conexión se resuelve **en runtime**,
para no hornear credenciales en la imagen.

## Flujo de despliegue

1. Push a `main` → GitHub Actions construye la imagen y la publica en GHCR
2. Azure jala la imagen nueva

**El paso 2 no es automático hoy**: falta el secret `AZURE_WEBHOOK`, así que hay que rematar a mano:

```bash
az webapp restart -n grupohei-web -g hei-rg
```

Sin ese reinicio, Azure sigue sirviendo la versión anterior **sin ningún error**.

Además, se han visto **pushes que no disparan el workflow** pese a tocar rutas vigiladas.
Verifica siempre después de subir:

```bash
gh run list --limit 1 --workflow=deploy-hei.yml
```

## Variables de entorno (Azure → Environment variables)

| Variable | Valor | Si falta |
| --- | --- | --- |
| `DATABASE_URL` | Cadena del **Session pooler** de Supabase + `?sslmode=require` | El CMS arranca pero no conecta: todo responde `NOT_CONFIGURED` |
| `EMDASH_SITE_URL` | `https://grupohei-web.azurewebsites.net` | **Rompe los passkeys.** Ver trampas |
| `WEBSITES_PORT` | `8080` | Azure no encuentra el contenedor |
| `WEBSITES_ENABLE_APP_SERVICE_STORAGE` | `true` | Los archivos subidos se pierden al reiniciar |

`DATABASE_PATH` sigue configurado en Azure pero **ya no se usa** (quedó de cuando era SQLite).

Además, en la configuración del App Service: **`httpsOnly = true`**.

## Trampas

Todas fallan en silencio o con un mensaje que apunta al lugar equivocado.

### 1. `EMDASH_SITE_URL` debe existir ANTES de correr el asistente de instalación

El asistente graba la URL canónica con `setIfAbsent`, o sea **una sola vez y sin posibilidad de
corregirla desde ninguna pantalla**. Si no está la variable, `getPublicOrigin()` cae al origen
interno del contenedor —que es literalmente `http://localhost:8080`— y lo deja grabado.

Consecuencia: el registro de passkey falla con `SecurityError`, un mensaje que no menciona URLs
por ningún lado, y los enlaces de invitación apuntan a `localhost`.

Corrección posterior, solo por SQL:

```sql
insert into options (name, value) values
  ('emdash:site_url', '"https://grupohei-web.azurewebsites.net"'),
  ('site:url',        '"https://grupohei-web.azurewebsites.net"')
on conflict (name) do update set value = excluded.value;
```

Los valores van **JSON-serializados** (comilla simple de SQL por fuera, doble de JSON por dentro).
Después hay que **reiniciar**: el runtime cachea el valor al arrancar.

### 2. Hay dos ajustes de URL distintos

| Opción | Quién la escribe | Para qué |
| --- | --- | --- |
| `site:url` | Campo "Site URL" del admin | Canonical, og:url, sitemap |
| `emdash:site_url` | Solo el asistente de instalación | Invitaciones, magic-link, signup |

Cambiar el campo del admin **no arregla los enlaces de invitación**.

### 3. Sin HTTPS forzado, el panel no funciona

WebAuthn exige contexto seguro. Si se entra por `http://`, `navigator.credentials.create()` lanza
`SecurityError` — el mismo síntoma que la trampa 1, causa distinta.

### 4. Supabase: Session pooler, no Direct connection

El *Direct connection* (`db.<ref>.supabase.co:5432`) es **IPv6**, y Azure App Service solo tiene
salida IPv4. Hay que usar el Session pooler (`aws-0-<region>.pooler.supabase.com:5432`), cuyo
usuario incluye el project ref: `postgres.<ref>`.

### 5. El seed no exporta el almacenamiento de plugins

`seed/seed.json` cubre settings, collections, taxonomies, menus, widgetAreas y content — **no
`_plugin_storage`**. Los formularios no viajan en una migración de BD hecha con el seed; hay que
recrearlos en el admin con el slug exacto que espera cada página:

| Página | Slug esperado |
| --- | --- |
| `/contacto` | `formulario-de-contacto` |
| `/trabaja` | `trabaja-con-nosotros` |
| `/salutia` | `formulario-salutia` |

Si el slug no coincide, la página **no da error**: renderiza el área del formulario vacía.

### 6. El pipeline no valida nada

El workflow solo construye la imagen: sin tests, sin typecheck, sin lint. Código roto llega a
producción. No hay entorno de staging.

## Operación

```bash
# Estado de la app
az webapp show -n grupohei-web -g hei-rg --query "{estado:state, httpsOnly:httpsOnly}" -o json

# Variables configuradas (verificar tras cada edición en el portal:
# se ha perdido EMDASH_SITE_URL al editar otras)
az webapp config appsettings list -n grupohei-web -g hei-rg --query "[].name" -o tsv

# Logs del contenedor
az webapp log download -n grupohei-web -g hei-rg --log-file logs.zip

# Forzar despliegue de la última imagen
az webapp restart -n grupohei-web -g hei-rg
```

## Pendiente

- Configurar `AZURE_WEBHOOK` para que el despliegue sea automático
- Añadir validación (tests + typecheck) al workflow antes de publicar la imagen
- Slot de staging
- Borrar `wrangler.jsonc` y el resto de residuos de Cloudflare
- Quitar `DATABASE_PATH` de la configuración de Azure

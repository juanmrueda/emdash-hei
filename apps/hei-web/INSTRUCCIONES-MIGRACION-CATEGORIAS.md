# Instrucciones de Migración: Categorías de Oportunidades

## ✅ Cambios Implementados

Se ha implementado un sistema para gestionar las **Categorías de Oportunidades** desde el panel de administración de EmDash, en lugar de tenerlas hardcodeadas en el código.

### Archivos Modificados

1. **`seed/seed.json`**
   - ✅ Nueva colección `opportunity_categories` agregada
   - ✅ Campo `category` en `opportunities` cambiado de `select` a `string`
   - ✅ 5 categorías iniciales agregadas al seed data

2. **`emdash-env.d.ts`**
   - ✅ Interfaz TypeScript `CategoríaDeOportunidad` agregada
   - ✅ Tipo de `category` actualizado en interfaz `Oportunidad`
   - ✅ Colección registrada en `EmDashCollections`

3. **`src/plugins/hei-blocks/index.ts`**
   - ✅ Documentación agregada sobre el nuevo sistema
   - ✅ Array `OPPORTUNITY_CATEGORIES` mantenido como fallback

### Archivos Creados

4. **`CATEGORIAS-OPORTUNIDADES.md`**
   - 📄 Documentación completa para usuarios finales
   - 📄 Guía de uso del nuevo sistema

5. **`INSTRUCCIONES-MIGRACION-CATEGORIAS.md`** (este archivo)
   - 📄 Instrucciones técnicas de migración

---

## 🚀 Cómo Aplicar los Cambios

### Opción 1: Resetear la Base de Datos (Recomendado para desarrollo)

Si estás en desarrollo y no tienes datos importantes:

```bash
# 1. Detén el servidor si está corriendo
# Ctrl+C

# 2. Elimina la base de datos local
rm .astro/emdash.db  # Linux/Mac
del .astro\emdash.db  # Windows

# 3. Reinicia el servidor de desarrollo
npm run dev
```

EmDash recreará la base de datos con la nueva estructura y las categorías iniciales.

### Opción 2: Migración Manual (Para producción o con datos existentes)

Si ya tienes datos en producción que no quieres perder:

1. **Accede al admin de EmDash** en tu sitio
2. **Crea manualmente** las categorías:
   - Ve a la nueva sección "Categorías de Oportunidades"
   - Crea cada una de las 5 categorías iniciales:
     - Logística (orden: 1)
     - Comercial (orden: 2)
     - Administración (orden: 3)
     - Tecnología (orden: 4)
     - Operaciones (orden: 5)

3. **Verifica** que las oportunidades existentes tengan el campo `category` correctamente asignado

---

## 📋 Verificación Post-Migración

Después de aplicar los cambios, verifica que:

1. ✅ La colección "Categorías de Oportunidades" aparece en el admin
2. ✅ Puedes crear, editar y eliminar categorías desde el admin
3. ✅ Al crear/editar una oportunidad, el campo "Categoría / tab" acepta texto
4. ✅ Las oportunidades en el frontend se filtran correctamente por categoría
5. ✅ Los tabs de categorías aparecen en la página "Trabaja con nosotros"

---

## 🎯 Uso Diario

### Para agregar una nueva categoría:

1. Admin → **Categorías de Oportunidades** → **Crear nuevo**
2. Escribe el nombre (ej: "Marketing")
3. Asigna un número de orden
4. Publica

### Para asignar la categoría a una oportunidad:

1. Admin → **Oportunidades** → Crear/Editar oportunidad
2. En el campo "Categoría / tab", escribe el **nombre exacto** de la categoría
3. Guarda

---

## ⚠️ Notas Importantes

### Limitación Actual del Plugin

El selector de categorías en el **editor de bloques** (hei.cards) todavía usa el array hardcodeado `OPPORTUNITY_CATEGORIES`.

**Esto significa:**

- ✅ Las categorías se gestionan desde el admin
- ✅ El frontend carga las categorías dinámicamente
- ⚠️ El editor de bloques inline aún muestra las 5 categorías originales en el dropdown

**Para actualizar el dropdown del editor de bloques:**
Deberás editar manualmente `src/plugins/hei-blocks/index.ts` y actualizar el array `OPPORTUNITY_CATEGORIES` cuando agregues nuevas categorías.

### Mejora Futura Recomendada

Para que el dropdown del plugin cargue categorías dinámicamente en tiempo real:

1. Crear un endpoint API: `src/pages/api/opportunity-categories.json.ts`
2. Modificar el plugin para consultar ese endpoint
3. Implementar caché para rendimiento

---

## 🆘 Solución de Problemas

### Error: "Colección 'opportunity_categories' no encontrada"

**Solución:** Reinicia el servidor de desarrollo. EmDash necesita recargar el seed.json.

### Las categorías no aparecen en el admin

**Solución:**

1. Verifica que el archivo `seed/seed.json` esté correctamente formateado
2. Revisa los logs del servidor por errores de sintaxis JSON
3. Intenta eliminar y recrear la base de datos (Opción 1)

### Las oportunidades no se filtran por categoría

**Solución:**

1. Verifica que el campo `category` de las oportunidades coincida **exactamente** con el nombre de la categoría
2. Revisa que las categorías estén publicadas (status: "published")
3. Verifica el componente `Cards.astro` para confirmar la lógica de filtrado

---

## 📞 Soporte

Para más información, consulta:

- `CATEGORIAS-OPORTUNIDADES.md` - Guía de usuario
- [Documentación de EmDash](https://docs.emdashcms.com/)

---

**Fecha de migración:** 2026-07-24
**Autor:** Sistema de gestión de contenido EmDash

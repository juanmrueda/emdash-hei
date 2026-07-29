# Gestión de Categorías de Oportunidades

## Resumen

Las categorías de oportunidades ahora se gestionan **dinámicamente desde el panel de administración de EmDash**, en lugar de estar hardcodeadas en el código.

## ¿Cómo agregar una nueva categoría?

1. **Accede al admin de EmDash** en tu sitio
2. Ve a la sección **"Categorías de Oportunidades"**
3. Haz clic en **"Crear nuevo"**
4. Completa los campos:
   - **Nombre**: El nombre de la categoría (ej: "Marketing", "Recursos Humanos")
   - **Orden**: Un número para definir el orden en que aparecerá (1, 2, 3, etc.)
5. Haz clic en **"Publicar"**

## ¿Cómo editar una categoría existente?

1. Ve a **"Categorías de Oportunidades"** en el admin
2. Haz clic en la categoría que deseas editar
3. Modifica el **Nombre** o el **Orden**
4. Guarda los cambios

## ¿Cómo eliminar una categoría?

1. Ve a **"Categorías de Oportunidades"** en el admin
2. Selecciona la categoría que deseas eliminar
3. Usa la opción de eliminar/borrar

⚠️ **Advertencia**: Si eliminas una categoría que está siendo usada por oportunidades existentes, esas oportunidades quedarán sin categoría asignada.

## ¿Cómo usar las categorías en las oportunidades?

Cuando crees o edites una **Oportunidad**:

1. Ve a la sección **"Oportunidades"** en el admin
2. Crea o edita una oportunidad
3. En el campo **"Categoría / tab"**, escribe el nombre exacto de la categoría que creaste
4. El sistema validará que la categoría existe

## Categorías actuales

Las categorías iniciales son:

- Logística
- Comercial
- Administración
- Tecnología
- Operaciones

Puedes modificar, agregar o eliminar cualquiera de estas desde el admin.

## Archivos modificados

Los siguientes archivos fueron actualizados para implementar esta funcionalidad:

1. **`seed\seed.json`**
   - Se agregó la colección `opportunity_categories`
   - Se cambió el campo `category` en `opportunities` de `select` con opciones fijas a `string`
   - Se agregaron las categorías iniciales en la sección `content`

2. **`emdash-env.d.ts`**
   - Se agregó la interfaz TypeScript `CategoríaDeOportunidad`
   - Se actualizó el tipo del campo `category` en `Oportunidad` de union type a `string`
   - Se registró la colección en `EmDashCollections`

3. **`src\plugins\hei-blocks\index.ts`**
   - Se agregó documentación indicando que las categorías se gestionan desde el admin
   - El array `OPPORTUNITY_CATEGORIES` se mantiene como fallback

## Notas técnicas

- Las categorías se ordenan por el campo `position`
- El campo `name` es requerido y debe ser único
- Las categorías admiten borradores y revisiones como cualquier otro contenido
- El slug se genera automáticamente a partir del nombre

## Próximos pasos recomendados

Si necesitas que el **selector en el editor de bloques** cargue las categorías dinámicamente en tiempo real (sin tener que actualizar el código), será necesario:

1. Crear un endpoint API que devuelva las categorías
2. Modificar el plugin para consultar ese endpoint
3. Implementar caché para mejorar el rendimiento

Por ahora, las categorías se cargan desde el array `OPPORTUNITY_CATEGORIES` en el plugin, pero puedes editarlas desde el admin y el frontend las mostrará correctamente.

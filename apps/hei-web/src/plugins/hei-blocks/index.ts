/**
 * Grupo HEI marketing blocks plugin (inline, app-local).
 *
 * Registers the custom Portable Text block types so editors can insert and
 * edit them in the admin. Block Kit constraints worth remembering:
 *
 *  - No object-group element: nested object shapes are flattened to sibling
 *    fields (e.g. a CTA becomes primaryCtaLabel / primaryCtaUrl).
 *  - Lists of strings (bullets) are entered as one multiline field and split
 *    on newline at render time.
 *  - Image fields use the media picker and still accept existing URL strings.
 *
 * Site-side rendering goes through src/components/HeiBlocks.astro.
 */

import { definePlugin } from "emdash";
import type { PluginDefinition } from "emdash";

const definition: PluginDefinition = {
	id: "hei-blocks",
	version: "0.1.0",

	admin: {
		portableTextBlocks: [
			{
				type: "hei.hero",
				label: "Hero",
				category: "Secciones",
				description: "Encabezado grande con imagen o fondo verde y CTAs",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "headline", label: "Titular" },
					{ type: "text_input", action_id: "highlight", label: "Palabra resaltada" },
					{ type: "text_input", action_id: "subheadline", label: "Subtítulo", multiline: true },
					{
						type: "media_picker",
						action_id: "image",
						label: "Imagen de fondo",
						mime_type_filter: "image/",
					},
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{
						type: "select",
						action_id: "variant",
						label: "Variante",
						options: [
							{ label: "Imagen", value: "image" },
							{ label: "Verde sólido", value: "solid" },
						],
					},
					{ type: "text_input", action_id: "primaryCtaLabel", label: "CTA principal — texto" },
					{ type: "text_input", action_id: "primaryCtaUrl", label: "CTA principal — URL" },
					{ type: "text_input", action_id: "secondaryCtaLabel", label: "CTA secundario — texto" },
					{ type: "text_input", action_id: "secondaryCtaUrl", label: "CTA secundario — URL" },
				],
			},

			{
				type: "hei.stats",
				label: "Estadísticas",
				category: "Secciones",
				description: "Fila de tarjetas con cifras",
				fields: [
					{
						type: "select",
						action_id: "variant",
						label: "Variante",
						options: [
							{ label: "Grande (con ícono)", value: "big" },
							{ label: "Compacta", value: "inline" },
						],
					},
					{
						type: "repeater",
						action_id: "items",
						label: "Cifras",
						item_label: "Cifra",
						min_items: 1,
						max_items: 6,
						fields: [
							{ type: "text_input", action_id: "value", label: "Valor" },
							{ type: "text_input", action_id: "label", label: "Etiqueta" },
							{ type: "text_input", action_id: "icon", label: "Ícono (clave)" },
							{
								type: "media_picker",
								action_id: "img",
								label: "Imagen / ícono",
								mime_type_filter: "image/",
							},
						],
					},
				],
			},

			{
				type: "hei.imageText",
				label: "Imagen + Texto",
				category: "Secciones",
				description: "Dos columnas: imagen y contenido con viñetas",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "body", label: "Texto", multiline: true },
					{
						type: "text_input",
						action_id: "bullets",
						label: "Viñetas (una por línea)",
						multiline: true,
					},
					{ type: "media_picker", action_id: "image", label: "Imagen", mime_type_filter: "image/" },
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{
						type: "select",
						action_id: "imagePosition",
						label: "Posición de imagen",
						options: [
							{ label: "Izquierda", value: "left" },
							{ label: "Derecha", value: "right" },
						],
					},
					{
						type: "repeater",
						action_id: "stats",
						label: "Estadísticas flotantes",
						item_label: "Estadística",
						min_items: 0,
						max_items: 4,
						fields: [
							{ type: "text_input", action_id: "value", label: "Valor (ej. 100%)" },
							{ type: "text_input", action_id: "label", label: "Etiqueta" },
						],
					},
					{ type: "text_input", action_id: "badge", label: "Insignia (ej. 1968)" },
					{ type: "text_input", action_id: "ctaLabel", label: "CTA — texto" },
					{ type: "text_input", action_id: "ctaUrl", label: "CTA — URL" },
				],
			},

			{
				type: "hei.cards",
				label: "Tarjetas",
				category: "Secciones",
				description: "Cuadrícula de tarjetas con ícono y texto",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título de sección" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
					{
						type: "select",
						action_id: "layout",
						label: "Estilo de tarjetas",
						options: [
							{ label: "Servicios (con intro y fondo blanco)", value: "service" },
							{ label: "Tarjetas estándar", value: "default" },
						],
					},
					{
						type: "select",
						action_id: "columns",
						label: "Columnas",
						options: [
							{ label: "2", value: "2" },
							{ label: "3", value: "3" },
							{ label: "4", value: "4" },
						],
					},
					{
						type: "select",
						action_id: "align",
						label: "Alineación",
						options: [
							{ label: "Centro", value: "center" },
							{ label: "Izquierda", value: "left" },
						],
					},
					{ type: "toggle", action_id: "surface", label: "Fondo gris" },
					{
						type: "repeater",
						action_id: "items",
						label: "Ítems",
						item_label: "Ítem",
						min_items: 1,
						max_items: 8,
						fields: [
							{
								type: "media_picker",
								action_id: "icon",
								label: "Ícono",
								mime_type_filter: "image/",
							},
							{
								type: "media_picker",
								action_id: "image",
								label: "Imagen de fondo",
								mime_type_filter: "image/",
							},
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
							{
								type: "text_input",
								action_id: "color",
								label: "Color de fondo (ej. #31D697 o white)",
							},
							{
								type: "text_input",
								action_id: "gradientColor",
								label: "Color degradado (ej. #08242C)",
							},
						],
					},
				],
			},

			{
				type: "hei.pilares",
				label: "Pilares",
				category: "Secciones",
				description: "Tarjetas de pilares con ícono, color y fondo",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
					{
						type: "repeater",
						action_id: "items",
						label: "Pilares",
						item_label: "Pilar",
						min_items: 1,
						max_items: 8,
						fields: [
							{
								type: "media_picker",
								action_id: "icon",
								label: "Ícono",
								mime_type_filter: "image/",
							},
							{
								type: "media_picker",
								action_id: "image",
								label: "Imagen de fondo",
								mime_type_filter: "image/",
							},
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
							{
								type: "text_input",
								action_id: "textColor",
								label: "Color de texto (vacío = blanco sobre imagen, o hereda del color de fondo)",
							},
							{
								type: "text_input",
								action_id: "color",
								label: "Color de fondo (ej. #31D697 o white)",
							},
							{
								type: "text_input",
								action_id: "gradientColor",
								label: "Color degradado del overlay (ej. #08242C, vacío = el verde por defecto)",
							},
							{ type: "toggle", action_id: "decoration", label: "Decoración esquina" },
						],
					},
				],
			},

			{
				type: "hei.tresejes",
				label: "Tres Ejes",
				category: "Secciones",
				description: "Tarjetas de ejes con ícono, título, subtítulo y texto",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
					{
						type: "repeater",
						action_id: "items",
						label: "Ejes",
						item_label: "Eje",
						min_items: 1,
						max_items: 8,
						fields: [
							{
								type: "media_picker",
								action_id: "icon",
								label: "Ícono",
								mime_type_filter: "image/",
							},
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "subtitle", label: "Subtítulo" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
						],
					},
				],
			},

			{
				type: "hei.cultura",
				label: "Cultura y Valores",
				category: "Secciones",
				description: "Split con imagen y lista de valores",
				fields: [
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
					{ type: "media_picker", action_id: "image", label: "Imagen", mime_type_filter: "image/" },
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{
						type: "repeater",
						action_id: "items",
						label: "Valores",
						item_label: "Valor",
						min_items: 1,
						max_items: 6,
						fields: [
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
							{
								type: "text_input",
								action_id: "bullets",
								label: "Viñetas (una por línea)",
								multiline: true,
							},
						],
					},
				],
			},

			{
				type: "hei.oportunidades",
				label: "Oportunidades",
				category: "Secciones",
				description: "Lista dinámica de oportunidades desde la colección",
				fields: [
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
				],
			},

			{
				type: "hei.brands",
				label: "Marcas",
				category: "Secciones",
				description: "Filas de marcas con logo y descripción",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
					{
						type: "repeater",
						action_id: "items",
						label: "Marcas",
						item_label: "Marca",
						min_items: 1,
						max_items: 8,
						fields: [
							{ type: "text_input", action_id: "name", label: "Nombre" },
							{
								type: "media_picker",
								action_id: "logo",
								label: "Logo",
								mime_type_filter: "image/",
							},
							{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
							{ type: "text_input", action_id: "heading", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
							{
								type: "text_input",
								action_id: "bullets",
								label: "Viñetas (una por línea)",
								multiline: true,
							},
							{ type: "text_input", action_id: "ctaLabel", label: "CTA — texto" },
							{ type: "text_input", action_id: "ctaUrl", label: "CTA — URL" },
						],
					},
				],
			},

			{
				type: "hei.logoCloud",
				label: "Logos",
				category: "Secciones",
				description: "Fila de logos de marcas",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{
						type: "repeater",
						action_id: "items",
						label: "Logos",
						item_label: "Logo",
						min_items: 1,
						max_items: 10,
						fields: [
							{ type: "text_input", action_id: "name", label: "Nombre" },
							{
								type: "media_picker",
								action_id: "logo",
								label: "Logo",
								mime_type_filter: "image/",
							},
							{ type: "text_input", action_id: "url", label: "Enlace (URL)" },
						],
					},
				],
			},

			{
				type: "hei.ctaBand",
				label: "Banda CTA",
				category: "Secciones",
				description: "Banda verde con llamado a la acción",
				fields: [
					{
						type: "select",
						action_id: "layout",
						label: "Diseño",
						options: [
							{ label: "Banda completa", value: "band" },
							{ label: "Tarjeta (con imagen)", value: "card" },
						],
					},
					{ type: "text_input", action_id: "icon", label: "Ícono (clave)" },
					{
						type: "media_picker",
						action_id: "iconImage",
						label: "Ícono de imagen",
						mime_type_filter: "image/",
					},
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "body", label: "Texto", multiline: true },
					{
						type: "media_picker",
						action_id: "image",
						label: "Imagen (solo tarjeta)",
						mime_type_filter: "image/",
					},
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{ type: "text_input", action_id: "primaryCtaLabel", label: "CTA principal — texto" },
					{ type: "text_input", action_id: "primaryCtaUrl", label: "CTA principal — URL" },
					{ type: "text_input", action_id: "secondaryCtaLabel", label: "CTA secundario — texto" },
					{ type: "text_input", action_id: "secondaryCtaUrl", label: "CTA secundario — URL" },
					{ type: "toggle", action_id: "whatsapp", label: "Ícono de WhatsApp en CTA" },
				{ type: "toggle", action_id: "heroCard", label: "Hero card (separación del header, para primera sección)" },
				],
			},

			{
				type: "hei.timeline",
				label: "Historia / Hitos",
				category: "Secciones",
				description: "Imagen con insignia y lista de hitos",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "media_picker", action_id: "image", label: "Imagen", mime_type_filter: "image/" },
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{ type: "text_input", action_id: "badge", label: "Insignia (ej. 1968)" },
					{
						type: "repeater",
						action_id: "items",
						label: "Hitos",
						item_label: "Hito",
						min_items: 1,
						max_items: 6,
						fields: [
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
						],
					},
				],
			},

			{
				type: "hei.channels",
				label: "Canales de contacto",
				category: "Secciones",
				description: "Imagen + lista de canales (teléfono, correo, chat)",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "subheading", label: "Subtítulo", multiline: true },
					{ type: "media_picker", action_id: "image", label: "Imagen", mime_type_filter: "image/" },
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{
						type: "select",
						action_id: "imagePosition",
						label: "Posición de imagen",
						options: [
							{ label: "Izquierda", value: "left" },
							{ label: "Derecha", value: "right" },
						],
					},
					{
						type: "repeater",
						action_id: "items",
						label: "Canales",
						item_label: "Canal",
						min_items: 1,
						max_items: 6,
						fields: [
							{
								type: "select",
								action_id: "icon",
								label: "Ícono",
								options: [
									{ label: "Teléfono", value: "phone" },
									{ label: "Correo", value: "email" },
									{ label: "Chat", value: "chat" },
									{ label: "WhatsApp", value: "whatsapp" },
								],
							},
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
						],
					},
				],
			},

			{
				type: "hei.formSection",
				label: "Sección con formulario",
				category: "Secciones",
				description: "Título + formulario embebido (opcionalmente con imagen)",
				fields: [
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "body", label: "Texto", multiline: true },
					{ type: "text_input", action_id: "formId", label: "ID/slug del formulario" },
					{ type: "media_picker", action_id: "image", label: "Imagen", mime_type_filter: "image/" },
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{
						type: "select",
						action_id: "imagePosition",
						label: "Posición de imagen",
						options: [
							{ label: "Derecha", value: "right" },
							{ label: "Izquierda", value: "left" },
						],
					},
					{ type: "toggle", action_id: "surface", label: "Fondo gris" },
				],
			},
		],
	},
};

export function createPlugin() {
	return definePlugin(definition);
}

export default createPlugin;

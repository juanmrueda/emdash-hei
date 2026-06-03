/**
 * Grupo HEI marketing blocks plugin (inline, app-local).
 *
 * Registers the custom Portable Text block types so editors can insert and
 * edit them in the admin. Block Kit constraints worth remembering:
 *
 *  - No object-group element: nested object shapes are flattened to sibling
 *    fields (e.g. a CTA becomes primaryCtaLabel / primaryCtaUrl).
 *  - Repeater sub-fields are scalar only (text_input, number_input, select,
 *    toggle). Lists of strings (bullets) are entered as one multiline field
 *    and split on newline at render time.
 *  - No media picker yet — image fields are URL strings entered by hand.
 *
 * Site-side rendering goes through src/components/HeiBlocks.astro.
 */

import { definePlugin } from "emdash";
import type { PluginDefinition } from "emdash";

const CARD_COLORS = [
	{ label: "Blanco", value: "white" },
	{ label: "Verde", value: "green" },
	{ label: "Azul", value: "blue" },
	{ label: "Navy", value: "navy" },
];

const CARD_ICONS = [
	{ label: "Salud", value: "health" },
	{ label: "Transparencia", value: "transparency" },
	{ label: "Futuro", value: "future" },
	{ label: "Integración", value: "integration" },
	{ label: "Confianza", value: "trust" },
	{ label: "Capacidad", value: "capacity" },
	{ label: "Crecimiento", value: "growth" },
	{ label: "Logística", value: "logistics" },
	{ label: "Red de servicio", value: "network" },
	{ label: "Software", value: "software" },
	{ label: "Escudo", value: "shield" },
	{ label: "Hoja", value: "leaf" },
];

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
					{ type: "text_input", action_id: "image", label: "Imagen de fondo (URL)" },
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
					{ type: "text_input", action_id: "image", label: "Imagen (URL)" },
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
						label: "Tarjetas",
						item_label: "Tarjeta",
						min_items: 1,
						max_items: 8,
						fields: [
							{ type: "select", action_id: "icon", label: "Ícono", options: CARD_ICONS },
							{ type: "text_input", action_id: "title", label: "Título" },
							{ type: "text_input", action_id: "text", label: "Texto", multiline: true },
							{
								type: "text_input",
								action_id: "bullets",
								label: "Viñetas (una por línea)",
								multiline: true,
							},
							{ type: "select", action_id: "color", label: "Color", options: CARD_COLORS },
						],
					},
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
							{ type: "text_input", action_id: "logo", label: "Logo (URL)" },
							{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
							{ type: "text_input", action_id: "heading", label: "Título" },
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
							{ type: "text_input", action_id: "logo", label: "Logo (URL)" },
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
					{ type: "text_input", action_id: "eyebrow", label: "Antetítulo" },
					{ type: "text_input", action_id: "heading", label: "Título" },
					{ type: "text_input", action_id: "body", label: "Texto", multiline: true },
					{ type: "text_input", action_id: "image", label: "Imagen (URL, solo tarjeta)" },
					{ type: "text_input", action_id: "imageAlt", label: "Texto alternativo" },
					{ type: "text_input", action_id: "primaryCtaLabel", label: "CTA principal — texto" },
					{ type: "text_input", action_id: "primaryCtaUrl", label: "CTA principal — URL" },
					{ type: "text_input", action_id: "secondaryCtaLabel", label: "CTA secundario — texto" },
					{ type: "text_input", action_id: "secondaryCtaUrl", label: "CTA secundario — URL" },
					{ type: "toggle", action_id: "whatsapp", label: "Ícono de WhatsApp en CTA" },
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
					{ type: "text_input", action_id: "image", label: "Imagen (URL)" },
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
					{ type: "text_input", action_id: "image", label: "Imagen (URL)" },
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
					{ type: "text_input", action_id: "image", label: "Imagen (URL)" },
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

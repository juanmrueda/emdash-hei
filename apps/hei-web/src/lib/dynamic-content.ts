import { mediaUrl } from "./media";

type EntryLike = {
	id?: string;
	slug?: string;
	data?: Record<string, unknown>;
};

type BlockLike = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const firstString = (...values: unknown[]): string | undefined => {
	for (const value of values) {
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return undefined;
};

const firstMedia = (...values: unknown[]): string | undefined => {
	for (const value of values) {
		const url = mediaUrl(value);
		if (url) return url;
	}
	return undefined;
};

const firstValue = (...values: unknown[]): unknown =>
	values.find((value) => value !== undefined && value !== null && value !== "");

const numberValue = (...values: unknown[]): number | undefined => {
	for (const value of values) {
		if (typeof value === "number" && Number.isFinite(value)) return value;
		if (typeof value === "string" && value.trim()) {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) return parsed;
		}
	}
	return undefined;
};

const sortByPosition = <T extends { position?: number }>(items: T[]): T[] =>
	[...items].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

export function withDynamicBrands(content: unknown, entries: EntryLike[]): unknown {
	if (!Array.isArray(content) || entries.length === 0) return content;

	const items = sortByPosition(
		entries.map((entry, index) => {
			const data = entry.data ?? {};
			const name = firstString(data.name, data.title, entry.slug, entry.id) ?? "";
			return {
				name,
				logo: firstMedia(data.logo, data.marca_logo),
				eyebrow: firstString(data.eyebrow),
				heading:
					firstString(
						data.heading,
						data.cardTitle,
						data.listingTitle,
						data.marca_card_titulo,
						name,
					) ?? name,
				text: firstString(data.text, data.description, data.listingText, data.marca_card_texto),
				bullets: firstValue(data.bullets, data.listingBullets, data.marca_card_bullets),
				ctaLabel: firstString(
					data.ctaLabel,
					data.cta_label,
					data.buttonLabel,
					data.marca_card_boton_texto,
				),
				ctaUrl: firstString(data.ctaUrl, data.cta_url, data.buttonUrl, data.url, data.permalink),
				position: numberValue(data.position, data.menuOrder, data.menu_order) ?? index,
			};
		}),
	);

	return content.map((block) => {
		if (!isRecord(block) || block._type !== "hei.brands") return block;
		return { ...block, items };
	});
}

export function withDynamicOpportunities(content: unknown, entries: EntryLike[]): unknown {
	if (!Array.isArray(content) || entries.length === 0) return content;

	const items = sortByPosition(
		entries.map((entry, index) => {
			const data = entry.data ?? {};
			const title = firstString(data.title, data.name, entry.slug, entry.id) ?? "";
			return {
				icon: firstString(data.icon, data.op_icono),
				iconUrl: firstMedia(data.iconUrl, data.icon_url, data.image, data.logo),
				title,
				subtitle: firstString(data.subtitle, data.op_subtitulo),
				text: firstString(data.text, data.description, data.op_descripcion),
				category: firstValue(data.category, data.categories, data.categoria_empleo),
				applyUrl: firstString(
					data.applyUrl,
					data.apply_url,
					data.applicationUrl,
					data.op_url_aplicar,
				),
				applyLabel: firstString(data.applyLabel),
				position: numberValue(data.position, data.menuOrder, data.menu_order) ?? index,
			};
		}),
	);

	return content.map((block) => {
		if (!isRecord(block) || block._type !== "hei.oportunidades") return block;
		return { ...block, items };
	});
}

export type MediaValue =
	| string
	| {
			id?: string;
			provider?: string;
			src?: string;
			previewUrl?: string;
			meta?: Record<string, unknown>;
	  };

export function mediaUrl(value: unknown): string | undefined {
	if (typeof value === "string" && value.trim()) return value;
	if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

	const media = value as MediaValue;
	if (typeof media.previewUrl === "string" && media.previewUrl.trim()) return media.previewUrl;
	if (typeof media.src === "string" && media.src.trim()) return media.src;

	const isLocal = !media.provider || media.provider === "local";
	const storageKey = typeof media.meta?.storageKey === "string" ? media.meta.storageKey : undefined;
	const key = storageKey || media.id;

	return isLocal && key ? `/_emdash/api/media/file/${encodeURIComponent(key)}` : undefined;
}

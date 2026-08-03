import { fileURLToPath } from "url";

import node from "@astrojs/node";
import react from "@astrojs/react";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { local, s3 } from "emdash/astro";
import { sqlite } from "emdash/db";

// Resolve core routes to source during dev so client bundles don't pull
// server-only compiled `dist` artifacts (which contain Node `process` usage).
const coreRoutesPath = fileURLToPath(
	new URL("../../packages/core/src/astro/routes/", import.meta.url),
);
const coreIndexPath = fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url));
const coreAstroPath = fileURLToPath(
	new URL("../../packages/core/src/astro/index.ts", import.meta.url),
);
const coreDbPath = fileURLToPath(new URL("../../packages/core/src/db/index.ts", import.meta.url));
const coreMiddlewarePath = fileURLToPath(
	new URL("../../packages/core/src/astro/middleware.ts", import.meta.url),
);
const coreMiddlewareDirPath = fileURLToPath(
	new URL("../../packages/core/src/astro/middleware/", import.meta.url),
);
const corePagePath = fileURLToPath(
	new URL("../../packages/core/src/page/index.ts", import.meta.url),
);
const coreRuntimePath = fileURLToPath(
	new URL("../../packages/core/src/runtime.ts", import.meta.url),
);
const coreUiPath = fileURLToPath(new URL("../../packages/core/src/ui.ts", import.meta.url));
const localUploadsPath = fileURLToPath(new URL("./uploads/", import.meta.url));
const storage =
	process.env.S3_ENDPOINT && process.env.S3_BUCKET
		? s3()
		: local({ directory: localUploadsPath, baseUrl: "/_emdash/api/media/file" });

export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: process.env.DATABASE_PATH || "file:./.persistent-data/emdash.db" }),
			storage,
			plugins: [
				{
					id: "hei-blocks",
					version: "0.1.0",
					entrypoint: new URL("./src/plugins/hei-blocks/index.ts", import.meta.url).href,
				},
				formsPlugin(),
				// TODO: re-agregar emailSmtpPlugin() cuando el package
				// @emdash-cms/plugin-email-smtp esté en el repo (quedó sin subir;
				// rompía install/build). Sin él, los formularios guardan envíos
				// pero no envían notificación por email.
			],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-sans",
			weights: [400, 500, 600, 700, 800],
			fallbacks: ["sans-serif"],
		},
	],
	devToolbar: { enabled: false },
	vite: {
		resolve: {
			alias: [
				{ find: /^emdash\/routes(.*)/, replacement: coreRoutesPath + "$1" },
				{ find: /^emdash\/middleware$/, replacement: coreMiddlewarePath },
				{ find: /^emdash\/middleware\/(.*)/, replacement: coreMiddlewareDirPath + "$1" },
				{ find: /^emdash\/astro$/, replacement: coreAstroPath },
				{ find: /^emdash\/db$/, replacement: coreDbPath },
				{ find: /^emdash\/page$/, replacement: corePagePath },
				{ find: /^emdash\/runtime$/, replacement: coreRuntimePath },
				{ find: /^emdash\/ui$/, replacement: coreUiPath },
				{ find: /^emdash$/, replacement: coreIndexPath },
			],
		},
	},
});

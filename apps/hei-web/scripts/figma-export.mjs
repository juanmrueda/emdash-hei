#!/usr/bin/env node
/**
 * figma-export.mjs — Descarga assets desde un archivo de Figma vía API REST.
 *
 * Sin dependencias (usa fetch nativo de Node 18+). Genera, dentro de
 * ./figma-export/, una carpeta por pantalla (frame de nivel superior) con:
 *   - <pantalla>.png            → render del frame completo (mockup)
 *   - <pantalla>/<capa>.svg|png → nodos marcados con "Export" en Figma
 *   - _image-fills/<ref>.png    → fotos originales incrustadas (image fills)
 *
 * Uso (PowerShell):
 *   $env:FIGMA_TOKEN="figd_xxx"; node scripts/figma-export.mjs <FILE_KEY> [opciones]
 *
 * Uso (bash):
 *   FIGMA_TOKEN=figd_xxx node scripts/figma-export.mjs <FILE_KEY> [opciones]
 *
 * Opciones:
 *   --out=DIR        Carpeta de salida (default: ./figma-export)
 *   --scale=N        Escala para PNG de frames/nodos (default: 2)
 *   --page="Nombre"  Exporta solo la página (canvas) con ese nombre
 *   --frames         Solo los mockups de pantalla (un PNG por frame)
 *   --marked         Solo nodos marcados con Export en Figma
 *   --fills          Solo las fotos originales (image fills)
 *   (sin flags de selección = hace los tres)
 *
 * Cómo obtener los datos:
 *   FILE_KEY: de la URL del archivo →
 *     https://www.figma.com/design/<FILE_KEY>/Nombre...   (o /file/<FILE_KEY>/)
 *   FIGMA_TOKEN: Figma → Settings → Security → Personal access tokens →
 *     "Generate new token" con scope de lectura de contenido de archivos.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://api.figma.com/v1";
const TOKEN = process.env.FIGMA_TOKEN;
const args = process.argv.slice(2);
const fileKey = args.find((a) => !a.startsWith("--"));
const opt = Object.fromEntries(
	args
		.filter((a) => a.startsWith("--"))
		.map((a) => {
			const [k, v] = a.replace(/^--/, "").split("=");
			return [k, v ?? true];
		}),
);

if (!TOKEN || !fileKey) {
	console.error(
		"Falta token o file key.\n" +
			'  PowerShell: $env:FIGMA_TOKEN="figd_xxx"; node scripts/figma-export.mjs <FILE_KEY>\n' +
			"  bash:       FIGMA_TOKEN=figd_xxx node scripts/figma-export.mjs <FILE_KEY>",
	);
	process.exit(1);
}

const OUT = String(opt.out || "figma-export");
const SCALE = Number(opt.scale || 2);
const doFrames = opt.frames || (!opt.frames && !opt.marked && !opt.fills);
const doMarked = opt.marked || (!opt.frames && !opt.marked && !opt.fills);
const doFills = opt.fills || (!opt.frames && !opt.marked && !opt.fills);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) =>
	String(s || "sin-nombre")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-zA-Z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase() || "x";

async function figma(path) {
	for (let attempt = 0; attempt < 7; attempt++) {
		const res = await fetch(`${API}${path}`, { headers: { "X-Figma-Token": TOKEN } });
		if (res.status === 429) {
			const wait = 3000 * (attempt + 1);
			console.warn(`  rate limit, esperando ${wait}ms…`);
			await sleep(wait);
			continue;
		}
		const body = await res.text();
		if (!res.ok) {
			const err = new Error(`Figma ${res.status} en ${path}: ${body}`);
			err.status = res.status;
			err.body = body;
			throw err;
		}
		return JSON.parse(body);
	}
	throw new Error(`Figma: demasiados reintentos en ${path}`);
}

async function download(url, dest) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`download ${res.status}: ${url}`);
	const buf = Buffer.from(await res.arrayBuffer());
	await writeFile(dest, buf);
	return buf.length;
}

/** Pide a /images un lote; si Figma hace render-timeout, parte el lote y reintenta. */
async function renderBatch(batch, format, urls) {
	const q = batch.map(encodeURIComponent).join(",");
	const scaleParam = format === "svg" || format === "pdf" ? "" : `&scale=${SCALE}`;
	try {
		const data = await figma(`/images/${fileKey}?ids=${q}&format=${format}${scaleParam}`);
		if (data.err) throw new Error(`images err: ${data.err}`);
		Object.assign(urls, data.images || {});
	} catch (e) {
		// Errores de auth: abortar (token mal o sin acceso).
		if (e.status === 401 || e.status === 403) throw e;
		// Lote grande: partir y reintentar cada mitad.
		if (batch.length > 1) {
			const mid = Math.ceil(batch.length / 2);
			console.warn(`  fallo con ${batch.length} nodos (${e.status || "?"}), partiendo el lote…`);
			await sleep(500);
			await renderBatch(batch.slice(0, mid), format, urls);
			await renderBatch(batch.slice(mid), format, urls);
		} else {
			// Nodo individual irrecuperable (timeout/rate limit/etc.): omitir, no abortar.
			console.warn(`  ⚠ se omite el nodo ${batch[0]}: ${e.message.slice(0, 80)}`);
		}
	}
}

/** Render de nodos vía /images; ids en lotes. format: png|svg|jpg|pdf */
async function renderNodes(ids, format) {
	const urls = {};
	// Lotes pequeños: los frames de página completa a 2x son pesados y Figma
	// hace timeout si se piden muchos juntos. renderBatch parte si hace falta.
	const CHUNK = format === "svg" ? 40 : 5;
	for (let i = 0; i < ids.length; i += CHUNK) {
		await renderBatch(ids.slice(i, i + CHUNK), format, urls);
		await sleep(300);
	}
	return urls;
}

async function main() {
	console.log(`→ Archivo ${fileKey} (escala ${SCALE}x) → ${OUT}/`);
	const file = await figma(`/files/${fileKey}`);
	let pages = file.document.children.filter((n) => n.type === "CANVAS");
	if (opt.page) pages = pages.filter((p) => p.name === opt.page);
	if (!pages.length) throw new Error("No se encontraron páginas (CANVAS) que coincidan.");

	// Recolecta: frames de nivel superior (pantallas), nodos con exportSettings,
	// y mapa imageRef → {screen, name} para las fotos.
	const screens = []; // { id, name }
	const marked = []; // { id, name, screen, format }
	const fillRefs = new Map(); // imageRef -> { screen, name }

	const fmtFromExport = (settings) => {
		const f = settings?.[0]?.format?.toLowerCase?.();
		return f === "svg" || f === "jpg" || f === "pdf" ? f : "png";
	};

	function walk(node, screen) {
		if (Array.isArray(node.exportSettings) && node.exportSettings.length) {
			marked.push({ id: node.id, name: node.name, screen, format: fmtFromExport(node.exportSettings) });
		}
		if (Array.isArray(node.fills)) {
			for (const fill of node.fills) {
				if (fill.type === "IMAGE" && fill.imageRef && !fillRefs.has(fill.imageRef)) {
					fillRefs.set(fill.imageRef, { screen, name: node.name });
				}
			}
		}
		if (Array.isArray(node.children)) for (const c of node.children) walk(c, screen);
	}

	for (const page of pages) {
		for (const frame of page.children || []) {
			if (frame.type !== "FRAME" && frame.type !== "COMPONENT" && frame.type !== "INSTANCE")
				continue;
			screens.push({ id: frame.id, name: frame.name });
			walk(frame, frame.name);
		}
	}

	console.log(
		`   pantallas: ${screens.length} | nodos marcados: ${marked.length} | image-fills: ${fillRefs.size}`,
	);

	// 1) Mockup por pantalla
	if (doFrames && screens.length) {
		console.log("→ Exportando mockups por pantalla (PNG)…");
		const urls = await renderNodes(screens.map((s) => s.id), "png");
		for (const s of screens) {
			const url = urls[s.id];
			if (!url) continue;
			const dir = join(OUT, slug(s.name));
			await mkdir(dir, { recursive: true });
			const dest = join(dir, `${slug(s.name)}.png`);
			await download(url, dest);
			console.log(`   ✓ ${dest}`);
		}
	}

	// 2) Nodos marcados con Export en Figma (logos/íconos en su formato real)
	if (doMarked && marked.length) {
		console.log("→ Exportando nodos marcados con Export…");
		const byFormat = {};
		for (const m of marked) (byFormat[m.format] ||= []).push(m);
		for (const [format, list] of Object.entries(byFormat)) {
			const urls = await renderNodes(list.map((m) => m.id), format);
			const seen = new Map();
			for (const m of list) {
				const url = urls[m.id];
				if (!url) continue;
				const dir = join(OUT, slug(m.screen), "assets");
				await mkdir(dir, { recursive: true });
				let base = slug(m.name);
				const n = (seen.get(`${m.screen}/${base}`) || 0) + 1;
				seen.set(`${m.screen}/${base}`, n);
				if (n > 1) base = `${base}-${n}`;
				const dest = join(dir, `${base}.${format}`);
				await download(url, dest);
				console.log(`   ✓ ${dest}`);
			}
		}
	}

	// 3) Fotos originales (image fills)
	if (doFills && fillRefs.size) {
		console.log("→ Descargando fotos originales (image fills)…");
		const meta = await figma(`/files/${fileKey}/images`);
		const refUrls = meta.meta?.images || {};
		const dir = join(OUT, "_image-fills");
		await mkdir(dir, { recursive: true });
		const seen = new Map();
		for (const [ref, info] of fillRefs) {
			const url = refUrls[ref];
			if (!url) continue;
			let base = `${slug(info.screen)}-${slug(info.name)}`;
			const n = (seen.get(base) || 0) + 1;
			seen.set(base, n);
			if (n > 1) base = `${base}-${n}`;
			const dest = join(dir, `${base}.png`);
			try {
				await download(url, dest);
				console.log(`   ✓ ${dest}`);
			} catch (e) {
				console.warn(`   ⚠ ${ref}: ${e.message}`);
			}
		}
	}

	console.log(`\n✅ Listo. Revisa la carpeta ${OUT}/`);
}

main().catch((e) => {
	console.error("✗", e.message);
	process.exit(1);
});

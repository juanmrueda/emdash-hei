/**
 * SQLite runtime adapter
 *
 * Creates a Kysely dialect for better-sqlite3.
 * Loaded at runtime via virtual module.
 */

import BetterSqlite3 from "better-sqlite3";
import { type Dialect, SqliteDialect } from "kysely";

import type { SqliteConfig } from "./adapters.js";

/**
 * Create a SQLite dialect from config
 */
export function createDialect(config: SqliteConfig): Dialect {
	// La config del sitio se serializa en tiempo de build, así que `config.url`
	// congela el valor que tuviera process.env en ese momento. En imágenes Docker
	// (build sin las env del deploy) eso apuntaba a la ruta por defecto y fallaba
	// con "directory does not exist". DATABASE_PATH se lee aquí, en runtime.
	const url = process.env.DATABASE_PATH || config.url;
	const filePath = url.startsWith("file:") ? url.slice(5) : url;

	const database = new BetterSqlite3(filePath);

	return new SqliteDialect({ database });
}

/**
 * PostgreSQL runtime adapter
 *
 * Creates a Kysely dialect for PostgreSQL via pg.
 * Loaded at runtime via virtual module.
 */

import { PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { PostgresConfig } from "./adapters.js";

/**
 * Create a PostgreSQL dialect from config
 */
export function createDialect(config: PostgresConfig): PostgresDialect {
	// La config del sitio se serializa en tiempo de build, así que una credencial
	// puesta ahí quedaría horneada en el bundle (y en la imagen Docker). Leer
	// DATABASE_URL aquí — en el adaptador de runtime — permite inyectarla como
	// variable de entorno del contenedor, sin secretos en el artefacto.
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL || config.connectionString,
		host: config.host,
		port: config.port,
		database: config.database,
		user: config.user,
		password: config.password,
		ssl: config.ssl,
		min: config.pool?.min ?? 0,
		max: config.pool?.max ?? 10,
	});

	return new PostgresDialect({ pool });
}

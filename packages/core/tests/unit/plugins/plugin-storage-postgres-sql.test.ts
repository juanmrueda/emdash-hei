/**
 * Dialect-shape guard for plugin storage `where` queries.
 *
 * The repository builds its JSON `where` conditions as a raw SQL fragment.
 * That fragment used to be compared against 1 (`expr = 1`), which SQLite
 * accepts — it types booleans as 0/1 and parses the chain left-associatively —
 * but Postgres rejects with `syntax error at or near "="`, because Kysely emits
 * the raw fragment unparenthesized. The whole plugin storage layer (and with it
 * the forms plugin) was therefore broken on Postgres while every SQLite-backed
 * test passed.
 *
 * These tests compile the query with each dialect's real compiler — no server
 * needed — and assert the predicate is emitted as a bare boolean.
 */

import { Kysely, DummyDriver, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import { describe, it, expect } from "vitest";

import { PluginStorageRepository } from "../../../src/database/repositories/plugin-storage.js";
import type { Database } from "../../../src/database/types.js";

/** Build a connectionless Kysely that compiles with the given dialect. */
function compilingDb(dialect: "postgres" | "sqlite"): {
	db: Kysely<Database>;
	sql: () => string;
} {
	let lastSql = "";
	const db = new Kysely<Database>({
		dialect: {
			createDriver: () => new DummyDriver(),
			createAdapter: () => (dialect === "postgres" ? new PostgresAdapter() : new SqliteAdapter()),
			createIntrospector: (d) =>
				dialect === "postgres" ? new PostgresIntrospector(d) : new SqliteIntrospector(d),
			createQueryCompiler: () =>
				dialect === "postgres" ? new PostgresQueryCompiler() : new SqliteQueryCompiler(),
		},
		log: (event) => {
			lastSql = event.query.sql;
		},
	});
	return { db, sql: () => lastSql };
}

function repoFor(db: Kysely<Database>) {
	return new PluginStorageRepository<{ slug: string }>(db, "emdash-forms", "forms", ["slug"]);
}

describe("plugin storage where-clause SQL shape", () => {
	for (const dialect of ["postgres", "sqlite"] as const) {
		describe(dialect, () => {
			it("emits the predicate as a bare boolean, never chained against 1", async () => {
				const { db, sql } = compilingDb(dialect);
				await repoFor(db).query({ where: { slug: "formulario-de-contacto" } });

				const compiled = sql();
				expect(compiled).toContain("plugin_id");
				// The regression: a trailing `= 1` after the JSON predicate.
				expect(compiled).not.toMatch(/=\s*\$?\d*\s*=\s*1/);
				expect(compiled).not.toMatch(/=\s*1\b/);
			});

			it("compiles count() the same way", async () => {
				const { db, sql } = compilingDb(dialect);
				await repoFor(db).count({ slug: "formulario-salutia" });

				const compiled = sql();
				expect(compiled).toMatch(/count\(\*\)/i);
				expect(compiled).not.toMatch(/=\s*1\b/);
			});
		});
	}

	it("uses Postgres JSON operators, not SQLite json_extract", async () => {
		const { db, sql } = compilingDb("postgres");
		await repoFor(db).query({ where: { slug: "trabaja-con-nosotros" } });

		expect(sql()).toContain("->>");
		expect(sql()).not.toContain("json_extract");
	});
});

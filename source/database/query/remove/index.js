/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import { sql } from "bun";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';
import { is_dev } from "@/setup";
import { create_warn, create_info, create_critical } from "@/logger";

const warn = create_warn(import.meta.path);
const info = create_info(import.meta.path);
const critical = create_critical(import.meta.path);

/**
 * @import { RowIdentifier } from "@/database/query";
 */

/**
 * **WARNING: This script must be run ONLY against a test database.**
 * It will DROP and RECREATE the `public` schema, effectively deleting ALL user data,
 * tables, types, sequences, and other objects within that schema.
 * Ensure the database is a disposable test DB and is expected to be empty before/after.
 * 
 * Completely resets the PostgreSQL database by dropping and recreating the `public` schema.
 * Uses CASCADE, so anything under `public` will be removed. Requires sufficient privileges.
 *
 * @returns {Promise<void>}
 * @deprecated This function is intended for testing purposes only.
 * @deprecated Do NOT use in production environments and will be removed in future releases.
 * @deprecated This will be replaced with a flow of required backup, drop of rows in tables, and restore of essential seed data, to allow for safer resets in development and staging environments.
 */
export async function garden() {
	warn("About to DROP and RECREATE the 'public' schema (test DB only).", { step: { current: 1, max: 2 } });

	if (!is_dev) {
		critical("Database reset attempted in non-development environment. Aborting.");
		throw new Error("Database reset can only be run in a development environment.");
	}

	// TO-DO: require input from CLI to confirm this action, to prevent accidental execution against a production database.

	// TO-DO: select all assets and delete their files from the filesystem as well, to avoid orphaned files after reset.

	try {
		await sql`ROLLBACK`;
		await sql`
			SELECT pg_terminate_backend(pg_stat_activity.pid)
			FROM pg_stat_activity
			WHERE pg_stat_activity.datname = 'rpg'
			  AND pid <> pg_backend_pid()
		`;

		// Drop the public schema and all its content.
		await sql`DROP SCHEMA IF EXISTS public CASCADE`;

		await sql`CREATE SCHEMA IF NOT EXISTS public`;

		// Restore common grants; adjust if your DB role setup differs
		await sql`GRANT ALL ON SCHEMA public TO postgres`;
		await sql`GRANT ALL ON SCHEMA public TO public`;

		// set to public schema.
		await sql`SET search_path TO public`;

		assert(await exists('public', 'schema'), 'Schema "public" was not recreated successfully after reset.');

		info("Database schema 'public' reset complete.", { step: { current: 2, max: 2 } });
	} catch (e) {
		critical("Database reset failed. See error below.");
		throw e;
	}
}

/**
 * @param {RowIdentifier} param0
 */
export async function asset({
	id,
}) {
	await sql.begin(async sql => {

		/** @type {Array<{path: string}>} */
		const [asset_row] = await sql`
			DELETE FROM asset
			WHERE id = ${id}
			RETURNING path
		`;

		if (!asset_row)
			throw new Error(`remove_asset: no asset found with id ${id}`);

		const { path } = asset_row;

		const file = Bun.file(path);

		if (!(await file.exists()))
			throw new Error(`remove_asset: file does not exist at path ${path}`);

		await file.delete();
	})
}

/**
 * @param {RowIdentifier} param0
 */
export async function domain({
	id,
}) {
	await sql`
		DELETE FROM domain
		WHERE id = ${id}
	`;
}

export const remove = {
	asset,
	domain,
	garden,
};

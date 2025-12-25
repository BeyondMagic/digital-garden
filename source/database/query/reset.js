/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { create_warn, create_info, create_critical } from "@/logger";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

const warn = create_warn(import.meta.file);
const info = create_info(import.meta.file);
const critical = create_critical(import.meta.file);

/**
 * * WARNING: This script must be run ONLY against a test database.
 * It will DROP and RECREATE the `public` schema, effectively deleting ALL user data,
 * tables, types, sequences, and other objects within that schema.
 * Ensure the database is a disposable test DB and is expected to be empty before/after.
 * 
 * Completely resets the PostgreSQL database by dropping and recreating the `public` schema.
 * Uses CASCADE, so anything under `public` will be removed. Requires sufficient privileges.
 *
 * @returns {Promise<void>}
 */
async function database() {
	warn("About to DROP and RECREATE the 'public' schema (test DB only).", { step: { current: 1, max: 2 } });

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

		info("Database schema 'public' reset complete.", { step: { current: 2, max: 2 } });
	} catch (e) {
		critical("Database reset failed. See error below.");
		throw e;
	}
}

database.test = async () => {
	assert(await exists('public', 'schema'), 'Schema "public" was not recreated successfully after reset.');
}

export const reset = {
	database
};
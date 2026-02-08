/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { select } from "@/database/query/select";
import { public_root } from "@/setup";

/**
 * Check if a database object exists.
 * @param {string} name Name of the object to check.
 * @param {'table'|'view'|'type'|'schema'} [type='table'] Type of the object to check.
 * @returns {Promise<boolean>} True if the object exists, false otherwise.
 */
export async function exists(name, type = "table") {
	const queries = {
		table: () => sql`SELECT * FROM pg_tables WHERE tablename = ${name}`,
		view: () => sql`SELECT * FROM pg_views WHERE viewname = ${name}`,
		type: () => sql`SELECT * FROM pg_type WHERE typname = ${name}`,
		schema: () => sql`SELECT * FROM pg_namespace WHERE nspname = ${name}`,
	};
	const result = await queries[type]();
	return result.length > 0;
}

/**
 * Build the file path for an asset based on its domain and slug.
 * @param {number} id_domain ID of the domain the asset belongs to.
 * @param {string} slug Slug of the asset (e.g., filename).
 * @returns {Promise<string>} The file path where the asset should be stored.
 * @throws {TypeError} If the input parameters are of invalid types or values.
 */
export async function build_asset_path(id_domain, slug) {
	if (typeof id_domain !== "number" || id_domain <= 0)
		throw new TypeError("build_asset_path: id_domain must be a positive number");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("build_asset_path: slug must be a non-empty string");

	const domain_tree_path = await select.domain_tree(id_domain);
	const domain_path = domain_tree_path
		.map(domain => domain.slug)
		.join("/");

	const file_path = `${public_root}/${domain_path}/${slug}`;
	return file_path;
}

export const utils = {
	exists,
	build_asset_path,
};
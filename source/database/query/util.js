/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { randomUUID } from "node:crypto";
import { rm, symlink } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { select } from "@/database/query/select";
import { public_root } from "@/setup";
import { join } from 'node:path';

/** @import { AssetData } from "@/database/query"; */

/**
 * @typedef {'table' | 'view' | 'type' | 'schema'} DatabaseObject
 */

/**
 * Check if a database object exists.
 * @param {string} name Name of the object to check.
 * @param {DatabaseObject} [type='table'] Type of the object to check.
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

/**
 * Build a unique temporary path for an asset operation.
 * @param {string} target_path Final asset path.
 * @returns {string} Temporary path for staging the asset.
 */
export function build_temp_path(target_path) {
	const directory = dirname(target_path);
	const file_name = basename(target_path);
	const tmp_path = join(directory, `${file_name}.tmp-${randomUUID()}`);
	return tmp_path;
}

/**
 * Prepare an asset file at a temporary path.
 * @param {AssetData} data Asset content or source path.
 * @param {string} temp_path Temporary path to write or link.
 * @param {string} error_prefix Error prefix for thrown errors.
 * @returns {Promise<void>}
 */
export async function prepare_asset_file(data, temp_path, error_prefix = "asset") {
	if ("blob" in data && data.blob instanceof Blob) {
		await Bun.write(temp_path, data.blob);
		return;
	}

	if ("path" in data && typeof data.path === "string") {
		if (!(await Bun.file(data.path).exists()))
			throw new Error(`${error_prefix}: source file does not exist at path ${data.path}`);

		await symlink(data.path, temp_path);
		return;
	}

	throw new TypeError(`${error_prefix}: data must have either a blob or path property`);
}

/**
 * Cleanup temporary or target asset paths after a failed operation.
 * @param {{ temp_path?: string | null, new_path?: string | null }} options Cleanup options.
 * @returns {Promise<void>}
 */
export async function cleanup_asset_paths({ temp_path, new_path }) {
	if (temp_path)
		await rm(temp_path, { force: true });

	if (new_path)
		await rm(new_path, { force: true });
}

export const util = {
	exists,
	build_asset_path,
	build_temp_path,
	prepare_asset_file,
	cleanup_asset_paths,
};
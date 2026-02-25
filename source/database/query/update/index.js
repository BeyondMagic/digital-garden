/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { lstat, rename, rm } from "node:fs/promises";
import { sql } from "bun";
import {
	build_asset_path,
	build_temp_path,
	cleanup_asset_paths,
	prepare_asset_file,
} from "@/database/query/util";
import { assert } from "@/logger";

/**
 * @import { RowIdentifier } from "@/database/query"
 */

/**
 * @typedef {Object} AssetInput - Information about an asset.
 * @property {number | undefined} id_domain - ID of the domain the asset belongs to.
 * @property {string | undefined} slug - Unique slug for the asset within the domain.
 * @property {{blob: Blob} | {path: string} | undefined} data - The binary/symlink data of the asset.
 */

/**
 * Checks if the file at the given path is a symbolic link and returns the path, otherwise reads the file as a Blob and returns it.
 * @param {string} path - The file system path to the asset.
 * @returns {Promise<{path: string} | {blob: Blob}>} - Returns an object containing either the path (if it's a symbolic link) or the Blob data of the file.
 */
async function fall_back_data(path) {
	assert(
		typeof path === "string" && path.trim().length > 0,
		"fall_back_data: path must be a non-empty string",
	);

	let file_stats;
	try {
		file_stats = await lstat(path);
	} catch (error) {
		throw new Error(
			`fall_back_data: failed to stat file at path ${path}: ${error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	if (file_stats.isSymbolicLink())
		return { path };

	let blob;
	try {
		blob = Bun.file(path);
	} catch (error) {
		throw new Error(
			`fall_back_data: failed to read file at path ${path}: ${error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	return { blob };
}

/**
 * @param {RowIdentifier & AssetInput} input
 */
export async function asset({
	id,
	id_domain,
	slug,
	data,
}) {
	assert(typeof id === "number" && id > 0, "update_asset: id must be a positive number");
	assert(
		id_domain !== undefined ||
		slug !== undefined ||
		data !== undefined,
		"update_asset: at least one of id_domain, slug, or data must be provided",
	);
	assert(id_domain === undefined || (typeof id_domain === "number" && id_domain > 0), "update_asset: id_domain must be a positive number");
	assert(slug === undefined || (typeof slug === "string" && slug.trim().length > 0), "update_asset: slug must be a non-empty string");
	assert(data === undefined || (typeof data === "object" && data !== null), "update_asset: data must be a non-null object");
	assert(data === undefined || (
		("blob" in data && data.blob instanceof Blob && !("path" in data)) ||
		("path" in data && typeof data.path === "string" && !("blob" in data))
	),
		"update_asset: data must have either a blob or a path, but not both",
	);

	await sql.begin(async (sql) => {
		/** @type {Array<{path: string, id_domain: number, slug: string}>} */
		const [old_path_result] = await sql`
			SELECT path, id_domain, slug FROM asset WHERE id = ${id}
		`;

		assert(old_path_result, `update_asset: no asset found with id ${id}`);
		const old_path = old_path_result.path;

		const resolved = {
			id_domain: id_domain ?? old_path_result.id_domain,
			slug: slug ?? old_path_result.slug,
			data: data ?? await fall_back_data(old_path),
		};

		const new_path = await build_asset_path(resolved.id_domain, resolved.slug);

		assert(await Bun.file(old_path).exists(), `update_asset: old file does not exist at path ${old_path}`);

		const temp_path = build_temp_path(new_path);

		assert(!(await Bun.file(temp_path).exists()), `update_asset: temp file already exists at path ${temp_path}`);

		let has_renamed = false;

		try {
			await prepare_asset_file(resolved.data, temp_path, "update_asset");

			await sql`
				UPDATE asset SET
					id_domain = ${resolved.id_domain},
					slug = ${resolved.slug},
					path = ${new_path}
				WHERE id = ${id}
			`;

			await rename(temp_path, new_path);
			has_renamed = true;

			await rm(old_path, { force: true });
		} catch (error) {
			await cleanup_asset_paths({
				temp_path: has_renamed ? null : temp_path,
				new_path: has_renamed ? new_path : null,
			});
			throw error;
		}
	});
}

/**
 * @todo: Implement content update function, ensuring that it properly handles updates to content fields and maintains data integrity.
 */
// export async function content({
// 	id_domain,
// 	id_language,
// 	status,
// 	title,
// 	title_sub,
// 	synopsis,
// 	body
// }) {

// }

export const update = {
	asset,
	// content,
};

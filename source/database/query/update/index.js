/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { rename, rm } from "node:fs/promises";
import { sql } from "bun";
import {
	build_asset_path,
	build_temp_path,
	cleanup_asset_paths,
	prepare_asset_file,
} from "@/database/query/util";
import { assert } from "@/logger";

/** @import { Asset, AssetData } from "@/database/query"; */

/**
 * @param {Asset & {data: AssetData}} asset Asset information to update.
 */
export async function asset({ id, id_domain, slug, data }) {
	assert(typeof id === "number" && id > 0, "update_asset: id must be a positive number");
	assert(typeof id_domain === "number" && id_domain > 0, "update_asset: id_domain must be a positive number");
	assert(typeof slug === "string" && slug.trim().length > 0, "update_asset: slug must be a non-empty string");
	assert(typeof data === "object" && data !== null, "update_asset: data must be a non-null object");
	assert(
		("blob" in data && data.blob instanceof Blob && !("path" in data)) ||
		("path" in data && typeof data.path === "string" && !("blob" in data)),
		"update_asset: data must have either a blob or a path, but not both",
	);

	await sql.begin(async (sql) => {
		/** @type {Array<{path: string}>} */
		const [old_path_result] = await sql`
			SELECT path FROM asset WHERE id = ${id}
		`;

		assert(old_path_result, `update_asset: no asset found with id ${id}`);

		const old_path = old_path_result.path;
		const new_path = await build_asset_path(id_domain, slug);

		assert(old_path !== new_path, "update_asset: new path is the same as the old path");
		assert(!(await Bun.file(old_path).exists()), `update_asset: old file does not exist at path ${old_path}`);

		const temp_path = build_temp_path(new_path);

		assert(!(await Bun.file(temp_path).exists()), `update_asset: temp file already exists at path ${temp_path}`);

		let has_renamed = false;

		try {
			await prepare_asset_file(data, temp_path, "update_asset");

			await sql`
				UPDATE asset SET
					id_domain = ${id_domain},
					slug = ${slug},
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

export const update = {
	asset,
};

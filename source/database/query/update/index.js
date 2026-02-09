/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import {
	build_asset_path,
	build_temp_path,
	cleanup_asset_paths,
	prepare_asset_file,
} from "@/database/query/util";
import { rename, rm } from "node:fs/promises";

/** @import { Asset, AssetData } from "@/database/query"; */

/**
 * @param {Asset & {data: AssetData}} asset Asset information to update.
 */
export async function asset({
	id,
	id_domain,
	slug,
	data,
}) {

	if (typeof id_domain !== "number" || id_domain <= 0)
		throw new TypeError("update_asset: id_domain must be a positive number");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("update_asset: slug must be a non-empty string");

	await sql.begin(async sql => {

		/** @type {Array<{path: string}>} */
		const [old_path_result] = await sql`
			SELECT path FROM asset WHERE id = ${id}
		`;

		if (!old_path_result)
			throw new Error(`update_asset: no asset found with id ${id}`);

		const old_path = old_path_result.path;
		const new_path = await build_asset_path(id_domain, slug);

		if (old_path === new_path)
			throw new Error("update_asset: new path is the same as the old path");

		if (await Bun.file(new_path).exists())
			throw new Error(`update_asset: file already exists at path ${new_path}`);

		const temp_path = build_temp_path(new_path);

		if (await Bun.file(temp_path).exists())
			throw new Error(`update_asset: temp file already exists at path ${temp_path}`);

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
				new_path: has_renamed ? new_path : null
			});
			throw error;
		}
	})
}

export const update = {
	asset
}
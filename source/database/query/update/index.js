/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { build_asset_path } from "@/database/query/util";
import { symlink } from "node:fs/promises";

/** @import { Asset, AssetData } from "@/database/query"; */

/**
 * @param {Asset & AssetData} asset Asset information to update.
 * @returns {Promise<void>}
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

		await sql`
			UPDATE asset SET
				id_domain = ${id_domain},
				slug = ${slug},
				path = ${new_path}
			WHERE id = ${id}
		`;

		if (await Bun.file(new_path).exists())
			throw new Error(`update_asset: file already exists at path ${new_path}`);

		if ("blob" in data && data.blob instanceof Blob)
			await Bun.write(new_path, data.blob);

		else if ("path" in data && typeof data.path === "string") {

			if (!(await Bun.file(data.path).exists()))
				throw new Error(`update_asset: source file does not exist at path ${data.path}`);

			await symlink(data.path, new_path);
		}
		else
			throw new TypeError("update_asset: data must have either a blob or path property");

		await Bun.file(old_path).delete();
	})
}

export const update = {
	asset
}
/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

/**
 * @param {{id: number}} param0 - Asset information to remove.
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

export const remove = {
	asset,
};

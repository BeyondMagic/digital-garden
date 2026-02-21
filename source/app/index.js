/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { capability } from "@/app/public/capability";
import { seed } from "@/app/seed";
import { create } from "@/database/query/create";
import { select } from "@/database/query/select";
import { create_critical } from "@/logger";
import { DEFAULT_CONTENT_TYPE, extension_to_content_type } from "@/util";

const critical = create_critical(import.meta.path);

export async function setup() {
	// await remove.garden();
	await create.schema();
	await seed.tables();
	await capability.setup();
}

/**
 * @param {Object} last - The last domain segment information.
 * @param {string} last.slug - The slug of the asset.
 * @param {number} last.id_domain - The ID of the domain associated with the asset.
 * @returns {Promise<Response>}
 */
export async function handle_asset(last) {
	const asset = await select.asset({
		slug: last.slug,
		id_domain: last.id_domain,
	});

	const file = Bun.file(asset.path);
	if (!(await file.exists())) {
		critical(`Asset file not found at path\t→ ${asset.path}`);
		return new Response("Asset file not found", {
			status: 404,
			headers: { "content-type": "text/plain" },
		});
	}

	// To-do: based on the file extension, set automatic content-type.
	const file_extension = asset.path.split(".").pop();
	const content_type =
		(file_extension && extension_to_content_type.get(file_extension)) ||
		DEFAULT_CONTENT_TYPE;
	return new Response(file, {
		headers: { "content-type": content_type },
	});
}

export const app = {
	setup,
	handle_asset,
};

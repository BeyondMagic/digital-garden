/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { tables } from "@/database/query/create/tables";
import { types } from "@/database/query/create/types";
import { create_debug } from "@/logger";
const debug = create_debug(import.meta.path);

/**
 * Ensure database schema exists and is consistent.
 * @returns {Promise<void>}
 */
async function schema_create() {
	debug("Creating/checking database schema...", { step: { current: 1, max: 2 } });

	const creation_items = [
		...Object.values(types),
		...Object.values(tables),
	];

	const processed_items = [];
	for (const create_item of creation_items) {
		if (typeof create_item.exists !== "function")
			throw new TypeError("schema: creation item is missing an exists() method");

		const exists = await create_item.exists();
		processed_items.push({ create_item, exists });
	}

	const all_exist = processed_items.every(item => item.exists === true);
	const none_exist = processed_items.every(item => item.exists === false);

	if (!all_exist && !none_exist)
		throw new Error(`schema: inconsistent database state detected (partial schema present). Processed items:\n${processed_items.map(item => `- ${item.create_item.name}: ${item.exists}`).join("\n")}`);

	if (none_exist) {
		for (const create_item of creation_items) {
			debug(`Creating database schema item: ${create_item.name}`);
			await create_item();
		}

	}

	debug("Database/checking schema created successfully", { step: { current: 2, max: 2 } });
}

export const create = {
	schema: schema_create,
};

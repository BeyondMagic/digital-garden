/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

const DEFAULT_BRANCH = "main";
const EMPTY_GIT_COMMIT = "0000000000000000000000000000000000000000";

/**
 * Insert a new module row.
 * This implements the first step of the module lifecycle:
 * create a disabled module entry with a placeholder commit and a branch.
 *
 * @param {{ repository: string, slug: string, branch?: string, commit?: string }} input Insert payload.
 * @returns {Promise<any>} Inserted module row.
 */
export async function insert_module(input) {
	if (!input || typeof input !== "object") {
		throw new TypeError("insert_module: input must be an object");
	}
	const { repository, slug } = input;
	const branch = input.branch ?? DEFAULT_BRANCH;
	const commit = input.commit ?? EMPTY_GIT_COMMIT;

	if (typeof repository !== "string" || repository.trim().length === 0)
		throw new TypeError("insert_module: repository must be a non-empty string");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("insert_module: slug must be a non-empty string");

	if (typeof branch !== "string" || branch.trim().length === 0)
		throw new TypeError("insert_module: branch must be a non-empty string");

	if (typeof commit !== "string" || commit.length !== 40)
		throw new TypeError("insert_module: commit must be a 40-char git SHA");

	const result = await sql`
		INSERT INTO module (repository, slug, enabled, last_checked, commit, branch)
		VALUES (${repository}, ${slug}, ${false}, CURRENT_TIMESTAMP, ${commit}, ${branch})
		RETURNING *
	`;

	if (result.length === 0) {
		throw new Error("insert_module: failed to insert module");
	}

	return result[0];
}

insert_module.test = function () {
	let threw = false;
	try {
		// @ts-expect-error intentionally invalid
		insert_module(null);
	} catch {
		threw = true;
	}
	if (!threw) {
		throw new Error("insert_module.test: expected invalid input to throw");
	}
};

export const insert = {
	module: insert_module,
};

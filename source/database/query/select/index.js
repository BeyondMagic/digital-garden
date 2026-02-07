/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";


/** @import { Domain } from "@/database/query/insert" */

/**
 * Build the domain tree (root to leaf) for a given domain id.
 * @param {number} id_domain Domain id to resolve.
 * @returns {Promise<Array<Domain>>} Domain path from root to leaf.
 */
export async function domain_tree(id_domain) {
	if (typeof id_domain !== "number" || id_domain <= 0)
		throw new TypeError("domain_tree: id_domain must be a positive number");

	/** @type {Array<Domain>} */
	const rows = await sql`
		WITH RECURSIVE domain_path AS (
			SELECT id, id_domain_parent, id_domain_redirect, kind, slug, status
			FROM domain
			WHERE id = ${id_domain}
			UNION ALL
			SELECT d.id, d.id_domain_parent, d.id_domain_redirect, d.kind, d.slug, d.status
			FROM domain d
			INNER JOIN domain_path dp ON dp.id_domain_parent = d.id
		)
		SELECT id, id_domain_parent, id_domain_redirect, kind, slug, status
		FROM domain_path
		ORDER BY id DESC
	`;

	return rows;
}

export const select = {
	domain_tree,
}
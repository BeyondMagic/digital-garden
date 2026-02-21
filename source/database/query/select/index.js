/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";


/** @import { Domain } from "@/database/query" */

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

/**
 * Build the domain tree (root to leaf) for a given array of slugs.
 * @example
 * const tree = await domain_tree_by_slugs(["archive_v1.tar.gz", "love-love", "fanfics", "alt", "writing"]);
 * console.log(tree);
 * @param {Array<string>} slugs
 * @returns {Promise<Array<Domain>>}
 */
export async function domain_tree_by_slugs(slugs) {
	if (!Array.isArray(slugs) || slugs.some(slug => typeof slug !== "string" || slug.trim().length === 0))
		throw new TypeError("domain_tree_by_slugs: slugs must be an array of non-empty strings");

	/** @type {Array<Domain>} */
	const tree = [];

	let parent_id = null;

	for (const slug of slugs) {
		/** @type {Array<Domain>} */
		const rows = await sql`
			SELECT id, id_domain_parent, id_domain_redirect, kind, slug, status
			FROM domain
			WHERE slug = ${slug} AND id_domain_parent IS NOT DISTINCT FROM ${parent_id}
		`;

		if (!rows[0])
			break;

		const domain_row = rows[0];
		tree.push(domain_row);
		parent_id = domain_row.id;
	}

	return tree;
}

export const select = {
	domain_tree,
	domain_tree_by_slugs,
}
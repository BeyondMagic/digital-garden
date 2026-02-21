/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { assert } from "@/logger";


/** @import { Asset, Domain, DomainKind } from "@/database/query" */

/**
 * Build the domain tree (root to leaf) for a given domain id.
 * @param {number} id_domain Domain id to resolve.
 * @returns {Promise<Array<Domain>>} Domain path from root to leaf.
 */
export async function domain_tree(id_domain) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"domain_tree: id_domain must be a positive number"
	);

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
 * @todo Should check slug and type of each segment (subdomain/router) to ensure the correct tree is built.
 * @example
 * const tree = await domain_tree_by_slugs(["archive_v1.tar.gz", "love-love", "fanfics", "alt", "writing"]);
 * console.log(tree);
 * @param {Array<{value: string, kind: DomainKind}>} slugs
 * @returns {Promise<Array<Domain>>}
 */
export async function domain_tree_by_slugs(slugs) {
	assert(
		(
			!Array.isArray(slugs) ||
			slugs.some((slug) => (
				typeof slug !== "object" ||
				slug === null ||
				typeof slug.value !== "string" ||
				slug.value.trim().length === 0 ||
				typeof slug.kind !== "string" ||
				!["SUBDOMAIN", "ROUTER"].includes(slug.kind)
			))
		),
		"domain_tree_by_slugs: slugs must be an array of non-empty strings with a valid kind (SUBDOMAIN or ROUTER)"
	)


	/** @type {Array<Domain>} */
	const tree = [];

	/** @type {Array<Domain>} */
	const [root_domain] = await sql`
		SELECT
			domain.id,
			domain.id_domain_parent,
			domain.id_domain_redirect,
			domain.kind,
			domain.slug,
			domain.status
		FROM domain
		INNER JOIN garden ON garden.id_domain = domain.id
	`;

	if (!root_domain) return tree;

	tree.push(root_domain);

	let parent_id = null;

	for (const slug of slugs) {
		/** @type {Array<Domain>} */
		const rows = await sql`
			SELECT id, id_domain_parent, id_domain_redirect, kind, slug, status
			FROM domain
			WHERE slug = ${slug} AND id_domain_parent IS NOT DISTINCT FROM ${parent_id}
		`;

		if (!rows[0]) break;

		const domain_row = rows[0];
		tree.push(domain_row);
		parent_id = domain_row.id;
	}

	return tree;
}

/**
 * Count the number of rows in a specified table.
 * @param {string} name Name of the table to count rows in.
 * @returns {Promise<number>} The count of rows in the specified table.
 */
export async function count(name) {
	if (typeof name !== "string" || name.trim().length === 0)
		throw new TypeError("count: name must be a non-empty string");

	const result = await sql`
		SELECT COUNT(*) AS count
		FROM ${sql(name)}
	`;

	return Number(result[0].count);
}

/**
 * @typedef {Object} AssetInput
 * @property {string} slug Slug of the asset (e.g., filename).
 * @property {number} id_domain ID of the domain the asset belongs to.
 */

/**
 * Fetch an asset by its slug and domain ID.
 * @param {AssetInput} input
 * @returns {Promise<Asset>} The asset matching the slug and domain ID, or null if not found.
 */
export async function asset({ slug, id_domain }) {
	assert(typeof slug === "string" && slug.trim().length > 0, "asset: slug must be a non-empty string");
	assert(typeof id_domain === "number" && id_domain > 0, "asset: id_domain must be a positive number");

	const [row] = await sql`
		SELECT id, id_domain, slug, path
		FROM asset
		WHERE slug = ${slug} AND id_domain = ${id_domain}
	`;

	assert(row, `asset: no asset found with slug "${slug}" and id_domain ${id_domain}`);

	return row;
}

export const select = {
	domain_tree,
	domain_tree_by_slugs,
	asset,
	count,
}
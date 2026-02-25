/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { assert } from "@/logger";

/**
 * @import { Asset, Domain, DomainKind, Author } from "@/database/query"
 */

/**
 * @typedef {Object} DomainTreeInput
 * @property {number} id_domain - The ID of the domain to build the tree for.
 */

/**
 * Build the domain tree (root to leaf) for a given domain id.
 * @param {DomainTreeInput} input
 * @returns {Promise<Array<Domain>>} Domain path from root to leaf.
 */
export async function domain_tree({ id_domain }) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"domain_tree: id_domain must be a positive number",
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
 * @typedef {Object} DomainTreeAuthorExistsInput
 * @property {number} id_domain - The starting domain id to validate against ancestor grants.
 * @property {number} id_author - The author id to check in author_domain.
 */

/**
 * Check whether an author has direct grant in the target domain or any ancestor domain.
 * Uses recursive EXISTS and stops climbing once a granted ancestor is found.
 * @param {DomainTreeAuthorExistsInput} input
 * @returns {Promise<boolean>}
 */
export async function domain_tree_author_exists({ id_domain, id_author }) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"domain_tree_author_exists: id_domain must be a positive number",
	);
	assert(
		typeof id_author === "number" && Number.isInteger(id_author) && id_author > 0,
		"domain_tree_author_exists: id_author must be a positive integer",
	);

	const [row] = await sql`
		WITH RECURSIVE domain_chain AS (
			SELECT
				d.id_domain_parent,
				EXISTS(
					SELECT 1
					FROM author_domain ad
					WHERE ad.id_author = ${id_author} AND ad.id_domain = d.id
				) AS granted
			FROM domain d
			WHERE d.id = ${id_domain}

			UNION ALL

			SELECT
				d.id_domain_parent,
				EXISTS(
					SELECT 1
					FROM author_domain ad
					WHERE ad.id_author = ${id_author} AND ad.id_domain = d.id
				) AS granted
			FROM domain d
			INNER JOIN domain_chain dc ON dc.id_domain_parent = d.id
			WHERE dc.granted = FALSE
		)
		SELECT EXISTS(
			SELECT 1
			FROM domain_chain
			WHERE granted = TRUE
		) AS granted
	`;

	return Boolean(row?.granted);
}

/**
 * @typedef {Object} DomainTreeBySlugsInput
 * @property {Array<{value: string, kind: DomainKind}>} slugs - An array of objects containing the slug value and its corresponding domain kind (SUBDOMAIN or ROUTER) to build the tree for.
 * @property {number | null} id_author - The ID of the author to check for direct access to domains in the tree (optional, can be used for more efficient scope validation).
 */

/**
 * @typedef {Domain & { granted: boolean }} DomainWithGrant
 */

/**
 * Build the domain tree (root to leaf) for a given array of slugs.
 * @param {Array<{value: string, kind: DomainKind}>} slugs
 * @returns {Promise<Array<Domain>>}
 */
export async function domain_tree_by_slugs(slugs) {
	assert(
		Array.isArray(slugs) &&
		slugs.every(
			(slug) =>
				typeof slug === "object" &&
				slug !== null &&
				typeof slug.value === "string" &&
				slug.value.trim().length > 0 &&
				typeof slug.kind === "string" &&
				["SUBDOMAIN", "ROUTER"].includes(slug.kind),
		),
		"domain_tree_by_slugs: slugs must be an array of non-empty strings with a valid kind (SUBDOMAIN or ROUTER)",
	);

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

	let parent_id = root_domain.id;

	for (const slug of slugs) {
		const [row] = /** @type {Array<Domain>} */ (
			await sql`
			SELECT id, id_domain_parent, id_domain_redirect, kind, slug, status
			FROM domain
			WHERE slug = ${slug.value}
				AND kind = ${slug.kind}
				AND id_domain_parent IS NOT DISTINCT FROM ${parent_id}
		`
		);

		if (!row) break;

		tree.push(row);
		parent_id = row.id;
	}

	return tree;
}

/**
 * Count the number of rows in a specified table.
 * @param {string} name Name of the table to count rows in.
 * @returns {Promise<number>} The count of rows in the specified table.
 */
export async function count(name) {
	assert(
		typeof name === "string" && name.trim().length > 0,
		"count: name must be a non-empty string",
	);

	const [row] = await sql`
		SELECT COUNT(*) AS count
		FROM ${sql(name)}
	`;

	return Number(row.count);
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
	assert(
		typeof slug === "string" && slug.trim().length > 0,
		"asset: slug must be a non-empty string",
	);
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"asset: id_domain must be a positive number",
	);

	const [row] = await sql`
		SELECT id, id_domain, slug, path
		FROM asset
		WHERE slug = ${slug} AND id_domain = ${id_domain}
	`;

	assert(
		row,
		`asset: no asset found with slug "${slug}" and id_domain ${id_domain}`,
	);

	return row;
}

/**
 * @typedef {Object} AuthorInput
 * @property {string} email Author's email address.
 */

/**
 * Fetch an author by their email address.
 * @param {AuthorInput} input
 * @returns {Promise<Author>} The author matching the email address.
 */
export async function author({ email }) {
	assert(
		typeof email === "string" && email.trim().length > 0,
		"author: email must be a non-empty string",
	);

	const [row] = await sql`
		SELECT id, id_asset, email, name, pages, contents
		FROM author
		WHERE email = ${email}
	`;

	assert(row, `author: no author found with email "${email}"`);

	return row;
}

export const select = {
	domain_tree,
	domain_tree_author_exists,
	domain_tree_by_slugs,
	asset,
	count,
	author,
};

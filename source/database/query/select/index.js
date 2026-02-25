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
 * @param {DomainTreeBySlugsInput} input
 * @returns {Promise<Array<DomainWithGrant>>}
 */
export async function domain_tree_by_slugs({ slugs, id_author }) {
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
	assert(
		id_author === null || (typeof id_author === "number" && Number.isInteger(id_author) && id_author > 0),
		"domain_tree_by_slugs: id_author must be null or a positive integer",
	);

	const encoded_slugs = JSON.stringify(slugs);

	/** @type {Array<DomainWithGrant>} */
	const tree = await sql`
		WITH RECURSIVE
		root_domain AS (
			SELECT
				d.id,
				d.id_domain_parent,
				d.id_domain_redirect,
				d.kind,
				d.slug,
				d.status
			FROM domain d
			INNER JOIN garden g ON g.id_domain = d.id
		),
		input_slugs AS (
			SELECT
				ordinality::INTEGER AS position,
				(item->>'value')::TEXT AS value,
				(item->>'kind')::TEXT AS kind
			FROM jsonb_array_elements(${encoded_slugs}::JSONB) WITH ORDINALITY AS item(item, ordinality)
		),
		domain_path AS (
			SELECT
				0 AS position,
				rd.id,
				rd.id_domain_parent,
				rd.id_domain_redirect,
				rd.kind,
				rd.slug,
				rd.status
			FROM root_domain rd

			UNION ALL

			SELECT
				dp.position + 1 AS position,
				d.id,
				d.id_domain_parent,
				d.id_domain_redirect,
				d.kind,
				d.slug,
				d.status
			FROM domain_path dp
			INNER JOIN input_slugs input ON input.position = dp.position + 1
			INNER JOIN domain d
				ON d.id_domain_parent = dp.id
				AND d.slug = input.value
				AND d.kind = input.kind::TYPE_DOMAIN
		)
		SELECT
			dp.id,
			dp.id_domain_parent,
			dp.id_domain_redirect,
			dp.kind,
			dp.slug,
			dp.status,
			CASE
				WHEN ${id_author}::INTEGER IS NULL THEN FALSE
				ELSE ad.id_author IS NOT NULL
			END AS granted
		FROM domain_path dp
		LEFT JOIN author_domain ad
			ON ad.id_author = ${id_author}
			AND ad.id_domain = dp.id
		ORDER BY dp.position ASC
	`;

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

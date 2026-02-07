/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

/**
 * @typedef {Object} ModuleInput - Information about a module.
 * @property {string} repository - Repository URL of the module.
 * @property {string} commit - Git commit hash of the module version.
 * @property {string} branch - Git branch of the module.
 * @property {number | null} version_major - Major version number of the module.
 * @property {number | null} version_minor - Minor version number of the module.
 * @property {number | null} version_patch - Patch version number of the module.
 * @property {Date} last_heartbeat - Timestamp of the last heartbeat received from the module.
 * @property {boolean} enabled - Whether the module is enabled or not.
 */

/**
 * @typedef {Object} Module - Input data for inserting a module.
 * @extends ModuleInsertInput
 * @property {number} id - Unique identifier for the module.
 */

/**
 * @param {ModuleInput} module Module information to insert.
 * @returns {Promise<number>} Inserted module ID.
 */
export async function insert_module({
	repository,
	commit,
	branch,
	version_major,
	version_minor,
	version_patch,
	last_heartbeat,
	enabled,
}) {
	if (typeof repository !== "string" || repository.trim().length === 0)
		throw new TypeError("insert_module: repository must be a non-empty string");

	if (typeof commit !== "string" || commit.length !== 40)
		throw new TypeError("insert_module: commit must be a 40-char git SHA");

	if (typeof branch !== "string" || branch.trim().length === 0)
		throw new TypeError("insert_module: branch must be a non-empty string");

	if (typeof version_major !== "number" || version_major < 0)
		throw new TypeError("insert_module: version_major must be a non-negative number");

	if (typeof version_minor !== "number" || version_minor < 0)
		throw new TypeError("insert_module: version_minor must be a non-negative number");

	if (typeof version_patch !== "number" || version_patch < 0)
		throw new TypeError("insert_module: version_patch must be a non-negative number");

	if (last_heartbeat !== undefined && !(last_heartbeat instanceof Date))
		throw new TypeError("insert_module: last_heartbeat must be a Date object if provided");

	const result = await sql`
		INSERT INTO module (
			repository,
			commit,
			branch,
			version_major,
			version_minor,
			version_patch,
			last_heartbeat,
			enabled
		) VALUES (
			${repository},
			${commit},
			${branch},
			${version_major},
			${version_minor},
			${version_patch},
			${last_heartbeat},
			${enabled}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_module: failed to insert module");

	return result[0].id;
}

/**
 * @typedef {Object} AssetInput - Information about an asset.
 * @property {number} id_domain - ID of the domain the asset belongs to.
 * @property {string} slug - Unique slug for the asset within the domain.
 */

/**
 * @typedef {Object} Asset - Input data for inserting an asset.
 * @extends AssetInput
 * @property {number} id - Unique identifier for the asset.
 */

/**
 * @param {AssetInput} asset Asset information to insert.
 * @returns {Promise<number>} Inserted asset ID.
 */
export async function asset({
	id_domain,
	slug,
}) {

	if (typeof id_domain !== "number" || id_domain <= 0)
		throw new TypeError("asset: id_domain must be a positive number");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("asset: slug must be a non-empty string");

	const result = await sql`
		INSERT INTO asset (
			id_domain,
			slug
		) VALUES (
			${id_domain},
			${slug}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_asset: failed to insert asset");

	return result[0].id;
}

/**
 * @typedef {Object} DomainInput
 * @property {number} id_domain - ID of the domain the asset belongs to.
 * @property {number | null} id_domain_parent - ID of the parent domain (nullable).
 * @property {number | null} id_domain_redirect - ID of the domain to redirect to (nullable).
 * @property {string} kind - Kind of the domain (e.g., "SUBDOMAIN", "ROUTER").
 * @property {string} slug - Unique slug for the domain.
 * @property {string} status - Status of the domain (e.g., "PUBLIC", "PRIVATE", "ARCHIVED", "DELETED").
 */

/**
 * @typedef {Object} Domain
 * @extends DomainInput
 * @property {number} id - Unique identifier for the domain.
 */

/**
 * @param {DomainInput} domain Domain information to insert.
 * @returns {Promise<number>} Inserted domain ID.
 */
export async function domain({
	id_domain_parent,
	id_domain_redirect,
	kind,
	slug,
	status,
}) {
	if (id_domain_parent !== null && (typeof id_domain_parent !== "number" || id_domain_parent <= 0))
		throw new TypeError("domain: id_domain_parent must be a positive number or null");

	if (id_domain_redirect !== null && (typeof id_domain_redirect !== "number" || id_domain_redirect <= 0))
		throw new TypeError("domain: id_domain_redirect must be a positive number or null");

	if (typeof kind !== "string" || kind.trim().length === 0)
		throw new TypeError("domain: kind must be a non-empty string");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("domain: slug must be a non-empty string");

	if (typeof status !== "string" || status.trim().length === 0)
		throw new TypeError("domain: status must be a non-empty string");

	const result = await sql`
		INSERT INTO domain (
			id_domain_parent,
			id_domain_redirect,
			kind,
			slug,
			status
		) VALUES (
			${id_domain_parent},
			${id_domain_redirect},
			${kind},
			${slug},
			${status}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_domain: failed to insert domain");

	return result[0].id;
}

export const insert = {
	module: insert_module,
	asset,
	domain,
};

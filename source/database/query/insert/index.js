/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import {
	build_asset_path,
	build_temp_path,
	cleanup_asset_paths,
	prepare_asset_file,
} from "@/database/query/util";
import { rename } from "node:fs/promises";

/** @import {TagInput, AssetInformationInput, LanguageInput, LanguageInformationInput, ModuleInput, AssetInput, AssetData, DomainInput} from "@/database/query"; */

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
 * @param {AssetInput & {data: AssetData}} asset Asset information to insert.
 * @returns {Promise<number>} Inserted asset ID.
 */
export async function asset({
	id_domain,
	slug,
	data,
}) {

	if (typeof id_domain !== "number" || id_domain <= 0)
		throw new TypeError("asset: id_domain must be a positive number");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("asset: slug must be a non-empty string");

	const id = await sql.begin(async sql => {

		const file_path = await build_asset_path(id_domain, slug);
		const temp_path = build_temp_path(file_path);

		if (await Bun.file(file_path).exists())
			throw new Error(`insert_asset: file already exists at path ${file_path}`);

		if (await Bun.file(temp_path).exists())
			throw new Error(`insert_asset: temp file already exists at path ${temp_path}`);

		let has_renamed = false;

		try {
			await prepare_asset_file(data, temp_path, "insert_asset");

			/** @type {Array<{id: number}>} */
			const [asset_row] = await sql`
				INSERT INTO asset (
					id_domain,
					slug,
					path
				) VALUES (
					${id_domain},
					${slug},
					${file_path}
				)
				RETURNING id
			`;

			if (!asset_row)
				throw new Error("insert_asset: failed to insert asset");

			await rename(temp_path, file_path);
			has_renamed = true;

			return asset_row.id;
		} catch (error) {
			await cleanup_asset_paths({
				temp_path: has_renamed ? null : temp_path,
				new_path: has_renamed ? file_path : null
			});
			throw error;
		}
	})

	return id;
}

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

/**
 * @param {LanguageInput} language Language information to insert.
 * @returns {Promise<number>} Inserted language ID.
 */
export async function language({
	id_asset,
	slug,
}) {
	if (typeof id_asset !== "number" || id_asset <= 0)
		throw new TypeError("language: id_asset must be a positive number");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("language: slug must be a non-empty string");

	const result = await sql`
		INSERT INTO language (
			id_asset,
			slug
		) VALUES (
			${id_asset},
			${slug}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_language: failed to insert language");

	return result[0].id;
}

/**
 * @param {LanguageInformationInput} language_information Language information to insert.
 * @returns {Promise<number>} Inserted language information ID.
 */
export async function language_information({
	id_language_for,
	id_language_from,
	name,
	description,
}) {
	if (typeof id_language_for !== "number" || id_language_for <= 0)
		throw new TypeError("language_information: id_language_for must be a positive number");

	if (typeof id_language_from !== "number" || id_language_from <= 0)
		throw new TypeError("language_information: id_language_from must be a positive number");

	if (typeof name !== "string" || name.trim().length === 0)
		throw new TypeError("language_information: name must be a non-empty string");

	if (typeof description !== "string")
		throw new TypeError("language_information: description must be a string");

	const result = await sql`
		INSERT INTO language_information (
			id_language_for,
			id_language_from,
			name,
			description
		) VALUES (
			${id_language_for},
			${id_language_from},
			${name},
			${description}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_language_information: failed to insert language information");

	return result[0].id;
}

/**
 * @param {AssetInformationInput} asset_information Asset information to insert.
 * @returns {Promise<number>} Inserted asset information ID.
 */
export async function asset_information({
	id_asset,
	id_language,
	name,
	description,
}) {
	if (typeof id_asset !== "number" || id_asset <= 0)
		throw new TypeError("asset_information: id_asset must be a positive number");

	if (typeof id_language !== "number" || id_language <= 0)
		throw new TypeError("asset_information: id_language must be a positive number");

	if (typeof name !== "string" || name.trim().length === 0)
		throw new TypeError("asset_information: name must be a non-empty string");

	if (typeof description !== "string")
		throw new TypeError("asset_information: description must be a string");

	const result = await sql`
		INSERT INTO asset_information (
			id_asset,
			id_language,
			name,
			description
		) VALUES (
			${id_asset},
			${id_language},
			${name},
			${description}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_asset_information: failed to insert asset information");

	return result[0].id;
}

/**
 * @param {TagInput} tag Tag information to insert.
 * @returns {Promise<number>} Inserted tag ID.
 */
export async function tag({
	id_asset,
	slug,
}) {
	if (typeof id_asset !== "number" || id_asset <= 0)
		throw new TypeError("tag: id_asset must be a positive number");

	if (typeof slug !== "string" || slug.trim().length === 0)
		throw new TypeError("tag: slug must be a non-empty string");

	const result = await sql`
		INSERT INTO tag (
			id_asset,
			slug
		) VALUES (
			${id_asset},
			${slug}
		)
		RETURNING id
	`;

	if (result.length === 0)
		throw new Error("insert_tag: failed to insert tag");

	return result[0].id;
}

export const insert = {
	module: insert_module,
	asset,
	domain,
	language,
	language_information,
	asset_information,
	tag,
};
/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { symlink } from "node:fs/promises";
import { build_asset_path } from "@/database/query/util";

/** @import {ModuleInput, RowIdentifier, AssetInput, AssetData, DomainInput} from "@/database/query/index"; */

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
 * @param {AssetInput & AssetData} asset Asset information to insert.
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

		if (await Bun.file(file_path).exists())
			throw new Error(`insert_asset: file already exists at path ${file_path}`);

		if ("blob" in data && data.blob instanceof Blob)
			await Bun.write(file_path, data.blob);

		else if ("path" in data && typeof data.path === "string") {

			if (!(await Bun.file(data.path).exists()))
				throw new Error(`insert_asset: source file does not exist at path ${data.path}`);

			await symlink(data.path, file_path);
		}
		else
			throw new TypeError("insert_asset: data must have either a blob or path property");

		return asset_row.id;
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

export const insert = {
	module: insert_module,
	asset,
	domain,
};

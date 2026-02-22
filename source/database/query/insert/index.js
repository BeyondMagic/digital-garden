/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { rename } from "node:fs/promises";
import { sql as sql_exec } from "bun";
import {
	build_asset_path,
	build_temp_path,
	cleanup_asset_paths,
	prepare_asset_file,
} from "@/database/query/util";
import { jwt } from "@/jwt";
import { assert, create_warn } from "@/logger";

const warn = create_warn(import.meta.path);

/** @import {AuthorContentInput, AuthorConnectionCredentials, AuthorDomainInput, AuthorConnectionInput, AuthorInput, GardenInformationInput, GardenInput, ContentLinkInput, ContentInput, DomainTagInput, TagInformationInput, TagRequirementInput, TagInput, AssetInformationInput, LanguageInput, LanguageInformationInput, ModuleInput, AssetInput, AssetData, DomainInput} from "@/database/query"; */

/**
 * @typedef {Object} SQLObject
 * @property {Bun.SQL} [sql] SQL statement to execute.
 */

/**
 * @param {ModuleInput & SQLObject} module Module information to insert.
 * @returns {Promise<number>} Inserted module ID.
 */
export async function insert_module({
	repository,
	commit,
	version_major,
	version_minor,
	version_patch,
	enabled,
	sql = sql_exec,
}) {
	assert(
		typeof repository === "string" && repository.trim().length > 0,
		"insert_module: repository must be a non-empty string",
	);

	assert(
		typeof commit === "string" && commit.length === 40,
		"insert_module: commit must be a 40-char git SHA",
	);

	assert(
		typeof version_major === "number" && version_major >= 0,
		"insert_module: version_major must be a non-negative number",
	);

	assert(
		typeof version_minor === "number" && version_minor >= 0,
		"insert_module: version_minor must be a non-negative number",
	);

	assert(
		typeof version_patch === "number" && version_patch >= 0,
		"insert_module: version_patch must be a non-negative number",
	);

	const branch = "main";

	const [row] = await sql`
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
			CURRENT_TIMESTAMP,
			${enabled}
		)
		RETURNING id
	`;

	assert(row, "insert_module: failed to insert module into database");

	return row.id;
}

/**
 * @param {AssetInput & {data: AssetData} & SQLObject} asset Asset information to insert.
 * @returns {Promise<number>} Inserted asset ID.
 */
export async function asset({ id_domain, slug, data, sql = sql_exec }) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"insert_asset: id_domain must be a positive number",
	);

	assert(
		typeof slug === "string" && slug.trim().length > 0,
		"insert_asset: slug must be a non-empty string",
	);

	const id = await sql.begin(async (sql) => {
		const file_path = await build_asset_path(id_domain, slug);
		const temp_path = build_temp_path(file_path);

		assert(
			!(await Bun.file(file_path).exists()),
			`insert_asset: file already exists at path ${file_path}`,
		);

		assert(
			!(await Bun.file(temp_path).exists()),
			`insert_asset: temp file already exists at path ${temp_path}`,
		);

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

			assert(asset_row, "insert_asset: failed to insert asset into database");

			await rename(temp_path, file_path);
			has_renamed = true;

			return asset_row.id;
		} catch (error) {
			await cleanup_asset_paths({
				temp_path: has_renamed ? null : temp_path,
				new_path: has_renamed ? file_path : null,
			});
			throw error;
		}
	});

	return id;
}

/**
 * @param {DomainInput & SQLObject} domain Domain information to insert.
 * @returns {Promise<number>} Inserted domain ID.
 */
export async function domain({
	id_domain_parent,
	id_domain_redirect,
	kind,
	slug,
	status,
	sql = sql_exec,
}) {
	assert(
		id_domain_parent === null ||
		(typeof id_domain_parent === "number" && id_domain_parent > 0),
		"domain: id_domain_parent must be a positive number or null",
	);

	assert(
		id_domain_redirect === null ||
		(typeof id_domain_redirect === "number" && id_domain_redirect > 0),
		"domain: id_domain_redirect must be a positive number or null",
	);

	assert(
		typeof kind === "string" && kind.trim().length > 0,
		"domain: kind must be a non-empty string",
	);

	assert(
		slug === null || (typeof slug === "string" && slug.trim().length > 0),
		"domain: slug must be a non-empty string or null",
	);

	assert(
		typeof status === "string" && status.trim().length > 0,
		"domain: status must be a non-empty string",
	);

	const [row] = await sql`
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

	assert(row, "insert_domain: failed to insert domain into database");

	return row.id;
}

/**
 * @param {LanguageInput & SQLObject} language Language information to insert.
 * @returns {Promise<number>} Inserted language ID.
 */
export async function language({ id_asset, slug, sql = sql_exec }) {
	assert(
		typeof id_asset === "number" && id_asset > 0,
		"insert_language: id_asset must be a positive number",
	);

	assert(
		typeof slug === "string" && slug.trim().length > 0,
		"insert_language: slug must be a non-empty string",
	);

	const [row] = await sql`
		INSERT INTO language (
			id_asset,
			slug
		) VALUES (
			${id_asset},
			${slug}
		)
		RETURNING id
	`;

	assert(row, "insert_language: failed to insert language into database");

	return row.id;
}

/**
 * @param {LanguageInformationInput & SQLObject} language_information Language information to insert.
 * @returns {Promise<number>} Inserted language information ID.
 */
export async function language_information({
	id_language_for,
	id_language_from,
	name,
	description,
	sql = sql_exec,
}) {
	assert(
		typeof id_language_for === "number" && id_language_for > 0,
		"language_information: id_language_for must be a positive number",
	);

	assert(
		typeof id_language_from === "number" && id_language_from > 0,
		"language_information: id_language_from must be a positive number",
	);

	assert(
		typeof name === "string" && name.trim().length > 0,
		"language_information: name must be a non-empty string",
	);

	assert(
		typeof description === "string",
		"language_information: description must be a string",
	);

	const [row] = await sql`
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

	assert(
		row,
		"insert_language_information: failed to insert language information",
	);

	return row.id;
}

/**
 * @param {AssetInformationInput & SQLObject} asset_information Asset information to insert.
 * @returns {Promise<number>} Inserted asset information ID.
 */
export async function asset_information({
	id_asset,
	id_language,
	name,
	description,
	sql = sql_exec,
}) {
	assert(
		typeof id_asset === "number" && id_asset > 0,
		"asset_information: id_asset must be a positive number",
	);

	assert(
		typeof id_language === "number" && id_language > 0,
		"asset_information: id_language must be a positive number",
	);

	assert(
		typeof name === "string" && name.trim().length > 0,
		"asset_information: name must be a non-empty string",
	);

	assert(
		typeof description === "string",
		"asset_information: description must be a string",
	);

	const [row] = await sql`
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

	assert(row, "insert_asset_information: failed to insert asset information");

	return row.id;
}

/**
 * @param {TagInput & SQLObject} tag Tag information to insert.
 * @returns {Promise<number>} Inserted tag ID.
 */
export async function tag({ id_asset, slug, sql = sql_exec }) {
	assert(
		typeof id_asset === "number" && id_asset > 0,
		"tag: id_asset must be a positive number",
	);

	assert(
		typeof slug === "string" && slug.trim().length > 0,
		"tag: slug must be a non-empty string",
	);

	const [row] = await sql`
		INSERT INTO tag (
			id_asset,
			slug
		) VALUES (
			${id_asset},
			${slug}
		)
		RETURNING id
	`;

	assert(row, "insert_tag: failed to insert tag");

	return row.id;
}

/**
 * @param {TagRequirementInput & SQLObject} tag_requirement Tag requirement information to insert.
 * @returns {Promise<number>} Inserted tag requirement ID.
 */
export async function tag_requirement({ id_tag, id_tag_for, sql = sql_exec }) {
	assert(
		typeof id_tag === "number" && id_tag > 0,
		"tag_requirement: id_tag must be a positive number",
	);

	assert(
		typeof id_tag_for === "number" && id_tag_for > 0,
		"tag_requirement: id_tag_for must be a positive number",
	);

	const [row] = await sql`
		INSERT INTO tag_requirement (
			id_tag,
			id_tag_for
		) VALUES (
			${id_tag},
			${id_tag_for}
		)
		RETURNING id
	`;

	assert(row, "insert_tag_requirement: failed to insert tag requirement");

	return row.id;
}

/**
 * @param {TagInformationInput & SQLObject} tag_information Tag information to insert.
 * @returns {Promise<number>} Inserted tag information ID.
 */
export async function tag_information({
	id_tag,
	id_language,
	name,
	description,
	sql = sql_exec,
}) {
	assert(
		typeof id_tag === "number" && id_tag > 0,
		"tag_information: id_tag must be a positive number",
	);

	assert(
		typeof id_language === "number" && id_language > 0,
		"tag_information: id_language must be a positive number",
	);

	assert(
		typeof name === "string" && name.trim().length > 0,
		"tag_information: name must be a non-empty string",
	);

	assert(
		typeof description === "string",
		"tag_information: description must be a string",
	);

	const [row] = await sql`
		INSERT INTO tag_information (
			id_tag,
			id_language,
			name,
			description
		) VALUES (
			${id_tag},
			${id_language},
			${name},
			${description}
		)
		RETURNING id
	`;

	assert(row, "insert_tag_information: failed to insert tag information");

	return row.id;
}

/**
 * @param {DomainTagInput & SQLObject} domain_tag Domain tag information to insert.
 * @returns {Promise<number>} Inserted domain tag ID.
 */
export async function domain_tag({ id_domain, id_tag, sql = sql_exec }) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"domain_tag: id_domain must be a positive number",
	);
	assert(
		typeof id_tag === "number" && id_tag > 0,
		"domain_tag: id_tag must be a positive number",
	);

	const [row] = await sql`
		INSERT INTO domain_tag (
			id_domain,
			id_tag
		) VALUES (
			${id_domain},
			${id_tag}
		)
		RETURNING id
	`;

	assert(row, "insert_domain_tag: failed to insert domain tag");

	return row.id;
}

/**
 * @param {ContentInput & SQLObject} content Content information to insert.
 * @returns {Promise<number>} Inserted content ID.
 */
export async function content({
	id_domain,
	id_language,
	status,
	title,
	title_sub,
	synopsis,
	body,
	sql = sql_exec,
}) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"content: id_domain must be a positive number",
	);

	assert(
		typeof id_language === "number" && id_language > 0,
		"content: id_language must be a positive number",
	);

	assert(
		typeof status === "string" && status.trim().length > 0,
		"content: status must be a non-empty string",
	);

	assert(
		typeof title === "string" && title.trim().length > 0,
		"content: title must be a non-empty string",
	);

	assert(
		typeof title_sub === "string" && title_sub.trim().length > 0,
		"content: title_sub must be a non-empty string",
	);

	assert(
		typeof synopsis === "string" && synopsis.trim().length > 0,
		"content: synopsis must be a non-empty string",
	);

	assert(
		typeof body === "string" && body.trim().length > 0,
		"content: body must be a non-empty string",
	);

	const requests = 0;

	const [row] = await sql`
		INSERT INTO content (
			id_domain,
			id_language,
			date,
			status,
			title,
			title_sub,
			synopsis,
			body,
			requests
		) VALUES (
			${id_domain},
			${id_language},
			CURRENT_TIMESTAMP,
			${status},
			${title},
			${title_sub},
			${synopsis},
			${body},
			${requests}
		)
		RETURNING id
	`;

	assert(row, "insert_content: failed to insert content into database");

	return row.id;
}

/**
 * @param {ContentLinkInput & SQLObject} content_link Content link information to insert.
 * @returns {Promise<number>} Inserted content link ID.
 */
export async function content_link({
	id_content_from,
	id_content_to,
	sql = sql_exec,
}) {
	assert(
		typeof id_content_from === "number" && id_content_from > 0,
		"content_link: id_content_from must be a positive number",
	);

	assert(
		typeof id_content_to === "number" && id_content_to > 0,
		"content_link: id_content_to must be a positive number",
	);

	const [row] = await sql`
		INSERT INTO content_link (
			id_content_from,
			id_content_to
		) VALUES (
			${id_content_from},
			${id_content_to}
		)
		RETURNING id
	`;

	assert(row, "insert_content_link: failed to insert content link");

	return row.id;
}

/**
 * @param {GardenInput & SQLObject} garden Garden information to insert.
 * @returns {Promise<number>} Inserted garden ID.
 */
export async function garden({
	id_domain,
	id_asset,
	id_author,
	sql = sql_exec,
}) {
	assert(
		typeof id_domain === "number" && id_domain > 0,
		"garden: id_domain must be a positive number",
	);

	assert(
		typeof id_asset === "number" && id_asset > 0,
		"garden: id_asset must be a positive number",
	);

	assert(
		typeof id_author === "number" && id_author > 0,
		"garden: id_author must be a positive number",
	);

	const [row] = await sql`
		INSERT INTO garden (
			id_domain,
			id_asset,
			id_author
		) VALUES (
			${id_domain},
			${id_asset},
			${id_author}
		)
		RETURNING id
	`;

	assert(row, "insert_garden: failed to insert garden");

	return row.id;
}

/**
 * @param {GardenInformationInput & SQLObject} garden_information Garden information to insert.
 * @returns {Promise<number>} Inserted garden information ID.
 */
export async function garden_information({
	id_language,
	name,
	description,
	sql = sql_exec,
}) {
	assert(
		typeof id_language === "number" && id_language > 0,
		"garden_information: id_language must be a positive number",
	);

	assert(
		typeof name === "string" && name.trim().length > 0,
		"garden_information: name must be a non-empty string",
	);

	assert(
		typeof description === "string" && description.trim().length > 0,
		"garden_information: description must be a non-empty string",
	);

	const [row] = await sql`
		INSERT INTO garden_information (
			id_language,
			name,
			description
		) VALUES (
			${id_language},
			${name},
			${description}
		)
		RETURNING id
	`;

	assert(row, "insert_garden_information: failed to insert garden information");

	return row.id;
}

/**
 * @param {AuthorInput & SQLObject & {password: string}} author Author information to insert.
 * @returns {Promise<number>} Inserted author ID.
 */
export async function author({
	id_asset,
	email,
	name,
	password,
	sql = sql_exec,
}) {
	assert(
		typeof id_asset === "number" && id_asset > 0,
		"author: id_asset must be a positive number",
	);

	assert(
		typeof email === "string" && email.trim().length > 0,
		"author: email must be a non-empty string",
	);

	assert(
		typeof name === "string" && name.trim().length > 0,
		"author: name must be a non-empty string",
	);

	assert(
		typeof password === "string" && password.trim().length > 0,
		"author: password must be a non-empty string",
	);

	const pages = 0;
	const contents = 0;

	const hashed_password = await Bun.password.hash(password);

	const [row] = await sql`
		INSERT INTO author (
			id_asset,
			email,
			name,
			password,
			pages,
			contents
		) VALUES (
			${id_asset},
			${email},
			${name},
			${hashed_password},
			${pages},
			${contents}
		)
		RETURNING id
	`;

	assert(row, "insert_author: failed to insert author into database");

	return row.id;
}

/**
 * @param {AuthorConnectionCredentials & AuthorConnectionInput & SQLObject} author_connection Author connection information to insert.
 * @returns {Promise<string>} Inserted author connection token.
 */
export async function author_connection({
	email,
	password,
	device,
	sql = sql_exec,
}) {
	assert(
		typeof email === "string" && email.trim().length > 0,
		"author_connection: email must be a non-empty string",
	);

	assert(
		typeof password === "string" && password.trim().length > 0,
		"author_connection: password must be a non-empty string",
	);

	assert(
		typeof device === "string" && device.trim().length > 0,
		"author_connection: device must be a non-empty string",
	);

	/**
	 * @type {{id: number, email: string, password: string}}
	 */
	const author_row = {
		// @ts-expect-error
		id: null,
		// @ts-expect-error
		password: null,
	};

	try {
		const [row] = await sql`
			SELECT id, password
			FROM author
			WHERE email = ${email}
		`;

		assert(row, `author_connection: no author found`);

		author_row.id = row.id;
		author_row.password = row.password;
	} catch (err) {
		warn(err);
	}

	const is_password_correct = await Bun.password.verify(
		password,
		// @note: timing attack mitigation: always verify password and generate token, even if author is not found
		author_row.password || await Bun.password.hash("invalid_password"),
	);

	assert(
		author_row.password,
		"author_connection: no author found with the provided email",
	);
	assert(is_password_correct, "author_connection: incorrect password");

	const token = await jwt.create({
		sub: String(author_row.id),
		device,
		claims: { email },
	});

	const [row] = await sql`
		INSERT INTO author_connection (
			id_author,
			device,
			token,
			logged_at,
			last_active_at
		) VALUES (
			${author_row.id},
			${device},
			${token},
			CURRENT_TIMESTAMP,
			CURRENT_TIMESTAMP
		)
		RETURNING id
	`;

	assert(
		row.id,
		"insert_author_connection: failed to insert author connection",
	);

	return token;
}

/**
 * @param {AuthorDomainInput & SQLObject} author_domain Author domain information to insert.
 * @returns {Promise<number>} Inserted author domain ID.
 */
export async function author_domain({ id_author, id_domain, sql = sql_exec }) {
	assert(
		typeof id_author === "number" && id_author > 0,
		"author_domain: id_author must be a positive number",
	);

	assert(
		typeof id_domain === "number" && id_domain > 0,
		"author_domain: id_domain must be a positive number",
	);

	const [row] = await sql`
		INSERT INTO author_domain (
			id_author,
			id_domain,
			granted_at
		) VALUES (
			${id_author},
			${id_domain},
			CURRENT_TIMESTAMP
		)
		RETURNING id
	`;

	assert(row, "insert_author_domain: failed to insert author domain");

	return row.id;
}

/**
 * @param {AuthorContentInput & SQLObject} author_content Author content information to insert.
 * @returns {Promise<number>} Inserted author content ID.
 */
export async function author_content({
	id_author,
	id_content,
	sql = sql_exec,
}) {
	assert(
		typeof id_author === "number" && id_author > 0,
		"author_content: id_author must be a positive number",
	);

	assert(
		typeof id_content === "number" && id_content > 0,
		"author_content: id_content must be a positive number",
	);

	const [row] = await sql`
		INSERT INTO author_content (
			id_author,
			id_content,
			granted_at
		) VALUES (
			${id_author},
			${id_content},
			CURRENT_TIMESTAMP
		)
		RETURNING id
	`;

	assert(row, "insert_author_content: failed to insert author content");

	return row.id;
}

export const insert = {
	asset,
	domain,
	language,
	language_information,
	asset_information,
	tag,
	tag_requirement,
	tag_information,
	domain_tag,
	content,
	content_link,
	garden,
	garden_information,
	author,
	author_connection,
	author_domain,
	author_content,
	module: insert_module,
};

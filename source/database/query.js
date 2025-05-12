import { sql } from "bun";

/**
 * Insert/update new tag information into the database and returns 
 * @param {Object} information - Information of the tag to be documented.
 * @param {string} information.id_tag - ID of the tag that is being documented.
 * @param {string} information.id_language - ID of the language that the information is in.
 * @param {string} information.name - Name of the tag being documented.
 * @param {string} information.description - Description of the tag being documented.
 * @returns {Promise<void>} Resolves when the tag information is inserted.
 */
export async function insert_tag_information({id_tag, id_language, name, description}) {
	await sql`
		INSERT INTO tag_information (id_tag, id_language, name, description)
			VALUES (${id_tag}, ${id_language}, ${name}, ${description})
			ON CONFLICT (id_tag, id_language) DO UPDATE
			SET name = ${name}, description = ${description}
			WHERE tag_information.id_tag = ${id_tag} AND tag_information.id_language = ${id_language}
		;
	`;
}

/**
 * Inserts a new tag into the database.
 * @param {string} id_asset - The ID of the asset to be inserted.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted tag.
 */
export async function insert_tag(id_asset) {
	await sql`
		INSERT INTO tag (id_asset)
			VALUES (${id_asset})
		RETURNING id;
	`;
}

/**
 * Creates a line in the ASSET table and returns the ID.
 * @param {string} path - The path of the aasset to be inserted (from repository root).
 * @returns {Promise<string>} A promise that resolves with the ID of the asset.
 */
export async function insert_asset(path) {
	await sql`
		INSERT INTO asset (path)
			VALUES (${path})
		RETURNING id;
	`;
}

/**
 * Insert information about an asset into the database.
 * @param {Object} information - Information of the asset to be documented.
 * @param {string} information.id_asset - ID of the asset that is being documented.
 * @param {string} information.id_language - ID of the language that the information is in.
 * @param {string} information.name - Name of the asset being documented.
 * @param {string} information.description - Description of the asset being documented.
 * @returns {Promise<void>} Resolves when the asset information is inserted.
 */
export async function insert_asset_information({id_asset, id_language, name, description}) {
	await sql`
		INSERT INTO asset_information (id_asset, id_language, name, description)
			VALUES (${id_asset}, ${id_language}, ${name}, ${description});
	`;
}

/**
 * Creates a language in the ISO 639-1 format in the database.
 * @param {Object} information - Information of the language to be inserted.
 * @param {string} information.language - The language to be inserted.
 * @param {string} information.id_asset - ID of the asset that the language is associated with.
 * @returns {Promise<void>} A promise that resolves when the language is inserted.
 */
export async function insert_language({language, id_asset}) {
	await sql`
		INSERT INTO language (id, id_asset)
			VALUES (${language}, ${id_asset});
	`;
}

/**
 * Insert information about a language into the database.
 * @param {Object} information - Information of the language to be documented.
 * @param {string} information.id_for - ID of the language that is being documented.
 * @param {string} information.id_from - ID of the language that the information is in.
 * @param {string} information.name - Name of the langauge being documented.
 * @param {string} information.description - Description of the language being documented.
 * @returns {Promise<void>} Resolves when the language information is inserted.
 */
export async function insert_language_information({id_for, id_from, name, description}) {
	await sql`
		INSERT INTO language_information (id_for, id_from, name, description)
			VALUES (${id_for}, ${id_from}, ${name}, ${description});
	`;
}

/**
 * Delete the database.
 * @returns {Promise<void>} A promise that resolves when the database is deleted.
 */
export async function delete_database() {
	await sql.unsafe(/* sql */`
		-- Close all connections and reset the database to the initial state.
		ROLLBACK;
			
		SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'rpg' AND pid <> pg_backend_pid();
			
		DROP SCHEMA public CASCADE;
		CREATE SCHEMA public;
		SET search_path TO public;
			
		GRANT ALL ON SCHEMA public TO public;
		GRANT ALL ON SCHEMA public TO postgres;
	`);
}

/**
 * Get the list of all tables in the database.
 * @returns {Promise<Array<string>>} A promise that lazy-resolves with the list of table names in the database.
 */
export async function get_tables() {
	return await sql.unsafe(/* sql */`
		SELECT table_name FROM information_schema.tables WHERE table_schema='public';
	`)
}

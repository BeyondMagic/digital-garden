import { sql } from "bun";

/**
 * Creates a language in the ISO 639-1 format in the database.
 * @param {string} language - The language to be inserted.
 * @returns {Promise<void>} A promise that resolves when the language is inserted.
 */
export async function insert_language(language) {
	await sql`
		INSERT INTO language (id)
			VALUES (${language});
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
import { sql } from "bun";

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
import { sql } from "bun";

/**
 * Close all connections and reset the database to the initial state.
 * @returns {Promise<void>} A promise that resolves when the database is deleted.
 */
export async function database ()
{
	return await sql`
		ROLLBACK;
			
		SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'rpg' AND pid <> pg_backend_pid();
			
		DROP SCHEMA public CASCADE;
		CREATE SCHEMA public;
		SET search_path TO public;
			
		GRANT ALL ON SCHEMA public TO public;
		GRANT ALL ON SCHEMA public TO postgres;
	`;
}
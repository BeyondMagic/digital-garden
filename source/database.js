import { sql } from "bun";
import { debug } from "./util";

/**
 * Get the list of all tables in the database.
 * @returns {Array<string>} A list of table names in the database.
 */
function get_tables() {
	return sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
}

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
export async function init () {
	const tables = get_tables();

	if (tables.length)
	{
		debug("Database already initialised.");
		return;
	}

}
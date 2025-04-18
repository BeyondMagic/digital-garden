import { sql } from "bun";
import { debug } from "@/util";
import sql_files from "@/database/sql_files";

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
export async function init () {

	if ((await get_tables()).length)
	{
		debug("Database already initialised.");
		return;
	}

	debug("Initialising database...");

	for (const [name, content] of sql_files)
	{
		debug(`Executing SQL file: ${name}.`);
		await sql.unsafe(content);
	}

}
import { sql } from "bun";
import { debug } from "@/util";
import sql_files from "@/database/sql_files";

/**
 * 
 * @param {Promise<void>}
 */
export async function populate () {

	await query.insert_language("en-gb");
	await query.insert_language_information({
		id_for: "en-gb",
		id_from: "en-gb",
		name: "English (British)",
		description: "The British variant of the English language.",
	});

}

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
export async function init () {

	if ((await query.get_tables()).length)
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
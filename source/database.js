import { sql } from "bun";
import { debug } from "@/util";
import * as query from "@/database/query";
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
	await query.insert_assert("./assets/Flag_of_the_United_Kingdom.svg");
	await query.insert_asset_information({
		id_asset: 1,
		id_language: "en-gb",
		name: "Flag of the United Kingdom",
		description: "The flag of the United Kingdom in SVG format.",
	});

	const id_asset_seedling = await query.insert_asset("./assets/tags/seedling.svg");
	const id_tag_seedling = await query.insert_tag(id_asset_seedling);

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

	populate();
}

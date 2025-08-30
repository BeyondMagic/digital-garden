import { sql } from "bun";
import tables from "@/database/query/create/tables";

import { create_debug, create_info } from "@/logger";
const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

/**
 * Test if the table was created correctly with the correct name and return true if it was.
 * @returns {Promise<boolean>} Returns true if the table was created successfully, false otherwise.
 **/
async function asset() {
	await tables.asset();
	const result = await sql`SELECT * FROM information_schema.tables WHERE table_name = 'asset'`;
	info(result);

	return result.length > 0;
}

export default {
	asset,
}
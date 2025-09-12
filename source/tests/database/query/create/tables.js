import { sql } from "bun";
import { assert } from "@/logger";

import types from "@/database/query/create/types";
import tables from "@/database/query/create/tables";


/**
 * Test if the table "domain" was created correctly with the correct name.
 */
async function domain ()
{
	await types.status();
	await types.domain();
	await tables.domain();
	const result = await sql`SELECT * FROM information_schema.tables WHERE table_name = 'domain'`;
	assert(result.length === 1);
}

/**
 * Test if the table "asset" was created correctly with the correct name.
 **/
async function asset ()
{
	await domain();
	await tables.asset();
	const result = await sql`SELECT * FROM information_schema.tables WHERE table_name = 'asset'`;
	assert(result.length === 1);
}

export default {
	domain,
	asset,
}
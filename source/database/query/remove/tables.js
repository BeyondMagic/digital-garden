import { sql } from "bun";

/**
 * Delete the domain table.
 **/
async function domain ()
{
	await sql`
        DROP TABLE IF EXISTS domain;
	`;
}

/**
 * Delete the asset table.
 */
async function asset ()
{
	await sql`
		DROP TABLE IF EXISTS asset;
	`;
}

export default {
	domain,
	asset,
}
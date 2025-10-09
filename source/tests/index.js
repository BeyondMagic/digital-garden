import { sql } from "bun";

/**
 * @param {string} name Name of the table to check.
 * @param {'table'|'view'|'status'} [type='table'] Type of the object to check.
 * @returns {Promise<boolean>} True if the table exists, false otherwise.
 */
async function exists(name, type = 'table') {
	const queries = {
		table: sql`SELECT * FROM pg_tables WHERE tablename = ${name}`,
		view: sql`SELECT * FROM pg_views WHERE viewname = ${name}`,
		status: sql`SELECT * FROM pg_stat_all_tables WHERE relname = ${name}`
	};
	const result = await queries[type];
	return result.length > 0;
}

export default {
	database,
};

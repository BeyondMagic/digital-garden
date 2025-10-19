import { sql } from "bun";

/**
 * Check if a database object exists.
 * @param {string} name Name of the object to check.
 * @param {'table'|'view'|'type'|'schema'} [type='table'] Type of the object to check.
 * @returns {Promise<boolean>} True if the object exists, false otherwise.
 */
export async function exists(name, type = "table") {
	const queries = {
		table: () => sql`SELECT * FROM pg_tables WHERE tablename = ${name}`,
		view: () => sql`SELECT * FROM pg_views WHERE viewname = ${name}`,
		type: () => sql`SELECT * FROM pg_type WHERE typname = ${name}`,
		schema: () => sql`SELECT * FROM pg_namespace WHERE nspname = ${name}`,
	};
	const result = await queries[type]();
	return result.length > 0;
}

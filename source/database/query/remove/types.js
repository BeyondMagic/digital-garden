import { sql } from "bun";

/**
 * Delete the domain type.
 * @returns {Promise<void>} A promise that resolves when the type is deleted.
 **/
async function domain ()
{
	await sql`
        DROP TYPE IF EXISTS TYPE_DOMAIN;
	`;
}

/**
 * Delete the status type.
 * @returns {Promise<void>} A promise that resolves when the type is deleted.
 **/
async function status ()
{
	await sql`
        DROP TYPE IF EXISTS TYPE_STATUS;
	`;
}

export default {
	domain,
	status,
}
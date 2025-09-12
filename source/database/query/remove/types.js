import { sql } from "bun";

/**
 * Delete the domain type.
 **/
async function domain ()
{
	await sql`
        DROP TYPE IF EXISTS type_domain;
	`;
}

/**
 * Delete the status type.
 **/
async function status ()
{
	await sql`
        DROP TYPE IF EXISTS type_status;
	`;
}

export default {
	domain,
	status,
}
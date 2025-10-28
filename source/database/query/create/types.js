import { sql } from "bun";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

/**
 * Create the domain type.
 * - TYPE_DOMAIN: The type of domain.
 * @returns {Promise<void>} A promise that resolves when the types are created.
 **/
async function domain() {
	await sql`
		CREATE TYPE TYPE_DOMAIN AS ENUM ('ROUTER', 'SUBDOMAIN');
	`;
}

domain.test = async () => {
	assert(await exists('type_domain', 'type'), 'Type "domain" was not created successfully.');
}

/**
 * Create the status type.
 * - TYPE_STATUS: The status of the domain/content.
 * @returns {Promise<void>} A promise that resolves when the types are created.
 */
async function status() {
	await sql`
		CREATE TYPE TYPE_STATUS AS ENUM ('PUBLIC', 'PRIVATE', 'ARCHIVED', 'DELETED');
	`;
}

status.test = async () => {
	assert(await exists('type_status', 'type'), 'Type "status" was not created successfully.');
}

export const types = {
	domain,
	status,
}
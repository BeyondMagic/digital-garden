import { sql } from "bun";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

/**
 * Delete the domain type.
 **/
async function domain() {
	await sql`
        DROP TYPE IF EXISTS type_domain;
	`;
}

domain.test = async function () {
	assert(!(await exists('domain', 'type')), 'Type "domain" was not removed successfully.');
};

/**
 * Delete the status type.
 **/
async function status() {
	await sql`
        DROP TYPE IF EXISTS type_status;
	`;
}

status.test = async function () {
	assert(!(await exists('status', 'type')), 'Type "status" was not removed successfully.');
}

export const types = {
	domain,
	status,
}
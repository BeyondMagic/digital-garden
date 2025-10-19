import { sql } from "bun";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

/**
 * Delete the domain table.
 **/
async function domain() {
	await sql`
        DROP TABLE IF EXISTS domain;
	`;
}

domain.test = async function () {
	assert(!(await exists('domain', 'table')), 'Table "domain" was not removed successfully.');
}

/**
 * Delete the asset table.
 */
async function asset() {
	await sql`
		DROP TABLE IF EXISTS asset;
	`;
}

asset.test = async function () {
	assert(!(await exists('asset', 'table')), 'Table "asset" was not removed successfully.');
}


export const tables = {
	domain,
	asset,
}
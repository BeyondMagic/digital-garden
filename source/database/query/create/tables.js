import { sql } from "bun";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

/**
 * Create the domain table.
 * - id: The unique identifier for the domain.
 * - id_domain_parent: The parent domain (if any).
 * - id_domain_redirect: The domain to redirect to (if any).
 * - type: The type of the domain.
 * - name: The name of the domain.
 * - status: The status of the domain.
 **/
async function domain() {
	await sql`
		CREATE OR REPLACE TABLE domain (
			id SERIAL PRIMARY KEY,
			id_domain_parent INTEGER REFERENCES domain(id),
			id_domain_redirect INTEGER REFERENCES domain(id),
			type TYPE_DOMAIN NOT NULL,
			name VARCHAR(100) NOT NULL,
			status TYPE_STATUS NOT NULL,
			UNIQUE(name, type, id_domain_parent)
		);
	`;
}

domain.test = async function () {
	assert(await exists('domain', 'table'), 'Table "domain" was not created successfully.');
}

/**
 * Assets are filesfiles such as images, scripts, videos.
 * For example, every language has an image that represents it.
 * - id: The unique identifier for the asset.
 * - id_domain: The domain that the asset belongs to.
 * - name: The name of the asset (4096 is the maximum length of a name in Linux).
 * - extension: The extension of the URL (e.g. .png, .jpg, .js, etc.).
 **/
async function asset() {
	await sql`
		CREATE OR REPLACE TABLE asset (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			name VARCHAR(4096) NOT NULL,
			extension VARCHAR(100),
			UNIQUE(id_domain, name)
		);
	`;
}

asset.test = async function () {
	assert(await exists('asset', 'table'), 'Table "asset" was not created successfully.');
}

export const tables = {
	domain,
	asset,
}
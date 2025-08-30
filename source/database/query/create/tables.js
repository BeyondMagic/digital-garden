import { sql } from "bun";

/**
 * Create the domain table.
 * - id: The unique identifier for the domain.
 * - id_domain_parent: The parent domain (if any).
 * - id_domain_redirect: The domain to redirect to (if any).
 * - type: The type of the domain.
 * - name: The name of the domain.
 * - status: The status of the domain.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 **/
async function domain ()
{
	await sql`
		CREATE TABLE domain (
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

/**
 * Assets are files such as images, scripts, videos.
 * For example, every language has an image that represents it.
 * - id_domain: The domain that the asset belongs to.
 * - name: The name of the asset (4096 is the maximum length of a name in Linux).
 * - extension: The extension of the URL (e.g. .png, .jpg, .js, etc.).
 * TO-DO: - times: How many times the asset has been used.
 * @returns {Promise<void>} A promise that resolves when the table is created.
 **/
async function asset ()
{
	await sql`
		CREATE TABLE asset (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			name VARCHAR(4096) NOT NULL,
			extension VARCHAR(100),
			UNIQUE(id_domain, name)
		);
	`;
}

export default {
	asset,
}
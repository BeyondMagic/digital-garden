import { sql } from "bun";

/**
 * @typedef {import("@/database/types").Domain} Domain
 * @typedef {import("@/database/types").Asset} Asset
 **/

/**
 * Get the list of all tables in the database.
 * @returns {Promise<Array<string>>} A promise that lazy-resolves with the list of table names in the database.
 */
async function tables ()
{
	return await sql`
		SELECT table_name FROM information_schema.tables WHERE table_schema='public';
	`;
}

/**
 * Select an asset from the database that matches the given information.
 * @param {Object} information - Information of the asset to be selected.
 * @param {string} information.id_domain - ID of the domain that the asset is associated with.
 * @param {string} information.path - The path of the asset to be selected (from repository root).
 * @returns {Promise<Array<Asset>>} - A promise that resolves with the selected assets.
 */
async function asset ({id_domain, path})
{
	return await sql`
        SELECT
			asset.*
        FROM
			asset
        WHERE
			asset.path = ${path}
        AND
            asset.id_domain = ${id_domain}
    `;
}

/**
 * Select all assets from the database that belong to a specific domain.
 * @param {string} id_domain - The ID of the domain to be selected.
 * @returns {Promise<Array<{id: string, id_domain: string, path: string, times: string, extension: string}>>} A promise that resolves with the selected assets.
 */
async function assets (id_domain)
{
	return await sql`
		SELECT
			*
		FROM
			asset
		WHERE
			id_domain = ${id_domain};
		
	`.values();
}

export default {
	tables,
	asset,
	assets,
};
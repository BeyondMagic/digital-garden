import { mkdir } from "node:fs/promises";
import { sql } from "bun";
import util, { debug } from "@/util";
import query from "./query";

/**
 * @typedef {import("@/database/types").Domain} Domain
 * @typedef {import("@/database/types").Asset} Asset
 * @typedef {import("@/database/types").SelectedDomains} SelectedDomains
 **/

/**
 * Upload a binary or text asset under `./assets/...`
 * @param {Object} options - Options for uploading the asset.
 * @param {Array<Domain>} options.domains – List of domain to get names and IDs, e.g. ["graph","contact"]
 * @param {Buffer|Uint8Array|string} options.data – File contents (Buffer/Uint8Array for binary, string for text)
 * @param {string} options.name – The filename, e.g. "instagram.svg"
 * @returns {Promise<{path: string, id: string}>} - The full file path where it was saved and the ID of the asset in the database.
 * @throws {Error} If no domains are provided or if the upload fails.
 */
async function upload_asset ({ domains, data, name })
{
	debug(`[wrapper] Starting asset upload: ${name}`);
	debug(`[wrapper] Target domains:`, domains.map(d => d.name));
	
	const domain_last = domains[domains.length - 1];

	if (domains.length == 0 || !domain_last)
		throw new Error("Must have at least one domain to upload an asset.");

	const domain_names = domains.map(d => d.name).join('/');
	debug(`[wrapper] Domain path: ${domain_names}`);

	const id_asset = await query.insert.asset({
		id_domain: domain_last.id,
		name,
	})
	debug(`[wrapper] Created asset in database with ID: ${id_asset}`);

	const dir = util.cdn + domain_names;
	debug(`[wrapper] Creating directory: ${dir}`);

	await mkdir(dir, { recursive: true });

	const target = dir + '/' + name;
	debug(`[wrapper] Writing file to: ${target}`);

	await Bun.write(target, data);
	debug(`[wrapper] Asset upload completed successfully`);

	return {
		path: target,
		id: id_asset
	};
}

/**
 * 
 * @param {*} id_asset 
 */
async function delete_asset (id_asset)
{
	debug(`[wrapper] Starting asset deletion for ID: ${id_asset}`);
	
	/**
	 * @type {Array<Asset>}
	 */
	const [asset] = await sql`
		SELECT
			*
		FROM
			asset
		WHERE
			id = ${id_asset}
	`;

	if (!asset) {
		debug(`[wrapper] Asset with ID ${id_asset} not found`);
		throw new Error(`Asset with id ${id_asset} not found`);
	}

	debug(`[wrapper] Found asset:`, asset);

	// Construct the full path to the asset starting from the domain of the asset.

	/**
	 * @type {string | null}
	 */
	let parent_id = asset.id_domain;
	debug(`[wrapper] Building domain hierarchy from parent ID: ${parent_id}`);

	/**
	 * @type {Array<Domain>}
	 */
	const domains = [];
	while (parent_id)
	{
		debug(`[wrapper] Looking up domain with ID: ${parent_id}`);
		/**
		 * @type {Array<Domain>}
		 */
		const [domain] = await sql`
				SELECT
					*
				FROM
					domain
				WHERE
					id = ${parent_id}
			`;

		if (!domain) {
			debug(`[wrapper] Domain with ID ${parent_id} not found`);
			throw new Error(`Domain with id ${parent_id} not found`);
		}

		debug(`[wrapper] Found domain:`, domain);
		domains.push(domain);

		parent_id = domain.id_domain_parent;
	}

	debug(`[wrapper] Complete domain hierarchy:`, domains);
}

/**
* Select recursively all domains from the database that match the given URL.
* @example
* // Let's say you have the following domains in the database:
* // domain.com -> subdomain1 -> subdomain2 -> router1 -> router2
* select_domains("subdomain2.subdomain1.domain.com/router1/router2") // Returns domains: "domain.com", "subdomain1", "subdomain2", "router1", "router2"
* @param {string} url - The URL to be selected.
* @returns {Promise<SelectedDomains>} A promise that resolves with the selected domains.
**/
async function process_domain_hierarchy (url)
{
	debug(`[wrapper] Processing domain hierarchy for URL: "${url}"`);
	
	/**
	 * @type {Array<Domain>}
	 */
	const [root] = await sql`
			SELECT
				domain.*
			FROM
				garden
			INNER JOIN
				domain
			ON
				domain.id = garden.id_domain
		`;

	if (!root) {
		debug(`[wrapper] No root domain found in database`);
		throw new Error("No root domain found");
	}

	debug(`[wrapper] Found root domain:`, root);

	const [subdomains = "", routers = ""] = url.split(root.name);
	debug(`[wrapper] URL split: subdomains="${subdomains}", routers="${routers}"`);

	const components = [
		/**
		 * We reverse the subdomains because the start point is the root domain:
		 * sub2 <- sub1 <- root -> router1 -> router2
		 * Like a tree structure, where the root is the top node.
		 */
		...subdomains.split('.').filter(Boolean).reverse(),
		...routers.split('/').filter(Boolean)
	];
	debug(`[wrapper] URL components to process:`, components);

	let parent_id = root.id;

	/**
	 * @type {Array<Domain>}
	 */
	const domains = [];

	/**
	 * @type {Array<string>}
	 */
	let remain = [];

	/**
	 * @type {Asset | null}
	 */
	let asset = null;

	for (const component of components)
	{
		debug(`[wrapper] Processing component: "${component}" with parent_id: ${parent_id}`);
		
		/**
		 * @type {Array<Domain>}
		 */
		const [domain] = await sql`
				SELECT
					*
				FROM
					domain
				WHERE
					name = ${component}
				AND
					id_domain_parent = ${parent_id}
		`;

		if (!domain)
		{
			debug(`[wrapper] No domain found for component "${component}"`);
			remain = components.slice(domains.length);
			debug(`[wrapper] Remaining components:`, remain);

			/**
			 * It is only an asset if it is the last component in the URL.
			 **/
			if (remain.length == 1)
			{
				const asset_path = remain[0];
				debug(`[wrapper] Looking for asset with path: "${asset_path}" in domain: ${parent_id}`);
				/**
	 			* @type {Array<Asset>}
	 			**/
				[asset] = await sql`
					SELECT
						asset.*
					FROM
						asset
					WHERE
						asset.path = ${asset_path}
					AND
						asset.id_domain = ${parent_id}
				`;
				
				if (asset) {
					debug(`[wrapper] Found asset:`, asset);
					remain = [];
				} else {
					debug(`[wrapper] No asset found with path: "${asset_path}"`);
				}
			}
			break;
		}

		debug(`[wrapper] Found domain:`, domain);
		domains.push(domain);

		parent_id = domain.id;
	}

	const result = {
		domains: [
			root,
			...domains
		],
		asset: asset,
		remain
	};
	
	debug(`[wrapper] Final result:`, {
		domains: result.domains.map(d => d.name),
		asset: asset ? asset.path : null,
		remain
	});

	return result;
}

export default {
	process_domain_hierarchy,
	upload_asset
};
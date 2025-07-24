import { mkdir } from "node:fs/promises";
import { sql } from "bun";
import util from "@/util";
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
	const domain_last = domains[domains.length - 1];

	if (domains.length == 0 || !domain_last)
		throw new Error("Must have at least one domain to upload an asset.");

	const domain_names = domains.map(d => d.name).join('/');

	const id_asset = await query.insert.asset({
		id_domain: domain_last.id,
		name,
	})

	const dir = util.cdn + domain_names;

	await mkdir(dir, { recursive: true });

	const target = dir + '/' + name;

	await Bun.write(target, data);

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

	if (!asset)
		throw new Error(`Asset with id ${id_asset} not found`);

	// Construct the full path to the asset starting from the domain of the asset.

	/**
	 * @type {string | null}
	 */
	let parent_id = asset.id_domain;

	/**
	 * @type {Array<Domain>}
	 */
	const domains = [];
	while (parent_id)
	{
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

		if (!domain)
			throw new Error(`Domain with id ${parent_id} not found`);

		domains.push(domain);

		parent_id = domain.id_domain_parent;
	}

	console.log(domains);
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

	if (!root)
		throw new Error("No root domain found");

	const [subdomains = "", routers = ""] = url.split(root.name);

	const components = [
		/**
		 * We reverse the subdomains because the start point is the root domain:
		 * sub2 <- sub1 <- root -> router1 -> router2
		 * Like a tree structure, where the root is the top node.
		 */
		...subdomains.split('.').filter(Boolean).reverse(),
		...routers.split('/').filter(Boolean)
	];

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
			remain = components.slice(domains.length);

			/**
			 * It is only an asset if it is the last component in the URL.
			 **/
			if (remain.length == 1)
			{
				const asset_path = remain[0];
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
				remain = [];
			}
			break;
		}

		domains.push(domain);

		parent_id = domain.id;
	}

	return {
		domains: [
			root,
			...domains
		],
		asset: asset,
		remain
	};
}

export default {
	process_domain_hierarchy,
	upload_asset
};
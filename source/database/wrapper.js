import { sql } from "bun";

/**
 * @typedef {import("@/database/types").Domain} Domain
 * @typedef {import("@/database/types").Asset} Asset
 * @typedef {import("@/database/types").SelectedDomains} SelectedDomains
 **/

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
	process_domain_hierarchy
};
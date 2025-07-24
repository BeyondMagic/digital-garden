
import { domain, port, hash, debug } from "@/util";  
import query from "@/database/query";
import { sql } from "bun";

/**
 * Helper function to create assets that may have paths with slashes
 * @param {Object} params
 * @param {string} params.id_domain - Domain ID
 * @param {string} params.path - Full path of the asset (can contain slashes)
 * @returns {Promise<string>} Asset ID
 */
async function create_asset_with_path({ id_domain, path }) {
	const extension = path.includes(".") ? path.split(".").pop() : null;
	
	return await sql`
		INSERT INTO
			asset (id_domain, path, extension)
		VALUES
			(${id_domain}, ${path}, ${extension})
		RETURNING
			id;
	`.values();
}

/**
 * Populate the database with initial data.
 * @returns {Promise<void>} - A promise that resolves when the database is populated.
 */
async function populate() {
	// Destructure insert methods for cleaner code
	const {
		domain: create_domain,
		asset: create_asset,
		language: create_language,
		language_information: create_lang_info,
		asset_information: create_asset_info,
		tag: create_tag,
		tag_information: create_tag_info,
		tag_requirement: create_tag_req,
		content: create_content,
		garden: create_garden,
		garden_information: create_garden_info,
		domain_asset: link_domain_asset,
		author: create_author,
		author_garden: link_author_garden,
		author_domain: link_author_domain,
		author_content: link_author_content
	} = query.insert;

	// 1) Create root domain
	const root_domain_id = await create_domain({
		id_domain_parent: null,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: `${domain}:${port}`,
		status: "PUBLIC",
	});

	// 2) Create language with flag asset
	const gb_asset_id = await create_asset({
		id_domain: root_domain_id,
		name: "Flag_of_the_United_Kingdom.svg"
	});

	await create_language({ id: "en-gb", id_asset: gb_asset_id });
	await create_lang_info({
		id_for: "en-gb",
		id_from: "en-gb",
		name: "English (British)",
		description: "The British variant of the English language.",
	});
	await create_asset_info({
		id_asset: gb_asset_id,
		id_language: "en-gb",
		name: "Flag of the United Kingdom",
		description: "The flag of the United Kingdom in SVG format.",
	});

	// 3) Create tags with requirements chain
	const tags = [
		{ key: "seedling", name: "Seedling", desc: "New-born thoughts, not sorted out yet.", requires: [] },
		{ key: "sapling", name: "Sapling", desc: "Substantial amount of content, but much to be done, with emerging structure.", requires: ["seedling"] },
		{ key: "tree", name: "Tree", desc: "A tree of content, with a clear structure.", requires: ["sapling"] },
		{ key: "withered", name: "Withered", desc: "Outdated notes kept for historical context, with warnings where needed.", requires: [] },
		{ key: "signpost", name: "Signpost", desc: "A map to allow us to navigate easily to the content we need.", requires: [] }
	];

	/** @type {Record<string, string>} */
	const tag_ids = {};
	for (const tag of tags) {
		const asset_id = await create_asset_with_path({
			id_domain: root_domain_id,
			path: `tags/${tag.key}.svg`
		});
		const tag_id = await create_tag(asset_id);
		tag_ids[tag.key] = tag_id;

		await create_tag_info({
			id_tag: tag_id,
			id_language: "en-gb",
			name: tag.name,
			description: tag.desc,
		});

		// Create requirements
		for (const req_key of tag.requires) {
			const required_tag_id = tag_ids[req_key];
			if (!required_tag_id) {
				throw new Error(`Required tag '${req_key}' not found for tag '${tag.key}'`);
			}
			await create_tag_req({
				id_tag: required_tag_id,
				id_tag_for: tag_id,
			});
		}
	}

	// 4) Create root content
	const content_root_id = await create_content({
		id_domain: root_domain_id,
		id_language: "en-gb",
		date: new Date(),
		status: "PUBLIC",
		title: "Digital Garden",
		title_sub: "A digital garden of thoughts.",
		synopsis: "This is the root content.",
		body: "# Digital Garden\nDetailed information about the root content."
	});

	// 5) Create home assets
	const home_assets = ["favicon.svg", "home.css", "home.js"];
	/** @type {Record<string, string>} */
	const asset_ids = {};
	
	for (const asset_name of home_assets) {
		asset_ids[asset_name] = await create_asset({
			id_domain: root_domain_id,
			name: asset_name
		});
	}

	// 6) Create garden with favicon
	const favicon_asset_id = asset_ids["favicon.svg"];
	if (!favicon_asset_id) {
		throw new Error("Favicon asset not found");
	}
	
	const garden_id = await create_garden({
		id_domain: root_domain_id,
		id_asset: favicon_asset_id
	});

	await link_domain_asset({
		id_domain: root_domain_id,
		id_asset: favicon_asset_id,
	});
	await create_garden_info({
		id_garden: garden_id,
		id_language: "en-gb",
		name: "Digital Garden",
		description: "A digital garden of thoughts.",
	});

	// 7) Create root author
	const profile_asset_id = await create_asset({
		id_domain: root_domain_id,
		name: "profile.png"
	});
	
	const author_id = await create_author({
		id_asset: profile_asset_id,
		email: "root@root.com",
		name: "Root",
		password: await hash("root"),
	});

	await link_author_garden({ id_author: author_id, id_garden: garden_id });
	await link_author_domain({ id_author: author_id, id_domain: root_domain_id });
	await link_author_content({ id_author: author_id, id_content: content_root_id });

	// 8) Create additional domains
	await create_domain({
		id_domain_parent: root_domain_id,
		id_domain_redirect: null,
		type: "ROUTER",
		name: "contact",
		status: "PUBLIC",
	});

	const graph_domain_id = await create_domain({
		id_domain_parent: root_domain_id,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: "graph",
		status: "PUBLIC",
	});

	// 9) Create graph assets
	const graph_assets = ["graph/graph.css", "graph/graph.js"];
	for (const asset_path of graph_assets) {
		const asset_id = await create_asset_with_path({
			id_domain: graph_domain_id,
			path: asset_path
		});
		await link_domain_asset({
			id_domain: graph_domain_id,
			id_asset: asset_id,
		});
	}
}

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
async function init() {
	const current_tables = await query.select.tables();

	if (current_tables.length) {
		debug("Database already initialised.");
		return;
	}

	debug("Initialising database...");

	const { types, tables, functions } = query.create;

	// Create types first
	debug("Initializing types:");
	for (const create of Object.values(types)) {
		debug(`\ttypes.${create.name}`);
		await create();
	}

	// Create tables second
	debug("Initializing tables:");
	for (const create of Object.values(tables)) {
		debug(`\ttables.${create.name}`);
		await create();
	}

	// Create functions third
	debug("Initializing functions:");
	for (const create of Object.values(functions)) {
		debug(`\tfunctions.${create.name}`);
		await create();
	}

	// Finally populate with initial data
	debug("Populating database with initial data...");
	await populate();
}

export { domain, port, init };
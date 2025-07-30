
import { domain, port, hash, debug, root } from "@/util";  
import query from "@/database/query";
import { sql } from "bun";
import wrapper from "@/database/wrapper";
import { readFile } from "node:fs/promises";

/**
 * Helper function to create assets with actual file copying
 * @param {Object} params
 * @param {Array<import("@/database/types").Domain>} params.domains - Domain hierarchy for CDN path
 * @param {string} params.asset_path - Path to the asset in the assets folder
 * @param {string} params.name - Asset filename
 * @returns {Promise<string>} Asset ID
 */
async function create_and_upload_asset({ domains, asset_path, name }) {
	debug(`[setup] Reading asset file: ${asset_path}`);
	
	try {
		const file_data = await readFile(`${root}/assets/${asset_path}`);
		debug(`[setup] File read successfully: ${file_data.length} bytes`);
		
		const result = await wrapper.upload_asset({
			domains,
			data: file_data,
			name
		});
		
		debug(`[setup] Asset uploaded to CDN: ${result.path}`);
		return result.id;
	} catch (error) {
		debug(`[setup] ERROR reading/uploading asset ${asset_path}:`, error);
		throw error;
	}
}

/**
 * Populate the database with initial data.
 * @returns {Promise<void>} - A promise that resolves when the database is populated.
 */
async function populate() {
	debug("[setup] Starting database population...");
	debug(`[setup] Assets source folder: ${root}/assets/`);
	debug(`[setup] CDN target folder: ${process.env.CDN}`);
	
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
	debug("[setup] Creating root domain...");
	const root_domain_id = await create_domain({
		id_domain_parent: null,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: `${domain}:${port}`,
		status: "PUBLIC",
	});
	debug(`[setup] Root domain created with ID: ${root_domain_id}`);

	// 2) Create language with flag asset
	debug("[setup] Creating language assets...");
	
	// Create a proper domain object for the upload function
	/** @type {import("@/database/types").Domain} */
	const root_domain = {
		id: root_domain_id,
		id_domain_parent: null,
		id_domain_redirect: null, 
		type: "SUBDOMAIN",
		name: `${domain}:${port}`,
		status: "PUBLIC"
	};
	
	const gb_asset_id = await create_and_upload_asset({
		domains: [root_domain],
		asset_path: "Flag_of_the_United_Kingdom.svg",
		name: "Flag_of_the_United_Kingdom.svg"
	});
	debug(`[setup] GB flag asset created with ID: ${gb_asset_id}`);

	await create_language({ id: "en-gb", id_asset: gb_asset_id });
	debug("[setup] English language created");
	
	await create_lang_info({
		id_for: "en-gb",
		id_from: "en-gb",
		name: "English (British)",
		description: "The British variant of the English language.",
	});
	debug("[setup] Language information created");
	
	await create_asset_info({
		id_asset: gb_asset_id,
		id_language: "en-gb",
		name: "Flag of the United Kingdom",
		description: "The flag of the United Kingdom in SVG format.",
	});
	debug("[setup] Asset information created");

	// 3) Create tags with requirements chain
	debug("[setup] Creating tags system...");
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
		debug(`[setup] Creating tag: ${tag.name}`);
		const asset_id = await create_and_upload_asset({
			domains: [root_domain],
			asset_path: `tags/${tag.key}.svg`,
			name: `${tag.key}.svg`
		});
		const tag_id = await create_tag(asset_id);
		tag_ids[tag.key] = tag_id;
		debug(`[setup] Tag "${tag.name}" created with ID: ${tag_id}`);

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
			debug(`[setup] Creating requirement: ${tag.name} requires ${req_key}`);
			await create_tag_req({
				id_tag: required_tag_id,
				id_tag_for: tag_id,
			});
		}
	}
	debug("[setup] Tags system created successfully");

	// 4) Create root content
	debug("[setup] Creating root content...");
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
	debug(`[setup] Root content created with ID: ${content_root_id}`);

	// 5) Create home assets
	debug("[setup] Creating home assets...");
	const home_assets = ["favicon.svg", "home.css", "home.js"];
	/** @type {Record<string, string>} */
	const asset_ids = {};
	
	for (const asset_name of home_assets) {
		// Check if asset exists in assets folder, if not create database entry only
		try {
			asset_ids[asset_name] = await create_and_upload_asset({
				domains: [root_domain],
				asset_path: asset_name,
				name: asset_name
			});
			debug(`[setup] Home asset "${asset_name}" uploaded with ID: ${asset_ids[asset_name]}`);
		} catch (error) {
			// If file doesn't exist in assets folder, create database entry only
			debug(`[setup] Asset "${asset_name}" not found in assets folder, creating database entry only`);
			asset_ids[asset_name] = await create_asset({
				id_domain: root_domain_id,
				name: asset_name
			});
			debug(`[setup] Home asset "${asset_name}" created with ID: ${asset_ids[asset_name]}`);
		}
	}

	// 6) Create garden with favicon
	debug("[setup] Creating garden...");
	const favicon_asset_id = asset_ids["favicon.svg"];
	if (!favicon_asset_id) {
		throw new Error("Favicon asset not found");
	}
	
	const garden_id = await create_garden({
		id_domain: root_domain_id,
		id_asset: favicon_asset_id
	});
	debug(`[setup] Garden created with ID: ${garden_id}`);

	await link_domain_asset({
		id_domain: root_domain_id,
		id_asset: favicon_asset_id,
	});
	debug("[setup] Favicon linked to domain");
	
	await create_garden_info({
		id_garden: garden_id,
		id_language: "en-gb",
		name: "Digital Garden",
		description: "A digital garden of thoughts.",
	});
	debug("[setup] Garden information created");

	// 7) Create root author
	debug("[setup] Creating root author...");
	const profile_asset_id = await create_and_upload_asset({
		domains: [root_domain],
		asset_path: "profile.png",
		name: "profile.png"
	});
	debug(`[setup] Profile asset created with ID: ${profile_asset_id}`);
	
	const author_id = await create_author({
		id_asset: profile_asset_id,
		email: "root@root.com",
		name: "Root",
		password: await hash("root"),
	});
	debug(`[setup] Root author created with ID: ${author_id}`);

	await link_author_garden({ id_author: author_id, id_garden: garden_id });
	await link_author_domain({ id_author: author_id, id_domain: root_domain_id });
	await link_author_content({ id_author: author_id, id_content: content_root_id });
	debug("[setup] Author relationships created");

	// 8) Create additional domains
	debug("[setup] Creating additional domains...");
	const contact_domain_id = await create_domain({
		id_domain_parent: root_domain_id,
		id_domain_redirect: null,
		type: "ROUTER",
		name: "contact",
		status: "PUBLIC",
	});
	debug(`[setup] Contact domain created with ID: ${contact_domain_id}`);

	const graph_domain_id = await create_domain({
		id_domain_parent: root_domain_id,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: "graph",
		status: "PUBLIC",
	});
	debug(`[setup] Graph domain created with ID: ${graph_domain_id}`);

	// 9) Create graph assets
	debug("[setup] Creating graph assets...");
	
	// Create graph domain object
	/** @type {import("@/database/types").Domain} */
	const graph_domain = {
		id: graph_domain_id,
		id_domain_parent: root_domain_id,
		id_domain_redirect: null,
		type: "SUBDOMAIN", 
		name: "graph",
		status: "PUBLIC"
	};
	
	const graph_assets = [
		{ asset_path: "graph/graph.css", name: "graph.css" },
		{ asset_path: "graph/graph.js", name: "graph.js" }
	];
	
	for (const { asset_path, name } of graph_assets) {
		const asset_id = await create_and_upload_asset({
			domains: [root_domain, graph_domain],
			asset_path: asset_path,
			name: name
		});
		debug(`[setup] Graph asset "${asset_path}" created with ID: ${asset_id}`);
		
		await link_domain_asset({
			id_domain: graph_domain_id,
			id_asset: asset_id,
		});
		debug(`[setup] Graph asset "${asset_path}" linked to domain`);
	}
	
	debug("[setup] Database population completed successfully!");
}

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
async function init() {
	debug("[setup] Starting database initialization...");
	
	const current_tables = await query.select.tables();
	debug(`[setup] Found ${current_tables.length} existing tables`);

	if (current_tables.length) {
		debug("[setup] Database already initialized, skipping setup");
		return;
	}

	debug("[setup] Empty database detected, initializing...");

	const { types, tables, functions } = query.create;

	// Create types first
	debug("[setup] Creating database types...");
	for (const create of Object.values(types)) {
		debug(`[setup] Creating type: ${create.name}`);
		await create();
	}
	debug("[setup] All types created successfully");

	// Create tables second
	debug("[setup] Creating database tables...");
	for (const create of Object.values(tables)) {
		debug(`[setup] Creating table: ${create.name}`);
		await create();
	}
	debug("[setup] All tables created successfully");

	// Create functions third
	debug("[setup] Creating database functions...");
	for (const create of Object.values(functions)) {
		debug(`[setup] Creating function: ${create.name}`);
		await create();
	}
	debug("[setup] All functions created successfully");

	// Finally populate with initial data
	debug("[setup] Populating database with initial data...");
	await populate();
	debug("[setup] Database initialization completed successfully!");
}

export { domain, port, init };

import { hash, debug } from "@/util";
import query from "@/database/query";

const base = {
	domain: "localhost",
	port: "3001",
};
const domain_unparsed = process.env.DOMAIN || base.domain + ":" + base.port;
const [domain = base.domain, port = base.port] = domain_unparsed.split(":");

/**
 * Populate the database with initial data.
 * @returns {Promise<void>} - A promise that resolves when the database is populated.
 */
async function populate ()
{
	const id_root_domain = await query.insert.domain({
		id_domain_parent: null,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: domain_unparsed,
		status: "PUBLIC",
	});

	const id_asset_gb = await query.insert.asset({
		id_domain: id_root_domain,
		path: "Flag_of_the_United_Kingdom.svg"
	});

	await query.insert.language({
		id: "en-gb",
		id_asset: id_asset_gb,
	});

	await query.insert.language_information({
		id_for: "en-gb",
		id_from: "en-gb",
		name: "English (British)",
		description: "The British variant of the English language.",
	});

	await query.insert.asset_information({
		id_asset: id_asset_gb,
		id_language: "en-gb",
		name: "Flag of the United Kingdom",
		description: "The flag of the United Kingdom in SVG format.",
	});

	const id_asset_seedling = await query.insert.asset({
		id_domain: id_root_domain,
		path: "tags/seedling.svg"
	});
	const id_tag_seedling = await query.insert.tag(id_asset_seedling);
	await query.insert.tag_information({
		id_tag: id_tag_seedling,
		id_language: "en-gb",
		name: "Seedling",
		description: "New-born thoughts, not sorted out yet.",
	});

	const id_asset_sapling = await query.insert.asset({
		id_domain: id_root_domain,
		path: "tags/sapling.svg"
	});
	const id_tag_sapling = await query.insert.tag(id_asset_sapling);
	await query.insert.tag_information({
		id_tag: id_tag_sapling,
		id_language: "en-gb",
		name: "Sapling",
		description: "Substiantial amount of content, but much to be done, with emerging structure.",
	});
	await query.insert.tag_requirement({
		id_tag: id_tag_seedling,
		id_tag_for: id_tag_sapling,
	});

	const id_asset_tree = await query.insert.asset({
		id_domain: id_root_domain,
		path: "tags/tree.svg"
	});
	const id_tag_tree = await query.insert.tag(id_asset_tree);
	await query.insert.tag_information({
		id_tag: id_tag_tree,
		id_language: "en-gb",
		name: "Tree",
		description: "A tree of content, with a clear structure.",
	});
	await query.insert.tag_requirement({
		id_tag: id_tag_sapling,
		id_tag_for: id_tag_tree,
	});

	const id_asset_withered = await query.insert.asset({
		id_domain: id_root_domain,
		path: "tags/withered.svg"
	});
	const id_tag_withered = await query.insert.tag(id_asset_withered);
	await query.insert.tag_information({
		id_tag: id_tag_withered,
		id_language: "en-gb",
		name: "Withered",
		description: "Outdated notes kept for historical context, with warnings where needed."
    });

	const id_asset_signpost = await query.insert.asset({
		id_domain: id_root_domain,
		path: "tags/signpost.svg"
	});
	const id_tag_signpost = await query.insert.tag(id_asset_signpost);
	await query.insert.tag_information({
		id_tag: id_tag_signpost,
		id_language: "en-gb",
		name: "Signpost",
		description: "A map to allow us to navigate easily to the content we need.",
	});

	const id_content_root = await query.insert.content({
		id_domain: id_root_domain,
		id_language: "en-gb",
		date: new Date(),
		status: "PUBLIC",
		title: "Digital Garden",
		title_sub: "A digital garden of thoughts.",
		synopsis: "This is the root content.",
		body: "# Digital Garden\nDetailed information about the root content."
	})
	
	const id_asset_favicon = await query.insert.asset({
		id_domain: id_root_domain,		
		path: "favicon.svg"
	});
	await query.insert.asset({
		id_domain: id_root_domain,		
		path: "home.css"
	});

	await query.insert.asset({
		id_domain: id_root_domain,
		path: "home.js"
	});

	const id_garden = await query.insert.garden({
		id_domain: id_root_domain,
		id_asset: id_asset_favicon
	});
	await query.insert.domain_asset({
		id_domain: id_root_domain,
		id_asset: id_asset_favicon,
	})
	

	await query.insert.garden_information({
		id_garden: id_garden,
		id_language: "en-gb",
		name: "Digital Garden",
		description: "A digital garden of thoughts.",
	});

	const id_asset_profile = await query.insert.asset({
		id_domain: id_root_domain,
		path: "profile.png"
	});
	const id_author = await query.insert.author({
		id_asset: id_asset_profile,
		email: "root@root.com",
		name: "Root",
		password: await hash("root"),
	});
	await query.insert.author_garden({
		id_author: id_author,
		id_garden: id_garden,
	});
	await query.insert.author_domain({
		id_author: id_author,
		id_domain: id_root_domain,
	});
	await query.insert.author_content({
		id_author: id_author,
		id_content: id_content_root,
	});

	await query.insert.domain({
		id_domain_parent: id_root_domain,
		id_domain_redirect: null,
		type: "ROUTER",
		name: "contact",
		status: "PUBLIC",
	});

	const id_domain_graph = await query.insert.domain({
		id_domain_parent: id_root_domain,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: "graph",
		status: "PUBLIC",
	});

	const id_asset_graph_css = await query.insert.asset({
		id_domain: id_domain_graph,
		path: "graph/graph.css"
	});

	await query.insert.domain_asset({
		id_domain: id_domain_graph,
		id_asset: id_asset_graph_css,
	});

	const id_asset_graph_js = await query.insert.asset({
		id_domain: id_domain_graph,
		path: "graph/graph.js"
	});

	await query.insert.domain_asset({
		id_domain: id_domain_graph,
		id_asset: id_asset_graph_js,
	});
}

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
async function init ()
{
	const current_tables = await query.select.tables();

	if (current_tables.length)
	{
		debug("Database already initialised.");
		return;
	}

	debug("Initialising database...");

	const {
		types,
		tables,
		functions
	} = query.create;

	debug(`Initializing types:`);
	for (const create of Object.values(types)) {
		debug(`\ttypes.${create.name}`);
		await create();
	}

	debug(`Initializing tables:`);
	for (const create of Object.values(tables)) {
		debug(`\ttables.${create.name}`);
		await create();
	}
	for (const create of Object.values(functions)) {
		debug(`\tfunctions.${create.name}`);
		await create();
	}

	populate();
}

export default {
	domain,
	port,
	init,
};
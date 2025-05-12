import { sql } from "bun";
import { hash, debug } from "@/util";
import * as query from "@/database/query";
import sql_files from "@/database/sql_files";

/**
 * Populate the database with initial data.
 */
export async function populate () {

	const id_root_domain = await query.insert_domain({
		id_domain_parent: null,
		id_domain_redirect: null,
		type: "SUBDOMAIN",
		name: "domain",
		status: "PUBLIC",
	});

	const id_asset_gb = await query.insert_asset({
		id_domain: id_root_domain,
		path: "./assets/Flag_of_the_United_Kingdom.svg"
	});

	await query.insert_language({
		id: "en-gb",
		id_asset: id_asset_gb,
	});

	await query.insert_language_information({
		id_for: "en-gb",
		id_from: "en-gb",
		name: "English (British)",
		description: "The British variant of the English language.",
	});

	await query.insert_asset_information({
		id_asset: id_asset_gb,
		id_language: "en-gb",
		name: "Flag of the United Kingdom",
		description: "The flag of the United Kingdom in SVG format.",
	});

	const id_asset_seedling = await query.insert_asset({
		id_domain: id_root_domain,
		path: "./assets/tags/seedling.svg"
	});
	const id_tag_seedling = await query.insert_tag(id_asset_seedling);
	await query.insert_tag_information({
		id_tag: id_tag_seedling,
		id_language: "en-gb",
		name: "Seedling",
		description: "New-born thoughts, not sorted out yet.",
	});

	const id_asset_sapling = await query.insert_asset({
		id_domain: id_root_domain,
		path: "./assets/tags/sapling.svg"
	});
	const id_tag_sapling = await query.insert_tag(id_asset_sapling);
	await query.insert_tag_information({
		id_tag: id_tag_sapling,
		id_language: "en-gb",
		name: "Sapling",
		description: "Substiantial amount of content, but much to be done, with emerging structure.",
	});
	await query.insert_tag_requirement({
		id_tag: id_tag_seedling,
		id_tag_for: id_tag_sapling,
	});

	const id_asset_tree = await query.insert_asset({
		id_domain: id_root_domain,
		path: "./assets/tags/tree.svg"
	});
	const id_tag_tree = await query.insert_tag(id_asset_tree);
	await query.insert_tag_information({
		id_tag: id_tag_tree,
		id_language: "en-gb",
		name: "Tree",
		description: "A tree of content, with a clear structure.",
	});
	await query.insert_tag_requirement({
		id_tag: id_tag_sapling,
		id_tag_for: id_tag_tree,
	});

	const id_asset_withered = await query.insert_asset({
		id_domain: id_root_domain,
		path: "./assets/tags/withered.svg"
	});
	const id_tag_withered = await query.insert_tag(id_asset_withered);
	await query.insert_tag_information({
		id_tag: id_tag_withered,
		id_language: "en-gb",
		name: "Withered",
		description: "Outdated notes kept for historical context, with warnings where needed."
    });

	const id_asset_signpost = await query.insert_asset({
		id_domain: id_root_domain,
		path: "./assets/tags/signpost.svg"
	});
	const id_tag_signpost = await query.insert_tag(id_asset_signpost);
	await query.insert_tag_information({
		id_tag: id_tag_signpost,
		id_language: "en-gb",
		name: "Signpost",
		description: "A map to allow us to navigate easily to the content we need.",
	});

	const id_content_root = await query.insert_content({
		id_domain: id_root_domain,
		id_language: "en-gb",
		date: new Date(),
		status: "PUBLIC",
		title: "Digital Garden",
		title_sub: "A digital garden of thoughts.",
		synopsis: "This is the root content.",
		body: "# Digital Garden\nDetailed information about the root content."
	})

	const id_asset_favicon = await query.insert_asset({
		id_domain: id_root_domain,		
		path: "./assets/icons/favicon.ico"
	});

	const id_garden = await query.insert_garden({
		id_domain: id_root_domain,
		id_asset: id_asset_favicon
	});

	await query.insert_garden_information({
		id_garden: id_garden,
		id_language: "en-gb",
		name: "Digital Garden",
		description: "A digital garden of thoughts.",
	});

	const id_author = await query.insert_author({
		id_asset: id_asset_gb,
		email: "root@root.com",
		name: "Root",
		password: await hash("root"),
	});
	await query.insert_author_garden({
		id_author: id_author,
		id_garden: id_garden,
	});
	await query.insert_author_domain({
		id_author: id_author,
		id_domain: id_root_domain,
	});
}

/**
 * Initialise the database: columns, procedures, etc.
 * @returns {Promise<void>}
 */
export async function init () {

	if ((await query.get_tables()).length)
	{
		debug("Database already initialised.");
		return;
	}

	debug("Initialising database...");

	for (const [name, content] of sql_files)
	{
		debug(`Executing SQL file: ${name}.`);
		await sql.unsafe(content);
	}

	populate();
}

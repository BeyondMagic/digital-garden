import { sql } from "bun";

/**
 * The type of domain that should be parsed: "subdomain.domain/router".
 * @typedef {'ROUTER' | 'SUBDOMAIN'} Domain
 */

/**
 * Status of a domain or content to parse.
 * @typedef {'PUBLIC' | 'PRIVATE' | 'ARCHIVED' | 'DELETED'} Status
 */

/**
 * Insert a new content into the "content" table and return its ID.
 * @param {Object} information - Information of the content to be inserted.
 * @param {string} information.id_garden - ID of the garden that the content is associated with.
 * @param {string} information.id_language - ID of the language that the content is in.
 * @param {string} information.name - Name of the content.
 * @param {string} information.description - Description of the content.
 */
export async function insert_garden_information({id_garden, id_language, name, description}) {
	return await sql`
		INSERT INTO garden_information (id_garden, id_language, name, description)
			VALUES (${id_garden}, ${id_language}, ${name}, ${description})
		ON CONFLICT (id_garden, id_language) DO UPDATE
			SET name = ${name}, description = ${description}
			WHERE garden_information.id_garden = ${id_garden} AND garden_information.id_language = ${id_language}
		RETURNING id;
	`.values();
}

/**
 * Insert a new content into the "content" table and return its ID.
 * @param {Object} information - Information of the content to be inserted.
 * @param {string} information.id_domain - ID of the domain that the content is associated with.
 * @param {string} information.id_asset - ID of the asset that the content is associated with.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted content.
 */
export async function insert_garden({id_domain, id_asset}) {
	return await sql`
		INSERT INTO garden (id_domain, id_asset)
			VALUES (${id_domain}, ${id_asset})
		ON CONFLICT (id_domain) DO UPDATE
			SET id_asset = ${id_asset}
			WHERE garden.id_domain = ${id_domain}
		RETURNING id;
	`.values();
}

/**
 * Insert a new content into the "content" table and return its ID.
 * @param {Object} information - Information of the content to be inserted.
 * @param {string} information.id_domain - ID of the domain that the content is associated with.
 * @param {string} information.id_language - ID of the language that the content is in.
 * @param {Date} information.date - Date of the content.
 * @param {Status} information.status - Status of the content.
 * @param {string} information.title - Title of the content.
 * @param {string} information.title_sub - Subtitle of the content.
 * @param {string} information.synopsis - Synopsis of the content.
 * @param {string} information.body - Body of the content.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted content.
 */
export async function insert_content({id_domain, id_language, date, status, title, title_sub, synopsis, body}) {
	return await sql`
		INSERT INTO content (id_domain, id_language, date, status, title, title_sub, synopsis, body)
			VALUES (${id_domain}, ${id_language}, ${date}, ${status}, ${title}, ${title_sub}, ${synopsis}, ${body})
		ON CONFLICT (id_domain, id_language) DO UPDATE
			SET date = ${date}, status = ${status}, title = ${title}, title_sub = ${title_sub}, synopsis = ${synopsis}, body = ${body}
			WHERE content.id_domain = ${id_domain} AND content.id_language = ${id_language}
		RETURNING id;
	`.values();
}

/**
 * Insert a new content link into the "content_link" table and return its ID.
 * @param {Object} information - Information of the content link to be inserted.
 * @param {string} information.id_from - ID of the content that is linking to another content.
 * @param {string} information.id_to - ID of the content that is being linked to.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted content link.
 */
export async function insert_content_link({id_from, id_to}) {
	return await sql`
		INSERT INTO content_link (id_from, id_to)
			VALUES (${id_from}, ${id_to})
		RETURNING id;
	`.values();
}

/**
 * Insert a new domain into the "domain" table and return its ID.
 * @param {Object} information - Information of the domain to be inserted.
 * @param {string | null} information.id_domain_parent - ID of the parent domain.
 * @param {string | null} information.id_domain_redirect - ID of the domain to redirect to.
 * @param {Domain} information.type - Type of the domain.
 * @param {string} information.name - Name of the domain, if the first, it will be parsed as the root domain.
 * @param {Status} information.status - Status of the domain.
 **/
export async function insert_domain({id_domain_parent, id_domain_redirect, type, name, status}) {
    return await sql`
        INSERT INTO domain (id_domain_parent, id_domain_redirect, type, name, status)
            VALUES (${id_domain_parent}, ${id_domain_redirect}, ${type}, ${name}, ${status})
		RETURNING id;
    `.values();
}

/**
 * Insert a new domain tag into the "domain_tag" table and returns its ID.
 * @param {Object} information - Information of the domain tag to be inserted.
 * @param {string} information.id_domain - ID of the domain that is being tagged.
 * @param {string} information.id_tag - ID of the tag that is being associated with the domain.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted domain tag.
 **/
export async function insert_domain_tag({id_domain, id_tag}) {
	return await sql`
		INSERT INTO domain_tag (id_domain, id_tag)
			VALUES (${id_domain}, ${id_tag})
		RETURNING id;
	`.values();
}

/**
 * Insert a new domain asset into the "domain_asset" table and returns its ID.
 * @param {Object} information - Information of the domain asset to be inserted.
 * @param {string} information.id_domain - ID of the domain that is being associated with the asset.
 * @param {string} information.id_asset - ID of the asset that is being associated with the domain.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted domain asset.
 **/
/* export async function insert_domain_asset({id_domain, id_asset}) {
	return await sql`
		INSERT INTO domain_asset (id_domain, id_asset)
			VALUES (${id_domain}, ${id_asset})
		RETURNING id;
	`.values();
} */

/**
 * Insert a new tag requirement into the "tag_requirement" table.
 * @param {Object} information - Information of the tag requirement to be inserted.
 * @param {string} information.id_tag - ID of the tag that is being required.
 * @param {string} information.id_tag_for - ID of the tag that requires the other tag.
 * @returns {Promise<void>} Resolves when the tag requirement is inserted.
 **/
export async function insert_tag_requirement({id_tag, id_tag_for}) {
	return await sql`
		INSERT INTO tag_requirement (id_tag, id_tag_for)
			VALUES (${id_tag}, ${id_tag_for})
		RETURNING id;
	`.values();
}

/**
 * Insert/update new tag information into the "tag_information" table.
 * @param {Object} information - Information of the tag to be documented.
 * @param {string} information.id_tag - ID of the tag that is being documented.
 * @param {string} information.id_language - ID of the language that the information is in.
 * @param {string} information.name - Name of the tag being documented.
 * @param {string} information.description - Description of the tag being documented.
 * @returns {Promise<void>} Resolves when the tag information is inserted.
 */
export async function insert_tag_information({id_tag, id_language, name, description}) {
	return await sql`
		INSERT INTO tag_information (id_tag, id_language, name, description)
			VALUES (${id_tag}, ${id_language}, ${name}, ${description})
			ON CONFLICT (id_tag, id_language) DO UPDATE
			SET name = ${name}, description = ${description}
			WHERE tag_information.id_tag = ${id_tag} AND tag_information.id_language = ${id_language}
		RETURNING id;
	`.values();
}

/**
 * Inserts a new tag into the database.
 * @param {string} id_asset - The ID of the asset to be inserted.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted tag.
 */
export async function insert_tag(id_asset) {
	return await sql`
		INSERT INTO tag (id_asset)
			VALUES (${id_asset})
		RETURNING id;
	`.values();
}

/**
 * Creates a line in the ASSET table and returns the ID.
 * @param {Object} information - Information of the asset to be inserted.
 * @param {string} information.id_domain - ID of the domain that the asset is associated with.
 * @param {string} information.path - The path of the aasset to be inserted (from repository root).
 * @returns {Promise<string>} A promise that resolves with the ID of the asset.
 */
export async function insert_asset({id_domain, path}) {
	return await sql`
		INSERT INTO asset (id_domain, path)
			VALUES (${id_domain}, ${path})
		RETURNING id;
	`.values();
}

/**
 * Insert information about an asset into the database.
 * @param {Object} information - Information of the asset to be documented.
 * @param {string} information.id_asset - ID of the asset that is being documented.
 * @param {string} information.id_language - ID of the language that the information is in.
 * @param {string} information.name - Name of the asset being documented.
 * @param {string} information.description - Description of the asset being documented.
 * @returns {Promise<void>} Resolves when the asset information is inserted.
 */
export async function insert_asset_information({id_asset, id_language, name, description}) {
	return await sql`
		INSERT INTO asset_information (id_asset, id_language, name, description)
			VALUES (${id_asset}, ${id_language}, ${name}, ${description})
		RETURNING id;
	`.values();
}

/**
 * Creates a language in the ISO 639-1 format in the database.
 * @param {Object} information - Information of the language to be inserted.
 * @param {string} information.id - The language to be inserted.
 * @param {string} information.id_asset - ID of the asset that the language is associated with.
 * @returns {Promise<void>} A promise that resolves when the language is inserted.
 */
export async function insert_language({id, id_asset}) {
	return await sql`
		INSERT INTO language (id, id_asset)
			VALUES (${id}, ${id_asset})
		RETURNING id;
	`.values();
}

/**
 * Insert information about a language into the database.
 * @param {Object} information - Information of the language to be documented.
 * @param {string} information.id_for - ID of the language that is being documented.
 * @param {string} information.id_from - ID of the language that the information is in.
 * @param {string} information.name - Name of the langauge being documented.
 * @param {string} information.description - Description of the language being documented.
 * @returns {Promise<void>} Resolves when the language information is inserted.
 */
export async function insert_language_information({id_for, id_from, name, description}) {
	return await sql`
		INSERT INTO language_information (id_for, id_from, name, description)
			VALUES (${id_for}, ${id_from}, ${name}, ${description})
		ON CONFLICT (id_for, id_from) DO UPDATE
			SET name = ${name}, description = ${description}
			WHERE language_information.id_for = ${id_for} AND language_information.id_from = ${id_from}
		RETURNING id;
	`.values();
}

/**
 * Delete the database.
 * @returns {Promise<void>} A promise that resolves when the database is deleted.
 */
export async function delete_database() {
	return await sql.unsafe(/* sql */`
		-- Close all connections and reset the database to the initial state.
		ROLLBACK;
			
		SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'rpg' AND pid <> pg_backend_pid();
			
		DROP SCHEMA public CASCADE;
		CREATE SCHEMA public;
		SET search_path TO public;
			
		GRANT ALL ON SCHEMA public TO public;
		GRANT ALL ON SCHEMA public TO postgres;
	`);
}

/**
 * Get the list of all tables in the database.
 * @returns {Promise<Array<string>>} A promise that lazy-resolves with the list of table names in the database.
 */
export async function get_tables() {
	return await sql.unsafe(/* sql */`
		SELECT table_name FROM information_schema.tables WHERE table_schema='public';
	`)
}

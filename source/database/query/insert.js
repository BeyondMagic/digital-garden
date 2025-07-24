import { sql } from "bun";

/**
 * @typedef {import("@/database/types").DomainType} DomainType
 * @typedef {import("@/database/types").StatusType} StatusType
 */

/**
 * Insert a new request into the "request" table and return its ID.
 * @param {Object} information - Information of the request to be inserted.
 * @param {string} information.id_content - ID of the content that the request is associated with.
 * @param {string} information.ip - IP address of the request.
 * @param {string} information.device - Device that the request is made from.
 * @param {Date} information.time - Time of the request.
 * @returns {Promise<void>} A promise that resolves when the request is inserted.
 */
async function request ({ id_content, ip, device, time })
{
	return await sql`
		INSERT INTO request (id_content, ip, device, time)
			VALUES (${id_content}, ${ip}, ${device}, ${time})
		RETURNING id;
	`.values();
}

/**
 * Insert a new author connection into the "author_connection" table and return its ID.
 * @param {Object} information - Information of the author connection to be inserted.
 * @param {string} information.id_author - ID of the author that is being connected.
 * @param {string} information.id_content - ID of the content that the author is associated with.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted author connection.
 **/
async function author_content ({ id_author, id_content })
{
	return await sql`
		INSERT INTO author_content (id_author, id_content)
			VALUES (${id_author}, ${id_content})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new author connection into the "author_connection" table and return its ID.
 * @param {Object} information - Information of the author connection to be inserted.
 * @param {string} information.id_author - ID of the author that is being connected.
 * @param {string} information.id_domain - ID of the domain that the author is associated with.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted author connection.
 **/
async function author_domain ({ id_author, id_domain })
{
	return await sql`
		INSERT INTO author_domain (id_domain, id_author)
			VALUES (${id_domain}, ${id_author})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new author connection into the "author_connection" table and return its ID.
 * @param {Object} information - Information of the author connection to be inserted.
 * @param {string} information.id_author - ID of the author that is being connected.
 * @param {string} information.id_garden - ID of the garden that the author is associated with.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted author connection.
 **/
async function author_garden ({ id_author, id_garden })
{
	return await sql`
		INSERT INTO author_garden (id_author, id_garden)
			VALUES (${id_author}, ${id_garden})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new author connection into the "author_connection" table and return its ID.
 * @param {Object} information - Information of the author connection to be inserted.
 * @param {string} information.id_author - ID of the author that is being connected.
 * @param {string} information.device - Device that the author is using.
 * @param {string} information.token - Token of the author connection.
 * @param {Date} information.last_connection - Last connection date of the author.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted author connection.
 */
async function author_connection ({ id_author, device, token, last_connection })
{
	return await sql`
		INSERT INTO author_connection (id_author, device, token, last_connection)
			VALUES (${id_author}, ${device}, ${token}, ${last_connection})
		ON CONFLICT (token) DO UPDATE
			SET id_author = ${id_author}, device = ${device}, last_connection = ${last_connection}
			WHERE author_connection.token = ${token}
		RETURNING id;
	`.values();
}

/**
 * Insert a new content into the "content" table and return its ID.
 * @param {Object} information - Information of the content to be inserted.
 * @param {string} information.id_asset - ID of the asset that the content is associated with.
 * @param {string} information.email - Email of the author.
 * @param {string} information.name - Name of the author.
 * @param {string} information.password - Hashed password of the author.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted author.
 */
async function author ({ id_asset, email, name, password })
{
	return await sql`
		INSERT INTO author (id_asset, email, name, password)
			VALUES (${id_asset}, ${email}, ${name}, ${password})
		ON CONFLICT (email) DO UPDATE
			SET name = ${name}, password = ${password}
			WHERE author.email = ${email}
		RETURNING id;
	`.values();
}

/**
 * Insert a new content into the "content" table and return its ID.
 * @param {Object} information - Information of the content to be inserted.
 * @param {string} information.id_garden - ID of the garden that the content is associated with.
 * @param {string} information.id_language - ID of the language that the content is in.
 * @param {string} information.name - Name of the content.
 * @param {string} information.description - Description of the content.
 */
async function garden_information ({ id_garden, id_language, name, description })
{
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
async function garden ({ id_domain, id_asset })
{
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
 * @param {StatusType} information.status - Status of the content.
 * @param {string} information.title - Title of the content.
 * @param {string} information.title_sub - Subtitle of the content.
 * @param {string} information.synopsis - Synopsis of the content.
 * @param {string} information.body - Body of the content.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted content.
 */
async function content ({ id_domain, id_language, date, status, title, title_sub, synopsis, body })
{
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
async function content_link ({ id_from, id_to })
{
	return await sql`
		INSERT INTO content_link (id_from, id_to)
			VALUES (${id_from}, ${id_to})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new domain into the "domain" table and return its ID.
 * @param {Object} information - Information of the domain to be inserted.
 * @param {string | null} information.id_domain_parent - ID of the parent domain.
 * @param {string | null} information.id_domain_redirect - ID of the domain to redirect to.
 * @param {DomainType} information.type - Type of the domain.
 * @param {string} information.name - Name of the domain, if the first, it will be parsed as the root domain.
 * @param {StatusType} information.status - Status of the domain.
 **/
async function domain ({ id_domain_parent, id_domain_redirect, type, name, status })
{
	return await sql`
		INSERT INTO DOMAIN (id_domain_parent, id_domain_redirect, TYPE, name, status)
			VALUES (${id_domain_parent}, ${id_domain_redirect}, ${type}, ${name}, ${status})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new domain tag into the "domain_tag" table and returns its ID.
 * @param {Object} information - Information of the domain tag to be inserted.
 * @param {string} information.id_domain - ID of the domain that is being tagged.
 * @param {string} information.id_tag - ID of the tag that is being associated with the domain.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted domain tag.
 **/
async function domain_tag ({ id_domain, id_tag })
{
	return await sql`
		INSERT INTO domain_tag (id_domain, id_tag)
			VALUES (${id_domain}, ${id_tag})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new domain asset into the "domain_asset" table and returns its ID.
 * @param {Object} information - Information of the domain asset to be inserted.
 * @param {string} information.id_domain - ID of the domain that is being associated with the asset.
 * @param {string} information.id_asset - ID of the asset that is being associated with the domain.
 * @returns {Promise<string>} A promise that resolves with the ID of the inserted domain asset.
 **/
async function domain_asset ({ id_domain, id_asset })
{
	return await sql`
		INSERT INTO domain_asset (id_domain, id_asset)
			VALUES (${id_domain}, ${id_asset})
		RETURNING
			id;
		
	`.values();
}

/**
 * Insert a new tag requirement into the "tag_requirement" table.
 * @param {Object} information - Information of the tag requirement to be inserted.
 * @param {string} information.id_tag - ID of the tag that is being required.
 * @param {string} information.id_tag_for - ID of the tag that requires the other tag.
 * @returns {Promise<void>} Resolves when the tag requirement is inserted.
 **/
async function tag_requirement ({ id_tag, id_tag_for })
{
	return await sql`
		INSERT INTO tag_requirement (id_tag, id_tag_for)
			VALUES (${id_tag}, ${id_tag_for})
		RETURNING
			id;
		
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
async function tag_information ({ id_tag, id_language, name, description })
{
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
async function tag (id_asset)
{
	return await sql`
		INSERT INTO tag (id_asset)
			VALUES (${id_asset})
		RETURNING
			id;
		
	`.values();
}

/**
 * Creates a line in the ASSET table and returns the ID.
 * @param {Object} information - Information of the asset to be inserted.
 * @param {string} information.id_domain - ID of the domain that the asset is associated with.
 * @param {string} information.name - The name of the asset to be inserted (cannot contain slashes).
 * @returns {Promise<string>} A promise that resolves with the ID of the asset.
 */
async function asset ({ id_domain, name })
{
	// If name includes a slash, it is considered a path by any system, so throw an error.
	if (name.includes("/"))
		throw new Error(`Asset name "${name}" cannot contain slashes.`);

	const extension = name.includes(".") ? name.split(".").pop() : null;

	return await sql`
		INSERT INTO
			asset (id_domain, path, extension)
		VALUES
			(${id_domain}, ${name}, ${extension})
		RETURNING
			id;
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
async function asset_information ({ id_asset, id_language, name, description })
{
	return await sql`
		INSERT INTO asset_information (id_asset, id_language, name, description)
			VALUES (${id_asset}, ${id_language}, ${name}, ${description})
		RETURNING
			id;
		
	`.values();
}

/**
 * Creates a language in the ISO 639-1 format in the database.
 * @param {Object} information - Information of the language to be inserted.
 * @param {string} information.id - The language to be inserted.
 * @param {string} information.id_asset - ID of the asset that the language is associated with.
 * @returns {Promise<void>} A promise that resolves when the language is inserted.
 */
async function language ({ id, id_asset })
{
	return await sql`
		INSERT INTO
		LANGUAGE (id, id_asset)
			VALUES (${id}, ${id_asset})
		RETURNING
			id;
		
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
async function language_information ({ id_for, id_from, name, description })
{
	return await sql`
		INSERT INTO language_information (id_for, id_from, name, description)
			VALUES (${id_for}, ${id_from}, ${name}, ${description})
		ON CONFLICT (id_for, id_from) DO UPDATE
			SET name = ${name}, description = ${description}
			WHERE language_information.id_for = ${id_for} AND language_information.id_from = ${id_from}
		RETURNING id;
	`.values();
}

export default {
	request,
	author_content,
	author_domain,
	author_garden,
	author_connection,
	author,
	garden_information,
	garden,
	content,
	content_link,
	domain,
	domain_tag,
	domain_asset,
	tag_requirement,
	tag_information,
	tag,
	asset,
	asset_information,
	language,
	language_information
};
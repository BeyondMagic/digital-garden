import { sql } from "bun";
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

/**
 * Create the domain table.
 * - id: The unique identifier for the domain.
 * - id_domain_parent: The parent domain (if any).
 * - id_domain_redirect: The domain to redirect to (if any).
 * - type: The type of the domain.
 * - name: The name of the domain.
 * - status: The status of the domain.
 **/
async function domain() {
	await sql`
		CREATE TABLE IF NOT EXISTS domain (
			id SERIAL PRIMARY KEY,
			id_domain_parent INTEGER REFERENCES domain(id),
			id_domain_redirect INTEGER REFERENCES domain(id),
			type TYPE_DOMAIN NOT NULL,
			name VARCHAR(100) NOT NULL,
			status TYPE_STATUS NOT NULL,
			UNIQUE(name, type, id_domain_parent)
		);
	`;
}

domain.test = async () => {
	assert(await exists('domain', 'table'), 'Table "domain" was not created successfully.');
};

/**
 * Assets are filesfiles such as images, scripts, videos.
 * For example, every language has an image that represents it.
 * - id: The unique identifier for the asset.
 * - id_domain: The domain that the asset belongs to.
 * - name: The name of the asset (4096 is the maximum length of a name in Linux).
 * - extension: The extension of the URL (e.g. .png, .jpg, .js, etc.).
 **/
async function asset() {
	await sql`
		CREATE TABLE asset (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			name VARCHAR(4096) NOT NULL,
			extension VARCHAR(100),
			UNIQUE(id_domain, name)
		);
	`;
}

asset.test = async () => {
	assert(await exists('asset', 'table'), 'Table "asset" was not created successfully.');
};

/**
 * The language table is used to store the languages that are supported by the system.
 * For example, Portuguese, Japanese, English, Spanish, French, etc.
 **/
async function language() {
	await sql`
		CREATE TABLE language (
			id VARCHAR(100) PRIMARY KEY,
			id_asset INTEGER UNIQUE NOT NULL REFERENCES asset(id) ON DELETE CASCADE
		);
	`;
}

language.test = async () => {
	assert(await exists('language', 'table'), 'Table "language" was not created successfully.');
};

/**
 * The information about a language in a specific language.
 * For example, the name of the language in the language itself.
 **/
async function language_information() {
	await sql`
		CREATE TABLE language_information (
			id SERIAL PRIMARY KEY,
			id_for VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			id_from VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			description TEXT NOT NULL,
			UNIQUE(id_for, id_from)
		);
	`;
}

language_information.test = async () => {
	assert(await exists('language_information', 'table'), 'Table "language_information" was not created successfully.');
};

/**
 * The information about an asset in a specific language.
 * For example, the name of the asset in the language itself.
 **/
async function asset_information() {
	await sql`
		CREATE TABLE asset_information (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
			id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			description TEXT NOT NULL,
			UNIQUE(id_asset, id_language)
		);
	`;
}

asset_information.test = async () => {
	assert(await exists('asset_information', 'table'), 'Table "asset_information" was not created successfully.');
};

/**
 * The tag table is used to store the tags that are used in the system.
 * For example, the tag "programming" can be used to tag content related to programming.
 * The table can be used to filter content by tag.
 **/
async function tag() {
	await sql`
		CREATE TABLE tag (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER REFERENCES asset(id)
		);
	`;
}

tag.test = async () => {
	assert(await exists('tag', 'table'), 'Table "tag" was not created successfully.');
};

/**
 * The tag requirement table is used to store the requirements of a tag.
 * Basically a tag that is required for another tag.
 * For example, a tag "programming" is required for the tag "java".
 * This means that if a tag "java" is added, a tag "programming" must be added too.
 **/
async function tag_requirement() {
	await sql`
		CREATE TABLE tag_requirement (
			id SERIAL PRIMARY KEY,
			id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			id_tag_for INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			UNIQUE(id_tag, id_tag_for)
		);
	`;
}

tag_requirement.test = async () => {
	assert(await exists('tag_requirement', 'table'), 'Table "tag_requirement" was not created successfully.');
};

/**
 * The information about a tag in a specific language.
 * For example, the name of the tag in the language itself.
 **/
async function tag_information() {
	await sql`
		CREATE TABLE tag_information (
			id SERIAL PRIMARY KEY,
			id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			description TEXT NOT NULL,
			UNIQUE(id_tag, id_language)
		);
	`;
}

tag_information.test = async () => {
	assert(await exists('tag_information', 'table'), 'Table "tag_information" was not created successfully.');
};

/**
 * The domain_tag table is used to store the tags that are used in a domain.
 * For example, the tag "programming" can be used to tag content related to programming.
 * The tag can be used to filter domains by tag.
 **/
async function domain_tag() {
	await sql`
		CREATE TABLE domain_tag (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			UNIQUE(id_domain, id_tag)
		);
	`;
}

domain_tag.test = async () => {
	assert(await exists('domain_tag', 'table'), 'Table "domain_tag" was not created successfully.');
};

/**
 * The domain_asset table is used to store the assets that are used in a domain.
 * For example, the asset "logo.png" can be used to store the logo of the domain.
 **/
async function domain_asset() {
	await sql`
		CREATE TABLE domain_asset (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
			UNIQUE(id_domain, id_asset)
		);
	`;
}

domain_asset.test = async () => {
	assert(await exists('domain_asset', 'table'), 'Table "domain_asset" was not created successfully.');
};

/**
 * The content table is used to store the content of a domain.
 * For example, the content of a blog can be stored in this table.
 * The content can be filtered by domain and language.
 **/
async function content() {
	await sql`
		CREATE TABLE content (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			date TIMESTAMP NOT NULL,
			status TYPE_STATUS NOT NULL,
			title VARCHAR(100) NOT NULL,
			title_sub VARCHAR(100) NOT NULL,
			synopsis VARCHAR(250) NOT NULL,
			body TEXT NOT NULL,
			UNIQUE(id_domain, id_language)
		);
	`;
}

content.test = async () => {
	assert(await exists('content', 'table'), 'Table "content" was not created successfully.');
};


/**
 * The content link table is used to store the links between different content entries.
 **/
async function content_link() {
	await sql`
		CREATE TABLE content_link (
			id SERIAL PRIMARY KEY,
			id_from INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			id_to INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			UNIQUE(id_from, id_to)
		);
	`;
}

content_link.test = async () => {
	assert(await exists('content_link', 'table'), 'Table "content_link" was not created successfully.');
};

/**
 * The garden table is used to store the gardens that are used in the system.
 * - id_domain: The root domain of the platform.
 * - id_asset: The logo of the platform.
 **/
async function garden() {
	await sql`
		CREATE TABLE garden (
			id SERIAL PRIMARY KEY,
			-- Root domain of the platform.
			id_domain INTEGER NOT NULL UNIQUE REFERENCES domain(id) ON DELETE CASCADE,
			-- Will serve as the logo of the platform.
			id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE
		);
	`;
}

garden.test = async () => {
	assert(await exists('garden', 'table'), 'Table "garden" was not created successfully.');
};

/**
 * The garden information table is used to store the information about a garden in a specific language.
 * For example, the name of the garden in the language itself.
 **/
async function garden_information() {
	await sql`
		CREATE TABLE garden_information (
			id SERIAL PRIMARY KEY,
			id_garden INTEGER NOT NULL REFERENCES garden(id) ON DELETE CASCADE,
			id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			description TEXT NOT NULL,
			UNIQUE(id_garden, id_language)
		);
	`;
}

garden_information.test = async () => {
	assert(await exists('garden_information', 'table'), 'Table "garden_information" was not created successfully.');
};

/**
 * The author table is used to store the authors that are used in the system.
 * For example, the author of a blog can be stored in this table.
 * - pages: The number of domains created by the author.
 * - contents: The number of contents created by the author.
 * - id_asset: The profile picture of the author.
 **/
async function author() {
	await sql`
		CREATE TABLE author (
			id SERIAL PRIMARY KEY,
			email VARCHAR(100) UNIQUE NOT NULL,
			name VARCHAR(100) NOT NULL,
			password VARCHAR(256) NOT NULL,
			pages INTEGER NOT NULL DEFAULT 0,
			contents INTEGER NOT NULL DEFAULT 0,
			id_asset INTEGER REFERENCES asset(id)
		);
	`;
}

author.test = async () => {
	assert(await exists('author', 'table'), 'Table "author" was not created successfully.');
};

/**
 * The author connection table is used to store the connections of an author.
 * For example, the author can connect to the system using a device and a token.
 **/
async function author_connection() {
	await sql`
		CREATE TABLE author_connection (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			device VARCHAR(100) NOT NULL,
			token VARCHAR(256) UNIQUE NOT NULL,
			logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			last_connection TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`;
}

author_connection.test = async () => {
	assert(await exists('author_connection', 'table'), 'Table "author_connection" was not created successfully.');
};

export const tables = {
	domain,
	asset,
	language,
	language_information,
	asset_information,
	tag,
	tag_requirement,
	tag_information,
	domain_tag,
	domain_asset,
	content,
	content_link,
	garden,
	garden_information,
	author,
	author_connection,
}
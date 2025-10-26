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

export const tables = {
	domain,
	asset,
	language,
	language_information,
	asset_information,
	tag,
	tag_requirement,
	tag_information,
}
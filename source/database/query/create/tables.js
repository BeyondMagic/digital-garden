/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

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

/**
 * The author garden table is used to store the gardens that an author has control over.
 **/
async function author_garden() {
	await sql`
		CREATE TABLE author_garden (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_garden INTEGER NOT NULL REFERENCES garden(id) ON DELETE CASCADE,
			UNIQUE(id_author, id_garden)
		);
	`;
}

/**
 * The author domain table is used to store the domains that are controlled by an author.
 **/
async function author_domain() {
	await sql`
		CREATE TABLE author_domain (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			UNIQUE(id_author, id_domain)
		);
	`;
}

/**
 * The author content table is used to keep track of the contents that are controlled by an author.
 */
async function author_content() {
	await sql`
		CREATE TABLE author_content (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_content INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			UNIQUE(id_author, id_content)
		);
	`;
}

/**
 * The module table is used to keep track of the modules that are available in the system.
 * - repository: The repository URL/filepath of the module.
 * - slug: The slug identifier for the module.
 * - enabled: Whether the module is enabled.
 * - last_checked: The last time the module was checked for updates.
 **/
async function module() {
	await sql`
		CREATE TABLE module (
			id SERIAL PRIMARY KEY,
			repository VARCHAR(4096) UNIQUE NOT NULL,
			slug VARCHAR(8) UNIQUE NOT NULL,
			enabled BOOLEAN NOT NULL,
			last_checked TIMESTAMP NOT NULL
		);
	`;
}

/**
 * The module event table is used to keep track of the events that are associated with a module.
 **/
async function module_event() {
	await sql`
		CREATE TABLE module_event (
			id SERIAL PRIMARY KEY,
			id_module INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
			event VARCHAR(100) NOT NULL,
			UNIQUE(id_module, event)
		);
	`;
}

/**
 * Subscriptions that connect a listener module to a specific module event.
 * Each (event, listener) pair is unique to avoid duplicate deliveries.
 */
async function module_event_subscription() {
	await sql`
		CREATE TABLE module_event_subscription (
			id SERIAL PRIMARY KEY,
			id_event INTEGER NOT NULL REFERENCES module_event(id) ON DELETE CASCADE,
			id_module INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(id_event, id_module)
		);
	`;
}

/**
 * Optional domain scoping for subscriptions. When rows exist, the listener only
 * receives events for the listed domains; absence of rows means all domains.
 */
async function module_event_subscription_domain() {
	await sql`
		CREATE TABLE module_event_subscription_domain (
			id_subscription INTEGER NOT NULL REFERENCES module_event_subscription(id) ON DELETE CASCADE,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			PRIMARY KEY (id_subscription, id_domain)
		);
	`;
}

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
	author_garden,
	author_domain,
	author_content,
	module,
	module_event,
	module_event_subscription,
	module_event_subscription_domain,
};

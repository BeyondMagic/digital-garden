/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

async function domain() {
	await sql`
		CREATE TABLE IF NOT EXISTS domain (
			id SERIAL PRIMARY KEY,
			id_domain_parent INTEGER REFERENCES domain(id),
			id_domain_redirect INTEGER REFERENCES domain(id),
			kind TYPE_DOMAIN NOT NULL,
			slug VARCHAR(32) NOT NULL,
			status TYPE_SUBJECT_STATUS NOT NULL,
			CONSTRAINT domain_no_self_parent CHECK (id_domain_parent IS NULL OR id_domain_parent <> id),
			CONSTRAINT domain_unique_slug_kind_parent UNIQUE(slug, kind, id_domain_parent),
			CONSTRAINT domain_no_circular_parent CHECK (id_domain_parent IS NULL OR id_domain_parent <> id_domain_redirect),
			CONSTRAINT domain_no_circular_redirect CHECK (id_domain_redirect IS NULL OR id_domain_redirect <> id_domain_parent),
			CONSTRAINT domain_slug_not_empty CHECK (char_length(btrim(slug)) > 0),
			CONSTRAINT domain_root_kind_check CHECK (
				(id_domain_parent IS NULL AND kind = 'SUBDOMAIN') OR
				(id_domain_parent IS NOT NULL)
			),
			CONSTRAINT domain_slug_format CHECK (slug NOT LIKE '%/%' AND slug NOT LIKE '%\0%'),
			CONSTRAINT domain_subdomain_slug_format CHECK (
				(kind = 'SUBDOMAIN' AND slug NOT LIKE '%.%') OR
				(kind = 'ROUTER')
			)
		);
	`;
}

async function asset() {
	await sql`
		CREATE TABLE asset (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			slug VARCHAR(64) NOT NULL,
			extension VARCHAR(16) NOT NULL,
			CONSTRAINT asset_unique_domain_slug UNIQUE(id_domain, slug),
			CONSTRAINT asset_slug_not_empty CHECK (char_length(btrim(slug)) > 0),
			CONSTRAINT asset_slug_format CHECK (slug NOT LIKE '%/%' AND slug NOT LIKE '%\0%' AND slug NOT LIKE '%.%'),
			CONSTRAINT asset_extension_not_empty CHECK (char_length(btrim(extension)) > 0),
			CONSTRAINT asset_extension_format CHECK (extension NOT LIKE '%/%' AND extension NOT LIKE '%\0%')
		);
	`;
}

async function language() {
	await sql`
		CREATE TABLE language (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER UNIQUE NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
			slug VARCHAR(5) NOT NULL,
			CONSTRAINT language_unique_slug UNIQUE(slug),
			CONSTRAINT language_slug_format CHECK (slug ~ '^[a-z]{2}(-[A-Z]{2})?$')
		);
	`;
}

async function language_information() {
	await sql`
		CREATE TABLE language_information (
			id SERIAL PRIMARY KEY,
			id_language_for INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			id_language_from INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(64) NOT NULL,
			description TEXT NOT NULL,
			CONSTRAINT language_information_unique_pair UNIQUE(id_language_for, id_language_from),
			CONSTRAINT language_information_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT language_information_description_not_empty CHECK (char_length(btrim(description)) > 0)
		);
	`;
}

async function asset_information() {
	await sql`
		CREATE TABLE asset_information (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
			id_language INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(128) NOT NULL,
			description TEXT NOT NULL,
			CONSTRAINT asset_information_unique_pair UNIQUE(id_asset, id_language),
			CONSTRAINT asset_information_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT asset_information_description_not_empty CHECK (char_length(btrim(description)) > 0)
		);
	`;
}

async function tag() {
	await sql`
		CREATE TABLE tag (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER REFERENCES asset(id),
			slug VARCHAR(64) NOT NULL,
			CONSTRAINT tag_unique_slug UNIQUE(slug),
			CONSTRAINT tag_slug_not_empty CHECK (char_length(btrim(slug)) > 0)
		);
	`;
}

async function tag_requirement() {
	await sql`
		CREATE TABLE tag_requirement (
			id SERIAL PRIMARY KEY,
			id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			id_tag_for INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			CONSTRAINT tag_requirement_unique_pair UNIQUE(id_tag, id_tag_for),
			CONSTRAINT tag_requirement_no_self_reference CHECK (id_tag <> id_tag_for)
		);
	`;
}

async function tag_information() {
	await sql`
		CREATE TABLE tag_information (
			id SERIAL PRIMARY KEY,
			id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			id_language INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(128) NOT NULL,
			description TEXT NOT NULL,
			CONSTRAINT tag_information_unique_pair UNIQUE(id_tag, id_language),
			CONSTRAINT tag_information_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT tag_information_description_not_empty CHECK (char_length(btrim(description)) > 0)
		);
	`;
}

async function domain_tag() {
	await sql`
		CREATE TABLE domain_tag (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
			CONSTRAINT domain_tag_unique_pair UNIQUE(id_domain, id_tag)
		);
	`;
}

async function content() {
	await sql`
		CREATE TABLE content (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			id_language INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			date TIMESTAMP NOT NULL,
			status TYPE_SUBJECT_STATUS NOT NULL,
			title VARCHAR(512) NOT NULL,
			title_sub VARCHAR(512) NOT NULL,
			synopsis VARCHAR(512) NOT NULL,
			body TEXT NOT NULL,
			requests INTEGER NOT NULL DEFAULT 0,
			CONSTRAINT content_unique_pair UNIQUE(id_domain, id_language),
			CONSTRAINT content_title_not_empty CHECK (char_length(btrim(title)) > 0),
			CONSTRAINT content_synopsis_not_empty CHECK (char_length(btrim(synopsis)) > 0),
			CONSTRAINT content_body_not_empty CHECK (char_length(btrim(body)) > 0),
			CONSTRAINT content_requests_non_negative CHECK (requests >= 0)
		);
	`;
}

async function content_link() {
	await sql`
		CREATE TABLE content_link (
			id SERIAL PRIMARY KEY,
			id_from INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			id_to INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			CONSTRAINT content_link_unique_pair UNIQUE(id_from, id_to)
		);
	`;
}

async function garden() {
	await sql`
		CREATE TABLE garden (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL UNIQUE REFERENCES domain(id) ON DELETE CASCADE,
			id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE
		);
	`;
}

async function garden_information() {
	await sql`
		CREATE TABLE garden_information (
			id SERIAL PRIMARY KEY,
			id_garden INTEGER NOT NULL REFERENCES garden(id) ON DELETE CASCADE,
			id_language INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(64) NOT NULL,
			description TEXT NOT NULL,
			CONSTRAINT garden_information_unique_pair UNIQUE(id_garden, id_language),
			CONSTRAINT garden_information_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT garden_information_description_not_empty CHECK (char_length(btrim(description)) > 0)
		);
	`;
}

async function author() {
	await sql`
		CREATE TABLE author (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER REFERENCES asset(id),
			email VARCHAR(256) UNIQUE NOT NULL,
			name VARCHAR(256) NOT NULL,
			password VARCHAR(512) NOT NULL,
			pages INTEGER NOT NULL DEFAULT 0,
			contents INTEGER NOT NULL DEFAULT 0,
			CONSTRAINT author_email_not_empty CHECK (char_length(btrim(email)) > 0),
			CONSTRAINT author_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT author_password_not_empty CHECK (char_length(btrim(password)) > 0),
			CONSTRAINT author_pages_non_negative CHECK (pages >= 0),
			CONSTRAINT author_contents_non_negative CHECK (contents >= 0)
		);
	`;
}

async function author_connection() {
	await sql`
		CREATE TABLE author_connection (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			device VARCHAR(256) NOT NULL,
			token VARCHAR(512) UNIQUE NOT NULL,
			logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			last_connection TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT author_connection_device_not_empty CHECK (char_length(btrim(device)) > 0),
			CONSTRAINT author_connection_token_not_empty CHECK (char_length(btrim(token)) > 0)
		);
	`;
}

async function author_domain() {
	await sql`
		CREATE TABLE author_domain (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			CONSTRAINT author_domain_unique_pair UNIQUE(id_author, id_domain)
		);
	`;
}

async function author_garden() {
	await sql`
		CREATE TABLE author_garden (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_garden INTEGER NOT NULL REFERENCES garden(id) ON DELETE CASCADE,
			CONSTRAINT author_garden_unique_pair UNIQUE(id_author, id_garden)
		);
	`;
}

async function author_content() {
	await sql`
		CREATE TABLE author_content (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_content INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			CONSTRAINT author_content_unique_pair UNIQUE(id_author, id_content)
		);
	`;
}

async function module() {
	await sql`
		CREATE TABLE module (
			id SERIAL PRIMARY KEY,
			repository VARCHAR(512) UNIQUE NOT NULL,
			commit VARCHAR(40) NOT NULL,
			branch VARCHAR(256) NOT NULL DEFAULT 'main',
			version_major INTEGER,
			version_minor INTEGER,
			version_patch INTEGER,
			last_heartbeat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			enabled BOOLEAN NOT NULL,
			CONSTRAINT module_repository_not_empty CHECK (char_length(btrim(repository)) > 0),
			CONSTRAINT module_commit_not_empty CHECK (char_length(btrim(commit)) > 0),
			CONSTRAINT module_branch_not_empty CHECK (char_length(btrim(branch)) > 0),
			CONSTRAINT module_version_major_non_negative CHECK (version_major IS NULL OR version_major >= 0),
			CONSTRAINT module_version_minor_non_negative CHECK (version_minor IS NULL OR version_minor >= 0),
			CONSTRAINT module_version_patch_non_negative CHECK (version_patch IS NULL OR version_patch >= 0)
		);
	`;
}

async function module_binding() {
	await sql`
		CREATE TABLE module_binding (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER REFERENCES domain(id) ON DELETE CASCADE,
			id_module INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
			slug VARCHAR(128) NOT NULL,
			recursive BOOLEAN NOT NULL,
			enabled BOOLEAN NOT NULL,
			priority INTEGER NOT NULL DEFAULT 0,
			CONSTRAINT module_binding_unique_pair UNIQUE(id_module, slug),
			CONSTRAINT module_binding_slug_not_empty CHECK (char_length(btrim(slug)) > 0),
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
	module_binding,
};

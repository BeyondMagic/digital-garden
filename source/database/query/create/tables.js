/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
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
			type TYPE_DOMAIN NOT NULL,
			name VARCHAR(100) NOT NULL,
			status TYPE_STATUS NOT NULL,
			UNIQUE(name, type, id_domain_parent)
		);
	`;
}

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

async function language() {
	await sql`
		CREATE TABLE language (
			id VARCHAR(100) PRIMARY KEY,
			id_asset INTEGER UNIQUE NOT NULL REFERENCES asset(id) ON DELETE CASCADE
		);
	`;
}

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

async function tag() {
	await sql`
		CREATE TABLE tag (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER REFERENCES asset(id)
		);
	`;
}

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

async function module() {
	await sql`
		CREATE TABLE module (
			id SERIAL PRIMARY KEY,
			repository VARCHAR(4096) UNIQUE NOT NULL,
			slug VARCHAR(8) UNIQUE NOT NULL,
			enabled BOOLEAN NOT NULL,
			last_checked TIMESTAMP NOT NULL,
			commit VARCHAR(40) NOT NULL,
			branch VARCHAR(100) NOT NULL DEFAULT 'main'
		);
	`;
}

async function module_binding() {
	await sql`
		CREATE TABLE module_binding (
			id SERIAL PRIMARY KEY,
			id_domain_target INTEGER REFERENCES domain(id) ON DELETE CASCADE,
			id_garden INTEGER REFERENCES garden(id) ON DELETE CASCADE,
			recursive BOOLEAN NOT NULL,
			enabled BOOLEAN NOT NULL,
			slug_module VARCHAR(8) NOT NULL REFERENCES module(slug) ON DELETE CASCADE,
			slug_capability VARCHAR(8) NOT NULL,
			methods VARCHAR(128),
			priority INTEGER NOT NULL DEFAULT 0,
			UNIQUE(id_garden, id_domain_target, slug_module, slug_capability)
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
	module_binding,
};

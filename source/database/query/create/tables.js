/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { exists } from "@/database/query/util";

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
			CONSTRAINT domain_slug_format CHECK (slug NOT LIKE '%/%'),
			CONSTRAINT domain_subdomain_slug_format CHECK (
				(kind = 'SUBDOMAIN' AND slug NOT LIKE '%.%') OR
				(kind = 'ROUTER')
			)
		);
	`;
}

domain.exists = async () => {
	return exists("domain");
}

async function asset() {
	await sql`
		CREATE TABLE asset (
			id SERIAL PRIMARY KEY,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			slug VARCHAR(64) NOT NULL,
			path VARCHAR(4096) NOT NULL,
			CONSTRAINT asset_unique_domain_slug UNIQUE(id_domain, slug),
			CONSTRAINT asset_slug_not_empty CHECK (char_length(btrim(slug)) > 0),
			CONSTRAINT asset_slug_format CHECK (slug NOT LIKE '%/%'),
			CONSTRAINT asset_path_not_empty CHECK (char_length(btrim(path)) > 0),
			CONSTRAINT asset_path_unique UNIQUE(path)
		);
	`;
}

asset.exists = async () => {
	return exists("asset");
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

language.exists = async () => {
	return exists("language");
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

language_information.exists = async () => {
	return exists("language_information");
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

asset_information.exists = async () => {
	return exists("asset_information");
}

async function author() {
	await sql`
		CREATE TABLE author (
			id SERIAL PRIMARY KEY,
			id_asset INTEGER REFERENCES asset(id),
			email VARCHAR(256) UNIQUE NOT NULL,
			name VARCHAR(256) NOT NULL,
			password VARCHAR(512) NOT NULL,
			pages INTEGER NOT NULL,
			contents INTEGER NOT NULL,
			CONSTRAINT author_email_not_empty CHECK (char_length(btrim(email)) > 0),
			CONSTRAINT author_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT author_password_not_empty CHECK (char_length(btrim(password)) > 0),
			CONSTRAINT author_pages_non_negative CHECK (pages >= 0),
			CONSTRAINT author_contents_non_negative CHECK (contents >= 0)
		);
	`;
}

author.exists = async () => {
	return exists("author");
}

async function author_connection() {
	await sql`
		CREATE TABLE author_connection (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			device VARCHAR(256) NOT NULL,
			token VARCHAR(512) UNIQUE NOT NULL,
			logged_at TIMESTAMP NOT NULL,
			last_active_at TIMESTAMP NOT NULL,
			CONSTRAINT author_connection_device_not_empty CHECK (char_length(btrim(device)) > 0),
			CONSTRAINT author_connection_token_not_empty CHECK (char_length(btrim(token)) > 0)
		);
	`;
}

author_connection.exists = async () => {
	return exists("author_connection");
}

async function author_domain() {
	await sql`
		CREATE TABLE author_domain (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
			granted_at TIMESTAMP NOT NULL,
			CONSTRAINT author_domain_unique_pair UNIQUE(id_author, id_domain)
		);
	`;
}

author_domain.exists = async () => {
	return exists("author_domain");
}

async function garden() {
	await sql`
		CREATE TABLE garden (
			id BOOLEAN NOT NULL DEFAULT TRUE PRIMARY KEY,
			id_domain INTEGER NOT NULL UNIQUE REFERENCES domain(id) ON DELETE CASCADE,
			id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			CONSTRAINT configuration_only_one_row CHECK (id = TRUE)
		);
	`;
}

garden.exists = async () => {
	return exists("garden");
}

async function garden_information() {
	await sql`
		CREATE TABLE garden_information (
			id SERIAL PRIMARY KEY,
			id_language INTEGER NOT NULL REFERENCES language(id) ON DELETE CASCADE,
			name VARCHAR(64) NOT NULL,
			description TEXT NOT NULL,
			CONSTRAINT garden_information_unique_language UNIQUE(id_language),
			CONSTRAINT garden_information_name_not_empty CHECK (char_length(btrim(name)) > 0),
			CONSTRAINT garden_information_description_not_empty CHECK (char_length(btrim(description)) > 0)
		);
	`;
}

garden_information.exists = async () => {
	return exists("garden_information");
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

tag.exists = async () => {
	return exists("tag");
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

tag_requirement.exists = async () => {
	return exists("tag_requirement");
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

tag_information.exists = async () => {
	return exists("tag_information");
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

domain_tag.exists = async () => {
	return exists("domain_tag");
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
			requests INTEGER NOT NULL,
			CONSTRAINT content_unique_pair UNIQUE(id_domain, id_language),
			CONSTRAINT content_title_not_empty CHECK (char_length(btrim(title)) > 0),
			CONSTRAINT content_synopsis_not_empty CHECK (char_length(btrim(synopsis)) > 0),
			CONSTRAINT content_body_not_empty CHECK (char_length(btrim(body)) > 0),
			CONSTRAINT content_requests_non_negative CHECK (requests >= 0)
		);
	`;
}

content.exists = async () => {
	return exists("content");
}

async function content_link() {
	await sql`
		CREATE TABLE content_link (
			id SERIAL PRIMARY KEY,
			id_content_from INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			id_content_to INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			CONSTRAINT content_link_unique_pair UNIQUE(id_content_from, id_content_to)
		);
	`;
}

content_link.exists = async () => {
	return exists("content_link");
}

async function author_content() {
	await sql`
		CREATE TABLE author_content (
			id SERIAL PRIMARY KEY,
			id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
			id_content INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
			granted_at TIMESTAMP NOT NULL,
			CONSTRAINT author_content_unique_pair UNIQUE(id_author, id_content)
		);
	`;
}

author_content.exists = async () => {
	return exists("author_content");
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

module.exists = async () => {
	return exists("module");
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
	author,
	author_connection,
	author_domain,
	garden,
	garden_information,
	author_content,
	module,
};

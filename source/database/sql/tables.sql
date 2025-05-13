CREATE TABLE domain (
	id SERIAL PRIMARY KEY,
	id_domain_parent INTEGER REFERENCES domain(id),
	id_domain_redirect INTEGER REFERENCES domain(id),
	type TYPE_DOMAIN NOT NULL,
	name VARCHAR(100) NOT NULL,
	status TYPE_STATUS NOT NULL
);

-- Assets are files such as images, scripts, videos.
-- For example, every language has an image that represents it.
CREATE TABLE asset (
	id SERIAL PRIMARY KEY,
	-- The domain that the asset belongs to.
	id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
	-- 4096 is the maximum length of a path in Linux (EXT4).
	path VARCHAR(4096) UNIQUE NOT NULL,
	-- How many times the asset has been used.
	-- Updated by trigger after parsing the content of a domain.
	times INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE language (
	id VARCHAR(100) PRIMARY KEY,
	id_asset INTEGER UNIQUE NOT NULL REFERENCES asset(id) ON DELETE CASCADE
);

-- Information about the language in a specific language.
-- For example, the name of the language in the language itself.
-- For adding a new language, the name of the language in the language itself is required.
-- We force this by using a procedure to add a new language and restraining the language table to not be modified directly.
CREATE TABLE language_information (
	id SERIAL PRIMARY KEY,
	id_for VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
	id_from VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
	name VARCHAR(100) NOT NULL,
	description TEXT NOT NULL,
	UNIQUE(id_for, id_from)
);

CREATE TABLE asset_information (
	id SERIAL PRIMARY KEY,
	id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
	id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
	name VARCHAR(100) NOT NULL,
	description TEXT NOT NULL,
	UNIQUE(id_asset, id_language)
);

CREATE TABLE tag (
	id SERIAL PRIMARY KEY,
	-- Doesn't have to have an asset.
	id_asset INTEGER REFERENCES asset(id)
);

-- Basically a tag that is required for another tag.
-- For example, a tag "programming" is required for the tag "java".
-- This means that if a tag "java" is added, a tag "programming" must be added too.
CREATE TABLE tag_requirement (
	id SERIAL PRIMARY KEY,
	id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
	id_tag_for INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
	UNIQUE(id_tag, id_tag_for)
);

CREATE TABLE tag_information (
	id SERIAL PRIMARY KEY,
	id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
	id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
	name VARCHAR(100) NOT NULL,
	description TEXT NOT NULL,
	UNIQUE(id_tag, id_language)
);

CREATE TABLE domain_tag (
	id SERIAL PRIMARY KEY,
	id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
	id_tag INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
	UNIQUE(id_domain, id_tag)
);

/*CREATE TABLE domain_asset (
	id SERIAL PRIMARY KEY,
	id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
	id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
	UNIQUE(id_domain, id_asset)
);*/

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

CREATE TABLE content_link (
	id SERIAL PRIMARY KEY,
	id_from INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
	id_to INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
	UNIQUE(id_from, id_to)
);

CREATE TABLE garden (
	id SERIAL PRIMARY KEY,
	-- Root domain of the digital garden.
	id_domain INTEGER NOT NULL UNIQUE REFERENCES domain(id) ON DELETE CASCADE,
	-- Will serve as the logo of the digital garden.
	id_asset INTEGER NOT NULL REFERENCES asset(id) ON DELETE CASCADE
);

CREATE TABLE garden_information (
	id SERIAL PRIMARY KEY,
	id_garden INTEGER NOT NULL REFERENCES garden(id) ON DELETE CASCADE,
	id_language VARCHAR NOT NULL REFERENCES language(id) ON DELETE CASCADE,
	name VARCHAR(100) NOT NULL,
	description TEXT NOT NULL,
	UNIQUE(id_garden, id_language)
);

CREATE TABLE author (
	id SERIAL PRIMARY KEY,
	email VARCHAR(100) UNIQUE NOT NULL,
	name VARCHAR(100) NOT NULL,
	password VARCHAR(256) NOT NULL,
	-- Number of domains created by the author.
	pages INTEGER NOT NULL DEFAULT 0,
	-- Number of contents created by the author.
	contents INTEGER NOT NULL DEFAULT 0,
	-- The author can have a profile picture.
	id_asset INTEGER REFERENCES asset(id)
);

CREATE TABLE author_connection (
	id SERIAL PRIMARY KEY,
	id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
	device VARCHAR(100) NOT NULL,
	token VARCHAR(256) UNIQUE NOT NULL,
	logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	last_connection TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE author_garden (
	id SERIAL PRIMARY KEY,
	id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
	id_garden INTEGER NOT NULL REFERENCES garden(id) ON DELETE CASCADE,
	UNIQUE(id_author, id_garden)
);

CREATE TABLE author_domain (
	id SERIAL PRIMARY KEY,
	id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
	id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
	UNIQUE(id_author, id_domain)
);

CREATE TABLE author_content (
	id SERIAL PRIMARY KEY,
	id_author INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
	id_content INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
	UNIQUE(id_author, id_content)
);

/*
CREATE TABLE module (
	id SERIAL PRIMARY KEY,
	repository VARCHAR(4096) UNIQUE NOT NULL,
	installed BOOLEAN NOT NULL,
	enabled BOOLEAN NOT NULL,
	last_checked TIMESTAMP NOT NULL
);

CREATE TABLE module_event (
	id SERIAL PRIMARY KEY,
	id_module INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
	event VARCHAR(100) NOT NULL,
	UNIQUE(id_module, event)
);

CREATE TABLE module_dependency (
	id SERIAL PRIMARY KEY,
	id_module_asks INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
	id_dependency_for INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
	id_event INTEGER NOT NULL REFERENCES module_event(id) ON DELETE CASCADE,
	UNIQUE(id_module_asks, id_dependency_for)
);

CREATE TABLE module_domain (
	id SERIAL PRIMARY KEY,
	id_module INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
	id_domain INTEGER NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
	UNIQUE(id_module, id_domain)
);
*/
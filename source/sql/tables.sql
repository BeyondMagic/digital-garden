CREATE TABLE language (
	id VARCHAR(100) PRIMARY KEY
);

-- Information about the language in a specific language.
-- For example, the name of the language in the language itself.
-- For adding a new language, the name of the language in the language itself is required.
-- We force this by using a procedure to add a new language and restraining the language table to not be modified directly.
CREATE TABLE language_information (
	id SERIAL PRIMARY KEY,
	id_for VARCHAR REFERENCES language(id) ON DELETE CASCADE,
	id_from VARCHAR REFERENCES language(id) ON DELETE CASCADE,
	name VARCHAR(100),
	description TEXT,
	UNIQUE(id_for, id_from)
);

-- Assets are files such as images, scripts, videos.
-- For example, every language has an image that represents it.
CREATE TABLE asset (
	id SERIAL PRIMARY KEY,
	-- 4096 is the maximum length of a path in Linux (EXT4).
	path VARCHAR(4096) UNIQUE NOT NULL
);

-- A language must be represented by an asset.
CREATE TABLE language_asset (
	id SERIAL PRIMARY KEY,
	id_language VARCHAR REFERENCES language(id) ON DELETE CASCADE,
	id_asset INTEGER REFERENCES asset(id) ON DELETE CASCADE,
	UNIQUE(id_asset, id_language)
);

CREATE TABLE asset_information (
	id SERIAL PRIMARY KEY,
	id_asset INTEGER REFERENCES asset(id) ON DELETE CASCADE,
	id_language VARCHAR REFERENCES language(id) ON DELETE CASCADE,
	name VARCHAR(100),
	description TEXT,
	UNIQUE(id_asset, id_language)
)
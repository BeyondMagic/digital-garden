-- When adding a new language to the database, we need to ensure that some information is filled.
CREATE OR REPLACE FUNCTION add_language(
	id_language VARCHAR(100),
	id_asset INTEGER,
	name VARCHAR(100),
	description TEXT
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
BEGIN
	-- Insert the new language into the language table
	INSERT INTO language (id) VALUES (id_language);
	
	-- Insert the language information (name and description) in the language itself
	INSERT INTO language_information (id_for, id_from, name, description)
	VALUES (id_language, id_language, name, description);

	-- Insert the asset for the language.
	INSERT INTO language_asset (id_language, id_asset) VALUES (id_language, id_asset);
	
	-- Return the ID of the newly created language
	RETURN id_language;
END;
$$;

-- This file contains the SQL procedures for managing main tables in the database.
-- CREATE OR REPLACE FUNCTION add_garden(
-- 	id_garden INTEGER,
-- 	id_asset INTEGER,
-- 	id_language VARCHAR(100),
-- 	name VARCHAR(100),
-- 	description TEXT
-- )
-- RETURNS VOID
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
-- 
-- END;
-- $$;

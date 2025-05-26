import { sql } from "bun";

/**
 * Creates the `add_language` function in the database to add a new language.
 * @returns {Promise<void>} A promise that resolves when the function is created.
 */
export async function add_language ()
{
	return await sql`
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
`;
}

/**
 * Creates the `add_garden` function in the database to add a new garden.
 * @returns {Promise<void>} A promise that resolves when the function is created.
 **/
export async function add_garden ()
{
	return await sql`
		CREATE OR REPLACE FUNCTION add_garden(
			id_garden INTEGER,
			id_asset INTEGER,
			id_language VARCHAR(100),
			name VARCHAR(100),
			description TEXT
		)
		RETURNS VOID
		LANGUAGE plpgsql
		AS $$
		BEGIN
			-- Insert the new garden into the garden table
			INSERT INTO garden (id) VALUES (id_garden);
			
			-- Insert the garden information (name and description) in the garden itself
			INSERT INTO garden_information (id_for, id_from, name, description)
			VALUES (id_garden, id_language, name, description);

			-- Insert the asset for the garden.
			INSERT INTO garden_asset (id_garden, id_asset) VALUES (id_garden, id_asset);
			
			-- Return the ID of the newly created garden
			RETURN id_garden;
		END;
	$$;
`;
}
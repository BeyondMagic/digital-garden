import { sql } from "bun";
import types from "@/database/query/create/types";

import { create_debug, create_info } from "@/logger";
const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

/**
 * Test if the type was created correctly with the correct name and return true if it was.
 * @returns {Promise<boolean>} Returns true if the table was created successfully, false otherwise.
 **/
async function domain ()
{
    
    await types.domain();
    const result = await sql`SELECT * FROM pg_type WHERE typname = 'type_domain'`;
    return result.length > 0;
}

export default {
    domain,
}
import { sql } from "bun";
import { assert } from "@/logger";

import types from "@/database/query/create/types";

/**
 * Test if the "domain" type was created correctly with the correct name.
 **/
async function domain ()
{
    await types.domain();
    const result = await sql`SELECT * FROM pg_type WHERE typname = 'type_domain'`;
    assert(result.length === 1);
}

/**
 * Test if the "status" type was created correctly with the correct name.
 */
async function status ()
{
    await types.status();
    const result = await sql`SELECT * FROM pg_type WHERE typname = 'type_status'`;
    assert(result.length === 1);
}

export default {
    domain,
    status
}
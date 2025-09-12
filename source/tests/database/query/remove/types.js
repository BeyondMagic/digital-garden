import { sql } from "bun";
import { assert } from "@/logger";

import types from "@/database/query/remove/types";

/**
 * Test if the "domain" type was removed correctly and there are no other types with the same name.
 **/
async function domain ()
{   
    await types.domain();
    const result = await sql`SELECT * FROM pg_type WHERE typname = 'type_domain'`;
    assert(result.length === 0);
}

/**
 * Test if the "status" type was removed correctly and there are no other types with the same name.
 */
async function status ()
{
    await types.status();
    const result = await sql`SELECT * FROM pg_type WHERE typname = 'type_status'`;
    assert(result.length === 0);
}

export default {
    domain,
    status
}
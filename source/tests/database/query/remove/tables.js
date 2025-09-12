import { sql } from "bun";
import { assert } from "@/logger";

import tables from "@/database/query/remove/tables";
import types from "@/database/query/remove/types";

/**
 * Test if the table "domain" was removed correctly and there are no other tables with the same name.
 **/
async function domain ()
{
    await types.status();
    await types.domain();
    await tables.domain();
    const result = await sql`SELECT * FROM pg_tables WHERE tablename = 'domain'`;
    assert(result.length === 0);
}

/**
 * Test if the table "asset" was removed correctly and there are no other tables with the same name.
 */
async function asset ()
{
    await tables.asset();
    const result = await sql`SELECT * FROM pg_tables WHERE tablename = 'asset'`;
    assert(result.length === 0);
    await domain();
}

export default {
    domain,
    asset,
}
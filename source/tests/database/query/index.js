import create from '@/tests/database/query/create';
import remove from '@/tests/database/query/remove';

/**
 * Test if the type "domain" creation and removal works.
 */ 
async function create_remove_type_domain ()
{
	await create.types.domain();
	await remove.types.domain();
}

/**
 * Test if the type "status" creation and removal works.
 */
async function create_remove_type_status ()
{
	await create.types.status();
	await remove.types.status();
}

/**
 * Test if the table "domain" creation and removal works.
 */
async function create_remove_table_domain ()
{
	await create.tables.domain();
	await remove.tables.domain();
}

/**
 * Test if the table "asset" creation and removal works.
 */
async function create_remove_table_asset ()
{
	await create.tables.asset();
	await remove.tables.asset();
}

export default {
	create,
	remove,
};

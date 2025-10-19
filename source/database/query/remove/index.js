import { types } from '@/database/query/remove/types';
import { tables } from '@/database/query/remove/tables';
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

async function schema() {
	await tables.asset();
	await tables.domain();

	await types.status();
	await types.domain();
}

schema.test = async function () {
	types.status.test();
	types.domain.test();

	tables.domain.test();
	tables.asset.test();
}

export const remove = {
	schema,
};
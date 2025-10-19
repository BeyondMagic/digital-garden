import { tables } from '@/database/query/create/tables';
import { types } from '@/database/query/create/types';
import { exists } from '@/database/query/util';
import { assert } from '@/logger';

async function schema() {
	await types.domain();
	await types.status();

	await tables.domain();
	await tables.asset();
}

schema.test = async function () {
	types.domain.test();
	types.status.test();

	tables.domain.test();
	tables.asset.test();
};

export const create = {
	schema
};

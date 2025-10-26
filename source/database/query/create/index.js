import { tables } from '@/database/query/create/tables';
import { types } from '@/database/query/create/types';

async function schema() {
	await types.domain();
	await types.status();

	await tables.domain();
	await tables.asset();
	await tables.language();
}

schema.test = async function () {
	types.domain.test();
	types.status.test();

	tables.domain.test();
	tables.asset.test();
	tables.language.test();
};

export const create = {
	schema
};

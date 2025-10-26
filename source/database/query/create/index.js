import { tables } from '@/database/query/create/tables';
import { types } from '@/database/query/create/types';

async function schema() {
	await types.domain();
	await types.status();

	await tables.domain();
	await tables.asset();
	await tables.language();
	await tables.language_information();
	await tables.asset_information();
	await tables.tag();
}

schema.test = async () => {
	types.domain.test();
	types.status.test();

	tables.domain.test();
	tables.asset.test();
	tables.language.test();
	tables.language_information.test();
	tables.asset_information.test();
	tables.tag.test();
};

export const create = {
	schema
};

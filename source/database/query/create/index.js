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
	await tables.tag_requirement();
	await tables.tag_information();
	await tables.domain_tag();
	await tables.domain_asset();
	await tables.content();
	await tables.content_link();
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
	tables.tag_requirement.test();
	tables.tag_information.test();
	tables.domain_tag.test();
	tables.domain_asset.test();
	tables.content.test();
	tables.content_link.test();
};

export const create = {
	schema
};

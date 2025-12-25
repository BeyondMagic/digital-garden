/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { tables } from "@/database/query/create/tables";
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
	await tables.garden();
	await tables.garden_information();
	await tables.author();
	await tables.author_connection();
	await tables.author_garden();
	await tables.author_domain();
	await tables.author_content();
	await tables.module();
	await tables.module_event();
	await tables.module_event_subscription();
	await tables.module_event_subscription_domain();
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
	tables.garden.test();
	tables.garden_information.test();
	tables.author.test();
	tables.author_connection.test();
	tables.author_garden.test();
	tables.author_domain.test();
	tables.author_content.test();
	tables.module.test();
	tables.module_event.test();
	tables.module_event_subscription.test();
	tables.module_event_subscription_domain.test();
};

export const create = {
	schema
};

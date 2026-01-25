/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { tables } from "@/database/query/create/tables";
import { types } from "@/database/query/create/types";

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
	await tables.module_binding();
}

export const create = {
	schema,
};

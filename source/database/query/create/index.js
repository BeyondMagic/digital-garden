/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { tables } from "@/database/query/create/tables";
import { types } from "@/database/query/create/types";

async function schema() {
	if (!await types.domain.exists())
		await types.domain();
	if (!await types.subject_status.exists())
		await types.subject_status();
	if (!await tables.domain.exists())
		await tables.domain();
	if (!await tables.asset.exists())
		await tables.asset();
	if (!await tables.language.exists())
		await tables.language();
	if (!await tables.language_information.exists())
		await tables.language_information();
	if (!await tables.asset_information.exists())
		await tables.asset_information();
	if (!await tables.tag.exists())
		await tables.tag();
	if (!await tables.tag_requirement.exists())
		await tables.tag_requirement();
	if (!await tables.tag_information.exists())
		await tables.tag_information();
	if (!await tables.domain_tag.exists())
		await tables.domain_tag();
	if (!await tables.content.exists())
		await tables.content();
	if (!await tables.content_link.exists())
		await tables.content_link();
	if (!await tables.garden.exists())
		await tables.garden();
	if (!await tables.garden_information.exists())
		await tables.garden_information();
	if (!await tables.author.exists())
		await tables.author();
	if (!await tables.author_connection.exists())
		await tables.author_connection();
	if (!await tables.author_garden.exists())
		await tables.author_garden();
	if (!await tables.author_domain.exists())
		await tables.author_domain();
	if (!await tables.author_content.exists())
		await tables.author_content();
	if (!await tables.module.exists())
		await tables.module();
}

export const create = {
	schema,
};

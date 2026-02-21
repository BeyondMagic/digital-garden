/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { insert } from "@/database/query/insert";
import { select } from "@/database/query/select";
import { create_critical, create_debug, create_info } from "@/logger";

const debug = create_debug(import.meta.path);
const critical = create_critical(import.meta.path);
const info = create_info(import.meta.path);

export async function tables() {
	debug("Checkinig if seeding for tables was set.", {
		step: { current: 1, max: 2 },
	});

	if ((await select.count("garden")) > 0) {
		debug("Database already seeded.", { step: { current: 2, max: 2 } });
		return;
	}

	debug("Database not seeded.", { step: { current: 2, max: 2 } });

	debug("Seeding tables..", { step: { current: 1, max: 2 } });

	try {
		const domain_root = await insert.domain({
			id_domain_parent: null,
			id_domain_redirect: null,
			kind: "SUBDOMAIN",
			slug: null,
			status: "PRIVATE",
		});

		const asset_admin_profile_picture_path = `${import.meta.dir}/../public/image/digital-garden-girl.png`
		info(`Asset path\t→ ${asset_admin_profile_picture_path}`);

		const file = Bun.file(asset_admin_profile_picture_path);
		info(`Asset file\t→ ${file}`);

		const asset_admin_profile_picture = await insert.asset({
			id_domain: domain_root,
			slug: "admin-profile-picture.png",
			data: {
				blob: Bun.file(asset_admin_profile_picture_path),
			},
		});

		const author_admin = await insert.author({
			id_asset: asset_admin_profile_picture,
			email: "admin@localhost",
			name: "Admin",
			password: "admin",
		});

		insert.garden({
			id_domain: domain_root,
			id_asset: asset_admin_profile_picture,
			id_author: author_admin,
		});
	} catch (err) {
		critical("Error seeding tables.", { step: { current: 2, max: 2 } });
		critical(err);
		return;
	}

	debug("Done.", { step: { current: 2, max: 2 } });
}

export const seed = {
	tables,
};

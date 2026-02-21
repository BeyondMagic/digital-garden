/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { capability } from "@/app/public/capability";
import { seed } from "@/app/seed";
import { create } from "@/database/query/create";
import { remove } from "@/database/query/remove";

export async function setup() {
	await remove.garden();
	await create.schema();
	await capability.setup();
	await seed.tables();
}

export const app = {
	setup,
}
/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

import { create } from "@/database/query/create";
import { insert } from "@/database/query/insert";
import { reset } from "@/database/query/reset";
import { select } from "@/database/query/select";
// import { remove } from "@/database/query/remove";

export const query = {
	create,
	insert,
	reset,
	select,
	// remove,
};
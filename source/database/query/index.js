/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { create } from "@/database/query/create";
import { insert } from "@/database/query/insert";
import { reset } from "@/database/query/reset";
import { select } from "@/database/query/select";

export const query = {
	create,
	insert,
	reset,
	select,
};
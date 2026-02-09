/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { util } from "@/database/query/util";

async function domain() {
	await sql`
		CREATE TYPE TYPE_DOMAIN AS ENUM ('ROUTER', 'SUBDOMAIN');
	`;
}

domain.exists = async function () {
	return util.exists('type_domain', 'type');
}

async function subject_status() {
	await sql`
		CREATE TYPE TYPE_SUBJECT_STATUS AS ENUM ('PUBLIC', 'PRIVATE', 'ARCHIVED', 'DELETED');
	`;
}

subject_status.exists = async function () {
	return util.exists('type_subject_status', 'type');
}

export const types = {
	domain,
	subject_status,
};

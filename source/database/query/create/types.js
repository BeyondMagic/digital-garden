/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

async function domain() {
	await sql`
		CREATE TYPE TYPE_DOMAIN AS ENUM ('ROUTER', 'SUBDOMAIN');
	`;
}

async function status() {
	await sql`
		CREATE TYPE TYPE_STATUS AS ENUM ('PUBLIC', 'PRIVATE', 'ARCHIVED', 'DELETED');
	`;
}

export const types = {
	domain,
	status,
};

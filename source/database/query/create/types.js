/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";

/**
 * Create the domain type.
 * - TYPE_DOMAIN: The type of domain.
 * @returns {Promise<void>} A promise that resolves when the types are created.
 **/
async function domain() {
	await sql`
		CREATE TYPE TYPE_DOMAIN AS ENUM ('ROUTER', 'SUBDOMAIN');
	`;
}

/**
 * Create the status type.
 * - TYPE_STATUS: The status of the domain/content.
 * @returns {Promise<void>} A promise that resolves when the types are created.
 */
async function status() {
	await sql`
		CREATE TYPE TYPE_STATUS AS ENUM ('PUBLIC', 'PRIVATE', 'ARCHIVED', 'DELETED');
	`;
}

export const types = {
	domain,
	status,
};

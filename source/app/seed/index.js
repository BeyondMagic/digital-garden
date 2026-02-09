/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * TO-DO: main capabilitieas:
 * - POST/domain/add
 * - PUT/domain/update
 * - GET/domain/id
 */

/**
 * @import { RowIdentifier, DomainInput } from "@/database/query"
 * @import { Capability } from "@/module/api"
 */

import { insert } from "@/database/query/insert"
import { remove } from "@/database/query/remove"
import { json_to_response } from "@/module/api";
import { capability } from "@/module/api/capability";
import { create_debug, create_info } from "@/logger";

const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function add_domain(request) {

	const body = /** @type {DomainInput} */ (await request.json());

	const {
		id_domain_parent,
		id_domain_redirect,
		kind,
		slug,
		status,
	} = body;

	const id = await insert.domain({
		id_domain_parent,
		id_domain_redirect,
		kind,
		slug,
		status,
	});

	const result = { id_domain: id };

	return json_to_response(result);
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function remove_domain(request) {

	const body = /** @type {{id_domain: number}} */ (await request.json());

	await remove.domain({
		id: body.id_domain,
	});

	return new Response(null, { status: 204 });
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function update_domain(request) {
	// TO-DO
	return new Response("Not implemented", { status: 501, headers: { "content-type": "text/plain" } });
}

/**
 * @type {Array<Capability<any>>}
 */
const capabilities = [
	{
		method: "POST",
		slug: "domain/add",
		scope: "garden",
		name: "Add Domain",
		description: "Adds a new domain to the garden.",
		handler: add_domain,
		deprecation: null,
		input: {
			id_domain_parent: "number | null",
			id_domain_redirect: "number | null",
			kind: "string",
			slug: "string",
			status: "string",
			token: "string"
		},
		output: {
			id_domain: "number"
		}
	},
	{
		method: "DELETE",
		slug: "domain/remove",
		scope: "garden",
		name: "Remove Domain",
		description: "Removes a domain from the garden.",
		handler: remove_domain,
		deprecation: null,
		input: {
			id_domain: "number",
			token: "string"
		},
		output: null
	},
	{
		method: "PUT",
		slug: "domain/update",
		scope: "garden",
		name: "Update Domain",
		description: "Updates domain info in the garden.",
		handler: update_domain,
		deprecation: null,
		input: {
			id_domain: "number",
			id_domain_parent: "number | null",
			id_domain_redirect: "number | null",
			kind: "string",
			slug: "string",
			status: "string",
			token: "string"
		},
		output: null
	}
]

export async function setup() {
	debug("Setting up server capabilities...", { step: { current: 1, max: 2 } });

	for (const cap of capabilities)
		capability.register(cap.method, cap.slug, cap);

	debug("Server capabilities setup complete.", { step: { current: 2, max: 2 } });
}

export const seed = {
	capabilities,
	setup
}
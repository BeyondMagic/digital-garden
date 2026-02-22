/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @import { RowIdentifier, DomainInput } from "@/database/query"
 * @import { Capability } from "@/module/api"
 */

import { insert } from "@/database/query/insert";
import { remove } from "@/database/query/remove";
import { create_debug } from "@/logger";
import { json_to_response } from "@/module/api";
import { capability as api } from "@/module/api/capability";

const debug = create_debug(import.meta.path);

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function add_domain(request) {
	const body = /** @type {DomainInput} */ (await request.json());

	const { id_domain_parent, id_domain_redirect, kind, slug, status } = body;

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
	return new Response("Not implemented", {
		status: 501,
		headers: { "content-type": "text/plain" },
	});
}

/**
 * @param {Request} request
 * @return {Promise<Response>}
 */
async function author_login(request) {
	const body = /** @type {{email: string, password: string}} */ (
		await request.json()
	);

	const { email, password } = body;

	/**
	 * @type {{token: string}}
	 */
	const result = {
		// @ts-expect-error
		token: null
	}

	try {
		result.token = await insert.author_connection({
			email,
			password,
			device: "web", // @todo: get device info from request
		});
	} catch {
		return new Response("Invalid email or password", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});
	}

	return json_to_response(result);
}
/**
 * @type {Array<Capability<any>>}
 */
const capabilities = [
	// Domain
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
			token: "string",
		},
		output: {
			id_domain: "number",
		},
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
			token: "string",
		},
		output: null,
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
			token: "string",
		},
		output: null,
	},
	// Author
	// @todo: login/logout capabilities, which would create/remove author connections and return the token for the connection to be used in subsequent authenticated requests
	{
		method: "POST",
		slug: "author/login",
		scope: null,
		name: "Author Login",
		description: "Logs in an author and creates a new connection token.",
		handler: author_login,
		deprecation: null,
		input: {
			email: "string",
			password: "string",
		},
		output: {
			token: "string",
		}
	}
];

export async function setup() {
	debug("Setting up server capabilities...", { step: { current: 1, max: 3 } });

	for (const cap of capabilities)
		api.register(cap.method, cap.slug, cap);

	debug("Server capabilities setup complete.", {
		step: { current: 2, max: 3 },
	});

	// set up initial domains
}

export const capability = {
	setup,
};
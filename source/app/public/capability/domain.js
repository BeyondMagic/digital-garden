/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { insert } from "@/database/query/insert";
import { remove } from "@/database/query/remove";
import {
	json_to_response,
	not_implemented,
	validate_scope,
} from "@/module/api";

/**
 * @import { RequestCapability } from "@/module/api"
 * @import { DomainInput } from "@/database/query"
 */

/**
 * @import { Capability } from "@/module/api"
 */

/**
 * @param {RequestCapability} input
 * @returns {Promise<Response>}
 */
async function add_domain({ body, id_author }) {
	const { id_domain_parent, id_domain_redirect, kind, slug, status } =
		/** @type {DomainInput} */ (body);

	if (!id_author)
		return new Response("Unauthorized: Missing or invalid author ID", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});

	if (
		!(await validate_scope({
			id_author,
			scope: "domain",
			id_target: id_domain_parent,
		}))
	)
		return new Response("Forbidden: Insufficient permissions", {
			status: 403,
			headers: { "content-type": "text/plain" },
		});

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
 * @param {RequestCapability} input
 * @returns {Promise<Response>}
 */
async function remove_domain(input) {
	const body = /** @type {{id_domain: number}} */ (input.body);

	await remove.domain({
		id: body.id_domain,
	});

	return new Response(null, { status: 204 });
}

/**
 * @param {RequestCapability} _
 * @returns {Promise<Response>}
 */
async function update_domain(_) {
	// TO-DO
	return new Response("Not implemented", {
		status: 501,
		headers: { "content-type": "text/plain" },
	});
}

/**
 * @type {Array<Capability>}
 */
export const domain = [
	{
		method: "POST",
		slug: "domain/add",
		name: "Add Domain",
		description: "Adds a new domain to the garden.",
		handler: add_domain,
		deprecation: null,
		scope: "domain",
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
		name: "Remove Domain",
		description: "Removes a domain from the garden.",
		handler: remove_domain,
		deprecation: null,
		scope: "domain",
		input: {
			id_domain: "number",
			token: "string",
		},
		output: null,
	},
	{
		method: "PUT",
		slug: "domain/move",
		name: "Move Domain",
		description: "Moves a domain to a different parent domain in the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "domain",
		input: {
			id_domain: "number",
			id_domain_parent: "number | null",
			id_domain_redirect: "number | null",
		},
		output: null,
	},
	{
		method: "PUT",
		slug: "domain/update",
		name: "Update Domain",
		description: "Updates domain info in the garden.",
		handler: update_domain,
		deprecation: null,
		scope: "domain",
		input: {
			id_domain: "number",
			kind: "string",
			slug: "string",
			status: "string",
		},
		output: null,
	},
];
/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { insert } from "@/database/query/insert";
import { remove } from "@/database/query/remove";
import { json_to_response, not_implemented } from "@/module/api";

/**
 * @import { Capability } from "@/module/api"
 */

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
		token: null,
	};

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
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function author_logout(request) {
	const body = /** @type {{token: string}} */ (await request.json());

	const { token } = body;

	await remove.author_connection({
		token,
	});

	return new Response(null, { status: 204 });
}

/**
 * @type {Array<Capability>}
 */
export const author = [
	{
		method: "POST",
		slug: "author/login",
		name: "Author Login",
		description: "Logs in an author and creates a new connection token.",
		handler: author_login,
		deprecation: null,
		scope: null,
		input: {
			email: "string",
			password: "string",
		},
		output:
			null /** @todo: JWT token will come in the Set-Cookie header, not in the response body */,
	},
	{
		method: "POST",
		slug: "author/logout",
		name: "Author Logout",
		description: "Logs out an author and invalidates the connection token.",
		handler: author_logout,
		deprecation: null,
		scope: null,
		input: null,
		output: null,
	},
	{
		method: "POST",
		slug: "author/add",
		name: "Add Author",
		description: "Adds a new author to the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "garden",
		input: {
			id_asset: "number",
			email: "string",
			name: "string",
			password: "string",
		},
		output: {
			id_author: "number",
		},
	},
	{
		method: "DELETE",
		slug: "author/remove",
		name: "Remove Author",
		description: "Removes an author from the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "garden",
		input: {
			id_author: "number",
		},
		output: null,
	},
	{
		method: "PUT",
		slug: "author/update",
		name: "Update Author",
		description: "Updates author info in the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: null,
		input: {
			id_author: "number",
			id_asset: "number | undefined",
			email: "string | undefined",
			name: "string | undefined",
			password: "string | undefined",
		},
		output: null,
	},
];

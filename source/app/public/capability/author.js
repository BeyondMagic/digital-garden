/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { insert } from "@/database/query/insert";
import { remove } from "@/database/query/remove";
import { not_implemented } from "@/module/api";


/**
 * @import { RequestCapability, Capability } from "@/module/api"
 */

const refresh_cookie_name = "refresh_token";

/**
 * @param {Request} request
 * @param {string} name
 * @returns {string | null}
 */
function cookie_get(request, name) {
	const cookie_header = request.headers.get("cookie") || "";
	const cookie_parts = cookie_header.split(";").map((part) => part.trim());

	for (const cookie_part of cookie_parts) {
		const [cookie_name, ...cookie_value_parts] = cookie_part.split("=");

		if (cookie_name === name)
			return decodeURIComponent(cookie_value_parts.join("="));
	}

	return null;
}

/**
 * @param {string} token
 * @returns {string}
 */
function refresh_cookie_serialize(token) {
	return `${refresh_cookie_name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`;
}

/**
 * @returns {string}
 */
function refresh_cookie_clear() {
	return `${refresh_cookie_name}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/**
 * @param {RequestCapability} input
 * @return {Promise<Response>}
 */
async function author_login({ body }) {
	const { email, password } = /** @type {{email: string, password: string}} */ (
		body
	);

	/**
	 * @type {{ access_token: string, refresh_token: string }}
	 */
	let tokens;

	try {
		tokens = await insert.author_connection({
			email,
			password,
			device: "web" /** @todo: get device info from request */,
		});
	} catch {
		return new Response("Invalid email or password", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});
	}

	return new Response(JSON.stringify({ token: tokens.access_token }), {
		status: 200,
		headers: {
			"content-type": "application/json",
			"set-cookie": refresh_cookie_serialize(tokens.refresh_token),
		},
	});
}

/**
 * @param {RequestCapability} input
 * @returns {Promise<Response>}
 */
async function author_logout({ request, token }) {
	const refresh_token = cookie_get(request, refresh_cookie_name);

	await remove.author_connection({
		token: token ?? "",
	});

	if (refresh_token)
		await remove.author_refresh_connection({ token: refresh_token });

	return new Response(null, {
		status: 204,
		headers: {
			"set-cookie": refresh_cookie_clear(),
		},
	});
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

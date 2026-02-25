/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { capability } from "@/app/public/capability";
import { seed } from "@/app/seed";
import { create } from "@/database/query/create";
import { select } from "@/database/query/select";
import { jwt } from "@/jwt";
import { create_critical, create_error, create_info } from "@/logger";
import { get as get_capability } from "@/module/api/capability";
import { DEFAULT_CONTENT_TYPE, extension_to_content_type } from "@/util";

const critical = create_critical(import.meta.path);
const info = create_info(import.meta.path);
const error = create_error(import.meta.path);

/**
 * @import { Capability, HTTPMethod } from "@/module/api"
 */

export async function setup() {
	// await remove.garden();
	await create.schema();
	await seed.tables();
	await capability.setup();
}

/**
 * @param {Object} last - The last domain segment information.
 * @param {string} last.slug - The slug of the asset.
 * @param {number} last.id_domain - The ID of the domain associated with the asset.
 * @returns {Promise<Response>}
 */
export async function handle_asset(last) {
	info(`Asset request\t→ slug: ${last.slug}, id_domain: ${last.id_domain}`); // Log the asset request details

	/** @type {string} */
	let path;

	try {
		const asset = await select.asset({
			slug: last.slug,
			id_domain: last.id_domain,
		});
		path = asset.path;
	} catch (_) {
		error(
			`Asset not found\t→ slug: ${last.slug}, id_domain: ${last.id_domain}`,
		);
		return new Response("Asset/page not found", {
			status: 404,
			headers: { "content-type": "text/plain" },
		});
	}

	const file = Bun.file(path);
	if (!(await file.exists()))
		throw new Error(`Asset file not found at path: ${path}`);

	const file_extension = path.split(".").pop();
	const content_type =
		(file_extension && extension_to_content_type.get(file_extension)) ||
		DEFAULT_CONTENT_TYPE;

	return new Response(file, {
		headers: { "content-type": content_type },
	});
}

/**
 * @typedef {Object} APIRequestContext
 * @prop {Request} request - The incoming HTTP request object.
 * @prop {HTTPMethod} method - The HTTP method of the request (e.g., GET, POST).
 * @prop {string} slug - The slug representing the API endpoint being accessed.
 */

/**
 * Extracts the bearer token from the Authorization header of the request.
 * @todo - Move this function to a more appropriate module.
 * @param {Request} request - The incoming HTTP request object.
 * @returns {string | null} - The extracted token if present and syntactically valid, otherwise null.
 */
function extract_token(request) {
	const auth_header = request.headers.get("Authorization") || "";
	const [scheme, token] = auth_header.split(" ");

	if (scheme !== "Bearer" || !token) return null;

	return token;
}

/**
 * @param {string} token - The JWT token to be verified and from which to extract the author ID.
 * @returns {Promise<number | null>} - The extracted author ID if the token is valid and contains a valid subject, otherwise null.
 */
async function extract_id_author(token) {
	const payload = await jwt.verify({ token });
	const subject = payload.sub;

	if (typeof subject === "string") {
		const parsed_author_id = Number(subject);

		if (Number.isInteger(parsed_author_id) && parsed_author_id > 0)
			return parsed_author_id;
	}

	return null;
}

/**
 * @param {APIRequestContext} context - The context for handling the API request.
 * @returns
 */
export async function handle_api({ request, method, slug }) {
	info(`API Slug\t→ ${slug}`);

	/** @type {Capability} */
	let capability;
	try {
		capability = await get_capability(method, slug);
	} catch {
		error(`Capability not found\t→ ${slug}`);
		return new Response("Server/Module API not found", {
			status: 404,
			headers: { "content-type": "text/plain" },
		});
	}

	/** @type {Response} */
	let response;
	try {
		/** @type {unknown | null} */
		let body = null;

		try {
			body = await request.json();
		} catch (_) {
			body = null;
		}

		const token = extract_token(request);
		const id_author = token ? await extract_id_author(token) : null;

		response = await capability.handler({
			request,
			body,
			token,
			id_author,
		});
	} catch (err) {
		const error = /** @type {Error} */ (err);
		critical(`Error executing API handler\t→ ${slug}\n${error.stack}`);
		return new Response(`Error executing API handler: ${error.stack}`, {
			status: 500,
			headers: { "content-type": "text/plain" },
		});
	}

	if (!(response instanceof Response))
		return new Response("Invalid response from API handler", {
			status: 500,
			headers: { "content-type": "text/plain" },
		});

	return response;
}

/**
 * @param {Request} _ - The incoming HTTP request object.
 * @returns {Promise<Response>} - A Promise resolving to the HTTP response.
 */
export async function handle_request(_) {
	const page = `
	<body>
		<h1>
			Page response placeholder!!!
		</h1>
		<img width="50" height="50" src="admin-profile-picture.png"/>
	</body>
	`;

	return new Response(page, {
		status: 200,
		headers: { "content-type": "text/html" },
	});
}

export const app = {
	setup,
	handle_asset,
	handle_api,
	handle_request,
};

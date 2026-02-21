/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { capability } from "@/app/public/capability";
import { seed } from "@/app/seed";
import { create } from "@/database/query/create";
import { select } from "@/database/query/select";
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
 * @param {APIRequestContext} context - The context for handling the API request.
 * @returns
 */
export async function handle_api({ request, method, slug }) {
	info(`API Slug\t→ ${slug}`);

	/** @type {Capability<any>} */
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

	// TO-DO: handle scope and token.
	if (capability.scope) {
		info(`Capability scope\t→ ${capability.scope}`);
		// TO-DO: validate token and scope.
	}

	/** @type {Response} */
	let response;
	try {
		response = await capability.handler(request);
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
 * @param {Request} req - The incoming HTTP request object.
 * @returns {Promise<Response>} - A Promise resolving to the HTTP response.
 */
export async function handle_request(req) {
	return new Response(`<h1>Page response placeholder<img width="50" height="50" src="admin-profile-picture.png"/></h1>`, {
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

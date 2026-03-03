/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { html } from "@/app/html";
import { capability } from "@/app/public/capability";
import { seed } from "@/app/seed";
import { create } from "@/database/query/create";
import { select } from "@/database/query/select";
import { jwt } from "@/jwt";
import { create_critical, create_error, create_info } from "@/logger";
import { get as get_capability } from "@/module/api/capability";
import { hostname } from "@/setup";
import { DEFAULT_CONTENT_TYPE, extension_to_content_type } from "@/util";

const critical = create_critical(import.meta.path);
const info = create_info(import.meta.path);
const error = create_error(import.meta.path);

/**
 * @import { Capability, HTTPMethod } from "@/module/api"
 * @import { Domain, Language } from "@/database/query"
 */

/**
 * @param {string | null} origin
 * @returns {boolean}
 */
function is_allowed_asset_origin(origin) {
	if (!origin) return false;

	let parsed_origin;

	try {
		parsed_origin = new URL(origin);
	} catch {
		return false;
	}

	const origin_host = parsed_origin.hostname.toLowerCase();
	const host_root = hostname.toLowerCase();

	if (origin_host === host_root) return true;

	return origin_host.endsWith(`.${host_root}`);
}

export async function setup() {
	await create.schema();
	await seed.tables();
	await capability.setup();
}

/**
 * @typedef {Object} AssetRequestContext
 * @property {string} slug - The slug of the asset.
 * @property {number} id_domain - The domain id associated with the asset.
 * @property {Request} request - The incoming request used for CORS origin resolution.
 */

/**
 * @param {AssetRequestContext} last - The last domain segment information.
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
	const origin = last.request.headers.get("origin");
	const headers = new Headers({ "content-type": content_type });

	if (is_allowed_asset_origin(origin)) {
		headers.set("Access-Control-Allow-Origin", /** @type {string} */(origin));
		headers.set("Vary", "Origin");
	}

	return new Response(file, {
		headers,
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
 * @param {Request} request
 * @returns {boolean}
 */
function is_websocket_upgrade_request(request) {
	const upgrade = request.headers.get("upgrade");
	if (!upgrade) return false;

	return upgrade.toLowerCase() === "websocket";
}

/**
 * @param {string} token - The JWT token to be verified and from which to extract the author ID.
 * @returns {Promise<number | null>} - The extracted author ID if the token is valid and contains a valid subject, otherwise null.
 */
async function extract_id_author(token) {
	let payload;

	try {
		payload = await jwt.verify({ token });
	} catch {
		return null;
	}

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

	if (capability.adapter === "websocket")
		return new Response("Upgrade Required", {
			status: 426,
			headers: { "content-type": "text/plain" },
		});

	if (typeof capability.handler !== "function")
		return new Response("Invalid action capability handler", {
			status: 500,
			headers: { "content-type": "text/plain" },
		});

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
 * @param {{ request: Request, method: HTTPMethod, slug: string, server: import('bun').Server }} context
 * @returns {Promise<Response | undefined>}
 */
export async function handle_api_websocket({ request, method, slug, server }) {
	info(`API Websocket Slug\t→ ${slug}`);

	if (!is_websocket_upgrade_request(request))
		return new Response("Upgrade Required", {
			status: 426,
			headers: { "content-type": "text/plain" },
		});

	/** @type {Capability} */
	let capability;
	try {
		capability = await get_capability(method, slug);
	} catch {
		error(`Websocket capability not found\t→ ${slug}`);
		return new Response("Server/Module API not found", {
			status: 404,
			headers: { "content-type": "text/plain" },
		});
	}

	if (capability.adapter !== "websocket")
		return new Response("Capability does not support websocket", {
			status: 400,
			headers: { "content-type": "text/plain" },
		});

	if (typeof capability.upgrade !== "function")
		return new Response("Invalid websocket upgrade handler", {
			status: 500,
			headers: { "content-type": "text/plain" },
		});

	return await capability.upgrade({ request, server });
}

/**
 * @typedef {Object} ParsedAcceptLanguage
 * @property {string} slug
 * @property {number} quality
 */

/**
 * @param {string | null} header
 * @returns {Array<string>}
 */
function parse_accept_language_header(header) {
	if (!header) return [];

	/** @type {Array<ParsedAcceptLanguage>} */
	const parsed_entries = [];

	for (const raw_entry of header.split(",")) {
		const trimmed_entry = raw_entry.trim();
		if (trimmed_entry.length === 0) continue;

		const [slug_part, ...params] = trimmed_entry.split(";");
		const slug = slug_part ? slug_part.trim() : "";
		if (slug.length === 0) continue;

		let quality = 1;

		for (const parameter of params) {
			const [key, value] = parameter.split("=");
			if (key?.trim().toLowerCase() !== "q") continue;

			const parsed_quality = Number(value?.trim());
			if (!Number.isNaN(parsed_quality)) {
				quality = parsed_quality;
			}
		}

		if (quality <= 0) continue;

		parsed_entries.push({ slug, quality });
	}

	return parsed_entries
		.sort((entry_left, entry_right) => entry_right.quality - entry_left.quality)
		.map((entry) => entry.slug);
}

/**
 * @param {Array<string>} requested_slugs
 * @param {Array<Language>} available_languages
 * @returns {Language | null}
 */
function find_best_language(requested_slugs, available_languages) {
	if (available_languages.length === 0) return null;

	const available_by_slug = new Map(
		available_languages.map((language) => [
			language.slug.toLowerCase(),
			language,
		]),
	);

	for (const requested_slug of requested_slugs) {
		const exact_match = available_by_slug.get(requested_slug.toLowerCase());
		if (exact_match) return exact_match;
	}

	for (const requested_slug of requested_slugs) {
		const requested_base = requested_slug.split("-")[0]?.toLowerCase();
		if (!requested_base) continue;

		const base_match = available_languages.find((language) => {
			const language_base = language.slug.split("-")[0]?.toLowerCase();
			return language_base === requested_base;
		});

		if (base_match) return base_match;
	}

	const default_match = available_by_slug.get("en-us");
	if (default_match) return default_match;

	return available_languages[0] || null;
}

/**
 * @param {Request} request
 * @returns {Promise<Language | null>}
 */
async function resolve_language(request) {
	const available_languages = await select.language_all();
	if (available_languages.length === 0) return null;

	const requested_slugs = parse_accept_language_header(
		request.headers.get("accept-language"),
	);

	return find_best_language(requested_slugs, available_languages);
}

/**
 * @param {Domain} domain
 * @returns {string}
 */
function fallback_content_body(domain) {
	const domain_slug = domain.slug || "root";

	return /* html */ `
		<h1>No Content Yet</h1>
		<p>There is no content in the domain <strong>${domain_slug}</strong> yet.</p>
	`;
}

parse_accept_language_header.test = () => {
	const ordered = parse_accept_language_header("pt-BR, pt;q=0.9, en-US;q=0.8");

	if (ordered[0] !== "pt-BR")
		throw new Error(
			"parse_accept_language_header.test: expected first language to be pt-BR",
		);
	if (ordered[1] !== "pt")
		throw new Error(
			"parse_accept_language_header.test: expected second language to be pt",
		);
	if (ordered[2] !== "en-US")
		throw new Error(
			"parse_accept_language_header.test: expected third language to be en-US",
		);
};

find_best_language.test = () => {
	/** @type {Array<Language>} */
	const available_languages = [
		{ id: 1, id_asset: 1, slug: "en-US" },
		{ id: 2, id_asset: 2, slug: "pt-BR" },
	];

	const best_match = find_best_language(["pt"], available_languages);

	if (!best_match || best_match.slug !== "pt-BR")
		throw new Error(
			"find_best_language.test: expected base language match pt-BR",
		);
};

/**
 * @typedef {Object} PageRequestContext
 * @property {Request} request - The incoming HTTP request object.
 * @property {Array<Domain>} domain_tree - Resolved domain tree from root to leaf.
 */

/**
 * @param {PageRequestContext} context - The page request context.
 * @returns {Promise<Response>} - A Promise resolving to the HTTP response.
 */
export async function handle_request({ request, domain_tree }) {
	const current_domain = domain_tree[domain_tree.length - 1];

	if (!current_domain)
		return new Response("Domain not found", {
			status: 404,
			headers: { "content-type": "text/plain" },
		});

	const language = await resolve_language(request);
	const language_slug = language?.slug || "en-US";
	const language_id = language?.id || null;

	const content = language_id
		? await select.content_by_domain_and_language({
			id_domain: current_domain.id,
			id_language: language_id,
		})
		: null;

	const garden_information = language_id
		? await select.garden_information_by_language({ id_language: language_id })
		: null;

	const fallback_synopsis = current_domain.slug
		? `No content was published in domain "${current_domain.slug}" yet.`
		: "No content was published in this domain yet.";

	const page = await html.build({
		domain: {
			status: current_domain.status,
			kind: current_domain.kind,
			slug: current_domain.slug,
		},
		content: {
			status: content?.status || "PUBLIC",
			title: content?.title || "No Content Yet",
			title_sub:
				content?.title_sub || "This domain has no published content yet",
			language: language_slug,
			synopsis: content?.synopsis || fallback_synopsis,
			body: content?.body || fallback_content_body(current_domain),
		},
		garden: {
			name: garden_information?.name || "Digital Garden",
			description:
				garden_information?.description ||
				"A personal collection of cultivated knowledge, ideas, and reflections.",
		},
	});

	return new Response(page, {
		status: 200,
		headers: { "content-type": "text/html" },
	});
}

export const app = {
	setup,
	handle_asset,
	handle_api,
	handle_api_websocket,
	handle_request,
};

/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { build_page_information } from "@/app/page-information";
import { select } from "@/database/query/select";
import { hostname } from "@/setup";

/**
 * @import { Capability, RequestCapability } from "@/module/api"
 * @import { Domain, DomainKind } from "@/database/query"
 */

/**
 * @typedef {Object} ResolveNavigationBody
 * @property {string} host
 * @property {string} path
 * @property {string | undefined} language
 */

/**
 * @typedef {Object} RouteResolution
 * @property {Array<{ value: string, kind: DomainKind }>} slugs
 * @property {Array<string>} subdomains
 * @property {Array<string>} routers
 * @property {Array<Domain>} domain_tree
 * @property {boolean} is_valid
 */

/**
 * @param {string | null} origin
 * @returns {boolean}
 */
function is_allowed_navigation_origin(origin) {
	if (!origin) return false;

	let parsed_origin;

	try {
		parsed_origin = new URL(origin);
	} catch {
		return false;
	}

	const origin_host = parsed_origin.hostname.toLowerCase();
	const root_host = hostname.toLowerCase();

	if (origin_host === root_host) return true;

	return origin_host.endsWith(`.${root_host}`);
}

/**
 * @param {Request} request
 * @param {Headers} headers
 */
function apply_navigation_cors_headers(request, headers) {
	const origin = request.headers.get("origin");

	if (!is_allowed_navigation_origin(origin)) return;

	headers.set("Access-Control-Allow-Origin", /** @type {string} */(origin));
	headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
	headers.set(
		"Access-Control-Allow-Headers",
		"Origin, Content-Type, Accept, Authorization",
	);
	headers.set("Vary", "Origin");
}

/**
 * @param {number} domains_length
 * @param {number} domain_tree_length
 * @returns {boolean}
 */
function is_valid_page_domain_tree(domains_length, domain_tree_length) {
	return domain_tree_length === domains_length + 1;
}

/**
 * @param {string} host
 * @returns {Array<string>}
 */
function parse_subdomains(host) {
	return host
		.replace(hostname, "")
		.split(".")
		.filter(Boolean);
}

/**
 * @param {string} path
 * @returns {Array<string>}
 */
function parse_routers(path) {
	return path.split("/").filter(Boolean);
}

/**
 * @param {Array<string>} subdomains
 * @param {Array<string>} routers
 * @returns {Array<{ value: string, kind: DomainKind }>}
 */
function build_slugs(subdomains, routers) {
	return /** @type {Array<{ value: string, kind: DomainKind }>} */ ([
		...subdomains.map((value) => ({ value, kind: "SUBDOMAIN" })),
		...routers.map((value) => ({ value, kind: "ROUTER" })),
	]);
}

/**
 * @param {string} host
 * @param {string} path
 * @returns {Promise<RouteResolution>}
 */
async function resolve_route(host, path) {
	const normalized_host = host.trim().toLowerCase();
	const normalized_path = path.trim();

	const subdomains = parse_subdomains(normalized_host);
	const routers = parse_routers(normalized_path);
	const slugs = build_slugs(subdomains, routers);

	const domain_tree = await select.domain_tree_by_slugs(slugs);
	const is_valid = is_valid_page_domain_tree(slugs.length, domain_tree.length);

	return {
		slugs,
		subdomains,
		routers,
		domain_tree,
		is_valid,
	};
}

/**
 * @param {Array<string>} subdomains
 * @param {Array<string>} routers
 * @returns {{ segments: Array<string>, root_index: number }}
 */
function build_breadcrumb_data(subdomains, routers) {
	return {
		segments: [...subdomains, hostname, ...routers],
		root_index: subdomains.length,
	};
}

/**
 * @param {RequestCapability} input
 * @returns {Promise<Response>}
 */
async function resolve_navigation({ request, body }) {
	const headers = new Headers({ "content-type": "application/json" });
	apply_navigation_cors_headers(request, headers);

	const payload = /** @type {ResolveNavigationBody} */ (body || {});
	const host = payload.host?.trim();
	const path = payload.path?.trim();

	if (!host || !path) {
		return new Response(
			JSON.stringify({
				error: "host and path are required",
			}),
			{ status: 400, headers },
		);
	}

	const route_resolution = await resolve_route(host, path);

	if (!route_resolution.is_valid) {
		return new Response(
			JSON.stringify({
				error: "Route not found",
				route: {
					host,
					path,
					is_found: false,
				},
			}),
			{ status: 404, headers },
		);
	}

	const current_domain =
		route_resolution.domain_tree[route_resolution.domain_tree.length - 1];

	if (!current_domain) {
		return new Response(
			JSON.stringify({
				error: "Route not found",
				route: {
					host,
					path,
					is_found: false,
				},
			}),
			{ status: 404, headers },
		);
	}

	const { information } = await build_page_information({
		request,
		current_domain,
		language_slug: payload.language,
	});

	const breadcrumb = build_breadcrumb_data(
		route_resolution.subdomains,
		route_resolution.routers,
	);

	const response_payload = {
		route: {
			host,
			path,
			is_found: true,
		},
		breadcrumb,
		information,
	};

	return new Response(JSON.stringify(response_payload), {
		status: 200,
		headers,
	});
}

/**
 * @param {RequestCapability} input
 * @returns {Promise<Response>}
 */
async function resolve_navigation_options({ request }) {
	const headers = new Headers();
	apply_navigation_cors_headers(request, headers);
	headers.set("content-type", "text/plain; charset=utf-8");
	headers.set("content-length", "0");

	return new Response(null, {
		status: 204,
		headers,
	});
}

/**
 * @type {Array<Capability>}
 */
export const navigation = [
	{
		method: "POST",
		slug: "navigation/resolve",
		name: "Resolve Navigation",
		description:
			"Resolves host and path into page information for client-side navigation without full page reload.",
		handler: resolve_navigation,
		deprecation: null,
		scope: null,
		input: {
			host: "string",
			path: "string",
			language: "string | undefined",
		},
		output: {
			route: "object",
			breadcrumb: "object",
			information: "object",
		},
	},
	{
		method: "OPTIONS",
		slug: "navigation/resolve",
		name: "Resolve Navigation (CORS Preflight)",
		description: "Handles CORS preflight requests for navigation route resolution.",
		handler: resolve_navigation_options,
		deprecation: null,
		scope: null,
		input: null,
		output: null,
	},
];

/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { select } from "@/database/query/select";

/**
 * @import { Domain, Language } from "@/database/query"
 */

/**
 * @typedef {Object} ParsedAcceptLanguage
 * @property {string} slug
 * @property {number} quality
 */

/**
 * @typedef {Object} BuildPageInformationInput
 * @property {Request} request
 * @property {Domain} current_domain
 * @property {string | undefined} language_slug
 */

/**
 * @typedef {Object} BuildPageInformationOutput
 * @property {{
 * domain: { status: string, kind: string, slug: string | null },
 * content: { status: string, title: string, title_sub: string, language: string, synopsis: string, body: string },
 * garden: { name: string, description: string }
 * }} information
 * @property {string} resolved_language_slug
 */

/**
 * @param {string | null} header
 * @returns {Array<string>}
 */
export function parse_accept_language_header(header) {
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
export function find_best_language(requested_slugs, available_languages) {
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
 * @param {string | undefined} language_slug
 * @returns {Promise<Language | null>}
 */
export async function resolve_language(request, language_slug) {
	if (language_slug && language_slug.trim().length > 0) {
		const language_from_slug = await select.language_by_slug({ slug: language_slug });
		if (language_from_slug) return language_from_slug;
	}

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

/**
 * @param {BuildPageInformationInput} input
 * @returns {Promise<BuildPageInformationOutput>}
 */
export async function build_page_information({
	request,
	current_domain,
	language_slug,
}) {
	const language = await resolve_language(request, language_slug);
	const resolved_language_slug = language?.slug || "en-US";
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

	return {
		resolved_language_slug,
		information: {
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
				language: resolved_language_slug,
				synopsis: content?.synopsis || fallback_synopsis,
				body: content?.body || fallback_content_body(current_domain),
			},
			garden: {
				name: garden_information?.name || "Digital Garden",
				description:
					garden_information?.description ||
					"A personal collection of cultivated knowledge, ideas, and reflections.",
			},
		},
	};
}

parse_accept_language_header.test = () => {
	const ordered = parse_accept_language_header("pt-BR, pt;q=0.9, en-US;q=0.8");

	if (ordered[0] !== "pt-BR")
		throw new Error("parse_accept_language_header.test: expected first language to be pt-BR");
	if (ordered[1] !== "pt")
		throw new Error("parse_accept_language_header.test: expected second language to be pt");
	if (ordered[2] !== "en-US")
		throw new Error("parse_accept_language_header.test: expected third language to be en-US");
};

find_best_language.test = () => {
	/** @type {Array<Language>} */
	const available_languages = [
		{ id: 1, id_asset: 1, slug: "en-US" },
		{ id: 2, id_asset: 2, slug: "pt-BR" },
	];

	const best_match = find_best_language(["pt"], available_languages);

	if (!best_match || best_match.slug !== "pt-BR")
		throw new Error("find_best_language.test: expected base language match pt-BR");
};

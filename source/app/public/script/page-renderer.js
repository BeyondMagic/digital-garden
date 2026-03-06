/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @typedef {Object} NavigationInformation
 * @property {{ title?: string, language?: string, body?: string, synopsis?: string }} [content]
 * @property {{ name?: string, description?: string }} [garden]
 */

/**
 * @typedef {Object} NavigationRoute
 * @property {string} host
 * @property {string} path
 * @property {boolean} is_found
 */

/**
 * @returns {HTMLDivElement | null}
 */
function get_content_body_container() {
	const container = document.querySelector("body > .middle.content > .body");
	if (!(container instanceof HTMLDivElement)) return null;
	return container;
}

/**
 * @param {NavigationRoute} route
 */
function apply_route_dataset(route) {
	document.body.dataset.route_host = route.host;
	document.body.dataset.route_path = route.path;
	document.body.dataset.route_found = route.is_found ? "true" : "false";
}

/**
 * @param {NavigationInformation} information
 */
function apply_information_to_document(information) {
	const content = information.content || {};
	const garden = information.garden || {};

	if (typeof content.language === "string" && content.language.length > 0) {
		document.documentElement.lang = content.language;
	}

	if (typeof content.title === "string" && typeof garden.name === "string") {
		document.title = `${content.title} - ${garden.name}`;
	}

	const meta_description = document.querySelector('meta[name="description"]');
	if (meta_description instanceof HTMLMetaElement) {
		const garden_description =
			typeof garden.description === "string" ? garden.description : "";
		const content_synopsis =
			typeof content.synopsis === "string" ? content.synopsis : "";
		meta_description.content = `${garden_description} ${content_synopsis}`.trim();
	}

	const body_container = get_content_body_container();
	if (body_container instanceof HTMLDivElement && typeof content.body === "string") {
		body_container.innerHTML = content.body;
	}
}

/**
 * @param {NavigationRoute} route
 */
export function render_not_found_route(route) {
	apply_route_dataset(route);
	document.title = "Page not found";

	const body_container = get_content_body_container();
	if (!(body_container instanceof HTMLDivElement)) return;

	body_container.innerHTML = `
		<h1>Page not found</h1>
		<p>The route <strong>${route.path}</strong> was not found.</p>
	`;
}

/**
 * @param {NavigationRoute} route
 */
export function render_navigation_error(route) {
	apply_route_dataset(route);
	const body_container = get_content_body_container();
	if (!(body_container instanceof HTMLDivElement)) return;

	body_container.innerHTML = `
		<h1>Navigation error</h1>
		<p>Failed to load this page. Please try again.</p>
	`;
}

/**
 * @param {NavigationInformation} information
 * @param {NavigationRoute} route
 */
export function apply_navigation_payload(information, route) {
	apply_route_dataset(route);
	apply_information_to_document(information);
}

/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @typedef {Object} NavigationInput
 * @property {string} target_host
 * @property {string} target_path
 * @property {boolean} update_history
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
 * @typedef {Object} NavigationUpdatedDetail
 * @property {NavigationInformation} information
 * @property {NavigationRoute} route
 */

export const auto_navigation_updated_event_name = "auto-navigation:updated";

/**
 * @param {string | null} root_domain
 * @returns {string}
 */
function resolve_root_domain(root_domain) {
	const normalized_root_domain = root_domain?.trim();

	if (normalized_root_domain && normalized_root_domain.length > 0) {
		return normalized_root_domain;
	}

	return window.location.hostname;
}

/**
 * @param {string} root_domain
 * @returns {string}
 */
function build_navigation_api_url(root_domain) {
	const host_port = window.location.port ? `:${window.location.port}` : "";
	return `${window.location.protocol}//api.${root_domain}${host_port}/navigation/resolve`;
}

/**
 * @param {{
 * content?: { title?: string, language?: string, body?: string, synopsis?: string },
 * garden?: { name?: string, description?: string }
 * }} information
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

	const body_container = document.querySelector("body > .content > .body");
	if (body_container instanceof HTMLDivElement && typeof content.body === "string") {
		body_container.innerHTML = content.body;
	}
}

/**
 * Reusable API-driven page navigation component.
 */
class auto_navigation extends HTMLElement {
	static observedAttributes = ["root"];

	connectedCallback() {
		this.hidden = true;
		window.addEventListener("popstate", this);
	}

	disconnectedCallback() {
		window.removeEventListener("popstate", this);
	}

	/**
	 * @param {Event} event
	 */
	handleEvent(event) {
		console.log("auto_navigation event", event.type);
		if (event.type !== "popstate") return;

		this.navigate_to_location({
			target_host: window.location.hostname,
			target_path: window.location.pathname,
			update_history: false,
		});
	}

	attributeChangedCallback() {
		this.hidden = true;
	}

	/**
	 * @returns {string}
	 */
	get_root_domain() {
		return resolve_root_domain(this.getAttribute("root"));
	}

	/**
	 * @returns {string}
	 */
	get_navigation_api_url() {
		return build_navigation_api_url(this.get_root_domain());
	}

	/**
	 * Public navigation API for other web components.
	 * @param {NavigationInput} input
	 * @returns {Promise<boolean>}
	 */
	async navigate_to_location({ target_host, target_path, update_history }) {
		try {
			const response = await fetch(this.get_navigation_api_url(), {
				method: "POST",
				headers: {
					"content-type": "application/json",
					accept: "application/json",
				},
				body: JSON.stringify({
					host: target_host,
					path: target_path,
					language: document.documentElement.lang,
				}),
			});

			if (!response.ok) return false;

			const payload = await response.json();
			const information = payload?.information;
			const route = payload?.route || {
				host: target_host,
				path: target_path,
				is_found: true,
			};

			if (!information) return false;

			apply_information_to_document(information);

			if (update_history && target_path !== window.location.pathname) {
				window.history.pushState({}, "", target_path);
			}

			/** @type {NavigationUpdatedDetail} */
			const detail = {
				information,
				route,
			};

			this.dispatchEvent(
				new CustomEvent(auto_navigation_updated_event_name, {
					detail: {
						...detail,
					},
					bubbles: true,
					composed: true,
				}),
			);

			return true;
		} catch {
			return false;
		}
	}
}

if (!customElements.get("auto-navigation")) {
	customElements.define("auto-navigation", auto_navigation);
}

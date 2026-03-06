/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
	apply_navigation_payload,
	render_navigation_error,
	render_not_found_route,
} from "/page-renderer.js";

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
		const fallback_route = {
			host: target_host,
			path: target_path,
			is_found: false,
		};

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

			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				if (response.status === 404) {
					const route = payload?.route || fallback_route;
					render_not_found_route(route);

					if (update_history && target_path !== window.location.pathname) {
						window.history.pushState({}, "", target_path);
					}

					this.dispatchEvent(
						new CustomEvent(auto_navigation_updated_event_name, {
							detail: {
								information: null,
								route,
							},
							bubbles: true,
							composed: true,
						}),
					);

					return true;
				}

				render_navigation_error(fallback_route);
				return false;
			}

			const information = payload?.information;
			const route = payload?.route || {
				host: target_host,
				path: target_path,
				is_found: true,
			};

			if (!information) return false;

			apply_navigation_payload(information, route);

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

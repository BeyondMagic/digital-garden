/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import "/auto-navigation.js";
import "/auto-breadcrumb.js";
import { apply_navigation_payload } from "/page-renderer.js";

/**
 * @returns {string}
 */
function resolve_root_domain() {
	const navigation_element = document.querySelector("auto-navigation");
	if (!(navigation_element instanceof HTMLElement)) {
		return window.location.hostname;
	}

	const root_domain = navigation_element.getAttribute("root")?.trim();
	if (root_domain && root_domain.length > 0) return root_domain;
	return window.location.hostname;
}

/**
 * @param {string} root_domain
 */
function connect_navigation_and_breadcrumb(root_domain) {
	const navigation_element = document.querySelector("auto-navigation");
	if (navigation_element instanceof HTMLElement) {
		navigation_element.setAttribute("root", root_domain);
	}

	const breadcrumb_element = document.querySelector("auto-breadcrumb");
	if (breadcrumb_element instanceof HTMLElement) {
		breadcrumb_element.setAttribute("root", root_domain);
	}
}

/**
 * Align initial SSR state with client renderer state model.
 */
function bootstrap_initial_route_state() {
	const route = {
		host: window.location.hostname,
		path: window.location.pathname,
		is_found: true,
	};

	const information = {
		content: {
			language: document.documentElement.lang,
		},
		garden: {},
	};

	apply_navigation_payload(information, route);
}

/**
 * Initializes central page renderer entrypoint.
 */
function bootstrap_page() {
	const root_domain = resolve_root_domain();
	connect_navigation_and_breadcrumb(root_domain);
	bootstrap_initial_route_state();
}

bootstrap_page();

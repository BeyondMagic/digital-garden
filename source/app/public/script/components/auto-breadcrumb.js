/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @returns {string[]} Hostname and pathname segments for breadcrumb rendering.
 */
function get_location_segments() {
	const hostname_segment = window.location.hostname.trim();
	const pathname_segments = window.location.pathname
		.split("/")
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0);

	if (hostname_segment.length > 0) {
		return [hostname_segment, ...pathname_segments];
	}

	return pathname_segments;
}

/**
 * @param {Document} document_ref
 * @param {string} class_name
 * @param {string} text_content
 * @returns {HTMLSpanElement}
 */
function create_span_node(document_ref, class_name, text_content) {
	const node = document_ref.createElement("span");
	node.className = class_name;
	node.textContent = text_content;
	return node;
}

/**
 * @param {Document} document_ref
 * @returns {HTMLSpanElement}
 */
function create_add_separator_node(document_ref) {
	const add_node = create_span_node(document_ref, "separator add", "");
	const marker_node = document_ref.createElement("span");
	add_node.appendChild(marker_node);
	return add_node;
}

/**
 * @param {Document} document_ref
 * @returns {DocumentFragment}
 */
function create_breadcrumb_fragment(document_ref) {
	const fragment = document_ref.createDocumentFragment();
	const segments = get_location_segments();

	fragment.appendChild(create_add_separator_node(document_ref));

	for (let index = 0; index < segments.length; index += 1) {
		const segment = segments[index];
		if (segment === undefined) {
			continue;
		}

		const is_last = index === segments.length - 1;
		const slug_class_name = is_last ? "slug active" : "slug";
		fragment.appendChild(create_span_node(document_ref, slug_class_name, segment));

		if (!is_last) {
			fragment.appendChild(create_span_node(document_ref, "separator arrow", "＞"));
		}
	}

	fragment.appendChild(create_add_separator_node(document_ref));
	return fragment;
}

/**
 * Auto-generated visual breadcrumbs based on current location.
 */
class auto_breadcrumb extends HTMLElement {
	connectedCallback() {
		this.render();
		window.addEventListener("popstate", this);
	}

	disconnectedCallback() {
		window.removeEventListener("popstate", this);
	}

	/**
	 * @param {Event} event
	 */
	handleEvent(event) {
		if (event.type === "popstate") {
			this.render();
		}
	}

	render() {
		this.innerHTML = "";
		this.appendChild(create_breadcrumb_fragment(document));
	}
}

if (!customElements.get("auto-breadcrumb")) {
	customElements.define("auto-breadcrumb", auto_breadcrumb);
}
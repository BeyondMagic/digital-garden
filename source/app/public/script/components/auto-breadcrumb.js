/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @typedef {Object} LocationData
 * @property {Array<string>} segments
 * @property {number | null} root_index
 */

/**
 * @param {string | null} root_domain
 * @returns {{ hostname_segments: Array<string>, root_index_in_hostname: number | null }}
 */
function get_hostname_segments(root_domain) {
	const hostname_segment = window.location.hostname.trim();
	if (hostname_segment.length === 0) {
		return { hostname_segments: [], root_index_in_hostname: null };
	}

	const normalized_root = root_domain?.trim().toLowerCase() || "";
	if (normalized_root.length === 0) {
		return {
			hostname_segments: [hostname_segment],
			root_index_in_hostname: null,
		};
	}

	const normalized_hostname = hostname_segment.toLowerCase();

	if (normalized_hostname === normalized_root) {
		return {
			hostname_segments: [normalized_root],
			root_index_in_hostname: 0,
		};
	}

	if (!normalized_hostname.endsWith(`.${normalized_root}`)) {
		return {
			hostname_segments: [hostname_segment],
			root_index_in_hostname: null,
		};
	}

	const subdomain_prefix = hostname_segment.slice(
		0,
		hostname_segment.length - normalized_root.length - 1,
	);

	const subdomain_segments = subdomain_prefix
		.split(".")
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0);

	return {
		hostname_segments: [...subdomain_segments, normalized_root],
		root_index_in_hostname: subdomain_segments.length,
	};
}

/**
 * @param {string | null} root_domain
 * @returns {LocationData} Hostname and pathname segments for breadcrumb rendering.
 */
function get_location_segments(root_domain) {
	const { hostname_segments, root_index_in_hostname } =
		get_hostname_segments(root_domain);

	const pathname_segments = window.location.pathname
		.split("/")
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0);

	if (hostname_segments.length === 0) {
		return {
			segments: pathname_segments,
			root_index: null,
		};
	}

	return {
		segments: [...hostname_segments, ...pathname_segments],
		root_index: root_index_in_hostname,
	};
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
 * @param {string | null} root_domain
 * @returns {DocumentFragment}
 */
function create_breadcrumb_fragment(document_ref, root_domain) {
	const fragment = document_ref.createDocumentFragment();
	const location_data = get_location_segments(root_domain);
	const { segments, root_index } = location_data;

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
			const separator_symbol =
				root_index !== null && index + 1 === root_index
					? "＜"
					: "＞";

			fragment.appendChild(
				create_span_node(document_ref, "separator arrow", separator_symbol),
			);
		}
	}

	fragment.appendChild(create_add_separator_node(document_ref));
	return fragment;
}

/**
 * Auto-generated visual breadcrumbs based on current location.
 */
class auto_breadcrumb extends HTMLElement {
	static observedAttributes = ["root"];

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

	attributeChangedCallback() {
		this.render();
	}

	render() {
		this.innerHTML = "";
		const root_domain = this.getAttribute("root");
		this.appendChild(create_breadcrumb_fragment(document, root_domain));
	}
}

if (!customElements.get("auto-breadcrumb")) {
	customElements.define("auto-breadcrumb", auto_breadcrumb);
}
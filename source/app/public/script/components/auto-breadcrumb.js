/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const auto_navigation_updated_event_name = "auto-navigation:updated";

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
 * @param {LocationData} location_data
 * @returns {number | null}
 */
function get_active_segment_index(location_data) {
	const { segments, root_index } = location_data;

	if (segments.length === 0) {
		return null;
	}

	const pathname_segments = window.location.pathname
		.split("/")
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0);

	if (pathname_segments.length > 0) {
		return segments.length - 1;
	}

	if (root_index !== null && root_index > 0) {
		return root_index - 1;
	}

	return segments.length - 1;
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
	const active_index = get_active_segment_index(location_data);

	fragment.appendChild(create_add_separator_node(document_ref));

	for (let index = 0; index < segments.length; index += 1) {
		const segment = segments[index];
		if (segment === undefined) {
			continue;
		}

		const is_last = index === segments.length - 1;
		const is_active = active_index !== null && index === active_index;
		const slug_class_name = is_active ? "slug active" : "slug";
		const slug_node = create_span_node(document_ref, slug_class_name, segment);
		slug_node.dataset.index = String(index);
		fragment.appendChild(slug_node);

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
		this.addEventListener("click", this);
		document.addEventListener(auto_navigation_updated_event_name, this);
	}

	disconnectedCallback() {
		window.removeEventListener("popstate", this);
		this.removeEventListener("click", this);
		document.removeEventListener(auto_navigation_updated_event_name, this);
	}

	/**
	 * @param {Event} event
	 */
	handleEvent(event) {
		if (event.type === "popstate") {
			const navigation_element = this.get_navigation_element();
			if (!navigation_element) {
				this.render();
				return;
			}
			if (typeof navigation_element.navigate_to_location !== "function") {
				this.render();
				return;
			}

			navigation_element.navigate_to_location({
				target_host: window.location.hostname,
				target_path: window.location.pathname,
				update_history: false,
			});
			this.render();
			return;
		}

		if (event.type === "click") {
			this.on_click(event);
			return;
		}

		if (event.type === auto_navigation_updated_event_name) {
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

	/**
	 * @returns {string}
	 */
	get_root_domain() {
		const root_domain = this.getAttribute("root")?.trim();
		if (root_domain && root_domain.length > 0) return root_domain;

		return window.location.hostname;
	}

	/**
	 * @returns {(HTMLElement & { navigate_to_location?: Function }) | null}
	 */
	get_navigation_element() {
		const existing_navigation_element = document.querySelector("auto-navigation");

		if (existing_navigation_element instanceof HTMLElement) {
			existing_navigation_element.setAttribute("root", this.get_root_domain());
			return /** @type {HTMLElement & { navigate_to_location?: Function }} */ (existing_navigation_element);
		}

		const navigation_element = document.createElement("auto-navigation");
		navigation_element.setAttribute("root", this.get_root_domain());
		document.body.appendChild(navigation_element);

		return /** @type {HTMLElement & { navigate_to_location?: Function }} */ (navigation_element);
	}

	/**
	 * @param {Event} event
	 */
	on_click(event) {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const slug_node = target.closest(".slug");
		if (!(slug_node instanceof HTMLSpanElement)) return;
		if (slug_node.classList.contains("active")) return;

		const index_raw = slug_node.dataset.index;
		if (!index_raw) return;

		const clicked_index = Number(index_raw);
		if (!Number.isInteger(clicked_index)) return;

		const target_location = this.get_target_location(clicked_index);
		if (!target_location) return;

		event.preventDefault();
		event.stopPropagation();

		if (target_location.target_host !== window.location.hostname) {
			window.location.assign(
				`${window.location.protocol}//${target_location.target_host}${target_location.target_path}`,
			);
			return;
		}

		const navigation_element = this.get_navigation_element();
		if (!navigation_element) return;
		if (typeof navigation_element.navigate_to_location !== "function") return;

		navigation_element.navigate_to_location({
			target_host: target_location.target_host,
			target_path: target_location.target_path,
			update_history: true,
		});
	}

	/**
	 * @param {number} clicked_index
	 * @returns {{ target_host: string, target_path: string } | null}
	 */
	get_target_location(clicked_index) {
		const root_domain = this.get_root_domain();
		const location_data = get_location_segments(root_domain);
		const { segments, root_index } = location_data;

		if (root_index === null) return null;
		if (clicked_index < 0 || clicked_index >= segments.length) return null;

		const root_segment = segments[root_index];
		if (!root_segment) return null;

		const current_subdomains = segments.slice(0, root_index);

		if (clicked_index < root_index) {
			const target_subdomains = segments.slice(0, clicked_index + 1);
			const target_host = `${target_subdomains.join(".")}.${root_segment}`;
			return {
				target_host,
				target_path: "/",
			};
		}

		if (clicked_index === root_index) {
			return {
				target_host: root_segment,
				target_path: "/",
			};
		}

		const target_host =
			current_subdomains.length > 0
				? `${current_subdomains.join(".")}.${root_segment}`
				: root_segment;

		const target_path =
			`/${segments.slice(root_index + 1, clicked_index + 1).join("/")}` || "/";

		return {
			target_host,
			target_path,
		};
	}

}

if (!customElements.get("auto-breadcrumb")) {
	customElements.define("auto-breadcrumb", auto_breadcrumb);
}
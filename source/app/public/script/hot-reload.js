/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @returns {string}
 */
function get_ws_protocol() {
	return location.protocol === "https:" ? "wss:" : "ws:";
}

/**
 * @param {string} root_domain
 * @returns {string}
 */
function get_ws_host(root_domain) {
	const host_port = location.port ? `:${location.port}` : "";
	return `api.${root_domain}${host_port}`;
}

/**
 * @param {string} root_domain
 * @returns {string}
 */
function get_ws_url(root_domain) {
	return `${get_ws_protocol()}//${get_ws_host(root_domain)}/hot-reload`;
}

/**
 * @param {unknown} data_raw
 */
function handle_reload_message(data_raw) {
	const data_text = typeof data_raw === "string" ? data_raw : "";
	if (!data_text) return;

	if (data_text === "reload") {
		location.reload();
		return;
	}

	try {
		const message = JSON.parse(data_text);
		if (message && message.type === "reload") {
			location.reload();
		}
	} catch {
		// ignore invalid json messages
	}
}

/**
 * Hot reload custom element.
 */
class auto_hot_reload extends HTMLElement {
	static observedAttributes = ["root"];

	constructor() {
		super();

		/** @type {ShadowRoot} */
		this.shadow_root = this.attachShadow({ mode: "open" });

		/** @type {HTMLSpanElement} */
		this.indicator_element = document.createElement("span");

		/** @type {WebSocket | null} */
		this.socket = null;

		/** @type {number | null} */
		this.retry_timeout_id = null;

		this.retry_ms = 250;
		this.manually_closed = false;

		this.on_before_unload = this.on_before_unload.bind(this);

		const style_element = document.createElement("style");
		style_element.textContent = `
			:host {
				position: fixed;
				right: 0.5rem;
				bottom: 0.5rem;
				z-index: 9999;
				pointer-events: none;
			}

			.indicator {
				font-size: 0.875rem;
				line-height: 1;
				opacity: 0.8;
				user-select: none;
			}
		`;

		this.indicator_element.className = "indicator";
		this.indicator_element.textContent = "";

		this.shadow_root.appendChild(style_element);
		this.shadow_root.appendChild(this.indicator_element);
	}

	connectedCallback() {
		this.manually_closed = false;
		window.addEventListener("beforeunload", this.on_before_unload);
		this.reconnect_now();
	}

	disconnectedCallback() {
		this.manually_closed = true;
		window.removeEventListener("beforeunload", this.on_before_unload);
		this.clear_retry_timeout();
		this.close_socket();
		this.set_connected_indicator(false);
	}

	attributeChangedCallback() {
		if (!this.isConnected) return;
		this.reconnect_now();
	}

	on_before_unload() {
		this.manually_closed = true;
		this.clear_retry_timeout();
		this.close_socket();
		this.set_connected_indicator(false);
	}

	reconnect_now() {
		this.clear_retry_timeout();
		this.close_socket();
		this.retry_ms = 250;
		this.connect_socket();
	}

	connect_socket() {
		if (this.manually_closed) return;

		const root_domain = (this.getAttribute("root") || "").trim();
		if (root_domain.length === 0) {
			this.set_connected_indicator(false);
			return;
		}

		const ws_url = get_ws_url(root_domain);

		try {
			this.socket = new WebSocket(ws_url);
		} catch {
			this.schedule_reconnect();
			return;
		}

		this.socket.addEventListener("open", () => {
			this.retry_ms = 250;
			this.set_connected_indicator(true);
		});

		this.socket.addEventListener("message", (event) => {
			handle_reload_message(event.data);
		});

		this.socket.addEventListener("close", () => {
			this.socket = null;
			this.set_connected_indicator(false);
			this.schedule_reconnect();
		});

		this.socket.addEventListener("error", () => {
			// close event should follow in most browsers
		});
	}

	schedule_reconnect() {
		if (this.manually_closed) return;
		if (this.retry_timeout_id !== null) return;

		this.retry_timeout_id = window.setTimeout(() => {
			this.retry_timeout_id = null;
			this.connect_socket();
		}, this.retry_ms);

		this.retry_ms = Math.min(this.retry_ms * 2, 5000);
	}

	clear_retry_timeout() {
		if (this.retry_timeout_id === null) return;
		window.clearTimeout(this.retry_timeout_id);
		this.retry_timeout_id = null;
	}

	close_socket() {
		if (!this.socket) return;

		try {
			this.socket.close();
		} catch {
			// ignore close errors
		}

		this.socket = null;
	}

	/**
	 * @param {boolean} is_connected
	 */
	set_connected_indicator(is_connected) {
		this.indicator_element.textContent = is_connected ? "●" : "";
	}
}

if (!customElements.get("auto-hot-reload")) {
	customElements.define("auto-hot-reload", auto_hot_reload);
}

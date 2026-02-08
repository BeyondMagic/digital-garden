(() => {
	const template = document.createElement("template");
	template.innerHTML = `
<style>
:host {
	box-sizing: border-box;
	display: block;
	position: relative;

	/* Flex item behavior when placed inside ui-row or any flex container */
	flex: var(--box-grow, 0) var(--box-shrink, 1) var(--box-basis, auto);
	align-self: var(--box-align, auto);

	/* Sizing */
	width: var(--box-width, auto);
	height: var(--box-height, auto);
	min-width: var(--box-min-width, auto);
	min-height: var(--box-min-height, auto);
	max-width: var(--box-max-width, none);
	max-height: var(--box-max-height, none);

	/* Spacing */
	padding: var(--box-padding, 0);
	margin: var(--box-margin, 0);

	/* Decoration */
	background: var(--box-bg, transparent);
	border: var(--box-border, none);
	border-radius: var(--box-radius, 0);
	overflow: var(--box-overflow, visible);
}

slot {
	display: block;
	width: 100%;
	min-width: 0;
}

::slotted(*) {
	box-sizing: border-box;
}

/* Optional stacking mode (Compose-like Box). */
:host([stack]) slot {
	display: grid;
	grid-template-areas: "stack";
	place-items: var(--box-content-align, start);
	width: 100%;
	height: 100%;
}

:host([stack]) ::slotted(*) {
	grid-area: stack;
}
</style>
<slot></slot>
`;

	/**
	 * @param {HTMLElement} el
	 * @param {string} name
	 * @param {string | null | undefined} value
	 * @param {string | null | undefined} fallback
	 */
	function setCssVar(el, name, value, fallback) {
		if (value == null || value === "") {
			if (fallback == null) {
				el.style.removeProperty(name);
				return;
			}
			el.style.setProperty(name, fallback);
			return;
		}
		el.style.setProperty(name, String(value));
	}

	/**
	 * Map a small set of friendly tokens into valid CSS `place-items` values.
	 * @param {string | null} value
	 */
	function normalizeContentAlign(value) {
		const v = (value || "").trim().toLowerCase();
		if (!v) return "start";
		if (v === "start" || v === "center" || v === "end" || v === "stretch")
			return v;
		if (v === "top") return "start";
		if (v === "bottom") return "end";
		if (v === "top-start") return "start";
		if (v === "top-center") return "start center";
		if (v === "top-end") return "start end";
		if (v === "center-start") return "center start";
		if (v === "center-center" || v === "centered") return "center";
		if (v === "center-end") return "center end";
		if (v === "bottom-start") return "end start";
		if (v === "bottom-center") return "end center";
		if (v === "bottom-end") return "end";
		// Allow passing raw `place-items` values like "center start".
		return v;
	}

	customElements.define(
		"ui-box",
		class extends HTMLElement {
			static observedAttributes = [
				"stack",
				"expand",
				"grow",
				"shrink",
				"basis",
				"align",
				"width",
				"height",
				"min-width",
				"min-height",
				"max-width",
				"max-height",
				"padding",
				"margin",
				"bg",
				"border",
				"radius",
				"overflow",
				"content-align",
			];

			constructor() {
				super();
				const root = this.attachShadow({ mode: "open" });
				root.append(template.content.cloneNode(true));
			}

			connectedCallback() {
				this.#syncFromAttributes();
			}

			attributeChangedCallback() {
				this.#syncFromAttributes();
			}

			#syncFromAttributes() {
				const expand = this.hasAttribute("expand");
				const grow = this.getAttribute("grow");
				const shrink = this.getAttribute("shrink");
				const basis = this.getAttribute("basis");
				const align = this.getAttribute("align");
				const width = this.getAttribute("width");

				// Compose-like: `expand` means take remaining space (when parent constrains).
				// - default grow to 1 (weight) if not provided
				// - default basis to 0 so weights distribute predictably
				// - default align to stretch and width to 100% so it fills cross-axis in columns
				setCssVar(this, "--box-grow", grow, expand ? "1" : "0");
				setCssVar(this, "--box-shrink", shrink, "1");
				setCssVar(this, "--box-basis", basis, expand ? "0" : "auto");
				setCssVar(this, "--box-align", align, expand ? "stretch" : "auto");

				setCssVar(this, "--box-width", width, expand ? "100%" : "auto");
				setCssVar(this, "--box-height", this.getAttribute("height"), "auto");
				setCssVar(
					this,
					"--box-min-width",
					this.getAttribute("min-width"),
					"auto",
				);
				setCssVar(
					this,
					"--box-min-height",
					this.getAttribute("min-height"),
					"auto",
				);
				setCssVar(
					this,
					"--box-max-width",
					this.getAttribute("max-width"),
					"none",
				);
				setCssVar(
					this,
					"--box-max-height",
					this.getAttribute("max-height"),
					"none",
				);

				setCssVar(this, "--box-padding", this.getAttribute("padding"), "0");
				setCssVar(this, "--box-margin", this.getAttribute("margin"), "0");
				setCssVar(this, "--box-bg", this.getAttribute("bg"), "transparent");
				setCssVar(this, "--box-border", this.getAttribute("border"), "none");
				setCssVar(this, "--box-radius", this.getAttribute("radius"), "0");
				setCssVar(
					this,
					"--box-overflow",
					this.getAttribute("overflow"),
					"visible",
				);

				setCssVar(
					this,
					"--box-content-align",
					normalizeContentAlign(this.getAttribute("content-align")),
					"start",
				);
			}
		},
	);
})();

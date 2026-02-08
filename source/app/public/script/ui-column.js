(() => {
	const template = document.createElement("template");
	template.innerHTML = `
<style>
:host {
	box-sizing: border-box;
	display: flex;

	/* Flex item defaults (works inside my-row or any flex container). */
	flex: var(--grow, 1) var(--shrink, 1) var(--basis, 0);

	/* Optional explicit sizing overrides. */
	width: var(--width, auto);
	min-width: var(--min-width, auto);
	max-width: var(--max-width, none);

	/* Optional per-item alignment within a flex row/column. */
	align-self: var(--align, auto);
}

slot {
	display: flex;
	flex-direction: var(--direction, column);
	width: 100%;
	row-gap: var(--row-gap, 0);
}

::slotted(*) {
	box-sizing: border-box;
}
</style>
<slot></slot>
`;

	/**
	 * @param {HTMLElement} el
	 * @param {string} name
	 * @param {string | null | undefined} value
	 */
	function setCssVar(el, name, value) {
		if (value == null || value === "") {
			el.style.removeProperty(name);
			return;
		}
		el.style.setProperty(name, String(value));
	}

	customElements.define(
		"ui-column",
		class extends HTMLElement {
			static observedAttributes = [
				"grow",
				"shrink",
				"basis",
				"width",
				"min-width",
				"max-width",
				"align",
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
				setCssVar(this, "--grow", this.getAttribute("grow"));
				setCssVar(this, "--shrink", this.getAttribute("shrink"));
				setCssVar(this, "--basis", this.getAttribute("basis"));

				setCssVar(this, "--width", this.getAttribute("width"));
				setCssVar(
					this,
					"--min-width",
					this.getAttribute("min-width")
				);
				setCssVar(
					this,
					"--max-width",
					this.getAttribute("max-width")
				);

				setCssVar(this, "--align", this.getAttribute("align"));
			}
		},
	);
})();

(() => {
	const template = document.createElement("template");
	template.innerHTML = `
<style>
:host {
	box-sizing: border-box;
	display: flex;
	flex-grow: var(--grow, 0);
	flex-direction: var(--direction, row);
	flex-wrap: var(--wrap, nowrap);
	gap: var(--gap, 0);
	align-items: var(--align, stretch);
	justify-content: var(--justify, flex-start);
	max-width: 100%;
}

/* Provide an opt-in way to space slotted children without forcing it. */
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
		"ui-row",
		class extends HTMLElement {
			static observedAttributes = [
				"grow",
				"gap",
				"align",
				"justify",
				"wrap",
				"direction",
				"reverse",
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
				const grow = this.getAttribute("grow");
				const gap = this.getAttribute("gap");
				const align = this.getAttribute("align");
				const justify = this.getAttribute("justify");
				const wrap = this.getAttribute("wrap");
				const reverse = this.hasAttribute("reverse");
				const directionAttr = this.getAttribute("direction");

				let direction = directionAttr || "row";
				if (reverse) {
					if (direction === "row") direction = "row-reverse";
					if (direction === "column") direction = "column-reverse";
				}

				setCssVar(this, "--grow", grow);
				setCssVar(this, "--gap", gap);
				setCssVar(this, "--align", align);
				setCssVar(this, "--justify", justify);
				setCssVar(this, "--wrap", wrap);
				setCssVar(this, "--direction", direction);
			}
		},
	);
})();

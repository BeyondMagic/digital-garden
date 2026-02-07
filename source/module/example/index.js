import {
	Module,
} from "digital-garden";

/** @import { Author, Version, Capability } from "digital-garden" */

/**
 * @example Module
 * @description Example module extending the base Module class.
 * @extends Module
 */
class ExampleModule extends Module {
	static slug = "example-module";
	static name = "Example Module";
	static description = "This is an example module.";
	/**
	 * @type {Author[]}
	 */
	static authors = [
		{
			name: "John Doe",
			url: "https://johndoe.com",
			email: "john.doe@example.com"
		}
	];
	/** @type { Version } */
	static version = {
		major: 1,
		minor: 0,
		patch: 0
	};
	static deprecation = null;
	static subresource_integrity = "sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux7+4mC9p3pG5KkNf0h+Xr2Q5p6X9Y+N";

	/**
	 * @type {Capability[]}
	 */
	static capabilities = [
		{
			slug: "render",
			name: "Render Content",
			description: "Renders content based on the module's functionality.",
			method: "GET",
			scope: null,
			adapter: this.render,
			deprecation: null
		},
		{
			slug: "add-domain",
			name: "Add Domain",
			description: "Adds a new domain to the garden.",
			method: "POST",
			scope: "garden",
			adapter: this.add_domain,
			deprecation: null
		},
		{
			slug: "remove-domain",
			name: "Remove Domain",
			description: "Removes a domain from the garden.",
			method: "DELETE",
			scope: "garden",
			adapter: this.remove_domain,
			deprecation: null
		},
		{
			slug: "update-domain",
			name: "Update Domain",
			description: "Updates domain info in the garden.",
			method: "PUT",
			scope: "garden",
			adapter: this.update_domain,
			deprecation: null
		}
	];

	static async render() { }

	/**
	 * @typedef {Object} AddDomainParams - Parameters for adding a domain.
	 * @property {number | null} id_domain_parent - Optional ID of the parent domain for hierarchical structuring.
	 * @property {number | null} id_domain_redirect - Optional ID of a domain to redirect to, enabling aliasing or redirection capabilities.
	 * @property {string} kind - The kind of domain being added (e.g., "blog", "project", "personal").
	 * @property {string} slug - A unique slug for the domain, used for URL generation and identification.
	 * @property {string} status - The status of the domain (e.g., "active", "inactive", "archived").
	 * @property {string} token - Authentication token for validating permissions to add a domain.
	 */

	/**
	 * @param {AddDomainParams} params - Parameters for adding a domain.
	 * @returns {Promise<{ id_domain: number }>} Result of the add domain operation, including the ID of the newly added domain.
	 */
	static async add_domain({
		id_domain_parent,
		id_domain_redirect,
		kind,
		slug,
		status,
		token,
	}) {
		// Note: server will validate permissions based on token and scope before calling this capability.
		// The token, regardless of scope, is provided here for completeness.

		const id_domain = 42; insert.domain({
			id_domain_parent,
			id_domain_redirect,
			kind,
			slug,
			status,
		})

		return {
			id_domain,
		}
	}

	static async remove_domain({
		id_domain,
		token,
	}) {
		return {
			success: true,
		}
	}

	static async update_domain() { }
}

/**
 * Module entrypoint for dynamic loading.
 * @returns {typeof ExampleModule} The module class to register.
 */
function example_module() {
	return ExampleModule;
}

example_module.test = function () {
	const module_class = example_module();
	if (module_class !== ExampleModule) {
		throw new Error("example_module.test: expected ExampleModule to be returned");
	}
};

export { ExampleModule };
export default example_module;

/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { sql } from "bun";
import { select } from "@/database/query/select";
import { assert } from "@/logger";
import { create_register, create_remove, get } from "@/module/api/capability";

/**
 * @typedef {('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT')} HTTPMethod - HTTP methods for defining capabilities.
 */

/**
 * @typedef {Object} RequestCapability
 * @property {Request} request - The incoming HTTP request object.
 * @property {unknown | null} body - The parsed JSON body of the request.
 * @property {number | null} id_author - The ID of the authenticated author making the request (null if unauthenticated).
 */

/**
 * Scope levels for access control in capabilities.
 * 1. **garden**: grants access to the entire garden (all domains and content)
 * 2. **domain**: grants access to specific domains and its subdomains
 * 3. **content**: grants access to specific content items
 * @typedef {"garden" | "domain" | "content"} Scope
 */

/**
 * Scope levels for access control in capabilities.
 * 1. **garden**: grants access to the entire garden (all domains and content)
 * 2. **domain**: grants access to specific domains and its subdomains
 * 3. **content**: grants access to specific content items
 * 5. **null**:: indicates no specific scope (guest access)
 * @typedef {Scope | null} ScopeCapability
 */

/**
 * @typedef {Object} ValidateScopeInput
 * @property {Scope} scope - The required scope to check for in the token's claims.
 * @property {number} id_author - The ID of the authenticated author making the request.
 * @property {number | null} id_target - Must have target if scope is 'domain' or 'content', must not have target if scope is 'garden'.
 */

/**
 * @param {RequestCapability} _
 * @returns {Promise<Response>}
 */
export async function not_implemented(_) {
	return new Response("Not implemented", {
		status: 501,
		headers: { "content-type": "text/plain" },
	});
}

/**
 * Validates if the provided token has the required scope for accessing a capability, optionally checking against a specific target identifier for more granular permissions.
 * @example
 * const granted = await validate_scope({ id_author, scope: "garden" });
 * const granted = await validate_scope({ id_author, scope: "domain", target: 123 });
 * const granted = await validate_scope({ id_author, scope: "content", target: 456 });
 * const granted = await validate_scope({ id_author, scope: "author", target: 789 });
 * @param {ValidateScopeInput} input
 * @returns {Promise<boolean>} - Returns true if the token has the required scope, false otherwise.
 */
export async function validate_scope({ scope, id_target, id_author }) {
	assert(
		typeof id_author === "number" && Number.isInteger(id_author) && id_author > 0,
		"Invalid author ID",
	);
	assert(
		typeof scope === "string" &&
		["garden", "domain", "content"].includes(scope),
		"Invalid scope value",
	);
	assert(
		scope !== "garden" || id_target === undefined,
		`Target must not be provided for scope '${scope}'`,
	);
	assert(
		!["domain", "content"].includes(scope) ||
		(typeof id_target === "number" && Number.isInteger(id_target) && id_target > 0),
		`Target must be a number for scope '${scope}'`,
	);

	switch (scope) {
		case "garden": {
			const [row] = await sql`
				SELECT EXISTS(
					SELECT 1
					FROM garden
					WHERE id_author = ${id_author}
				) AS granted
			`;
			return Boolean(row?.granted);
		}
		case "content": {
			const content_target = /** @type {number} */ (id_target);

			const [row] = await sql`
				SELECT EXISTS(
					SELECT 1
					FROM author_content ac
					WHERE ac.id_author = ${id_author} AND ac.id_content = ${content_target}
				) AS granted
			`;
			return Boolean(row?.granted);
		}
		case "domain": {
			const domain_target = /** @type {number} */ (id_target);
			return await select.domain_tree_author_exists({
				id_domain: domain_target,
				id_author,
			});
		}
	}
}

/**
 * @typedef {Object} Author - Information about an author.
 * @property {string} name - Name of the author.
 * @property {string | null} url - URL to the author's website or profile.
 * @property {string | null} email - Email address of the author.
 */

/**
 * Version information of the module (semantic versioning).
 * @abstract
 * @static
 * @typedef {Object} Version - Semantic versioning information.
 * @property {number} major - Incompatible API changes.
 * @property {number} minor - Backwards-compatible functionality additions.
 * @property {number} patch - Backwards-compatible bug fixes.
 */

/**
 * @callback AsyncResponseFunction
 * @param {RequestCapability} context - The context of the incoming request, including the request object, parsed body, and authenticated author ID.
 * @returns {Promise<Response>}
 */

/**
 * @typedef {Object} Capability - Information about a module capability of adapter action.
 * @property {string} name - Human-readable name of the capability.
 * @property {string} description - Description of the capability.
 * @property {HTTPMethod} method - HTTP method (e.g., GET, POST, PUT, DELETE).
 * @property {string} slug - Unique identifier for the capability.
 * @property {AsyncResponseFunction} handler - Function that implements the capability's functionality, receives context and parameters as arguments.
 * @property {string | null} deprecation - Message providing details about the deprecation.
 * @property {ScopeCapability} scope - The required scope for accessing the capability, determining the level of access control.
 * @property {Object | null} input - Schema defining the expected input parameters for the capability, used for validation and documentation purposes.
 * @property {Object | null} output - Schema defining the expected output structure for the capability, used for validation and documentation purposes.
 */

/**
 * Converts a JavaScript object to a JSON response.
 * @param {Object} data - The input data for the capability, expected to match the defined input schema.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the result of the capability execution.
 */
export async function json_to_response(data) {
	return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json" },
	});
}

/**
 * Base class for all modules.
 * @abstract
 * @interface
 * @property {string} slug - Unique identifier for the module.
 * @property {string} name - Unique name of the module.
 * @property {string} description - Description of the module.
 * @property {Array<Author>} authors - List of authors of the module.
 * @property {Version} version - Version information of the module (semantic versioning).
 * @property {string | null} deprecation - Indicates if the module is deprecated, with an optional message providing details about the deprecation.
 * @property {string} subresource_integrity - Subresource integrity hash for the module, used to verify the integrity of the module's resources.
 * @property {Array<Capability>} capabilities - List of capabilities provided by the module, defining its functionality and how it can be interacted with.
 */
export class Module {
	/**
	 * Unique identifier for the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-expect-error
	static slug = null;

	/**
	 * Unique name of the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-expect-error
	static name = null;

	/**
	 * Description of the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-expect-error
	static description = null;

	/**
	 * List of authors of the module.
	 * @abstract
	 * @static
	 * @type {Array<Author>}
	 */
	// @ts-expect-error
	static authors = null;

	/** @type { Version } */
	static version = {
		// @ts-expect-error
		major: null,
		// @ts-expect-error
		minor: null,
		// @ts-expect-error
		patch: null,
	};

	/**
	 * Indicates if the module is deprecated.
	 * @abstract
	 * @static
	 * @type {string | null}
	 */
	static deprecation = null;

	/**
	 * Subresource integrity hash for the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-expect-error
	static subresource_integrity = null;

	/**
	 * List of capabilities provided by the module.
	 * @abstract
	 * @static
	 * @type {Array<Capability>}
	 */
	// @ts-expect-error
	static capabilities = "Disable this deprecation warning.";

	/**
	 * @constructor
	 * @throws {Error} Throws an error if the class is instantiated directly.
	 */
	constructor() {
		if (new.target === Module) {
			throw new Error("Cannot instantiate abstract class Module directly.");
		}
	}

	/**
	 * @typedef {Object} RequestBinding - Request binding information.
	 * @extends {Request} - Inherits from the standard Request object.
	 */
}

/**
 * @description Namespace for the digital garden module system, exposing the base Module class and other relevant types and utilities for module development.
 * @global
 */
export const api = {
	Module,
	capability: {
		get,
		create_register,
		create_remove,
	},
	json_to_response,
	not_implemented
};

globalThis["digital-garden"] = api;
/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use strict";

import { capability } from "@/module/api/capability";

/**
 * @typedef {('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT')} HTTPMethod - HTTP methods for defining capabilities.
 */

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
 * @template T
 * @callback AsyncResponseFunction
 * @param {T} data - Input parameter
 * @returns {Promise<Response>}
 */

/**
 * @typedef {'server' | 'garden' | 'domain' | 'content' | null} Scope - Scope types for module capabilities.
 */

/**
 * @template T
 * @typedef {Object} Capability - Information about a module capability of adapter action.
 * @property {string} name - Human-readable name of the capability.
 * @property {string} description - Description of the capability.
 * @property {HTTPMethod} method - HTTP method (e.g., GET, POST, PUT, DELETE).
 * @property {string} slug - Unique identifier for the capability.
 * @property {Scope} scope - Scope of the capability, requires **ID target** and **token** if set.
 * @property {AsyncResponseFunction<T>} handler - Function that implements the capability's functionality, receives context and parameters as arguments.
 * @property {string | null} deprecation - Message providing details about the deprecation.
 * @property {Object | null} input - Schema defining the expected input parameters for the capability, used for validation and documentation purposes.
 * @property {Object | null} output - Schema defining the expected output structure for the capability, used for validation and documentation purposes.
 */

/**
 * Converts a JavaScript object to a JSON response.
 * @param {Object} data - The input data for the capability, expected to match the defined input schema.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the result of the capability execution.
 */
async function json_to_response(data) {
	return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json" }
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
	// @ts-ignore -- ignore ts error for static field for jsdoc.
	static slug = null;

	/**
	 * Unique name of the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-ignore -- ignore ts error for static field for jsdoc.
	static name = null;

	/**
	 * Description of the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-ignore -- ignore ts error for static field for jsdoc.
	static description = null;

	/**
	 * List of authors of the module.
	 * @abstract
	 * @static
	 * @type {Array<Author>}
	 */
	// @ts-ignore -- ignore ts error for static field for jsdoc.
	static authors = null;

	/** @type { Version } */
	static version = {
		// @ts-ignore -- ignore ts error for static field for jsdoc.
		major: null,
		// @ts-ignore -- ignore ts error for static field for jsdoc.
		minor: null,
		// @ts-ignore -- ignore ts error for static field for jsdoc.
		patch: null
	};

	/**
	 * Indicates if the module is deprecated.
	 * @abstract
	 * @static
	 * @type {string | null}
	 */
	// @ts-ignore -- ignore ts error for static field for jsdoc.
	static deprecation = null;

	/**
	 * Subresource integrity hash for the module.
	 * @abstract
	 * @static
	 * @type {string}
	 */
	// @ts-ignore -- ignore ts error for static field for jsdoc.
	static subresource_integrity = null;

	/**
	 * List of capabilities provided by the module.
	 * @abstract
	 * @static
	 * @type {Array<Capability<any>>}
	 */
	// @ts-ignore -- ignore ts error for static field for jsdoc.
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
		create_register: capability.create_register,
		create_get: capability.create_get,
		create_remove: capability.create_remove,
	}
};

globalThis["digital-garden"] = api;

module.exports = api;
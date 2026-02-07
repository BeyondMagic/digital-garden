/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use strict";

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
 * @typedef {Object} Capability - Information about a module capability of adapter action.
 * @property {string} slug - Unique identifier for the capability.
 * @property {string} name - Human-readable name of the capability.
 * @property {string} description - Description of the capability.
 * @property {HTTPMethod} method - HTTP method (e.g., GET, POST, PUT, DELETE).
 * @property {Scope} scope - Scope of the capability, requires *ID target* and *token* if set.
 * @property {(context: any, params: any) => any} adapter - Adapter function that implements the capability's functionality, receives context and parameters as arguments.
 * @property {string | null} deprecation - Message providing details about the deprecation.
 */

/**
 * Base class for all modules.
 * @abstract
 * @class
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
	 * @typedef {('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT')} HTTPMethod - HTTP methods for defining capabilities.
	 */

	/**
	 * @typedef {'server' | 'garden' | 'domain' | 'content' | null} Scope - Scope types for module capabilities.
	 */

	/**
	 * List of capabilities provided by the module.
	 * @abstract
	 * @static
	 * @type {Capability[]}
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
const digital_garden = {
	Module,
};

globalThis["digital-garden"] = digital_garden;

module.exports = digital_garden;
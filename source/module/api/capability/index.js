/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @import { AsyncResponseFunction, HTTPMethod } from "@/module/api"
 * */

/**
 * Capability registry to store and manage module capabilities.
 * @type {Map<string, AsyncResponseFunction<any>>}
 */
const capabilities = new Map();

/**
 * @param {HTTPMethod} method
 * @param {string} slug 
 * @param {AsyncResponseFunction<any>} handler 
 */
export async function register(method, slug, handler) {

	const id = method + "/" + slug;

	if (capabilities.has(id))
		throw new Error(`Capability with id "${id}" is already registered.`);

	if (typeof handler !== "function")
		throw new TypeError(`Handler for capability "${id}" must be a function.`);

	capabilities.set(id, handler);
}

/**
 * @param {HTTPMethod} method
 * @param {string} slug
 * @returns {Promise<AsyncResponseFunction<any>>}
 */
export async function get(method, slug) {

	const id = method + "/" + slug;

	const handler = capabilities.get(id);

	if (!handler)
		throw new Error(`Capability with id "${id}" is not registered.`);

	return handler;
}

/**
 * @param {HTTPMethod} method
 * @param {string} slug
 */
export async function remove(method, slug) {

	const id = method + "/" + slug;

	if (!capabilities.has(id))
		throw new Error(`Capability with id "${id}" is not registered.`);

	capabilities.delete(id);
}

/**
 * Creates a function to register a capability handler for a specific module.
 * @param {string} module_slug Module capability slug.
 */
export async function create_register(module_slug) {
	/**
	 * Registers a capability handler for a specific module.
	 * @param {HTTPMethod} method HTTP method for the capability.
	 * @param {string} slug Unique identifier for the capability within the module.
	 * @param {AsyncResponseFunction<any>} handler Function that implements the capability's functionality.
	 */
	return async function (method, slug, handler) {
		return await register(method, module_slug + "/" + slug, handler);
	}
}

/**
 * Creates a function to retrieve a capability handler for a specific module.
 * @param {string} module_slug Module capability slug.
 */
export async function create_get(module_slug) {
	/**
	 * Retrieves a capability handler for a specific module.
	 * @param {HTTPMethod} method HTTP method for the capability.
	 * @param {string} slug Unique identifier for the capability within the module.
	 * @returns {Promise<AsyncResponseFunction<any>>} The capability handler function.
	 */
	return async function (method, slug) {
		return await get(method, module_slug + "/" + slug);
	}
}

/**
 * Creates a function to remove a capability handler for a specific module.
 * @param {string} module_slug Module capability slug.
 */
export async function create_remove(module_slug) {
	/**
	 * Removes a capability handler for a specific module.
	 * @param {HTTPMethod} method HTTP method for the capability.
	 * @param {string} slug Unique identifier for the capability within the module.
	 */
	return async function (method, slug) {
		return await remove(method, module_slug + "/" + slug);
	}
}

export const capability = {
	register,
	get,
	remove,
	create_register,
	create_get,
	create_remove
}
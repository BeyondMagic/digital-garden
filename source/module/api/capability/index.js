/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert, create_info } from "@/logger";

const info = create_info(import.meta.file);

/**
 * @import { HTTPMethod, Capability } from "@/module/api"
 * */

/**
 * Capability registry to store and manage module capabilities.
 * @type {Map<string, Capability<any>>}
 */
const capabilities = new Map();

const slug_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates a slug string against the defined pattern.
 * 
 * Pattern explanation:
 * - Allow only lowercase letters, numbers, and hyphens.
 * - Must start and end with a letter or number.
 * - Hyphens cannot be consecutive or at the start/end.
 * - Examples of valid slugs: "module1", "my-module", "module-123", "m1-m2-m3".
 * @param {string} slug Slug to validate.
 * @returns {Promise<boolean>} True if the slug is valid, false otherwise.
 */
async function validate_slug(slug) {
	if (typeof slug !== "string" || !slug_pattern.test(slug))
		return false;

	return true;
}

validate_slug.test = async function () {
	const slugs = [
		{
			str: "valid-slug-123",
			valid: true
		},
		{
			str: "invalid_slug",
			valid: false
		},
		{
			str: "invalid--slug",
			valid: false
		},
		{
			str: "-invalid-slug",
			valid: false
		},
		{
			str: "invalid-slug-",
			valid: false
		},
		{
			str: "validslug",
			valid: true
		},
		{
			str: "valid-slug",
			valid: true
		},
		{
			str: "valid-slug-123",
			valid: true
		},
		{
			str: "invalidSlug",
			valid: false
		},
		{
			str: "invalid slug",
			valid: false
		},
		{
			str: "/double/slash",
			valid: false
		}
	]

	for (const slug of slugs) {
		assert(typeof slug.str === "string");
		assert(typeof slug.valid === "boolean");
		const result = await validate_slug(slug.str);
		assert(result === slug.valid, `Slug validation failed for "${slug.str}". Expected ${slug.valid} but got ${result}.`);
		info(`Slug "${slug.str}" validation result: ${result} (expected: ${slug.valid})`);
	}
}

/**
 * Generates an error message for an invalid slug.
 * @param {string} slug Slug that failed validation.
 * @returns {Promise<string>} Error message for an invalid slug.
 */
async function invalid_slug_message(slug) {
	return `Invalid slug "${slug}". Slug must be lowercase, can contain numbers and hyphens, and cannot start or end with a hyphen.`;
}

/**
 * @param {HTTPMethod} method
 * @param {string} slug 
 * @param {Capability<any>} capability 
 */
export async function register(method, slug, capability) {

	if (!await validate_slug(slug))
		throw new Error(await invalid_slug_message(slug));

	const id = method + "/" + slug;

	if (capabilities.has(id))
		throw new Error(`Capability with id "${id}" is already registered.`);

	capabilities.set(id, capability);
}

/**
 * @param {HTTPMethod} method
 * @param {string} slug
 * @returns {Promise<Capability<any>>}
 */
export async function get(method, slug) {

	if (!await validate_slug(slug))
		throw new Error(await invalid_slug_message(slug));

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

	if (!await validate_slug(slug))
		throw new Error(await invalid_slug_message(slug));

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

	if (!await validate_slug(module_slug))
		throw new Error(await invalid_slug_message(module_slug));

	/**
	 * Registers a capability handler for a specific module.
	 * @param {HTTPMethod} method HTTP method for the capability.
	 * @param {string} slug Unique identifier for the capability within the module.
	 * @param {Capability<any>} capability The capability information object containing details about the capability, including the handler function.
	 */
	return async function (method, slug, capability) {
		return await register(method, module_slug + "/" + slug, capability);
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
	 * @returns {Promise<Capability<any>>} The capability handler function.
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
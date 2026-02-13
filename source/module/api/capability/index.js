/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { create_info } from "@/logger";

const info = create_info(import.meta.path);

/**
 * @import { HTTPMethod, Capability } from "@/module/api"
 * */

/**
 * Capability registry to store and manage module capabilities.
 * @type {Map<string, Capability<any>>}
 */
const capabilities = new Map();

/**
 * Registered module slugs.
 * @type {Set<string>}
 */
const modules_slugs = new Set();

const slug_pattern = /^(?!\/)(?!.*\/\/)(?!.*\/$)[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;

/**
 * Validates a slug string against the defined pattern.
 * 
 * Pattern explanation:
 * - Examples of valid slugs: "module/action", "module/action/subaction", "module-123/action".
 * @param {string} slug Slug to validate.
 * @returns {Promise<boolean>} True if the slug is valid, false otherwise.
 */
async function validate_slug(slug) {
	if (typeof slug !== "string" || !slug_pattern.test(slug))
		return false;

	return true;
}

validate_slug.test = async () => {
	const slugs = [
		{
			str: "/double/slash",
			valid: false
		},
		{
			str: "invalid-slug/",
			valid: false
		},
		{
			str: "valid-slug",
			valid: true
		},
		{
			str: "valid123-slug/subslug",
			valid: true
		},
		{
			str: "Invalid_Slug",
			valid: false
		},
		{
			str: "-starts-with-hyphen",
			valid: false
		},
		{
			str: "starts-with-hyphen-",
			valid: false
		},
		{
			str: "deep/nested/slug",
			valid: true
		},
		{
			str: "UPPERCASE/slug",
			valid: false
		}
	]

	const table = slugs.map(async slug => {
		const result = await validate_slug(slug.str);
		return {
			slug: slug.str,
			valid: slug.valid,
			result: result,
			expected: slug.valid == result
		};
	});
	const result_table = await Promise.all(table);

	info(result_table)
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

	info(`Registering capability\t→ ${id}`);

	capabilities.set(id, capability);
}

/**
 * @param {HTTPMethod} method
 * @param {string} slug
 * @returns {Promise<Capability<any>>}
 */
export async function get(method, slug) {

	info(`Getting capability\t→ ${method}/${slug}`);

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

	if (modules_slugs.has(module_slug))
		throw new Error(`Module slug "${module_slug}" is already registered.`);

	modules_slugs.add(module_slug);

	/**
	 * Registers a capability handler for a specific module.
	 * @param {HTTPMethod} method HTTP method for the capability.
	 * @param {string} slug Unique identifier for the capability within the module.
	 * @param {Capability<any>} capability The capability information object containing details about the capability, including the handler function.
	 */
	return async function (method, slug, capability) {
		const resolved_slug = "module/" + module_slug + "/" + slug;
		return await register(method, resolved_slug, capability);
	}
}

/**
 * Creates a function to remove a capability handler for a specific module.
 * @param {string} module_slug Module capability slug.
 */
export async function create_remove(module_slug) {

	if (!await validate_slug(module_slug))
		throw new Error(await invalid_slug_message(module_slug));

	/**
	 * Removes a capability handler for a specific module.
	 * @param {HTTPMethod} method HTTP method for the capability.
	 * @param {string} slug Unique identifier for the capability within the module.
	 */
	return async function (method, slug) {
		const resolved_slug = "module/" + module_slug + "/" + slug;
		return await remove(method, resolved_slug);
	}
}

export const capability = {
	register,
	get,
	remove,
	create_register,
	create_remove
}
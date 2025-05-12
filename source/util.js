import { $ } from "bun";

/**
 * Hash a string using the Bun password hashing algorithm and return it.
 * @param {string} str The string to hash.
 * @returns {Promise<string>}
 */
export async function hash (str)
{
	return Bun.password.hash(str);
}

/**
 * Hash a string using the Bun password hashing algorithm.
 * @param {string} str The string to hash.
 * @param {string} hash The hash to compare against.
 * @returns {Promise<boolean>}
 */
export async function hash_verify (str, hash)
{
	return Bun.password.verify(str, hash);
}

/**
 * Tagged template to parse CSS string.
 * @param {string} strings Outer content.
 * @param {string[]} values Inner content.
 * @returns {string} Parsed string.
 **/
export function css (strings, ...values)
{
	return String.raw(
		{
			raw: strings
		},
		...values
	).trim();
}

/**
 * Tagged template to parse Javascript string.
 * @param {string} strings Outer content.
 * @param {string[]} values Inner content.
 * @returns {string} Parsed string.
 **/
export function js (strings, ...values)
{
	return String.raw(
		{
			raw: strings
		},
		...values
	).trim();
}

/**
 * Tagged template to parse HTML string.
 * @param {string} strings Outer content.
 * @param {string[]} values Inner content.
 * @returns {string} Parsed string.
 **/
export function html (strings, ...values)
{
	return String.raw(
		{
			raw: strings
		},
		...values
	).trim();
}
/**
 * Tagged template to parse JSON string.
 * @param {string[]} messages Information to file.
 * @returns {void}
 */
export function debug (...messages)
{
	console.debug('[server]:', ...messages);
}

/**
 * Retrieve the root path of the GIT repository.
 * @returns {Promise<string>} Root path of the GIT repository.
 **/
async function git_root()
{
	return $`git rev-parse --show-toplevel`.text();
}

export const root = (await git_root()).trim();
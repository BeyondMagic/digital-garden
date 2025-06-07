import { $ } from "bun";
import { randomUUID } from 'node:crypto';

/**
 * Get the MIME type based on the file extension.
 * @param {string} extension - The file extension to get the MIME type for.
 * @returns {string} The corresponding MIME type or null if not found.
 */
export function mime_type (extension)
{
	switch (extension)
	{
		case "js":
		case "mjs":
			return "application/javascript";
		case "css":
		case "scss":
			return "text/css";
		case "html":
		case "htm":
			return "text/html";
		case "json":
		case "map":
			return "application/json";
		case "xml":
		case "xhtml":
			return "application/xml";
		case "pdf":
			return "application/pdf";
		case "zip":
		case "tar":
		case "gz":
		case "bz2":
		case "xz":
			return "application/zip";
		case "ico":
		case "cur":
			return "image/x-icon";
		case "bmp":
		case "dib":
			return "image/bmp";
		case "svg":
			return "image/svg+xml";
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		case "mp4":
			return "video/mp4";
		case "mp3":
			return "audio/mpeg";
		case "wav":
			return "audio/wav";
		case "ogg":
			return "audio/ogg";
		case "txt":
		case "text":
		default:
			return "text/plain";
	}
}

/**
 * Generate a random UUID.
 * @returns {Promise<string>} The path to the Bun executable.
 */
export async function random_uuid ()
{
	return randomUUID();
}

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
 * @param {TemplateStringsArray} strings Outer content.
 * @param {Array<string>} values Inner content.
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
 * @param {TemplateStringsArray} strings Outer content.
 * @param {Array<string>} values Inner content.
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
 * @param {TemplateStringsArray} strings Outer content.
 * @param {Array<string>} values Inner content.
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
 * @param {Array<any>} messages Information to file.
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

export default {
	mime_type,
	random_uuid,
	hash,
	hash_verify,
	css,
	js,
	html,
	debug,
	root
}
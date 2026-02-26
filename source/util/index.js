/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { access, mkdir, rm } from "node:fs/promises";

import { assert, create_debug, create_info } from "@/logger";

const debug = create_debug(import.meta.path);
const info = create_info(import.meta.path);

const MODULE_SLUG_ALPHABET =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MODULE_SLUG_PATTERN = /^[A-Za-z0-9]+$/;
const MODULE_SLUG_MAX_BYTE =
	Math.floor(256 / MODULE_SLUG_ALPHABET.length) * MODULE_SLUG_ALPHABET.length -
	1;
const MODULE_SLUG_LENGTH = 8;

/**
 * Map of file extensions to content types for automatic content-type setting.
 * @type {Map<string, string>}
 */
export const extension_to_content_type = new Map([

	// Text
	["txt", "text/plain"],
	["html", "text/html"],
	["css", "text/css"],

	// App
	["js", "application/javascript"],
	["json", "application/json"],

	// Image
	["png", "image/png"],
	["jpg", "image/jpeg"],
	["jpeg", "image/jpeg"],
	["gif", "image/gif"],
	["svg", "image/svg+xml"]
]);

export const DEFAULT_CONTENT_TYPE = "application/octet-stream";

/**
 * Check whether a filesystem path exists.
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function path_exists(path) {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

path_exists.test = async () => {
	const test_name = "path_exists";
	debug(`[${test_name}] checking existing paths.`);
	assert(await path_exists("./"));
	assert(await path_exists("./source"));
	assert(await path_exists("./source/module/git/util.js"));

	debug(`[${test_name}] checking non-existing paths.`);
	assert(!(await path_exists("/path/to/non-existing/file")));
	assert(!(await path_exists("./non-existing-file")));
	info(`[${test_name}] completed.`);
};

/**
 * Ensure a directory exists.
 * @param {string} directory
 * @returns {Promise<void>}
 */
async function ensure_directory(directory) {
	if (await path_exists(directory)) return;

	await mkdir(directory, { recursive: true });
}

ensure_directory.test = async () => {
	const test_name = "ensure_directory";
	const base_dir = `/tmp/${randomBytes(8).toString("hex")}`;
	const nested_dir = `${base_dir}/nested/dir`;
	debug(`[${test_name}] using directory: ${nested_dir}`);

	// Ensure the directories do not exist
	assert(!(await path_exists(base_dir)));
	assert(!(await path_exists(nested_dir)));

	// Create a nested directory structure
	await ensure_directory(nested_dir);
	assert(await path_exists(base_dir));
	assert(await path_exists(nested_dir));

	// Ensure calling ensure_directory on an existing path is a no-op
	await ensure_directory(nested_dir);
	assert(await path_exists(nested_dir));

	// Remove the directories
	await rm(base_dir, { recursive: true, force: true });
	info(`[${test_name}] removed directory: ${base_dir}`);
	info(`[${test_name}] completed.`);
};

/**
 * Check whether the provided slug is structurally valid.
 * @param {unknown} slug
 * @returns {slug is string}
 */
function is_valid_slug(slug) {
	return (
		typeof slug === "string" &&
		slug.length > 0 &&
		MODULE_SLUG_PATTERN.test(slug)
	);
}

is_valid_slug.test = () => {
	const test_name = "is_valid_slug";
	debug(`[${test_name}] checking valid slugs.`);
	assert(is_valid_slug("abcDEF123"));
	assert(is_valid_slug("A"));
	assert(is_valid_slug("Z9"));
	assert(is_valid_slug("0aB1cD2eF3"));

	debug(`[${test_name}] checking invalid slugs.`);
	assert(!is_valid_slug(""));
	assert(!is_valid_slug("abc_def"));
	assert(!is_valid_slug("abc-def"));
	assert(!is_valid_slug("abc.def"));
	assert(!is_valid_slug("abc def"));
	assert(!is_valid_slug("abc$def"));
	assert(!is_valid_slug(123));
	assert(!is_valid_slug(null));
	assert(!is_valid_slug(undefined));
	assert(!is_valid_slug({ slug: "abc" }));
	info(`[${test_name}] completed.`);
};

/**
 * Generate a random slug used to identify module directories.
 * @param {number} [length]
 * @returns {string}
 */
function generate_slug(length = MODULE_SLUG_LENGTH) {
	if (!Number.isInteger(length) || length <= 0)
		throw new Error("Slug length must be a positive integer.");

	let slug = "";

	while (slug.length < length) {
		const buffer = randomBytes(length);

		for (const byte of buffer) {
			if (byte > MODULE_SLUG_MAX_BYTE) continue;

			const index = byte % MODULE_SLUG_ALPHABET.length;
			slug += MODULE_SLUG_ALPHABET[index];

			if (slug.length === length) break;
		}
	}

	return slug;
}

generate_slug.test = () => {
	const test_name = "generate_slug";
	debug(`[${test_name}] starting...`);
	const slug1 = generate_slug();
	const slug2 = generate_slug();
	const slug3 = generate_slug(16);
	is_valid_slug(slug1);
	is_valid_slug(slug2);
	is_valid_slug(slug3);
	assert(slug1.length === MODULE_SLUG_LENGTH);
	assert(slug2.length === MODULE_SLUG_LENGTH);
	assert(slug3.length === 16);
	assert(slug1 !== slug2);
	info(`[${test_name}] generated slugs: ${slug1}, ${slug2}, ${slug3}`);
	info(`[${test_name}] completed.`);
};

/**
 * Check if a string looks like a local filesystem path.
 * @param {string} repository
 * @returns {boolean}
 */
function is_local_path(repository) {
	return (
		repository.startsWith(".") ||
		repository.startsWith("/") ||
		repository.startsWith("~/")
	);
}

is_local_path.test = () => {
	const test_name = "is_local_path";
	debug(`[${test_name}] starting...`);
	debug(`[${test_name}] checking local paths.`);
	assert(is_local_path("./repo.git"));
	assert(is_local_path("../repo.git"));
	assert(is_local_path("/absolute/path/repo.git"));
	assert(is_local_path("~/repo.git"));
	assert(is_local_path("C:\\absolute\\path\\repo.git"));

	debug(`[${test_name}] checking non-local paths.`);
	assert(!is_local_path("https://example.com/repo.git"));
	assert(!is_local_path("ftp://example.com/repo.git"));
	assert(!is_local_path("git@example.com:repo.git"));
	assert(!is_local_path("example.com:repo.git"));
	info(`[${test_name}] completed.`);
};

/**
 * @param {any} error
 * @returns {string}
 */
function read_shell_error(error) {
	if (!error) return "unknown git error";
	if (error.stderr) return error.stderr.toString();
	if (error.stdout) return error.stdout.toString();
	return error.message ?? String(error);
}

read_shell_error.test = () => {
	const test_name = "read_shell_error";
	debug(`[${test_name}] starting...`);

	const error1 = new Error("Test error message");
	assert(read_shell_error(error1) === "Test error message");
	const error2 = { stderr: Buffer.from("Git stderr message") };
	assert(read_shell_error(error2) === "Git stderr message");
	const error3 = { stdout: Buffer.from("Git stdout message") };
	assert(read_shell_error(error3) === "Git stdout message");
	const error4 = null;
	assert(read_shell_error(error4) === "unknown git error");
	info(`[${test_name}] completed.`);
};

export const util = {
	MODULE_SLUG_LENGTH,
	DEFAULT_CONTENT_TYPE,
	generate_slug,
	is_valid_slug,
	path_exists,
	ensure_directory,
	read_shell_error,
	is_local_path,
	extension_to_content_type,
};

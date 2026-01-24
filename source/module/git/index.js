/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { dirname, join } from "node:path";
import { $ } from "bun";

import { assert, create_debug, create_info, create_warn } from "@/logger";
import { util } from "./util.js";

const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);
const warn = create_warn(import.meta.file);

/**
 * Clone a repository into the given directory.
 * @param {string} repository
 * @param {string} directory
 * @returns {Promise<void>}
 */
async function clone_repository(repository, directory) {
	await util.ensure_directory(dirname(directory));

	debug(`Cloning repository "${repository}" into "${directory}"...`);

	try {
		await $`git clone --depth=1 ${repository} ${directory}`;
		info(`Repository "${repository}" cloned.`);
	} catch (error) {
		throw new Error(
			`Failed to clone repository ${repository}: ${util.read_shell_error(error)}`,
		);
	}
}

/**
 * Update an existing repository directory.
 * @param {string} directory
 * @returns {Promise<void>}
 */
async function update_repository(directory) {
	debug(`Updating repository in "${directory}"...`);

	try {
		await $`git -C ${directory} fetch --all --tags --prune`;
		await $`git -C ${directory} pull --ff-only`;
		info(`Repository "${directory}" updated.`);
	} catch (error) {
		warn(
			`Failed to update repository in ${directory}: ${util.read_shell_error(error)}`,
		);
		throw new Error(
			`Failed to update repository in ${directory}: ${util.read_shell_error(error)}`,
		);
	}
}

/**
 * Resolve a repository URL or local path to a working directory. When a local path is
 * provided, it must exist already and will be returned directly. For remote repositories,
 * the repo will be cloned or updated inside the base directory.
 * @param {string} repository
 * @param {string} slug
 * @param {string} base_directory
 * @returns {Promise<string>}
 */
async function ensure_repository(repository, slug, base_directory) {
	await util.ensure_directory(base_directory);

	if (util.is_local_path(repository)) {
		const normalized = repository.startsWith("~/")
			? join(process.env.HOME ?? "", repository.slice(2))
			: repository;

		const exists = await util.path_exists(normalized);
		if (!exists)
			throw new Error(`Local module path does not exist: ${normalized}`);

		return normalized;
	}

	if (!util.is_valid_slug(slug))
		throw new Error(`Invalid module slug: ${slug}`);

	const repository_directory = join(base_directory, slug);
	const exists = await util.path_exists(repository_directory);

	if (!exists) await clone_repository(repository, repository_directory);
	else await update_repository(repository_directory);

	return repository_directory;
}

/**
 * Check if the git executable is available in the environment.
 * @returns {Promise<boolean>}
 */
async function test_git() {
	try {
		await $`git --version`;
		return true;
	} catch (error) {
		warn(`git executable not available: ${util.read_shell_error(error)}`);
		return false;
	}
}

test_git.test = async () => {
	const test_name = "test_git";
	debug(`[${test_name}] checking git availability.`);
	const available = await test_git();
	assert(typeof available === "boolean");
	info(
		`[${test_name}] git executable is ${
			available ? "available" : "not available"
		}.`,
	);
};

export const git = {
	ensure_directory: util.ensure_directory,
	clone_repository,
	update_repository,
	ensure_repository,
	test_git,
};

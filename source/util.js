import { $ } from "bun";

/**
 * Tagged template to parse CSS string.
 * @param {string} strings Outer content.
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

export function debug (...message)
{
	console.debug('[server]:', ...message);
}

/**
 * Retrieve the root path of the GIT repository.
 **/
async function git_root()
{
	return $`git rev-parse --show-toplevel`.text();
}

export const root = (await git_root()).trim();

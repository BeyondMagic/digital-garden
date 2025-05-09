import { $ } from "bun";

/**
 * Retrieve the root path of the GIT repository.
 **/
async function git_root()
{
	return $`git rev-parse --show-toplevel`.text();
}

export const root = (await git_root()).trim();

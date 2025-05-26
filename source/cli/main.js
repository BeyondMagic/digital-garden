 import { serve } from "bun";
import { debug } from "@/util";
import { events } from "@/modules";
import * as database from "@/setup";

/**
 * @typedef {import("@/database/types").ModuleRender} ModuleRender
 */

/**
 * Get the module fetch function.
 * @returns {ModuleRender} - The fetch function of the core module.
 */
function get_module_fetch ()
{
	const func = events.get("request");

	if (!func || typeof func === "string")
		throw new Error("Must have a core module that process requests.");

	return func;
}


const module_fetch = get_module_fetch();

let ith = 0;


/**
 * Fetch function to handle incoming requests.
 * @param {Request} req - The request object from the client.
 * @returns {Promise<Response>} - The response object to be sent back to the client.
 */
async function fetch(req)
{
	debug("----------------------|----------------------");

	const regex = new RegExp(`^https?://|${database.domain}:${database.port}`);
	const url = req.url.replace(regex, "");

	debug(`[${++ith}] URL: "${url}"`);

	debug("----------------------|----------------------");

	return module_fetch({
		request: req,
		// domains: result.domains,
		// assets: assets,
	}, "request");
}

database.init();

const server = serve({
	port: database.port,
	hostname: database.domain,
	fetch,
	development: true,
});

debug(`Listening on ${server.url}`);

import { serve } from "bun";
import { debug } from "@/util";
import modules from "@/modules";
import { domain, port, init } from "@/setup";
import wrapper from "@/database/wrapper";

await modules.process();
const module_fetch = modules.fetch_handler("request");

let ith = 0;

/**
 * Regular expression that matches:
 * - URLs starting with `http://` or `https://`
 * - The domain and port defined in the setup
 * - Trailing slashes at the end of the URL
 */
const domain_regex = new RegExp(`^https?://|/+$`, 'g');

/**
 * Fetch function to handle incoming requests.
 * @param {Request} req - The request object from the client.
 * @returns {Promise<Response>} - The response object to be sent back to the client.
 */
async function fetch(req)
{
	debug("----------------------|----------------------");
	const url = req.url.replace(domain_regex, "");
	debug(`[${++ith}] URL: "${url}"`);
	debug("----------------------|----------------------");

	const result = await wrapper.process_domain_hierarchy(url);

	return module_fetch({
		request: req,
		...result,
	}, "request");
}

await init();

const server = serve({
	port: port,
	hostname: domain,
	fetch,
	development: true,
});

debug(`Listening on ${server.url}`);

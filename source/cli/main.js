import { serve } from "bun";
import { debug } from "@/util";
import modules from "@/modules";
import { domain, port, init } from "@/setup";
import wrapper from "@/database/wrapper";

debug(`[main] Starting server initialization...`);
debug(`[main] Target domain: ${domain}:${port}`);

debug(`[main] Loading modules...`);
await modules.process();
debug(`[main] Modules loaded successfully`);

const module_fetch = modules.fetch_handler("request");
debug(`[main] Request handler obtained from modules`);

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
	const request_id = ++ith;
	debug("=".repeat(50));
	debug(`[main] [${request_id}] New request received`);
	
	const url = req.url.replace(domain_regex, "");
	debug(`[main] [${request_id}] Original URL: "${req.url}"`);
	debug(`[main] [${request_id}] Cleaned URL: "${url}"`);
	debug(`[main] [${request_id}] Method: ${req.method}`);
	debug(`[main] [${request_id}] User-Agent: ${req.headers.get("user-agent") || "unknown"}`);

	debug(`[main] [${request_id}] Processing domain hierarchy...`);
	const result = await wrapper.process_domain_hierarchy(url);
	debug(`[main] [${request_id}] Domain processing complete`);

	const context = {
		request: req,
		...result,
	};

	debug(`[main] [${request_id}] Calling module handler...`);
	const response = await module_fetch(context, "request");
	debug(`[main] [${request_id}] Module handler returned response`);
	debug(`[main] [${request_id}] Response status: ${response.status}`);
	debug(`[main] [${request_id}] Response content-type: ${response.headers.get("content-type") || "unknown"}`);
	debug("=".repeat(50));

	return response;
}

debug(`[main] Initializing database...`);
await init();
debug(`[main] Database initialization complete`);

debug(`[main] Starting HTTP server...`);
const server = serve({
	port: port,
	hostname: domain,
	fetch,
	development: true,
});

debug(`[main] Server started successfully!`);
debug(`[main] Listening on ${server.url}`);
debug(`[main] Ready to accept requests...`);

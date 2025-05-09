import { serve } from "bun";
import { debug } from "@/util";
import { events, process_modules } from "@/modules";
import * as database from "@/database";

const module_fetch = await process_modules();

let ith = 0;

/**
 * @param {Request} req
 * @returns {Promise<Response>}
 */
async function fetch(req)
{
	debug(`Request: ${++ith}`);

	return module_fetch(req, "request");
}

database.init();

const server = serve({
	port: 3001,
	hostname: "0.0.0.0",
	fetch,
	development: true,
});

debug(`Listening on ${server.url}`);

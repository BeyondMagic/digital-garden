import { serve } from "bun";
import { debug } from "@/util";
import * as database from "@/database";

/**
 * @param {Request} req
 * @returns {Promise<Response>}
 */
async function fetch(req) {
	return new Response("Not Found", { status: 404 });
}

const server = serve({
	port: 3001,
	hostname: "0.0.0.0",
	fetch,
});

debug(`Listening on ${server.url}`);
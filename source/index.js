import { hostname, port, is_dev } from "./setup";
import { serve } from "bun";
import { create_debug, create_info } from "@/logger";

const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

debug("Starting the server...", { step: { current: 1, max: 2 } });

/**
 * 
 * @param {Request} req
 * @param {import('bun').Server} server
 **/
async function fetch(req, server)
{
    const url = new URL(req.url);

    debug(`→ ${req.method} ${url.pathname}`);

    if (url.pathname === "/health") {
        return new Response("ok", { headers: { "content-type": "text/plain" } });
    }

    info(`404 ${url.pathname}`);
    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain" } });
}

const server = serve({
    hostname,
    port,
    fetch,
    development: is_dev
})

info(`Listening on ${server.url}`, { step: { current: 2, max: 2 } });
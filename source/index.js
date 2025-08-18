import { serve } from "bun";
import { assert, create_debug } from "@/logger";

const debug = create_debug(import.meta.file);

assert(process.env.DOMAIN, "DOMAIN environment variable is not set");

const [
    hostname,
    port
] = process.env.DOMAIN.split(":");

debug("Starting the server...", { step: { current: 1, max: 2 } });
const server = serve({
    hostname,
    port,
    fetch,
    development: true
})

debug(`Listening on ${server.url}`, { step: { current: 2, max: 2 } });
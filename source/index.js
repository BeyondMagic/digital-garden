import { hostname, port, is_dev } from "./setup";
import { serve } from "bun";
import { create_debug, create_info } from "@/logger";

const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

debug("Starting the server...", { step: { current: 1, max: 2 } });

const server = serve({
    hostname,
    port,
    fetch,
    development: is_dev
})

info(`Listening on ${server.url}`, { step: { current: 2, max: 2 } });
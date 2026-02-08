/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { domain, hostname, is_dev, port } from "@/setup";
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
async function fetch(req, server) {
    const url = new URL(req.url);

    debug(`${req.method}\t\t→ ${url}`);

    const subdomains = url.host.replace(domain, "").split(".").filter(Boolean);
    // info(`Subdomains\t→ [${subdomains.join(", ") || "None"}]`);

    const routers = url.pathname.split("/").filter(Boolean);
    // info(`Routers\t→ [${routers.join(", ") || "None"}]`);

    const domains = [...subdomains.reverse(), ...routers].reverse();
    info(`Domains\t→ [${domains.join(", ") || "None"}]`);

    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain" } });
}

const server = serve({
    hostname,
    port,
    fetch,
    development: is_dev
})

info(`Listening on ${server.url}`, { step: { current: 2, max: 2 } });

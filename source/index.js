/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { domain, hostname, is_dev, port } from "@/setup";
import { serve } from "bun";
import { create_debug, create_info } from "@/logger";
import { capability } from "@/module/api/capability";

const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

debug("Starting the server...", { step: { current: 1, max: 2 } });

/** @import { AsyncResponseFunction, HTTPMethod } from "@/module/api" */

/**
 * 
 * @param {Request} req
 * @param {import('bun').Server} server
 **/
async function fetch(req, server) {
    const url = new URL(req.url);

    const method = /** @type {HTTPMethod} */ (req.method);

    debug(`${method}\t\t→ ${url}`);

    const subdomains = url.host.replace(domain, "").split(".").filter(Boolean);
    info(`Subdomains\t→ [${subdomains.join(", ") || "None"}]`);

    const routers = url.pathname.split("/").filter(Boolean);
    info(`Routers\t→ [${routers.join(", ") || "None"}]`);

    const domains = [...subdomains.reverse(), ...routers].reverse();
    info(`Domains\t→ [${domains.join(", ") || "None"}]`);

    // API logic
    if (subdomains.length === 1 && subdomains[0] === "api" && routers.length >= 1 && routers.length <= 2) {

        const slug = [method, ...routers].join('/');

        info(`API Slug\t→ ${slug}`);

        /** @type {AsyncResponseFunction<any>} */
        let handler;
        try {
            handler = await capability.get(method, slug);
        } catch {
            return new Response("Server/Module API not found", { status: 404, headers: { "content-type": "text/plain" } });
        }

        const response = await handler(req);

        if (!(response instanceof Response))
            return new Response("Invalid response from API handler", { status: 500, headers: { "content-type": "text/plain" } });

        return response;
    }

    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain" } });
}

const server = serve({
    hostname,
    port,
    fetch,
    development: is_dev
})

info(`Listening on ${server.url}`, { step: { current: 2, max: 2 } });

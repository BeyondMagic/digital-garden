/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { serve } from "bun";
import { app } from "@/app";
import {
    create_critical,
    create_debug,
    create_error,
    create_info,
} from "@/logger";
import { get as get_capability } from "@/module/api/capability";
import { hostname, is_dev, port } from "@/setup";

const debug = create_debug(import.meta.path);
const info = create_info(import.meta.path);
const error = create_error(import.meta.path);
const critical = create_critical(import.meta.path);

/** @import { Capability, HTTPMethod } from "@/module/api" */

/**
 *
 * @param {Request} req
 * @param {import('bun').Server} server
 **/
async function fetch(req, server) {
    const url = new URL(req.url);

    const method = /** @type {HTTPMethod} */ (req.method);

    debug(`${method}\t\t→ ${url}`);
    const host = /** @type {string} */ (url.host.split(":")[0]);
    info(`Host\t\t→ ${host}`);

    const subdomains = host.replace(hostname, "").split(".").filter(Boolean);
    info(`Subdomains\t→ [${subdomains.join(", ") || ""}]`);

    const routers = url.pathname.split("/").filter(Boolean);
    info(`Routers\t→ [${routers.join(", ") || ""}]`);

    const domains = [...subdomains.reverse(), ...routers].reverse();
    info(`Domains\t→ [${domains.join(", ") || ""}]`);

    // API logic
    if (
        subdomains.length === 1 &&
        subdomains[0] === "api" &&
        routers.length >= 1
    ) {
        const slug = routers.join("/");

        info(`API Slug\t→ ${slug}`);

        /** @type {Capability<any>} */
        let capability;
        try {
            capability = await get_capability(method, slug);
        } catch {
            error(`Capability not found\t→ ${slug}`);
            return new Response("Server/Module API not found", {
                status: 404,
                headers: { "content-type": "text/plain" },
            });
        }

        // TO-DO: handle scope and token.
        if (capability.scope) {
            info(`Capability scope\t→ ${capability.scope}`);
            // TO-DO: validate token and scope.
        }

        /** @type {Response} */
        let response;
        try {
            response = await capability.handler(req);
        } catch (err) {
            const error = /** @type {Error} */ (err);
            critical(`Error executing API handler\t→ ${slug}\n${error.stack}`);
            return new Response(`Error executing API handler: ${error.stack}`, {
                status: 500,
                headers: { "content-type": "text/plain" },
            });
        }

        if (!(response instanceof Response))
            return new Response("Invalid response from API handler", {
                status: 500,
                headers: { "content-type": "text/plain" },
            });

        return response;
    }

    return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain" },
    });
}

critical("server: Starting the server...", { step: { current: 1, max: 2 } });

const server = serve({
    hostname,
    port,
    fetch,
    development: is_dev,
});

critical(`server: Listening on ${server.url}`, { step: { current: 2, max: 2 } });

critical("app: Setting up the application...", { step: { current: 1, max: 2 } });

await app.setup();

critical("app: Application setup complete", { step: { current: 2, max: 2 } });

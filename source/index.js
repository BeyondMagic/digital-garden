/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { serve } from "bun";
import { app } from "@/app";
import { select } from "@/database/query/select";
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

/** @import { Domain } from "@/database/query" */

/**
 * Validate the domain tree against requested slugs.
 * @param {boolean} is_first_subdomain_api
 * @param {number} subdomains_length
 * @param {number} routers_length
 * @param {number} domains_length
 * @param {number} domain_tree_length
 * @returns {{ is_valid_domain_tree: boolean, is_asset_request: boolean, is_api: boolean }}
 */
function validate_domain_tree(
    is_first_subdomain_api,
    subdomains_length,
    routers_length,
    domains_length,
    domain_tree_length,
) {
    const is_api_host = subdomains_length === 1 && is_first_subdomain_api;
    const is_api = is_api_host && routers_length >= 1;

    if (is_api_host && routers_length === 0)
        return {
            is_valid_domain_tree: false,
            is_asset_request: false,
            is_api: false,
        };

    const expected_page_length = domains_length + 1;
    const expected_asset_length = domains_length;

    const is_valid_domain_tree = domain_tree_length === expected_page_length;
    const is_asset_request =
        !is_api_host && domain_tree_length === expected_asset_length;

    return { is_valid_domain_tree, is_asset_request, is_api };
}

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
    info(`Domains length\t→ ${domains.length}`);

    const domain_tree = await select.domain_tree_by_slugs(domains);
    info(`Domain tree length\t→ ${domain_tree.length}`);

    const { is_valid_domain_tree, is_asset_request, is_api } =
        validate_domain_tree(
            subdomains[0] === "api",
            subdomains.length,
            routers.length,
            domains.length,
            domain_tree.length,
        );

    info(`Domain tree valid\t→ ${is_valid_domain_tree}`);
    info(`Asset request\t→ ${is_asset_request}`);
    info(`API request\t→ ${is_api}`);

    if (!is_valid_domain_tree && !is_asset_request && !is_api) {
        info(
            "Domain tree length does not match expected lengths, so it's not resolveable.",
        );
        return new Response("Not resolveable.", {
            status: 404,
            headers: { "content-type": "text/plain" },
        });
    }

    if (is_asset_request) {
        const last_domain = domain_tree[domain_tree.length - 1];
        if (!last_domain)
            throw new Error(
                "Invalid asset request: last segment of domain tree should be null for asset requests",
            );

        const last_slug = routers[routers.length - 1];
        if (!last_slug)
            throw new Error(
                "Invalid asset request: last slug is missing in the URL path",
            );

        const last = {
            slug: last_slug,
            id_domain: last_domain.id,
        };

        if (!last.slug || !last.id_domain)
            throw new Error(
                "Invalid asset request: missing slug or domain ID in the last segment",
            );

        return await app.handle_asset(last);
    }

    if (is_api) {
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

    if (is_valid_domain_tree) {
        return new Response("<h1>Page response placeholder</h1>", {
            status: 200,
            headers: { "content-type": "text/html" },
        });
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

critical(`server: Listening on ${server.url}`, {
    step: { current: 2, max: 2 },
});

critical("app: Setting up the application...", {
    step: { current: 1, max: 2 },
});

await app.setup();

critical("app: Application setup complete", { step: { current: 2, max: 2 } });

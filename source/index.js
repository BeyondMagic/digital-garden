/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { serve } from "bun";
import { app } from "@/app";
import { select } from "@/database/query/select";
import { jwt } from "@/jwt";
import {
    assert,
    create_critical,
    create_debug,
    create_info,
} from "@/logger";
import { hostname, is_dev, port } from "@/setup";

const debug = create_debug(import.meta.path);
const info = create_info(import.meta.path);
const critical = create_critical(import.meta.path);

/**
 * @import { HTTPMethod } from "@/module/api"
 * @import { DomainKind } from "@/database/query"
 */

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
 * Extract a bearer token from Authorization header.
 * @param {Request} req
 * @returns {string | null}
 */
function extract_bearer_token(req) {
    const authorization = req.headers.get("authorization");

    if (!authorization)
        return null;

    const parts = authorization.split(" ");

    if (parts.length !== 2)
        return null;

    const [scheme, token] = parts;

    if (scheme !== "Bearer" || !token || token.trim().length === 0)
        return null;

    return token;
}

extract_bearer_token.test = () => {
    assert(extract_bearer_token(new Request("http://example.com", {
        headers: {
            "authorization": "Bearer abcdef12345",
        },
    })) === "abcdef12345", "Should extract valid bearer token");

    assert(extract_bearer_token(new Request("http://example.com", {
        headers: {
            "authorization": "Basic abcdef12345",
        },
    })) === null, "Should return null for non-Bearer scheme");

    assert(extract_bearer_token(new Request("http://example.com", {
        headers: {
            "authorization": "Bearer ",
        },
    })) === null, "Should return null for empty token");

    assert(extract_bearer_token(new Request("http://example.com")) === null, "Should return null when Authorization header is missing");
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

    const slugs =/** @type {Array<{ value: string, kind: DomainKind }>} */ ([
        ...subdomains.map((value) => ({ value, kind: "SUBDOMAIN" })),
        ...routers.map((value) => ({ value, kind: "ROUTER" })),
    ]);

    const domains = slugs.map((slug) => slug.value);
    info(`Domains\t→ [${domains.join(", ") || ""}]`);
    info(`Domains length\t→ ${domains.length}`);

    const token = extract_bearer_token(req);
    let id_author = null;

    if (token) {
        try {
            const payload = await jwt.verify({ token });
            const subject = payload.sub;

            if (typeof subject === "string") {
                const parsed_author_id = Number(subject);

                if (Number.isInteger(parsed_author_id) && parsed_author_id > 0)
                    id_author = parsed_author_id;
            }
        } catch {
            id_author = null;
        }
    }

    const domain_tree = await select.domain_tree_by_slugs({ slugs, id_author });
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
        return new Response(null, { status: 404 });
    }

    // To-do: should only get here if the rest of the tree is valid (routers and subdomains actually match correctly up until the asset)
    if (is_asset_request) {
        const last_domain = domain_tree[domain_tree.length - 1];
        const last_slug = routers[routers.length - 1];

        assert(last_slug, "Invalid asset request: last slug is missing in the URL path");
        assert(last_domain, "Invalid asset request: last segment of domain tree should not be null.");

        return await app.handle_asset({
            slug: last_slug,
            id_domain: last_domain.id,
        });
    }

    else if (is_api) {
        const slug = routers.join("/");
        return await app.handle_api({ request: req, method, slug });
    }

    else if (is_valid_domain_tree)
        return await app.handle_request(req);

    throw new Error("Unexpected request type: does not match asset, API, or page patterns");
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

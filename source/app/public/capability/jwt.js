/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { insert } from "@/database/query/insert";
import { verify } from "@/jwt";

const refresh_cookie_name = "refresh_token";

/**
 * @import { RequestCapability } from "@/module/api"
 * @import { DomainInput } from "@/database/query"
 */

/**
 * @import { Capability } from "@/module/api"
 */

/**
 * @param {RequestCapability} input
 * @returns {Promise<Response>}
 */
async function refresh({ request }) {
	const cookie_header = request.headers.get("cookie") || "";
	const cookie_parts = cookie_header.split(";").map((part) => part.trim());

	let refresh_token = null;

	for (const cookie_part of cookie_parts) {
		const [cookie_name, ...cookie_value_parts] = cookie_part.split("=");

		if (cookie_name === refresh_cookie_name) {
			refresh_token = decodeURIComponent(cookie_value_parts.join("="));
			break;
		}
	}

	if (!refresh_token)
		return new Response("Missing refresh token", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});

	let payload;

	try {
		payload = await verify({
			token: refresh_token,
			required_claims: [
				...new Set(["sub", "iat", "exp", "jti", "device", "purpose"]),
			],
			enforce_connection: false,
		});
	} catch {
		return new Response("Invalid refresh token", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});
	}

	if (payload.purpose !== "refresh")
		return new Response("Invalid refresh token purpose", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});

	if (typeof payload.sub !== "string" || typeof payload.device !== "string")
		return new Response("Invalid refresh token claims", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});

	const parsed_author_id = Number(payload.sub);

	if (!Number.isInteger(parsed_author_id) || parsed_author_id <= 0)
		return new Response("Invalid refresh token subject", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});

	let rotated_tokens;

	try {
		rotated_tokens = await insert.author_connection_refresh_rotate({
			id_author: parsed_author_id,
			device: payload.device,
			refresh_token,
		});
	} catch {
		return new Response("Refresh token is not active", {
			status: 401,
			headers: { "content-type": "text/plain" },
		});
	}

	return new Response(JSON.stringify({ token: rotated_tokens.access_token }), {
		status: 200,
		headers: {
			"content-type": "application/json",
			"set-cookie": `${refresh_cookie_name}=${encodeURIComponent(rotated_tokens.refresh_token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`,
		},
	});
}

/**
 * @type {Array<Capability>}
 */
export const jwt = [
	{
		method: "POST",
		slug: "refresh",
		name: "Refresh JWT Token",
		description:
			"Refresh an existing JWT token with a new one that has an extended expiration time.",
		handler: refresh,
		deprecation: null,
		scope: null,
		input: null,
		output: null,
	},
];
/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { randomUUID, timingSafeEqual } from "node:crypto";
import { assert } from "@/logger";
import { jwt_secret } from "@/setup";

const default_expires_in_seconds = 60 * 60 * 24 * 7;
const default_required_claims = ["sub", "iat", "exp", "jti", "device"];
export const TOKEN_LENGTH = 256; // 3 segments of 128 characters each (base64url encoding of 96 bytes) plus 2 dots

/**
 * @typedef {Object} JwtClaimsInput
 * @property {string} sub Subject (author id or unique principal identifier).
 * @property {string} device Device identifier.
 * @property {string=} [jti] Token id.
 * @property {number=} [iat] Issued-at timestamp (seconds since unix epoch).
 * @property {number=} [exp] Expiration timestamp (seconds since unix epoch).
 * @property {number=} [expires_in_seconds] Relative expiration from iat in seconds. Defaults to 7 days.
 * @property {Record<string, unknown>=} [claims] Additional custom claims.
 * @property {string=} [secret] Secret key used for HMAC SHA-256 signing.
 */

/**
 * @typedef {Object} JwtVerifyInput
 * @property {string} token JWT token to verify.
 * @property {string=} [secret] Secret key used for HMAC SHA-256 verification.
 * @property {Array<string>=} [required_claims] Required claim keys in payload.
 * @property {number=} [now] Current timestamp in seconds for expiration checks.
 */

/**
 * @typedef {Object} JwtHeader
 * @property {"HS256"} alg JWT algorithm.
 * @property {"JWT"} typ JWT type.
 */

/**
 * @typedef {Object} JwtPayload
 * @property {string} sub Subject principal identifier.
 * @property {string} device Device identifier.
 * @property {string} jti Token id.
 * @property {number} iat Issued-at timestamp (seconds since unix epoch).
 * @property {number} exp Expiration timestamp (seconds since unix epoch).
 */

/**
 * Encode a UTF-8 string as base64url.
 * @param {string} input
 * @returns {string}
 */
function encode_base64url(input) {
	return Buffer.from(input, "utf8").toString("base64url");
}

/**
 * Decode a base64url string into UTF-8.
 * @param {string} input
 * @returns {string}
 */
function decode_base64url(input) {
	return Buffer.from(input, "base64url").toString("utf8");
}

/**
 * Get current unix timestamp in seconds.
 * @returns {number}
 */
function unix_timestamp_seconds() {
	return Math.floor(Date.now() / 1000);
}

/**
 * Generate an HMAC SHA-256 signature and return as base64url.
 * @param {string} message
 * @param {string} secret
 * @returns {Promise<string>}
 */
async function sign_hs256(message, secret) {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature_buffer = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(message),
	);

	return Buffer.from(signature_buffer).toString("base64url");
}

/**
 * Parse JSON from a base64url segment.
 * @param {string} segment
 * @returns {Record<string, unknown>}
 */
function parse_segment_json(segment) {
	const text = decode_base64url(segment);
	const parsed = JSON.parse(text);

	assert(
		typeof parsed === "object" && parsed !== null && !Array.isArray(parsed),
		"jwt: token segment must decode to a JSON object",
	);

	return parsed;
}

/**
 * Assert presence and type of required JWT claims.
 * @param {Record<string, unknown>} payload
 * @param {Array<string>} required_claims
 */
function assert_required_claims(payload, required_claims) {
	for (const claim of required_claims) {
		assert(
			Object.hasOwn(payload, claim),
			`jwt_verify: missing required claim "${claim}"`,
		);
	}

	assert(
		typeof payload.sub === "string" && payload.sub.trim().length > 0,
		"jwt_verify: claim \"sub\" must be a non-empty string",
	);

	assert(
		typeof payload.device === "string" && payload.device.trim().length > 0,
		"jwt_verify: claim \"device\" must be a non-empty string",
	);

	assert(
		typeof payload.jti === "string" && payload.jti.trim().length > 0,
		"jwt_verify: claim \"jti\" must be a non-empty string",
	);

	assert(
		typeof payload.iat === "number" && Number.isFinite(payload.iat),
		"jwt_verify: claim \"iat\" must be a number",
	);

	assert(
		typeof payload.exp === "number" && Number.isFinite(payload.exp),
		"jwt_verify: claim \"exp\" must be a number",
	);

	const typed_payload = /** @type {JwtPayload} */ (payload);

	assert(typed_payload.exp > typed_payload.iat, "jwt_verify: claim \"exp\" must be greater than \"iat\"");
}

/**
 * Create a JWT token signed with HS256.
 * @param {JwtClaimsInput} input
 * @returns {Promise<string>}
 */
export async function create({
	sub,
	device,
	jti = randomUUID(),
	iat = unix_timestamp_seconds(),
	exp,
	expires_in_seconds = default_expires_in_seconds,
	claims = {},
	secret = jwt_secret,
}) {
	assert(typeof secret === "string" && secret.length >= 32, "jwt_create: secret must be a string with at least 32 characters");
	assert(typeof sub === "string" && sub.trim().length > 0, "jwt_create: sub must be a non-empty string");
	assert(typeof device === "string" && device.trim().length > 0, "jwt_create: device must be a non-empty string");
	assert(typeof jti === "string" && jti.trim().length > 0, "jwt_create: jti must be a non-empty string");
	assert(typeof iat === "number" && Number.isFinite(iat), "jwt_create: iat must be a number");
	assert(typeof expires_in_seconds === "number" && expires_in_seconds > 0, "jwt_create: expires_in_seconds must be a positive number");
	assert(typeof claims === "object" && claims !== null && !Array.isArray(claims), "jwt_create: claims must be an object");

	const expires_at = exp ?? iat + expires_in_seconds;

	assert(typeof expires_at === "number" && Number.isFinite(expires_at), "jwt_create: exp must be a number");
	assert(expires_at > iat, "jwt_create: exp must be greater than iat");

	/** @type {JwtHeader} */
	const header = {
		alg: "HS256",
		typ: "JWT",
	};

	const payload = {
		...claims,
		sub,
		device,
		jti,
		iat,
		exp: expires_at,
	};

	const encoded_header = encode_base64url(JSON.stringify(header));
	const encoded_payload = encode_base64url(JSON.stringify(payload));
	const unsigned_token = `${encoded_header}.${encoded_payload}`;
	const signature = await sign_hs256(unsigned_token, secret);

	return `${unsigned_token}.${signature}`;
}

/**
 * Verify an HS256 JWT token and return its payload claims.
 * @param {JwtVerifyInput} input
 * @returns {Promise<Record<string, unknown>>}
 */
export async function verify({
	token,
	secret = jwt_secret,
	required_claims = default_required_claims,
	now = unix_timestamp_seconds(),
}) {
	assert(typeof token === "string" && token.trim().length > 0, "jwt_verify: token must be a non-empty string");
	assert(typeof secret === "string" && secret.length >= 32, "jwt_verify: secret must be a string with at least 32 characters");
	assert(Array.isArray(required_claims), "jwt_verify: required_claims must be an array");
	assert(typeof now === "number" && Number.isFinite(now), "jwt_verify: now must be a number");

	const parts = token.split(".");

	assert(parts.length === 3, "jwt_verify: token must have 3 segments");
	assert(parts.every((part) => part.length > 0), "jwt_verify: token segments must be non-empty");

	const encoded_header = /** @type {string} */ (parts[0]);
	const encoded_payload = /** @type {string} */ (parts[1]);
	const provided_signature = /** @type {string} */ (parts[2]);

	assert(typeof encoded_header === "string", "jwt_verify: missing header segment");
	assert(typeof encoded_payload === "string", "jwt_verify: missing payload segment");
	assert(typeof provided_signature === "string", "jwt_verify: missing signature segment");

	/** @type {Record<string, unknown>} */
	const header = parse_segment_json(encoded_header);
	/** @type {Record<string, unknown>} */
	const payload = parse_segment_json(encoded_payload);

	assert(header.alg === "HS256", "jwt_verify: unsupported algorithm (expected HS256)");
	assert(header.typ === "JWT", "jwt_verify: invalid token type (expected JWT)");

	const unsigned_token = `${encoded_header}.${encoded_payload}`;
	const expected_signature = await sign_hs256(unsigned_token, secret);

	const provided_signature_buffer = Buffer.from(provided_signature, "base64url");
	const expected_signature_buffer = Buffer.from(expected_signature, "base64url");

	assert(
		provided_signature_buffer.length === expected_signature_buffer.length &&
		timingSafeEqual(provided_signature_buffer, expected_signature_buffer),
		"jwt_verify: invalid token signature",
	);

	assert_required_claims(payload, required_claims);
	const typed_payload = /** @type {JwtPayload} */ (payload);

	assert(typed_payload.iat <= now, "jwt_verify: token iat is in the future");
	assert(typed_payload.exp > now, "jwt_verify: token has expired");

	return payload;
}

export const jwt = {
	// @todo: idealize refresh process so that client doesn't have to login again after token expiration, upon request we check if token is expired and if so, check if refresh token is valid and issue new access token without requiring credentials again
	verify,
	create,
	TOKEN_LENGTH,
};
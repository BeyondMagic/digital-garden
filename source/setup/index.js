/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert } from "@/logger";

export const is_dev = process.env.DEV === "true";
export const is_debug = process.env.DEBUG === "true";

/**
 * Color codes for different log levels.
 */
export const color = {
	reset: "\x1b[0m", // reset
	debug: Bun.color('#06b6d4', 'ansi-16m'), // cyan-500
	info: Bun.color('#22c55e', 'ansi-16m'), // green-500
	warn: Bun.color('#f59e0b', 'ansi-16m'), // amber-500
	error: Bun.color('#ef4444', 'ansi-16m'), // red-500
	critical: Bun.color('#dc2626', 'ansi-16m'), // red-600
}

assert(process.env.DOMAIN, "DOMAIN environment variable is not set");

export const domain = process.env.DOMAIN;

const domains = domain.split(":");

assert(domains[0], "Hostname must be a string");
assert(domains[1], "Port must be a string");

export const hostname = domains[0];
export const port = domains[1];

assert(process.env.PUBLIC_ROOT, "PUBLIC_ROOT environment variable is not set");

export const public_root = process.env.PUBLIC_ROOT;

export const setup = {
	is_dev,
	is_debug,
	color,
	domain,
	hostname,
	port,
	public_root,
}
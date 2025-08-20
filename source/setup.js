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

export const [
	hostname,
	port
] = process.env.DOMAIN.split(":");
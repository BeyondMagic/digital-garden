/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { is_debug, color } from "@/setup";
import { basename, dirname } from "node:path";

const HEADER_TYPE_LENGTH = 12;
const FILE_CONTEXT_LENGTH = 24;

/**
 * Debug log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @param {{ step: { max: number, current: number } }} [options] Optional step info.
 */
export function debug(file, message, options) {

	const header = color.debug + '[DEBUG]'.padEnd(HEADER_TYPE_LENGTH) + ` [${file}]`.padEnd(FILE_CONTEXT_LENGTH);

	if (typeof message === "object" && message !== null) {
		console.debug(`${header} Object:${color.reset}`);
		console.table(message);
		return;
	}
	if (options?.step)
		console.debug(`${header} ${message} ${options.step.current}/${options.step.max}${color.reset}`);
	else
		console.debug(`${header} ${message}${color.reset}`);
}

/**
 * Info log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @param {{ step: { max: number, current: number } }} [options] Optional step info.
 * @returns {void}
 */
export function info(file, message, options) {

	const header = color.info + '[INFO]'.padEnd(HEADER_TYPE_LENGTH) + ` [${file}]`.padEnd(FILE_CONTEXT_LENGTH);

	if (typeof message === "object" && message !== null) {
		console.info(`${header} Object:${color.reset}`);
		console.table(message);
		return;
	}
	if (options?.step)
		console.info(`${header} ${message} ${options.step.current}/${options.step.max}${color.reset}`);
	else
		console.info(`${header} ${message}${color.reset}`);
}

/**
 * Warn log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @param {{ step: { max: number, current: number } }} [options] Optional step info.
 * @returns {void}
 */
export function warn(file, message, options) {

	const header = color.warn + '[WARN]'.padEnd(HEADER_TYPE_LENGTH) + ` [${file}]`.padEnd(FILE_CONTEXT_LENGTH);

	if (typeof message === "object" && message !== null) {
		console.warn(`${header} Object:${color.reset}`);
		console.table(message);
		return;
	}
	if (options?.step)
		console.warn(`${header} ${message} ${options.step.current}/${options.step.max}${color.reset}`);
	else
		console.warn(`${header} ${message}${color.reset}`);
}

/**
 * Create an Error with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to include in the error.
 * @returns {Error}
 */
export function error(file, message) {
	const header = color.error + '[ERROR]'.padEnd(HEADER_TYPE_LENGTH) + ` [${file}]`.padEnd(FILE_CONTEXT_LENGTH);

	if (typeof message === "object" && message !== null) {
		console.error(`${header} Object:${color.reset}`);
		console.table(message);
		return new Error(`${header} Object: ${JSON.stringify(message)}${color.reset}`);
	}
	return Error(`${header} ${message}${color.reset}`);
}

/**
 * Critical log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @returns {void}
 */
export function critical(file, message) {
	const header = color.critical + '[CRITICAL]'.padEnd(HEADER_TYPE_LENGTH) + ` [${file}]`.padEnd(FILE_CONTEXT_LENGTH);

	if (typeof message === "object" && message !== null) {
		console.error(`${header} Object:${color.reset}`);
		console.table(message);
		return;
	}
	console.error(`${header} ${message}${color.reset}`);
}

/**
 * Asserts that the given condition is truthy, throwing an error if it is not.
 * This function is recognized by the TypeScript compiler and will narrow types
 * in the same way as an `if` statement, removing `null` and `undefined` from
 * the type of the condition.
 *
 * For this function to work correctly with TypeScript's control flow analysis,
 * it MUST be defined as a standard `function`. Using an arrow function (`const assert =...`)
 * will result in a TS2775 error unless the type is explicitly annotated.
 *
 * @template T
 * @param {T} condition The condition to check. Can be any expression.
 * @param {string=} [message='Assertion Failed'] The error message to throw on failure.
 * @returns {asserts condition is NonNullable<T>}
 */
export function assert(condition, message = 'Assertion Failed') {
	if (!condition)
		throw new Error(message);
}

/**
 * Signature for debug function.
 * @typedef { (message: any, options?: { step: { max: number, current: number } }) => void } DebugFunction
 */

/**
 * Factory to bind a file to the debug function.
 * Returns a normal function to preserve expected typing behavior.
 * @param {string} path
 * @returns {DebugFunction}
 */
export function create_debug(path) {
	if (!is_debug)
		return () => { };

	const [
		dir,
		name
	] = [
			basename(dirname(path)),
			basename(path),
		];

	const file = dir + '/' + name;

	/** @type {DebugFunction} */
	return function (message, options) {
		return debug(file, message, options);
	};
}

/**
 * Signature for error function.
 * @typedef { (message: any) => Error } ErrorFunction
 */

/**
 * Factory to bind a file to the error function.
 * Returns a normal function to preserve expected typing behavior.
 * @param {string} path
 * @returns {ErrorFunction}
 */
export function create_error(path) {
	const [
		dir,
		name
	] = [
			basename(dirname(path)),
			basename(path),
		]

	const file = dir + '/' + name;

	/** @type {ErrorFunction} */
	return function (message) {
		return error(file, message);
	};
}

/**
 * Signature for generic log functions like info/warn/critical.
 * @typedef { (message: any, options?: { step: { max: number, current: number } }) => void } LogFunction
 */

/**
 * Factory to bind a file to the info function.
 * @param {string} path
 * @returns {LogFunction}
 */
export function create_info(path) {
	const [
		dir,
		name
	] = [
			basename(dirname(path)),
			basename(path),
		]

	const file = dir + '/' + name;

	/** @type {LogFunction} */
	return function (message, options) {
		return info(file, message, options);
	};
}

/**
 * Factory to bind a file to the warn function.
 * @param {string} path
 * @returns {LogFunction}
 */
export function create_warn(path) {
	const [
		dir,
		name
	] = [
			basename(dirname(path)),
			basename(path),
		]

	const file = dir + '/' + name;

	/** @type {LogFunction} */
	return function (message, options) {
		return warn(file, message, options);
	};
}

/**
 * Factory to bind a file to the critical function.
 * @param {string} path
 * @returns {LogFunction}
 */
export function create_critical(path) {
	const [
		dir,
		name
	] = [
			basename(dirname(path)),
			basename(path),
		]

	const file = dir + '/' + name;

	/** @type {LogFunction} */
	return function (message) {
		return critical(file, message);
	};
}
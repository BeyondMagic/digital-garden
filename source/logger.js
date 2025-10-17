import { is_debug, color } from "@/setup";

/**
 * @import { DebugFunction, ErrorFunction, LogFunction } from "@/types";
 */

/**
 * Debug log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @param {{ step: { max: number, current: number } }} [options] Optional step info.
 * @returns {void}
 */
export function debug(file, message, options) {
	if (options?.step)
		console.debug(`${color.debug}[DEBUG] [${file}] ${message} ${options.step.current}/${options.step.max}${color.reset}`);
	else
		console.debug(`${color.debug}[DEBUG] [${file}] ${message}${color.reset}`);
}

/**
 * Info log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @param {{ step: { max: number, current: number } }} [options] Optional step info.
 * @returns {void}
 */
export function info(file, message, options) {
	if (options?.step)
		console.info(`${color.info}[INFO] [${file}] ${message} ${options.step.current}/${options.step.max}${color.reset}`);
	else
		console.info(`${color.info}[INFO] [${file}] ${message}${color.reset}`);
}

/**
 * Warn log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @param {{ step: { max: number, current: number } }} [options] Optional step info.
 * @returns {void}
 */
export function warn(file, message, options) {
	if (options?.step)
		console.warn(`${color.warn}[WARN] [${file}] ${message} ${options.step.current}/${options.step.max}${color.reset}`);
	else
		console.warn(`${color.warn}[WARN] [${file}] ${message}${color.reset}`);
}

/**
 * Create an Error with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to include in the error.
 * @returns {Error}
 */
export function error(file, message) {
	return Error(`${color.error}[ERROR] [${file}] ${message}${color.reset}`);
}

/**
 * Critical log with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to log.
 * @returns {void}
 */
export function critical(file, message) {
	console.error(`${color.critical}[CRITICAL] [${file}] ${message}${color.reset}`);
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
 * Factory to bind a file to the debug function.
 * Returns a normal function to preserve expected typing behavior.
 * @param {string} file
 * @returns {DebugFunction}
 */
export function create_debug(file) {
	if (!is_debug)
		return () => { };

	/** @type {DebugFunction} */
	function bound_debug(message, options) {
		return debug(file, message, options);
	}
	return bound_debug;
}

/**
 * Factory to bind a file to the error function.
 * Returns a normal function to preserve expected typing behavior.
 * @param {string} file
 * @returns {ErrorFunction}
 */
export function create_error(file) {
	/** @type {ErrorFunction} */
	function bound_error(message) {
		return error(file, message);
	}
	return bound_error;
}

/**
 * Factory to bind a file to the info function.
 * @param {string} file
 * @returns {LogFunction}
 */
export function create_info(file) {
	/** @type {LogFunction} */
	function bound_info(message, options) {
		return info(file, message, options);
	}
	return bound_info;
}

/**
 * Factory to bind a file to the warn function.
 * @param {string} file
 * @returns {LogFunction}
 */
export function create_warn(file) {
	/** @type {LogFunction} */
	function bound_warn(message, options) {
		return warn(file, message, options);
	}
	return bound_warn;
}

/**
 * Factory to bind a file to the critical function.
 * @param {string} file
 * @returns {LogFunction}
 */
export function create_critical(file) {
	/** @type {LogFunction} */
	function bound_critical(message) {
		return critical(file, message);
	}
	return bound_critical;
}
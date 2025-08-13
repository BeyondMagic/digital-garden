/**
 * Signature for debug function.
 * @typedef { (message: any, options?: { step: { max: number, current: number } }) => void } DebugFunction
 */

/**
 * Signature for error function.
 * @typedef { (message: any) => Error } ErrorFunction
 */

/**
 * Signature for assert function that narrows to a truthy value.
 * @typedef { (condition: unknown, msg?: string) => asserts condition } AssertFunction
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
		console.debug(`[DEBUG] [${file}] ${message} ${options.step.current}/${options.step.max}`);
	else
		console.debug(`[DEBUG] [${file}] ${message}`);
}

/**
 * Create an Error with a file context.
 * @param {string} file The file to log messages for.
 * @param {any} message The message to include in the error.
 * @returns {Error}
 */
export function error(file, message) {
	return Error(`[ERROR] [${file}] ${message}`);
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
	if (!condition) {
		throw new Error(message);
	}
}

/**
 * Factory to bind a file to the debug function.
 * Returns a normal function to preserve expected typing behavior.
 * @param {string} file
 * @returns {DebugFunction}
 */
export function create_debug(file) {
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
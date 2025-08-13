import { serve } from "bun";

/**
 * Signature for debug function.
 * @typedef { (message: any, options?: { step: { max: number, current: number } }) => void } DebugFunction
 */

/**
 * Signature for error function.
 * @typedef { (message: any) => Error } ErrorFunction
 */

/**
 * Logger for a specific file.
 * @param {string} file - The file to log messages for.
 * @returns {[DebugFunction, ErrorFunction]} - A tuple containing the debug and error logging functions.
 */
function logger(file)
{
    /**
     * Debug logging function for current file.
     * @param {any} message
     * @param {{step: {max: number, current: number}}} [options]
     * @returns {void}
     */
    function debug (message, options)
    {
        if (options?.step)
            console.debug(`[DEBUG] [${file}] ${message} ${options.step.current}/${options.step.max}`);
        else
            console.debug(`[DEBUG] [${file}] ${message}`);
    };

    /**
     * Error logging function for current file.
     * @param {any} message 
     * @returns {Error}
     */
    function error (message) {
        return Error(`[ERROR] [${file}] ${message}`);
    };

    return [debug, error];
}

const [
    debug,
    error
] = logger(import.meta.file);

if (!process.env.DOMAIN)
    throw error("DOMAIN environment variable is not set");

const [
    hostname,
    port
] = process.env.DOMAIN?.split(":");

debug("Starting the server...", { step: { current: 1, max: 2 } });
const server = serve({
    hostname,
    port,
    fetch,
    development: true
})

debug(`Listening on ${server.url}`, { step: { current: 2, max: 2 } });
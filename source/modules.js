import { debug, root } from "@/util";
import { Glob } from "bun";

const glob = new Glob("modules/**/module.js");

/**
 * @typedef {import("@/database/types").Module} Module
 * @typedef {import("@/database/types").ModuleRender} ModuleRender
 * @typedef {import("@/database/types").Domain} Domain
 * @typedef {import("@/database/types").Asset} Asset
 */

/**
 * List of events
 * - that have been published (if set with a string),
 * - or were subscribed by a module (if set with an object).
 *
 * @type {Map<string, string | ModuleRender>}
 **/
const events = new Map();

/**
 * Log the event published by a module.
 * @param {string} event 
 * @param {string} module 
 */
function publish(event, module)
{
	events.set("request", "server");
	debug(`Event "${event}" published by "${module}".`);
}

publish("request", "server");

/**
 * @type {Map<string, Module>}
 **/
const modules = new Map();

/**
 * Process each repository.
 * @returns {Promise<void>}
 **/
async function process ()
{
	debug("[modules] Starting module processing...");
	
	// Processing all events to be published.
	for await (const file of glob.scan("."))
	{
		const path = `${root}/${file}`
		debug(`[modules] Loading module from: "${path}"`);

		try {
			const {default: class_obj} = await import(path);
			const module = new class_obj();

			debug(`[modules] Instantiated module: "${module.name}"`);
			modules.set(module.name, module);

			// Process the events that this module publishes
			debug(`[modules] Processing publishers for module "${module.name}":`, module.events.publishers);
			for await (const name of module.events.publishers)
			{
				if (events.has(name)) {
					const existing_publisher = events.get(name);
					debug(`[modules] ERROR: Event "${name}" already published by ${existing_publisher}`);
					throw new Error(`Event "${name}" is already published by ${existing_publisher}.`);
				}

				publish(name, module.name);
				debug(`[modules] Module "${module.name}" registered as publisher of event "${name}"`);
			}
		} catch (error) {
			debug(`[modules] ERROR loading module ${path}:`, error);
			throw error;
		}
	}

	debug(`[modules] All modules loaded. Processing subscriptions...`);

	// Process events to be subscribed.
	// - event must be published before and has a string set to the name of the module.
	for await (const [_, module] of modules)
	{
		debug(`[modules] Processing subscribers for module "${module.name}":`, module.events.subscribers);
		
		for await (const name of module.events.subscribers)
		{
			const publisher = events.get(name);

			if (!publisher) {
				debug(`[modules] ERROR: Event "${name}" is not published by anything`);
				throw new Error(`Event "${name}" is not published by anything.`);
			}

			events.set("request", module.render);
			debug(`[modules] Module "${module.name}" subscribed to event "${name}" (published by "${publisher}")`);
		}
	}
	
	debug(`[modules] Module processing complete. Loaded ${modules.size} modules.`);
	debug(`[modules] Event registry:`, Array.from(events.keys()));
}

/**
 * Grab a named event‐handler and assert it’s a function.
 * @param {string} name
 * @returns {ModuleRender}
 */
function fetch_handler (name)
{
	debug(`[modules] Fetching handler for event: "${name}"`);
	
	const fn = events.get(name);

	if (typeof fn !== "function") {
		debug(`[modules] ERROR: Event "${name}" handler missing or invalid. Type: ${typeof fn}`);
		throw new Error(`Event "${name}" handler missing or invalid.`);
	}

	debug(`[modules] Handler found for event "${name}"`);
	return fn;
}

export default {
	events,
	process,
	fetch_handler,
};
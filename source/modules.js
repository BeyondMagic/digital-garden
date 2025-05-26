import { debug, root } from "@/util";
import { Glob } from "bun";

const glob = new Glob("modules/**/module.js");

/**
 * @typedef {import("@/database/types").Module} Module
 * @typedef {import("@/database/types").ModuleRender} ModuleRender
 * @typedef {import("@/database/types").Domain} Domain
 * @typedef {import("@/database/types").Asset} Asset
 * @typedef {{request: Request, domains: Array<Domain>, assets: Array<Asset>}} EventRequest
 */

/**
 * List of events
 * - that have been published (if set with a string),
 * - or were subscribed by a module (if set with an object).
 *
 * @type {Map<string, string | ModuleRender>}
 **/
export const events = new Map();

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
export async function process_modules ()
{
	// Processing all events to be published.
	for await (const file of glob.scan("."))
	{
		const path = `${root}/${file}`
		debug(`Processing module of path "${path}".`);

		const {default: class_obj} = await import(path);
		const module = new class_obj();

		modules.set(module.name, module);

		// Process the events that this module publishes
		for await (const name of module.events.publishers)
		{
			if (events.has(name))
				throw new Error(`Event "${name}" is already published by ${events.get(name)}.`);

			publish(name, module.name);
		}
	}

	// Process events to be subscribed.
	// - event must be published before and has a string set to the name of the module.
	for await (const [_, module] of modules)
	{
		for await (const name of module.events.subscribers)
		{
			const publisher = events.get(name);

			if (!publisher)
				throw new Error(`Event "${name}" is not published by anything.`);

			events.set("request", module.render);

			debug(`Event "${name}" published by "${publisher}" is subscribed by "${module.name}".`)
		}
	}
}
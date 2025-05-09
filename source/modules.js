import { debug, root } from "@/util";
import { Glob } from "bun";

const glob = new Glob("modules/**/module.js");

/**
 * List of events
 * - that have been published (if set with a string),
 * - or were subscribed by a module (if set with an object).
 *
 * @type {Map<string, Object | string>}
 **/
export const events = new Map();

// The core event of the application below:
events.set("request", "server");
debug(`Event "request" published by "server".`);

/**
 * @type {Map<Object, string>}
 **/
const modules = new Map();

/**
 * Process each repository.
 **/
export async function process_modules()
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

			events.set(name, module.name);
			debug(`Event "${name}" published by "${module.name}".`);
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

	// Part 2: must run after the part 1.
	const core_render = events.get("request");

	if (!core_render || typeof core_render !== "function")
		throw new Error("Must have a core module that process requests.");

	return core_render;
}

// process_modules();

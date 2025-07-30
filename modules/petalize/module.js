import { debug } from "./util";
import * as tutorial from "./components/tutorial";
import { sql } from "bun";
import { mime_type, cdn } from "@/util";
import { readFile } from "node:fs/promises";

/**
 * @typedef {import("@/database/types").SelectedDomains} SelectedDomains
 */

export default class Module {
	constructor()
	{
		debug("[petalize] Initializing petalize module...");
		
		this.name = "petalize"

		this.events = {
			subscribers: [
				"request",
			],
			publishers: [
				/**
				 * 404 Not Found event.
				 * This will be sent when the requested resource is not found.
				 */
				"http_404",
				/**
				 * Health check event.
				 * This will be sent when the server is ok/ready to receive requests.
				 */
				"health_check",
				/**
				 * Parse and visualize an asset (image, video, audio, etc.).
				 * This will only be sent when the asset is being asked from a browser, like not to download it.
				 */
				"asset_visualization",
				/**
				 * Parse the content (in markdown) into HTML.
				 */
				"parse_content"
			]
		}
		
		debug("[petalize] Module configuration:", {
			name: this.name,
			subscribers: this.events.subscribers,
			publishers: this.events.publishers
		});
	}

	/**
	 * Process defaults.
	 * - create default style (asset);
	 * - create default script (asset);
	 * - create default language;
	 * - create language information 
	 * - create 
	 **/
	async defaults()
	{
	}

	/**
	 * @param {SelectedDomains & {request: Request}} information Data received by the event.
	 * @param {request} _ The type of event.
	 * @returns {Promise<Response>} Response for the request.
	 **/
	async render({request, domains, asset, remain}, _)
	{
		debug(`[petalize] Handling request: "${request.url}"`);
		debug(`[petalize] Method: ${request.method}`);
		debug(`[petalize] Domains:`, domains.map(d => d.name));
		debug(`[petalize] Asset:`, asset ? asset.path : "none");
		debug(`[petalize] Remaining URL parts:`, remain);

		// Check if this is an asset request
		if (asset) {
			debug(`[petalize] Asset request detected: ${asset.path}`);
			
			try {
				// Build the asset path in CDN
				const domain_path = domains.slice(1).map(d => d.name).join('/');
				const asset_cdn_path = `${cdn}${domain_path}/${asset.path}`;
				debug(`[petalize] Loading asset from: ${asset_cdn_path}`);
				
				const file_data = await readFile(asset_cdn_path);
				const content_type = mime_type(asset.extension || "");
				
				debug(`[petalize] Serving asset (${file_data.length} bytes, ${content_type})`);
				
				return new Response(file_data, {
					headers: {
						"Content-Type": content_type,
						"Cache-Control": "public, max-age=31536000", // 1 year cache
					}
				});
			} catch (error) {
				debug(`[petalize] Error serving asset: ${error instanceof Error ? error.message : String(error)}`);
				// Asset not found, continue to 404 handling
			}
		}

		// Check for specific routes in remaining parts
		if (remain.length > 0) {
			debug(`[petalize] Route request detected:`, remain);
			// TODO: Handle routing
			debug(`[petalize] Custom routing not implemented yet`);
		}

		debug(`[petalize] Serving default tutorial content`);

		// if (request.method === "POST")
		// {
		// 	const content = await template.process({
		// 		title: "Petalize :)",
		// 		body: html`
		// 			<div>lol!!</div>
		// 		`
		// 	})

		// 	return new Response(
		// 		content,
		// 		{
		// 			headers: {
		// 				"Content-Type": "text/html"
		// 			},
		// 		}
		// 	);
		// }

		const response = new Response(
			tutorial.content,
			{
				headers: {
					"Content-Type": "text/html"
				},
			}
		);
		
		debug(`[petalize] Response created with status: ${response.status}`);
		return response;
	}
};

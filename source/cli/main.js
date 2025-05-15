import { serve } from "bun";
import { debug, mime_type } from "@/util";
import { process_modules } from "@/modules";
import { sql } from "bun";
import * as database from "@/setup";
import * as query from "@/database/query";

const module_fetch = await process_modules();

let ith = 0;

/**
 * @param {Request} req
 * @returns {Promise<Response>}
 */
async function fetch(req)
{
	debug("----------------------");
	debug(`Request: ${++ith}`);

	// Remove "http://" or "https://" from the URL
	const url = req.url.replace(/https?:\/\//, "");

	debug(`[${ith}] URL: `, url);

	const result = await query.select_domains(url);
	
	const remain_path = result.remain.join("/");

	if (remain_path)
	{
		const last_domain = result.domains[result.domains.length - 1];

		if (!last_domain)
		{
			debug(`[${ith}] No domain found for ${url}`);
			return new Response("Domain not found", { status: 404 });
		}

		debug(`[${ith}] Last Domain: `, last_domain);

		debug(`[${ith}] Remaining Path: "${remain_path}"`);

		/**
		 * @type {Array<import("@/database/types").Asset>}
		 */
		const [asset] = await sql`
            SELECT
				asset.*
            FROM
				asset
            WHERE
				asset.path = ${remain_path}
            AND
                asset.id_domain = ${last_domain.id}
        `;

		if (asset)
		{
			const path = `./assets/${asset.path}`;
			const data = await Bun.file(path).bytes();

			const type = mime_type(asset.extension);
			return new Response(data, {
				headers: {
					"Content-Type": type,
					"Content-Length": data.byteLength.toString(),
					"Cache-Control": "max-age=31536000",
				}
			});
		}
	}

	debug("----------------------");

	return module_fetch(req, "request");
}

database.init();

const server = serve({
	port: 3001,
	hostname: "0.0.0.0",
	fetch,
	development: true,
});

debug(`Listening on ${server.url}`);

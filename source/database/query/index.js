import * as insert from "@/database/query/insert";
import * as select from "@/database/query/select";
import * as del from "@/database/query/delete";
import * as create from "@/database/query/create";

export {
	insert,
	select,
	del as delete,
	create,
};

/**
 * @typedef {import("@/modules").EventRequest} EventRequest
 * @typedef {import("@/database/types").Asset} Asset
 */

/**
 *
 * @param {EventRequest} result
 * @returns {Promise<Asset>}
 */
// async function process_remain (result)
// {
// 	const remain_path = result.remain.join("/");
// 	const last_domain = result.domains[result.domains.length - 1];

// 	return await query.select_asset({
// 		remain_path: remain_path,
// 		id_domain: last_domain?.id
// 	});
// }
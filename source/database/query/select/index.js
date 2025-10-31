import { sql } from "bun";

/**
 * @typedef {Object} ModuleEventSubscription
 * @property {number} subscription_id
 * @property {string} event
 * @property {number} module_id
 * @property {string} repository
 * @property {number[]|null} domains
 */

/**
 * Fetch module event subscriptions with optional domain scoping.
 * @returns {Promise<ModuleEventSubscription[]>}
 */
async function subscriptions() {
	const rows = await sql`
		SELECT
			mes.id AS subscription_id,
			me.event,
			listener.id AS module_id,
			listener.repository,
			(
				SELECT array_agg(mesd.id_domain)
				FROM module_event_subscription_domain AS mesd
				WHERE mesd.id_subscription = mes.id
			) AS domains
		FROM
			module_event_subscription AS mes
		JOIN
			module_event AS me ON me.id = mes.id_event
		JOIN
			module AS listener ON listener.id = mes.id_module
		WHERE
			listener.installed = true
			AND listener.enabled = true
	`;

	return rows;
}

export const select = {
	subscriptions,
};

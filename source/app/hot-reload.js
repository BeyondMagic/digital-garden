import { readdirSync, statSync, watch } from "node:fs";
import { join } from "node:path";

/** @typedef {import('bun').ServerWebSocket<any>} AnyServerWebSocket */
/** @typedef {import('bun').Server} AnyServer */

/**
 * Watches directory trees and calls `onChange()` (debounced) on changes.
 * Linux doesn't support recursive `fs.watch`, so we watch each directory.
 * @param {string[]} roots
 * @param {() => void} onChange
 */
function watchDirTrees(roots, onChange) {
	/** @type {ReturnType<typeof watch>[]} */
	const watchers = [];
	const visited = new Set();

	/** @param {string} dir */
	function walk(dir) {
		if (visited.has(dir)) return;
		visited.add(dir);

		try {
			watchers.push(
				watch(dir, { persistent: false }, (_event, filename) => {
					if (filename) {
						try {
							const full = join(dir, String(filename));
							if (statSync(full).isDirectory()) walk(full);
						} catch {
							// ignore
						}
					}
					onChange();
				}),
			);
		} catch {
			// ignore (permissions, missing dir)
		}

		try {
			for (const entry of readdirSync(dir, { withFileTypes: true })) {
				if (entry.isDirectory()) walk(join(dir, entry.name));
			}
		} catch {
			// ignore
		}
	}

	for (const root of roots) walk(root);
	return () => {
		for (const w of watchers) w.close();
	};
}

/**
 * Create a tiny hot-reload system:
 * - server-side watches `web/` files in dev and broadcasts `reload`
 * - browser connects via WS to `/api/hot-reload`
 *
 * @param {{ is_dev: boolean }} deps
 */
export function create_hot_reload(deps) {
	const { is_dev } = deps;

	/** @type {Set<AnyServerWebSocket>} */
	const clients = new Set();

	const web_root = import.meta.dir;
	const watch_roots = [
		join(web_root, "public"),
		join(web_root, "html"),
	];

	/** @type {ReturnType<typeof setTimeout> | null} */
	let pendingReloadTimer = null;

	function broadcastReload() {
		for (const ws of clients) {
			try {
				ws.send("reload");
			} catch {
				// ignore
			}
		}
	}

	function scheduleReload() {
		if (!is_dev) return;
		if (pendingReloadTimer) return;
		pendingReloadTimer = setTimeout(() => {
			pendingReloadTimer = null;
			broadcastReload();
		}, 80);
	}

	if (is_dev) {
		watchDirTrees(watch_roots, scheduleReload);
	}

	return {
		/** @type {import('bun').WebSocketHandler<any>} */
		websocket: {
			/** @param {AnyServerWebSocket} ws */
			open(ws) {
				clients.add(ws);
			},
			/** @param {AnyServerWebSocket} ws */
			close(ws) {
				clients.delete(ws);
			},
			/** @param {AnyServerWebSocket} _ws @param {string | Buffer} _message */
			message(_ws, _message) {
				// no-op
			},
		},

		/**
		 * @param {{ request: Request, server: AnyServer }} context
		 */
		async upgrade(context) {
			const { request, server } = context;
			if (!is_dev) return new Response("Not Found", { status: 404 });
			const upgraded = server.upgrade(request, {
				data: {
					websocket: this.websocket,
				},
			});
			if (!upgraded) return new Response("Upgrade Required", { status: 426 });
			return;
		},
	};
}

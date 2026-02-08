(() => {
	/**
	 * Hot reload client.
	 * Connects to `/api/hot-reload` and reloads the page on file changes.
	 */

	const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
	const wsUrl = `${wsProtocol}//${location.host}/api/hot-reload`;

	/** @type {WebSocket | null} */
	let socket = null;
	let retryMs = 250;
	let manuallyClosed = false;

	function connect() {
		if (manuallyClosed) return;

		try {
			socket = new WebSocket(wsUrl);
		} catch {
			scheduleReconnect();
			return;
		}

		socket.addEventListener("open", () => {
			retryMs = 250;
		});

		socket.addEventListener("message", (ev) => {
			const data = typeof ev.data === "string" ? ev.data : "";
			if (!data) return;

			if (data === "reload") {
				location.reload();
				return;
			}

			// JSON protocol (future-proof)
			try {
				const msg = JSON.parse(data);
				if (msg && msg.type === "reload") location.reload();
			} catch {
				// ignore
			}
		});

		socket.addEventListener("close", () => {
			socket = null;
			scheduleReconnect();
		});

		socket.addEventListener("error", () => {
			// `close` will fire after this in most browsers.
		});
	}

	function scheduleReconnect() {
		if (manuallyClosed) return;
		setTimeout(connect, retryMs);
		retryMs = Math.min(retryMs * 2, 5000);
	}

	window.addEventListener("beforeunload", () => {
		manuallyClosed = true;
		try {
			socket?.close();
		} catch {
			// ignore
		}
	});

	connect();
})();

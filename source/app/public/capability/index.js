/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { asset } from "@/app/public/capability/asset";
import { author } from "@/app/public/capability/author";
import { content } from "@/app/public/capability/content";
import { domain } from "@/app/public/capability/domain";
import { hot_reload } from "@/app/public/capability/hot-reload";
import { jwt } from "@/app/public/capability/jwt";
import { navigation } from "@/app/public/capability/navigation";

import { create_debug } from "@/logger";
import { capability as api } from "@/module/api/capability";

const debug = create_debug(import.meta.path);

/**
 * @import { Capability } from "@/module/api"
 */

/**
 * @type {Array<Capability>}
 */
const capabilities = [
	...asset,
	...author,
	...content,
	...domain,
	...jwt,
	...hot_reload,
	...navigation,
];

export async function setup() {
	debug("Setting up server capabilities...", { step: { current: 1, max: 3 } });

	for (const cap of capabilities) api.register(cap.method, cap.slug, cap);

	debug("Server capabilities setup complete.", {
		step: { current: 2, max: 3 },
	});
}

export const capability = {
	setup,
};

/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @import { Capability } from "@/module/api"
 */

import { create_hot_reload } from "@/app/hot-reload";
import { is_dev } from "@/setup";

const hot_reload_service = create_hot_reload({ is_dev });

/** @type {Capability} */
const hot_reload_capability = {
	name: "Hot Reload",
	description: "Reload browser pages when development files change.",
	adapter: "websocket",
	method: "GET",
	slug: "hot-reload",
	upgrade: hot_reload_service.upgrade,
	websocket: hot_reload_service.websocket,
	deprecation: null,
	scope: null,
	input: null,
	output: null,
};

/**
 * @type {Array<Capability>}
 */
export const hot_reload = [
	...(is_dev ? [hot_reload_capability] : []),
];
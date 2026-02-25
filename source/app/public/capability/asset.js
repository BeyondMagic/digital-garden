/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { not_implemented } from "@/module/api";

/**
 * @import { Capability } from "@/module/api"
 */

/**
 * @type {Array<Capability>}
 */
export const asset = [
	{
		method: "POST",
		slug: "asset/add",
		name: "Add Asset",
		description: "Adds a new asset to a domain in the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "content",
		input: {
			id_domain: "number",
			slug: "string",
			data: "Blob | string",
		},
		output: {
			id_asset: "number",
		}
	},
	{
		method: "DELETE",
		slug: "asset/remove",
		name: "Remove Asset",
		description: "Removes an asset from the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "content",
		input: {
			id_asset: "number",
		},
		output: null,
	},
	{
		method: "PUT",
		slug: "asset/update",
		name: "Update Asset",
		description: "Updates an asset's data or moves it to a different domain in the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "content",
		input: {
			id_asset: "number",
			id_domain: "number | undefined",
			slug: "string | undefined",
			data: "Blob | string | undefined",
		},
		output: null,
	},
];
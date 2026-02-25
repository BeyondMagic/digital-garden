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
export const content = [
	{
		method: "GET",
		slug: "content/get",
		name: "Get Content",
		description: "Retrieves content information from the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: null,
		input: {
			id_content: "number"
		},
		output: {
			id_content: "number",
			id_domain: "number",
			title: "string",
			body: "string",
			status: "string",
		},
	},
	{
		method: "POST",
		slug: "content/add",
		name: "Add Content",
		description: "Adds new content to a domain in the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "domain",
		input: {
			id_domain: "number",
			id_language: "number",
			title: "string",
			title_sub: "string",
			synopsis: "string",
			body: "string",
			status: "SubjectStatus",
		},
		output: {
			id_content: "number"
		},
	},
	{
		method: "PUT",
		slug: "content/move",
		name: "Move Content",
		description: "Moves content to a different domain or language in the garden.",
		/**
		 * @todo: should we check for no-op (both id_domain and id_language both being null or both being the same as the current values) and return a 400 Bad Request in that case
		 */
		handler: not_implemented,
		deprecation: null,
		scope: "domain",
		input: {
			id_content: "number",
			id_domain: "number | undefined",
			id_language: "number | undefined",
		},
		output: null,
	},
	{
		method: "PUT",
		slug: "content/update",
		name: "Update Content",
		description: "Updates content information in the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "content",
		input: {
			id_content: "number",
			/**
			 * @todo: should we check for no-op (input values being null or being the same as the current values) and return a 400 Bad Request in that case
			 */
			title: "string | undefined",
			title_sub: "string | undefined",
			synopsis: "string | undefined",
			body: "string | undefined",
			status: "SubjectStatus | undefined",
		},
		output: null,
	},
	{
		method: "DELETE",
		slug: "content/remove",
		name: "Remove Content",
		description: "Removes content from the garden.",
		handler: not_implemented,
		deprecation: null,
		scope: "domain",
		input: {
			id_content: "number",
		},
		output: null,
	}
]
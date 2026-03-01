/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { hostname, is_dev } from "@/setup";

/**
 * @property {}
 */

/**
 * @param {string} path - The relative path to the asset.
 * @returns {string} The absolute URL to the asset.
 */
function root_asset(path) {
	return `http://${hostname}/${path}`;
}

/**
 * Generates a basic HTML5 template as a string.
 * @returns {Promise<string>} A promise that resolves to the HTML string.
 */
export async function build() {

	const title = "Your Page Title"; // Get here from "Garden" table.

	const content = /* html */ `
		<h1>
			Page response placehssolder!!!
		</h1>
		<img width="50" height="50" src="${root_asset("admin-profile-picture.png")}"/>
	`;

	const head = /* html */ `
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<title>${title}</title>
		<link rel="stylesheet" href="${root_asset("style.css")}">
		<link rel="icon" type="image/svg+xml" href="${root_asset("favicon.svg")}">
	</head>
	`;

	const hot_reload_script = is_dev
		? `<script src="${root_asset("hot-reload.js")}"></script>`
		: "";

	const body = /* html */ `
	<body>

		<header>
			<h1>Welcome to My Website</h1>
		</header>

		<main>
			${content}
		</main>
	
		<footer>
			<p>&copy; 2026 BeyondMagic</p>
		</footer>
	
		${hot_reload_script}
	</body>
	`;

	const root = /* html */ `
	<!DOCTYPE html>
	<html lang="en-US">
		${head}
		${body}
	</html>
	`;

	return root;
}

export const html = {
	build,
}
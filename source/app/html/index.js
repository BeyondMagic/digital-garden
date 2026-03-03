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
export function root_asset(path) {
	return `http://${hostname}/${path}`;
}

/**
 * @todo: nothing for now, but later will get status, type, etc
 * @typedef {Object} InformationDomain
 */

/**
 * @typedef {Object} InformationContent
 * @property {string} status - The status of the content (e.g., "PUBLIC", "PRIVATE").
 * @property {string} title - The title of the page.
 * @property {string} title_sub - The subtitle of the page.
 * @property {string} language - The language of the page content, in IETF BCP 47 format (e.g., "en-US").
 * @property {string} synopsis - A brief summary of the page content.
 * @property {string} body - The HTML content of the page.
 */

/**
 * @typedef {Object} InformationGarden
 * @property {string} name - The name of the garden.
 * @property {string} description - The description of the garden.
 */

/**
 * @typedef {Object} Information
 * @property {InformationDomain} domain - The information about the domain.
 * @property {InformationContent} content - The information about the content.
 * @property {InformationGarden} garden - The information about the garden.
 */

/**
 * Generates a basic HTML5 template as a string.
 * @param {Information} information - The information object containing details about the domain, content, and garden.
 * @returns {Promise<string>} A promise that resolves to the HTML string.
 */
export async function build(information) {
	const title = `${information.content.title} - ${information.garden.name}`;
	const description = `${information.garden.description} ${information.content.synopsis}`;

	const hot_reload_script = is_dev
		? `<script src="${root_asset("hot-reload.js")}"></script>`
		: "";

	const hot_reload_element = is_dev
		? `<auto-hot-reload root="${hostname}"></auto-hot-reload>`
		: "";

	const scripts = /* html */ `
		<script type="module" src="${root_asset("auto-breadcrumb.js")}"></script>
		${hot_reload_script}
	`;

	const head = /* html */ `
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<meta name="description" content="${description}">
		<title>${title}</title>
		<link rel="stylesheet" href="${root_asset("style.css")}">
		<link rel="icon" type="image/svg+xml" href="${root_asset("favicon.svg")}">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
	</head>
	`;



	const body = /* html */ `
	<body>
		<div class="start buttons horizontal"></div>
		<div class="start tabs">
			<div class="tab active">
				<span class="slug">The Solarpunk Ethos</span>
				<span class="close">×</span>
			</div>
			<div class="tab">
				<span class="slug">Welcome</span>
				<span class="close">×</span>
			</div>
			<!-- <div class="add">+</div> -->
		</div>
		<div class="start"></div>

		<div class="middle panel left">
			<div class="bar"></div>
			<div class="body"></div>
		</div>
		<div class="middle content">
			<div class="navigation start"></div>
			<div class="navigation middle">
				<auto-breadcrumb></auto-breadcrumb>
			</div>
			<div class="navigation end"></div>
			<div class="body" contenteditable="true" spellcheck="false">
				${information.content.body}
			</div>
		</div>
		<div class="middle panel right"></div>

		<div class="end buttons">
			<div class="button account icon">
				<img width="24" height="24" src="${root_asset("admin-profile-picture.png")}"/>
			</div>
		</div>
		<div class="end"></div>
		<div class="end"></div>
		${hot_reload_element}
		${scripts}
	</body>
	`;

	const root = /* html */ `
	<!DOCTYPE html>
	<html lang="${information.content.language}">
		${head}
		${body}
	</html>
	`;

	return root;
}

export const html = {
	build,
	root_asset,
}
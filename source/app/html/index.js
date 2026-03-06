/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { hostname, is_dev } from "@/setup";

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

const buttons = {
	sidebar_left: /* html */ `
		<div class="button sidebar left icon">
			<svg
			   width="20"
			   height="20"
			   id="screenshot-3af15804-922b-8012-8007-a38b91b00fe5"
			   viewBox="0 0 20 20"
			   fill="none"
			   version="1.1"
			   xmlns="http://www.w3.org/2000/svg"
			   xmlns:svg="http://www.w3.org/2000/svg">
			  <defs
			     id="defs9" />
			  <path
			     d="m 5.9621868,1 c -2.77,0 -5,2.23 -5,5 v 8 c 0,2.77 2.23,5 5,5 h 8.0000002 c 2.77,0 5,-2.23 5,-5 V 6 c 0,-2.77 -2.23,-5 -5,-5 z m 0,2 h 8.0000002 c 1.662,0 3,1.338 3,3 v 8 c 0,1.662 -1.338,3 -3,3 H 5.9621868 c -1.662,0 -3,-1.338 -3,-3 V 6 c 0,-1.662 1.338,-3 3,-3 z"
			     style="opacity:1;fill:#000000;fill-opacity:1;stroke-width:94.4882;stroke-linecap:square;stroke-linejoin:round;paint-order:stroke fill markers"
			     id="path19" />
			  <path
			     d="M 6,5 C 5.446,5 5,5.446 5,6 v 8 c 0,0.554 0.446,1 1,1 h 3 c 0.554,0 1,-0.446 1,-1 V 6 C 10,5.446 9.554,5 9,5 Z"
			     style="opacity:1;fill:#000000;stroke-width:94.4882;stroke-linecap:square;stroke-linejoin:round;paint-order:stroke fill markers"
			     id="path18" />
			</svg>
		</div>
	`,
	sidebar_right: /* html */ `
		<div class="button sidebar right icon">
			<svg
			   width="20"
			   height="20"
			   id="screenshot-3af15804-922b-8012-8007-a38b91b00fe5"
			   viewBox="0 0 20 20"
			   fill="none"
			   version="1.1"
			   xmlns="http://www.w3.org/2000/svg"
			   xmlns:svg="http://www.w3.org/2000/svg">
			  <defs
			     id="defs9" />
			  <path
			     d="m 5.9621868,1 c -2.77,0 -5,2.23 -5,5 v 8 c 0,2.77 2.23,5 5,5 h 8.0000002 c 2.77,0 5,-2.23 5,-5 V 6 c 0,-2.77 -2.23,-5 -5,-5 z m 0,2 h 8.0000002 c 1.662,0 3,1.338 3,3 v 8 c 0,1.662 -1.338,3 -3,3 H 5.9621868 c -1.662,0 -3,-1.338 -3,-3 V 6 c 0,-1.662 1.338,-3 3,-3 z"
			     style="opacity:1;fill:#000000;fill-opacity:1;stroke-width:94.4882;stroke-linecap:square;stroke-linejoin:round;paint-order:stroke fill markers"
			     id="path19" />
			  <path
			     d="m 11,5 c -0.554,0 -1,0.446 -1,1 v 8 c 0,0.554 0.446,1 1,1 h 3 c 0.554,0 1,-0.446 1,-1 V 6 C 15,5.446 14.554,5 14,5 Z"
			     style="opacity:1;fill:#000000;stroke-width:94.4882;stroke-linecap:square;stroke-linejoin:round;paint-order:stroke fill markers"
			     id="path18" />
			</svg>
		</div>
	`,
	account: /* html */ `
		<div class="button account icon">
			<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
	`,
	search: /* html */ `
		<div class="button search icon">
			<svg width="17.509" xmlns="http://www.w3.org/2000/svg" height="17.51" id="screenshot-3af15804-922b-8012-8007-a3727d027e15" viewBox="222.24 269.24 17.509 17.51" style="-webkit-print-color-adjust::exact" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1">
			  <g id="shape-3af15804-922b-8012-8007-a3727d027e15" style="opacity:1;fill:#000000" rx="0" ry="0">
			    <g id="shape-3af15804-922b-8012-8007-a3727d027e16">
			      <g class="fills" id="fills-3af15804-922b-8012-8007-a3727d027e16">
			        <path d="M229.77001953125,284.300048828125C225.611328125,284.300048828125,222.239990234375,280.9287109375,222.239990234375,276.77001953125C222.239990234375,272.611328125,225.611328125,269.239990234375,229.77001953125,269.239990234375C233.9287109375,269.239990234375,237.300048828125,272.611328125,237.300048828125,276.77001953125C237.300048828125,278.76708984375,236.5067138671875,280.682373046875,235.094482421875,282.094482421875C233.682373046875,283.506591796875,231.76708984375,284.300048828125,229.77001953125,284.300048828125ZM229.77001953125,270.75C226.456298828125,270.75,223.77001953125,273.436279296875,223.77001953125,276.75C223.77001953125,280.063720703125,226.456298828125,282.75,229.77001953125,282.75C233.083740234375,282.75,235.77001953125,280.063720703125,235.77001953125,276.75C235.77001953125,273.436279296875,233.083740234375,270.75,229.77001953125,270.75Z" style="fill:#000000;fill-opacity:1">
			        </path>
			      </g>
			    </g>
			    <g id="shape-3af15804-922b-8012-8007-a3727d027e17">
			      <g class="fills" id="fills-3af15804-922b-8012-8007-a3727d027e17">
			        <path d="M239,286.75C238.8009033203125,286.7509765625,238.60986328125,286.671630859375,238.469970703125,286.530029296875L234.3399658203125,282.4000244140625C234.064697265625,282.1044921875,234.07275390625,281.64404296875,234.3583984375,281.3583984375C234.64404296875,281.07275390625,235.1044921875,281.064697265625,235.4000244140625,281.3399658203125L239.530029296875,285.469970703125C239.822509765625,285.7628173828125,239.822509765625,286.2371826171875,239.530029296875,286.530029296875C239.39013671875,286.671630859375,239.1990966796875,286.7509765625,239,286.75L239,286.75" style="fill:#000000;fill-opacity:1">
			        </path>
			      </g>
			    </g>
			  </g>
			</svg>
		</div>
	`,
};

/**
 * @param {string} path - The relative path to the asset.
 * @returns {string} The absolute URL to the asset.
 */
export function root_asset(path) {
	return `http://${hostname}/${path}`;
}

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
		<script type="module" src="${root_asset("index.js")}"></script>
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
		<div class="start buttons horizontal">
			${buttons.sidebar_left}
			${buttons.search}
		</div>
		<div class="start tabs">
			<div class="tab active">
				<div class="block">
					<span class="slug">The Solarpunk Ethos</span>
					<span class="close">×</span>
				</div>
			</div>
			<div class="tab">
				<div class="block">
					<span class="slug">Welcome</span>
					<span class="close">×</span>
				</div>
			</div>
			<!-- <div class="add">+</div> -->
		</div>
		<div class="start buttons horizontal reverse">
			${buttons.sidebar_right}
		</div>

		<div class="middle panel left">
			<div class="buttons vertical">
				${buttons.search}
			</div>
			<div class="body"></div>
		</div>
		<auto-navigation root="${hostname}"></auto-navigation>
		<div class="middle content">
			<div class="navigation start"></div>
			<div class="navigation middle">
				<auto-breadcrumb root="${hostname}"></auto-breadcrumb>
			</div>
			<div class="navigation end"></div>
			<div class="body" contenteditable="true" spellcheck="false">
				${information.content.body}
			</div>
		</div>
		<div class="middle panel right"></div>

		<div class="end buttons horizontal">
			${buttons.account}
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
};

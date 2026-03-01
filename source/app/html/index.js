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

	const title = "Digital Garden"; // Get here from "Garden" table.

	const content = /* html */ `
		<h1>The Solarpunk Ethos</h1>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sagittis id nunc eget viverra. Etiam nisl ex, tincidunt eget urna quis, dignissim malesuada erat. Nunc enim lorem, fringilla quis velit pharetra, sodales euismod augue. Aliquam felis eros, iaculis sit amet est at, faucibus gravida dolor. Praesent a pharetra purus, eget venenatis justo. In nulla nisi, scelerisque ut est eget, finibus posuere odio. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
		<h2>The Shared Human Spirit</h2>
		<p>The common feeling of falling in our socities may be one of the worst tricks we have been sharing.</p>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
		<h2>A Vision for a Better Together</h2>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
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
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
	</head>
	`;

	const hot_reload_script = is_dev
		? `<script src="${root_asset("hot-reload.js")}"></script>`
		: "";

	const body = /* html */ `
	<body>
		<div class="start buttons horizontal"></div>
		<div class="start sidebar"></div>
		<div class="start"></div>

		<div class="middle"></div>
		<div class="middle content">
			<div class="navigation start"></div>
			<div class="navigation middle"></div>
			<div class="navigation end"></div>
			<div class="body">
				${content}
			</div>
		</div>
		<div class="middle"></div>

		<div class="end"></div>
		<div class="end sidebar"></div>
		<div class="end"></div>
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
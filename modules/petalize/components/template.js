import { html } from "@/util";
import { debug } from "../util";

/**
 * @param {Array<string>} styles
 * @returns {string}
 **/
function process_styles (styles)
{
	debug(`[petalize:template] Processing ${styles.length} styles`);
	return styles.map(
		item => `<style>${item}</style>`
	).join("\n");
}

/**
 * @param {Array<string>} scripts
 * @returns {string}
 **/
function process_scripts (scripts)
{
	debug(`[petalize:template] Processing ${scripts.length} scripts`);
	return scripts.map(
		item => `<script defer type="module">${item}</script>`
	).join("\n");
}

/**
 * Process the template filling out with the information inputted.
 *
 * @param {Object} input
 * @param {string} input.title 
 * @param {string} input.body 
 * @param {Array<string>} input.styles 
 * @param {Array<string>} input.scripts 
 * @returns {Promise<string>}
 */
export async function process ({ title, body, styles, scripts })
{
	debug(`[petalize:template] Creating HTML document with title: "${title}"`);
	debug(`[petalize:template] Body length: ${body.length} characters`);
	debug(`[petalize:template] Styles: ${styles.length}, Scripts: ${scripts.length}`);
	
	const html_content = `
	<!doctype html>
	<html lang="pt-br">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>${title}</title>
			<link rel="icon" type="image/x-icon" href="/favicon.svg">
			${process_styles(styles)}
		</head>
		<body class="dark">
			${body}
			${process_scripts(scripts)}
		</body>
	</html>
	`;
	
	debug(`[petalize:template] Generated HTML document (${html_content.length} characters)`);
	return html_content;
}

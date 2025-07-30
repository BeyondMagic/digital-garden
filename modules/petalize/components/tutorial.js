import { html, js, css } from "@/util";
import { process } from "./template";
import { debug } from "../util";

debug("[petalize:tutorial] Initializing tutorial component...");

const title = "Petalize :)";

const data = {
	title: "🌱 Bem-vindo ou bem-vinda!",
	synopsis: "Um jardim digital é uma coleção ideias que não são organizadas por data de publicação e são publicadas mesmo antes de serem finalizadas. A ideia aqui é plantar (escrever) e deixar crescer com o tempo (revisitar e incrementar com novas descobertas)."
};

debug("[petalize:tutorial] Tutorial data:", data);

const body = html`
<div class="container">
	<h1 class="title">${data.title}</h1>
	<p class="synopsis">${data.synopsis}</p>
</div>
`;

/**
 * @type {string[]}
 */
const styles = [ css`
body {
	display: flex;
	justify-content: center;
	align-items: center;

	background-color: "red";

	height: 100vh;

	.container {
		background-color: gray;
		width: 50%;
	}
}
`];

/**
 * @type {string[]}
 */
const scripts = [ /*js`
document.getElementById("myForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	const formData = new FormData(e.target);

	// Send POST request
	const response = await fetch(e.target.action, {
		method: "POST",
		body: formData,
	});

	// Update UI
	document.getElementById("result").innerHTML = await response.text();
});
`*/];

debug("[petalize:tutorial] Processing template...");
export const content = await process({
	title,
	body,
	styles,
	scripts
})
debug("[petalize:tutorial] Tutorial content generated successfully");

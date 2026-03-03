/*
 * SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { root_asset } from "@/app/html";
import { insert } from "@/database/query/insert";
import { select } from "@/database/query/select";
import { create_critical, create_debug } from "@/logger";

const debug = create_debug(import.meta.path);
const critical = create_critical(import.meta.path);

/**
 * @param {string} path - The relative path to the asset file.
 * @returns {string} The absolute path to the asset file.
 */
function make_asset_path(path) {
	return `${import.meta.dir}/${path}`;
}

export async function tables() {
	debug("Checkinig if seeding for tables was set.", {
		step: { current: 1, max: 2 },
	});

	if ((await select.count("garden")) > 0) {
		debug("Database already seeded.", { step: { current: 2, max: 2 } });
		return;
	}

	debug("Database not seeded.", { step: { current: 2, max: 2 } });

	debug("Seeding tables..", { step: { current: 1, max: 2 } });

	try {
		// Root domain
		const domain_root = await insert.domain({
			id_domain_parent: null,
			id_domain_redirect: null,
			kind: "SUBDOMAIN",
			slug: null,
			status: "PRIVATE",
		});

		// English (US) Language
		const asset_en_flag_id = await insert.asset({
			id_domain: domain_root,
			slug: "en-flag.svg",
			data: {
				path: make_asset_path("../public/image/flag-us.svg"),
			},
		});

		const language_en_id = await insert.language({
			id_asset: asset_en_flag_id,
			slug: "en-US",
		});

		await insert.language_information({
			id_language_for: language_en_id,
			id_language_from: language_en_id,
			name: "American English",
			description:
				"The English language as primarily used in the United States.",
		});

		await insert.asset_information({
			id_asset: asset_en_flag_id,
			id_language: language_en_id,
			name: "Simplified Flag of the United States",
			description:
				"A rectangular emoji-like flag of the United States, with 13 horizontal stripes of red and white, and a blue canton containing 50 white stars.",
		});

		// Admin Information
		const asset_admin_profile_picture = await insert.asset({
			id_domain: domain_root,
			slug: "admin-profile-picture.png",
			data: {
				path: make_asset_path("../public/image/digital-garden-girl.png"),
			},
		});

		const author_admin = await insert.author({
			id_asset: asset_admin_profile_picture,
			email: "admin@localhost",
			name: "Admin",
			password: "admin",
		});

		// Content of the root domain
		await insert.content({
			id_domain: domain_root,
			id_language: language_en_id,
			status: "PUBLIC",
			title: "Welcome to My Digital Garden",
			title_sub: "Cultivating and Sharing My Thoughts, Ideas, and Projects",
			synopsis:
				"Welcome to my digital garden! This is a space where I cultivate and share my thoughts, ideas, and projects. Feel free to explore and connect with me!",
			body: /* html */ `
				<h1>
					Page response placeholder!!!
				</h1>
				<img width="50" height="50" src="${root_asset("admin-profile-picture.png")}"/>
			`,
		});

		// Tags
		const asset_seed_id = await insert.asset({
			id_domain: domain_root,
			slug: "seed.svg",
			data: {
				path: make_asset_path("../public/image/seed.svg"),
			},
		});

		await insert.asset_information({
			id_asset: asset_seed_id,
			id_language: language_en_id,
			name: "Seedling",
			description:
				"A seedling emoji, depicting a small plant sprouting from the ground, symbolizing growth, new beginnings, and potential.",
		});

		const tag_personal_id = await insert.tag({
			id_asset: asset_seed_id,
			slug: "seedling",
		});

		await insert.tag_information({
			id_tag: tag_personal_id,
			id_language: language_en_id,
			name: "Seedling",
			description:
				"A seedling tag, representing content that is in the early stages of growth and development, symbolizing potential and new beginnings.",
		});

		await insert.domain_tag({
			id_domain: domain_root,
			id_tag: tag_personal_id,
		});

		// Default garden
		const asset_logo_id = await insert.asset({
			id_domain: domain_root,
			slug: "favicon.svg",
			data: {
				path: make_asset_path("../public/image/favicon.svg"),
			},
		});

		await insert.garden({
			id_domain: domain_root,
			id_asset: asset_logo_id,
			id_author: author_admin,
		});

		await insert.garden_information({
			id_language: language_en_id,
			name: "My Digital Garden",
			description:
				"Welcome to my digital garden! This is a space where I cultivate and share my thoughts, ideas, and projects. Feel free to explore and connect with me!",
		});

		// Style and script assets
		await insert.asset({
			id_domain: domain_root,
			slug: "style.css",
			data: {
				path: make_asset_path("../public/style/index.css"),
			},
		});

		await insert.asset({
			id_domain: domain_root,
			slug: "hot-reload.js",
			data: {
				path: make_asset_path("../public/script/hot-reload.js"),
			},
		});

		await insert.asset({
			id_domain: domain_root,
			slug: "auto-breadcrumb.js",
			data: {
				path: make_asset_path("../public/script/components/auto-breadcrumb.js"),
			},
		});

		// Writing domain
		const domain_writing_id = await insert.domain({
			id_domain_parent: domain_root,
			id_domain_redirect: null,
			kind: "SUBDOMAIN",
			slug: "writing",
			status: "PRIVATE",
		});

		// Essay domain
		const domain_essay_id = await insert.domain({
			id_domain_parent: domain_writing_id,
			id_domain_redirect: null,
			kind: "ROUTER",
			slug: "essay",
			status: "PRIVATE",
		});

		// "Solarpunk Ethos" domain
		const domain_solarpunk_ethos_id = await insert.domain({
			id_domain_parent: domain_essay_id,
			id_domain_redirect: null,
			kind: "ROUTER",
			slug: "solarpunk-ethos",
			status: "PRIVATE",
		});

		// Content for "Solarpunk Ethos"
		await insert.content({
			id_domain: domain_solarpunk_ethos_id,
			id_language: language_en_id,
			status: "PUBLIC",
			title:
				"The Solarpunk Ethos: Cultivating a Sustainable and Hopeful Future",
			title_sub:
				"Exploring the principles and values of the solarpunk movement",
			synopsis:
				"The solarpunk ethos is a set of principles and values that guide the solarpunk movement, which envisions a sustainable and hopeful future where technology and nature coexist harmoniously. In this essay, we will explore the core tenets of the solarpunk ethos and how they inspire us to create a better world.",
			body: /* html */ `
				<h1>The Solarpunk Ethos</h1>
				<h2>One sun, many paths, the same inherent light.</h2>
				<hr/>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sagittis id nunc eget viverra. Etiam nisl ex, tincidunt eget urna quis, dignissim malesuada erat. Nunc enim lorem, fringilla quis velit pharetra, sodales euismod augue. Aliquam felis eros, iaculis sit amet est at, faucibus gravida dolor. Praesent a pharetra purus, eget venenatis justo. In nulla nisi, scelerisque ut est eget, finibus posuere odio. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
				<h3>The Shared Human Spirit</h3>
				<p>The common feeling of falling in our socities may be one of the worst tricks we have been sharing.</p>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
				<h3>A Vision for a Better Together</h3>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
				<div class="image">
					<img width="50" height="50" src="${root_asset("admin-profile-picture.png")}"/>
				</div>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec turpis sem, varius et nibh non, dignissim malesuada quam. Vestibulum in nunc ex. Donec interdum vitae purus eu fringilla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin sit amet tellus ut leo aliquet dignissim. Vivamus vel tortor id velit molestie accumsan non interdum sapien. Mauris laoreet mi tellus, sed placerat tellus fringilla eu.</p>
			`,
		});
	} catch (err) {
		critical("Error seeding tables.", { step: { current: 2, max: 2 } });
		critical(err);
		return;
	}

	debug("Done.", { step: { current: 2, max: 2 } });
}

export const seed = {
	tables,
};

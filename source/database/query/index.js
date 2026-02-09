/*
 * SPDX-FileCopyrightText: 2025-2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @typedef {Object} RowIdentifier
 * @property {number} id - Unique identifier.
 */

/**
 * @typedef {Object} ModuleInput - Information about a module.
 * @property {string} repository - Repository URL of the module.
 * @property {string} commit - Git commit hash of the module version.
 * @property {string} branch - Git branch of the module.
 * @property {number | null} version_major - Major version number of the module.
 * @property {number | null} version_minor - Minor version number of the module.
 * @property {number | null} version_patch - Patch version number of the module.
 * @property {Date} last_heartbeat - Timestamp of the last heartbeat received from the module.
 * @property {boolean} enabled - Whether the module is enabled or not.
 */

/**
 * @typedef {ModuleInput & RowIdentifier} Module - Full row module data, including the generated ID.
 */

/**
 * @typedef {Object} AssetInput - Information about an asset.
 * @property {number} id_domain - ID of the domain the asset belongs to.
 * @property {string} slug - Unique slug for the asset within the domain.
 */

/**
 * @typedef {{blob: Blob} | {path: string}} AssetData - The binary/symlink data of the asset.
 */

/**
 * @typedef {AssetInput & RowIdentifier} Asset - Full row asset data, including the generated ID.
 */

/**
 * @typedef {Object} DomainInput
 * @property {number | null} id_domain_parent - ID of the parent domain (nullable).
 * @property {number | null} id_domain_redirect - ID of the domain to redirect to (nullable).
 * @property {"SUBDOMAIN" | "ROUTER"} kind - Kind of the domain.
 * @property {string} slug - Unique slug for the domain.
 * @property {"PUBLIC" | "PRIVATE" | "ARCHIVED" | "DELETED"} status - Status of the domain.
 */

/**
 * @typedef {DomainInput & RowIdentifier} Domain - Full row domain data.
 */

/**
 * @typedef {Object} LanguageInput
 * @property {string} id_asset - ID of the asset the language is associated with.
 * @property {string} slug - Unique slug for the language within the asset, like 'xx-YY' (e.g. 'en-US').
 */

/**
 * @typedef {LanguageInput & RowIdentifier} Language - Full row language data, including the generated ID.
 */

/**
 * @typedef {Object} LanguageInformationInput
 * @property {number} id_language_for - ID of the language the information is associated with.
 * @property {number} id_language_from - ID of the language the information is from.
 * @property {string} name - Name of the language in the 'from' language (e.g. "English").
 * @property {string} description - Description of the language in the 'from' language.
 */

/**
 * @typedef {LanguageInformationInput & RowIdentifier} LanguageInformation - Full row language information data, including the generated ID.
 */

/**
 * @typedef {Object} AssetInformationInput
 * @property {number} id_asset - ID of the asset the information is associated with.
 * @property {number} id_language - ID of the language the information is in.
 * @property {string} name - Name of the asset in the specified language.
 * @property {string} description - Description of the asset in the specified language.
 */

/**
 * @typedef {AssetInformationInput & RowIdentifier} AssetInformation - Full row asset information data, including the generated ID.
 */

import { create } from "@/database/query/create";
import { insert } from "@/database/query/insert";
import { reset } from "@/database/query/reset";
import { select } from "@/database/query/select";
import { remove } from "@/database/query/remove";

export const query = {
	create,
	insert,
	reset,
	select,
	remove,
};
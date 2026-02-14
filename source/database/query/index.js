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
 * @typedef {"PUBLIC" | "PRIVATE" | "ARCHIVED" | "DELETED"} SubjectStatus - Possible statuses for domains, assets, and tags.
 */

/**
 * @typedef {Object} DomainInput
 * @property {number | null} id_domain_parent - ID of the parent domain (nullable).
 * @property {number | null} id_domain_redirect - ID of the domain to redirect to (nullable).
 * @property {"SUBDOMAIN" | "ROUTER"} kind - Kind of the domain.
 * @property {string} slug - Unique slug for the domain.
 * @property {SubjectStatus} status - Status of the domain.
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

/**
 * @typedef {Object} TagInput
 * @property {number} id_asset - ID of the asset the tag is associated with.
 * @property {string} slug - Unique slug for the tag within the asset.
 */

/**
 * @typedef {TagInput & RowIdentifier} Tag - Full row tag data, including the generated ID.
 */

/**
 * @typedef {Object} TagRequirementInput
 * @property {number} id_tag - ID of the tag that has the requirement.
 * @property {number} id_tag_for - ID of the tag that is required by the tag.
 */

/**
 * @typedef {TagRequirementInput & RowIdentifier} TagRequirement - Full row tag requirement data, including the generated ID.
 */

/**
 * @typedef {Object} TagInformationInput
 * @property {number} id_tag - ID of the tag the information is associated with.
 * @property {number} id_language - ID of the language the information is in.
 * @property {string} name - Name of the tag in the specified language.
 * @property {string} description - Description of the tag in the specified language.
 */

/**
 * @typedef {TagInformationInput & RowIdentifier} TagInformation - Full row tag information data, including the generated ID.
 */

/**
 * @typedef {Object} DomainTagInput
 * @property {number} id_domain - ID of the domain the tag is associated with.
 * @property {number} id_tag - ID of the tag associated with the domain.
 */

/**
 * @typedef {DomainTagInput & RowIdentifier} DomainTag - Full row domain tag data, including the generated ID.
 */

/**
 * @typedef {Object} ContentInput
 * @property {number} id_domain - ID of the domain the content is associated with.
 * @property {number} id_language - ID of the language the content is in.
 * @property {Date} date - Date of the content.
 * @property {SubjectStatus} status - Status of the content.
 * @property {string} title - Title of the content.
 * @property {string} title_sub - Subtitle of the content.
 * @property {string} synopsis - Synopsis of the content.
 * @property {string} body - Body of the content.
 * @property {number} requests - Number of requests for the content.
 */

/**
 * @typedef {ContentInput & RowIdentifier} Content - Full row content data, including the generated ID.
 */

/**
 * @typedef {Object} ContentLinkInput
 * @property {number} id_content_from - ID of the content that has the link.
 * @property {number} id_content_to - ID of the content that is linked to.
 */

/**
 * @typedef {ContentLinkInput & RowIdentifier} ContentLink - Full row content link data, including the generated ID.
 */

/**
 * @typedef {Object} GardenInput
 * @property {number} id_domain - ID of the domain the garden is associated with.
 * @property {number} id_asset - ID of the asset the garden is associated with.
 */

/**
 * @typedef {GardenInput & RowIdentifier} Garden - Full row garden data, including the generated ID.
 */

/**
 * @typedef {Object} GardenInformationInput
 * @property {number} id_garden - ID of the garden the information is associated with.
 * @property {number} id_language - ID of the language the information is in.
 * @property {string} name - Name of the garden in the specified language.
 * @property {string} description - Description of the garden in the specified language.
 */

/**
 * @typedef {GardenInformationInput & RowIdentifier} GardenInformation - Full row garden information data, including the generated ID.
 */

/**
 * @typedef {Object} AuthorInput
 * @property {number} id_asset - ID of the asset the author is associated with.
 * @property {string} email - Email of the author.
 * @property {string} name - Name of the author.
 * @property {string} password - Hashed password of the author.
 * @property {number} pages - Number of pages the author has contributed to.
 * @property {number} contents - Number of contents the author has contributed to.
 */

/**
 * @typedef {AuthorInput & RowIdentifier} Author - Full row author data, including the generated ID.
 */

/**
 * @typedef {Object} AuthorConnectionInput
 * @property {number} id_author - ID of the author that has the connection.
 * @property {string} device - Device identifier for the connection (e.g. "web", "mobile").
 * @property {string} token - Authentication token for the connection.
 * @property {Date} logged_at - Timestamp of when the connection was established.
 * @property {Date} last_active_at - Timestamp of the last activity on the connection.
 */

/**
 * @typedef {AuthorConnectionInput & RowIdentifier} AuthorConnection - Full row author connection data, including the generated ID.
 */

/**
 * @typedef {Object} AuthorDomainInput
 * @property {number} id_author - ID of the author that has access to the domain.
 * @property {number} id_domain - ID of the domain the author has access to.
 */

/**
 * @typedef {AuthorDomainInput & RowIdentifier} AuthorDomain - Full row author domain data, including the generated ID.
 * @property {Date} granted_at - Timestamp of when the access was granted.
 */

/**
 * @typedef {Object} AuthorGardenInput
 * @property {number} id_author - ID of the author that has access to the garden.
 * @property {number} id_garden - ID of the garden the author has access to.
 */

/**
 * @typedef {AuthorGardenInput & RowIdentifier} AuthorGarden - Full row author garden data, including the generated ID.
 * @property {Date} granted_at - Timestamp of when the access was granted.
 */

import { create } from "@/database/query/create";
import { insert } from "@/database/query/insert";
import { remove } from "@/database/query/remove";
import { reset } from "@/database/query/reset";
import { select } from "@/database/query/select";

export const query = {
	create,
	insert,
	reset,
	select,
	remove,
};
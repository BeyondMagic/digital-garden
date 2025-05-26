/**
 * The type of domain that should be parsed: "subdomain.domain/router".
 * @typedef {'ROUTER' | 'SUBDOMAIN'} DomainType
 *
 * Status of a domain or content to parse.
 * @typedef {'PUBLIC' | 'PRIVATE' | 'ARCHIVED' | 'DELETED'} StatusType
 *
 * The columns of the domain table.
 * @typedef {Object} Domain
 * @prop {string} id - The ID of the domain.
 * @prop {string | null} id_domain_parent - The ID of the parent domain.
 * @prop {string | null} id_domain_redirect - The ID of the domain to redirect to.
 * @prop {DomainType} type - The type of the domain.
 * @prop {string} name - The name of the domain.
 * @prop {StatusType} status - The status of the domain.
 *
 * The columns of the asset table.
 * @typedef {Object} Asset
 * @prop {string} id - The ID of the asset.
 * @prop {string} id_domain - The ID of the domain that the asset belongs to.
 * @prop {string} path - The path of the asset.
 * @prop {number} times - The number of times the asset has been used.
 * @prop {string} extension - The extension of the asset.
 *
 * @callback ModuleRender
 * @param  {Object} data - Data received by the event render.
 * @param  {string} type - Type of event
 * @returns {Promise<any>} - Response for the event.
 *
 * @typedef {{name: string, events: {subscribers: Array<string>, publishers: Array<string>}, render: ModuleRender}} Module
 */
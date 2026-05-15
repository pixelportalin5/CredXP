/**
 * @typedef {Object} PropertyLocation
 * @property {string} address
 * @property {string} city
 * @property {string} state
 */

/**
 * @typedef {Object} Property
 * @property {string} _id
 * @property {string} title
 * @property {'Office Space' | 'Shop'} type
 * @property {PropertyLocation} location
 * @property {number} price
 * @property {number} size
 * @property {string[]} amenities
 * @property {string[]} images
 * @property {'Recently Posted' | 'Trending'} status
 * @property {string} description
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Pagination
 * @property {number} currentPage
 * @property {number} totalPages
 * @property {number} totalItems
 * @property {number} itemsPerPage
 */

export {};

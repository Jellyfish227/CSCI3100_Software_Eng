/**
 * Course handlers index file
 * Exports all course related handlers
 */

const create = require('./create');
const list = require('./list');
const get = require('./get');
const update = require('./update');
const del = require('./delete');
const featured = require('./featured');
const content = require('./content');

module.exports = {
  create,
  list,
  get,
  update,
  delete: del,
  featured,
  content
}; 
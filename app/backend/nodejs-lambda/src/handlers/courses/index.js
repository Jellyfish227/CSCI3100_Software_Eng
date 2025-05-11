/**
 * Course handlers index
 */

// Import course handlers
const list = require('./list');
const featured = require('./featured');
const get = require('./get');
const create = require('./create');
const update = require('./update');
const delete_ = require('./delete');
const content = require('./content');

// Import new handlers
const enrollment = require('./enrollment');
const assignments = require('./assignments');
const assessments = require('./assessments');

// Export all handlers
module.exports = {
  list,
  featured,
  get,
  create,
  update,
  delete: delete_,
  content,
  enrollment,
  assignments,
  assessments
}; 
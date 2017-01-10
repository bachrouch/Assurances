/* vim: fdm=marker
 */
var utils = require('../utils');
var term = require('./rule-term');

function rate(coverage) {
  // {{{
  utils.mutate(coverage, term.Rule);
  coverage.calculate();
  // }}}
}
exports.rate = rate;

/* vim: fdm=marker
 */
var moment = require('moment');
var utils = require('./utils');
var mongo = require('../mongo');
exports.generateRef = function (type, year, cb) {
  // {{{
  if (typeof year === 'function') {
    cb = year;
    year = utils.momentToJSON(moment())
      .substr(0, 4);
  }
  var inc = {};
  inc[year] = 1;
  mongo.getSequenceCol()
    .findAndModify({
      _id: type
    }, null, {
      $inc: inc
    }, {
      upsert: true,
      new: true
    }, function (err, res) {
      if (err) {
        cb(err);
      }
      else {
        var sy = parseInt(year.substr(2, 2));
        var v = res[year];
        if (type === 'receipt') {
          cb(null, sy * 1000000000 + v);
        }
        else if (type === 'payment' || type === 'payback') {
          cb(null, sy * 1000000 + v);
        }
        else if (type === 'exemption') {
          cb(null, sy * 10000000 + v);
        }
        else if (type === 'autoExemption') {
          cb(null, 'S-' + (sy * 100000000 + v));
        }
        else if (type === 'debit') {
          cb(null, sy * 1000 + v);
        }
        else if (type.match(/^\d\d\d$/)) {
          cb(null, sy * 1000000000 + parseInt(type) * 1000000 + v);
        }
        else if (type.match(/^Q\d\d\d$/)) {
          var t = type.substr(1, 3);
          cb(null, 'D-' + (sy * 1000000000 + parseInt(t) * 1000000 + v));
        }
        else {
          cb('unknown reference type: ' + type);
        }
      }
    });
  // }}}
};

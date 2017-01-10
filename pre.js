var Q = require('q');
var mongo = require('./mongo');
var store = require('./store');
exports.fire = function () {
  return Q.all([
    mongo.init()
    .then(function () {
      return store.init();
    })
  ]);
};

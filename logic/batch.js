/* vim: fdm=marker
 */
var Q = require('q');
var mongo = require('../mongo');
exports.getBatchConfig = function (batchName) {
  //{{{
  var query = {};
  query.name = batchName;
  var deferred = Q.defer();
  mongo.getConfigBatchCol()
    .findOne(query, function (err, config) {
      if (err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(config);
      }
    });
  return deferred.promise;
  //}}}
};

/* vim: fdm=marker
 */
(function () {
  var errors = {};
  Object.defineProperty(errors, 'isEmpty', {
    enumarable: false,
    get: function () {
      return Object.keys(errors)
        .length === 0;
    }
  });
  angular.module('app')
    .value('errors', errors);
})();

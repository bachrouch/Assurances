/* vim: fdm=marker
 */
angular.module('app')
  .service('errorsSvc', ['errors', function (errors) {
    function set(err) {
      // {{{
      if (!angular.isObject(err)) {
        err = {
          _ERROR_: JSON.stringify(err)
        };
      }
      angular.copy(err, errors);
      // }}}
    }

    function clear() {
      // {{{
      angular.copy({}, errors);
      // }}}
    }
    return {
      set: set,
      clear: clear
    };
  }]);

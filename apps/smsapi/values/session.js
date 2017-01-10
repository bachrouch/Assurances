/* vim: fdm=marker
 */
(function () {
  function set() {
    throw new Error('Not modifiable');
  }
  var session = {
    connected: false
  };
  var user = {};
  var pos = {};
  Object.defineProperties(session, {
    user: {
      get: function () {
        return user;
      },
      set: set
    },
    pos: {
      get: function () {
        return pos;
      },
      set: set
    }
  });
  angular.module('app')
    .value('session', session);
})();

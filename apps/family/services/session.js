/* vim: fdm=marker
 */
angular.module('app')
  .service('sessionSvc', ['$q', '$http', 'session', function ($q, $http,
    session) {
    function set(s) {
      // {{{
      if (s) {
        session.connected = true;
        angular.copy(s.user, session.user);
        angular.copy(s.pos, session.pos);
      }
      else {
        clear();
      }
      // }}}
    }

    function clear() {
      // {{{
      session.connected = false;
      angular.copy({}, session.user);
      angular.copy({}, session.pos);
      // }}}
    }

    function fromServer(s) {
      // {{{
      s = s.status;
      if (s.connected) {
        return {
          user: {
            name: s.username,
            fullName: s.fullName,
            email: s.email,
            posAdmin: s.posAdmin,
            admin: s.admin
          },
          pos: s.pos
        };
      }
      // }}}
    }

    function login(username, password) {
      // {{{
      return $q(function (resolve, reject) {
        $http.post('/svc/connection/login', {
            username: username,
            password: password
          })
          .success(function (data) {
            if (data.ok) {
              check()
                .then(resolve, function (error) {
                  reject(error);
                });
            }
            else {
              reject(data);
            }
          })
          .error(function (data, status) {
            clear();
            reject(data || {
              status: status
            });
          });
      });
      // }}}
    }

    function logout() {
      // {{{
      return $q(function (resolve, reject) {
        return $http.post('/svc/connection/logout', {})
          .success(function () {
            clear();
            resolve();
          })
          .error(function (data, status) {
            reject(data || {
              status: status
            });
          });
      });
      // }}}
    }

    function check() {
      // {{{
      return $q(function (resolve, reject) {
        return $http.post('/svc/connection/check', {})
          .success(function (data) {
            set(fromServer(data));
            resolve();
          })
          .error(function (data, status) {
            clear();
            reject(data || {
              status: status
            });
          });
      });
      // }}}
    }
    return {
      login: login,
      logout: logout,
      check: check
    };
  }]);

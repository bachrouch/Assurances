/* vim: fdm=marker
 */
angular.module('app')
  .controller('SessionCtrl', ['$scope', '$location', 'session', 'sessionSvc',
    function ($scope, $location, session, sessionSvc) {
      function initScope() {
        // {{{
        $scope.session = session;
        sessionSvc.check();
        $scope.login = function () {
          sessionSvc.login($scope.username, $scope.password)
            .then(function () {
              delete $scope.username;
              delete $scope.password;
            });
        };
        $scope.logout = function () {
          sessionSvc.logout()
            .then(function () {
              $location.path('/');
            });
        };
        $scope.computed = {};
        Object.defineProperties($scope.computed, {
          user: {
            get: function () {
              return session.user.name;
            }
          }
        });
        // }}}
      }
      initScope();
    }
  ]);

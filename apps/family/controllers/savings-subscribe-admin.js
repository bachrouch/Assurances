/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeAdminCtrl', ['$timeout', '$rootScope', '$scope',
    '$location', '$routeParams', 'savingsDraft', 'errorsSvc',
    'savingsDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      savingsDraft, errorsSvc, savingsDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsDraft;
        $scope.duration = moment($scope.policy.def.termDate)
          .diff($scope.policy.def.effDate, 'year');
        $scope.reload = function () {
          errorsSvc.clear();
          savingsDraftSvc.read(currentId())
            .then(function () {}, errorsSvc.set);
        };
        $scope.save = function () {
          errorsSvc.clear();
          savingsDraftSvc.admin()
            .then(function () {}, errorsSvc.set);
        };
        $scope.toSubscribe = function () {
          $location.path('/savings/subscribe/' + currentId());
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsDraft._id;
      if (current === cached) {
        initScope();
      }
      else {
        savingsDraftSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

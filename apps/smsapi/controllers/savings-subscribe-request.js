/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeRequestCtrl', ['$timeout', '$rootScope',
    '$scope', '$location', '$routeParams', 'savingsDraft', 'errorsSvc',
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
        $scope.send = function () {
          errorsSvc.clear();
          savingsDraftSvc.request($scope.msg)
            .then(function () {
              $location.path('/savings/subscribe/' + currentId());
            }, errorsSvc.set);
        };
        $scope.toSubscribe = function () {
          $location.path('/savings/subscribe/' + currentId());
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsDraft.id;
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

/* vim: fdm=marker
 */
angular.module('app')
  .controller('LoanSubscribeRequestCtrl', ['$timeout', '$rootScope', '$scope',
    '$location', '$routeParams', 'loanDraft', 'errorsSvc', 'loanDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      loanDraft, errorsSvc, loanDraftSvc) {
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
          loanDraftSvc.request($scope.msg)
            .then(function () {
              $location.path('/loan/subscribe/' + currentId());
            }, errorsSvc.set);
        };
        $scope.toSubscribe = function () {
          $location.path('/loan/subscribe/' + currentId());
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = loanDraft.id;
      if (current === cached) {
        initScope();
      }
      else {
        loanDraftSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .controller('LoanSubscribeAdminCtrl', ['$timeout', '$rootScope', '$scope',
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
        $scope.policy = loanDraft;
        $scope.reload = function () {
          errorsSvc.clear();
          loanDraftSvc.read(currentId())
            .then(function () {}, errorsSvc.set);
        };
        $scope.save = function () {
          errorsSvc.clear();
          loanDraftSvc.admin()
            .then(function () {}, errorsSvc.set);
        };
        $scope.toSubscribe = function () {
          $location.path('/loan/subscribe/' + currentId());
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = loanDraft._id;
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

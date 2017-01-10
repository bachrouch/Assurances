/* vim : fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeToQuoteCtrl', ['$timeout', '$rootScope',
    '$scope', '$location', '$routeParams', 'savingsDraft', 'savingsQuote',
    'errorsSvc', 'savingsDraftSvc', 'savingsQuoteSvc', 'actorsSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      savingsDraft, savingsQuote, errorsSvc, savingsDraftSvc, savingsQuoteSvc,
      actorsSvc) {
      function currentId() {
        //{{{
        return $routeParams.draft;
        //}}}
      }

      function initScope() {
        //{{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsQuote;
        $scope.reload = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.read(current)
            .then(function () {
              savingsQuote.fromDraft();
              initScope();
            }, errorsSvc.set);
          // }}}
        };
        $scope.validate = function () {
          // {{{
          errorsSvc.clear();
          actorsSvc.setPerson(savingsQuote.subscriber)
            .then(function () {
              savingsQuoteSvc.create()
                .then(function () {
                  $location.path('/savings/quote/' + savingsQuote.def.ref);
                })
                .then(function () {}, errorsSvc.set);
            }, errorsSvc.set);
          // }}}
        };
        $scope.toSubscribe = function () {
          // {{{
          $location.path('/savings/subscribe/' + currentId());
          // }}}
        };
        //}}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsDraft._id;
      if (current === cached) {
        savingsQuote.fromDraft();
        initScope();
      }
      else {
        savingsDraftSvc.read(current)
          .then(function () {
            savingsQuote.fromDraft();
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

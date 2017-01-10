/* vim: fdm=marker
 */
angular.module('app')
  .controller('LoanSubscribeCtrl', ['$timeout', '$rootScope', '$scope',
    '$location', '$route', '$routeParams', 'loanDraft', 'errorsSvc',
    'loanDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $route, $routeParams,
      loanDraft, errorsSvc, loanDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function getInsuredSummary() {
        $scope.computed.insured = loanDraft.getInsuredSummary();
      }

      function getDefSummary() {
        $scope.computed.def = loanDraft.getDefSummary();
      }

      function getAdjustementSummary() {
        $scope.computed.adjustement = loanDraft.getAdjustementSummary();
      }

      function toTerms() {
        // {{{
        $scope.policy.terms[0].cap = loanDraft.def.capital;
        //}}}
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = loanDraft;
        $scope.computed = {};
        getInsuredSummary();
        getDefSummary();
        getAdjustementSummary();
        //watch policy.insured
        $scope.$watchGroup(['policy.insured.birthDate',
          'policy.insured.gender'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getInsuredSummary();
          }
        });
        //watch policy.def
        $scope.$watchGroup(['policy.def.effDate', 'policy.def.termDate',
          'policy.def.deductible', 'policy.def.capital'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getDefSummary();
          }
        });
        //watch policy.terms
        $scope.$watch('policy.def.capital', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            toTerms();
          }
        });
        //watch policy.adjustement
        $scope.$watchGroup(['policy.adjustement.termSurvAdjust',
          'policy.adjustement.com'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getAdjustementSummary();
          }
        });
        $scope.reload = function () {
          // {{{
          errorsSvc.clear();
          loanDraftSvc.read(currentId())
            .then(function () {}, errorsSvc.set);
          // }}}
        };
        $scope.save = function () {
          // {{{
          errorsSvc.clear();
          loanDraftSvc.update()
            .then(function () {}, errorsSvc.set);
          // }}}
        };
        $scope.toRequest = function () {
          // {{{
          $location.path('/loan/subscribe/' + currentId() + '/request');
          // }}}
        };
        $scope.toBackEnd = function () {
          // {{{
          errorsSvc.clear();
          loanDraftSvc.check('savingsBack')
            .then(function () {
              $location.path('/loan/subscribe/' + currentId() +
                '/backoffice');
            }, errorsSvc.set);
          // }}}
        };
        $scope.toAdmin = function () {
          // {{{
          errorsSvc.clear();
          loanDraftSvc.check('savingsAdmin')
            .then(function () {
              $location.path('/loan/subscribe/' + currentId() + '/admin');
            }, errorsSvc.set);
          // }}}
        };
        $scope.toContract = function () {
          // {{{
          // errorsSvc.clear();
          // loanDraftSvc.check('savingsPos')
          //   .then(function () {
          //     loanDraftSvc.update()
          //       .then(function () {
          //         $location.path('/loan/subscribe/' + currentId() +
          //           '/to-contract');
          //       }, errorsSvc.set);
          //   }, errorsSvc.set);
          // // }}}
        };
        $scope.toQuote = function () {
          ///{{{
          // errorsSvc.clear();
          // loanDraftSvc.update()
          //   .then(function () {
          //     $location.path('/loan/subscribe/' + currentId() +
          //       '/to-quote');
          //   }, errorsSvc.set);
          //}}}
        };
        // }}}
      }

      function manageLast() {
        // {{{
        var id = loanDraft._id;
        if (id) {
          $route.updateParams({
            draft: id
          });
        }
        else {
          $route.updateParams({
            draft: 'new'
          });
        }
        // }}}
      }

      function manageNew() {
        // {{{
        loanDraftSvc.create()
          .then(function () {
            $route.updateParams({
              draft: 'last'
            });
          }, errorsSvc.set);
        // }}}
      }

      function manageReference() {
        // {{{
        var current = currentId();
        var cached = loanDraft._id;
        if (current === cached) {
          initScope();
        }
        else {
          loanDraftSvc.read(current)
            .then(function () {
              $route.updateParams({
                draft: 'last'
              });
            }, errorsSvc.set);
        }
        // }}}
      }
      errorsSvc.clear();
      if (currentId() === 'last') {
        manageLast();
      }
      else if (currentId() === 'new') {
        manageNew();
      }
      else {
        manageReference();
      }
    }
  ]);

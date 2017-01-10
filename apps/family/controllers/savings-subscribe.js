/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeCtrl', ['$timeout', '$rootScope', '$scope',
    '$location', '$route', '$routeParams', 'savingsDraft', 'errorsSvc',
    'savingsDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $route, $routeParams,
      savingsDraft, errorsSvc, savingsDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function getInsuredSummary() {
        $scope.computed.insured = savingsDraft.getInsuredSummary();
      }

      function getDefSummary() {
        $scope.computed.def = savingsDraft.getDefSummary();
      }

      function getDepositSummary() {
        $scope.computed.deposit = savingsDraft.getDepositSummary();
      }

      function getTermsSummary() {
        $scope.computed.terms = savingsDraft.getTermsSummary();
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsDraft;
        $scope.computed = {};
        getInsuredSummary();
        getDefSummary();
        getDepositSummary();
        getTermsSummary();
        //watch policy.insured
        $scope.$watchGroup(['policy.insured.birthDate',
          'policy.insured.gender', 'policy.insured.job',
          'policy.insured.taxRate'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getInsuredSummary();
          }
        });
        //watch policy.def
        $scope.$watchGroup(['policy.def.effDate', 'policy.def.termDate'],
          function (newValue, oldValue) {
            if (newValue !== oldValue) {
              getDefSummary();
            }
          });
        //watch policy.deposit
        $scope.$watchGroup(['policy.deposit.initial',
          'policy.deposit.periodic', 'policy.deposit.updateRate',
          'policy.deposit.period', 'policy.deposit.number',
          'policy.deposit.nextDate'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getDepositSummary();
          }
        });
        //watch policy.terms
        $scope.$watchCollection('policy.terms', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getTermsSummary();
          }
        });
        $scope.reload = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.read(currentId())
            .then(function () {}, errorsSvc.set);
          // }}}
        };
        $scope.save = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.update()
            .then(function () {}, errorsSvc.set);
          // }}}
        };
        $scope.toRequest = function () {
          // {{{
          $location.path('/savings/subscribe/' + currentId() + '/request');
          // }}}
        };
        $scope.toBackEnd = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsBack')
            .then(function () {
              $location.path('/savings/subscribe/' + currentId() +
                '/backoffice');
            }, errorsSvc.set);
          // }}}
        };
        $scope.toAdmin = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsAdmin')
            .then(function () {
              $location.path('/savings/subscribe/' + currentId() +
                '/admin');
            }, errorsSvc.set);
          // }}}
        };
        $scope.toContract = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsPos')
            .then(function () {
              savingsDraftSvc.update()
                .then(function () {
                  $location.path('/savings/subscribe/' + currentId() +
                    '/to-contract');
                }, errorsSvc.set);
            }, errorsSvc.set);
          // }}}
        };
        $scope.toQuote = function () {
          ///{{{
          errorsSvc.clear();
          savingsDraftSvc.update()
            .then(function () {
              $location.path('/savings/subscribe/' + currentId() +
                '/to-quote');
            }, errorsSvc.set);
          //}}}
        };
        // }}}
      }

      function manageLast() {
        // {{{
        var id = savingsDraft._id;
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
        savingsDraftSvc.create()
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
        var cached = savingsDraft._id;
        if (current === cached) {
          initScope();
        }
        else {
          savingsDraftSvc.read(current)
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

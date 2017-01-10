/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeBackofficeCtrl', ['$timeout', '$rootScope',
    '$scope', '$location', '$route', '$routeParams', 'savingsDraft',
    'errorsSvc', 'savingsDraftSvc',
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
          'policy.deposit.nexDate'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getDepositSummary();
          }
        });
        //policy.terms
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
        $scope.toSubscribe = function () {
          // {{{
          $location.path('/savings/subscribe/' + currentId());
          // }}}
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

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsFreeDepositCtrl', ['$timeout', '$rootScope', '$scope',
    '$routeParams', '$filter', '$location', 'savingsContract', 'errorsSvc',
    'savingsContractSvc',
    function ($timeout, $rootScope, $scope, $routeParams, $filter, $location,
      savingsContract, errorsSvc, savingsContractSvc) {
      function currentId() {
        // {{{
        return $routeParams.contract;
        // }}}
      }

      function defaultDep() {
        var result = {
          amount: 0,
          effDate: moment()
            .toDate(),
          com: $scope.policy.admin.depFreeDefComRate
        };
        return result;
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsContract;
        $scope.cur = defaultDep();
        $scope.toContract = function () {
          // {{{
          $location.path('/savings/contract/' + $scope.policy.def.ref);
          // }}}*/
        };
        $scope.save = function () {
          //{{{
          savingsContract.deposit.free.push($scope.cur);
          errorsSvc.clear();
          savingsContractSvc.saveFreeDeposit()
            .then(function () {
              $location.path('/savings/contract/' + $scope.policy.def.ref);
            }, errorsSvc.set);
        };
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsContract.def.ref;
      if (current === cached) {
        initScope();
      }
      else {
        savingsContractSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

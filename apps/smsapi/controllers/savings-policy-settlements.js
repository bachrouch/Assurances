/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySettlementsCtrl', ['$scope', 'savingsDraft',
    'savingsContract',
    function ($scope, savingsDraft, savingsContract) {
      function getDefaultSettlement() {
        // {{{
        if ($scope.settlements) {
          var remaining = $scope.toPay - $scope.settlements.reduce(function (
            s, memo) {
            return s + memo.amount;
          }, 0);
          return {
            mode: 'cash',
            amount: remaining >= 0 ? remaining : 0
          };
        }
        // }}}
      }

      function set() {
        // {{{
        $scope.pure = ($scope.deposit.initial || 0) + ($scope.deposit.periodic ||
          0);
        $scope.fees = $scope.admin.feesIni + $scope.admin.feesDep;
        $scope.toPay = $scope.pure + $scope.fees;
        // }}}
      }
      $scope.pure = 0;
      $scope.fees = 0;
      $scope.toPay = 0;
      $scope.init = function (obj) {
        // {{{
        $scope.$on('started', function () {
          var policy;
          if (obj === 'draft') {
            policy = savingsDraft;
          }
          else if (obj === 'contract') {
            policy = savingsContract;
          }
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.admin = policy.admin;
          $scope.deposit = policy.deposit;
          $scope.settlements = policy.settlements;
          set();
          $scope.cur = getDefaultSettlement();
          //watch admin
          $scope.$watchCollection('admin', set);
          //watch deposit
          $scope.$watchGroup(['deposit.initial', 'deposit.periodic',
            'deposit.updateRate', 'deposit.period',
            'deposit.number', 'deposit.nextDate'
          ], function (newValue, oldValue) {
            if (newValue !== oldValue) {
              set();
            }
          });
        });
        // }}}
      };
      $scope.addSettlement = function () {
        // {{{
        $scope.settlements.push($scope.cur);
        $scope.cur = getDefaultSettlement();
        // }}}
      };
      $scope.delSettlement = function (index) {
        // {{{
        $scope.settlements.splice(index, 1);
        // }}}
      };
    }
  ]);

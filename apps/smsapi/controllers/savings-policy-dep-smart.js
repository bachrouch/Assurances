/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyDepSmart', ['$scope', 'savingsDraft',
    'savingsContract', 'moment',
    function ($scope, savingsDraft, savingsContract, moment) {
      function setNextDate() {
        // {{{
        $scope.deposit.nextDate = moment($scope.def.effDate)
          .add(12 / $scope.deposit.period, 'month')
          .toDate();
        var debitDay = $scope.debitDay;
        $scope.deposit.nextDate = moment($scope.deposit.nextDate)
          .date(debitDay)
          .toDate();
        // }}}
      }

      function setNumber() {
        // {{{
        if ($scope.deposit.periodic) {
          var endDate = moment($scope.def.termDate)
            .subtract(1, 'day');
          var diff = endDate.diff($scope.deposit.nextDate, 'month');
          var number = Math.floor(diff * $scope.deposit.period / 12);
          $scope.deposit.number = number + 1;
          var lastDate = moment($scope.deposit.nextDate)
            .add(($scope.deposit.number - 1) * (12 / $scope.deposit.period),
              'month');
          while (lastDate < endDate) {
            lastDate = moment(lastDate)
              .add((12 / $scope.deposit.period), 'month');
            $scope.deposit.number += 1;
          }
        }
        // no periodic deposit
        else {
          $scope.deposit.number = 0;
        }
        // }}}
      }

      function set() {
        // {{{
        setNextDate();
        setNumber();
        // }}}
      }
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
          $scope.def = policy.def;
          $scope.deposit = policy.deposit;
          $scope.debitDay = 10;
          setNumber();
          //watch def
          $scope.$watchGroup(['def.effDate', 'def.termDate'], function (
            newValue, oldValue) {
            if (newValue !== oldValue) {
              setNumber();
            }
          });
          //watch deposit
          $scope.$watchGroup(['deposit.initial', 'deposit.periodic',
            'deposit.updateRate', 'deposit.nextDate'
          ], function (newValue, oldValue) {
            if (newValue !== oldValue) {
              setNumber();
            }
          });
          //watch period
          $scope.$watch('deposit.period', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              set();
            }
          });
          //watch debitDay
          $scope.$watch('debitDay', setNextDate);
        });
        // }}}
      };
    }
  ]);

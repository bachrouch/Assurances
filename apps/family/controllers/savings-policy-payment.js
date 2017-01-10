/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyPaymentCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'errorsSvc',
    function ($scope, savingsDraft, savingsContract, errorsSvc) {
      function setPaymentMethod() {
        if ($scope.isDebit) {
          $scope.policy.payment.mode = 'debit';
        }
        else {
          if ($scope.policy && $scope.policy.payment) {
            $scope.policy.payment.mode = '';
            $scope.policy.payment.bankAccount = '';
            $scope.bankCode = '';
            $scope.branchCode = '';
            $scope.accountNumber = '';
            $scope.key = '';
          }
        }
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
          $scope.policy = policy;
          $scope.payment = policy.payment;
        });
        // }}}
        //watch payment mode
        $scope.$watch('isDebit', setPaymentMethod);
      };
      $scope.validateAccount = function () {
        //{{{
        errorsSvc.clear();
        if ($scope.bankCode === undefined) {
          errorsSvc.set('Le code banque est sur 2 caractères');
        }
        if ($scope.branchCode === undefined) {
          errorsSvc.set('Le code agence est sur 3 caractères');
        }
        if ($scope.accountNumber === undefined) {
          errorsSvc.set('Le n° du compte est sur 13 caractères');
        }
        if ($scope.key === undefined) {
          errorsSvc.set('La clé est sur 2 caractères');
        }
        if ($scope.bankCode && $scope.branchCode && $scope.accountNumber &&
          $scope.key) {
          $scope.policy.payment.mode = 'debit';
          $scope.policy.payment.bankAccount = $scope.bankCode + $scope.branchCode +
            $scope.accountNumber + $scope.key;
        }
        else {
          if ($scope.policy.payment) {
            $scope.policy.payment.mode = '';
            $scope.policy.payment.bankAccount = '';
          }
        }
        //}}}
      };
    }
  ]);

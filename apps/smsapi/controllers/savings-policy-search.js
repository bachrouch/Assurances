/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySearchCtrl', ['$rootScope', '$scope', '$http',
    '$filter', '$location', 'savingsContract', 'savingsQuote', 'errorsSvc',
    'savingsContractSvc', 'savingsQuoteSvc',
    function ($rootScope, $scope, $http, $filter, $location, savingsContract,
      savingsQuote, errorsSvc, savingsContractSvc, savingsQuoteSvc) {
      function initScope() {
        // {{{
        $scope.criteria = {};
        $scope.search = function () {
          // {{{
          errorsSvc.clear();
          if ($scope.criteria.isQuote) {
            errorsSvc.clear();
            savingsQuoteSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'quote';
              }, errorsSvc.set);
          }
          else {
            errorsSvc.clear();
            savingsContractSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'contract';
              }, errorsSvc.set);
          }
        };
        $scope.testSMS = function (result) {
          console.log(res + '********');
          /*
          errorsSvc.clear();
          if ($scope.criteria.isQuote) {
            errorsSvc.clear();
            savingsQuoteSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'quote';
              }, errorsSvc.set);
          }
          else {
            errorsSvc.clear();
            savingsContractSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'contract';
              }, errorsSvc.set);
          }
          */
          errorsSvc.clear();
          if ($scope.criteria.isQuote) {
            errorsSvc.clear();
            savingsQuoteSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'quote';
              }, errorsSvc.set);
          }
          else {
            errorsSvc.clear();
            savingsContractSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'contract';
              }, errorsSvc.set);
          }
        };
        $scope.redirectSms = function () {
          $location.path('savings/form');
        };
      }
      errorsSvc.clear();
      initScope();
    }
  ]);

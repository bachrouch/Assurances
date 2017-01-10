/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySearchCtrl', ['$rootScope', '$scope', '$filter',
    'savingsContract', 'savingsQuote', 'errorsSvc', 'savingsContractSvc',
    'savingsQuoteSvc',
    function ($rootScope, $scope, $filter, savingsContract, savingsQuote,
      errorsSvc, savingsContractSvc, savingsQuoteSvc) {
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
      }
      errorsSvc.clear();
      initScope();
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySummaryCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'savingsQuote',
    function ($scope, savingsDraft, savingsContract, savingsQuote) {
      $scope.computed = {
        premium: null,
        taxEco: null,
        term: null,
        cumul: null
      };

      function calc() {
        //{{{
        var premium = 0;
        var taxEco = 0;
        var term = 0;
        var cumul = 0;
        var y, it;
        var lastYear = 0;
        for (y in $scope.sits) {
          // since it is not an array, it is not ordered => no direct access to last year
          lastYear = Math.max(y, lastYear);
          it = $scope.sits[y];
          premium += it.premium;
          taxEco += it.taxEco;
          term += it.term;
        }
        cumul = $scope.sits[lastYear].cumul;
        $scope.computed.premium = premium;
        $scope.computed.taxEco = taxEco;
        $scope.computed.term = term;
        $scope.computed.cumul = cumul;
        //}}}
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
          else if (obj === 'quote') {
            policy = savingsQuote;
          }
          else {
            throw new Error('unknow policy obj: ' + obj);
          }
          $scope.sits = policy.sits;
          calc();
          $scope.$watchCollection('sits', calc);
        });
        //}}}
      };
    }
  ]);

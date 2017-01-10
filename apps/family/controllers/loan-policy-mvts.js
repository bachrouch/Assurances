/* vim: fdm=marker
 */
angular.module('app')
  .controller('LoanPolicyMvtsCtrl', ['$scope', 'loanDraft',
    function ($scope, loanDraft) {
      function getContribution() {
        // {{{ 
        $scope.computed.premium = $scope.policy.mvts.map(function (obj) {
            return obj.amount;
          })
          .reduce(function (a, b) {
            var res = a + b;
            res = Number(res.toFixed(3));
            return res;
          });
        // }}}
      }

      function getFees() {
        // {{{ 
        $scope.computed.fees = $scope.policy.admin.fees;
        // }}}
      }

      function getTotal() {
        // {{{
        var total = $scope.computed.premium + $scope.computed.fees;
        $scope.computed.total = Number(total.toFixed(3));
        // }}}
      }
      $scope.$watchCollection('policy.mvts', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          getContribution();
          getFees();
          getTotal();
        }
      });
      $scope.init = function (obj) {
        // {{{
        $scope.$on('started', function () {
          var policy;
          if (obj === 'draft') {
            policy = loanDraft;
          }
          else if (obj === 'contract') {
            //     policy = loanContract;
          }
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.policy = policy;
          $scope.computed = {};
          getContribution();
          getFees();
          getTotal();
        });
        // }}}
      };
    }
  ]);

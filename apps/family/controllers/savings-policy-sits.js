/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySitsCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'savingsQuote',
    function ($scope, savingsDraft, savingsContract, savingsQuote) {
      function refresh() {
        // {{{
        var policy = $scope.policy;
        $scope.sits.length = 0;
        Object.keys(policy.sits)
          .sort()
          .map(function (k) {
            var o = policy.sits[k];
            o.year = k;
            $scope.sits.push(o);
          });
        $scope.withD = !!$scope.sits[0].d;
        $scope.withI = !!$scope.sits[0].i;
        $scope.withAD = !!$scope.sits[0].ad;
        $scope.withAI = !!$scope.sits[0].ai;
        $scope.withTerm = !!$scope.sits[0].term;
        // }}}
      }
      $scope.max = function (evt, cap, sav) {
        var terms = $scope.policy.terms;
        var type;
        var result;
        var tcap = 0;
        if (terms.length > 0) {
          type = terms[0].type;
        }
        if (type === 'd') {
          tcap = $scope.sits[0][evt];
          result = Math.max(tcap, sav);
        }
        else {
          result = cap + sav;
        }
        return result;
      };
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
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.policy = policy;
          $scope.sits = [];
          $scope.$watchCollection('policy.sits', refresh);
          // }}}
        });
      };
    }
  ]);

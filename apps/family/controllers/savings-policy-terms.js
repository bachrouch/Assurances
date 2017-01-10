/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyTermsCtrl', ['$scope', 'savingsDraft',
    'savingsContract',
    function ($scope, savingsDraft, savingsContract) {
      function getDefaultTerm() {
        // {{{
        return {
          evt: 'd',
          type: 'd'
        };
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
          $scope.terms = policy.terms;
          $scope.cur = getDefaultTerm();
        });
        // }}}
      };
      $scope.addTerm = function () {
        // {{{
        $scope.cur.fromBack = true;
        $scope.terms.push($scope.cur);
        $scope.cur = getDefaultTerm();
        // }}}
      };
      $scope.delTerm = function (index) {
        // {{{
        $scope.terms.splice(index, 1);
        // }}}
      };
    }
  ]);

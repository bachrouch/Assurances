/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyMvtsCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'savingsQuote',
    function ($scope, savingsDraft, savingsContract, savingsQuote) {
      function setYears() {
        // {{{
        if ($scope.policy && $scope.policy._id) {
          $scope.computed.years = Object.keys($scope.policy.sits);
        }
        // }}}
      }

      function filterMvts() {
        // {{{
        if ($scope.policy && $scope.policy._id) {
          $scope.computed.mvts = $scope.policy.mvts.filter(function (mvt) {
            if ($scope.type && mvt.type !== $scope.type) {
              return false;
            }
            if ($scope.year && mvt.date.substr(0, 4) !== $scope.year) {
              return false;
            }
            return true;
          });
          $scope.computed.total = 0;
          if ($scope.computed.mvts.length > 0) {
            $scope.computed.total = $scope.computed.mvts.map(function (obj) {
                return obj.amount;
              })
              .reduce(function (a, b) {
                return a + b;
              });
          }
        }
        // }}}
      }
      $scope.computed = {
        // {{{
        years: [],
        mvts: [],
        total: 0
          // }}}
      };
      $scope.init = function (obj) {
        // {{{
        $scope.$on('started', function () {
          if (obj === 'draft') {
            $scope.policy = savingsDraft;
          }
          else if (obj === 'contract') {
            $scope.policy = savingsContract;
          }
          else if (obj === 'quote') {
            $scope.policy = savingsQuote;
          }
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          filterMvts();
          setYears();
          //watch year
          $scope.$watch('year', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              filterMvts();
            }
          });
          //watch type
          $scope.$watch('type', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              filterMvts();
            }
          });
          //watch policy.mvts
          $scope.$watchCollection('policy.mvts', filterMvts);
          //watch policy.sist
          $scope.$watchCollection('policy.sits', setYears);
        });
        // }}}
      };
    }
  ]);

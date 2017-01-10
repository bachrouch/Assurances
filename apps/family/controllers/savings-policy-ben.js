/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyBenCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'errorsSvc', 'moment',
    function ($scope, savingsDraft, savingsContract, errorsSvc, moment) {
      function defaultBen() {
        // {{{
        return {
          percent: 1
        };
        // }}}
      }

      function setBen() {
        //{{{
        if ($scope.cur.relation === 'self') {
          $scope.cur.id = $scope.policy.insured.id;
          $scope.cur.birthDate = $scope.policy.insured.birthDate;
          $scope.cur.name = $scope.policy.insured.firstName + ' ' + $scope.policy
            .insured.name;
        }
        //}}}
      }

      function checkBen(ben) {
        //{{{
        var result = false;
        if (ben.percent !== null) {
          if (ben.relation !== 'legal') {
            if ((ben.birthDate !== null) && (ben.relation !== undefined) && (
                ben.name !== undefined)) {
              result = true;
            }
            if (ben.birthDate) {
              var age = moment(moment())
                .diff(ben.birthDate, 'year', true);
              if ((age > 18) && ((ben.id === undefined) || (ben.id === ''))) {
                result = false;
              }
            }
          }
          else {
            result = true;
          }
        }
        return (result);
        //}}}
      }
      $scope.init = function (obj, evt) {
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
          $scope.cur = defaultBen();
          $scope.ben = policy[evt + 'Ben'];
          //watch relation
          $scope.$watch('cur.relation', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              setBen();
            }
          });
        });
        // }}}
      };
      $scope.addBen = function () {
        // {{{
        if (checkBen($scope.cur)) {
          $scope.ben.push($scope.cur);
          $scope.cur = defaultBen();
        }
        else {
          errorsSvc.set('Veuillez vérifier les données du bénéficiaire.');
        }
        // }}}
      };
      $scope.delBen = function (index) {
        // {{{
        $scope.ben.splice(index, 1);
        // }}}
      };
    }
  ]);

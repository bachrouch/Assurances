/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyDefSmart', ['$scope', 'savingsDraft',
    'savingsContract', 'moment',
    function ($scope, savingsDraft, savingsContract, moment) {
      function setDurationInDays() {
        // {{{
        $scope.durationDays = moment($scope.def.termDate)
          .diff($scope.def.effDate, 'day');
        // }}}
      }

      function setDurationTermDate() {
        $scope.def.termDate = moment($scope.def.effDate)
          .add($scope.duration, 'year')
          .toDate();
        setDurationInDays();
      }

      function setTermDate() {
        // {{{
        if ($scope.termMode === 'f') {
          $scope.def.termDate = moment($scope.def.effDate)
            .add($scope.durationDays, 'day')
            .toDate();
        }
        else {
          $scope.def.termDate = moment($scope.insured.birthDate)
            .add($scope.termMode, 'year')
            .toDate();
          $scope.duration = moment($scope.def.termDate)
            .diff($scope.def.effDate, 'year');
          var exactDuration = moment($scope.def.termDate)
            .diff($scope.def.effDate, 'year', true);
          if (exactDuration > $scope.duration) {
            $scope.duration += 1;
          }
        }
        setDurationInDays();
        // }}}
      }
      $scope.init = function (obj) {
        // {{{
        $scope.$on('started', function () {
          $scope.termMode = 'f';
          $scope.duration = null;
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
          $scope.insured = policy.insured;
          $scope.duration = moment($scope.def.termDate)
            .diff($scope.def.effDate, 'year');
          var exactDuration = moment($scope.def.termDate)
            .diff($scope.def.effDate, 'year', true);
          if (exactDuration > $scope.duration) {
            $scope.duration += 1;
          }
          setDurationInDays();
          //watch def.effDate, insured.birthDate, termMode, durationDays
          $scope.$watchGroup(['def.effDate', 'insured.birthDate',
            'termMode', 'durationDays'
          ], function (newValue, oldValue) {
            if (newValue !== oldValue) {
              setTermDate();
            }
          }, true);
          //watch duration
          $scope.$watch(function () {
            return $scope.duration;
          }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
              setDurationTermDate();
            }
          }, true);
        });
        // }}}
      };
    }
  ]);

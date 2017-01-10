/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyInsuredFullCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'savingsQuote', 'errorsSvc',
    function ($scope, savingsDraft, savingsContract, savingsQuote, errorsSvc) {
      function setInsured() {
        // {{{
        errorsSvc.clear();
        if ($scope.isSubscriber) {
          $scope.insured.id = $scope.subscriber.id;
          $scope.insured.name = $scope.subscriber.name;
          $scope.insured.firstName = $scope.subscriber.firstName;
          $scope.insured.email = $scope.subscriber.email;
          $scope.insured.mobile = $scope.subscriber.mobile;
          if ((moment($scope.subscriber.birthDate)
              .format('YYYY-MM-DD')) !== (moment($scope.insured.birthDate)
              .format('YYYY-MM-DD'))) {
            errorsSvc.set(
              'Veuillez retourner au simulateur pour modifier la date de naissance de l\'assuré.'
            );
          }
        }
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
          else if (obj === 'quote') {
            policy = savingsQuote;
          }
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.isSubscriber = false;
          $scope.insured = policy.insured;
          $scope.subscriber = policy.subscriber;
          $scope.$watch('isSubscriber', setInsured);
          $scope.$watch(function () {
            return $scope.subscriber.birthDate;
          }, function (oldValue, newValue) {
            if (oldValue !== newValue) {
              if ($scope.isSubscriber) {
                setInsured();
              }
            }
          });
        });
        // }}}
      };
    }
  ]);

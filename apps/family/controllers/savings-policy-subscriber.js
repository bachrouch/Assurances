/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySubscriberCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'savingsQuote', 'actorsSvc',
    function ($scope, savingsDraft, savingsContract, savingsQuote, actorsSvc) {
      $scope.init = function (obj) {
        // {{{
        $scope.$on('started', function () {
          $scope.existing = false;
          $scope.error = null;
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
          $scope.subscriber = policy.subscriber;
          $scope.isInsured = false;
          $scope.insured = policy.insured;
          $scope.subscriber = policy.subscriber;
          $scope.$watch('subscriber.id', function () {
            $scope.existing = false;
          });
        });
        //}}}
      };
      $scope.subscriberFromId = function () {
        //{{{
        $scope.error = null;
        actorsSvc.readPerson($scope.subscriber.id)
          .then(function (data) {
            if (data.inexisting) {
              delete data.inexisting;
              $scope.existing = false;
            }
            else {
              $scope.existing = true;
            }
            data.birthDate = data.birthDate ? new Date(data.birthDate) :
              null;
            angular.copy(data, $scope.subscriber);
          }, function (error) {
            $scope.error = error;
          });
        //}}}
      };
    }
  ]);

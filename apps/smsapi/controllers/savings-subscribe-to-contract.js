/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeToContractCtrl', ['$timeout', '$rootScope',
    '$scope', '$location', '$routeParams', 'savingsDraft', 'savingsContract',
    'errorsSvc', 'savingsDraftSvc', 'savingsContractSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      savingsDraft, savingsContract, errorsSvc, savingsDraftSvc,
      savingsContractSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function getSubscriberSummary() {
        $scope.computed.subscriber = savingsContract.getSubscriberSummary();
      }

      function getInsuredSummary() {
        $scope.computed.insured = savingsContract.getInsuredSummary();
      }

      function getLifeBenSummary() {
        $scope.computed.lifeBen = savingsContract.getLifeBenSummary();
      }

      function getDeathBenSummary() {
        $scope.computed.deathBen = savingsContract.getDeathBenSummary();
      }

      function getPaymentSummary() {
        $scope.computed.payment = savingsContract.getPaymentSummary();
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsContract;
        $scope.payment = savingsContract.payment;
        $scope.computed = {};
        $scope.lock = false;
        getSubscriberSummary();
        getInsuredSummary();
        getLifeBenSummary();
        getDeathBenSummary();
        getPaymentSummary();
        //watch policy.subscriber
        $scope.$watchGroup(['policy.subscriber.id',
          'policy.subscriber.gender', 'policy.subscriber.firstName',
          'policy.subscriber.name', 'policy.subscriber.mobile',
          'policy.subscriber.email', 'policy.subscriber.address'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getSubscriberSummary();
          }
        });
        //watch policy.insured
        $scope.$watchGroup(['policy.insured.birthDate',
          'policy.insured.gender', 'policy.insured.job',
          'policy.insured.taxRate', 'policy.insured.id',
          'policy.insured.firstName', 'policy.insured.name',
          'policy.insured.mobile', 'policy.insured.email'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getInsuredSummary();
          }
        });
        $scope.$watchCollection('policy.lifeBen', function (newValue,
          oldValue) {
          if (newValue !== oldValue) {
            getLifeBenSummary();
          }
        });
        $scope.$watchCollection('policy.deathBen', function (newValue,
          oldValue) {
          if (newValue !== oldValue) {
            getDeathBenSummary();
          }
        });
        $scope.$watch('computed.payment', getPaymentSummary);
        $scope.reload = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.read(current)
            .then(function () {
              savingsContract.fromDraft();
              initScope();
            }, errorsSvc.set);
          // }}}
        };
        $scope.validate = function () {
          // {{{
          errorsSvc.clear();
          savingsContractSvc.create()
            .then(function () {
              $scope.lock = true;
              $location.path('/savings/contract/' + savingsContract.def.ref);
            }, errorsSvc.set, $scope.lock = false);
          // }}}
        };
        $scope.toSubscribe = function () {
          // {{{
          $location.path('/savings/subscribe/' + currentId());
          // }}}
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsDraft._id;
      if (current === cached) {
        savingsContract.fromDraft();
        initScope();
      }
      else {
        savingsDraftSvc.read(current)
          .then(function () {
            savingsContract.fromDraft();
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

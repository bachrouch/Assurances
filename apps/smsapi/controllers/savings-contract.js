/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsContractCtrl', ['$timeout', '$rootScope', '$scope',
    '$routeParams', '$filter', '$location', '$route', 'savingsContract',
    'errorsSvc', 'savingsContractSvc',
    function ($timeout, $rootScope, $scope, $routeParams, $filter, $location,
      $route, savingsContract, errorsSvc, savingsContractSvc) {
      function currentId() {
        // {{{
        return $routeParams.contract;
        // }}}
      }

      function getDuration() {
        //{{{
        if ($scope.policy.deposit.periodic) {
          var pd = $scope.policy.deposit;
          var months = (12 / pd.period) * pd.number;
          if (months % 12) {
            return months + ' mois';
          }
          else {
            return (months / 12) + ' ans';
          }
        }
        // }}}
      }

      function getpdAdjustment() {
        //{{{
        if ($scope.policy.deposit.periodic) {
          var pd = $scope.policy.deposit;
          if (pd.updateRate) {
            return '(+' + $filter('percent')(pd.updateRate) + ' / an)';
          }
        }
        // }}}
      }

      function getDocumentType(policy) {
        var result;
        var product;
        if (policy.def !== null) {
          result = policy.def.nature;
          if (policy.def.nature === 'binder') {
            $scope.docType = 'Note de couv';
          }
          else {
            $scope.docType = 'Conditions parti.';
            if (policy.terms.length > 0) {
              product = 'ep';
            }
            else {
              product = 'er';
            }
            result = result + '-' + product;
          }
        }
        return (result);
      }

      function getDomiciliationStatus(policy) {
        var domiciliationStatus = {};
        domiciliationStatus.toShow = false;
        domiciliationStatus.active = false;
        if (policy.payment !== null) {
          if (policy.payment.mode !== undefined) {
            if (policy.payment.mode !== '') {
              if ((policy.payment.domiciliation) && (policy.payment.domiciliation !==
                  '')) {
                domiciliationStatus.active = true;
              }
              else {
                domiciliationStatus.toShow = true;
              }
            }
          }
        }
        return (domiciliationStatus);
      }

      function toValidate(policy) {
        var result = true;
        if (policy.def !== null) {
          if (policy.def.nature !== 'binder') {
            result = false;
          }
        }
        return (result);
      }

      function isActive(policy) {
        var result = false;
        if (policy.def.status === 'active') {
          result = true;
        }
        return result;
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsContract;
        $scope.date = savingsContract.getDate();
        var docType = getDocumentType($scope.policy);
        $scope.computed = {
          binderDoc: '/print?doc=binder&lob=/savings/' + docType + '&id=' +
            $scope.policy.def.ref
        };
        $scope.computed.pdDuration = getDuration();
        $scope.computed.pdAdjustment = getpdAdjustment();
        $scope.domiciliationStatus = getDomiciliationStatus($scope.policy);
        $scope.toValidate = toValidate($scope.policy);
        $scope.isActive = isActive($scope.policy);
        $scope.toFreeDeposit = function () {
          // {{{
          errorsSvc.clear();
          savingsContractSvc.check('savingsBack')
            .then(function () {
              $location.path('/savings/' + $scope.policy.def.ref +
                '/deposit');
            }, errorsSvc.set);
          // }}}
        };
        $scope.domiciliate = function () {
          // {{{
          errorsSvc.clear();
          savingsContractSvc.check('savingsBack')
            .then(function () {
              savingsContractSvc.domiciliate()
                .then(function () {
                  $route.reload();
                }, errorsSvc.set);
            }, errorsSvc.set);
          // }}}
        };
        $scope.validate = function () {
          //{{{
          errorsSvc.clear();
          savingsContractSvc.check('savingsAdmin')
            .then(function () {
              savingsContractSvc.validate()
                .then(function () {
                  $route.reload();
                }, errorsSvc.set);
            }, errorsSvc.set);
          //}}}
        };
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsContract.def.ref;
      if (current === cached) {
        initScope();
      }
      else {
        savingsContractSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

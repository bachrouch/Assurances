/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsQuoteCtrl', ['$timeout', '$rootScope', '$scope',
    '$routeParams', '$filter', '$location', 'savingsQuote', 'errorsSvc',
    'savingsQuoteSvc', 'savingsDraftSvc',
    function ($timeout, $rootScope, $scope, $routeParams, $filter, $location,
      savingsQuote, errorsSvc, savingsQuoteSvc, savingsDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.quote;
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

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsQuote;
        $scope.date = savingsQuote.getDate();
        $scope.computed = {
          quoteDoc: '/print?doc=quote&lob=/savings/quote&id=' + $scope.policy
            .def.ref + '&sdemail=' + $scope.policy.subscriber.email
        };
        $scope.computed.pdDuration = getDuration();
        $scope.computed.pdAdjustment = getpdAdjustment();
        $scope.toContract = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsPos')
            .then(function () {
              savingsDraftSvc.createFromQuote()
                .then(function (data) {
                  $location.path('/savings/subscribe/' + data._id);
                }, errorsSvc.set);
            }, errorsSvc.set);
          // }}}*/
        };
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsQuote.def.ref;
      if (current === cached) {
        initScope();
      }
      else {
        savingsQuoteSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

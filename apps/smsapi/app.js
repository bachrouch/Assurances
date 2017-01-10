angular.module('app', ['ng', 'ngRoute', 'ui.bootstrap', 'angularMoment',
    'chart.js'
  ])
  .config(
    ['$routeProvider',
      function ($routeProvider) {
        $routeProvider.when('/savings/search', {
            templateUrl: '/smsapi/savings-policy-search',
            controller: 'SavingsPolicySearchCtrl'
          })
          .when('/savings/form', {
            templateUrl: '/smsapi/savings-policy-form',
            controller: 'SendSmsCtrl'
          })
          .otherwise({
            redirectTo: '/index'
          });
      }
    ])
  .run(['$rootScope', 'enums', 'errors', function ($rootScope, enums, errors) {
    $rootScope.enums = enums;
    $rootScope.errors = errors;
  }]);

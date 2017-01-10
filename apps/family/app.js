angular.module('app', ['ng', 'ngRoute', 'ui.bootstrap', 'angularMoment',
    'chart.js'
  ])
  .config(
    ['$routeProvider',
      function ($routeProvider) {
        $routeProvider.when('/index', {
            templateUrl: '/family/index',
            controller: 'IndexCtrl'
          })
          .when('/savings/subscribe', {
            redirectTo: '/savings/subscribe/last'
          })
          .when('/savings/subscribe/:draft', {
            templateUrl: '/family/savings-subscribe',
            controller: 'SavingsSubscribeCtrl'
          })
          .when('/savings/subscribe/:draft/to-contract', {
            templateUrl: '/family/savings-subscribe-to-contract',
            controller: 'SavingsSubscribeToContractCtrl'
          })
          .when('/savings/subscribe/:draft/to-quote', {
            templateUrl: '/family/savings-subscribe-to-quote',
            controller: 'SavingsSubscribeToQuoteCtrl'
          })
          .when('/savings/subscribe/:draft/request', {
            templateUrl: '/family/savings-subscribe-request',
            controller: 'SavingsSubscribeRequestCtrl'
          })
          .when('/savings/subscribe/:draft/backoffice', {
            templateUrl: '/family/savings-subscribe-backoffice',
            controller: 'SavingsSubscribeBackofficeCtrl'
          })
          .when('/savings/subscribe/:draft/admin', {
            templateUrl: '/family/savings-subscribe-admin',
            controller: 'SavingsSubscribeAdminCtrl'
          })
          .when('/savings/quote/:quote', {
            templateUrl: '/family/savings-quote',
            controller: 'SavingsQuoteCtrl'
          })
          .when('/savings/contract/:contract', {
            templateUrl: '/family/savings-contract',
            controller: 'SavingsContractCtrl'
          })
          .when('/savings/:contract/deposit', {
            templateUrl: '/family/savings-free-deposit',
            controller: 'SavingsFreeDepositCtrl'
          })
          .when('/savings/search', {
            templateUrl: '/family/savings-policy-search',
            controller: 'SavingsPolicySearchCtrl'
          })
          .when('/loan/subscribe', {
            redirectTo: '/loan/subscribe/last'
          })
          .when('/loan/subscribe/:draft', {
            templateUrl: '/family/loan-subscribe',
            controller: 'LoanSubscribeCtrl'
          })
          .when('/loan/subscribe/:draft/request', {
            templateUrl: '/family/loan-subscribe-request',
            controller: 'LoanSubscribeRequestCtrl'
          })
          .when('/loan/subscribe/:draft/admin', {
            templateUrl: '/family/loan-subscribe-admin',
            controller: 'LoanSubscribeAdminCtrl'
          })
          .when('/loan/subscribe/:draft/backoffice', {
            templateUrl: '/family/loan-subscribe-backoffice',
            controller: 'LoanSubscribeBackofficeCtrl'
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

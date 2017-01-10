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

/* vim: fdm=marker
 */
angular.module('app')
  .constant('enums', {
    actor: {
      // {{{
      genders: [{
        code: 'm',
        label: 'Monsieur'
      }, {
        code: 'f',
        label: 'Madame'
      }],
      relations: [{
        code: 'self',
        label: 'Soi-même'
      }, {
        code: 'spouse',
        label: 'Conjoint'
      }, {
        code: 'asc',
        label: 'Ascendant'
      }, {
        code: 'des',
        label: 'Descendant'
      }, {
        code: 'legal',
        label: 'Héritiers légaux'
      }, {
        code: 'other',
        label: 'Autre'
      }],
      // }}}
    },
    policy: {
      // {{{
      periods: [{
        code: 1,
        label: 'Annuel'
      }, {
        code: 2,
        label: 'Semestriel'
      }, {
        code: 4,
        label: 'Trimestriel'
      }, {
        code: 12,
        label: 'Mensuel'
      }],
      terms: [{
        code: 'f',
        label: 'Fixe'
      }, {
        code: 60,
        label: 'Age terme 60 ans'
      }, {
        code: 62,
        label: 'Age terme 62 ans'
      }, {
        code: 65,
        label: 'Age terme 65 ans'
      }],
      status: [{
          code: 'active',
          label: 'Actif'
        }, {
          code: 'canceled',
          label: 'Annulé'
        }, {
          code: 'suspended',
          label: 'Suspendu'
        }, {
          code: 'terminated',
          label: 'Résilié'
        }]
        // }}}
    },
    finance: {
      // {{{
      paymentMethods: [{
        code: 'cash',
        label: 'Espèces'
      }, {
        code: 'check',
        label: 'Chèque'
      }, {
        code: 'deposit',
        label: 'Versement'
      }, {
        code: 'transfer',
        label: 'Virement'
      }, {
        code: 'promissory',
        label: 'Traite'
      }],
      debitDays: [{
          code: 10,
          label: 10
        }, {
          code: 25,
          label: 25
        }, {
          code: 30,
          label: 30
        }]
        // }}}
    },
    savings: {
      // {{{
      mvts: [{
        code: 'dep',
        label: 'Versement'
      }, {
        code: 'com',
        label: 'Commission'
      }, {
        code: 'term',
        label: 'Prévoyance'
      }, {
        code: 'earn',
        label: 'Rémunération'
      }],
      taxes: [{
        code: 0,
        label: '0%'
      }, {
        code: 0.15,
        label: '15%'
      }, {
        code: 0.20,
        label: '20%'
      }, {
        code: 0.25,
        label: '25%'
      }, {
        code: 0.30,
        label: '30%'
      }, {
        code: 0.35,
        label: '35%'
      }],
      updates: [{
        code: 0,
        label: '0%'
      }, {
        code: 0.03,
        label: '3%'
      }, {
        code: 0.05,
        label: '5%'
      }],
      // }}}
    },
    term: {
      // {{{
      evts: [{
        code: 'd',
        label: 'Décès'
      }, {
        code: 'ad',
        label: 'Décès Accidentel'
      }, {
        code: 'i',
        label: 'IPP ou IPT'
      }, {
        code: 'ai',
        label: 'IPP ou IPT Accidentel'
      }],
      types: [{
        code: 'd',
        label: 'Dégressif'
      }, {
        code: 'f',
        label: 'Fixe'
      }],
      capitals: [{
        code: 50000,
        label: 50000
      }, {
        code: 60000,
        label: 60000
      }, {
        code: 70000,
        label: 70000
      }, {
        code: 80000,
        label: 80000
      }, {
        code: 90000,
        label: 90000
      }, {
        code: 100000,
        label: 100000
      }, {
        code: 110000,
        label: 110000
      }],
      // }}}
    }
  });

angular.module('app')
  .controller('MenuCtrl', ['$scope', function ($scope) {
    $scope.status = {
      isopen: false
    };
  }]);

angular.module('app')
  .controller('IndexCtrl', function () {});

/* vim: fdm=marker
 */
angular.module('app')
  .controller('LoanSubscribeRequestCtrl', ['$timeout', '$rootScope', '$scope',
    '$location', '$routeParams', 'loanDraft', 'errorsSvc', 'loanDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      loanDraft, errorsSvc, loanDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.send = function () {
          errorsSvc.clear();
          loanDraftSvc.request($scope.msg)
            .then(function () {
              $location.path('/loan/subscribe/' + currentId());
            }, errorsSvc.set);
        };
        $scope.toSubscribe = function () {
          $location.path('/loan/subscribe/' + currentId());
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = loanDraft.id;
      if (current === cached) {
        initScope();
      }
      else {
        loanDraftSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

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

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsFreeDepositCtrl', ['$timeout', '$rootScope', '$scope',
    '$routeParams', '$filter', '$location', 'savingsContract', 'errorsSvc',
    'savingsContractSvc',
    function ($timeout, $rootScope, $scope, $routeParams, $filter, $location,
      savingsContract, errorsSvc, savingsContractSvc) {
      function currentId() {
        // {{{
        return $routeParams.contract;
        // }}}
      }

      function defaultDep() {
        var result = {
          amount: 0,
          effDate: moment()
            .toDate(),
          com: $scope.policy.admin.depFreeDefComRate
        };
        return result;
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsContract;
        $scope.cur = defaultDep();
        $scope.toContract = function () {
          // {{{
          $location.path('/savings/contract/' + $scope.policy.def.ref);
          // }}}*/
        };
        $scope.save = function () {
          //{{{
          savingsContract.deposit.free.push($scope.cur);
          errorsSvc.clear();
          savingsContractSvc.saveFreeDeposit()
            .then(function () {
              $location.path('/savings/contract/' + $scope.policy.def.ref);
            }, errorsSvc.set);
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

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyDepSmart', ['$scope', 'savingsDraft',
    'savingsContract', 'moment',
    function ($scope, savingsDraft, savingsContract, moment) {
      function setNextDate() {
        // {{{
        $scope.deposit.nextDate = moment($scope.def.effDate)
          .add(12 / $scope.deposit.period, 'month')
          .toDate();
        var debitDay = $scope.debitDay;
        $scope.deposit.nextDate = moment($scope.deposit.nextDate)
          .date(debitDay)
          .toDate();
        // }}}
      }

      function setNumber() {
        // {{{
        if ($scope.deposit.periodic) {
          var endDate = moment($scope.def.termDate)
            .subtract(1, 'day');
          var diff = endDate.diff($scope.deposit.nextDate, 'month');
          var number = Math.floor(diff * $scope.deposit.period / 12);
          $scope.deposit.number = number + 1;
          var lastDate = moment($scope.deposit.nextDate)
            .add(($scope.deposit.number - 1) * (12 / $scope.deposit.period),
              'month');
          while (lastDate < endDate) {
            lastDate = moment(lastDate)
              .add((12 / $scope.deposit.period), 'month');
            $scope.deposit.number += 1;
          }
        }
        // no periodic deposit
        else {
          $scope.deposit.number = 0;
        }
        // }}}
      }

      function set() {
        // {{{
        setNextDate();
        setNumber();
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
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.def = policy.def;
          $scope.deposit = policy.deposit;
          $scope.debitDay = 10;
          setNumber();
          //watch def
          $scope.$watchGroup(['def.effDate', 'def.termDate'], function (
            newValue, oldValue) {
            if (newValue !== oldValue) {
              setNumber();
            }
          });
          //watch deposit
          $scope.$watchGroup(['deposit.initial', 'deposit.periodic',
            'deposit.updateRate', 'deposit.nextDate'
          ], function (newValue, oldValue) {
            if (newValue !== oldValue) {
              setNumber();
            }
          });
          //watch period
          $scope.$watch('deposit.period', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              set();
            }
          });
          //watch debitDay
          $scope.$watch('debitDay', setNextDate);
        });
        // }}}
      };
    }
  ]);

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

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyPaymentCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'errorsSvc',
    function ($scope, savingsDraft, savingsContract, errorsSvc) {
      function setPaymentMethod() {
        if ($scope.isDebit) {
          $scope.policy.payment.mode = 'debit';
        }
        else {
          if ($scope.policy && $scope.policy.payment) {
            $scope.policy.payment.mode = '';
            $scope.policy.payment.bankAccount = '';
            $scope.bankCode = '';
            $scope.branchCode = '';
            $scope.accountNumber = '';
            $scope.key = '';
          }
        }
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
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.policy = policy;
          $scope.payment = policy.payment;
        });
        // }}}
        //watch payment mode
        $scope.$watch('isDebit', setPaymentMethod);
      };
      $scope.validateAccount = function () {
        //{{{
        errorsSvc.clear();
        if ($scope.bankCode === undefined) {
          errorsSvc.set('Le code banque est sur 2 caractères');
        }
        if ($scope.branchCode === undefined) {
          errorsSvc.set('Le code agence est sur 3 caractères');
        }
        if ($scope.accountNumber === undefined) {
          errorsSvc.set('Le n° du compte est sur 13 caractères');
        }
        if ($scope.key === undefined) {
          errorsSvc.set('La clé est sur 2 caractères');
        }
        if ($scope.bankCode && $scope.branchCode && $scope.accountNumber &&
          $scope.key) {
          $scope.policy.payment.mode = 'debit';
          $scope.policy.payment.bankAccount = $scope.bankCode + $scope.branchCode +
            $scope.accountNumber + $scope.key;
        }
        else {
          if ($scope.policy.payment) {
            $scope.policy.payment.mode = '';
            $scope.policy.payment.bankAccount = '';
          }
        }
        //}}}
      };
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySearchCtrl', ['$rootScope', '$scope', '$http',
    '$filter', '$location', 'savingsContract', 'savingsQuote', 'errorsSvc',
    'savingsContractSvc', 'savingsQuoteSvc',
    function ($rootScope, $scope, $http, $filter, $location, savingsContract,
      savingsQuote, errorsSvc, savingsContractSvc, savingsQuoteSvc) {
      function initScope() {
        // {{{
        $scope.criteria = {};
        $scope.search = function () {
          // {{{
          errorsSvc.clear();
          if ($scope.criteria.isQuote) {
            errorsSvc.clear();
            savingsQuoteSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'quote';
              }, errorsSvc.set);
          }
          else {
            errorsSvc.clear();
            savingsContractSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'contract';
              }, errorsSvc.set);
          }
        };
        $scope.testSMS = function (result) {
          console.log(res + '********');
          /*
          errorsSvc.clear();
          if ($scope.criteria.isQuote) {
            errorsSvc.clear();
            savingsQuoteSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'quote';
              }, errorsSvc.set);
          }
          else {
            errorsSvc.clear();
            savingsContractSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'contract';
              }, errorsSvc.set);
          }
          */
          errorsSvc.clear();
          if ($scope.criteria.isQuote) {
            errorsSvc.clear();
            savingsQuoteSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'quote';
              }, errorsSvc.set);
          }
          else {
            errorsSvc.clear();
            savingsContractSvc.search($scope.criteria)
              .then(function (data) {
                $scope.results = data;
                $scope.policyType = 'contract';
              }, errorsSvc.set);
          }
        };
        $scope.redirectSms = function () {
          $location.path('savings/form');
        };
      }
      errorsSvc.clear();
      initScope();
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicySettlementsCtrl', ['$scope', 'savingsDraft',
    'savingsContract',
    function ($scope, savingsDraft, savingsContract) {
      function getDefaultSettlement() {
        // {{{
        if ($scope.settlements) {
          var remaining = $scope.toPay - $scope.settlements.reduce(function (
            s, memo) {
            return s + memo.amount;
          }, 0);
          return {
            mode: 'cash',
            amount: remaining >= 0 ? remaining : 0
          };
        }
        // }}}
      }

      function set() {
        // {{{
        $scope.pure = ($scope.deposit.initial || 0) + ($scope.deposit.periodic ||
          0);
        $scope.fees = $scope.admin.feesIni + $scope.admin.feesDep;
        $scope.toPay = $scope.pure + $scope.fees;
        // }}}
      }
      $scope.pure = 0;
      $scope.fees = 0;
      $scope.toPay = 0;
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
          else {
            throw new Error('unknown policy obj: ' + obj);
          }
          $scope.admin = policy.admin;
          $scope.deposit = policy.deposit;
          $scope.settlements = policy.settlements;
          set();
          $scope.cur = getDefaultSettlement();
          //watch admin
          $scope.$watchCollection('admin', set);
          //watch deposit
          $scope.$watchGroup(['deposit.initial', 'deposit.periodic',
            'deposit.updateRate', 'deposit.period',
            'deposit.number', 'deposit.nextDate'
          ], function (newValue, oldValue) {
            if (newValue !== oldValue) {
              set();
            }
          });
        });
        // }}}
      };
      $scope.addSettlement = function () {
        // {{{
        $scope.settlements.push($scope.cur);
        $scope.cur = getDefaultSettlement();
        // }}}
      };
      $scope.delSettlement = function (index) {
        // {{{
        $scope.settlements.splice(index, 1);
        // }}}
      };
    }
  ]);

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

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeRequestCtrl', ['$timeout', '$rootScope',
    '$scope', '$location', '$routeParams', 'savingsDraft', 'errorsSvc',
    'savingsDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      savingsDraft, errorsSvc, savingsDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.send = function () {
          errorsSvc.clear();
          savingsDraftSvc.request($scope.msg)
            .then(function () {
              $location.path('/savings/subscribe/' + currentId());
            }, errorsSvc.set);
        };
        $scope.toSubscribe = function () {
          $location.path('/savings/subscribe/' + currentId());
        };
        // }}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsDraft.id;
      if (current === cached) {
        initScope();
      }
      else {
        savingsDraftSvc.read(current)
          .then(function () {
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

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

/* vim : fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeToQuoteCtrl', ['$timeout', '$rootScope',
    '$scope', '$location', '$routeParams', 'savingsDraft', 'savingsQuote',
    'errorsSvc', 'savingsDraftSvc', 'savingsQuoteSvc', 'actorsSvc',
    function ($timeout, $rootScope, $scope, $location, $routeParams,
      savingsDraft, savingsQuote, errorsSvc, savingsDraftSvc, savingsQuoteSvc,
      actorsSvc) {
      function currentId() {
        //{{{
        return $routeParams.draft;
        //}}}
      }

      function initScope() {
        //{{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsQuote;
        $scope.reload = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.read(current)
            .then(function () {
              savingsQuote.fromDraft();
              initScope();
            }, errorsSvc.set);
          // }}}
        };
        $scope.validate = function () {
          // {{{
          errorsSvc.clear();
          actorsSvc.setPerson(savingsQuote.subscriber)
            .then(function () {
              savingsQuoteSvc.create()
                .then(function () {
                  $location.path('/savings/quote/' + savingsQuote.def.ref);
                })
                .then(function () {}, errorsSvc.set);
            }, errorsSvc.set);
          // }}}
        };
        $scope.toSubscribe = function () {
          // {{{
          $location.path('/savings/subscribe/' + currentId());
          // }}}
        };
        //}}}
      }
      errorsSvc.clear();
      var current = currentId();
      var cached = savingsDraft._id;
      if (current === cached) {
        savingsQuote.fromDraft();
        initScope();
      }
      else {
        savingsDraftSvc.read(current)
          .then(function () {
            savingsQuote.fromDraft();
            initScope();
          }, errorsSvc.set);
      }
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsSubscribeCtrl', ['$timeout', '$rootScope', '$scope',
    '$location', '$route', '$routeParams', 'savingsDraft', 'errorsSvc',
    'savingsDraftSvc',
    function ($timeout, $rootScope, $scope, $location, $route, $routeParams,
      savingsDraft, errorsSvc, savingsDraftSvc) {
      function currentId() {
        // {{{
        return $routeParams.draft;
        // }}}
      }

      function getInsuredSummary() {
        $scope.computed.insured = savingsDraft.getInsuredSummary();
      }

      function getDefSummary() {
        $scope.computed.def = savingsDraft.getDefSummary();
      }

      function getDepositSummary() {
        $scope.computed.deposit = savingsDraft.getDepositSummary();
      }

      function getTermsSummary() {
        $scope.computed.terms = savingsDraft.getTermsSummary();
      }

      function initScope() {
        // {{{
        $timeout(angular.bind($rootScope, $rootScope.$broadcast, 'started'));
        $scope.policy = savingsDraft;
        $scope.computed = {};
        getInsuredSummary();
        getDefSummary();
        getDepositSummary();
        getTermsSummary();
        //watch policy.insured
        $scope.$watchGroup(['policy.insured.birthDate',
          'policy.insured.gender', 'policy.insured.job',
          'policy.insured.taxRate'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getInsuredSummary();
          }
        });
        //watch policy.def
        $scope.$watchGroup(['policy.def.effDate', 'policy.def.termDate'],
          function (newValue, oldValue) {
            if (newValue !== oldValue) {
              getDefSummary();
            }
          });
        //watch policy.deposit
        $scope.$watchGroup(['policy.deposit.initial',
          'policy.deposit.periodic', 'policy.deposit.updateRate',
          'policy.deposit.period', 'policy.deposit.number',
          'policy.deposit.nextDate'
        ], function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getDepositSummary();
          }
        });
        //watch policy.terms
        $scope.$watchCollection('policy.terms', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            getTermsSummary();
          }
        });
        $scope.reload = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.read(currentId())
            .then(function () {}, errorsSvc.set);
          // }}}
        };
        $scope.save = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.update()
            .then(function () {}, errorsSvc.set);
          // }}}
        };
        $scope.toRequest = function () {
          // {{{
          $location.path('/savings/subscribe/' + currentId() + '/request');
          // }}}
        };
        $scope.toBackEnd = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsBack')
            .then(function () {
              $location.path('/savings/subscribe/' + currentId() +
                '/backoffice');
            }, errorsSvc.set);
          // }}}
        };
        $scope.toAdmin = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsAdmin')
            .then(function () {
              $location.path('/savings/subscribe/' + currentId() +
                '/admin');
            }, errorsSvc.set);
          // }}}
        };
        $scope.toContract = function () {
          // {{{
          errorsSvc.clear();
          savingsDraftSvc.check('savingsPos')
            .then(function () {
              savingsDraftSvc.update()
                .then(function () {
                  $location.path('/savings/subscribe/' + currentId() +
                    '/to-contract');
                }, errorsSvc.set);
            }, errorsSvc.set);
          // }}}
        };
        $scope.toQuote = function () {
          ///{{{
          errorsSvc.clear();
          savingsDraftSvc.update()
            .then(function () {
              $location.path('/savings/subscribe/' + currentId() +
                '/to-quote');
            }, errorsSvc.set);
          //}}}
        };
        // }}}
      }

      function manageLast() {
        // {{{
        var id = savingsDraft._id;
        if (id) {
          $route.updateParams({
            draft: id
          });
        }
        else {
          $route.updateParams({
            draft: 'new'
          });
        }
        // }}}
      }

      function manageNew() {
        // {{{
        savingsDraftSvc.create()
          .then(function () {
            $route.updateParams({
              draft: 'last'
            });
          }, errorsSvc.set);
        // }}}
      }

      function manageReference() {
        // {{{
        var current = currentId();
        var cached = savingsDraft._id;
        if (current === cached) {
          initScope();
        }
        else {
          savingsDraftSvc.read(current)
            .then(function () {
              $route.updateParams({
                draft: 'last'
              });
            }, errorsSvc.set);
        }
        // }}}
      }
      errorsSvc.clear();
      if (currentId() === 'last') {
        manageLast();
      }
      else if (currentId() === 'new') {
        manageNew();
      }
      else {
        manageReference();
      }
    }
  ]);

angular.module('app')
  /*
    .run(function ($ionicPlatform) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })
  */
  .factory('API', function ($http) {
    var api = {};
    var baseURL = 'http://192.168.162.145:3000';
    api.sendMsg = function (to, text) {
      return $http.post(baseURL + '/sendmsg', {
        "to": to,
        "text": text
      });
    };
    return api;
  })
  .controller('SendSmsCtrl', function ($scope, API) {
    $scope.processing = false;
    $scope.sendMessage = function () {
      console.log("9**************************" + $scope.msgTo);
      $scope.processing = true;
      API.sendMsg($scope.msgTo, $scope.msgText)
        .then(function (data) {
          //console.log('wezza');
          if (data.status == 'success') {
            $scope.msgTo = '';
            $scope.msgText = '';
            console.log('success');
          }
          else {
            console.log('erroeee');
          }
          $scope.processing = false;
        });
    };
  });
/*
angular.module('msg')
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })
  
  .config(
    ['$routeProvider',
      function ($routeProvider) {
        $routeProvider.when('/savings/search', {
            templateUrl: '/msg/savings-policy-search',
            controller: 'SavingsPolicySearchCtrl'
          })
          .otherwise({
            redirectTo: '/index'
          });
      }
    ])

  .factory('API', function ($http) {
    var api = {};
    //var baseURL = 'http://5935c388.ngrok.com';
    api.sendMsg = function (to, text) {
      return $http.post(baseURL + '/sendmsg', {
        "to": to,
        "text": text
      });
    };
    return api;
  })
  .controller('AppCtrl', function ($scope, $ionicLoading, $ionicPopup, API) {
    $scope.processing = false;
    $scope.show = function (message) {
      $ionicLoading.show({
        template: message
      });
    };
    $scope.hide = function () {
      $ionicLoading.hide();
    };
    $scope.showAlert = function (msg) {
      $ionicPopup.alert({
        title: msg.title,
        template: msg.message,
        okText: 'Cool',
        okType: 'button-assertive'
      });
    };
    $scope.sendMessage = function () {
      $scope.processing = true;
      $scope.show('Sending Message...');
      API.sendMsg($scope.msgTo, $scope.msgText)
        .then(function (data) {
          if (data.data.status == 'success') {
            $scope.msgTo = '';
            $scope.msgText = '';
            $scope.showAlert({
              title: "Success",
              message: "Message sent successfully"
            });
          }
          else {
            $scope.showAlert({
              title: "Oops!!",
              message: "Oops something went wrong! Please try again later."
            });
          }
          $scope.hide();
          $scope.processing = false;
        });
    };
  });




























*/

/* vim: fdm=marker
 */
angular.module('app')
  .controller('SessionCtrl', ['$scope', '$location', 'session', 'sessionSvc',
    function ($scope, $location, session, sessionSvc) {
      function initScope() {
        // {{{
        $scope.session = session;
        sessionSvc.check();
        $scope.login = function () {
          sessionSvc.login($scope.username, $scope.password)
            .then(function () {
              delete $scope.username;
              delete $scope.password;
            });
        };
        $scope.logout = function () {
          sessionSvc.logout()
            .then(function () {
              $location.path('/');
            });
        };
        $scope.computed = {};
        Object.defineProperties($scope.computed, {
          user: {
            get: function () {
              return session.user.name;
            }
          }
        });
        // }}}
      }
      initScope();
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .filter('actorGender', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.actor.genders;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('actorRelation', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.actor.relations;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('policyPeriod', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.policy.periods;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('policyTerm', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.policy.terms;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('policyStatus', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.policy.status;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('financePaymentMethod', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.finance.paymentMethods;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('savingsMvt', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.savings.mvts;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('savingsTax', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.savings.taxes;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('savingsUpdate', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.savings.updates;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('termEvt', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.term.evts;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('termType', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.term.types;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }])
  .filter('termCapital', ['enums', function (enums) {
    // {{{
    return function (input) {
      var arr = enums.term.capitals;
      var i, elem;
      for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        if (elem.code === input) {
          return elem.label;
        }
      }
    };
    // }}}
  }]);

angular.module('app')
  .filter('percent', ['$window', function ($window) {
    return function (input, decimals, suffix) {
      decimals = angular.isNumber(decimals) ? decimals : 2;
      suffix = suffix || '%';
      if ($window.isNaN(input)) {
        return '';
      }
      return Math.round(input * Math.pow(10, decimals + 2)) / Math.pow(10,
        decimals) + suffix;
    };
  }]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('actorsSvc', ['$q', '$http',
    function ($q, $http) {
      function readPerson(id) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/actors/person/read', {
              id: id
            })
            .success(function (data) {
              resolve(data);
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}} 
      }

      function setPerson(person) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/actors/person/set', {
              person: person
            })
            .success(function (data) {
              resolve(data);
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }
      return {
        readPerson: readPerson,
        setPerson: setPerson
      };
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('errorsSvc', ['errors', function (errors) {
    function set(err) {
      // {{{
      if (!angular.isObject(err)) {
        err = {
          _ERROR_: JSON.stringify(err)
        };
      }
      angular.copy(err, errors);
      // }}}
    }

    function clear() {
      // {{{
      angular.copy({}, errors);
      // }}}
    }
    return {
      set: set,
      clear: clear
    };
  }]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('loanDraftSvc', ['$q', '$http', 'loanDraft', 'savingsQuote',
    function ($q, $http, loanDraft, savingsQuote) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/create', {})
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              loanDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function createFromQuote() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/create', savingsQuote.toServer())
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve(data);
            })
            .error(function (data, status) {
              loanDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function read(id) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/read', {
              _id: id
            })
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              loanDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function update() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/update', loanDraft.toServer())
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function request(msg) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/request', {
              _id: loanDraft._id,
              msg: msg
            })
            .success(function () {
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function admin() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/admin', loanDraft.toServer())
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function check(right) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/check', {
              right: right
            })
            .success(function () {
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }
      return {
        create: create,
        createFromQuote: createFromQuote,
        read: read,
        update: update,
        request: request,
        admin: admin,
        check: check
      };
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsContractSvc', ['$q', '$http', 'savingsContract',
    function ($q, $http, savingsContract) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/create', savingsContract.toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function read(ref) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/read', {
              ref: ref
            })
            .success(function (data) {
              savingsContract.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsContract.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function saveFreeDeposit() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/saveFreeDeposit',
              savingsContract.toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function search(criteria) {
        //{{{
        return $q(function (resolve, reject) {
          $http.get('/api/searchBordoreau', {
              criteria: criteria
            })
            .success(function (data) {
              console.log(data);
              resolve(data);
            })
            .error(function (data, status) {
              savingsContract.clear();
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }

      function testSMS(criteria) {
        console.log('***********');
        //console.log(criteria);
        return $q(function (resolve, reject) {
          $http.get('api/detailsBordoreau', {
              criteria: criteria
            })
            .success(function (data) {
              console.log(data);
              resolve(data);
            })
            .error(function (data, status) {
              savingsContract.clear();
              reject(data || {
                status: status
              });
            });
        });
      }

      function check(right) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/check', {
              right: right
            })
            .success(function () {
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }

      function domiciliate() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/domiciliate', savingsContract
              .toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function validate() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/validate', savingsContract.toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }
      return {
        create: create,
        read: read,
        saveFreeDeposit: saveFreeDeposit,
        search: search,
        testSMS: testSMS,
        check: check,
        validate: validate,
        domiciliate: domiciliate
      };
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsDraftSvc', ['$q', '$http', 'savingsDraft', 'savingsQuote',
    function ($q, $http, savingsDraft, savingsQuote) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/create', {})
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function createFromQuote() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/create', savingsQuote.toServer())
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve(data);
            })
            .error(function (data, status) {
              savingsDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function read(id) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/read', {
              _id: id
            })
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function update() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/update', savingsDraft.toServer())
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function request(msg) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/request', {
              _id: savingsDraft._id,
              msg: msg
            })
            .success(function () {
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function admin() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/admin', savingsDraft.toServer())
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function check(right) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/check', {
              right: right
            })
            .success(function () {
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }
      return {
        create: create,
        createFromQuote: createFromQuote,
        read: read,
        update: update,
        request: request,
        admin: admin,
        check: check
      };
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsQuoteSvc', ['$q', '$http', 'savingsQuote',
    function ($q, $http, savingsQuote) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/quote/create', savingsQuote.toServer())
            .success(function (data) {
              savingsQuote.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function read(ref) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/quote/read', {
              ref: ref
            })
            .success(function (data) {
              savingsQuote.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsQuote.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function search(criteria) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/quote/search', {
              criteria: criteria
            })
            .success(function (data) {
              resolve(data);
            })
            .error(function (data, status) {
              savingsQuote.clear();
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }
      return {
        create: create,
        read: read,
        search: search
      };
    }
  ]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('sessionSvc', ['$q', '$http', 'session', function ($q, $http,
    session) {
    function set(s) {
      // {{{
      if (s) {
        session.connected = true;
        angular.copy(s.user, session.user);
        angular.copy(s.pos, session.pos);
      }
      else {
        clear();
      }
      // }}}
    }

    function clear() {
      // {{{
      session.connected = false;
      angular.copy({}, session.user);
      angular.copy({}, session.pos);
      // }}}
    }

    function fromServer(s) {
      // {{{
      s = s.status;
      if (s.connected) {
        return {
          user: {
            name: s.username,
            fullName: s.fullName,
            email: s.email,
            posAdmin: s.posAdmin,
            admin: s.admin
          },
          pos: s.pos
        };
      }
      // }}}
    }

    function login(username, password) {
      // {{{
      return $q(function (resolve, reject) {
        $http.post('/svc/connection/login', {
            username: username,
            password: password
          })
          .success(function (data) {
            if (data.ok) {
              check()
                .then(resolve, function (error) {
                  reject(error);
                });
            }
            else {
              reject(data);
            }
          })
          .error(function (data, status) {
            clear();
            reject(data || {
              status: status
            });
          });
      });
      // }}}
    }

    function logout() {
      // {{{
      return $q(function (resolve, reject) {
        return $http.post('/svc/connection/logout', {})
          .success(function () {
            clear();
            resolve();
          })
          .error(function (data, status) {
            reject(data || {
              status: status
            });
          });
      });
      // }}}
    }

    function check() {
      // {{{
      return $q(function (resolve, reject) {
        return $http.post('/svc/connection/check', {})
          .success(function (data) {
            set(fromServer(data));
            resolve();
          })
          .error(function (data, status) {
            clear();
            reject(data || {
              status: status
            });
          });
      });
      // }}}
    }
    return {
      login: login,
      logout: logout,
      check: check
    };
  }]);

/* vim: fdm=marker
 */
(function () {
  var errors = {};
  Object.defineProperty(errors, 'isEmpty', {
    enumarable: false,
    get: function () {
      return Object.keys(errors)
        .length === 0;
    }
  });
  angular.module('app')
    .value('errors', errors);
})();

/* vim: fdm=marker
 */
angular.module('app')
  .service('loanDraft', ['$filter', '$parse', 'moment', function ($filter,
    $parse, moment) {
    var empty = {
      // {{{
      admin: {},
      def: {},
      adjustement: {},
      insured: {},
      subscriber: {},
      terms: [],
      history: [],
      sits: {},
      mvts: [],
      // }}}
    };

    function set() {
      throw new Error('Not modifiable');
    }
    var loanDraft = {};
    var admin = {};
    var adjustement = {};
    var def = {};
    var insured = {};
    var subscriber = {};
    var terms = [];
    var history = [];
    var sits = {};
    var mvts = [];
    Object.defineProperties(loanDraft, {
      // {{{
      admin: {
        // {{{
        get: function () {
          return admin;
        },
        set: set,
        // }}}
      },
      adjustement: {
        // {{{
        get: function () {
          return adjustement;
        },
        set: set,
        // }}}
      },
      def: {
        // {{{
        get: function () {
          return def;
        },
        set: set,
        // }}}
      },
      insured: {
        // {{{
        get: function () {
          return insured;
        },
        set: set,
        // }}}
      },
      subscriber: {
        // {{{
        get: function () {
          return subscriber;
        },
        set: set,
        // }}}
      },
      terms: {
        // {{{
        get: function () {
          return terms;
        },
        set: set,
        // }}}
      },
      history: {
        // {{{
        get: function () {
          return history;
        },
        set: set,
        // }}}
      },
      sits: {
        // {{{
        get: function () {
          return sits;
        },
        set: set,
        // }}}
      },
      mvts: {
        // {{{
        get: function () {
          return mvts;
        },
        set: set,
        // }}}
      },
      // }}}
    });
    var etag;
    var dates = ['insured.birthDate', , 'def.effDate', 'def.termDate',
      'subscriber.birthDate'
    ];
    loanDraft.getEtag = function () {
      return etag;
    };
    loanDraft.getInsuredSummary = function () {
      // {{{
      var ins = loanDraft.insured;
      var sum = 'Assuré';
      var age = moment(new Date())
        .diff(moment(insured.birthDate), 'year');
      if (ins.birthDate) {
        sum += ' = ' + $filter('actorGender')(ins.gender) + ' est né' + (
          ins.gender === 'm' ? '' : 'e') + ' le ' + $filter('date')(ins
          .birthDate) + ' (' + age + ' ans).';
      }
      return sum;
      // }}}
    };
    loanDraft.getDefSummary = function () {
      // {{{
      var def = loanDraft.def;
      var duration = moment(def.termDate)
        .diff(moment(def.effDate), 'year');
      var exactDuration = moment(def.termDate)
        .diff(def.effDate, 'year', true);
      if (exactDuration > duration) {
        duration += 1;
      }
      return 'Contrat = Capital ' + terms[0].cap + ', Effectif du ' + (
          def.effDate ? $filter('date')(def.effDate) : '--/--/----') +
        ' au ' + (def.termDate ? $filter('date')(def.termDate) :
          '--/--/----') + ' (' + duration + (duration === 1 ? ' an' :
          'ans') + '), franchise ' + def.deductible + ' mois';
      // }}}
    };
    loanDraft.getAdjustementSummary = function () {
      // {{{ 
      var adjustement = loanDraft.adjustement;
      return 'Ajustement = Mortalité de ' + (adjustement.termSurvAdjust *
        100) + '%, acquisition de ' + (adjustement.com * 100) + '%.';
      // }}}
    };
    loanDraft.fromServer = function (d) {
      // {{{
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(d);
        if (date) {
          var setter = getter.assign;
          setter(d, new Date(date));
        }
      });
      var keys = Object.keys(empty);
      if (loanDraft._id === d._id && etag === d.etag) {
        keys.splice(keys.indexOf('sits'), 1);
        keys.splice(keys.indexOf('mvts'), 1);
      }
      else {
        etag = d.etag;
      }
      loanDraft._id = d._id;
      keys.forEach(function (k) {
        angular.copy(d[k], loanDraft[k]);
      });
      // }}}
    };
    loanDraft.toServer = function () {
      // {{{
      var d = {
        _id: loanDraft._id
      };
      for (var k in empty) {
        d[k] = angular.copy(loanDraft[k]);
      }
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(d);
        if (date) {
          var setter = getter.assign;
          setter(d, $filter('date')(date, 'yyyy-MM-dd'));
        }
      });
      delete d.mvts;
      delete d.sits;
      return d;
      // }}}
    };
    loanDraft.clear = function () {
      // {{{
      delete loanDraft._id;
      var keys = Object.keys(empty);
      keys.forEach(function (k) {
        angular.copy(empty[k], loanDraft[k]);
      });
      // }}}
    };
    return loanDraft;
  }]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsContract', ['$filter', '$parse', 'savingsDraft', function (
    $filter, $parse, savingsDraft) {
    var empty = {
      // {{{
      admin: {},
      def: {},
      insured: {},
      deposit: {},
      terms: [],
      lifeBen: [],
      deathBen: [],
      subscriber: {},
      settlements: [],
      payment: {},
      sits: {},
      mvts: [],
      // }}}
    };

    function set() {
      throw new Error('Not modifiable');
    }
    var savingsContract = {};
    var admin = {};
    var def = {};
    var insured = {};
    var deposit = {};
    var terms = [];
    var lifeBen = [];
    var deathBen = [];
    var subscriber = {};
    var sits = {};
    var mvts = [];
    var settlements = [];
    var payment = {};
    Object.defineProperties(savingsContract, {
      // {{{
      admin: {
        // {{{
        get: function () {
          return admin;
        },
        set: set,
        // }}}
      },
      def: {
        // {{{
        get: function () {
          return def;
        },
        set: set,
        // }}}
      },
      insured: {
        // {{{
        get: function () {
          return insured;
        },
        set: set,
        // }}}
      },
      deposit: {
        // {{{
        get: function () {
          return deposit;
        },
        set: set,
        // }}}
      },
      terms: {
        // {{{
        get: function () {
          return terms;
        },
        set: set,
        // }}}
      },
      lifeBen: {
        // {{{
        get: function () {
          return lifeBen;
        },
        set: set,
        // }}}
      },
      deathBen: {
        // {{{
        get: function () {
          return deathBen;
        },
        set: set
          // }}}
      },
      subscriber: {
        // {{{
        get: function () {
          return subscriber;
        },
        set: set,
        // }}}
      },
      settlements: {
        // {{{
        get: function () {
          return settlements;
        },
        set: set,
        // }}}
      },
      sits: {
        // {{{
        get: function () {
          return sits;
        },
        set: set,
        // }}}
      },
      mvts: {
        // {{{
        get: function () {
          return mvts;
        },
        set: set,
        // }}}
      },
      payment: {
        //{{{
        get: function () {
          return payment;
        },
        set: set
          //}}}
      }
      // }}}
    });
    var etag;
    var dates = ['insured.birthDate', 'subscriber.birthDate',
      'deposit.nextDate', 'def.effDate', 'def.termDate',
      'subscriber.birthDate', 'lifeBen[0].birthDate',
      'lifeBen[1].birthDate', 'lifeBen[2].birthDate',
      'lifeBen[3].birthDate', 'lifeBen[4].birthDate',
      'deathBen[0].birthDate', 'deathBen[1].birthDate',
      'deathBen[2].birthDate', 'deathBen[3].birthDate',
      'deathBen[4].birthDate'
    ];
    savingsContract.getDate = function () {
      // {{{
      return new Date(parseInt(savingsContract._id.substring(0, 8), 16) *
        1000);
      // }}}
    };
    savingsContract.getEtag = function () {
      return etag;
    };
    savingsContract.getSubscriberSummary = function () {
      // {{{
      var sub = savingsContract.subscriber;
      var res = 'Souscripteur';
      if (sub.id && sub.name && sub.firstName) {
        res += ' = ' + sub.firstName + ' ' + sub.name + ' (' + sub.id +
          ')';
      }
      return res;
      // }}}
    };
    savingsContract.getInsuredSummary = function () {
      // {{{
      var ins = savingsContract.insured;
      var res = 'Assuré';
      if (ins.id && ins.firstName && ins.name) {
        res += ' = ' + ins.firstName + ' ' + ins.name + ' (' + ins.id +
          ')';
      }
      return res;
      // }}}
    };
    savingsContract.getLifeBenSummary = function () {
      // {{{
      var bens = savingsContract.lifeBen;
      var res = 'Bénéficiaires / Vie';
      if (bens.length > 0) {
        res += ' = ';
      }
      res += bens.map(function (ben) {
          return $filter('actorRelation')(ben.relation) + ' ' + (ben.name ?
              ben.name : '') + ' (' + $filter('percent')(ben.percent) +
            ')';
        })
        .join(' + ');
      return res;
      // }}}
    };
    savingsContract.getDeathBenSummary = function () {
      // {{{
      var bens = savingsContract.deathBen;
      var res = 'Bénéficiaires / Décès';
      if (bens.length > 0) {
        res += ' = ';
      }
      res += bens.map(function (ben) {
          return $filter('actorRelation')(ben.relation) + ' ' + (ben.name ?
              ben.name : '') + ' (' + $filter('percent')(ben.percent) +
            ')';
        })
        .join(' + ');
      return res;
      // }}}
    };
    savingsContract.getPaymentSummary = function () {
      //{{{
      var res = 'Mode de paiement';
      if (payment.mode) {
        res += ' : ' + $filter('financePaymentMethod')(payment.mode);
      }
      return res;
      //}}}
    };
    savingsContract.fromServer = function (c) {
      // {{{
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(c);
        if (date) {
          var setter = getter.assign;
          setter(c, new Date(date));
        }
      });
      var keys = Object.keys(empty);
      if (savingsContract._id === c._id && etag === c.etag) {
        keys.splice(keys.indexOf('sits'), 1);
        keys.splice(keys.indexOf('mvts'), 1);
      }
      else {
        etag = c.etag;
      }
      savingsContract._id = c._id;
      keys.forEach(function (k) {
        angular.copy(c[k], savingsContract[k]);
      });
      // }}}
    };
    savingsContract.toServer = function () {
      // {{{
      var c = {
        _id: savingsContract._id
      };
      for (var k in empty) {
        c[k] = angular.copy(savingsContract[k]);
      }
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(c);
        if (date) {
          var setter = getter.assign;
          setter(c, $filter('date')(date, 'yyyy-MM-dd'));
        }
      });
      // delete c.mvts;
      delete c.sits;
      return c;
      // }}}
    };
    savingsContract.clear = function () {
      // {{{
      delete savingsContract._id;
      var keys = Object.keys(empty);
      keys.forEach(function (k) {
        angular.copy(empty[k], savingsContract[k]);
      });
      // }}}
    };
    savingsContract.fromDraft = function () {
      // {{{
      delete savingsContract._id;
      savingsContract._id = savingsDraft._id;
      var keys = Object.keys(empty);
      keys.forEach(function (k) {
        if (savingsDraft[k]) {
          angular.copy(savingsDraft[k], savingsContract[k]);
        }
        else {
          angular.copy(empty[k], savingsContract[k]);
        }
      });
      // }}}
    };
    return savingsContract;
  }]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsDraft', ['$filter', '$parse', 'moment', function ($filter,
    $parse, moment) {
    var empty = {
      // {{{
      admin: {},
      def: {},
      insured: {},
      subscriber: {},
      deposit: {},
      terms: [],
      sits: {},
      mvts: [],
      // }}}
    };

    function set() {
      throw new Error('Not modifiable');
    }
    var savingsDraft = {};
    var admin = {};
    var def = {};
    var insured = {};
    var subscriber = {};
    var deposit = {};
    var terms = [];
    var sits = {};
    var mvts = [];
    Object.defineProperties(savingsDraft, {
      // {{{
      admin: {
        // {{{
        get: function () {
          return admin;
        },
        set: set,
        // }}}
      },
      def: {
        // {{{
        get: function () {
          return def;
        },
        set: set,
        // }}}
      },
      insured: {
        // {{{
        get: function () {
          return insured;
        },
        set: set,
        // }}}
      },
      subscriber: {
        // {{{
        get: function () {
          return subscriber;
        },
        set: set,
        // }}}
      },
      deposit: {
        // {{{
        get: function () {
          return deposit;
        },
        set: set,
        // }}}
      },
      terms: {
        // {{{
        get: function () {
          return terms;
        },
        set: set,
        // }}}
      },
      sits: {
        // {{{
        get: function () {
          return sits;
        },
        set: set,
        // }}}
      },
      mvts: {
        // {{{
        get: function () {
          return mvts;
        },
        set: set,
        // }}}
      },
      // }}}
    });
    var etag;
    var dates = ['insured.birthDate', 'deposit.nextDate', 'def.effDate',
      'def.termDate', 'subscriber.birthDate'
    ];
    savingsDraft.getEtag = function () {
      return etag;
    };
    savingsDraft.getInsuredSummary = function () {
      // {{{
      var ins = savingsDraft.insured;
      var sum = 'Assuré';
      var age = moment(new Date())
        .diff(moment(insured.birthDate), 'year');
      if (ins.birthDate) {
        sum += ' = ' + $filter('actorGender')(ins.gender) + ' est né' + (
            ins.gender === 'm' ? '' : 'e') + ' le ' + $filter('date')(ins
            .birthDate) + ' (' + age + ' ans). ' + (ins.gender === 'm' ?
            'Il' : 'Elle') + ' a atteint le palier d\'imposition de ' +
          $filter('percent')(ins.taxRate, 0);
      }
      return sum;
      // }}}
    };
    savingsDraft.getDefSummary = function () {
      // {{{
      var def = savingsDraft.def;
      var duration = moment(def.termDate)
        .diff(moment(def.effDate), 'year');
      var exactDuration = moment(def.termDate)
        .diff(def.effDate, 'year', true);
      if (exactDuration > duration) {
        duration += 1;
      }
      return 'Contrat = Effectif du ' + (def.effDate ? $filter('date')(
          def.effDate) : '--/--/----') + ' au ' + (def.termDate ? $filter(
          'date')(def.termDate) : '--/--/----') + ' (' + duration +
        ' ans)';
      // }}}
    };
    savingsDraft.getDepositSummary = function () {
      // {{{
      var deposit = savingsDraft.deposit;
      var sum = 'Versements';
      if (deposit.initial || deposit.periodic) {
        sum += ' = Initial de ' + $filter('currency')(deposit.initial ||
            0, 'DT', 0) + ', ' + $filter('policyPeriod')(deposit.period) +
          ' de ' + $filter('currency')(deposit.periodic || 0, 'DT', 0);
      }
      return sum;
      // }}}
    };
    savingsDraft.getTermsSummary = function () {
      //{{{
      var terms = savingsDraft.terms;
      var sum = 'Prévoyance';
      if (terms.length > 0) {
        sum += ' = ';
        terms.forEach(function (t) {
          if (sum !== 'Prévoyance = ') {
            sum += ' + ';
          }
          sum += $filter('termEvt')(t.evt) + ' ' + $filter('termType')
            (t.type) + ' (' + $filter('currency')(t.cap || 0, 'DT', 0) +
            ')';
        });
      }
      return sum;
      //}}}
    };
    savingsDraft.fromServer = function (d) {
      // {{{
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(d);
        if (date) {
          var setter = getter.assign;
          setter(d, new Date(date));
        }
      });
      var keys = Object.keys(empty);
      if (savingsDraft._id === d._id && etag === d.etag) {
        keys.splice(keys.indexOf('sits'), 1);
        keys.splice(keys.indexOf('mvts'), 1);
      }
      else {
        etag = d.etag;
      }
      savingsDraft._id = d._id;
      keys.forEach(function (k) {
        angular.copy(d[k], savingsDraft[k]);
      });
      // }}}
    };
    savingsDraft.toServer = function () {
      // {{{
      var d = {
        _id: savingsDraft._id
      };
      for (var k in empty) {
        d[k] = angular.copy(savingsDraft[k]);
      }
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(d);
        if (date) {
          var setter = getter.assign;
          setter(d, $filter('date')(date, 'yyyy-MM-dd'));
        }
      });
      delete d.mvts;
      delete d.sits;
      var perCom = d.admin.depPerComRate;
      var perComIndex = perCom.length - 1;
      while (angular.isUndefined(perCom[perComIndex]) || perCom[
          perComIndex] === null) {
        perCom.splice(perComIndex, 1);
        perComIndex--;
      }
      return d;
      // }}}
    };
    savingsDraft.clear = function () {
      // {{{
      delete savingsDraft._id;
      var keys = Object.keys(empty);
      keys.forEach(function (k) {
        angular.copy(empty[k], savingsDraft[k]);
      });
      // }}}
    };
    return savingsDraft;
  }]);

/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsQuote', ['$filter', '$parse', 'savingsDraft', function (
    $filter, $parse, savingsDraft) {
    var empty = {
      // {{{
      admin: {},
      def: {},
      insured: {},
      deposit: {},
      terms: [],
      subscriber: {},
      sits: {},
      mvts: [],
      // }}}
    };

    function set() {
      throw new Error('Not modifiable');
    }
    var savingsQuote = {};
    var admin = {};
    var def = {};
    var insured = {};
    var deposit = {};
    var terms = [];
    var subscriber = {};
    var sits = {};
    var mvts = [];
    Object.defineProperties(savingsQuote, {
      // {{{
      admin: {
        // {{{
        get: function () {
          return admin;
        },
        set: set,
        // }}}
      },
      def: {
        // {{{
        get: function () {
          return def;
        },
        set: set,
        // }}}
      },
      insured: {
        // {{{
        get: function () {
          return insured;
        },
        set: set,
        // }}}
      },
      deposit: {
        // {{{
        get: function () {
          return deposit;
        },
        set: set,
        // }}}
      },
      terms: {
        // {{{
        get: function () {
          return terms;
        },
        set: set,
        // }}}
      },
      subscriber: {
        // {{{
        get: function () {
          return subscriber;
        },
        set: set,
        // }}}
      },
      sits: {
        // {{{
        get: function () {
          return sits;
        },
        set: set,
        // }}}
      },
      mvts: {
        // {{{
        get: function () {
          return mvts;
        },
        set: set,
        // }}}
      },
      // }}}
    });
    var etag;
    var dates = ['insured.birthDate', 'subscriber.birthDate',
      'deposit.nextDate', 'def.effDate', 'def.termDate'
    ];
    savingsQuote.getDate = function () {
      // {{{
      return new Date(parseInt(savingsQuote._id.substring(0, 8), 16) *
        1000);
      // }}}
    };
    savingsQuote.getEtag = function () {
      return etag;
    };
    savingsQuote.fromServer = function (c) {
      // {{{
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(c);
        if (date) {
          var setter = getter.assign;
          setter(c, new Date(date));
        }
      });
      var keys = Object.keys(empty);
      if (savingsQuote._id === c._id && etag === c.etag) {
        keys.splice(keys.indexOf('sits'), 1);
        keys.splice(keys.indexOf('mvts'), 1);
      }
      else {
        etag = c.etag;
      }
      savingsQuote._id = c._id;
      keys.forEach(function (k) {
        angular.copy(c[k], savingsQuote[k]);
      });
      // }}}
    };
    savingsQuote.toServer = function () {
      // {{{
      var c = {
        _id: savingsQuote._id
      };
      for (var k in empty) {
        c[k] = angular.copy(savingsQuote[k]);
      }
      dates.forEach(function (path) {
        var getter = $parse(path);
        var date = getter(c);
        if (date) {
          var setter = getter.assign;
          setter(c, $filter('date')(date, 'yyyy-MM-dd'));
        }
      });
      delete c.mvts;
      delete c.sits;
      return c;
      // }}}
    };
    savingsQuote.clear = function () {
      // {{{
      delete savingsQuote._id;
      var keys = Object.keys(empty);
      keys.forEach(function (k) {
        angular.copy(empty[k], savingsQuote[k]);
      });
      // }}}
    };
    savingsQuote.fromDraft = function () {
      // {{{
      delete savingsQuote._id;
      savingsQuote._id = savingsDraft._id;
      var keys = Object.keys(empty);
      keys.forEach(function (k) {
        if (savingsDraft[k]) {
          angular.copy(savingsDraft[k], savingsQuote[k]);
        }
        else {
          angular.copy(empty[k], savingsQuote[k]);
        }
      });
      // }}}
    };
    return savingsQuote;
  }]);

/* vim: fdm=marker
 */
(function () {
  function set() {
    throw new Error('Not modifiable');
  }
  var session = {
    connected: false
  };
  var user = {};
  var pos = {};
  Object.defineProperties(session, {
    user: {
      get: function () {
        return user;
      },
      set: set
    },
    pos: {
      get: function () {
        return pos;
      },
      set: set
    }
  });
  angular.module('app')
    .value('session', session);
})();

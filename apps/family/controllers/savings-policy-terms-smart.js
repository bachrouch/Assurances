/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyTermsSmartCtrl', ['$scope', 'savingsDraft',
    'savingsContract',
    function ($scope, savingsDraft, savingsContract) {
      function fromTerms() {
        // {{{
        delete $scope.type;
        delete $scope.d;
        delete $scope.ad;
        delete $scope.i;
        delete $scope.ai;
        if ($scope.terms.length === 0) {
          $scope.withTerms = false;
        }
        else {
          $scope.withTerms = true;
          $scope.terms.forEach(function (t) {
            if (t.evt === 'd') {
              $scope.d = t.cap;
              $scope.type = t.type;
            }
            else {
              $scope[t.evt] = true;
            }
          });
        }
        // }}}
      }

      function getCapital(terms, evt) {
        var result;
        var term = terms.filter(function (obj) {
          if ((obj.evt === evt) && (obj.fromBack)) {
            return true;
          }
        });
        if (term.length > 0) {
          result = term[0].cap;
        }
        return result;
      }

      function isFromback(terms, evt) {
        var result = false;
        terms.filter(function (obj) {
          if (obj.evt === evt) {
            result = obj.fromBack;
          }
        });
        return result;
      }

      function toTerms() {
        // {{{
        var cap;
        var fromBack;
        $scope.terms.length = 0;
        if ($scope.withTerms) {
          if (!$scope.type) {
            $scope.type = 'f';
          }
          if (!$scope.d) {
            $scope.d = $scope.enums.term.capitals[0].code;
          }
          $scope.terms.push({
            evt: 'd',
            cap: $scope.d,
            type: $scope.type,
            fromBack: isFromback($scope.backTerms, 'd')
          });
          if ($scope.ad) {
            cap = getCapital($scope.backTerms, 'ad');
            cap = cap >= 0 ? cap : $scope.d;
            fromBack = isFromback($scope.backTerms, 'ad');
            $scope.terms.push({
              evt: 'ad',
              cap: cap,
              type: $scope.type,
              fromBack: fromBack
            });
          }
          if ($scope.i) {
            cap = getCapital($scope.backTerms, 'i');
            cap = cap >= 0 ? cap : $scope.d;
            fromBack = isFromback($scope.backTerms, 'i');
            $scope.terms.push({
              evt: 'i',
              cap: cap,
              type: $scope.type,
              fromBack: fromBack
            });
          }
          if ($scope.ai && $scope.i) {
            cap = getCapital($scope.backTerms, 'ai');
            cap = cap >= 0 ? cap : $scope.d;
            fromBack = isFromback($scope.backTerms, 'ai');
            $scope.terms.push({
              evt: 'ai',
              cap: cap,
              type: $scope.type,
              fromBack: fromBack
            });
          }
        }
        else {
          $scope.d = 0;
          $scope.ad = false;
          $scope.ai = false;
          $scope.i = false;
        }
        $scope.backTerms = JSON.parse(JSON.stringify($scope.terms));
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
          //clone policy terms in backTerms
          $scope.backTerms = JSON.parse(JSON.stringify(policy.terms));
          $scope.terms = policy.terms;
          fromTerms();
          $scope.$watch('terms', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              fromTerms();
            }
          }); // derogation for example
          $scope.$watch('withTerms', toTerms);
          $scope.$watch('type', toTerms);
          $scope.$watch('d', toTerms);
          $scope.$watch('ad', toTerms);
          $scope.$watch('i', toTerms);
          $scope.$watch('ai', toTerms);
        });
        // }}}
      };
    }
  ]);

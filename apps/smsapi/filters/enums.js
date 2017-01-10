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

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

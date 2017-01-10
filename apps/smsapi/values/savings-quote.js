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

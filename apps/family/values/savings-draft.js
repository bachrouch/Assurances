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

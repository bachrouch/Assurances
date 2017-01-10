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

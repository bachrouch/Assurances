/* vim: fdm=marker
 */
var utils = require('../utils');
var survivors = require('./survivors');

function Rule() {
  // {{{
  //
  // params
  //   - actRate: 0.04
  //   - feesRate: 0.0001
  //   - evt: {d = death, i = invalid}
  //   - survAdjust: 0
  //   - premium: {o = one shot, f = periodic (fixed), a = periodic (adjusted)}
  //
  // insured
  //   - gender: {m = male, f = female}
  //   - birthDate: '1981-06-16'
  //   - [capitals]: {
  //     - date: '2014-01-01'
  //     - amount: 20000
  //     }
  //
  // }}}
}
Rule.prototype.check = function () {
  // {{{
  if (['d', 'i', 'ad', 'ai'].indexOf(this.evt) === -1) {
    throw new Error('bad type: evt');
  }
  if (['o', 'f', 'a'].indexOf(this.premium) === -1) {
    throw new Error('bad type: premium');
  }
  if (['m', 'f'].indexOf(this.gender) === -1) {
    throw new Error('bad type: gender');
  }
  this.survAdjust = this.survAdjust || 0;
  this.capitals.sort(function (a, b) {
    if (a.date < b.date) {
      return -1;
    }
    if (a.date > b.date) {
      return 1;
    }
    if (a.amount > b.amount) {
      return -1;
    }
    if (a.amount < b.amount) {
      return 1;
    }
    return 0;
  });
  if (this.capitals[0].date <= this.birthDate) {
    throw new Error('not born on term start');
  }
  if (this.capitals[this.capitals.length - 1].amount !== 0) {
    throw new Error('not terminated with 0 amount');
  }
  // }}}
};
Rule.prototype.calculate = function () {
  // {{{
  var self = this;
  this.check();
  this.details = this.capitals.map(function (term) {
    return {
      date: term.date,
      amount: term.amount,
      l: survivors(self.evt, self.gender, self.birthDate, term.date, self
        .survAdjust)
    };
  });

  function act(days) {
    return Math.pow(1 / (1 + self.actRate), days / 365);
  }
  var i, term, nterm, initL = this.details[0].l,
    initDuration = 0;
  for (i = 0; i < this.details.length - 1; i++) {
    term = this.details[i];
    nterm = this.details[i + 1];
    term.duration = utils.momentFromJSON(nterm.date)
      .diff(term.date, 'day');
    term.d = term.l - nterm.l;
    term.p = this.premium !== 'a' ? term.l / initL : 1;
    term.q = term.d / term.l;
    term.premium = term.amount * term.p * term.q * act(initDuration + 0.5 *
      term.duration);
    term.fees = term.amount * this.feesRate * (term.duration / 365) * term.p *
      act(initDuration);
    term.total = term.premium + term.fees;
    if (this.premium !== 'a') {
      initDuration += term.duration;
    }
  }
  delete this.details[this.details.length - 1];
  this.contribution = this.details.map(function (item) {
    return {
      date: item.date,
      amount: utils.roundAmount(item.total)
    };
  });
  if (this.premium === 'o') {
    this.contribution = this.contribution.reduce(function (item, memo) {
      if (!memo.date) {
        memo.date = item.date;
      }
      memo.amount += item.amount;
      return memo;
    }, {
      amount: 0
    });
  }
  // }}}
};
exports.Rule = Rule;

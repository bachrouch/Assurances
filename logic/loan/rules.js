/* vim: fdm=marker
 */
var moment = require('moment');
var utils = require('../utils');
var term = require('../term');

function Calculator() {
  // {{{
  //
  // Calculator
  //   - period: {12 = monthly, 1 = annual}
  //   - duration: 120
  //   - franchise: 6
  //   - startDate: '2014-11-17'
  //   - capital: 20000
  //
  // insured
  //   - birthDate: '1981-06-16'
  //   - gender: {m = male, f = female}
  //
  // terms
  //   - [terms]: {
  //     - name: RE
  //     - refDate: '2014-01-01'
  //     - period: {12 = monthly, 4 = quarterly, 1 = annual}
  //     - franchise: 30000
  //     - evt: {d = death, a = accidental death, i = invalid}
  //     - actRate: 0.04
  //     - feesRate: 0.0001
  //     - survAdjust: 0
  //     - premium: {o = one shot, f = periodic (fixed), a = periodic (adjusted)}
  //   }
  //
  // }}}
}
Calculator.prototype.prepare = function () {};
Calculator.prototype.calcSummary = function (date) {
  // {{{
  var situation = this.sits[date];
  situation.premium = 0;
  situation.com = 0;
  situation.mvts.forEach(function (mvt) {
    if (mvt.type === 'com') {
      situation.com += mvt.amount;
    }
    if (mvt.type === 'term') {
      situation.premium += mvt.amount;
    }
  });
  situation.premium = utils.roundAmount(situation.premium);
  situation.com = utils.roundAmount(situation.com);
  // }}}
};
Calculator.prototype.calculate = function () {
  // {{{
  this.prepare();
  var self = this;

  function calculateDuration(effDate, endDate) {
    var result = moment(endDate)
      .diff(effDate, 'month');
    return (result);
  }

  function getCapital(date) {
    var i = self.duration;
    while (i >= 0 && date < dates[i]) {
      i--;
    }
    return capitals[i];
  }

  function getSecondDate(refDate, inc) {
    //{{{
    // var ld = moment(refDate);
    // var fd = moment(self.def.effDate);
    // if (refDate > self.def.effDate) {
    //   ld.year(fd.year() - 1);
    //   refDate = ld.format('YYYY-MM-DD');
    // }
    // while (refDate <= self.def.effDate) {
    //    if (refDate <= self.def.effDate) {
    refDate = moment(refDate)
      .add(inc, 'month')
      .format('YYYY-MM-DD');
    return refDate;
    //}}}
  }
  var duration = calculateDuration(this.def.effDate, this.def.termDate);
  self.duration = duration;
  var range = utils.range(duration + 1);
  var dates = range.map(function (i) {
    return moment(self.def.effDate)
      .add(i * 12 / self.def.period, 'month')
      .format('YYYY-MM-DD');
  });
  var capitals = range.map(function (i) {
    if (i <= self.def.deductible) {
      return self.terms[0].cap;
    }
    else {
      return self.terms[0].cap - ((i - self.def.deductible) / (duration -
        self.def.deductible + 1) * self.terms[0].cap);
    }
  });
  //var terms = this.terms.map(function (t) {
  var terms = range.map(function (t, index) {
    function calcCapital(date) {
      //{{{
      //ASO Comments next line, no franchise in terms
      // return Math.max(getCapital(date) - t.franchise, 0);
      return Math.max(getCapital(date), 0);
      //}}}
    }
    var refDate = dates[index];
    var capitals = [];
    capitals.push({
      date: refDate,
      amount: calcCapital(refDate)
    });
    // ASO var refDate = t.refDate || self.def.effDate;
    // ASO var period = t.period || self.period;
    var period = self.def.period;
    var curDate = getSecondDate(refDate, 12 / period);
    var curAmount;
    curAmount = calcCapital(curDate);
    //  while (curAmount !== 0) {
    curAmount = calcCapital(curDate);
    capitals.push({
      date: curDate,
      amount: 0 //curAmount
    });
    curDate = moment(curDate)
      .add(12 / period, 'month')
      .format('YYYY-MM-DD');
    // }
    var tt = {
      type: self.terms[0].type,
      actRate: self.admin.termActRate,
      feesRate: self.admin.termFeesRate,
      evt: self.terms[0].evt,
      survAdjust: self.adjustement.termSurvAdjust,
      premium: 'o',
      gender: self.admin.useTV ? self.insured.gender : 'm',
      birthDate: self.insured.birthDate,
      capitals: capitals
    };
    term.rate(tt);
    return tt;
  });

  function calcMvts(term) {
    var name = [term.evt, term.type, term.contribution.date, Math.round(term.capitals[
      0].amount)].join('-');
    var mvt = {
      type: 'term',
      name: name,
      date: term.contribution.date,
      amount: term.contribution.amount
    };
    self.mvts.push(mvt);
  }

  function calcComMvts(term) {
    var name = [term.evt, term.type, term.contribution.date, Math.round(term.capitals[
      0].amount)].join('-');
    var mvt = {
      type: 'com',
      name: name,
      date: term.contribution.date,
      amount: utils.roundAmount(term.contribution.amount * self.adjustement
        .com)
    };
    self.mvts.push(mvt);
  }
  var res = {};
  this.mvts = [];
  terms.forEach(function (t) {
    calcMvts(t);
    calcComMvts(t);
    res[t.name] = t.contribution;
  });
  this.sits = {};
  dates.map(function (i) {
    self.sits[i] = {
      mvts: [],
      d: 0,
      ad: 0,
      i: 0,
      ai: 0
    };
  });
  this.mvts.forEach(function (mvt) {
    self.sits[mvt.date].mvts.push(mvt);
  });
  for (var i = 0; i <= duration; i++) {
    self.calcSummary(dates[i]);
  }
  terms.forEach(function (t) {
    var capital = t.capitals[0].amount;
    var date = t.contribution.date;
    var situation = self.sits[date];
    situation[t.evt] += capital;
  });
  for (var date in this.sits) {
    delete this.sits[date].mvts;
  }
  this.etag = utils.hash({
    sits: this.sits,
    mvts: this.mvts
  });
};
Calculator.prototype.checkInsuredAge = function () {
  //{{{
  var draft = this;
  var len = draft.terms.length;
  //
  if (len > 0) {
    var ageAtTerm = utils.momentFromJSON(draft.def.termDate)
      .diff(draft.insured.birthDate, 'year', true);
    ageAtTerm = utils.fixNumber(ageAtTerm, 3);
    if (ageAtTerm > draft.admin.maxAge) {
      throw new Error('Insured age must be < ' + draft.admin.maxAge);
    }
  }
  //}}}
};
module.mutate = function (obj) {
  // {{{
  utils.mutate(obj, Calculator);
  // }}}
};
exports.rate = function (draft) {
  // {{{
  utils.mutate(draft, Calculator);
  draft.checkInsuredAge();
  draft.calculate();
  // }}}
};

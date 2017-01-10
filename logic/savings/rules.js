/* vim: fdm=marker
 */
var utils = require('../utils');
var term = require('../term');

function calcDD(init, mvts, toDate) {
  // {{{
  // Delivering capital on toDate + 1
  var toMoment = utils.momentFromJSON(toDate)
    .startOf('day');
  var year = toMoment.year();
  if (init < 0) {
    throw new Error('initial situation < 0 in ' + year);
  }
  var cumul = 0;
  var curMoment = utils.momentFromJSON(toDate)
    .startOf('year')
    .startOf('day');
  var curAmount = init;
  mvts.forEach(function (mvt) {
    var d = utils.momentFromJSON(mvt.date)
      .add(1, 'month')
      .startOf('month');
    if ((mvt.amount === 0) && (mvt.type !== 'earn')) {
      throw new Error('null amount mvt: ' + JSON.stringify(mvt));
    }
    var nb = d.diff(curMoment, 'day');
    cumul += nb * curAmount;
    curMoment = d;
    curAmount += mvt.amount;
    if (curAmount < 0) {
      throw new Error('deposit < 0 because of: ' + JSON.stringify(mvt));
    }
  });
  cumul += (toMoment.diff(curMoment, 'day') + 1) * curAmount;
  return cumul;
  // }}}
}

function calcEarn(init, mvts, rate, toDate) {
  // {{{
  var year = utils.momentFromJSON(toDate)
    .year();
  var leap = utils.isLeapYear(year);
  var dayRate;
  var local;
  if (leap) {
    local = 1 / 366;
  }
  else {
    local = 1 / 365;
  }
  dayRate = Math.pow(1 + rate, local) - 1;
  //
  return utils.roundAmount(calcDD(init, mvts, toDate) * dayRate);
  // }}}
}

function Rule() {}
Rule.prototype.sortMvts = function () {
  // {{{
  this.mvts.sort(function (a, b) {
    if (a.date > b.date) {
      return 1;
    }
    if (a.date < b.date) {
      return -1;
    }
    if (a.amount < b.amount) {
      return 1;
    }
    if (a.amount > b.amount) {
      return -1;
    }
    return 0;
  });
  // }}}
};
Rule.prototype.calcInitialDeposit = function () {
  // {{{
  if (this.deposit.initial) {
    this.mvts.push({
      type: 'dep',
      name: 'initial',
      date: this.def.effDate,
      amount: this.deposit.initial
    });
    if (this.admin.depIniComRate > 0) {
      this.mvts.push({
        type: 'com',
        name: 'initial',
        date: this.def.effDate,
        amount: -utils.roundAmount(this.deposit.initial * this.admin.depIniComRate)
      });
    }
  }
  // }}}
};
Rule.prototype.calcPeriodicDeposit = function () {
  // {{{
  if (this.deposit.periodic) {
    var self = this;
    utils.range(this.deposit.number)
      .map(function (i) {
        var year = Math.floor(i / self.deposit.period);
        var amount = utils.roundAmount(self.deposit.periodic * Math.pow((1 +
          (self.deposit.updateRate || 0)), year));
        var comRate;
        while (comRate === undefined && year >= 0) {
          comRate = self.admin.depPerComRate[year];
          year--;
        }
        console.log('******' + comRate);
        if (comRate === undefined) {
          throw new Error('can not find com rate for pd: ' + (i + 1));
        }
        var date;
        if (i === 0) {
          date = self.def.effDate;
        }
        else {
          if (self.deposit.nextDate) {
            date = utils.momentToJSON(utils.momentFromJSON(self.deposit.nextDate)
              .add((i - 1) * (12 / self.deposit.period), 'month'));
          }
          else {
            date = utils.momentToJSON(utils.momentFromJSON(self.def.effDate)
              .add(i * (12 / self.deposit.period), 'month'));
          }
        }
        self.mvts.push({
          type: 'dep',
          name: 'periodic-' + (i + 1),
          date: date,
          amount: amount
        });
        if (comRate > 0) {
          amount = -utils.roundAmount(amount * comRate);
          console.log('******' + amount);
          self.mvts.push({
            type: 'com',
            name: 'periodic-' + (i + 1),
            date: date,
            amount: amount
          });
        }
      });
  }
  // }}}
};
Rule.prototype.initContext = function () {
  // {{{
  this._effDate = this.mvts[0].date;
  if (this._effDate < this.def.effDate) {
    throw new Error('deposit mvt out of contract dates scope');
  }
  this._effDate = this.def.effDate;
  this._effYear = utils.momentFromJSON(this._effDate)
    .year();
  //
  this._termDate = this.mvts[this.mvts.length - 1].date;
  if (this._termDate >= this.def.termDate) {
    throw new Error('deposit mvt out of contract dates scope');
  }
  this._termDate = this.def.termDate;
  this._endYear = utils.momentFromJSON(this._termDate)
    .add(-1, 'day')
    .year();
  //
  this._curDate = this._effDate;
  this._curAmount = 0;
  this._duration = utils.momentFromJSON(this.def.termDate)
    .diff(this.def.effDate, 'year');
  // }}}
};
Rule.prototype.cleanContext = function () {
  // {{{
  delete this._effDate;
  delete this._effYear;
  delete this._termDate;
  delete this._endYear;
  delete this._curDate;
  delete this._curAmount;
  delete this._duration;
  // }}}
};
Rule.prototype.calcYearMvts = function (year) {
  // {{{
  var self = this;
  var situation = this.sits[year];
  var nextDate;
  if (year === this._endYear) {
    nextDate = this._termDate;
  }
  else {
    nextDate = (year + 1) + '-01-01';
  }
  var lastDate = utils.momentToJSON(utils.momentFromJSON(nextDate)
    .add(-1, 'day'));
  var terms = [];
  var capDC;
  var cap;
  this.terms.forEach(function (t) {
    if ((t.evt === 'd') || (t.evt === 'i')) {
      cap = t.type === 'f' ? t.cap : utils.roundAmount(t.cap - self._curAmount);
      capDC = cap;
      if (cap <= 0) {
        return;
      }
    }
    if ((t.evt === 'ad') || (t.evt === 'ai')) {
      cap = t.type === 'f' ? t.cap + capDC : utils.roundAmount(t.cap +
        capDC);
      if (cap <= 0) {
        return;
      }
    }
    situation[t.evt] += cap;
    var tt = {
      type: t.type,
      actRate: self.admin.termActRate,
      feesRate: self.admin.termFeesRate,
      evt: t.evt,
      survAdjust: self.admin.termSurvAdjust,
      premium: 'o',
      gender: self.admin.useTV ? self.insured.gender : 'm',
      birthDate: self.insured.birthDate,
      capitals: [{
        date: self._curDate,
        amount: cap
      }, {
        date: nextDate,
        amount: 0
      }],
    };
    term.rate(tt);
    terms.push(tt);
  });
  terms.forEach(function (t) {
    var mvt = {
      type: 'term',
      name: [t.evt, t.type, year, Math.round(t.capitals[0].amount)].join(
        '-'),
      date: t.contribution.date,
      amount: -t.contribution.amount
    };
    situation.mvts.push(mvt);
    self.mvts.push(mvt);
  });
  this._curDate = nextDate;
  var earn = calcEarn(this._curAmount, situation.mvts, this.admin.depEarnRate,
    lastDate);
  var mvt = {
    type: 'earn',
    name: '' + year,
    date: lastDate,
    amount: earn
  };
  situation.mvts.push(mvt);
  this.mvts.push(mvt);
  this._curAmount = utils.roundAmount(this._curAmount + utils.sum(situation.mvts
    .map(function (mvt) {
      return mvt.amount;
    })));
  // }}}
};
Rule.prototype.calcYearSummary = function (year) {
  // {{{
  var situation = this.sits[year];
  situation.cumul = this._curAmount;
  situation.premium = 0;
  situation.com = 0;
  situation.term = 0;
  situation.mvts.forEach(function (mvt) {
    if (mvt.type === 'dep') {
      situation.premium += mvt.amount;
    }
    if (mvt.type === 'com') {
      situation.com += mvt.amount;
    }
    if (mvt.type === 'term') {
      situation.term += mvt.amount;
    }
  });
  situation.premium = utils.roundAmount(situation.premium);
  situation.com = utils.roundAmount(situation.com);
  situation.term = utils.roundAmount(situation.term);
  situation.taxEco = utils.roundAmount((situation.premium > 10000 ? 10000 :
    situation.premium) * (this._duration < 10 ? 0 : this.insured.taxRate));
  // }}}
};
Rule.prototype.calculateCommission = function () {
  //{{{
  var draft = this;
  var i = 0;
  var duration = utils.momentFromJSON(draft.def.termDate)
    .diff(draft.def.effDate, 'year');
  if (!draft.admin.updateCom) {
    // Com 1st year
    var com0;
    // Com 2nd to 10th year
    var com1;
    //com 11th to last year
    var com2;
    // Plan Epargne & (prévoyance || retraite)
    if (draft.deposit.periodic > 0) {
      var type;
      var cap;
      var opt = 0;
      var len = draft.terms.length;
      //
      if (len > 0) {
        while ((i < (len - 1)) && (draft.terms[i].evt !== 'd')) {
          i++;
        }
        if (draft.terms[i].evt === 'd') {
          type = draft.terms[i].type;
          cap = draft.terms[i].cap;
        }
        // Plan Epargne & Prévoyance
        if (type === 'd') {
          if (cap < 50000) {
            com0 = 0.25;
          }
          else {
            com0 = 0.3;
          }
        }
        // Plan Epargne & Prévoyance Plus
        else if (type === 'f') {
          if (cap < 50000) {
            com0 = 0.3;
          }
          else {
            com0 = 0.35;
          }
        }
        //Garanties optionnelles
        opt = len - 1;
        if (opt < 3) {
          com0 = com0 + opt / 100;
        }
        else {
          com0 = com0 + 0.05;
        }
      }
      //
      // Plan Epargne & retraite
      else {
        //
        com0 = 0.2;
      }
      com0 = com0 * Math.min(duration, 15) / 15;
      com0 = utils.fixNumber(com0, 4);
      com1 = 0.05;
      com2 = 0.03;
      draft.admin.depPerComRate[0] = com0;
      if (duration > 10) {
        for (i = 1; i < 10; i++) {
          draft.admin.depPerComRate[i] = com1;
        }
        for (i = 10; i < duration; i++) {
          draft.admin.depPerComRate[i] = com2;
        }
      }
      else {
        for (i = 1; i < duration; i++) {
          draft.admin.depPerComRate[i] = com1;
        }
      }
      //
    }
  }
  else {
    for (i = 12; i < duration; i++) {
      draft.admin.depPerComRate[i] = draft.admin.depPerComRate[11];
    }
  }
  //}}}
};
Rule.prototype.checkInsuredAge = function () {
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
Rule.prototype.calculate = function () {
  // {{{
  var self = this;
  this.mvts = [];
  this.sits = {};
  this.calcInitialDeposit();
  this.calcPeriodicDeposit();
  if (this.mvts.length === 0) {
    throw new Error('no deposits');
  }
  this.sortMvts();
  // _effDate
  // _effYear
  // _termDate
  // _endYear
  // _curDate
  // _curAmount
  this.initContext();
  var year;
  for (year = this._effYear; year <= this._endYear; year++) {
    this.sits[year] = {
      mvts: [],
      d: 0,
      ad: 0,
      i: 0,
      ai: 0
    };
  }
  this.mvts.forEach(function (mvt) {
    self.sits[utils.momentFromJSON(mvt.date)
      .year()].mvts.push(mvt);
  });
  for (year = this._effYear; year <= this._endYear; year++) {
    // theses two functions use the same var (_curAmount)
    this.calcYearMvts(year);
    this.calcYearSummary(year);
  }
  this.cleanContext();
  this.sortMvts();
  for (year in this.sits) {
    delete this.sits[year].mvts;
  }
  this.etag = utils.hash({
    sits: this.sits,
    mvts: this.mvts
  });
  // }}}
};
Rule.prototype.calculateSits = function () {
  // {{{
  var self = this;
  var mvts = [];
  mvts = this.mvts.filter(function (obj) {
    if ((obj.type === 'dep') || (obj.type === 'com')) {
      return true;
    }
  });
  this.mvts = [];
  this.mvts = mvts;
  this._effDate = this.def.effDate;
  this._effYear = utils.momentFromJSON(this._effDate)
    .year();
  this._termDate = this.def.termDate;
  this._endYear = utils.momentFromJSON(this._termDate)
    .add(-1, 'day')
    .year();
  this.sits = {};
  if (this.mvts.length === 0) {
    throw new Error('no deposits');
  }
  this.sortMvts();
  // _effDate
  // _effYear
  // _termDate
  // _endYear
  // _curDate
  // _curAmount
  //   this.initContext();
  this._curDate = this._effDate;
  this._curAmount = 0;
  this._duration = utils.momentFromJSON(this.def.termDate)
    .diff(this.def.effDate, 'year');
  var year;
  for (year = this._effYear; year <= this._endYear; year++) {
    this.sits[year] = {
      mvts: [],
      d: 0,
      ad: 0,
      i: 0,
      ai: 0
    };
  }
  this.mvts.forEach(function (mvt) {
    self.sits[utils.momentFromJSON(mvt.date)
      .year()].mvts.push(mvt);
  });
  for (year = this._effYear; year <= this._endYear; year++) {
    // theses two functions use the same var (_curAmount)
    this.calcYearMvts(year);
    this.calcYearSummary(year);
  }
  this.cleanContext();
  this.sortMvts();
  for (year in this.sits) {
    delete this.sits[year].mvts;
  }
  this.etag = utils.hash({
    sits: this.sits,
    mvts: this.mvts
  });
  // }}}
};
exports.rate = function (draft) {
  // {{{
  utils.mutate(draft, Rule);
  draft.checkInsuredAge();
  draft.calculateCommission();
  draft.calculate();
  // }}}
};
exports.rateSits = function (draft) {
  // {{{
  utils.mutate(draft, Rule);
  draft.calculateSits();
  // }}}
};

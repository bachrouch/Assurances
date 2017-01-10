/* vim: fdm=marker
 */
var Q = require('q');
var utils = require('../utils');
var email = require('../email');
var receipt = require('../receipt');
var contstants = require('../constants');
var models = require('./models');
var rules = require('./rules');
var draft = require('./api-draft');
var quote = require('./api-quote');
var contract = require('./api-contract');
var mongo = require('../../mongo');
var _ = require('underscore');
var moment = require('moment');

function requestDraft(id, msg, ctx, cb) {
  // {{{
  var url = 'http://takaful.tn/family/#/savings/subscribe/' + id;
  var internalUrl = 'http://192.168.1.205/family/#/savings/subscribe/' + id;
  var mel = {
    from: 'Dérogation <admin@takaful.tn>',
    to: 'wiem.benmoussa@attakafulia.tn',
    cc: ['asma.trabelsi@attakafulia.tn', 'asma.souid@attakafulia.tn'],
    replyTo: ctx.email,
    subject: 'Dérogation Epargne pour ' + ctx.user.fullName,
    text: msg + '\n\n' + url + '\n\n' + internalUrl
  };
  email.send(mel, cb);
  // }}}
}

function checkRightDraft(right, ctx, cb) {
  var err;
  if (!ctx.user[right]) {
    err = 'Ce service requiert des droits supplémentaires.';
  }
  if (err) {
    cb(err);
  }
  else {
    cb(null);
  }
}

function _safeRate(pol, cb) {
  // {{{
  var ok = true;
  try {
    rules.rate(pol);
  }
  catch (e) {
    ok = false;
    cb(e);
  }
  if (ok) {
    cb(null, pol);
  }
  // }}}
}

function _rate(pol, cb) {
  // {{{
  var ok = true;
  try {
    rules.rateSits(pol);
  }
  catch (e) {
    ok = false;
    cb(e);
  }
  if (ok) {
    cb(null, pol);
  }
  // }}}
}

function createDraft(policy, ctx, cb) {
  // {{{
  var pol = {};
  if (_.isEmpty(policy)) {
    pol = models.defaultDraft;
  }
  else {
    pol = policy;
    delete(pol._id);
    delete(pol.def.ref);
    delete(pol.def.user);
    pol.deposit.number = policy.deposit.number - 1;
    pol.subscriber = policy.subscriber;
    pol.def.effDate = utils.momentToJSON(moment());
    pol.deposit.nextDate = utils.momentToJSON(moment());
    if (!pol.admin.maxAge) {
      pol.admin.maxAge = 70;
    }
  }
  var errors = draft.validate(pol);
  if (utils.isEmpty(errors)) {
    draft.insert(pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        _safeRate(pol, cb);
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}

function readDraft(id, ctx, cb) {
  // {{{
  draft.findOne(id, function (err, pol) {
    if (err) {
      cb(err);
    }
    else {
      _safeRate(pol, cb);
    }
  });
  // }}}
}

function updateDraft(pol, ctx, cb) {
  // {{{
  var id = pol._id;
  delete pol._id;
  var errors = draft.validate(pol);
  if (utils.isEmpty(errors)) {
    draft.update(id, pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        _safeRate(pol, function (err, pol) {
          if (err) {
            cb(err);
          }
          else {
            draft.depPerComRate(id, pol, function (err) {
              if (err) {
                cb(err);
              }
              else {
                cb(null, pol);
              }
            });
          }
        });
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}

function adminDraft(pol, ctx, cb) {
  // {{{
  var id = pol._id;
  delete pol._id;
  var errors = draft.validate(pol);
  if (utils.isEmpty(errors)) {
    draft.admin(id, pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        _safeRate(pol, cb);
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}

function _receiptDeposit(pol, i, ctx, cb) {
  // {{{
  var name;
  var depAmount = 0;
  var depCom = 0;
  if (i === 0) {
    name = 'initial';
  }
  else {
    name = 'periodic-' + i;
  }
  var j, mvt, dep, com;
  for (j = 0; j < pol.mvts.length; j++) {
    mvt = pol.mvts[j];
    if (mvt.name === name) {
      if (mvt.type === 'dep') {
        dep = mvt;
        depAmount = mvt.amount;
      }
      if (mvt.type === 'com') {
        com = mvt;
        depCom = mvt.amount;
      }
    }
    if (dep && com) {
      break;
    }
  }
  var date;
  if (!(dep && com)) {
    if (i === 0) {
      date = pol.def.effDate;
      dep = 0;
      com = 0;
    }
    else {
      cb('deposit not found: ' + i);
    }
  }
  else {
    date = dep.date;
    dep = dep.amount;
    com = com.amount;
  }
  var fees;
  var toDate = date;
  if (i === 0) {
    fees = 0;
  }
  else if (i === 1) {
    fees = pol.admin.feesDep + pol.admin.feesIni;
    toDate = utils.momentToJSON(moment(date)
      .add(12 / pol.deposit.period, 'month')
      .add(-1, 'day'));
  }
  else {
    fees = pol.admin.feesDep;
  }
  var rec = {};
  rec.def = {
    nature: i === 0 ? 'CT' : 'TR',
    date: utils.momentToJSON(moment()),
    fromDate: date,
    toDate: toDate,
    user: ctx.user
  };
  rec.contract = {
    ref: pol.def.ref,
    ver: pol.def.ver
  };
  rec.subscriber = {
    type: 1,
    id: pol.subscriber.id,
    reference: pol.subscriber.reference,
    name: pol.subscriber.firstName + ' ' + pol.subscriber.name,
    address: pol.subscriber.address,
    phone: pol.subscriber.phone
  };
  rec.insured = {
    type: 1,
    id: pol.insured.id,
    name: pol.insured.firstName + ' ' + pol.insured.name
  };
  rec.beneficiary = {
    clause: false
  };
  rec.coverages = [{
    code: 'DEP',
    amount: depAmount,
    commission: -depCom,
    taxes: [],
  }];
  rec.summary = {
    fees: fees,
    feesCommission: 0,
    feesTaxes: [],
    stamps: []
  };
  rec.payments = pol.settlements;
  var ok = true;
  try {
    receipt.finalize(rec);
  }
  catch (e) {
    ok = false;
    cb(e);
  }
  if (!ok) {
    return;
  }
  if (rec.summary.total !== 0) {
    receipt.create(rec, cb);
  }
  else {
    cb(null);
  }
  // }}}
}

function _updateMvts(ref, ver, mvts, name, type, cb) {
  //{{{
  var index;
  var result = mvts.filter(function (mvt, ind) {
    if ((mvt.name === name) && (mvt.type === type)) {
      index = ind;
      return true;
    }
  });
  if (result.length > 0) {
    result = result[0];
    result.generated = true;
    mvts[index] = result;
  }
  mongo.getSavingsContractCol()
    .findAndModify({
      'def.ref': ref,
      'def.ver': ver
    }, {}, {
      $set: {
        mvts: mvts
      }
    }, {
      new: false,
      upsert: false
    }, function (err, ctr) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, ctr);
      }
    });
  //}}}
}

function _receiptFreeDeposit(pol, freeMvt, index, ctx, cb) {
  // {{{
  var name;
  name = 'free-' + index;
  var j, mvt, dep, com, date;
  for (j = 0; j < pol.mvts.length; j++) {
    mvt = pol.mvts[j];
    if (mvt.name === name) {
      if (mvt.type === 'dep') {
        dep = mvt;
      }
      if (mvt.type === 'com') {
        com = mvt;
      }
    }
    if (dep && com) {
      break;
    }
  }
  if (!(dep && com)) {
    if (index === 0) {
      date = pol.def.effDate;
      dep = 0;
      com = 0;
    }
    else {
      cb('deposit not found: ' + index);
    }
  }
  else {
    date = dep.date;
    if (dep.amount) {
      dep = dep.amount;
    }
    else {
      dep = 0;
    }
    if (com.amount) {
      com = com.amount;
    }
    else {
      com = 0;
    }
  }
  var fees;
  if (index === 0) {
    fees = pol.admin.feesIni;
  }
  else {
    fees = pol.admin.feesDep;
  }
  var rec = {};
  rec.def = {
    nature: 'CT',
    date: date,
    fromDate: date,
    toDate: date,
    user: ctx.user
  };
  rec.contract = {
    ref: pol.def.ref,
    ver: pol.def.ver
  };
  rec.subscriber = {
    type: 1,
    id: pol.subscriber.id,
    reference: pol.subscriber.reference,
    name: pol.subscriber.firstName + ' ' + pol.subscriber.name,
    address: pol.subscriber.address,
    phone: pol.subscriber.phone
  };
  rec.insured = {
    type: 1,
    id: pol.insured.id,
    name: pol.insured.firstName + ' ' + pol.insured.name
  };
  rec.beneficiary = {
    clause: false
  };
  rec.coverages = [{
    code: 'DEP',
    amount: dep,
    commission: -com,
    taxes: [],
  }];
  rec.summary = {
    fees: fees,
    feesCommission: 0,
    feesTaxes: [],
    stamps: []
  };
  var ok = true;
  try {
    receipt.finalize(rec);
  }
  catch (e) {
    ok = false;
    cb(e);
  }
  if (!ok) {
    return;
  }
  receipt.create(rec, cb);
  // }}}
}

function createQuote(pol, ctx, cb) {
  // {{{
  var id = pol._id;
  delete pol._id;
  var errors = quote.validate(pol);
  if (utils.isEmpty(errors)) {
    _safeRate(pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        pol.def.user = ctx.user;
        quote.create(pol, function (err, pol) {
          if (err) {
            cb(err);
          }
          else {
            var rem = Q.Promise(function (resolve, reject) {
              draft.remove(id, function (err) {
                if (err) {
                  reject(err);
                }
                else {
                  resolve();
                }
              });
            });
            Q.all([rem])
              .then(function () {
                cb(null, pol);
              });
          }
        });
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}

function readQuote(ref, ctx, cb) {
  // {{{
  quote.findOne(ref, ctx, cb);
  // }}}
}

function searchContract(criteria, ctx, cb) {
  // {{{
  if (criteria.isQuote) {
    quote.search(criteria, ctx, function (err, data) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, data);
      }
    });
  }
  else {
    contract.search(criteria, ctx, function (err, data) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, data);
      }
    });
  }
  // }}}
}

function createContract(pol, ctx, cb) {
  // {{{
  var id = pol._id;
  delete pol._id;
  delete pol.mvts;
  var errors = contract.validate(pol);
  if (utils.isEmpty(errors)) {
    _safeRate(pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        pol.def.user = ctx.user;
        contract.create(pol, function (err, pol) {
          if (err) {
            cb(err);
          }
          else {
            var rem = Q.Promise(function (resolve, reject) {
              draft.remove(id, function (err) {
                if (err) {
                  reject(err);
                }
                else {
                  resolve();
                }
              });
            });
            var rec = Q.Promise(function (resolve, reject) {
              _receiptDeposit(pol, 0, ctx, function (err) {
                if (err) {
                  reject(err);
                }
                else {
                  _receiptDeposit(pol, 1, ctx, function (err) {
                    if (err) {
                      reject(err);
                    }
                    else {
                      var name0 = pol.mvts[0].name;
                      var type0 = pol.mvts[0].type;
                      _updateMvts(pol.def.ref, pol.def.ver,
                        pol.mvts, name0, type0,
                        function (err) {
                          if (err) {
                            reject(err);
                          }
                          else {
                            var name1 = pol.mvts[1].name;
                            var type1 = pol.mvts[1].type;
                            _updateMvts(pol.def.ref, pol.def
                              .ver, pol.mvts, name1,
                              type1,
                              function (err) {
                                if (err) {
                                  reject(err);
                                }
                                else {
                                  resolve();
                                }
                              });
                          }
                        });
                    }
                  });
                }
              });
            });
            Q.all([rem, rec])
              .then(function () {
                cb(null, pol);
              }, function () {
                cb(null, pol);
              });
          }
        });
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}

function readContract(criteria, ctx, cb) {
  // {{{
  contract.findOne(criteria, ctx, cb);
  // }}}
}

function saveFreeDeposit(pol, ctx, cb) {
  //{{{
  var mvts = pol.mvts;
  var effDate = pol.def.effDate;
  var nextDate;
  if (pol.deposit !== null) {
    nextDate = pol.deposit.nextDate;
  }
  pol.def.effDate = utils.momentToJSON(moment());
  _.each(pol.deposit.free, function (freeDep) {
    freeDep.effDate = utils.momentToJSON(moment(freeDep.effDate));
  });
  var freeDep = _.last(pol.deposit.free);
  var index = pol.deposit.free.length;
  mvts = contract.insertMvt(freeDep, mvts, index);
  var id = pol._id;
  delete pol._id;
  var tempoUser = pol.def.user;
  delete(pol.def.user);
  delete(pol.mvts);
  delete(pol.sits);
  delete(pol.deposit.nextDate);
  var errors = contract.validateForExisting(pol);
  pol.deposit.nextDate = nextDate;
  pol.def.effDate = effDate;
  pol.deposit.nextDate = nextDate;
  pol.mvts = mvts;
  pol.def.user = tempoUser;
  if (utils.isEmpty(errors)) {
    _rate(pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        contract.update(pol, id, function (err, pol) {
          if (err) {
            cb(err);
          }
          else {
            _receiptFreeDeposit(pol, freeDep, index, ctx, function (err) {
              //, rec) {
              if (err) {
                cb(err);
              }
              else {
                cb(null, pol);
              }
            });
          }
        });
      }
    });
  }
  else {
    cb(errors);
  }
}

function domiciliate(pol, ctx, cb) {
  //{{{
  var domiciliation = '';
  var id = pol._id;
  delete(pol._id);
  if ((pol.subscriber !== null) && (pol.def !== null)) {
    domiciliation = pol.subscriber.id + '-' + pol.def.ref;
  }
  if (pol.payment !== null) {
    pol.payment.domiciliation = domiciliation;
    pol.payment.domiciliationDate = utils.momentToJSON(moment());
  }
  contract.update(pol, id, function (err, pol) {
    if (err) {
      cb(err);
    }
    else {
      cb(null, pol);
    }
  });
  //}}}
}

function validateContract(pol, ctx, cb) {
  //{{{
  var id = pol._id;
  delete(pol._id);
  if (pol.def !== null) {
    pol.def.nature = contstants.cContract;
  }
  contract.update(pol, id, function (err, pol) {
    if (err) {
      cb(err);
    }
    else {
      cb(null, pol);
    }
  });
  //}}}
}
exports.requestDraft = requestDraft;
exports.createDraft = createDraft;
exports.readDraft = readDraft;
exports.updateDraft = updateDraft;
exports.adminDraft = adminDraft;
exports.checkRightDraft = checkRightDraft;
exports.createQuote = createQuote;
exports.readQuote = readQuote;
exports.searchContract = searchContract;
exports.createContract = createContract;
exports.readContract = readContract;
exports.saveFreeDeposit = saveFreeDeposit;
exports.domiciliate = domiciliate;
exports.validateContract = validateContract;

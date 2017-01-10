var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var Q = require('q');
var mongo = require('../../mongo');
var utils = require('../utils');
var receipt = require('../receipt');
var constants = require('../constants');
var logFile;

function log(contract, act, id, receipt) {
  // {{{
  var data = contract + ' : ' + act + ' ' + id + ' : ' + receipt + '\n';
  fs.writeSync(logFile, data);
  // }}}
}

function _receiptDeposit(pol, i, user, cb) {
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
  var effDate;
  date = utils.momentToJSON(moment());
  if (dep) {
    effDate = dep.date;
  }
  if (!(dep && com)) {
    if (i === 0) {
      date = pol.def.effDate;
      effDate = pol.def.effDate;
      dep = 0;
      com = 0;
    }
    else {
      cb(pol.def.ref + ' : deposit not found: ' + i);
    }
  }
  else {
    date = utils.momentToJSON(moment());
    effDate = dep.date;
    dep = dep.amount;
    com = com.amount;
  }
  var fees;
  if (i === 0) {
    fees = pol.admin.feesIni;
  }
  else {
    fees = pol.admin.feesDep;
  }
  var toDate = utils.momentToJSON(moment(effDate)
    .add(12 / pol.deposit.period, 'month')
    .add(-1, 'day'));
  var rec = {};
  rec.def = {
    nature: i === 0 ? 'CT' : 'TR',
    date: date,
    fromDate: effDate,
    toDate: toDate,
    user: user
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
  rec.payment = pol.payment;
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

function updateMvts(ref, ver, mvts, name, type, cb) {
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

function filterMvts(mvts, type) {
  //{{{
  var result = mvts.filter(function (mvt) {
    if (mvt.type === type) {
      return true;
    }
  });
  return result;
  //}}}
}

function mvtToTreat(mvt) {
  //{{{
  var result = false;
  var nextDate = utils.momentToJSON(moment()
    .add(8, 'day'));
  var mvtDate = mvt.date;
  if ((mvtDate <= nextDate) && (!mvt.generated)) {
    result = true;
  }
  return result;
  //}}}
}

function treatContract(contract, cb) {
  //{{{
  var toTreat;
  if (contract.def.status === constants.cActive) {
    if (contract.mvts) {
      var mvts = contract.mvts;
      if (mvts !== undefined) {
        mvts = filterMvts(mvts, 'dep');
        _.each(mvts, function (mvt) {
          toTreat = mvtToTreat(mvt);
          if (toTreat) {
            var index = mvt.name.substr(mvt.name.indexOf('-') + 1);
            _receiptDeposit(contract, index, contract.def.user, function (
              err, rec) {
              if (err) {
                cb(err);
              }
              else {
                var name = mvt.name;
                var type = mvt.type;
                log(contract.def.ref, 'generated', name, rec[0].def.ref);
                updateMvts(contract.def.ref, contract.def.ver, contract
                  .mvts, name, type,
                  function (err) {
                    if (err) {
                      throw (err);
                    }
                  });
              }
            });
          }
        });
      }
    }
  }
  else {
    cb(null);
  }
  //}}}
}

function getContracts(pol, cb) {
  mongo.getSavingsContractCol()
    .findOne({
      'def.ref': pol._id,
      'def.ver': pol.ver
    }, function (err, contract) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, contract);
      }
    });
}

function generateTerms(cb) {
  //{{{
  var dir = 'batch/data/log';
  return Q.all([
    mongo.init()
    .then(function () {
      var date = moment()
        .format('YYYY-MM-DD-HH:mm');
      logFile = fs.openSync(dir + '/savingsTerm' + date + '.log', 'w');
      var query = {};
      query['def.termDate'] = {
        $gt: utils.dateToJSON(moment())
      };
      mongo.getSavingsContractCol()
        .aggregate([{
          $match: query
        }, {
          $project: {
            'def.ref': 1,
            'def.ver': 1,
            definition: '$def',
            admin: 1,
            subscriber: 1,
            insured: 1,
            mvts: 1,
            sits: 1,
          }
        }, {
          $group: {
            '_id': '$def.ref',
            'ver': {
              $max: '$def.ver'
            }
          }
        }], function (err, policies) {
          _.each(policies, function (pol) {
            getContracts(pol, function (err, cont) {
              if (err) {
                throw (err);
              }
              else {
                treatContract(cont, function (err) {
                  if (err) {
                    cb(err);
                  }
                });
              }
            });
          });
        });
    })
  ]);
  //}}}
}
exports.generateTerms = generateTerms;

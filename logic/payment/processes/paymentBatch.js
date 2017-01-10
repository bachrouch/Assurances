/*jshint -W083*/
/*jshint -W030*/
var fs = require('fs');
var _ = require('underscore');
var mongo = require('../../../mongo');
var moment = require('moment');
var seq = require('../../seq');
var utils = require('../../utils');
var async = require('async');
var ExistingRecs;
var email = require('../../email');

function writeLog(textToInsert) {
  console.log(moment()
    .format() + '-------' + textToInsert);
  fs.appendFileSync('/tmp/BatchPaymentLog', moment()
    .format() + '-------' + textToInsert + '\n');
}

function getListOfPos(cb) {
  var listOfPos;
  var batchDetails = mongo.getConfigBatchCol()
    .find({
      'def.name': 'payment'
    });
  batchDetails.toArray(function (err, batchDetails) {
    listOfPos = batchDetails[0].listOfPos;
    cb(listOfPos);
  });
}

function sendEmail(posCode) {
  var params = {
    code: posCode
  };
  _sendEmail(params, function (err, mel) {
    if (err) {
      console.log(err);
    }
    email.send(mel, null);
  });
}

function _sendEmail(params, cb) {
  mongo.getPosCol()
    .findOne({
      code: params.code
    }, function (err, pos) {
      if (err) {
        console.log(err);
      }
      else {
        mongo.getEmailCol()
          .findOne({
            name: 'sendLockSubscriptionNotice'
          }, function (err, eml) {
            if (err) {
              cb(err);
            }
            else {
              var to = pos.email;
              var notice = '';
              if ((to === null) || (to === '') || (to === undefined)) {
                to = eml.cc;
                notice = eml.content.notice;
              }
              var mel = {
                to: to,
                from: eml.from,
                cc: eml.cc,
                replyTo: eml.replyTo,
                subject: 'Code || ' + params.code + eml.subject,
                text: eml.content.beginMaiMsg + eml.content.detailsMailMsg +
                  notice + eml.content.endMaiMsg
              };
              cb(null, mel);
            }
          });
      }
    });
}

function getReceipts(cb) {
  getListOfPos(function (listOfPos) {
    var today = moment()
      .format('YYYY-MM-DD');
    var query = {};
    query['recovery.due'] = {
      $ne: 0
    };
    query['def.nature'] = {
      $nin: ['RT', 'LQ', 'RS', 'CX', 'PX']
    };
    query['def.user.pos.code'] = {
      $in: listOfPos
    };
    query['def.fromDate'] = {
      $lte: today
    };
    query['recovery.postponedTo'] = {
      $lt: today
    };
    var receipts = mongo.getFinanceReceiptCol()
      .find(query);
    receipts.toArray(function (err, results) {
      var recs = _.groupBy(results, function (obj) {
        return obj.def.user.pos.code;
      });
      cb(recs);
    });
  });
}

function getDraftFinancePayment(posCode, callback) {
  var query = {};
  query['pos.code'] = posCode;
  query.status = 0;
  var myPayments = mongo.getFinancePaymentCol()
    .find(query);
  callback(myPayments);
}

function calculateLimitDate(code) {
  var limitDate = moment();
  if (code.substring(0, 1) === '7') {
    limitDate = moment()
      .endOf('month');
    limitDate = moment(limitDate)
      .add(1, 'days')
      .format('YYYY-MM-DD');
  }
  else {
    var daysToMonday = 0 - (1 - moment()
      .isoWeekday()) + 1;
    limitDate = moment()
      .subtract(daysToMonday, 'days')
      .format('YYYY-MM-DD');
    limitDate = moment(limitDate)
      .add(8, 'days')
      .format('YYYY-MM-DD');
  }
  return limitDate;
}

function createFinancePayment(limitDate, posCode, callback) {
  var deductedCommission = false;
  if (posCode.substring(0, 1) === '7' || posCode.substring(0, 1) === '5') {
    deductedCommission = true;
  }
  seq.generateRef('payment', function (err, reference) {
    if (err) {
      callback(err);
    }
    else {
      var myPos = {
        'code': posCode,
        'deductedCommission': deductedCommission,
        'proratedCommission': false,
        'ras': 0.15
      };
      mongo.getFinancePaymentCol()
        .insert({
          status: 0,
          reference: reference,
          pos: myPos,
          creationDate: moment()
            .startOf('day')
            .toDate(),
          closingDate: null,
          limitDate: limitDate,
          balance: 0,
          premium: {
            total: 0,
            commission: 0,
            commissionToPay: 0,
            ras: 0,
            toPay: 0,
            affected: 0,
            paid: 0
          },
          receipts: [],
          settlements: [],
          splittedSettlements: true
        }, function (err) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, reference);
          }
        });
    }
  });
}

function updatePayment(resultsFinancePayment) {
  var itemFinancePayment = resultsFinancePayment[0];
  var rateRas = itemFinancePayment.pos.ras;
  var total = 0;
  var commission = 0;
  var toPay = 0;
  var ras = 0;
  var affected = 0;
  var due = 0;
  var paid = 0;
  var commissionToPay = 0;
  var receipts = itemFinancePayment.receipts;
  var settlements = itemFinancePayment.settlements;
  _.each(receipts, function (receipt) {
    total += receipt.total;
    commission += receipt.commissionAffected;
    toPay += receipt.toPay;
    affected += receipt.toAffect;
    due += receipt.toPay - receipt.toAffect;
    commissionToPay += receipt.commissionToPay;
  });
  _.each(settlements, function (settlement) {
    paid += settlement.amount;
  });
  if (rateRas > 0) {
    ras = -rateRas * commission;
  }
  total = utils.fixNumber(total, 3);
  commission = utils.fixNumber(commission, 3);
  ras = utils.fixNumber(ras, 3);
  toPay = utils.fixNumber(toPay, 3);
  affected = utils.fixNumber(affected, 3);
  due = utils.fixNumber(due, 3);
  paid = utils.fixNumber(paid, 3);
  mongo.getFinancePaymentCol()
    .update({
      reference: itemFinancePayment.reference
    }, {
      $set: {
        'premium.total': total,
        'premium.commission': commission,
        'premium.ras': ras,
        'premium.toPay': toPay,
        'premium.affected': affected,
        'premium.due': due,
        'premium.paid': paid,
        'premium.commissionToPay': commissionToPay
      }
    }, function (err) {
      if (err) {
        writeLog('Problem updating finance payment attributes');
      }
    });
}

function lockPos(posCode, refPayment) {
  mongo.getPosCol()
    .update({
      code: posCode,
      locked: false,
    }, {
      $set: {
        locked: true,
        newLockDate: null
      }
    }, function (err) {
      if (err) {
        writeLog('Problem updating pos with ' + posCode);
      }
      else {
        writeLog('Lock auto subscription .for Code' + posCode +
          '-----reference : ' + refPayment);
        sendEmail(posCode);
      }
    });
}

function verifyAndLockSubscription(posCode, reference, limitDate, receipts) {
  var today = moment()
    .format('YYYY-MM-DD');
  mongo.getPosCol()
    .findOne({
      code: posCode,
      locked: false
    }, function (err, pos) {
      if (pos !== null) {
        if (receipts.length > 0 && today >= limitDate && (typeof pos.newLockDate ===
            'undefined' || pos.newLockDate === null || today >= pos.newLockDate
          )) {
          lockPos(posCode, reference);
        }
      }
    });
}

function updateLimitDate(refPayment, limitDate) {
  mongo.getFinancePaymentCol()
    .update({
      reference: refPayment
    }, {
      $set: {
        limitDate: limitDate
      }
    }, function (err) {
      if (err) {
        writeLog('Problem updating finance payment limitDate attribute');
      }
    });
}
exports.checkAndCreatePayments = function checkAndCreatePayments(cb) {
  writeLog(
    '**************************CHECK AND CREATE PAYMENTS*******************************************'
  );
  getReceipts(function (recs) {
    ExistingRecs = recs;
    var highest = Object.keys(recs)
      .pop();
    for (var code in recs) {
      var myNewLimitDate = calculateLimitDate(code);
      getDraftFinancePayment(code, function (cursorPayment) {
        var posCode = code;
        cursorPayment.toArray(function (err, resultsFinancePayment) {
          if (err) {
            writeLog(err);
            return;
          }
          else {
            if (resultsFinancePayment.length === 0) {
              createFinancePayment(myNewLimitDate, posCode,
                function (err, ref) {
                  if (err) {
                    writeLog(err);
                  }
                  else {
                    writeLog(
                      'Creating new payment : reference =  ' +
                      ref + ' for code ' + posCode);
                  }
                });
            }
          }
        });
      });
      if (code === highest) {
        cb();
      }
    }
  });
};
exports.checkAndInsertReceipts = function checkAndInsertReceipts(callback) {
  writeLog(
    '**************************CHECK AND INSERT RECEIPTS*******************************************'
  );
  var toPay = 0;
  var commissionToPay = 0;
  var commissionAffected = 0;
  getReceipts(function (recs) {
    async.each(recs, function (recItem, cb) {
      var code;
      code = recItem[0].def.user.pos.code;
      var query = {};
      query['pos.code'] = code;
      query.status = 0;
      //call function
      var myPayments = mongo.getFinancePaymentCol()
        .find(query);
      myPayments.toArray(function (err, resultsFinancePayment) {
        if (resultsFinancePayment.length !== 0) {
          var itemFinancePayment = resultsFinancePayment[0];
          var receipts;
          receipts = [];
          receipts = recItem;
          _.each(receipts, function (rec) {
            toPay = 0;
            commissionToPay = 0;
            commissionAffected = 0;
            toPay = rec.recovery.due;
            if (resultsFinancePayment[0].pos.deductedCommission) {
              commissionAffected = -rec.summary.commission;
              toPay += commissionAffected;
            }
            else {
              commissionToPay = -rec.summary.commission;
            }
            var myReceiptsCursor = itemFinancePayment.receipts;
            var existings = _.pluck(myReceiptsCursor,
              'reference');
            if (
              (!_.contains(existings, rec.def.ref)) && (
                (rec.def.nature === 'TR' && (
                  (typeof rec.insuranceCertificate !==
                    'undefined' && rec.insuranceCertificate !==
                    null) //|| (typeof rec.payment !=='undefined' && rec.payment.mode ==='debit' && rec.payment.status ==='rejected')
                )) || (
                  (rec.def.nature !== 'TR')))) {
              mongo.getFinancePaymentCol()
                .update({
                  reference: itemFinancePayment.reference
                }, {
                  $push: {
                    receipts: {
                      _id: rec.def.ref,
                      contract: rec.contract.ref,
                      reference: rec.def.ref,
                      date: rec.def.date,
                      nature: rec.def.nature,
                      user: rec.def.user.username,
                      pos: rec.def.pos,
                      fromDate: rec.def.fromDate,
                      toDate: rec.def.toDate,
                      subscriberName: rec.subscriber.name,
                      total: rec.summary.total,
                      totalCommission: rec.summary.commission,
                      due: rec.recovery.due,
                      toAffect: rec.recovery.due,
                      commissionAffected: commissionAffected,
                      commissionToPay: commissionToPay,
                      toPay: toPay,
                      isNotDeletable: true
                    }
                  }
                }, function (err) {
                  if (err) {
                    writeLog(
                      'Problem updating Payment details');
                  }
                  else {
                    writeLog('Pushing Receipt N° ' + rec.def
                      .ref + ' in FC N° ' +
                      itemFinancePayment.reference +
                      ' for code ' + code + ' is OK');
                  }
                });
            }
            else {}
          });
          updatePayment(resultsFinancePayment);
        }
      });
      cb();
    });
  });
  callback();
};
exports.lockSubscription = function lockSubscription() {
  writeLog(
    '**************************CHECK AND LOCK SUBSCRIPTION*******************************************'
  );
  getListOfPos(function (listOfPos) {
    _.each(listOfPos, function (posCode) {
      getDraftFinancePayment(posCode, function (cursorPayment) {
        cursorPayment.toArray(function (err,
          resultsFinancePayment) {
          if (err) {
            writeLog(err);
            return;
          }
          else {
            if (resultsFinancePayment.length !== 0) {
              var itemFinancePayment = resultsFinancePayment[
                0];
              if (typeof itemFinancePayment.limitDate ===
                'undefined') {
                calculateLimitDate(posCode, function (
                  myNewLimitDate) {
                  updateLimitDate(itemFinancePayment.reference,
                    myNewLimitDate);
                  writeLog('Existant payment  :' +
                    itemFinancePayment.reference +
                    ' for code ' + posCode +
                    ' --- And updating LimitDate :' +
                    myNewLimitDate);
                  verifyAndLockSubscription(posCode,
                    itemFinancePayment.reference,
                    myNewLimitDate, itemFinancePayment.receipts
                  );
                });
              }
              else {
                writeLog('Existant payment  :' +
                  itemFinancePayment.reference +
                  ' for code ' + posCode +
                  ' --- LimitDate updated : ' +
                  itemFinancePayment.limitDate);
                verifyAndLockSubscription(posCode,
                  itemFinancePayment.reference,
                  itemFinancePayment.limitDate,
                  itemFinancePayment.receipts);
              }
            }
          }
        });
      });
    });
  });
};

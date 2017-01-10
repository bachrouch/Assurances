/*jshint -W083 */
var seq = require('../../seq');
var moment = require('moment');
var mongo = require('../../../mongo');
var utils = require('../../utils');
var email = require('../../email');

function ckeckCommission(posCode) {
  var deductedCommission = false;
  if (posCode.substring(0, 1) === '7' || posCode.substring(0, 1) === '5') {
    deductedCommission = true;
  }
  return deductedCommission;
}

function sendEmail(posCode, reference) {
  var params = {
    code: posCode,
    reference: reference
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
            name: 'sendCreationOfNewDebitPaymentNotice'
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
                subject: 'Code || ' + params.code + ' ' + eml.subject,
                text: eml.content.beginMaiMsg + eml.content.detailsMailMsg +
                  ' ' + params.reference + '.' + notice + eml.content.endMaiMsg
              };
              cb(null, mel);
            }
          });
      }
    });
}

function calculatePaymentDetails(recsArray, cb) {
  var rateRas = 0.15;
  var settlement;
  var premium;
  var settlementsReceipts = [];
  var settlements = [];
  var total = 0;
  var debitRefs = [];
  var commission = 0;
  var toPay = 0;
  var ras = 0;
  var affected = 0;
  var due = 0;
  var paid = 0;
  var commissionToPay = 0;
  var references = '';
  for (var rec in recsArray) {
    settlementsReceipts.push(recsArray[rec].reference.toString());
    total += recsArray[rec].total;
    commission += recsArray[rec].commissionAffected;
    toPay += recsArray[rec].toPay;
    affected += recsArray[rec].toAffect;
    if (debitRefs.indexOf(recsArray[rec].debit.reference) === -1) {
      debitRefs.push(recsArray[rec].debit.reference);
      if (references === '') {
        references += recsArray[rec].debit.reference;
      }
      else {
        references += ' - ' + recsArray[rec].debit.reference;
      }
    }
    due = toPay - affected;
    commissionToPay += recsArray[rec].commissionToPay;
  }
  paid += toPay;
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
  commissionToPay = utils.fixNumber(commissionToPay, 3);
  settlement = {
    'mode': 6,
    'amount': total,
    'receipts': settlementsReceipts,
    'reference': references.toString(),
    'date': moment()
      .format('YYYY-MM-DD')
  };
  premium = {
    'total': total,
    'commission': commission,
    'commissionToPay': commissionToPay,
    'ras': ras,
    'affected': affected,
    'due': due,
    'toPay': toPay,
    'paid': paid
  };
  settlements.push(settlement);
  var paymentDetails = {
    'settlements': settlements,
    'premium': premium,
    'receipts': recsArray
  };
  cb(paymentDetails);
}

function createPayment(posCode, paymentDetails, cb) {
  var deductedCommission = ckeckCommission(posCode);
  var pos = {
    'code': posCode,
    'deductedCommission': deductedCommission,
    'proratedCommission': false,
    'ras': 0.15
  };
  seq.generateRef('payment', function (err, reference) {
    if (err) {
      console.log(err);
      cb(err, null);
    }
    else {
      mongo.getFinancePaymentCol()
        .insert({
          status: 1,
          reference: reference,
          pos: pos,
          creationDate: moment()
            .format('YYYY-MM-DD'),
          closingDate: moment()
            .format('YYYY-MM-DD'),
          balance: 0,
          premium: paymentDetails.premium,
          receipts: paymentDetails.receipts,
          settlements: paymentDetails.settlements,
          closingUser: 'Debit-Payment-Batch'
        }, function (err, payment) {
          if (err) {
            console.log(err);
            cb(err, payment);
          }
          else {
            console.log('creation FC OK :' + reference + ' of Pos : ' +
              posCode);
            sendEmail(posCode, reference);
            cb(null, reference);
          }
        });
    }
  });
}

function updatePaymentReceipts(posCode, paymentDetails, recs) {
  createPayment(posCode, paymentDetails, function (err, refPayment) {
    if (err) {
      console.log(err);
    }
    else {
      for (var i in recs) {
        var recoveryPart = {
          'reference': refPayment,
          'amount': recs[i].toPay,
          'date': moment()
            .format('YYYY-MM-DD')
        };
        mongo.getFinanceReceiptCol()
          .update({
            'def.ref': recs[i].reference
          }, {
            $push: {
              'recovery.parts': recoveryPart
            },
            $set: {
              'recovery.due': 0,
              'payment.status': 'treated'
            }
          }, function (err) {
            if (err) {
              console.log(err);
            }
          });
      }
    }
  });
}

function addReceiptToArray(array, receiptToAdd) {
  var commissionToPay = 0;
  var commissionAffected = 0;
  var toPay = receiptToAdd.recovery.due;
  if (ckeckCommission(receiptToAdd.def.user.pos.code)) {
    commissionAffected = -receiptToAdd.summary.commission;
    toPay += commissionAffected;
  }
  else {
    commissionToPay = -receiptToAdd.summary.commission;
  }
  array.push({
    _id: receiptToAdd.def.ref,
    contract: receiptToAdd.contract.ref,
    reference: receiptToAdd.def.ref,
    date: receiptToAdd.def.date,
    nature: receiptToAdd.def.nature,
    user: receiptToAdd.def.user.username,
    pos: receiptToAdd.def.user.pos,
    fromDate: receiptToAdd.def.fromDate,
    toDate: receiptToAdd.def.toDate,
    subscriberName: receiptToAdd.subscriber.name,
    total: receiptToAdd.summary.total,
    totalCommission: receiptToAdd.summary.commission,
    due: receiptToAdd.recovery.due,
    toAffect: receiptToAdd.summary.total,
    commissionAffected: commissionAffected,
    commissionToPay: commissionToPay,
    toPay: toPay,
    debit: {
      reference: receiptToAdd.payment.debit[0].reference,
      date: receiptToAdd.payment.debit[0].date
    },
    isNotDeletable: true
  });
}
exports.getListOfDebitRecs = function getListOfDebitRecs() {
  var refDate = moment()
    .add(-5, 'days')
    .format('YYYY-MM-DD');
  mongo.getFinanceReceiptCol()
    .aggregate([{
      $match: {
        'payment.mode': {
          $eq: 'debit'
        },
        'payment.status': 'sent',
        'def.fromDate': {
          $lte: refDate
        },
        'recovery.due': {
          $ne: 0
        }
      }
    }, {
      $group: {
        _id: '$def.user.pos.code',
        recs: {
          $push: '$$ROOT'
        }
      }
    }], function (err, recsByPos) {
      if (err) {
        console.log(err);
      }
      else {
        for (var line in recsByPos) {
          var listRecs = [];
          for (var i in recsByPos[line].recs) {
            addReceiptToArray(listRecs, recsByPos[line].recs[i]);
            if (parseInt(i) + 1 === recsByPos[line].recs.length) {
              calculatePaymentDetails(listRecs, function (paymentDetails) {
                updatePaymentReceipts(recsByPos[line]._id,
                  paymentDetails, listRecs);
              });
            }
          }
        }
      }
    });
};

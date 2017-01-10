var _ = require('underscore');
var request = require('request');
var mongo = require('../mongo');
var session = require('../logic/session');
var utils = require('../logic/utils');
var seq = require('../logic/seq');
var config = require('../config');
var moment = require('moment');
var json2csv = require('json2csv');
var email = require('../logic/email');

function paymentToJSON(payment) {
  payment.reference = payment.reference;
  payment.creationDate = utils.dateToJSON(payment.creationDate);
  if (payment.closingDate !== null) {
    payment.closingDate = utils.dateToJSON(payment.closingDate);
  }
  payment.status = payment.status;
  payment.balance = payment.balance;
  payment.premium.affected = payment.premium.affected;
  payment.nbReceipts = _.size(payment.receipts);
  _.each(payment.settlements, function (settlement) {
    if (settlement.date) {
      settlement.date = utils.dateToJSON(settlement.date);
    }
  });
  return payment;
}

function paymentToJSONForCsv(payment) {
  payment.reference = payment.reference;
  payment.pos = payment.pos.code;
  payment.creationDate = utils.dateToJSON(payment.creationDate);
  if (payment.closingDate !== null) {
    payment.closingDate = utils.dateToJSON(payment.closingDate);
  }
  var status = payment.status;
  payment.status = paymentStatus(status);
  payment.nbReceipts = _.size(payment.receipts);
  payment.affected = utils.formatNumber(payment.premium.affected);
  payment.commission = utils.formatNumber(payment.premium.commission);
  payment.toPay = payment.premium.toPay;
  payment.ras = payment.premium.ras;
  payment.totalToPay = payment.ras + payment.toPay;
  payment.toPay = utils.formatNumber(payment.premium.toPay);
  payment.ras = utils.formatNumber(payment.premium.ras);
  payment.totalToPay = utils.fixNumber(payment.totalToPay, 3);
  payment.totalToPay = utils.formatNumber(payment.totalToPay);
  payment.paid = utils.formatNumber(payment.premium.paid);
  payment.balance = utils.formatNumber(payment.balance);
  payment.commissionToPay = utils.formatNumber(payment.premium.commissionToPay);
}

function preparedStatus() {
  return 0;
}

function submittedStatus() {
  return 1;
}

function approvedStatus() {
  return 2;
}

function delayedStatus() {
  return 3;
}

function rejectedStatus() {
  return 4;
}

function errorStatus() {
  return 5;
}

function paymentStatus(status) {
  var result;
  switch (status) {
  case 0:
    result = 'Brouillon';
    break;
  case 1:
    result = 'Clôturé';
    break;
  case 2:
    result = 'Accepté';
    break;
  case 3:
    result = 'En instance';
    break;
  case 4:
    result = 'Rejeté';
    break;
  default:
    result = status;
  }
  return result;
}

function clearReceipt(receipt) {
  delete(receipt.fromDate);
  delete(receipt.date);
  delete(receipt.nature);
  delete(receipt.user);
  delete(receipt.endorsement);
  delete(receipt.payments);
  delete(receipt.fromDate);
  delete(receipt.toDate);
  delete(receipt.pos);
  delete(receipt.insuranceCertificate);
  return (receipt);
}

function clearSettlement(settlement) {
  if (settlement.mode !== 2 && settlement.mode !== 3) {
    delete(settlement.date);
  }
  if (settlement.mode === 1) {
    delete(settlement.bank);
    delete(settlement.date);
  }
  delete(settlement.payments);
  return (settlement);
}

function checkSettlementsAmount(payment) {
  var settlements = payment.get('settlements');
  _.each(settlements, function (settlement) {
    var settlementAmount = settlement.amount;
    var receiptsAmount = 0;
    var receipts = settlement.receipts;
    _.each(receipts, function (receipt) {
      receiptsAmount += receipt.toPay;
    });
    if (receiptsAmount > settlementAmount) {
      return false;
    }
    else {
      return true;
    }
  });
  return true;
}

function checkPaymentSettlements(payment) {
  var settlements = payment.get('settlements');
  var toPay = payment.get('toPay');
  var settlementToPay = 0;
  _.each(settlements, function (settlement) {
    settlementToPay += settlement.amount;
  });
  if (Math.round(1000 * settlementToPay) === Math.round(1000 * toPay)) {
    return true;
  }
  else {
    return false;
  }
}

function payReceipt(reference, toPay, due, paymentReference, callback) {
  due = utils.fixNumber(due, 3);
  toPay = utils.fixNumber(toPay, 3);
  mongo.getFinanceReceiptCol()
    .update({
      'def.ref': reference
    }, {
      $set: {
        'recovery.due': due
      },
      $push: {
        'recovery.parts': {
          'reference': paymentReference,
          'amount': toPay,
          'date': moment()
            .startOf('day')
            .toDate()
        }
      }
    }, function (err) {
      if (err) {
        // update the payment status to error
        mongo.getFinancePaymentCol()
          .update({
            reference: paymentReference
          }, {
            $set: {
              status: errorStatus()
            }
          }, function (error) {
            if (error) {
              callback(error);
            }
            else {
              callback(null, reference);
            }
          });
      }
    });
}

function create(req, res) {
  var pos = req.session.user.pos;
  if (pos) {
    seq.generateRef('payment', function (err, reference) {
      if (err) {
        res.send(500, err);
      }
      else {
        mongo.getFinancePaymentCol()
          .insert({
            status: preparedStatus(),
            reference: reference,
            pos: pos,
            creationDate: moment()
              .startOf('day')
              .toDate(),
            closingDate: null,
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
          }, function (err, payments) {
            if (err) {
              res.send(500, err);
            }
            else {
              res.send({
                payment: payments[0]
              });
            }
          });
      }
    });
  }
  else {
    res.send(500, 'no point of sale');
  }
}

function current(req, res) {
  var pos = req.session.user.pos;
  if (pos) {
    mongo.getFinancePaymentCol()
      .findOne({
        'pos.code': pos.code,
        status: 0
      }, function (err, payment) {
        if (err) {
          res.send(500, err);
        }
        res.send({
          payment: payment
        });
      });
  }
  else {
    res.send(500, 'no point of sale');
  }
}

function _save(req, callback) {
  var payment = req.body.payment;
  var postponedReceipts = req.body.postponedReceipts;
  payment = utils.fixNumberInObject(payment, 3);
  var settlements = payment.settlements;
  _.each(settlements, function (settlement) {
    settlement = clearSettlement(settlement);
  });
  var fields = {
    balance: payment.balance,
    premium: payment.premium,
    receipts: payment.receipts,
    settlements: payment.settlements
  };
  mongo.getFinancePaymentCol()
    .update({
      reference: payment.reference,
      status: payment.status
    }, {
      $set: fields
    }, function (err, payment) {
      if (err) {
        callback(err);
      }
      else {
        for (var i in postponedReceipts) {
          _autoPostpone(payment.reference, postponedReceipts[i], req.body.payment
            .pos.code);
          req.body.postponedReceipts = [];
        }
        callback(null, payment);
      }
    });
}

function save(req, res) {
  _save(req, function (err) {
    if (err) {
      res.send(500, err);
    }
    else {
      res.json(null);
    }
  });
}

function _sendEmail(params, cb) {
  mongo.getEmailCol()
    .findOne({
      name: 'sendExemptionDetails'
    }, function (err, eml) {
      if (err) {
        cb(err);
      }
      else {
        var mel = {
          from: eml.from,
          to: eml.to,
          replyTo: eml.replyTo,
          subject: 'Code || ' + params.code + eml.subject + params.reference,
          text: eml.content.beginMaiMsg + eml.environment.url + params.url +
            eml.content.detailsExemption + params.details + eml.content.receiptsList +
            params.receiptsList + eml.content.managementUrl + eml.environment
            .url + params.managementUrl + eml.content.endMaiMsg
        };
        cb(null, mel);
      }
    });
}

function sendExemption(req, res) {
  var payment = req.body.payment;
  var pos = req.session.user.pos;
  var fullName = req.session.user.fullName;
  var email = req.session.user.email;
  var receiptsList = req.body.receiptsList;
  var refFc = payment.reference;
  var msg = req.body.msg;
  var newReceiptsList = [];
  _.each(receiptsList, function (receipt) {
    if (receipt.reviewDate !== null) {
      receipt.reviewDate = moment(receipt.reviewDate)
        .format('YYYY-MM-DD');
      newReceiptsList.push(receipt);
    }
  });
  if (pos) {
    seq.generateRef('exemption', function (err, reference) {
      if (err) {
        res.send(500, err);
      }
      else {
        mongo.getExemptionCol()
          .insert({
            def: {
              ref: reference,
              object: 'Demande de dérogation -- Feuille de Caisse',
              status: 0, //{{{ 0: non traité, 1: accepté, 2: rejeté}}}
              type: 1, //{{{ 0: Auto, 1: FC }}}
              creationDate: moment()
                .startOf('day')
                .format('YYYY-MM-DD'),
              closingDate: null,
              closingUser: null,
              user: {
                pos: pos,
                email: email,
                fullName: fullName
              }
            },
            request: {
              msg: msg,
              reference: refFc,
              receiptsList: newReceiptsList
            },
            actions: {
              comments: null,
              actsList: []
            }
          }, function (err) {
            if (err) {
              res.send(500, err);
            }
            else {
              _sendExemption(reference, req, function (error) {
                if (error) {
                  res.send(500, error);
                }
                else {
                  res.send({
                    payment: payment,
                    reference: reference
                  });
                }
              });
            }
          });
      }
    });
  }
  else {
    res.send(500, 'error');
  }
}

function _sendExemption(reference, req, res) {
  var url = '';
  var managementUrl = '';
  url = 'admin#payment/' + req.body.payment.reference + '/consult';
  managementUrl = 'admin#exemption/' + reference + '/manage';
  var receiptsList = '\n\n';
  _.each(req.body.receiptsList, function (item) {
    receiptsList += item.receiptRef + '\t\t\t\t\t\t' + utils.dateToJSON(
      item.reviewDate) + '\t\t\t' + '\n\n';
  });
  var params = {
    details: req.body.msg,
    url: url,
    receiptsList: receiptsList,
    code: req.session.user.pos.code,
    reference: req.body.payment.reference,
    managementUrl: managementUrl
  };
  _sendEmail(params, function (err, mel) {
    if (err) {
      res.send(500, err);
    }
    email.send(mel, res);
  });
}

function finalize(req, res) {
  _save(req, function (err) {
    if (err) {
      res.send(500, err);
    }
    else {
      var payment = req.body.payment;
      payment = utils.fixNumberInObject(payment, 3);
      var fullName = req.session.user.fullName;
      if (checkPaymentSettlements && checkSettlementsAmount) {
        checkReceiptsAmountsToPay(req.body.payment, req.session.user.pos.code,
          function (data) {
            if (data.authorized) {
              if (payment.status === preparedStatus()) {
                payment.status = submittedStatus();
                var receipts = payment.receipts;
                _.each(receipts, function (receipt) {
                  receipt.due = receipt.due - receipt.toAffect;
                  receipt = clearReceipt(receipt);
                });
                var fields = {
                  status: payment.status,
                  closingDate: moment()
                    .startOf('day')
                    .toDate(),
                  closingUser: fullName,
                  receipts: receipts
                };
                mongo.getFinancePaymentCol()
                  .findAndModify({
                    reference: payment.reference,
                    status: 0
                  }, {}, {
                    $set: fields
                  }, {
                    new: false,
                    upsert: false
                  }, function (err, pay) {
                    if (err) {
                      res.send(500, err);
                    }
                    else {
                      if (pay !== null) {
                        var receipts = payment.receipts;
                        _.each(receipts, function (receipt) {
                          receipt = utils.fixNumberInObject(receipt,
                            3);
                          payReceipt(receipt.reference, receipt.toAffect,
                            receipt.due, payment.reference,
                            function (err) {
                              if (err) {
                                res.send(500, err);
                                return;
                              }
                            });
                        });
                        res.json(null);
                      }
                      else {
                        res.json(null);
                      }
                      ///
                      var myPosCollection = mongo.getPosCol();
                      myPosCollection.update({
                        code: req.session.user.pos
                      }, {
                        locked: false
                      }, function (err, res) {
                        if (err) {
                          res.send(500, err);
                        }
                      });
                    }
                  });
              } //
            }
            else {
              res.send(500, {
                error: data.message
              });
            }
          });
      }
      else {
        res.send(500, {
          error: 'Règlement pas OK'
        });
      }
    }
  });
}

function print(req, res) {
  var payment = req.body.payment;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  // print the doc
  request({
    url: 'http://' + printsrv + ':' + printprt + '/accounting/fdc',
    method: 'POST',
    json: payment
  }, function (err, result, body) {
    if (err) {
      res.send(500, JSON.stringify(err));
    }
    mongo.getFinancePaymentCol()
      .update({
        reference: payment.reference
      }, {
        $set: {
          'pdfId': body.id
        }
      }, function (err) {
        if (err) {
          res.send(500, err);
        }
        else {
          res.send(200, JSON.stringify(body));
        }
      });
  });
}

function buildQuery(criteria, admin, pos) {
  var query = {};
  if (!admin) {
    query['pos.code'] = pos.code;
  }
  if ((criteria.pos) && (criteria.pos !== '')) {
    var posCriteria = criteria.pos;
    query['pos.code'] = posCriteria;
  }
  if ((criteria.includeDraft === false) && admin) {
    query.status = {
      $ne: 0
    };
  }
  if ((criteria.settlementReference) && (criteria.settlementReference !== '')) {
    query.settlements = {
      $elemMatch: {
        'reference': criteria.settlementReference
      }
    };
  }
  if ((criteria.status) && (criteria.status !== '')) {
    var status = parseInt(criteria.status);
    query.status = status;
  }
  if ((criteria.reference) && (criteria.reference !== null)) {
    criteria.reference = parseInt(criteria.reference);
    query.reference = criteria.reference;
  }
  if (criteria.fromCreationDate && criteria.fromCreationDate !== null &&
    criteria.toCreationDate && criteria.toCreationDate !== null) {
    query.creationDate = {
      $gte: moment(utils.dateToJSON(criteria.fromCreationDate))
        .toDate(),
      $lte: moment(utils.dateToJSON(criteria.toCreationDate))
        .toDate()
    };
  }
  else if (criteria.fromCreationDate && criteria.fromCreationDate !== null) {
    query.creationDate = {
      $gte: moment(utils.dateToJSON(criteria.fromCreationDate))
        .toDate()
    };
  }
  else if (criteria.toCreationDate && criteria.toCreationDate !== null) {
    query.creationDate = {
      $lte: moment(utils.dateToJSON(criteria.toCreationDate))
        .toDate()
    };
  }
  if (criteria.fromClosingDate && criteria.fromClosingDate !== null && criteria
    .toClosingDate && criteria.toClosingDate !== null) {
    query.closingDate = {
      $gte: moment(utils.dateToJSON(criteria.fromClosingDate))
        .toDate(),
      $lte: moment(utils.dateToJSON(criteria.toClosingDate))
        .toDate()
    };
  }
  else if (criteria.fromClosingDate && criteria.fromClosingDate !== null) {
    query.closingDate = {
      $gte: moment(utils.dateToJSON(criteria.fromClosingDate))
        .toDate()
    };
  }
  else if (criteria.toClosingDate && criteria.toClosingDate !== null) {
    query.closingDate = {
      $lte: moment(utils.dateToJSON(criteria.toClosingDate))
        .toDate()
    };
  }
  if (criteria.nonZeroBalance) {
    query.balance = {
      $ne: 0
    };
  }
  return query;
}

function _paymentSearch(req, admin, callback) {
  var criteria;
  if (req.method === 'POST') {
    criteria = req.body.criteria;
  }
  else {
    criteria = req.query;
    if (criteria.includeDraft) {
      criteria.includeDraft = JSON.parse(criteria.includeDraft);
    }
  }
  var query = {};
  var pos = req.session.user.pos;
  query = buildQuery(criteria, admin, pos);
  var cursor = mongo.getFinancePaymentCol()
    .find(query)
    .sort('reference', -1);
  callback(null, cursor);
}

function search(req, res) {
  var admin = false;
  var exp = new RegExp('admin' + '$');
  if (req.headers.referer.search(exp) > 0) {
    admin = req.session.user.admin;
  }
  _paymentSearch(req, admin, function (err, cursor) {
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
      }
      else {
        res.send(_.map(results, paymentToJSON));
      }
    });
  });
}

function adminSearch(req, res) {
  var admin = req.session.user.admin;
  _paymentSearch(req, admin, function (err, cursor) {
    var payback = req.body.payback;
    if (err) {
      res.send(500, err);
    }
    else {
      var result = [];
      if (payback && payback !== null) {
        var payments = payback.payments;
        var existings = _.pluck(payments, 'reference');
        var error;
        cursor.each(function (err, payment) {
          if (err) {
            error = err;
          }
          else {
            if (payment) {
              if (!_.contains(existings, payment.reference)) {
                result.push(paymentToJSON(payment));
              }
            }
            else {
              if (error) {
                res.send(500, {
                  err: error
                });
              }
              else {
                res.send(result);
              }
            }
          }
        });
      }
      else {
        cursor.toArray(function (err, results) {
          if (err) {
            res.send(500, err);
          }
          else {
            res.send(_.map(results, paymentToJSON));
          }
        });
      }
    }
  });
}

function validatePayment(req, res) {
  var payment = req.body.payment;
  var reference = payment.reference;
  var comments = payment.comments;
  var fullName = req.session.user.fullName;
  var fields = {
    comments: comments,
    status: approvedStatus(),
    validationUser: fullName,
    validationDate: moment()
      .startOf('day')
      .toDate()
  };
  mongo.getFinancePaymentCol()
    .update({
      reference: reference,
      status: 1
    }, {
      $set: fields
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        res.json(null);
      }
    });
}

function _autoPostpone(paymentRef, recId, posCode, res) {
  var postPonedTo;
  if (posCode.substring(0, 1) === '7') {
    postPonedTo = moment()
      .add(30, 'days')
      .format('YYYY-MM-DD');
  }
  else {
    postPonedTo = moment()
      .add(7, 'days')
      .format('YYYY-MM-DD');
  }
  mongo.getFinanceReceiptCol()
    .update({
      'def.ref': recId
    }, {
      $set: {
        'recovery.postponedTo': postPonedTo,
        autoPostpone: true
      }
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
    });
}

function verifyPostPone(req, res) {
  mongo.getFinanceReceiptCol()
    .findOne({
      'def.ref': req.body.recId
    }, function (err, receipt) {
      if (err) {
        res.send(500, err);
      }
      if (typeof receipt.autoPostpone === 'undefined' || receipt.autoPostpone ===
        null) {
        res.send(false);
      }
      else {
        res.send(receipt.autoPostpone);
      }
    });
}

function postponePayment(req, res) {
  var paymentRef = req.body.paymentReference;
  var exemptionRef = req.body.exemptionRef;
  mongo.getFinancePaymentCol()
    .findOne({
      reference: paymentRef
    }, function (err, payment) {
      if (err) {
        res.send(500, err);
      }
      var newReceiptsList = [];
      var receipts = payment.receipts;
      _.each(receipts, function (receipt) {
        if (receipt._id !== req.body.receipt._id) {
          newReceiptsList.push(receipt);
        }
      });
      mongo.getFinancePaymentCol()
        .update({
          reference: paymentRef
        }, {
          $set: {
            receipts: newReceiptsList
          }
        }, function (err) {
          if (err) {
            res.send(500, err);
          }
          else {
            changeReceiptEffDate(exemptionRef, req, res);
          }
        });
    });
}

function getFinancePaymentByRef(PaymentRef, callback) {
  var query = {};
  query.reference = PaymentRef;
  var myPayments = mongo.getFinancePaymentCol()
    .find(query);
  callback(myPayments);
}

function updateAndSavePayment(req, res) {
  var total = 0;
  var commission = 0;
  var toPay = 0;
  //var ras = 0;
  var affected = 0;
  var due = 0;
  var paid = 0;
  var commissionToPay = 0;
  getFinancePaymentByRef(req.body.paymentReference, function (cursorPayment) {
    cursorPayment.toArray(function (err, resultsFinancePayment) {
      var myPayment = resultsFinancePayment[0];
      var receipts = myPayment.receipts;
      var settlements = myPayment.settlements;
      if (settlements === null) {
        settlements = [];
      }
      _.each(receipts, function (receipt) {
        total += receipt.total;
        commission += receipt.commissionAffected;
        //  ras += receipt.get('ras');
        toPay += receipt.toPay;
        affected += receipt.toAffect;
        due = toPay - affected;
        commissionToPay += receipt.commissionToPay;
      });
      _.each(settlements, function (settlement) {
        paid += settlement.amount;
      });
      // if (rateRas > 0) {
      //   ras = -rateRas * commission;
      // }
      total = utils.fixNumber(total, 3);
      commission = utils.fixNumber(commission, 3);
      //ras = _.fixNumber(ras, 3);
      toPay = utils.fixNumber(toPay, 3);
      affected = utils.fixNumber(affected, 3);
      due = utils.fixNumber(due, 3);
      paid = utils.fixNumber(paid, 3);
      commissionToPay = utils.fixNumber(commissionToPay, 3);
      //save
      // _.each(settlements, function (settlement) {
      //   settlement = clearSettlement(settlement);
      // });
      var fields = {
        balance: myPayment.balance,
        'premium.total': total,
        'premium.commission': commission,
        //premium.set('ras', ras);
        'premium.toPay': toPay,
        'premium.affected': affected,
        'premium.due': due,
        'premium.paid': paid,
        'premium.commissionToPay': commissionToPay,
        settlements: settlements
      };
      mongo.getFinancePaymentCol()
        .update({
          reference: myPayment.reference,
          status: myPayment.status
        }, {
          $set: fields
        }, function (err) {
          if (err) {
            res.send(500, err);
          }
          else {
            res.json(null);
          }
        });
    });
  });
}

function changeReceiptEffDate(exemptionRef, req, res) {
  mongo.getFinanceReceiptCol()
    .update({
      'def.ref': req.body.receipt.reference
    }, {
      $set: {
        'recovery.postponedTo': moment(req.body.receipt.postponedTo)
          .format('YYYY-MM-DD')
      }
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        var fullName = req.session.user.fullName;
        mongo.getExemptionCol()
          .update({
            'def.ref': exemptionRef
          }, {
            $push: {
              'actions.actsList': {
                'act': 'Report quittance N° ' + req.body.receipt.reference,
                'date': moment(req.body.receipt.postponedTo)
                  .format('YYYY-MM-DD'),
                'actDate': moment()
                  .startOf('day')
                  .format('YYYY-MM-DD'),
                'modifiedBy': fullName
              }
            }
          }, function (erro) {
            if (erro) {
              res.send(500, erro);
            }
            else {
              updateAndSavePayment(req, res);
            }
          });
      }
    });
}

function unlockSubscription(req, res) {
  var exemptionRef = req.body.exemptionRef;
  var newLockDate = moment(req.body.payment.newLockDate)
    .format('YYYY-MM-DD');
  mongo.getPosCol()
    .update({
      code: req.body.payment.pos.code
    }, {
      $set: {
        locked: false,
        newLockDate: newLockDate
      }
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        var fullName = req.session.user.fullName;
        mongo.getExemptionCol()
          .update({
            'def.ref': exemptionRef
          }, {
            $push: {
              'actions.actsList': {
                'act': 'Blocage Souscription ',
                'date': moment(req.body.payment.newLockDate)
                  .format('YYYY-MM-DD'),
                'actDate': moment()
                  .startOf('day')
                  .format('YYYY-MM-DD'),
                'modifiedBy': fullName
              }
            }
          }, function (erro) {
            if (erro) {
              res.send(500, erro);
            }
            else {
              res.json(null);
            }
          });
      }
    });
}

function delayPayment(req, res) {
  var payment = req.body.payment;
  var reference = payment.reference;
  var comments = payment.comments;
  var fullName = req.session.user.fullName;
  var fields = {
    comments: comments,
    status: delayedStatus(),
    delayingUser: fullName,
    delayingDate: moment()
      .startOf('day')
      .toDate()
  };
  mongo.getFinancePaymentCol()
    .update({
      reference: reference,
      status: 1
    }, {
      $set: fields
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        res.json(null);
      }
    });
}

function reverseValidate(req, res) {
  var payment = req.body.payment;
  var reference = payment.reference;
  var comments = payment.comments;
  var fullName = req.session.user.fullName;
  var fields = {
    comments: comments,
    status: submittedStatus(),
    reversingUser: fullName,
    reversingDate: moment()
      .startOf('day')
      .toDate()
  };
  mongo.getFinancePaymentCol()
    .update({
      reference: reference,
      status: 2
    }, {
      $set: fields
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        res.json(null);
      }
    });
}

function updateDebitStatus(reference, callback) {
  mongo.getFinanceReceiptCol()
    .update({
      'def.ref': reference
    }, {
      $set: {
        'payment.status': 'sent'
      }
    }, function (err) {
      if (err) {
        callback(err);
      }
      else {
        callback(null, reference);
      }
    });
}

function regainPaidReceipt(reference, toPay, paymentReference, callback) {
  mongo.getFinanceReceiptCol()
    .update({
      'def.ref': reference
    }, {
      $inc: {
        'recovery.due': +toPay
      },
      $pull: {
        'recovery.parts': {
          'reference': paymentReference,
          'amount': toPay
        }
      }
    }, function (err) {
      if (err) {
        // update the payment status to error
        mongo.getFinancePaymentCol()
          .update({
            reference: paymentReference
          }, {
            $set: {
              status: errorStatus()
            }
          }, function (error) {
            if (error) {
              callback(error);
            }
            else {
              callback(null, reference);
            }
          });
      }
      else {
        callback(null, reference);
      }
    });
}

function rejectPayment(req, res) {
  var payment = req.body.payment;
  var reference = payment.reference;
  var comments = payment.comments;
  var fullName = req.session.user.fullName;
  var fields = {
    comments: comments,
    status: rejectedStatus(),
    rejectionUser: fullName,
    rejectionDate: moment()
      .startOf('day')
      .toDate()
  };
  mongo.getFinancePaymentCol()
    .findAndModify({
      reference: reference,
      status: 1
    }, {}, {
      $set: fields
    }, {
      new: false,
      upsert: false
    }, function (err, doc) {
      if (err) {
        res.send(500, err);
      }
      else {
        if (doc) {
          var receipts = payment.receipts;
          _.each(receipts, function (receipt) {
            if (payment.closingUser === 'Debit-Payment-Batch') {
              updateDebitStatus(receipt.reference, function (err) {
                if (err) {
                  res.send(500, err);
                  return;
                }
              });
            }
            regainPaidReceipt(receipt.reference, receipt.toAffect,
              payment.reference,
              function (err) {
                if (err) {
                  res.send(500, err);
                  return;
                }
              });
          });
          res.json(null);
        }
        else {
          res.json(null);
        }
      }
    });
}

function adminFinalizePayment(req, res) {
  _save(req, function (err) {
    if (err) {
      res.send(500, err);
    }
    else {
      var payment = req.body.payment;
      payment = utils.fixNumberInObject(payment, 3);
      if (payment.status === preparedStatus()) {
        payment.status = submittedStatus();
        var receipts = payment.receipts;
        var fullName = req.session.user.fullName;
        _.each(receipts, function (receipt) {
          receipt.due = receipt.due - receipt.toAffect;
          receipt = clearReceipt(receipt);
        });
        var fields = {
          status: payment.status,
          closingDate: moment()
            .startOf('day')
            .toDate(),
          comments: payment.comments,
          closingUser: fullName,
          receipts: receipts
        };
        mongo.getFinancePaymentCol()
          .update({
            reference: payment.reference,
            status: 0
          }, {
            $set: fields
          }, function (err) {
            if (err) {
              res.send(500, err);
            }
            else {
              var receipts = payment.receipts;
              _.each(receipts, function (receipt) {
                receipt = utils.fixNumberInObject(receipt, 3);
                payReceipt(receipt.reference, receipt.toAffect,
                  receipt.due, payment.reference,
                  function (err) {
                    if (err) {
                      res.send(500, err);
                      return;
                    }
                  });
              });
              res.json(null);
            }
          });
      }
    }
  });
}

function exportPaymentResult(req, res) {
  var admin = req.session.user.admin;
  _paymentSearch(req, admin, function (err, cursor) {
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
      }
      else {
        _.map(results, paymentToJSONForCsv);
        json2csv({
          data: results,
          fields: ['reference', 'pos', 'creationDate',
            'closingDate', 'status', 'nbReceipts', 'affected',
            'commission', 'toPay', 'ras', 'totalToPay', 'paid',
            'balance', 'commissionToPay'
          ],
          fieldNames: ['Référence', 'Intermédiaire',
            'Date création', 'Date clôture', 'Statut',
            'Nbre. quittances', 'Prime payée', 'Com. cédée',
            'Net à payer', 'RAS', 'Tot. à régler', 'Tot. réglé',
            'Solde FC', 'Solde Com.'
          ],
          del: '\t'
        }, function (err, csv) {
          if (err) {
            res.send(500, err);
            return;
          }
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition',
            'attachment; filename=FeuillesDeCaisse.csv');
          res.send(csv);
        });
      }
    });
  });
}

function getPaymentConfigs(paymentConfig, callback) {
  var config = {};
  _.each(paymentConfig.params, function (param) {
    switch (param.name) {
    case 'partialPaymentLimit':
      config.limit = param.value;
      break;
    case 'partialPaymentMinPercent':
      config.minPercent = param.value;
      break;
    case 'partialPaymentNonAffectedProfiles':
      config.nonAffectedProfiles = param.value;
      config.exceptedPos = param.exception;
      break;
    }
  });
  callback(config);
}

function getPaymentRules(rule, callback) {
  mongo.getUtilsCol()
    .findOne({
      'def.ref': rule
    }, function (err, paymentConfig) {
      if (err) {
        callback(err);
      }
      else {
        callback(null, paymentConfig);
      }
    });
}

function verifyPartialAmount(rec, posCode, config, authorized, callback) {
  if (rec.toAffect > rec.due) {
    callback({
      authorized: false,
      message: 'Le montant saisi "' + rec.toAffect +
        '" est supérier au montant à régler "' + rec.due + '" !'
    });
  }
  else {
    if (rec.toAffect === rec.due) {
      callback({
        authorized: true
      });
    }
    else {
      if (!_.contains(config.nonAffectedProfiles, posCode.substring(0, 1)) &&
        posCode !== config.exceptedPos) {
        if (rec.total >= config.limit) {
          if (rec.toAffect <= rec.total * config.minPercent) {
            if (rec.toAffect < rec.due) {
              callback({
                authorized: false,
                message: 'Le montant à reglér est inférieur à la valeur minimale autorisée!'
              });
            }
            else {
              callback({
                authorized: true
              });
            }
          }
        }
        else {
          if (rec.toAffect < rec.due) {
            callback({
              authorized: false,
              message: 'Le paiement partiel pour un montant total ne dépassant pas ' +
                config.limit + ' DT n\'est pas autorisé!'
            });
          }
        }
      }
      else {
        callback({
          authorized: true
        });
      }
    }
  }
}

function checkReceiptsAmountsToPay(payment, posCode, callcack) {
  getPaymentRules('paymentRules', function (err, paymentConfig) {
    getPaymentConfigs(paymentConfig, function (config) {
      var check = {};
      check.authorized = true;
      check.message = '';
      var receipts = payment.receipts;
      if (receipts.length > 0) {
        _.each(receipts, function (receipt) {
          verifyPartialAmount(receipt, posCode, config, check.authorized,
            function (checkRules) {
              if (!checkRules.authorized) {
                check.authorized = false;
                check.message = checkRules.message;
              }
            });
        });
      }
      else {
        check.authorized = true;
      }
      callcack(check);
    });
  });
}
exports.declare = function (app) {
  app.post('/svc/payment/current', session.ensureAuth, session.ensurePosAdmin,
    current);
  app.post('/svc/payment/create', session.ensureAuth, session.ensurePosAdmin,
    create);
  app.post('/svc/payment/save', session.ensureAuth, session.ensurePosAdmin,
    save);
  app.post('/svc/payment/search', session.ensureAuth, session.ensurePosAdminOrAdmin,
    search);
  app.post('/svc/payment/finalize', session.ensureAuth, session.ensurePosAdmin,
    finalize);
  app.post('/svc/payment/print', session.ensureAuth, session.ensurePosAdminOrAdmin,
    print);
  app.post('/svc/payment/adminPaymentSearch', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, adminSearch);
  app.post('/svc/payment/finalizePayment', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, adminFinalizePayment);
  app.post('/svc/payment/validatePayment', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, validatePayment);
  app.post('/svc/payment/delayPayment', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, delayPayment);
  app.post('/svc/payment/rejectPayment', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, rejectPayment);
  app.post('/svc/payment/reverseValidatePayment', session.ensureAuth, session
    .ensureAdmin, session.ensureInternal, reverseValidate);
  app.get('/csv/paymentExport', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, exportPaymentResult);
  app.post('/svc/payment/sendExemption', session.ensureAuth, session.ensurePosAdmin,
    sendExemption);
  app.post('/svc/payment/unlockSubscription', session.ensureAuth, session.ensurePosAdmin,
    unlockSubscription);
  app.post('/svc/payment/postponePayment', session.ensureAuth, session.ensurePosAdmin,
    postponePayment);
  app.post('/svc/payment/verifyPostPone', session.ensureAuth, session.ensurePosAdmin,
    verifyPostPone);
};

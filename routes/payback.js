var _ = require('underscore');
var request = require('request');
var mongo = require('../mongo');
var session = require('../logic/session');
var utils = require('../logic/utils');
var seq = require('../logic/seq');
var config = require('../config');
var moment = require('moment');

function preparedStatus() {
  return 0;
}

function submittedStatus() {
  return 1;
}

function errorStatus() {
  return 5;
}

function liquidatedStatus() {
  return 6;
}

function paybackToJSON(payback) {
  payback.reference = payback.reference;
  payback.creationDate = utils.dateToJSON(payback.creationDate);
  if (payback.closingDate !== null) {
    payback.closingDate = utils.dateToJSON(payback.closingDate);
  }
  payback.status = payback.status;
  payback.premium.commissionToPay = payback.premium.commissionToPay;
  payback.premium.paid = payback.premium.paid;
  payback.nbPayments = _.size(payback.payments);
  _.each(payback.settlements, function (settlement) {
    settlement.date = utils.dateToJSON(settlement.date);
    if (settlement.date) {
      settlement.date = utils.dateToJSON(settlement.date);
    }
  });
  return payback;
}

function clearPayment(payment) {
  delete(payment._id);
  delete(payment.settlements);
  delete(payment.receipts);
  delete(payment.comments);
  delete(payment.status);
  delete(payment.pdfId);
  delete(payment.premium.affected);
  delete(payment.premium.due);
  delete(payment.premium.total);
  delete(payment.validationUser);
  delete(payment.validationdate);
  return (payment);
}

function clearSettlement(settlement) {
  if (settlement.mode !== 0 && settlement.mode !== 2 && settlement.mode !== 3) {
    delete(settlement.date);
  }
  if (settlement.mode === 1) {
    delete(settlement.bank);
  }
  delete(settlement.receipts);
  return (settlement);
}

function paybackCreate(req, res) {
  seq.generateRef('payback', function (err, reference) {
    if (err) {
      res.send(500, err);
    }
    else {
      mongo.getFinancePaybackCol()
        .insert({
          status: preparedStatus(),
          reference: reference,
          creationDate: moment()
            .startOf('day')
            .toDate(),
          closingDate: null,
          premium: {
            commissionToPay: 0,
            ras: 0,
            toPay: 0,
            paid: 0
          },
          payments: []
        }, function (err, paybacks) {
          if (err) {
            res.send(500, err);
          }
          else {
            res.send({
              payback: paybacks[0]
            });
          }
        });
    }
  });
}

function paybackSearch(req, res) {
  var query = {};
  var criteria = req.body.criteria;
  if ((criteria.status) && (criteria.status !== '')) {
    var status = parseInt(criteria.status);
    query.status = status;
  }
  if ((criteria.pos) && (criteria.pos !== '')) {
    var posCriteria = criteria.pos;
    query.pos = posCriteria;
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
  if ((criteria.settlementReference) && (criteria.settlementReference !== '')) {
    query.settlements = {
      $elemMatch: {
        'reference': criteria.settlementReference
      }
    };
  }
  var cursor = mongo.getFinancePaybackCol()
    .find(query)
    .sort('reference', -1);
  cursor.toArray(function (err, results) {
    if (err) {
      res.send(500, err);
    }
    else {
      res.send(_.map(results, paybackToJSON));
    }
  });
}

function getPaymentForLiquidation(reference, cb) {
  var query = {
    reference: reference,
    status: {
      $eq: 6
    }
  };
  mongo.getFinancePaymentCol()
    .findOne(query, function (err, result) {
      if (err) {
        cb(err);
      }
      else {
        if (result) {
          // true
          cb(null, 0);
        }
        else {
          //false
          cb(null, 1);
        }
      }
    });
}

function checkPayments(payments, callback) {
  var paymentRef;
  var checkOK = 1;
  var i = 0;
  var size = _.size(payments);
  _.each(payments, function (payment) {
    paymentRef = payment.reference;
    getPaymentForLiquidation(paymentRef, function (err, result) {
      if (!err) {
        checkOK = checkOK * result;
      }
      else {
        callback(err);
      }
      i++;
      if (i === size) {
        if (checkOK === 0) {
          callback(null, false);
        }
        else {
          callback(null, true);
        }
      }
    });
  });
  if (size === 0) {
    callback(null, true);
  }
}

function _paybackSave(req, callback) {
  var payback = req.body.payback;
  payback = utils.fixNumberInObject(payback, 3);
  var payments = payback.payments;
  _.each(payments, function (payment) {
    payment = clearPayment(payment);
  });
  var settlements = payback.settlements;
  _.each(settlements, function (settlement) {
    settlement = clearSettlement(settlement);
  });
  var fields = {
    balance: payback.balance,
    paymentBalance: payback.paymentBalance,
    premium: payback.premium,
    payments: payback.payments,
    settlements: payback.settlements,
    pos: payback.pos
  };
  mongo.getFinancePaybackCol()
    .update({
      reference: payback.reference
    }, {
      $set: fields
    }, function (err, payback) {
      if (err) {
        callback(err);
      }
      else {
        callback(null, payback);
      }
    });
}

function paybackSave(req, res) {
  var payments = req.body.payback.payments;
  checkPayments(payments, function (err, result) {
    if (err) {
      res.send(500, err);
    }
    else {
      if (result === false) {
        res.send(200, false);
      }
      else {
        _paybackSave(req, function (err) {
          if (err) {
            res.send(500, err);
          }
          else {
            res.send(200, true);
          }
        });
      }
    }
  });
}

function liquidatePayment(paybackRef, paymentRef, amount, callback) {
  mongo.getFinancePaymentCol()
    .update({
      reference: paymentRef,
      status: 2
    }, {
      $set: {
        status: liquidatedStatus()
      },
      $push: {
        parts: {
          reference: paybackRef,
          date: moment()
            .startOf('day')
            .toDate(),
          amount: amount
        }
      }
    }, function (err) {
      if (err) {
        // update the payback status to error
        mongo.getFinancePaybackCol()
          .update({
            reference: paybackRef
          }, {
            $set: {
              status: errorStatus()
            }
          }, function (error) {
            if (error) {
              callback(error);
            }
            else {
              callback(null, paybackRef);
            }
          });
      }
    });
}

function checkPaybackSettlements(payback) {
  var settlements = payback.get('settlements');
  var toPay = payback.get('toPay');
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

function paybackFinalize(req, res) {
  var fullName = req.session.user.fullName;
  var payback = req.body.payback;
  var payments = payback.payments;
  checkPayments(payments, function (err, result) {
    if (err) {
      res.send(500, err);
    }
    else {
      if (result === false) {
        res.send(200, false);
      }
      else {
        _paybackSave(req, function (err) {
          if (err) {
            res.send(500, err);
          }
          else {
            var fields = {
              status: submittedStatus(),
              closingDate: moment()
                .startOf('day')
                .toDate(),
              closingUser: fullName
            };
            //cloturer
            if (checkPaybackSettlements) {
              mongo.getFinancePaybackCol()
                .findAndModify({
                  reference: payback.reference,
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
                      _.each(payments, function (payment) {
                        liquidatePayment(payback.reference,
                          payment.reference, payment.premium.commissionToPay,
                          function (err) {
                            if (err) {
                              res.send(500, err);
                              return;
                            }
                          });
                      });
                      res.send(200, true);
                    }
                    else {
                      res.send(200, true);
                    }
                  }
                });
            }
          }
        });
      }
    }
  });
}

function print(req, res) {
  var payback = req.body.payback;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  // print the doc
  request({
    url: 'http://' + printsrv + ':' + printprt + '/payback/sheet',
    method: 'POST',
    json: payback
  }, function (err, result, body) {
    if (err) {
      res.send(500, JSON.stringify(err));
    }
    mongo.getFinancePaybackCol()
      .update({
        reference: payback.reference
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
exports.declare = function (app) {
  app.post('/svc/payback/paybackCreate', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, paybackCreate);
  app.post('/svc/payback/paybackSearch', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, paybackSearch);
  app.post('/svc/payback/paybackSave', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, paybackSave);
  app.post('/svc/payback/paybackFinalize', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, paybackFinalize);
  app.post('/svc/payback/print', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, print);
};

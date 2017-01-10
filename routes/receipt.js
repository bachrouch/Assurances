var _ = require('underscore');
var mongo = require('../mongo');
var session = require('../logic/session');
var utils = require('../logic/utils');
var json2csv = require('json2csv');

function receiptToJSON(receipt) {
  if (receipt.def !== null) {
    receipt.reference = receipt.def.ref;
    receipt.date = utils.dateToJSON(receipt.def.date);
    receipt.nature = receipt.def.nature;
    if (receipt.def.user !== null) {
      receipt.user = receipt.def.user.username;
      if (receipt.def.user.pos !== null) {
        receipt.pos = receipt.def.user.pos.code;
      }
    }
    receipt.fromDate = utils.dateToJSON(receipt.def.fromDate);
    receipt.toDate = utils.dateToJSON(receipt.def.toDate);
  }
  if (receipt.contract !== null) {
    receipt.endorsement = receipt.contract.ver;
    receipt.contract = receipt.contract.ref;
  }
  if (receipt.subscriber !== null) {
    receipt.subscriberName = receipt.subscriber.name;
  }
  if (receipt.summary !== null) {
    receipt.total = receipt.summary.total;
    receipt.totalCommission = receipt.summary.commission;
  }
  if (receipt.recovery !== null) {
    receipt.due = receipt.recovery.due;
  }
  receipt.payments = receipt.payments;
  receipt.insuranceCertificate = receipt.insuranceCertificate;
  return receipt;
}

function receiptToJSONForCsv(receipt) {
  if (receipt.def !== null) {
    receipt.reference = receipt.def.ref;
    receipt.date = utils.dateToJSON(receipt.def.date);
    receipt.nature = receipt.def.nature;
    receipt.fromDate = utils.dateToJSON(receipt.def.fromDate);
    receipt.toDate = utils.dateToJSON(receipt.def.toDate);
    if ((receipt.def.user !== null) && (receipt.def.user.pos !== null)) {
      receipt.pos = receipt.def.user.pos.code;
    }
  }
  if (receipt.contract !== null) {
    receipt.contract = receipt.contract.ref;
  }
  if (receipt.subscriber !== null) {
    receipt.subscriberName = receipt.subscriber.name;
  }
  if (receipt.summary !== null) {
    receipt.total = utils.formatNumber(receipt.summary.total);
    receipt.totalCommission = utils.formatNumber(receipt.summary.commission);
  }
  if (receipt.recovery !== null) {
    receipt.due = utils.formatNumber(receipt.recovery.due);
  }
  receipt.insuranceCertificate = receipt.insuranceCertificate;
  return receipt;
}

function buildQuery(criteria, all) {
  var query = {};
  if (!criteria.includeCancelled) {
    query = {
      $and: [{
        'def.nature': {
          $ne: 'RT'
        }
      }, {
        'def.nature': {
          $ne: 'RC'
        }
      }]
    };
  }
  if ((criteria.nonZeroDue) || (!all)) {
    query = {
      'recovery.due': {
        $ne: 0
      },
      $and: [{
        'def.nature': {
          $ne: 'RT'
        }
      }, {
        'def.nature': {
          $ne: 'RC'
        }
      }]
    };
  }
  if (criteria.nature && criteria.nature !== '') {
    query['def.nature'] = criteria.nature;
  }
  if (criteria.pos && criteria.pos !== '') {
    query['def.user.pos.code'] = criteria.pos;
  }
  if (criteria.receiptReference && criteria.receiptReference !== '') {
    criteria.receiptReference = parseInt(criteria.receiptReference);
    query['def.ref'] = parseInt(criteria.receiptReference);
  }
  else {
    query['def.ref'] = {
      $ne: ''
    };
  }
  if (criteria.insuranceCertificate && criteria.insuranceCertificate !== '') {
    query.insuranceCertificate = new RegExp(criteria.insuranceCertificate + '$',
      'i');
  }
  if (criteria.policyReference && criteria.policyReference !== '') {
    query['contract.ref'] = parseInt(criteria.policyReference);
  }
  if (criteria.subscriberName && criteria.subscriberName !== '') {
    query['subscriber.name'] = new RegExp('^' + criteria.subscriberName, 'i');
  }
  if (criteria.fromDate && criteria.fromDate !== null && criteria.toDate &&
    criteria.toDate !== null) {
    query['def.date'] = {
      $gte: utils.dateToJSON(criteria.fromDate),
      $lte: utils.dateToJSON(criteria.toDate)
    };
  }
  else if (criteria.toDate && criteria.toDate !== null) {
    query['def.date'] = {
      $lte: utils.dateToJSON(criteria.toDate)
    };
  }
  else if (criteria.fromDate && criteria.fromDate !== null) {
    query['def.date'] = {
      $gte: utils.dateToJSON(criteria.fromDate)
    };
  }
  if (criteria.effectiveDate && criteria.effectiveDate !== null && criteria.endDate &&
    criteria.endDate !== null) {
    query['def.fromDate'] = {
      $gte: utils.dateToJSON(criteria.effectiveDate),
      $lte: utils.dateToJSON(criteria.endDate)
    };
  }
  else if (criteria.effectiveDate && criteria.effectiveDate !== null) {
    query['def.fromDate'] = {
      $gte: utils.dateToJSON(criteria.effectiveDate)
    };
  }
  else if (criteria.endDate && criteria.endDate !== null) {
    query['def.fromDate'] = {
      $lte: utils.dateToJSON(criteria.endDate)
    };
  }
  query['payment.status'] = {
    $ne: 'rejected'
  };
  query['payment.domiciliation'] = {
    $exists: false
  };
  return query;
}

function _search(req, admin, callback) {
  var criteria;
  var all;
  var pos = req.session.user.pos;
  if (pos) {
    if (req.method === 'POST') {
      criteria = req.body.criteria;
      all = req.body.allReceipts;
    }
    else {
      criteria = req.query;
      all = true;
    }
    if (criteria.nonZeroDue) {
      all = false;
    }
    var query = {};
    query = buildQuery(criteria, all);
    if (!admin) {
      query['def.user.pos.code'] = pos.code;
    }
    var fields = {
      'def.ref': true,
      _id: true,
      'def.date': true,
      'def.fromDate': true,
      'def.toDate': true,
      'def.nature': true,
      'contract.ref': true,
      'contract.ver': true,
      'def.user.username': true,
      'def.user.pos.code': true,
      payments: true,
      insuranceCertificate: true,
      'subscriber.name': true,
      'summary.total': true,
      'summary.commission': true,
      'recovery.due': true
    };
    var collection = mongo.getFinanceReceiptCol();
    var cursor = collection.find(query, fields)
      .sort('def.fromDate', 1);
    callback(null, cursor);
  }
  else {
    callback('no point of sale');
  }
}

function search(req, res) {
  var admin = false;
  var exp = new RegExp('admin' + '$');
  if (req.headers.referer.search(exp) > 0) {
    admin = req.session.user.admin;
  }
  _search(req, admin, function (err, cursor) {
    var payment = req.body.payment;
    if (err) {
      res.send(500, err);
    }
    else {
      var result = [];
      if (payment !== null) {
        var receipts = payment.receipts;
        var existings = _.pluck(receipts, 'reference');
        var error;
        cursor.each(function (err, receipt) {
          if (err) {
            error = err;
          }
          else {
            if (receipt) {
              if (!_.contains(existings, receipt.reference)) {
                result.push(receiptToJSON(receipt));
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
            res.send(_.map(results, receiptToJSON));
          }
        });
      }
    }
  });
}

function adminSearch(req, res) {
  var admin = req.session.user.admin;
  _search(req, admin, function (err, cursor) {
    var payment = req.body.payment;
    if (err) {
      res.send(500, err);
    }
    else {
      var result = [];
      if (payment !== null) {
        var receipts = payment.receipts;
        var existings = _.pluck(receipts, 'reference');
        var error;
        cursor.each(function (err, receipt) {
          if (err) {
            error = err;
          }
          else {
            if (receipt) {
              if (!_.contains(existings, receipt.reference)) {
                result.push(receiptToJSON(receipt));
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
            console.log(err);
            err = 'Veuillez affiner votre recherche!';
            res.send(500, err);
          }
          else {
            res.send(_.map(results, receiptToJSON));
          }
        });
      }
    }
  });
}

function exportResult(req, res) {
  _search(req, false, function (err, cursor) {
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
      }
      else {
        _.map(results, receiptToJSONForCsv);
        json2csv({
          data: results,
          fields: ['reference', 'nature', 'contract',
            'insuranceCertificate', 'subscriberName', 'fromDate',
            'toDate', 'total', 'due', 'totalCommission'
          ],
          fieldNames: ['Quittance', 'Type', 'Contrat', 'Pièce',
            'Souscripteur', 'Date début', 'Date fin', 'TTC',
            'non payé', 'Commission'
          ],
          del: '\t'
        }, function (err, csv) {
          if (err) {
            res.send(500, err);
            return;
          }
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition',
            'attachment; filename=porteFeuille.csv');
          res.send(csv);
        });
      }
    });
  });
}

function exportAdminReceiptResult(req, res) {
  var admin = req.session.user.admin;
  _search(req, admin, function (err, cursor) {
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
      }
      else {
        _.map(results, receiptToJSONForCsv);
        json2csv({
          data: results,
          fields: ['reference', 'pos', 'nature', 'contract',
            'insuranceCertificate', 'subscriberName', 'fromDate',
            'toDate', 'total', 'due', 'totalCommission'
          ],
          fieldNames: ['Quittance', 'Intermédiaire', 'Type',
            'Contrat', 'Pièce', 'Souscripteur', 'Date début',
            'Date fin', 'TTC', 'non payé', 'Commission'
          ],
          del: '\t'
        }, function (err, csv) {
          if (err) {
            res.send(500, err);
            return;
          }
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition',
            'attachment; filename=porteFeuille.csv');
          res.send(csv);
        });
      }
    });
  });
}

function consult(req, res) {
  var id = req.body.id;
  var pos = req.session.user.pos;
  var query = {};
  if (!req.session.user.admin) {
    query['def.user.pos.code'] = pos.code;
  }
  if (id) {
    query['def.ref'] = parseInt(id);
    mongo.getFinanceReceiptCol()
      .findOne(query, function (err, receipt) {
        if (err) {
          res.send(500, err);
        }
        res.send({
          receipt: receiptToJSON(receipt)
        });
      });
  }
  else {
    res.send(500, 'no receipt');
  }
}
exports.declare = function (app) {
  app.post('/svc/receipt/search', session.ensureAuth, session.ensurePosAdmin,
    search);
  app.post('/svc/receipt/consult', session.ensureAuth, session.ensurePosAdminOrAdmin,
    consult);
  app.get('/csv', session.ensureAuth, session.ensurePosAdmin, exportResult);
  app.post('/svc/receipt/adminReceiptSearch', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, adminSearch);
  app.get('/csv/exportAdminReceiptResult', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, exportAdminReceiptResult);
};

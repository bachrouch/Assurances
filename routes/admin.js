/* vim: fdm=marker
 */
var _ = require('underscore');
var fs = require('fs');
var session = require('../logic/session');
var ora = require('./admin-ora');
var utils = require('../logic/utils');
var moment = require('moment');
var mongo = require('../mongo');
var email = require('../logic/email');
var commission = require('../logic/commission');
var async = require('async');
var receipt = require('../logic/receipt');

function termList(req, res) {
  // {{{
  var TermPolicies = [];
  var sPol;
  sPol = {};
  sPol.reference = '14100999999';
  sPol.effectiveDate = '2014-12-05';
  sPol.registrationNumber = '9802TU100';
  sPol.termDate = '2015-06-05';
  sPol.clientName = 'Sami Saddem';
  sPol.premium = 666.666;
  sPol.pos = '100';
  sPol.consultlink = {};
  sPol.consultlink.title = 'Consulter';
  sPol.consultlink.processlink = 'admin#terms/id/' + sPol.reference;
  TermPolicies.push(sPol);
  res.send({
    TermPolicies: TermPolicies
  });
  // }}}
}

function termSearch(req, res) {
  // {{{
  console.log(req.body);
  res.send(500, {
    error: 'Test'
  });
  // }}}
}

function getTerm(req, res) {
  // {{{
  var id = req.body.id;
  if (id === '14100999999') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Semestriel',
        effectiveDate: '2014-01-01',
        termDate: '2015-07-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Sami Saddem',
        subscriberPhone: '71666777',
        subscriberEmail: 'sami.saddem@attakafulia.tn',
        aeDoc: {
          title: 'Avis d\'échéance'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        validated: true
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Sami',
        lastName: 'Saddem',
        phone1: '71666777',
        email1: 'sami.saddem@attakafulia.tn'
      }
    });
  }
  else if (id === '14100888888') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Semestriel',
        effectiveDate: '2014-01-01',
        termDate: '2015-07-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Sami Saddem',
        subscriberPhone: '71666777',
        subscriberEmail: 'sami.saddem@attakafulia.tn',
        aeDoc: {
          title: 'Avis d\'échéance'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        validated: false
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Sami',
        lastName: 'Saddem',
        phone1: '71666777',
        email1: 'sami.saddem@attakafulia.tn'
      }
    });
  }
  else {
    res.send(500, {
      error: 'Pas de police'
    });
  }
  // }}}
}

function removeTerm(req, res) {
  // {{{
  console.log(req.body);
  res.send(500, 'Test');
  // }}}
}

function exemptionToJSON(exemption) {
  exemption.reference = exemption.def.ref;
  exemption.type = exemption.def.type;
  exemption.status = exemption.def.status;
  exemption.pos = exemption.def.user.pos;
  exemption.creator = exemption.def.user.fullName;
  exemption.email = exemption.def.user.email;
  exemption.closingUser = exemption.def.closingUser;
  exemption.creationDate = utils.dateToJSON(exemption.def.creationDate);
  if (exemption.def.closingDate !== null) {
    exemption.closingDate = utils.dateToJSON(exemption.def.closingDate);
  }
  exemption.request = exemption.request;
  exemption.actions = exemption.actions;
  return exemption;
}

function buildQuery(criteria) {
  var query = {};
  if ((criteria.pos) && (criteria.pos !== '')) {
    var posCriteria = criteria.pos;
    query['def.user.pos.code'] = posCriteria;
  }
  if ((criteria.status) && (criteria.status !== '')) {
    var status = parseInt(criteria.status);
    query['def.status'] = status;
  }
  if ((criteria.reference) && (criteria.reference !== null)) {
    query['def.ref'] = parseInt(criteria.reference, 10);
  }
  if ((criteria.type) && (criteria.type !== '')) {
    var type = parseInt(criteria.type, 10);
    query['def.type'] = type;
  }
  if ((criteria.num) && (criteria.num !== '')) {
    var num = parseInt(criteria.num);
    query['request.reference'] = num;
  }
  if (criteria.fromCreationDate && criteria.fromCreationDate !== null &&
    criteria.toCreationDate && criteria.toCreationDate !== null) {
    query['def.creationDate'] = {
      $gte: utils.dateToJSON(criteria.fromCreationDate),
      $lte: utils.dateToJSON(criteria.toCreationDate)
    };
  }
  else if (criteria.fromCreationDate && criteria.fromCreationDate !== null) {
    query['def.creationDate'] = {
      $gte: utils.dateToJSON(criteria.fromCreationDate)
    };
  }
  else if (criteria.toCreationDate && criteria.toCreationDate !== null) {
    query['def.creationDate'] = {
      $lte: utils.dateToJSON(criteria.toCreationDate)
    };
  }
  if (criteria.fromClosingDate && criteria.fromClosingDate !== null && criteria
    .toClosingDate && criteria.toClosingDate !== null) {
    query['def.closingDate'] = {
      $gte: utils.dateToJSON(criteria.fromClosingDate),
      $lte: utils.dateToJSON(criteria.toClosingDate)
    };
  }
  else if (criteria.fromClosingDate && criteria.fromClosingDate !== null) {
    query['def.closingDate'] = {
      $gte: utils.dateToJSON(criteria.fromClosingDate)
    };
  }
  else if (criteria.toClosingDate && criteria.toClosingDate !== null) {
    query['def.closingDate'] = {
      $lte: utils.dateToJSON(criteria.toClosingDate)
    };
  }
  return query;
}

function _exemptionSearch(req, callback) {
  var criteria;
  criteria = req.body.criteria;
  var query = {};
  query = buildQuery(criteria);
  var cursor = mongo.getExemptionCol()
    .find(query)
    .sort('def.ref', -1);
  callback(null, cursor);
}

function search(req, res) {
  _exemptionSearch(req, function (err, cursor) {
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
      }
      else {
        res.send(_.map(results, exemptionToJSON));
      }
    });
  });
}

function rejectedStatus() {
  return 2;
}

function acceptedStatus() {
  return 1;
}

function _sendExemptionResponse(req, res) {
  mongo.getEmailCol()
    .findOne({
      name: 'sendExemptionResponse'
    }, function (err, eml) {
      if (err) {
        res.send(err);
      }
      else {
        mongo.getExemptionCol()
          .findOne({
            'def.ref': req.body.exemption.reference
          }, function (err, exemption) {
            if (err) {
              res.send(err);
            }
            else {
              var response;
              if (exemption.def.status === 1) {
                response = eml.content.acceptedResponse;
              }
              else if (exemption.def.status === 2) {
                response = eml.content.rejectedResponse;
              }
              var reportedReceipts = '\n\n';
              _.each(exemption.actions.actsList, function (item) {
                if (item.act === 'Blocage Souscription ') {
                  reportedReceipts += item.act + '\t\t\t\t\t\t' + utils
                    .dateToJSON(item.date) + '\t\t\t' + '\n\n';
                }
                else {
                  reportedReceipts += item.act + '\t\t\t\t' + utils.dateToJSON(
                    item.date) + '\t\t\t' + '\n\n';
                }
              });
              var receiptsList = '\n\n';
              _.each(exemption.request.receiptsList, function (item) {
                receiptsList += item.receiptRef + '\t\t\t\t\t' + utils.dateToJSON(
                  item.reviewDate) + '\t\t\t' + '\n\n';
              });
              mongo.getPosCol()
                .findOne({
                  code: exemption.def.user.pos.code
                }, function (err, pos) {
                  if (err) {
                    res.send(err);
                  }
                  else {
                    var to = pos.email;
                    var notice = '';
                    var code = '';
                    if ((to === null) || (to === '') || (to === undefined)) {
                      to = eml.cc;
                      notice = eml.content.notice;
                      code = exemption.def.user.pos.code;
                    }
                    var text = eml.content.beginMaiMsg + req.body.exemption
                      .reference + response + eml.content.line + eml.content
                      .detailsRequest + eml.content.line + exemption.request
                      .msg + '\n';
                    if ((exemption.request.receiptsList)
                      .length !== 0) {
                      text += eml.content.receiptsList + receiptsList;
                    }
                    text += eml.content.line + eml.content.response + eml
                      .content.line;
                    if (req.body.exemption.comments !== '') {
                      text += req.body.exemption.comments;
                    }
                    else {
                      text += 'Pas de commentaires\n';
                    }
                    if ((exemption.actions.actsList)
                      .length !== 0) {
                      text += eml.content.detailsResponse +
                        reportedReceipts + eml.content.line;
                    }
                    text += eml.content.endMaiMsg + notice + code;
                    var mel = {
                      from: eml.from,
                      to: to,
                      cc: eml.cc,
                      replyTo: eml.replyTo,
                      subject: 'Code ' + exemption.def.user.pos.code +
                        eml.subject + req.body.exemption.reference +
                        response,
                      text: text
                    };
                    email.send(mel, res);
                  }
                });
            }
          });
      }
    });
}

function acceptExemption(req, res) {
  var exemption = req.body.exemption;
  var reference = exemption.reference;
  var fullName = req.session.user.fullName;
  var comments = exemption.comments;
  var fields = {
    'def.status': acceptedStatus(),
    'def.closingUser': fullName,
    'actions.comments': comments,
    'def.closingDate': moment()
      .startOf('day')
      .format('YYYY-MM-DD')
  };
  mongo.getExemptionCol()
    .findAndModify({
      'def.ref': reference,
      'def.status': 0
    }, {}, {
      $set: fields
    }, {
      new: false,
      upsert: false
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        _sendExemptionResponse(req, function (err) {
          if (err) {
            res.send(500, err);
          }
          else {
            res.json(null);
          }
        });
      }
    });
}

function rejectExemption(req, res) {
  var exemption = req.body.exemption;
  var reference = exemption.reference;
  var fullName = req.session.user.fullName;
  var comments = exemption.comments;
  var fields = {
    'def.status': rejectedStatus(),
    'def.closingUser': fullName,
    'actions.comments': comments,
    'def.closingDate': moment()
      .startOf('day')
      .format('YYYY-MM-DD')
  };
  mongo.getExemptionCol()
    .findAndModify({
      'def.ref': reference,
      'def.status': 0
    }, {}, {
      $set: fields
    }, {
      new: false,
      upsert: false
    }, function (err) {
      if (err) {
        res.send(500, err);
      }
      else {
        _sendExemptionResponse(req, function (err) {
          if (err) {
            res.send(500, err);
          }
          else {
            res.json(null);
          }
        });
      }
    });
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

function _savePayment(req, callback) {
  var payment = req.body.payment;
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
        callback(null, payment);
      }
    });
}

function updateCanceledReceipt(session, paymentRef, receiptRef, comments, cb) {
  mongo.getFinanceReceiptCol()
    .findOne({
      'def.ref': receiptRef
    }, function (err, receipt) {
      if (err) {
        cb(err);
      }
      else {
        if (receipt.recovery.parts.length > 0) {
          var history = {};
          var details = {};
          details.payment = paymentRef;
          details.comments = comments;
          history.user = session.user.fullName;
          history.date = moment()
            .format('YYYY-MM-DD');
          history.time = moment()
            .format('hh:mm:ss');
          history.action = 'cancelReceipt';
          history.details = details;
          for (var i in receipt.recovery.parts) {
            if (receipt.recovery.parts[i].reference === paymentRef) {
              receipt.recovery.due += receipt.recovery.parts[i].amount;
              receipt.recovery.parts.pop(receipt.recovery.parts[i]);
            }
          }
          mongo.getFinanceReceiptCol()
            .update({
              'def.ref': receiptRef
            }, {
              $set: {
                autoPostpone: true,
                recovery: receipt.recovery
              },
              $push: {
                history: history
              }
            }, function (err) {
              if (err) {
                cb(err);
              }
              else {
                cb(null);
              }
            });
        }
      }
    });
}

function commissionCheckAccess(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.commissionAdmin) {
      accessGranted = req.session.user.accessRights.commissionAdmin;
    }
  }
  if (accessGranted) {
    res.json(null);
    return;
  }
  res.send(500, 'Accès refusé');
}

function getPosHistory(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.commissionAdmin) {
      accessGranted = req.session.user.accessRights.commissionAdmin;
    }
  }
  if (!accessGranted) {
    res.send(500, 'Accès refusé');
    return;
  }
  var pos;
  mongo.getPosCol()
    .findOne({
      code: req.body.pos
    }, function (err, dbpos) {
      if (err) {
        res.send(500, err);
        return;
      }
      pos = {};
      pos.code = dbpos.code;
      pos.name = dbpos.name;
      pos.activityStart = null;
      pos.activityEnd = null;
      pos.accreditDate = null;
      pos.transcodedTo = null;
      var profile = dbpos.defaultProfile;
      mongo.getCommissionCol()
        .findOne({
          code: profile
        }, function (err, comm) {
          if (err) {
            res.send(500, err);
            return;
          }
          pos.currentProfile = comm.nameFr;
          _.each(dbpos.history, function (item) {
            if (item.activityStart) {
              pos.activityStart = item.activityStart;
            }
            if (item.activityEnd) {
              pos.activityEnd = item.activityEnd;
            }
            if (item.accreditDate) {
              pos.accreditDate = item.accreditDate;
            }
            if (item.transcodedTo) {
              pos.transcodedTo = item.transcodedTo;
            }
          });
          res.send({
            pos: pos
          });
        });
    });
}

function processCommissionIdentify(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.commissionAdmin) {
      accessGranted = req.session.user.accessRights.commissionAdmin;
    }
  }
  if (!accessGranted) {
    res.send(500, 'Accès refusé');
    return;
  }
  if (fs.existsSync('log.csv')) {
    fs.unlinkSync('log.csv');
  }
  var sRow;
  sRow = 'PDV;N° Quittance;N° Police;Code Produit;Designation Produit;';
  sRow += 'D emission;D effet;D fin;C. Nette;Com Em/Net;Com Ca/Net;';
  sRow += 'Frais;Com Em/Fra;Com Ca/Fra;Impayés;';
  sRow += 'G01 Net;G01 Com/Em;G01 Com/Cal;';
  sRow += 'G02 Net;G02 Com/Em;G02 Com/Cal;G03 Net;G03 Com/Em;G03 Com/Cal;';
  sRow += 'G04 Net;G04 Com/Em;G04 Com/Cal;G06 Net;G06 Com/Em;G06 Com/Cal;';
  sRow += 'G07 Net;G07 Com/Em;G07 Com/Cal;G09 Net;G09 Com/Em;G09 Com/Cal;';
  sRow += 'G10 Net;G10 Com/Em;G10 Com/Cal;G11 Net;G11 Com/Em;G11 Com/Cal;';
  sRow += 'G14 Net;G14 Com/Em;G14 Com/Cal;';
  sRow += 'G16 Net;G16 Com/Em;G16 Com/Cal;G17 Net;G17 Com/Em;G17 Com/Cal;';
  sRow += 'G25 Net;G25 Com/Em;G25 Com/Cal;G28 Net;G28 Com/Em;G28 Com/Cal;';
  sRow += 'G30 Net;G30 Com/Em;G30 Com/Cal;G34 Net;G34 Com/Em;G34 Com/Cal;';
  sRow += 'G39 Net;G39 Com/Em;G39 Com/Cal;ADJ Net;ADJ Com/Em;ADJ Com/Cal;\n';
  fs.appendFileSync('log.csv', sRow);
  var reqData = req.body.data;
  var receiptRef = parseInt(reqData.reference);
  var pos = reqData.pos;
  var status = reqData.status;
  var onlyIrregular = reqData.onlyIrregular;
  var raisedFrom = reqData.raisedFrom;
  var raisedTo = reqData.raisedTo;
  var effectiveFrom = reqData.effectiveFrom;
  var effectiveTo = reqData.effectiveTo;
  var nature = reqData.nature;
  var query = {};
  var tempStr;
  var tempAnd;
  var returnedReceipts = [];
  var singleReceipt;
  var G01net;
  var G01com;
  var G02net;
  var G02com;
  var G03net;
  var G03com;
  var G04net;
  var G04com;
  var G06net;
  var G06com;
  var G07net;
  var G07com;
  var G09net;
  var G09com;
  var G10net;
  var G10com;
  var G11net;
  var G11com;
  var G14net;
  var G14com;
  var G16net;
  var G16com;
  var G17net;
  var G17com;
  var G25net;
  var G25com;
  var G28net;
  var G28com;
  var G30net;
  var G30com;
  var G34net;
  var G34com;
  var G39net;
  var G39com;
  var ADJnet;
  var ADJcom;
  var recG01com;
  var recG02com;
  var recG03com;
  var recG04com;
  var recG06com;
  var recG07com;
  var recG09com;
  var recG10com;
  var recG11com;
  var recG14com;
  var recG16com;
  var recG17com;
  var recG25com;
  var recG28com;
  var recG30com;
  var recG34com;
  var recG39com;
  query['def.nature'] = {
    $ne: 'RT'
  };
  if (!_.isNaN(receiptRef)) {
    query['def.ref'] = parseInt(receiptRef);
  }
  if (pos !== '') {
    query['def.user.pos.code'] = pos;
  }
  if (raisedFrom !== null && raisedTo !== null) {
    var mixedRaised = {
      $and: [{
        'def.date': {
          $gte: raisedFrom
        }
      }, {
        'def.date': {
          $lte: raisedTo
        }
      }]
    };
    tempStr = JSON.stringify(query);
    tempStr = tempStr.substring(0, tempStr.length - 1);
    tempAnd = JSON.stringify(mixedRaised);
    tempAnd = tempAnd.substring(0, tempAnd.length - 1);
    tempAnd = tempAnd.substring(1);
    tempStr += ',' + tempAnd + '}';
    query = JSON.parse(tempStr);
  }
  else {
    if (raisedFrom !== null) {
      query['def.date'] = {
        $gte: raisedFrom
      };
    }
    if (raisedTo !== null) {
      query['def.date'] = {
        $lte: raisedTo
      };
    }
  }
  if (effectiveFrom !== null && effectiveTo !== null) {
    if (!query.$and) {
      var mixedEffective = {
        $and: [{
          'def.fromDate': {
            $gte: effectiveFrom
          }
        }, {
          'def.fromDate': {
            $lte: effectiveTo
          }
        }]
      };
      tempStr = JSON.stringify(query);
      tempStr = tempStr.substring(0, tempStr.length - 1);
      tempAnd = JSON.stringify(mixedEffective);
      tempAnd = tempAnd.substring(0, tempAnd.length - 1);
      tempAnd = tempAnd.substring(1);
      tempStr += ',' + tempAnd + '}';
      query = JSON.parse(tempStr);
    }
    else {
      query.$and.push({
        'def.fromDate': {
          $gte: effectiveFrom
        }
      });
      query.$and.push({
        'def.fromDate': {
          $lte: effectiveTo
        }
      });
    }
  }
  else {
    if (effectiveFrom !== null) {
      query['def.fromDate'] = {
        $gte: effectiveFrom
      };
    }
    if (effectiveTo !== null) {
      query['def.fromDate'] = {
        $lte: effectiveTo
      };
    }
  }
  if (status !== '') {
    query['audit.lastStatusCode'] = parseInt(status);
  }
  query['audit.adjustedReceipt'] = false;
  var cursor = mongo.getFinanceReceiptCol()
    .find(query)
    .sort('def.ref', -1);
  var checkComm;
  cursor.toArray(function (err, lstReceipt) {
    if (err) {
      if (err.code === 17144) {
        res.send(500, 'Veuillez affiner votre sélection !');
        return;
      }
      else {
        res.send(500, err);
        return;
      }
    }
    async.each(lstReceipt, function (rec, callback) {
      singleReceipt = {};
      checkComm = {};
      checkComm.pos = rec.def.user.pos.code;
      checkComm.raisedDate = rec.def.date;
      checkComm.fromDate = rec.def.fromDate;
      checkComm.toDate = rec.def.toDate;
      checkComm.coverages = rec.coverages;
      checkComm.policy = rec.contract.ref;
      singleReceipt.receiptComm = checkComm.coverages.reduce(function (
        memo, cov) {
        return memo + cov.commission;
      }, 0);
      singleReceipt.receiptComm = Number((rec.summary.feesCommission +
          singleReceipt.receiptComm)
        .toFixed(3));
      if (rec.processCommission.product) {
        rec.processCommission.product = rec.contract.ref.toString()
          .substring(2, 5);
      }
      singleReceipt.pos = checkComm.pos;
      singleReceipt.reference = rec.def.ref;
      singleReceipt.contract = rec.contract.ref;
      singleReceipt.product = '';
      if (rec.audit.lastStatusCode) {
        singleReceipt.status = rec.audit.lastStatusDesc;
      }
      else {
        singleReceipt.status = 'Non identifiée';
      }
      checkComm.product = rec.processCommission.product;
      checkComm.fees = {};
      checkComm.fees.code = 'FEE';
      checkComm.fees.net = rec.summary.fees;
      checkComm.fees.commission = rec.summary.feesCommission;
      checkComm.reference = rec.def.ref;
      checkComm.contract = rec.contract.ref;
      checkComm.receiptComm = singleReceipt.receiptComm;
      checkComm.status = singleReceipt.status;
      checkComm.receiptAmount = rec.summary.amount;
      checkComm.usage = rec.usage;
      checkComm.recovery = rec.recovery.due;
      commission.processCommission(checkComm, function (err, recalcCovs,
        recalcFes, messages, fromProcessing) {
        if (err) {
          callback(err);
        }
        else {
          singleReceipt = {};
          singleReceipt.pos = fromProcessing.pos;
          sRow = fromProcessing.pos + ';';
          sRow += fromProcessing.reference + ';';
          sRow += fromProcessing.contract + ';';
          sRow += fromProcessing.product + ';';
          sRow += fromProcessing.productName + ';';
          sRow += moment(fromProcessing.date, 'YYYY-MM-DD')
            .format('DD/MM/YYYY') + ';';
          sRow += moment(fromProcessing.fromDate, 'YYYY-MM-DD')
            .format('DD/MM/YYYY') + ';';
          sRow += moment(fromProcessing.toDate, 'YYYY-MM-DD')
            .format('DD/MM/YYYY') + ';';
          sRow += Number(fromProcessing.receiptAmount.toFixed(3)) +
            ';';
          var originalComm = fromProcessing.covers.reduce(function (
            memo, cov) {
            return memo + cov.commission;
          }, 0);
          sRow += Number(originalComm.toFixed(3)) + ';';
          var recalCom = recalcCovs.reduce(function (memo, cov) {
            return memo + cov.commission;
          }, 0);
          sRow += Number(recalCom.toFixed(3)) + ';';
          sRow += Number(recalcFes.amount.toFixed(3)) + ';';
          sRow += Number(recalcFes.commission.toFixed(3)) + ';';
          sRow += Number(recalcFes.calcCommission.toFixed(3)) + ';';
          sRow += Number(fromProcessing.recovery.toFixed(3)) + ';';
          if (fromProcessing.usage === 'FLEET') {
            sRow += 'Flotte auto;';
          }
          else {
            if (fromProcessing.usage) {
              G01net = 0;
              G01com = 0;
              G02net = 0;
              G02com = 0;
              G03net = 0;
              G03com = 0;
              G04net = 0;
              G04com = 0;
              G06net = 0;
              G06com = 0;
              G07net = 0;
              G07com = 0;
              G09net = 0;
              G09com = 0;
              G10net = 0;
              G10com = 0;
              G11net = 0;
              G11com = 0;
              G14net = 0;
              G14com = 0;
              G16net = 0;
              G16com = 0;
              G17net = 0;
              G17com = 0;
              G25net = 0;
              G25com = 0;
              G28net = 0;
              G28com = 0;
              G30net = 0;
              G30com = 0;
              G34net = 0;
              G34com = 0;
              G39net = 0;
              G39com = 0;
              ADJnet = 0;
              ADJcom = 0;
              recG01com = 0;
              recG02com = 0;
              recG03com = 0;
              recG04com = 0;
              recG06com = 0;
              recG07com = 0;
              recG09com = 0;
              recG10com = 0;
              recG11com = 0;
              recG14com = 0;
              recG16com = 0;
              recG17com = 0;
              recG25com = 0;
              recG28com = 0;
              recG30com = 0;
              recG34com = 0;
              recG39com = 0;
              _.each(fromProcessing.covers, function (item) {
                if (item.code === 'G01') {
                  G01net = item.amount;
                  G01com = item.commission;
                }
                if (item.code === 'G02') {
                  G02net = item.amount;
                  G02com = item.commission;
                }
                if (item.code === 'G03') {
                  G03net = item.amount;
                  G03com = item.commission;
                }
                if (item.code === 'G04') {
                  G04net = item.amount;
                  G04com = item.commission;
                }
                if (item.code === 'G06') {
                  G06net = item.amount;
                  G06com = item.commission;
                }
                if (item.code === 'G07') {
                  G07net = item.amount;
                  G07com = item.commission;
                }
                if (item.code === 'G09') {
                  G09net = item.amount;
                  G09com = item.commission;
                }
                if (item.code === 'G10') {
                  G10net = item.amount;
                  G10com = item.commission;
                }
                if (item.code === 'G11') {
                  G11net = item.amount;
                  G11com = item.commission;
                }
                if (item.code === 'G14') {
                  G14net = item.amount;
                  G14com = item.commission;
                }
                if (item.code === 'G16') {
                  G16net = item.amount;
                  G16com = item.commission;
                }
                if (item.code === 'G17') {
                  G17net = item.amount;
                  G17com = item.commission;
                }
                if (item.code === 'G25') {
                  G25net = item.amount;
                  G25com = item.commission;
                }
                if (item.code === 'G28') {
                  G28net = item.amount;
                  G28com = item.commission;
                }
                if (item.code === 'G30') {
                  G30net = item.amount;
                  G30com = item.commission;
                }
                if (item.code === 'G34') {
                  G34net = item.amount;
                  G34com = item.commission;
                }
                if (item.code === 'G39') {
                  G39net = item.amount;
                  G39com = item.commission;
                }
                if (item.code === 'ADJ') {
                  ADJnet = item.amount;
                  ADJcom = item.commission;
                }
              });
              _.each(recalcCovs, function (item) {
                if (item.code === 'G01') {
                  recG01com = item.commission;
                }
                if (item.code === 'G02') {
                  recG02com = item.commission;
                }
                if (item.code === 'G03') {
                  recG03com = item.commission;
                }
                if (item.code === 'G04') {
                  recG04com = item.commission;
                }
                if (item.code === 'G06') {
                  recG06com = item.commission;
                }
                if (item.code === 'G07') {
                  recG07com = item.commission;
                }
                if (item.code === 'G09') {
                  recG09com = item.commission;
                }
                if (item.code === 'G10') {
                  recG10com = item.commission;
                }
                if (item.code === 'G11') {
                  recG11com = item.commission;
                }
                if (item.code === 'G14') {
                  recG14com = item.commission;
                }
                if (item.code === 'G16') {
                  recG16com = item.commission;
                }
                if (item.code === 'G17') {
                  recG17com = item.commission;
                }
                if (item.code === 'G25') {
                  recG25com = item.commission;
                }
                if (item.code === 'G28') {
                  recG28com = item.commission;
                }
                if (item.code === 'G30') {
                  recG30com = item.commission;
                }
                if (item.code === 'G34') {
                  recG34com = item.commission;
                }
                if (item.code === 'G39') {
                  recG39com = item.commission;
                }
              });
              sRow += G01net + ';' + G01com + ';' + recG01com + ';';
              sRow += G02net + ';' + G02com + ';' + recG02com + ';';
              sRow += G03net + ';' + G03com + ';' + recG03com + ';';
              sRow += G04net + ';' + G04com + ';' + recG04com + ';';
              sRow += G06net + ';' + G06com + ';' + recG06com + ';';
              sRow += G07net + ';' + G07com + ';' + recG07com + ';';
              sRow += G09net + ';' + G09com + ';' + recG09com + ';';
              sRow += G10net + ';' + G10com + ';' + recG10com + ';';
              sRow += G11net + ';' + G11com + ';' + recG11com + ';';
              sRow += G14net + ';' + G14com + ';' + recG14com + ';';
              sRow += G16net + ';' + G16com + ';' + recG16com + ';';
              sRow += G17net + ';' + G17com + ';' + recG17com + ';';
              sRow += G25net + ';' + G25com + ';' + recG25com + ';';
              sRow += G28net + ';' + G28com + ';' + recG28com + ';';
              sRow += G30net + ';' + G30com + ';' + recG30com + ';';
              sRow += G34net + ';' + G34com + ';' + recG34com + ';';
              sRow += G39net + ';' + G39com + ';' + recG39com + ';';
              sRow += ADJnet + ';' + ADJcom + ';0;';
            }
          }
          sRow += '\n';
          singleReceipt.reference = fromProcessing.reference;
          singleReceipt.contract = fromProcessing.contract;
          singleReceipt.receiptComm = fromProcessing.receiptComm;
          singleReceipt.receiptAmount = fromProcessing.receiptAmount;
          singleReceipt.calculatedComm = recalcCovs.reduce(function (
            memo, cov) {
            return memo + cov.commission;
          }, 0);
          singleReceipt.calculatedComm = Number((recalcFes.calcCommission +
              singleReceipt.calculatedComm)
            .toFixed(3));
          singleReceipt.status = fromProcessing.status;
          singleReceipt.nature = '';
          singleReceipt.consultlink = {};
          singleReceipt.consultlink.title = 'Consulter';
          singleReceipt.consultlink.processlink =
            'admin#commission/';
          singleReceipt.consultlink.processlink += singleReceipt.reference +
            '/manage';
          if (messages.length !== 0) {
            var firstMsg = messages[0];
            if (firstMsg === 'Commission on net zero') {
              singleReceipt.natureCode = 2;
              singleReceipt.nature = 'Pas de commission sur net';
            }
            if (firstMsg === 'Commission different from calculated') {
              singleReceipt.natureCode = 4;
              singleReceipt.nature =
                'Commission non conforme au profil';
            }
            if (firstMsg === 'Commission rate not found') {
              singleReceipt.natureCode = 1;
              singleReceipt.nature = 'Commission non paramètrée';
            }
          }
          else {
            if (recalcFes.calcComments) {
              if (recalcFes.calcComments ===
                'Commission rate not found') {
                singleReceipt.natureCode = 5;
                singleReceipt.nature = 'Autres';
              }
              if (recalcFes.calcComments ===
                'Fees commission different from calculated') {
                singleReceipt.natureCode = 4;
                singleReceipt.nature =
                  'Commission non conforme au profil';
              }
            }
          }
          if (singleReceipt.nature === '') {
            singleReceipt.nature = 'Rien à signaler';
          }
          if (onlyIrregular) {
            if (nature !== '') {
              if (singleReceipt.natureCode === parseInt(nature) &&
                singleReceipt.nature !== 'Rien à signaler') {
                fs.appendFileSync('log.csv', sRow);
                returnedReceipts.push(singleReceipt);
                callback();
              }
              else {
                callback();
              }
            }
            else {
              if (singleReceipt.nature !== 'Rien à signaler') {
                fs.appendFileSync('log.csv', sRow);
                returnedReceipts.push(singleReceipt);
                callback();
              }
              else {
                callback();
              }
            }
          }
          else {
            if (nature !== '') {
              if (singleReceipt.natureCode === parseInt(nature)) {
                fs.appendFileSync('log.csv', sRow);
                returnedReceipts.push(singleReceipt);
                callback();
              }
              else {
                fs.appendFileSync('log.csv', sRow);
                returnedReceipts.push(singleReceipt);
                callback();
              }
            }
            else {
              fs.appendFileSync('log.csv', sRow);
              returnedReceipts.push(singleReceipt);
              callback();
            }
          }
        }
      });
    }, function (err) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.send({
        receipts: returnedReceipts
      });
    });
  });
}

function commissionManage(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.commissionAdmin) {
      accessGranted = req.session.user.accessRights.commissionAdmin;
    }
  }
  if (!accessGranted) {
    res.send(500, 'Accès refusé');
    return;
  }
  var recNumber = parseInt(req.body.reference);
  var query = {};
  var singleReceipt;
  var checkComm;
  query['def.nature'] = {
    $ne: 'RT'
  };
  query['def.ref'] = recNumber;
  query['audit.adjustedReceipt'] = false;
  mongo.getFinanceReceiptCol()
    .findOne(query, function (err, rec) {
      if (err) {
        res.send(500, err);
        return;
      }
      if (rec.length === 0) {
        res.send(500, 'Aucune quittance trouvée !');
        return;
      }
      singleReceipt = {};
      checkComm = {};
      checkComm.pos = rec.def.user.pos.code;
      checkComm.raisedDate = rec.def.date;
      checkComm.coverages = rec.coverages;
      checkComm.policy = rec.contract.ref;
      singleReceipt.receiptComm = checkComm.coverages.reduce(function (memo,
        cov) {
        return memo + cov.commission;
      }, 0);
      singleReceipt.receiptComm = Number((rec.summary.feesCommission +
          singleReceipt.receiptComm)
        .toFixed(3));
      //singleReceipt.coverages = rec.coverages;
      singleReceipt.posProfile = '';
      if (rec.processCommission.product) {
        rec.processCommission.product = rec.contract.ref.toString()
          .substring(2, 5);
      }
      singleReceipt.pos = checkComm.pos;
      singleReceipt.reference = rec.def.ref;
      singleReceipt.contract = rec.contract.ref;
      singleReceipt.product = '';
      if (rec.audit.lastStatusCode) {
        singleReceipt.status = rec.audit.lastStatusDesc;
      }
      else {
        singleReceipt.status = 'Non identifiée';
      }
      if (rec.audit.history) {
        singleReceipt.auditHistory = [];
        _.each(rec.audit.history, function (item) {
          var hstkey = _.keys(item);
          var sIdentified = {};
          var sTransferred = {};
          var sRequested = {};
          var sClosed = {};
          var sResolved = {};
          _.each(hstkey, function (singleKey) {
            if (singleKey === 'identifiedUser') {
              sIdentified.userFullName = item[singleKey];
              sIdentified.actionCode = 2;
              sIdentified.date = item.identifiedDate;
              sIdentified.comments = item.identifiedComments;
              sIdentified.context = '';
            }
            if (singleKey === 'transferredUser') {
              sTransferred.userFullName = item[singleKey];
              sTransferred.actionCode = 3;
              sTransferred.date = item.transferredDate;
              sTransferred.comments = item.transferredComments;
              sTransferred.context = item.transferredContext;
            }
            if (singleKey === 'requestedUser') {
              sRequested.userFullName = item[singleKey];
              sRequested.actionCode = 4;
              sRequested.date = item.requestedDate;
              sRequested.comments = item.requestedComments;
              sRequested.context = item.requestedContext;
            }
            if (singleKey === 'closedUser') {
              sClosed.userFullName = item[singleKey];
              sClosed.actionCode = 5;
              sClosed.date = item.resolvedDate;
              sClosed.comments = item.resolvedComments;
              sClosed.context = '';
            }
            if (singleKey === 'fixedUser') {
              sResolved.userFullName = item[singleKey];
              sResolved.actionCode = 6;
              sResolved.date = item.fixedDate;
              sResolved.comments = item.fixedComments;
              sResolved.context = item.fixedContext;
            }
          });
          if (sIdentified.userFullName) {
            singleReceipt.auditHistory.push(sIdentified);
          }
          if (sTransferred.userFullName) {
            singleReceipt.auditHistory.push(sTransferred);
          }
          if (sRequested.userFullName) {
            singleReceipt.auditHistory.push(sRequested);
          }
          if (sClosed.userFullName) {
            singleReceipt.auditHistory.push(sClosed);
          }
          if (sResolved.userFullName) {
            singleReceipt.auditHistory.push(sResolved);
          }
        });
        var lastAction = rec.audit.history[rec.audit.history.length - 1];
        if (lastAction.fixedUser || lastAction.closedUser) {
          singleReceipt.lastAction = {};
        }
        else {
          singleReceipt.lastAction = lastAction;
        }
      }
      else {
        singleReceipt.auditHistory = [];
      }
      checkComm.product = rec.processCommission.product;
      checkComm.fees = {};
      checkComm.fees.code = 'FEE';
      checkComm.fees.net = rec.summary.fees;
      checkComm.fees.commission = rec.summary.feesCommission;
      checkComm.reference = rec.def.ref;
      checkComm.contract = rec.contract.ref;
      checkComm.receiptComm = singleReceipt.receiptComm;
      checkComm.status = singleReceipt.status;
      checkComm.receiptAmount = rec.summary.amount;
      var displayCoverages = [];
      var sDisplayCover;
      commission.processCommission(checkComm, function (err, recalcCovs,
        recalcFes, messages, fromProcessing) {
        if (err) {
          res.send(500, err);
          return;
        }
        _.each(rec.coverages, function (item) {
          sDisplayCover = {};
          sDisplayCover.code = item.code;
          sDisplayCover.amount = item.amount;
          sDisplayCover.commission = item.commission;
          _.each(recalcCovs, function (it) {
            if (it.code === sDisplayCover.code) {
              sDisplayCover.calcCommission = it.commission;
            }
          });
          displayCoverages.push(sDisplayCover);
        });
        displayCoverages.sort(function (a, b) {
          if (a.code < b.code) {
            return -1;
          }
          if (a.code > b.code) {
            return 1;
          }
          return 0;
        });
        sDisplayCover = {};
        sDisplayCover.code = 'FEE';
        sDisplayCover.amount = recalcFes.amount;
        sDisplayCover.commission = recalcFes.commission;
        sDisplayCover.calcCommission = recalcFes.calcCommission;
        displayCoverages.push(sDisplayCover);
        singleReceipt.displayCoverages = displayCoverages;
        singleReceipt.auditAdjCoverages = fromProcessing.adjustedCoverages;
        singleReceipt.posProfile = fromProcessing.posProfile;
        singleReceipt.raisedDate = rec.def.date;
        singleReceipt.effectiveDate = rec.def.fromDate;
        singleReceipt.toDate = rec.def.toDate;
        singleReceipt.pos = fromProcessing.pos;
        singleReceipt.posProfile = fromProcessing.posProfile;
        singleReceipt.reference = fromProcessing.reference;
        singleReceipt.contract = fromProcessing.contract;
        singleReceipt.product = '';
        singleReceipt.receiptComm = fromProcessing.receiptComm;
        singleReceipt.receiptAmount = fromProcessing.receiptAmount;
        singleReceipt.calculatedComm = recalcCovs.reduce(function (memo,
          cov) {
          return memo + cov.commission;
        }, 0);
        singleReceipt.calculatedComm = Number((recalcFes.commission +
            singleReceipt.calculatedComm)
          .toFixed(3));
        singleReceipt.status = fromProcessing.status;
        singleReceipt.nature = '';
        if (messages.length !== 0) {
          var firstMsg = messages[0];
          if (firstMsg === 'Commission on net zero') {
            singleReceipt.natureCode = 2;
            singleReceipt.nature = 'Pas de commission sur net';
          }
          if (firstMsg === 'Commission different from calculated') {
            singleReceipt.natureCode = 4;
            singleReceipt.nature = 'Commission non conforme au profil';
          }
          if (firstMsg === 'Commission rate not found') {
            singleReceipt.natureCode = 1;
            singleReceipt.nature = 'Commission non paramètrée';
          }
        }
        else {
          if (recalcFes.calcComments) {
            if (recalcFes.calcComments === 'Commission rate not found') {
              singleReceipt.natureCode = 5;
              singleReceipt.nature = 'Autres';
            }
            if (recalcFes.calcComments ===
              'Fees commission different from calculated') {
              singleReceipt.natureCode = 4;
              singleReceipt.nature = 'Commission non conforme au profil';
            }
          }
        }
        if (singleReceipt.nature === '') {
          singleReceipt.nature = 'Rien à signaler';
        }
        res.send(200, {
          receipt: singleReceipt
        });
        return;
      });
    });
}

function commissionIdentify(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.commissionAdmin) {
      accessGranted = req.session.user.accessRights.commissionAdmin;
    }
  }
  if (!accessGranted) {
    res.send(500, 'Accès refusé');
    return;
  }
  var query = {};
  var recNumber = req.body.data.reference;
  var comments = req.body.data.comments;
  var user = req.session.user.username;
  var userFullName = req.session.user.fullName;
  query['def.nature'] = {
    $ne: 'RT'
  };
  query['def.ref'] = recNumber;
  mongo.getFinanceReceiptCol()
    .findOne(query, function (err, rec) {
      if (err) {
        res.send(500, err);
        return;
      }
      if (rec.length === 0) {
        res.send(500, 'Aucune quittance trouvée !');
        return;
      }
      if (rec.audit.history) {
        var lastAction = rec.audit.history[rec.audit.history.length - 1];
        if (lastAction.fixedUser) {
          var newRecord = {};
          newRecord.identifiedUser = userFullName;
          newRecord.idusercode = user;
          newRecord.identifiedComments = comments;
          newRecord.identified = true;
          newRecord.identifiedDate = moment()
            .format('YYYY-MM-DD');
          mongo.getFinanceReceiptCol()
            .update(query, {
              $set: {
                'audit.lastStatusCode': 2
              },
              $push: {
                'audit.history': newRecord
              }
            }, function (err) {
              if (err) {
                res.send(500, err);
                return;
              }
              res.send({});
            });
        }
        else {
          res.send(500,
            'Une identification non résolue est déjà ouverte sur cette quittance !'
          );
          return;
        }
      }
      else {
        mongo.getFinanceReceiptCol()
          .update(query, {
            $set: {
              'audit.lastStatusCode': 2,
              'audit.history': [{
                identifiedUser: userFullName,
                idusercode: user,
                identifiedComments: comments,
                identified: true,
                identifiedDate: moment()
                  .format('YYYY-MM-DD')
              }]
            }
          }, function (err) {
            if (err) {
              res.send(500, err);
              return;
            }
            res.send({});
          });
      }
    });
}

function cancelReceipt(req, res) {
  _savePayment(req, function (err) {
    if (err) {
      res.send(500, err);
    }
    else {
      _.each(req.body.payment.receiptsToDelete, function (receipt) {
        updateCanceledReceipt(req.session, req.body.payment.reference,
          receipt, req.body.payment.comments,
          function (err) {
            if (err) {
              res.send(500, err);
            }
            else {
              req.body.payment.receiptsToDelete = [];
            }
          });
      });
      res.json(null);
    }
  });
}

function commissionAutoFix(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.commissionAdmin) {
      accessGranted = req.session.user.accessRights.commissionAdmin;
    }
  }
  if (!accessGranted) {
    res.send(500, 'Accès refusé');
    return;
  }
  var query = {};
  var recNumber = req.body.receiptNumber;
  var adjCover = req.body.adjCovers;
  var user = req.session.user.username;
  var userFullName = req.session.user.fullName;
  query['def.nature'] = {
    $ne: 'RT'
  };
  query['def.ref'] = recNumber;
  var updateFees = 0;
  var totalSign = 0;
  var receiptTotal = 0;
  _.each(adjCover, function (item) {
    totalSign = item.calcCommission - item.commission;
    if (item.code === 'FEE') {
      updateFees = item.calcCommission - item.commission;
    }
  });
  if (totalSign >= 0) {
    receiptTotal = 0.001;
  }
  else {
    receiptTotal = -0.001;
  }
  mongo.getFinanceReceiptCol()
    .findOne(query, function (err, rec) {
      if (err) {
        res.send(500, err);
        return;
      }
      if (rec.length === 0) {
        res.send(500, 'Aucune quittance trouvée !');
        return;
      }
      if (rec.audit.history) {
        var lastAction = rec.audit.history[rec.audit.history.length - 1];
        if (lastAction.fixedUser || lastAction.closedUser) {
          var msg = 'Cette anomalie a déjà été corrigée ou clôturée !';
          res.send(500, msg);
          return;
        }
        else {
          var newReceipt = {};
          newReceipt = JSON.parse(JSON.stringify(rec));
          var sTax;
          delete newReceipt.def.ref;
          delete newReceipt.def.date;
          newReceipt.def.date = moment()
            .format('YYYY-MM-DD');
          var setFirstOnly = 0;
          _.each(newReceipt.coverages, function (item) {
            if (!item.taxes) {
              item.taxes = [];
              sTax = {};
              sTax.code = 'TUA';
              sTax.amount = 0;
              item.taxes.push(sTax);
            }
            _.each(item.taxes, function (tax) {
              tax.amount = 0;
            });
            if (setFirstOnly === 0) {
              item.amount = receiptTotal;
              setFirstOnly = 1;
            }
            else {
              item.amount = 0;
            }
            item.commission = 0;
            _.each(adjCover, function (adCover) {
              if (item.code === adCover.code) {
                item.commission = (adCover.calcCommission - adCover.commission);
              }
            });
          });
          _.each(newReceipt.summary.feesTaxes, function (tax) {
            tax.amount = 0;
          });
          _.each(newReceipt.summary.stamps, function (stamp) {
            stamp.amount = 0;
          });
          if (updateFees !== 0) {
            newReceipt.summary.feesCommission = updateFees;
          }
          else {
            newReceipt.summary.feesCommission = 0;
          }
          newReceipt.summary.fees = 0;
          newReceipt.audit.adjustedReceipt = true;
          delete newReceipt.audit.history;
          delete newReceipt._id;
          delete newReceipt.audit.lastStatusCode;
          delete newReceipt.audit.lastStatusDesc;
          newReceipt = utils.fixNumberInObject(newReceipt, 3);
          receipt.finalize(newReceipt);
          newReceipt = utils.fixNumberInObject(newReceipt, 3);
          receipt.create(newReceipt, function (err, receipt) {
            if (err) {
              res.send(500, err);
              return;
            }
            var receiptNumber = receipt[0].def.ref;
            var auditHistory = rec.audit.history;
            var newRecord = auditHistory[auditHistory.length - 1];
            newRecord.fixedUser = userFullName;
            newRecord.fdusercode = user;
            newRecord.fixedComments = 'Génération auto de quittance';
            newRecord.fixed = true;
            newRecord.fixedDate = moment()
              .format('YYYY-MM-DD');
            newRecord.fixedContext = receiptNumber;
            mongo.getFinanceReceiptCol()
              .update(query, {
                $set: {
                  'audit.lastStatusCode': 6,
                  'audit.history': auditHistory
                }
              }, function (err) {
                if (err) {
                  res.send(500, err);
                  return;
                }
                res.send(200, {
                  receiptNumber: receiptNumber
                });
              });
          });
        }
      }
      else {
        res.send(500, 'Veuillez identifier l\'anomalie avant de procéder !');
      }
    });
}
exports.declare = function (app) {
  app.post('/svc/admin/termList', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, ora.termList || termList);
  app.post('/svc/admin/termSearch', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, ora.termSearch || termSearch);
  app.post('/svc/admin/terms/get', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, ora.getTerm || getTerm);
  app.post('/svc/admin/term/remove', session.ensureAuth, session.ensureAdmin,
    session.ensureInternal, ora.removeTerm || removeTerm);
  app.post('/svc/exemption/adminExemptionSearch', session.ensureAuth, session
    .ensureAdmin, search);
  app.post('/svc/exemption/adminRejectExemption', session.ensureAuth, session
    .ensureAdmin, rejectExemption);
  app.post('/svc/exemption/adminAcceptExemption', session.ensureAuth, session
    .ensureAdmin, acceptExemption);
  app.post('/svc/admin/payment/cancelReceipt', session.ensureAuth, session.ensurePosAdmin,
    cancelReceipt);
  app.post('/svc/admin/pos/history', session.ensureAuth, getPosHistory);
  app.post('/svc/admin/commission/identify', session.ensureAuth,
    processCommissionIdentify);
  app.post('/svc/admin/commission/checkAccess', session.ensureAuth,
    commissionCheckAccess);
  app.post('/svc/admin/commission/manage', session.ensureAuth,
    commissionManage);
  app.post('/svc/admin/commission/identifyReceipt', session.ensureAuth,
    commissionIdentify);
  app.post('/svc/admin/commission/autofix', session.ensureAuth,
    commissionAutoFix);
};

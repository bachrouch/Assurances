var moment = require('moment');
var Q = require('q');
var _ = require('underscore');
var fs = require('fs');
var utils = require('../utils');
var seq = require('../seq');
var email = require('../email');
var batch = require('../batch');
var constants = require('../constants');
var mongo = require('../../mongo');
//
var FORMAT = 'YYYYMMDD';
var batchConfig;
var dir = 'batch/data/debit';
var newLine = '\n';
var fileName = '';
var nationalIssuerNumber;
var rib;
var autorizationRecordCode = '01';
var sentRecordCode = '02';
var transmitterRecordCode = '09';
var debitRef;
var date = moment()
  .format(FORMAT);
var totalRecords;
var totalAmount;
var header;
var debitRecords;
var authRecords;
//var receipts;
var contractDef;

function numAsString(amount, size) {
  //{{
  amount = amount.toString()
    .replace('.', '');
  while (amount.length < size) {
    amount = '0'.concat(amount);
  }
  return (amount);
  //}}
}

function getCompanyInfo(companyName) {
  var query = {};
  query.name = companyName;
  // return Q.Promise(function (resolve, reject) {
  var deferred = Q.defer();
  mongo.getCompanyCol()
    .findOne(query, function (err, company) {
      if (err) {
        deferred.reject(err);
      }
      else {
        rib = company.rib;
        nationalIssuerNumber = company.nationalIssuerNum;
        deferred.resolve();
      }
    });
  return deferred.promise;
}

function sendMail(data) {
  var mel = {
    from: batchConfig.from,
    to: batchConfig.to,
    subject: batchConfig.subject,
    text: batchConfig.message,
    attachments: [{
      filename: fileName + '.txt',
      content: data
    }]
  };
  return Q.Promise(function (resolve, reject) {
    email.send(mel, function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

function buildHeaderDebit(result, dueDate) {
  //{{
  var creditorCode = rib.substr(0, 2);
  totalAmount = numAsString(totalAmount, 12);
  result = transmitterRecordCode + creditorCode + nationalIssuerNumber + rib +
    dueDate + fileName + numAsString(totalRecords, 10) + totalAmount +
    numAsString(totalRecords, 4) + fillWithSpaces(76);
  return (result);
  //}}}
}

function fillWithSpaces(nb) {
  //{{{
  var string = '';
  while (string.length < nb) {
    string += ' ';
  }
  return (string);
  //}}}
}

function buildFileName() {
  //{{{
  var deferred = Q.defer();
  seq.generateRef('debit', function (err, ref) {
    if (err) {
      deferred.reject(err);
    }
    else {
      debitRef = ref;
      var fileReference = '';
      var subIssuer = nationalIssuerNumber.substr(2, 4);
      fileReference = date + ref + 'F' + subIssuer;
      var ufileReference = utils.getStringHollerithCode(fileReference);
      var key = utils.getBankAccountKey(ufileReference);
      fileReference = fileReference + key;
      fileName = fileReference;
      deferred.resolve();
    }
  });
  return deferred.promise;
  //}}}
}

function buildFile(file) {
  return Q.Promise(function (resolve) {
    fs.writeSync(file, header);
    fs.writeSync(file, debitRecords);
    fs.writeSync(file, authRecords);
    resolve();
  });
}

function buildRecordsDebit(rec, result) {
  //{{
  var debtorAccount = rec.payment.bankAccount;
  var debtorCode = debtorAccount.substr(0, 2);
  var domiciliation = rec.payment.domiciliation;
  var label = 'Pr-' + debitRef + '-' + 'Contrat:' + rec.contract.ref +
    '-Quittance:' + rec.def.ref;
  var amount = rec.summary.total * 1000;
  totalAmount += amount;
  amount = numAsString(amount, 10);
  result = result + newLine + sentRecordCode + debtorCode +
    nationalIssuerNumber + rib + debtorAccount + domiciliation + label + amount +
    fillWithSpaces(30);
  return (result);
  //}}
}

function buildRecordsAutorization(rec, effDate, endDate, result) {
  //{{{
  var debtorAccount = rec.payment.bankAccount;
  var debtorCode = debtorAccount.substr(0, 2);
  var payerCode = '1';
  var domiciliation = rec.payment.domiciliation;
  result = result + newLine + autorizationRecordCode + debtorCode +
    debtorAccount + domiciliation + numAsString(rec.subscriber.phone, 10) +
    payerCode + 'A' + effDate + endDate + fillWithSpaces(88);
  return (result);
  //}}}
}

function updateReceipt(rec) {
  var query = {};
  query['def.ref'] = rec;
  var today = utils.momentToJSON(moment());
  return Q.Promise(function (resolve, reject) {
    mongo.getFinanceReceiptCol()
      .update(query, {
        $set: {
          'payment.status': constants.cSent
        },
        $push: {
          'payment.debit': {
            reference: debitRef,
            date: today
          }
        }
      }, function (err) {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
  });
}

function getReceipts(query) {
  var deferred = Q.defer();
  mongo.getFinanceReceiptCol()
    .find(query, function (err, cursor) {
      if (err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(cursor);
      }
    });
  return deferred.promise;
}

function getContractDef(ref) {
  var deferred = Q.defer();
  var query = {};
  query['def.ref'] = ref;
  mongo.getSavingsContractCol()
    .findOne(query, function (err, contract) {
      if (err) {
        deferred.reject(err);
      }
      else {
        contractDef = contract.def;
        deferred.resolve();
      }
    });
  return deferred.promise;
}

function cursorToArray(cursor) {
  var deferred = Q.defer();
  cursor.toArray(function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {
      totalRecords = results.length;
      deferred.resolve(results);
    }
  });
  return deferred.promise;
}

function debitRequest(batchName) {
  //{{{
  return Q.Promise(function (resolve, reject) {
    console.log('in debitRequest');
    var i;
    var startDate = utils.momentToJSON(moment());
    var nextDate = moment(startDate)
      .format(FORMAT);
    var endDate = utils.momentToJSON(moment()
      .add(5, 'day'));
    var query = {};
    var debitFile;
    totalRecords = 0;
    totalAmount = 0;
    header = '';
    debitRecords = '';
    authRecords = '';
    //receipts = [];
    query = {
      $and: [{
        'payment.status': {
          $ne: constants.cSent
        }
      }, {
        'payment.status': {
          $ne: constants.cTreated
        }
      }, {
        'payment.domiciliation': {
          $exists: true
        }
      }, {
        'payment.domiciliation': {
          $ne: ''
        }
      }]
    };
    query['def.fromDate'] = {
      $gte: utils.dateToJSON(startDate),
      $lte: utils.dateToJSON(endDate)
    };
    query['payment.mode'] = constants.cDebit;
    return Q.all([
      mongo.init()
      .then(function () {
        batch.getBatchConfig(batchName)
          .then(function (config) {
            batchConfig = config;
            getCompanyInfo(batchConfig.company);
          })
          .then(function () {
            return getReceipts(query);
          })
          .then(cursorToArray)
          .then(function (results) {
            buildFileName()
              .then(function () {
                i = 0;
                _.each(results, function (rec) {
                  var toDate = fillWithSpaces(8);
                  getContractDef(rec.contract.ref)
                    .then(function () {
                      // var dueDate = moment(contractDef.effDate)
                      //   .format(FORMAT);
                      var fromDate = moment(rec.def.fromDate)
                        .format(FORMAT);
                      nextDate = fromDate;
                      debitRecords = buildRecordsDebit(rec,
                        debitRecords);
                      authRecords =
                        buildRecordsAutorization(rec,
                          fromDate, toDate, authRecords);
                      //receipts.push(rec.def.ref);
                      i++;
                      if (i === totalRecords) {
                        header = buildHeaderDebit(header,
                          nextDate);
                        debitFile = fs.openSync(dir + '/' +
                          fileName + '.txt', 'w');
                        buildFile(debitFile);
                      }
                    })
                    .then(function () {
                      fs.readFile(dir + '/' + fileName +
                        '.txt',
                        function (err, data) {
                          if (err) {
                            reject(err);
                          }
                          else {
                            sendMail(data, function (err) {
                              if (err) {
                                reject(err);
                              }
                              else {
                                resolve();
                              }
                            });
                          }
                        });
                    })
                    .then(function () {
                      updateReceipt(rec.def.ref);
                    });
                });
              });
          });
      })
    ]);
  });
}
exports.debitRequest = debitRequest;

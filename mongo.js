/* vim: fdm=marker
 */
var Q = require('q');
var MongoClient = require('mongodb')
  .MongoClient;
var config = require('./config');
var database;
var mng = require('mongodb');
Object.defineProperty(exports, 'db', {
  get: function () {
    // {{{
    return database;
    // }}}
  }
});
exports.init = function () {
  // {{{
  return Q.Promise(function (resolve, reject) {
    MongoClient.connect(config.MONGO_URI, function (err, db) {
      if (err) {
        reject(err);
      }
      else {
        database = db;
        resolve();
      }
    });
  });
  // }}}
};
exports.getSequenceCol = function () {
  // {{{
  return database.collection('sequence');
  // }}}
};
exports.getFinanceReceiptCol = function () {
  // {{{
  return database.collection('finance.receipt');
  // }}}
};
exports.getFinancePaymentCol = function () {
  // {{{
  return database.collection('finance.payment');
  // }}}
};
exports.getFinancePaybackCol = function () {
  // {{{
  return database.collection('finance.payback');
  // }}}
};
exports.getSavingsDraftCol = function () {
  // {{{
  return database.collection('savings.draft');
  // }}}
};
exports.getSavingsQuoteCol = function () {
  // {{{
  return database.collection('savings.quote');
  // }}}
};
exports.getSavingsContractCol = function () {
  // {{{
  return database.collection('savings.contract');
  // }}}
};
exports.getLoanDraftCol = function () {
  // {{{
  return database.collection('loan.draft');
  // }}}
};
exports.getLoanQuoteCol = function () {
  // {{{
  return database.collection('loan.quote');
  // }}}
};
exports.getLoanContractCol = function () {
  // {{{
  return database.collection('loan.contract');
  // }}}
};
exports.getLoanFloorCol = function () {
  // {{{
  return database.collection('loan.floor');
  // }}}
};
exports.getLoanRequestCol = function () {
  // {{{
  return database.collection('loan.request');
  // }}}
};
// exports.getLoanProductCol = function () {
//   // {{{
//   return database.collection('loan.product');
//   // }}}
// };
exports.getPosCol = function () {
  // {{{
  return database.collection('pos');
  // }}}
};
exports.getCommissionCol = function () {
  // {{{
  return database.collection('pos.commission');
  // }}}
};
exports.getPrintBCol = function () {
  // {{{
  return database.collection('print.branch');
  // }}}
};
exports.getLitigationCollection = function () {
  // {{{
  return database.collection('litigation');
  // }}}
};
exports.getExemptionCol = function () {
  // {{{
  return database.collection('exemption');
  // }}}
};
exports.getCompanyCol = function () {
  // {{{
  return database.collection('company');
  // }}}
};
exports.getConfigBatchCol = function () {
  // {{{
  return database.collection('config.batch');
  //}}}
};
exports.getUserCol = function () {
  // {{{
  return database.collection('user');
  // }}}
};
exports.getZipCodesCol = function () {
  // {{{
  return database.collection('zipCodes');
  // }}}
};
exports.getEmailCol = function () {
  // {{{
  return database.collection('config.email');
  // }}}
};
exports.getCommIrregStatCol = function () {
  // {{{
  return database.collection('common.irregularComStatus');
  // }}}
};
exports.getCommIrregNatCol = function () {
  // {{{
  return database.collection('common.irregularComNature');
  // }}}
};
exports.getUtilsCol = function () {
  // {{{
  return database.collection('config.utils');
  // }}}
};
exports.getCoverReferenceCol = function () {
  // {{{
  return database.collection('common.coverReference');
  // }}}
};
exports.getBranchCol = function () {
  // {{{
  return database.collection('branch');
  // }}}
};
exports.getProductCol = function () {
  // {{{
  return database.collection('product');
  // }}}
};
exports.getPolProductCol = function () {
  // {{{
  return database.collection('policyProduct');
  // }}}
};
exports.getComProfileCol = function () {
  // {{{
  return database.collection('common.commissionProfile');
  // }}}
};
exports.getAssistanceCountryCol = function () {
  // {{{
  return database.collection('assistance.country');
  // }}}
};
exports.getAssistanceDraftCol = function () {
  // {{{
  return database.collection('assistance.draft');
  // }}}
};
exports.getMongoDB = function () {
  // {{{
  return mng;
  // }}}
};
exports.getComboBoxCol = function () {
  // {{{
  return database.collection('common.comboBox');
  // }}}
};
exports.getFrontierInsuranceContractCol = function () {
  // {{{
  return database.collection('auto.frontierInsurance.contract');
  // }}}
};
exports.getAssistancePolicyCol = function () {
  // {{{
  return database.collection('assistance.policy');
  // }}}
};
exports.getFinanceSplipsCol = function () {
  // {{{
  return database.collection('finance.splips');
  // }}}
};

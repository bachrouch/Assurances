/* vim: fdm=marker
 */
var seq = require('../seq');
var mongo = require('../../mongo');

function taxesToArray(o) {
  // {{{
  var res = [];
  for (var tax in o) {
    res.push({
      code: tax,
      amount: o[tax]
    });
  }
  return res;
  // }}}
}

function finalize(rec) {
  // {{{
  rec.summary.premium = 0;
  rec.summary.premiumCommission = 0;
  var premiumTaxes = {};
  rec.coverages.map(function (coverage) {
    rec.summary.premium += coverage.amount;
    rec.summary.premiumCommission += coverage.commission;
    coverage.taxes.map(function (tax) {
      premiumTaxes[tax.code] = (premiumTaxes[tax.code] || 0) + tax.amount;
    });
  });
  rec.summary.premiumTaxes = taxesToArray(premiumTaxes);
  var taxes = {};
  rec.summary.premiumTaxes.map(function (tax) {
    taxes[tax.code] = (taxes[tax.code] || 0) + tax.amount;
  });
  rec.summary.feesTaxes.map(function (tax) {
    taxes[tax.code] = (taxes[tax.code] || 0) + tax.amount;
  });
  rec.summary.taxes = taxesToArray(taxes);
  rec.summary.amount = rec.summary.premium + rec.summary.fees;
  rec.summary.commission = rec.summary.premiumCommission + rec.summary.feesCommission;
  rec.summary.total = rec.summary.amount + rec.summary.taxes.reduce(function (
    memo, tax) {
    return memo + tax.amount;
  }, 0) + rec.summary.stamps.reduce(function (memo, stamp) {
    return memo + stamp.amount;
  }, 0);
  rec.recovery = {
    due: rec.summary.total,
    parts: []
  };
  // }}}
}

function insert(receipt, cb) {
  // {{{
  mongo.getFinanceReceiptCol()
    .insert(receipt, cb);
  // }}}
}

function create(receipt, cb) {
  // {{{
  seq.generateRef('receipt', function (err, ref) {
    if (err) {
      cb(err);
    }
    else {
      receipt.def.ref = ref;
      insert(receipt, cb);
    }
  });
  // }}}
}

function read(id, cb) {
  // {{{
  mongo.getFinanceReceiptCol()
    .findOne({
      'def.ref': id
    }, function (err, receipt) {
      if (err) {
        cb(err);
      }
      else {
        if (receipt) {
          cb(null, receipt);
        }
        else {
          cb('la quittance n\'existe pas dans la base de données');
        }
      }
    });
  // }}}
}
exports.finalize = finalize;
exports.insert = insert;
exports.create = create;
exports.read = read;

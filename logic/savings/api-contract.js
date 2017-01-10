/* vim: fdm=marker
 */
var mongo = require('../../mongo');
var utils = require('../utils');
var val = require('../val');
var seq = require('../seq');
var constants = require('../constants');
var models = require('./models');
var draft = require('./api-draft');
var PRODUCTEP = '506';
var PRODUCTEPR = '504';
var _ = require('underscore');
var ObjectID = require('mongodb')
  .ObjectID;

function check(contract, errors) {
  // {{{
  draft.check(contract, errors);
  var lifeBen = contract.lifeBen.reduce(function (memo, ben) {
    return memo + ben.percent;
  }, 0);
  if (lifeBen !== 1) {
    errors.lifeBen = 'la somme des parts doit être égale à 100%';
  }
  var deathBen = contract.deathBen.reduce(function (memo, ben) {
    return memo + ben.percent;
  }, 0);
  if (deathBen !== 1) {
    errors.deathBen = 'la somme des parts doit être égale à 100%';
  }
  var paid = 0;
  contract.settlements.forEach(function (stlm, i) {
    paid += stlm.amount;
    if (stlm.mode !== 'cash' && !stlm.name) {
      errors['settlements.' + i + '.name'] =
        'donnée obligatoire pour les règlements hors espèce';
    }
  });
  if (contract.payment.mode === 'debit') {
    if (!utils.isValidBankAccount(contract.payment.bankAccount)) {
      errors.bankAccount = 'clé non valide';
    }
    if (!contract.payment.bankAccount) {
      errors.bankAccount = 'le rib doit être saisi';
    }
  }
  var depositPerMonth = contract.deposit.periodic * 12 / contract.deposit.period;
  if ((!contract.admin.withoutDebit) || ((contract.admin.withoutDebit) && (
      depositPerMonth < contract.admin.minForDebit))) {
    if (((contract.deposit.period === 12) || (contract.deposit.period === 4)) &&
      (contract.payment.mode !== 'debit')) {
      errors.payment = 'Le mode de paiement doit être prélèvement';
    }
  }
  var toPay = 0;
  if (contract.deposit.initial) {
    toPay += contract.deposit.initial;
  }
  if (contract.deposit.periodic) {
    toPay += contract.deposit.periodic;
  }
  toPay += contract.admin.feesIni + contract.admin.feesDep;
  if (toPay > paid) {
    errors.settlements = 'le montant à payer doit être = ' + toPay;
  }
  //check free deposit
  var freeList = contract.deposit.free;
  freeList.map(function (free) {
    if ((free.com > contract.admin.depFreeMaxComRate) || (free.com <
        contract.admin.depFreeMinComRate)) {
      errors.deposit = 'La commission du versement libre doit être entre ' +
        contract.admin.depFreeMinComRate + ' et ' + contract.admin.depFreeMaxComRate;
    }
    if ((free.amount <= 0) || (!free.amount)) {
      errors.deposit = 'Le montant du versement libre doit être saisi ';
    }
  });
  // }}}
}

function validate(contract) {
  // {{{
  var errors = val(models.contractDesc, contract);
  if (utils.isEmpty(errors)) {
    check(contract, errors);
  }
  return errors;
  // }}}
}

function validateForExisting(contract) {
  // {{{
  var errors = val(models.contractDesc, contract);
  return errors;
  // }}}
}

function insert(contract, cb) {
  // {{{
  mongo.getSavingsContractCol()
    .insert(contract, function (err, contracts) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, contracts[0]);
      }
    });
  // }}}
}

function create(contract, cb) {
  // {{{
  var PRODUCT;
  if (contract.terms.length > 0) {
    PRODUCT = PRODUCTEP;
  }
  else {
    PRODUCT = PRODUCTEPR;
  }
  seq.generateRef(PRODUCT, function (err, ref) {
    if (err) {
      cb(err);
    }
    else {
      contract.def.ref = ref;
      contract.def.ver = 0;
      contract.def.status = constants.cActive;
      if (PRODUCT === PRODUCTEPR) {
        contract.def.nature = constants.cContract;
      }
      else {
        contract.def.nature = constants.cBinder;
      }
      insert(contract, cb);
    }
  });
  // }}}
}

function findOne(criteria, ctx, cb) {
  // {{{
  var query = {};
  var user = ctx.user;
  var ref = parseInt(criteria.ref);
  query['def.ref'] = ref;
  if (!user.savingsAdmin) {
    query['def.user.pos.code'] = user.pos.code;
  }
  mongo.getSavingsContractCol()
    .findOne(query, {
      sort: {
        'def.ver': -1
      }
    }, function (err, contract) {
      if (err) {
        cb(err);
      }
      else {
        if (contract) {
          cb(null, contract);
        }
        else {
          cb('le contrat n\'existe pas dans la base de données');
        }
      }
    });
  // }}}
}

function getContracts(policies, criteria, cb) {
  var policiesSize = policies.length;
  var i = 0;
  var fields = {
    'def.ref': 1,
    'def.ver': 1,
    'def.effDate': 1,
    'def.user': 1,
    'def.status': 1,
    'subscriber.name': 1,
    'subscriber.firstName': 1,
    'insured.name': 1,
    'insured.firstName': 1,
    'deposit.initial': 1,
    'deposit.periodic': 1
  };
  var data = [];
  if (policiesSize === 0) {
    cb(null, data);
  }
  _.each(policies, function (pol) {
    var query = {};
    if (criteria.policyStatus) {
      query['def.status'] = criteria.policyStatus;
    }
    query['def.ref'] = pol._id;
    query['def.ver'] = pol.ver;
    mongo.getSavingsContractCol()
      .findOne(query, fields, function (err, contract) {
        if (err) {
          cb(err);
        }
        else {
          i++;
          if (contract) {
            data.push(contract);
          }
          if (i === policiesSize) {
            cb(null, data);
          }
        }
      });
  });
}

function search(criteria, ctx, cb) {
  //{{{
  var query = {};
  var user = ctx.user;
  if (!user.savingsAdmin) {
    query['def.user.pos.code'] = user.pos.code;
  }
  if (criteria.ref) {
    query['def.ref'] = parseInt(criteria.ref);
  }
  if (criteria.id) {
    query['subscriber.id'] = criteria.id;
  }
  if (criteria.subscriberFirstName) {
    query['subscriber.firstName'] = new RegExp('^' + criteria.subscriberFirstName,
      'i');
  }
  if (criteria.subscriberName) {
    query['subscriber.name'] = new RegExp('^' + criteria.subscriberName, 'i');
  }
  if (criteria.insuredFirstName) {
    query['insured.firstName'] = new RegExp('^' + criteria.insuredFirstName,
      'i');
  }
  if (criteria.insuredName) {
    query['insured.name'] = new RegExp('^' + criteria.insuredName, 'i');
  }
  if (criteria.effDate) {
    query['def.effDate'] = {
      $gte: utils.dateToJSON(criteria.effDate)
    };
  }
  var fields = {
    'def.ref': 1,
    'def.ver': 1,
    'def.effDate': 1,
    'def.user': 1,
    'def.status': 1,
    'subscriber.name': 1,
    'subscriber.firstName': 1,
    'insured.name': 1,
    'insured.firstName': 1,
    'deposit.initial': 1,
    'deposit.periodic': 1
  };
  mongo.getSavingsContractCol()
    .aggregate([{
      $match: query
    }, {
      $sort: {
        'def.effDate': 1
      }
    }, {
      $project: fields
    }, {
      $group: {
        '_id': '$def.ref',
        'ver': {
          $max: '$def.ver'
        }
      }
    }], function (err, policies) {
      if (err) {
        cb(err);
      }
      else {
        getContracts(policies, criteria, function (err, data) {
          if (err) {
            cb(err);
          }
          else {
            cb(null, data);
          }
        });
      }
    });
  //}}}
}

function insertMvt(freeDep, mvts, index) {
  var date = freeDep.effDate;
  var i = 0;
  while ((date >= (mvts[i].date)) && (i < (mvts.length - 1))) {
    i++;
  }
  var amount = freeDep.amount;
  var commission = amount * freeDep.com;
  commission = utils.fixNumber(commission, 4);
  var dep = {
    type: 'dep',
    name: 'free-' + index,
    date: date,
    amount: amount,
    generated: true
  };
  var com = {};
  if (commission > 0) {
    com = {
      type: 'com',
      name: 'free-' + index,
      date: date,
      amount: -commission
    };
  }
  mvts.splice(i, 0, dep, com);
  return (mvts);
}

function update(pol, id, cb) {
  //{{{
  mongo.getSavingsContractCol()
    .findAndModify({
      _id: new ObjectID(id)
    }, null, {
      $set: pol
    }, {
      new: true
    }, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, pol);
      }
    });
  //}}}
}
exports.check = check;
exports.validate = validate;
exports.validateForExisting = validateForExisting;
exports.insert = insert;
exports.create = create;
exports.findOne = findOne;
exports.search = search;
exports.update = update;
exports.insertMvt = insertMvt;

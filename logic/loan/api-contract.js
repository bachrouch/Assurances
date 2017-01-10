/* vim: fdm=marker
 */
var _ = require('underscore');
var ObjectID = require('mongodb')
  .ObjectID;
var mongo = require('../../mongo');
var utils = require('../utils');
var val = require('../val');
var seq = require('../seq');
var constants = require('../constants');
var models = require('./models');
var draft = require('./api-draft');
var PRODUCT = '501';

function check(contract, errors) {
  // {{{
  draft.check(contract, errors);
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

function insert(contract, cb) {
  // {{{
  mongo.getLoanContractCol()
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
  seq.generateRef(PRODUCT, function (err, ref) {
    if (err) {
      cb(err);
    }
    else {
      contract.def.ref = ref;
      contract.def.ver = 0;
      contract.def.status = constants.cActive;
      contract.def.nature = constants.cContract;
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
  mongo.getLoanContractCol()
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
    mongo.getLoanContractCol()
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
  mongo.getLoanContractCol()
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

function update(pol, id, cb) {
  //{{{
  mongo.getLoanContractCol()
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
exports.insert = insert;
exports.create = create;
exports.findOne = findOne;
exports.search = search;
exports.update = update;

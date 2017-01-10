/* vim: fdm=marker
 */
var mongo = require('../../mongo');
var utils = require('../utils');
var val = require('../val');
var seq = require('../seq');
var models = require('./models');
var draft = require('./api-draft');
var PRODUCTEP = 'Q506';
var PRODUCTEPR = 'Q504';

function check(quote, errors) {
  // {{{
  draft.check(quote, errors);
  // }}}
}

function validate(quote) {
  // {{{
  var errors = val(models.quoteDesc, quote);
  if (utils.isEmpty(errors)) {
    check(quote, errors);
  }
  return errors;
  // }}}
}

function insert(quote, cb) {
  // {{{
  mongo.getSavingsQuoteCol()
    .insert(quote, function (err, quotes) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, quotes[0]);
      }
    });
  // }}}
}

function create(quote, cb) {
  // {{{
  var PRODUCT;
  if (quote.terms.length > 0) {
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
      quote.def.ref = ref;
      insert(quote, cb);
    }
  });
  // }}}
}

function findOne(ref, ctx, cb) {
  // {{{
  var query = {};
  var user = ctx.user;
  query['def.ref'] = ref;
  if (!user.savingsAdmin) {
    query['def.user.pos.code'] = user.pos.code;
  }
  mongo.getSavingsQuoteCol()
    .findOne(query, function (err, quote) {
      if (err) {
        cb(err);
      }
      else {
        if (quote) {
          cb(null, quote);
        }
        else {
          cb('le devis n\'existe pas dans la base de données');
        }
      }
    });
  // }}}
}

function search(criteria, ctx, cb) {
  //{{{
  var query = {};
  var user = ctx.user;
  if (!user.savingsBack) {
    query['def.user.pos.code'] = user.pos.code;
  }
  if (criteria.ref) {
    query['def.ref'] = criteria.ref.toString();
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
    'def.ref': true,
    'def.effDate': true,
    'def.user': true,
    'subscriber.name': true,
    'subscriber.firstName': true,
    'insured.name': true,
    'insured.firstName': true,
    'deposit.initial': true,
    'deposit.periodic': true
  };
  mongo.getSavingsQuoteCol()
    .find(query, fields, {
      sort: {
        'def.effDate': -1
      }
    }, function (err, cursor) {
      if (err) {
        cb(err);
      }
      else {
        cursor.toArray(function (err, results) {
          if (err) {
            cb(err);
          }
          else {
            cb(null, results);
          }
        });
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

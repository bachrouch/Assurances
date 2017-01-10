/* vim: fdm=marker
 */
var _ = require('underscore');
var session = require('../logic/session');
var utils = require('../logic/utils');
var mongo = require('../mongo');

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

function buildQuery(criteria, posCode) {
  var query = {};
  query['def.user.pos.code'] = posCode;
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
  return query;
}

function _exemptionSearch(req, callback) {
  var criteria;
  var posCode = req.session.user.pos.code;
  criteria = req.body.criteria;
  var query = {};
  query = buildQuery(criteria, posCode);
  var cursor = mongo.getExemptionCol()
    .find(query)
    .sort('def.ref', -1);
  callback(null, cursor);
}

function exemptionSearch(req, res) {
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

function exemptionConsult(req, res) {
  _exemptionSearch(req, function (err, cursor) {
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
      }
      else {
        if (results.length > 0) {
          if (results[0].def.user.pos.code !== req.session.user.pos.code) {
            res.send(500,
              'Vous n\'avez pas suffisamment de droits d\'accès, pour ouvrir la dérogation souhaitée!'
            );
          }
          else {
            res.send(_.map(results, exemptionToJSON));
          }
        }
        else {
          res.send(500,
            'Vous n\'avez pas suffisamment de droits d\'accès, pour ouvrir la dérogation souhaitée!'
          );
        }
      }
    });
  });
}
exports.declare = function (app) {
  app.post('/svc/exemption/exemptionSearch', session.ensureAuth,
    exemptionSearch);
  app.post('/svc/exemption/exemptionConsult', session.ensureAuth,
    exemptionConsult);
};

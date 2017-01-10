/* vim: fdm=marker
 */
var mongo = require('../../mongo');
var moment = require('moment');
var ObjectID = require('mongodb')
  .ObjectID;
var utils = require('../utils');
var val = require('../val');
var models = require('./models');

function check(draft, errors) {
  // {{{
  // check terms
  var len = draft.terms.length;
  if (len === 0) {
    errors['Garantie '] = 'Aucune garantie n\'est souscrite';
  }
  // check insured age
  var insuredAge = moment(new Date())
    .diff(moment(draft.insured.birthDate), 'year');
  if ((draft.terms.length > 0) && (insuredAge > 70)) {
    errors['Age assuré'] = 'l\'âge de l\'assuré doit être <= 70 ans';
  }
  // check term Surv Adjust
  if ((draft.adjustement.termSurvAdjust < draft.admin.termSurvAdjustMin) || (
      draft.adjustement.termSurvAdjust > draft.admin.termSurvAdjustMax)) {
    errors['Abattement '] = 'L\'abattement doit être entre ' + draft.admin.termSurvAdjustMin +
      ' et ' + draft.admin.termSurvAdjustMax;
  }
  // check com
  if (draft.adjustement.com > draft.admin.com) {
    errors['Commission '] = 'La commission ne doit pas dépasser ' + draft.admin
      .com;
  }
  // }}}
}

function validate(draft) {
  // {{{
  var errors = val(models.draftDesc, draft);
  if (utils.isEmpty(errors)) {
    check(draft, errors);
  }
  return errors;
  // }}}
}

function insert(draft, cb) {
  // {{{
  mongo.getLoanDraftCol()
    .insert(draft, function (err, drafts) {
      if (err) {
        cb(err);
      }
      else {
        cb(null, drafts[0]);
      }
    });
  // }}}
}

function findOne(id, cb) {
  // {{{
  mongo.getLoanDraftCol()
    .findOne({
      _id: new ObjectID(id)
    }, function (err, draft) {
      if (err) {
        cb(err);
      }
      else {
        if (draft) {
          cb(null, draft);
        }
        else {
          cb('le draft n\'existe pas dans la base de données');
        }
      }
    });
  // }}}
}

function update(id, draft, cb) {
  // {{{
  delete draft.admin;
  mongo.getLoanDraftCol()
    .findAndModify({
      _id: new ObjectID(id)
    }, null, {
      $set: draft
    }, {
      new: true
    }, cb);
  // }}}
}

function admin(id, draft, cb) {
  // {{{
  mongo.getLoanDraftCol()
    .findAndModify({
      _id: new ObjectID(id)
    }, null, {
      $set: {
        admin: draft.admin,
        history: draft.history
      }
    }, {
      new: true
    }, cb);
  // }}}
}

function remove(id, cb) {
  // {{{
  mongo.getLoanDraftCol()
    .remove({
      _id: new ObjectID(id)
    }, cb);
  // }}}
}
exports.check = check;
exports.validate = validate;
exports.insert = insert;
exports.findOne = findOne;
exports.update = update;
exports.admin = admin;
exports.remove = remove;

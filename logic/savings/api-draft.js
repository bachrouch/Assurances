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
  if (!(draft.deposit.initial || draft.deposit.periodic)) {
    errors.deposit = 'aucun type de versement n\'est saisi';
  }
  else if (draft.deposit.periodic) {
    if (!draft.deposit.period) {
      errors['deposit.period'] =
        'donnée obligatoire pour le versement périodique';
    }
    else {
      if (draft.deposit.periodic * draft.deposit.period < draft.admin.depPerMin) {
        errors['deposit.period'] = 'le versement annuel total doit être >= ' +
          draft.admin.depPerMin;
      }
    }
    if (!draft.deposit.number) {
      errors['deposit.number'] =
        'donnée obligatoire pour le versement périodique';
    }
  }
  if (draft.deposit.initial < draft.admin.depIniMin) {
    errors['deposit.initial'] = 'le versement initial doit être >= ' + draft.admin
      .depIniMin;
  }
  // check terms
  var type;
  var i = 0;
  var len = draft.terms.length;
  if (len > 0) {
    while (i < (len - 1) && draft.terms[i].evt !== 'd') {
      i++;
    }
    if (draft.terms[i].evt === 'd') {
      type = draft.terms[i].type;
    }
    if (type === 'f') {
      draft.terms.forEach(function (t) {
        if (t.type !== type) {
          errors['garantie ' + t.evt] = 'le type doit être ' + type;
        }
      });
    }
  }
  // check insured age
  var insuredAge = moment(new Date())
    .diff(moment(draft.insured.birthDate), 'year');
  if ((draft.terms.length > 0) && (insuredAge > 70)) {
    errors['Age assuré'] = 'l\'âge de l\'assuré doit être <= 70 ans';
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
  mongo.getSavingsDraftCol()
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
  mongo.getSavingsDraftCol()
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
  mongo.getSavingsDraftCol()
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
  mongo.getSavingsDraftCol()
    .findAndModify({
      _id: new ObjectID(id)
    }, null, {
      $set: {
        admin: draft.admin
      }
    }, {
      new: true
    }, cb);
  // }}}
}

function depPerComRate(id, draft, cb) {
  // {{{
  mongo.getSavingsDraftCol()
    .findAndModify({
      _id: new ObjectID(id)
    }, null, {
      $set: {
        'admin.depPerComRate': draft.admin.depPerComRate
      }
    }, {
      new: true
    }, cb);
  // }}}
}

function remove(id, cb) {
  // {{{
  mongo.getSavingsDraftCol()
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
exports.depPerComRate = depPerComRate;
exports.remove = remove;

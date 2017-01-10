/* vim: fdm=marker
 */
var _ = require('underscore');
var moment = require('moment');
var DATE_FORMAT = 'YYYY-MM-DD';
var TIME_FORMAT = 'HH:mm:ss';

function isEmpty(v) {
  return _.isUndefined(v) || _.isNull(v);
}
var validators = {
  'bool': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    if (!(_.isBoolean(value))) {
      errors[path] = 'doit être booléennes';
      return;
    }
    // }}}
  },
  'int': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    if (!(_.isNumber(value) && value % 1 === 0)) {
      errors[path] = 'doit être numérique entière';
      return;
    }
    if (!isEmpty(desc.values) && desc.values.indexOf(value) < 0) {
      errors[path] = 'doit être parmi: ' + desc.values;
      return;
    }
    if (!isEmpty(desc.min) && value < desc.min) {
      errors[path] = 'doit être >= ' + desc.min;
      return;
    }
    if (!isEmpty(desc.max) && value > desc.max) {
      errors[path] = 'doit être <= ' + desc.max;
      return;
    }
    // }}}
  },
  'num': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    if (!_.isNumber(value)) {
      errors[path] = 'doit être numérique';
      return;
    }
    if (!isEmpty(desc.values) && desc.values.indexOf(value) < 0) {
      errors[path] = 'doit être parmi ' + desc.values;
      return;
    }
    if (!isEmpty(desc.min) && value < desc.min) {
      errors[path] = 'doit être >= ' + desc.min;
      return;
    }
    if (!isEmpty(desc.max) && value > desc.max) {
      errors[path] = 'doit être <= ' + desc.max;
      return;
    }
    // }}}
  },
  'str': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    if (!_.isString(value)) {
      errors[path] = 'doit être une chaine de caractère';
      return;
    }
    if (!isEmpty(desc.values) && desc.values.indexOf(value) < 0) {
      errors[path] = 'doit être parmi ' + desc.values;
      return;
    }
    if (!isEmpty(desc.min) && value.length < desc.min) {
      errors[path] = 'doit contenir au moins ' + desc.min + ' caractères';
      return;
    }
    if (!isEmpty(desc.max) && value.length > desc.max) {
      errors[path] = 'doit contenir au plus ' + desc.max + ' caractères';
      return;
    }
    if (!isEmpty(desc.match) && !desc.match.test(value)) {
      errors[path] = 'ne correspond pas au format attendu';
      return;
    }
    // }}}
  },
  'date': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    var m, min, max;
    if (!_.isString(value) || !(m = moment(value, DATE_FORMAT))
      .isValid()) {
      errors[path] = 'doit être une chaine au format ' + DATE_FORMAT;
      return;
    }
    if (!isEmpty(desc.values) && desc.values.indexOf(value) < 0) {
      errors[path] = 'doit être parmi ' + desc.values;
      return;
    }
    if (!isEmpty(desc.younger)) {
      min = moment()
        .startOf('day')
        .add(-1 * desc.younger[0], desc.younger[1]);
      if (m.diff(min, 'day') < 0) {
        errors[path] = 'doit être >= ' + min.format(DATE_FORMAT);
        return;
      }
    }
    if (!isEmpty(desc.older)) {
      max = moment()
        .startOf('day')
        .add(-1 * desc.older[0], desc.older[1]);
      if (m.diff(max, 'day') > 0) {
        errors[path] = 'doit être <= ' + max.format(DATE_FORMAT);
        return;
      }
    }
    if (!isEmpty(desc.min)) {
      min = moment(desc.min, DATE_FORMAT);
      if (m.diff(min, 'day') < 0) {
        errors[path] = 'doit être >= ' + min.format(DATE_FORMAT);
        return;
      }
    }
    if (!isEmpty(desc.max)) {
      max = moment(desc.max, DATE_FORMAT);
      if (m.diff(max, 'day') > 0) {
        errors[path] = 'doit être <= ' + max.format(DATE_FORMAT);
        return;
      }
    }
    // }}}
  },
  'time': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    var m, min, max;
    if (!_.isString(value) || !(m = moment(value, TIME_FORMAT))
      .isValid()) {
      errors[path] = 'doit être une chaine au format ' + TIME_FORMAT;
      return;
    }
    if (!isEmpty(desc.values) && desc.values.indexOf(value) < 0) {
      errors[path] = 'doit être parmi ' + desc.values;
      return;
    }
    if (!isEmpty(desc.younger)) {
      min = moment()
        .startOf('day')
        .add(-1 * desc.younger[0], desc.younger[1]);
      if (m.diff(min, 'day') < 0) {
        errors[path] = 'doit être >= ' + min.format(TIME_FORMAT);
        return;
      }
    }
    if (!isEmpty(desc.older)) {
      max = moment()
        .startOf('day')
        .add(-1 * desc.older[0], desc.older[1]);
      if (m.diff(max, 'day') > 0) {
        errors[path] = 'doit être <= ' + max.format(TIME_FORMAT);
        return;
      }
    }
    if (!isEmpty(desc.min)) {
      min = moment(desc.min, TIME_FORMAT);
      if (m.diff(min, 'day') < 0) {
        errors[path] = 'doit être >= ' + min.format(TIME_FORMAT);
        return;
      }
    }
    if (!isEmpty(desc.max)) {
      max = moment(desc.max, TIME_FORMAT);
      if (m.diff(max, 'day') > 0) {
        errors[path] = 'doit être <= ' + max.format(TIME_FORMAT);
        return;
      }
    }
    // }}}
  },
  'obj': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    if (!_.isObject(value)) {
      errors[path] = 'doit être un objet';
      return;
    }
    var field;
    for (field in value) {
      if (isEmpty(desc.fields[field])) {
        errors[path] = 'le champ ' + field + ' n\'est pas reconnu';
      }
    }
    for (field in desc.fields) {
      _validate(desc.fields[field], value[field], (path ? path + '.' : path) +
        field, errors);
    }
    // }}}
  },
  'array': function (desc, value, path, errors) {
    // {{{
    if (isEmpty(value)) {
      if (desc.mandatory) {
        errors[path] = 'donnée obligatoire';
      }
      return;
    }
    if (!_.isArray(value)) {
      errors[path] = 'doit être un tableau';
      return;
    }
    var l = value.length;
    if (!isEmpty(desc.min) && l < desc.min) {
      errors[path] = 'doit contenir au moins ' + desc.min + ' elements';
      return;
    }
    if (!isEmpty(desc.max) && l > desc.max) {
      errors[path] = 'doit contenir au plus ' + desc.max + ' elements';
      return;
    }
    value.forEach(function (element, index) {
      _validate(desc.element, element, (path ? path + '.' : path) +
        index, errors);
    });
    // }}}
  }
};

function _validate(desc, value, path, errors) {
  // {{{
  validators[desc.type](desc, value, path, errors);
  // }}}
}

function validate(desc, value) {
  // {{{
  var errors = {};
  _validate(desc, value, '', errors);
  return errors;
  // }}}
}
validate.idRE = /^\d{8,8}$/;
validate.phoneRE = /^\d{8,8}$/;
validate.mobileRE = /^\d{8,8}$/;
validate.emailRE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
module.exports = validate;

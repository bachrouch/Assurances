/* vim: fdm=marker
 */
/* jshint proto: true */
var crypto = require('crypto');
var moment = require('moment');
var _ = require('underscore');
var uuid = require('node-uuid');
var FORMAT = 'YYYY-MM-DD';
var TIME_FORMAT = 'HH:mm:ss';
exports.isEmpty = function (o) {
  // {{{
  return Object.keys(o)
    .length === 0;
  // }}}
};
exports.mutate = function (obj, ctor) {
  // {{{
  obj.__proto__ = ctor.prototype;
  // }}}
};
exports.padInt = function (n, l) {
  // {{{
  var p = '';
  for (var i = 0; i < l; i++) {
    p += '0';
  }
  return (p + n)
    .slice(-l);
  // }}}
};
var fixNumber = exports.fixNumber = function (num, precision) {
  // {{{
  return Number(num.toFixed(precision));
  // }}}
};
exports.roundAmount = function (n) {
  // {{{
  return fixNumber(n, 3);
  // }}}
};
var fixNumberInObject = exports.fixNumberInObject = function (obj, precision) {
  // {{{
  _.each(obj, function (value, key) {
    if (_.isNumber(value)) {
      value = fixNumber(value, precision);
      obj[key] = value;
    }
    else {
      if (_.isObject(value)) {
        fixNumberInObject(value, precision);
      }
    }
  });
  return obj;
  // }}}
};
exports.formatNumber = function (num) {
  // {{{
  return num.toString()
    .replace('.', ',');
  // }}}
};
var momentToJSON = exports.momentToJSON = function (m) {
  // {{{
  return m.format(FORMAT);
  // }}}
};
exports.dateToJSON = function (date) {
  // {{{
  return momentToJSON(moment(date));
  // }}}
};
var momentFromJSON = exports.momentFromJSON = function (json) {
  // {{{
  return moment(json, FORMAT);
  // }}}
};
exports.dateFromJSON = function (json) {
  // {{{
  return momentFromJSON(json)
    .toDate();
  // }}}
};
exports.timeToJSON = function (m) {
  // {{{
  return m.format(TIME_FORMAT);
  // }}}
};
exports.range = function (start, stop, step) {
  // {{{
  if (arguments.length <= 1) {
    stop = start || 0;
    start = 0;
  }
  step = step || 1;
  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var rng = new Array(length);
  for (var idx = 0; idx < length; idx++, start += step) {
    rng[idx] = start;
  }
  return rng;
  // }}}
};
exports.fill = function (n, v) {
  // {{{
  var a = new Array(n);
  for (var i = 0; i < a.length; i++) {
    a[i] = v;
  }
  return a;
  // }}}
};
exports.sum = function (a) {
  // {{{
  return a.reduce(function (memo, v) {
    return memo + v;
  }, 0);
  // }}}
};
exports.isLeapYear = function (y) {
  // {{{
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  // }}}
};
var getBankAccountKey = exports.getBankAccountKey = function (bankAccount) {
  var bankCode = parseInt('000' + bankAccount.substr(0, 2));
  var branchCode = parseInt(bankAccount.substr(2, 5));
  var account = parseInt(bankAccount.substr(7, 11));
  var checkedKey = 89 * bankCode + 15 * branchCode + 3 * account;
  checkedKey = 97 - checkedKey % 97;
  return checkedKey;
};
exports.isValidBankAccount = function (bankAccount) {
  var result = true;
  var key = parseInt(bankAccount.substr(18, 2));
  var check = getBankAccountKey(bankAccount);
  if (check !== key) {
    result = false;
  }
  return result;
};
var getHollerithCode = exports.getHollerithCode = function (letter) {
  letter = letter.toUpperCase();
  var result;
  if (!isNaN(parseInt(letter))) {
    return letter;
  }
  switch (letter) {
  case 'A':
  case 'J':
    result = 1;
    break;
  case 'B':
  case 'K':
  case 'S':
    result = 2;
    break;
  case 'C':
  case 'L':
  case 'T':
    result = 3;
    break;
  case 'D':
  case 'M':
  case 'U':
    result = 4;
    break;
  case 'E':
  case 'N':
  case 'V':
    result = 5;
    break;
  case 'O':
  case 'W':
  case 'F':
    result = 6;
    break;
  case 'G':
  case 'P':
  case 'X':
    result = 7;
    break;
  case 'H':
  case 'Q':
  case 'Y':
    result = 8;
    break;
  case 'I':
  case 'R':
  case 'Z':
    result = 9;
    break;
  case 'F':
  case 'O':
  case 'W':
    result = 6;
    break;
  default:
    result = 0;
  }
  return result;
};
exports.getStringHollerithCode = function (data) {
  var result = data.split('');
  var code;
  var toReturn = '';
  result.map(function (letter) {
    code = getHollerithCode(letter);
    toReturn = toReturn + code.toString();
  });
  return toReturn;
};
exports.hash = function (data) {
  // {{{
  var sha1 = crypto.createHash('sha1');
  sha1.update(JSON.stringify(data));
  return sha1.digest('hex');
  // }}}
};
exports.generateUUID = function () {
  // {{{
  return uuid.v1();
  // }}}
};
exports.checkObjectTree = function (obj, key) {
  return key.split('.')
    .reduce(function (o, x) {
      return (typeof o === 'undefined' || o === null) ? o : o[x];
    }, obj);
};
exports.initCap = function (str) {
  return str.toLowerCase()
    .replace(/(?:^|\s)[a-z]/g, function (m) {
      return m.toUpperCase();
    });
};

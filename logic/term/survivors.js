/* vim: fdm=marker
 */
var utils = require('../utils');
// {{{ TD99
var td99 = [100000,
  97104,
  96869,
  96727,
  96624,
  96541,
  96471,
  96410,
  96356,
  96306,
  96258,
  96211,
  96163,
  96111,
  96052,
  95985,
  95908,
  95821,
  95722,
  95614,
  95496,
  95372,
  95242,
  95108,
  94971,
  94834,
  94696,
  94558,
  94420,
  94283,
  94145,
  94007,
  93867,
  93724,
  93578,
  93426,
  93268,
  93102,
  92926,
  92739,
  92538,
  92323,
  92089,
  91837,
  91562,
  91263,
  90937,
  90580,
  90190,
  89764,
  89297,
  88786,
  88226,
  87614,
  86944,
  86211,
  85410,
  84536,
  83582,
  82542,
  81409,
  80178,
  78842,
  77393,
  75826,
  74134,
  72312,
  70354,
  68257,
  66017,
  63632,
  61103,
  58432,
  55623,
  52686,
  49629,
  46469,
  43222,
  39911,
  36560,
  33200,
  29861,
  26580,
  23390,
  20328,
  17428,
  14722,
  12238,
  9997,
  8013,
  6292,
  4832,
  3623,
  2647,
  1876,
  1286,
  850,
  539,
  326,
  187,
  101,
  51,
  24,
  10,
  4,
  1
];
// }}}
// {{{ TV99
var tv99 = [100000,
  97660,
  97436,
  97311,
  97223,
  97156,
  97100,
  97051,
  97006,
  96964,
  96923,
  96883,
  96842,
  96800,
  96758,
  96713,
  96667,
  96619,
  96569,
  96517,
  96462,
  96405,
  96346,
  96284,
  96219,
  96151,
  96080,
  96006,
  95929,
  95849,
  95765,
  95677,
  95585,
  95488,
  95387,
  95281,
  95170,
  95052,
  94928,
  94796,
  94656,
  94508,
  94350,
  94180,
  93999,
  93804,
  93594,
  93367,
  93121,
  92854,
  92564,
  92247,
  91901,
  91523,
  91108,
  90651,
  90150,
  89597,
  88988,
  88317,
  87576,
  86757,
  85853,
  84856,
  83754,
  82540,
  81202,
  79729,
  78111,
  76337,
  74395,
  72275,
  69969,
  67469,
  64770,
  61869,
  58769,
  55474,
  51997,
  48356,
  44576,
  40689,
  36735,
  32762,
  28823,
  24976,
  21282,
  17799,
  14583,
  11679,
  9122,
  6931,
  5110,
  3645,
  2498,
  1637,
  1019,
  597,
  326,
  164,
  75,
  30,
  10,
  3,
  1,
  0
];
// }}}
function _getSurv(gender, birthDate, atDate, survAdjust) {
  // {{{
  var t = gender === 'f' ? tv99 : td99;
  var dob = utils.momentFromJSON(birthDate);
  var d = utils.momentFromJSON(atDate);
  if (d.diff(dob, 'day') < 0) {
    throw new Error('Une personne née le ' + birthDate +
      ' ne peut être en vie le ' + atDate);
  }
  var years = d.diff(dob, 'year');
  dob.add(years, 'year');
  var year = utils.momentFromJSON(atDate)
    .year();
  var leap = utils.isLeapYear(year);
  var nbDays = 365;
  if (leap) {
    nbDays = 366;
  }
  var days = d.diff(dob, 'day');
  var surv = t[years] - (t[years] - t[years + 1]) * days / nbDays;
  return surv + (100000 - surv) * survAdjust;
  // }}}
}

function _getFactor(type) {
  // {{{
  var DEATH_FACTOR = 1;
  var ACC_DEATH_FACTOR = 0.15 * DEATH_FACTOR;
  var INVAL_FACTOR = 0.3 * DEATH_FACTOR;
  var ACC_INVAL_FACTOR = 0.15 * INVAL_FACTOR;
  switch (type) {
  case 'd':
    return DEATH_FACTOR;
  case 'ad':
    return ACC_DEATH_FACTOR;
  case 'i':
    return INVAL_FACTOR;
  case 'ai':
    return ACC_INVAL_FACTOR;
  default:
    throw new Error('unknown event: ' + type);
  }
  // }}}
}
module.exports = function (type, gender, birthDate, atDate, survAdjust) {
  // {{{
  var surv = _getSurv(gender, birthDate, atDate, survAdjust);
  var factor = _getFactor(type);
  return surv + (100000 - surv) * (1 - factor);
  // }}}
};

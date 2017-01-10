/* vim: fdm=marker
 */
/* {{{ Requires */
var _ = require('underscore');
var _str = require('underscore.string');
var moment = require('moment');
var models = require('./models');
var utils = require('../utils');
var rules = require('./rules');
var draft = require('./api-draft');
var mongo = require('../../mongo');
var email = require('../email');
//var quote = require('./api-quote');
//var contract = require('./api-contract');
/* }}} */
/* {{{ TD99 */
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
/* }}} */
/* {{{ TARIF PLANCHER */
var plancher = [{
  age: 20,
  duration: 1,
  value: 0.72
}, {
  age: 20,
  duration: 2,
  value: 1.4
}, {
  age: 20,
  duration: 3,
  value: 2.07
}, {
  age: 20,
  duration: 4,
  value: 2.75
}, {
  age: 20,
  duration: 5,
  value: 3.4
}, {
  age: 20,
  duration: 6,
  value: 4.05
}, {
  age: 20,
  duration: 7,
  value: 4.68
}, {
  age: 20,
  duration: 8,
  value: 5.3
}, {
  age: 20,
  duration: 9,
  value: 5.91
}, {
  age: 20,
  duration: 10,
  value: 6.49
}, {
  age: 20,
  duration: 11,
  value: 7.07
}, {
  age: 20,
  duration: 12,
  value: 7.63
}, {
  age: 20,
  duration: 13,
  value: 8.18
}, {
  age: 20,
  duration: 14,
  value: 8.72
}, {
  age: 20,
  duration: 15,
  value: 9.25
}, {
  age: 20,
  duration: 16,
  value: 9.77
}, {
  age: 20,
  duration: 17,
  value: 10.29
}, {
  age: 20,
  duration: 18,
  value: 10.8
}, {
  age: 20,
  duration: 19,
  value: 11.31
}, {
  age: 20,
  duration: 20,
  value: 11.82
}, {
  age: 20,
  duration: 21,
  value: 12.33
}, {
  age: 20,
  duration: 22,
  value: 12.84
}, {
  age: 20,
  duration: 23,
  value: 13.35
}, {
  age: 20,
  duration: 24,
  value: 13.87
}, {
  age: 20,
  duration: 25,
  value: 14.4
}, {
  age: 21,
  duration: 1,
  value: 0.76
}, {
  age: 21,
  duration: 2,
  value: 1.46
}, {
  age: 21,
  duration: 3,
  value: 2.15
}, {
  age: 21,
  duration: 4,
  value: 2.84
}, {
  age: 21,
  duration: 5,
  value: 3.51
}, {
  age: 21,
  duration: 6,
  value: 4.16
}, {
  age: 21,
  duration: 7,
  value: 4.8
}, {
  age: 21,
  duration: 8,
  value: 5.42
}, {
  age: 21,
  duration: 9,
  value: 6.03
}, {
  age: 21,
  duration: 10,
  value: 6.62
}, {
  age: 21,
  duration: 11,
  value: 7.2
}, {
  age: 21,
  duration: 12,
  value: 7.76
}, {
  age: 21,
  duration: 13,
  value: 8.32
}, {
  age: 21,
  duration: 14,
  value: 8.86
}, {
  age: 21,
  duration: 15,
  value: 9.4
}, {
  age: 21,
  duration: 16,
  value: 9.93
}, {
  age: 21,
  duration: 17,
  value: 10.46
}, {
  age: 21,
  duration: 18,
  value: 10.99
}, {
  age: 21,
  duration: 19,
  value: 11.51
}, {
  age: 21,
  duration: 20,
  value: 12.04
}, {
  age: 21,
  duration: 21,
  value: 12.56
}, {
  age: 21,
  duration: 22,
  value: 13.1
}, {
  age: 21,
  duration: 23,
  value: 13.63
}, {
  age: 21,
  duration: 24,
  value: 14.18
}, {
  age: 21,
  duration: 25,
  value: 14.73
}, {
  age: 22,
  duration: 1,
  value: 0.78
}, {
  age: 22,
  duration: 2,
  value: 1.5
}, {
  age: 22,
  duration: 3,
  value: 2.21
}, {
  age: 22,
  duration: 4,
  value: 2.9
}, {
  age: 22,
  duration: 5,
  value: 3.57
}, {
  age: 22,
  duration: 6,
  value: 4.23
}, {
  age: 22,
  duration: 7,
  value: 4.87
}, {
  age: 22,
  duration: 8,
  value: 5.49
}, {
  age: 22,
  duration: 9,
  value: 6.1
}, {
  age: 22,
  duration: 10,
  value: 6.7
}, {
  age: 22,
  duration: 11,
  value: 7.28
}, {
  age: 22,
  duration: 12,
  value: 7.85
}, {
  age: 22,
  duration: 13,
  value: 8.41
}, {
  age: 22,
  duration: 14,
  value: 8.96
}, {
  age: 22,
  duration: 15,
  value: 9.51
}, {
  age: 22,
  duration: 16,
  value: 10.06
}, {
  age: 22,
  duration: 17,
  value: 10.6
}, {
  age: 22,
  duration: 18,
  value: 11.14
}, {
  age: 22,
  duration: 19,
  value: 11.68
}, {
  age: 22,
  duration: 20,
  value: 12.23
}, {
  age: 22,
  duration: 21,
  value: 12.78
}, {
  age: 22,
  duration: 22,
  value: 13.34
}, {
  age: 22,
  duration: 23,
  value: 13.9
}, {
  age: 22,
  duration: 24,
  value: 14.48
}, {
  age: 22,
  duration: 25,
  value: 15.06
}, {
  age: 23,
  duration: 1,
  value: 0.79
}, {
  age: 23,
  duration: 2,
  value: 1.52
}, {
  age: 23,
  duration: 3,
  value: 2.23
}, {
  age: 23,
  duration: 4,
  value: 2.93
}, {
  age: 23,
  duration: 5,
  value: 3.6
}, {
  age: 23,
  duration: 6,
  value: 4.27
}, {
  age: 23,
  duration: 7,
  value: 4.9
}, {
  age: 23,
  duration: 8,
  value: 5.53
}, {
  age: 23,
  duration: 9,
  value: 6.14
}, {
  age: 23,
  duration: 10,
  value: 6.74
}, {
  age: 23,
  duration: 11,
  value: 7.33
}, {
  age: 23,
  duration: 12,
  value: 7.91
}, {
  age: 23,
  duration: 13,
  value: 8.48
}, {
  age: 23,
  duration: 14,
  value: 9.04
}, {
  age: 23,
  duration: 15,
  value: 9.6
}, {
  age: 23,
  duration: 16,
  value: 10.16
}, {
  age: 23,
  duration: 17,
  value: 10.72
}, {
  age: 23,
  duration: 18,
  value: 11.29
}, {
  age: 23,
  duration: 19,
  value: 11.85
}, {
  age: 23,
  duration: 20,
  value: 12.42
}, {
  age: 23,
  duration: 21,
  value: 13
}, {
  age: 23,
  duration: 22,
  value: 13.59
}, {
  age: 23,
  duration: 23,
  value: 14.18
}, {
  age: 23,
  duration: 24,
  value: 14.8
}, {
  age: 23,
  duration: 25,
  value: 15.41
}, {
  age: 24,
  duration: 1,
  value: 0.8
}, {
  age: 24,
  duration: 2,
  value: 1.53
}, {
  age: 24,
  duration: 3,
  value: 2.24
}, {
  age: 24,
  duration: 4,
  value: 2.94
}, {
  age: 24,
  duration: 5,
  value: 3.61
}, {
  age: 24,
  duration: 6,
  value: 4.28
}, {
  age: 24,
  duration: 7,
  value: 4.92
}, {
  age: 24,
  duration: 8,
  value: 5.55
}, {
  age: 24,
  duration: 9,
  value: 6.17
}, {
  age: 24,
  duration: 10,
  value: 6.77
}, {
  age: 24,
  duration: 11,
  value: 7.36
}, {
  age: 24,
  duration: 12,
  value: 7.95
}, {
  age: 24,
  duration: 13,
  value: 8.53
}, {
  age: 24,
  duration: 14,
  value: 9.11
}, {
  age: 24,
  duration: 15,
  value: 9.69
}, {
  age: 24,
  duration: 16,
  value: 10.27
}, {
  age: 24,
  duration: 17,
  value: 10.85
}, {
  age: 24,
  duration: 18,
  value: 11.44
}, {
  age: 24,
  duration: 19,
  value: 12.03
}, {
  age: 24,
  duration: 20,
  value: 12.63
}, {
  age: 24,
  duration: 21,
  value: 13.24
}, {
  age: 24,
  duration: 22,
  value: 13.86
}, {
  age: 24,
  duration: 23,
  value: 14.5
}, {
  age: 24,
  duration: 24,
  value: 15.14
}, {
  age: 24,
  duration: 25,
  value: 15.81
}, {
  age: 25,
  duration: 1,
  value: 0.807
}, {
  age: 25,
  duration: 2,
  value: 1.54
}, {
  age: 25,
  duration: 3,
  value: 2.25
}, {
  age: 25,
  duration: 4,
  value: 2.953
}, {
  age: 25,
  duration: 5,
  value: 3.63
}, {
  age: 25,
  duration: 6,
  value: 4.292
}, {
  age: 25,
  duration: 7,
  value: 4.94
}, {
  age: 25,
  duration: 8,
  value: 5.57
}, {
  age: 25,
  duration: 9,
  value: 6.19
}, {
  age: 25,
  duration: 10,
  value: 6.8
}, {
  age: 25,
  duration: 11,
  value: 7.41
}, {
  age: 25,
  duration: 12,
  value: 8.01
}, {
  age: 25,
  duration: 13,
  value: 8.61
}, {
  age: 25,
  duration: 14,
  value: 9.2
}, {
  age: 25,
  duration: 15,
  value: 9.8
}, {
  age: 25,
  duration: 16,
  value: 10.41
}, {
  age: 25,
  duration: 17,
  value: 11.02
}, {
  age: 25,
  duration: 18,
  value: 11.63
}, {
  age: 25,
  duration: 19,
  value: 12.25
}, {
  age: 25,
  duration: 20,
  value: 12.89
}, {
  age: 25,
  duration: 21,
  value: 13.54
}, {
  age: 25,
  duration: 22,
  value: 14.2
}, {
  age: 25,
  duration: 23,
  value: 14.87
}, {
  age: 25,
  duration: 24,
  value: 15.56
}, {
  age: 25,
  duration: 25,
  value: 16.27
}, {
  age: 26,
  duration: 1,
  value: 0.808
}, {
  age: 26,
  duration: 2,
  value: 1.543
}, {
  age: 26,
  duration: 3,
  value: 2.258
}, {
  age: 26,
  duration: 4,
  value: 2.954
}, {
  age: 26,
  duration: 5,
  value: 3.634
}, {
  age: 26,
  duration: 6,
  value: 4.297
}, {
  age: 26,
  duration: 7,
  value: 4.948
}, {
  age: 26,
  duration: 8,
  value: 5.58
}, {
  age: 26,
  duration: 9,
  value: 6.21
}, {
  age: 26,
  duration: 10,
  value: 6.84
}, {
  age: 26,
  duration: 11,
  value: 7.46
}, {
  age: 26,
  duration: 12,
  value: 8.08
}, {
  age: 26,
  duration: 13,
  value: 8.7
}, {
  age: 26,
  duration: 14,
  value: 9.38
}, {
  age: 26,
  duration: 15,
  value: 9.95
}, {
  age: 26,
  duration: 16,
  value: 10.57
}, {
  age: 26,
  duration: 17,
  value: 11.21
}, {
  age: 26,
  duration: 18,
  value: 11.86
}, {
  age: 26,
  duration: 19,
  value: 12.52
}, {
  age: 26,
  duration: 20,
  value: 13.2
}, {
  age: 26,
  duration: 21,
  value: 13.89
}, {
  age: 26,
  duration: 22,
  value: 14.6
}, {
  age: 26,
  duration: 23,
  value: 15.31
}, {
  age: 26,
  duration: 24,
  value: 16.06
}, {
  age: 26,
  duration: 25,
  value: 16.82
}, {
  age: 27,
  duration: 1,
  value: 0.809
}, {
  age: 27,
  duration: 2,
  value: 1.543
}, {
  age: 27,
  duration: 3,
  value: 2.26
}, {
  age: 27,
  duration: 4,
  value: 2.956
}, {
  age: 27,
  duration: 5,
  value: 3.64
}, {
  age: 27,
  duration: 6,
  value: 4.3
}, {
  age: 27,
  duration: 7,
  value: 4.96
}, {
  age: 27,
  duration: 8,
  value: 5.61
}, {
  age: 27,
  duration: 9,
  value: 6.26
}, {
  age: 27,
  duration: 10,
  value: 6.9
}, {
  age: 27,
  duration: 11,
  value: 7.54
}, {
  age: 27,
  duration: 12,
  value: 8.18
}, {
  age: 27,
  duration: 13,
  value: 8.82
}, {
  age: 27,
  duration: 14,
  value: 9.47
}, {
  age: 27,
  duration: 15,
  value: 10.13
}, {
  age: 27,
  duration: 16,
  value: 10.79
}, {
  age: 27,
  duration: 17,
  value: 11.47
}, {
  age: 27,
  duration: 18,
  value: 12.16
}, {
  age: 27,
  duration: 19,
  value: 12.86
}, {
  age: 27,
  duration: 20,
  value: 13.53
}, {
  age: 27,
  duration: 21,
  value: 14.32
}, {
  age: 27,
  duration: 22,
  value: 15.07
}, {
  age: 27,
  duration: 23,
  value: 15.85
}, {
  age: 27,
  duration: 24,
  value: 16.65
}, {
  age: 27,
  duration: 25,
  value: 17.48
}, {
  age: 28,
  duration: 1,
  value: 0.805
}, {
  age: 28,
  duration: 2,
  value: 1.54
}, {
  age: 28,
  duration: 3,
  value: 2.257
}, {
  age: 28,
  duration: 4,
  value: 2.96
}, {
  age: 28,
  duration: 5,
  value: 3.65
}, {
  age: 28,
  duration: 6,
  value: 4.32
}, {
  age: 28,
  duration: 7,
  value: 5
}, {
  age: 28,
  duration: 8,
  value: 5.66
}, {
  age: 28,
  duration: 9,
  value: 6.32
}, {
  age: 28,
  duration: 10,
  value: 6.99
}, {
  age: 28,
  duration: 11,
  value: 7.65
}, {
  age: 28,
  duration: 12,
  value: 8.32
}, {
  age: 28,
  duration: 13,
  value: 8.99
}, {
  age: 28,
  duration: 14,
  value: 9.68
}, {
  age: 28,
  duration: 15,
  value: 10.37
}, {
  age: 28,
  duration: 16,
  value: 11.07
}, {
  age: 28,
  duration: 17,
  value: 11.79
}, {
  age: 28,
  duration: 18,
  value: 12.53
}, {
  age: 28,
  duration: 19,
  value: 13.28
}, {
  age: 28,
  duration: 20,
  value: 14.05
}, {
  age: 28,
  duration: 21,
  value: 14.84
}, {
  age: 28,
  duration: 22,
  value: 15.65
}, {
  age: 28,
  duration: 23,
  value: 16.5
}, {
  age: 28,
  duration: 24,
  value: 17.36
}, {
  age: 28,
  duration: 25,
  value: 18.25
}, {
  age: 29,
  duration: 1,
  value: 0.811
}, {
  age: 29,
  duration: 2,
  value: 1.55
}, {
  age: 29,
  duration: 3,
  value: 2.27
}, {
  age: 29,
  duration: 4,
  value: 2.98
}, {
  age: 29,
  duration: 5,
  value: 3.68
}, {
  age: 29,
  duration: 6,
  value: 4.37
}, {
  age: 29,
  duration: 7,
  value: 5.06
}, {
  age: 29,
  duration: 8,
  value: 5.75
}, {
  age: 29,
  duration: 9,
  value: 6.43
}, {
  age: 29,
  duration: 10,
  value: 7.12
}, {
  age: 29,
  duration: 11,
  value: 7.82
}, {
  age: 29,
  duration: 12,
  value: 8.52
}, {
  age: 29,
  duration: 13,
  value: 9.23
}, {
  age: 29,
  duration: 14,
  value: 9.95
}, {
  age: 29,
  duration: 15,
  value: 10.69
}, {
  age: 29,
  duration: 16,
  value: 11.44
}, {
  age: 29,
  duration: 17,
  value: 12.21
}, {
  age: 29,
  duration: 18,
  value: 13.08
}, {
  age: 29,
  duration: 19,
  value: 13.8
}, {
  age: 29,
  duration: 20,
  value: 14.63
}, {
  age: 29,
  duration: 21,
  value: 15.48
}, {
  age: 29,
  duration: 22,
  value: 16.36
}, {
  age: 29,
  duration: 23,
  value: 17.27
}, {
  age: 29,
  duration: 24,
  value: 18.21
}, {
  age: 29,
  duration: 25,
  value: 19.18
}, {
  age: 30,
  duration: 1,
  value: 0.813
}, {
  age: 30,
  duration: 2,
  value: 1.557
}, {
  age: 30,
  duration: 3,
  value: 2.29
}, {
  age: 30,
  duration: 4,
  value: 3.02
}, {
  age: 30,
  duration: 5,
  value: 3.73
}, {
  age: 30,
  duration: 6,
  value: 4.44
}, {
  age: 30,
  duration: 7,
  value: 5.15
}, {
  age: 30,
  duration: 8,
  value: 5.86
}, {
  age: 30,
  duration: 9,
  value: 6.58
}, {
  age: 30,
  duration: 10,
  value: 7.3
}, {
  age: 30,
  duration: 11,
  value: 8.04
}, {
  age: 30,
  duration: 12,
  value: 8.77
}, {
  age: 30,
  duration: 13,
  value: 9.53
}, {
  age: 30,
  duration: 14,
  value: 10.29
}, {
  age: 30,
  duration: 15,
  value: 11.08
}, {
  age: 30,
  duration: 16,
  value: 11.88
}, {
  age: 30,
  duration: 17,
  value: 12.71
}, {
  age: 30,
  duration: 18,
  value: 13.55
}, {
  age: 30,
  duration: 19,
  value: 14.42
}, {
  age: 30,
  duration: 20,
  value: 15.32
}, {
  age: 30,
  duration: 21,
  value: 16.24
}, {
  age: 30,
  duration: 22,
  value: 17.2
}, {
  age: 30,
  duration: 23,
  value: 18.18
}, {
  age: 30,
  duration: 24,
  value: 19.2
}, {
  age: 30,
  duration: 25,
  value: 20.25
}, {
  age: 31,
  duration: 1,
  value: 0.825
}, {
  age: 31,
  duration: 2,
  value: 1.583
}, {
  age: 31,
  duration: 3,
  value: 2.33
}, {
  age: 31,
  duration: 4,
  value: 3.07
}, {
  age: 31,
  duration: 5,
  value: 3.81
}, {
  age: 31,
  duration: 6,
  value: 4.55
}, {
  age: 31,
  duration: 7,
  value: 5.29
}, {
  age: 31,
  duration: 8,
  value: 6.03
}, {
  age: 31,
  duration: 9,
  value: 6.78
}, {
  age: 31,
  duration: 10,
  value: 7.55
}, {
  age: 31,
  duration: 11,
  value: 8.32
}, {
  age: 31,
  duration: 12,
  value: 9.11
}, {
  age: 31,
  duration: 13,
  value: 9.91
}, {
  age: 31,
  duration: 14,
  value: 10.73
}, {
  age: 31,
  duration: 15,
  value: 11.57
}, {
  age: 31,
  duration: 16,
  value: 12.44
}, {
  age: 31,
  duration: 17,
  value: 13.32
}, {
  age: 31,
  duration: 18,
  value: 14.24
}, {
  age: 31,
  duration: 19,
  value: 15.18
}, {
  age: 31,
  duration: 20,
  value: 16.15
}, {
  age: 31,
  duration: 21,
  value: 17.15
}, {
  age: 31,
  duration: 22,
  value: 18.19
}, {
  age: 31,
  duration: 23,
  value: 19.26
}, {
  age: 31,
  duration: 24,
  value: 20.36
}, {
  age: 31,
  duration: 25,
  value: 21.51
}, {
  age: 32,
  duration: 1,
  value: 0.842
}, {
  age: 32,
  duration: 2,
  value: 1.617
}, {
  age: 32,
  duration: 3,
  value: 2.38
}, {
  age: 32,
  duration: 4,
  value: 3.15
}, {
  age: 32,
  duration: 5,
  value: 3.92
}, {
  age: 32,
  duration: 6,
  value: 4.69
}, {
  age: 32,
  duration: 7,
  value: 5.46
}, {
  age: 32,
  duration: 8,
  value: 6.25
}, {
  age: 32,
  duration: 9,
  value: 7.04
}, {
  age: 32,
  duration: 10,
  value: 7.85
}, {
  age: 32,
  duration: 11,
  value: 8.67
}, {
  age: 32,
  duration: 12,
  value: 9.52
}, {
  age: 32,
  duration: 13,
  value: 10.37
}, {
  age: 32,
  duration: 14,
  value: 11.26
}, {
  age: 32,
  duration: 15,
  value: 12.16
}, {
  age: 32,
  duration: 16,
  value: 13.1
}, {
  age: 32,
  duration: 17,
  value: 14.06
}, {
  age: 32,
  duration: 18,
  value: 15.04
}, {
  age: 32,
  duration: 19,
  value: 16.07
}, {
  age: 32,
  duration: 20,
  value: 17.12
}, {
  age: 32,
  duration: 21,
  value: 18.21
}, {
  age: 32,
  duration: 22,
  value: 19.34
}, {
  age: 32,
  duration: 23,
  value: 20.5
}, {
  age: 32,
  duration: 24,
  value: 21.71
}, {
  age: 32,
  duration: 25,
  value: 22.95
}, {
  age: 33,
  duration: 1,
  value: 0.86
}, {
  age: 33,
  duration: 2,
  value: 1.65
}, {
  age: 33,
  duration: 3,
  value: 2.46
}, {
  age: 33,
  duration: 4,
  value: 3.25
}, {
  age: 33,
  duration: 5,
  value: 4.06
}, {
  age: 33,
  duration: 6,
  value: 4.86
}, {
  age: 33,
  duration: 7,
  value: 5.68
}, {
  age: 33,
  duration: 8,
  value: 6.51
}, {
  age: 33,
  duration: 9,
  value: 7.36
}, {
  age: 33,
  duration: 10,
  value: 8.22
}, {
  age: 33,
  duration: 11,
  value: 9.1
}, {
  age: 33,
  duration: 12,
  value: 10
}, {
  age: 33,
  duration: 13,
  value: 10.93
}, {
  age: 33,
  duration: 14,
  value: 11.88
}, {
  age: 33,
  duration: 15,
  value: 12.86
}, {
  age: 33,
  duration: 16,
  value: 13.87
}, {
  age: 33,
  duration: 17,
  value: 14.91
}, {
  age: 33,
  duration: 18,
  value: 15.98
}, {
  age: 33,
  duration: 19,
  value: 17.09
}, {
  age: 33,
  duration: 20,
  value: 18.24
}, {
  age: 33,
  duration: 21,
  value: 19.43
}, {
  age: 33,
  duration: 22,
  value: 20.65
}, {
  age: 33,
  duration: 23,
  value: 21.92
}, {
  age: 33,
  duration: 24,
  value: 23.24
}, {
  age: 33,
  duration: 25,
  value: 24.6
}, {
  age: 34,
  duration: 1,
  value: 0.89
}, {
  age: 34,
  duration: 2,
  value: 1.72
}, {
  age: 34,
  duration: 3,
  value: 2.55
}, {
  age: 34,
  duration: 4,
  value: 3.39
}, {
  age: 34,
  duration: 5,
  value: 4.23
}, {
  age: 34,
  duration: 6,
  value: 5.09
}, {
  age: 34,
  duration: 7,
  value: 5.96
}, {
  age: 34,
  duration: 8,
  value: 6.84
}, {
  age: 34,
  duration: 9,
  value: 7.75
}, {
  age: 34,
  duration: 10,
  value: 8.67
}, {
  age: 34,
  duration: 11,
  value: 9.62
}, {
  age: 34,
  duration: 12,
  value: 10.59
}, {
  age: 34,
  duration: 13,
  value: 11.59
}, {
  age: 34,
  duration: 14,
  value: 12.62
}, {
  age: 34,
  duration: 15,
  value: 13.69
}, {
  age: 34,
  duration: 16,
  value: 14.78
}, {
  age: 34,
  duration: 17,
  value: 15.91
}, {
  age: 34,
  duration: 18,
  value: 17.08
}, {
  age: 34,
  duration: 19,
  value: 18.29
}, {
  age: 34,
  duration: 20,
  value: 19.54
}, {
  age: 34,
  duration: 21,
  value: 20.83
}, {
  age: 34,
  duration: 22,
  value: 22.17
}, {
  age: 34,
  duration: 23,
  value: 23.55
}, {
  age: 34,
  duration: 24,
  value: 24.98
}, {
  age: 34,
  duration: 25,
  value: 26.47
}, {
  age: 35,
  duration: 1,
  value: 0.92
}, {
  age: 35,
  duration: 2,
  value: 1.79
}, {
  age: 35,
  duration: 3,
  value: 2.67
}, {
  age: 35,
  duration: 4,
  value: 3.55
}, {
  age: 35,
  duration: 5,
  value: 4.45
}, {
  age: 35,
  duration: 6,
  value: 5.36
}, {
  age: 35,
  duration: 7,
  value: 6.29
}, {
  age: 35,
  duration: 8,
  value: 7.23
}, {
  age: 35,
  duration: 9,
  value: 8.2
}, {
  age: 35,
  duration: 10,
  value: 9.2
}, {
  age: 35,
  duration: 11,
  value: 10.22
}, {
  age: 35,
  duration: 12,
  value: 11.27
}, {
  age: 35,
  duration: 13,
  value: 12.36
}, {
  age: 35,
  duration: 14,
  value: 13.48
}, {
  age: 35,
  duration: 15,
  value: 14.63
}, {
  age: 35,
  duration: 16,
  value: 15.82
}, {
  age: 35,
  duration: 17,
  value: 17.05
}, {
  age: 35,
  duration: 18,
  value: 18.32
}, {
  age: 35,
  duration: 19,
  value: 19.64
}, {
  age: 35,
  duration: 20,
  value: 21
}, {
  age: 35,
  duration: 21,
  value: 22.42
}, {
  age: 35,
  duration: 22,
  value: 23.87
}, {
  age: 35,
  duration: 23,
  value: 25.38
}, {
  age: 35,
  duration: 24,
  value: 26.95
}, {
  age: 35,
  duration: 25,
  value: 28.57
}, {
  age: 36,
  duration: 1,
  value: 0.97
}, {
  age: 36,
  duration: 2,
  value: 1.89
}, {
  age: 36,
  duration: 3,
  value: 2.81
}, {
  age: 36,
  duration: 4,
  value: 3.57
}, {
  age: 36,
  duration: 5,
  value: 4.7
}, {
  age: 36,
  duration: 6,
  value: 5.68
}, {
  age: 36,
  duration: 7,
  value: 6.67
}, {
  age: 36,
  duration: 8,
  value: 7.7
}, {
  age: 36,
  duration: 9,
  value: 8.74
}, {
  age: 36,
  duration: 10,
  value: 9.82
}, {
  age: 36,
  duration: 11,
  value: 10.93
}, {
  age: 36,
  duration: 12,
  value: 12.07
}, {
  age: 36,
  duration: 13,
  value: 13.25
}, {
  age: 36,
  duration: 14,
  value: 14.46
}, {
  age: 36,
  duration: 15,
  value: 15.72
}, {
  age: 36,
  duration: 16,
  value: 17.02
}, {
  age: 36,
  duration: 17,
  value: 18.36
}, {
  age: 36,
  duration: 18,
  value: 19.75
}, {
  age: 36,
  duration: 19,
  value: 21.18
}, {
  age: 36,
  duration: 20,
  value: 22.67
}, {
  age: 36,
  duration: 21,
  value: 24.21
}, {
  age: 36,
  duration: 22,
  value: 25.8
}, {
  age: 36,
  duration: 23,
  value: 27.45
}, {
  age: 36,
  duration: 24,
  value: 29.16
}, {
  age: 36,
  duration: 25,
  value: 30.93
}, {
  age: 37,
  duration: 1,
  value: 1.033
}, {
  age: 37,
  duration: 2,
  value: 2
}, {
  age: 37,
  duration: 3,
  value: 2.98
}, {
  age: 37,
  duration: 4,
  value: 3.98
}, {
  age: 37,
  duration: 5,
  value: 5.01
}, {
  age: 37,
  duration: 6,
  value: 6.06
}, {
  age: 37,
  duration: 7,
  value: 7.13
}, {
  age: 37,
  duration: 8,
  value: 8.23
}, {
  age: 37,
  duration: 9,
  value: 9.37
}, {
  age: 37,
  duration: 10,
  value: 10.53
}, {
  age: 37,
  duration: 11,
  value: 11.74
}, {
  age: 37,
  duration: 12,
  value: 12.98
}, {
  age: 37,
  duration: 13,
  value: 14.26
}, {
  age: 37,
  duration: 14,
  value: 15.59
}, {
  age: 37,
  duration: 15,
  value: 16.96
}, {
  age: 37,
  duration: 16,
  value: 18.37
}, {
  age: 37,
  duration: 17,
  value: 19.84
}, {
  age: 37,
  duration: 18,
  value: 21.35
}, {
  age: 37,
  duration: 19,
  value: 22.92
}, {
  age: 37,
  duration: 20,
  value: 24.54
}, {
  age: 37,
  duration: 21,
  value: 26.23
}, {
  age: 37,
  duration: 22,
  value: 27.97
}, {
  age: 37,
  duration: 23,
  value: 29.77
}, {
  age: 37,
  duration: 24,
  value: 31.63
}, {
  age: 37,
  duration: 25,
  value: 33.56
}, {
  age: 38,
  duration: 1,
  value: 1.09
}, {
  age: 38,
  duration: 2,
  value: 2.13
}, {
  age: 38,
  duration: 3,
  value: 3.18
}, {
  age: 38,
  duration: 4,
  value: 4.26
}, {
  age: 38,
  duration: 5,
  value: 5.36
}, {
  age: 38,
  duration: 6,
  value: 6.49
}, {
  age: 38,
  duration: 7,
  value: 7.65
}, {
  age: 38,
  duration: 8,
  value: 8.85
}, {
  age: 38,
  duration: 9,
  value: 10.08
}, {
  age: 38,
  duration: 10,
  value: 11.35
}, {
  age: 38,
  duration: 11,
  value: 12.66
}, {
  age: 38,
  duration: 12,
  value: 14.01
}, {
  age: 38,
  duration: 13,
  value: 15.41
}, {
  age: 38,
  duration: 14,
  value: 16.85
}, {
  age: 38,
  duration: 15,
  value: 18.35
}, {
  age: 38,
  duration: 16,
  value: 19.89
}, {
  age: 38,
  duration: 17,
  value: 21.49
}, {
  age: 38,
  duration: 18,
  value: 23.15
}, {
  age: 38,
  duration: 19,
  value: 24.87
}, {
  age: 38,
  duration: 20,
  value: 26.64
}, {
  age: 38,
  duration: 21,
  value: 28.48
}, {
  age: 38,
  duration: 22,
  value: 30.38
}, {
  age: 38,
  duration: 23,
  value: 32.35
}, {
  age: 38,
  duration: 24,
  value: 34.38
}, {
  age: 38,
  duration: 25,
  value: 36.49
}, {
  age: 39,
  duration: 1,
  value: 1.17
}, {
  age: 39,
  duration: 2,
  value: 2.28
}, {
  age: 39,
  duration: 3,
  value: 3.41
}, {
  age: 39,
  duration: 4,
  value: 4.57
}, {
  age: 39,
  duration: 5,
  value: 5.77
}, {
  age: 39,
  duration: 6,
  value: 6.99
}, {
  age: 39,
  duration: 7,
  value: 8.25
}, {
  age: 39,
  duration: 8,
  value: 9.55
}, {
  age: 39,
  duration: 9,
  value: 10.89
}, {
  age: 39,
  duration: 10,
  value: 12.27
}, {
  age: 39,
  duration: 11,
  value: 13.07
}, {
  age: 39,
  duration: 12,
  value: 15.18
}, {
  age: 39,
  duration: 13,
  value: 16.7
}, {
  age: 39,
  duration: 14,
  value: 18.28
}, {
  age: 39,
  duration: 15,
  value: 19.91
}, {
  age: 39,
  duration: 16,
  value: 21.61
}, {
  age: 39,
  duration: 17,
  value: 23.35
}, {
  age: 39,
  duration: 18,
  value: 25.17
}, {
  age: 39,
  duration: 19,
  value: 27.04
}, {
  age: 39,
  duration: 20,
  value: 28.98
}, {
  age: 39,
  duration: 21,
  value: 31
}, {
  age: 39,
  duration: 22,
  value: 33.07
}, {
  age: 39,
  duration: 23,
  value: 35.22
}, {
  age: 39,
  duration: 24,
  value: 37.44
}, {
  age: 39,
  duration: 25,
  value: 39.73
}, {
  age: 40,
  duration: 1,
  value: 1.25
}, {
  age: 40,
  duration: 2,
  value: 2.45
}, {
  age: 40,
  duration: 3,
  value: 3.67
}, {
  age: 40,
  duration: 4,
  value: 4.93
}, {
  age: 40,
  duration: 5,
  value: 6.22
}, {
  age: 40,
  duration: 6,
  value: 7.55
}, {
  age: 40,
  duration: 7,
  value: 8.92
}, {
  age: 40,
  duration: 8,
  value: 10.34
}, {
  age: 40,
  duration: 9,
  value: 11.8
}, {
  age: 40,
  duration: 10,
  value: 13.31
}, {
  age: 40,
  duration: 11,
  value: 14.87
}, {
  age: 40,
  duration: 12,
  value: 16.48
}, {
  age: 40,
  duration: 13,
  value: 18.15
}, {
  age: 40,
  duration: 14,
  value: 19.87
}, {
  age: 40,
  duration: 15,
  value: 21.66
}, {
  age: 40,
  duration: 16,
  value: 23.51
}, {
  age: 40,
  duration: 17,
  value: 25.42
}, {
  age: 40,
  duration: 18,
  value: 27.41
}, {
  age: 40,
  duration: 19,
  value: 29.46
}, {
  age: 40,
  duration: 20,
  value: 31.58
}, {
  age: 40,
  duration: 21,
  value: 33.77
}, {
  age: 40,
  duration: 22,
  value: 36.04
}, {
  age: 40,
  duration: 23,
  value: 38.38
}, {
  age: 40,
  duration: 24,
  value: 40.81
}, {
  age: 40,
  duration: 25,
  value: 43.31
}, {
  age: 41,
  duration: 1,
  value: 1.36
}, {
  age: 41,
  duration: 2,
  value: 2.65
}, {
  age: 41,
  duration: 3,
  value: 3.98
}, {
  age: 41,
  duration: 4,
  value: 5.35
}, {
  age: 41,
  duration: 5,
  value: 6.75
}, {
  age: 41,
  duration: 6,
  value: 8.2
}, {
  age: 41,
  duration: 7,
  value: 9.69
}, {
  age: 41,
  duration: 8,
  value: 11.24
}, {
  age: 41,
  duration: 9,
  value: 12.83
}, {
  age: 41,
  duration: 10,
  value: 14.48
}, {
  age: 41,
  duration: 11,
  value: 16.19
}, {
  age: 41,
  duration: 12,
  value: 17.95
}, {
  age: 41,
  duration: 13,
  value: 19.78
}, {
  age: 41,
  duration: 14,
  value: 21.67
}, {
  age: 41,
  duration: 15,
  value: 23.62
}, {
  age: 41,
  duration: 16,
  value: 25.64
}, {
  age: 41,
  duration: 17,
  value: 27.74
}, {
  age: 41,
  duration: 18,
  value: 29.9
}, {
  age: 41,
  duration: 19,
  value: 32.15
}, {
  age: 41,
  duration: 20,
  value: 34.47
}, {
  age: 41,
  duration: 21,
  value: 36.86
}, {
  age: 41,
  duration: 22,
  value: 39.34
}, {
  age: 41,
  duration: 23,
  value: 41.9
}, {
  age: 41,
  duration: 24,
  value: 44.54
}, {
  age: 41,
  duration: 25,
  value: 47.25
}, {
  age: 42,
  duration: 1,
  value: 1.47
}, {
  age: 42,
  duration: 2,
  value: 2.87
}, {
  age: 42,
  duration: 3,
  value: 4.31
}, {
  age: 42,
  duration: 4,
  value: 5.79
}, {
  age: 42,
  duration: 5,
  value: 7.33
}, {
  age: 42,
  duration: 6,
  value: 8.91
}, {
  age: 42,
  duration: 7,
  value: 10.54
}, {
  age: 42,
  duration: 8,
  value: 12.23
}, {
  age: 42,
  duration: 9,
  value: 13.97
}, {
  age: 42,
  duration: 10,
  value: 15.77
}, {
  age: 42,
  duration: 11,
  value: 17.64
}, {
  age: 42,
  duration: 12,
  value: 19.57
}, {
  age: 42,
  duration: 13,
  value: 21.57
}, {
  age: 42,
  duration: 14,
  value: 23.64
}, {
  age: 42,
  duration: 15,
  value: 25.78
}, {
  age: 42,
  duration: 16,
  value: 28
}, {
  age: 42,
  duration: 17,
  value: 30.28
}, {
  age: 42,
  duration: 18,
  value: 32.65
}, {
  age: 42,
  duration: 19,
  value: 35.1
}, {
  age: 42,
  duration: 20,
  value: 37.64
}, {
  age: 42,
  duration: 21,
  value: 40.25
}, {
  age: 42,
  duration: 22,
  value: 42.95
}, {
  age: 42,
  duration: 23,
  value: 45.75
}, {
  age: 42,
  duration: 24,
  value: 48.62
}, {
  age: 42,
  duration: 25,
  value: 51.57
}, {
  age: 43,
  duration: 1,
  value: 1.6
}, {
  age: 43,
  duration: 2,
  value: 3.13
}, {
  age: 43,
  duration: 3,
  value: 4.7
}, {
  age: 43,
  duration: 4,
  value: 6.32
}, {
  age: 43,
  duration: 5,
  value: 7.99
}, {
  age: 43,
  duration: 6,
  value: 9.72
}, {
  age: 43,
  duration: 7,
  value: 11.5
}, {
  age: 43,
  duration: 8,
  value: 13.35
}, {
  age: 43,
  duration: 9,
  value: 15.25
}, {
  age: 43,
  duration: 10,
  value: 17.23
}, {
  age: 43,
  duration: 11,
  value: 19.27
}, {
  age: 43,
  duration: 12,
  value: 21.39
}, {
  age: 43,
  duration: 13,
  value: 23.58
}, {
  age: 43,
  duration: 14,
  value: 25.84
}, {
  age: 43,
  duration: 15,
  value: 28.18
}, {
  age: 43,
  duration: 16,
  value: 30.61
}, {
  age: 43,
  duration: 17,
  value: 33.11
}, {
  age: 43,
  duration: 18,
  value: 35.71
}, {
  age: 43,
  duration: 19,
  value: 38.38
}, {
  age: 43,
  duration: 20,
  value: 41.15
}, {
  age: 43,
  duration: 21,
  value: 44
}, {
  age: 43,
  duration: 22,
  value: 46.95
}, {
  age: 43,
  duration: 23,
  value: 50
}, {
  age: 43,
  duration: 24,
  value: 53.11
}, {
  age: 43,
  duration: 25,
  value: 56.33
}, {
  age: 44,
  duration: 1,
  value: 1.74
}, {
  age: 44,
  duration: 2,
  value: 3.4
}, {
  age: 44,
  duration: 3,
  value: 5.12
}, {
  age: 44,
  duration: 4,
  value: 6.89
}, {
  age: 44,
  duration: 5,
  value: 8.72
}, {
  age: 44,
  duration: 6,
  value: 10.61
}, {
  age: 44,
  duration: 7,
  value: 12.56
}, {
  age: 44,
  duration: 8,
  value: 14.58
}, {
  age: 44,
  duration: 9,
  value: 16.67
}, {
  age: 44,
  duration: 10,
  value: 18.84
}, {
  age: 44,
  duration: 11,
  value: 21.07
}, {
  age: 44,
  duration: 12,
  value: 23.39
}, {
  age: 44,
  duration: 13,
  value: 25.79
}, {
  age: 44,
  duration: 14,
  value: 28.27
}, {
  age: 44,
  duration: 15,
  value: 30.83
}, {
  age: 44,
  duration: 16,
  value: 34.48
}, {
  age: 44,
  duration: 17,
  value: 36.23
}, {
  age: 44,
  duration: 18,
  value: 39.06
}, {
  age: 44,
  duration: 19,
  value: 41.99
}, {
  age: 44,
  duration: 20,
  value: 45
}, {
  age: 44,
  duration: 21,
  value: 48.12
}, {
  age: 44,
  duration: 22,
  value: 51.32
}, {
  age: 44,
  duration: 23,
  value: 54.63
}, {
  age: 44,
  duration: 24,
  value: 58.03
}, {
  age: 44,
  duration: 25,
  value: 61.52
}, {
  age: 45,
  duration: 1,
  value: 1.9
}, {
  age: 45,
  duration: 2,
  value: 3.72
}, {
  age: 45,
  duration: 3,
  value: 5.6
}, {
  age: 45,
  duration: 4,
  value: 7.53
}, {
  age: 45,
  duration: 5,
  value: 9.53
}, {
  age: 45,
  duration: 6,
  value: 11.61
}, {
  age: 45,
  duration: 7,
  value: 13.75
}, {
  age: 45,
  duration: 8,
  value: 15.96
}, {
  age: 45,
  duration: 9,
  value: 18.25
}, {
  age: 45,
  duration: 10,
  value: 20.62
}, {
  age: 45,
  duration: 11,
  value: 23.08
}, {
  age: 45,
  duration: 12,
  value: 25.61
}, {
  age: 45,
  duration: 13,
  value: 28.24
}, {
  age: 45,
  duration: 14,
  value: 30.95
}, {
  age: 45,
  duration: 15,
  value: 33.76
}, {
  age: 45,
  duration: 16,
  value: 36.67
}, {
  age: 45,
  duration: 17,
  value: 39.66
}, {
  age: 45,
  duration: 18,
  value: 42.75
}, {
  age: 45,
  duration: 19,
  value: 45.95
}, {
  age: 45,
  duration: 20,
  value: 49.24
}, {
  age: 45,
  duration: 21,
  value: 52.63
}, {
  age: 45,
  duration: 22,
  value: 56.12
}, {
  age: 45,
  duration: 23,
  value: 59.71
}, {
  age: 45,
  duration: 24,
  value: 63.4
}, {
  age: 45,
  duration: 25,
  value: 67.18
}, {
  age: 46,
  duration: 1,
  value: 2.08
}, {
  age: 46,
  duration: 2,
  value: 4.07
}, {
  age: 46,
  duration: 3,
  value: 6.13
}, {
  age: 46,
  duration: 4,
  value: 8.25
}, {
  age: 46,
  duration: 5,
  value: 10.44
}, {
  age: 46,
  duration: 6,
  value: 12.71
}, {
  age: 46,
  duration: 7,
  value: 15.06
}, {
  age: 46,
  duration: 8,
  value: 17.49
}, {
  age: 46,
  duration: 9,
  value: 20
}, {
  age: 46,
  duration: 10,
  value: 22.6
}, {
  age: 46,
  duration: 11,
  value: 25.29
}, {
  age: 46,
  duration: 12,
  value: 28.07
}, {
  age: 46,
  duration: 13,
  value: 30.95
}, {
  age: 46,
  duration: 14,
  value: 33.92
}, {
  age: 46,
  duration: 15,
  value: 37
}, {
  age: 46,
  duration: 16,
  value: 40.16
}, {
  age: 46,
  duration: 17,
  value: 43.44
}, {
  age: 46,
  duration: 18,
  value: 46.82
}, {
  age: 46,
  duration: 19,
  value: 50.3
}, {
  age: 46,
  duration: 20,
  value: 53.89
}, {
  age: 46,
  duration: 21,
  value: 57.58
}, {
  age: 46,
  duration: 22,
  value: 61.37
}, {
  age: 46,
  duration: 23,
  value: 65.27
}, {
  age: 46,
  duration: 24,
  value: 69.26
}, {
  age: 46,
  duration: 25,
  value: 73.35
}, {
  age: 47,
  duration: 1,
  value: 2.28
}, {
  age: 47,
  duration: 2,
  value: 4.46
}, {
  age: 47,
  duration: 3,
  value: 6.71
}, {
  age: 47,
  duration: 4,
  value: 9.04
}, {
  age: 47,
  duration: 5,
  value: 11.44
}, {
  age: 47,
  duration: 6,
  value: 13.93
}, {
  age: 47,
  duration: 7,
  value: 16.51
}, {
  age: 47,
  duration: 8,
  value: 19.17
}, {
  age: 47,
  duration: 9,
  value: 21.93
}, {
  age: 47,
  duration: 10,
  value: 24.78
}, {
  age: 47,
  duration: 11,
  value: 27.73
}, {
  age: 47,
  duration: 12,
  value: 30.77
}, {
  age: 47,
  duration: 13,
  value: 33.92
}, {
  age: 47,
  duration: 14,
  value: 37.18
}, {
  age: 47,
  duration: 15,
  value: 40.54
}, {
  age: 47,
  duration: 16,
  value: 44
}, {
  age: 47,
  duration: 17,
  value: 47.58
}, {
  age: 47,
  duration: 18,
  value: 51.26
}, {
  age: 47,
  duration: 19,
  value: 55.06
}, {
  age: 47,
  duration: 20,
  value: 58.97
}, {
  age: 47,
  duration: 21,
  value: 62.98
}, {
  age: 47,
  duration: 22,
  value: 67.1
}, {
  age: 47,
  duration: 23,
  value: 71.32
}, {
  age: 47,
  duration: 24,
  value: 75.64
}, {
  age: 47,
  duration: 25,
  value: 80.06
}, {
  age: 48,
  duration: 1,
  value: 2.5
}, {
  age: 48,
  duration: 2,
  value: 4.89
}, {
  age: 48,
  duration: 3,
  value: 7.36
}, {
  age: 48,
  duration: 4,
  value: 9.91
}, {
  age: 48,
  duration: 5,
  value: 12.55
}, {
  age: 48,
  duration: 6,
  value: 15.29
}, {
  age: 48,
  duration: 7,
  value: 18.11
}, {
  age: 48,
  duration: 8,
  value: 21.04
}, {
  age: 48,
  duration: 9,
  value: 24.06
}, {
  age: 48,
  duration: 10,
  value: 27.18
}, {
  age: 48,
  duration: 11,
  value: 30.42
}, {
  age: 48,
  duration: 12,
  value: 33.75
}, {
  age: 48,
  duration: 13,
  value: 37.2
}, {
  age: 48,
  duration: 14,
  value: 40.76
}, {
  age: 48,
  duration: 15,
  value: 44.43
}, {
  age: 48,
  duration: 16,
  value: 48.22
}, {
  age: 48,
  duration: 17,
  value: 52.12
}, {
  age: 48,
  duration: 18,
  value: 56.14
}, {
  age: 48,
  duration: 19,
  value: 60.27
}, {
  age: 48,
  duration: 20,
  value: 64.52
}, {
  age: 48,
  duration: 21,
  value: 68.87
}, {
  age: 48,
  duration: 22,
  value: 73.34
}, {
  age: 48,
  duration: 23,
  value: 77.9
}, {
  age: 48,
  duration: 24,
  value: 82.57
}, {
  age: 48,
  duration: 25,
  value: 87.33
}, {
  age: 49,
  duration: 1,
  value: 2.75
}, {
  age: 49,
  duration: 2,
  value: 5.37
}, {
  age: 49,
  duration: 3,
  value: 8.08
}, {
  age: 49,
  duration: 4,
  value: 10.89
}, {
  age: 49,
  duration: 5,
  value: 13.79
}, {
  age: 49,
  duration: 6,
  value: 16.79
}, {
  age: 49,
  duration: 7,
  value: 19.89
}, {
  age: 49,
  duration: 8,
  value: 23.1
}, {
  age: 49,
  duration: 9,
  value: 26.41
}, {
  age: 49,
  duration: 10,
  value: 29.84
}, {
  age: 49,
  duration: 11,
  value: 33.38
}, {
  age: 49,
  duration: 12,
  value: 37.04
}, {
  age: 49,
  duration: 13,
  value: 40.81
}, {
  age: 49,
  duration: 14,
  value: 44.7
}, {
  age: 49,
  duration: 15,
  value: 48.72
}, {
  age: 49,
  duration: 16,
  value: 52.85
}, {
  age: 49,
  duration: 17,
  value: 57.1
}, {
  age: 49,
  duration: 18,
  value: 61.48
}, {
  age: 49,
  duration: 19,
  value: 65.97
}, {
  age: 49,
  duration: 20,
  value: 70.58
}, {
  age: 49,
  duration: 21,
  value: 75.3
}, {
  age: 49,
  duration: 22,
  value: 80.13
}, {
  age: 49,
  duration: 23,
  value: 85.06
}, {
  age: 49,
  duration: 24,
  value: 90.09
}, {
  age: 49,
  duration: 25,
  value: 95.21
}, {
  age: 50,
  duration: 1,
  value: 3.02
}, {
  age: 50,
  duration: 2,
  value: 5.9
}, {
  age: 50,
  duration: 3,
  value: 8.88
}, {
  age: 50,
  duration: 4,
  value: 11.96
}, {
  age: 50,
  duration: 5,
  value: 15.15
}, {
  age: 50,
  duration: 6,
  value: 18.44
}, {
  age: 50,
  duration: 7,
  value: 21.85
}, {
  age: 50,
  duration: 8,
  value: 25.37
}, {
  age: 50,
  duration: 9,
  value: 29
}, {
  age: 50,
  duration: 10,
  value: 32.76
}, {
  age: 50,
  duration: 11,
  value: 36.64
}, {
  age: 50,
  duration: 12,
  value: 40.64
}, {
  age: 50,
  duration: 13,
  value: 44.77
}, {
  age: 50,
  duration: 14,
  value: 49.02
}, {
  age: 50,
  duration: 15,
  value: 53.4
}, {
  age: 50,
  duration: 16,
  value: 57.91
}, {
  age: 50,
  duration: 17,
  value: 62.54
}, {
  age: 50,
  duration: 18,
  value: 67.3
}, {
  age: 50,
  duration: 19,
  value: 72.17
}, {
  age: 50,
  duration: 20,
  value: 77.17
}, {
  age: 50,
  duration: 21,
  value: 82.28
}, {
  age: 50,
  duration: 22,
  value: 87.5
}, {
  age: 50,
  duration: 23,
  value: 92.81
}, {
  age: 50,
  duration: 24,
  value: 98.22
}, {
  age: 50,
  duration: 25,
  value: 103.72
}, {
  age: 51,
  duration: 1,
  value: 3.32
}, {
  age: 51,
  duration: 2,
  value: 6.49
}, {
  age: 51,
  duration: 3,
  value: 9.77
}, {
  age: 51,
  duration: 4,
  value: 13.15
}, {
  age: 51,
  duration: 5,
  value: 16.65
}, {
  age: 51,
  duration: 6,
  value: 20.27
}, {
  age: 51,
  duration: 7,
  value: 24.01
}, {
  age: 51,
  duration: 8,
  value: 27.87
}, {
  age: 51,
  duration: 9,
  value: 31.85
}, {
  age: 51,
  duration: 10,
  value: 35.97
}, {
  age: 51,
  duration: 11,
  value: 40.22
}, {
  age: 51,
  duration: 12,
  value: 44.6
}, {
  age: 51,
  duration: 13,
  value: 49.11
}, {
  age: 51,
  duration: 14,
  value: 53.75
}, {
  age: 51,
  duration: 15,
  value: 58.53
}, {
  age: 51,
  duration: 16,
  value: 63.44
}, {
  age: 51,
  duration: 17,
  value: 68.48
}, {
  age: 51,
  duration: 18,
  value: 73.65
}, {
  age: 51,
  duration: 19,
  value: 78.94
}, {
  age: 51,
  duration: 20,
  value: 84.34
}, {
  age: 51,
  duration: 21,
  value: 89.86
}, {
  age: 51,
  duration: 22,
  value: 95.48
}, {
  age: 51,
  duration: 23,
  value: 101.2
}, {
  age: 51,
  duration: 24,
  value: 107.01
}, {
  age: 52,
  duration: 1,
  value: 3.65
}, {
  age: 52,
  duration: 2,
  value: 7.13
}, {
  age: 52,
  duration: 3,
  value: 10.73
}, {
  age: 52,
  duration: 4,
  value: 14.45
}, {
  age: 52,
  duration: 5,
  value: 18.3
}, {
  age: 52,
  duration: 6,
  value: 22.27
}, {
  age: 52,
  duration: 7,
  value: 26.38
}, {
  age: 52,
  duration: 8,
  value: 30.61
}, {
  age: 52,
  duration: 9,
  value: 34.98
}, {
  age: 52,
  duration: 10,
  value: 39.49
}, {
  age: 52,
  duration: 11,
  value: 44.14
}, {
  age: 52,
  duration: 12,
  value: 48.93
}, {
  age: 52,
  duration: 13,
  value: 53.86
}, {
  age: 52,
  duration: 14,
  value: 58.93
}, {
  age: 52,
  duration: 15,
  value: 64.13
}, {
  age: 52,
  duration: 16,
  value: 69.47
}, {
  age: 52,
  duration: 17,
  value: 74.95
}, {
  age: 52,
  duration: 18,
  value: 80.55
}, {
  age: 52,
  duration: 19,
  value: 86.27
}, {
  age: 52,
  duration: 20,
  value: 92.12
}, {
  age: 52,
  duration: 21,
  value: 98.07
}, {
  age: 52,
  duration: 22,
  value: 104.12
}, {
  age: 52,
  duration: 23,
  value: 110.25
}, {
  age: 53,
  duration: 1,
  value: 4.02
}, {
  age: 53,
  duration: 2,
  value: 7.85
}, {
  age: 53,
  duration: 3,
  value: 11.81
}, {
  age: 53,
  duration: 4,
  value: 15.9
}, {
  age: 53,
  duration: 5,
  value: 20.13
}, {
  age: 53,
  duration: 6,
  value: 24.49
}, {
  age: 53,
  duration: 7,
  value: 28.99
}, {
  age: 53,
  duration: 8,
  value: 33.64
}, {
  age: 53,
  duration: 9,
  value: 38.43
}, {
  age: 53,
  duration: 10,
  value: 43.37
}, {
  age: 53,
  duration: 11,
  value: 48.45
}, {
  age: 53,
  duration: 12,
  value: 53.69
}, {
  age: 53,
  duration: 13,
  value: 59.07
}, {
  age: 53,
  duration: 14,
  value: 64.6
}, {
  age: 53,
  duration: 15,
  value: 70.25
}, {
  age: 53,
  duration: 16,
  value: 76.06
}, {
  age: 53,
  duration: 17,
  value: 82
}, {
  age: 53,
  duration: 18,
  value: 88.06
}, {
  age: 53,
  duration: 19,
  value: 94.25
}, {
  age: 53,
  duration: 20,
  value: 100.55
}, {
  age: 53,
  duration: 21,
  value: 106.95
}, {
  age: 53,
  duration: 22,
  value: 113.44
}, {
  age: 54,
  duration: 1,
  value: 4.42
}, {
  age: 54,
  duration: 2,
  value: 8.64
}, {
  age: 54,
  duration: 3,
  value: 13
}, {
  age: 54,
  duration: 4,
  value: 17.49
}, {
  age: 54,
  duration: 5,
  value: 22.14
}, {
  age: 54,
  duration: 6,
  value: 26.93
}, {
  age: 54,
  duration: 7,
  value: 31.87
}, {
  age: 54,
  duration: 8,
  value: 36.96
}, {
  age: 54,
  duration: 9,
  value: 42.21
}, {
  age: 54,
  duration: 10,
  value: 47.62
}, {
  age: 54,
  duration: 11,
  value: 53.17
}, {
  age: 54,
  duration: 12,
  value: 58.89
}, {
  age: 54,
  duration: 13,
  value: 64.75
}, {
  age: 54,
  duration: 14,
  value: 70.76
}, {
  age: 54,
  duration: 15,
  value: 76.92
}, {
  age: 54,
  duration: 16,
  value: 83.22
}, {
  age: 54,
  duration: 17,
  value: 89.65
}, {
  age: 54,
  duration: 18,
  value: 96.2
}, {
  age: 54,
  duration: 19,
  value: 102.88
}, {
  age: 54,
  duration: 20,
  value: 109.66
}, {
  age: 54,
  duration: 21,
  value: 116.52
}, {
  age: 55,
  duration: 1,
  value: 4.87
}, {
  age: 55,
  duration: 2,
  value: 9.51
}, {
  age: 55,
  duration: 3,
  value: 14.3
}, {
  age: 55,
  duration: 4,
  value: 19.24
}, {
  age: 55,
  duration: 5,
  value: 24.34
}, {
  age: 55,
  duration: 6,
  value: 29.6
}, {
  age: 55,
  duration: 7,
  value: 35.03
}, {
  age: 55,
  duration: 8,
  value: 40.61
}, {
  age: 55,
  duration: 9,
  value: 46.36
}, {
  age: 55,
  duration: 10,
  value: 52.26
}, {
  age: 55,
  duration: 11,
  value: 58.33
}, {
  age: 55,
  duration: 12,
  value: 64.56
}, {
  age: 55,
  duration: 13,
  value: 70.95
}, {
  age: 55,
  duration: 14,
  value: 77.49
}, {
  age: 55,
  duration: 15,
  value: 84.17
}, {
  age: 55,
  duration: 16,
  value: 90.99
}, {
  age: 55,
  duration: 17,
  value: 97.95
}, {
  age: 55,
  duration: 18,
  value: 105.02
}, {
  age: 55,
  duration: 19,
  value: 112.2
}, {
  age: 55,
  duration: 20,
  value: 119.48
}, {
  age: 56,
  duration: 1,
  value: 5.36
}, {
  age: 56,
  duration: 2,
  value: 10.46
}, {
  age: 56,
  duration: 3,
  value: 15.73
}, {
  age: 56,
  duration: 4,
  value: 21.17
}, {
  age: 56,
  duration: 5,
  value: 26.78
}, {
  age: 56,
  duration: 6,
  value: 33.55
}, {
  age: 56,
  duration: 7,
  value: 38.5
}, {
  age: 56,
  duration: 8,
  value: 44.61
}, {
  age: 56,
  duration: 9,
  value: 50.9
}, {
  age: 56,
  duration: 10,
  value: 57.35
}, {
  age: 56,
  duration: 11,
  value: 63.98
}, {
  age: 56,
  duration: 12,
  value: 70.76
}, {
  age: 56,
  duration: 13,
  value: 77.71
}, {
  age: 56,
  duration: 14,
  value: 84.81
}, {
  age: 56,
  duration: 15,
  value: 92.05
}, {
  age: 56,
  duration: 16,
  value: 99.43
}, {
  age: 56,
  duration: 17,
  value: 106.93
}, {
  age: 56,
  duration: 18,
  value: 114.54
}, {
  age: 56,
  duration: 19,
  value: 122.25
}, {
  age: 57,
  duration: 1,
  value: 5.9
}, {
  age: 57,
  duration: 2,
  value: 11.52
}, {
  age: 57,
  duration: 3,
  value: 17.32
}, {
  age: 57,
  duration: 4,
  value: 23.3
}, {
  age: 57,
  duration: 5,
  value: 29.46
}, {
  age: 57,
  duration: 6,
  value: 35.8
}, {
  age: 57,
  duration: 7,
  value: 42.31
}, {
  age: 57,
  duration: 8,
  value: 49
}, {
  age: 57,
  duration: 9,
  value: 55.87
}, {
  age: 57,
  duration: 10,
  value: 62.92
}, {
  age: 57,
  duration: 11,
  value: 70.15
}, {
  age: 57,
  duration: 12,
  value: 77.53
}, {
  age: 57,
  duration: 13,
  value: 85.08
}, {
  age: 57,
  duration: 14,
  value: 92.77
}, {
  age: 57,
  duration: 15,
  value: 100.61
}, {
  age: 57,
  duration: 16,
  value: 108.57
}, {
  age: 57,
  duration: 17,
  value: 116.65
}, {
  age: 57,
  duration: 18,
  value: 124.82
}, {
  age: 58,
  duration: 1,
  value: 6.5
}, {
  age: 58,
  duration: 2,
  value: 12.69
}, {
  age: 58,
  duration: 3,
  value: 19.07
}, {
  age: 58,
  duration: 4,
  value: 25.64
}, {
  age: 58,
  duration: 5,
  value: 32.4
}, {
  age: 58,
  duration: 6,
  value: 39.35
}, {
  age: 58,
  duration: 7,
  value: 46.48
}, {
  age: 58,
  duration: 8,
  value: 53.81
}, {
  age: 58,
  duration: 9,
  value: 61.32
}, {
  age: 58,
  duration: 10,
  value: 69
}, {
  age: 58,
  duration: 11,
  value: 76.87
}, {
  age: 58,
  duration: 12,
  value: 84.89
}, {
  age: 58,
  duration: 13,
  value: 93.08
}, {
  age: 58,
  duration: 14,
  value: 101.4
}, {
  age: 58,
  duration: 15,
  value: 109.86
}, {
  age: 58,
  duration: 16,
  value: 118.44
}, {
  age: 58,
  duration: 17,
  value: 127.12
}, {
  age: 59,
  duration: 1,
  value: 7.17
}, {
  age: 59,
  duration: 2,
  value: 13.98
}, {
  age: 59,
  duration: 3,
  value: 21
}, {
  age: 59,
  duration: 4,
  value: 28.21
}, {
  age: 59,
  duration: 5,
  value: 35.63
}, {
  age: 59,
  duration: 6,
  value: 43.24
}, {
  age: 59,
  duration: 7,
  value: 51.06
}, {
  age: 59,
  duration: 8,
  value: 59.06
}, {
  age: 59,
  duration: 9,
  value: 67.26
}, {
  age: 59,
  duration: 10,
  value: 75.63
}, {
  age: 59,
  duration: 11,
  value: 84.18
}, {
  age: 59,
  duration: 12,
  value: 92.89
}, {
  age: 59,
  duration: 13,
  value: 101.75
}, {
  age: 59,
  duration: 14,
  value: 110.75
}, {
  age: 59,
  duration: 15,
  value: 119.87
}, {
  age: 59,
  duration: 16,
  value: 129.08
}, {
  age: 60,
  duration: 1,
  value: 7.89
}, {
  age: 60,
  duration: 2,
  value: 15.39
}, {
  age: 60,
  duration: 3,
  value: 23.11
}, {
  age: 60,
  duration: 4,
  value: 31.03
}, {
  age: 60,
  duration: 5,
  value: 39.16
}, {
  age: 60,
  duration: 6,
  value: 47.51
}, {
  age: 60,
  duration: 7,
  value: 56.05
}, {
  age: 60,
  duration: 8,
  value: 64.8
}, {
  age: 60,
  duration: 9,
  value: 73.73
}, {
  age: 60,
  duration: 10,
  value: 82.84
}, {
  age: 60,
  duration: 11,
  value: 92.12
}, {
  age: 60,
  duration: 12,
  value: 101.56
}, {
  age: 60,
  duration: 13,
  value: 111.14
}, {
  age: 60,
  duration: 14,
  value: 120.84
}, {
  age: 60,
  duration: 15,
  value: 130.64
}, {
  age: 61,
  duration: 1,
  value: 8.69
}, {
  age: 61,
  duration: 2,
  value: 16.95
}, {
  age: 61,
  duration: 3,
  value: 25.43
}, {
  age: 61,
  duration: 4,
  value: 34.13
}, {
  age: 61,
  duration: 5,
  value: 43.05
}, {
  age: 61,
  duration: 6,
  value: 52.18
}, {
  age: 61,
  duration: 7,
  value: 61.52
}, {
  age: 61,
  duration: 8,
  value: 71.07
}, {
  age: 61,
  duration: 9,
  value: 80.79
}, {
  age: 61,
  duration: 10,
  value: 90.69
}, {
  age: 61,
  duration: 11,
  value: 100.76
}, {
  age: 61,
  duration: 12,
  value: 110.97
}, {
  age: 61,
  duration: 13,
  value: 121.3
}, {
  age: 61,
  duration: 14,
  value: 131.73
}, {
  age: 62,
  duration: 1,
  value: 9.58
}, {
  age: 62,
  duration: 2,
  value: 18.67
}, {
  age: 62,
  duration: 3,
  value: 28
}, {
  age: 62,
  duration: 4,
  value: 37.54
}, {
  age: 62,
  duration: 5,
  value: 47.31
}, {
  age: 62,
  duration: 6,
  value: 57.31
}, {
  age: 62,
  duration: 7,
  value: 67.5
}, {
  age: 62,
  duration: 8,
  value: 77.9
}, {
  age: 62,
  duration: 9,
  value: 88.48
}, {
  age: 62,
  duration: 10,
  value: 99.22
}, {
  age: 62,
  duration: 11,
  value: 110.11
}, {
  age: 62,
  duration: 12,
  value: 121.13
}, {
  age: 62,
  duration: 13,
  value: 132.25
}, {
  age: 63,
  duration: 1,
  value: 10.55
}, {
  age: 63,
  duration: 2,
  value: 20.55
}, {
  age: 63,
  duration: 3,
  value: 30.79
}, {
  age: 63,
  duration: 4,
  value: 41.26
}, {
  age: 63,
  duration: 5,
  value: 51.97
}, {
  age: 63,
  duration: 6,
  value: 62.89
}, {
  age: 63,
  duration: 7,
  value: 74.02
}, {
  age: 63,
  duration: 8,
  value: 85.33
}, {
  age: 63,
  duration: 9,
  value: 96.82
}, {
  age: 63,
  duration: 10,
  value: 108.46
}, {
  age: 63,
  duration: 11,
  value: 120.22
}, {
  age: 63,
  duration: 12,
  value: 132.09
}, {
  age: 64,
  duration: 1,
  value: 11.62
}, {
  age: 64,
  duration: 2,
  value: 22.62
}, {
  age: 64,
  duration: 3,
  value: 33.87
}, {
  age: 64,
  duration: 4,
  value: 45.35
}, {
  age: 64,
  duration: 5,
  value: 57.06
}, {
  age: 64,
  duration: 6,
  value: 69
}, {
  age: 64,
  duration: 7,
  value: 81.11
}, {
  age: 64,
  duration: 8,
  value: 93.41
}, {
  age: 64,
  duration: 9,
  value: 105.87
}, {
  age: 64,
  duration: 10,
  value: 118.45
}, {
  age: 64,
  duration: 11,
  value: 131.14
}, {
  age: 65,
  duration: 1,
  value: 12.8
}, {
  age: 65,
  duration: 2,
  value: 24.89
}, {
  age: 65,
  duration: 3,
  value: 37.24
}, {
  age: 65,
  duration: 4,
  value: 49.82
}, {
  age: 65,
  duration: 5,
  value: 62.62
}, {
  age: 65,
  duration: 6,
  value: 75.63
}, {
  age: 65,
  duration: 7,
  value: 88.83
}, {
  age: 65,
  duration: 8,
  value: 102.18
}, {
  age: 65,
  duration: 9,
  value: 115.66
}, {
  age: 65,
  duration: 10,
  value: 129.24
}, {
  age: 66,
  duration: 1,
  value: 14.09
}, {
  age: 66,
  duration: 2,
  value: 27.39
}, {
  age: 66,
  duration: 3,
  value: 40.93
}, {
  age: 66,
  duration: 4,
  value: 54.71
}, {
  age: 66,
  duration: 5,
  value: 68.7
}, {
  age: 66,
  duration: 6,
  value: 82.88
}, {
  age: 66,
  duration: 7,
  value: 97.22
}, {
  age: 66,
  duration: 8,
  value: 111.68
}, {
  age: 66,
  duration: 9,
  value: 126.25
}, {
  age: 67,
  duration: 1,
  value: 15.51
}, {
  age: 67,
  duration: 2,
  value: 30.12
}, {
  age: 67,
  duration: 3,
  value: 44.97
}, {
  age: 67,
  duration: 4,
  value: 60.05
}, {
  age: 67,
  duration: 5,
  value: 73.31
}, {
  age: 67,
  duration: 6,
  value: 90.75
}, {
  age: 67,
  duration: 7,
  value: 106.3
}, {
  age: 67,
  duration: 8,
  value: 121.95
}, {
  age: 68,
  duration: 1,
  value: 17.07
}, {
  age: 68,
  duration: 2,
  value: 33.12
}, {
  age: 68,
  duration: 3,
  value: 49.4
}, {
  age: 68,
  duration: 4,
  value: 65.88
}, {
  age: 68,
  duration: 5,
  value: 82.53
}, {
  age: 68,
  duration: 6,
  value: 99.3
}, {
  age: 68,
  duration: 7,
  value: 116.15
}, {
  age: 69,
  duration: 1,
  value: 18.79
}, {
  age: 69,
  duration: 2,
  value: 36.41
}, {
  age: 69,
  duration: 3,
  value: 54.24
}, {
  age: 69,
  duration: 4,
  value: 72.24
}, {
  age: 69,
  duration: 5,
  value: 90.36
}, {
  age: 69,
  duration: 6,
  value: 108.56
}, {
  age: 70,
  duration: 1,
  value: 20.66
}, {
  age: 70,
  duration: 2,
  value: 40.01
}, {
  age: 70,
  duration: 3,
  value: 59.52
}, {
  age: 70,
  duration: 4,
  value: 79.16
}, {
  age: 70,
  duration: 5,
  value: 98.86
}, {
  age: 71,
  duration: 1,
  value: 22.72
}, {
  age: 71,
  duration: 2,
  value: 43.95
}, {
  age: 71,
  duration: 3,
  value: 65.28
}, {
  age: 71,
  duration: 4,
  value: 86.67
}, {
  age: 72,
  duration: 1,
  value: 24.98
}, {
  age: 72,
  duration: 2,
  value: 48.24
}, {
  age: 72,
  duration: 3,
  value: 71.55
}, {
  age: 73,
  duration: 1,
  value: 27.43
}, {
  age: 73,
  duration: 2,
  value: 52.92
}, {
  age: 74,
  duration: 1,
  value: 30.14
}];
/* }}} */
/* {{{ Survivors */
function generateSurvivorsTable() {
  var cur;
  var survivors = _.map(td99, function (sur) {
    if (cur) {
      var d = (cur - sur) / 12;
      var result = _.map(_.range(1, 12), function (i) {
        return cur - i * d;
      });
      result.push(sur);
      cur = sur;
      return result;
    }
    else {
      cur = sur;
      return [sur];
    }
  });
  return Array.prototype.concat.apply([], survivors);
}
var survivors = generateSurvivorsTable();
/* }}} */
/* {{{ Premium Helpers */
function calculateAge(date, birth, m) {
  if (m === 1) {
    return date.diff(birth, 'year');
  }
  else if (m === 12) {
    return date.diff(birth, 'month');
  }
  else {
    throw new Error('unsupported frequency');
  }
}

function getSurvivors(age, m, dec) {
  var surv;
  if (m === 1) {
    surv = survivors[12 * age];
  }
  else if (m === 12) {
    surv = survivors[age];
  }
  else {
    throw new Error('unsupported frequency');
  }
  return surv + (100000 - surv) * dec;
}

function actualize(p, i) {
  return Math.pow(1 / (1 + i), p);
}
/* }}} */
/* {{{ Premium */
function generateAmortization(b, d, n, c, f, m, dec) {
  var periods = n * m;
  var initialSurvivors = getSurvivors(calculateAge(moment(d), b, m), m, dec);
  return _.range(periods)
    .map(function (k) {
      var date = moment(d)
        .add(k * 12 / m, 'month');
      var age = calculateAge(date, b, m);
      var s = getSurvivors(age, m, dec);
      var ns = getSurvivors(age + 1, m, dec);
      var p = s / initialSurvivors;
      var q = 1 - (ns / s);
      var remaining;
      if (k <= f) {
        remaining = c;
      }
      else {
        remaining = c * (1 - (k - f) / (periods - f));
      }
      return {
        date: date,
        age: age,
        remaining: remaining,
        p: p,
        q: q
      };
    });
}

function generatePremium(a, m, i, b, d, n, c) {
  var result = 0;
  _.each(a, function (item, k) {
    var act = actualize((k + 0.5) / m, i);
    var p = item.remaining * item.p * item.q * act;
    result += p;
  });
  var plancherDuration = Number(n.toFixed());
  var plancherAge = Number((calculateAge(moment(d), b, m) / m)
    .toFixed());
  var plancherCap = Number((c / 1000)
    .toFixed(3));
  var taPlancher = _.where(plancher, {
    age: plancherAge,
    duration: plancherDuration
  });
  var tarifPlancher = Number((taPlancher[0].value * plancherCap)
    .toFixed(3));
  if (result < tarifPlancher) {
    return tarifPlancher;
  }
  return result;
}

function generateFees(a, m, i, g) {
  var result = 0;
  _.each(a, function (item, k) {
    var act = actualize(k / m, i);
    var p = g * item.remaining * item.p * act;
    result += p;
  });
  return result / m;
}

function generateCommercialPremium(p, f, teta) {
  return (p + f) / (1 - teta);
}
/* }}} */
/* {{{ Test Cases */
function trace(b, d, n, c, f, m, i, dec, g, teta) {
  //
  // b: date de naissance
  // d: date du crédit
  // n: durée du remboursement en années
  // c: montant de l'emprunt
  // f: nombre de périodes de franchises
  // m: mensualité de remboursement / an
  // i: taux d'actualisation
  // dec: abattement sur mortalités
  // g: frais de gestion
  // teta: chargement d'acquisition
  //
  var amortization = generateAmortization(b, d, n, c, f, m, dec);
  var premium = generatePremium(amortization, m, i);
  var fees = generateFees(amortization, m, i, g);
  console.log('Assuré');
  console.log('  date de naissance: ' + b.format('DD/MM/YYYY'));
  console.log('Crédit');
  console.log('  date du crédit: ' + d.format('DD/MM/YYYY'));
  console.log('  durée (années): ' + n);
  console.log('  montant: ' + c);
  console.log('  franchise (mois): ' + f);
  console.log('Données techniques');
  console.log('  taux d\'actualisation: ' + i);
  console.log('  abattement / mortalités: ' + dec);
  console.log('  frais de gestion: ' + g);
  console.log('  frais d\'acquisition: ' + teta);
  console.log('Prime');
  console.log('  pure: ' + _str.numberFormat(premium, 3));
  console.log('  inventaire: ' + _str.numberFormat(premium + fees, 3));
  console.log('  commerciale: ' + _str.numberFormat(generateCommercialPremium(
    premium, fees, teta), 3));
}

function testAge(b, d, i, dec, g) {
  return _.map(_.range(1, 26), function (n) {
    var amortization = generateAmortization(b, d, n, 1000, 0, 12, dec);
    return generatePremium(amortization, 12, i) + generateFees(amortization,
      12, i, g);
  });
}
if (require.main === module) {
  var b = moment('1999-07-01', 'YYYY-MM-DD');
  var d = moment('2020-01-01', 'YYYY-MM-DD');
  var c = 1000;
  var n = 1;
  var f = 0;
  var m = 12;
  var i = 0.03;
  var g = 0.0005;
  var teta = 0.2;
  trace(b, d, n, c, f, m, i, 0, g, teta);
  console.log();
  trace(b, d, n, c, f, m, i, 0.2, g, teta);
}
if (false && require.main === module) {
  var b = moment('2000-07-01', 'YYYY-MM-DD');
  var d = moment('2020-01-01', 'YYYY-MM-DD');
  var i = 0.03;
  var dec = 0.2;
  var g = 0.0005;
  var res = _.map(_.range(55), function () {
    b.add(-1, 'year');
    return testAge(b, d, i, dec, g);
  });
  _.each(res, function (age) {
    console.log(age.join(','));
  });
}
/* }}} */
/* {{{ Exports */
exports.generateAmortization = generateAmortization;
exports.generatePremium = generatePremium;
exports.generateFees = generateFees;
exports.generateCommercialPremium = generateCommercialPremium;
/* }}} */
//
//
//
//
//
//
//
//
function getAge(effDate, birthDate) {
  birthDate = moment(birthDate);
  var age = moment(effDate)
    .diff(birthDate, 'years', true);
  age = Math.round(age);
  return age;
}

function getPremium(pol) {
  var premium = pol.mvts.map(function (obj) {
      return obj.amount;
    })
    .reduce(function (a, b) {
      var res = a + b;
      res = Number(res.toFixed(3));
      return res;
    });
  return premium;
}

function getFloorPremium(effDate, endDate, birthDate, capital, cb) {
  var duration = moment(endDate)
    .diff(effDate, 'year', true);
  duration = Math.round(duration);
  var age = getAge(effDate, birthDate);
  var cap = Number((capital / 1000)
    .toFixed(3));
  mongo.getLoanFloorCol()
    .findOne({}, function (err, floor) {
      if (err) {
        cb(err);
      }
      else {
        var p = floor.values[age][duration];
        var res = p * cap;
        cb(null, res);
      }
    });
}

function _safeRate(pol, cb) {
  // {{{
  var ok = true;
  try {
    rules.rate(pol);
  }
  catch (e) {
    ok = false;
    cb(e);
  }
  if (ok) {
    getFloorPremium(pol.def.effDate, pol.def.termDate, pol.insured.birthDate,
      pol.terms[0].cap,
      function (err, floor) {
        if (err) {
          cb(err);
        }
        else {
          pol.floorRate = floor;
          cb(null, pol);
        }
      });
  }
  // }}}
}

function requestDraft(id, msg, ctx, cb) {
  // {{{
  mongo.getLoanRequestCol()
    .findOne({}, function (err, request) {
      if (err) {
        cb(err);
      }
      else {
        var url = request.url + id;
        var internalUrl = request.internalUrl + id;
        var mel = request.mel;
        mel.subject += ctx.user.fullName;
        mel.replyTo = ctx.email;
        mel.text = msg + '\n\n' + url + '\n\n' + internalUrl;
        email.send(mel, cb);
      }
      // }}}
    });
}

function checkRightDraft(right, ctx, cb) {
  var err;
  if (!ctx.user[right]) {
    err = 'Ce service requiert des droits supplémentaires.';
  }
  if (err) {
    cb(err);
  }
  else {
    cb(null);
  }
}

function setHistory(pol, obj, ctx) {
  var history = {};
  history.user = ctx.user.fullName;
  history.date = utils.momentToJSON(moment());
  history.time = utils.timeToJSON(moment());
  history.action = 'save';
  history.details = JSON.stringify(obj);
  pol.history.push(history);
  return (pol);
}

function saveHistory(id, policy, ctx, cb) {
  // {{{
  draft.findOne(id, function (err, pol) {
    if (err) {
      cb(err);
    }
    else {
      delete pol._id;
      var polKeys = _.sortBy(_.keys(pol.admin), _.identity);
      var polVals = _.map(polKeys, function (k) {
        return pol.admin[k];
      });
      var policyKeys = _.sortBy(_.keys(policy.admin), _.identity);
      var policyVals = _.map(policyKeys, function (k) {
        return policy.admin[k];
      });
      var hexPol = utils.hash(polVals);
      var hexPolicy = utils.hash(policyVals);
      if (hexPolicy === hexPol) {
        cb(null, policy);
      }
      else {
        policy = setHistory(policy, policy.admin, ctx);
        cb(null, policy);
      }
    }
  });
  // }}}
}

function adminDraft(pol, ctx, cb) {
  // {{{
  var id = pol._id;
  delete pol._id;
  saveHistory(id, pol, ctx, function (err, policy) {
    var errors = draft.validate(policy);
    if (utils.isEmpty(errors)) {
      draft.admin(id, policy, function (err, pol) {
        if (err) {
          cb(err);
        }
        else {
          _safeRate(pol, cb);
        }
      });
    }
    else {
      cb(errors);
    }
  });
}

function createDraft(policy, ctx, cb) {
  // {{{
  var pol = {};
  if (_.isEmpty(policy)) {
    pol = models.defaultDraft;
  }
  else {
    pol = policy;
    delete(pol._id);
    delete(pol.def.ref);
    delete(pol.def.user);
    pol.deposit.number = policy.deposit.number - 1;
    pol.subscriber = policy.subscriber;
    pol.def.effDate = utils.momentToJSON(moment());
    pol.deposit.nextDate = utils.momentToJSON(moment());
    if (!pol.admin.maxAge) {
      pol.admin.maxAge = 70;
    }
  }
  var errors = draft.validate(pol);
  if (utils.isEmpty(errors)) {
    draft.insert(pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        _safeRate(pol, cb);
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}

function readDraft(id, ctx, cb) {
  // {{{
  draft.findOne(id, function (err, pol) {
    if (err) {
      cb(err);
    }
    else {
      _safeRate(pol, cb);
    }
  });
  // }}}
}

function updateDraft(pol, ctx, cb) {
  // {{{
  var id = pol._id;
  delete pol._id;
  var errors = draft.validate(pol);
  if (utils.isEmpty(errors)) {
    draft.update(id, pol, function (err, pol) {
      if (err) {
        cb(err);
      }
      else {
        _safeRate(pol, function (err, pol) {
          if (err) {
            cb(err);
          }
          else {
            if (pol.admin.useFloorRate) {
              var premium = getPremium(pol);
              if (premium < pol.floorRate) {
                delete pol.mvts;
                cb('Tarif plancher: ' + (pol.floorRate + pol.admin.fees),
                  pol);
              }
              else {
                cb(null, pol);
              }
            }
            else {
              cb(null, pol);
            }
          }
        });
      }
    });
  }
  else {
    cb(errors);
  }
  // }}}
}
exports.requestDraft = requestDraft;
exports.checkRightDraft = checkRightDraft;
exports.adminDraft = adminDraft;
exports.createDraft = createDraft;
exports.updateDraft = updateDraft;
exports.readDraft = readDraft;

var schedule = require('node-schedule');
var pre = require('../pre');
var moment = require('moment');
var debitBatch = require('../logic/payment/processes/debitBatch');

function callDebitPaymentBatch() {
  pre.fire()
    .then(function () {
      debitBatch.getListOfDebitRecs(function (err) {
        if (err) {
          console.log(err);
        }
      });
    });
}
console.log('**************************' + moment()
  .format() + '*******************************');
var sep = ' ';
var rule;
var second = 1;
var minute = 52;
var hour = 21;
var dayOfMonth = '*';
var month = '*';
var dayOfWeek = '*';
rule = second + sep + minute + sep + hour + sep + dayOfMonth + sep + month +
  sep + dayOfWeek;
//launch standard payment batch
schedule.scheduleJob(rule, callDebitPaymentBatch);

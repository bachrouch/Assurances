var schedule = require('node-schedule');
var pre = require('../pre');
var moment = require('moment');
var paymentBatch = require('../logic/payment/processes/paymentBatch');

function callStandardPaymentBatch() {
  pre.fire()
    .then(function () {
      paymentBatch.checkAndCreatePayments(function (err) {
        if (err) {
          console.log(err);
        }
        else {
          setTimeout(function () {
            paymentBatch.checkAndInsertReceipts(function (err) {
              if (err) {
                console.log(err);
              }
              else {
                setTimeout(function () {
                  paymentBatch.lockSubscription();
                }, 3000);
              }
            });
          }, 3000);
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
schedule.scheduleJob(rule, callStandardPaymentBatch);

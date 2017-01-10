var terms = require('./logic/savings/terms');
var schedule = require('node-schedule');

function callTermsBatch() {
  terms.generateTerms(function (err) {
    if (err) {
      console.log(err);
      return;
    }
  });
}
var rule = new schedule.RecurrenceRule();
rule.hour = 18;
rule.dayOfWeek = 5;
schedule.scheduleJob(rule, callTermsBatch);

/* vim: fdm=marker
 */
var Q = require('q');
var schedule = require('node-schedule');
var pre = require('../pre');
var terms = require('../logic/savings/terms');
var batch = require('../logic/batch');
var batchConfig;
var batchName = 'savingsTerm';

function callTermsBatch() {
  //{{{
  terms.generateTerms(function (err) {
    if (err) {
      console.log(err);
      return;
    }
  });
  //}}}
}
pre.fire()
  .then(function () {
    console.log('pre ok');
    Q.fcall(function () {
        return (batch.getBatchConfig(batchName));
      })
      .then(function (config) {
        batchConfig = config;
        var sep = ' ';
        var rule;
        if (batchConfig.rule) {
          var second = batchConfig.rule.second.toString();
          var minute = batchConfig.rule.minute.toString();
          var hour = batchConfig.rule.hour.toString();
          var dayOfMonth = batchConfig.rule.dayOfMonth.toString();
          var month = batchConfig.rule.month.toString();
          var dayOfWeek = batchConfig.rule.dayOfWeek.toString();
          rule = second + sep + minute + sep + hour + sep + dayOfMonth +
            sep + month + sep + dayOfWeek;
        }
        schedule.scheduleJob(rule, callTermsBatch);
      })
      .done();
  });

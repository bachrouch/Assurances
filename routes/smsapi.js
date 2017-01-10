//exports.declare = function (app) {};
var session = require('../logic/session');
var ora = require('./auto-ora');
var _ = require('underscore');
var config = require('../config');
var request = require('request');
var path = require('path');
var fs = require('fs');
var mongo = require('../mongo');
var moment = require('moment');
var seq = require('../logic/seq');
var receipt = require('../logic/receipt');
var express = require('express');
var router = express.Router();
var utils = require('../logic/utils');
var countryList = [];
var MongoClient = require('mongodb')
  .MongoClient;
var assert = require('assert');
//var url = "mongodb://localhost:27017/takaful";
//var twClient = require('../twilio/message')
//var db = require('diskdb');
//db = mongo.getFinanceSplipsCol('data', ['msg_log']);
//var logger = {};
function searchBordoreau(req, res) {
  console.log(req.body);
  var result = [];
  mongo.getFinanceSplipsCol()
    .find()
    .toArray(function (err, docs) {
      if (err) {
        console.log('erreur lors de fetch ' + err);
      }
      result = JSON.stringify(docs);
      res.send(result);
    });
}

function detailsBordoreau(req, res) {
  console.log(req.body);
  var result = [];
  mongo.getFinanceSplipsCol()
    .find()
    .toArray(function (err, docs) {
      if (err) {
        console.log('erreur lors de fetch ' + err);
      }
      result = JSON.stringify(docs);
      res.send(result);
    });
}
/* res.send([{
   pos: '900',
   numero: 'Quote',
   nature: 'Particulier',
   effectiveDate: '2016-03-25',
   subscribeDate: '2016-02-29',
   endDate: '2017-03-15',
   vehicle: '7418TU173',
   clientName: 'Ali Kefia',
   premiumType: 'Comptant',
   policyNat: 'Particulier',
   premium: 426,
   consultlink: {
     title: 'Valider',
     processlink: 'auto#contract/Quote/valid'
   }
 }]);*/
// {{{
/*
  ar result = [];
 mongo.getFinancePaymentCol.find({}).toArray(function(err,docs){
 	if(err){console.log('erreur lors de fetch '+err)}
	result=docs;
});
res.send(result);
  res.send([{
    pos: '900',
    numero: 'Quote',
    nature: 'Particulier',
    effectiveDate: '2016-03-25',
    subscribeDate: '2016-02-29',
    endDate: '2017-03-15',
    vehicle: '7418TU173',
    clientName: 'Ali Kefia',
    premiumType: 'Comptant',
    policyNat: 'Particulier',
    premium: 426,
    consultlink: {
      title: 'Valider',
      processlink: 'auto#contract/Quote/valid'
    }
  }]);*/
// }}}
/*
logger.logMsg = function (msgObj) {
  db.msg_log.save({
    "logged_at": (new Date()),
    msg: msgObj
  });
};
*/
function sendmsg(req, res) {
  //router.post('/sendmsg', function (req, res) {
  var resp = {};
  var msg = req.body;
  console.log(msg);
  if (!msg || !msg.to || !msg.text) {
    resp.status = "error";
    resp.message = "invalid data";
    res.send(500, resp);
    console.log('invalid data');
    return;
  }
  var twClient = require('../twilio/message')
    .sendMsg(msg.msgTo, msg.msgText, function (error, message) {
      if (error) {
        resp.status = "error";
        resp.message = error;
        res.send(500, resp);
        console.log('twilio error');
        return;
      }
      resp.status = "success";
      resp.message = message.sid;
      resp = JSON.stringify(res);
      console.log('success');
      res.send(200, resp);
    });
}
//module.exports = router;
//module.exports = logger;
exports.declare = function (app) {
  app.get('/api/searchBordoreau', session.ensureAuth, session.ensureLocked,
    searchBordoreau);
  app.get('/api/detailsBordoreau', session.ensureAuth, session.ensureLocked,
    detailsBordoreau);
  app.post('/sendmsg', session.ensureAuth, session.ensureLocked, sendmsg);
};

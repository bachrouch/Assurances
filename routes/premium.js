/* vim: fdm=marker
 */
var session = require('../logic/session');
var moment = require('moment');
var config = require('../config');
var request = require('request');
var ora = require('./premium-ora');

function searchReceipt(req, res) {
  // {{{
  var premiums = [];
  var sPrem;
  sPrem = {};
  sPrem.branch = 'Auto';
  sPrem.reference = 14000001274;
  sPrem.contract = '14100000126';
  sPrem.premiumStatus = 0;
  sPrem.statusDesc = 'Non émise';
  sPrem.date = '2015-02-12';
  sPrem.raisedDate = '2015-02-12';
  sPrem.fromDate = '2015-01-26';
  sPrem.toDate = '2016-01-26';
  sPrem.subscriberName = 'Sami Saddem';
  sPrem.total = 462.359;
  premiums.push(sPrem);
  sPrem = {};
  sPrem.branch = 'Incendie';
  sPrem.reference = 14000001275;
  sPrem.contract = '14200000126';
  sPrem.premiumStatus = 1;
  sPrem.statusDesc = 'Emise';
  sPrem.date = '2015-02-18';
  sPrem.raisedDate = '2015-02-18';
  sPrem.fromDate = '2015-03-01';
  sPrem.toDate = '2016-03-01';
  sPrem.subscriberName = 'Assurances At-Takafulia';
  sPrem.total = 16125.335;
  premiums.push(sPrem);
  res.send(200, premiums);
  // }}}
}

function consultPremium(req, res) {
  // {{{
  var nTimeStamp = parseInt(req.body.raisedDate);
  var sPrem;
  var sTax;
  var sStamp;
  sPrem = {};
  sPrem.taxes = [];
  sPrem.stamps = [];
  sPrem.contract = '14100000126';
  sPrem.date = moment.unix(nTimeStamp)
    .format('YYYY-MM-DD');
  sPrem.fromDate = '2015-01-26';
  sPrem.toDate = '2016-01-26';
  sPrem.subscriberName = 'Sami Saddem';
  sPrem.premiumStatus = 0;
  sPrem.product = 'Automobile';
  sPrem.endorsement = 0;
  sPrem.endorsementName = 'Affaire nouvelle';
  sTax = {};
  sTax.code = 'TUA';
  sTax.amount = 22.512;
  sPrem.taxes.push(sTax);
  sTax = {};
  sTax.code = 'FG';
  sTax.amount = 5.114;
  sPrem.taxes.push(sTax);
  sStamp = {};
  sStamp.code = 'FGA';
  sStamp.amount = 1;
  sPrem.stamps.push(sStamp);
  sStamp = {};
  sStamp.code = 'FPAC';
  sStamp.amount = 0.5;
  sPrem.stamps.push(sStamp);
  sStamp = {};
  sStamp.code = 'FSSR';
  sStamp.amount = 0.3;
  sPrem.stamps.push(sStamp);
  sPrem.premium = 1250.396;
  sPrem.fees = 20;
  sPrem.amount = 1270.396;
  sPrem.total = 1299.822;
  sPrem.remainingAmount = 1299.822;
  res.send({
    premium: sPrem
  });
  // }}}
}

function sendError(req, res) {
  // {{{
  res.send(200, {});
  // }}}
}

function generateReceipt(req, res) {
  // {{{
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var receipt = {
    date: '2015-03-02',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    reference: '15003256900',
    contract: '14100000126',
    endorsement: 0,
    fromDate: '2015-03-26',
    effectiveDate: null,
    toDate: '2016-03-25',
    branche: {
      fr: 'véhicules terrestres à moteur',
      ar: 'للعربات البرية ذات محرك'
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '08333575',
        name: 'Sami Saddem',
        phone: '55810505',
        address: '10 Rue Medinat Baysane Ennasr II 2002 Ariana'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '08333575',
        name: 'Sami Saddem',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: false,
      name: null,
      releaseDate: null
    },
    premium: {
      net: 1250.396,
      tax: 25.226,
      fees: 20,
      feesTax: 2.4,
      stamps: {
        FGA: 1,
        FSSR: 0.3,
        FPAC: 0.5
      },
      total: 1299.822,
      totalTax: 27.626
    }
  };
  request({
    url: 'http://' + printsrv + ':' + printprt + '/all/receipt',
    method: 'POST',
    json: receipt
  }, function (err, resul, body) {
    if (err) {
      res.send(500, JSON.stringify(err));
      return;
    }
    else if (resul.statusCode !== 200) {
      res.send(500, JSON.stringify(body));
      return;
    }
    else {
      var rcdoc = {};
      rcdoc.doc = receipt.reference;
      rcdoc.id = body.id;
      rcdoc.lob = '/all/receipt';
      res.send({
        rcdoc: rcdoc
      });
      return;
    }
  });
  // }}}
}
exports.declare = function (app) {
  app.post('/svc/premium/receiptsearch', session.ensureAuth, ora.searchReceipt ||
    searchReceipt);
  app.post('/svc/premium/consult', session.ensureAuth, ora.consultPremium ||
    consultPremium);
  app.post('/svc/premium/senderror', session.ensureAuth, ora.sendError ||
    sendError);
  app.post('/svc/premium/generate', session.ensureAuth, ora.generateReceipt ||
    generateReceipt);
};

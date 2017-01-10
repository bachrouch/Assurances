/* vim: fdm=marker
 */
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
var utils = require('../logic/utils');
var countryList = [];

function listVehicleUsages(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  res.send([{
    id: 'Affaire et Privé',
    text: 'Affaire et Privé'
  }, {
    id: 'Taxi',
    text: 'Taxi'
  }]);
  // }}}
}

function listVehicleBonuses(req, res) {
  // {{{
  //var usage = req.body.usage;
  //var criterium = req.body.criterium;
  res.send([{
    id: 'Classe 1',
    text: 'Classe 1'
  }, {
    id: 'Classe 2',
    text: 'Classe 2'
  }]);
  // }}}
}

function listVehicleMakes(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  res.send([{
    id: 'Peugeot',
    text: 'Peugeot'
  }, {
    id: 'Renault',
    text: 'Renault'
  }]);
  // }}}
}

function listVehicleModels(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  var make = req.body.make;
  if (make === 'Peugeot') {
    res.send([{
      id: '208',
      text: '208'
    }, {
      id: '308',
      text: '308'
    }]);
  }
  else if (make === 'Renault') {
    res.send([{
      id: 'Clio III',
      text: 'Clio III'
    }, {
      id: 'Mégane II',
      text: 'Mégane II'
    }]);
  }
  // }}}
}

function createVehicle(req, res) {
  // {{{
  var quote = req.body.quote;
  if (req.session.user.pos.locked) {
    res.send(500, 'Souscription auto bloquée pour ce PDV');
    return;
  }
  quote.reference = 'Quote';
  //var vehicle = req.body.vehicle;
  //var insured = req.body.insured;
  res.send({
    quote: quote
  });
  // }}}
}

function updateVehicle(req, res) {
  // {{{
  var quote = req.body.quote;
  if (req.session.user.pos.locked) {
    res.send(500, 'Souscription auto bloquée pour ce PDV');
    return;
  }
  //var vehicle = req.body.vehicle;
  //var insured = req.body.insured;
  res.send({
    quote: quote
  });
  // }}}
}

function listCoverages(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.premium = 300;
  quote.fees = 20;
  quote.taxes = 30;
  res.send({
    quote: quote,
    coverages: [{
      name: 'Responsabilité Civile',
      subscribed: true,
      subscribedModifiable: false,
      rate: 1200,
      tax: 100,
      premium: 1200
    }, {
      name: 'Dommages et Collisions',
      limit: 10000,
      limitModifiable: true,
      deductible: 5,
      deductibleModifiable: true
    }, {
      name: 'Vol',
      limitModifiable: true,
      maxLimit: 10000
    }, {
      name: 'Incendie',
      deductibleModifiable: true,
      minDeductible: 10
    }]
  });
  // }}}
}

function updateCoverage(req, res) {
  // {{{
  var quote = req.body.quote;
  var coverage = req.body.coverage;
  if (!coverage.premium) {
    coverage.rate = 100;
    coverage.premium = 100;
    coverage.tax = 10;
    coverage.tarif = 100;
  }
  else {
    coverage.rate *= 2;
    coverage.premium *= 2;
    coverage.tax *= 2;
    coverage.tarif *= 2;
  }
  res.send({
    quote: quote,
    coverages: [coverage]
  });
  // }}}
}

function setSubscriber(req, res) {
  // {{{
  var quote = req.body.quote;
  //var subscriber = req.body.subscriber;
  res.send({
    quote: quote
  });
  // }}}
}

function listAttestation(req, res) {
  // {{{
  var pos = req.session.user.pos;
  if (pos.code === '100') {
    res.send([{
      id: 'aaaa',
      text: 'AAAA'
    }, {
      id: 'bbbb',
      text: 'BBBB'
    }]);
  }
  if (pos.code === '712') {
    res.send([{
      id: 'cccc',
      text: 'CCCC'
    }, {
      id: 'dddd',
      text: 'DDDD'
    }]);
  }
  // }}}
}

function setBeneficiary(req, res) {
  // {{{
  var quote = req.body.quote;
  //var beneficiary = req.body.beneficiary;
  res.send({
    quote: quote
  });
  // }}}
}

function listBeneficiary(req, res) {
  // {{{
  res.send([{
    id: 'EL WIFAK LEASING',
    text: 'EL WIFAK LEASING'
  }, {
    id: 'AMEN LEASE',
    text: 'AMEN LEASE'
  }]);
  // }}}
}

function createContract(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.contractref = '14100999999';
  quote.validateLink = {};
  quote.validateLink.title = 'Validez votre contrat N° 14100999999';
  quote.validateLink.processlink = 'auto#consult/id/14100999999';
  res.send({
    quote: quote
  });
  // }}}
}

function printQuote(req, res) {
  // {{{
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var quote = {
    date: '2013-12-25',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    vehicle: {
      vin: 'VF7NX5FS0DY512418',
      make: 'Citroen',
      model: 'DS4',
      kind: 'VP',
      fuel: 'ESSENCE',
      power: 7,
      placesNumber: 5,
      emptyWeight: 1.28,
      totalWeight: 1.755,
      payload: 0.475,
      registrationNumber: '6604TU168',
      issueDate: '2013-09-25',
      newValue: 57000,
      updatedValue: 57000
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        phone: '58366646',
        address: '14 rue de Guinée 1100 Zaghouan'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: true,
      name: 'El Wifack Leasing',
      releaseDate: '2018-12-31'
    },
    policy: {
      usage: '01-P-P-V',
      bonus: 4,
      kind: 1,
      billingFrequency: 2,
      effectiveDate: '2014-01-01',
      endDate: '2014-12-31',
      termDate: '2015-01-01'
    },
    coverages: [{
      code: 'G01',
      limit: 100000,
      rate: 105.1050,
      premium: 105.1050,
      tax: 12.6130
    }, {
      code: 'G02',
      limit: 1000,
      rate: 20,
      premium: 20,
      tax: 2
    }, {
      code: 'G04',
      limit: 30000,
      rate: 115,
      premium: 115,
      tax: 11.50
    }, {
      code: 'G30',
      limit: 3000,
      rate: 30,
      premium: 30,
      tax: 3
    }, {
      code: 'G03',
      limit: 30000,
      rate: 105,
      premium: 105,
      tax: 10.50
    }, {
      code: 'G06',
      limit: 35000,
      deductible: 0,
      rate: 1142,
      premium: 1142,
      tax: 114.20
    }, {
      code: 'G34',
      limit: 3500,
      rate: 70,
      premium: 70,
      tax: 7
    }, {
      code: 'G16',
      limit: 25000,
      rate: 31.25,
      premium: 31.25,
      tax: 3.125
    }, {
      code: 'G28',
      rate: 55,
      premium: 55,
      tax: 5.50
    }],
    premium: {
      rate: null,
      net: null,
      tax: null
    },
    receipting: {
      fees: 20,
      tax: 2.4,
      stamps: {
        FGA: 1,
        FPAC: 0.5,
        FSSR: 0.3
      }
    },
    periods: [{
      fromDate: '2014-01-01',
      toDate: '2014-06-30',
      premium: null,
      tax: null
    }, {
      fromDate: '2014-07-01',
      toDate: '2014-12-31',
      premium: null,
      tax: null
    }]
  };
  var sumRate = _.reduce(quote.coverages, function (memo, coverage) {
    return memo + coverage.rate;
  }, 0);
  var sumNet = _.reduce(quote.coverages, function (memo, coverage) {
    return memo + coverage.premium;
  }, 0);
  var sumTax = _.reduce(quote.coverages, function (memo, coverage) {
    return memo + coverage.tax;
  }, 0);
  quote.premium.rate = sumRate;
  quote.premium.net = sumNet;
  quote.premium.tax = sumTax;
  _.each(quote.periods, function (period) {
    period.premium = sumNet / 2;
    period.tax = sumTax / 2;
  });
  quote.reference = req.body.quote.reference;
  request({
    url: 'http://' + printsrv + ':' + printprt + '/auto/quote',
    method: 'POST',
    json: quote
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
      var doc = {};
      doc.docname = quote.reference;
      doc.pdfid = body.id;
      doc.lob = '/auto/quote';
      res.send({
        doc: doc
      });
    }
  });
  // }}}
}

function printCP(req, res) {
  // {{{
  var quote = req.body.quote;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var contract = {
    date: '2013-12-25',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    endorsement: 0,
    transaction: 0,
    vehicle: {
      vin: 'VF7NX5FS0DY512418',
      make: 'PEUGEOT',
      model: 'AXDHRTRT',
      kind: 'VP',
      fuel: 'ESSENCE',
      power: 7,
      placesNumber: 5,
      emptyWeight: 1.28,
      totalWeight: 1.755,
      payload: 0.475,
      registrationNumber: '6604TU168',
      issueDate: '2013-09-25',
      newValue: 57000,
      updatedValue: 57000
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        phone: '58366646',
        address: '14 rue de Guinée 1100 Zaghouan'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: true,
      name: 'El Wifack Leasing',
      releaseDate: '2018-12-31'
    },
    policy: {
      status: 1,
      usage: '01-P-P-V',
      bonus: 4,
      kind: 1,
      billingFrequency: 2,
      effectiveDate: '2014-01-01',
      termDate: '2015-01-01'
    },
    coverages: [{
      code: 'G01',
      limit: 100000,
      rate: 105.1050,
      premium: 105.1050,
      tax: 12.6130
    }, {
      code: 'G02',
      limit: 1000,
      rate: 20,
      premium: 20,
      tax: 2
    }, {
      code: 'G04',
      limit: 30000,
      rate: 115,
      premium: 115,
      tax: 11.50
    }, {
      code: 'G30',
      limit: 3000,
      rate: 30,
      premium: 30,
      tax: 3
    }, {
      code: 'G03',
      limit: 30000,
      rate: 105,
      premium: 105,
      tax: 10.50
    }, {
      code: 'G06',
      limit: 35000,
      deductible: 0,
      rate: 1142,
      premium: 1142,
      tax: 114.20
    }, {
      code: 'G34',
      limit: 3500,
      rate: 70,
      premium: 70,
      tax: 7
    }, {
      code: 'G16',
      limit: 25000,
      rate: 31.25,
      premium: 31.25,
      tax: 3.125
    }, {
      code: 'G28',
      rate: 55,
      premium: 55,
      tax: 5.50
    }],
    premium: {
      rate: null,
      net: null,
      tax: null
    },
    receipting: {
      fees: 20,
      tax: 2.4,
      stamps: {
        FGA: 1,
        FPAC: 0.5,
        FSSR: 0.3
      }
    },
    periods: [{
      fromDate: '2014-01-01',
      toDate: '2014-06-30',
      premium: null,
      tax: null
    }, {
      fromDate: '2014-07-01',
      toDate: '2014-12-31',
      premium: null,
      tax: null
    }]
  };
  var sumRate = _.reduce(contract.coverages, function (memo, coverage) {
    return memo + coverage.rate;
  }, 0);
  var sumNet = _.reduce(contract.coverages, function (memo, coverage) {
    return memo + coverage.premium;
  }, 0);
  var sumTax = _.reduce(contract.coverages, function (memo, coverage) {
    return memo + coverage.tax;
  }, 0);
  contract.premium.rate = sumRate;
  contract.premium.net = sumNet;
  contract.premium.tax = sumTax;
  _.each(contract.periods, function (period) {
    period.premium = sumNet / 2;
    period.tax = sumTax / 2;
  });
  contract.reference = quote.reference;
  request({
    url: 'http://' + printsrv + ':' + printprt + '/auto/contract',
    method: 'POST',
    json: contract
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
      var doc = {};
      doc.docname = quote.reference;
      doc.pdfid = body.id;
      doc.lob = '/auto/contract';
      res.send({
        doc: doc
      });
    }
  });
  // }}}
}

function printAttestation(req, res) {
  // {{{
  var quote = req.body.quote;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var attestation = {
    date: '2014-12-25',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    reference: 'A06072',
    endorsement: 0,
    receipt: '14XXXXXXXXX',
    fromDate: '2014-01-01',
    toDate: '2014-06-30',
    settlementText: 'Réglé par chèque BNA N°0785',
    vehicle: {
      vin: 'VF7NX5FS0DY512418',
      make: 'Citroen',
      model: 'DS4',
      kind: 'VP',
      fuel: 'ESSENCE',
      power: 7,
      placesNumber: 5,
      emptyWeight: 1.28,
      totalWeight: 1.755,
      payload: 0.475,
      registrationNumber: '6604TU168',
      issueDate: '2013-09-25',
      newValue: 57000,
      updatedValue: 57000
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        phone: '58366646',
        address: '14 rue de Guinée 1100 Zaghouan'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: true,
      name: 'El Wifack Leasing',
      releaseDate: '2018-12-31'
    },
    policy: {
      status: 1,
      usage: '01-P-P-V',
      bonus: 4,
      kind: 1,
      billingFrequency: 2,
      effectiveDate: '2014-01-01',
      endDate: '2014-12-31',
      termDate: '2015-01-01'
    },
    coverages: [{
      code: 'G01',
      premium: 105.1050,
      tax: 12.6130
    }, {
      code: 'G02',
      premium: 20,
      tax: 2
    }, {
      code: 'G04',
      premium: 115,
      tax: 11.50
    }, {
      code: 'G30',
      premium: 30,
      tax: 3
    }, {
      code: 'G03',
      premium: 105,
      tax: 10.50
    }, {
      code: 'G06',
      premium: 1142,
      tax: 114.20
    }, {
      code: 'G34',
      premium: 70,
      tax: 7
    }, {
      code: 'G16',
      premium: 31.25,
      tax: 3.125
    }, {
      code: 'G28',
      premium: 55,
      tax: 5.50
    }],
    premium: {
      net: null,
      tax: null,
      fees: 20,
      feesTax: 2.4,
      stamps: {
        FGA: 1,
        FPAC: 0.5,
        FSSR: 0.3
      },
      total: null,
      totalTax: null
    }
  };
  attestation.premium.net = _.reduce(attestation.coverages, function (memo,
    coverage) {
    return memo + coverage.premium;
  }, 0);
  attestation.premium.tax = _.reduce(attestation.coverages, function (memo,
    coverage) {
    return memo + coverage.tax;
  }, 0);
  attestation.premium.totalTax = attestation.premium.tax + attestation.premium.feesTax;
  attestation.premium.total = attestation.premium.net + attestation.premium.fees +
    attestation.premium.totalTax + _.reduce(attestation.premium.stamps,
      function (memo, stamp) {
        return memo + stamp;
      }, 0);
  attestation.contract = quote.reference;
  request({
    url: 'http://' + printsrv + ':' + printprt + '/auto/attestation',
    method: 'POST',
    json: attestation
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
      var doc = {};
      doc.docname = quote.reference;
      doc.pdfid = body.id;
      doc.lob = '/auto/attestation';
      res.send({
        doc: doc
      });
    }
  });
  // }}}
}

function printReceipt(req, res) {
  // {{{
  var quote = req.body.quote;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var receipt = {
    date: '2014-12-25',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    reference: '14XXXXXXXXX',
    contract: '14100XXXXXX',
    endorsement: 0,
    fromDate: '2014-01-01',
    toDate: '2014-06-30',
    branche: {
      fr: 'épargne et prévoyance',
      ar: 'الإدخار و الحيطة'
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        phone: '58366646',
        address: '14 rue de Guinée 1100 Zaghouan'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: false,
      name: 'El Wifack Leasing',
      releaseDate: '2018-12-31'
    },
    premium: {
      net: null,
      tax: null,
      fees: 20,
      feesTax: 2.4,
      stamps: {
        FGA: 1,
        FPAC: 0.5,
        FSSR: 0.3
      },
      total: null,
      totalTax: null
    }
  };
  receipt.premium.net = _.reduce(receipt.coverages, function (memo, coverage) {
    return memo + coverage.premium;
  }, 0);
  receipt.premium.tax = _.reduce(receipt.coverages, function (memo, coverage) {
    return memo + coverage.tax;
  }, 0);
  receipt.premium.totalTax = receipt.premium.tax + receipt.premium.feesTax;
  receipt.premium.total = receipt.premium.net + receipt.premium.fees + receipt.premium
    .totalTax + _.reduce(receipt.premium.stamps, function (memo, stamp) {
      return memo + stamp;
    }, 0);
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
      var doc = {};
      doc.docname = quote.reference;
      doc.pdfid = body.id;
      doc.lob = '/all/receipt';
      res.send({
        doc: doc
      });
    }
  });
  // }}}
}

function searchMotor(req, res) {
  // {{{
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
  }]);
  // }}}
}

function getPolicy(req, res) {
  // {{{
  var id = req.body.id;
  if (id === '14100999999') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Annuelle',
        effectiveDate: '2014-01-01',
        primaryTermDate: '2015-01-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Ali Kefia',
        subscriberPhone: '71666777',
        subscriberEmail: 'ali.kefia@attakafulia.tn',
        cpDoc: {
          title: 'Conditions générales'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        validated: true
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Ali',
        lastName: 'Kefia',
        phone1: '71666777',
        email1: 'ali.kefia@attakafulia.tn'
      }
    });
  }
  else if (id === '14100888888') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Annuelle',
        effectiveDate: '2014-01-01',
        primaryTermDate: '2015-01-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Ali Kefia',
        subscriberPhone: '71666777',
        subscriberEmail: 'ali.kefia@attakafulia.tn',
        cpDoc: {
          title: 'Conditions générales'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        validated: false
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Ali',
        lastName: 'Kefia',
        phone1: '71 666 777',
        email1: 'ali.kefia@attakafulia.tn'
      }
    });
  }
  else {
    res.send(500, {
      error: 'Pas de police'
    });
  }
}

function checkCoverage(req, res) {
  // {{{
  //var quote = req.body.quote;
  res.send({});
  // }}}
}

function validateContract(req, res) {
  // {{{
  var docs = {};
  docs.rcdoc = {};
  docs.rcdoc.doc = 'rc-14100999999';
  docs.rcdoc.lob = '/auto/receipt';
  docs.rcdoc.id = 'XXXXX';
  docs.cpdoc = {};
  docs.cpdoc.doc = 'cp-14100999999';
  docs.cpdoc.lob = '/auto/contract';
  docs.cpdoc.id = 'XXXXX';
  docs.atdoc = {};
  docs.atdoc.doc = 'at-14100999999';
  docs.atdoc.lob = '/auto/attestation';
  docs.atdoc.id = 'XXXXX';
  res.send({
    docs: docs
  });
  // }}}
}

function regenerateDocs(req, res) {
  // {{{
  var docs = {};
  docs.rcdoc = {};
  docs.rcdoc.doc = 'rc-14100999999';
  docs.rcdoc.lob = '/auto/receipt';
  docs.rcdoc.id = 'XXXXX';
  docs.cpdoc = {};
  docs.cpdoc.doc = 'cp-14100999999';
  docs.cpdoc.lob = '/auto/contract';
  docs.cpdoc.id = 'XXXXX';
  docs.atdoc = {};
  docs.atdoc.doc = 'at-14100999999';
  docs.atdoc.lob = '/auto/attestation';
  docs.atdoc.id = 'XXXXX';
  res.send({
    docs: docs
  });
  // }}}
}

function termList(req, res) {
  // {{{
  var dueTermPolicies = [];
  var termPolicies = [];
  var futureTermPolicies = [];
  var sPol;
  sPol = {};
  sPol.reference = '14100999999';
  sPol.effectiveDate = '2014-12-05';
  sPol.registrationNumber = '9802TU100';
  sPol.termDate = '2015-06-05';
  sPol.clientName = 'Sami Saddem';
  sPol.premium = 666.666;
  sPol.pos = '100';
  sPol.consultlink = {};
  sPol.consultlink.title = 'Testing Due';
  sPol.consultlink.processlink = 'auto#term/id/' + sPol.reference;
  dueTermPolicies.push(sPol);
  sPol = {};
  sPol.reference = '14100888888';
  sPol.effectiveDate = '2014-12-22';
  sPol.registrationNumber = '9999TU105';
  sPol.termDate = '2015-06-22';
  sPol.clientName = 'Sami Saddem';
  sPol.premium = 555.105;
  sPol.pos = '100';
  sPol.consultlink = {};
  sPol.consultlink.title = 'Testing Actual';
  sPol.consultlink.processlink = 'auto#term/id/' + sPol.reference;
  termPolicies.push(sPol);
  sPol = {};
  sPol.reference = '14100000003';
  sPol.effectiveDate = '2014-12-31';
  sPol.registrationNumber = '92TU152';
  sPol.termDate = '2015-06-30';
  sPol.clientName = 'Sami Saddem';
  sPol.premium = 1566.105;
  sPol.pos = '100';
  sPol.consultlink = {};
  sPol.consultlink.title = 'Testing Future';
  sPol.consultlink.processlink = 'auto#term/id/' + sPol.reference;
  futureTermPolicies.push(sPol);
  res.send({
    dueTermPolicies: dueTermPolicies,
    termPolicies: termPolicies,
    futureTermPolicies: futureTermPolicies
  });
  // }}}
}

function termSearch(req, res) {
  // {{{
  res.send(500, {
    error: 'Test'
  });
  // }}}
}

function getTerm(req, res) {
  // {{{
  var id = req.body.id;
  if (id === '14100999999') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Semestriel',
        effectiveDate: '2014-01-01',
        termDate: '2015-07-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Sami Saddem',
        subscriberPhone: '71666777',
        subscriberEmail: 'sami.saddem@attakafulia.tn',
        aeDoc: {
          title: 'Avis d\'échéance'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        validated: true
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Sami',
        lastName: 'Saddem',
        phone1: '71666777',
        email1: 'sami.saddem@attakafulia.tn'
      }
    });
  }
  else if (id === '14100888888') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Semestriel',
        effectiveDate: '2014-01-01',
        termDate: '2015-07-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Sami Saddem',
        subscriberPhone: '71666777',
        subscriberEmail: 'sami.saddem@attakafulia.tn',
        aeDoc: {
          title: 'Avis d\'échéance'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        validated: false
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Sami',
        lastName: 'Saddem',
        phone1: '71666777',
        email1: 'sami.saddem@attakafulia.tn'
      }
    });
  }
  else {
    res.send(500, {
      error: 'Pas de police'
    });
  }
  // }}}
}

function validateTerm(req, res) {
  // {{{
  res.send(500, 'Test');
  // }}}
}

function massTermReceipt(req, res) {
  // {{{
  res.send({});
  // }}}
}

function saveVehicleFleet(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.applyRC = true;
  if (quote.reference) {
    listCoverages(req, res);
  }
  else {
    quote.reference = 'Quote';
    listCoverages(req, res);
  }
  // }}}
}

function addVehicleFleet(req, res) {
  // {{{
  var quote = req.body.quote;
  var retVehs = [{
    'make': 'OPEL',
    'model': 'COMBO',
    'issueDate': '2015-10-10',
    'registrationNumber': 'RS25544',
    'number': 1,
    'power': 5,
    'usage': '01-P-P-V',
    'vin': 'DDZ4554',
    'placesNumber': 5,
    'totalWeight': null,
    'payload': null,
    'newValue': 45900,
    'updatedValue': 45900,
    'companyName': null,
    'beneficiaryClause': null,
    'usageDesc': 'AFFAIRES ET PRIVEE',
    'vehicleMake': 'OPEL - COMBO',
    'coverages': [{
      'code': 'G01',
      'name': 'RC-RTI',
      'limit': 100000,
      'premium': 115.616,
      'tax': 13.874,
      'deductible': null
    }, {
      'code': 'G02',
      'name': 'DRA - CAS',
      'limit': 1000,
      'premium': 20,
      'tax': 2,
      'deductible': null
    }, {
      'code': 'G04',
      'name': 'INCENDIE',
      'limit': 45900,
      'premium': 157.798,
      'tax': 15.780000000000001,
      'deductible': null
    }, {
      'code': 'G03',
      'name': 'VOL',
      'limit': 45900,
      'premium': 141.684,
      'tax': 14.168000000000001,
      'deductible': null
    }, {
      'code': 'G28',
      'name': 'ASSISTANCE GOLD',
      'limit': null,
      'premium': 55,
      'tax': 5.5,
      'deductible': null
    }, {
      'code': 'G09',
      'name': 'PERSONNES TRANSPORTEES ASSUREES',
      'limit': 5000,
      'premium': 31.25,
      'tax': 3.125,
      'deductible': null
    }, {
      'code': 'G39',
      'name': 'ASSISTANCE ACCIDENT AUTO (3A)',
      'limit': null,
      'premium': 30,
      'tax': 3,
      'deductible': null
    }],
    'premium': 551.348
  }, {
    'make': 'ALFA ROMEO',
    'model': 'MITO',
    'issueDate': '2015-10-10',
    'registrationNumber': 'RS477255',
    'number': 2,
    'power': 7,
    'usage': '01-P-P-V',
    'vin': 'QQS78578',
    'placesNumber': 5,
    'totalWeight': null,
    'payload': null,
    'newValue': 45900,
    'updatedValue': 45900,
    'companyName': null,
    'beneficiaryClause': null,
    'usageDesc': 'AFFAIRES ET PRIVEE',
    'vehicleMake': 'ALFA ROMEO - MITO',
    'coverages': [{
      'code': 'G01',
      'name': 'RC-RTI',
      'limit': 100000,
      'premium': 128.321,
      'tax': 15.399000000000001,
      'deductible': null
    }, {
      'code': 'G02',
      'name': 'DRA - CAS',
      'limit': 1000,
      'premium': 20,
      'tax': 2,
      'deductible': null
    }, {
      'code': 'G04',
      'name': 'INCENDIE',
      'limit': 45900,
      'premium': 157.798,
      'tax': 15.780000000000001,
      'deductible': null
    }, {
      'code': 'G03',
      'name': 'VOL',
      'limit': 45900,
      'premium': 141.684,
      'tax': 14.168000000000001,
      'deductible': null
    }, {
      'code': 'G28',
      'name': 'ASSISTANCE GOLD',
      'limit': null,
      'premium': 55,
      'tax': 5.5,
      'deductible': null
    }, {
      'code': 'G09',
      'name': 'PERSONNES TRANSPORTEES ASSUREES',
      'limit': 5000,
      'premium': 31.25,
      'tax': 3.125,
      'deductible': null
    }, {
      'code': 'G39',
      'name': 'ASSISTANCE ACCIDENT AUTO (3A)',
      'limit': null,
      'premium': 30,
      'tax': 3,
      'deductible': null
    }],
    'premium': 564.053
  }];
  res.send({
    quote: quote,
    vehicles: retVehs
  });
  // }}}
}

function removeVehicleFleet(req, res) {
  // {{{
  var quote = req.body.quote;
  var selVehicle = req.body.vehicle;
  var vehicles = req.body.vehicles;
  var num = selVehicle.number;
  var retVehs = [];
  _.each(vehicles, function (item) {
    if (item.number < num) {
      retVehs.push(item);
    }
    else {
      if (item.number > num) {
        item.number = item.number - 1;
        retVehs.push(item);
      }
    }
  });
  quote.premium = 426;
  quote.fees = 40;
  quote.taxes = 12.796;
  res.send({
    quote: quote,
    vehicles: retVehs
  });
  // }}}
}

function fleetSummary(req, res) {
  // {{{
  var quote = req.body.quote;
  var vehicles = req.body.vehicles;
  var retVehs = [];
  var vehCovers;
  var rand;
  quote.applyRC = false;
  _.each(vehicles, function (item) {
    rand = Math.random();
    vehCovers = [{
      name: 'Responsabilité Civile',
      subscribed: true,
      subscribedModifiable: false,
      rate: 1200,
      tax: 100 * rand,
      premium: 1200 * rand
    }, {
      name: 'Dommages et Collisions',
      limit: 10000,
      subscribed: true,
      limitModifiable: true,
      deductible: 5,
      tax: 250 * rand,
      premium: 2500 * rand,
      deductibleModifiable: true
    }, {
      name: 'Vol',
      limitModifiable: true,
      subscribed: true,
      tax: 75 * rand,
      premium: 750 * rand,
      maxLimit: 10000
    }, {
      name: 'Incendie',
      subscribed: true,
      deductibleModifiable: true,
      tax: 85 * rand,
      premium: 850 * rand,
      deductible: 10
    }];
    item.premium = 1590 * rand;
    item.coverages = vehCovers;
    retVehs.push(item);
  });
  quote.premium = 1250.156;
  quote.fees = 40;
  quote.taxes = 125.123;
  res.send({
    quote: quote,
    vehicles: retVehs
  });
  // }}}
}

function fleetCalculate(req, res) {
  // {{{
  var quote = req.body.quote;
  var vehicles = req.body.vehicles;
  var retVehs = [];
  var vehCovers;
  var rand;
  _.each(vehicles, function (item) {
    rand = Math.random();
    vehCovers = [{
      name: 'Responsabilité Civile',
      subscribed: true,
      subscribedModifiable: false,
      rate: 1200,
      tax: 100 * rand,
      premium: 1200 * rand
    }, {
      name: 'Dommages et Collisions',
      limit: 10000,
      subscribed: true,
      limitModifiable: true,
      deductible: 5,
      tax: 250 * rand,
      premium: 2500 * rand,
      deductibleModifiable: true
    }, {
      name: 'Vol',
      limitModifiable: true,
      subscribed: true,
      tax: 75 * rand,
      premium: 750 * rand,
      maxLimit: 10000
    }, {
      name: 'Incendie',
      subscribed: true,
      deductibleModifiable: true,
      tax: 85 * rand,
      premium: 850 * rand,
      deductible: 10
    }];
    item.premium = 1590 * rand;
    item.coverages = vehCovers;
    retVehs.push(item);
  });
  quote.premium = 1250.156;
  quote.fees = 40;
  quote.taxes = 125.123;
  quote.applyRC = false;
  res.send({
    quote: quote,
    vehicles: retVehs
  });
  // }}}
}

function fleetCreate(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.contractref = '14100999999';
  quote.validateLink = {};
  quote.validateLink.title = 'Validez votre contrat N° 14100999999';
  quote.validateLink.processlink = 'auto#contract/14100999999/valid';
  res.send({
    quote: quote
  });
  // }}}
}

function fleetGet(req, res) {
  // {{{
  var id = req.body.id;
  if (id === '14100999999') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Annuelle',
        effectiveDate: '2014-01-01',
        primaryTermDate: '2015-01-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        vehicleCount: 4,
        stamps: 7.2,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Ali Kefia',
        subscriberPhone: '31331800',
        subscriberAddress: '15 Rue de Jérusalem Belvédere Tunis 1002',
        cpDoc: {
          title: 'Conditions générales'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        userAdmin: true,
        validated: true,
        defaultBonus: true,
        customBonus: null
      },
      vehicles: [{
        number: 1,
        make: 'Peugeot',
        model: '208',
        power: '4',
        usageDesc: 'Affaire et Privé',
        issueDate: '2014-10-21',
        registrationNumber: '160TU22',
        premium: 495.166,
        taxes: 51.126,
        stamps: 1.8,
        bonus: 4,
        coverages: [{
          name: 'Responsabilité Civile',
          subscribed: true,
          subscribedModifiable: false,
          rate: 1200,
          tax: 100,
          premium: 1200
        }, {
          name: 'Dommages et Collisions',
          limit: 10000,
          subscribed: true,
          limitModifiable: true,
          deductible: 5,
          deductibleModifiable: true
        }, {
          name: 'Vol',
          limitModifiable: true,
          subscribed: true,
          maxLimit: 10000
        }, {
          name: 'Incendie',
          subscribed: true,
          deductibleModifiable: true,
          minDeductible: 10
        }]
      }, {
        number: 2,
        make: 'Renault',
        model: 'Clio',
        power: '4',
        usageDesc: 'Affaire et Privé',
        issueDate: '2015-01-01',
        registrationNumber: '174TU1596',
        premium: 726.808,
        taxes: 80.159,
        stamps: 1.8,
        bonus: 1,
        coverages: [{
          name: 'Responsabilité Civile',
          subscribed: true,
          subscribedModifiable: false,
          rate: 1200,
          tax: 100,
          premium: 1200
        }, {
          name: 'Dommages et Collisions',
          limit: 10000,
          subscribed: true,
          limitModifiable: true,
          deductible: 5,
          deductibleModifiable: true
        }, {
          name: 'Vol',
          limitModifiable: true,
          subscribed: true,
          maxLimit: 10000
        }, {
          name: 'Incendie',
          subscribed: true,
          deductibleModifiable: true,
          minDeductible: 10
        }]
      }],
      person: {
        id: '12345678',
        firstName: 'Ali',
        lastName: 'Kefia',
        phone1: '71666777',
        email1: 'ali.kefia@attakafulia.tn'
      },
      validationLocks: [{
        id: 1,
        description: 'Véhicule N° 1 immatriculé 5578TU99 a plus de 20 ans (26 ans)',
        validated: true
      }, {
        id: 2,
        description: 'Jeux de garanties incorrect pour le véhicule N°3 immaticulé 5578TU125 (Garantie 3A non souscrite)',
        validated: false
      }, {
        id: 3,
        description: 'Jeux de garanties incorrect pour le véhicule N°1 immaticulé 5578TU125 (Garantie Assistance GOLD non souscrite)'
      }],
      discounts: []
    });
  }
  else if (id === '14100888888') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Annuelle',
        effectiveDate: '2014-01-01',
        primaryTermDate: '2015-01-01',
        beginDate: null,
        endDate: null,
        premium: 300,
        fees: 20,
        taxes: 10,
        stampFGA: 1,
        stampFSSR: 1,
        stampFPAC: 1,
        vehicleCount: 4,
        stamps: 7.2,
        totalContribution: 333,
        subscriber: 'Personne physique',
        subscriberName: 'Ali Kefia',
        subscriberPhone: '71666777',
        subscriberEmail: 'ali.kefia@attakafulia.tn',
        cpDoc: {
          title: 'Conditions générales'
        },
        attestationDoc: {
          title: 'Attestation d\'assurance'
        },
        receiptDoc: {
          title: 'Quittance'
        },
        isquote: false,
        userAdmin: true,
        validated: false
      },
      vehicle: {
        make: 'Peugeot',
        model: '208',
        power: '4',
        usageDesc: 'Affaire et Privé',
        issueDate: '2013-01-01',
        registrationNumber: '168 TN 6833'
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }],
      person: {
        id: '12345678',
        firstName: 'Ali',
        lastName: 'Kefia',
        phone1: '71666777',
        email1: 'ali.kefia@attakafulia.tn'
      },
      discounts: []
    });
  }
  else {
    res.send(500, {
      error: 'Pas de police'
    });
  }
  // }}}
}

function fleetValidate(req, res) {
  // {{{
  var receiptDoc = {};
  receiptDoc.doc = 'rc-14100999999';
  receiptDoc.lob = '/auto/receipt';
  receiptDoc.id = 'XXXXX';
  res.send({
    receiptDoc: receiptDoc
  });
  // }}}
}

function fleetprintAttestation(req, res) {
  // {{{
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var attestation = {
    date: '2014-12-25',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    reference: 'A06072',
    contract: '14100XXXXXX',
    endorsement: 0,
    receipt: '14XXXXXXXXX',
    fromDate: '2014-01-01',
    toDate: '2014-06-30',
    settlementText: 'Réglé par chèque BNA N°0785',
    vehicle: {
      vin: 'VF7NX5FS0DY512418',
      make: 'Citroen',
      model: 'DS4',
      kind: 'VP',
      fuel: 'ESSENCE',
      power: 7,
      placesNumber: 5,
      emptyWeight: 1.28,
      totalWeight: 1.755,
      payload: 0.475,
      registrationNumber: '6604TU168',
      issueDate: '2013-09-25',
      newValue: 57000,
      updatedValue: 57000
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        phone: '58366646',
        address: '14 rue de Guinée 1100 Zaghouan'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: true,
      name: 'El Wifack Leasing',
      releaseDate: '2018-12-31'
    },
    policy: {
      status: 1,
      usage: '01-P-P-V',
      bonus: 4,
      kind: 1,
      billingFrequency: 2,
      effectiveDate: '2014-01-01',
      endDate: '2014-12-31',
      termDate: '2015-01-01'
    },
    coverages: [{
      code: 'G01',
      premium: 105.1050,
      tax: 12.6130
    }, {
      code: 'G02',
      premium: 20,
      tax: 2
    }, {
      code: 'G04',
      premium: 115,
      tax: 11.50
    }, {
      code: 'G30',
      premium: 30,
      tax: 3
    }, {
      code: 'G03',
      premium: 105,
      tax: 10.50
    }, {
      code: 'G06',
      premium: 1142,
      tax: 114.20
    }, {
      code: 'G34',
      premium: 70,
      tax: 7
    }, {
      code: 'G16',
      premium: 31.25,
      tax: 3.125
    }, {
      code: 'G28',
      premium: 55,
      tax: 5.50
    }],
    premium: {
      net: null,
      tax: null,
      fees: 20,
      feesTax: 2.4,
      stamps: {
        FGA: 1,
        FPAC: 0.5,
        FSSR: 0.3
      },
      total: null,
      totalTax: null
    }
  };
  attestation.premium.net = _.reduce(attestation.coverages, function (memo,
    coverage) {
    return memo + coverage.premium;
  }, 0);
  attestation.premium.tax = _.reduce(attestation.coverages, function (memo,
    coverage) {
    return memo + coverage.tax;
  }, 0);
  attestation.premium.totalTax = attestation.premium.tax + attestation.premium.feesTax;
  attestation.premium.total = attestation.premium.net + attestation.premium.fees +
    attestation.premium.totalTax + _.reduce(attestation.premium.stamps,
      function (memo, stamp) {
        return memo + stamp;
      }, 0);
  request({
    url: 'http://' + printsrv + ':' + printprt + '/auto/attestation',
    method: 'POST',
    json: attestation
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
      var doc = {};
      doc.docname = attestation.contract;
      doc.pdfid = body.id;
      doc.lob = '/auto/attestation';
      res.send({
        doc: doc
      });
    }
  });
  // }}}
}

function fleetprintVehicle(req, res) {
  // {{{
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var contract = {
    date: '2013-12-25',
    pos: {
      code: '100',
      name: 'CC - Mohamed Tahar Chaouat'
    },
    reference: '14100XXXXXX',
    endorsement: 0,
    transaction: 0,
    vehicle: {
      vin: 'VF7NX5FS0DY512418',
      make: 'PEUGEOT',
      model: 'AXDHRTRT',
      kind: 'VP',
      fuel: 'ESSENCE',
      power: 7,
      placesNumber: 5,
      emptyWeight: 1.28,
      totalWeight: 1.755,
      payload: 0.475,
      registrationNumber: '6604TU168',
      issueDate: '2013-09-25',
      newValue: 57000,
      updatedValue: 57000
    },
    subscriber: {
      type: 1,
      reference: 'XXXXXXX',
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        phone: '58366646',
        address: '14 rue de Guinée 1100 Zaghouan'
      }
    },
    insured: {
      type: 1,
      entity: {
        id: '00961973',
        name: 'Ali Kefia',
        drivingLicense: '07KB05195'
      }
    },
    beneficiary: {
      clause: true,
      name: 'El Wifack Leasing',
      releaseDate: '2018-12-31'
    },
    policy: {
      status: 1,
      usage: '01-P-P-V',
      bonus: 4,
      kind: 1,
      billingFrequency: 2,
      effectiveDate: '2014-01-01',
      termDate: '2015-01-01'
    },
    coverages: [{
      code: 'G01',
      limit: 100000,
      rate: 105.1050,
      premium: 105.1050,
      tax: 12.6130
    }, {
      code: 'G02',
      limit: 1000,
      rate: 20,
      premium: 20,
      tax: 2
    }, {
      code: 'G04',
      limit: 30000,
      rate: 115,
      premium: 115,
      tax: 11.50
    }, {
      code: 'G30',
      limit: 3000,
      rate: 30,
      premium: 30,
      tax: 3
    }, {
      code: 'G03',
      limit: 30000,
      rate: 105,
      premium: 105,
      tax: 10.50
    }, {
      code: 'G06',
      limit: 35000,
      deductible: 0,
      rate: 1142,
      premium: 1142,
      tax: 114.20
    }, {
      code: 'G34',
      limit: 3500,
      rate: 70,
      premium: 70,
      tax: 7
    }, {
      code: 'G16',
      limit: 25000,
      rate: 31.25,
      premium: 31.25,
      tax: 3.125
    }, {
      code: 'G28',
      rate: 55,
      premium: 55,
      tax: 5.50
    }],
    premium: {
      rate: null,
      net: null,
      tax: null
    },
    receipting: {
      fees: 20,
      tax: 2.4,
      stamps: {
        FGA: 1,
        FPAC: 0.5,
        FSSR: 0.3
      }
    },
    periods: [{
      fromDate: '2014-01-01',
      toDate: '2014-06-30',
      premium: null,
      tax: null
    }, {
      fromDate: '2014-07-01',
      toDate: '2014-12-31',
      premium: null,
      tax: null
    }]
  };
  var sumRate = _.reduce(contract.coverages, function (memo, coverage) {
    return memo + coverage.rate;
  }, 0);
  var sumNet = _.reduce(contract.coverages, function (memo, coverage) {
    return memo + coverage.premium;
  }, 0);
  var sumTax = _.reduce(contract.coverages, function (memo, coverage) {
    return memo + coverage.tax;
  }, 0);
  contract.premium.rate = sumRate;
  contract.premium.net = sumNet;
  contract.premium.tax = sumTax;
  _.each(contract.periods, function (period) {
    period.premium = sumNet / 2;
    period.tax = sumTax / 2;
  });
  request({
    url: 'http://' + printsrv + ':' + printprt + '/auto/vehiculesheet',
    method: 'POST',
    json: contract
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
      var doc = {};
      doc.docname = contract.reference;
      doc.pdfid = body.id;
      doc.lob = '/auto/vehiculesheet';
      res.send({
        doc: doc
      });
    }
  });
  // }}}
}

function getVehicle(req, res) {
  // {{{
  var rand;
  rand = Math.random();
  var coverages = [{
    code: 'G01',
    name: 'Responsabilité Civile',
    limit: 100000,
    rate: 105.1050 * rand,
    premium: 105.1050 * rand,
    tax: 12.6130 * rand
  }, {
    code: 'G02',
    name: 'Défense et recours',
    limit: 1000,
    rate: 20 * rand,
    premium: 20 * rand,
    tax: 2 * rand
  }, {
    code: 'G04',
    name: 'Incendie',
    limit: 30000,
    rate: 115 * rand,
    premium: 115 * rand,
    tax: 11.50 * rand
  }, {
    code: 'G30',
    name: 'Force de la nature',
    limit: 3000,
    rate: 30 * rand,
    premium: 30 * rand,
    tax: 3 * rand
  }, {
    code: 'G03',
    name: 'Vol',
    limit: 30000,
    rate: 105 * rand,
    premium: 105 * rand,
    tax: 10.50 * rand
  }, {
    code: 'G06',
    name: 'Dommages aux véhicules',
    limit: 35000,
    deductible: 0,
    rate: 1142 * rand,
    premium: 1142 * rand,
    tax: 114.20 * rand
  }, {
    code: 'G34',
    name: 'Assistance Accidents Auto 3A',
    limit: 3500,
    rate: 70 * rand,
    premium: 70 * rand,
    tax: 7 * rand
  }, {
    code: 'G16',
    name: 'Conducteur +',
    limit: 25000,
    rate: 31.25 * rand,
    premium: 31.25 * rand,
    tax: 3.125 * rand
  }, {
    code: 'G28',
    name: 'Assistance GOLD',
    rate: 55 * rand,
    premium: 55 * rand,
    tax: 5.50 * rand
  }];
  res.send({
    coverages: coverages
  });
  // }}}
}

function exportFleet(req, res) {
  // {{{
  var quote = req.body.quote;
  var fleetFile = path.resolve(__dirname, '..');
  fleetFile = path.join(fleetFile, 'data/printing/quote/');
  fleetFile += quote.reference + '.csv';
  if (fs.existsSync(fleetFile)) {
    fs.unlinkSync(fleetFile);
  }
  var sLine;
  var vehicles = req.body.vehicles;
  var rand;
  var rank = 0;
  _.each(vehicles, function (item) {
    rank++;
    sLine = 'N°;Mat;N° Chassis;Usage;Puiss;NbPc;PV;CU;PTC;Val. Vén.;';
    sLine += 'Val. Neuf;Marque;Modèle;Bénéficiaire;\n';
    fs.appendFileSync(fleetFile, sLine);
    sLine = rank + ';' + item.registrationNumber + ';' + item.vin + ';';
    sLine += item.usage + ';' + item.power.toFixed(0);
    sLine += ';' + item.placesNumber.toFixed(0) + ';';
    if (item.totalWeight !== null && item.payload !== null) {
      sLine += (item.totalWeight - item.payload)
        .toFixed(3) + ';';
      sLine += item.payload.toFixed(3) + ';';
      sLine += item.totalWeight.toFixed(3) + ';';
    }
    else {
      sLine += ';;;';
    }
    sLine += item.updatedValue.toFixed(3) + ';';
    sLine += item.newValue.toFixed(3) + ';';
    sLine += item.vehicleMake.split('-')[0] + ';';
    sLine += item.vehicleMake.split('-')[1] + ';';
    if (item.companyName !== null) {
      sLine += item.companyName + ';\n';
    }
    else {
      sLine += ';\n';
    }
    fs.appendFileSync(fleetFile, sLine);
    rand = Math.random();
    item.coverages = [{
      code: 'G01',
      name: 'Responsabilité Civile',
      limit: 100000,
      rate: 105.1050 * rand,
      premium: 105.1050 * rand,
      tax: 12.6130 * rand
    }, {
      code: 'G02',
      name: 'Défense et recours',
      limit: 1000,
      rate: 20 * rand,
      premium: 20 * rand,
      tax: 2 * rand
    }, {
      code: 'G04',
      name: 'Incendie',
      limit: 30000,
      rate: 115 * rand,
      premium: 115 * rand,
      tax: 11.50 * rand
    }, {
      code: 'G30',
      name: 'Force de la nature',
      limit: 3000,
      rate: 30 * rand,
      premium: 30 * rand,
      tax: 3 * rand
    }, {
      code: 'G03',
      name: 'Vol',
      limit: 30000,
      rate: 105 * rand,
      premium: 105 * rand,
      tax: 10.50 * rand
    }, {
      code: 'G06',
      name: 'Dommages aux véhicules',
      limit: 35000,
      deductible: 0,
      rate: 1142 * rand,
      premium: 1142 * rand,
      tax: 114.20 * rand
    }, {
      code: 'G34',
      name: 'Assistance Accidents Auto 3A',
      limit: 3500,
      rate: 70 * rand,
      premium: 70 * rand,
      tax: 7 * rand
    }, {
      code: 'G16',
      name: 'Conducteur +',
      limit: 25000,
      rate: 31.25 * rand,
      premium: 31.25 * rand,
      tax: 3.125 * rand
    }, {
      code: 'G28',
      name: 'Assistance GOLD',
      rate: 55 * rand,
      premium: 55 * rand,
      tax: 5.50 * rand
    }];
    sLine = ';;;;;;;Code;Désignation Garantie;Capital;Franchise;';
    sLine += 'Cont. Nette;Taxes;TTC;\n';
    fs.appendFileSync(fleetFile, sLine);
    sLine = ';;;;;;;G01;Responsabilité Civile;100000;;';
    sLine += (105.1050 * rand)
      .toFixed(3) + ';';
    sLine += (12.6130 * rand)
      .toFixed(3) + ';';
    sLine += ((105.1050 * rand) + (12.6130 * rand))
      .toFixed(3) + ';\n';
    fs.appendFileSync(fleetFile, sLine);
    sLine = ';;;;;;;G02;Défense et recours;1000;;';
    sLine += (20 * rand)
      .toFixed(3) + ';';
    sLine += (2 * rand)
      .toFixed(3) + ';';
    sLine += ((20 * rand) + (2 * rand))
      .toFixed(3) + ';\n';
    fs.appendFileSync(fleetFile, sLine);
  });
  res.send({
    quote: quote,
    vehicles: vehicles
  });
  // }}}
}

function getFleetFile(req, res) {
  // {{{
  var doc = req.query.doc;
  var fleetFile = path.resolve(__dirname, '..');
  if (doc !== 'modele' && doc !== 'explain') {
    fleetFile = path.join(fleetFile, 'data/printing/quote/');
  }
  else {
    fleetFile = path.join(fleetFile, 'public/res/auto/');
  }
  if (doc !== 'explain') {
    fleetFile += doc + '.csv';
  }
  else {
    fleetFile += 'flotte-doc.pdf';
  }
  if (fs.existsSync(fleetFile)) {
    if (doc !== 'explain') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + doc +
        '.csv');
    }
    else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        'attachment; filename=flotte-doc.pdf');
    }
    res.send(fs.readFileSync(fleetFile));
    if (doc !== 'modele') {
      fs.unlinkSync(fleetFile);
    }
  }
  else {
    res.send(500, 'Erreur lors de la récupération de la flotte !');
  }
  // }}}
}

function lockvalidation(req, res) {
  // {{{
  res.send({
    validationLocks: [{
      id: 1,
      description: 'Véhicule N° 1 immatriculé 5578TU99 a plus de 20 ans (26 ans)',
      validated: true
    }, {
      id: 2,
      description: 'Jeux de garanties incorrect pour le véhicule N°3 immaticulé 5578TU125 (Garantie 3A non souscrite)',
      validated: false
    }, {
      id: 3,
      description: 'Jeux de garanties incorrect pour le véhicule N°1 immaticulé 5578TU125 (Garantie Assistance GOLD non souscrite)'
    }]
  });
  // }}}
}

function unlockvalidation(req, res) {
  // {{{
  res.send({
    validationLocks: [{
      id: 1,
      description: 'Véhicule N° 1 immatriculé 5578TU99 a plus de 20 ans (26 ans)',
      validated: true
    }, {
      id: 2,
      description: 'Jeux de garanties incorrect pour le véhicule N°3 immaticulé 5578TU125 (Garantie 3A non souscrite)',
      validated: false
    }, {
      id: 3,
      description: 'Jeux de garanties incorrect pour le véhicule N°1 immaticulé 5578TU125 (Garantie Assistance GOLD non souscrite)'
    }]
  });
  // }}}
}

function applyBonus(req, res) {
  // {{{
  var randCoef;
  randCoef = Math.random();
  res.send({
    policy: {
      reference: '14100999999',
      kind: 'Renouvelable',
      billingFrequency: 'Annuelle',
      effectiveDate: '2014-01-01',
      primaryTermDate: '2015-01-01',
      beginDate: null,
      endDate: null,
      premium: 300 * randCoef,
      fees: 20 * randCoef,
      taxes: 10 * randCoef,
      stampFGA: 1,
      stampFSSR: 1,
      stampFPAC: 1,
      vehicleCount: 4,
      stamps: 7.2,
      totalContribution: 333 * randCoef,
      subscriber: 'Personne physique',
      subscriberName: 'Ali Kefia',
      subscriberPhone: '31331800',
      subscriberAddress: '15 Rue de Jérusalem Belvédere Tunis 1002',
      cpDoc: {
        title: 'Conditions générales'
      },
      attestationDoc: {
        title: 'Attestation d\'assurance'
      },
      receiptDoc: {
        title: 'Quittance'
      },
      isquote: false,
      userAdmin: true,
      validated: true,
      defaultBonus: true,
      customBonus: null
    },
    vehicles: [{
      number: 1,
      make: 'Peugeot',
      model: '208',
      power: '4',
      issueDate: '2014-10-21',
      registrationNumber: '160TU22',
      premium: 495.166 * randCoef,
      taxes: 51.126 * randCoef,
      stamps: 1.8,
      bonus: 1,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }, {
      number: 2,
      make: 'Renault',
      model: 'Clio',
      power: '4',
      issueDate: '2015-01-01',
      registrationNumber: '174TU1596',
      premium: 726.808 * randCoef,
      taxes: 80.159 * randCoef,
      stamps: 1.8,
      bonus: 1,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }],
    person: {
      id: '12345678',
      firstName: 'Ali',
      lastName: 'Kefia',
      phone1: '71666777',
      email1: 'ali.kefia@attakafulia.tn'
    },
    validationLocks: [{
      id: 1,
      description: 'Véhicule N° 1 immatriculé 5578TU99 a plus de 20 ans (26 ans)',
      validated: true
    }, {
      id: 2,
      description: 'Jeux de garanties incorrect pour le véhicule N°3 immaticulé 5578TU125 (Garantie 3A non souscrite)',
      validated: false
    }, {
      id: 3,
      description: 'Jeux de garanties incorrect pour le véhicule N°1 immaticulé 5578TU125 (Garantie Assistance GOLD non souscrite)'
    }]
  });
  // }}}
}

function revertBonus(req, res) {
  // {{{
  res.send({
    policy: {
      reference: '14100999999',
      kind: 'Renouvelable',
      billingFrequency: 'Annuelle',
      effectiveDate: '2014-01-01',
      primaryTermDate: '2015-01-01',
      beginDate: null,
      endDate: null,
      premium: 300,
      fees: 20,
      taxes: 10,
      stampFGA: 1,
      stampFSSR: 1,
      stampFPAC: 1,
      vehicleCount: 4,
      stamps: 7.2,
      totalContribution: 333,
      subscriber: 'Personne physique',
      subscriberName: 'Ali Kefia',
      subscriberPhone: '31331800',
      subscriberAddress: '15 Rue de Jérusalem Belvédere Tunis 1002',
      cpDoc: {
        title: 'Conditions générales'
      },
      attestationDoc: {
        title: 'Attestation d\'assurance'
      },
      receiptDoc: {
        title: 'Quittance'
      },
      isquote: false,
      userAdmin: true,
      validated: true,
      defaultBonus: true,
      customBonus: null
    },
    vehicles: [{
      number: 1,
      make: 'Peugeot',
      model: '208',
      power: '4',
      issueDate: '2014-10-21',
      registrationNumber: '160TU22',
      premium: 495.166,
      taxes: 51.126,
      stamps: 1.8,
      bonus: 4,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }, {
      number: 2,
      make: 'Renault',
      model: 'Clio',
      power: '4',
      issueDate: '2015-01-01',
      registrationNumber: '174TU1596',
      premium: 726.808,
      taxes: 80.159,
      stamps: 1.8,
      bonus: 1,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }],
    person: {
      id: '12345678',
      firstName: 'Ali',
      lastName: 'Kefia',
      phone1: '71666777',
      email1: 'ali.kefia@attakafulia.tn'
    },
    validationLocks: [{
      id: 1,
      description: 'Véhicule N° 1 immatriculé 5578TU99 a plus de 20 ans (26 ans)',
      validated: true
    }, {
      id: 2,
      description: 'Jeux de garanties incorrect pour le véhicule N°3 immaticulé 5578TU125 (Garantie 3A non souscrite)',
      validated: false
    }, {
      id: 3,
      description: 'Jeux de garanties incorrect pour le véhicule N°1 immaticulé 5578TU125 (Garantie Assistance GOLD non souscrite)'
    }]
  });
  // }}}
}

function saveBonus(req, res) {
  // {{{
  var randCoef;
  randCoef = Math.random();
  res.send({
    policy: {
      reference: '14100999999',
      kind: 'Renouvelable',
      billingFrequency: 'Annuelle',
      effectiveDate: '2014-01-01',
      primaryTermDate: '2015-01-01',
      beginDate: null,
      endDate: null,
      premium: 300 * randCoef,
      fees: 20 * randCoef,
      taxes: 10 * randCoef,
      stampFGA: 1,
      stampFSSR: 1,
      stampFPAC: 1,
      vehicleCount: 4,
      stamps: 7.2,
      totalContribution: 333 * randCoef,
      subscriber: 'Personne physique',
      subscriberName: 'Ali Kefia',
      subscriberPhone: '31331800',
      subscriberAddress: '15 Rue de Jérusalem Belvédere Tunis 1002',
      cpDoc: {
        title: 'Conditions générales'
      },
      attestationDoc: {
        title: 'Attestation d\'assurance'
      },
      receiptDoc: {
        title: 'Quittance'
      },
      isquote: false,
      userAdmin: true,
      validated: true,
      defaultBonus: true,
      customBonus: null
    },
    vehicles: [{
      number: 1,
      make: 'Peugeot',
      model: '208',
      power: '4',
      issueDate: '2014-10-21',
      registrationNumber: '160TU22',
      premium: 495.166 * randCoef,
      taxes: 51.126 * randCoef,
      stamps: 1.8,
      bonus: 4,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }, {
      number: 2,
      make: 'Renault',
      model: 'Clio',
      power: '4',
      issueDate: '2015-01-01',
      registrationNumber: '174TU1596',
      premium: 726.808 * randCoef,
      taxes: 80.159 * randCoef,
      stamps: 1.8,
      bonus: 11,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }],
    person: {
      id: '12345678',
      firstName: 'Ali',
      lastName: 'Kefia',
      phone1: '71666777',
      email1: 'ali.kefia@attakafulia.tn'
    },
    validationLocks: [{
      id: 1,
      description: 'Véhicule N° 1 immatriculé 5578TU99 a plus de 20 ans (26 ans)',
      validated: true
    }, {
      id: 2,
      description: 'Jeux de garanties incorrect pour le véhicule N°3 immaticulé 5578TU125 (Garantie 3A non souscrite)',
      validated: false
    }, {
      id: 3,
      description: 'Jeux de garanties incorrect pour le véhicule N°1 immaticulé 5578TU125 (Garantie Assistance GOLD non souscrite)'
    }]
  });
  // }}}
}

function fleetUsages(req, res) {
  // {{{
  res.send([{
    id: 'Affaire et Privé',
    text: 'Affaire et Privé'
  }, {
    id: 'Taxi',
    text: 'Taxi'
  }]);
  // }}}
}

function fleetCovers(req, res) {
  // {{{
  res.send([{
    id: 'G03',
    text: 'Vol'
  }, {
    id: 'G04',
    text: 'Incendie'
  }, {
    id: 'G06',
    text: 'Dommages aux véhicules'
  }, {
    id: 'G07',
    text: 'Dommages Collisions'
  }]);
  // }}}
}

function cancelDiscount(req, res) {
  // {{{
  var randCoef;
  randCoef = Math.random();
  res.send({
    policy: {
      reference: '14100999999',
      kind: 'Renouvelable',
      billingFrequency: 'Annuelle',
      effectiveDate: '2014-01-01',
      primaryTermDate: '2015-01-01',
      beginDate: null,
      endDate: null,
      premium: 300 * randCoef,
      fees: 20 * randCoef,
      taxes: 10 * randCoef,
      stampFGA: 1,
      stampFSSR: 1,
      stampFPAC: 1,
      vehicleCount: 4,
      stamps: 7.2,
      totalContribution: 333 * randCoef,
      subscriber: 'Personne physique',
      subscriberName: 'Ali Kefia',
      subscriberPhone: '31331800',
      subscriberAddress: '15 Rue de Jérusalem Belvédere Tunis 1002',
      cpDoc: {
        title: 'Conditions générales'
      },
      attestationDoc: {
        title: 'Attestation d\'assurance'
      },
      receiptDoc: {
        title: 'Quittance'
      },
      isquote: false,
      userAdmin: true,
      validated: true,
      defaultBonus: true,
      customBonus: null
    },
    vehicles: [{
      number: 1,
      make: 'Peugeot',
      model: '208',
      power: '4',
      issueDate: '2014-10-21',
      registrationNumber: '160TU22',
      premium: 495.166 * randCoef,
      taxes: 51.126 * randCoef,
      stamps: 1.8,
      bonus: 4,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }, {
      number: 2,
      make: 'Renault',
      model: 'Clio',
      power: '4',
      issueDate: '2015-01-01',
      registrationNumber: '174TU1596',
      premium: 726.808 * randCoef,
      taxes: 80.159 * randCoef,
      stamps: 1.8,
      bonus: 11,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }]
  });
  // }}}
}

function saveDiscount(req, res) {
  // {{{
  var randCoef;
  randCoef = Math.random();
  res.send({
    policy: {
      reference: '14100999999',
      kind: 'Renouvelable',
      billingFrequency: 'Annuelle',
      effectiveDate: '2014-01-01',
      primaryTermDate: '2015-01-01',
      beginDate: null,
      endDate: null,
      premium: 300 * randCoef,
      fees: 20 * randCoef,
      taxes: 10 * randCoef,
      stampFGA: 1,
      stampFSSR: 1,
      stampFPAC: 1,
      vehicleCount: 4,
      stamps: 7.2,
      totalContribution: 333 * randCoef,
      subscriber: 'Personne physique',
      subscriberName: 'Ali Kefia',
      subscriberPhone: '31331800',
      subscriberAddress: '15 Rue de Jérusalem Belvédere Tunis 1002',
      cpDoc: {
        title: 'Conditions générales'
      },
      attestationDoc: {
        title: 'Attestation d\'assurance'
      },
      receiptDoc: {
        title: 'Quittance'
      },
      isquote: false,
      userAdmin: true,
      validated: true,
      defaultBonus: true,
      customBonus: null
    },
    vehicles: [{
      number: 1,
      make: 'Peugeot',
      model: '208',
      power: '4',
      issueDate: '2014-10-21',
      registrationNumber: '160TU22',
      premium: 495.166 * randCoef,
      taxes: 51.126 * randCoef,
      stamps: 1.8,
      bonus: 4,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }, {
      number: 2,
      make: 'Renault',
      model: 'Clio',
      power: '4',
      issueDate: '2015-01-01',
      registrationNumber: '174TU1596',
      premium: 726.808 * randCoef,
      taxes: 80.159 * randCoef,
      stamps: 1.8,
      bonus: 11,
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100 * randCoef,
        premium: 1200 * randCoef
      }, {
        name: 'Dommages et Collisions',
        limit: 10000,
        subscribed: true,
        limitModifiable: true,
        deductible: 5,
        deductibleModifiable: true
      }, {
        name: 'Vol',
        limitModifiable: true,
        subscribed: true,
        maxLimit: 10000
      }, {
        name: 'Incendie',
        subscribed: true,
        deductibleModifiable: true,
        minDeductible: 10
      }]
    }]
  });
  // }}}
}

function contractNatures(req, res) {
  // {{{
  res.send([{
    id: 'AUTOPR',
    text: 'Particulier'
  }, {
    id: 'CYCLO49CM3',
    text: '2 Roues'
  }, {
    id: 'AUTOFS',
    text: 'Flotte'
  }]);
  // }}}
}

function contractTypes(req, res) {
  // {{{
  res.send([{
    id: 'C',
    text: 'Comptant'
  }, {
    id: 'T',
    text: 'Terme'
  }, {
    id: 'A',
    text: 'Avenant'
  }]);
  // }}}
}

function contractStatuses(req, res) {
  // {{{
  res.send([{
    id: 0,
    text: 'Devis'
  }, {
    id: 1,
    text: 'Police non validée'
  }, {
    id: 3,
    text: 'Police validée'
  }, {
    id: 4,
    text: 'Police suspendue'
  }, {
    id: 5,
    text: 'Police résiliée'
  }]);
  // }}}
}

function searchInit(req, res) {
  // {{{
  res.send({
    admin: true,
    pos: req.session.user.pos.code
  });
  // }}}
}

function getListUsages(req, res) {
  // {{{
  var listUsages = [];
  var sUsage;
  mongo.getComboBoxCol()
    .findOne({
      'def.ref': 'frontierInsuranceListUsages'
    }, function (err, listUsagesDb) {
      if (err) {
        res.send(500, err);
      }
      _.each(listUsagesDb.params, function (item) {
        sUsage = {};
        sUsage.id = item.code;
        sUsage.text = item.nameFr;
        listUsages.push(sUsage);
      });
      res.send(listUsages);
    });
  // }}}
}

function getDurationsList(req, res) {
  // {{{
  var durations = [];
  var sDuration;
  mongo.getComboBoxCol()
    .findOne({
      'def.ref': 'frontierInsurancePeriodsList'
    }, function (err, periods) {
      if (err) {
        res.send(500, err);
      }
      _.each(periods.params, function (item) {
        sDuration = {};
        sDuration.id = item.code;
        sDuration.text = item.value;
        durations.push(sDuration);
      });
      res.send(durations);
    });
  // }}}
}

function getIdTypes(req, res) {
  // {{{
  var idTypes = [];
  var sType;
  mongo.getComboBoxCol()
    .findOne({
      'def.ref': 'typeOfIDs'
    }, function (err, list) {
      if (err) {
        res.send(500, err);
      }
      _.each(list.params, function (item) {
        sType = {};
        sType.id = item.code;
        sType.text = item.value;
        idTypes.push(sType);
      });
      res.send(idTypes);
    });
  // }}}
}

function getListOfCountries(req, res) {
  // {{{
  var listOfCountries = [];
  var sList;
  if (countryList.length === 0) {
    var cursor = mongo.getAssistanceCountryCol()
      .find({})
      .sort('name', 1);
    cursor.toArray(function (err, list) {
      if (err) {
        res.send(500, err);
        return;
      }
      _.each(list, function (item) {
        sList = {};
        sList.id = utils.initCap(item.name);
        sList.text = utils.initCap(item.name);
        listOfCountries.push(sList);
        countryList.push(sList);
      });
      res.send(listOfCountries);
      return;
    });
  }
  else {
    res.send(countryList);
    return;
  }
  // }}}
}

function getPremium(req, res) {
  //{{{
  var quote = req.body.quote;
  mongo.getProductCol()
    .findOne({
      'def.code': '198'
    }, function (err, result) {
      if (err) {
        res.send(500, err);
        return;
      }
      var fee = result.fee;
      var fees = fee[0].amount;
      quote.fees = fees;
      var stamps = result.stamps;
      _.each(stamps, function (stamp) {
        if (stamp.code === 'FGA') {
          quote.stampFGA = stamp.amount;
        }
        else if (stamp.code === 'FPAC') {
          quote.stampFPAC = stamp.amount;
        }
        else {
          quote.stampFSSR = stamp.amount;
        }
      });
      _.each(result.covers, function (item) {
        if (item.code === 'G01') {
          _.each(item.pricing, function (element) {
            if (element.name === quote.type) {
              _.each(element.values, function (value) {
                if (value.period === quote.duration) {
                  quote.premium = value.premium;
                  quote.taxes = (value.premium + fees) * 0.12;
                }
              });
            }
          });
        }
      });
      res.send({
        quote: quote
      });
    });
  //}}}
}

function getCommission(data, cb) {
  var defaultProfile = data.defaultProfile;
  var product = data.product;
  mongo.getProductCol()
    .findOne({
      'def.code': product
    }, function (err, result) {
      if (err) {
        cb(err);
        return;
      }
      var reslt = [];
      _.each(result.covers, function (item) {
        if (item.code === 'G01') {
          _.each(item.commissions, function (element) {
            if (element.profile === defaultProfile) {
              var sReslt = {};
              sReslt.code = item.code;
              sReslt.commission = element.rate;
              reslt.push(sReslt);
            }
          });
        }
        else {
          _.each(item.commissions, function (element) {
            if (element.profile === defaultProfile) {
              var sReslt = {};
              sReslt.code = item.code;
              sReslt.commission = element.rate;
              reslt.push(sReslt);
            }
          });
        }
      });
      if (reslt) {
        cb(null, reslt);
        return;
      }
      cb();
    });
}

function _createReceipt(req, product, reference, cb) {
  // {{{
  var rec = {};
  var container = req.body.container;
  var quote = container.quote;
  var subscriber = container.person;
  var posCode = req.session.user.pos.code;
  var fullName = req.session.user.fullName;
  var attestationNumber = req.body.attestationNumber;
  receipt.date = moment()
    .startOf('day')
    .format('YYYY-MM-DD');
  var def = {};
  def.fromDate = moment(quote.beginDate)
    .format('YYYY-MM-DD');
  def.toDate = moment(quote.endDate)
    .format('YYYY-MM-DD');
  def.nature = 'CT';
  var user = {};
  user.username = fullName;
  var pos = {};
  pos.code = posCode;
  pos.name = fullName;
  user.pos = pos;
  def.user = user;
  rec.def = def;
  var contractRec = {};
  contractRec.ref = reference;
  rec.contract = contractRec;
  rec.endorsement = 0;
  var subscriberRec = {};
  subscriberRec.type = 1;
  subscriberRec.reference = '';
  subscriberRec.id = subscriber.numPI;
  subscriberRec.phone = '';
  subscriberRec.name = subscriber.firstName + ' ' + subscriber.lastName;
  subscriberRec.address = subscriber.countryOfOrigin + ' ' + subscriber.addressOfCountryOfOrigin;
  rec.subscriber = subscriberRec;
  rec.insuranceCertificate = attestationNumber;
  var coverages = [];
  var sCov = {};
  sCov.amount = quote.premium;
  sCov.code = 'G01';
  sCov.taxes = [{
    code: 'TUA',
    amount: utils.fixNumber((quote.premium) * 0.1, 3)
  }, {
    code: 'FG',
    amount: utils.fixNumber((quote.premium) * 0.02, 3)
  }];
  mongo.getPosCol()
    .findOne({
      code: posCode
    }, function (error, pos) {
      if (error) {
        cb(error);
        return;
      }
      var data = {};
      data.product = '198';
      data.defaultProfile = pos.defaultProfile;
      getCommission(data, function (err, result) {
        if (err) {
          cb(err);
          return;
        }
        coverages.push(sCov);
        rec.coverages = coverages;
        rec.summary = {};
        rec.summary.fees = 10;
        _.each(result, function (element) {
          if (element.code === 'G01') {
            sCov.commission = quote.premium * element.commission;
          }
          else {
            rec.summary.feesCommission = quote.fees * element.commission;
          }
        });
        rec.summary.feesTaxes = [{
          code: 'TUA',
          amount: 1
        }, {
          code: 'FG',
          amount: 0.2
        }];
        rec.summary.premiumTaxes = [{
          code: 'TUA',
          amount: 1
        }, {
          code: 'FG',
          amount: 0.2
        }];
        rec.summary.stamps = [{
          code: 'FGA',
          amount: 1
        }, {
          code: 'FPAC',
          amount: 0.5
        }, {
          code: 'FSSR',
          amount: 0.3
        }];
        receipt.finalize(rec);
        rec = utils.fixNumberInObject(rec, 3);
        receipt.create(rec, function (err, ref) {
          if (err) {
            cb(err);
          }
          cb(null, ref);
        });
      });
    });
  //}}}
}

function getTotal(quote) {
  var premiumTaxes = (quote.premium) * 0.12;
  var fessTaxes = (quote.fees) * 0.12;
  var stampsTaxes = quote.stampFGA + quote.stampFPAC + quote.stampFSSR;
  var amount = quote.premium + quote.fees;
  var total = amount + fessTaxes + premiumTaxes + stampsTaxes;
  return utils.fixNumber(total, 3);
}

function validateFrontierInsuranceContract(req, res) {
  // {{{
  var container = req.body.container;
  var quote = container.quote;
  var vehicle = container.vehicle;
  var subscriber = container.person;
  var posCode = req.session.user.pos.code;
  var fullName = req.session.user.fullName;
  var date = new Date();
  var hour = date.getHours();
  var product = '198';
  if (posCode) {
    seq.generateRef(product, '2016', function (err, reference) {
      if (err) {
        res.send(500, err);
      }
      else {
        mongo.getFrontierInsuranceContractCol()
          .insert({
            def: {
              ref: reference,
              date: moment()
                .startOf('day')
                .format('YYYY-MM-DD'),
              fromDate: moment(quote.beginDate)
                .format('YYYY-MM-DD'),
              toDate: moment(quote.endDate)
                .format('YYYY-MM-DD'),
              duration: quote.duration,
              type: 1,
              validationTime: hour,
              user: {
                pos: posCode,
                fullName: fullName
              }
            },
            insuranceCertificate: quote.attestationNumber,
            vehicle: {
              vin: vehicle.vin,
              make: vehicle.make,
              usage: quote.type,
              registrationNumber: vehicle.registrationNumber,
              trailer: {
                make: vehicle.trailerMake,
                registrationNumber: vehicle.trailerRegistrationNumber
              },
              motorNumber: vehicle.motorNumber,
              internationalCode: vehicle.internationalCode
            },
            insured: {
              firstName: subscriber.firstName,
              name: subscriber.lastName,
              typeId: subscriber.typePI,
              id: subscriber.numPI,
              address: subscriber.countryOfOrigin + ';' + subscriber.addressOfCountryOfOrigin
            },
            coverages: [{
              code: 'G01',
              amount: quote.premium,
              commission: 0,
              taxes: [{
                code: 'TUA',
                amount: utils.fixNumber((quote.premium) * 0.1, 3)
              }, {
                code: 'FG',
                amount: utils.fixNumber((quote.premium) * 0.02, 3)
              }],
            }],
            summary: {
              premium: quote.premium,
              premiumCommission: 0,
              premiumTaxes: [{
                code: 'TUA',
                amount: utils.fixNumber((quote.premium) * 0.1, 3)
              }, {
                code: 'FG',
                amount: utils.fixNumber((quote.premium) * 0.02, 3)
              }],
              fees: quote.fees,
              feesCommission: 0,
              feesTaxes: [{
                code: 'TUA',
                amount: utils.fixNumber((quote.fees) * 0.1, 3)
              }, {
                code: 'FG',
                amount: utils.fixNumber((quote.fees) * 0.02, 3)
              }],
              amount: quote.premium + quote.fees,
              commission: 0,
              stamps: [{
                code: 'FGA',
                amount: quote.stampFGA
              }, {
                code: 'FPAC',
                amount: quote.stampFPAC
              }, {
                code: 'FSSR',
                amount: quote.stampFSSR
              }],
              total: getTotal(quote)
            },
          }, function (err) {
            if (err) {
              res.send(500, err);
            }
            else {
              _createReceipt(req, product, reference, function (error,
                receipt) {
                if (error) {
                  res.send(500, error);
                }
                else {
                  res.send({
                    receiptRef: receipt[0].def.ref,
                    reference: reference
                  });
                }
              });
            }
          });
      }
    });
  }
  else {
    res.send(500, 'error');
  }
  // }}}
}

function checkLockSubscription(req, res) {
  // {{{
  if (!req.session.user.pos.locked) {
    res.send({});
  }
  else {
    res.send(500);
  }
  // }}}
}
exports.declare = function (app) {
  app.post('/svc/auto/vehicle/usages', session.ensureAuth, session.ensureLocked,
    ora.listVehicleUsages || listVehicleUsages);
  app.post('/svc/auto/vehicle/bonuses', session.ensureAuth, ora.listVehicleBonuses ||
    listVehicleBonuses);
  app.post('/svc/auto/vehicle/makes', session.ensureAuth, ora.listVehicleMakes ||
    listVehicleMakes);
  app.post('/svc/auto/vehicle/models', session.ensureAuth, ora.listVehicleModels ||
    listVehicleModels);
  app.post('/svc/auto/vehicle/create', session.ensureAuth, ora.createVehicle ||
    createVehicle);
  app.post('/svc/auto/vehicle/update', session.ensureAuth, ora.updateVehicle ||
    updateVehicle);
  app.post('/svc/auto/coverage/list', session.ensureAuth, ora.listCoverages ||
    listCoverages);
  app.post('/svc/auto/coverage/update', session.ensureAuth, ora.updateCoverage ||
    updateCoverage);
  app.post('/svc/auto/subscriber/set', session.ensureAuth, ora.setSubscriber ||
    setSubscriber);
  app.post('/svc/auto/beneficiary/get', session.ensureAuth, ora.listBeneficiary ||
    listBeneficiary);
  app.post('/svc/auto/beneficiary/set', session.ensureAuth, ora.setBeneficiary ||
    setBeneficiary);
  app.post('/svc/auto/print/quote', session.ensureAuth, ora.printQuote ||
    printQuote);
  app.post('/svc/auto/contract/create', session.ensureAuth, ora.createContract ||
    createContract);
  app.post('/svc/auto/print/cp', session.ensureAuth, ora.printCP || printCP);
  app.post('/svc/auto/print/attestation', session.ensureAuth, ora.printAttestation ||
    printAttestation);
  app.post('/svc/auto/print/receipt', session.ensureAuth, ora.printReceipt ||
    printReceipt);
  app.post('/svc/auto/search/getData', session.ensureAuth, ora.searchMotor ||
    searchMotor);
  app.post('/svc/auto/policy/get', session.ensureAuth, ora.getPolicy ||
    getPolicy);
  app.post('/svc/auto/attestation/list', session.ensureAuth, ora.listAttestation ||
    listAttestation);
  app.post('/svc/auto/coverage/check', session.ensureAuth, ora.checkCoverage ||
    checkCoverage);
  app.post('/svc/auto/contract/validate', session.ensureAuth, ora.validateContract ||
    validateContract);
  app.post('/svc/auto/contract/regenerate', session.ensureAuth, ora.regenerateDocs ||
    regenerateDocs);
  app.post('/svc/auto/policy/termList', session.ensureAuth, ora.termList ||
    termList);
  app.post('/svc/auto/policy/termSearch', session.ensureAuth, ora.termSearch ||
    termSearch);
  app.post('/svc/auto/term/get', session.ensureAuth, ora.getTerm || getTerm);
  app.post('/svc/auto/term/validate', session.ensureAuth, ora.validateTerm ||
    validateTerm);
  app.post('/svc/auto/term/massReceipt', session.ensureInternal, ora.massTermReceipt ||
    massTermReceipt);
  app.post('/svc/auto/fleet/save', session.ensureAuth, ora.saveVehicleFleet ||
    saveVehicleFleet);
  app.post('/svc/auto/fleet/add', session.ensureAuth, ora.addVehicleFleet ||
    addVehicleFleet);
  app.post('/svc/auto/fleet/remove', session.ensureAuth, ora.removeVehicleFleet ||
    removeVehicleFleet);
  app.post('/svc/auto/fleet/summary', session.ensureAuth, ora.fleetSummary ||
    fleetSummary);
  app.post('/svc/auto/fleet/recalculate', session.ensureAuth, ora.fleetCalculate ||
    fleetCalculate);
  app.post('/svc/auto/fleet/create', session.ensureAuth, ora.fleetCreate ||
    fleetCreate);
  app.post('/svc/auto/fleet/get', session.ensureAuth, ora.fleetGet ||
    fleetGet);
  app.post('/svc/auto/fleet/validate', session.ensureAuth, ora.fleetValidate ||
    fleetValidate);
  app.post('/svc/auto/fleet/printAttestation', session.ensureAuth, ora.fleetprintAttestation ||
    fleetprintAttestation);
  app.post('/svc/auto/fleet/printVehicle', session.ensureAuth, ora.fleetprintVehicle ||
    fleetprintVehicle);
  app.post('/svc/auto/fleet/getVehicle', session.ensureAuth, ora.getVehicle ||
    getVehicle);
  app.post('/svc/auto/fleet/exportFleet', session.ensureAuth, ora.exportFleet ||
    exportFleet);
  app.get('/fleet', session.ensureAuth, ora.getFleetFile || getFleetFile);
  app.post('/svc/auto/fleet/admin/lockvalidation', session.ensureAuth, ora.lockvalidation ||
    lockvalidation);
  app.post('/svc/auto/fleet/admin/unlockvalidation', session.ensureAuth, ora.unlockvalidation ||
    unlockvalidation);
  app.post('/svc/auto/fleet/admin/applyBonus', session.ensureAuth, ora.applyBonus ||
    applyBonus);
  app.post('/svc/auto/fleet/admin/revertBonus', session.ensureAuth, ora.revertBonus ||
    revertBonus);
  app.post('/svc/auto/fleet/admin/saveBonus', session.ensureAuth, ora.saveBonus ||
    saveBonus);
  app.post('/svc/auto/fleet/usages', session.ensureAuth, ora.fleetUsages ||
    fleetUsages);
  app.post('/svc/auto/fleet/covers', session.ensureAuth, ora.fleetCovers ||
    fleetCovers);
  app.post('/svc/auto/admin/cancelDiscount', session.ensureAuth, ora.cancelDiscount ||
    cancelDiscount);
  app.post('/svc/auto/admin/saveDiscount', session.ensureAuth, ora.saveDiscount ||
    saveDiscount);
  app.post('/svc/auto/contract/natures', session.ensureAuth, ora.contractNatures ||
    contractNatures);
  app.post('/svc/auto/contract/types', session.ensureAuth, ora.contractTypes ||
    contractTypes);
  app.post('/svc/auto/contract/statuses', session.ensureAuth, ora.contractStatuses ||
    contractStatuses);
  app.post('/svc/auto/search/init', session.ensureAuth, ora.searchInit ||
    searchInit);
  app.post('/svc/auto/getListUsages', session.ensureAuth, getListUsages);
  app.post('/svc/auto/getDurationsList', session.ensureAuth, getDurationsList);
  app.post('/svc/auto/getIdTypes', getIdTypes);
  app.post('/svc/auto/getListOfCountries', getListOfCountries);
  app.post('/svc/auto/getPremium', session.ensureAuth, getPremium);
  app.post('/svc/auto/validateFrontierInsuranceContract', session.ensureAuth,
    validateFrontierInsuranceContract);
  app.post('/svc/auto/subscribe/checkLockSubscription', session.ensureAuth,
    checkLockSubscription);
};

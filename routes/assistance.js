/* vim: fdm=marker
 */
var config = require('../config');
var request = require('request');
var _ = require('underscore');
var session = require('../logic/session');
var ora = require('./assistance-ora');
var mongo = require('../mongo');
var utils = require('../logic/utils');
var moment = require('moment');
var seq = require('../logic/seq');
var countryList = [];

function listCountries(req, res) {
  // {{{
  var crit = req.body.criterium;
  var tempList = [];
  var sCompare1;
  var sCompare2;
  if (countryList.length === 0) {
    var sCountry;
    var cursor = mongo.getAssistanceCountryCol()
      .find({})
      .sort('name', 1);
    cursor.toArray(function (err, results) {
      if (err) {
        res.send(500, err);
        return;
      }
      _.each(results, function (item) {
        sCountry = {};
        sCountry.id = utils.initCap(item.name);
        sCountry.text = utils.initCap(item.name);
        sCountry.zone = item.zone;
        countryList.push(sCountry);
      });
      if (crit === '') {
        res.send(countryList);
        return;
      }
      _.each(crit.split(','), function (oneCountry) {
        _.each(countryList, function (item) {
          sCompare1 = item.text.toUpperCase();
          sCompare2 = oneCountry.toUpperCase();
          if (sCompare1.indexOf(sCompare2) > -1) {
            sCountry = {};
            sCountry.id = utils.initCap(item.id);
            sCountry.text = utils.initCap(item.text);
            sCountry.zone = item.zone;
            tempList.push(sCountry);
          }
        });
      });
      res.send(tempList);
      return;
    });
  }
  else {
    if (crit === '') {
      res.send(countryList);
      return;
    }
    _.each(crit.split(','), function (oneCountry) {
      _.each(countryList, function (item) {
        sCompare1 = item.text.toUpperCase();
        sCompare2 = oneCountry.toUpperCase();
        if (sCompare1.indexOf(sCompare2) > -1) {
          sCountry = {};
          sCountry.id = utils.initCap(item.id);
          sCountry.text = utils.initCap(item.text);
          sCountry.zone = item.zone;
          tempList.push(sCountry);
        }
      });
    });
    res.send(tempList);
    return;
  }
  // }}}
}

function createTravel(req, res) {
  // {{{
  var quote = req.body.quote;
  var sQuote = {};
  var year = moment()
    .format('YYYY');
  seq.generateRef('Q700', year, function (err, reference) {
    if (err) {
      res.send(500, err);
      return;
    }
    sQuote.reference = reference;
    sQuote.date = moment()
      .format('YYYY-MM-DD');
    sQuote.kind = quote.kind;
    sQuote.effectiveDate = quote.effectiveDate;
    sQuote.endDate = quote.endDate;
    sQuote.premium = quote.premium;
    sQuote.fees = quote.fees;
    sQuote.stampFGA = quote.taxes;
    sQuote.travel = req.body.travel;
    sQuote.countries = req.body.countries;
    sQuote.pricingPeriod = quote.maxPeriod;
    sQuote.user = _.omit(req.session.user, 'pages');
    mongo.getAssistanceDraftCol()
      .insert(sQuote, function (err) {
        if (err) {
          res.send(500, err);
          return;
        }
        quote.reference = reference;
        res.send({
          quote: quote
        });
      });
  });
  // }}}
}

function updateTravel(req, res) {
  // {{{
  var quote = req.body.quote;
  var sQuote = {};
  var data = {};
  var price = quote.maxPeriod;
  data.zone = req.body.travel.zone;
  data.type = req.body.travel.type;
  data.personsNumber = req.body.travel.personsNumber;
  var tabPeriods = price.split('~');
  var maxEndDate = moment(quote.effectiveDate, 'YYYY-MM-DD')
    .add(tabPeriods[0], tabPeriods[1]);
  maxEndDate = moment(maxEndDate)
    .add(-1, 'days')
    .format('YYYY-MM-DD');
  _getPrice(data, function (err, tabPrices) {
    if (err) {
      res.send(500, err);
      return;
    }
    var lastCheck = true;
    _.each(tabPrices, function (item) {
      if (item.perId === price) {
        if (item.amount !== quote.premium) {
          lastCheck = false;
        }
      }
    });
    if (maxEndDate < quote.endDate) {
      lastCheck = false;
    }
    if (lastCheck) {
      sQuote.reference = quote.reference;
      sQuote.date = moment()
        .format('YYYY-MM-DD');
      sQuote.kind = quote.kind;
      sQuote.effectiveDate = quote.effectiveDate;
      sQuote.endDate = quote.endDate;
      sQuote.premium = quote.premium;
      sQuote.fees = quote.fees;
      sQuote.stampFGA = quote.taxes;
      sQuote.travel = req.body.travel;
      sQuote.countries = req.body.countries;
      sQuote.pricingPeriod = quote.maxPeriod;
      sQuote.user = _.omit(req.session.user, 'pages');
      mongo.getAssistanceDraftCol()
        .update({
          reference: quote.reference
        }, sQuote, function (err) {
          if (err) {
            res.send(500, err);
            return;
          }
          res.send({
            quote: quote
          });
        });
    }
    else {
      res.send(500, 'Erreur de tarification !');
      return;
    }
  });
  // }}}
}

function setSubscriber(req, res) {
  // {{{
  var subscriber = req.body.subscriber;
  var quote = req.body.quote;
  var reference = quote.reference;
  if (quote.subscriber === 'Personne physique') {
    subscriber.type = 1;
  }
  else {
    subscriber.type = 2;
  }
  mongo.getAssistanceDraftCol()
    .update({
      reference: reference
    }, {
      $set: {
        subscriber: subscriber
      }
    }, function (err) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.send({
        quote: quote
      });
    });
  // }}}
}

function setDoctor(req, res) {
  // {{{
  var doctor = req.body.doctor;
  var quote = req.body.quote;
  var reference = quote.reference;
  mongo.getAssistanceDraftCol()
    .update({
      reference: reference
    }, {
      $set: {
        doctor: doctor
      }
    }, function (err) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.send({
        quote: quote
      });
    });
  // }}}
}

function setPersonToprevent(req, res) {
  // {{{
  var personToPrevent = req.body.personToPrevent;
  var quote = req.body.quote;
  var reference = quote.reference;
  mongo.getAssistanceDraftCol()
    .update({
      reference: reference
    }, {
      $set: {
        personToPrevent: personToPrevent
      }
    }, function (err) {
      if (err) {
        res.send(500, err);
        return;
      }
      res.send({
        quote: quote
      });
    });
  // }}}
}

function createContract(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.contract = {};
  quote.contract.ref = '16700000999';
  quote.contract.ver = 0;
  var qref = quote.reference;
  delete quote.reference;
  quote.quote = {};
  quote.quote.reference = qref;
  var receiptRef = '16999999999';
  mongo.getAssistancePolicyCol()
    .insert(quote, function (err) {
      if (err) {
        res.send(500, err);
        return;
      }
      quote.reference = qref;
      prepareDocs(qref, quote.contract.ref, receiptRef, req, function (err,
        docs) {
        if (err) {
          res.send(500, err);
          return;
        }
        res.send({
          docs: docs
        });
      });
    });
  // }}}
}

function prepareDocs(quoteRef, contractRef, receiptRef, req, callback) {
  // {{{
  var docs = {};
  docs.cpdoc = {};
  docs.rcdoc = {};
  var contract = {};
  var receipt = {};
  contract.date = moment()
    .format('YYYY-MM-DD');
  contract.pos = {};
  contract.pos.code = req.session.user.pos.code;
  contract.pos.name = req.session.user.pos.name;
  contract.reference = contractRef;
  receipt.date = moment()
    .format('YYYY-MM-DD');
  receipt.pos = {};
  receipt.pos.code = req.session.user.pos.code;
  receipt.pos.name = req.session.user.pos.name;
  receipt.reference = receiptRef;
  receipt.contract = contractRef;
  receipt.endorsement = 0;
  mongo.getAssistanceDraftCol()
    .findOne({
      'reference': quoteRef
    }, function (err, dbQuote) {
      if (err) {
        callback(err);
        return;
      }
      contract.travel = {};
      contract.travel.kind = dbQuote.kind;
      contract.travel.type = dbQuote.travel.typeDes;
      contract.travel.beginDate = dbQuote.effectiveDate;
      contract.travel.endDate = dbQuote.endDate;
      contract.travel.destination = '';
      receipt.fromDate = dbQuote.effectiveDate;
      receipt.toDate = dbQuote.endDate;
      receipt.branche = {
        fr: 'assistance voyage',
        ar: 'الإدخار و الحيطة'
      };
      _.each(dbQuote.countries, function (country) {
        contract.travel.destination += country + ',';
      });
      contract.travel.zone = 'Zone ' + dbQuote.travel.zone;
      contract.travel.personNumber = dbQuote.travel.personsNumber;
      contract.subscriber = {};
      contract.subscriber.type = dbQuote.subscriber.type;
      contract.subscriber.reference = dbQuote.subscriber.customerReference;
      contract.subscriber.entity = {};
      contract.subscriber.entity.id = dbQuote.subscriber.id;
      if (dbQuote.subscriber.type === 1) {
        contract.subscriber.entity.name = dbQuote.subscriber.firstName + ' ' +
          dbQuote.subscriber.lastName;
      }
      else {
        contract.subscriber.entity.name = dbQuote.subscriber.companyName;
      }
      contract.subscriber.entity.phone = dbQuote.subscriber.phone;
      contract.subscriber.entity.address = dbQuote.subscriber.address;
      receipt.subscriber = contract.subscriber;
      receipt.insured = contract.subscriber;
      receipt.beneficiary = {};
      contract.insured = [];
      var singleTraveler;
      _.each(dbQuote.travelers, function (traveler) {
        singleTraveler = {};
        singleTraveler.name = traveler.firstName + ' ' + traveler.lastName;
        singleTraveler.passport = traveler.passportId;
        contract.insured.push(singleTraveler);
      });
      contract.premium = {};
      contract.premium.net = dbQuote.premium;
      contract.premium.fees = dbQuote.fees;
      contract.premium.stamp = {};
      contract.premium.stamp.FGA = dbQuote.stampFGA;
      contract.premium.total = Number((dbQuote.premium + dbQuote.fees +
          dbQuote.stampFGA)
        .toFixed(3));
      receipt.premium = {};
      receipt.premium.net = dbQuote.premium;
      receipt.premium.tax = 0;
      receipt.premium.fees = dbQuote.fees;
      receipt.premium.feesTax = 0;
      receipt.premium.stamps = {};
      receipt.premium.stamps.FGA = dbQuote.stampFGA;
      receipt.premium.total = Number((dbQuote.premium + dbQuote.fees +
          dbQuote.stampFGA)
        .toFixed(3));
      receipt.premium.totalTax = 0;
      mongoProcessPrint('assistance', 'contract', contract, 'cp-' + contract.reference,
        function (err, cpdoc) {
          if (err) {
            callback(err);
            return;
          }
          docs.cpdoc = cpdoc;
          mongoProcessPrint('all', 'receipt', receipt, receipt.reference,
            function (err, rcdoc) {
              if (err) {
                callback(err);
                return;
              }
              docs.rcdoc = rcdoc;
              callback(null, docs);
            });
        });
    });
  // }}}
}

function setTravelers(req, res) {
  // {{{
  var travelers = req.body.travelers;
  var quote = req.body.quote;
  var data = {};
  var price = quote.maxPeriod;
  data.zone = req.body.travel.zone;
  data.type = req.body.travel.type;
  data.personsNumber = req.body.travel.personsNumber;
  var travAge;
  var travAgeRounded;
  var checks = [];
  var singleCheck;
  var qTravelers = [];
  var singleTraveler;
  var raisedRate;
  var newPremium = 0;
  var maxFlatPremium = 0;
  _getPrice(data, function (err, tabPrices, overloads) {
    if (err) {
      res.send(500, err);
      return;
    }
    _.each(travelers, function (item) {
      travAge = moment(quote.effectiveDate, 'YYYY-MM-DD')
        .diff(item.birthDate, 'months');
      travAge = travAge / 12;
      travAgeRounded = Number(travAge.toFixed(0));
      if (travAge >= 80) {
        singleCheck = 'Voyageur ' + item.firstName + ' ';
        singleCheck += item.lastName +
          ' dépasse l\'âge de sortie de 80 ans';
        checks.push(singleCheck);
      }
      singleTraveler = {};
      singleTraveler.firstName = item.firstName;
      singleTraveler.lastName = item.lastName;
      singleTraveler.birthDate = item.birthDate;
      singleTraveler.passportId = item.passportId;
      singleTraveler.phone = item.phone;
      raisedRate = 1;
      _.each(overloads, function (overload) {
        _.each(overload.values, function (overValue) {
          if (travAgeRounded >= overValue.min && travAgeRounded <=
            overValue.max) {
            raisedRate = overValue.rate;
          }
        });
      });
      _.each(tabPrices, function (pricing) {
        if (pricing.perId === price) {
          if (!pricing.flat) {
            singleTraveler.oldPremium = Number((pricing.amount /
                data.personsNumber)
              .toFixed(3));
            singleTraveler.raisedRate = raisedRate;
            singleTraveler.amount = Number((singleTraveler.oldPremium *
                raisedRate)
              .toFixed(3));
            singleTraveler.oldSold = Number((pricing.sold / data.personsNumber)
              .toFixed(3));
            singleTraveler.sold = Number((singleTraveler.oldSold *
                raisedRate)
              .toFixed(3));
            newPremium += singleTraveler.amount;
          }
          else {
            singleTraveler.flatRate = true;
            singleTraveler.oldPremium = pricing.amount;
            singleTraveler.raisedRate = raisedRate;
            singleTraveler.amount = Number((singleTraveler.oldPremium *
                raisedRate)
              .toFixed(3));
            if (singleTraveler.amount > maxFlatPremium) {
              maxFlatPremium = singleTraveler.amount;
            }
            singleTraveler.oldSold = pricing.sold;
            singleTraveler.sold = Number((singleTraveler.oldSold *
                raisedRate)
              .toFixed(3));
            newPremium = maxFlatPremium;
          }
        }
      });
      qTravelers.push(singleTraveler);
    });
    if (checks.length !== 0) {
      res.send(500, checks[0]);
      return;
    }
    quote.premium = newPremium;
    mongo.getAssistanceDraftCol()
      .update({
        reference: quote.reference
      }, {
        $set: {
          premium: newPremium,
          travelers: qTravelers
        }
      }, function (err) {
        if (err) {
          res.send(500, err);
          return;
        }
        res.send({
          quote: quote
        });
      });
  });
  // }}}
}

function searchAssistance(req, res) {
  // {{{
  //var criteria = req.body.criteria;
  //var pos = req.user.pos;
  //var username = req.user.username;
  //var admin = req.user.admin;
  res.send([{
    numero: '14100000059',
    effectiveDate: '2014-03-25',
    country: 'France',
    clientName: 'Ali Kefia',
    premium: 333,
    details: '<a class="btn btn-block btn-success" href="assistance#consult/id/Quote">Consulter</a>'
  }]);
  // }}}
}

function getPolicy(req, res) {
  // {{{
  var id = req.body.id;
  if (id === '14100000059') {
    res.send({
      policy: {
        reference: id,
        kind: 'Renouvelable',
        billingFrequency: 'Annuelle',
        effectiveDate: '2014-01-01',
        endDate: '2015-01-01',
        premium: 222,
        fees: 20,
        taxes: 10,
        subscriber: 'Personne physique',
        subscriberName: 'Ali Kefia',
        subscriberPhone: '71666777',
        subscriberEmail: 'ali.kefia@attakafulia.tn'
      },
      travel: {
        country: 'France',
        type: 'aaaaaaa',
        zone: 'aaaaaaa',
        personsNumber: 5
      },
      coverages: [{
        name: 'Responsabilité Civile',
        subscribed: true,
        subscribedModifiable: false,
        rate: 1200,
        tax: 100,
        premium: 1200
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
  else {
    res.send(500, {
      error: 'Pas de police'
    });
  }
  // }}}
}

function getPricings(req, res) {
  // {{{
  var zone = req.body.data.zone;
  var type = req.body.data.type;
  var personsNumber = req.body.data.personsNumber;
  var country = req.body.data.country;
  if (_.isUndefined(zone) || _.isUndefined(type) || _.isUndefined(personsNumber)) {
    res.send(500, 'Erreur lors de la recupération des données du voyage !');
    return;
  }
  var retPrice = [];
  if (country.length === 0) {
    res.send({
      pricings: retPrice
    });
    return;
  }
  var data = {};
  data.zone = zone;
  data.type = type;
  data.personsNumber = personsNumber;
  _getPrice(data, function (err, retVals) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.send({
      pricings: retVals
    });
  });
  // }}}
}

function setPricings(req, res) {
  // {{{
  var quote = req.body.quote;
  var travel = req.body.travel;
  var pricing = req.body.pricing;
  var zone = travel.zone;
  var personsNumber = travel.personsNumber;
  var type = travel.type;
  if (_.isUndefined(zone) || _.isUndefined(personsNumber) || _.isUndefined(type)) {
    res.send(500, 'Erreur: Recupération de la tarification !');
    return;
  }
  var data = {};
  data.zone = zone;
  data.type = type;
  data.personsNumber = personsNumber;
  _getPrice(data, function (err, retVals) {
    if (err) {
      res.send(500, err);
      return;
    }
    _.each(retVals, function (item) {
      if (item.perId === pricing.perId) {
        if (item.amount !== pricing.amount || item.sold !== pricing.sold ||
          item.total !== pricing.total) {
          var msg = 'Erreur: Application du tarif sélectionné !';
          res.send('500', msg);
          return;
        }
      }
    });
    quote.premium = pricing.amount;
    quote.fees = pricing.fees;
    quote.taxes = pricing.fga;
    quote.kind = 'Temporaire';
    quote.pricingDesc = pricing.period;
    var tabPeriods = pricing.perId.split('~');
    var endDate = moment(quote.effectiveDate, 'YYYY-MM-DD')
      .add(tabPeriods[0], tabPeriods[1]);
    endDate = moment(endDate)
      .add(-1, 'days')
      .format('YYYY-MM-DD');
    quote.endDate = endDate;
    quote.maxPeriod = pricing.perId;
    quote.maxEndDate = endDate;
    res.send({
      quote: quote
    });
  });
  // }}}
}

function _getPrice(data, callback) {
  // {{{
  var zone = data.zone;
  var type = data.type;
  var personsNumber = data.personsNumber;
  var retPrice = [];
  var discountRate = 0;
  var overLoads;
  mongo.getProductCol()
    .findOne({
      'def.code': '700'
    }, function (err, prod) {
      if (err) {
        callback(err);
        return;
      }
      var sPrice;
      var stamps;
      var fees;
      stamps = prod.stamps.reduce(function (memo, stmp) {
        return memo + stmp.amount;
      }, 0);
      _.each(prod.covers, function (cover) {
        if (cover.code === 'FEE') {
          fees = cover.pricing.reduce(function (memo, fee) {
            return memo + fee.values.reduce(function (amnt, values) {
              return amnt + values.premium;
            }, 0);
          }, 0);
        }
      });
      _.each(prod.covers, function (cover) {
        if (cover.code !== 'FEE') {
          overLoads = cover.overload;
          if (type === 'Group') {
            _.each(cover.discount, function (item) {
              _.each(item.values, function (disc) {
                if (personsNumber >= disc.min && personsNumber <=
                  disc.max) {
                  discountRate = disc.rate;
                }
              });
            });
          }
          _.each(cover.pricing, function (price) {
            if (price.name === 'ZONE ' + zone) {
              _.each(price.values, function (val) {
                if (!val.flatRate) {
                  sPrice = {};
                  sPrice.perId = val.period;
                  sPrice.period = val.nameFr;
                  sPrice.amount = val.premium * personsNumber;
                  sPrice.sold = val.soldPremium * personsNumber;
                  sPrice.fees = fees;
                  sPrice.fga = stamps;
                  sPrice.total = (val.premium * personsNumber) +
                    fees + stamps;
                  retPrice.push(sPrice);
                }
                else {
                  var checkFlat = false;
                  _.each(val.flatRate, function (flat) {
                    if (flat.name === type) {
                      checkFlat = true;
                      sPrice = {};
                      sPrice.flat = true;
                      sPrice.perId = val.period;
                      sPrice.period = val.nameFr;
                      sPrice.amount = flat.value;
                      sPrice.sold = flat.soldPremium;
                      sPrice.fees = fees;
                      sPrice.fga = stamps;
                      sPrice.total = flat.value + fees +
                        stamps;
                      retPrice.push(sPrice);
                    }
                  });
                  if (!checkFlat) {
                    sPrice = {};
                    sPrice.perId = val.period;
                    sPrice.period = val.nameFr;
                    sPrice.amount = val.premium * personsNumber;
                    sPrice.sold = val.soldPremium * personsNumber;
                    sPrice.fees = fees;
                    sPrice.fga = stamps;
                    sPrice.total = (val.premium * personsNumber) +
                      fees + stamps;
                    retPrice.push(sPrice);
                  }
                }
              });
            }
          });
        }
      });
      _.each(retPrice, function (item) {
        item.amount = item.amount * (1 - discountRate);
        item.sold = item.sold * (1 - discountRate);
        item.total = item.amount + item.fees + item.fga;
      });
      retPrice = utils.fixNumberInObject(retPrice, 3);
      callback(null, retPrice, overLoads);
      return;
    });
  // }}} 
}

function mongoProcessPrint(lob, doc, json, retName, callback) {
  // {{{
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var pReq;
  pReq = 'http://' + printsrv + ':' + printprt;
  pReq += '/' + lob + '/' + doc;
  var docCb = {};
  request({
    url: pReq,
    method: 'POST',
    json: json
  }, function (err, resul, body) {
    if (err) {
      callback(JSON.stringify(err));
      return;
    }
    else if (resul.statusCode !== 200) {
      callback(JSON.stringify(body));
      return;
    }
    else {
      var docdata = {};
      docdata.docname = retName;
      docdata.mongoid = body.id;
      docdata.link = '/' + lob + '/' + doc + '/pdf/';
      docCb.doc = retName;
      docCb.id = body.id;
      docCb.lob = '/' + lob + '/' + doc;
      callback(null, docCb);
      return;
    }
  });
  // }}}
}
exports.declare = function (app) {
  app.post('/svc/assistance/travel/country', session.ensureAuth, ora.listCountries ||
    listCountries);
  app.post('/svc/assistance/travel/create', session.ensureAuth, ora.createTravel ||
    createTravel);
  app.post('/svc/assistance/travel/update', session.ensureAuth, ora.updateTravel ||
    updateTravel);
  app.post('/svc/assistance/traveler/set', session.ensureAuth, ora.setTravelers ||
    setTravelers);
  app.post('/svc/assistance/subscriber/set', session.ensureAuth, ora.setSubscriber ||
    setSubscriber);
  app.post('/svc/assistance/doctor/set', session.ensureAuth, ora.setDoctor ||
    setDoctor);
  app.post('/svc/assistance/personToprevent/set', session.ensureAuth, ora.setPersonToprevent ||
    setPersonToprevent);
  app.post('/svc/assistance/contract/create', session.ensureAuth, ora.createContract ||
    createContract);
  app.post('/svc/assistance/search/getData', session.ensureAuth, ora.searchAssistance ||
    searchAssistance);
  app.post('/svc/assistance/policy/get', session.ensureAuth, ora.getPolicy ||
    getPolicy);
  app.post('/svc/assistance/pricings/get', session.ensureAuth, ora.getPricings ||
    getPricings);
  app.post('/svc/assistance/pricings/set', session.ensureAuth, ora.setPricings ||
    setPricings);
};

var session = require('../logic/session');
var mongo = require('../mongo');
var _ = require('underscore');
var moment = require('moment');

function configsProductCheckAccess(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.productConfig) {
      accessGranted = req.session.user.accessRights.productConfig;
    }
  }
  if (accessGranted) {
    res.json(null);
    return;
  }
  res.send(500, 'Accès refusé');
}

function configsProductSearch(req, res) {
  var contract = req.body.data.contract;
  var branch = req.body.data.branch;
  var product = req.body.data.product;
  var searchContrat = false;
  var query = {};
  var retProducts = [];
  var sProd;
  if (contract !== null) {
    searchContrat = true;
  }
  if (branch !== '') {
    query['def.branch'] = branch;
  }
  if (product !== '') {
    query['def.code'] = product;
  }
  var cursor = mongo.getProductCol()
    .find(query)
    .sort('def.code', 1);
  cursor.toArray(function (err, results) {
    if (err) {
      if (err.code === 17144) {
        res.send(500, 'Veuillez affiner votre sélection !');
        return;
      }
      else {
        res.send(500, err);
        return;
      }
    }
    if (results.length !== 0) {
      if (searchContrat) {
        contract = parseInt(contract);
        if (_.isNaN(contract)) {
          res.send(500, 'N° de contrat incorrect !');
          return;
        }
        mongo.getPolProductCol()
          .findOne({
            contract: contract
          }, function (err, rec) {
            if (err) {
              res.send(500, err);
              return;
            }
            if (rec.length === 0) {
              res.send(500, 'Aucune contrat trouvé !');
              return;
            }
            _.each(results, function (item) {
              if (parseInt(item.def.code) === rec.product) {
                sProd = {};
                sProd.code = item.def.code;
                sProd.branch = item.def.branch;
                sProd.name = item.def.name;
                sProd.fromDate = item.def.fromDate;
                sProd.toDate = item.def.toDate;
                sProd.status = item.def.status;
                retProducts.push(sProd);
              }
            });
            res.send({
              products: retProducts
            });
          });
      }
      else {
        _.each(results, function (item) {
          sProd = {};
          sProd.code = item.def.code;
          sProd.branch = item.def.branch;
          sProd.name = item.def.name;
          sProd.fromDate = item.def.fromDate;
          sProd.toDate = item.def.toDate;
          sProd.status = item.def.status;
          retProducts.push(sProd);
        });
        res.send({
          products: retProducts
        });
      }
    }
    else {
      res.send({
        products: retProducts
      });
    }
  });
}

function getProdDetails(req, res) {
  var product = req.body.product;
  var prodCode = parseInt(product.code);
  var retCovers;
  var sCover;
  var sComm;
  if (_.isNaN(prodCode)) {
    res.send(500, 'Produit incorrect !');
    return;
  }
  mongo.getProductCol()
    .findOne({
      'def.code': product.code
    }, function (err, prod) {
      if (err) {
        res.send(500, err);
        return;
      }
      retCovers = [];
      _.each(prod.covers, function (item) {
        sCover = {};
        sCover.code = item.code;
        sCover.name = item.name;
        sCover.commissions = [];
        var comms = item.commissions;
        comms.sort(function (a, b) {
          return parseInt(a.profile.substr(0, 1)) - parseInt(b.profile
            .substr(0, 1));
        });
        _.each(comms, function (comm) {
          sComm = {};
          sComm.profile = comm.profile;
          sComm.rate = comm.rate;
          sComm.cover = item.code;
          sComm.code = prodCode;
          sComm.rateFormatted = Number((comm.rate * 100)
            .toFixed(3));
          sCover.commissions.push(sComm);
        });
        retCovers.push(sCover);
      });
      res.send({
        covers: retCovers
      });
    });
}

function applyCommProfileRate(req, res) {
  var accessGranted = false;
  if (req.session.user.accessRights) {
    if (req.session.user.accessRights.productConfig) {
      accessGranted = req.session.user.accessRights.productConfig;
    }
  }
  if (!accessGranted) {
    res.send(500, 'Accès refusé');
    return;
  }
  var prevRate = req.body.data.prevRate;
  var newRate = req.body.data.newRate;
  if (Number(prevRate.toFixed(3)) === Number(newRate.toFixed(3))) {
    res.json(null);
    return;
  }
  var product = req.body.data.product + '';
  var cover = req.body.data.cover;
  var profile = req.body.data.profile;
  var rate = req.body.data.rate;
  var opType = req.body.data.opType;
  var userCode = req.session.user.username;
  var date = moment()
    .format('YYYY-MM-DD');
  var time = moment()
    .format('HH:mm:ss');
  var sHistory = {};
  sHistory.user = userCode;
  sHistory.action = opType;
  sHistory.date = date;
  sHistory.time = time;
  sHistory.details = {};
  sHistory.details.cover = cover;
  sHistory.details.product = product;
  sHistory.details.profile = profile;
  sHistory.details.oldData = prevRate;
  sHistory.details.newData = newRate;
  mongo.getProductCol()
    .findOne({
      'def.code': product
    }, function (err, prod) {
      if (err) {
        res.send(500, err);
        return;
      }
      if (!prod.history) {
        prod.history = [];
      }
      prod.history.push(sHistory);
      _.each(prod.covers, function (item) {
        if (item.code === cover) {
          _.each(item.commissions, function (comm) {
            if (comm.profile === profile) {
              comm.rate = rate;
            }
          });
        }
      });
      mongo.getProductCol()
        .update({
          'def.code': product
        }, prod, function (err) {
          if (err) {
            res.send(500, err);
            return;
          }
          res.json(null);
          return;
        });
    });
}
exports.declare = function (app) {
  app.post('/svc/configs/product/checkAccess', session.ensureAuth,
    configsProductCheckAccess);
  app.post('/svc/configs/product/searchProd', session.ensureAuth,
    configsProductSearch);
  app.post('/svc/configs/product/getProdDetails', session.ensureAuth,
    getProdDetails);
  app.post('/svc/configs/product/applyCommProfileRate', session.ensureAuth,
    applyCommProfileRate);
};

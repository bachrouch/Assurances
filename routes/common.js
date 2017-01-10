var mongo = require('../mongo');
var _ = require('underscore');
var bankList = [{
  id: 'ABC BANK',
  text: 'ABC BANK'
}, {
  id: 'AL BARAKA',
  text: 'AL BARAKA'
}, {
  id: 'AMEN BANK',
  text: 'AMEN BANK'
}, {
  id: 'ATB',
  text: 'ATB'
}, {
  id: 'BANQUE ZITOUNA',
  text: 'BANQUE ZITOUNA'
}, {
  id: 'BCT',
  text: 'BCT'
}, {
  id: 'BFPME',
  text: 'BFPME'
}, {
  id: 'BFT',
  text: 'BFT'
}, {
  id: 'BH',
  text: 'BH'
}, {
  id: 'BIAT',
  text: 'BIAT'
}, {
  id: 'BNA',
  text: 'BNA'
}, {
  id: 'BANQUE DE TUNISIE',
  text: 'BANQUE DE TUNISIE'
}, {
  id: 'BANQUE TUNISIE ET DES EMIRATS',
  text: 'BANQUE TUNISIE ET DES EMIRATS'
}, {
  id: 'BTK',
  text: 'BTK'
}, {
  id: 'BTL',
  text: 'BTL'
}, {
  id: 'BTS',
  text: 'BTS'
}, {
  id: 'La poste',
  text: 'La poste'
}, {
  id: 'CITY BANK',
  text: 'CITY BANK'
}, {
  id: 'ATTIJARI BANK',
  text: 'ATTIJARI BANK'
}, {
  id: 'NAIB BANK',
  text: 'NAIB BANK'
}, {
  id: 'STB',
  text: 'STB'
}, {
  id: 'STUSID BANK',
  text: 'STUSID BANK'
}, {
  id: 'TIB',
  text: 'TIB'
}, {
  id: 'UBCI',
  text: 'UBCI'
}, {
  id: 'UIB',
  text: 'UIB'
}, {
  id: 'QNB',
  text: 'QNB'
}];
var paymentStatusList = [{
  id: 0,
  text: 'Brouillon'
}, {
  id: 1,
  text: 'Clôturé'
}, {
  id: 2,
  text: 'Accepté'
}, {
  id: 3,
  text: 'En instance'
}, {
  id: 4,
  text: 'Rejeté'
}, {
  id: 5,
  text: 'Erroné'
}, {
  id: 6,
  text: 'Liquidé'
}];
var paybackStatusList = [{
  id: 0,
  text: 'Brouillon'
}, {
  id: 1,
  text: 'Clôturé'
}];
var exemptionStatusList = [{
  id: 0,
  text: 'Non Traité'
}, {
  id: 1,
  text: 'Accepté'
}, {
  id: 2,
  text: 'Rejeté'
}];
var exemptionTypeList = [{
  id: 0,
  text: 'Automobile'
}, {
  id: 1,
  text: 'Feuille de Caisse'
}];
var settlementModeList = [{
  id: 0,
  text: 'Virement'
}, {
  id: 1,
  text: 'Espèces/Versement'
}, {
  id: 2,
  text: 'Chèque'
}, {
  id: 3,
  text: 'Traite'
}, {
  id: 5,
  text: 'Prélèvement sur salaire'
}, {
  id: 6,
  text: 'Prélèvement bancaire'
}];
var travelTypes = [{
  id: 'Individual',
  text: 'Individuel'
}, {
  id: 'Group',
  text: 'Groupe'
}, {
  id: 'coupleWithoutChildren',
  text: 'Couple sans enfants'
}, {
  id: 'coupleWithChildren',
  text: 'Couple avec enfants'
}];
var termStatus = [{
  id: 0,
  text: 'Echu'
}, {
  id: 1,
  text: 'Courant'
}, {
  id: 2,
  text: 'Futur'
}];
var motorContractTypes = [{
  id: 'AUTOPR',
  text: 'Particulier'
}, {
  id: 'AUTOFS',
  text: 'Flotte'
}];
var branchList = [];
var productList = [];

function GetBankList(req, res) {
  if (req.session.user) {
    res.send(bankList);
  }
  else {
    res.send();
  }
}

function getPaymentStatus(req, res) {
  if (req.session.user) {
    res.send(paymentStatusList);
  }
  else {
    res.send();
  }
}

function getPaybackStatus(req, res) {
  if (req.session.user) {
    res.send(paybackStatusList);
  }
  else {
    res.send();
  }
}

function getExemptionStatus(req, res) {
  if (req.session.user) {
    res.send(exemptionStatusList);
  }
  else {
    res.send();
  }
}

function getExemptionType(req, res) {
  if (req.session.user) {
    res.send(exemptionTypeList);
  }
  else {
    res.send();
  }
}

function getSettlementMode(req, res) {
  if (req.session.user) {
    res.send(settlementModeList);
  }
  else {
    res.send();
  }
}

function getPosList(req, res) {
  if (req.session.user) {
    var posList = [];
    var sPos;
    mongo.getPosCol()
      .find({}, function (err, cursor) {
        if (err) {
          res.send(500, err);
          return;
        }
        cursor.toArray(function (err, results) {
          results.sort(function (a, b) {
            return parseInt(a.code) - parseInt(b.code);
          });
          _.each(results, function (item) {
            sPos = {};
            sPos.id = parseInt(item.code);
            sPos.text = item.code + ' - ' + item.name;
            posList.push(sPos);
          });
          res.send(posList);
        });
      });
  }
  else {
    res.send();
  }
}

function getTravelTypes(req, res) {
  if (req.session.user) {
    res.send(travelTypes);
  }
  else {
    res.send();
  }
}

function gettermStatus(req, res) {
  if (req.session.user) {
    res.send(termStatus);
  }
  else {
    res.send();
  }
}

function getmotorContractTypes(req, res) {
  if (req.session.user) {
    res.send(motorContractTypes);
  }
  else {
    res.send();
  }
}

function getIrregStatus(req, res) {
  if (req.session.user) {
    var statList = [];
    var sStat;
    mongo.getCommIrregStatCol()
      .find({}, function (err, cursor) {
        if (err) {
          res.send(500, err);
          return;
        }
        cursor.toArray(function (err, results) {
          results.sort(function (a, b) {
            return a.id - b.id;
          });
          _.each(results, function (item) {
            sStat = {};
            sStat.id = item.id;
            sStat.text = item.text;
            statList.push(sStat);
          });
          res.send(statList);
        });
      });
  }
  else {
    res.send();
  }
}

function getIrregNature(req, res) {
  if (req.session.user) {
    var natList = [];
    var sNat;
    mongo.getCommIrregNatCol()
      .find({}, function (err, cursor) {
        if (err) {
          res.send(500, err);
          return;
        }
        cursor.toArray(function (err, results) {
          results.sort(function (a, b) {
            return a.id - b.id;
          });
          _.each(results, function (item) {
            sNat = {};
            sNat.id = item.id;
            sNat.text = item.text;
            natList.push(sNat);
          });
          res.send(natList);
        });
      });
  }
  else {
    res.send();
  }
}

function getcoverReference(req, res) {
  if (req.session.user) {
    var covList = [];
    var sCov;
    mongo.getCoverReferenceCol()
      .find({}, function (err, cursor) {
        if (err) {
          res.send(500, err);
          return;
        }
        cursor.toArray(function (err, results) {
          results.sort(function (a, b) {
            return a.code - b.code;
          });
          _.each(results, function (item) {
            sCov = {};
            sCov.id = item.code;
            sCov.text = item.name;
            covList.push(sCov);
          });
          res.send(covList);
        });
      });
  }
  else {
    res.send();
  }
}

function getbranchList(req, res) {
  var crit = req.body.criterium;
  var sCompare1;
  var sCompare2;
  var brnList = [];
  var sBrn;
  if (_.isUndefined(crit)) {
    crit = '';
  }
  if (req.session.user) {
    if (branchList.length === 0) {
      mongo.getBranchCol()
        .find({}, function (err, cursor) {
          if (err) {
            res.send(500, err);
            return;
          }
          cursor.toArray(function (err, results) {
            results.sort(function (a, b) {
              return a.code - b.code;
            });
            _.each(results, function (item) {
              sBrn = {};
              if (crit === '') {
                sBrn.id = item.code;
                sBrn.text = item.name;
                brnList.push(sBrn);
              }
              else {
                sCompare1 = item.name.toUpperCase();
                sCompare2 = crit.toUpperCase();
                if (sCompare1.indexOf(sCompare2) > -1) {
                  sBrn.id = item.code;
                  sBrn.text = item.name;
                  brnList.push(sBrn);
                }
              }
            });
            branchList = brnList;
            res.send(brnList);
          });
        });
    }
    else {
      var results;
      results = branchList;
      results.sort(function (a, b) {
        return a.code - b.code;
      });
      _.each(results, function (item) {
        sBrn = {};
        if (crit === '') {
          sBrn.id = item.id;
          sBrn.text = item.text;
          brnList.push(sBrn);
        }
        else {
          sCompare1 = item.text.toUpperCase();
          sCompare2 = crit.toUpperCase();
          if (sCompare1.indexOf(sCompare2) > -1) {
            sBrn.id = item.id;
            sBrn.text = item.text;
            brnList.push(sBrn);
          }
        }
      });
      res.send(brnList);
    }
  }
  else {
    res.send();
  }
}

function getproductList(req, res) {
  var branch = req.body.branch;
  var crit = req.body.criterium;
  var sCompare1;
  var sCompare2;
  var prdList = [];
  var sPrd;
  var singleProduct;
  if (_.isUndefined(crit)) {
    crit = '';
  }
  if (req.session.user) {
    if (productList.length === 0) {
      var cursor = mongo.getProductCol()
        .find({});
      cursor.toArray(function (err, results) {
        results.sort(function (a, b) {
          return parseInt(a.def.code) - parseInt(b.def.code);
        });
        _.each(results, function (item) {
          singleProduct = {};
          singleProduct.id = parseInt(item.def.code);
          singleProduct.text = item.def.name;
          singleProduct.branch = item.def.branch;
          productList.push(singleProduct);
          sPrd = {};
          if (branch === '') {
            if (crit === '') {
              sPrd.id = parseInt(item.def.code);
              sPrd.text = item.def.name;
              prdList.push(sPrd);
            }
            else {
              sCompare1 = item.def.name.toUpperCase();
              sCompare2 = crit.toUpperCase();
              if (sCompare1.indexOf(sCompare2) > -1) {
                sPrd.id = parseInt(item.def.code);
                sPrd.text = item.def.name;
                prdList.push(sPrd);
              }
            }
          }
          else {
            if (crit === '') {
              if (branch === item.def.branch) {
                sPrd.id = parseInt(item.def.code);
                sPrd.text = item.def.name;
                prdList.push(sPrd);
              }
            }
            else {
              if (branch === item.def.branch) {
                sCompare1 = item.def.name.toUpperCase();
                sCompare2 = crit.toUpperCase();
                if (sCompare1.indexOf(sCompare2) > -1) {
                  sPrd.id = parseInt(item.def.code);
                  sPrd.text = item.def.name;
                  prdList.push(sPrd);
                }
              }
            }
          }
        });
        res.send(prdList);
      });
    }
    else {
      var results = productList;
      _.each(results, function (item) {
        sPrd = {};
        if (branch === '') {
          if (crit === '') {
            sPrd.id = item.id;
            sPrd.text = item.text;
            prdList.push(sPrd);
          }
          else {
            sCompare1 = item.text.toUpperCase();
            sCompare2 = crit.toUpperCase();
            if (sCompare1.indexOf(sCompare2) > -1) {
              sPrd.id = item.id;
              sPrd.text = item.text;
              prdList.push(sPrd);
            }
          }
        }
        else {
          if (crit === '') {
            if (branch === item.branch) {
              sPrd.id = item.id;
              sPrd.text = item.text;
              prdList.push(sPrd);
            }
          }
          else {
            if (branch === item.branch) {
              sCompare1 = item.text.toUpperCase();
              sCompare2 = crit.toUpperCase();
              if (sCompare1.indexOf(sCompare2) > -1) {
                sPrd.id = item.id;
                sPrd.text = item.text;
                prdList.push(sPrd);
              }
            }
          }
        }
      });
      res.send(prdList);
    }
  }
  else {
    res.send();
  }
}

function getcommProfileList(req, res) {
  if (req.session.user) {
    var comProfileList = [];
    var sProfile;
    var cursor = mongo.getComProfileCol()
      .find({});
    cursor.toArray(function (err, results) {
      results.sort(function (a, b) {
        return parseInt(a.code.substr(0, 1)) - parseInt(b.code.substr(0,
          1));
      });
      _.each(results, function (item) {
        sProfile = {};
        sProfile.id = item.code;
        sProfile.text = item.nameFr;
        comProfileList.push(sProfile);
      });
      res.send(comProfileList);
    });
  }
  else {
    res.send();
  }
}

function getConfigUtils(req, res) {
  if (req.session.user) {
    var ruleList = [];
    var sRule;
    var cursor = mongo.getUtilsCol()
      .find({});
    cursor.toArray(function (err, results) {
      _.each(results, function (item) {
        sRule = {};
        sRule.name = item.def.ref;
        sRule.params = item.params;
        ruleList.push(sRule);
      });
      res.send(ruleList);
    });
  }
  else {
    res.send();
  }
}
exports.declare = function (app) {
  app.post('/svc/common/banklist', GetBankList);
  app.post('/svc/common/paymentStatus', getPaymentStatus);
  app.post('/svc/common/paybackStatus', getPaybackStatus);
  app.post('/svc/common/settlementMode', getSettlementMode);
  app.post('/svc/common/posList', getPosList);
  app.post('/svc/common/travelTypes', getTravelTypes);
  app.post('/svc/common/termStatus', gettermStatus);
  app.post('/svc/common/motorContractTypes', getmotorContractTypes);
  app.post('/svc/common/exemptionStatus', getExemptionStatus);
  app.post('/svc/common/exemptionType', getExemptionType);
  app.post('/svc/common/irregStatus', getIrregStatus);
  app.post('/svc/common/irregNature', getIrregNature);
  app.post('/svc/common/coverReference', getcoverReference);
  app.post('/svc/common/branchList', getbranchList);
  app.post('/svc/common/productList', getproductList);
  app.post('/svc/common/commProfileList', getcommProfileList);
  app.post('/svc/common/getConfigUtils', getConfigUtils);
};

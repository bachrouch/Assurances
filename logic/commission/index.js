/* vim: fdm=marker
 */
var mongo = require('../../mongo');
var _ = require('underscore');
var utils = require('../utils');

function calculate4Display(pos, policy, coverages, fees, cb) {
  // {{{
  var covers = [];
  var sCover;
  var field;
  var sFees;
  var lastProduct;
  mongo.getPosCol()
    .findOne({
      'code': pos
    }, function (err, pointOfSale) {
      if (err) {
        cb(err);
        return;
      }
      if (!pointOfSale) {
        cb('Erreur lors de la récupération du point de vente !');
        return;
      }
      var defaultProfile = pointOfSale.defaultProfile;
      mongo.getCommissionCol()
        .findOne({
          'code': defaultProfile
        }, function (err, comm) {
          if (err) {
            cb(err);
            return;
          }
          _.each(coverages, function (item, key) {
            _.each(item, function (cover) {
              sCover = {};
              sCover.code = cover.code;
              sCover.name = cover.name;
              // *** ASO
              sCover.amount = 0;
              if (cover.net !== null) {
                sCover.amount = Number(cover.net.toFixed(3));
              }
              if (typeof (cover.tua) !== 'undefined') {
                sCover.tua = Number(cover.tua.toFixed(3));
              }
              else {
                sCover.tua = 0;
              }
              if (typeof (cover.fg) !== 'undefined') {
                sCover.fg = Number(cover.fg.toFixed(3));
              }
              else {
                sCover.fg = 0;
              }
              field = 'policyComm.' + policy + '.';
              field += cover.code;
              if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
                'undefined') {
                field = 'commission.' + key + '.';
                field += cover.code;
                if (typeof (utils.checkObjectTree(pointOfSale,
                    field)) === 'undefined') {
                  field = key + '.';
                  field += cover.code;
                  if (typeof (utils.checkObjectTree(comm, field)) ===
                    'undefined') {
                    sCover.commission = Number(cover.commission.toFixed(
                      3));
                  }
                  else {
                    sCover.commission = Number((cover.net * utils.checkObjectTree(
                        comm, field))
                      .toFixed(3));
                  }
                }
                else {
                  sCover.commission = Number((cover.net * utils.checkObjectTree(
                      pointOfSale, field))
                    .toFixed(3));
                }
              }
              else {
                sCover.commission = Number((cover.net * utils.checkObjectTree(
                    pointOfSale, field))
                  .toFixed(3));
              }
              covers.push(sCover);
            });
            lastProduct = key;
          });
          sFees = {};
          sFees.code = fees.code;
          sFees.name = fees.name;
          // *** ASO
          sFees.amount = 0;
          sFees.tua = 0;
          sFees.fg = 0;
          if (fees.net !== null) {
            sFees.amount = Number(fees.net.toFixed(3));
          }
          if (fees.tua !== null) {
            sFees.tua = Number(fees.tua.toFixed(3));
          }
          if (fees.fg !== null) {
            sFees.fg = Number(fees.fg.toFixed(3));
          }
          field = 'policyComm.' + policy + '.';
          field += fees.code;
          if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
            'undefined') {
            field = 'commission.' + lastProduct + '.' + fees.code;
            if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
              'undefined') {
              field = lastProduct + '.';
              field += fees.code;
              if (typeof (utils.checkObjectTree(comm, field)) ===
                'undefined') {
                // *** ASO
                if (sFees.commission !== null) {
                  if (typeof (fees.commission) === 'undefined') {
                    sFees.commission = 0;
                  }
                  else {
                    sFees.commission = Number(fees.commission.toFixed(3));
                  }
                }
              }
              else {
                sFees.commission = Number((fees.net * utils.checkObjectTree(
                    comm, field))
                  .toFixed(3));
              }
            }
            else {
              sFees.commission = Number((fees.net * utils.checkObjectTree(
                  pointOfSale, field))
                .toFixed(3));
            }
          }
          else {
            sFees.commission = Number((fees.net * utils.checkObjectTree(
                pointOfSale, field))
              .toFixed(3));
          }
          var gCover = _.groupBy(covers, function (item) {
            return item.code;
          });
          var result = [];
          var net;
          var tua;
          var fg;
          var commTemp;
          var code;
          var name;
          var totalComm = 0;
          _.each(gCover, function (group) {
            net = 0;
            tua = 0;
            fg = 0;
            commTemp = 0;
            sCover = {};
            _.each(group, function (item) {
              net += item.amount;
              tua += item.tua;
              fg += item.fg;
              commTemp += item.commission;
              totalComm += item.commission;
              code = item.code;
              name = item.name;
            });
            totalComm += sFees.commission;
            sCover.code = code;
            sCover.name = name;
            sCover.amount = net;
            sCover.tua = tua;
            sCover.fg = fg;
            sCover.commission = commTemp;
            result.push(sCover);
          });
          cb(null, result, totalComm, sFees);
        });
    });
  // }}}
}

function calculate(pos, policy, coverages, fees, cb) {
  // {{{
  var covers = [];
  var sCover;
  var field;
  var sFees;
  var lastProduct;
  var sTax;
  mongo.getPosCol()
    .findOne({
      'code': pos
    }, function (err, pointOfSale) {
      if (err) {
        cb(err);
        return;
      }
      if (!pointOfSale) {
        cb('Erreur lors de la récupération du point de vente !');
        return;
      }
      var defaultProfile = pointOfSale.defaultProfile;
      mongo.getCommissionCol()
        .findOne({
          'code': defaultProfile
        }, function (err, comm) {
          if (err) {
            cb(err);
            return;
          }
          _.each(coverages, function (item, key) {
            _.each(item, function (cover) {
              sCover = {};
              sCover.code = cover.code;
              sCover.name = cover.name;
              // *** ASO
              sCover.amount = 0;
              if (cover.net !== null) {
                sCover.amount = Number(cover.net.toFixed(3));
              }
              // *** ASO
              sCover.tua = 0;
              if (cover.net !== null) {
                sCover.tua = Number(cover.tua.toFixed(3));
              }
              // *** ASO
              if (sCover.fg !== null) {
                sCover.fg = Number(cover.fg.toFixed(3));
              }
              field = 'policyComm.' + policy + '.';
              field += cover.code;
              if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
                'undefined') {
                field = 'commission.' + key + '.';
                field += cover.code;
                if (typeof (utils.checkObjectTree(pointOfSale,
                    field)) === 'undefined') {
                  field = key + '.';
                  field += cover.code;
                  if (typeof (utils.checkObjectTree(comm, field)) ===
                    'undefined') {
                    sCover.commission = Number(cover.commission.toFixed(
                      3));
                  }
                  else {
                    sCover.commission = Number((cover.net * utils.checkObjectTree(
                        comm, field))
                      .toFixed(3));
                  }
                }
                else {
                  sCover.commission = Number((cover.net * utils.checkObjectTree(
                      pointOfSale, field))
                    .toFixed(3));
                }
              }
              else {
                sCover.commission = Number((cover.net * utils.checkObjectTree(
                    pointOfSale, field))
                  .toFixed(3));
              }
              covers.push(sCover);
            });
            lastProduct = key;
          });
          sFees = {};
          sFees.code = fees.code;
          sFees.name = fees.name;
          // *** ASO
          sFees.amount = 0;
          if (fees.net !== null) {
            sFees.amount = Number(fees.net.toFixed(3));
          }
          sTax = {};
          sFees.taxes = [];
          if (fees.tua !== 0) {
            sTax.code = 'TUA';
            sTax.amount = fees.tua;
            sFees.taxes.push(sTax);
          }
          sTax = {};
          if (fees.fg !== 0) {
            sTax.code = 'FG';
            sTax.amount = fees.fg;
            sFees.taxes.push(sTax);
          }
          field = 'policyComm.' + policy + '.';
          field += fees.code;
          if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
            'undefined') {
            field = 'commission.' + lastProduct + '.' + fees.code;
            if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
              'undefined') {
              field = lastProduct + '.';
              field += fees.code;
              if (typeof (utils.checkObjectTree(comm, field)) ===
                'undefined') {
                sFees.commission = Number(fees.commission.toFixed(3));
              }
              else {
                sFees.commission = Number((fees.net * utils.checkObjectTree(
                    comm, field))
                  .toFixed(3));
              }
            }
            else {
              sFees.commission = Number((fees.net * utils.checkObjectTree(
                  pointOfSale, field))
                .toFixed(3));
            }
          }
          else {
            sFees.commission = Number((fees.net * utils.checkObjectTree(
                pointOfSale, field))
              .toFixed(3));
          }
          var gCover = _.groupBy(covers, function (item) {
            return item.code;
          });
          var result = [];
          var net;
          var tua;
          var fg;
          var commTemp;
          var code;
          var totalComm = 0;
          _.each(gCover, function (group) {
            net = 0;
            tua = 0;
            fg = 0;
            commTemp = 0;
            sCover = {};
            _.each(group, function (item) {
              net += item.amount;
              tua += item.tua;
              fg += item.fg;
              commTemp += item.commission;
              totalComm += item.commission;
              code = item.code;
            });
            totalComm += sFees.commission;
            sCover.code = code;
            sCover.amount = net;
            sTax = {};
            sCover.taxes = [];
            if (tua !== 0) {
              sTax.code = 'TUA';
              sTax.amount = tua;
              sCover.taxes.push(sTax);
            }
            sTax = {};
            if (fg !== 0) {
              sTax.code = 'FG';
              sTax.amount = fg;
              sCover.taxes.push(sTax);
            }
            sCover.commission = commTemp;
            result.push(sCover);
          });
          result = utils.fixNumberInObject(result, 3);
          totalComm = utils.fixNumber(totalComm, 3);
          sFees = utils.fixNumberInObject(sFees, 3);
          cb(null, result, totalComm, sFees);
        });
    });
  // }}}
}

function processCommission(recData, cb) {
  // {{{
  var pos = recData.pos;
  var raisedDate = recData.raisedDate;
  var coverages = recData.coverages;
  var policy = recData.policy;
  var product = recData.product;
  var fees = recData.fees;
  var accreditDate = '2011-01-14';
  var defaultProfile;
  var field;
  var sCover;
  var recalcCovers;
  var retMessages;
  var recalcFees;
  var forProcessing;
  var signDelta = 0;
  forProcessing = {};
  forProcessing.pos = recData.pos;
  forProcessing.reference = recData.reference;
  forProcessing.contract = recData.contract;
  forProcessing.product = recData.product;
  forProcessing.receiptComm = recData.receiptComm;
  forProcessing.status = recData.status;
  forProcessing.receiptAmount = recData.receiptAmount;
  forProcessing.adjustedCoverages = [];
  forProcessing.covers = recData.coverages;
  forProcessing.date = recData.raisedDate;
  forProcessing.fromDate = recData.fromDate;
  forProcessing.toDate = recData.toDate;
  forProcessing.usage = recData.usage;
  forProcessing.recovery = recData.recovery;
  var sAdjCovers;
  mongo.getUtilsCol()
    .findOne({
      'def.ref': 'CommConfigUtil'
    }, function (err, configComm) {
      if (err) {
        cb(err);
        return;
      }
      _.each(configComm.params, function (item) {
        if (item.name === 'Significant delta') {
          signDelta = item.value;
        }
      });
      mongo.getPosCol()
        .findOne({
          'code': pos
        }, function (err, pointOfSale) {
          if (err) {
            cb(err);
            return;
          }
          if (!pointOfSale) {
            cb('Erreur lors de la récupération du point de vente !');
            return;
          }
          _.each(pointOfSale.history, function (item) {
            if (item.accreditDate) {
              accreditDate = item.accreditDate;
            }
          });
          if (accreditDate === '2011-01-14') {
            defaultProfile = pointOfSale.defaultProfile;
          }
          else {
            if (accreditDate <= raisedDate) {
              defaultProfile = '2XX';
            }
            else {
              if (pointOfSale.defaultProfile === '2XX') {
                defaultProfile = '1XX';
              }
              else {
                defaultProfile = pointOfSale.defaultProfile;
              }
            }
          }
          mongo.getCommissionCol()
            .findOne({
              'code': defaultProfile
            }, function (err, comm) {
              if (err) {
                cb(err);
                return;
              }
              if (typeof (comm[product]) !== 'undefined') {
                field = product + '.name';
                forProcessing.productName = utils.checkObjectTree(comm,
                  field);
              }
              else {
                forProcessing.productName = '';
              }
              forProcessing.posProfile = comm.nameFr;
              recalcCovers = [];
              retMessages = [];
              _.each(coverages, function (item) {
                sAdjCovers = {};
                sCover = {};
                sCover.code = item.code;
                sCover.amount = item.amount;
                field = 'policyComm.' + policy + '.';
                field += item.code;
                if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
                  'undefined') {
                  field = 'commission.' + product + '.';
                  field += item.code;
                  if (typeof (utils.checkObjectTree(pointOfSale,
                      field)) === 'undefined') {
                    field = product + '.';
                    field += item.code;
                    if (typeof (utils.checkObjectTree(comm, field)) ===
                      'undefined') {
                      sAdjCovers.code = item.code;
                      sAdjCovers.commission = item.commission;
                      sAdjCovers.amount = item.amount;
                      sAdjCovers.calcCommission = 0;
                      sCover.commission = 0;
                      sCover.calcComments =
                        'Commission rate not found';
                    }
                    else {
                      sCover.commission = Number((item.amount * utils
                          .checkObjectTree(comm, field))
                        .toFixed(3));
                    }
                  }
                  else {
                    sCover.commission = Number((item.amount * utils.checkObjectTree(
                        pointOfSale, field))
                      .toFixed(3));
                  }
                }
                else {
                  sCover.commission = Number((item.amount * utils.checkObjectTree(
                      pointOfSale, field))
                    .toFixed(3));
                }
                if (Math.abs(item.commission - sCover.commission) >
                  signDelta) {
                  if (sAdjCovers.code === item.code) {
                    forProcessing.adjustedCoverages.push(sAdjCovers);
                  }
                  else {
                    sAdjCovers = {};
                    sAdjCovers.code = item.code;
                    sAdjCovers.amount = item.amount;
                    sAdjCovers.commission = item.commission;
                    sAdjCovers.calcCommission = sCover.commission;
                    forProcessing.adjustedCoverages.push(sAdjCovers);
                  }
                  if (!sCover.calcComments) {
                    sCover.calcComments =
                      'Commission different from calculated';
                  }
                }
                if (item.commission === 0 && sCover.commission !== 0) {
                  sCover.calcComments = 'Commission on net zero';
                }
                if (sCover.calcComments) {
                  retMessages.push(sCover.calcComments);
                }
                recalcCovers.push(sCover);
              });
              recalcFees = {};
              recalcFees.amount = fees.net;
              recalcFees.code = fees.code;
              recalcFees.commission = fees.commission;
              field = 'policyComm.' + policy + '.';
              field += fees.code;
              if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
                'undefined') {
                field = 'commission.' + product + '.' + fees.code;
                if (typeof (utils.checkObjectTree(pointOfSale, field)) ===
                  'undefined') {
                  field = product + '.';
                  field += fees.code;
                  if (typeof (utils.checkObjectTree(comm, field)) ===
                    'undefined') {
                    recalcFees.calcCommission = 0;
                    recalcFees.calcComments = 'Commission rate not found';
                  }
                  else {
                    recalcFees.calcCommission = Number((fees.net * utils.checkObjectTree(
                        comm, field))
                      .toFixed(3));
                  }
                }
                else {
                  recalcFees.calcCommission = Number((fees.net * utils.checkObjectTree(
                      pointOfSale, field))
                    .toFixed(3));
                }
              }
              else {
                recalcFees.calcCommission = Number((fees.net * utils.checkObjectTree(
                    pointOfSale, field))
                  .toFixed(3));
              }
              if (Math.abs(fees.commission - recalcFees.calcCommission) >
                signDelta) {
                var sFeeCover = {};
                sFeeCover.code = 'FEE';
                sFeeCover.amount = fees.net;
                sFeeCover.commission = fees.commission;
                sFeeCover.calcCommission = recalcFees.calcCommission;
                forProcessing.adjustedCoverages.push(sFeeCover);
                if (!recalcFees.calcComments) {
                  recalcFees.calcComments =
                    'Fees commission different from calculated';
                }
              }
              if (fees.commission === 0 && recalcFees.calcCommission !==
                0) {
                recalcFees.calcComments = 'Commission on fees zero';
              }
              cb(null, recalcCovers, recalcFees, retMessages,
                forProcessing);
            });
        });
    });
  // }}} 
}
exports.calculate4Display = calculate4Display;
exports.calculate = calculate;
exports.processCommission = processCommission;

main.module('finance.payment', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.steps = new mod.Steps();
      this.receipts = new mod.Receipts();
      this.receiptsSummary = new mod.ReceiptsSummary();
      this.payment = new mod.Payment();
      this.pos = new mod.POS();
      this.payments = new mod.Payments();
      this.settlement = new mod.Settlement();
      this.doc = new app.common.Doc();
      this.layout = new mod.Layout();
      this.searchLayout = new mod.SearchLayout();
      this.paymentCriteria = new mod.PaymentCriteria();
      this.paymentConsultView = new mod.PaymentConsultView();
      this.paymentRequestView = new mod.PaymentRequestView();
      this.postponedReceipts = [];
      this.receiptReported = new mod.ReceiptReported();
      this.receiptsList = new mod.ReceiptsList();
      this.sendExep = new mod.SendExep();
      this.initSteps();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new mod.Step({
        name: 'Picker',
        active: false,
        label: 'Recherche'
      });
      steps[1] = new mod.Step({
        name: 'Main',
        active: false,
        label: 'Quittances'
      });
      steps[2] = new mod.Step({
        name: 'Settlement',
        active: false,
        label: 'Règlements'
      });
      self.steps.reset(steps);
      //
    },
    cancelPayment: function () {
      app.request('payment:current')
        .done(function (data) {
          if (data.payment) {
            var receipts = mod.controller.payment.get('receipts');
            receipts.fromRequest(data.payment.receipts);
            // get TTC Amount
            var total = mod.controller.payment.get('total');
            total = data.payment.premium.total;
            total = _.fixNumber(total, 3);
            mod.controller.payment.set('total', total);
            // get Commission
            var commission = mod.controller.payment.get(
              'commission');
            commission = data.payment.premium.commission;
            commission = _.fixNumber(commission, 3);
            mod.controller.payment.set('commission', commission);
            // get RAS
            var ras = mod.controller.payment.get('ras');
            ras = data.payment.premium.ras;
            ras = _.fixNumber(ras, 3);
            mod.controller.payment.set('ras', ras);
            //Get Amount to pay
            var toPay = mod.controller.payment.get('toPay');
            toPay = data.payment.premium.toPay;
            toPay = _.fixNumber(toPay, 3);
            mod.controller.payment.set('toPay', toPay);
            // Get Amount affected
            var affected = mod.controller.payment.get('affected');
            affected = data.payment.premium.affected;
            affected = _.fixNumber(affected, 3);
            mod.controller.payment.set('affected', affected);
            // Get paid Amount
            var paid = mod.controller.payment.get('paid');
            paid = data.payment.premium.paid;
            paid = _.fixNumber(paid, 3);
            mod.controller.payment.set('paid', paid);
          }
        });
    },
    getPaymentData: function (data) {
      var payment = data[0];
      this.payment.fromRequest(payment);
      var receipts = this.payment.get('receipts');
      receipts.fromRequest(payment.receipts);
      var pos = this.payment.get('pos');
      pos.fromRequest(payment.pos);
      this.pos = pos;
      var premium = this.payment.get('premium');
      premium.fromRequest(payment.premium);
      //get settlement
      var settlements = this.payment.get('settlements');
      settlements.fromRequest(payment.settlements);
      var listSettlements = payment.settlements;
      _.each(listSettlements, function (settlement) {
        var recs = settlement.receipts;
        var index = _.indexOf(listSettlements, settlement);
        var setl = settlements.at(index);
        var theReceipts = setl.get('receipts'); //settlements[index].receipts;
        _.each(recs, function (receipt) {
          theReceipts.push(receipt);
        });
      });
    },
    setDocData: function (payment) {
      this.doc.set('title', 'Imprimer');
      this.doc.set('id', payment.get('pdfId'));
      this.doc.set('lob', '/accounting/fdc');
    },
    addSettlement: function (payment, settlementToAdd) {
      // var mode = this.model.get('mode')
      // this.model.set('mode', parseInt(mode));
      var mode = settlementToAdd.get('mode');
      settlementToAdd.set('mode', parseInt(mode));
      var listSettlements = payment.get('settlements');
      var receipt = settlementToAdd.get('receipts');
      var settlement = new mod.Settlement();
      settlement.set('mode', settlementToAdd.get('mode'));
      var settlementAmount = settlementToAdd.get('amount');
      settlementAmount = _.fixNumber(settlementAmount, 3);
      settlement.set('amount', settlementAmount);
      settlement.set('date', settlementToAdd.get('date'));
      settlement.set('reference', settlementToAdd.get('reference'));
      settlement.set('bank', settlementToAdd.get('bank'));
      if (receipt !== '') {
        settlement.get('receipts')
          .push(receipt);
      }
      listSettlements.add(settlement);
      payment.set('settlements', listSettlements);
      return listSettlements;
    },
    addReceipt: function (receiptToAdd) {
      var added = false;
      var receiptsList = mod.controller.receiptsList;
      var receiptRef = receiptToAdd.get('receiptsLst');
      var reviewDate = receiptToAdd.get('reviewDate');
      var receiptReported = new mod.ReceiptReported();
      receiptReported.set('receiptRef', receiptRef);
      receiptReported.set('reviewDate', reviewDate);
      if (!added) {
        receiptsList.add(receiptReported);
      }
      return receiptsList;
    },
    getPaymentConfigUtils: function (rules) {
      var PaymentConfigUtils = {};
      _.each(rules, function (rule) {
        _.each(rule, function (elem) {
          switch (elem.name) {
          case 'partialPaymentLimit':
            PaymentConfigUtils.limit = elem.value;
            break;
          case 'partialPaymentMinPercent':
            PaymentConfigUtils.minPercent = elem.value;
            break;
          case 'partialPaymentNonAffectedProfiles':
            PaymentConfigUtils.nonAffectedProfiles = elem.value;
            PaymentConfigUtils.exceptedPos = elem.exception;
            break;
          }
        });
      });
      return PaymentConfigUtils;
    },
    verifyPartialAmount: function (rec, config) {
      var pos = this.payment.get('pos');
      var posCode = pos.get('code');
      var total = rec.get('total');
      var toAffect = rec.get('toAffect');
      var due = rec.get('due');
      if (toAffect > due) {
        return {
          authorized: false,
          message: 'Le montant saisi "' + toAffect +
            '" est supérier au montant à régler "' + due + '" !'
        };
      }
      else {
        if (toAffect === due) {
          return {
            authorized: true
          };
        }
        else {
          if (!_.contains(config.nonAffectedProfiles, posCode.substring(
              0, 1)) && posCode !== config.exceptedPos) {
            if (total >= config.limit) {
              if (toAffect <= total * config.minPercent) {
                return {
                  authorized: false,
                  message: 'Le montant à reglér est inférieur à la valeur minimale autorisée : ' +
                    config.minPercent + '% du montant total!'
                };
              }
              else {
                return {
                  authorized: true
                };
              }
            }
            else {
              return {
                authorized: false,
                message: 'Le paiement partiel pour un montant total ne dépassant pas ' +
                  config.limit + ' dt n\'est pas autorisé!'
              };
            }
          }
          else {
            return {
              authorized: true
            };
          }
        }
      }
    }
  });
});
